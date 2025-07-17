# Backend Architecture - Hockey Live App

## Overview

The Hockey Live App backend is built with FastAPI to support multiple client applications:
- **Mobile App** (React Native) - Parents recording games with multi-camera coordination
- **Web Portal** - Parents accessing videos, managing teams, watching content
- **Desktop Application** - Coaches and administrators managing games and users

## Architecture Principles

### 1. Multi-Platform API Design
- **Unified API** serving mobile, web, and desktop clients
- **Role-based access control** with different permissions per user type
- **Versioned endpoints** (v1) with backward compatibility
- **Platform-specific optimizations** while maintaining consistency

### 2. Real-Time Video Coordination
- **WebSocket connections** for live game coordination
- **Multi-camera synchronization** across parent devices
- **Background video processing** for compilation and enhancement
- **Quality assessment** and intelligent camera switching

### 3. Scalable Architecture
- **Service-oriented design** with clear separation of concerns
- **Background task processing** using Celery/Redis
- **Cloud-native deployment** on AWS with auto-scaling
- **Comprehensive caching** for performance optimization

## System Components

### Core Application Structure

```
backend/
├── app/
│   ├── main.py                     # FastAPI application entry point
│   ├── core/                       # Core configurations and settings
│   │   ├── config.py              # Environment-based configuration
│   │   ├── security.py            # JWT authentication and authorization
│   │   ├── database.py            # Database connection and session management
│   │   └── exceptions.py          # Custom exception handlers
│   ├── api/                        # API route definitions
│   │   ├── v1/                     # API version 1
│   │   │   ├── endpoints/          # Individual API endpoint modules
│   │   │   │   ├── auth.py         # Authentication and user management
│   │   │   │   ├── users.py        # User profile and preferences
│   │   │   │   ├── games.py        # Game session management
│   │   │   │   ├── teams.py        # Team and roster management
│   │   │   │   ├── streaming.py    # Real-time video streaming
│   │   │   │   ├── videos.py       # Video processing and access
│   │   │   │   ├── arena.py        # Arena configuration and positioning
│   │   │   │   └── websocket.py    # WebSocket endpoint handlers
│   │   │   └── api.py              # API router aggregation
│   │   └── deps.py                 # Dependency injection for authentication
│   ├── models/                     # SQLAlchemy database models
│   │   ├── base.py                 # Base model class with common fields
│   │   ├── user.py                 # User and authentication models
│   │   ├── team.py                 # Team and roster models
│   │   ├── game.py                 # Game session and coordination models
│   │   ├── video.py                # Video and streaming models
│   │   └── arena.py                # Arena configuration models
│   ├── schemas/                    # Pydantic schemas for request/response
│   │   ├── user.py                 # User management schemas
│   │   ├── team.py                 # Team and roster schemas
│   │   ├── game.py                 # Game session schemas
│   │   ├── video.py                # Video processing schemas
│   │   └── arena.py                # Arena positioning schemas
│   ├── services/                   # Business logic layer
│   │   ├── auth_service.py         # Authentication and authorization
│   │   ├── user_service.py         # User management and profiles
│   │   ├── team_service.py         # Team and roster management
│   │   ├── game_service.py         # Game session coordination
│   │   ├── video_service.py        # Video processing orchestration
│   │   ├── streaming_service.py    # Real-time streaming coordination
│   │   ├── arena_service.py        # Arena positioning and validation
│   │   └── notification_service.py # Push notifications and alerts
│   ├── utils/                      # Utility functions and helpers
│   │   ├── file_storage.py         # AWS S3 file upload/download
│   │   ├── video_processing.py     # Video compilation and enhancement
│   │   ├── sync_coordinator.py     # Multi-camera synchronization
│   │   └── validators.py           # Custom validation functions
│   ├── workers/                    # Background task workers
│   │   ├── video_compiler.py       # Video compilation tasks
│   │   ├── quality_enhancer.py     # Video quality enhancement
│   │   └── notification_worker.py  # Background notification sending
│   └── websocket/                  # WebSocket connection management
│       ├── connection_manager.py   # WebSocket connection lifecycle
│       ├── game_coordinator.py     # Real-time game coordination
│       └── sync_manager.py         # Camera synchronization management
```

## User Roles and Access Control

### 1. Parent Role
**Mobile App Primary Use:**
- Create and manage teams/rosters
- Join game sessions via QR codes
- Record games with camera positioning guidance
- Real-time coordination with other parents

**Web Portal Access:**
- View and download completed game videos
- Manage family account and multiple teams
- Access game history and statistics
- Share videos with extended family

### 2. Coach/Administrator Role
**Enhanced Permissions:**
- Create and manage game sessions
- Invite parents and coordinate recording
- Access all videos for their teams
- User management and team administration
- Game scheduling and arena configuration

