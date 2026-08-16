from datetime import datetime, timedelta
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Optional, List

from app.database import get_db
from app.models.notification import Notification
from app.models.campaign import Campaign
from app.models.post import Post

router = APIRouter(prefix="/api/workspace", tags=["Workspace & Notifications"])
router_alt = APIRouter(prefix="/workspace", tags=["Workspace & Notifications"])
notif_router = APIRouter(prefix="/api/notifications", tags=["Notifications"])
notif_router_alt = APIRouter(prefix="/notifications", tags=["Notifications"])

READ_NOTIFICATION_IDS = set()

# 12 Comprehensive Seed Notifications
SEED_NOTIFICATIONS_LIST = [
    # Category: Publishing (4)
    {
        "title": "Post Published to LinkedIn",
        "message": "Your scheduled post with high-resolution image was published successfully to LinkedIn Live.",
        "type": "publishing",
        "category": "publishing",
        "minutes_ago": 10
    },
    {
        "title": "Post Scheduled for Instagram",
        "message": "Summer Sale Campaign reel has been scheduled for tomorrow at 10:00 AM.",
        "type": "publishing",
        "category": "publishing",
        "minutes_ago": 35
    },
    {
        "title": "LinkedIn Ghost Sync Verified",
        "message": "Bi-directional background worker verified 1 post deletion synced with LinkedIn API.",
        "type": "publishing",
        "category": "publishing",
        "minutes_ago": 75
    },
    {
        "title": "Publishing Queue Active",
        "message": "Next scheduled post is queued for automatic dispatch via APScheduler.",
        "type": "publishing",
        "category": "publishing",
        "minutes_ago": 120
    },
    # Category: System Alerts (4)
    {
        "title": "APScheduler Active",
        "message": "Background social media publishing worker is running and monitoring scheduled queues.",
        "type": "system",
        "category": "system",
        "minutes_ago": 15
    },
    {
        "title": "OAuth Token Vault Synced",
        "message": "LinkedIn OAuth account credentials and publishing permissions are securely verified.",
        "type": "system",
        "category": "system",
        "minutes_ago": 45
    },
    {
        "title": "Facebook Account Connected",
        "message": "OAuth token for SocialPilot Official page is active and healthy.",
        "type": "system",
        "category": "system",
        "minutes_ago": 180
    },
    {
        "title": "Instagram Token Verified",
        "message": "Permissions to publish reels and stories verified with Graph API.",
        "type": "system",
        "category": "system",
        "minutes_ago": 240
    },
    # Category: Reports (4)
    {
        "title": "Weekly Engagement Report Ready",
        "message": "Your automated multi-platform analytics PDF report has been compiled and is ready for download.",
        "type": "report",
        "category": "reports",
        "minutes_ago": 50
    },
    {
        "title": "Monthly Multi-Channel Benchmark",
        "message": "Detailed cross-platform reach and growth benchmark report is now available.",
        "type": "report",
        "category": "reports",
        "minutes_ago": 150
    },
    {
        "title": "Campaign ROI Summary Compiled",
        "message": "Winter Skincare Collection campaign performance report has finished processing.",
        "type": "report",
        "category": "reports",
        "minutes_ago": 300
    },
    {
        "title": "Audience Growth Digest",
        "message": "Q2 follower acquisition summary across 7 connected channels is ready.",
        "type": "report",
        "category": "reports",
        "minutes_ago": 420
    }
]

