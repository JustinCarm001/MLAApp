# Database Schema Documentation

## Overview

This document describes the database schema for Hockey Live App V1.0. The schema supports user authentication, team management, and the foundation for future game session and video processing features.

## Database Configuration

### Local Development (SQLite)
- **Database File**: `backend/hockey_live.db`
- **Connection**: Configured in `app/core/database.py`
- **Engine**: SQLite with WAL mode for better concurrency
- **Migrations**: Tables created automatically on startup

### Production (PostgreSQL)
- **Database**: PostgreSQL 15+
- **Connection Pooling**: Configured for high concurrency
- **Migrations**: Alembic for schema versioning
- **Backup**: Regular automated backups

## Core Tables

### users

User authentication and profile information.

**Table Definition:**
```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    hashed_password VARCHAR(255) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    is_verified BOOLEAN DEFAULT FALSE,
    
    -- Profile information
    full_name VARCHAR(100) NOT NULL,
    first_name VARCHAR(50),
    last_name VARCHAR(50),
    phone VARCHAR(20),
    
    -- Role and permissions
    role VARCHAR(20) DEFAULT 'parent',
    
    -- Profile details
    profile_picture_url VARCHAR(500),
    bio TEXT,
    preferred_language VARCHAR(10) DEFAULT 'en',
    timezone VARCHAR(50) DEFAULT 'UTC',
    
    -- Notification preferences
    email_notifications BOOLEAN DEFAULT TRUE,
    push_notifications BOOLEAN DEFAULT TRUE,
    game_reminders BOOLEAN DEFAULT TRUE,
    
    -- Account metadata
    last_login TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Password reset
    reset_token VARCHAR(255),
    reset_token_expires TIMESTAMP WITH TIME ZONE,
    
    -- Email verification
    verification_token VARCHAR(255),
    verification_token_expires TIMESTAMP WITH TIME ZONE
);
```

**Indexes:**
```sql
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_created_at ON users(created_at);
```

**Constraints:**
- `email` must be unique and valid email format
- `role` must be one of: 'parent', 'coach', 'admin', 'viewer'
- `hashed_password` is bcrypt hashed, never store plain text

### teams

Hockey team information and management.

