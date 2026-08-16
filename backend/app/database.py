from sqlalchemy import create_engine, inspect, text
from sqlalchemy.orm import sessionmaker, declarative_base

DATABASE_URL = "sqlite:///./socialpilot.db"

engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False}
)

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)

Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def run_database_migrations():
    """
    Auto-migration function ensuring all required table columns exist in SQLite.
    Strictly uses standard Python iterative loops (no list comprehensions or lambda expressions).
    """
    Base.metadata.create_all(bind=engine)

    with engine.begin() as conn:
        # 1. Inspect notifications table via PRAGMA
        cursor = conn.execute(text("PRAGMA table_info(notifications)"))
        existing_cols = set()
        for row in cursor.fetchall():
            col_name = str(row[1])
            existing_cols.add(col_name)

        if len(existing_cols) > 0:
            if "title" not in existing_cols:
                conn.execute(text("ALTER TABLE notifications ADD COLUMN title VARCHAR"))
            if "type" not in existing_cols:
                conn.execute(text("ALTER TABLE notifications ADD COLUMN type VARCHAR"))
            if "category" not in existing_cols:
                conn.execute(text("ALTER TABLE notifications ADD COLUMN category VARCHAR"))
            if "is_read" not in existing_cols:
                conn.execute(text("ALTER TABLE notifications ADD COLUMN is_read BOOLEAN DEFAULT 0"))

        # 2. Inspect posts table via PRAGMA
        cursor_posts = conn.execute(text("PRAGMA table_info(posts)"))
        post_cols = set()
        for row in cursor_posts.fetchall():
            col_name = str(row[1])
            post_cols.add(col_name)

        if len(post_cols) > 0:
            if "image_url" not in post_cols:
                conn.execute(text("ALTER TABLE posts ADD COLUMN image_url TEXT"))
            if "linkedin_urn" not in post_cols:
                conn.execute(text("ALTER TABLE posts ADD COLUMN linkedin_urn VARCHAR"))
            if "campaign_id" not in post_cols:
                conn.execute(text("ALTER TABLE posts ADD COLUMN campaign_id VARCHAR"))