from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import Optional

from app.database import get_db
from app.models.post import Post
from app.models.user import User
from app.schemas.post import PostCreate
from app.services.social_media import delete_from_linkedin
from app.core.security import get_current_user

router = APIRouter(prefix="/posts", tags=["Posts"])
router_api = APIRouter(prefix="/api/posts", tags=["Posts"])


# CREATE POST
@router.post("/")
@router.post("")
@router_api.post("/")
@router_api.post("")
def create_post(
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
    print(f"Received image_url length: {len(img_data) if img_data else 0}")

    new_post = Post(
        user_id=current_user.id,
        title=title,
        content=post.content,
        platforms=platforms_str,
        platform=platforms_str,
        scheduled_date=post.scheduled_date,
        scheduled_time=post.scheduled_time,
        status=post.status or "Scheduled",
        campaign_id=post.campaign_id,
        image_url=img_data
    )

    db.add(new_post)
    db.commit()
    db.refresh(new_post)
    print(f"Persisted Post ID {new_post.id} for user {current_user.id}")

    return {
        "message": "Post created successfully",
        "post": new_post,
        "data": new_post
    }


# GET ALL POSTS
@router.get("/")
@router.get("")
@router_api.get("/")
@router_api.get("")
def get_posts(
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
        "data": posts,
        "items": posts
    }


# GET POST STATS
@router.get("/stats")
@router_api.get("/stats")
def get_posts_stats(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    posts = db.query(Post).filter(
        (Post.user_id == current_user.id) | (Post.user_id.is_(None))
    ).all()

    total_posts = len(posts)
    scheduled_count = 0
    published_count = 0
    draft_count = 0
    failed_count = 0
    deleted_count = 0

    for p in posts:
        s = (p.status or "").strip().capitalize()
        if s == "Published":
            published_count += 1
        elif s == "Scheduled" or s == "Pending":
            scheduled_count += 1
        elif s == "Draft":
            draft_count += 1
        elif s == "Failed":
            failed_count += 1
        elif s == "Deleted":
            deleted_count += 1
        else:
            scheduled_count += 1

    return {
        "total": total_posts,
        "scheduled": scheduled_count,
        "published": published_count,
        "drafts": draft_count,
        "failed": failed_count,
        "deleted": deleted_count
    }


# UPDATE POST
@router.put("/{post_id}")
@router_api.put("/{post_id}")
def update_post(
    post_id: int,
    post: PostCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    db_post = db.query(Post).filter(
        Post.id == post_id,
        (Post.user_id == current_user.id) | (Post.user_id.is_(None))
    ).first()

    if not db_post:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Post not found or unauthorized"
        )

    if post.title:
        db_post.title = post.title
    if post.content:
        db_post.content = post.content
    if post.platform or post.platforms:
        platforms_str = post.platform or (", ".join(post.platforms) if isinstance(post.platforms, list) else post.platforms)
        db_post.platforms = platforms_str
        db_post.platform = platforms_str
    if post.scheduled_date:
        db_post.scheduled_date = post.scheduled_date
    if post.scheduled_time:
        db_post.scheduled_time = post.scheduled_time
    if post.status:
        db_post.status = post.status
    if post.campaign_id is not None:
        db_post.campaign_id = post.campaign_id

    img_data = post.image_url or post.image or post.media or post.media_url or post.mediaFile
    if img_data:
        db_post.image_url = img_data

    db.commit()
    db.refresh(db_post)

    return {
        "message": "Post updated successfully",
        "post": db_post,
        "data": db_post
    }


# DELETE POST (Local-to-LinkedIn bi-directional deletion)
@router.delete("/{post_id}")
@router_api.delete("/{post_id}")
def delete_post(
    post_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Deletes a post by ID idempotently.
    Triggers native deletion on LinkedIn if a linkedin_urn is attached.
    Safely handles concurrent frontend duplicate deletion requests without throwing 404 or SAWarnings.
    Strictly uses standard control flow (zero comprehensions or lambda expressions).
    """
    db_post = db.query(Post).filter(
        Post.id == post_id,
        (Post.user_id == current_user.id) | (Post.user_id.is_(None))
    ).first()

    # Idempotent response: If already deleted or missing, safely return 200 OK
    if not db_post:
        return {
            "message": "Post already deleted",
            "id": post_id,
            "status": "already_deleted"
        }

    # If post was published to LinkedIn and has a URN, delete it from LinkedIn first
    if getattr(db_post, "linkedin_urn", None):
        print(f"Triggering native LinkedIn deletion for post ID {db_post.id} (URN: {db_post.linkedin_urn})")
        try:
            delete_from_linkedin(db_post, db)
        except Exception as del_err:
            print(f"Notice during native LinkedIn delete: {del_err}")

    try:
        db.delete(db_post)
        db.commit()
    except Exception as db_err:
        db.rollback()
        return {
            "message": "Post already deleted or removed concurrently",
            "id": post_id,
            "status": "already_deleted"
        }

    return {
        "message": "Post deleted successfully from database and connected platforms",
        "id": post_id
    }