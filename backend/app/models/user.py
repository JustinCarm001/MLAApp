"""
User model for Hockey Live App authentication and profile management.
Updated to include team relationships.
"""

from sqlalchemy import Column, Integer, String, DateTime, Boolean, Text, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import uuid

from app.core.database import Base


class User(Base):
    """User model for storing user account information."""
    
    __tablename__ = "users"
    
    # Primary identifiers
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    
    # Authentication
    hashed_password = Column(String(255), nullable=False)
    is_active = Column(Boolean, default=True)
    is_verified = Column(Boolean, default=False)
    
    # Profile information
    full_name = Column(String(100), nullable=False)
    first_name = Column(String(50), nullable=True)
    last_name = Column(String(50), nullable=True)
    phone = Column(String(20), nullable=True)
    
    # Role and permissions
    role = Column(String(20), default="parent")  # parent, coach, admin, viewer
    
    # Profile details
    profile_picture_url = Column(String(500), nullable=True)
    bio = Column(Text, nullable=True)
    preferred_language = Column(String(10), default="en")
    timezone = Column(String(50), default="UTC")
    
    # Notification preferences
    email_notifications = Column(Boolean, default=True)
    push_notifications = Column(Boolean, default=True)
    game_reminders = Column(Boolean, default=True)
    
    # Account metadata
    last_login = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Password reset
    reset_token = Column(String(255), nullable=True)
    reset_token_expires = Column(DateTime(timezone=True), nullable=True)
    
    # Email verification
    verification_token = Column(String(255), nullable=True)
    verification_token_expires = Column(DateTime(timezone=True), nullable=True)
    
    # Relationships
    created_teams = relationship("Team", back_populates="creator")
    team_memberships = relationship("TeamMembership", back_populates="user")
    user_tokens = relationship("UserToken", back_populates="user", cascade="all, delete-orphan")
    
    def __repr__(self):
        return f"<User(email='{self.email}', name='{self.full_name}')>"


class UserToken(Base):
    """User authentication tokens."""
    
    __tablename__ = "user_tokens"
    
    # Primary identifiers
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    token = Column(String(255), unique=True, index=True, nullable=False)
    
    # Token details
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    user_email = Column(String(255), nullable=False)
    token_type = Column(String(20), default="access")  # access, refresh
    
    # Token metadata
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    expires_at = Column(DateTime(timezone=True), nullable=True)
    is_revoked = Column(Boolean, default=False)
    
    # Device information (optional)
    device_type = Column(String(50), nullable=True)  # mobile, web, desktop
    device_id = Column(String(255), nullable=True)
    ip_address = Column(String(45), nullable=True)
    user_agent = Column(Text, nullable=True)
    
    # Relationship
    user = relationship("User", back_populates="user_tokens")
    
    def __repr__(self):
        return f"<UserToken(user_email='{self.user_email}', type='{self.token_type}')>"