**Table Definition:**
```sql
CREATE TABLE teams (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    team_code VARCHAR(6) UNIQUE NOT NULL,
    
    -- Hockey-specific information
    league VARCHAR(100),
    age_group VARCHAR(20),
    season VARCHAR(20),
    
    -- Arena information
    home_arena VARCHAR(100),
    arena_address TEXT,
    
    -- Visual identity
    primary_color VARCHAR(7),
    secondary_color VARCHAR(7),
    logo_url VARCHAR(255),
    
    -- Team management
    created_by UUID NOT NULL REFERENCES users(id),
    head_coach_name VARCHAR(100),
    coach_email VARCHAR(255),
    coach_phone VARCHAR(20),
    
    -- Settings
    max_players INTEGER DEFAULT 25,
    allow_public_roster BOOLEAN DEFAULT FALSE,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

**Indexes:**
```sql
CREATE INDEX idx_teams_team_code ON teams(team_code);
CREATE INDEX idx_teams_created_by ON teams(created_by);
CREATE INDEX idx_teams_league ON teams(league);
CREATE INDEX idx_teams_age_group ON teams(age_group);
```

**Constraints:**
- `team_code` must be unique 6-character alphanumeric
- `age_group` typically: 'U8', 'U10', 'U12', 'U14', 'U16', 'U18'
- `primary_color` and `secondary_color` are hex color codes (#RRGGBB)
- `created_by` foreign key to users table

### team_memberships

Junction table for user-team relationships.

**Table Definition:**
```sql
CREATE TABLE team_memberships (
    id SERIAL PRIMARY KEY,
    team_id INTEGER NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Membership details
    role VARCHAR(20) DEFAULT 'parent',
    player_id INTEGER,
    is_active BOOLEAN DEFAULT TRUE,
    approved BOOLEAN DEFAULT TRUE,
    
    -- Timestamps
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Unique constraint
    UNIQUE(team_id, user_id)
);
```

**Indexes:**
```sql
CREATE INDEX idx_team_memberships_team_id ON team_memberships(team_id);
CREATE INDEX idx_team_memberships_user_id ON team_memberships(user_id);
CREATE INDEX idx_team_memberships_role ON team_memberships(role);
```

**Constraints:**
- `role` must be one of: 'owner', 'coach', 'parent', 'viewer'
- `player_id` links to player they're associated with (optional)
- Unique constraint prevents duplicate memberships

### players

Player roster information.

**Table Definition:**
```sql
CREATE TABLE players (
    id SERIAL PRIMARY KEY,
    team_id INTEGER NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    
    -- Player basic info
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    jersey_number INTEGER NOT NULL,
    position VARCHAR(20),
    shoots VARCHAR(1),
    
    -- Physical info
    height_inches INTEGER,
    weight_lbs INTEGER,
    birth_date DATE,
    jersey_size VARCHAR(10),
    
    -- Parent/Guardian info
    parent_name VARCHAR(100),
    parent_email VARCHAR(255),
    parent_phone VARCHAR(20),
    emergency_contact VARCHAR(100),
    emergency_phone VARCHAR(20),
    
    -- Additional info
    medical_notes TEXT,
    special_instructions TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Unique constraint
    UNIQUE(team_id, jersey_number)
);
```

**Indexes:**
```sql
CREATE INDEX idx_players_team_id ON players(team_id);
CREATE INDEX idx_players_jersey_number ON players(team_id, jersey_number);
CREATE INDEX idx_players_last_name ON players(last_name);
```

**Constraints:**
- `jersey_number` must be unique within team
- `position` typically: 'Forward', 'Defense', 'Goalie'
- `shoots` must be 'L' or 'R'

### user_tokens

JWT token management for authentication.

**Table Definition:**
```sql
CREATE TABLE user_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    token VARCHAR(255) UNIQUE NOT NULL,
    
    -- Token details
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    user_email VARCHAR(255) NOT NULL,
    token_type VARCHAR(20) DEFAULT 'access',
    
    -- Token metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP WITH TIME ZONE,
    is_revoked BOOLEAN DEFAULT FALSE,
    
    -- Device information
    device_type VARCHAR(50),
    device_id VARCHAR(255),
    ip_address VARCHAR(45),
    user_agent TEXT
);
```

**Indexes:**
```sql
CREATE INDEX idx_user_tokens_token ON user_tokens(token);
CREATE INDEX idx_user_tokens_user_id ON user_tokens(user_id);
CREATE INDEX idx_user_tokens_expires_at ON user_tokens(expires_at);
```

**Constraints:**
- `token` must be unique across all tokens
- `token_type` must be one of: 'access', 'refresh'
- `expires_at` enforces token expiration

## Relationships

### Entity Relationship Diagram

```
users (1) ←→ (M) team_memberships (M) ←→ (1) teams
  ↑                                           ↓
  └── created_by ─────────────────────────────┘
  
users (1) ←→ (M) user_tokens

teams (1) ←→ (M) players
```

### Relationship Details

**User to Teams (Many-to-Many):**
- Through `team_memberships` table
- User can be member of multiple teams
- Team can have multiple users
- Includes role-based access control

**User to Teams (One-to-Many Creator):**
- User can create multiple teams
- Each team has one creator
- Foreign key: `teams.created_by` → `users.id`

**User to Tokens (One-to-Many):**
- User can have multiple active tokens
- Each token belongs to one user
- Foreign key: `user_tokens.user_id` → `users.id`

**Team to Players (One-to-Many):**
- Team can have multiple players
- Each player belongs to one team
- Foreign key: `players.team_id` → `teams.id`

## Data Types and Constraints

### UUID Usage

**Primary Keys:**
- `users.id`: UUID for user identification
- `user_tokens.id`: UUID for token identification

**Foreign Keys:**
- `teams.created_by`: UUID referencing users
- `team_memberships.user_id`: UUID referencing users
- `user_tokens.user_id`: UUID referencing users

**Benefits:**
- Globally unique identifiers
- No sequential ID guessing
- Better security for public-facing APIs
- Easier distributed system support

### String Constraints

**Email Validation:**
- Format validation at application level
- Unique constraint at database level
- Case-insensitive comparison

**Team Code Generation:**
- 6-character alphanumeric
- Uppercase letters and numbers only
- Cryptographically secure generation
- Unique constraint enforced

**Color Codes:**
- Hex color format (#RRGGBB)
- Validation at application level
- Default values provided

## Database Migrations

### V1.0 Migration History

**Initial Schema (V1.0):**
```sql
-- Create users table
CREATE TABLE users (...);

