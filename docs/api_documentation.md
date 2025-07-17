# API Documentation - Hockey Live App

## Overview

The Hockey Live App API provides endpoints for managing hockey game sessions, multi-camera coordination, video processing, and user management. All endpoints use JSON for request/response data and require authentication where noted.

## Base URL

```
Development: http://localhost:8000/api/v1
Production: https://api.hockeylive.app/api/v1
```

## Authentication

Most endpoints require JWT authentication. Include the token in the Authorization header:

```http
Authorization: Bearer <your_jwt_token>
```

## Game Management API

### Create Game Session

**POST** `/games/create`

Creates a new hockey game session and returns a join code for parents.

**Request:**
```json
{
  "game_info": {
    "home_team": "Lightning U16",
    "away_team": "Thunder U16",
    "date": "2024-01-15",
    "time": "19:00",
    "arena": "City Ice Arena",
    "arena_type": "standard"
  },
  "organizer": {
    "name": "Coach Johnson",
    "email": "coach@lightning.com",
    "phone": "+1234567890"
  },
  "max_cameras": 6,
  "expected_duration": 60
}
```

**Response:**
```json
{
  "success": true,
  "game_id": "game_123456",
  "join_code": "H7K9M2",
  "qr_code": "data:image/png;base64,iVBOR...",
  "expires_at": "2024-01-15T21:00:00Z",
  "camera_positions": [
    {
      "position": "goal_line_1",
      "assigned": false,
      "priority": 1
    },
    {
      "position": "goal_line_2",
      "assigned": false,
      "priority": 1
    }
  ]
}
```

### Join Game Session

**POST** `/games/join`

Allows a parent to join an existing game session.

**Request:**
```json
{
  "game_code": "H7K9M2",
  "parent_info": {
    "name": "Sarah Johnson",
    "email": "sarah@email.com",
    "phone": "+1234567890"
  },
  "device_info": {
    "platform": "ios",
    "model": "iPhone 14",
    "app_version": "1.0.0"
  }
}
```

**Response:**
```json
{
  "success": true,
  "game_id": "game_123456",
  "parent_id": "parent_789",
  "assigned_position": {
    "position_name": "goal_line_1",
    "coordinates": {"x": 11, "y": 42.5},
    "priority": 1,
    "setup_instructions": [
      "Position yourself directly behind the goal line",
      "Center yourself between the goal posts",
      "Hold phone horizontally in landscape mode"
    ]
  },
  "camera_settings": {
    "resolution": "1080p",
    "frame_rate": 60,
    "orientation": "landscape"
  },
  "sync_config": {
    "master_timestamp": "2024-01-15T19:00:00.000Z",
    "sync_tolerance_ms": 100,
    "heartbeat_interval": 5000
  }
}
```

### Game Status

**GET** `/games/{game_id}/status`

Gets current status of a game session.

**Response:**
```json
{
  "success": true,
  "game_id": "game_123456",
  "status": "recording",
  "participants": [
    {
      "parent_id": "parent_789",
      "name": "Sarah Johnson",
      "position": "goal_line_1",
      "connection_status": "connected",
      "recording_status": "active"
    }
  ],
  "recording_info": {
    "started_at": "2024-01-15T19:00:00Z",
    "duration": "00:15:30",
    "estimated_end": "2024-01-15T20:00:00Z"
  }
}
```

### Leave Game Session

**POST** `/games/leave`

Removes a parent from a game session.

**Request:**
```json
{
  "game_id": "game_123456",
  "parent_id": "parent_789"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Successfully left game session",
  "position_released": "goal_line_1"
}
```

## Streaming API

### Upload Stream

**POST** `/stream/upload`

Uploads video stream data during recording.

**Request:**
```json
{
  "game_id": "game_123456",
  "camera_id": "camera_abc123",
  "position": "goal_line_1",
  "timestamp": "2024-01-15T19:05:30.123Z",
  "chunk_sequence": 150,
  "video_data": "<base64_encoded_video_chunk>"
}
```

**Response:**
```json
{
  "success": true,
  "chunk_received": true,
  "next_sequence": 151,
  "sync_offset": 0,
  "quality_score": 0.95
}
```

### Sync Request

**POST** `/stream/sync/request`

Requests synchronization with other cameras.

**Request:**
```json
{
  "game_id": "game_123456",
  "camera_id": "camera_abc123",
  "local_timestamp": "2024-01-15T19:00:00.000Z"
}
```

