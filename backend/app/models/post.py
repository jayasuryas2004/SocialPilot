from sqlalchemy import Column, Integer, String, Date, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base
from app.models.campaign import Campaign


class Post(Base):
    __tablename__ = "posts"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=True)
    content = Column(String, nullable=False)
    platforms = Column(String, nullable=True)
    platform = Column(String, nullable=True)
    scheduled_date = Column(Date, nullable=True)
    scheduled_time = Column(String, nullable=True)
    scheduled_at = Column(DateTime, nullable=True)
    status = Column(String, default="Scheduled", nullable=True)
    image_url = Column(String, nullable=True)

    campaign_id = Column(Integer, ForeignKey("campaigns.id"), nullable=True)
    campaign = relationship("Campaign", back_populates="posts")