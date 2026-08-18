import os
import urllib.parse
from datetime import datetime, date, time, timezone
from sqlalchemy.orm import Session
from apscheduler.schedulers.background import BackgroundScheduler
import httpx
import sentry_sdk

from app.database import SessionLocal
from app.models.post import Post
from app.models.notification import Notification
from app.models.social_account import SocialAccount
from app.core.vault import decrypt_token
from app.core.redis import invalidate_cache_prefix_sync
from app.services.social_media import (
    publish_to_linkedin,
    publish_to_instagram,
    publish_to_facebook,
    publish_to_twitter
)
from app.scheduler.worker import process_scheduled_posts

scheduler = BackgroundScheduler()


def extract_post_datetime(post):
    """
    Safely resolves the scheduled datetime for a Post instance.
    Handles timezone-aware and naive timestamps consistently.
    Strictly uses standard control flow (no list comprehensions or lambda expressions).
    """
    dt = getattr(post, "scheduled_at", None)
    if dt is not None:
        return dt

    if post.scheduled_date:
        d = post.scheduled_date
        t_str = getattr(post, "scheduled_time", None) or "00:00"
        try:
            t_str_clean = str(t_str).strip().upper()
            if "AM" in t_str_clean or "PM" in t_str_clean:
                if len(t_str_clean.split(":")) == 3:
                    parsed_time = datetime.strptime(t_str_clean, "%I:%M:%S %p").time()
                else:
                    parsed_time = datetime.strptime(t_str_clean, "%I:%M %p").time()
            elif len(t_str_clean.split(":")) == 3:
                parsed_time = datetime.strptime(t_str_clean, "%H:%M:%S").time()
            else:
                parsed_time = datetime.strptime(t_str_clean, "%H:%M").time()
            return datetime.combine(d, parsed_time)
        except Exception:
            return datetime.combine(d, time(0, 0))

    return None


def is_post_due(post_due_time):
    """
    Evaluates whether a scheduled post is due for publication.
    Normalizes timezone-aware and naive datetime objects to prevent UTC vs Local Time skips.
    Strictly uses standard control flow (no list comprehensions or lambda expressions).
    """
    if post_due_time is None:
        return True

    # 1. If timestamp is timezone-aware
    if post_due_time.tzinfo is not None and post_due_time.tzinfo.utcoffset(post_due_time) is not None:
        now_utc = datetime.now(timezone.utc)
        post_utc = post_due_time.astimezone(timezone.utc)
        return post_utc <= now_utc

    # 2. If timestamp is naive (local system time or UTC timestamp)
    # Check against both local machine time and UTC
    now_local = datetime.now()
    now_utc_naive = datetime.utcnow()

    if post_due_time <= now_local:
        return True
    if post_due_time <= now_utc_naive:
        return True

    return False


def publish_posts():
    """
    APScheduler job that executes every 1 minute.
    Queries pending/scheduled posts, normalizes timezones, decrypts vaulted tokens in memory,
    dispatches to platforms, and updates post statuses and notifications.
    Strictly uses standard iterative loops (zero comprehensions or lambda expressions).
    """
    db: Session = SessionLocal()

    try:
        scheduled_posts = db.query(Post).filter(
            Post.status.in_(["Scheduled", "Pending", "draft"])
        ).all()

        if len(scheduled_posts) == 0:
            return

        print(f"APScheduler worker found {len(scheduled_posts)} posts pending publication check.")

        # Standard iterative for loop
        for post in scheduled_posts:
            post_due_time = extract_post_datetime(post)
            is_due = is_post_due(post_due_time)

            if is_due:
                target_platforms = post.platforms or post.platform or "Instagram"
                platform_lower = target_platforms.lower()
                overall_success = True
                failure_reasons = []

                # 1. LinkedIn live API publishing
                if "linkedin" in platform_lower:
                    success, detail = publish_to_linkedin(post, db)
                    if not success:
                        overall_success = False
                        failure_reasons.append(f"LinkedIn: {detail}")

                # 2. Instagram dispatch
                if "instagram" in platform_lower:
                    publish_to_instagram(post)

                # 3. Facebook dispatch
                if "facebook" in platform_lower:
                    publish_to_facebook(post)

                # 4. Twitter / X dispatch
                if "twitter" in platform_lower or "x" in platform_lower:
                    publish_to_twitter(post)

                # Update database status based on publishing result
                if overall_success:
                    post.status = "Published"
                    post_title_str = post.title or post.content or f"Post #{post.id}"
                    print(f"SUCCESS: Published Post ID {post.id} ('{post_title_str}') to {target_platforms}")

                    # Invalidate user cache on publish
                    if getattr(post, "user_id", None):
                        invalidate_cache_prefix_sync(f"user_{post.user_id}_")

                    # Create user notification
                    notification_text = f"Post '{post_title_str}' was automatically published to {target_platforms}"
                    notification = Notification(
                        user_id=getattr(post, "user_id", None),
                        title="Post Published",
                        message=notification_text,
                        type="publishing",
                        category="publishing"
                    )
                    db.add(notification)
                else:
                    post.status = "Failed"
                    reasons_str = "; ".join(failure_reasons)
                    print(f"FAILED: Post ID {post.id} failed publishing. Reason: {reasons_str}")

                    notification_text = f"Post #{post.id} failed to publish to {target_platforms}: {reasons_str}"
                    notification = Notification(
                        user_id=getattr(post, "user_id", None),
                        title="Publishing Failed",
                        message=notification_text,
                        type="publishing",
                        category="publishing"
                    )
                    db.add(notification)

        db.commit()
    except Exception as e:
        print(f"ERROR in publish_posts background job: {e}")
        try:
            sentry_sdk.capture_exception(e)
        except Exception:
            pass
        db.rollback()
    finally:
        db.close()


