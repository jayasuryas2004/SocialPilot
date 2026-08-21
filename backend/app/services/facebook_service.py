import httpx
from typing import Dict, Any, Tuple, Optional


async def publish_to_facebook(
    page_id: str,
    page_token: str,
    message: str,
    media_url: Optional[str] = None,
    image_url: Optional[str] = None
) -> Tuple[bool, Dict[str, Any]]:
    """
    Publishes message or media content to a connected Facebook Page using Meta Graph API v19.0.
    
    Security & Architecture Rules:
    - Strictly target /{page_id}/photos (media) or /{page_id}/feed (text) using a valid Page Access Token.
    - Personal timeline (/me/feed) publishing is deprecated in Graph API v19.0+ and forbidden.
    - Explicitly inspects response and surfaces real Meta Graph API JSON errors without swallowing them.
    - Strictly uses standard procedural control flow (zero comprehensions or lambda expressions).
    """
    clean_page_id = str(page_id or "").strip()
    clean_token = str(page_token or "").strip()
    clean_message = str(message or "").strip()
    clean_media = str(media_url or image_url or "").strip()

    if len(clean_page_id) == 0 or clean_page_id.lower() == "me":
        return False, {
            "status": "failed",
            "error": "Invalid or missing Facebook Page ID. User profile publishing is disabled; a valid Page ID is required."
        }

    if len(clean_token) == 0:
        return False, {
            "status": "failed",
            "error": "Missing Facebook Page Access Token for Page publishing."
        }

    # Meta Graph API v19.0 endpoints
    api_version = "v19.0"
    if len(clean_media) > 0:
        endpoint = f"https://graph.facebook.com/{api_version}/{clean_page_id}/photos"
        payload = {
            "url": clean_media,
            "message": clean_message,
            "access_token": clean_token
        }
        print(f"[FACEBOOK PUBLISH] Executing photo post to {endpoint} with media: {clean_media}")
    else:
        endpoint = f"https://graph.facebook.com/{api_version}/{clean_page_id}/feed"
        payload = {
            "message": clean_message,
            "access_token": clean_token
        }
        print(f"[FACEBOOK PUBLISH] Executing feed post to {endpoint}")

    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(endpoint, data=payload)
            response.raise_for_status()

        if response.status_code not in [200, 201]:
            error_text = response.text
            try:
                err_json = response.json()
            except Exception:
                err_json = {"detail": error_text, "status_code": response.status_code}
            return False, {
                "status": "failed",
                "status_code": response.status_code,
                "error": err_json,
                "detail": f"Meta Graph API error ({response.status_code}): {error_text}"
            }

        res_data = response.json()
        post_id = res_data.get("id") or res_data.get("post_id") or f"{clean_page_id}_post"
        facebook_post_url = f"https://facebook.com/{post_id}"
        print(f"[FACEBOOK PUBLISH SUCCESS] Published to Facebook Page {clean_page_id}. Post ID: {post_id}")
        print(f"SUCCESS: View actual Facebook Page post at https://facebook.com/{post_id}")
        return True, {
            "status": "success",
            "post_id": post_id,
            "post_url": facebook_post_url,
            "data": res_data
        }

    except httpx.HTTPStatusError as http_err:
        status_code = http_err.response.status_code if http_err.response is not None else 500
        error_text = http_err.response.text if http_err.response is not None else str(http_err)
        print(f"[FACEBOOK PUBLISH HTTP ERROR] Meta API HTTPStatusError ({status_code}): {error_text}")
        try:
            err_json = http_err.response.json()
        except Exception:
            err_json = {"detail": error_text, "status_code": status_code}

        # Extract nested Meta Graph API error message if available
        meta_error_msg = error_text
        if isinstance(err_json, dict) and "error" in err_json:
            meta_inner = err_json.get("error", {})
            if isinstance(meta_inner, dict) and meta_inner.get("message"):
                meta_error_msg = f"{meta_inner.get('type', 'OAuthException')}: {meta_inner.get('message')} (Code: {meta_inner.get('code')})"

        return False, {
            "status": "failed",
            "status_code": status_code,
            "error": err_json,
            "detail": f"Meta Graph API error ({status_code}): {meta_error_msg}"
        }
    except Exception as exc:
        print(f"[FACEBOOK PUBLISH EXCEPTION] Network or unexpected exception: {exc}")
        return False, {
            "status": "failed",
            "error": str(exc)
        }
