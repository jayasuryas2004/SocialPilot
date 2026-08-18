from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base


class ScheduledPost(Base):
    """
    SQLAlchemy model representing scheduled social media posts pending execution by the background scheduler.
    """
    __tablename__ = "scheduled_posts"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=True)
    content = Column(Text, nullable=False)
    platforms = Column(String, nullable=False, default="facebook,linkedin")
    media_url = Column(String, nullable=True)
    media_type = Column(String, nullable=True, default="image")
    scheduled_for = Column(DateTime, nullable=False)
    status = Column(String, nullable=False, default="pending")  # pending, processing, published, failed
    result_detail = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Optional relationship
    user = relationship("User", back_populates="scheduled_posts", foreign_keys=[user_id])
