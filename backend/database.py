"""
Database initialization and session management
"""
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, scoped_session
from models import Base
import os

# Database configuration
DATABASE_URL = os.getenv('DATABASE_URL', 'sqlite:///compass.db')

# Create engine
engine = create_engine(
    DATABASE_URL,
    echo=True if os.getenv('FLASK_ENV') == 'development' else False,
    connect_args={'check_same_thread': False} if 'sqlite' in DATABASE_URL else {}
)

# Create session factory
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
db_session = scoped_session(SessionLocal)


def init_db():
    """Initialize database - create all tables"""
    Base.metadata.create_all(bind=engine)
    print("✅ Database tables created successfully!")


def get_db():
    """Get database session - use this in routes"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
