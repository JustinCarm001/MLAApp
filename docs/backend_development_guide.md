# Backend Development Guide - Hockey Live App

## Quick Start

### 1. Setup Development Environment

**For Local Development (SQLite - Recommended):**
```bash
# Clone repository and navigate to project root
cd /path/to/MLAApp

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On macOS/Linux:
source venv/bin/activate
# On Windows:
venv\Scripts\activate

# Install Python dependencies (SQLite version)
pip install -r backend/requirements-local.txt

# Navigate to backend directory
cd backend

# Start development server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

**For Production Development (PostgreSQL):**
```bash
# Start services with Docker Compose
docker-compose up -d postgres redis

# Install Python dependencies (PostgreSQL version)
pip install -r backend/requirements.txt

# Run database migrations
alembic upgrade head

# Start development server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### 2. Access Points

- **API Documentation**: http://localhost:8000/docs
- **Alternative Docs**: http://localhost:8000/redoc
- **Health Check**: http://localhost:8000/health
- **Database Admin**: http://localhost:5050 (PgAdmin - PostgreSQL only)
- **Task Monitor**: http://localhost:5555 (Flower - PostgreSQL only)

### 3. Database Configuration

**SQLite (Local Development):**
- Database file: `backend/hockey_live.db`
- Created automatically on first run
- No additional setup required
- Engine configured in `app/core/database.py` with SQLite optimizations

**PostgreSQL (Production):**
- Requires Docker Compose setup
- Connection pooling enabled
- Alembic migrations supported

## Development Commands

### Backend API Development

```bash
# Start development server with hot reload
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Run with specific environment
ENV=development uvicorn app.main:app --reload

# Start with debug logging
LOG_LEVEL=DEBUG uvicorn app.main:app --reload
```

### Database Management

```bash
# Create new migration
alembic revision --autogenerate -m "Description of changes"

# Apply migrations
alembic upgrade head

# Rollback one migration
alembic downgrade -1

# Check current migration status
alembic current

# View migration history
alembic history

# Reset database (careful!)
alembic downgrade base
alembic upgrade head
```

### Testing

```bash
# Run all tests
pytest

# Run with coverage
pytest --cov=app tests/

# Run specific test file
pytest tests/test_auth.py

# Run specific test
pytest tests/test_auth.py::test_user_login

# Run tests with verbose output
pytest -v

# Run tests and generate HTML coverage report
pytest --cov=app --cov-report=html tests/
```

### Code Quality

```bash
# Format code with Black
black app/ tests/

# Sort imports
isort app/ tests/

# Lint with Flake8
flake8 app/ tests/

# Type checking with MyPy
mypy app/

# Run all quality checks
black app/ tests/ && isort app/ tests/ && flake8 app/ tests/ && mypy app/
```

## V1.0 Implementation Notes

### Database Setup Changes

**SQLite Configuration:**
- Added `redirect_slashes=False` to FastAPI app configuration
- SQLite engine configured with proper connection parameters
- Database tables created automatically on startup
- Foreign key relationships fixed (UUID consistency)

**Model Relationship Fixes:**
- Fixed User.id (UUID) to Team.created_by (UUID) relationship
- Fixed TeamMembership.user_id to use UUID instead of Integer
- Added proper ForeignKey constraints and back_populates

### API Endpoint Fixes

**Route Configuration:**
- Added duplicate route handlers for `/teams` and `/teams/` paths
- Fixed 307 redirect issues with POST requests
- Proper status codes (201 for created resources)

**CORS Configuration:**
- Mobile app IP ranges added to CORS origins
- Proper headers configuration for mobile requests

### Common Development Issues (V1.0)

**Database Schema Mismatches:**
```bash
# Problem: Old database with incompatible schema
# Solution: Delete old database file
rm backend/hockey_live.db
# Server will create new database with correct schema
```

**Foreign Key Errors:**
```bash
# Problem: UUID/Integer type mismatches in relationships
# Solution: Fixed in V1.0 - all foreign keys use consistent UUID types
```

**Team Creation Timeouts:**
```bash
# Problem: 307 redirect causing mobile app timeouts
# Solution: Added redirect_slashes=False and duplicate route handlers
```

### Docker Development

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f backend

# Rebuild specific service
docker-compose build backend

# Execute commands in container
docker-compose exec backend bash

# Stop all services
docker-compose down

