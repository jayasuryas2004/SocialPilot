import os
import time
from fastapi import FastAPI, Depends, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from dotenv import load_dotenv
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from prometheus_client import Counter, Histogram, generate_latest, CONTENT_TYPE_LATEST

import sentry_sdk

from app.core.limiter import limiter
from app.scheduler import start_scheduler
from app.database import Base, engine, get_db
from app.api.workspace import seed_notifications_database, get_workspace_data
from app.core.security import get_current_user
from app.models.user import User

import app.models.post
import app.models.campaign
import app.models.notification
import app.models.user
import app.models.social_account
import app.models.scheduled_post

from app.api.auth import router as auth_router
from app.api.schedule import router as schedule_router
from app.api.campaign import router as campaign_router
from app.api.post import router as post_router, router_api as post_api_router
from app.api.reports import router as reports_router, router_api as reports_api_router
from app.api.oauth import router as oauth_router, router_alt as oauth_alt_router
from app.api.content import router as content_router, router_alt as content_alt_router
from app.api.analytics import router as analytics_router, router_alt as analytics_alt_router
from app.api.workspace import (
    router as workspace_router,
    router_alt as workspace_alt_router,
    notif_router,
    notif_router_alt
)
from fastapi.staticfiles import StaticFiles
from app.api.accounts import router as accounts_router, router_alt as accounts_alt_router
from app.api.settings import router as settings_router, router_api as settings_api_router
from app.api.admin import router as admin_alt_router, admin_router
from app.api.facebook import router as facebook_router, router_alt as facebook_alt_router
from app.api.publish import (
    router as publish_router,
    router_alt as publish_alt_router,
    router_social as publish_social_router,
    router_schedule,
    router_schedule_alt
)
from app.api.media import (
    router as media_router,
    router_alt as media_alt_router,
    router_direct as media_direct_router
)

load_dotenv()

# Sentry initialization for observability
sentry_dsn = os.getenv("SENTRY_DSN")
if sentry_dsn and len(sentry_dsn.strip()) > 0:
    try:
        sentry_sdk.init(
            dsn=sentry_dsn,
            traces_sample_rate=1.0,
            environment=os.getenv("ENVIRONMENT", "production")
        )
    except Exception as e:
        print("Notice: Sentry initialization failed:", e)

# Prometheus Telemetry Metrics
HTTP_REQUESTS_TOTAL = Counter(
    "socialpilot_http_requests_total",
    "Total count of HTTP requests received",
    ["method", "endpoint", "status_code"]
)
HTTP_REQUEST_DURATION_SECONDS = Histogram(
    "socialpilot_http_request_duration_seconds",
    "Histogram of HTTP request processing duration in seconds",
    ["method", "endpoint"]
)


class PrometheusMiddleware:
    """
    Pure ASGI middleware for low-overhead request telemetry and non-blocking streaming.
    Strictly uses standard control flow.
    """
    def __init__(self, app):
        self.app = app

    async def __call__(self, scope, receive, send):
        if scope["type"] != "http":
            await self.app(scope, receive, send)
            return

        path = scope.get("path", "")
        method = scope.get("method", "GET")

        if path.startswith("/metrics"):
            await self.app(scope, receive, send)
            return

        start_time = time.time()
        status_holder = [200]

        async def send_wrapper(message):
            if message["type"] == "http.response.start":
                status_holder[0] = message.get("status", 200)
            await send(message)

        try:
            await self.app(scope, receive, send_wrapper)
        finally:
            duration = time.time() - start_time
            HTTP_REQUESTS_TOTAL.labels(
                method=method,
                endpoint=path,
                status_code=str(status_holder[0])
            ).inc()
            HTTP_REQUEST_DURATION_SECONDS.labels(
                method=method,
                endpoint=path
            ).observe(duration)


app = FastAPI(
    title="SocialPilot Backend",
    version="1.0.0"
)

# Attach SlowAPI limiter and rate limit exceeded error handler
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# Attach pure ASGI Prometheus telemetry middleware
app.add_middleware(PrometheusMiddleware)

# Parse strictly allowed CORS origins from environment variable
default_origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:3001",
    "http://127.0.0.1:3001"
]

env_origins_str = os.getenv("ALLOWED_ORIGINS")
allowed_origins_list = []
for orig in default_origins:
    allowed_origins_list.append(orig)

if env_origins_str:
    for raw_item in env_origins_str.split(","):
        cleaned_item = raw_item.strip()
        if len(cleaned_item) > 0 and cleaned_item not in allowed_origins_list:
            allowed_origins_list.append(cleaned_item)

