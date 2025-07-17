# API Documentation - Hockey Live App V1.0

## Overview

The Hockey Live App API provides endpoints for user authentication, team management, and user profile management. This documentation covers the V1.0 implementation with working endpoints.

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

## API Endpoints

### Health Check

**GET** `/health`

Check API health status (no authentication required).

**Response:**
```json
{
  "status": "healthy",
  "service": "Hockey Live App API",
  "version": "1.0.0",
  "timestamp": 1752788052.1776607
}
```

### Authentication Endpoints

#### User Login

**POST** `/auth/login`

Authenticate user and receive JWT token.

**Request:**
```json
{
  "email": "jccarm10@gmail.com",
  "password": "Justin10"
}
```

**Response:**
```json
{
  "user": {
    "id": "a9298809-1a05-47f7-82d3-d1c6e25a980e",
    "email": "jccarm10@gmail.com",
    "full_name": "Justin Carm"
  },
  "access_token": "r1b33dafqH4TFTZ_mdruaksfEgDZsYY_-vMnT5VtXBo",
  "token_type": "bearer"
}
```

#### User Logout

**POST** `/auth/logout`

Invalidate current JWT token.

**Headers:**
```http
Authorization: Bearer <your_jwt_token>
```

**Response:**
```json
{
  "message": "Successfully logged out"
}
```

#### User Registration

**POST** `/auth/register`

Register a new user account.

**Request:**
```json
{
  "email": "newuser@example.com",
  "password": "SecurePassword123",
  "full_name": "New User"
}
```

**Response:**
```json
{
  "user": {
    "id": "uuid-string",
    "email": "newuser@example.com",
    "full_name": "New User"
  },
  "access_token": "jwt-token-string",
  "token_type": "bearer"
}
```

### User Management Endpoints

#### Get Current User Profile

**GET** `/users/me`

Get current authenticated user's profile.

**Headers:**
```http
Authorization: Bearer <your_jwt_token>
```

**Response:**
```json
{
  "id": "a9298809-1a05-47f7-82d3-d1c6e25a980e",
  "email": "jccarm10@gmail.com",
  "full_name": "Justin Carm",
  "is_active": true
}
```

#### Update User Profile

**PUT** `/users/me`

Update current user's profile information.

**Headers:**
```http
Authorization: Bearer <your_jwt_token>
```

**Request:**
```json
{
  "full_name": "Updated Name",
  "phone": "1234567890"
}
```

**Response:**
```json
{
  "id": "a9298809-1a05-47f7-82d3-d1c6e25a980e",
  "email": "jccarm10@gmail.com",
  "full_name": "Updated Name",
  "phone": "1234567890",
  "is_active": true
}
```

### Team Management Endpoints

#### Create Team

**POST** `/teams`

Create a new hockey team.

**Headers:**
```http
Authorization: Bearer <your_jwt_token>
```

**Request:**
```json
{
  "name": "Justin Slashers",
  "league": "CAHL",
  "age_group": "U18",
  "season": "2024-2025",
  "home_arena": "Carstairs Memorial",
  "arena_address": "123 Arena St, Carstairs, AB",
  "primary_color": "#1B365D",
  "secondary_color": "#FFFFFF",
  "head_coach_name": "Justin Carm",
  "coach_email": "jccarm10@gmail.com",
  "coach_phone": "3688870382"
}
```

**Response:**
```json
{
  "message": "Team created successfully",
  "team": {
    "id": "team_1",
    "name": "Justin Slashers",
    "league": "CAHL",
    "age_group": "U18",
    "season": "2024-2025",
    "home_arena": "Carstairs Memorial",
    "arena_address": "123 Arena St, Carstairs, AB",
    "primary_color": "#1B365D",
    "secondary_color": "#FFFFFF",
    "head_coach_name": "Justin Carm",
    "coach_email": "jccarm10@gmail.com",
    "coach_phone": "3688870382",
    "team_code": "ABC123",
    "created_by": "jccarm10@gmail.com",
    "created_at": 1752788052.1776607,
    "players": [],
    "role": "creator"
  }
}
```

#### Get User's Teams

**GET** `/teams/my-teams`

Get all teams associated with the current user.

**Headers:**
```http
Authorization: Bearer <your_jwt_token>
```