def sync_linkedin_deletions():
    """
    Periodic background sync job that checks if posts published to LinkedIn
    have been deleted on LinkedIn directly (returning 404, 410, or deleted resource errors).
    Dynamically routes urn:li:share: to /v2/shares/ and urn:li:ugcPost: to /v2/ugcPosts/.
    When LinkedIn returns 404/410/deleted, updates local PostgreSQL database status to 'Deleted',
    invalidates tenant cache, and notifies user.
    If 401 error occurs, marks the LinkedIn account as disconnected and notifies the user.
    Uses standard iterative for loops (no list comprehensions or lambda expressions).
    """
    db: Session = SessionLocal()

    try:
        social_account = db.query(SocialAccount).filter(
            SocialAccount.platform == "linkedin"
        ).first()

        if not social_account or not social_account.access_token:
            return

        # Decrypt token in memory only
        access_token = decrypt_token(social_account.access_token)
        if not access_token:
            social_account.status = "disconnected"
            db.commit()
            return

        published_posts = db.query(Post).filter(
            Post.status == "Published",
            Post.linkedin_urn.isnot(None)
        ).all()

        headers = {
            "Authorization": f"Bearer {access_token}",
            "X-Restli-Protocol-Version": "2.0.0"
        }

        with httpx.Client(timeout=10.0) as client:
            for post in published_posts:
                post_urn = post.linkedin_urn
                if not post_urn:
                    continue

                post_urn_str = str(post_urn).strip()
                print(f"Checking sync for URN: {post_urn_str}")

                try:
                    quoted_urn = urllib.parse.quote(post_urn_str)
                    if post_urn_str.startswith("urn:li:share:"):
                        check_url = f"https://api.linkedin.com/v2/shares/{quoted_urn}"
                    else:
                        check_url = f"https://api.linkedin.com/v2/ugcPosts/{quoted_urn}"

                    res = client.get(check_url, headers=headers)
                    print(f"Sync check response for Post {post.id} ({check_url}): {res.status_code}")

                    if res.status_code == 401 or "65600" in res.text or "INVALID_ACCESS_TOKEN" in res.text:
                        social_account.status = "disconnected"
                        db.commit()
                        notif_msg = "LinkedIn authentication expired. Please reconnect your account from the Accounts page."
                        notification = Notification(
                            user_id=getattr(social_account, "user_id", None),
                            title="LinkedIn Authentication Expired",
                            message=notif_msg,
                            type="account",
                            category="account"
                        )
                        db.add(notification)
                        db.commit()
                        print("NOTICE: LinkedIn OAuth token expired during sync check. Account marked as disconnected.")
                        break

                    # Reverse deletion detection: 404, 410, or resource deleted errors
                    is_deleted_on_linkedin = False
                    if res.status_code in [404, 410]:
                        is_deleted_on_linkedin = True
                    elif res.status_code == 400 and ("no_resource" in res.text.lower() or "not found" in res.text.lower()):
                        is_deleted_on_linkedin = True
                    elif res.status_code == 422 and "resource_deleted" in res.text.lower():
                        is_deleted_on_linkedin = True

                    if is_deleted_on_linkedin:
                        post.status = "Deleted"
                        db.commit()
                        print(f"Successfully marked Post {post.id} as Deleted locally following LinkedIn native deletion.")

                        # Invalidate user cache so UI immediately reflects deletion
                        if getattr(post, "user_id", None):
                            invalidate_cache_prefix_sync(f"user_{post.user_id}_")

                        notif_msg = f"Post '{post.title or post.content}' was deleted on LinkedIn and marked as Deleted locally."
                        notification = Notification(
                            user_id=getattr(post, "user_id", None),
                            title="LinkedIn Post Deleted",
                            message=notif_msg,
                            type="publishing",
                            category="publishing"
                        )
                        db.add(notification)
                        db.commit()
                except Exception as err:
                    print(f"Error checking LinkedIn post ID {post.id} (URN {post_urn_str}): {err}")
                    try:
                        sentry_sdk.capture_exception(err)
                    except Exception:
                        pass
                    db.rollback()

    except Exception as e:
        print(f"ERROR in sync_linkedin_deletions: {e}")
        try:
            sentry_sdk.capture_exception(e)
        except Exception:
            pass
        db.rollback()
    finally:
        db.close()


def start_scheduler():
    """
    Initializes and starts the APScheduler background job runner.
    Runs publish_posts and process_scheduled_posts every 1 minute, and sync_linkedin_deletions every 5 minutes.
    """
    scheduler.add_job(publish_posts, "interval", minutes=1, id="publish_posts_job", replace_existing=True)
    scheduler.add_job(process_scheduled_posts, "interval", minutes=1, id="process_scheduled_posts_job", replace_existing=True)
    scheduler.add_job(sync_linkedin_deletions, "interval", minutes=5, id="sync_linkedin_deletions_job", replace_existing=True)
    scheduler.start()
    print("APScheduler initialized: active interval jobs for publishing & LinkedIn deletion sync.")
