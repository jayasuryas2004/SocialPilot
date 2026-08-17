from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from datetime import datetime, date

from app.database import get_db
from app.models.post import Post
from app.models.campaign import Campaign
from app.models.social_account import SocialAccount
from app.models.user import User
from app.core.security import get_current_user

router = APIRouter(prefix="/api/content", tags=["Content & Calendar"])
router_alt = APIRouter(prefix="/content", tags=["Content & Calendar"])

# Static mock post templates for multi-channel filler data
STATIC_FILLER_TEMPLATES = [
    {
        "id": "mock_filler_1",
        "title": "Summer Campaign Reel & Stories",
        "subtitle": "Showcasing summer collection highlights and customer reactions.",
        "content": "Launching the new summer collection today! Check out our stories for exclusive behind-the-scenes content.",
        "platform": "Instagram",
        "handle": "socialpilot_hq",
        "campaign": "Summer Sale",
        "date": "2026-11-02",
        "time": "10:00 AM",
        "status": "Published",
        "image": "https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=150&h=150&fit=crop",
        "is_live": False
    },
    {
        "id": "mock_filler_2",
        "title": "Weekend Gateway Exclusive Offer",
        "subtitle": "Promoting weekend discounts across Facebook communities.",
        "content": "Weekend gateway with benefits. Book now and save 20% on all seasonal packages!",
        "platform": "Facebook",
        "handle": "socialpilot_global",
        "campaign": "Summer Sale",
        "date": "2026-11-06",
        "time": "11:30 AM",
        "status": "Scheduled",
        "image": "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=150&h=150&fit=crop",
        "is_live": False
    },
    {
        "id": "mock_filler_3",
        "title": "Product Launch Thread on X",
        "subtitle": "Engaging community feedback on upcoming features and release notes.",
        "content": "We're launching our new social analytics engine next week! Here's a breakdown of what's new in a short thread 🧵👇",
        "platform": "X-Twitter",
        "handle": "socialpilot_app",
        "campaign": "Spring Launch",
        "date": "2026-11-10",
        "time": "02:00 PM",
        "status": "Scheduled",
        "image": "https://images.unsplash.com/photo-1522542550221-31fd19575a2d?w=150&h=150&fit=crop",
        "is_live": False
    },
    {
        "id": "mock_filler_4",
        "title": "Winter Skincare Masterclass Video",
        "subtitle": "Full tutorial on moisturizing and seasonal skin protection.",
        "content": "Essential winter skincare tips to keep your skin protected and glowing all season long.",
        "platform": "Instagram",
        "handle": "socialpilot_hq",
        "campaign": "Winter Skincare",
        "date": "2026-11-15",
        "time": "09:00 AM",
        "status": "Published",
        "image": "https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?w=150&h=150&fit=crop",
        "is_live": False
    },
    {
        "id": "mock_filler_5",
        "title": "Customer Spotlight & Success Story",
        "subtitle": "How agency teams scale multi-brand management with SocialPilot.",
        "content": "See how leading digital agencies scale to 100+ accounts with our automated scheduling pipeline.",
        "platform": "Facebook",
        "handle": "socialpilot_global",
        "campaign": "Spring Launch",
        "date": "2026-11-18",
        "time": "04:30 PM",
        "status": "Draft",
        "image": "https://images.unsplash.com/photo-1557804506-669a67965ba0?w=150&h=150&fit=crop",
        "is_live": False
    },
    {
        "id": "mock_filler_6",
        "title": "Weekly Strategy & Trends Digest",
        "subtitle": "Key social growth metrics and hashtag strategies for Q4.",
        "content": "Here are 5 content formats currently outperforming benchmarks across social networks.",
        "platform": "X-Twitter",
        "handle": "socialpilot_app",
        "campaign": "General",
        "date": "2026-11-22",
        "time": "01:15 PM",
        "status": "Scheduled",
        "image": "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=150&h=150&fit=crop",
        "is_live": False
    }
]


