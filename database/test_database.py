from datetime import datetime, UTC

from database import SessionLocal

from crud import *

from schemas import (
    PublishingQueueCreate,
    PublishingLogCreate,
    AnalyticsCreate,
    AudienceAnalyticsCreate,
    CampaignReportCreate,
    ROIReportCreate
)

db = SessionLocal()

print("=" * 60)
print("DATABASE CRUD TESTING")
print("=" * 60)

# ==========================================================
# USER TEST
# ==========================================================

print("\nUSER TEST")

user = create_user(
    full_name="Jaya Ram",
    email="jayaram_test01@gmail.com",
    username="jayaram_test01",
    plain_password="123456"
)

print("Created User:", user.id)

# ==========================================================
# CAMPAIGN TEST
# ==========================================================

print("\nCAMPAIGN TEST")

campaign = create_campaign(
    user_id=user.id,
    campaign_name="Instagram Campaign",
    start_date=datetime(2026,7,1),
    end_date=datetime(2026,7,31)
)

print("Created Campaign:", campaign.id)

# ==========================================================
# POST TEST
# ==========================================================

print("\nPOST TEST")

post = create_post(
    user_id=user.id,
    campaign_id=campaign.id,
    content_text="Hello Social Media Scheduler!"
)

print("Created Post:", post.id)

# ==========================================================
# PUBLISHING QUEUE TEST
# ==========================================================

print("\nPUBLISHING QUEUE TEST")

queue = PublishingQueueCreate(
    post_id=post.id,
    priority=1,
    scheduled_at=datetime.now(UTC),
    status="Pending",
    attempts=0,
    
)

queue_data = create_queue(db, queue)

print("Queue Created:", queue_data.id)

# ==========================================================
# PUBLISHING LOG TEST
# ==========================================================

print("\nPUBLISHING LOG TEST")

log = PublishingLogCreate(
    post_id=post.id,
    campaign_id=campaign.id,
    platform="Instagram",
    status="Success",
    response_message="Published Successfully",
    error_message=None,
    platform_post_id="IG001"
)

log_data = create_publishing_log(db, log)

print("Publishing Log:", log_data.id)

# ==========================================================
# ANALYTICS TEST
# ==========================================================

print("\nANALYTICS TEST")

analytics = AnalyticsCreate(
    post_id=post.id,
    campaign_id=campaign.id,
    likes=250,
    comments=40,
    shares=18,
    impressions=5000,
    reach=4200,
    clicks=300,
    engagement_rate=6.5
)

analytics_data = create_analytics(db, analytics)

print("Analytics:", analytics_data.id)

# ==========================================================
# AUDIENCE ANALYTICS TEST
# ==========================================================

print("\nAUDIENCE ANALYTICS TEST")

audience = AudienceAnalyticsCreate(
    campaign_id=campaign.id,
    followers=5000,
    new_followers=250,
    unfollowers=10,
    profile_visits=800,
    country="India",
    city="Hyderabad"
)

audience_data = create_audience_analytics(db, audience)

print("Audience Analytics:", audience_data.id)

# ==========================================================
# CAMPAIGN REPORT TEST
# ==========================================================

print("\nCAMPAIGN REPORT TEST")

report = CampaignReportCreate(
    campaign_id=campaign.id,
    report_name="July Performance Report",
    report_type="Performance",
    file_path="reports/july_report.pdf"
)

report_data = create_campaign_report(db, report)

print("Campaign Report:", report_data.id)

# ==========================================================
# ROI REPORT TEST
# ==========================================================

print("\nROI REPORT TEST")

roi = ROIReportCreate(
    campaign_id=campaign.id,
    budget=10000,
    revenue=18000,
    roi_percentage=80.0
)

roi_data = create_roi_report(db, roi)

print("ROI Report:", roi_data.id)

# ==========================================================
# READ TEST
# ==========================================================

print("\nREAD TEST")

print(get_user_by_username("jayaram_test01"))
print(get_campaign_by_id(campaign.id))
print(get_post_by_id(post.id))
print(get_queue(db, queue_data.id))
print(get_publishing_log(db, log_data.id))
print(get_analytics(db, analytics_data.id))
print(get_audience_analytics(db, audience_data.id))
print(get_campaign_report(db, report_data.id))
print(get_roi_report(db, roi_data.id))

# ==========================================================
# UPDATE TEST
# ==========================================================

print("\nUPDATE TEST")

update_post(
    post.id,
    content_text="Updated Social Media Post"
)

print(get_post_by_id(post.id))

# ==========================================================
# DELETE TEST
# ==========================================================

print("\nDELETE TEST")

delete_post(post.id)

print(get_post_by_id(post.id))

db.close()

print("\n")
print("=" * 60)
print("ALL DATABASE TESTS COMPLETED")
print("=" * 60)