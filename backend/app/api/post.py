from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from database import SessionLocal
from models.post import Post
from schemas.post import PostCreate

router = APIRouter(prefix="/posts", tags=["Posts"])


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# CREATE POST
@router.post("/")
def create_post(post: PostCreate, db: Session = Depends(get_db)):
    new_post = Post(
        title=post.title,
        content=post.content,
        platform=post.platform,
        schedule_time=post.schedule_time,
        status="Pending"
    )

    db.add(new_post)
    db.commit()
    db.refresh(new_post)

    return {
        "message": "Post created successfully",
        "post": new_post
    }
@router.get("/")
def get_posts(db: Session = Depends(get_db)):
    posts = db.query(Post).all()
    return posts


# GET ALL POSTS
@router.get("/")
def get_posts(db: Session = Depends(get_db)):
    posts = db.query(Post).all()
    return posts


# UPDATE POST
@router.put("/{post_id}")
def update_post(post_id: int, post: PostCreate, db: Session = Depends(get_db)):
    db_post = db.query(Post).filter(Post.id == post_id).first()

    if not db_post:
        return {"message": "Post not found"}

    db_post.title = post.title
    db_post.content = post.content
    db_post.platform = post.platform
    db_post.schedule_time = post.schedule_time

    db.commit()
    db.refresh(db_post)

    return {
        "message": "Post updated successfully",
        "post": db_post
    }


# DELETE POST
@router.delete("/{post_id}")
def delete_post(post_id: int, db: Session = Depends(get_db)):
    db_post = db.query(Post).filter(Post.id == post_id).first()

    if not db_post:
        return {"message": "Post not found"}

    db.delete(db_post)
    db.commit()

    return {
        "message": "Post deleted successfully"
    }