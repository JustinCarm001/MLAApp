"""
Database configuration and session management for Hockey Live App.
Uses SQLAlchemy with PostgreSQL for robust data persistence.
"""

from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
from sqlalchemy.pool import StaticPool
from typing import Generator
import logging

from app.core.config import settings

logger = logging.getLogger(__name__)

# Create database engine
engine = create_engine(
    settings.DATABASE_URL,
    pool_size=settings.DATABASE_POOL_SIZE,
    max_overflow=settings.DATABASE_MAX_OVERFLOW,
    pool_pre_ping=True,
    echo=settings.DEBUG  # Log SQL queries in debug mode
)

# Create test engine for testing
test_engine = None
if settings.TEST_DATABASE_URL:
    test_engine = create_engine(
        settings.TEST_DATABASE_URL,
        poolclass=StaticPool,
        connect_args={"check_same_thread": False},
        echo=False
    )

# Create session factory
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Create test session factory
TestSessionLocal = None
if test_engine:
    TestSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=test_engine)

# Create base class for database models
Base = declarative_base()

def get_db() -> Generator[Session, None, None]:
    """
    Get database session dependency for FastAPI endpoints.
    
    Yields:
        Database session
    """
    db = SessionLocal()
    try:
        yield db
    except Exception as e:
        logger.error(f"Database session error: {e}")
        db.rollback()
        raise
    finally:
        db.close()

def get_test_db() -> Generator[Session, None, None]:
    """
    Get test database session for testing.
    
    Yields:
        Test database session
    """
    if not TestSessionLocal:
        raise RuntimeError("Test database not configured")
    
    db = TestSessionLocal()
    try:
        yield db
    except Exception as e:
        logger.error(f"Test database session error: {e}")
        db.rollback()
        raise
    finally:
        db.close()

def create_tables():
    """Create all database tables."""
    try:
        Base.metadata.create_all(bind=engine)
        logger.info("Database tables created successfully")
    except Exception as e:
        logger.error(f"Error creating database tables: {e}")
        raise

def drop_tables():
    """Drop all database tables (use with caution!)."""
    try:
        Base.metadata.drop_all(bind=engine)
        logger.info("Database tables dropped successfully")
    except Exception as e:
        logger.error(f"Error dropping database tables: {e}")
        raise

def create_test_tables():
    """Create test database tables."""
    if not test_engine:
        raise RuntimeError("Test database not configured")
    
    try:
        Base.metadata.create_all(bind=test_engine)
        logger.info("Test database tables created successfully")
    except Exception as e:
        logger.error(f"Error creating test database tables: {e}")
        raise

def drop_test_tables():
    """Drop test database tables."""
    if not test_engine:
        raise RuntimeError("Test database not configured")
    
    try:
        Base.metadata.drop_all(bind=test_engine)
        logger.info("Test database tables dropped successfully")
    except Exception as e:
        logger.error(f"Error dropping test database tables: {e}")
        raise

# Health check function
def check_database_health() -> bool:
    """
    Check if database connection is healthy.
    
    Returns:
        True if database is accessible, False otherwise
    """
    try:
        db = SessionLocal()
        # Simple query to test connection
        db.execute("SELECT 1")
        db.close()
        return True
    except Exception as e:
        logger.error(f"Database health check failed: {e}")
        return False