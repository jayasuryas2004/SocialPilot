from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.scheduler import start_scheduler
from app.database import Base, engine, run_database_migrations

import app.models.post
import app.models.campaign
import app.models.notification
import app.models.user
import app.models.social_account


from app.api.auth import router as auth_router
from app.api.schedule import router as schedule_router
from app.api.campaign import router as campaign_router
from app.api.post import router as post_router, router_api as post_api_router
from app.api.reports import router as reports_router, router_api as reports_api_router
from app.api.oauth import router as oauth_router
from app.api.content import router as content_router, router_alt as content_alt_router
from app.api.analytics import router as analytics_router, router_alt as analytics_alt_router
from app.api.workspace import (
    router as workspace_router,
    router_alt as workspace_alt_router,
    notif_router,
    notif_router_alt
)
from app.api.accounts import router as accounts_router, router_alt as accounts_alt_router

app = FastAPI(
    title="SocialPilot Backend",
    version="1.0.0"
)

# Explicitly allowed frontend origins for Next.js app
origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://10.85.1.205:3000",
    "http://localhost:3001",
    "http://127.0.0.1:3001"
]

# Add CORS middleware to allow frontend API requests with credentials
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_origin_regex=r"^https?://(localhost|127\.0\.0\.1|10\.\d+\.\d+\.\d+)(:\d+)?$",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def startup_event():
    run_database_migrations()
    start_scheduler()


# Create database tables and run schema migrations
run_database_migrations()

# Register API Routers
app.include_router(auth_router)
app.include_router(schedule_router)
app.include_router(campaign_router)
app.include_router(post_router)
app.include_router(post_api_router)

app.include_router(reports_router)
app.include_router(reports_api_router)
app.include_router(oauth_router)
app.include_router(content_router)
app.include_router(content_alt_router)
app.include_router(analytics_router)
app.include_router(analytics_alt_router)
app.include_router(workspace_router)
app.include_router(workspace_alt_router)
app.include_router(notif_router)
app.include_router(notif_router_alt)
app.include_router(accounts_router)
app.include_router(accounts_alt_router)








from app.api.workspace import get_workspace_data
from app.database import get_db
from sqlalchemy.orm import Session
from fastapi import Depends


@app.get("/workspace/status")
@app.get("/api/workspace/status")
def root_workspace_status(db: Session = Depends(get_db)):
    return get_workspace_data(db)


@app.get("/")
def home():
    return {
        "message": "Backend Working Fine 🚀"
    }
