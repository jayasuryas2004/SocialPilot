from sqlalchemy import Column, Integer, String, Float, Date
from database import Base


class Campaign(Base):
    __tablename__ = "campaigns"

    id = Column(Integer, primary_key=True, index=True)
    campaign_name = Column(String, nullable=False)
    platform = Column(String, nullable=False)
    start_date = Column(Date)
    end_date = Column(Date)
    budget = Column(Float)
    status = Column(String, default="Active")