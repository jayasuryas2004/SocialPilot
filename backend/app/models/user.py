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
    email = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)
    role = Column(String, default="creator")
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
