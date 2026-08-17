import base64
import urllib.parse
import httpx
from app.models.social_account import SocialAccount
from app.models.notification import Notification
from app.core.vault import decrypt_token


def _handle_token_expiration(social_account, user_id, db):
    """
    Helper function to mark an expired OAuth account as disconnected
    and notify the user in their workspace notification feed.
    Strictly uses standard control flow (zero comprehensions or lambda expressions).
    """
    if social_account:
        social_account.status = "disconnected"
        db.commit()
        print(f"NOTICE: SocialAccount ID {social_account.id} ({social_account.platform}) marked as 'disconnected'.")

    target_user_id = user_id
    if target_user_id is None and social_account:
        target_user_id = getattr(social_account, "user_id", None)

    # Create workspace notification
    msg = "LinkedIn authentication expired. Please reconnect your account from the Accounts page."
    existing_unread = db.query(Notification).filter(
        Notification.user_id == target_user_id,
        Notification.title == "LinkedIn Authentication Expired",
        Notification.is_read == False
    ).first()

    if not existing_unread:
        notif = Notification(
            user_id=target_user_id,
            title="LinkedIn Authentication Expired",
            message=msg,
            type="account",
            category="account",
            is_read=False
        )
        db.add(notif)
        db.commit()
        print(f"Created expired account notification for user ID {target_user_id}.")


