from pydantic import BaseModel
from datetime import date


class CampaignCreate(BaseModel):
    campaign_name: str
    platform: str
    start_date: date
    end_date: date
    budget: float


class CampaignResponse(CampaignCreate):
    id: int
    status: str

    class Config:
        from_attributes = True