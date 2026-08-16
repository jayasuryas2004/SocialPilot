from models import SessionLocal, PublishingLog,Campaign, Post, PublishingQueue
from passlib.context import CryptContext
from models import User, SessionLocal
from datetime import datetime
from database import SessionLocal
from sqlalchemy.orm import Session
from schemas import PublishingQueueCreate, PublishingQueueUpdate, PublishingLogCreate, PublishingLogUpdate
from models import Analytics
from schemas import AnalyticsCreate, AnalyticsUpdate
from models import AudienceAnalytics
from schemas import AudienceAnalyticsCreate, AudienceAnalyticsUpdate
from models import CampaignReport
from schemas import CampaignReportCreate, CampaignReportUpdate
from models import ROIReport
from schemas import ROIReportCreate, ROIReportUpdate

def create_campaign(user_id, campaign_name, start_date=None, end_date=None):
    """Creates and saves a new marketing campaign."""
    session = SessionLocal()
    try:
        new_campaign = Campaign(
            user_id=user_id,
            campaign_name=campaign_name,
            start_date=start_date,
            end_date=end_date
        )
        session.add(new_campaign)
        session.commit()
        session.refresh(new_campaign)
        return new_campaign
    finally:
        session.close()

def get_campaign_by_id(campaign_id):
    """Reads/Fetches a specific campaign using its ID."""
    session = SessionLocal()
    try:
        return session.query(Campaign).filter(Campaign.id == campaign_id).first()
    finally:
        session.close()

def get_all_campaigns():
    """Fetch all campaigns."""
    session = SessionLocal()
    try:
        return session.query(Campaign).all()
    finally:
        session.close()


def update_campaign(campaign_id: int, **kwargs):
    """Update campaign details."""
    session = SessionLocal()
    try:
        campaign = session.query(Campaign).filter(Campaign.id == campaign_id).first()

        if not campaign:
            return None

        for key, value in kwargs.items():
            if hasattr(campaign, key):
                setattr(campaign, key, value)

        session.commit()
        session.refresh(campaign)
        return campaign

    finally:
        session.close()

def update_campaign_name(campaign_id, new_name):
    """Updates the campaign_name of an existing campaign."""
    session = SessionLocal()
    try:
        campaign = session.query(Campaign).filter(Campaign.id == campaign_id).first()
        if campaign:
            campaign.campaign_name = new_name
            session.commit()
            session.refresh(campaign)
        return campaign
    finally:
        session.close()

def delete_campaign(campaign_id):
    """Deletes a campaign from the database."""
    session = SessionLocal()
    try:
        campaign = session.query(Campaign).filter(Campaign.id == campaign_id).first()
        if campaign:
            session.delete(campaign)
            session.commit()
            return True
        return False
    finally:
        session.close()


def create_post(user_id, content_text, status="Draft", campaign_id=None):
    """Schedules a new social media post."""
    session = SessionLocal()
    try:
        new_post = Post(
            user_id=user_id,
            campaign_id=campaign_id,
            content_text=content_text,
            status=status
        )
        session.add(new_post)
        session.commit()
        session.refresh(new_post)
        return new_post
    finally:
        session.close()

def get_posts_by_user(user_id):
    """Reads/Fetches all posts written by a specific user."""
    session = SessionLocal()
    try:
        return session.query(Post).filter(Post.user_id == user_id).all()
    finally:
        session.close()

def get_post_by_id(post_id: int):
    """Fetch a post by ID."""
    session = SessionLocal()
    try:
        return session.query(Post).filter(Post.id == post_id).first()
    finally:
        session.close()


def get_all_posts():
    """Fetch all posts."""
    session = SessionLocal()
    try:
        return session.query(Post).all()
    finally:
        session.close()


def update_post(post_id: int, content_text: str):
    """Update a post's content."""
    session = SessionLocal()
    try:
        post = session.query(Post).filter(Post.id == post_id).first()

        if not post:
            return None

        post.content_text = content_text

        session.commit()
        session.refresh(post)

        return post

    finally:
        session.close()

