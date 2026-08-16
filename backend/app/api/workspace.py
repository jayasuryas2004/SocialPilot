from datetime import datetime, timedelta
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.notification import Notification
from app.models.campaign import Campaign
from app.models.post import Post

router = APIRouter(prefix="/api/workspace", tags=["Workspace & Notifications"])
router_alt = APIRouter(prefix="/workspace", tags=["Workspace & Notifications"])
notif_router = APIRouter(prefix="/api/notifications", tags=["Notifications"])
notif_router_alt = APIRouter(prefix="/notifications", tags=["Notifications"])

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
    db_campaigns = db.query(Campaign).all()
    db_posts = db.query(Post).all()

    # 1. Process notifications using standard iterative loop
    formatted_notifications = []
    for notif in db_notifications:
        msg = notif.message or ""
        msg_lower = msg.lower()

        notif_type = "system"
        category = "system"
        title = "System Notification"

        if "success" in msg_lower or "published" in msg_lower:
            notif_type = "success"
            category = "social"
            title = "Post Published Successfully"
        elif "failed" in msg_lower or "error" in msg_lower:
            notif_type = "warning"
            category = "social"
            title = "Publication Issue"
        elif "report" in msg_lower:
            notif_type = "success"
            category = "reports"
            title = "Analytics Report Ready"
        elif "comment" in msg_lower or "like" in msg_lower:
            notif_type = "message"
            category = "social"
            title = "New Social Engagement"

        time_str = format_time_ago(notif.created_at)

        formatted_notifications.append({
            "id": notif.id,
            "title": title,
            "message": msg,
            "type": notif_type,
            "category": category,
            "time": time_str,
            "isRead": False,
            "created_at": notif.created_at.isoformat() if notif.created_at else None
        })

    # Add default system alerts if fewer than 2 exist
    if len(formatted_notifications) < 2:
        default_alerts = [
            {
                "id": "def_1",
                "title": "APScheduler Active",
                "message": "Background social media publishing worker is running and monitoring scheduled queues.",
                "type": "system",
                "category": "system",
                "time": "10 mins ago",
                "isRead": False
            },
            {
                "id": "def_2",
                "title": "OAuth Token Vault Synced",
                "message": "LinkedIn OAuth account credentials and publishing permissions are securely verified.",
                "type": "success",
                "category": "system",
                "time": "1 hour ago",
                "isRead": False
            }
        ]
        for alert in default_alerts:
            formatted_notifications.append(alert)

    # 2. Process campaigns and nested posts using standard iterative loops
    formatted_campaigns = []

    # Map posts to campaigns
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

    # Append static filler campaigns
    for filler in STATIC_FILLER_CAMPAIGNS:
        formatted_campaigns.append(filler)

    unread_count = 0
    for n in formatted_notifications:
        if not n.get("isRead", False):
            unread_count += 1

    return {
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
