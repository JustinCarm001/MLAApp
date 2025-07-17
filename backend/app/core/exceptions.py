"""
Custom exceptions for Hockey Live App backend.
Provides detailed error handling for various application scenarios.
"""

from typing import Any, Dict, Optional


class CustomException(Exception):
    """Base custom exception class for the application."""
    
    def __init__(
        self,
        message: str,
        code: int = 500,
        error_code: str = "INTERNAL_ERROR",
        details: Optional[Dict[str, Any]] = None
    ):
        self.message = message
        self.code = code
        self.error_code = error_code
        self.details = details or {}
        super().__init__(self.message)


# Authentication and Authorization Exceptions

class AuthenticationException(CustomException):
    """Raised when authentication fails."""
    
    def __init__(self, message: str = "Authentication failed", details: Optional[Dict[str, Any]] = None):
        super().__init__(
            message=message,
            code=401,
            error_code="AUTHENTICATION_FAILED",
            details=details
        )


class AuthorizationException(CustomException):
    """Raised when user doesn't have required permissions."""
    
    def __init__(self, message: str = "Insufficient permissions", details: Optional[Dict[str, Any]] = None):
        super().__init__(
            message=message,
            code=403,
            error_code="AUTHORIZATION_FAILED",
            details=details
        )


class InvalidTokenException(CustomException):
    """Raised when JWT token is invalid or expired."""
    
    def __init__(self, message: str = "Invalid or expired token", details: Optional[Dict[str, Any]] = None):
        super().__init__(
            message=message,
            code=401,
            error_code="INVALID_TOKEN",
            details=details
        )


# User Management Exceptions

class UserNotFoundException(CustomException):
    """Raised when user is not found."""
    
    def __init__(self, user_id: str = None, email: str = None):
        identifier = user_id or email or "unknown"
        super().__init__(
            message=f"User not found: {identifier}",
            code=404,
            error_code="USER_NOT_FOUND",
            details={"user_id": user_id, "email": email}
        )


class UserExistsException(CustomException):
    """Raised when attempting to create a user that already exists."""
    
    def __init__(self, email: str):
        super().__init__(
            message=f"User already exists with email: {email}",
            code=409,
            error_code="USER_EXISTS",
            details={"email": email}
        )


class InvalidPasswordException(CustomException):
    """Raised when password doesn't meet requirements."""
    
    def __init__(self, message: str = "Password doesn't meet requirements"):
        super().__init__(
            message=message,
            code=400,
            error_code="INVALID_PASSWORD"
        )


# Game Session Exceptions

class GameNotFoundException(CustomException):
    """Raised when game session is not found."""
    
    def __init__(self, game_id: str = None, game_code: str = None):
        identifier = game_id or game_code or "unknown"
        super().__init__(
            message=f"Game session not found: {identifier}",
            code=404,
            error_code="GAME_NOT_FOUND",
            details={"game_id": game_id, "game_code": game_code}
        )


class GameFullException(CustomException):
    """Raised when attempting to join a full game session."""
    
    def __init__(self, game_id: str, max_participants: int):
        super().__init__(
            message=f"Game session is full (max {max_participants} participants)",
            code=409,
            error_code="GAME_FULL",
            details={"game_id": game_id, "max_participants": max_participants}
        )


class GameStateException(CustomException):
    """Raised when game operation is invalid for current state."""
    
    def __init__(self, game_id: str, current_state: str, operation: str):
        super().__init__(
            message=f"Cannot {operation} game in {current_state} state",
            code=409,
            error_code="INVALID_GAME_STATE",
            details={
                "game_id": game_id,
                "current_state": current_state,
                "operation": operation
            }
        )


class InvalidGameCodeException(CustomException):
    """Raised when game code is invalid or expired."""
    
    def __init__(self, game_code: str):
        super().__init__(
            message=f"Invalid or expired game code: {game_code}",
            code=400,
            error_code="INVALID_GAME_CODE",
            details={"game_code": game_code}
        )


# Team Management Exceptions

class TeamNotFoundException(CustomException):
    """Raised when team is not found."""
    
    def __init__(self, team_id: str):
        super().__init__(
            message=f"Team not found: {team_id}",
            code=404,
            error_code="TEAM_NOT_FOUND",
            details={"team_id": team_id}
        )


class TeamPermissionException(CustomException):
    """Raised when user doesn't have permission to access team."""
    
    def __init__(self, team_id: str, user_id: str):
        super().__init__(
            message="Insufficient permissions to access team",
            code=403,
            error_code="TEAM_PERMISSION_DENIED",
            details={"team_id": team_id, "user_id": user_id}
        )


