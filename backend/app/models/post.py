from sqlalchemy import Column, Integer, String, DateTime
from database import Base


class Post(Base):
    __tablename__ = "posts"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    content = Column(String, nullable=False)
    platform = Column(String, nullable=False)
    schedule_time = Column(DateTime)
    status = Column(String, default="Pending")