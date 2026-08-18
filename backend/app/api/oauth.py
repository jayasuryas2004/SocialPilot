import os
import urllib.parse
from datetime import datetime, timedelta
from typing import Optional
import httpx
from fastapi import APIRouter, Query, HTTPException, Depends, status
from fastapi.responses import RedirectResponse
from sqlalchemy.orm import Session
from dotenv import load_dotenv

from app.database import get_db
from app.models.social_account import SocialAccount
from app.models.user import User
from app.core.vault import encrypt_token
from app.core.security import get_current_user, decode_access_token

# Load environment variables from .env file
load_dotenv()

router = APIRouter(prefix="/oauth", tags=["OAuth Integrations"])
router_alt = APIRouter(prefix="/api/oauth", tags=["OAuth Integrations"])

# Configuration constants
LINKEDIN_AUTH_BASE_URL = "https://www.linkedin.com/oauth/v2/authorization"
LINKEDIN_TOKEN_URL = "https://www.linkedin.com/oauth/v2/accessToken"
LINKEDIN_USERINFO_URL = "https://api.linkedin.com/v2/userinfo"


def get_oauth_config():
    """
    Dynamically loads OAuth environment configuration to ensure runtime freshness.
    """
    load_dotenv()
    return {
        "client_id": os.getenv("LINKEDIN_CLIENT_ID", ""),
        "client_secret": os.getenv("LINKEDIN_CLIENT_SECRET", ""),
        "redirect_uri": os.getenv("LINKEDIN_REDIRECT_URI", "http://localhost:8000/oauth/linkedin/callback"),
        "frontend_url": os.getenv("FRONTEND_URL", "http://localhost:3000")
    }


@router.get("/linkedin/login")
@router_alt.get("/linkedin/login")
def linkedin_login(
    redirect: bool = Query(False),
    user_id: Optional[str] = Query(None),
    token: Optional[str] = Query(None)
):
    """
    Constructs and returns LinkedIn OAuth 2.0 Authorization URL with requested scopes.
    Directs users through the LinkedIn sign-in flow.
    Encodes user_id into state parameter for dynamic callback binding.
    Strictly uses standard control flow (no list comprehensions or lambda expressions).
    """
    config = get_oauth_config()
    client_id = config["client_id"]
    redirect_uri = config["redirect_uri"]

    print(f"[OAUTH] Initiating LinkedIn OAuth login redirect.")
    print(f"[OAUTH] Client ID present: {bool(client_id)}, Redirect URI: {redirect_uri}")

    if not client_id:
        print("[OAUTH ERROR] LINKEDIN_CLIENT_ID is not configured in environment variables.")
        raise HTTPException(
            status_code=500,
            detail="LinkedIn OAuth is not configured on the server. Please set LINKEDIN_CLIENT_ID."
        )

    state = "user_1"
    if user_id and len(str(user_id).strip()) > 0:
        state = f"user_{str(user_id).strip()}"
    elif token and len(token.strip()) > 0:
        try:
            payload = decode_access_token(token)
            if payload and payload.get("sub"):
                state = f"user_{payload.get('sub')}"
        except Exception:
            pass

    params = {
        "response_type": "code",
        "client_id": client_id,
        "redirect_uri": redirect_uri,
        "scope": "openid profile email w_member_social",
        "state": state
    }

    query_string = urllib.parse.urlencode(params)
    auth_url = f"{LINKEDIN_AUTH_BASE_URL}?{query_string}"

    return RedirectResponse(url=auth_url, status_code=307)