-- Create teams table with proper foreign key
CREATE TABLE teams (...);

-- Create team_memberships junction table
CREATE TABLE team_memberships (...);

-- Create players table
CREATE TABLE players (...);

-- Create user_tokens table
CREATE TABLE user_tokens (...);

-- Create indexes for performance
CREATE INDEX ...;
```

### Migration Commands

**SQLite (Development):**
```bash
# Tables created automatically on startup
# No migration files needed for development
```

**PostgreSQL (Production):**
```bash
# Create migration
alembic revision --autogenerate -m "Initial schema"

# Apply migration
alembic upgrade head

# Rollback if needed
alembic downgrade -1
```

## Performance Considerations

### Indexes

**Query Performance:**
- Email lookups: `idx_users_email`
- Team code lookups: `idx_teams_team_code`
- User team memberships: `idx_team_memberships_user_id`
- Team member lists: `idx_team_memberships_team_id`

**Composite Indexes:**
- Player jersey numbers: `(team_id, jersey_number)`
- Team filtering: `(league, age_group)`

### Connection Pooling

**SQLite Configuration:**
```python
engine = create_engine(
    "sqlite:///./hockey_live.db",
    poolclass=StaticPool,
    connect_args={"check_same_thread": False},
    echo=DEBUG
)
```

**PostgreSQL Configuration:**
```python
engine = create_engine(
    DATABASE_URL,
    pool_size=20,
    max_overflow=30,
    pool_pre_ping=True,
    echo=DEBUG
)
```

## Security Features

### Password Security

**Hashing:**
- bcrypt algorithm with configurable rounds
- Salt automatically generated
- Password validation at registration

**Token Security:**
- JWT tokens with expiration
- Secure token storage
- Token revocation support

### Data Protection

**Personal Information:**
- Email addresses encrypted at rest (future)
- Phone numbers masked in logs
- Medical notes access restricted

**Access Control:**
- Role-based permissions
- Team-level access control
- API authentication required

## Backup and Recovery

### SQLite Backup

```bash
# Create backup
sqlite3 hockey_live.db ".backup backup.db"

# Restore backup
sqlite3 hockey_live.db ".restore backup.db"
```

### PostgreSQL Backup

```bash
# Create backup
pg_dump -h localhost -U admin hockey_live_dev > backup.sql

# Restore backup
psql -h localhost -U admin hockey_live_dev < backup.sql
```

## Testing Data

### Sample Data Generation

```python
def create_sample_data():
    """Create sample data for testing."""
    # Create test users
    test_users = [
        {"email": "coach@example.com", "role": "coach"},
        {"email": "parent@example.com", "role": "parent"}
    ]
    
    # Create test teams
    test_teams = [
        {"name": "Test Lightning", "age_group": "U16", "league": "Test League"}
    ]
    
    # Create test players
    test_players = [
        {"first_name": "Test", "last_name": "Player", "jersey_number": 1}
    ]
```

### Test Database

```bash
# Create test database
sqlite3 test_hockey_live.db < schema.sql

# Run tests with test database
TEST_DATABASE_URL=sqlite:///./test_hockey_live.db pytest
```

## Future Schema Enhancements

### Phase 2 Additions

**Game Sessions:**
- `game_sessions` table for game management
- `camera_positions` table for arena positioning
- `video_chunks` table for video processing

**Real-time Features:**
- `websocket_connections` table for connection management
- `game_events` table for real-time event tracking

### Phase 3 Additions

**Analytics:**
- `player_stats` table for performance tracking
- `game_analytics` table for game insights
- `video_analytics` table for video quality metrics

**Advanced Features:**
- `subscription_plans` table for billing
- `api_keys` table for third-party integrations
- `audit_logs` table for security tracking

This schema provides a solid foundation for the Hockey Live App and can scale to support future features while maintaining data integrity and performance.