import os
from dotenv import load_dotenv
from supabase import create_client, Client
from typing import Optional

# Load environment variables
load_dotenv()

# Get Supabase credentials
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

# Temporarily disable Supabase to use in-memory storage for MealMind development
# This ensures a smooth user experience while we set up the proper database
print("INFO: Using in-memory storage for MealMind development")
print("To enable Supabase: ensure your database has the correct table structure")
supabase: Optional[Client] = None

# Uncomment the lines below when your Supabase database is properly configured:
# if not SUPABASE_URL or not SUPABASE_KEY:
#     print("WARNING: Supabase credentials not found in .env file!")
#     print("Please create a .env file with SUPABASE_URL and SUPABASE_KEY")
#     supabase: Optional[Client] = None
# else:
#     supabase: Optional[Client] = create_client(SUPABASE_URL, SUPABASE_KEY)
