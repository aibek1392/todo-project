#!/usr/bin/env python3
"""
Test script for the complete user registration flow.
This tests the new /api/complete_user_registration endpoint.
"""

import requests
import json
import random
import string

# Configuration
BASE_URL = "http://localhost:8000"

def generate_test_email():
    """Generate a unique test email"""
    random_string = ''.join(random.choices(string.ascii_lowercase + string.digits, k=8))
    return f"test_{random_string}@example.com"

def test_complete_registration():
    """Test the complete user registration endpoint"""
    print("🧪 Testing Complete User Registration")
    print("=" * 50)
    
    # Generate unique test data
    test_email = generate_test_email()
    
    # Complete test data matching the onboarding form structure
    registration_data = {
        # Authentication fields
        "email": test_email,
        "password": "testpassword123",
        
        # Basic information
        "name": "Test User Complete",
        "age": 28,
        "gender": "Male",
        "height_ft": 5.9,  # 5 feet 9 inches
        "weight_lbs": 175,  # 175 pounds
        "activity_level": "Active",
        "location": "San Francisco, CA",
        
        # Health goals
        "health_goals": ["Lose weight", "Build muscle"],
        "custom_health_goal": "Improve overall fitness and energy",
        
        # Preferences
        "preferences": {
            "diet": ["Mediterranean", "High protein"],
            "likes": ["chicken", "salmon", "avocado", "quinoa", "spinach"],
            "dislikes": ["mushrooms", "olives", "anchovies"],
            "allergies": ["nuts"],
            "conditions": ["none"],
            "meals_per_day": 3,
            "snacks": True,
            "cooks_often": True
        }
    }
    
    print(f"📧 Test email: {test_email}")
    print("🚀 Sending registration request...")
    
    try:
        response = requests.post(f"{BASE_URL}/api/complete_user_registration", 
                               json=registration_data)
        
        if response.status_code == 200:
            result = response.json()
            print("✅ Registration successful!")
            print(f"User ID: {result['user']['id']}")
            print(f"Email: {result['user']['email']}")
            print(f"Profile ID: {result['profile']['id']}")
            print(f"Token received: {'Yes' if result.get('access_token') else 'No'}")
            
            # Test authentication with the received token
            if result.get('access_token'):
                print("\n🔐 Testing authentication with received token...")
                headers = {
                    "Authorization": f"Bearer {result['access_token']}",
                    "Content-Type": "application/json"
                }
                
                # Test getting current user
                auth_response = requests.get(f"{BASE_URL}/api/auth/me", headers=headers)
                if auth_response.status_code == 200:
                    user_data = auth_response.json()
                    print(f"✅ Authentication successful! User: {user_data['full_name']}")
                else:
                    print(f"❌ Authentication test failed: {auth_response.status_code}")
                
                # Test getting user profile
                profile_response = requests.get(f"{BASE_URL}/api/user_profile", headers=headers)
                if profile_response.status_code == 200:
                    profile_data = profile_response.json()
                    print(f"✅ Profile retrieval successful! Name: {profile_data['name']}")
                    print(f"   Age: {profile_data['age']}, Height: {profile_data['height_ft']}ft")
                    print(f"   Health goals: {profile_data['health_goals']}")
                else:
                    print(f"❌ Profile retrieval failed: {profile_response.status_code}")
            
            print("\n" + "=" * 50)
            print("🎉 Complete registration test PASSED!")
            return True
            
        else:
            print(f"❌ Registration failed: {response.status_code}")
            print(f"Error: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ Test failed with exception: {e}")
        return False

def test_duplicate_email():
    """Test that duplicate email registration fails properly"""
    print("\n🧪 Testing Duplicate Email Registration")
    print("=" * 50)
    
    # Use a known email that should already exist
    duplicate_data = {
        "email": "ozhorov@gmail.com",  # This should already exist
        "password": "testpassword123",
        "name": "Duplicate Test User"
    }
    
    try:
        response = requests.post(f"{BASE_URL}/api/complete_user_registration", 
                               json=duplicate_data)
        
        if response.status_code == 400:
            print("✅ Duplicate email properly rejected!")
            print(f"Error message: {response.json().get('detail', 'No detail')}")
            return True
        else:
            print(f"❌ Expected 400 error, got {response.status_code}")
            return False
            
    except Exception as e:
        print(f"❌ Test failed with exception: {e}")
        return False

def main():
    print("🧪 Complete User Registration Test Suite")
    print("=" * 60)
    
    # Test 1: Complete registration
    test1_passed = test_complete_registration()
    
    # Test 2: Duplicate email handling
    test2_passed = test_duplicate_email()
    
    print("\n" + "=" * 60)
    print("📋 TEST RESULTS SUMMARY")
    print("=" * 60)
    print(f"Complete Registration: {'✅ PASS' if test1_passed else '❌ FAIL'}")
    print(f"Duplicate Email Handling: {'✅ PASS' if test2_passed else '❌ FAIL'}")
    
    if test1_passed and test2_passed:
        print("\n🎉 All tests passed! The complete registration flow is working correctly.")
    else:
        print("\n⚠️  Some tests failed. Please check the issues above.")

if __name__ == "__main__":
    main() 