#!/usr/bin/env python3
"""
Script to delete user profiles from Supabase.
"""

from database import supabase
import json

def list_all_profiles():
    """List all user profiles."""
    if not supabase:
        print("❌ Supabase not configured")
        return []
    
    try:
        # Get all profiles with user information
        profiles = supabase.table('user_profiles').select('*').execute()
        users = supabase.table('users').select('id, email, username').execute()
        
        # Create a lookup for users
        user_lookup = {user['id']: user for user in users.data}
        
        print("📋 All User Profiles:")
        print("=" * 60)
        
        if not profiles.data:
            print("No profiles found.")
            return []
        
        for profile in profiles.data:
            user = user_lookup.get(profile['user_id'], {})
            print(f"Profile ID: {profile['id']}")
            print(f"User ID: {profile['user_id']}")
            print(f"Email: {user.get('email', 'Unknown')}")
            print(f"Username: {user.get('username', 'Unknown')}")
            print(f"Name: {profile.get('name', 'Not set')}")
            print(f"Age: {profile.get('age', 'Not set')}")
            print(f"Location: {profile.get('location', 'Not set')}")
            print(f"Created: {profile.get('created_at', 'Unknown')}")
            print("-" * 60)
        
        return profiles.data
        
    except Exception as e:
        print(f"Error listing profiles: {e}")
        return []

def delete_profile_by_user_id(user_id):
    """Delete a profile by user_id."""
    if not supabase:
        print("❌ Supabase not configured")
        return False
    
    try:
        # First, check if profile exists
        existing = supabase.table('user_profiles').select('*').eq('user_id', user_id).execute()
        if not existing.data:
            print(f"❌ No profile found for user_id: {user_id}")
            return False
        
        # Delete the profile
        result = supabase.table('user_profiles').delete().eq('user_id', user_id).execute()
        if result.data:
            print(f"✅ Deleted profile for user_id: {user_id}")
            print(f"Deleted profile data: {json.dumps(result.data[0], indent=2, default=str)}")
            return True
        else:
            print(f"❌ Failed to delete profile for user_id: {user_id}")
            return False
            
    except Exception as e:
        print(f"Error deleting profile: {e}")
        return False

def delete_profile_by_email(email):
    """Delete a profile by user email."""
    if not supabase:
        print("❌ Supabase not configured")
        return False
    
    try:
        # First, find the user by email
        user_result = supabase.table('users').select('id').eq('email', email).execute()
        if not user_result.data:
            print(f"❌ No user found with email: {email}")
            return False
        
        user_id = user_result.data[0]['id']
        print(f"Found user with ID: {user_id}")
        
        # Delete the profile
        return delete_profile_by_user_id(user_id)
        
    except Exception as e:
        print(f"Error deleting profile by email: {e}")
        return False

def main():
    print("🗑️  User Profile Deletion Tool")
    print("=" * 50)
    
    # List all profiles first
    profiles = list_all_profiles()
    
    if not profiles:
        print("No profiles to delete.")
        return
    
    print("\nOptions:")
    print("1. Delete profile for ozhorov@gmail.com (your account)")
    print("2. Delete by user ID")
    print("3. Delete by email")
    print("4. Exit")
    
    choice = input("\nEnter your choice (1-4): ").strip()
    
    if choice == "1":
        # Delete the known profile
        success = delete_profile_by_email("ozhorov@gmail.com")
        if success:
            print("\n✅ Profile deleted! You can now create a new one.")
        else:
            print("\n❌ Failed to delete profile.")
    
    elif choice == "2":
        user_id = input("Enter user ID: ").strip()
        try:
            user_id = int(user_id)
            delete_profile_by_user_id(user_id)
        except ValueError:
            print("❌ Invalid user ID. Must be a number.")
    
    elif choice == "3":
        email = input("Enter email: ").strip()
        delete_profile_by_email(email)
    
    elif choice == "4":
        print("Exiting...")
    
    else:
        print("❌ Invalid choice.")

if __name__ == "__main__":
    main() 