# Reset all data
docker-compose down -v
```

## Project Structure Guide

### Core Application (`app/`)

```
app/
├── main.py                 # FastAPI application entry point
├── core/                   # Core configurations
│   ├── config.py          # Settings and environment variables
│   ├── security.py        # Authentication and security utilities
│   ├── database.py        # Database connection and session management
│   └── exceptions.py      # Custom exception definitions
├── api/                    # API route definitions
│   ├── deps.py            # Dependency injection for authentication
│   └── v1/                # API version 1
│       ├── api.py         # Router aggregation
│       └── endpoints/     # Individual endpoint modules
├── models/                 # SQLAlchemy database models
├── schemas/               # Pydantic request/response schemas
├── services/              # Business logic layer
├── utils/                 # Utility functions and helpers
├── workers/               # Background task workers
└── websocket/             # WebSocket connection management
```

### Key Components

#### FastAPI Application (`main.py`)
- Application initialization and configuration
- Middleware setup (CORS, security, timing)
- Global exception handlers
- Health check endpoints

#### Core Configuration (`core/config.py`)
- Environment-based settings using Pydantic
- Database, Redis, AWS configuration
- Hockey-specific settings (max cameras, arena types)
- Security and performance settings

#### Security (`core/security.py`)
- JWT token generation and verification
- Password hashing with bcrypt
- Role-based access control
- Signed URL generation for secure resource access

#### Database (`core/database.py`)
- SQLAlchemy engine and session management
- Connection pooling and health checks
- Test database configuration
- Table creation utilities

#### API Dependencies (`api/deps.py`)
- Authentication dependency injection
- Role-based access control decorators
- Current user extraction from JWT tokens
- Database session dependencies

### Models and Schemas

#### Database Models (`models/`)
- SQLAlchemy ORM models for database tables
- Relationships between users, teams, games, videos
- Indexes and constraints for performance
- Model lifecycle methods

#### Pydantic Schemas (`schemas/`)
- Request validation schemas
- Response serialization schemas
- Nested schemas for complex data structures
- Field validation and sanitization

### Business Logic (`services/`)

Services contain the core business logic separated from API endpoints:

- **auth_service.py**: User authentication and authorization
- **user_service.py**: User profile and preference management
- **team_service.py**: Team and roster management
- **game_service.py**: Game session coordination and state management
- **video_service.py**: Video processing orchestration
- **arena_service.py**: Camera positioning and validation
- **streaming_service.py**: Real-time streaming coordination

### Background Tasks (`workers/`)

Background workers handle time-intensive operations:

- **video_compiler.py**: Multi-camera video compilation
- **quality_enhancer.py**: Video enhancement and optimization
- **notification_worker.py**: Email and push notifications

### WebSocket Management (`websocket/`)

Real-time communication for game coordination:

- **connection_manager.py**: WebSocket lifecycle management
- **game_coordinator.py**: Game state synchronization
- **sync_manager.py**: Camera synchronization protocols

## API Development Patterns

### Endpoint Structure

```python
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, get_db
from app.models.user import User
from app.schemas.user import UserResponse, UserUpdate
from app.services.user_service import UserService

router = APIRouter()

@router.get("/me", response_model=UserResponse)
async def get_current_user_profile(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get current user profile."""
    return UserService.get_user_profile(db, current_user.id)

@router.put("/me", response_model=UserResponse) 
async def update_current_user_profile(
    user_update: UserUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update current user profile."""
    return UserService.update_user_profile(db, current_user.id, user_update)
```

### Service Layer Pattern

```python
# app/services/user_service.py
from sqlalchemy.orm import Session
from app.models.user import User
from app.schemas.user import UserCreate, UserUpdate
from app.core.exceptions import UserNotFoundException

class UserService:
    
    @staticmethod
    def get_user_by_id(db: Session, user_id: str) -> User:
        """Get user by ID."""
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            raise UserNotFoundException(user_id=user_id)
        return user
    
    @staticmethod
    def update_user_profile(db: Session, user_id: str, user_update: UserUpdate) -> User:
        """Update user profile."""
        user = UserService.get_user_by_id(db, user_id)
        
        for field, value in user_update.dict(exclude_unset=True).items():
            setattr(user, field, value)
        
        db.commit()
        db.refresh(user)
        return user
```

### Database Model Pattern

```python
# app/models/user.py
from sqlalchemy import Column, String, Boolean, DateTime, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
import uuid

from app.core.database import Base

class User(Base):
    __tablename__ = "users"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String(255), unique=True, nullable=False, index=True)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(255), nullable=False)
    role = Column(String(50), default="parent", nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime, server_default=func.now(), nullable=False)
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())
```

### Schema Pattern

```python
# app/schemas/user.py
from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime
from uuid import UUID

class UserBase(BaseModel):
    email: EmailStr
    full_name: str
    role: str = "parent"

class UserCreate(UserBase):
    password: str

class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    role: Optional[str] = None

