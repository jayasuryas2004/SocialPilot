from fastapi import FastAPI
from database import Base, engine
import models.post
import models.campaign
from api import schedule,campaign

app = FastAPI(
    title="SocialPilot Backend",
    version="1.0.0"
)


# create database tables
Base.metadata.create_all(bind=engine)
app.include_router(schedule.router)
app.include_router(campaign.router)

@app.get("/")
def home():
    return {"message": "Backend Working Fine 🚀"}