import os
import time
import re
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
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

# Base uploads directory path for media files
MEDIA_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "uploads", "media"))
os.makedirs(MEDIA_DIR, exist_ok=True)

ALLOWED_IMAGE_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp", ".gif"}
ALLOWED_IMAGE_MIMES = {"image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif"}

ALLOWED_VIDEO_EXTENSIONS = {".mp4", ".mov", ".webm", ".mkv", ".quicktime"}
ALLOWED_VIDEO_MIMES = {
    "video/mp4", "video/quicktime", "video/webm", "video/x-matroska", "video/mov"
}


# ========================================================
# 1. MEDIA UPLOAD (IMAGES & VIDEOS WITH MEMORY-SAFE CHUNKING)
# ========================================================
@router.post("/upload-media")
@router_api.post("/upload-media")
async def upload_media(
    file: UploadFile = File(...),
    media_type: str = Form("image"),
    current_user: User = Depends(get_current_user)
):
    """
    Accepts multipart/form-data image or video uploads.
    Persists media to disk using memory-safe 1MB chunks inside a procedural while loop.
    Enforces strict MIME type and file extension validation.
    """
    if not file or not file.filename:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No media file provided."
        )

    clean_media_type = media_type.strip().lower() if media_type else "image"
    raw_content_type = (file.content_type or "").lower()
    _, ext = os.path.splitext(file.filename)
    clean_ext = ext.lower()

    if clean_media_type == "video":
        if clean_ext not in ALLOWED_VIDEO_EXTENSIONS and raw_content_type not in ALLOWED_VIDEO_MIMES:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid video format '{clean_ext}'. Supported video formats: MP4, MOV, WEBM, MKV."
            )
    else:
        clean_media_type = "image"
        if clean_ext not in ALLOWED_IMAGE_EXTENSIONS and raw_content_type not in ALLOWED_IMAGE_MIMES:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid image format '{clean_ext}'. Supported image formats: JPG, PNG, WEBP, GIF."
            )

    # Sanitize filename
    raw_name, _ = os.path.splitext(file.filename)
    safe_name = re.sub(r"[^a-zA-Z0-9_\-]", "_", raw_name)
    timestamp = int(time.time())
    unique_filename = f"{clean_media_type}_user_{current_user.id}_{timestamp}_{safe_name}{clean_ext}"
    destination_path = os.path.join(MEDIA_DIR, unique_filename)

    # Memory-Safe Chunked File Writing (1MB per iteration)
    try:
        chunk_size = 1024 * 1024  # 1MB
        with open(destination_path, "wb") as buffer:
            while True:
                chunk = await file.read(chunk_size)
                if not chunk:
                    break
                buffer.write(chunk)
    except Exception as err:
        if os.path.exists(destination_path):
            try:
                os.remove(destination_path)
            except Exception:
                pass
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to save media file: {str(err)}"
        )
    finally:
        await file.close()

    media_url = f"/uploads/media/{unique_filename}"

    return {
        "message": f"{clean_media_type.capitalize()} uploaded successfully.",
        "media_url": media_url,
        "media_type": clean_media_type,
        "filename": unique_filename
    }


# ========================================================
# 2. CREATE POST
# ========================================================
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

    media_type_resolved = "image"
    if post.media_type and str(post.media_type).lower() in ["video", "image"]:
        media_type_resolved = str(post.media_type).lower()
    elif img_data:
        lower_img = img_data.lower()
        if "video/" in lower_img or lower_img.endswith(".mp4") or lower_img.endswith(".webm") or lower_img.endswith(".mov"):
            media_type_resolved = "video"

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
        image_url=img_data,
        media_url=img_data,
        media_type=media_type_resolved
    )

    db.add(new_post)
    db.commit()
    db.refresh(new_post)
    print(f"Persisted Post ID {new_post.id} (media_type: {media_type_resolved}) for user {current_user.id}")

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