from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, DateTime,Date, Text, Float
from sqlalchemy.orm import relationship, sessionmaker
from sqlalchemy import create_engine
from datetime import datetime, UTC
from database import Base

DATABASE_URL = "postgresql+psycopg2://postgres:YOUR_PASSWORD@localhost:5432/DB_NAME"

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


class User(Base):
    __tablename__ = "users"

    # Core Columns & Authentication Fields
    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    username = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    role = Column(String, default="user")           # e.g., 'admin', 'user'
    is_active = Column(Boolean, default=True)

    # Relationships to other tables
    social_accounts = relationship("SocialAccount", back_populates="user", cascade="all, delete-orphan")
    campaigns = relationship("Campaign", back_populates="user", cascade="all, delete-orphan")
    posts = relationship("Post", back_populates="user", cascade="all, delete-orphan")


class SocialAccount(Base):
    __tablename__ = "social_accounts"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    platform_name = Column(String, nullable=False)
    profile_name = Column(String, nullable=False)
    access_token=Column(String,nullable=True)
    refresh_token=Column(String,nullable=True)
    token_expiry=Column(DateTime,nullable=True)
    is_active=Column(Boolean,default=True)   

    # Relationship back to User
    user = relationship("User", back_populates="social_accounts")


class Campaign(Base):
    __tablename__ = "campaigns"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    campaign_name = Column(String, nullable=False)
    status=Column(String(20),default="Active")
    start_date = Column(DateTime, nullable=True)
    end_date = Column(DateTime, nullable=True)
    budget=Column(Float,default=0.0)
    objective=Column(String(255),nullable=True)
    # Relationships
    user = relationship("User", back_populates="campaigns")
    posts = relationship("Post", back_populates="campaign")
    audience_analytics = relationship("AudienceAnalytics",back_populates="campaign",cascade="all, delete-orphan")
    reports = relationship("CampaignReport",back_populates="campaign",cascade="all, delete-orphan")
    roi_reports = relationship("ROIReport",back_populates="campaign",cascade="all, delete-orphan")

class Post(Base):
    __tablename__ = "posts"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    campaign_id = Column(Integer, ForeignKey("campaigns.id", ondelete="SET NULL"), nullable=True)
    content_text = Column(Text, nullable=False)  
    scheduled_at = Column(DateTime, nullable=True)
    published_at = Column(DateTime, nullable=True)
    status = Column(String(20),default="Draft")
    is_draft = Column(Boolean,default=True)
    is_recurring = Column(Boolean,default=False)
    recurring_type = Column(String(20),nullable=True)
    queue_position = Column(Integer,nullable=True)
    retry_count = Column(Integer,default=0)
    platform_post_id = Column(String(255),nullable=True)

    user = relationship("User", back_populates="posts")
    campaign = relationship("Campaign", back_populates="posts")
    logs = relationship("PublishingLog", back_populates="post", cascade="all, delete-orphan")
    publishing_queue=relationship("PublishingQueue",back_populates="post", cascade="all, delete-orphan")


class PublishingLog(Base):
    __tablename__ = "publishing_logs"

    id = Column(Integer, primary_key=True, index=True)
    post_id = Column(Integer, ForeignKey("posts.id", ondelete="CASCADE"), nullable=False)
    campaign_id = Column(Integer, ForeignKey("campaigns.id", ondelete="SET NULL"), nullable=True)
    published_at = Column(DateTime, default=datetime.now(UTC), nullable=False)
    status = Column(String, nullable=False)  
    response_message=Column(String,nullable=True)
    error_message = Column(String, nullable=True)  
    platform = Column(String, nullable=False)  
    platform_post_id=Column(String(255),nullable=True)

    post = relationship("Post", back_populates="logs")

class PublishingQueue(Base):
    __tablename__="publishing_queue"
    id=Column(Integer,primary_key=True,index=True)
    post_id=Column(Integer,ForeignKey("posts.id", ondelete="CASCADE"),nullable=False)
    priority=Column(Integer,default=1)
    scheduled_at=Column(DateTime,nullable=False)
    status=Column(String(20),default="Pending")
    attempts=Column(Integer,default=0)
    created_at=Column(DateTime,default=datetime.now(UTC))
    updated_at=Column(DateTime,default=datetime.now(UTC),onupdate=datetime.utcnow)

    post=relationship("Post",back_populates="publishing_queue")


class Analytics(Base):
    __tablename__ = "analytics"

    id = Column(Integer, primary_key=True, index=True)

    post_id = Column(
        Integer,
        ForeignKey("posts.id", ondelete="CASCADE"),
        nullable=False
    )

    campaign_id = Column(
        Integer,
        ForeignKey("campaigns.id", ondelete="SET NULL"),
        nullable=True
    )

    likes = Column(Integer, default=0)
    comments = Column(Integer, default=0)
    shares = Column(Integer, default=0)

    impressions = Column(Integer, default=0)
    reach = Column(Integer, default=0)

    clicks = Column(Integer, default=0)

    engagement_rate = Column(Float, default=0.0)

    created_at = Column(DateTime, default=datetime.now(UTC))

    post = relationship("Post")
    campaign = relationship("Campaign")

class AudienceAnalytics(Base):
    __tablename__ = "audience_analytics"

    id = Column(Integer, primary_key=True, index=True)

    campaign_id = Column(
        Integer,
        ForeignKey("campaigns.id", ondelete="CASCADE"),
        nullable=False
    )

    followers = Column(Integer, default=0)

    new_followers = Column(Integer, default=0)

    unfollowers = Column(Integer, default=0)

    profile_visits = Column(Integer, default=0)

    country = Column(String(100), nullable=True)

    city = Column(String(100), nullable=True)

    recorded_at = Column(DateTime, default=datetime.now(UTC))

    campaign = relationship("Campaign")
    campaign = relationship("Campaign",back_populates="audience_analytics")

class CampaignReport(Base):
    __tablename__ = "campaign_reports"

    id = Column(Integer, primary_key=True, index=True)
    campaign_id = Column(Integer,ForeignKey("campaigns.id", ondelete="CASCADE"),nullable=False)
    report_name = Column(String(150), nullable=False)
    report_type = Column(String(50),nullable=False)
    generated_at = Column(DateTime,default=datetime.now(UTC))
    file_path = Column(String(255),nullable=True)
    campaign = relationship("Campaign",back_populates="reports")

class ROIReport(Base):
    __tablename__ = "roi_reports"

    id = Column(Integer, primary_key=True, index=True)

    campaign_id = Column(
        Integer,
        ForeignKey("campaigns.id", ondelete="CASCADE"),
        nullable=False
    )

    budget = Column(Float, nullable=False)

    revenue = Column(Float, default=0.0)

    roi_percentage = Column(Float, default=0.0)

    generated_at = Column(
        DateTime,
        default=datetime.now(UTC)
    )

    campaign = relationship(
        "Campaign",
        back_populates="roi_reports"
    )

def init_db():
    """Compiles and builds all structure blueprints directly onto the live PostgreSQL server instance."""
    Base.metadata.create_all(bind=engine)

if __name__ == "__main__":
    print("Initializing database tables...")
    init_db()
    print("Database tables created successfully!")