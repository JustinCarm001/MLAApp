"""
API router aggregation for version 1.
Combines all endpoint routers into a single API router.
"""

from fastapi import APIRouter

from app.api.v1.endpoints import auth, users, games, teams, videos, arena, streaming
from app.core.config import settings

# Create API router
api_router = APIRouter()

# Include all endpoint routers
api_router.include_router(
    auth.router,
    prefix="/auth",
    tags=["Authentication"]
)

api_router.include_router(
    users.router,
    prefix="/users",
    tags=["User Management"]
)

api_router.include_router(
    teams.router,
    prefix="/teams", 
    tags=["Team Management"]
)

api_router.include_router(
    games.router,
    prefix="/games",
    tags=["Game Sessions"]
)

api_router.include_router(
    arena.router,
    prefix="/arena",
    tags=["Arena Configuration"]
)

api_router.include_router(
    streaming.router,
    prefix="/streaming",
    tags=["Real-time Streaming"]
)

api_router.include_router(
    videos.router,
    prefix="/videos",
    tags=["Video Processing"]
)

# API version info endpoint
@api_router.get("/", include_in_schema=False)
async def api_info():
    """API version information."""
    return {
        "version": "1.0.0",
        "name": "Hockey Live App API v1",
        "description": "Multi-camera hockey game recording and compilation platform",
        "endpoints": {
            "auth": f"{settings.API_V1_STR}/auth",
            "users": f"{settings.API_V1_STR}/users", 
            "teams": f"{settings.API_V1_STR}/teams",
            "games": f"{settings.API_V1_STR}/games",
            "arena": f"{settings.API_V1_STR}/arena",
            "streaming": f"{settings.API_V1_STR}/streaming",
            "videos": f"{settings.API_V1_STR}/videos"
        }
    }