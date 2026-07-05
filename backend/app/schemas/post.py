from pydantic import BaseModel
from datetime import datetime

class PostCreate(BaseModel):
    title: str
    content: str
    platform: str
    schedule_time: datetime

class PostResponse(PostCreate):
    id: int
    status: str

    class Config:
        from_attributes = True