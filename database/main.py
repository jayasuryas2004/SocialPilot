from fastapi import FastAPI, HTTPException, Response, status
from typing import List, Optional
from pydantic import BaseModel
from datetime import date, timezone
import crud
import jwt
import models
import schemas
from datetime import datetime, timedelta
from fastapi.security import OAuth2PasswordBearer
from fastapi import Depends # Make sure Depends is imported
from database import get_db, engine, SessionLocal
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from schemas import PublishingQueueCreate
from schemas import (AudienceAnalyticsCreate,AudienceAnalyticsResponse)

models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Social Media Scheduler & Campaign Management API")

origins = [
    "http://localhost:3000",  # React default port
    "http://localhost:5173",  # Vite (React/Vue) default port
    "http://localhost:8000",  # Local backend documentation
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,            # Allows requests from your frontend origins
    allow_credentials=True,
    allow_methods=["*"],              # Allows GET, POST, PUT, DELETE, etc.
    allow_headers=["*"],              # Allows any headers (like Content-Type, Authorization)
)

@app.get("/")
def home():
    return {"message": "Welcome to the Social Media Scheduler API! Head to /docs for the interactive UI."}

# ==========================================
# 📋 PYDANTIC SCHEMAS (Data Validation)
# ==========================================

class CampaignCreate(BaseModel):
    user_id: int
    campaign_name: str
    start_date: Optional[date] = None
    end_date: Optional[date] = None

class CampaignUpdate(BaseModel):
    campaign_name: str

class CampaignResponse(BaseModel):
    id: int
    user_id: int
    campaign_name: str
    start_date: Optional[date] = None
    end_date: Optional[date] = None

    class Config:
        from_attributes = True


class PostCreate(BaseModel):
    user_id: int
    content_text: str
    status: Optional[str] = "Draft"
    campaign_id: Optional[int] = None

class PostUpdate(BaseModel):
    content_text: str

class PostResponse(BaseModel):
    id: int
    user_id: int
    campaign_id: Optional[int] = None
    content_text: str
    status: str

    class Config:
        from_attributes = True


# ==========================================
# 📢 CAMPAIGN API ENDPOINTS
# ==========================================

@app.post("/campaigns/", response_model=CampaignResponse, status_code=201)
def api_create_campaign(campaign: CampaignCreate):
    """Create a brand new campaign."""
    db_campaign = crud.create_campaign(
        user_id=campaign.user_id,
        campaign_name=campaign.campaign_name,
        start_date=campaign.start_date,
        end_date=campaign.end_date
    )
    return db_campaign


@app.get("/campaigns/{campaign_id}", response_model=CampaignResponse)
def api_get_campaign(campaign_id: int):
    """Fetch a campaign by its unique ID."""
    db_campaign = crud.get_campaign_by_id(campaign_id)
    if db_campaign is None:
        raise HTTPException(status_code=404, detail="Campaign not found")
    return db_campaign


@app.put("/campaigns/{campaign_id}", response_model=CampaignResponse)
def api_update_campaign(campaign_id: int, campaign_data: CampaignUpdate):
    """Modify the name of an existing campaign."""
    updated_campaign = crud.update_campaign_name(campaign_id, campaign_data.campaign_name)
    if updated_campaign is None:
        raise HTTPException(status_code=404, detail="Campaign not found or could not be updated")
    return updated_campaign


@app.delete("/campaigns/{campaign_id}", status_code=204)
def api_delete_campaign(campaign_id: int):
    """Permanently delete a campaign row from the database."""
    success = crud.delete_campaign(campaign_id)
    if not success:
        raise HTTPException(status_code=404, detail="Campaign not found")
    return Response(status_code=status.HTTP_204_NO_CONTENT)


# ==========================================
# 📅 POST API ENDPOINTS
# ==========================================

@app.post("/posts/", response_model=PostResponse, status_code=201)
def api_create_post(post: PostCreate):
    """Schedule or save a new social media post."""
    db_post = crud.create_post(
        user_id=post.user_id,
        content_text=post.content_text,
        status=post.status,
        campaign_id=post.campaign_id
    )
    return db_post


@app.get("/users/{user_id}/posts", response_model=List[PostResponse])
def api_get_user_posts(user_id: int):
    """Retrieve all posts written by a specific user."""
    db_posts = crud.get_posts_by_user(user_id)
    return db_posts


@app.put("/posts/{post_id}", response_model=PostResponse)
def api_update_post(post_id: int, post_data: PostUpdate):
    """Modify the main body text of a written post."""
    updated_post = crud.update_post(post_id, post_data.content_text)
    if updated_post is None:
        raise HTTPException(status_code=404, detail="Post not found or could not be updated")
    return updated_post


