#!/usr/bin/env python3
"""
Script to check if user_profiles table exists and create it if needed.
"""

from database import supabase

def check_and_create_user_profiles_table():
    if not supabase:
        print("❌ Supabase not configured")
        return False
    
    try:
        # Try to query the user_profiles table
        result = supabase.table('user_profiles').select('*').limit(1).execute()
        print("✅ user_profiles table exists")
        if result.data:
            print(f"Table has {len(result.data)} rows")
            print("Sample columns:", list(result.data[0].keys()))
        else:
            print("Table exists but is empty")
        return True
        
    except Exception as e:
        error_msg = str(e).lower()
        if 'does not exist' in error_msg or 'relation' in error_msg:
            print("❌ user_profiles table does not exist")
            print("Creating the table...")
            
            # Create the table using SQL
            sql = """
            CREATE TABLE user_profiles (
                id SERIAL PRIMARY KEY,
                user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                name TEXT,
                age INTEGER,
                gender TEXT,
                height_ft NUMERIC(4,2),
                weight_lbs INTEGER,
                activity_level TEXT,
                health_goals _text,
                custom_health_goal TEXT,
                location TEXT,
                preferences JSONB,
                created_at TIMESTAMP DEFAULT NOW(),
                updated_at TIMESTAMP DEFAULT NOW(),
                UNIQUE(user_id)
            );
            """
            
            try:
                supabase.rpc('execute_sql', {'sql': sql}).execute()
                print("✅ user_profiles table created successfully")
                return True
            except Exception as create_error:
                print(f"❌ Failed to create table: {create_error}")
                print("\nPlease create the table manually in Supabase SQL editor:")
                print(sql)
                return False
        else:
            print(f"❌ Unexpected error: {e}")
            return False

if __name__ == "__main__":
    print("Checking user_profiles table...")
    success = check_and_create_user_profiles_table()
    
    if success:
        print("\n✅ Ready to test the API!")
    else:
        print("\n❌ Please fix the table issue before testing") 