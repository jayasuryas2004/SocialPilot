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
    inspector = inspect(engine)

    with engine.begin() as conn:
        # 1. Inspect notifications table
        if inspector.has_table("notifications"):
            columns_info = inspector.get_columns("notifications")
            existing_cols = set()
            for col in columns_info:
                existing_cols.add(col.get("name"))

            if "title" not in existing_cols:
                conn.execute(text("ALTER TABLE notifications ADD COLUMN title VARCHAR"))
            if "type" not in existing_cols:
                conn.execute(text("ALTER TABLE notifications ADD COLUMN type VARCHAR"))
            if "category" not in existing_cols:
                conn.execute(text("ALTER TABLE notifications ADD COLUMN category VARCHAR"))
            if "is_read" not in existing_cols:
                conn.execute(text("ALTER TABLE notifications ADD COLUMN is_read BOOLEAN DEFAULT 0"))

        # 2. Inspect posts table
        if inspector.has_table("posts"):
            columns_info = inspector.get_columns("posts")
            existing_cols = set()
            for col in columns_info:
                existing_cols.add(col.get("name"))

            if "image_url" not in existing_cols:
                conn.execute(text("ALTER TABLE posts ADD COLUMN image_url TEXT"))
            if "linkedin_urn" not in existing_cols:
                conn.execute(text("ALTER TABLE posts ADD COLUMN linkedin_urn VARCHAR"))
            if "campaign_id" not in existing_cols:
                conn.execute(text("ALTER TABLE posts ADD COLUMN campaign_id VARCHAR"))