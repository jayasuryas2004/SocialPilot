from sqlalchemy import Column, Integer, String, DateTime, Boolean, ForeignKey, Index
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base


class Notification(Base):
    """
    Database model representing workspace and activity notifications with creation timestamp indexing.
    """
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=True)
    title = Column(String, nullable=True)
    message = Column(String, nullable=False)
    type = Column(String, nullable=True, default="system")
    category = Column(String, nullable=True, default="system")
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="notifications")

    # Index for fast chronologically sorted retrieval
    __table_args__ = (
        Index("idx_notifications_created", created_at.desc()),
    )