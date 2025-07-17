"""
User management endpoints for profile, preferences, and user data.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session
from typing import Optional

from app.api.deps import get_current_user
from app.core.database import get_db
from app.models.user import User as UserModel

router = APIRouter()

class UserResponse(BaseModel):
    id: str
    email: str
    full_name: str
    is_active: bool = True

class UserUpdateRequest(BaseModel):
    full_name: Optional[str] = None
    email: Optional[str] = None

@router.get("/me", response_model=UserResponse)
async def get_current_user_profile(
    current_user: UserModel = Depends(get_current_user)
):
    """Get current user profile."""
    print(f"📋 Getting profile for user: {current_user.email}")
    
    return UserResponse(
        id=str(current_user.id),
        email=current_user.email,
        full_name=current_user.full_name,
        is_active=current_user.is_active
    )

@router.put("/me", response_model=UserResponse)
async def update_current_user_profile(
    user_update: UserUpdateRequest,
    current_user: UserModel = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update current user profile."""
    print(f"📝 Updating profile for user: {current_user.email}")
    
    # Update fields if provided
    if user_update.full_name is not None:
        current_user.full_name = user_update.full_name
        print(f"Updated full_name to: {user_update.full_name}")
    
    if user_update.email is not None:
        # Check if email is already taken by another user
        existing_user = db.query(UserModel).filter(
            UserModel.email == user_update.email,
            UserModel.id != current_user.id
        ).first()
        
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered"
            )
        
        current_user.email = user_update.email
        print(f"Updated email to: {user_update.email}")
    
    # Save changes
    db.commit()
    db.refresh(current_user)
    
    print(f"✅ Profile updated successfully for user: {current_user.email}")
    
    return UserResponse(
        id=str(current_user.id),
        email=current_user.email,
        full_name=current_user.full_name,
        is_active=current_user.is_active
    )

@router.get("/me/teams")
async def get_user_teams(
    current_user: UserModel = Depends(get_current_user)
):
    """Get current user's teams."""
    print(f"🏒 Getting teams for user: {current_user.email}")
    
    # TODO: Implement team fetching when teams are integrated
    return {
        "teams": [],
        "message": "Teams integration pending"
    }