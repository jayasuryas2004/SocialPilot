from fastapi import FastAPI
from scheduler import start_scheduler
from database import Base, engine

import models.post
import models.campaign
import models.notification

from api import schedule, campaign, post

app = FastAPI(
    title="SocialPilot Backend",
    version="1.0.0"
)


@app.on_event("startup")
def startup_event():
    start_scheduler()


# Create database tables
Base.metadata.create_all(bind=engine)

# Register API Routers
app.include_router(schedule.router)
app.include_router(campaign.router)
app.include_router(post.router)


@app.get("/")
def home():
    return {
        "message": "Backend Working Fine 🚀"
    }