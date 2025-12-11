from sqlalchemy import Column, Integer, String, DateTime
from datetime import datetime
from database import Base

class Document(Base):
    __tablename__ = "documents"

    id = Column(Integer, primary_key=True, index=True)
    filename = Column(String, index=True)      # Original filename (e.g., "report.pdf")
    s3_key = Column(String, unique=True)       # Unique ID in S3 bucket (e.g., "uuid.pdf")
    filesize = Column(Integer)                 # Size in bytes
    created_at = Column(DateTime, default=datetime.utcnow) # Upload timestamp