def delete_post(post_id: int):
    """Delete a post."""
    session = SessionLocal()
    try:
        post = session.query(Post).filter(Post.id == post_id).first()

        if post:
            session.delete(post)
            session.commit()
            return True

        return False

    finally:
        session.close()

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def get_password_hash(password: str) -> str:
    """Converts plain text passwords into a secure random string."""
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Checks if the typed password matches the secure string in the database."""
    return pwd_context.verify(plain_password, hashed_password)

def create_user(full_name, email, username, plain_password):
    """Hashes the password and registers a new user in PostgreSQL."""
    session = SessionLocal()
    try:
        # 1. Scramble the password before saving
        hashed_pw = get_password_hash(plain_password)
        
        new_user = User(
            full_name=full_name,
            email=email,
            username=username,
            hashed_password=hashed_pw
        )
        session.add(new_user)
        session.commit()
        session.refresh(new_user)
        return new_user
    finally:
        session.close()

def get_user_by_username(username: str):
    """Finds a user by their username to check if they exist."""
    session = SessionLocal()
    try:
        return session.query(User).filter(User.username == username).first()
    finally:
        session.close()
def get_user_by_id(user_id: int):
    """Fetch a user by ID."""
    session = SessionLocal()
    try:
        return session.query(User).filter(User.id == user_id).first()
    finally:
        session.close()


def get_all_users():
    """Fetch all users."""
    session = SessionLocal()
    try:
        return session.query(User).all()
    finally:
        session.close()


def update_user(user_id: int, **kwargs):
    """Update user details."""
    session = SessionLocal()
    try:
        user = session.query(User).filter(User.id == user_id).first()

        if not user:
            return None

        for key, value in kwargs.items():
            if hasattr(user, key):
                setattr(user, key, value)

        session.commit()
        session.refresh(user)
        return user

    finally:
        session.close()


def delete_user(user_id: int):
    """Delete a user."""
    session = SessionLocal()
    try:
        user = session.query(User).filter(User.id == user_id).first()

        if user:
            session.delete(user)
            session.commit()
            return True

        return False

    finally:
        session.close()

from models import PublishingLog, SessionLocal
from datetime import datetime


def get_logs_for_post(post_id: int):
    """Retrieves the entire history of publishing attempts for a specific post."""
    session = SessionLocal()
    try:
        return session.query(PublishingLog).filter(PublishingLog.post_id == post_id).all()
    finally:
        session.close()

def get_logs_for_campaign(campaign_id: int):
    """Retrieves all tracking logs tied to a specific marketing campaign."""
    session = SessionLocal()
    try:
        return session.query(PublishingLog).filter(PublishingLog.campaign_id == campaign_id).all()
    finally:
        session.close()

def create_queue(db:Session,queue:PublishingQueueCreate):
    db_queue=PublishingQueue(**queue.model_dump())
    db.add(db_queue)
    db.commit()
    db.refresh(db_queue)

    return db_queue

def get_queue(db:Session,queue_id:int):
    return (db.query(PublishingQueue).filter(PublishingQueue.id==queue_id).first())

def update_queue(db:Session,queue_id:int,queue:PublishingQueueUpdate):
    db_queue=get_queue(db,queue_id)
    if not db_queue:
        return None
    for key,value in queue.model_dump(exclude_unset=True).items():
        setattr(db_queue,key,value)
        db.commit()
        db.refresh(db_queue)
    return db_queue

def delete_queue(db:Session,queue_id:int):
    db_queue=get_queue(db,queue_id)
    if not db_queue:
        return None
    db.delete(db_queue)
    db.commit()
    return db_queue

def create_publishing_log(db: Session, log: PublishingLogCreate):
    db_log = PublishingLog(**log.model_dump())

    db.add(db_log)
    db.commit()
    db.refresh(db_log)

    return db_log

def get_publishing_log(db: Session, log_id: int):
    return (
        db.query(PublishingLog)
        .filter(PublishingLog.id == log_id)
        .first()
    )

def get_all_publishing_logs(db: Session):
    return db.query(PublishingLog).all()

def update_publishing_log(
    db: Session,
    log_id: int,
    log: PublishingLogUpdate
):
    db_log = get_publishing_log(db, log_id)

    if not db_log:
        return None

    for key, value in log.model_dump(exclude_unset=True).items():
        setattr(db_log, key, value)

    db.commit()
    db.refresh(db_log)

    return db_log

def delete_publishing_log(db: Session, log_id: int):

    db_log = get_publishing_log(db, log_id)

    if not db_log:
        return None

    db.delete(db_log)
    db.commit()

    return db_log

# ==========================================================
# ANALYTICS CRUD
# ==========================================================

def create_analytics(db: Session, analytics: AnalyticsCreate):
    db_analytics = Analytics(**analytics.model_dump())

    db.add(db_analytics)
    db.commit()
    db.refresh(db_analytics)

    return db_analytics


def get_analytics(db: Session, analytics_id: int):
    return (
        db.query(Analytics)
        .filter(Analytics.id == analytics_id)
        .first()
    )


def get_all_analytics(db: Session):
    return db.query(Analytics).all()


def update_analytics(
    db: Session,
    analytics_id: int,
    analytics: AnalyticsUpdate
):
    db_analytics = get_analytics(db, analytics_id)

    if not db_analytics:
        return None

    for key, value in analytics.model_dump(exclude_unset=True).items():
        setattr(db_analytics, key, value)

    db.commit()
    db.refresh(db_analytics)

    return db_analytics


def delete_analytics(db: Session, analytics_id: int):

    db_analytics = get_analytics(db, analytics_id)

    if not db_analytics:
        return None

    db.delete(db_analytics)
    db.commit()

    return db_analytics
# ==========================================================
# AUDIENCE ANALYTICS CRUD
# ==========================================================

def create_audience_analytics(
    db: Session,
    audience: AudienceAnalyticsCreate
):
    db_audience = AudienceAnalytics(**audience.model_dump())

    db.add(db_audience)
    db.commit()
    db.refresh(db_audience)

    return db_audience


def get_audience_analytics(db: Session, audience_id: int):
    return (
        db.query(AudienceAnalytics)
        .filter(AudienceAnalytics.id == audience_id)
        .first()
    )


def get_all_audience_analytics(db: Session):
    return db.query(AudienceAnalytics).all()


def update_audience_analytics(
    db: Session,
    audience_id: int,
    audience: AudienceAnalyticsUpdate
):
    db_audience = get_audience_analytics(db, audience_id)

    if not db_audience:
        return None

    for key, value in audience.model_dump(exclude_unset=True).items():
        setattr(db_audience, key, value)

    db.commit()
    db.refresh(db_audience)

    return db_audience


def delete_audience_analytics(
    db: Session,
    audience_id: int
):
    db_audience = get_audience_analytics(db, audience_id)

    if not db_audience:
        return None

    db.delete(db_audience)
    db.commit()

    return db_audience
# ==========================================================
# CAMPAIGN REPORT CRUD
# ==========================================================

def create_campaign_report(
    db: Session,
    report: CampaignReportCreate
):
    db_report = CampaignReport(**report.model_dump())

    db.add(db_report)
    db.commit()
    db.refresh(db_report)

    return db_report


def get_campaign_report(db: Session, report_id: int):
    return (
        db.query(CampaignReport)
        .filter(CampaignReport.id == report_id)
        .first()
    )


def get_all_campaign_reports(db: Session):
    return db.query(CampaignReport).all()


def update_campaign_report(
    db: Session,
    report_id: int,
    report: CampaignReportUpdate
):
    db_report = get_campaign_report(db, report_id)

    if not db_report:
        return None

    for key, value in report.model_dump(exclude_unset=True).items():
        setattr(db_report, key, value)

    db.commit()
    db.refresh(db_report)

    return db_report


def delete_campaign_report(
    db: Session,
    report_id: int
):
    db_report = get_campaign_report(db, report_id)

    if not db_report:
        return None

    db.delete(db_report)
    db.commit()

    return db_report
# ==========================================================
# ROI REPORT CRUD
# ==========================================================

def create_roi_report(
    db: Session,
    roi: ROIReportCreate
):
    db_roi = ROIReport(**roi.model_dump())

    db.add(db_roi)
    db.commit()
    db.refresh(db_roi)

    return db_roi


def get_roi_report(db: Session, roi_id: int):
    return (
        db.query(ROIReport)
        .filter(ROIReport.id == roi_id)
        .first()
    )


def get_all_roi_reports(db: Session):
    return db.query(ROIReport).all()


def update_roi_report(
    db: Session,
    roi_id: int,
    roi: ROIReportUpdate
):
    db_roi = get_roi_report(db, roi_id)

    if not db_roi:
        return None

    for key, value in roi.model_dump(exclude_unset=True).items():
        setattr(db_roi, key, value)

    db.commit()
    db.refresh(db_roi)

    return db_roi


def delete_roi_report(
    db: Session,
    roi_id: int
):
    db_roi = get_roi_report(db, roi_id)

    if not db_roi:
        return None

    db.delete(db_roi)
    db.commit()

    return db_roi