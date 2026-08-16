from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.scheduler import start_scheduler
from app.database import Base, engine

import app.models.post
import app.models.campaign
import app.models.notification
import app.models.user
import app.models.social_account


from app.api.auth import router as auth_router
from app.api.schedule import router as schedule_router
from app.api.campaign import router as campaign_router
from app.api.post import router as post_router
from app.api.reports import router as reports_router
from app.api.oauth import router as oauth_router
from app.api.content import router as content_router, router_alt as content_alt_router

app = FastAPI(
    title="SocialPilot Backend",
    version="1.0.0"
)

# Explicitly allowed frontend origins for Next.js app
origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000"
]

# Add CORS middleware to allow frontend API requests with credentials
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def startup_event():
    start_scheduler()


# Create database tables
Base.metadata.create_all(bind=engine)

# Register API Routers
app.include_router(auth_router)
app.include_router(schedule_router)
app.include_router(campaign_router)
app.include_router(post_router)
app.include_router(reports_router)
app.include_router(oauth_router)
app.include_router(content_router)
app.include_router(content_alt_router)





@app.get("/")
def home():
    return {
        "message": "Backend Working Fine 🚀"
    }
