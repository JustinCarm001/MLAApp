#!/usr/bin/env python3
"""
Test script to verify registration and login functionality.
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from sqlalchemy.orm import Session
from app.core.database import SessionLocal, create_tables
from app.models.user import User, UserToken
from app.api.v1.endpoints.auth import hash_password
import secrets

def test_registration():
    """Test user registration functionality."""
    print("Testing registration functionality...")
    
    # Create tables if they don't exist
    create_tables()
    
    # Create database session
    db: Session = SessionLocal()
    
    try:
        # Test data
        test_email = "testuser@example.com"
        test_password = "testpass123"
        test_name = "Test User"
        
        # Check if user already exists
        existing_user = db.query(User).filter(User.email == test_email).first()
        if existing_user:
            print(f"OK User already exists: {existing_user.email}")
            return existing_user
        
        # Create new user
        hashed_password = hash_password(test_password)
        
        new_user = User(
            email=test_email,
            full_name=test_name,
            hashed_password=hashed_password
        )
        
        db.add(new_user)
        db.commit()
        db.refresh(new_user)
        
        print(f"OK User created successfully:")
        print(f"   ID: {new_user.id}")
        print(f"   Email: {new_user.email}")
        print(f"   Name: {new_user.full_name}")
        print(f"   Created: {new_user.created_at}")
        
        return new_user
        
    except Exception as e:
        print(f"ERROR Registration failed: {e}")
        db.rollback()
        return None
    finally:
        db.close()

def test_login(email: str, password: str):
    """Test user login functionality."""
    print(f"\nLOGIN Testing login functionality for {email}...")
    
    db: Session = SessionLocal()
    
    try:
        # Find user
        user = db.query(User).filter(User.email == email).first()
        if not user:
            print(f"ERROR User not found: {email}")
            return None
        
        # Verify password
        hashed_password = hash_password(password)
        if user.hashed_password != hashed_password:
            print(f"ERROR Password mismatch")
            return None
        
        # Generate token
        token = secrets.token_urlsafe(32)
        
        # Store token
        new_token = UserToken(
            token=token,
            user_id=user.id,
            user_email=user.email
        )
        
        db.add(new_token)
        db.commit()
        
        print(f"OK Login successful:")
        print(f"   User: {user.full_name} ({user.email})")
        print(f"   Token: {token[:10]}...")
        
        return {"user": user, "token": token}
        
    except Exception as e:
        print(f"ERROR Login failed: {e}")
        db.rollback()
        return None
    finally:
        db.close()

def check_database():
    """Check database contents."""
    print("\nDATABASE Checking database contents...")
    
    db: Session = SessionLocal()
    
    try:
        users = db.query(User).all()
        tokens = db.query(UserToken).all()
        
        print(f"Users in database: {len(users)}")
        for user in users:
            print(f"  - {user.email} ({user.full_name}) - ID: {user.id}")
        
        print(f"Active tokens: {len(tokens)}")
        for token in tokens:
            print(f"  - {token.user_email} - Token: {token.token[:10]}...")
        
    except Exception as e:
        print(f"ERROR Database check failed: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    print("Starting authentication system test...\n")
    
    # Test registration
    user = test_registration()
    
    if user:
        # Test login
        login_result = test_login("testuser@example.com", "testpass123")
        
        # Check database
        check_database()
        
        if login_result:
            print("\nOK All tests passed! Authentication system is working.")
        else:
            print("\nERROR Login test failed.")
    else:
        print("\nERROR Registration test failed.")