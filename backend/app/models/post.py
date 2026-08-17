from sqlalchemy import Column, Integer, String, Text, Date, DateTime, ForeignKey, Index
from sqlalchemy.orm import relationship
from app.database import Base


class Post(Base):
    """
    Database model representing scheduled, published, and drafted posts with composite indexing.
    """
    __tablename__ = "posts"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=True)
    campaign_id = Column(Integer, ForeignKey("campaigns.id", ondelete="CASCADE"), nullable=True)

    title = Column(String, nullable=True)
    content = Column(Text, nullable=False)
    platforms = Column(String, nullable=True)
    platform = Column(String, nullable=True)
    scheduled_date = Column(Date, nullable=True)
    scheduled_time = Column(String, nullable=True)
    scheduled_at = Column(DateTime, nullable=True)
    status = Column(String, default="Scheduled", nullable=True)
    image_url = Column(Text, nullable=True)
    linkedin_urn = Column(String, nullable=True)

    # Relationships
    user = relationship("User", back_populates="posts")
    campaign = relationship("Campaign", back_populates="posts")

    # Composite Index for optimized scheduler polling
    __table_args__ = (
        Index("idx_posts_status_scheduled", "status", "scheduled_at"),
    )