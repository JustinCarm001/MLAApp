#!/usr/bin/env python3
"""
Simple test script to verify authentication endpoints work
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

try:
    from app.api.v1.endpoints.auth import register, login, UserRegister, UserLogin
    print("SUCCESS: Auth imports successful")
    
    # Test registration
    test_user = UserRegister(
        email="test@example.com",
        password="testpass123", 
        full_name="Test User"
    )
    print(f"SUCCESS: Created test user object: {test_user.email}")
    
    # Test the registration function
    import asyncio
    
    async def test_registration():
        try:
            result = await register(test_user)
            print(f"SUCCESS: Registration result: {result}")
            return True
        except Exception as e:
            print(f"ERROR: Registration failed: {e}")
            return False
    
    # Run the test
    success = asyncio.run(test_registration())
    print(f"Registration test: {'PASSED' if success else 'FAILED'}")
    
except Exception as e:
    print(f"ERROR: Import or setup failed: {e}")
    import traceback
    traceback.print_exc()