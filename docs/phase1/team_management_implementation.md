# Team Management Implementation - Phase 1

## Overview

This document describes the implementation of team management features in Hockey Live App V1.0. The team management system allows coaches and organizers to create teams, manage rosters, and coordinate with parents for game sessions.

## Architecture

### Database Schema

The team management system uses three main database models:

#### User Model
- Primary key: UUID
- Contains authentication and profile information
- Supports roles: parent, coach, admin, viewer

#### Team Model
- Primary key: Integer (auto-increment)
- Foreign key: created_by (UUID) → User.id
- Contains team information and hockey-specific fields

#### TeamMembership Model
- Junction table for many-to-many User-Team relationships
- Foreign keys: user_id (UUID) → User.id, team_id (Integer) → Team.id
- Supports different roles within teams

### API Endpoints

#### Team Creation (POST /api/v1/teams)
- Creates new team with comprehensive hockey information
- Generates unique 6-digit team code
- Automatically adds creator as team member with "creator" role

#### Team Listing (GET /api/v1/teams/my-teams)
- Returns all teams user is associated with
- Includes role information (creator, member)
- Supports pagination for large team lists

#### Team Joining (POST /api/v1/teams/join)
- Allows users to join existing teams using team code
- Validates team code and adds user as member
- Supports approval workflows (future enhancement)

## Implementation Details

### Team Code Generation

```python
import secrets

def generate_team_code():
    """Generate unique 6-digit team code."""
    return ''.join(secrets.choice('ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789') for _ in range(6))
```

**Features:**
- 6-character alphanumeric codes
- Cryptographically secure random generation
- Easy for parents to enter manually
- Collision detection (future enhancement)

### Team Data Structure

```python
class Team(Base):
    __tablename__ = "teams"
    
    # Basic identification
    id = Column(Integer, primary_key=True)
    name = Column(String(100), nullable=False)
    team_code = Column(String(6), unique=True, nullable=False)
    
    # Hockey-specific information
    league = Column(String(100))
    age_group = Column(String(20))  # U8, U10, U12, U14, U16, U18
    season = Column(String(20))     # 2024-2025
    
    # Arena information
    home_arena = Column(String(100))
    arena_address = Column(Text)
    
    # Visual identity
    primary_color = Column(String(7))    # Hex color code
    secondary_color = Column(String(7))  # Hex color code
    logo_url = Column(String(255))
    
    # Team management
    created_by = Column(UUID(as_uuid=True), ForeignKey("users.id"))
    head_coach_name = Column(String(100))
    coach_email = Column(String(255))
    coach_phone = Column(String(20))
    
    # Settings
    max_players = Column(Integer, default=25)
    allow_public_roster = Column(Boolean, default=False)
    
    # Relationships
    creator = relationship("User", back_populates="created_teams")
    memberships = relationship("TeamMembership", back_populates="team")
    players = relationship("Player", back_populates="team")
```

### Mobile App Integration

#### Team Creation Form

The mobile app provides a comprehensive team creation form with:

**Basic Information:**
- Team name
- League (dropdown with common leagues)
- Age group (U8, U10, U12, U14, U16, U18)
- Season (auto-populated with current season)

**Arena Information:**
- Home arena name
- Arena address (for GPS/mapping)

**Visual Identity:**
- Primary team color (color picker)
- Secondary team color
- Logo upload (future enhancement)

**Coaching Information:**
- Head coach name
- Coach email
- Coach phone number

#### Team Code Sharing

Teams can be shared via:
- 6-digit team code for manual entry
- QR code generation (future enhancement)
- Share link for messaging apps

### Role-Based Access Control

#### Team Creator Role
- Can modify team information
- Can add/remove team members
- Can create game sessions
- Can manage team roster

#### Team Member Role
- Can view team information
- Can participate in game sessions
- Can view team roster (if public)
- Cannot modify team settings

#### Permission System

```python
def check_team_permission(user_id: str, team_id: int, required_role: str) -> bool:
    """Check if user has required permission for team."""
    membership = db.query(TeamMembership).filter(
        TeamMembership.user_id == user_id,
        TeamMembership.team_id == team_id,
        TeamMembership.is_active == True
    ).first()
    
    if not membership:
        return False
    
    # Role hierarchy: creator > coach > member
    role_hierarchy = ["member", "coach", "creator"]
    user_role_level = role_hierarchy.index(membership.role)
    required_role_level = role_hierarchy.index(required_role)
    
    return user_role_level >= required_role_level
```

## User Experience Flow

### Team Creation Flow

1. **User Authentication**: User must be logged in
2. **Form Completion**: Fill comprehensive team creation form
3. **Team Code Generation**: System generates unique 6-digit code
4. **Team Storage**: Team saved to database with creator relationship
5. **Success Response**: Team information returned with code for sharing

### Team Joining Flow

1. **Code Entry**: User enters 6-digit team code
2. **Team Validation**: System validates code exists and is active
3. **Membership Creation**: User added to team with "member" role
4. **Success Response**: Team information returned with user's role

### Team Management Flow

1. **Team Listing**: User sees all teams they're associated with
2. **Role Display**: Clear indication of user's role in each team
3. **Quick Actions**: Easy access to team-specific actions
4. **Navigation**: Seamless navigation to team details

