from pydantic import BaseModel
from datetime import date, datetime
from typing import Optional, List, Union


class PostCreate(BaseModel):
    content: str
    platforms: Optional[Union[List[str], str]] = None
    platform: Optional[str] = None
    title: Optional[str] = None
    scheduled_date: Optional[date] = None
    scheduled_time: Optional[str] = None
    scheduled_at: Optional[Union[datetime, str]] = None
    status: Optional[str] = "Scheduled"
    campaign_id: Optional[int] = None
    image_url: Optional[str] = None
    image: Optional[str] = None
    media: Optional[str] = None
    media_url: Optional[str] = None
    media_type: Optional[str] = "image"
    mediaFile: Optional[str] = None


class PostResponse(BaseModel):
    id: int
    content: str
    platforms: Optional[str] = None
    platform: Optional[str] = None
    title: Optional[str] = None
    scheduled_date: Optional[date] = None
    scheduled_time: Optional[str] = None
    scheduled_at: Optional[datetime] = None
    status: Optional[str] = "Scheduled"
    campaign_id: Optional[int] = None
    image_url: Optional[str] = None
    image: Optional[str] = None
    media: Optional[str] = None
    media_url: Optional[str] = None
    media_type: Optional[str] = "image"

    class Config:
        from_attributes = True