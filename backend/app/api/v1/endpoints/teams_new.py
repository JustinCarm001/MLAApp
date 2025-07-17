"""
Team management API endpoints with comprehensive CRUD operations.
"""

from fastapi import APIRouter, HTTPException, status, Header, Depends
from sqlalchemy.orm import Session
from typing import List, Optional
import secrets
import string
from datetime import datetime

from app.core.database import get_db
from app.models.user import UserToken, User as UserModel
from app.models.team import Team as TeamModel, Player as PlayerModel, TeamMembership
from app.schemas.team import (
    Team, TeamCreate, TeamUpdate,
    Player, PlayerCreate, PlayerUpdate,
    TeamJoinRequest, AvailableJerseyNumbers, TeamStats
)

router = APIRouter()

def get_user_from_token(authorization: str, db: Session) -> Optional[UserModel]:
    """Extract user from authorization token."""
    if not authorization or not authorization.startswith("Bearer "):
        return None
    
    token = authorization.replace("Bearer ", "")
    
    # Find token in database
    db_token = db.query(UserToken).filter(UserToken.token == token).first()
    if not db_token:
        return None
    
    # Get user from database
    user = db.query(UserModel).filter(UserModel.id == db_token.user_id).first()
    return user

def generate_team_code() -> str:
    """Generate a unique 6-character team code."""
    chars = string.ascii_uppercase + string.digits
    chars = chars.replace('0', '').replace('O', '').replace('I', '').replace('1')  # Remove confusing chars
    return ''.join(secrets.choice(chars) for _ in range(6))

def check_team_permission(user: UserModel, team: TeamModel, required_roles: List[str]) -> bool:
    """Check if user has required permission for team operations."""
    if team.created_by == user.id:
        return True  # Team creator has all permissions
    
    # Check team membership
    membership = db.query(TeamMembership).filter(
        TeamMembership.team_id == team.id,
        TeamMembership.user_id == user.id,
        TeamMembership.is_active == True,
        TeamMembership.approved == True
    ).first()
    
    if not membership:
        return False
    
    return membership.role in required_roles

# Team CRUD Operations

@router.post("/", response_model=Team)
async def create_team(
    team_data: TeamCreate, 
    authorization: str = Header(None), 
    db: Session = Depends(get_db)
):
    """Create a new hockey team."""
    user = get_user_from_token(authorization, db)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required"
        )
    
    # Generate unique team code
    team_code = generate_team_code()
    while db.query(TeamModel).filter(TeamModel.team_code == team_code).first():
        team_code = generate_team_code()
    
    # Create team
    db_team = TeamModel(
        **team_data.dict(),
        team_code=team_code,
        created_by=user.id
    )
    
    db.add(db_team)
    db.commit()
    db.refresh(db_team)
    
    # Add creator as team owner
    membership = TeamMembership(
        team_id=db_team.id,
        user_id=user.id,
        role="owner"
    )
    db.add(membership)
    db.commit()
    
    print(f"✅ Team created: {team_data.name} (Code: {team_code}) by {user.email}")
    
    return db_team

@router.get("/my-teams", response_model=List[Team])
async def get_my_teams(
    authorization: str = Header(None), 
    db: Session = Depends(get_db)
):
    """Get all teams for the current user."""
    user = get_user_from_token(authorization, db)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required"
        )
    
    # Get teams where user is creator or member
    teams = db.query(TeamModel).join(TeamMembership).filter(
        TeamMembership.user_id == user.id,
        TeamMembership.is_active == True
    ).all()
    
    # Also get teams created by user (in case membership record is missing)
    created_teams = db.query(TeamModel).filter(TeamModel.created_by == user.id).all()
    
    # Combine and deduplicate
    all_teams = list({team.id: team for team in teams + created_teams}.values())
    
    return all_teams

@router.get("/{team_id}", response_model=Team)
async def get_team(
    team_id: int, 
    authorization: str = Header(None), 
    db: Session = Depends(get_db)
):
    """Get team details with players."""
    user = get_user_from_token(authorization, db)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required"
        )
    
    team = db.query(TeamModel).filter(TeamModel.id == team_id).first()
    if not team:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Team not found"
        )
    
    # Check permissions
    if not check_team_permission(user, team, ["owner", "coach", "parent", "viewer"]):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied"
        )
    
    return team