## API Response Examples

### Team Creation Response

```json
{
  "message": "Team created successfully",
  "team": {
    "id": "team_1",
    "name": "Justin Slashers",
    "team_code": "ABC123",
    "league": "CAHL",
    "age_group": "U18",
    "season": "2024-2025",
    "home_arena": "Carstairs Memorial",
    "primary_color": "#1B365D",
    "secondary_color": "#FFFFFF",
    "head_coach_name": "Justin Carm",
    "coach_email": "jccarm10@gmail.com",
    "coach_phone": "3688870382",
    "created_by": "jccarm10@gmail.com",
    "created_at": 1752788052.1776607,
    "role": "creator",
    "players": []
  }
}
```

### Team Listing Response

```json
{
  "teams": [
    {
      "id": "team_1",
      "name": "Justin Slashers",
      "team_code": "ABC123",
      "league": "CAHL",
      "age_group": "U18",
      "season": "2024-2025",
      "home_arena": "Carstairs Memorial",
      "role": "creator",
      "players": []
    }
  ]
}
```

## Security Considerations

### Team Code Security

- **Expiration**: Team codes should expire after reasonable time
- **Rate Limiting**: Limit team creation to prevent abuse
- **Collision Detection**: Ensure unique team codes
- **Audit Trail**: Log team access and modifications

### Access Control

- **Authentication Required**: All team operations require valid JWT
- **Role Validation**: Proper role checking for sensitive operations
- **Input Validation**: Sanitize all team data inputs
- **SQL Injection Prevention**: Use parameterized queries

## Performance Optimizations

### Database Indexes

```sql
-- Team code lookups
CREATE INDEX idx_teams_team_code ON teams(team_code);

-- User team memberships
CREATE INDEX idx_team_memberships_user_id ON team_memberships(user_id);
CREATE INDEX idx_team_memberships_team_id ON team_memberships(team_id);

-- Team creator lookups
CREATE INDEX idx_teams_created_by ON teams(created_by);
```

### Caching Strategy

- **Team Information**: Cache team details for faster lookups
- **User Memberships**: Cache user's team memberships
- **Team Codes**: Cache team code to team ID mappings

## Testing Strategy

### Unit Tests

```python
def test_team_creation():
    """Test team creation with valid data."""
    team_data = {
        "name": "Test Team",
        "league": "Test League",
        "age_group": "U16"
    }
    response = client.post("/api/v1/teams", json=team_data)
    assert response.status_code == 201
    assert "team_code" in response.json()["team"]

def test_team_joining():
    """Test joining team with valid code."""
    # Create team first
    team = create_test_team()
    
    # Join with different user
    response = client.post("/api/v1/teams/join", json={
        "team_code": team["team_code"]
    })
    assert response.status_code == 200
    assert response.json()["team"]["role"] == "member"
```

### Integration Tests

```python
def test_complete_team_workflow():
    """Test complete team creation and joining workflow."""
    # Coach creates team
    coach_token = authenticate_user("coach@example.com")
    team_response = create_team(coach_token, {
        "name": "Integration Test Team",
        "league": "Test League"
    })
    
    team_code = team_response["team"]["team_code"]
    
    # Parent joins team
    parent_token = authenticate_user("parent@example.com")
    join_response = join_team(parent_token, team_code)
    
    assert join_response["team"]["role"] == "member"
    
    # Verify team membership
    teams_response = get_user_teams(parent_token)
    assert len(teams_response["teams"]) == 1
```

## Future Enhancements

### Phase 2 Enhancements

1. **Player Management**: Add/edit/remove players from roster
2. **Team Statistics**: Track team performance metrics
3. **Team Communication**: Built-in messaging system
4. **Schedule Management**: Game scheduling and calendar integration

### Phase 3 Enhancements

1. **Advanced Permissions**: Granular role-based permissions
2. **Team Analytics**: Performance analytics and reporting
3. **Multi-Season Support**: Historical season data
4. **Integration APIs**: Third-party league management systems

## Error Handling

### Common Error Scenarios

```python
# Team code not found
{
  "error": "team_not_found",
  "message": "Team with code 'ABC123' not found",
  "details": {"team_code": "ABC123"}
}

# Duplicate team code
{
  "error": "team_code_exists",
  "message": "Team code already exists",
  "details": {"team_code": "ABC123"}
}

# Insufficient permissions
{
  "error": "insufficient_permissions",
  "message": "You don't have permission to modify this team",
  "details": {"required_role": "creator"}
}
```

## Monitoring and Analytics

### Key Metrics

- **Team Creation Rate**: Teams created per day/week/month
- **Team Join Rate**: Success rate of team joining attempts
- **Team Code Usage**: How often team codes are used
- **Active Teams**: Teams with recent activity
- **User Engagement**: Average teams per user

### Logging

```python
import logging

logger = logging.getLogger(__name__)

# Team creation
logger.info(f"Team created: {team.name} by {user.email}")

# Team joining
logger.info(f"User {user.email} joined team {team.name}")

# Permission errors
logger.warning(f"Permission denied: {user.email} tried to modify team {team.name}")
```

This implementation provides a solid foundation for team management that can scale to support the full Hockey Live App ecosystem.