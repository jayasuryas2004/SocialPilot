from apscheduler.schedulers.background import BackgroundScheduler
from datetime import datetime
from sqlalchemy.orm import Session

from database import SessionLocal
from models.post import Post
from models.notification import Notification

from services.social_media import (
    publish_to_instagram,
    publish_to_facebook,
    publish_to_linkedin,
    publish_to_twitter,
)

scheduler = BackgroundScheduler()


def publish_posts():
    db: Session = SessionLocal()

    posts = db.query(Post).filter(Post.status == "Pending").all()

    print(f"Found {len(posts)} pending post(s)")

    current_time = datetime.now()

    for post in posts:
        print(f"Checking: {post.title}")

        if post.schedule_time <= current_time:
            print(f"Publishing: {post.title}")

            if post.platform == "Instagram":
                publish_to_instagram(post)

            elif post.platform == "Facebook":
                publish_to_facebook(post)

            elif post.platform == "LinkedIn":
                publish_to_linkedin(post)

            elif post.platform == "Twitter":
                publish_to_twitter(post)

            else:
                print(f"Platform '{post.platform}' is not supported.")

            # Update post status
            post.status = "Published"

            # Create notification
            notification = Notification(
                message=f"{post.title} published successfully on {post.platform}"
            )

            db.add(notification)

    db.commit()
    db.close()


def start_scheduler():
    scheduler.add_job(
        publish_posts,
        "interval",
        seconds=10
    )

    scheduler.start()
    print("Scheduler Started Successfully!")