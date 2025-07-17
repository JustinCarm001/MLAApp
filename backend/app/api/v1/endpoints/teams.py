"""
Team and roster management endpoints with proper authentication.
"""

from fastapi import APIRouter, HTTPException, status, Depends
from pydantic import BaseModel
from typing import Optional, List
from sqlalchemy.orm import Session
import secrets
import time

from app.core.database import get_db
from app.api.deps import get_current_active_user
from app.models.user import User

router = APIRouter()

# Simple in-memory storage for teams (will be replaced with database models later)
teams_db = {}
team_members_db = {}  # team_id -> list of user_emails

class TeamCreate(BaseModel):
    name: str
    league: Optional[str] = None
    age_group: Optional[str] = None
    season: Optional[str] = None
    home_arena: Optional[str] = None
    arena_address: Optional[str] = None
    primary_color: Optional[str] = "#1B365D"
    secondary_color: Optional[str] = "#FFFFFF"
    head_coach_name: Optional[str] = None
    coach_email: Optional[str] = None
    coach_phone: Optional[str] = None

class PlayerCreate(BaseModel):
    name: str
    number: int
    position: Optional[str] = None

class Team(BaseModel):
    id: str
    name: str
    league: Optional[str] = None
    age_group: Optional[str] = None
    season: Optional[str] = None
    home_arena: Optional[str] = None
    arena_address: Optional[str] = None
    primary_color: str = "#1B365D"
    secondary_color: str = "#FFFFFF"
    head_coach_name: Optional[str] = None
    coach_email: Optional[str] = None
    coach_phone: Optional[str] = None
    team_code: str
    created_by: str
    players: List[dict] = []
    role: str = "member"

@router.get("/my-teams")
async def get_my_teams(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get teams for the current user."""
    print(f"🔍 Getting teams for user: {current_user.email} (ID: {current_user.id})")
    
    user_teams = []
    for team_id, team_data in teams_db.items():
        # Check if user is creator or member
        if (team_data["created_by"] == current_user.email or 
            current_user.email in team_members_db.get(team_id, [])):
            
            role = "creator" if team_data["created_by"] == current_user.email else "member"
            team_copy = team_data.copy()
            team_copy["role"] = role
            user_teams.append(team_copy)
    
    print(f"✅ Found {len(user_teams)} teams for user")
    return {"teams": user_teams}

@router.post("/")
async def create_team(
    team_data: TeamCreate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Create new team."""
    print(f"🏒 Creating team: {team_data.name} for user: {current_user.email}")
    print(f"📋 Team data: {team_data.dict()}")
    
    # Generate team ID and code
    team_id = f"team_{len(teams_db) + 1}"
    team_code = ''.join(secrets.choice('ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789') for _ in range(6))
    
    # Create team with all fields
    new_team = {
        "id": team_id,
        "name": team_data.name,
        "league": team_data.league,
        "age_group": team_data.age_group,
        "season": team_data.season,
        "home_arena": team_data.home_arena,
        "arena_address": team_data.arena_address,
        "primary_color": team_data.primary_color,
        "secondary_color": team_data.secondary_color,
        "head_coach_name": team_data.head_coach_name,
        "coach_email": team_data.coach_email,
        "coach_phone": team_data.coach_phone,
        "team_code": team_code,
        "created_by": current_user.email,
        "created_at": time.time(),
        "players": []
    }
    
    teams_db[team_id] = new_team
    team_members_db[team_id] = [current_user.email]  # Creator is automatically a member
    
    # Return team with role
    response_team = new_team.copy()
    response_team["role"] = "creator"
    
    print(f"✅ Team created successfully: {new_team['name']} (Code: {team_code})")
    
    return {
        "message": "Team created successfully",
        "team": response_team
    }

@router.post("/join")
async def join_team(
    join_data: dict,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Join team using team code."""
    print(f"🔗 User {current_user.email} attempting to join team with code: {join_data.get('team_code')}")
    
    team_code = join_data.get("team_code")
    if not team_code:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Team code is required"
        )
    
    # Find team by code
    team_id = None
    for tid, team_data in teams_db.items():
        if team_data["team_code"] == team_code:
            team_id = tid
            break
    
    if not team_id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Invalid team code"
        )
    
    # Check if user is already a member
    if current_user.email in team_members_db.get(team_id, []):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You are already a member of this team"
        )
    
    # Add user to team
    if team_id not in team_members_db:
        team_members_db[team_id] = []
    team_members_db[team_id].append(current_user.email)
    
    print(f"✅ User {current_user.email} successfully joined team: {teams_db[team_id]['name']}")
    
    return {
        "message": "Successfully joined team",
        "team": teams_db[team_id]
    }

@router.get("/{team_id}")
async def get_team(
    team_id: str,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get team details."""
    print(f"🔍 Getting team details for: {team_id}")
    
    if team_id not in teams_db:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Team not found"
        )
    
    team_data = teams_db[team_id]
    
    # Check if user has access to this team
    if (team_data["created_by"] != current_user.email and 
        current_user.email not in team_members_db.get(team_id, [])):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied"
        )
    
    return team_data

@router.post("/{team_id}/players")
async def add_player(
    team_id: str,
    player_data: PlayerCreate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Add player to team."""
    print(f"🏒 Adding player {player_data.name} #{player_data.number} to team {team_id}")
    
    if team_id not in teams_db:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Team not found"
        )
    
    team_data = teams_db[team_id]
    
    # Check if user is team creator (only creators can add players)
    if team_data["created_by"] != current_user.email:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only team creators can add players"
        )
    
    # Check if jersey number is already taken
    for player in team_data["players"]:
        if player["number"] == player_data.number:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Jersey number {player_data.number} is already taken"
            )
    
    # Add player
    new_player = {
        "name": player_data.name,
        "number": player_data.number,
        "position": player_data.position,
        "added_at": time.time()
    }
    
    teams_db[team_id]["players"].append(new_player)
    
    print(f"✅ Player added successfully: {new_player['name']} #{new_player['number']}")
    
    return {
        "message": "Player added successfully",
        "player": new_player
    }
