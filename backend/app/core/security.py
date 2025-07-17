"""
Security utilities for authentication and authorization.
Handles JWT token generation, password hashing, and role-based access control.
"""

from datetime import datetime, timedelta
from typing import Any, Union, Optional
from passlib.context import CryptContext
from jose import jwt, JWTError
from fastapi import HTTPException, status

from app.core.config import settings

# Password hashing context
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# User roles for role-based access control
class UserRole:
    PARENT = "parent"
    COACH = "coach"
    ADMIN = "admin"
    VIEWER = "viewer"

def create_access_token(
    subject: Union[str, Any],
    expires_delta: Optional[timedelta] = None,
    additional_claims: Optional[dict] = None
) -> str:
    """
    Create a JWT access token.
    
    Args:
        subject: Token subject (usually user ID)
        expires_delta: Token expiration time
        additional_claims: Additional claims to include in token
        
    Returns:
        Encoded JWT token string
    """
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(
            hours=settings.JWT_ACCESS_TOKEN_EXPIRE_HOURS
        )
    
    to_encode = {
        "exp": expire,
        "sub": str(subject),
        "type": "access"
    }
    
    if additional_claims:
        to_encode.update(additional_claims)
    
    encoded_jwt = jwt.encode(
        to_encode, 
        settings.SECRET_KEY, 
        algorithm=settings.JWT_ALGORITHM
    )
    return encoded_jwt

def create_refresh_token(subject: Union[str, Any]) -> str:
    """
    Create a JWT refresh token.
    
    Args:
        subject: Token subject (usually user ID)
        
    Returns:
        Encoded JWT refresh token string
    """
    expire = datetime.utcnow() + timedelta(
        days=settings.JWT_REFRESH_TOKEN_EXPIRE_DAYS
    )
    
    to_encode = {
        "exp": expire,
        "sub": str(subject),
        "type": "refresh"
    }
    
    encoded_jwt = jwt.encode(
        to_encode,
        settings.SECRET_KEY,
        algorithm=settings.JWT_ALGORITHM
    )
    return encoded_jwt

def verify_token(token: str, token_type: str = "access") -> Optional[str]:
    """
    Verify and decode a JWT token.
    
    Args:
        token: JWT token string
        token_type: Expected token type ("access" or "refresh")
        
    Returns:
        Token subject if valid, None otherwise
        
    Raises:
        HTTPException: If token is invalid or expired
    """
    try:
        payload = jwt.decode(
            token,
            settings.SECRET_KEY,
            algorithms=[settings.JWT_ALGORITHM]
        )
        
        # Verify token type
        if payload.get("type") != token_type:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token type"
            )
        
        # Get subject (user ID)
        subject: str = payload.get("sub")
        if subject is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token missing subject"
            )
        
        return subject
        
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials"
        )

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Verify a plain password against a hashed password.
    
    Args:
        plain_password: Plain text password
        hashed_password: Hashed password from database
        
    Returns:
        True if password matches, False otherwise
    """
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str) -> str:
    """
    Generate a hash for a plain password.
    
    Args:
        password: Plain text password
        
    Returns:
        Hashed password string
    """
    return pwd_context.hash(password)

def validate_password_strength(password: str) -> bool:
    """
    Validate password strength requirements.
    
    Args:
        password: Plain text password to validate
        
    Returns:
        True if password meets requirements, False otherwise
    """
    # Minimum 8 characters
    if len(password) < 8:
        return False
    
    # Must contain at least one uppercase letter
    if not any(c.isupper() for c in password):
        return False
    
    # Must contain at least one lowercase letter  
    if not any(c.islower() for c in password):
        return False
    
    # Must contain at least one digit
    if not any(c.isdigit() for c in password):
        return False
    
    return True

def check_role_permission(user_role: str, required_roles: list) -> bool:
    """
    Check if user role has required permissions.
    
    Args:
        user_role: User's current role
        required_roles: List of roles that have permission
        
    Returns:
        True if user has permission, False otherwise
    """
    # Admin role has access to everything
    if user_role == UserRole.ADMIN:
        return True
    
    return user_role in required_roles

def generate_game_code() -> str:
    """
    Generate a unique 6-digit game code for game sessions.
    
    Returns:
        6-character alphanumeric game code
    """
    import random
    import string
    
    # Use only uppercase letters and digits, excluding confusing characters
    chars = "ABCDEFGHIJKLMNPQRSTUVWXYZ123456789"  # No O, 0
    return ''.join(random.choices(chars, k=settings.GAME_CODE_LENGTH))

def create_signed_url(
    resource_path: str, 
    expires_in: int = 3600,
    method: str = "GET"
) -> str:
    """
    Create a signed URL for secure access to resources.
    
    Args:
        resource_path: Path to the resource
        expires_in: URL expiration time in seconds
        method: HTTP method for the signed URL
        
    Returns:
        Signed URL string
    """
    expire = datetime.utcnow() + timedelta(seconds=expires_in)
    
    payload = {
        "resource": resource_path,
        "method": method,
        "exp": expire
    }
    
    token = jwt.encode(
        payload,
        settings.SECRET_KEY,
        algorithm=settings.JWT_ALGORITHM
    )
    
    return f"/api/v1/secure/{token}"

def verify_signed_url(token: str, resource_path: str, method: str) -> bool:
    """
    Verify a signed URL token.
    
    Args:
        token: Signed URL token
        resource_path: Expected resource path
        method: Expected HTTP method
        
    Returns:
        True if URL is valid, False otherwise
    """
    try:
        payload = jwt.decode(
            token,
            settings.SECRET_KEY,
            algorithms=[settings.JWT_ALGORITHM]
        )
        
        return (
            payload.get("resource") == resource_path and
            payload.get("method") == method
        )
        
    except JWTError:
        return False