**Response:**
```json
{
  "success": true,
  "master_timestamp": "2024-01-15T19:00:00.000Z",
  "countdown_ms": 3000,
  "sync_offset": 0,
  "participating_cameras": 4
}
```

### Stream Status

**GET** `/stream/{stream_id}/status`

Gets status of a video stream.

**Response:**
```json
{
  "success": true,
  "stream_id": "stream_xyz789",
  "status": "uploading",
  "chunks_received": 450,
  "total_duration": "00:15:30",
  "upload_speed": "2.5 Mbps",
  "quality_metrics": {
    "resolution": "1080p",
    "frame_rate": 60,
    "bitrate": "8000 kbps",
    "dropped_frames": 2
  }
}
```

## Arena Configuration API

### Get Arena Configurations

**GET** `/arena/configurations`

Returns available arena configurations.

**Response:**
```json
{
  "success": true,
  "configurations": [
    {
      "type": "standard",
      "name": "Standard North American",
      "dimensions": {"length": 200, "width": 85},
      "positions": 6,
      "description": "Standard 200x85 ft rink"
    },
    {
      "type": "olympic",
      "name": "Olympic/International",
      "dimensions": {"length": 197, "width": 98.4},
      "positions": 6,
      "description": "International standard rink"
    }
  ]
}
```

### Get Arena Positions

**GET** `/arena/{arena_type}/positions`

Returns optimal camera positions for an arena type.

**Response:**
```json
{
  "success": true,
  "arena_type": "standard",
  "positions": [
    {
      "position_name": "goal_line_1",
      "coordinates": {"x": 11, "y": 42.5},
      "angle": 0,
      "priority": 1,
      "coverage_area": "goal_crease_and_slot",
      "setup_instructions": [
        "Position yourself directly behind the goal line",
        "Center yourself between the goal posts"
      ]
    }
  ]
}
```

### Validate Position

**POST** `/arena/validate-position`

Validates if a camera is positioned correctly.

**Request:**
```json
{
  "arena_type": "standard",
  "expected_position": "goal_line_1",
  "camera_feed": {
    "frame_data": "<base64_encoded_frame>",
    "timestamp": "2024-01-15T19:00:00.000Z"
  }
}
```

**Response:**
```json
{
  "success": true,
  "validation": {
    "position_accuracy": 0.92,
    "angle_correctness": 0.88,
    "coverage_quality": 0.95,
    "stability": 0.90,
    "overall_score": 0.91
  },
  "feedback": [
    "Position is excellent",
    "Slight angle adjustment needed",
    "Coverage area is optimal"
  ]
}
```

## Video Processing API

### Compile Video

**POST** `/videos/compile`

Initiates video compilation from multiple streams.

**Request:**
```json
{
  "game_id": "game_123456",
  "compilation_settings": {
    "quality": "1080p",
    "format": "mp4",
    "include_audio": true,
    "switching_algorithm": "puck_based"
  },
  "delivery_options": {
    "notify_parents": true,
    "create_highlights": true,
    "generate_thumbnails": true
  }
}
```

**Response:**
```json
{
  "success": true,
  "compilation_id": "comp_456789",
  "estimated_completion": "2024-01-15T20:15:00Z",
  "processing_queue_position": 2,
  "notification_methods": ["push", "email"]
}
```

### Video Status

**GET** `/videos/{video_id}/status`

Gets processing status of a video.

**Response:**
```json
{
  "success": true,
  "video_id": "video_789123",
  "status": "processing",
  "progress": 65,
  "current_stage": "camera_switching",
  "estimated_completion": "2024-01-15T20:15:00Z",
  "file_info": {
    "duration": "01:02:30",
    "size_mb": 2500,
    "format": "mp4",
    "resolution": "1080p"
  }
}
```

### Download Video

**GET** `/videos/{video_id}/download`

Provides download link for completed video.

**Response:**
```json
{
  "success": true,
  "video_id": "video_789123",
  "download_url": "https://cdn.hockeylive.app/videos/video_789123.mp4",
  "expires_at": "2024-01-16T20:00:00Z",
  "file_info": {
    "duration": "01:02:30",
    "size_mb": 2500,
    "format": "mp4",
    "resolution": "1080p"
  },
  "sharing_options": {
    "family_link": "https://hockeylive.app/share/fam_123",
    "public_link": "https://hockeylive.app/watch/video_789123"
  }
}
```

## User Management API

### Register User

**POST** `/auth/register`

Registers a new user account.

**Request:**
```json
{
  "email": "parent@email.com",
  "password": "secure_password123",
  "name": "Sarah Johnson",
  "phone": "+1234567890",
  "user_type": "parent"
}
```