**Desktop Application Features:**
- Advanced game management interface
- Bulk video processing and organization
- Team analytics and performance tracking
- League-wide administration tools

### 3. Viewer Role
**Limited Access:**
- Watch shared videos (with permission)
- Basic game information access
- No recording or management capabilities

## API Endpoint Structure

### Authentication Endpoints (`/api/v1/auth`)
```python
POST   /auth/register              # User registration
POST   /auth/login                 # User authentication
POST   /auth/refresh               # Token refresh
POST   /auth/logout                # User logout
POST   /auth/forgot-password       # Password reset request
POST   /auth/reset-password        # Password reset confirmation
```

### User Management (`/api/v1/users`)
```python
GET    /users/me                   # Current user profile
PUT    /users/me                   # Update user profile
GET    /users/me/teams             # User's teams
POST   /users/me/teams             # Create new team
PUT    /users/me/preferences       # Update user preferences
GET    /users/me/games             # User's game history
```

### Team Management (`/api/v1/teams`)
```python
GET    /teams/{team_id}            # Get team details
PUT    /teams/{team_id}            # Update team information
DELETE /teams/{team_id}            # Delete team
GET    /teams/{team_id}/roster     # Get team roster
POST   /teams/{team_id}/roster     # Add player to roster
PUT    /teams/{team_id}/roster/{player_id}  # Update player
DELETE /teams/{team_id}/roster/{player_id}  # Remove player
```

### Game Session Management (`/api/v1/games`)
```python
POST   /games                      # Create new game session
GET    /games/{game_id}            # Get game details
PUT    /games/{game_id}            # Update game information
DELETE /games/{game_id}            # Cancel game session
POST   /games/{game_id}/join       # Join game session
POST   /games/{game_id}/leave      # Leave game session
GET    /games/{game_id}/participants # List game participants
POST   /games/{game_id}/start      # Start game recording
POST   /games/{game_id}/stop       # Stop game recording
GET    /games/join/{code}          # Join by game code
```

### Arena Configuration (`/api/v1/arena`)
```python
GET    /arena/types                # Available arena types
GET    /arena/{type}/positions     # Optimal camera positions
POST   /arena/{type}/validate      # Validate camera setup
GET    /arena/{type}/guidance      # Setup guidance for position
```

### Video Processing (`/api/v1/videos`)
```python
POST   /videos/upload              # Upload video chunk
GET    /videos/{video_id}          # Get video details
GET    /videos/{video_id}/download # Download processed video
GET    /videos/{video_id}/stream   # Stream video content
PUT    /videos/{video_id}/settings # Update video settings
DELETE /videos/{video_id}          # Delete video
GET    /videos/game/{game_id}      # Get all videos for game
POST   /videos/{video_id}/share    # Generate sharing link
```

### Real-time Streaming (`/api/v1/streaming`)
```python
POST   /streaming/start            # Start streaming session
POST   /streaming/stop             # Stop streaming session
GET    /streaming/{session_id}/status # Get streaming status
POST   /streaming/{session_id}/chunk   # Upload streaming chunk
```

### WebSocket Endpoints (`/ws`)
```python
/ws/game/{game_id}                 # Game coordination WebSocket
/ws/sync/{game_id}                 # Camera synchronization WebSocket
/ws/quality/{camera_id}            # Quality feedback WebSocket
```

## Database Schema Design

### Core Tables

