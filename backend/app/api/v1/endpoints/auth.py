"""
Authentication endpoints for user login, registration, and token management.
"""

from fastapi import APIRouter, HTTPException, status, Depends
from pydantic import BaseModel
from email_validator import validate_email
from typing import Optional
from sqlalchemy.orm import Session
import secrets
import hashlib
import time

from app.core.database import get_db
from app.models.user import User as UserModel, UserToken

router = APIRouter()

class UserRegister(BaseModel):
    email: str
    password: str
    full_name: str

class UserLogin(BaseModel):
    email: str
    password: str

class User(BaseModel):
    id: str
    email: str
    full_name: str

class LoginResponse(BaseModel):
    user: User
    access_token: str
    token_type: str = "bearer"

def hash_password(password: str) -> str:
    """Hash password using SHA256."""
    return hashlib.sha256(password.encode()).hexdigest()

def generate_token() -> str:
    """Generate a secure random token."""
    return secrets.token_urlsafe(32)

@router.post("/register", response_model=dict)
async def register(user_data: UserRegister, db: Session = Depends(get_db)):
    """User registration endpoint."""
    print(f"Registration attempt for: {user_data.email}")
    print(f"Full name: {user_data.full_name}")
    print(f"Password length: {len(user_data.password)}")
    
    # Check if user already exists
    existing_user = db.query(UserModel).filter(UserModel.email == user_data.email).first()
    if existing_user:
        print(f"ERROR: User already exists: {user_data.email}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Create user
    hashed_password = hash_password(user_data.password)
    
    print(f"Original password: {user_data.password}")
    print(f"Hashed password: {hashed_password}")
    
    db_user = UserModel(
        email=user_data.email,
        full_name=user_data.full_name,
        hashed_password=hashed_password
    )
    
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    
    print(f"SUCCESS: User registered successfully: {user_data.email}")
    print(f"User ID: {db_user.id}")
    
    return {
        "message": "User registered successfully",
        "user": {
            "id": str(db_user.id),
            "email": db_user.email,
            "full_name": db_user.full_name
        }
    }

@router.post("/login", response_model=LoginResponse)
async def login(login_data: UserLogin, db: Session = Depends(get_db)):
    """User login endpoint."""
    print(f"Login attempt for: {login_data.email}")
    
    # Check if user exists
    user = db.query(UserModel).filter(UserModel.email == login_data.email).first()
    if not user:
        print(f"ERROR: User not found: {login_data.email}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )
    
    hashed_password = hash_password(login_data.password)
    stored_password = user.hashed_password
    
    print(f"Password provided: {login_data.password}")
    print(f"Hashed provided: {hashed_password}")
    print(f"Stored password: {stored_password}")
    print(f"Password match: {stored_password == hashed_password}")
    
    # Verify password
    if user.hashed_password != hashed_password:
        print(f"ERROR: Password mismatch for user: {login_data.email}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )
    
    # Generate token
    token = generate_token()
    
    # Store token in database
    db_token = UserToken(
        token=token,
        user_id=user.id,
        user_email=user.email
    )
    db.add(db_token)
    db.commit()
    
    print(f"SUCCESS: Login successful for: {login_data.email}")
    print(f"Generated token: {token[:10]}...")
    
    return LoginResponse(
        user=User(
            id=str(user.id),
            email=user.email,
            full_name=user.full_name
        ),
        access_token=token
    )

@router.post("/refresh")
async def refresh_token():
    """Token refresh endpoint."""
    return {"message": "Token refresh endpoint - to be implemented"}

@router.post("/logout")
async def logout(token: str = None, db: Session = Depends(get_db)):
    """User logout endpoint - invalidates the provided token."""
    if not token:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Token is required for logout"
        )
    
    # Check if token exists
    db_token = db.query(UserToken).filter(UserToken.token == token).first()
    if not db_token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token"
        )
    
    # Remove token from database
    user_email = db_token.user_email
    db.delete(db_token)
    db.commit()
    
    print(f"SUCCESS: User logged out: {user_email}")
    print(f"Token invalidated: {token[:10]}...")
    
    return {"message": "Successfully logged out"}