# Strict CORS middleware (no permissive regex)
app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def ensure_database_columns():
    """
    Checks and migrates missing user and post columns safely.
    Strictly uses standard for/while loops (no comprehensions or lambdas).
    """
    try:
        from sqlalchemy import text
        with engine.begin() as conn:
            # 1. Users Table Columns
            user_columns_to_add = [
                ("first_name", "VARCHAR"),
                ("last_name", "VARCHAR"),
                ("username", "VARCHAR"),
                ("avatar_url", "VARCHAR"),
                ("theme", "VARCHAR DEFAULT 'System'"),
                ("language", "VARCHAR DEFAULT 'English'")
            ]

            existing_user_cols = []
            if str(engine.url).startswith("sqlite"):
                result = conn.execute(text("PRAGMA table_info(users)"))
                for row in result.fetchall():
                    existing_user_cols.append(row[1])
            else:
                result = conn.execute(text(
                    "SELECT column_name FROM information_schema.columns WHERE table_name='users'"
                ))
                for row in result.fetchall():
                    existing_user_cols.append(row[0])

            for col_info in user_columns_to_add:
                col_name = col_info[0]
                col_type = col_info[1]
                if col_name not in existing_user_cols:
                    try:
                        conn.execute(text(f"ALTER TABLE users ADD COLUMN {col_name} {col_type};"))
                    except Exception as alter_err:
                        print(f"Notice adding column {col_name}: {alter_err}")

            # 2. Posts Table Columns (media_type and media_url)
            post_columns_to_add = [
                ("media_type", "VARCHAR DEFAULT 'image'"),
                ("media_url", "TEXT")
            ]

            existing_post_cols = []
            if str(engine.url).startswith("sqlite"):
                result = conn.execute(text("PRAGMA table_info(posts)"))
                for row in result.fetchall():
                    existing_post_cols.append(row[1])
            else:
                result = conn.execute(text(
                    "SELECT column_name FROM information_schema.columns WHERE table_name='posts'"
                ))
                for row in result.fetchall():
                    existing_post_cols.append(row[0])

            for col_info in post_columns_to_add:
                col_name = col_info[0]
                col_type = col_info[1]
                if col_name not in existing_post_cols:
                    try:
                        conn.execute(text(f"ALTER TABLE posts ADD COLUMN {col_name} {col_type};"))
                    except Exception as alter_err:
                        print(f"Notice adding post column {col_name}: {alter_err}")

    except Exception as e:
        print(f"Notice during schema column check: {e}")


# Ensure uploads directory structure exists and mount static route
uploads_root = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "uploads"))
os.makedirs(os.path.join(uploads_root, "avatars"), exist_ok=True)
os.makedirs(os.path.join(uploads_root, "media"), exist_ok=True)
app.mount("/uploads", StaticFiles(directory=uploads_root), name="uploads")


@app.on_event("startup")
def startup_event():
    # 1. Initialize database schema tables and ensure columns
    Base.metadata.create_all(bind=engine)
    ensure_database_columns()

    # 2. Seed dynamic workspace notifications into database
    seed_notifications_database()

    # 3. Start background APScheduler
    start_scheduler()


# Create database tables, ensure columns, and seed workspace notifications
Base.metadata.create_all(bind=engine)
ensure_database_columns()
seed_notifications_database()

# Register API Routers
app.include_router(auth_router)
app.include_router(schedule_router)
app.include_router(campaign_router)
app.include_router(post_router)
app.include_router(post_api_router)

app.include_router(reports_router)
app.include_router(reports_api_router)
app.include_router(oauth_router)
app.include_router(oauth_alt_router)
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
app.include_router(settings_router)
app.include_router(settings_api_router)
app.include_router(admin_router)
app.include_router(admin_alt_router)
app.include_router(facebook_router)
app.include_router(facebook_alt_router)
app.include_router(publish_router)
app.include_router(publish_alt_router)
app.include_router(publish_social_router)
app.include_router(router_schedule)
app.include_router(router_schedule_alt)
app.include_router(media_router)
app.include_router(media_alt_router)
app.include_router(media_direct_router)


@app.get("/metrics")
def get_prometheus_metrics():
    """
    Exposes application telemetry and performance metrics in Prometheus text format.
    """
    return Response(
        content=generate_latest(),
        media_type=CONTENT_TYPE_LATEST
    )


@app.get("/workspace/status")
@app.get("/api/workspace/status")
def root_workspace_status(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return get_workspace_data(db, current_user)


@app.get("/")
def home():
    return {
        "message": "Backend Working Fine 🚀"
    }