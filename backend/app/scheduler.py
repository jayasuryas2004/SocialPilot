from apscheduler.schedulers.background import BackgroundScheduler
from datetime import datetime, date
from sqlalchemy.orm import Session

from app.database import SessionLocal
from app.models.post import Post
from app.models.notification import Notification

from app.services.social_media import (
    publish_to_instagram,
    publish_to_facebook,
    publish_to_linkedin,
    publish_to_twitter,
)


scheduler = BackgroundScheduler()


def extract_post_datetime(post):
    """
    Extracts or constructs a datetime object for comparison from post fields.
    Uses post.scheduled_date and post.scheduled_time (aligned with Post model).
    """
    if getattr(post, "scheduled_at", None) and isinstance(post.scheduled_at, datetime):
        return post.scheduled_at

    scheduled_date_val = getattr(post, "scheduled_date", None)
    if scheduled_date_val:
        d = scheduled_date_val
        if isinstance(d, str):
            try:
                d = datetime.strptime(d.strip(), "%Y-%m-%d").date()
            except Exception:
                d = None

        if d:
            hour_val = 0
            min_val = 0
            scheduled_time_val = getattr(post, "scheduled_time", None)
            if scheduled_time_val and isinstance(scheduled_time_val, str):
                time_str = scheduled_time_val.strip()
                try:
                    time_parts = time_str.split(":")
                    if len(time_parts) >= 2:
                        hour_val = int(time_parts[0])
                        min_cleaned = time_parts[1].split()[0]
                        min_val = int(min_cleaned)
                except Exception:
                    hour_val = 0
                    min_val = 0

            return datetime(d.year, d.month, d.day, hour_val, min_val)

    return None


def publish_posts():
    """
    Background worker job that queries Scheduled/Pending posts,
    compares timestamps with current system time, and publishes due posts.
    """
    db: Session = SessionLocal()

    try:
        # Query posts with Scheduled or Pending status
        scheduled_posts = db.query(Post).filter(
            (Post.status == "Scheduled") | (Post.status == "Pending")
        ).all()

        current_time = datetime.now()

        # Standard iterative for loop (no list comprehensions or lambdas)
        for post in scheduled_posts:
            post_due_time = extract_post_datetime(post)

            # If target time is set and reached, or if no target time was set
            is_due = False
            if post_due_time is not None:
                if post_due_time <= current_time:
                    is_due = True
            else:
                is_due = True

            if is_due:
                target_platforms = post.platforms or post.platform or "Instagram"

                # Publish to respective mock social media channels
                platform_lower = target_platforms.lower()
                if "instagram" in platform_lower:
                    publish_to_instagram(post)
                if "facebook" in platform_lower:
                    publish_to_facebook(post)
                if "linkedin" in platform_lower:
                    publish_to_linkedin(post)
                if "twitter" in platform_lower or "x" in platform_lower:
                    publish_to_twitter(post)

                # Update status in database to Published
                post.status = "Published"

                # Output clean success log to terminal
                print(f"SUCCESS: Published Post ID {post.id} ('{post.title}') to {target_platforms}")

                # Create user notification
                notification_text = f"Post '{post.title}' was automatically published to {target_platforms}"
                notification = Notification(message=notification_text)
                db.add(notification)

        db.commit()
    except Exception as e:
        print(f"ERROR in publish_posts background job: {e}")
        db.rollback()
    finally:
        db.close()


def start_scheduler():
    """
    Initializes and starts the APScheduler background job runner.
    """
    if not scheduler.running:
        scheduler.add_job(
            publish_posts,
            "interval",
            seconds=10,
            id="publish_posts_job",
            replace_existing=True
        )
        scheduler.start()
        print("Scheduler Started Successfully! Checking for due posts every 10 seconds.")