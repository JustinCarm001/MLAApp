"""
Team model for hockey team management.
"""

from sqlalchemy import Column, Integer, String, DateTime, Boolean, Text, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.core.database import Base


class Team(Base):
    """Team model for storing hockey team information."""
    
    __tablename__ = "teams"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    team_code = Column(String(6), unique=True, index=True, nullable=False)
    league = Column(String(100))
    age_group = Column(String(20))  # U8, U10, U12, etc.
    season = Column(String(20))  # 2024-2025
    home_arena = Column(String(100))
    arena_address = Column(Text)
    
    # Team colors
    primary_color = Column(String(7))  # Hex color code
    secondary_color = Column(String(7))  # Hex color code
    logo_url = Column(String(255))
    
    # Team management
    created_by = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)  # User ID who created the team
    head_coach_name = Column(String(100))
    coach_email = Column(String(255))
    coach_phone = Column(String(20))
    
    # Settings
    max_players = Column(Integer, default=25)
    allow_public_roster = Column(Boolean, default=False)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    creator = relationship("User", back_populates="created_teams")
    players = relationship("Player", back_populates="team", cascade="all, delete-orphan")
    memberships = relationship("TeamMembership", back_populates="team", cascade="all, delete-orphan")


class Player(Base):
    """Player model for storing hockey player information."""
    
    __tablename__ = "players"
    
    id = Column(Integer, primary_key=True, index=True)
    team_id = Column(Integer, ForeignKey("teams.id"), nullable=False, index=True)
    
    # Player basic info
    first_name = Column(String(50), nullable=False)
    last_name = Column(String(50), nullable=False)
    jersey_number = Column(Integer, nullable=False)
    position = Column(String(20))  # Forward, Defense, Goalie
    shoots = Column(String(1))  # L or R
    
    # Physical info
    height_inches = Column(Integer)
    weight_lbs = Column(Integer)
    birth_date = Column(DateTime)
    jersey_size = Column(String(10))  # XS, S, M, L, XL
    
    # Parent/Guardian info
    parent_name = Column(String(100))
    parent_email = Column(String(255))
    parent_phone = Column(String(20))
    emergency_contact = Column(String(100))
    emergency_phone = Column(String(20))
    
    # Additional info
    medical_notes = Column(Text)
    special_instructions = Column(Text)
    is_active = Column(Boolean, default=True)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    team = relationship("Team", back_populates="players")


class TeamMembership(Base):
    """Team membership model for managing user access to teams."""
    
    __tablename__ = "team_memberships"
    
    id = Column(Integer, primary_key=True, index=True)
    team_id = Column(Integer, ForeignKey("teams.id"), nullable=False, index=True)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False, index=True)
    
    # Membership details
    role = Column(String(20), default="parent")  # owner, coach, parent, viewer
    player_id = Column(Integer)  # Link to their child if they're a parent
    is_active = Column(Boolean, default=True)
    approved = Column(Boolean, default=True)  # For approval workflows
    
    # Timestamps
    joined_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    team = relationship("Team", back_populates="memberships")
    user = relationship("User", back_populates="team_memberships")