**Response:**
```json
{
  "success": true,
  "user_id": "user_123456",
  "access_token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
  "refresh_token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
  "expires_in": 3600
}
```

### Login

**POST** `/auth/login`

Authenticates a user and returns tokens.

**Request:**
```json
{
  "email": "parent@email.com",
  "password": "secure_password123"
}
```

**Response:**
```json
{
  "success": true,
  "user_id": "user_123456",
  "access_token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
  "refresh_token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
  "expires_in": 3600,
  "user_info": {
    "name": "Sarah Johnson",
    "email": "parent@email.com",
    "user_type": "parent"
  }
}
```

### User Profile

**GET** `/users/profile`

Gets user profile information.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response:**
```json
{
  "success": true,
  "user_id": "user_123456",
  "profile": {
    "name": "Sarah Johnson",
    "email": "parent@email.com",
    "phone": "+1234567890",
    "user_type": "parent",
    "subscription": {
      "tier": "premium",
      "status": "active",
      "expires_at": "2024-02-15T00:00:00Z"
    },
    "game_history": [
      {
        "game_id": "game_123456",
        "date": "2024-01-15",
        "teams": "Lightning vs Thunder",
        "role": "camera_operator"
      }
    ]
  }
}
```

## Error Handling

All API endpoints return consistent error responses:

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid game code format",
    "details": {
      "field": "game_code",
      "expected": "6 alphanumeric characters",
      "received": "H7K9M"
    }
  }
}
```

### Common Error Codes

- `VALIDATION_ERROR`: Invalid request data
- `AUTHENTICATION_ERROR`: Invalid or missing authentication
- `AUTHORIZATION_ERROR`: Insufficient permissions
- `NOT_FOUND`: Resource not found
- `RATE_LIMIT_EXCEEDED`: Too many requests
- `INTERNAL_ERROR`: Server error
- `GAME_FULL`: Maximum cameras reached
- `GAME_EXPIRED`: Game session expired
- `SYNC_FAILED`: Camera synchronization failed

## Rate Limiting

API requests are rate-limited to prevent abuse:

- **Authentication endpoints**: 5 requests per minute
- **Game management**: 10 requests per minute
- **Streaming endpoints**: 1000 requests per minute
- **General endpoints**: 100 requests per minute

Rate limit headers are included in responses:

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1642694400
```

## Webhooks

The API supports webhooks for real-time notifications:

### Game Events

```json
{
  "event": "game.started",
  "game_id": "game_123456",
  "timestamp": "2024-01-15T19:00:00Z",
  "data": {
    "participants": 4,
    "estimated_duration": 60
  }
}
```

### Video Processing Events

```json
{
  "event": "video.completed",
  "video_id": "video_789123",
  "timestamp": "2024-01-15T20:15:00Z",
  "data": {
    "download_url": "https://cdn.hockeylive.app/videos/video_789123.mp4",
    "duration": "01:02:30",
    "size_mb": 2500
  }
}
```

## SDK Examples

### JavaScript/TypeScript

```typescript
import { HockeyLiveAPI } from 'hockey-live-sdk';

const api = new HockeyLiveAPI({
  baseURL: 'https://api.hockeylive.app/api/v1',
  apiKey: 'your_api_key'
});

// Join a game
const gameSession = await api.games.join({
  gameCode: 'H7K9M2',
  parentInfo: {
    name: 'Sarah Johnson',
    email: 'sarah@email.com'
  }
});

// Start streaming
const stream = await api.streaming.upload({
  gameId: gameSession.game_id,
  cameraId: 'camera_123',
  position: gameSession.assigned_position.position_name
});
```

### Python

```python
from hockey_live_sdk import HockeyLiveAPI

api = HockeyLiveAPI(
    base_url='https://api.hockeylive.app/api/v1',
    api_key='your_api_key'
)

# Create game session
game = api.games.create({
    'game_info': {
        'home_team': 'Lightning U16',
        'away_team': 'Thunder U16',
        'arena_type': 'standard'
    }
})

# Get arena positions
positions = api.arena.get_positions('standard')
```

## Testing

### Test Environment

```
Base URL: https://api-test.hockeylive.app/api/v1
```

### Sample Test Data

```json
{
  "test_game_code": "TEST01",
  "test_user": {
    "email": "test@hockeylive.app",
    "password": "test123"
  },
  "test_arena": "standard"
}
```

This API documentation provides comprehensive coverage of all endpoints needed for the Hockey Live App, with examples and error handling to support development and integration.