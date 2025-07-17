"""
Configuration settings for Hockey Live App backend.
Supports multiple environments: development, staging, production.
"""

import os
from typing import List, Optional
from pydantic import field_validator
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Application settings with environment variable support."""
    
    # Project information
    PROJECT_NAME: str = "Hockey Live App API"
    PROJECT_VERSION: str = "1.0.0"
    DESCRIPTION: str = "Multi-camera hockey game recording and compilation platform"
    
    # API settings
    API_V1_STR: str = "/api/v1"
    DEBUG: bool = False
    ENVIRONMENT: str = "development"
    
    # Security settings
    SECRET_KEY: str = "dev-secret-key-change-in-production"
    JWT_ALGORITHM: str = "HS256"
    JWT_ACCESS_TOKEN_EXPIRE_HOURS: int = 24
    JWT_REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    
    # Database settings (SQLite for local development)
    DATABASE_URL: str = "sqlite:///./hockey_live.db"
    TEST_DATABASE_URL: Optional[str] = "sqlite:///./test_hockey_live.db"
    DATABASE_POOL_SIZE: int = 20
    DATABASE_MAX_OVERFLOW: int = 30
    
    # Redis settings (optional for local development)
    REDIS_URL: str = "redis://localhost:6379/0"
    REDIS_CACHE_TTL: int = 3600  # 1 hour default
    
    # CORS settings
    CORS_ORIGINS: List[str] = ["http://localhost:3000", "http://localhost:8081"]
    ALLOWED_HOSTS: List[str] = ["*"]
    
    @field_validator("CORS_ORIGINS", mode="before")
    @classmethod
    def assemble_cors_origins(cls, v):
        if isinstance(v, str):
            return [i.strip() for i in v.split(",")]
        return v
    
    @field_validator("ALLOWED_HOSTS", mode="before") 
    @classmethod
    def assemble_allowed_hosts(cls, v):
        if isinstance(v, str):
            return [i.strip() for i in v.split(",")]
        return v
    
    # AWS settings (optional for local development)
    AWS_ACCESS_KEY_ID: str = "dev-key"
    AWS_SECRET_ACCESS_KEY: str = "dev-secret"
    AWS_REGION: str = "us-east-1"
    AWS_S3_BUCKET: str = "dev-bucket"
    AWS_CLOUDFRONT_DOMAIN: Optional[str] = None
    
    # Video processing settings
    MAX_VIDEO_SIZE_MB: int = 500
    SUPPORTED_VIDEO_FORMATS: List[str] = ["mp4", "mov", "avi", "mkv"]
    VIDEO_PROCESSING_TIMEOUT: int = 300  # 5 minutes
    VIDEO_CHUNK_SIZE_MB: int = 10
    
    @field_validator("SUPPORTED_VIDEO_FORMATS", mode="before")
    @classmethod
    def assemble_video_formats(cls, v):
        if isinstance(v, str):
            return [i.strip() for i in v.split(",")]
        return v
    
    # Hockey-specific settings
    MAX_CAMERAS_PER_GAME: int = 6
    DEFAULT_ARENA_TYPE: str = "standard"
    GAME_CODE_LENGTH: int = 6
    GAME_SESSION_TIMEOUT_HOURS: int = 4
    
    # WebSocket settings
    WEBSOCKET_HEARTBEAT_INTERVAL: int = 30  # seconds
    MAX_WEBSOCKET_CONNECTIONS_PER_GAME: int = 10
    
    # Background task settings (optional for local development)
    CELERY_BROKER_URL: str = "redis://localhost:6379/1"
    CELERY_RESULT_BACKEND: str = "redis://localhost:6379/1"
    CELERY_TASK_TIMEOUT: int = 600  # 10 minutes
    
    @field_validator("CELERY_BROKER_URL", mode="before")
    @classmethod
    def set_celery_broker(cls, v):
        if v is None:
            return "redis://localhost:6379/0"
        return v
    
    @field_validator("CELERY_RESULT_BACKEND", mode="before")
    @classmethod
    def set_celery_backend(cls, v):
        if v is None:
            return "redis://localhost:6379/0"
        return v
    
    # Email settings (for notifications)
    SMTP_HOST: Optional[str] = None
    SMTP_PORT: int = 587
    SMTP_USERNAME: Optional[str] = None
    SMTP_PASSWORD: Optional[str] = None
    SMTP_USE_TLS: bool = True
    
    # Monitoring and logging
    LOG_LEVEL: str = "INFO"
    SENTRY_DSN: Optional[str] = None
    ENABLE_METRICS: bool = True
    
    # Rate limiting
    RATE_LIMIT_REQUESTS: int = 100
    RATE_LIMIT_WINDOW: int = 60  # seconds
    
    # File upload settings
    MAX_UPLOAD_SIZE_MB: int = 100
    UPLOAD_CHUNK_SIZE_KB: int = 256
    TEMP_UPLOAD_DIR: str = "/tmp/hockey_uploads"
    
    # Arena positioning settings
    POSITION_VALIDATION_TOLERANCE: float = 2.0  # meters
    CAMERA_SETUP_TIMEOUT: int = 180  # 3 minutes
    QUALITY_ASSESSMENT_INTERVAL: int = 5  # seconds
    
    # Video compilation settings
    DEFAULT_OUTPUT_RESOLUTION: str = "1080p"
    DEFAULT_OUTPUT_FPS: int = 30
    VIDEO_COMPILATION_TIMEOUT: int = 1800  # 30 minutes
    
    class Config:
        env_file = ".env"
        case_sensitive = True


# Create settings instance
settings = Settings()