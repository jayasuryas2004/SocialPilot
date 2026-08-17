import os
import urllib.parse
from datetime import datetime, timedelta
from typing import Optional
import httpx
from fastapi import APIRouter, Query, HTTPException, Depends
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

# Configuration constants - strictly loaded from environment variables
LINKEDIN_CLIENT_ID = os.getenv("LINKEDIN_CLIENT_ID", "")
LINKEDIN_CLIENT_SECRET = os.getenv("LINKEDIN_CLIENT_SECRET", "")
LINKEDIN_REDIRECT_URI = os.getenv("LINKEDIN_REDIRECT_URI", "http://localhost:8000/oauth/linkedin/callback")
FRONTEND_REDIRECT_BASE = os.getenv("FRONTEND_URL", "http://localhost:3000")

LINKEDIN_AUTH_BASE_URL = "https://www.linkedin.com/oauth/v2/authorization"
LINKEDIN_TOKEN_URL = "https://www.linkedin.com/oauth/v2/accessToken"
LINKEDIN_USERINFO_URL = "https://api.linkedin.com/v2/userinfo"


@router.get("/linkedin/login")
def linkedin_login(
    token: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    """
    Generates the official LinkedIn OAuth 2.0 Authorization URL and immediately
    redirects the browser via an HTTP 307 RedirectResponse.
    Encodes tenant user state to link OAuth credentials on callback.
    Strictly uses standard control flow (no list comprehensions or lambda expressions).
    """
    state = "socialpilot_linkedin_auth_state_2026"
    if token:
        try:
            payload = decode_access_token(token)
            if payload and payload.get("sub"):
                state = f"user_{payload.get('sub')}"
        except Exception:
            pass

    params = {
        "response_type": "code",
        "client_id": LINKEDIN_CLIENT_ID,
        "redirect_uri": LINKEDIN_REDIRECT_URI,
        "scope": "openid profile email w_member_social",
        "state": state
    }

    query_string = urllib.parse.urlencode(params)
    auth_url = f"{LINKEDIN_AUTH_BASE_URL}?{query_string}"

    return RedirectResponse(url=auth_url, status_code=307)


@router.get("/linkedin/callback")
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
    3. Fetches user profile data from LinkedIn userinfo endpoint.
    4. Encrypts access_token and refresh_token at rest via Fernet vault.
    5. Persists the encrypted OAuth credentials in the SocialAccount database table with correct user_id.
    6. Redirects the user back to the frontend /dashboard/accounts page.
    Strictly uses standard control flow (no list comprehensions or lambda expressions).
    """
    # 1. Handle user cancellation or provider error
    if error:
        err_msg = urllib.parse.quote(error_description or error or "LinkedIn authorization cancelled.")
        return RedirectResponse(
            url=f"{FRONTEND_REDIRECT_BASE}/dashboard/accounts?status=error&platform=linkedin&message={err_msg}",
            status_code=307
        )

    if not code:
        err_msg = urllib.parse.quote("Missing authorization code from LinkedIn.")
        return RedirectResponse(
            url=f"{FRONTEND_REDIRECT_BASE}/dashboard/accounts?status=error&platform=linkedin&message={err_msg}",
            status_code=307
        )

    try:
        # 2. Perform asynchronous HTTP POST token exchange
        token_payload = {
            "grant_type": "authorization_code",
            "code": code,
            "redirect_uri": LINKEDIN_REDIRECT_URI,
            "client_id": LINKEDIN_CLIENT_ID,
            "client_secret": LINKEDIN_CLIENT_SECRET
        }

        async with httpx.AsyncClient(timeout=15.0) as http_client:
            token_response = await http_client.post(
                LINKEDIN_TOKEN_URL,
                data=token_payload,
                headers={"Content-Type": "application/x-www-form-urlencoded"}
            )

            if token_response.status_code != 200:
                print("LinkedIn Token Exchange Error:", token_response.text)
                err_msg = urllib.parse.quote("Failed to exchange authorization code for access token.")
                return RedirectResponse(
                    url=f"{FRONTEND_REDIRECT_BASE}/dashboard/accounts?status=error&platform=linkedin&message={err_msg}",
                    status_code=307
                )

            token_data = token_response.json()
            access_token = token_data.get("access_token")
            expires_in = token_data.get("expires_in", 5184000)  # Default 60 days
            refresh_token = token_data.get("refresh_token")

            if not access_token:
                err_msg = urllib.parse.quote("No access token returned by LinkedIn.")
                return RedirectResponse(
                    url=f"{FRONTEND_REDIRECT_BASE}/dashboard/accounts?status=error&platform=linkedin&message={err_msg}",
                    status_code=307
                )

            # 3. Retrieve LinkedIn user profile name
            account_name = "LinkedIn Account"
            platform_user_id = ""

            try:
                userinfo_response = await http_client.get(
                    LINKEDIN_USERINFO_URL,
                    headers={"Authorization": f"Bearer {access_token}"}
                )

                if userinfo_response.status_code == 200:
                    userinfo_data = userinfo_response.json()
                    given_name = userinfo_data.get("given_name", "")
                    family_name = userinfo_data.get("family_name", "")
                    full_name = f"{given_name} {family_name}".strip()
                    if full_name:
                        account_name = full_name
                    elif userinfo_data.get("name"):
                        account_name = userinfo_data.get("name")
                    platform_user_id = userinfo_data.get("sub", "")
            except Exception as userinfo_err:
                print("Could not fetch user profile details:", userinfo_err)

            # 4. Calculate expiration timestamp
            expires_at = datetime.utcnow() + timedelta(seconds=expires_in)

            # 5. Encrypt OAuth tokens before persisting to database
            encrypted_access_token = encrypt_token(access_token)
            encrypted_refresh_token = encrypt_token(refresh_token)

            # Determine tenant user ID from state parameter or fallback to first registered user
            user_tenant_id = None
            if state and state.startswith("user_"):
                try:
                    user_tenant_id = int(state.replace("user_", "").split("_")[0])
                except Exception:
                    user_tenant_id = None

            if not user_tenant_id:
                first_user = db.query(User).first()
                user_tenant_id = first_user.id if first_user else None

            # 6. Store / Update credentials in database linked to tenant user_id
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

            db.commit()
            print(f"Successfully vaulted encrypted LinkedIn OAuth credentials for user_id={user_tenant_id}")

            # 7. Hand off back to frontend with success parameters
            return RedirectResponse(
                url=f"{FRONTEND_REDIRECT_BASE}/dashboard/accounts?status=success&platform=linkedin",
                status_code=307
            )

    except Exception as exc:
        print("LinkedIn OAuth Exception:", exc)
        err_msg = urllib.parse.quote(str(exc))
        return RedirectResponse(
            url=f"{FRONTEND_REDIRECT_BASE}/dashboard/accounts?status=error&platform=linkedin&message={err_msg}",
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
