from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel

from app.database import get_db
from app.models.post import Post
from app.models.campaign import Campaign


router = APIRouter(prefix="/reports", tags=["Reports & Analytics"])


class ReportCreate(BaseModel):
    category: Optional[str] = "engagement"
    format: Optional[str] = "pdf"
    platform: Optional[str] = "all"
    campaign_id: Optional[str] = None
    timeframe: Optional[str] = "last_30_days"


class BulkDeleteRequest(BaseModel):
    ids: List[str]


# In-memory storage for generated reports and scheduled jobs
REPORTS_DB = [
    {
        "id": "1",
        "name": "May engagement summary",
        "category": "engagement",
        "format": "pdf",
        "size": "3.2 MB",
        "status": "ready",
        "platform": "instagram",
        "campaignId": "1",
        "campaignName": "Summer collection",
        "createdAt": "2026-05-20",
        "fileUrl": "#"
    },
    {
        "id": "2",
        "name": "Audience growth Q2",
        "category": "audience",
        "format": "excel",
        "size": "1.8 MB",
        "status": "ready",
        "platform": "facebook",
        "campaignId": "1",
        "campaignName": "Summer collection",
        "createdAt": "2026-05-18",
        "fileUrl": "#"
    },
    {
        "id": "3",
        "name": "Summer campaign ROI",
        "category": "campaign",
        "format": "pdf",
        "size": "2.4 MB",
        "status": "processing",
        "platform": "linkedin",
        "campaignId": "2",
        "campaignName": "Winter Skincare",
        "createdAt": "2026-05-15",
        "fileUrl": "#"
    },
    {
        "id": "4",
        "name": "Platform reach comparison",
        "category": "platform_comparison",
        "format": "excel",
        "size": "1.1 MB",
        "status": "ready",
        "platform": "x",
        "campaignId": "2",
        "campaignName": "Winter Skincare",
        "createdAt": "2026-05-12",
        "fileUrl": "#"
    },
    {
        "id": "5",
        "name": "Weekly publishing log",
        "category": "publishing",
        "format": "pdf",
        "size": "0.8 MB",
        "status": "failed",
        "platform": "instagram",
        "campaignId": "1",
        "campaignName": "Summer collection",
        "createdAt": "2026-05-10",
        "fileUrl": "#"
    }
]

SCHEDULED_REPORTS_DB = [
    {
        "id": "1",
        "title": "Weekly engagement digest",
        "frequency": "Every Monday, 9:00 AM",
        "format": "pdf",
        "enabled": True
    }
]


