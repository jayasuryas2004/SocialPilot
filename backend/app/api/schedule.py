from datetime import datetime, time, timezone
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import Optional
import pytz

from app.database import get_db
from app.models.post import Post
from app.models.user import User
from app.schemas.post import PostCreate
from app.core.security import get_current_user


router = APIRouter()


# CREATE
@router.post("/schedule")
def create_schedule(
    post: PostCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    platforms_str = "Instagram"
    if isinstance(post.platforms, list):
        platform_items = []
        for p in post.platforms:
            if p:
                platform_items.append(str(p).strip())
        if len(platform_items) > 0:
            platforms_str = ", ".join(platform_items)
    elif isinstance(post.platforms, str) and len(post.platforms.strip()) > 0:
        platforms_str = post.platforms.strip()
    elif post.platform:
        platforms_str = post.platform.strip()

    title = post.title
    if not title or len(title.strip()) == 0:
        content_lines = post.content.strip().split("\n")
        if len(content_lines) > 0 and len(content_lines[0].strip()) > 0:
            title = content_lines[0].strip()[:50]
        else:
            title = "Untitled Post"

    img_data = post.image_url or post.image or post.media or post.media_url or post.mediaFile
    print(f"Received image_url length in /schedule: {len(img_data) if img_data else 0}")

    scheduled_at_utc = None
    scheduled_val = getattr(post, "scheduled_at", None)
    if scheduled_val is None:
        scheduled_val = getattr(post, "scheduled_for", None)

    if scheduled_val is None:
        if post.scheduled_date is not None:
            t_str = post.scheduled_time
            if t_str is None:
                t_str = "00:00"
            try:
                t_str_clean = str(t_str).strip().upper()
                if "AM" in t_str_clean:
                    if len(t_str_clean.split(":")) == 3:
                        parsed_time = datetime.strptime(t_str_clean, "%I:%M:%S %p").time()
                    else:
                        parsed_time = datetime.strptime(t_str_clean, "%I:%M %p").time()
                elif "PM" in t_str_clean:
                    if len(t_str_clean.split(":")) == 3:
                        parsed_time = datetime.strptime(t_str_clean, "%I:%M:%S %p").time()
                    else:
                        parsed_time = datetime.strptime(t_str_clean, "%I:%M %p").time()
                elif len(t_str_clean.split(":")) == 3:
                    parsed_time = datetime.strptime(t_str_clean, "%H:%M:%S").time()
                else:
                    parsed_time = datetime.strptime(t_str_clean, "%H:%M").time()
                scheduled_val = datetime.combine(post.scheduled_date, parsed_time)
            except Exception:
                scheduled_val = datetime.combine(post.scheduled_date, time(0, 0))

    if scheduled_val is not None:
        if isinstance(scheduled_val, str):
            if len(scheduled_val.strip()) > 0:
                try:
                    scheduled_val = datetime.fromisoformat(scheduled_val.replace("Z", "+00:00"))
                except Exception:
                    try:
                        scheduled_val = datetime.strptime(scheduled_val.strip(), "%Y-%m-%d %H:%M:%S")
                    except Exception:
                        pass
        if isinstance(scheduled_val, datetime):
            if scheduled_val.tzinfo is not None:
                if scheduled_val.tzinfo.utcoffset(scheduled_val) is not None:
                    scheduled_at_utc = scheduled_val.astimezone(pytz.utc).replace(tzinfo=None)
                else:
                    ist_tz = pytz.timezone("Asia/Kolkata")
                    localized_dt = ist_tz.localize(scheduled_val)
                    scheduled_at_utc = localized_dt.astimezone(pytz.utc).replace(tzinfo=None)
            else:
                # Localize naive datetime from Asia/Kolkata to UTC
                ist_tz = pytz.timezone("Asia/Kolkata")
                localized_dt = ist_tz.localize(scheduled_val)
                scheduled_at_utc = localized_dt.astimezone(pytz.utc).replace(tzinfo=None)

    new_post = Post(
        user_id=current_user.id,
        title=title,
        content=post.content,
        platforms=platforms_str,
        platform=platforms_str,
        scheduled_date=post.scheduled_date,
        scheduled_time=post.scheduled_time,
        scheduled_at=scheduled_at_utc,
        status=post.status or "Scheduled",
        campaign_id=post.campaign_id,
        image_url=img_data
    )

    db.add(new_post)
    db.commit()
    db.refresh(new_post)
    print(f"Persisted Scheduled Post ID {new_post.id} (scheduled_at_utc: {scheduled_at_utc}) for user {current_user.id}")

    return {
        "message": "Post scheduled successfully",
        "data": new_post
    }


# READ
@router.get("/schedule")
def get_schedules(
    campaign_id: Optional[int] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    query = db.query(Post).filter(
        (Post.user_id == current_user.id) | (Post.user_id.is_(None))
    )
    if campaign_id is not None:
        query = query.filter(Post.campaign_id == campaign_id)

    posts = query.all()

    return {
        "data": posts
    }


# UPDATE
@router.put("/schedule/{id}")
def update_schedule(
    id: int,
    updated_post: PostCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    post = db.query(Post).filter(
        Post.id == id,
        (Post.user_id == current_user.id) | (Post.user_id.is_(None))
    ).first()

    if not post:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Post not found or unauthorized"
        )

    if updated_post.title:
        post.title = updated_post.title
    if updated_post.content:
        post.content = updated_post.content
    if updated_post.platform or updated_post.platforms:
        platforms_str = updated_post.platform or (", ".join(updated_post.platforms) if isinstance(updated_post.platforms, list) else updated_post.platforms)
        post.platforms = platforms_str
        post.platform = platforms_str
    if updated_post.scheduled_date:
        post.scheduled_date = updated_post.scheduled_date
    if updated_post.scheduled_time:
        post.scheduled_time = updated_post.scheduled_time
    if updated_post.status:
        post.status = updated_post.status
    if updated_post.campaign_id is not None:
        post.campaign_id = updated_post.campaign_id

    img_data = updated_post.image_url or updated_post.image or updated_post.media or updated_post.media_url or updated_post.mediaFile
    if img_data:
        post.image_url = img_data

    db.commit()
    db.refresh(post)

    return {
        "message": "Post updated successfully",
        "data": post
    }


# DELETE
@router.delete("/schedule/{id}")
def delete_schedule(
    id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    post = db.query(Post).filter(
        Post.id == id,
        (Post.user_id == current_user.id) | (Post.user_id.is_(None))
    ).first()

    if not post:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Post not found or unauthorized"
        )

    db.delete(post)
    db.commit()

    return {
        "message": "Post deleted successfully"
    }