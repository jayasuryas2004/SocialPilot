from sqlalchemy import Column, Integer, String, Float, Date, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base


class Campaign(Base):
    """
    Database model representing marketing campaigns with cascading post relationships.
    """
    __tablename__ = "campaigns"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=True)
    campaign_name = Column(String, nullable=False)
    subtitle = Column(String, nullable=True)
    description = Column(String, nullable=True)
    platform = Column(String, nullable=False)
    start_date = Column(Date, nullable=True)
    end_date = Column(Date, nullable=True)
    status = Column(String, default="Active", nullable=True)
    objective = Column(String, default="Awareness", nullable=True)
    budget = Column(Float, default=0.0, nullable=True)

    # Relationships
    user = relationship("User", back_populates="campaigns")
    posts = relationship(
        "Post",
        back_populates="campaign",
        cascade="all, delete-orphan"
    )