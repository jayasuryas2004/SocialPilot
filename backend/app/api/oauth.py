import os
import urllib.parse
from fastapi import APIRouter, Query, HTTPException, Depends
from fastapi.responses import RedirectResponse
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

router = APIRouter(prefix="/oauth", tags=["OAuth Integrations"])

# Configuration constants
LINKEDIN_CLIENT_ID = os.getenv("LINKEDIN_CLIENT_ID", "SECURE_LINKEDIN_ID")
LINKEDIN_CLIENT_SECRET = os.getenv("LINKEDIN_CLIENT_SECRET", "SECURE_LINKEDIN_SECRET")
LINKEDIN_REDIRECT_URI = os.getenv("LINKEDIN_REDIRECT_URI", "http://localhost:8000/oauth/linkedin/callback")
LINKEDIN_AUTH_BASE_URL = "https://www.linkedin.com/oauth/v2/authorization"
LINKEDIN_TOKEN_URL = "https://www.linkedin.com/oauth/v2/accessToken"


@router.get("/linkedin/login")
def linkedin_login(redirect: bool = False):
    """
    Generates the official LinkedIn OAuth 2.0 Authorization URL.
    Returns:
        JSON response with {"auth_url": "https://www.linkedin.com/oauth/v2/authorization?..."}
        Or redirects directly if ?redirect=true is passed.
    """
    params = {
        "response_type": "code",
        "client_id": LINKEDIN_CLIENT_ID,
        "redirect_uri": LINKEDIN_REDIRECT_URI,
        "scope": "openid profile email w_member_social",
        "state": "socialpilot_linkedin_auth_state_2026"
    }

    # Encode query parameters cleanly
    query_string = urllib.parse.urlencode(params)
    auth_url = f"{LINKEDIN_AUTH_BASE_URL}?{query_string}"

    if redirect:
        return RedirectResponse(url=auth_url)

    return {
        "auth_url": auth_url
    }


@router.get("/linkedin/callback")
def linkedin_callback(code: str = Query(None), error: str = Query(None), error_description: str = Query(None)):
    """
    OAuth callback endpoint that receives the authorization code from LinkedIn.
    """
    if error:
        return {
            "status": "error",
            "error": error,
            "description": error_description or "LinkedIn authorization was cancelled or failed."
        }

    if not code:
        raise HTTPException(status_code=400, detail="Missing authorization code from LinkedIn.")

    # Return successful receipt of authorization code
    return {
        "status": "success",
        "message": "LinkedIn authorization code received successfully.",
        "code": code
    }