**Response:**
```json
{
  "teams": [
    {
      "id": "team_1",
      "name": "Justin Slashers",
      "league": "CAHL",
      "age_group": "U18",
      "season": "2024-2025",
      "home_arena": "Carstairs Memorial",
      "team_code": "ABC123",
      "created_by": "jccarm10@gmail.com",
      "role": "creator",
      "players": []
    }
  ]
}
```

#### Join Team

**POST** `/teams/join`

Join an existing team using a 6-digit team code.

**Headers:**
```http
Authorization: Bearer <your_jwt_token>
```

**Request:**
```json
{
  "team_code": "ABC123"
}
```

**Response:**
```json
{
  "message": "Successfully joined team",
  "team": {
    "id": "team_1",
    "name": "Justin Slashers",
    "league": "CAHL",
    "age_group": "U18",
    "team_code": "ABC123",
    "role": "member"
  }
}
```

## Error Handling

All endpoints return consistent error responses:

**400 Bad Request:**
```json
{
  "error": "validation_error",
  "message": "Invalid request data",
  "details": {
    "field": "email",
    "error": "Invalid email format"
  }
}
```

**401 Unauthorized:**
```json
{
  "error": "unauthorized",
  "message": "Authentication required",
  "details": null
}
```

**403 Forbidden:**
```json
{
  "error": "forbidden", 
  "message": "Insufficient permissions",
  "details": null
}
```

**404 Not Found:**
```json
{
  "error": "not_found",
  "message": "Resource not found",
  "details": null
}
```

**500 Internal Server Error:**
```json
{
  "error": "internal_error",
  "message": "An internal server error occurred",
  "details": null
}
```

## Rate Limiting

- **Authentication endpoints**: 10 requests per minute per IP
- **Team management**: 30 requests per minute per user
- **User management**: 60 requests per minute per user

## Database Schema

### User Model
```python
{
  "id": "UUID",
  "email": "string",
  "hashed_password": "string",
  "full_name": "string",
  "first_name": "string",
  "last_name": "string", 
  "phone": "string",
  "role": "string",
  "is_active": "boolean",
  "is_verified": "boolean",
  "created_at": "datetime",
  "updated_at": "datetime"
}
```

### Team Model
```python
{
  "id": "integer",
  "name": "string",
  "team_code": "string",
  "league": "string",
  "age_group": "string",
  "season": "string",
  "home_arena": "string",
  "arena_address": "string",
  "primary_color": "string",
  "secondary_color": "string",
  "head_coach_name": "string",
  "coach_email": "string",
  "coach_phone": "string",
  "created_by": "UUID",
  "created_at": "datetime",
  "updated_at": "datetime"
}
```

### TeamMembership Model
```python
{
  "id": "integer",
  "team_id": "integer",
  "user_id": "UUID",
  "role": "string",
  "player_id": "integer",
  "is_active": "boolean",
  "approved": "boolean",
  "joined_at": "datetime"
}
```

## Interactive Documentation

Visit the interactive API documentation at:
- **Swagger UI**: `http://localhost:8000/docs`
- **ReDoc**: `http://localhost:8000/redoc`

## SDK and Client Libraries

### JavaScript/React Native
```javascript
import HockeyLiveAPI from 'hockey-live-api';

const api = new HockeyLiveAPI('http://localhost:8000/api/v1');

// Login
const { user, access_token } = await api.auth.login({
  email: 'user@example.com',
  password: 'password'
});

// Set token for authenticated requests
api.setAuthToken(access_token);

// Create team
const team = await api.teams.create({
  name: 'My Team',
  league: 'CAHL',
  age_group: 'U18'
});
```

### Python
```python
import requests

class HockeyLiveAPI:
    def __init__(self, base_url):
        self.base_url = base_url
        self.session = requests.Session()
    
    def login(self, email, password):
        response = self.session.post(
            f"{self.base_url}/auth/login",
            json={"email": email, "password": password}
        )
        data = response.json()
        self.session.headers.update({
            "Authorization": f"Bearer {data['access_token']}"
        })
        return data
    
    def create_team(self, team_data):
        response = self.session.post(
            f"{self.base_url}/teams",
            json=team_data
        )
        return response.json()
```

This documentation covers the current working V1.0 API endpoints with real examples and response formats.