class UserResponse(UserBase):
    id: UUID
    is_active: bool
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True
```

## Hockey-Specific Implementation

### Game Session Flow

1. **Game Creation**: Coach creates game with arena type and team information
2. **Code Generation**: Unique 6-digit code generated for parent joining
3. **Parent Joining**: Parents scan QR code or enter game code
4. **Position Assignment**: Automated camera position assignment based on NHL research
5. **Setup Validation**: Real-time camera positioning validation
6. **Recording Coordination**: Synchronized recording start across all cameras
7. **Video Processing**: Background compilation and enhancement
8. **Delivery**: Video delivery via CDN with secure access

### Arena Positioning System

```python
# app/services/arena_service.py
class ArenaService:
    
    POSITION_PRIORITIES = {
        "standard": {
            2: ["center_ice_elevated", "corner_diagonal_1"],
            3: ["center_ice_elevated", "corner_diagonal_1", "corner_diagonal_2"],
            4: ["center_ice_elevated", "corner_diagonal_1", "corner_diagonal_2", "bench_side"],
            5: ["center_ice_elevated", "corner_diagonal_1", "corner_diagonal_2", "bench_side", "goal_line_1"],
            6: ["center_ice_elevated", "corner_diagonal_1", "corner_diagonal_2", "bench_side", "goal_line_1", "goal_line_2"]
        }
    }
    
    @staticmethod
    def assign_optimal_positions(arena_type: str, participant_count: int) -> List[str]:
        """Assign optimal camera positions based on NHL research."""
        positions = ArenaService.POSITION_PRIORITIES.get(arena_type, {})
        return positions.get(participant_count, positions.get(6, []))
```

### Video Processing Pipeline

```python
# app/workers/video_compiler.py
from celery import Celery

@celery.task
def compile_game_video(game_session_id: str):
    """Compile multi-camera game video."""
    # 1. Gather all video chunks for the game
    video_chunks = VideoService.get_game_video_chunks(game_session_id)
    
    # 2. Synchronize timestamps across cameras  
    synchronized_chunks = VideoService.synchronize_video_chunks(video_chunks)
    
    # 3. Apply quality enhancement
    enhanced_chunks = VideoService.enhance_video_quality(synchronized_chunks)
    
    # 4. Generate multiple output formats
    compiled_videos = VideoService.compile_videos(enhanced_chunks)
    
    # 5. Upload to final storage location
    VideoService.upload_compiled_videos(compiled_videos)
    
    # 6. Send completion notifications
    NotificationService.send_video_ready_notifications(game_session_id)
```

## Testing Strategy

### Unit Tests

```python
# tests/test_user_service.py
import pytest
from app.services.user_service import UserService
from app.core.exceptions import UserNotFoundException

def test_get_user_by_id_success(db_session, sample_user):
    """Test successful user retrieval."""
    user = UserService.get_user_by_id(db_session, sample_user.id)
    assert user.id == sample_user.id
    assert user.email == sample_user.email

def test_get_user_by_id_not_found(db_session):
    """Test user not found exception."""
    with pytest.raises(UserNotFoundException):
        UserService.get_user_by_id(db_session, "non-existent-id")
```

### Integration Tests

```python
# tests/test_auth_endpoints.py
import pytest
from fastapi.testclient import TestClient

def test_user_registration(client: TestClient):
    """Test user registration endpoint."""
    response = client.post("/api/v1/auth/register", json={
        "email": "test@example.com",
        "password": "TestPassword123",
        "full_name": "Test User"
    })
    assert response.status_code == 201
    assert "access_token" in response.json()

def test_user_login(client: TestClient, sample_user):
    """Test user login endpoint."""
    response = client.post("/api/v1/auth/login", json={
        "email": sample_user.email,
        "password": "password"
    })
    assert response.status_code == 200
    assert "access_token" in response.json()
```

### End-to-End Tests

```python
# tests/test_game_flow.py
async def test_complete_game_flow(client: TestClient, coach_user, parent_user):
    """Test complete game session flow."""
    # 1. Coach creates game
    game_response = client.post("/api/v1/games/", json={
        "home_team_id": "team-1",
        "away_team_id": "team-2", 
        "arena_type": "standard"
    }, headers={"Authorization": f"Bearer {coach_token}"})
    
    game_code = game_response.json()["game_code"]
    
    # 2. Parent joins game
    join_response = client.post(f"/api/v1/games/join/{game_code}", 
        headers={"Authorization": f"Bearer {parent_token}"})
    
    assert join_response.status_code == 200
    
    # 3. Start recording
    start_response = client.post(f"/api/v1/games/{game_id}/start",
        headers={"Authorization": f"Bearer {coach_token}"})
    
    assert start_response.status_code == 200
```

## Deployment

### Environment Configuration

Create production `.env` file with:
- Strong JWT secret keys
- Production database URLs  
- AWS credentials and S3 bucket
- Redis production instance
- SMTP configuration for emails
- Sentry DSN for error monitoring

### Production Build

```bash
# Build production image
docker build -t hockey-live-backend:latest .

# Run with production configuration
docker run -p 8000:8000 --env-file .env.prod hockey-live-backend:latest
```

### Health Monitoring

The application includes comprehensive health checks:
- Database connectivity
- Redis availability  
- Background task queue status
- AWS service connectivity

Access health status at `/health` endpoint for monitoring integration.

This development guide provides the foundation for building the Hockey Live App backend with proper patterns, testing, and deployment strategies.