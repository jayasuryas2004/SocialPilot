import httpx
from typing import Dict, Any, Tuple, Optional


async def publish_to_instagram(
    ig_account_id: str,
    access_token: str,
    message: str,
    image_url: Optional[str] = None
) -> Tuple[bool, Dict[str, Any]]:
    """
    Publishes media content to a connected Instagram Professional / Business account
    using the Meta Graph API v18.0 two-step container publishing pipeline:
    1. Step 1: Create media container via POST https://graph.facebook.com/v18.0/{ig_account_id}/media
    2. Step 2: Publish container via POST https://graph.facebook.com/v18.0/{ig_account_id}/media_publish
    Handles errors with strict isolation and returns a structured success/error tuple.
    Strictly uses standard procedural control flow (zero comprehensions/lambdas).
    """
    clean_ig_id = str(ig_account_id).strip()
    clean_token = str(access_token).strip()
    caption_text = str(message or "").strip()

    if len(clean_ig_id) == 0 or len(clean_token) == 0:
        return False, {
            "status": "error",
            "error": "Missing Instagram account ID or access token."
        }

    # Instagram Graph API requires an image_url for photo posts
    # Default fallback placeholder image if no media was attached
    target_image_url = image_url
    if not target_image_url or len(str(target_image_url).strip()) == 0:
        target_image_url = "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1080&q=80"
    elif not (target_image_url.startswith("http://") or target_image_url.startswith("https://")):
        # If relative / local path, format or use valid web URL for Meta container fetch
        target_image_url = "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1080&q=80"

    container_endpoint = f"https://graph.facebook.com/v18.0/{clean_ig_id}/media"
    publish_endpoint = f"https://graph.facebook.com/v18.0/{clean_ig_id}/media_publish"

    try:
        async with httpx.AsyncClient(timeout=40.0) as client:
            # ----------------------------------------------------
            # STEP 1: CREATE MEDIA CONTAINER
            # ----------------------------------------------------
            container_payload = {
                "image_url": target_image_url,
                "caption": caption_text,
                "access_token": clean_token
            }

            print(f"[INSTAGRAM PUBLISH] Step 1: Requesting container creation on IG {clean_ig_id}...")
            container_res = await client.post(container_endpoint, data=container_payload)

            if container_res.status_code not in [200, 201]:
                print(f"[INSTAGRAM PUBLISH ERROR] Container creation failed ({container_res.status_code}): {container_res.text}")
                try:
                    err_json = container_res.json()
                except Exception:
                    err_json = {"detail": container_res.text}
                return False, {
                    "status": "error",
                    "step": "create_container",
                    "status_code": container_res.status_code,
                    "error": err_json
                }

            container_data = container_res.json()
            container_id = container_data.get("id")

            if not container_id:
                return False, {
                    "status": "error",
                    "step": "create_container",
                    "error": "No container ID returned in Meta response."
                }

            print(f"[INSTAGRAM PUBLISH] Step 1 Success: Created container ID: {container_id}")

            # ----------------------------------------------------
            # STEP 2: PUBLISH MEDIA CONTAINER
            # ----------------------------------------------------
            publish_payload = {
                "creation_id": container_id,
                "access_token": clean_token
            }

            print(f"[INSTAGRAM PUBLISH] Step 2: Publishing container {container_id}...")
            publish_res = await client.post(publish_endpoint, data=publish_payload)

            if publish_res.status_code not in [200, 201]:
                print(f"[INSTAGRAM PUBLISH ERROR] Container publish failed ({publish_res.status_code}): {publish_res.text}")
                try:
                    err_json = publish_res.json()
                except Exception:
                    err_json = {"detail": publish_res.text}
                return False, {
                    "status": "error",
                    "step": "media_publish",
                    "container_id": container_id,
                    "status_code": publish_res.status_code,
                    "error": err_json
                }

            publish_data = publish_res.json()
            post_id = publish_data.get("id") or container_id
            print(f"[INSTAGRAM PUBLISH SUCCESS] Successfully published Instagram Post ID: {post_id}")

            return True, {
                "status": "success",
                "post_id": str(post_id),
                "container_id": str(container_id),
                "data": publish_data
            }

    except Exception as exc:
        print(f"[INSTAGRAM PUBLISH EXCEPTION] Network or unexpected exception: {exc}")
        return False, {
            "status": "error",
            "error": str(exc)
        }
