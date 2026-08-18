import os
import urllib.parse
from datetime import datetime, timedelta
from typing import Optional, Dict, Any, List
import httpx
from fastapi import APIRouter, Query, HTTPException, Depends, status
from fastapi.responses import RedirectResponse
from sqlalchemy.orm import Session
from dotenv import load_dotenv

from app.database import get_db
from app.models.social_account import SocialAccount
from app.models.user import User
from app.core.vault import encrypt_token
from app.core.security import decode_access_token

load_dotenv()

# Define API Routers with primary and alias prefixes
router = APIRouter(prefix="/api/social/facebook", tags=["Facebook OAuth"])
router_alt = APIRouter(prefix="/social/facebook", tags=["Facebook OAuth"])


def get_facebook_config() -> Dict[str, str]:
    """
    Dynamically loads Facebook / Meta OAuth environment configuration.
    """
    load_dotenv()
    return {
        "client_id": os.getenv("FACEBOOK_CLIENT_ID", "").strip(),
        "client_secret": os.getenv("FACEBOOK_CLIENT_SECRET", "").strip(),
        "redirect_uri": os.getenv("FACEBOOK_REDIRECT_URI", "http://localhost:8000/api/social/facebook/callback").strip(),
        "frontend_url": os.getenv("FRONTEND_URL", "http://localhost:3000").strip()
    }


# ========================================================
# 1. FACEBOOK OAUTH LOGIN REDIRECT
# ========================================================
@router.get("/login")
@router_alt.get("/login")
def facebook_login(
    token: Optional[str] = Query(None),
    user_id: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    """
    Generates Meta v18.0 OAuth Dialog Authorization URL and immediately
    redirects the browser via an HTTP 307 RedirectResponse.
    Requests permissions: pages_manage_posts, pages_read_engagement, pages_show_list, instagram_basic, instagram_content_publish.
    Encodes caller user state dynamically into state query parameter.
    """
    config = get_facebook_config()
    client_id = config["client_id"]
    redirect_uri = config["redirect_uri"]

    print(f"[FACEBOOK OAUTH] Initiating login redirect. Client ID present: {bool(client_id)}, Redirect URI: {redirect_uri}")

    if not client_id:
        print("[FACEBOOK OAUTH ERROR] FACEBOOK_CLIENT_ID is not configured in environment.")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Facebook OAuth is not configured on the server. Please set FACEBOOK_CLIENT_ID."
        )

    # Encode user ID into state dynamically
    state = "user_1"
    if user_id and len(str(user_id).strip()) > 0:
        state = f"user_{str(user_id).strip()}"
    elif token and len(token.strip()) > 0:
        state = f"user_jwt::{token.strip()}"

    query_params = {
        "client_id": client_id,
        "redirect_uri": redirect_uri,
        "state": state,
        "scope": "pages_manage_posts,pages_read_engagement,pages_show_list,instagram_basic,instagram_content_publish",
        "response_type": "code"
    }

    query_string = urllib.parse.urlencode(query_params)
    auth_url = f"https://www.facebook.com/v18.0/dialog/oauth?{query_string}"

    return RedirectResponse(url=auth_url, status_code=307)


