#!/usr/bin/env python3
"""
Verification script to test the updated database schema.
This script will verify that both tables match the new structure.
"""

from database import supabase
import json

def verify_users_table():
    """Verify the users table structure and data."""
    print("🔍 Verifying users table...")
    
    if not supabase:
        print("❌ Supabase not configured")
        return False
    
    try:
        # Test the users table structure by querying
        result = supabase.table('users').select('*').limit(1).execute()
        
        if result.data:
            sample_user = result.data[0]
            print("✅ Users table accessible")
            print("Expected fields: id, email, username, password_hash, created_at")
            print("Actual fields:", list(sample_user.keys()))
            
            # Verify required fields
            required_fields = ['id', 'email', 'password_hash', 'created_at']
            optional_fields = ['username']
            
            missing_required = [field for field in required_fields if field not in sample_user]
            if missing_required:
                print(f"❌ Missing required fields: {missing_required}")
                return False
            
            print("✅ All required fields present")
            if 'username' in sample_user:
                print("✅ Optional username field present")
            
            return True
        else:
            print("✅ Users table exists but is empty")
            return True
            
    except Exception as e:
        print(f"❌ Error accessing users table: {e}")
        return False

def verify_user_profiles_table():
    """Verify the user_profiles table structure and data."""
    print("\n🔍 Verifying user_profiles table...")
    
    if not supabase:
        print("❌ Supabase not configured")
        return False
    
    try:
        # Test the user_profiles table structure
        result = supabase.table('user_profiles').select('*').limit(1).execute()
        
        print("✅ User_profiles table accessible")
        
        expected_fields = [
            'id', 'user_id', 'name', 'age', 'gender', 'height_ft', 
            'weight_lbs', 'activity_level', 'health_goals', 
            'custom_health_goal', 'location', 'preferences', 
            'created_at', 'updated_at'
        ]
        
        if result.data:
            sample_profile = result.data[0]
            print("Expected fields:", expected_fields)
            print("Actual fields:", list(sample_profile.keys()))
            
            # Check for missing fields
            missing_fields = [field for field in expected_fields if field not in sample_profile]
            if missing_fields:
                print(f"❌ Missing fields: {missing_fields}")
                return False
            
            print("✅ All expected fields present")
            
            # Verify data types
            print("\n📊 Sample data:")
            print(json.dumps(sample_profile, indent=2, default=str))
            
            # Check specific field types
            if sample_profile.get('health_goals') is not None:
                if isinstance(sample_profile['health_goals'], list):
                    print("✅ health_goals is array type (_text)")
                else:
                    print(f"⚠️  health_goals type: {type(sample_profile['health_goals'])}")
            
            if sample_profile.get('preferences') is not None:
                if isinstance(sample_profile['preferences'], dict):
                    print("✅ preferences is JSONB type")
                else:
                    print(f"⚠️  preferences type: {type(sample_profile['preferences'])}")
            
            if sample_profile.get('height_ft') is not None:
                print(f"✅ height_ft value: {sample_profile['height_ft']} (type: {type(sample_profile['height_ft'])})")
            
            return True
        else:
            print("✅ User_profiles table exists but is empty")
            return True
            
    except Exception as e:
        print(f"❌ Error accessing user_profiles table: {e}")
        return False

def test_foreign_key_relationship():
    """Test the foreign key relationship between users and user_profiles."""
    print("\n🔗 Testing foreign key relationship...")
    
    if not supabase:
        print("❌ Supabase not configured")
        return False
    
    try:
        # Get users and profiles
        users_result = supabase.table('users').select('id, email').execute()
        profiles_result = supabase.table('user_profiles').select('id, user_id').execute()
        
        if not users_result.data:
            print("ℹ️  No users found - cannot test relationship")
            return True
        
        if not profiles_result.data:
            print("ℹ️  No profiles found - cannot test relationship")
            return True
        
        # Check if all profile user_ids exist in users table
        user_ids = {user['id'] for user in users_result.data}
        profile_user_ids = {profile['user_id'] for profile in profiles_result.data}
        
        orphaned_profiles = profile_user_ids - user_ids
        if orphaned_profiles:
            print(f"❌ Found orphaned profiles with user_ids: {orphaned_profiles}")
            return False
        
        print("✅ All profiles have valid user_id references")
        print(f"Users: {len(users_result.data)}, Profiles: {len(profiles_result.data)}")
        
        return True
        
    except Exception as e:
        print(f"❌ Error testing foreign key relationship: {e}")
        return False

def main():
    print("🧪 Database Schema Verification")
    print("=" * 50)
    
    # Test each component
    users_ok = verify_users_table()
    profiles_ok = verify_user_profiles_table()
    relationship_ok = test_foreign_key_relationship()
    
    print("\n" + "=" * 50)
    print("📋 VERIFICATION SUMMARY")
    print("=" * 50)
    
    print(f"Users table: {'✅ PASS' if users_ok else '❌ FAIL'}")
    print(f"User_profiles table: {'✅ PASS' if profiles_ok else '❌ FAIL'}")
    print(f"Foreign key relationship: {'✅ PASS' if relationship_ok else '❌ FAIL'}")
    
    if users_ok and profiles_ok and relationship_ok:
        print("\n🎉 All verifications passed! Your schema is correctly updated.")
    else:
        print("\n⚠️  Some verifications failed. Please check the issues above.")

if __name__ == "__main__":
    main() 