#!/usr/bin/env python3
"""
Test script to create a user profile with proper data
"""

import requests
import json

# Configuration
BASE_URL = "http://localhost:8000"
TEST_USER_EMAIL = "ozhorov@gmail.com"
TEST_USER_PASSWORD = "test123"  # You'll need to know your actual password

def login_and_get_token():
    """Login and get authentication token"""
    login_data = {
        "email": TEST_USER_EMAIL,
        "password": TEST_USER_PASSWORD
    }
    
    response = requests.post(f"{BASE_URL}/api/auth/login", json=login_data)
    
    if response.status_code == 200:
        data = response.json()
        print(f"✅ Login successful for user: {data['user']['full_name']}")
        print(f"User ID: {data['user']['id']}")
        return data['access_token']
    else:
        print(f"❌ Login failed: {response.status_code}")
        print(f"Error: {response.text}")
        return None

def create_test_profile(token):
    """Create a test profile with complete data"""
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }
    
    # Complete test data
    profile_data = {
        "name": "Aibek Ozhorov",
        "age": 28,
        "gender": "Male",
        "height_ft": 5.9,  # 5 feet 9 inches
        "weight_lbs": 170,  # 170 pounds
        "activity_level": "Moderately Active",
        "health_goals": ["Lose weight", "Build muscle"],
        "custom_health_goal": "Improve overall fitness",
        "location": "Bishkek, Kyrgyzstan",
        "preferences": {
            "diet": ["Mediterranean", "High protein"],
            "likes": ["chicken", "salmon", "avocado", "quinoa"],
            "dislikes": ["mushrooms", "olives"],
            "allergies": ["nuts"],
            "conditions": ["none"],
            "meals_per_day": 3,
            "snacks": True,
            "cooks_often": True
        }
    }
    
    print("🚀 Creating profile with data:")
    print(json.dumps(profile_data, indent=2))
    
    response = requests.post(f"{BASE_URL}/api/create_user_profile", 
                           json=profile_data, 
                           headers=headers)
    
    if response.status_code == 200:
        print("✅ Profile created successfully!")
        result = response.json()
        print(json.dumps(result, indent=2, default=str))
        return result
    else:
        print(f"❌ Profile creation failed: {response.status_code}")
        print(f"Error: {response.text}")
        return None

def update_existing_profile(token):
    """Update the existing profile instead of creating new one"""
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }
    
    # Complete test data
    profile_data = {
        "name": "Aibek Ozhorov",
        "age": 28,
        "gender": "Male",
        "height_ft": 5.9,  # 5 feet 9 inches
        "weight_lbs": 170,  # 170 pounds
        "activity_level": "Moderately Active",
        "health_goals": ["Lose weight", "Build muscle"],
        "custom_health_goal": "Improve overall fitness",
        "location": "Bishkek, Kyrgyzstan",
        "preferences": {
            "diet": ["Mediterranean", "High protein"],
            "likes": ["chicken", "salmon", "avocado", "quinoa"],
            "dislikes": ["mushrooms", "olives"],
            "allergies": ["nuts"],
            "conditions": ["none"],
            "meals_per_day": 3,
            "snacks": True,
            "cooks_often": True
        }
    }
    
    print("🔄 Updating existing profile with data:")
    print(json.dumps(profile_data, indent=2))
    
    response = requests.put(f"{BASE_URL}/api/update_user_profile", 
                           json=profile_data, 
                           headers=headers)
    
    if response.status_code == 200:
        print("✅ Profile updated successfully!")
        result = response.json()
        print(json.dumps(result, indent=2, default=str))
        return result
    else:
        print(f"❌ Profile update failed: {response.status_code}")
        print(f"Error: {response.text}")
        return None

def get_current_profile(token):
    """Get the current user profile"""
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }
    
    response = requests.get(f"{BASE_URL}/api/user_profile", headers=headers)
    
    if response.status_code == 200:
        print("✅ Profile retrieved successfully!")
        result = response.json()
        print(json.dumps(result, indent=2, default=str))
        return result
    else:
        print(f"❌ Profile retrieval failed: {response.status_code}")
        print(f"Error: {response.text}")
        return None

def main():
    print("🧪 Testing User Profile Creation")
    print("=" * 50)
    
    # Step 1: Login
    print("\n1. Logging in...")
    token = login_and_get_token()
    if not token:
        print("❌ Cannot proceed without authentication")
        return
    
    # Step 2: Get current profile
    print("\n2. Getting current profile...")
    current_profile = get_current_profile(token)
    
    # Step 3: Update the existing profile (since we know one exists)
    print("\n3. Updating existing profile...")
    updated_profile = update_existing_profile(token)
    
    # Step 4: Verify the update
    print("\n4. Verifying the update...")
    final_profile = get_current_profile(token)
    
    print("\n" + "=" * 50)
    print("🎉 Test completed!")

if __name__ == "__main__":
    main() 