@router.get("")
@router.get("/")
def get_reports(
    category: Optional[str] = None,
    status: Optional[str] = None,
    platform: Optional[str] = None,
    search: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """
    Returns aggregated KPI statistics calculated from live database records,
    plus reports list filtered accordingly.
    Uses standard iterative loops.
    """
    posts = db.query(Post).all()
    campaigns = db.query(Campaign).all()

    # Calculate KPIs using standard iterative loops
    total_posts = len(posts)
    published_posts = 0
    scheduled_posts = 0
    draft_posts = 0
    failed_posts = 0

    for post in posts:
        post_status = (post.status or "").capitalize()
        if post_status == "Published":
            published_posts += 1
        elif post_status == "Scheduled" or post_status == "Pending":
            scheduled_posts += 1
        elif post_status == "Draft":
            draft_posts += 1
        elif post_status == "Failed":
            failed_posts += 1
        else:
            scheduled_posts += 1

    total_campaigns = len(campaigns)
    active_campaigns = 0
    for camp in campaigns:
        camp_status = (camp.status or "").capitalize()
        if camp_status == "Active":
            active_campaigns += 1

    # Filter reports using standard iterative loops
    filtered_items = []
    for r in REPORTS_DB:
        match = True
        if status and status != "all" and r.get("status") != status:
            match = False
        if platform and platform != "all" and r.get("platform") != platform:
            match = False
        if search and search.strip():
            query_str = search.lower().strip()
            name_str = r.get("name", "").lower()
            if query_str not in name_str:
                match = False
        if match:
            filtered_items.append(r)

    return {
        "kpis": {
            "total_posts": total_posts,
            "published_posts": published_posts,
            "scheduled_posts": scheduled_posts,
            "draft_posts": draft_posts,
            "failed_posts": failed_posts,
            "total_campaigns": total_campaigns,
            "active_campaigns": active_campaigns,
            "totalPosts": {
                "value": total_posts,
                "trend": f"{published_posts} published"
            },
            "scheduled": {
                "value": scheduled_posts,
                "trend": "Next post scheduled"
            },
            "campaigns": {
                "value": total_campaigns,
                "trend": f"{active_campaigns} active campaigns"
            },
            "accounts": {
                "value": 7,
                "platforms": ["instagram", "facebook", "linkedin", "x-twitter", "youtube", "reddit", "pinterest"]
            }
        },
        "items": filtered_items,
        "total": len(filtered_items)
    }


@router.get("/stats")
@router.get("/kpis")
def get_report_kpis(db: Session = Depends(get_db)):
    """
    Dedicated endpoint returning live aggregated dashboard KPI numbers.
    """
    posts = db.query(Post).all()
    campaigns = db.query(Campaign).all()

    total_posts = len(posts)
    published_posts = 0
    scheduled_posts = 0
    draft_posts = 0
    failed_posts = 0

    for post in posts:
        post_status = (post.status or "").capitalize()
        if post_status == "Published":
            published_posts += 1
        elif post_status == "Scheduled" or post_status == "Pending":
            scheduled_posts += 1
        elif post_status == "Draft":
            draft_posts += 1
        elif post_status == "Failed":
            failed_posts += 1
        else:
            scheduled_posts += 1

    total_campaigns = len(campaigns)
    active_campaigns = 0
    for camp in campaigns:
        camp_status = (camp.status or "").capitalize()
        if camp_status == "Active":
            active_campaigns += 1

    return {
        "total_posts": total_posts,
        "published_posts": published_posts,
        "scheduled_posts": scheduled_posts,
        "draft_posts": draft_posts,
        "failed_posts": failed_posts,
        "total_campaigns": total_campaigns,
        "active_campaigns": active_campaigns,
        "kpis": {
            "totalPosts": {
                "value": total_posts,
                "trend": f"{published_posts} published"
            },
            "scheduled": {
                "value": scheduled_posts,
                "trend": "Next post scheduled"
            },
            "campaigns": {
                "value": total_campaigns,
                "trend": f"{active_campaigns} active campaigns"
            },
            "accounts": {
                "value": 7,
                "platforms": ["instagram", "facebook", "linkedin", "x-twitter", "youtube", "reddit", "pinterest"]
            }
        }
    }


@router.post("")
@router.post("/")
def create_report(payload: ReportCreate):
    new_id = str(len(REPORTS_DB) + 1)
    category_name = payload.category.capitalize() if payload.category else "Custom"
    new_report = {
        "id": new_id,
        "name": f"{category_name} Performance Report",
        "category": payload.category or "engagement",
        "format": payload.format or "pdf",
        "size": "2.1 MB",
        "status": "ready",
        "platform": payload.platform or "all",
        "campaignId": payload.campaign_id or None,
        "campaignName": "Active Campaign",
        "createdAt": datetime.now().strftime("%Y-%m-%d"),
        "fileUrl": "#"
    }
    REPORTS_DB.insert(0, new_report)
    return new_report


@router.delete("/{report_id}")
def delete_report(report_id: str):
    global REPORTS_DB
    found = False
    new_list = []
    for r in REPORTS_DB:
        if r.get("id") == report_id:
            found = True
        else:
            new_list.append(r)
    REPORTS_DB = new_list
    return {"message": "Report deleted successfully", "found": found}


@router.post("/bulk-delete")
def bulk_delete_reports(payload: BulkDeleteRequest):
    global REPORTS_DB
    new_list = []
    for r in REPORTS_DB:
        if r.get("id") not in payload.ids:
            new_list.append(r)
    REPORTS_DB = new_list
    return {"message": f"Deleted {len(payload.ids)} reports successfully"}


@router.get("/scheduled")
def get_scheduled_reports():
    return SCHEDULED_REPORTS_DB


@router.patch("/scheduled/{report_id}")
def toggle_scheduled_report(report_id: str, payload: dict):
    enabled = payload.get("enabled", True)
    for s in SCHEDULED_REPORTS_DB:
        if s.get("id") == report_id:
            s["enabled"] = enabled
            return s
    return {"id": report_id, "enabled": enabled}
