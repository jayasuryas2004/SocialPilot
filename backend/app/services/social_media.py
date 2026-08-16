import httpx
from app.models.social_account import SocialAccount


def publish_to_linkedin(post, db):
    """
    Publishes a scheduled post to LinkedIn using vaulted OAuth access tokens.
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
    platform_user_id = social_account.platform_user_id or "unknown"
    author_urn = f"urn:li:person:{platform_user_id}"

    # 2. Construct LinkedIn UGC Post payload
    post_text = post.content or post.title or "New post from SocialPilot"
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

    headers = {
        "Authorization": f"Bearer {access_token}",
        "X-Restli-Protocol-Version": "2.0.0",
        "Content-Type": "application/json"
    }

    # 3. Execute live HTTP POST request to LinkedIn API
    try:
        with httpx.Client(timeout=15.0) as client:
            response = client.post(
                "https://api.linkedin.com/v2/ugcPosts",
                json=ugc_payload,
                headers=headers
            )

            if response.status_code in [200, 201]:
                print(f"SUCCESS: Published Post ID {post.id} to LinkedIn API: {response.text}")
                return True, response.text
            else:
                error_detail = f"Status {response.status_code}: {response.text}"
                print(f"ERROR: LinkedIn API publication failed for Post ID {post.id} - {error_detail}")
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