#### Users Table
```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    hashed_password VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'parent',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### Teams Table
```sql
CREATE TABLE teams (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    league VARCHAR(255),
    age_group VARCHAR(50),
    season VARCHAR(50),
    owner_id UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### Game Sessions Table
```sql
CREATE TABLE game_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    home_team_id UUID REFERENCES teams(id),
    away_team_id UUID REFERENCES teams(id),
    arena_type VARCHAR(100) DEFAULT 'standard',
    game_code VARCHAR(6) UNIQUE NOT NULL,
    status VARCHAR(50) DEFAULT 'created',
    scheduled_time TIMESTAMP,
    started_at TIMESTAMP,
    ended_at TIMESTAMP,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### Camera Assignments Table
```sql
CREATE TABLE camera_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    game_session_id UUID REFERENCES game_sessions(id),
    user_id UUID REFERENCES users(id),
    position VARCHAR(100) NOT NULL,
    coordinates JSONB,
    priority INTEGER,
    quality_score DECIMAL(3,2),
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Real-Time Features

### WebSocket Architecture

#### Game Coordination
- **Connection Management**: Persistent connections per game session
- **Message Broadcasting**: Real-time updates to all participants  
- **Synchronization**: Coordinated recording start/stop across cameras
- **Quality Monitoring**: Live feedback on camera quality and positioning

#### Camera Synchronization
- **Timestamp Coordination**: Master clock synchronization across devices
- **Quality Assessment**: Real-time quality feedback and recommendations
- **Position Validation**: Live validation of camera positioning
- **Automatic Recovery**: Reconnection handling for network interruptions

### Message Protocol
```json
{
  "type": "game_update",
  "game_id": "uuid",
  "action": "recording_started",
  "timestamp": "2024-01-15T19:00:00Z",
  "data": {
    "countdown": 5,
    "participants": ["uuid1", "uuid2"]
  }
}
```

## Video Processing Pipeline

### 1. Ingestion Phase
- **Chunked Upload**: Real-time video chunk processing
- **Quality Validation**: Immediate quality assessment
- **Temporary Storage**: S3 staging for processing
- **Metadata Extraction**: Video properties and synchronization data

### 2. Processing Phase
- **Synchronization**: Timestamp alignment across cameras
- **Quality Enhancement**: Stabilization, color correction, upscaling
- **Camera Switching**: Intelligent switching based on action and quality
- **Compilation**: Multi-camera video stitching and final rendering

### 3. Delivery Phase
- **Format Optimization**: Multiple output formats (1080p, 720p, mobile)
- **CDN Distribution**: CloudFront for global delivery
- **Access Control**: Secure video access with time-limited URLs
- **Notification**: Completion alerts to parents and coaches

## Background Task Processing

### Celery Worker Architecture
```python
# Video compilation task
@celery.task
def compile_game_video(game_session_id):
    # 1. Gather all video chunks for the game
    # 2. Synchronize timestamps across cameras
    # 3. Apply quality enhancement
    # 4. Generate multiple output formats
    # 5. Upload to final storage location
    # 6. Send completion notifications
```

### Task Priorities
- **High Priority**: Real-time quality assessment, live sync coordination
- **Medium Priority**: Video compilation, quality enhancement
- **Low Priority**: Cleanup tasks, analytics processing, notifications

## Security Implementation

### Authentication Flow
1. **User Registration**: Email verification with secure password requirements
2. **Login**: JWT token generation with refresh token
3. **Authorization**: Role-based access control for all endpoints
4. **Token Management**: Automatic refresh and secure storage

### API Security
- **Rate Limiting**: Per-user and per-endpoint rate limits
- **Input Validation**: Pydantic schema validation for all requests
- **SQL Injection Protection**: SQLAlchemy ORM with parameterized queries
- **CORS Configuration**: Strict CORS policy for web clients

### Video Security
- **Signed URLs**: Time-limited access to video content
- **Access Control**: Team-based permissions for video access
- **Encryption**: At-rest encryption for stored video content
- **Audit Logging**: Comprehensive access logging for videos

## Performance Optimization

### Database Optimization
- **Connection Pooling**: Optimized database connection management
- **Query Optimization**: Efficient queries with proper indexing
- **Caching Strategy**: Redis caching for frequently accessed data
- **Read Replicas**: Separate read/write database instances for scaling

### API Performance
- **Response Caching**: Cached responses for static data
- **Pagination**: Efficient pagination for large data sets
- **Background Processing**: Async processing for time-intensive operations
- **CDN Integration**: Static asset delivery via CloudFront

### Video Processing Performance
- **Parallel Processing**: Multi-core video processing
- **Cloud Scaling**: Auto-scaling processing instances based on load
- **Optimized Encoding**: Hardware-accelerated video encoding
- **Progressive Upload**: Streaming upload during recording

## Monitoring and Observability

### Application Monitoring
- **Health Checks**: Comprehensive health check endpoints
- **Metrics Collection**: Custom metrics for video processing performance
- **Error Tracking**: Structured error logging and alerting
- **Performance Monitoring**: Response time and throughput tracking

### Video Processing Monitoring
- **Processing Queue Monitoring**: Task queue depth and processing times
- **Quality Metrics**: Video quality assessment tracking
- **Resource Utilization**: CPU, memory, and storage monitoring
- **User Experience Metrics**: End-to-end processing time tracking

## Deployment Architecture

### Development Environment
- **Docker Compose**: Local development with PostgreSQL, Redis, and Celery
- **Hot Reload**: FastAPI development server with automatic reloading
- **Test Database**: Separate test database for isolated testing
- **Mock Services**: Mocked external services for local development

### Production Environment
- **AWS ECS**: Containerized deployment with auto-scaling
- **RDS PostgreSQL**: Managed database with backup and replication
- **ElastiCache Redis**: Managed Redis for caching and task queue
- **S3 + CloudFront**: Video storage and global content delivery
- **Application Load Balancer**: High availability and SSL termination

### CI/CD Pipeline
- **Automated Testing**: Comprehensive test suite execution
- **Security Scanning**: Dependency and code security scanning
- **Database Migrations**: Automated migration deployment
- **Zero-Downtime Deployment**: Blue-green deployment strategy

This backend architecture provides a robust, scalable foundation for the Hockey Live App's complex multi-camera video processing requirements while maintaining excellent user experience across mobile, web, and desktop platforms.