import os
import sys
from logging.config import fileConfig
from sqlalchemy import engine_from_config, create_engine
from sqlalchemy import pool
from alembic import context
from dotenv import load_dotenv

# Ensure backend root is on sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
load_dotenv()

# Import application Base and all SQLAlchemy models
from app.database import Base
import app.models.user
import app.models.post
import app.models.campaign
import app.models.notification
import app.models.social_account

# Alembic Config object
config = context.config

# Interpret the config file for Python logging
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

# Target metadata for autogenerate support
target_metadata = Base.metadata


def get_database_url() -> str:
    """
    Retrieves the dynamic database connection URL from environment variables.
    """
    env_url = os.getenv("DATABASE_URL")
    if env_url:
        return env_url
    ini_url = config.get_main_option("sqlalchemy.url")
    if ini_url and ini_url != "driver://user:pass@localhost/dbname":
        return ini_url
    return "postgresql+psycopg2://user:password@localhost:5432/social_scheduler"


def run_migrations_offline() -> None:
    """
    Run migrations in 'offline' mode.
    Strictly uses standard Python control flow.
    """
    url = get_database_url()
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
        compare_type=True
    )

    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online() -> None:
    """
    Run migrations in 'online' mode with dynamic database connection.
    Strictly uses standard Python control flow.
    """
    db_url = get_database_url()

    if db_url.startswith("sqlite"):
        connectable = create_engine(
            db_url,
            connect_args={"check_same_thread": False},
            poolclass=pool.NullPool
        )
    else:
        connectable = create_engine(
            db_url,
            poolclass=pool.NullPool
        )

    with connectable.connect() as connection:
        context.configure(
            connection=connection,
            target_metadata=target_metadata,
            compare_type=True
        )

        with context.begin_transaction():
            context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
