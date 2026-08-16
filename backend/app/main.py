from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from scheduler import start_scheduler
from database import Base, engine

import models.post
import models.campaign
import models.notification
import models.user

from api import schedule, campaign, post, auth

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
app.include_router(auth.router)
app.include_router(schedule.router)
app.include_router(campaign.router)
app.include_router(post.router)



@app.get("/")
def home():
    return {
        "message": "Backend Working Fine 🚀"
    }