import os
from dotenv import load_dotenv
from supabase import create_client, Client
from typing import Optional

# Load environment variables
load_dotenv()

# Get Supabase credentials
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    print("WARNING: Supabase credentials not found in .env file!")
    print("Please create a .env file with SUPABASE_URL and SUPABASE_KEY")
    supabase: Optional[Client] = None
else:
    supabase: Optional[Client] = create_client(SUPABASE_URL, SUPABASE_KEY)
    print("INFO: Supabase client initialized successfully")
