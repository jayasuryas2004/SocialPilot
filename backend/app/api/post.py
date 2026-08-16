from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import Optional

from app.database import get_db
from app.models.post import Post
from app.schemas.post import PostCreate


router = APIRouter(prefix="/posts", tags=["Posts"])


# CREATE POST
@router.post("/")
@router.post("")
def create_post(post: PostCreate, db: Session = Depends(get_db)):
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

    new_post = Post(
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

    return {
        "message": "Post created successfully",
        "post": new_post,
        "data": new_post
    }


# GET ALL POSTS
@router.get("/")
@router.get("")
def get_posts(campaign_id: Optional[int] = None, db: Session = Depends(get_db)):
    query = db.query(Post)
    if campaign_id is not None:
        query = query.filter(Post.campaign_id == campaign_id)

    posts = query.all()

    return {
        "data": posts,
        "items": posts
    }


# UPDATE POST
@router.put("/{post_id}")
def update_post(post_id: int, post: PostCreate, db: Session = Depends(get_db)):
    db_post = db.query(Post).filter(Post.id == post_id).first()

    if not db_post:
        return {"error": "Post not found", "message": "Post not found"}

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


# DELETE POST
@router.delete("/{post_id}")
def delete_post(post_id: int, db: Session = Depends(get_db)):
    db_post = db.query(Post).filter(Post.id == post_id).first()

    if not db_post:
        return {"error": "Post not found", "message": "Post not found"}

    db.delete(db_post)
    db.commit()

    return {
        "message": "Post deleted successfully"
    }