def publish_to_linkedin(post, db):
    """
    Publishes a scheduled post to LinkedIn using vaulted OAuth access tokens.
    Supports both text posts and full 3-step LinkedIn media image uploads with explicit tracing.
    Stores the created UGC Post / Share URN into post.linkedin_urn.
    Detects 401 invalid access tokens, auto-disconnects the account, and triggers user notifications.
    Uses standard Python iterative logic (strictly no list comprehensions or lambda expressions).
    """
    # 1. Query vaulted SocialAccount for LinkedIn (checking post.user_id if available)
    query = db.query(SocialAccount).filter(SocialAccount.platform == "linkedin")
    if getattr(post, "user_id", None):
        user_account = query.filter(SocialAccount.user_id == post.user_id).first()
        if user_account:
            social_account = user_account
        else:
            social_account = query.first()
    else:
        social_account = query.first()

    if not social_account or not social_account.access_token:
        print(f"WARNING: No active LinkedIn OAuth credentials found in database for post ID {post.id}.")
        return False, "No active LinkedIn OAuth token found in vault."

    # Decrypt access token in memory only
    access_token = decrypt_token(social_account.access_token)
    if not access_token:
        _handle_token_expiration(social_account, getattr(post, "user_id", None), db)
        return False, "Failed to decrypt OAuth access token from vault."

    platform_user_id = social_account.platform_user_id

    # If platform_user_id is missing or unknown, fetch live profile sub identifier
    if not platform_user_id or platform_user_id == "unknown":
        try:
            with httpx.Client(timeout=10.0) as client:
                u_res = client.get(
                    "https://api.linkedin.com/v2/userinfo",
                    headers={"Authorization": f"Bearer {access_token}"}
                )
                if u_res.status_code == 200:
                    u_data = u_res.json()
                    sub_id = u_data.get("sub")
                    if sub_id:
                        social_account.platform_user_id = sub_id
                        platform_user_id = sub_id
                        db.commit()
                elif u_res.status_code == 401 or "65600" in u_res.text or "INVALID_ACCESS_TOKEN" in u_res.text:
                    _handle_token_expiration(social_account, getattr(post, "user_id", None), db)
                    return False, "LinkedIn authentication expired. Please reconnect your account from the Accounts page."
        except Exception as e:
            print("Notice: Could not refresh LinkedIn sub ID:", e)

    if not platform_user_id:
        platform_user_id = "unknown"

    # Form strictly valid LinkedIn Author URN
    if platform_user_id.startswith("urn:li:"):
        author_urn = platform_user_id
    else:
        author_urn = f"urn:li:person:{platform_user_id}"

    post_text = post.content or post.title or "New post from SocialPilot"
    post_title = post.title or "SocialPilot Post"

    headers = {
        "Authorization": f"Bearer {access_token}",
        "X-Restli-Protocol-Version": "2.0.0",
        "Content-Type": "application/json"
    }

    try:
        with httpx.Client(timeout=30.0) as client:
            image_data_str = getattr(post, "image_url", None)
            asset_urn = None

            # --- 3-STEP LINKEDIN MEDIA IMAGE UPLOAD PROTOCOL ---
            if image_data_str and len(image_data_str.strip()) > 0:
                print(f"Processing media for Post ID {post.id}, raw string length: {len(image_data_str)}")
                image_bytes = None
                try:
                    if image_data_str.startswith("data:"):
                        parts = image_data_str.split(",", 1)
                        if len(parts) > 1:
                            b64_str = parts[1]
                        else:
                            b64_str = parts[0]
                        image_bytes = base64.b64decode(b64_str)
                    elif image_data_str.startswith("http://") or image_data_str.startswith("https://"):
                        img_res = client.get(image_data_str, timeout=15.0)
                        if img_res.status_code == 200:
                            image_bytes = img_res.content
                    else:
                        image_bytes = base64.b64decode(image_data_str)
                except Exception as b64_err:
                    print(f"Warning: Could not decode post image bytes for post {post.id}: {b64_err}")
                    image_bytes = None

                if image_bytes is not None and len(image_bytes) > 0:
                    print(f"Image bytes decoded successfully: {len(image_bytes)} bytes.")

                    # Step 1: Register upload with LinkedIn
                    register_payload = {
                        "registerUploadRequest": {
                            "recipes": [
                                "urn:li:digitalmediaRecipe:feedshare-image"
                            ],
                            "owner": author_urn,
                            "supportedUploadMechanism": [
                                "SYNCHRONOUS_UPLOAD"
                            ]
                        }
                    }

                    reg_res = client.post(
                        "https://api.linkedin.com/v2/assets?action=registerUpload",
                        json=register_payload,
                        headers=headers
                    )
                    print("Step 1 (Register):", reg_res.status_code, reg_res.text)

                    if reg_res.status_code in [200, 201]:
                        reg_data = reg_res.json()
                        val_obj = reg_data.get("value", {})
                        asset_urn = val_obj.get("asset")
                        upload_mechanism = val_obj.get("uploadMechanism", {})
                        http_upload_req = upload_mechanism.get(
                            "com.linkedin.digitalmedia.uploading.MediaUploadHttpRequest", {}
                        )
                        upload_url = http_upload_req.get("uploadUrl")

                        if asset_urn and upload_url:
                            # Step 2: Upload image binary bytes to LinkedIn uploadUrl
                            upload_headers = {
                                "Authorization": f"Bearer {access_token}",
                                "Content-Type": "image/jpeg"
                            }
                            up_res = client.put(
                                upload_url,
                                content=image_bytes,
                                headers=upload_headers
                            )
                            print("Step 2 (Upload):", up_res.status_code, up_res.text)
                    elif reg_res.status_code == 401 or "65600" in reg_res.text or "INVALID_ACCESS_TOKEN" in reg_res.text:
                        _handle_token_expiration(social_account, getattr(post, "user_id", None), db)
                        return False, "LinkedIn authentication expired. Please reconnect your account from the Accounts page."
                    else:
                        print("Notice: LinkedIn registerUpload failed:", reg_res.status_code, reg_res.text)

            # --- STEP 3: CONSTRUCT UGC POST PAYLOAD (IMAGE VS TEXT) ---
            if asset_urn:
                ugc_payload = {
                    "author": author_urn,
                    "lifecycleState": "PUBLISHED",
                    "specificContent": {
                        "com.linkedin.ugc.ShareContent": {
                            "shareCommentary": {
                                "text": post_text
                            },
                            "shareMediaCategory": "IMAGE",
                            "media": [
                                {
                                    "status": "READY",
                                    "description": {
                                        "text": post_text[:100] if len(post_text) > 100 else post_text
                                    },
                                    "media": asset_urn,
                                    "title": {
                                        "text": post_title[:50] if len(post_title) > 50 else post_title
                                    }
                                }
                            ]
                        }
                    },
                    "visibility": {
                        "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC"
                    }
                }
            else:
                ugc_payload = {
                    "author": author_urn,
                    "lifecycleState": "PUBLISHED",
                    "specificContent": {
                        "com.linkedin.ugc.ShareContent": {
                            "shareCommentary": {
                                "text": post_text
                            },
                            "shareMediaCategory": "NONE"
                        }
                    },
                    "visibility": {
                        "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC"
                    }
                }

            # --- EXECUTE FINAL POST PUBLICATION ---
            response = client.post(
                "https://api.linkedin.com/v2/ugcPosts",
                json=ugc_payload,
                headers=headers
            )
            print("Step 3 (Publish):", response.status_code, response.text)

            if response.status_code in [200, 201]:
                res_data = response.json() if response.text else {}
                post_urn = res_data.get("id") or res_data.get("urn")
                if post_urn:
                    post.linkedin_urn = str(post_urn).strip()
                    db.add(post)
                    db.commit()
                    db.refresh(post)
                    print(f"SUCCESS: Assigned and stored LinkedIn URN: {post.linkedin_urn} for Post ID {post.id}")
                else:
                    print(f"SUCCESS: Published Post ID {post.id} to LinkedIn API, but no post URN was returned: {response.text}")

                return True, response.text
            elif response.status_code == 401 or "65600" in response.text or "INVALID_ACCESS_TOKEN" in response.text:
                _handle_token_expiration(social_account, getattr(post, "user_id", None), db)
                return False, "LinkedIn authentication expired. Please reconnect your account from the Accounts page."
            else:
                error_detail = f"Status {response.status_code}: {response.text}"
                print(f"ERROR: LinkedIn API publication failed for Post ID {post.id} with URN {author_urn} - {error_detail}")
                return False, error_detail

    except Exception as exc:
        err_msg = f"Network or execution error publishing to LinkedIn: {exc}"
        print(f"ERROR: {err_msg}")
        return False, err_msg