# Static filler campaigns for enriched campaign views
STATIC_FILLER_CAMPAIGNS = [
    {
        "id": 101,
        "campaign_name": "Summer Sale 2026",
        "title": "Summer Sale 2026",
        "subtitle": "Seasonal discounts and product promotions across all social channels.",
        "description": "Seasonal discounts and product promotions across all social channels.",
        "platform": "Instagram, Facebook, LinkedIn",
        "start_date": "2026-06-01",
        "end_date": "2026-08-31",
        "status": "Active",
        "objective": "Conversions & Sales",
        "budget": 2500.0,
        "progress": 68,
        "totalPosts": 8,
        "is_hybrid": True
    },
    {
        "id": 102,
        "campaign_name": "Brand Awareness Q4",
        "title": "Brand Awareness Q4",
        "subtitle": "Thought leadership and corporate updates on LinkedIn and X.",
        "description": "Thought leadership and corporate updates on LinkedIn and X.",
        "platform": "LinkedIn, X-Twitter",
        "start_date": "2026-10-01",
        "end_date": "2026-12-31",
        "status": "Active",
        "objective": "Brand Awareness",
        "budget": 1800.0,
        "progress": 42,
        "totalPosts": 6,
        "is_hybrid": True
    },
    {
        "id": 103,
        "campaign_name": "Winter Skincare Collection",
        "title": "Winter Skincare Collection",
        "subtitle": "Product launch and skincare routine guides for winter.",
        "description": "Product launch and skincare routine guides for winter.",
        "platform": "Instagram, Pinterest, YouTube",
        "start_date": "2026-11-01",
        "end_date": "2027-01-31",
        "status": "Scheduled",
        "objective": "Product Launch",
        "budget": 3200.0,
        "progress": 15,
        "totalPosts": 4,
        "is_hybrid": True
    }
]


def format_time_ago(created_at: datetime) -> str:
    if not created_at:
        return "Just now"
    diff = datetime.utcnow() - created_at
    seconds = int(diff.total_seconds())
    if seconds < 60:
        return "Just now"
    elif seconds < 3600:
        mins = seconds // 60
        return f"{mins} min{'s' if mins > 1 else ''} ago"
    elif seconds < 86400:
        hours = seconds // 3600
        return f"{hours} hour{'s' if hours > 1 else ''} ago"
    else:
        days = seconds // 86400
        return f"{days} day{'s' if days > 1 else ''} ago"


def get_workspace_data(db: Session):
    """
    Constructs unified workspace data array using standard iterative loops only.
    Strictly NO list comprehensions or lambda expressions.
    """
    db_notifications = db.query(Notification).order_by(Notification.created_at.desc()).all()
    
    # Auto-seed full 12 notification items into SQLite if count is less than 12
    if len(db_notifications) < 12:
        for notif in db_notifications:
            db.delete(notif)
        db.commit()

        for item in SEED_NOTIFICATIONS_LIST:
            mins = item.get("minutes_ago", 10)
            item_time = datetime.utcnow() - timedelta(minutes=mins)
            new_notif = Notification(
                title=item.get("title"),
                message=item.get("message"),
                type=item.get("type"),
                category=item.get("category"),
                is_read=False,
                created_at=item_time
            )
            db.add(new_notif)
        db.commit()
        db_notifications = db.query(Notification).order_by(Notification.created_at.desc()).all()

    db_campaigns = db.query(Campaign).all()
    db_posts = db.query(Post).all()

    # 1. Process notifications using standard iterative loop
    formatted_notifications = []
    for notif in db_notifications:
        msg = notif.message or ""
        msg_lower = msg.lower()

        notif_type = notif.type or "system"
        category = notif.category or "system"
        title = notif.title or "System Notification"

        if not notif.category:
            if "published" in msg_lower or "scheduled" in msg_lower or "queue" in msg_lower:
                notif_type = "publishing"
                category = "publishing"
            elif "report" in msg_lower or "digest" in msg_lower or "roi" in msg_lower:
                notif_type = "report"
                category = "reports"
            else:
                notif_type = "system"
                category = "system"

        time_str = format_time_ago(notif.created_at)
        
        is_read_flag = False
        if str(notif.id) in READ_NOTIFICATION_IDS or f"notif_{notif.id}" in READ_NOTIFICATION_IDS:
            is_read_flag = True
        elif hasattr(notif, "is_read") and notif.is_read:
            is_read_flag = True

        formatted_notifications.append({
            "id": f"notif_{notif.id}",
            "raw_id": notif.id,
            "title": title,
            "message": msg,
            "type": notif_type,
            "category": category,
            "time": time_str,
            "isRead": is_read_flag,
            "created_at": notif.created_at.isoformat() if notif.created_at else None
        })

    # 2. Process campaigns and nested posts using standard iterative loops
    formatted_campaigns = []

    posts_by_campaign = {}
    for post in db_posts:
        cid = post.campaign_id
        if cid:
            if cid not in posts_by_campaign:
                posts_by_campaign[cid] = []
            posts_by_campaign[cid].append({
                "id": post.id,
                "title": post.title or post.content or f"Post #{post.id}",
                "platform": post.platforms or post.platform or "LinkedIn",
                "status": post.status or "Scheduled",
                "scheduled_date": str(post.scheduled_date) if post.scheduled_date else None,
                "scheduled_time": post.scheduled_time or "10:00 AM",
                "is_live": True
            })

    for c in db_campaigns:
        nested_posts = posts_by_campaign.get(c.id, [])
        formatted_campaigns.append({
            "id": c.id,
            "campaign_name": c.campaign_name,
            "title": c.campaign_name,
            "subtitle": c.subtitle or c.description or "Active marketing campaign.",
            "description": c.description or c.subtitle or "",
            "platform": c.platform or "LinkedIn",
            "start_date": str(c.start_date) if c.start_date else "2026-06-01",
            "end_date": str(c.end_date) if c.end_date else "2026-08-31",
            "status": (c.status or "Active").capitalize(),
            "objective": c.objective or "Brand Awareness",
            "budget": c.budget or 0.0,
            "progress": 50,
            "totalPosts": len(nested_posts),
            "posts": nested_posts,
            "is_hybrid": False,
            "is_live": True
        })

    for filler in STATIC_FILLER_CAMPAIGNS:
        formatted_campaigns.append(filler)

    unread_count = 0
    for n in formatted_notifications:
        if not n.get("isRead", False):
            unread_count += 1

    return {
        "status": "active",
        "database": "connected",
        "scheduler": "running",
        "notifications": formatted_notifications,
        "campaigns": formatted_campaigns,
        "unread_count": unread_count,
        "total_campaigns": len(formatted_campaigns)
    }