@router.put("/{team_id}", response_model=Team)
async def update_team(
    team_id: int,
    team_update: TeamUpdate,
    authorization: str = Header(None), 
    db: Session = Depends(get_db)
):
    """Update team information."""
    user = get_user_from_token(authorization, db)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required"
        )
    
    team = db.query(TeamModel).filter(TeamModel.id == team_id).first()
    if not team:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Team not found"
        )
    
    # Check permissions (only owners and coaches can update)
    if not check_team_permission(user, team, ["owner", "coach"]):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only team owners and coaches can update team information"
        )
    
    # Update team
    update_data = team_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(team, field, value)
    
    db.commit()
    db.refresh(team)
    
    print(f"✅ Team updated: {team.name} by {user.email}")
    
    return team

# Player Management

@router.post("/{team_id}/players", response_model=Player)
async def add_player(
    team_id: int,
    player_data: PlayerCreate,
    authorization: str = Header(None), 
    db: Session = Depends(get_db)
):
    """Add a player to the team."""
    user = get_user_from_token(authorization, db)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required"
        )
    
    team = db.query(TeamModel).filter(TeamModel.id == team_id).first()
    if not team:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Team not found"
        )
    
    # Check permissions (only owners and coaches can add players)
    if not check_team_permission(user, team, ["owner", "coach"]):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only team owners and coaches can add players"
        )
    
    # Check if jersey number is already taken
    existing_player = db.query(PlayerModel).filter(
        PlayerModel.team_id == team_id,
        PlayerModel.jersey_number == player_data.jersey_number,
        PlayerModel.is_active == True
    ).first()
    
    if existing_player:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Jersey number {player_data.jersey_number} is already taken by {existing_player.first_name} {existing_player.last_name}"
        )
    
    # Check team size limit
    active_players = db.query(PlayerModel).filter(
        PlayerModel.team_id == team_id,
        PlayerModel.is_active == True
    ).count()
    
    if active_players >= team.max_players:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Team is full (maximum {team.max_players} players)"
        )
    
    # Create player
    db_player = PlayerModel(
        **player_data.dict(),
        team_id=team_id
    )
    
    db.add(db_player)
    db.commit()
    db.refresh(db_player)
    
    print(f"✅ Player added: #{player_data.jersey_number} {player_data.first_name} {player_data.last_name} to {team.name}")
    
    return db_player

@router.get("/{team_id}/players", response_model=List[Player])
async def get_team_players(
    team_id: int,
    active_only: bool = True,
    authorization: str = Header(None), 
    db: Session = Depends(get_db)
):
    """Get all players for a team."""
    user = get_user_from_token(authorization, db)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required"
        )
    
    team = db.query(TeamModel).filter(TeamModel.id == team_id).first()
    if not team:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Team not found"
        )
    
    # Check permissions
    if not check_team_permission(user, team, ["owner", "coach", "parent", "viewer"]):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied"
        )
    
    query = db.query(PlayerModel).filter(PlayerModel.team_id == team_id)
    
    if active_only:
        query = query.filter(PlayerModel.is_active == True)
    
    players = query.order_by(PlayerModel.jersey_number).all()
    
    return players

@router.put("/{team_id}/players/{player_id}", response_model=Player)
async def update_player(
    team_id: int,
    player_id: int,
    player_update: PlayerUpdate,
    authorization: str = Header(None), 
    db: Session = Depends(get_db)
):
    """Update player information."""
    user = get_user_from_token(authorization, db)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required"
        )
    
    team = db.query(TeamModel).filter(TeamModel.id == team_id).first()
    if not team:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Team not found"
        )
    
    player = db.query(PlayerModel).filter(
        PlayerModel.id == player_id,
        PlayerModel.team_id == team_id
    ).first()
    if not player:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Player not found"
        )
    
    # Check permissions
    if not check_team_permission(user, team, ["owner", "coach"]):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only team owners and coaches can update player information"
        )
    
    # Check jersey number conflict if updating jersey number
    update_data = player_update.dict(exclude_unset=True)
    if 'jersey_number' in update_data:
        existing_player = db.query(PlayerModel).filter(
            PlayerModel.team_id == team_id,
            PlayerModel.jersey_number == update_data['jersey_number'],
            PlayerModel.is_active == True,
            PlayerModel.id != player_id
        ).first()
        
        if existing_player:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Jersey number {update_data['jersey_number']} is already taken"
            )
    
    # Update player
    for field, value in update_data.items():
        setattr(player, field, value)
    
    db.commit()
    db.refresh(player)
    
    print(f"✅ Player updated: #{player.jersey_number} {player.first_name} {player.last_name}")
    
    return player

