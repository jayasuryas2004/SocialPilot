from pydantic import BaseModel
from datetime import date
from typing import Optional


class CampaignCreate(BaseModel):
    campaign_name: str
    platform: str
    subtitle: Optional[str] = None
    description: Optional[str] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    status: Optional[str] = "Active"
    objective: Optional[str] = "Awareness"
    budget: Optional[float] = 0.0


class CampaignResponse(CampaignCreate):
    id: int

    class Config:
        from_attributes = True