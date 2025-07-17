"""
Pydantic schemas for team management API endpoints.
"""

from pydantic import BaseModel, validator
from typing import Optional, List
from datetime import datetime


class PlayerBase(BaseModel):
    first_name: str
    last_name: str
    jersey_number: int
    position: Optional[str] = None
    shoots: Optional[str] = None
    height_inches: Optional[int] = None
    weight_lbs: Optional[int] = None
    birth_date: Optional[datetime] = None
    jersey_size: Optional[str] = None
    parent_name: Optional[str] = None
    parent_email: Optional[str] = None
    parent_phone: Optional[str] = None
    emergency_contact: Optional[str] = None
    emergency_phone: Optional[str] = None
    medical_notes: Optional[str] = None
    special_instructions: Optional[str] = None

    @validator('jersey_number')
    def validate_jersey_number(cls, v):
        if v < 1 or v > 99:
            raise ValueError('Jersey number must be between 1 and 99')
        return v

    @validator('position')
    def validate_position(cls, v):
        if v and v not in ['Forward', 'Defense', 'Goalie']:
            raise ValueError('Position must be Forward, Defense, or Goalie')
        return v

    @validator('shoots')
    def validate_shoots(cls, v):
        if v and v not in ['L', 'R']:
            raise ValueError('Shoots must be L or R')
        return v


class PlayerCreate(PlayerBase):
    pass


class PlayerUpdate(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    jersey_number: Optional[int] = None
    position: Optional[str] = None
    shoots: Optional[str] = None
    height_inches: Optional[int] = None
    weight_lbs: Optional[int] = None
    birth_date: Optional[datetime] = None
    jersey_size: Optional[str] = None
    parent_name: Optional[str] = None
    parent_email: Optional[str] = None
    parent_phone: Optional[str] = None
    emergency_contact: Optional[str] = None
    emergency_phone: Optional[str] = None
    medical_notes: Optional[str] = None
    special_instructions: Optional[str] = None
    is_active: Optional[bool] = None


class Player(PlayerBase):
    id: int
    team_id: int
    is_active: bool
    created_at: datetime
    updated_at: Optional[datetime]

    class Config:
        from_attributes = True


class TeamBase(BaseModel):
    name: str
    league: Optional[str] = None
    age_group: Optional[str] = None
    season: Optional[str] = None
    home_arena: Optional[str] = None
    arena_address: Optional[str] = None
    primary_color: Optional[str] = None
    secondary_color: Optional[str] = None
    head_coach_name: Optional[str] = None
    coach_email: Optional[str] = None
    coach_phone: Optional[str] = None
    max_players: Optional[int] = 25
    allow_public_roster: Optional[bool] = False

    @validator('name')
    def validate_name(cls, v):
        if len(v.strip()) < 3:
            raise ValueError('Team name must be at least 3 characters')
        return v.strip()

    @validator('primary_color', 'secondary_color')
    def validate_color(cls, v):
        if v and not v.startswith('#'):
            raise ValueError('Color must be a hex color code starting with #')
        if v and len(v) != 7:
            raise ValueError('Color must be a 7-character hex code (e.g., #FF0000)')
        return v


class TeamCreate(TeamBase):
    pass


class TeamUpdate(BaseModel):
    name: Optional[str] = None
    league: Optional[str] = None
    age_group: Optional[str] = None
    season: Optional[str] = None
    home_arena: Optional[str] = None
    arena_address: Optional[str] = None
    primary_color: Optional[str] = None
    secondary_color: Optional[str] = None
    head_coach_name: Optional[str] = None
    coach_email: Optional[str] = None
    coach_phone: Optional[str] = None
    max_players: Optional[int] = None
    allow_public_roster: Optional[bool] = None


class Team(TeamBase):
    id: int
    team_code: str
    created_by: int
    created_at: datetime
    updated_at: Optional[datetime]
    players: List[Player] = []

    class Config:
        from_attributes = True


class TeamMembershipBase(BaseModel):
    role: str = "parent"
    player_id: Optional[int] = None

    @validator('role')
    def validate_role(cls, v):
        if v not in ['owner', 'coach', 'parent', 'viewer']:
            raise ValueError('Role must be owner, coach, parent, or viewer')
        return v


class TeamMembershipCreate(TeamMembershipBase):
    pass


class TeamMembership(TeamMembershipBase):
    id: int
    team_id: int
    user_id: int
    is_active: bool
    approved: bool
    joined_at: datetime

    class Config:
        from_attributes = True


class TeamJoinRequest(BaseModel):
    team_code: str
    role: str = "parent"
    player_connection: Optional[str] = None


class AvailableJerseyNumbers(BaseModel):
    available_numbers: List[int]
    taken_numbers: List[int]
    reserved_numbers: List[dict] = []


class TeamStats(BaseModel):
    total_players: int
    active_players: int
    goalies: int
    forwards: int
    defense: int
    average_age: Optional[float] = None
