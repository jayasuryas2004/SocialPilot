from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.campaign import Campaign
from app.models.user import User
from app.schemas.campaign import CampaignCreate
from app.core.security import get_current_user


router = APIRouter()


# CREATE
@router.post("/campaign")
@router.post("/campaigns")
@router.post("/api/campaigns")
def create_campaign(
    campaign: CampaignCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    new_campaign = Campaign(
        user_id=current_user.id,
        campaign_name=campaign.campaign_name,
        platform=campaign.platform,
        subtitle=campaign.subtitle,
        description=campaign.description,
        start_date=campaign.start_date,
        end_date=campaign.end_date,
        status=campaign.status or "Active",
        objective=campaign.objective or "Awareness",
        budget=campaign.budget or 0.0
    )

    db.add(new_campaign)
    db.commit()
    db.refresh(new_campaign)

    return {
        "message": "Campaign created successfully",
        "data": new_campaign
    }


# READ
@router.get("/campaign")
@router.get("/campaigns")
@router.get("/api/campaigns")
def get_campaigns(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    campaigns = db.query(Campaign).filter(
        (Campaign.user_id == current_user.id) | (Campaign.user_id.is_(None))
    ).all()

    return {
        "data": campaigns
    }


# STATS
@router.get("/campaign/stats")
@router.get("/campaigns/stats")
@router.get("/api/campaigns/stats")
def get_campaigns_stats(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    campaigns = db.query(Campaign).filter(
        (Campaign.user_id == current_user.id) | (Campaign.user_id.is_(None))
    ).all()

    total = len(campaigns)
    active = 0
    completed = 0
    draft = 0
    paused = 0

    for c in campaigns:
        st = (c.status or "").strip().capitalize()
        if st == "Active":
            active += 1
        elif st == "Completed":
            completed += 1
        elif st == "Draft":
            draft += 1
        elif st == "Paused":
            paused += 1
        else:
            active += 1

    return {
        "total": total,
        "active": active,
        "completed": completed,
        "draft": draft,
        "paused": paused
    }


# UPDATE
@router.put("/campaign/{id}")
@router.put("/api/campaigns/{id}")
def update_campaign(
    id: int,
    updated_campaign: CampaignCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    campaign = db.query(Campaign).filter(
        Campaign.id == id,
        (Campaign.user_id == current_user.id) | (Campaign.user_id.is_(None))
    ).first()

    if not campaign:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Campaign not found or unauthorized"
        )

    campaign.campaign_name = updated_campaign.campaign_name
    campaign.platform = updated_campaign.platform
    campaign.subtitle = updated_campaign.subtitle
    campaign.description = updated_campaign.description
    campaign.start_date = updated_campaign.start_date
    campaign.end_date = updated_campaign.end_date
    campaign.status = updated_campaign.status or "Active"
    campaign.objective = updated_campaign.objective or "Awareness"
    campaign.budget = updated_campaign.budget or 0.0

    db.commit()
    db.refresh(campaign)

    return {
        "message": "Campaign updated successfully",
        "data": campaign
    }


# DELETE
@router.delete("/campaign/{id}")
@router.delete("/api/campaigns/{id}")
def delete_campaign(
    id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    campaign = db.query(Campaign).filter(
        Campaign.id == id,
        (Campaign.user_id == current_user.id) | (Campaign.user_id.is_(None))
    ).first()

    if not campaign:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Campaign not found or unauthorized"
        )

    db.delete(campaign)
    db.commit()

    return {
        "message": "Campaign deleted successfully"
    }