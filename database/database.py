from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# 🔌 DATABASE CONNECTION URL
# Update 'postgres', 'password', and 'db_name' to match your actual PostgreSQL setup!
DATABASE_URL = "postgresql://postgres:YOUR_PASSWORD@localhost:5432/DB_NAME"

# 1. Create the database engine
engine = create_engine(DATABASE_URL)

# 2. Create a session factory for generating database connections
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# 3. Create the Base class that your tables inherit from
Base = declarative_base()