@router.delete("/{team_id}/players/{player_id}")
async def remove_player(
    team_id: int,
    player_id: int,
    authorization: str = Header(None), 
    db: Session = Depends(get_db)
):
    """Remove a player from the team (soft delete)."""
    user = get_user_from_token(authorization, db)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required"
        )
    
    team = db.query(TeamModel).filter(TeamModel.id == team_id).first()
    if not team:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Team not found"
        )
    
    player = db.query(PlayerModel).filter(
        PlayerModel.id == player_id,
        PlayerModel.team_id == team_id
    ).first()
    if not player:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Player not found"
        )
    
    # Check permissions (only owners can remove players)
    if not check_team_permission(user, team, ["owner"]):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only team owners can remove players"
        )
    
    # Soft delete
    player.is_active = False
    db.commit()
    
    print(f"✅ Player removed: #{player.jersey_number} {player.first_name} {player.last_name} from {team.name}")
    
    return {"message": "Player removed successfully"}

# Utility Endpoints

@router.get("/{team_id}/available-numbers", response_model=AvailableJerseyNumbers)
async def get_available_jersey_numbers(
    team_id: int,
    authorization: str = Header(None), 
    db: Session = Depends(get_db)
):
    """Get available jersey numbers for a team."""
    user = get_user_from_token(authorization, db)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required"
        )
    
    team = db.query(TeamModel).filter(TeamModel.id == team_id).first()
    if not team:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Team not found"
        )
    
    # Get taken numbers
    taken_numbers = [
        player.jersey_number for player in 
        db.query(PlayerModel).filter(
            PlayerModel.team_id == team_id,
            PlayerModel.is_active == True
        ).all()
    ]
    
    # Generate available numbers (1-99)
    all_numbers = list(range(1, 100))
    available_numbers = [num for num in all_numbers if num not in taken_numbers]
    
    return AvailableJerseyNumbers(
        available_numbers=available_numbers,
        taken_numbers=sorted(taken_numbers),
        reserved_numbers=[]  # Can add reserved numbers logic later
    )

@router.get("/{team_id}/stats", response_model=TeamStats)
async def get_team_stats(
    team_id: int,
    authorization: str = Header(None), 
    db: Session = Depends(get_db)
):
    """Get team statistics."""
    user = get_user_from_token(authorization, db)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required"
        )
    
    team = db.query(TeamModel).filter(TeamModel.id == team_id).first()
    if not team:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Team not found"
        )
    
    # Check permissions
    if not check_team_permission(user, team, ["owner", "coach", "parent", "viewer"]):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied"
        )
    
    players = db.query(PlayerModel).filter(
        PlayerModel.team_id == team_id,
        PlayerModel.is_active == True
    ).all()
    
    # Calculate stats
    total_players = len(players)
    goalies = len([p for p in players if p.position == "Goalie"])
    forwards = len([p for p in players if p.position == "Forward"])
    defense = len([p for p in players if p.position == "Defense"])
    
    return TeamStats(
        total_players=total_players,
        active_players=total_players,
        goalies=goalies,
        forwards=forwards,
        defense=defense
    )

# Team Joining (placeholder for next phase)
@router.post("/join")
async def join_team(
    join_request: TeamJoinRequest,
    authorization: str = Header(None), 
    db: Session = Depends(get_db)
):
    """Join a team using team code."""
    return {"message": "Team joining feature coming in Phase 2!"}