@app.delete("/posts/{post_id}", status_code=204)
def api_delete_post(post_id: int):
    """Permanently delete a post from the queue."""
    success = crud.delete_post(post_id)
    if not success:
        raise HTTPException(status_code=404, detail="Post not found")
    return Response(status_code=status.HTTP_204_NO_CONTENT)
SECRET_KEY = "SUPER_SECRET_SCHEDULER_KEY"
ALGORITHM = "HS256"
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")
def get_current_user(token: str = Depends(oauth2_scheme)):
    """Decodes the JWT token to verify who the current logged-in user is."""
    credentials_exception = HTTPException(
        status_code=401,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        # Decode the token using our secret key
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
        return username
    except jwt.PyJWTError:
        raise credentials_exception

# 📋 USER SCHEMAS
class UserSignUp(BaseModel):
    full_name: str
    email: str
    username: str
    password: str

class UserLogin(BaseModel):
    username: str
    password: str

class UserResponse(BaseModel):
    id: int
    username: str
    email: str
    full_name: str

    class Config:
        from_attributes = True

# ==========================================
# 🔐 AUTHENTICATION ENDPOINTS
# ==========================================

@app.post("/auth/signup", response_model=UserResponse, status_code=201)
def signup(user_data: UserSignUp):
    """Endpoint to register a brand new user profile safely."""
    # Check if username is already taken
    existing_user = crud.get_user_by_username(user_data.username)
    if existing_user:
        raise HTTPException(status_code=400, detail="Username is already registered")
        
    new_user = crud.create_user(
        full_name=user_data.full_name,
        email=user_data.email,
        username=user_data.username,
        plain_password=user_data.password
    )
    return new_user


@app.post("/auth/login")
def login(login_data: UserLogin):
    """Verifies credentials and issues a secure digital access key."""
    # 1. Look up the user
    user = crud.get_user_by_username(login_data.username)
    if not user:
        raise HTTPException(status_code=400, detail="Invalid username or password")
        
    # 2. Check the scrambled password
    if not crud.verify_password(login_data.password, user.hashed_password):
        raise HTTPException(status_code=400, detail="Invalid username or password")
        
    # 3. Create the secure key that expires in 30 minutes
    expire = datetime.now(timezone.utc) + timedelta(minutes=30)
    token_payload = {"sub": user.username, "exp": expire}
    encoded_jwt = jwt.encode(token_payload, SECRET_KEY, algorithm=ALGORITHM)
    
    return {
        "access_token": encoded_jwt,
        "token_type": "bearer",
        "message": f"Welcome back, {user.full_name}!"
    }
@app.post("/publishing-queue/", status_code=201)
def api_create_queue(
    queue: PublishingQueueCreate,
    db: Session = Depends(get_db)
):
    """Add a post to the publishing queue."""
    db_queue = crud.create_queue(db, queue)
    return db_queue

@app.post(
    "/publishing-logs/",
    response_model=schemas.PublishingLogResponse,
    status_code=201
)
def api_create_publishing_log(
    log: schemas.PublishingLogCreate,
    db: Session = Depends(get_db)
):
    return crud.create_publishing_log(db, log)

@app.post(
    "/publishing-logs/",
    response_model=schemas.PublishingLogResponse,
    status_code=201
)
def api_create_publishing_log(
    log: schemas.PublishingLogCreate,
    db: Session = Depends(get_db)
):
    return crud.create_publishing_log(db, log)

@app.post("/analytics/", response_model=schemas.AnalyticsResponse, status_code=201)
def api_create_analytics(
    analytics: schemas.AnalyticsCreate,
    db: Session = Depends(get_db)
):
    return crud.create_analytics(db, analytics)

@app.get(
    "/analytics/{analytics_id}",
    response_model=schemas.AnalyticsResponse
)
def api_get_analytics(
    analytics_id: int,
    db: Session = Depends(get_db)
):
    result = crud.get_analytics(db, analytics_id)

    if result is None:
        raise HTTPException(
            status_code=404,
            detail="Analytics not found"
        )

    return result

@app.post(
    "/audience-analytics/",
    response_model=AudienceAnalyticsResponse,
    status_code=201
)
def api_create_audience_analytics(
    analytics: AudienceAnalyticsCreate,
    db: Session = Depends(get_db)
):
    return crud.create_audience_analytics(db, analytics)

@app.post("/campaign-reports/")
def api_create_campaign_report(
    report: schemas.CampaignReportCreate,
    db: Session = Depends(get_db)
):
    db_report = crud.create_campaign_report(db, report)
    return db_report

@app.post(
    "/roi-reports/",
    response_model=schemas.ROIReportResponse,
    status_code=201
)
def api_create_roi_report(
    report: schemas.ROIReportCreate,
    db: Session = Depends(get_db)
):
    return crud.create_roi_report(db, report)