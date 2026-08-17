import os
import sys
from datetime import date, datetime
from sqlalchemy import text

# Ensure backend root is on sys.path
sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))

from app.database import engine, Base, SessionLocal
from app.models.user import User
from app.models.post import Post
from app.models.campaign import Campaign
from app.models.notification import Notification
from app.models.social_account import SocialAccount
from app.api.workspace import seed_notifications_database
from app.core.security import hash_password
from app.core.vault import encrypt_token


def reset_database():
    """
    Completely drops all existing tables and cleanly recreates the schema from SQLAlchemy models.
    Seeds default workspace notifications, primary development user, and real AI engineering posts/campaigns.
    Strictly uses standard for/while loops (no list comprehensions or lambda expressions).
    """
    print(f"Target Database: {engine.url.render_as_string(hide_password=True)}")
    print("Dropping all existing database tables...")

    # Drop existing tables
    try:
        with engine.begin() as conn:
            conn.execute(text("DROP TABLE IF EXISTS alembic_version CASCADE;"))
            conn.execute(text("DROP TABLE IF EXISTS notifications CASCADE;"))
            conn.execute(text("DROP TABLE IF EXISTS posts CASCADE;"))
            conn.execute(text("DROP TABLE IF EXISTS campaigns CASCADE;"))
            conn.execute(text("DROP TABLE IF EXISTS social_accounts CASCADE;"))
            conn.execute(text("DROP TABLE IF EXISTS users CASCADE;"))
    except Exception as drop_err:
        print(f"Notice during CASCADE table drop: {drop_err}")

    Base.metadata.drop_all(bind=engine)
    print("Tables dropped successfully.")

    print("Recreating database tables from SQLAlchemy metadata...")
    Base.metadata.create_all(bind=engine)
    print("Tables created successfully.")

    # Seed data
    db = SessionLocal()
    try:
        # 1. Create default development user
        default_email = "creator@socialpilot.com"
        existing_user = db.query(User).filter(User.email == default_email).first()
        if not existing_user:
            default_user = User(
                name="SocialPilot Creator",
                email=default_email,
                password_hash=hash_password("Password123!"),
                role="creator"
            )
            db.add(default_user)
            db.commit()
            db.refresh(default_user)
            print(f"Created default user: {default_user.email} (ID: {default_user.id})")
            user_id = default_user.id
        else:
            user_id = existing_user.id

        # 2. Seed LinkedIn Social Account
        li_acc = db.query(SocialAccount).filter(
            SocialAccount.user_id == user_id,
            SocialAccount.platform == "linkedin"
        ).first()
        if not li_acc:
            li_acc = SocialAccount(
                user_id=user_id,
                platform="linkedin",
                account_name="LinkedIn Test Creator",
                platform_user_id="urn:li:person:12345",
                access_token=encrypt_token("AQTestLinkedInToken12345"),
                expires_at=datetime(2026, 11, 16)
            )
            db.add(li_acc)
            db.commit()
            print("Seeded vaulted LinkedIn OAuth account.")

        # 3. Seed real AI and Backend Engineering Campaigns
        camp1 = Campaign(
            user_id=user_id,
            campaign_name="Scheme Plus AI Engine",
            subtitle="Next-gen scheme intelligence & automated workflows",
            description="Campaign highlighting Scheme Plus architecture, distributed execution, and low-latency pipelines.",
            platform="LinkedIn",
            start_date=date(2026, 8, 1),
            end_date=date(2026, 9, 30),
            status="Active",
            objective="Product Launch",
            budget=12000.0
        )
        camp2 = Campaign(
            user_id=user_id,
            campaign_name="Multi-Cloud Cost Optimizer",
            subtitle="Autonomous cloud infrastructure FinOps & rightsizing",
            description="Deep-dive case studies on cutting AWS, GCP, and Azure compute overhead by 40%.",
            platform="LinkedIn",
            start_date=date(2026, 8, 5),
            end_date=date(2026, 10, 15),
            status="Active",
            objective="Lead Generation",
            budget=8500.0
        )
        camp3 = Campaign(
            user_id=user_id,
            campaign_name="Maintenance Agent Core",
            subtitle="Proactive self-healing backend infrastructure & observability",
            description="Autonomous error remediation, canary deployment checks, and real-time database healing.",
            platform="LinkedIn",
            start_date=date(2026, 8, 10),
            end_date=date(2026, 11, 1),
            status="Active",
            objective="Technical Thought Leadership",
            budget=15000.0
        )
        db.add_all([camp1, camp2, camp3])
        db.commit()
        db.refresh(camp1)
        db.refresh(camp2)
        db.refresh(camp3)
        print("Seeded 3 real AI and backend engineering campaigns.")

        # 4. Seed real AI and Backend Engineering Posts
        p1 = Post(
            user_id=user_id,
            campaign_id=camp1.id,
            title="Scheme Plus: High-Throughput Distributed Architecture",
            content="Excited to unveil our Scheme Plus AI engine! Built on an event-driven microservices architecture with Redis caching and PostgreSQL connection pooling for sub-10ms response times.",
            platform="LinkedIn",
            platforms="LinkedIn",
            status="Published",
            image_url="https://images.unsplash.com/photo-1557804506-669a67965ba0?w=600&h=400&fit=crop",
            scheduled_date=date(2026, 8, 15),
            scheduled_time="10:00 AM",
            linkedin_urn="urn:li:ugcPost:712345678901"
        )
        p2 = Post(
            user_id=user_id,
            campaign_id=camp2.id,
            title="Multi-Cloud Cost Optimizer: FinOps Automation",
            content="How we engineered our Multi-Cloud Cost Optimizer to dynamically scale Kubernetes worker nodes across AWS and GCP using automated telemetry and rightsizing.",
            platform="LinkedIn",
            platforms="LinkedIn",
            status="Published",
            image_url="https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=600&h=400&fit=crop",
            scheduled_date=date(2026, 8, 16),
            scheduled_time="02:30 PM",
            linkedin_urn="urn:li:ugcPost:712345678902"
        )
        p3 = Post(
            user_id=user_id,
            campaign_id=camp3.id,
            title="Maintenance Agent: Real-Time Self-Healing Backends",
            content="Introducing our Maintenance Agent! It detects database connection pool saturation, triggers automated failovers, and streams health metrics over SSE in real time.",
            platform="LinkedIn",
            platforms="LinkedIn",
            status="Published",
            image_url="https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&h=400&fit=crop",
            scheduled_date=date(2026, 8, 17),
            scheduled_time="09:15 AM",
            linkedin_urn="urn:li:ugcPost:712345678903"
        )
        db.add_all([p1, p2, p3])
        db.commit()
        print("Seeded 3 real AI and backend engineering posts.")

        # 5. Seed workspace notifications
        seed_notifications_database(db, user_id=user_id)
        print("Seeded 12 workspace notifications successfully.")

    except Exception as seed_err:
        print(f"Error during seeding: {seed_err}")
        db.rollback()
    finally:
        db.close()

    print("Database reset and synchronization complete!")


if __name__ == "__main__":
    reset_database()