def delete_from_linkedin(post, db):
    """
    Deletes a published post from LinkedIn natively using the stored linkedin_urn.
    Properly URL-encodes the URN and dynamically routes between /v2/shares and /v2/ugcPosts.
    Decrypts access token in memory only.
    Detects 401 expiration and updates account status.
    Strictly uses standard control flow (zero comprehensions or lambda expressions).
    """
    if not getattr(post, "linkedin_urn", None):
        return False, "No LinkedIn URN recorded for this post."

    query = db.query(SocialAccount).filter(SocialAccount.platform == "linkedin")
    if getattr(post, "user_id", None):
        user_account = query.filter(SocialAccount.user_id == post.user_id).first()
        if user_account:
            social_account = user_account
        else:
            social_account = query.first()
    else:
        social_account = query.first()

    if not social_account or not social_account.access_token:
        return False, "No active LinkedIn OAuth token found in vault."

    access_token = decrypt_token(social_account.access_token)
    if not access_token:
        _handle_token_expiration(social_account, getattr(post, "user_id", None), db)
        return False, "Failed to decrypt OAuth access token from vault."

    post_urn = str(post.linkedin_urn).strip()
    encoded_urn = urllib.parse.quote(post_urn)

    headers = {
        "Authorization": f"Bearer {access_token}",
        "X-Restli-Protocol-Version": "2.0.0"
    }

    try:
        with httpx.Client(timeout=15.0) as client:
            if "urn:li:share:" in post_urn:
                del_url = f"https://api.linkedin.com/v2/shares/{encoded_urn}"
            else:
                del_url = f"https://api.linkedin.com/v2/ugcPosts/{encoded_urn}"

            response = client.delete(del_url, headers=headers)
            print(f"LinkedIn native deletion for Post ID {post.id} (URL {del_url}): {response.status_code} {response.text}")
            if response.status_code in [200, 204, 404]:
                return True, "Deleted from LinkedIn"
            elif response.status_code == 401 or "65600" in response.text or "INVALID_ACCESS_TOKEN" in response.text:
                _handle_token_expiration(social_account, getattr(post, "user_id", None), db)
                return False, "LinkedIn authentication expired. Please reconnect your account from the Accounts page."
            else:
                return False, f"Status {response.status_code}: {response.text}"
    except Exception as e:
        print(f"Error deleting post from LinkedIn: {e}")
        return False, str(e)


def publish_to_instagram(post):
    print(f"📸 Publishing '{post.title or post.content}' to Instagram...")
    return True, "Instagram Mock Dispatch"


def publish_to_facebook(post):
    print(f"📘 Publishing '{post.title or post.content}' to Facebook...")
    return True, "Facebook Mock Dispatch"


def publish_to_twitter(post):
    print(f"🐦 Publishing '{post.title or post.content}' to X (Twitter)...")
    return True, "Twitter Mock Dispatch"