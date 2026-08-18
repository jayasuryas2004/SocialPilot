import os
from datetime import datetime, timezone
from typing import Optional, List, Dict, Any
from sqlalchemy.orm import Session
import httpx
import sentry_sdk

from app.database import SessionLocal
from app.models.scheduled_post import ScheduledPost
from app.models.social_account import SocialAccount
from app.models.post import Post
from app.models.notification import Notification
from app.core.vault import decrypt_token
from app.services.facebook_service import publish_to_facebook
from app.services.social_media import publish_to_linkedin


def process_scheduled_posts(db: Optional[Session] = None) -> List[Dict[str, Any]]:
    """
    APScheduler worker job that runs every 60 seconds.
    1. Queries the database for all ScheduledPost records where status == 'pending' and scheduled_for <= current_time.
    2. Iterates through pending posts using standard procedural loops.
    3. Immediately updates status to 'processing' before dispatching to prevent duplicate publishing on next tick.
    4. Passes content and platforms to the Phase 7 multi-platform publisher.
    5. Updates status to 'published' on success, or 'failed' if an exception occurs.
    Strictly follows Python AST rules: standard procedural for and while loops only (zero comprehensions/lambdas).
    Maintains strict error isolation so a failure on one post never crashes the worker.
    """
    owns_session = False
    if db is None:
        db = SessionLocal()
        owns_session = True

    processed_results = []

    try:
        now_time = datetime.utcnow()

        # 1. Query pending scheduled posts that are due
        pending_posts = db.query(ScheduledPost).filter(
            ScheduledPost.status == "pending",
            ScheduledPost.scheduled_for <= now_time
        ).all()

        if len(pending_posts) == 0:
            return processed_results

        print(f"[SCHEDULER WORKER] Found {len(pending_posts)} scheduled post(s) due for publishing.")

        # 2. Iterate through records using standard procedural for loop
        for post in pending_posts:
            post_id = post.id
            post_content = post.content
            user_id = post.user_id
            raw_platforms = post.platforms or "facebook, linkedin"

            # 3. Mark as 'processing' immediately to prevent race conditions on next tick
            post.status = "processing"
            post.updated_at = datetime.utcnow()
            db.commit()

            # Parse platforms list with standard procedural loop
            target_platforms = []
            parts = raw_platforms.split(",")
            for part in parts:
                clean_part = part.strip().lower()
                if len(clean_part) > 0 and clean_part not in target_platforms:
                    target_platforms.append(clean_part)

            if len(target_platforms) == 0:
                target_platforms.append("facebook")
                target_platforms.append("linkedin")

            # Fetch user's social accounts
            accounts_query = db.query(SocialAccount)
            if user_id:
                user_accounts = accounts_query.filter(SocialAccount.user_id == user_id).all()
                if len(user_accounts) == 0:
                    user_accounts = accounts_query.all()
            else:
                user_accounts = accounts_query.all()

            post_success = True
            platform_outcomes = {}

            # 4. Isolated dispatch per scheduled post
            try:
                for platform_name in target_platforms:

                    # Meta / Facebook Publishing
                    if platform_name in ["facebook", "meta", "fb"]:
                        try:
                            fb_account = None
                            for acc in user_accounts:
                                if acc.platform and acc.platform.lower() == "facebook":
                                    fb_account = acc
                                    break

                            if not fb_account or not fb_account.access_token:
                                platform_outcomes["facebook"] = "No connected Facebook account in vault."
                                post_success = False
                            else:
                                page_token = decrypt_token(fb_account.access_token)
                                page_id = fb_account.platform_user_id or "me"

                                # Synchronous/Async execution support for Facebook Graph API
                                fb_endpoint = f"https://graph.facebook.com/v18.0/{page_id}/feed"
                                with httpx.Client(timeout=30.0) as client:
                                    fb_res = client.post(
                                        fb_endpoint,
                                        data={"message": post_content, "access_token": page_token}
                                    )

                                if fb_res.status_code in [200, 201]:
                                    fb_json = fb_res.json()
                                    platform_outcomes["facebook"] = f"Success (Post ID: {fb_json.get('id')})"
                                else:
                                    platform_outcomes["facebook"] = f"Failed (Status: {fb_res.status_code})"
                                    post_success = False

                        except Exception as fb_exc:
                            platform_outcomes["facebook"] = f"Exception: {str(fb_exc)}"
                            post_success = False

                    # LinkedIn Publishing
                    elif platform_name in ["linkedin", "li"]:
                        try:
                            tracking_post = Post(
                                user_id=user_id,
                                title=post_content[:40],
                                content=post_content,
                                platforms="LinkedIn",
                                platform="LinkedIn",
                                status="Published",
                                media_url=post.media_url,
                                media_type=post.media_type or "image"
                            )
                            db.add(tracking_post)
                            db.commit()
                            db.refresh(tracking_post)

                            li_success, li_detail = publish_to_linkedin(tracking_post, db)
                            if li_success:
                                platform_outcomes["linkedin"] = f"Success ({li_detail})"
                            else:
                                platform_outcomes["linkedin"] = f"Failed ({li_detail})"
                                post_success = False
                        except Exception as li_exc:
                            platform_outcomes["linkedin"] = f"Exception: {str(li_exc)}"
                            post_success = False

                    else:
                        platform_outcomes[platform_name] = f"Staged for {platform_name}"

                # 5. Update database record status based on execution result
                summary_parts = []
                for p_name in platform_outcomes:
                    summary_parts.append(f"{p_name}: {platform_outcomes[p_name]}")
                summary_str = "; ".join(summary_parts)

                if post_success:
                    post.status = "published"
                    post.result_detail = summary_str
                    post.updated_at = datetime.utcnow()
                    db.commit()

                    # Notify user
                    notif = Notification(
                        user_id=user_id,
                        title="Scheduled Post Published",
                        message=f"Scheduled post #{post_id} was successfully published to {raw_platforms}.",
                        type="publishing",
                        category="publishing"
                    )
                    db.add(notif)
                    db.commit()
                    print(f"[SCHEDULER SUCCESS] Post #{post_id} marked as published: {summary_str}")
                else:
                    post.status = "failed"
                    post.result_detail = summary_str
                    post.updated_at = datetime.utcnow()
                    db.commit()

                    notif = Notification(
                        user_id=user_id,
                        title="Scheduled Post Failed",
                        message=f"Scheduled post #{post_id} encountered errors: {summary_str}",
                        type="publishing",
                        category="publishing"
                    )
                    db.add(notif)
                    db.commit()
                    print(f"[SCHEDULER FAILURE] Post #{post_id} marked as failed: {summary_str}")

                processed_results.append({
                    "post_id": post_id,
                    "status": post.status,
                    "details": summary_str
                })

            except Exception as single_post_err:
                # Error isolation: continue to next post even if one raises unhandled exception
                print(f"[SCHEDULER EXCEPTION] Error processing post #{post_id}: {single_post_err}")
                try:
                    sentry_sdk.capture_exception(single_post_err)
                except Exception:
                    pass

                post.status = "failed"
                post.result_detail = str(single_post_err)
                post.updated_at = datetime.utcnow()
                db.commit()

                processed_results.append({
                    "post_id": post_id,
                    "status": "failed",
                    "error": str(single_post_err)
                })

    except Exception as worker_err:
        print(f"[SCHEDULER CRITICAL ERROR] Worker loop error: {worker_err}")
        try:
            sentry_sdk.capture_exception(worker_err)
        except Exception:
            pass
        db.rollback()

    finally:
        if owns_session:
            db.close()

    return processed_results
