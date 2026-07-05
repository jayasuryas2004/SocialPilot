from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

DATABASE_URL = "sqlite:///./socialpilot.db" # says where to create the database
# engine - connects python to the database
engine = create_engine( 
    DATABASE_URL,
    connect_args={"check_same_thread": False}
)
# SessionLocal - useful to use the database operations like (insert,update,delete)
SessionLocal = sessionmaker(  
    autocommit=False,
    autoflush=False,
    bind=engine
)

Base = declarative_base() #foundation to create the tables(post,campaign)
# Dependency to get DB session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()