# ========================================================
# 2. FACEBOOK & INSTAGRAM OAUTH CALLBACK
# ========================================================
@router.get("/callback")
@router_alt.get("/callback")
async def facebook_callback(
    code: Optional[str] = Query(None),
    state: Optional[str] = Query(None),
    error: Optional[str] = Query(None),
    error_description: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    """
    Handles Facebook & Instagram / Meta OAuth callback:
    1. Validates incoming authorization code.
    2. Exchanges authorization code for a User Access Token.
    3. Dynamically extracts active user ID from state parameter.
    4. Retrieves connected Facebook Pages and linked Instagram Professional accounts.
    5. Encrypts tokens and persists records to SocialAccount table with correct user_id.
    6. Redirects the user back to http://localhost:3000/connect_accounts?status=success&platform=facebook.
    Strictly uses standard procedural for and while loops (zero comprehensions/lambdas).
    """
    config = get_facebook_config()
    frontend_url = config["frontend_url"]
    client_id = config["client_id"]
    client_secret = config["client_secret"]
    redirect_uri = config["redirect_uri"]

    # 1. Handle user cancellation or Facebook OAuth errors
    if error or error_description:
        print(f"[FACEBOOK OAUTH ERROR] Error from Facebook: {error} - {error_description}")
        err_msg = urllib.parse.quote(error_description or error or "Facebook authorization cancelled.")
        return RedirectResponse(
            url=f"{frontend_url}/connect_accounts?status=error&platform=facebook&message={err_msg}",
            status_code=307
        )

    if not code or len(code.strip()) == 0:
        err_msg = urllib.parse.quote("Missing authorization code from Facebook.")
        return RedirectResponse(
            url=f"{frontend_url}/connect_accounts?status=error&platform=facebook&message={err_msg}",
            status_code=307
        )

    # 2. Dynamically extract target user ID from state parameter
    target_user_id = None
    if state and len(state.strip()) > 0:
        clean_state = state.strip()
        if clean_state.startswith("user_jwt::"):
            raw_jwt = clean_state.split("user_jwt::", 1)[1].strip()
            try:
                payload = decode_access_token(raw_jwt)
                sub = payload.get("sub")
                if sub and str(sub).isdigit():
                    target_user_id = int(sub)
            except Exception as jwt_err:
                print(f"Notice: Could not decode state JWT: {jwt_err}")
        elif clean_state.startswith("user_"):
            val = clean_state.split("user_", 1)[1]
            if val.isdigit():
                target_user_id = int(val)
        elif clean_state.startswith("socialpilot_auth_"):
            val = clean_state.split("socialpilot_auth_", 1)[1]
            if val.isdigit():
                target_user_id = int(val)
        elif "user_id=" in clean_state:
            for part in clean_state.split("&"):
                if part.startswith("user_id="):
                    val = part.split("=")[1]
                    if val.isdigit():
                        target_user_id = int(val)
                        break
        elif clean_state.isdigit():
            target_user_id = int(clean_state)

    if target_user_id is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Missing or malformed OAuth state parameter. User ID could not be identified."
        )

    # Ensure target_user_id is integer type
    target_user_id = int(target_user_id)

    # 3. Exchange authorization code for User Access Token
    user_token = None
    try:
        token_endpoint = "https://graph.facebook.com/v18.0/oauth/access_token"
        token_params = {
            "client_id": client_id,
            "client_secret": client_secret,
            "redirect_uri": redirect_uri,
            "code": code
        }

        async with httpx.AsyncClient(timeout=30.0) as client:
            token_res = await client.get(token_endpoint, params=token_params)

        if token_res.status_code != 200:
            print(f"[FACEBOOK OAUTH ERROR] Token exchange failed ({token_res.status_code}): {token_res.text}")
            err_msg = urllib.parse.quote(f"Facebook Token Exchange Failed: {token_res.text}")
            return RedirectResponse(
                url=f"{frontend_url}/connect_accounts?status=error&platform=facebook&message={err_msg}",
                status_code=307
            )

        token_data = token_res.json()
        user_token = token_data.get("access_token")

    except Exception as exc:
        print(f"[FACEBOOK OAUTH EXCEPTION] Token exchange error: {exc}")
        err_msg = urllib.parse.quote(f"Internal error during Facebook token exchange: {str(exc)}")
        return RedirectResponse(
            url=f"{frontend_url}/connect_accounts?status=error&platform=facebook&message={err_msg}",
            status_code=307
        )

    if not user_token:
        err_msg = urllib.parse.quote("No access token returned by Facebook.")
        return RedirectResponse(
            url=f"{frontend_url}/connect_accounts?status=error&platform=facebook&message={err_msg}",
            status_code=307
        )

    # 4. Fetch User's Connected Facebook Pages
    pages_data = []
    try:
        pages_endpoint = "https://graph.facebook.com/v18.0/me/accounts"
        pages_params = {
            "access_token": user_token
        }

        async with httpx.AsyncClient(timeout=30.0) as client:
            accounts_res = await client.get(pages_endpoint, params=pages_params)

        if accounts_res.status_code == 200:
            accounts_json = accounts_res.json()
            raw_data = accounts_json.get("data", [])
            if isinstance(raw_data, list):
                pages_data = raw_data
        else:
            print(f"[FACEBOOK OAUTH NOTICE] Pages query returned status {accounts_res.status_code}: {accounts_res.text}")

    except Exception as exc:
        print(f"[FACEBOOK OAUTH EXCEPTION] Error fetching Facebook pages: {exc}")

    # 5. Parse and persist Page Access Tokens and linked Instagram Business accounts
    saved_accounts_count = 0
    try:
        for page in pages_data:
            page_id = page.get("id")
            page_name = page.get("name") or "Facebook Page"
            page_access_token = page.get("access_token") or user_token

            if not page_id:
                continue

            encrypted_token = encrypt_token(page_access_token)

            # Check if this Facebook page account is already in database
            existing_account = db.query(SocialAccount).filter(
                SocialAccount.platform == "facebook",
                SocialAccount.platform_user_id == str(page_id)
            ).first()

            if existing_account:
                existing_account.account_name = page_name
                existing_account.access_token = encrypted_token
                existing_account.user_id = target_user_id
                existing_account.updated_at = datetime.utcnow()
                db.add(existing_account)
                saved_accounts_count = saved_accounts_count + 1
            else:
                new_account = SocialAccount(
                    user_id=target_user_id,
                    platform="facebook",
                    account_name=page_name,
                    platform_user_id=str(page_id),
                    access_token=encrypted_token,
                    created_at=datetime.utcnow(),
                    updated_at=datetime.utcnow()
                )
                db.add(new_account)
                saved_accounts_count = saved_accounts_count + 1

            # Check for linked Instagram Business Account on this Facebook Page
            try:
                ig_query_url = f"https://graph.facebook.com/v18.0/{page_id}"
                ig_params = {
                    "fields": "instagram_business_account",
                    "access_token": page_access_token
                }
                async with httpx.AsyncClient(timeout=15.0) as client:
                    ig_res = await client.get(ig_query_url, params=ig_params)

                if ig_res.status_code == 200:
                    ig_json = ig_res.json()
                    ig_biz = ig_json.get("instagram_business_account")
                    if ig_biz and isinstance(ig_biz, dict) and ig_biz.get("id"):
                        ig_id = str(ig_biz.get("id"))
                        ig_account_name = f"{page_name} (Instagram)"

                        existing_ig = db.query(SocialAccount).filter(
                            SocialAccount.platform == "instagram",
                            SocialAccount.platform_user_id == ig_id
                        ).first()

                        if existing_ig:
                            existing_ig.account_name = ig_account_name
                            existing_ig.access_token = encrypted_token
                            existing_ig.user_id = target_user_id
                            existing_ig.updated_at = datetime.utcnow()
                            db.add(existing_ig)
                            print(f"[INSTAGRAM OAUTH] Updated linked Instagram account {ig_id} for user {target_user_id}")
                        else:
                            new_ig = SocialAccount(
                                user_id=target_user_id,
                                platform="instagram",
                                account_name=ig_account_name,
                                platform_user_id=ig_id,
                                access_token=encrypted_token,
                                created_at=datetime.utcnow(),
                                updated_at=datetime.utcnow()
                            )
                            db.add(new_ig)
                            print(f"[INSTAGRAM OAUTH] Created linked Instagram account {ig_id} for user {target_user_id}")
            except Exception as ig_lookup_err:
                print(f"Notice: Instagram account lookup on page {page_id} notice: {ig_lookup_err}")

        # If user has no separate Facebook Pages, register their user profile as fallback
        if saved_accounts_count == 0:
            user_profile_name = "Facebook User"
            user_profile_id = f"fb_{int(datetime.utcnow().timestamp())}"

            try:
                async with httpx.AsyncClient(timeout=15.0) as client:
                    me_res = await client.get(
                        "https://graph.facebook.com/v18.0/me",
                        params={"fields": "id,name", "access_token": user_token}
                    )
                    if me_res.status_code == 200:
                        me_data = me_res.json()
                        if me_data.get("id"):
                            user_profile_id = str(me_data.get("id"))
                        if me_data.get("name"):
                            user_profile_name = str(me_data.get("name"))
            except Exception as me_err:
                print(f"Notice during Facebook me query: {me_err}")

            encrypted_user_token = encrypt_token(user_token)

            existing_user_account = db.query(SocialAccount).filter(
                SocialAccount.platform == "facebook",
                SocialAccount.platform_user_id == str(user_profile_id)
            ).first()

            if existing_user_account:
                existing_user_account.account_name = user_profile_name
                existing_user_account.access_token = encrypted_user_token
                existing_user_account.user_id = target_user_id
                existing_user_account.updated_at = datetime.utcnow()
                db.add(existing_user_account)
            else:
                new_user_account = SocialAccount(
                    user_id=target_user_id,
                    platform="facebook",
                    account_name=user_profile_name,
                    platform_user_id=str(user_profile_id),
                    access_token=encrypted_user_token,
                    created_at=datetime.utcnow(),
                    updated_at=datetime.utcnow()
                )
                db.add(new_user_account)

        db.commit()
        print(f"[FACEBOOK OAUTH SUCCESS] Successfully persisted Facebook account(s) for user ID {target_user_id}.")

    except Exception as db_err:
        db.rollback()
        print(f"[FACEBOOK OAUTH DB ERROR] Failed to save Facebook accounts: {db_err}")
        err_msg = urllib.parse.quote(f"Database error while saving Facebook accounts: {str(db_err)}")
        return RedirectResponse(
            url=f"{frontend_url}/connect_accounts?status=error&platform=facebook&message={err_msg}",
            status_code=307
        )

    # 6. Redirect to frontend onboarding connect_accounts page with success query parameters
    return RedirectResponse(
        url=f"{frontend_url}/connect_accounts?status=success&platform=facebook",
        status_code=307
    )
