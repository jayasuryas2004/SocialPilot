from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from database import get_db
from models.post import Post
from schemas.post import PostCreate

router = APIRouter()


# CREATE
@router.post("/schedule")
def create_schedule(post: PostCreate, db: Session = Depends(get_db)):
    new_post = Post(
        title=post.title,
        content=post.content,
        platform=post.platform,
        schedule_time=post.schedule_time
    )

    db.add(new_post)
    db.commit()
    db.refresh(new_post)

    return {
        "message": "Post scheduled successfully",
        "data": new_post
    }


# READ
@router.get("/schedule")
def get_schedules(db: Session = Depends(get_db)):
    posts = db.query(Post).all()
    return {
        "data": posts
    }


# UPDATE
@router.put("/schedule/{id}")
def update_schedule(id: int, updated_post: PostCreate, db: Session = Depends(get_db)):
    post = db.query(Post).filter(Post.id == id).first()

    if not post:
        return {"error": "Post not found"}

    post.title = updated_post.title
    post.content = updated_post.content
    post.platform = updated_post.platform
    post.schedule_time = updated_post.schedule_time

    db.commit()
    db.refresh(post)

    return {
        "message": "Post updated successfully",
        "data": post
    }


# DELETE
@router.delete("/schedule/{id}")
def delete_schedule(id: int, db: Session = Depends(get_db)):
    post = db.query(Post).filter(Post.id == id).first()

    if not post:
        return {"error": "Post not found"}

    db.delete(post)
    db.commit()

    return {
        "message": "Post deleted successfully"
    }