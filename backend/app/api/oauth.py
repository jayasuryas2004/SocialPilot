import os
import urllib.parse
from datetime import datetime, timedelta
import httpx
from fastapi import APIRouter, Query, HTTPException, Depends
from fastapi.responses import RedirectResponse
from sqlalchemy.orm import Session
from dotenv import load_dotenv

from app.database import get_db
from app.models.social_account import SocialAccount

# Load environment variables from .env file
load_dotenv()

router = APIRouter(prefix="/oauth", tags=["OAuth Integrations"])

# Configuration constants
LINKEDIN_CLIENT_ID = os.getenv("LINKEDIN_CLIENT_ID", "SECURE_LINKEDIN_ID")
LINKEDIN_CLIENT_SECRET = os.getenv("LINKEDIN_CLIENT_SECRET", "SECURE_LINKEDIN_SECRET")
LINKEDIN_REDIRECT_URI = os.getenv("LINKEDIN_REDIRECT_URI", "http://localhost:8000/oauth/linkedin/callback")
FRONTEND_REDIRECT_BASE = os.getenv("FRONTEND_URL", "http://localhost:3000")

LINKEDIN_AUTH_BASE_URL = "https://www.linkedin.com/oauth/v2/authorization"
LINKEDIN_TOKEN_URL = "https://www.linkedin.com/oauth/v2/accessToken"
LINKEDIN_USERINFO_URL = "https://api.linkedin.com/v2/userinfo"


@router.get("/linkedin/login")
def linkedin_login(redirect: bool = False):
    """
    Generates the official LinkedIn OAuth 2.0 Authorization URL.
    Returns JSON auth_url or performs immediate HTTP 307 redirect.
    """
    params = {
        "response_type": "code",
        "client_id": LINKEDIN_CLIENT_ID,
        "redirect_uri": LINKEDIN_REDIRECT_URI,
        "scope": "openid profile email w_member_social",
        "state": "socialpilot_linkedin_auth_state_2026"
    }

    query_string = urllib.parse.urlencode(params)
    auth_url = f"{LINKEDIN_AUTH_BASE_URL}?{query_string}"

    if redirect:
        return RedirectResponse(url=auth_url)

    return {
        "auth_url": auth_url
    }


@router.get("/linkedin/callback")
async def linkedin_callback(
    code: str = Query(None),
    error: str = Query(None),
    error_description: str = Query(None),
    db: Session = Depends(get_db)
):
    """
    Handles LinkedIn OAuth callback:
    1. Validates presence of authorization code.
    2. Exchanges authorization code for an OAuth access token via HTTP POST.
    3. Fetches user profile data from LinkedIn userinfo endpoint.
    4. Persists the OAuth credentials in the SocialAccount database table.
    5. Redirects the user back to the frontend /connect_accounts page.
    """
    # 1. Handle user cancellation or provider error
    if error:
        err_msg = urllib.parse.quote(error_description or error or "LinkedIn authorization cancelled.")
        return RedirectResponse(
            url=f"{FRONTEND_REDIRECT_BASE}/connect_accounts?status=error&platform=linkedin&message={err_msg}"
        )

    if not code:
        err_msg = urllib.parse.quote("Missing authorization code from LinkedIn.")
        return RedirectResponse(
            url=f"{FRONTEND_REDIRECT_BASE}/connect_accounts?status=error&platform=linkedin&message={err_msg}"
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
                    url=f"{FRONTEND_REDIRECT_BASE}/connect_accounts?status=error&platform=linkedin&message={err_msg}"
                )

            token_data = token_response.json()
            access_token = token_data.get("access_token")
            expires_in = token_data.get("expires_in", 5184000)  # Default 60 days
            refresh_token = token_data.get("refresh_token")

            if not access_token:
                err_msg = urllib.parse.quote("No access token returned by LinkedIn.")
                return RedirectResponse(
                    url=f"{FRONTEND_REDIRECT_BASE}/connect_accounts?status=error&platform=linkedin&message={err_msg}"
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

            # 5. Store / Update credentials in database
            existing_account = db.query(SocialAccount).filter(
                SocialAccount.platform == "linkedin"
            ).first()

            if existing_account:
                existing_account.account_name = account_name
                existing_account.platform_user_id = platform_user_id
                existing_account.access_token = access_token
                existing_account.refresh_token = refresh_token
                existing_account.expires_at = expires_at
            else:
                new_account = SocialAccount(
                    platform="linkedin",
                    account_name=account_name,
                    platform_user_id=platform_user_id,
                    access_token=access_token,
                    refresh_token=refresh_token,
                    expires_at=expires_at
                )
                db.add(new_account)

            db.commit()

            # 6. Hand off back to frontend with success parameters
            return RedirectResponse(
                url=f"{FRONTEND_REDIRECT_BASE}/connect_accounts?status=success&platform=linkedin"
            )

    except Exception as exc:
        print("LinkedIn OAuth Exception:", exc)
        err_msg = urllib.parse.quote(str(exc))
        return RedirectResponse(
            url=f"{FRONTEND_REDIRECT_BASE}/connect_accounts?status=error&platform=linkedin&message={err_msg}"
        )


@router.get("/accounts")
def get_connected_accounts(db: Session = Depends(get_db)):
    """
    Returns list of connected social media accounts stored in the database.
    Uses standard iterative loops only.
    """
    accounts = db.query(SocialAccount).all()
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
