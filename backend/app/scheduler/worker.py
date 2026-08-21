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
    4. Evaluates each platform individually without aggregating success blindly.
    5. Updates status to 'published', 'partial_success', or 'failed' based on per-platform outcomes.
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

            successful_platforms_count = 0
            failed_platforms_count = 0
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
                                platform_outcomes["facebook"] = "Missing Facebook account in vault."
                                failed_platforms_count = failed_platforms_count + 1
                                print("FACEBOOK ABORTED: Missing Facebook account in vault.")
                            elif not fb_account.platform_user_id or fb_account.platform_user_id == "me":
                                platform_outcomes["facebook"] = "Invalid Facebook Page ID. Page Access Token and Page ID are required."
                                failed_platforms_count = failed_platforms_count + 1
                                print("FACEBOOK ABORTED: Missing Page ID.")
                            else:
                                page_token = decrypt_token(fb_account.access_token)
                                page_id = str(fb_account.platform_user_id).strip()

                                # Meta Graph API v19.0 endpoint
                                if post.media_url and len(str(post.media_url).strip()) > 0:
                                    fb_endpoint = f"https://graph.facebook.com/v19.0/{page_id}/photos"
                                    fb_payload = {"url": str(post.media_url).strip(), "message": post_content, "access_token": page_token}
                                else:
                                    fb_endpoint = f"https://graph.facebook.com/v19.0/{page_id}/feed"
                                    fb_payload = {"message": post_content, "access_token": page_token}

                                with httpx.Client(timeout=30.0) as client:
                                    fb_res = client.post(fb_endpoint, data=fb_payload)

                                if fb_res.status_code in [200, 201]:
                                    fb_json = fb_res.json()
                                    fb_post_id = fb_json.get("id")
                                    platform_outcomes["facebook"] = f"Success (Post ID: {fb_post_id})"
                                    successful_platforms_count = successful_platforms_count + 1
                                    print(f"[FACEBOOK SUCCESS] Published to Facebook Page {page_id}. Post ID: {fb_post_id}")
                                else:
                                    err_detail = fb_res.text
                                    try:
                                        err_json = fb_res.json()
                                        if isinstance(err_json, dict) and "error" in err_json:
                                            err_detail = err_json["error"].get("message", err_detail)
                                    except Exception:
                                        pass
                                    platform_outcomes["facebook"] = f"Failed (Status {fb_res.status_code}): {err_detail}"
                                    failed_platforms_count = failed_platforms_count + 1
                                    print(f"FACEBOOK FAILED: Status {fb_res.status_code} - {err_detail}")

                        except Exception as fb_exc:
                            platform_outcomes["facebook"] = f"Exception: {str(fb_exc)}"
                            failed_platforms_count = failed_platforms_count + 1
                            print(f"FACEBOOK EXCEPTION: {fb_exc}")

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
                                successful_platforms_count = successful_platforms_count + 1
                                print(f"[LINKEDIN SUCCESS] Published Post #{post_id} to LinkedIn: {li_detail}")
                            else:
                                platform_outcomes["linkedin"] = f"Failed ({li_detail})"
                                failed_platforms_count = failed_platforms_count + 1
                                print(f"[LINKEDIN FAILED] Post #{post_id} failed on LinkedIn: {li_detail}")
                        except Exception as li_exc:
                            platform_outcomes["linkedin"] = f"Exception: {str(li_exc)}"
                            failed_platforms_count = failed_platforms_count + 1
                            print(f"[LINKEDIN EXCEPTION] Error on LinkedIn for Post #{post_id}: {li_exc}")

                    else:
                        platform_outcomes[platform_name] = f"Staged for {platform_name}"

                # 5. Update database record status based on individual platform outcomes
                summary_parts = []
                for p_name in platform_outcomes:
                    summary_parts.append(f"{p_name}: {platform_outcomes[p_name]}")
                summary_str = "; ".join(summary_parts)

                if failed_platforms_count == 0 and successful_platforms_count > 0:
                    post.status = "published"
                    post.result_detail = summary_str
                    post.updated_at = datetime.utcnow()
                    db.commit()

                    notif = Notification(
                        user_id=user_id,
                        title="Scheduled Post Published",
                        message=f"Scheduled post #{post_id} was successfully published to {raw_platforms}.",
                        type="publishing",
                        category="publishing"
                    )
                    db.add(notif)
                    db.commit()
                    print(f"[SCHEDULER SUCCESS] Post #{post_id} fully published: {summary_str}")

                elif successful_platforms_count > 0 and failed_platforms_count > 0:
                    post.status = "partial_success"
                    post.result_detail = summary_str
                    post.updated_at = datetime.utcnow()
                    db.commit()

                    notif = Notification(
                        user_id=user_id,
                        title="Scheduled Post Partially Published",
                        message=f"Scheduled post #{post_id} partially succeeded: {summary_str}",
                        type="publishing",
                        category="publishing"
                    )
                    db.add(notif)
                    db.commit()
                    print(f"[SCHEDULER PARTIAL SUCCESS] Post #{post_id} partially published: {summary_str}")

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
                    print(f"[SCHEDULER FAILURE] Post #{post_id} failed: {summary_str}")

                processed_results.append({
                    "post_id": post_id,
                    "status": post.status,
                    "details": summary_str
                })

            except Exception as single_post_err:
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
