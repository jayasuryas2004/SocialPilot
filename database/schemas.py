from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import Optional

class UserBase(BaseModel):
    full_name: str
    email: EmailStr
    username: str

class UserCreate(UserBase):
    password: str

class UserLogin(BaseModel):
    username: str
    password: str

class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    email: Optional[EmailStr] = None
    username: Optional[str] = None
    password: Optional[str] = None

class UserResponse(UserBase):
    id: int

    class Config:
        from_attributes = True


class CampaignBase(BaseModel):
    user_id: int
    campaign_name: str
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None

class CampaignCreate(CampaignBase):
    pass

class CampaignUpdate(BaseModel):
    campaign_name: Optional[str] = None
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None

class CampaignResponse(CampaignBase):
    id: int

    class Config:
        from_attributes = True


class PostBase(BaseModel):
    user_id: int
    campaign_id: Optional[int] = None
    content_text: str

    scheduled_at: Optional[datetime] = None
    published_at: Optional[datetime] = None

    status: str = "Draft"

    is_draft: bool = True
    is_recurring: bool = False

    recurring_type: Optional[str] = None

    queue_position: Optional[int] = None

    retry_count: int = 0

    platform_post_id: Optional[str] = None


class PostCreate(PostBase):
    pass


class PostUpdate(BaseModel):
    content_text: Optional[str] = None
    campaign_id: Optional[int] = None

    scheduled_at: Optional[datetime] = None
    published_at: Optional[datetime] = None

    status: Optional[str] = None

    is_draft: Optional[bool] = None
    is_recurring: Optional[bool] = None

    recurring_type: Optional[str] = None

    queue_position: Optional[int] = None

    retry_count: Optional[int] = None

    platform_post_id: Optional[str] = None


class PostResponse(PostBase):
    id: int

    class Config:
        from_attributes = True
class PublishingQueueBase(BaseModel):
    post_id: int
    priority: int = 1
    scheduled_at: datetime
    status: str = "Pending"
    attempts: int = 0



class PublishingQueueCreate(PublishingQueueBase):
    pass


class PublishingQueueUpdate(BaseModel):
    priority: Optional[int] = None
    scheduled_at: Optional[datetime] = None
    status: Optional[str] = None
    attempts: Optional[int] = None
    error_message: Optional[str] = None


class PublishingQueueResponse(PublishingQueueBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class PublishingLogBase(BaseModel):
    post_id: int
    campaign_id: Optional[int] = None
    platform: str
    status: str
    response_message: Optional[str] = None
    error_message: Optional[str] = None
    platform_post_id: Optional[str] = None

class PublishingLogCreate(PublishingLogBase):
    pass

class PublishingLogUpdate(BaseModel):
    platform: Optional[str] = None
    status: Optional[str] = None
    response_message: Optional[str] = None
    error_message: Optional[str] = None
    platform_post_id: Optional[str] = None

class PublishingLogResponse(PublishingLogBase):
    id: int
    published_at: datetime

    class Config:
        from_attributes = True

# ==========================================================
# ANALYTICS SCHEMAS
# ==========================================================

class AnalyticsBase(BaseModel):
    post_id: int
    campaign_id: Optional[int] = None

    likes: int = 0
    comments: int = 0
    shares: int = 0

    impressions: int = 0
    reach: int = 0
    clicks: int = 0

    engagement_rate: float = 0.0


class AnalyticsCreate(AnalyticsBase):
    pass


class AnalyticsUpdate(BaseModel):
    likes: Optional[int] = None
    comments: Optional[int] = None
    shares: Optional[int] = None

    impressions: Optional[int] = None
    reach: Optional[int] = None
    clicks: Optional[int] = None

    engagement_rate: Optional[float] = None


class AnalyticsResponse(AnalyticsBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True

# ==========================================================
# AUDIENCE ANALYTICS SCHEMAS
# ==========================================================

class AudienceAnalyticsBase(BaseModel):
    campaign_id: int

    followers: int = 0
    new_followers: int = 0
    unfollowers: int = 0

    profile_visits: int = 0

    country: Optional[str] = None
    city: Optional[str] = None


class AudienceAnalyticsCreate(AudienceAnalyticsBase):
    pass


class AudienceAnalyticsUpdate(BaseModel):
    followers: Optional[int] = None
    new_followers: Optional[int] = None
    unfollowers: Optional[int] = None

    profile_visits: Optional[int] = None

    country: Optional[str] = None
    city: Optional[str] = None


class AudienceAnalyticsResponse(AudienceAnalyticsBase):
    id: int
    recorded_at: datetime

    class Config:
        from_attributes = True

# ==========================================================
# CAMPAIGN REPORT SCHEMAS
# ==========================================================

class CampaignReportBase(BaseModel):
    campaign_id: int

    report_name: str
    report_type: str

    file_path: Optional[str] = None


class CampaignReportCreate(CampaignReportBase):
    pass


class CampaignReportUpdate(BaseModel):
    report_name: Optional[str] = None
    report_type: Optional[str] = None
    file_path: Optional[str] = None


class CampaignReportResponse(CampaignReportBase):
    id: int
    generated_at: datetime

    class Config:
        from_attributes = True

# ==========================================================
# ROI REPORT SCHEMAS
# ==========================================================

class ROIReportBase(BaseModel):
    campaign_id: int

    budget: float
    revenue: float = 0.0

    roi_percentage: float = 0.0


class ROIReportCreate(ROIReportBase):
    pass


class ROIReportUpdate(BaseModel):
    budget: Optional[float] = None
    revenue: Optional[float] = None
    roi_percentage: Optional[float] = None


class ROIReportResponse(ROIReportBase):
    id: int
    generated_at: datetime

    class Config:
        from_attributes = True

