from sqlalchemy import Column, Integer, String, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base


class User(Base):
    """
    Database model representing registered application users with full cascading relationships.
    """
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    first_name = Column(String, nullable=True)
    last_name = Column(String, nullable=True)
    username = Column(String, nullable=True)
    email = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)
    role = Column(String, default="creator")
    avatar_url = Column(String, nullable=True)
    theme = Column(String, default="System", nullable=True)
    language = Column(String, default="English", nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Cascading relationships: deleting a User automatically removes their associated resources
    posts = relationship(
        "Post",
        back_populates="user",
        cascade="all, delete-orphan"
    )
    campaigns = relationship(
        "Campaign",
        back_populates="user",
        cascade="all, delete-orphan"
    )
    social_accounts = relationship(
        "SocialAccount",
        back_populates="user",
        cascade="all, delete-orphan"
    )
    notifications = relationship(
        "Notification",
        back_populates="user",
        cascade="all, delete-orphan"
    )
    scheduled_posts = relationship(
        "ScheduledPost",
        back_populates="user",
        cascade="all, delete-orphan"
    )
