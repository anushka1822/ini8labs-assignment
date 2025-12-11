from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os
from dotenv import load_dotenv

# 1. Load environment variables from .env file
load_dotenv()

# 2. Get the Database URL
SQLALCHEMY_DATABASE_URL = os.getenv("DATABASE_URL")

# 3. Create the Database Engine
# we use echo=False to avoid spamming logs, change to True if you need to debug SQL
engine = create_engine(SQLALCHEMY_DATABASE_URL)

# 4. Create a Session factory
# This will be used to create a new database session for each request
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# 5. Base class for our models
Base = declarative_base()

# 6. Dependency to get DB session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()