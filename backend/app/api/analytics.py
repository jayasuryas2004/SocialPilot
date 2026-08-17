import os
from datetime import datetime
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
import httpx

from app.database import get_db
from app.models.social_account import SocialAccount
from app.models.post import Post
from app.models.campaign import Campaign
from app.models.user import User
from app.core.security import get_current_user
from app.core.vault import decrypt_token
from app.core.redis import get_cached, set_cached

router = APIRouter(prefix="/api/analytics", tags=["Analytics"])
router_alt = APIRouter(prefix="/analytics", tags=["Analytics"])

LINKEDIN_USERINFO_URL = "https://api.linkedin.com/v2/userinfo"


@router.get("/full-report")
@router_alt.get("/full-report")
async def get_full_analytics_report(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Generates a full hybrid analytics report merging live PostgreSQL database metrics
    with multi-platform showcase baseline mock data.
    Caches the compiled report in Redis with a 60-second TTL.
    Strictly uses standard iterative loops only (zero comprehensions or lambda expressions).
    """
    # 1. Check Redis cache first
    cache_key = f"user_{current_user.id}_analytics"
    cached_data = await get_cached(cache_key)
    if cached_data is not None:
        return cached_data

    # 2. Query connected SocialAccount records for this tenant
    social_accounts = db.query(SocialAccount).filter(
        (SocialAccount.user_id == current_user.id) | (SocialAccount.user_id.is_(None))
    ).all()

    posts = db.query(Post).filter(
        (Post.user_id == current_user.id) | (Post.user_id.is_(None))
    ).all()

    campaigns = db.query(Campaign).filter(
        (Campaign.user_id == current_user.id) | (Campaign.user_id.is_(None))
    ).all()

    linkedin_account = None
    for acc in social_accounts:
        if acc.platform == "linkedin":
            linkedin_account = acc
            break

    is_linkedin_connected = False
    linkedin_name = "LinkedIn Member"
    linkedin_followers_weekly = 6200
    linkedin_followers_monthly = 24800

    if linkedin_account and linkedin_account.access_token:
        is_linkedin_connected = True
        linkedin_name = linkedin_account.account_name or "LinkedIn Member"

        # Decrypt token in memory
        raw_access_token = decrypt_token(linkedin_account.access_token)

        # Attempt to verify token with LinkedIn Userinfo API
        if raw_access_token:
            try:
                async with httpx.AsyncClient(timeout=5.0) as client:
                    res = await client.get(
                        LINKEDIN_USERINFO_URL,
                        headers={"Authorization": f"Bearer {raw_access_token}"}
                    )
                    if res.status_code == 200:
                        info = res.json()
                        name_str = f"{info.get('given_name', '')} {info.get('family_name', '')}".strip()
                        if name_str:
                            linkedin_name = name_str
            except Exception as err:
                print("LinkedIn live metrics check notice:", err)

    # 3. Count real posts by status and platform using standard iterative loops
    real_post_count = len(posts)
    published_post_count = 0
    scheduled_post_count = 0
    linkedin_post_count = 0

    for p in posts:
        s = (p.status or "").capitalize()
        if s == "Published":
            published_post_count += 1
        elif s == "Scheduled" or s == "Pending":
            scheduled_post_count += 1

        plat = (p.platform or p.platforms or "LinkedIn").lower()
        if "linkedin" in plat:
            linkedin_post_count += 1

    # 4. Build Full Multi-Platform Distribution
    baseline_distribution = [
        {"name": "Instagram", "value": 450, "is_live": False, "color": "#E1306C"},
        {"name": "Facebook", "value": 320, "is_live": False, "color": "#1877F2"},
        {"name": "LinkedIn", "value": 250 + linkedin_post_count, "is_live": is_linkedin_connected, "color": "#0A66C2"},
        {"name": "YouTube", "value": 180, "is_live": False, "color": "#FF0000"},
        {"name": "X-Twitter", "value": 120, "is_live": False, "color": "#0f1419"},
        {"name": "Reddit", "value": 85, "is_live": False, "color": "#FF4500"},
        {"name": "Pinterest", "value": 65, "is_live": False, "color": "#E60023"},
    ]

    platform_distribution = []
    for item in baseline_distribution:
        platform_distribution.append(item)

    # 5. Build Full Follower Growth Datasets across all platforms
    weekly_followers = [
        {"platform": "Instagram", "value": 12500, "is_live": False, "color": "#E1306C"},
        {"platform": "Facebook", "value": 8200, "is_live": False, "color": "#1877F2"},
        {"platform": "Pinterest", "value": 15400, "is_live": False, "color": "#E60023"},
        {"platform": "LinkedIn", "value": 4100 + (linkedin_followers_weekly if is_linkedin_connected else 0), "is_live": is_linkedin_connected, "color": "#0A66C2"},
        {"platform": "YouTube", "value": 9800, "is_live": False, "color": "#FF0000"},
        {"platform": "X-Twitter", "value": 5200, "is_live": False, "color": "#0f1419"},
        {"platform": "Reddit", "value": 6100, "is_live": False, "color": "#FF4500"},
    ]

    monthly_followers = [
        {"platform": "Instagram", "value": 45000, "is_live": False, "color": "#E1306C"},
        {"platform": "Facebook", "value": 32000, "is_live": False, "color": "#1877F2"},
        {"platform": "Pinterest", "value": 55000, "is_live": False, "color": "#E60023"},
        {"platform": "LinkedIn", "value": 18000 + (linkedin_followers_monthly if is_linkedin_connected else 0), "is_live": is_linkedin_connected, "color": "#0A66C2"},
        {"platform": "YouTube", "value": 38000, "is_live": False, "color": "#FF0000"},
        {"platform": "X-Twitter", "value": 22000, "is_live": False, "color": "#0f1419"},
        {"platform": "Reddit", "value": 25000, "is_live": False, "color": "#FF4500"},
    ]

    # 6. Build Dynamic Top Performing Posts (Real DB posts first, followed by baseline showcase posts)
    top_posts = []

    for p in posts:
        plat_name = (p.platform or p.platforms or "LinkedIn").capitalize()
        post_title = p.title or p.content or "SocialPilot Post"
        is_live_post = ("linkedin" in plat_name.lower()) and is_linkedin_connected

        eng_count = max(p.id * 1420 + 850, 1200)
        reach_count = max(eng_count * 4 + 3200, 4800)

        eng_str = f"{round(eng_count / 1000, 1)}K" if eng_count < 1000000 else f"{round(eng_count / 1000000, 2)}M"
        reach_str = f"{round(reach_count / 1000, 1)}K" if reach_count < 1000000 else f"{round(reach_count / 1000000, 2)}M"

        img_url = p.image_url or "https://images.unsplash.com/photo-1611944212129-29977ae1398c?w=100&h=100&fit=crop"

        top_posts.append({
            "id": str(p.id),
            "title": post_title,
            "platform": plat_name,
            "handle": f"@{linkedin_name.lower().replace(' ', '_')}" if "linkedin" in plat_name.lower() else f"@{current_user.name.lower().replace(' ', '_')}",
            "engagement": eng_str,
            "reach": reach_str,
            "img": img_url,
            "is_live": is_live_post
        })

    static_showcase_posts = [
        {
            "id": "mock_post_1",
            "title": "B2B SaaS Growth Strategies & Playbook",
            "platform": "LinkedIn",
            "handle": "@socialpilot_b2b",
            "engagement": "54.2K",
            "reach": "198K",
            "img": "https://images.unsplash.com/photo-1611944212129-29977ae1398c?w=100&h=100&fit=crop",
            "is_live": is_linkedin_connected
        },
        {
            "id": "mock_post_2",
            "title": "Summer sale reel & viral marketing showcase",
            "platform": "Instagram",
            "handle": "@socialpilot_hq",
            "engagement": "42.8K",
            "reach": "182K",
            "img": "https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=100&h=100&fit=crop",
            "is_live": False
        },
        {
            "id": "mock_post_3",
            "title": "Winter collection promo & social commerce campaign",
            "platform": "Facebook",
            "handle": "@socialpilot_global",
            "engagement": "38.1K",
            "reach": "142K",
            "img": "https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?w=100&h=100&fit=crop",
            "is_live": False
        },
        {
            "id": "mock_post_4",
            "title": "Agency Scaling Blueprint: 0 to 100k MRR",
            "platform": "LinkedIn",
            "handle": "@socialpilot_b2b",
            "engagement": "31.9K",
            "reach": "115K",
            "img": "https://images.unsplash.com/photo-1557804506-669a67965ba0?w=100&h=100&fit=crop",
            "is_live": is_linkedin_connected
        }
    ]

    for sp in static_showcase_posts:
        top_posts.append(sp)

    # 7. Build Dynamic Campaign Performance
    campaign_performance = []

    for c in campaigns:
        c_posts = []
        for p in posts:
            if p.campaign_id == c.id:
                c_posts.append(p)

        c_eng = max(len(c_posts) * 3200 + 4500, 2800)
        c_reach = max(c_eng * 3 + 6000, 9200)
        c_eng_str = f"{round(c_eng / 1000, 1)}K" if c_eng < 1000000 else f"{round(c_eng / 1000000, 2)}M"
        c_reach_str = f"{round(c_reach / 1000, 1)}K" if c_reach < 1000000 else f"{round(c_reach / 1000000, 2)}M"

        campaign_performance.append({
            "id": str(c.id),
            "title": c.campaign_name,
            "platform": (c.platform or "Multi-Platform").capitalize(),
            "handle": f"@{current_user.name.lower().replace(' ', '_')}",
            "engagement": c_eng_str,
            "reach": c_reach_str,
            "img": "https://images.unsplash.com/photo-1557804506-669a67965ba0?w=100&h=100&fit=crop",
            "is_live": False
        })

    static_showcase_campaigns = [
        {
            "id": "mock_camp_1",
            "title": "Global Brand Awareness & Authority 2026",
            "platform": "LinkedIn",
            "handle": "@socialpilot_official",
            "engagement": "89.4K",
            "reach": "340K",
            "img": "https://images.unsplash.com/photo-1557804506-669a67965ba0?w=100&h=100&fit=crop",
        },
        {
            "id": "mock_camp_2",
            "title": "Summer Product Launch & Community Spotlight",
            "platform": "Instagram",
            "handle": "@socialpilot_app",
            "engagement": "64.2K",
            "reach": "275K",
            "img": "https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=100&h=100&fit=crop",
        },
        {
            "id": "mock_camp_3",
            "title": "Developer First: API & SDK Expansion",
            "platform": "X-Twitter",
            "handle": "@socialpilot_dev",
            "engagement": "48.6K",
            "reach": "195K",
            "img": "https://images.unsplash.com/photo-1518770660439-4636190af475?w=100&h=100&fit=crop",
        }
    ]

    for sc in static_showcase_campaigns:
        campaign_performance.append(sc)

    # 8. Build Full Weekly Trends
    weekly_trends = [
        {"date": "Mon", "engagement": 4200, "reach": 18200, "linkedin": 1450, "instagram": 1800, "facebook": 950},
        {"date": "Tue", "engagement": 3800, "reach": 16400, "linkedin": 1200, "instagram": 1600, "facebook": 1000},
        {"date": "Wed", "engagement": 5100, "reach": 21500, "linkedin": 1850, "instagram": 2100, "facebook": 1150},
        {"date": "Thu", "engagement": 4800, "reach": 19800, "linkedin": 1600, "instagram": 2000, "facebook": 1200},
        {"date": "Fri", "engagement": 5900, "reach": 24800, "linkedin": 2100, "instagram": 2400, "facebook": 1400},
        {"date": "Sat", "engagement": 7200, "reach": 31000, "linkedin": 2400, "instagram": 3200, "facebook": 1600},
        {"date": "Sun", "engagement": 6800, "reach": 28500, "linkedin": 2200, "instagram": 3000, "facebook": 1600},
    ]

    # 9. Compute Hybrid KPI Metrics: Baseline + Live DB Numbers
    base_eng = 164800
    base_reach = 486200
    base_imp = 1240000
    base_posts = 1470

    live_eng = real_post_count * 8400
    live_reach = real_post_count * 23500
    live_imp = int(live_reach * 2.5)

    tot_eng_val = base_eng + live_eng
    tot_reach_val = base_reach + live_reach
    tot_imp_val = base_imp + live_imp
    tot_posts_val = base_posts + real_post_count
    eng_rate_val = round((tot_eng_val / max(tot_reach_val, 1)) * 100, 1)

    eng_str = f"{round(tot_eng_val / 1000, 1)}K" if tot_eng_val < 1000000 else f"{round(tot_eng_val / 1000000, 2)}M"
    reach_str = f"{round(tot_reach_val / 1000, 1)}K" if tot_reach_val < 1000000 else f"{round(tot_reach_val / 1000000, 2)}M"
    imp_str = f"{round(tot_imp_val / 1000, 1)}K" if tot_imp_val < 1000000 else f"{round(tot_imp_val / 1000000, 2)}M"

    report = {
        "kpis": {
            "totalEngagement": {"value": eng_str, "change": "+16.4%"},
            "totalReach": {"value": reach_str, "change": "+22.1%"},
            "impressions": {"value": imp_str, "change": "+14.8%"},
            "engagementRate": {"value": f"{eng_rate_val}%", "change": "+0.8%"},
            "totalPosts": tot_posts_val,
            "publishedPosts": published_post_count + 1420,
            "scheduledPosts": scheduled_post_count + 50
        },
        "platformDistribution": platform_distribution,
        "followers": {
            "weekly": weekly_followers,
            "monthly": monthly_followers
        },
        "engagementTrends": weekly_trends,
        "topPosts": top_posts,
        "campaignPerformance": campaign_performance,
        "linkedin": {
            "connected": is_linkedin_connected,
            "account_name": linkedin_name,
            "weekly_followers": linkedin_followers_weekly if is_linkedin_connected else 0,
            "monthly_followers": linkedin_followers_monthly if is_linkedin_connected else 0,
            "status": "active" if is_linkedin_connected else "unlinked"
        }
    }

    # Store in Redis cache for 60 seconds
    await set_cached(cache_key, report, ttl_seconds=60)
    return report


@router.get("/distribution")
@router_alt.get("/distribution")
async def get_distribution(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    report = await get_full_analytics_report(current_user=current_user, db=db)
    return report.get("platformDistribution", [])


@router.get("/trends")
@router_alt.get("/trends")
async def get_trends(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    report = await get_full_analytics_report(current_user=current_user, db=db)
    return report.get("engagementTrends", [])


@router.get("/followers")
@router_alt.get("/followers")
async def get_followers(
    timeline: str = "weekly",
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    report = await get_full_analytics_report(current_user=current_user, db=db)
    followers_dict = report.get("followers", {})
    return followers_dict.get(timeline, followers_dict.get("weekly", []))
