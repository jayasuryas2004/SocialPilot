import base64
import httpx
from app.models.social_account import SocialAccount


def publish_to_linkedin(post, db):
    """
    Publishes a scheduled post to LinkedIn using vaulted OAuth access tokens.
    Supports both text posts and full 3-step LinkedIn media image uploads.
    Uses standard Python iterative logic.
    """
    # 1. Query vaulted SocialAccount for LinkedIn
    social_account = db.query(SocialAccount).filter(
        SocialAccount.platform == "linkedin"
    ).first()

    if not social_account or not social_account.access_token:
        print(f"WARNING: No active LinkedIn OAuth credentials found in database for post ID {post.id}.")
        return False, "No active LinkedIn OAuth token found in vault."

    access_token = social_account.access_token
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
                image_bytes = None
                try:
                    # Convert Base64 or URL to raw binary bytes
                    if image_data_str.startswith("data:"):
                        # Extract base64 payload after header
                        parts = image_data_str.split(",")
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
                        # Raw base64 string
                        image_bytes = base64.b64decode(image_data_str)
                except Exception as b64_err:
                    print(f"Warning: Could not decode post image bytes for post {post.id}: {b64_err}")
                    image_bytes = None

                if image_bytes is not None and len(image_bytes) > 0:
                    # Step A: Register upload with LinkedIn
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
                            # Step B: Upload image binary bytes to LinkedIn uploadUrl
                            upload_headers = {
                                "Authorization": f"Bearer {access_token}",
                                "Content-Type": "image/jpeg"
                            }
                            up_res = client.put(
                                upload_url,
                                content=image_bytes,
                                headers=upload_headers
                            )
                            print(f"LinkedIn image binary upload status for Post ID {post.id}: {up_res.status_code}")
                    else:
                        print(f"Notice: LinkedIn registerUpload failed ({reg_res.status_code}): {reg_res.text}")

            # --- STEP C: CONSTRUCT UGC POST PAYLOAD (IMAGE VS TEXT) ---
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

            if response.status_code in [200, 201]:
                print(f"SUCCESS: Published Post ID {post.id} ({'with image' if asset_urn else 'text-only'}) to LinkedIn API: {response.text}")
                return True, response.text
            else:
                error_detail = f"Status {response.status_code}: {response.text}"
                print(f"ERROR: LinkedIn API publication failed for Post ID {post.id} with URN {author_urn} - {error_detail}")
                return False, error_detail

    except Exception as exc:
        err_msg = f"Network or execution error publishing to LinkedIn: {exc}"
        print(f"ERROR: {err_msg}")
        return False, err_msg


def publish_to_instagram(post):
    print(f"📸 Publishing '{post.title or post.content}' to Instagram...")
    return True, "Instagram Mock Dispatch"


def publish_to_facebook(post):
    print(f"📘 Publishing '{post.title or post.content}' to Facebook...")
    return True, "Facebook Mock Dispatch"


def publish_to_twitter(post):
    print(f"🐦 Publishing '{post.title or post.content}' to X (Twitter)...")
    return True, "Twitter Mock Dispatch"