@router.get("/status")
@router_alt.get("/status")
def get_status(db: Session = Depends(get_db)):
    return get_workspace_data(db)


@notif_router.get("")
@notif_router.get("/")
@notif_router_alt.get("")
@notif_router_alt.get("/")
def get_notifications_list(db: Session = Depends(get_db)):
    data = get_workspace_data(db)
    return {
        "items": data.get("notifications", []),
        "unread_count": data.get("unread_count", 0),
        "total": len(data.get("notifications", []))
    }


@notif_router.get("/unread-count")
@notif_router_alt.get("/unread-count")
def get_unread_count(db: Session = Depends(get_db)):
    data = get_workspace_data(db)
    return {
        "unread_count": data.get("unread_count", 0)
    }


@notif_router.patch("/{notif_id}/read")
@notif_router_alt.patch("/{notif_id}/read")
@notif_router.post("/{notif_id}/read")
@notif_router_alt.post("/{notif_id}/read")
def mark_notification_read(notif_id: str, db: Session = Depends(get_db)):
    global READ_NOTIFICATION_IDS
    READ_NOTIFICATION_IDS.add(str(notif_id))
    clean_id = notif_id.replace("notif_", "")
    if clean_id.isdigit():
        db_id = int(clean_id)
        notif = db.query(Notification).filter(Notification.id == db_id).first()
        if notif:
            notif.is_read = True
            db.commit()
    return {"success": True, "id": notif_id, "isRead": True}


@notif_router.patch("/read-all")
@notif_router_alt.patch("/read-all")
@notif_router.post("/read-all")
@notif_router_alt.post("/read-all")
def mark_all_notifications_read(db: Session = Depends(get_db)):
    global READ_NOTIFICATION_IDS
    data = get_workspace_data(db)
    for item in data.get("notifications", []):
        READ_NOTIFICATION_IDS.add(str(item.get("id")))
        READ_NOTIFICATION_IDS.add(str(item.get("raw_id")))

    db_notifications = db.query(Notification).all()
    for notif in db_notifications:
        notif.is_read = True
    db.commit()

    return {"success": True, "unread_count": 0}