class PlayerNotFoundException(CustomException):
    """Raised when player is not found in team roster."""
    
    def __init__(self, player_id: str, team_id: str):
        super().__init__(
            message=f"Player not found in team roster",
            code=404,
            error_code="PLAYER_NOT_FOUND",
            details={"player_id": player_id, "team_id": team_id}
        )


class JerseyNumberExistsException(CustomException):
    """Raised when jersey number is already taken."""
    
    def __init__(self, jersey_number: int, team_id: str):
        super().__init__(
            message=f"Jersey number {jersey_number} is already taken",
            code=409,
            error_code="JERSEY_NUMBER_EXISTS",
            details={"jersey_number": jersey_number, "team_id": team_id}
        )


# Video Processing Exceptions

class VideoNotFoundException(CustomException):
    """Raised when video is not found."""
    
    def __init__(self, video_id: str):
        super().__init__(
            message=f"Video not found: {video_id}",
            code=404,
            error_code="VIDEO_NOT_FOUND",
            details={"video_id": video_id}
        )


class VideoProcessingException(CustomException):
    """Raised when video processing fails."""
    
    def __init__(self, video_id: str, error_details: str):
        super().__init__(
            message=f"Video processing failed: {error_details}",
            code=500,
            error_code="VIDEO_PROCESSING_FAILED",
            details={"video_id": video_id, "error": error_details}
        )


class InvalidVideoFormatException(CustomException):
    """Raised when video format is not supported."""
    
    def __init__(self, format_type: str, supported_formats: list):
        super().__init__(
            message=f"Unsupported video format: {format_type}",
            code=400,
            error_code="INVALID_VIDEO_FORMAT",
            details={
                "format": format_type,
                "supported_formats": supported_formats
            }
        )


class VideoTooLargeException(CustomException):
    """Raised when video file exceeds size limit."""
    
    def __init__(self, file_size: int, max_size: int):
        super().__init__(
            message=f"Video file too large: {file_size}MB (max: {max_size}MB)",
            code=413,
            error_code="VIDEO_TOO_LARGE",
            details={"file_size": file_size, "max_size": max_size}
        )


# Arena and Positioning Exceptions

class ArenaNotFoundException(CustomException):
    """Raised when arena configuration is not found."""
    
    def __init__(self, arena_type: str):
        super().__init__(
            message=f"Arena configuration not found: {arena_type}",
            code=404,
            error_code="ARENA_NOT_FOUND",
            details={"arena_type": arena_type}
        )


class InvalidPositionException(CustomException):
    """Raised when camera position is invalid."""
    
    def __init__(self, position: str, arena_type: str):
        super().__init__(
            message=f"Invalid camera position '{position}' for arena type '{arena_type}'",
            code=400,
            error_code="INVALID_POSITION",
            details={"position": position, "arena_type": arena_type}
        )


class PositionTakenException(CustomException):
    """Raised when camera position is already assigned."""
    
    def __init__(self, position: str, game_id: str):
        super().__init__(
            message=f"Camera position '{position}' is already assigned",
            code=409,
            error_code="POSITION_TAKEN",
            details={"position": position, "game_id": game_id}
        )


# File Upload and Storage Exceptions

class FileUploadException(CustomException):
    """Raised when file upload fails."""
    
    def __init__(self, filename: str, error_details: str):
        super().__init__(
            message=f"File upload failed: {error_details}",
            code=500,
            error_code="FILE_UPLOAD_FAILED",
            details={"filename": filename, "error": error_details}
        )


class StorageException(CustomException):
    """Raised when storage operation fails."""
    
    def __init__(self, operation: str, error_details: str):
        super().__init__(
            message=f"Storage operation failed: {error_details}",
            code=500,
            error_code="STORAGE_FAILED",
            details={"operation": operation, "error": error_details}
        )


# Validation Exceptions

class ValidationException(CustomException):
    """Raised when input validation fails."""
    
    def __init__(self, field: str, message: str, value: Any = None):
        super().__init__(
            message=f"Validation failed for {field}: {message}",
            code=400,
            error_code="VALIDATION_FAILED",
            details={"field": field, "value": value, "error": message}
        )


# Rate Limiting Exception

class RateLimitException(CustomException):
    """Raised when rate limit is exceeded."""
    
    def __init__(self, limit: int, window: int):
        super().__init__(
            message=f"Rate limit exceeded: {limit} requests per {window} seconds",
            code=429,
            error_code="RATE_LIMIT_EXCEEDED",
            details={"limit": limit, "window": window}
        )


# WebSocket Exceptions

class WebSocketConnectionException(CustomException):
    """Raised when WebSocket connection fails."""
    
    def __init__(self, reason: str):
        super().__init__(
            message=f"WebSocket connection failed: {reason}",
            code=400,
            error_code="WEBSOCKET_CONNECTION_FAILED",
            details={"reason": reason}
        )