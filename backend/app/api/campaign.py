from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from database import get_db
from models.campaign import Campaign
from schemas.campaign import CampaignCreate

router = APIRouter()


# CREATE
@router.post("/campaign")
def create_campaign(campaign: CampaignCreate, db: Session = Depends(get_db)):
    new_campaign = Campaign(
        campaign_name=campaign.campaign_name,
        platform=campaign.platform,
        start_date=campaign.start_date,
        end_date=campaign.end_date,
        budget=campaign.budget
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
def get_campaigns(db: Session = Depends(get_db)):
    campaigns = db.query(Campaign).all()

    return {
        "data": campaigns
    }


# UPDATE
@router.put("/campaign/{id}")
def update_campaign(id: int, updated_campaign: CampaignCreate, db: Session = Depends(get_db)):
    campaign = db.query(Campaign).filter(Campaign.id == id).first()

    if not campaign:
        return {"error": "Campaign not found"}

    campaign.campaign_name = updated_campaign.campaign_name
    campaign.platform = updated_campaign.platform
    campaign.start_date = updated_campaign.start_date
    campaign.end_date = updated_campaign.end_date
    campaign.budget = updated_campaign.budget

    db.commit()
    db.refresh(campaign)

    return {
        "message": "Campaign updated successfully",
        "data": campaign
    }


# DELETE
@router.delete("/campaign/{id}")
def delete_campaign(id: int, db: Session = Depends(get_db)):
    campaign = db.query(Campaign).filter(Campaign.id == id).first()

    if not campaign:
        return {"error": "Campaign not found"}

    db.delete(campaign)
    db.commit()

    return {
        "message": "Campaign deleted successfully"
    }