@router.get("/linkedin/callback")
@router_alt.get("/linkedin/callback")
async def linkedin_callback(
    code: str = Query(None),
    state: str = Query(None),
    error: str = Query(None),
    error_description: str = Query(None),
    db: Session = Depends(get_db)
):
    """
    Handles LinkedIn OAuth callback:
    1. Validates presence of authorization code.
    2. Exchanges authorization code for an OAuth access token via HTTP POST.
    3. Logs detailed request/response diagnostics to terminal.
    4. Fetches user profile data from LinkedIn userinfo endpoint.
    5. Encrypts access_token and refresh_token at rest via Fernet vault.
    6. Persists credentials in the SocialAccount database table with dynamic user_id.
    7. Redirects user back to the frontend /connect_accounts onboarding page.
    Strictly uses standard control flow (no list comprehensions or lambda expressions).
    """
    config = get_oauth_config()
    client_id = config["client_id"]
    client_secret = config["client_secret"]
    redirect_uri = config["redirect_uri"]
    frontend_url = config["frontend_url"]

    print("\n--- [OAUTH CALLBACK INITIATED] ---")
    print(f"[OAUTH] Incoming code present: {bool(code)}, state: {state}")
    print(f"[OAUTH] Configuration - Redirect URI: {redirect_uri}")
    print(f"[OAUTH] Configuration - Client ID present: {bool(client_id)}, Client Secret present: {bool(client_secret)}")

    # 1. Handle user cancellation or provider error
    if error:
        print(f"[OAUTH ERROR] LinkedIn returned error: {error} - {error_description}")
        err_msg = urllib.parse.quote(error_description or error or "LinkedIn authorization cancelled.")
        return RedirectResponse(
            url=f"{frontend_url}/connect_accounts?status=error&platform=linkedin&message={err_msg}",
            status_code=307
        )

    if not code:
        print("[OAUTH ERROR] Missing authorization code from callback parameters.")
        err_msg = urllib.parse.quote("Missing authorization code from LinkedIn.")
        return RedirectResponse(
            url=f"{frontend_url}/connect_accounts?status=error&platform=linkedin&message={err_msg}",
            status_code=307
        )

    if not client_id or not client_secret:
        print("[OAUTH ERROR] Server missing LINKEDIN_CLIENT_ID or LINKEDIN_CLIENT_SECRET environment variables.")
        err_msg = urllib.parse.quote("Server OAuth configuration is incomplete (missing client credentials).")
        return RedirectResponse(
            url=f"{frontend_url}/connect_accounts?status=error&platform=linkedin&message={err_msg}",
            status_code=307
        )

    try:
        # 2. Perform asynchronous HTTP POST token exchange
        token_payload = {
            "grant_type": "authorization_code",
            "code": code,
            "redirect_uri": redirect_uri,
            "client_id": client_id,
            "client_secret": client_secret
        }

        print(f"[OAUTH] Executing POST request to {LINKEDIN_TOKEN_URL} ...")
        async with httpx.AsyncClient(timeout=15.0) as http_client:
            token_response = await http_client.post(
                LINKEDIN_TOKEN_URL,
                data=token_payload,
                headers={"Content-Type": "application/x-www-form-urlencoded"}
            )

            # Explicit diagnostic logging of token exchange status and response
            print(f"[OAUTH] Token Exchange Response Status: {token_response.status_code}")
            print(f"[OAUTH] Token Exchange Response Body: {token_response.text}")

            if token_response.status_code != 200:
                print(f"[OAUTH ERROR] Failed token exchange with status {token_response.status_code}: {token_response.text}")
                err_msg = urllib.parse.quote(f"LinkedIn Token Exchange Failed ({token_response.status_code}): {token_response.text}")
                return RedirectResponse(
                    url=f"{frontend_url}/connect_accounts?status=error&platform=linkedin&message={err_msg}",
                    status_code=307
                )

            token_data = token_response.json()
            access_token = token_data.get("access_token")
            expires_in = token_data.get("expires_in", 5184000)  # Default 60 days
            refresh_token = token_data.get("refresh_token")

            if not access_token:
                print("[OAUTH ERROR] No access_token key present in JSON response from LinkedIn.")
                err_msg = urllib.parse.quote("No access token returned by LinkedIn.")
                return RedirectResponse(
                    url=f"{frontend_url}/connect_accounts?status=error&platform=linkedin&message={err_msg}",
                    status_code=307
                )

            print("[OAUTH SUCCESS] Successfully received OAuth access token from LinkedIn.")

            # 3. Retrieve LinkedIn user profile name
            account_name = "LinkedIn Account"
            platform_user_id = ""

            try:
                print(f"[OAUTH] Fetching user profile from {LINKEDIN_USERINFO_URL} ...")
                userinfo_response = await http_client.get(
                    LINKEDIN_USERINFO_URL,
                    headers={"Authorization": f"Bearer {access_token}"}
                )
                print(f"[OAUTH] Userinfo Response Status: {userinfo_response.status_code}")

                if userinfo_response.status_code == 200:
                    profile_data = userinfo_response.json()
                    name_parts = []
                    if profile_data.get("name"):
                        name_parts.append(profile_data.get("name"))
                    elif profile_data.get("localizedFirstName"):
                        name_parts.append(profile_data.get("localizedFirstName"))
                        if profile_data.get("localizedLastName"):
                            name_parts.append(profile_data.get("localizedLastName"))

                    if name_parts:
                        account_name = " ".join(name_parts)

                    if profile_data.get("sub"):
                        platform_user_id = f"urn:li:person:{profile_data.get('sub')}"

            except Exception as userinfo_err:
                print(f"[OAUTH WARNING] Could not fetch user profile details: {userinfo_err}")

            # 4. Calculate expiration timestamp
            expires_at = datetime.utcnow() + timedelta(seconds=expires_in)

            # 5. Encrypt OAuth tokens before persisting to database
            encrypted_access_token = encrypt_token(access_token)
            encrypted_refresh_token = encrypt_token(refresh_token)

            # Determine tenant user ID strictly from state parameter
            user_tenant_id = None
            if state and len(state.strip()) > 0:
                clean_state = state.strip()
                if clean_state.startswith("user_jwt::"):
                    raw_jwt = clean_state.split("user_jwt::", 1)[1].strip()
                    try:
                        payload = decode_access_token(raw_jwt)
                        sub = payload.get("sub")
                        if sub and str(sub).isdigit():
                            user_tenant_id = int(sub)
                    except Exception:
                        pass
                elif clean_state.startswith("user_"):
                    val = clean_state.split("user_", 1)[1].split("_")[0]
                    if val.isdigit():
                        user_tenant_id = int(val)
                elif clean_state.isdigit():
                    user_tenant_id = int(clean_state)

            if user_tenant_id is None:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Missing or malformed OAuth state parameter. User ID could not be identified."
                )

            # 6. Database Persistence with safe try-except block & rollback
            try:
                print(f"[OAUTH DB] Persisting LinkedIn credentials for user_id={user_tenant_id} ...")
                existing_account = db.query(SocialAccount).filter(
                    SocialAccount.platform == "linkedin",
                    (SocialAccount.user_id == user_tenant_id) | (SocialAccount.user_id.is_(None))
                ).first()

                if existing_account:
                    existing_account.user_id = user_tenant_id
                    existing_account.account_name = account_name
                    existing_account.platform_user_id = platform_user_id
                    existing_account.access_token = encrypted_access_token
                    existing_account.refresh_token = encrypted_refresh_token
                    existing_account.expires_at = expires_at
                    existing_account.updated_at = datetime.utcnow()
                    print(f"[OAUTH DB] Updated existing SocialAccount record ID {existing_account.id}.")
                else:
                    new_account = SocialAccount(
                        user_id=user_tenant_id,
                        platform="linkedin",
                        account_name=account_name,
                        platform_user_id=platform_user_id,
                        access_token=encrypted_access_token,
                        refresh_token=encrypted_refresh_token,
                        expires_at=expires_at,
                        created_at=datetime.utcnow(),
                        updated_at=datetime.utcnow()
                    )
                    db.add(new_account)
                    print(f"[OAUTH DB] Created new SocialAccount record for user_id={user_tenant_id}.")

                db.commit()
                print(f"[OAUTH DB SUCCESS] Successfully committed LinkedIn OAuth credentials for user_id={user_tenant_id}")
            except Exception as db_err:
                db.rollback()
                print(f"[OAUTH DB ERROR] Database transaction failed while saving LinkedIn credentials: {db_err}")
                err_msg = urllib.parse.quote(f"Database save failed: {str(db_err)}")
                return RedirectResponse(
                    url=f"{frontend_url}/connect_accounts?status=error&platform=linkedin&message={err_msg}",
                    status_code=307
                )

            # 7. Hand off back to frontend onboarding connect_accounts page with success parameters
            print(f"[OAUTH COMPLETE] Redirecting to frontend /connect_accounts with status=success")
            return RedirectResponse(
                url=f"{frontend_url}/connect_accounts?status=success&platform=linkedin",
                status_code=307
            )

    except Exception as exc:
        print(f"[OAUTH UNHANDLED EXCEPTION] {exc}")
        err_msg = urllib.parse.quote(str(exc))
        return RedirectResponse(
            url=f"{frontend_url}/connect_accounts?status=error&platform=linkedin&message={err_msg}",
            status_code=307
        )


@router.get("/accounts")
def get_connected_accounts(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Returns list of connected social media accounts for the current tenant.
    Strictly uses standard iterative loops only (no comprehensions or lambdas).
    """
    accounts = db.query(SocialAccount).filter(
        (SocialAccount.user_id == current_user.id) | (SocialAccount.user_id.is_(None))
    ).all()

    result = []
    connected_platforms = []

    for acc in accounts:
        connected_platforms.append(acc.platform)
        result.append({
            "id": str(acc.id),
            "platform": acc.platform,
            "account_name": acc.account_name,
            "platform_user_id": acc.platform_user_id,
            "expires_at": acc.expires_at.isoformat() if acc.expires_at else None,
            "created_at": acc.created_at.isoformat() if acc.created_at else None,
            "status": "connected"
        })

    return {
        "connected_platforms": connected_platforms,
        "accounts": result
    }