def format_time_ampm(time_val):
    """
    Formats any 24h or raw time representation to 12-hour AM/PM format (e.g., '10:06 AM').
    Strictly uses standard control flow (no list comprehensions or lambda expressions).
    """
    if not time_val:
        return "10:00 AM"

    t_str = str(time_val).strip()
    if "AM" in t_str.upper() or "PM" in t_str.upper():
        return t_str

    try:
        parts = t_str.split(":")
        if len(parts) >= 2:
            h = int(parts[0])
            m = parts[1].strip()[:2].zfill(2)
            ampm = "PM" if h >= 12 else "AM"
            h12 = h % 12
            if h12 == 0:
                h12 = 12
            return f"{h12:02d}:{m} {ampm}"
    except Exception:
        pass

    return t_str


def format_combined_content(db: Session, current_user: User):
    """
    Helper function using standard iterative loops to query tenant-isolated SQLite records,
    preserve LinkedIn live status & badges, format times to AM/PM, and merge static filler posts.
    Strictly uses standard control flow (zero comprehensions or lambda expressions).
    """
    posts = db.query(Post).filter(
        (Post.user_id == current_user.id) | (Post.user_id.is_(None))
    ).all()

    campaigns = db.query(Campaign).filter(
        (Campaign.user_id == current_user.id) | (Campaign.user_id.is_(None))
    ).all()

    social_accounts = db.query(SocialAccount).filter(
        (SocialAccount.user_id == current_user.id) | (SocialAccount.user_id.is_(None))
    ).all()

    # Find real connected LinkedIn user from vault
    linkedin_user_name = "LinkedIn Member"
    for acc in social_accounts:
        if acc.platform == "linkedin" and acc.account_name:
            linkedin_user_name = acc.account_name
            break

    # Build campaign name lookup using standard loop
    campaign_map = {}
    for camp in campaigns:
        campaign_map[camp.id] = camp.campaign_name

    combined_items = []

    # 1. Process real database records
    for p in posts:
        target_platform = p.platforms or p.platform or "LinkedIn"
        is_linkedin = "linkedin" in target_platform.lower()

        # Extract date and time
        post_date = "2026-11-01"
        if p.scheduled_date:
            post_date = str(p.scheduled_date)
        elif p.scheduled_at:
            post_date = p.scheduled_at.strftime("%Y-%m-%d")

        raw_time = p.scheduled_time
        if not raw_time and p.scheduled_at:
            raw_time = p.scheduled_at.strftime("%I:%M %p")
        post_time = format_time_ampm(raw_time)

        camp_name = campaign_map.get(p.campaign_id, "General")

        title_val = p.title
        if not title_val:
            content_str = p.content or ""
            if len(content_str) > 35:
                title_val = content_str[:35] + "..."
            else:
                title_val = content_str or f"Post #{p.id}"

        subtitle_val = p.content or "No caption provided."
        if len(subtitle_val) > 60:
            subtitle_val = subtitle_val[:60] + "..."

        status_val = (p.status or "Scheduled").capitalize()

        img_val = p.image_url
        if not img_val:
            img_val = "https://images.unsplash.com/photo-1611944212129-29977ae1398c?w=150&h=150&fit=crop" if is_linkedin else "https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=150&h=150&fit=crop"

        item = {
            "id": p.id,
            "title": title_val,
            "subtitle": subtitle_val,
            "content": p.content or "",
            "fullText": p.content or "",
            "description": p.content or "",
            "platform": "LinkedIn" if is_linkedin else target_platform,
            "handle": linkedin_user_name if is_linkedin else "socialpilot_hq",
            "campaign": camp_name,
            "date": post_date,
            "time": post_time,
            "status": status_val,
            "image_url": p.image_url,
            "image": img_val,
            "media": p.image_url or img_val,
            "media_url": p.image_url or img_val,
            "is_live": is_linkedin or True,
            "source": "live_db"
        }
        combined_items.append(item)

    # 2. Append static filler posts using standard loop
    for filler in STATIC_FILLER_TEMPLATES:
        combined_items.append(filler)

    return combined_items


@router.get("/all")
def get_all_content(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Returns hybrid data array of live database records merged with static filler posts for current user.
    """
    items = format_combined_content(db, current_user)
    return {
        "items": items,
        "total": len(items)
    }


@router_alt.get("/all")
def get_all_content_alt(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Alternative route mapping for /content/all.
    """
    items = format_combined_content(db, current_user)
    return {
        "items": items,
        "total": len(items)
    }
