from fastapi import FastAPI, HTTPException, Query, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, EmailStr
from database import supabase
import jwt
import bcrypt
from datetime import datetime, timedelta
import os
from dotenv import load_dotenv
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Load environment variables from .env file
load_dotenv()

# Import meal planner
from meal_planner import (
    generate_meal_plan, 
    clear_meal_plan_cache, 
    get_cache_stats,
    MealPlanResponse
)

app = FastAPI()

# JWT Configuration
SECRET_KEY = os.getenv("JWT_SECRET_KEY", "your-secret-key-change-this")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 1440  # 24 hours instead of 5 minutes

security = HTTPBearer()

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# User models
class UserCreate(BaseModel):
    email: EmailStr
    password: str
    full_name: str

class UserLogin(BaseModel):
    username: str
    password: str

class User(BaseModel):
    id: Optional[int] = None
    email: str
    full_name: str
    created_at: Optional[datetime] = None

class Token(BaseModel):
    access_token: str
    token_type: str
    user: User

# Todo model
class Todo(BaseModel):
    id: Optional[int] = None
    title: str
    completed: bool = False
    user_id: Optional[int] = None

class TodoUpdate(BaseModel):
    title: Optional[str] = None
    completed: Optional[bool] = None

# User Profile models
class UserPreferences(BaseModel):
    diet: Optional[List[str]] = None
    likes: Optional[List[str]] = None
    dislikes: Optional[List[str]] = None
    allergies: Optional[List[str]] = None
    conditions: Optional[List[str]] = None
    meals_per_day: Optional[int] = None
    snacks: Optional[bool] = None
    cooks_often: Optional[bool] = None

class UserProfileCreate(BaseModel):
    # Authentication fields (for complete registration)
    email: Optional[str] = None
    password: Optional[str] = None
    
    # Basic Information
    name: Optional[str] = None
    age: Optional[int] = None
    gender: Optional[str] = None
    height_ft: Optional[float] = None
    weight_lbs: Optional[int] = None
    activity_level: Optional[str] = None
    
    # Health Goals
    health_goals: Optional[List[str]] = None
    custom_health_goal: Optional[str] = None
    
    # Location
    location: Optional[str] = None
    
    # Preferences and detailed information
    preferences: Optional[UserPreferences] = None

class UserProfile(BaseModel):
    id: Optional[int] = None
    user_id: int  # Reference to the auth user
    name: Optional[str] = None
    age: Optional[int] = None
    gender: Optional[str] = None
    height_ft: Optional[float] = None
    weight_lbs: Optional[int] = None
    activity_level: Optional[str] = None
    health_goals: Optional[List[str]] = None
    custom_health_goal: Optional[str] = None
    location: Optional[str] = None
    preferences: Optional[Dict[str, Any]] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

# In-memory storage for users when Supabase isn't available
users: List[dict] = []

# Helper functions
def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def verify_password(password: str, hashed: str) -> bool:
    return bcrypt.checkpw(password.encode('utf-8'), hashed.encode('utf-8'))

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    token = credentials.credentials
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: int = payload.get("sub")
        if user_id is None:
            raise HTTPException(status_code=401, detail="Invalid authentication credentials")
        return user_id
    except jwt.PyJWTError:
        raise HTTPException(status_code=401, detail="Invalid authentication credentials")

# Authentication endpoints
@app.post("/api/auth/signup", response_model=Token)
async def signup(user_data: UserCreate):
    try:
        print(f"Signup attempt for email: {user_data.email}")
        
        # Use global supabase variable
        global supabase
        
        if supabase is None:
            print("Using in-memory storage (Supabase not configured)")
        else:
            print("Supabase is configured, but let's check table structure...")
            try:
                # Test if the users table exists and has the right structure
                test_response = supabase.table('users').select("*").limit(1).execute()
                print("Supabase table accessible")
            except Exception as supabase_error:
                print(f"Supabase table error: {str(supabase_error)}")
                print("Falling back to in-memory storage for this session")
        
        if supabase is None:
            print("Using in-memory storage")
            # Check if user already exists in memory
            for user in users:
                if user["email"] == user_data.email:
                    print(f"User already exists: {user_data.email}")
                    raise HTTPException(status_code=400, detail="Email already registered")
            
            print("Hashing password...")
            # Create new user in memory
            hashed_password = hash_password(user_data.password)
            print("Password hashed successfully")
            
            new_user = {
                "id": len(users) + 1,
                "email": user_data.email,
                "full_name": user_data.full_name,
                "password": hashed_password,
                "created_at": datetime.utcnow()
            }
            users.append(new_user)
            print(f"User created with ID: {new_user['id']}")
            
            # Create token
            print("Creating access token...")
            access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
            access_token = create_access_token(
                data={"sub": str(new_user["id"])}, expires_delta=access_token_expires
            )
            print("Access token created successfully")
            
            user_response = User(
                id=new_user["id"],
                email=new_user["email"],
                full_name=new_user["full_name"],
                created_at=new_user["created_at"]
            )
            
            token_response = Token(access_token=access_token, token_type="bearer", user=user_response)
            print("Signup successful!")
            return token_response
        
        # Supabase path
        print("Using Supabase storage")
        try:
            # Check if user already exists in Supabase
            existing_user = supabase.table('users').select("*").eq("email", user_data.email).execute()
            if existing_user.data:
                raise HTTPException(status_code=400, detail="Email already registered")
            
            # Hash password and create user
            hashed_password = hash_password(user_data.password)
            response = supabase.table('users').insert({
                "email": user_data.email,
                "username": user_data.full_name,  # Map full_name to username (optional field)
                "password_hash": hashed_password  # Map password to password_hash
            }).execute()
            
            if not response.data:
                raise HTTPException(status_code=500, detail="Failed to create user")
            
            created_user = response.data[0]
            print(f"User created in Supabase with ID: {created_user['id']}")
            
            # Create token
            access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
            access_token = create_access_token(
                data={"sub": str(created_user["id"])}, expires_delta=access_token_expires
            )
            
            user_response = User(
                id=created_user["id"],
                email=created_user["email"],
                full_name=created_user.get("username", user_data.full_name),  # Map username back to full_name
                created_at=created_user.get("created_at")
            )
            
            return Token(access_token=access_token, token_type="bearer", user=user_response)
            
        except HTTPException:
            raise
        except Exception as e:
            print(f"Supabase error: {str(e)}")
            raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")
        
    except HTTPException:
        # Re-raise HTTP exceptions (like 400 for duplicate email)
        raise
    except Exception as e:
        print(f"Unexpected error in signup: {str(e)}")
        print(f"Error type: {type(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@app.post("/api/auth/login", response_model=Token)
async def login(user_credentials: UserLogin):
    if supabase is None:
        # Find user in memory by username
        user = None
        for u in users:
            if u.get("username") == user_credentials.username or u.get("full_name") == user_credentials.username:
                user = u
                break
        
        if not user or not verify_password(user_credentials.password, user["password"]):
            raise HTTPException(status_code=401, detail="Incorrect username or password")
        
        # Create token
        access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = create_access_token(
            data={"sub": str(user["id"])}, expires_delta=access_token_expires
        )
        
        user_response = User(
            id=user["id"],
            email=user.get("email", ""),
            full_name=user.get("username", user.get("full_name", "")),
            created_at=user["created_at"]
        )
        
        return Token(access_token=access_token, token_type="bearer", user=user_response)
    
    try:
        # Find user in Supabase by username
        response = supabase.table('users').select("*").eq("username", user_credentials.username).execute()
        
        if not response.data:
            # Fallback to in-memory storage
            user = None
            for u in users:
                if u.get("username") == user_credentials.username or u.get("full_name") == user_credentials.username:
                    user = u
                    break
            
            if not user or not verify_password(user_credentials.password, user["password"]):
                raise HTTPException(status_code=401, detail="Incorrect username or password")
            
            # Create token
            access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
            access_token = create_access_token(
                data={"sub": str(user["id"])}, expires_delta=access_token_expires
            )
            
            user_response = User(
                id=user["id"],
                email=user.get("email", ""),
                full_name=user.get("username", user.get("full_name", "")),
                created_at=user["created_at"]
            )
            
            return Token(access_token=access_token, token_type="bearer", user=user_response)
        
        user = response.data[0]
        
        if not verify_password(user_credentials.password, user["password_hash"]):
            raise HTTPException(status_code=401, detail="Incorrect username or password")
        
        # Create token
        access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = create_access_token(
            data={"sub": str(user["id"])}, expires_delta=access_token_expires
        )
        
        user_response = User(
            id=user["id"],
            email=user["email"],
            full_name=user.get("username", ""),  # Map username to full_name
            created_at=user.get("created_at")
        )
        
        return Token(access_token=access_token, token_type="bearer", user=user_response)
        
    except Exception as e:
        # Fallback to in-memory storage
        user = None
        for u in users:
            if u.get("username") == user_credentials.username or u.get("full_name") == user_credentials.username:
                user = u
                break
        
        if not user or not verify_password(user_credentials.password, user["password"]):
            raise HTTPException(status_code=500, detail="Authentication service unavailable")
        
        # Create token
        access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = create_access_token(
            data={"sub": str(user["id"])}, expires_delta=access_token_expires
        )
        
        user_response = User(
            id=user["id"],
            email=user.get("email", ""),
            full_name=user.get("username", user.get("full_name", "")),
            created_at=user["created_at"]
        )
        
        return Token(access_token=access_token, token_type="bearer", user=user_response)

@app.get("/api/auth/me", response_model=User)
async def get_current_user_info(current_user_id: int = Depends(get_current_user)):
    if supabase is None:
        # Find user in memory
        for user in users:
            if user["id"] == current_user_id:
                return User(
                    id=user["id"],
                    email=user["email"],
                    full_name=user["full_name"],
                    created_at=user["created_at"]
                )
        raise HTTPException(status_code=404, detail="User not found")
    
    try:
        response = supabase.table('users').select("*").eq("id", current_user_id).execute()
        
        if not response.data:
            raise HTTPException(status_code=404, detail="User not found")
        
        user = response.data[0]
        return User(
            id=user["id"],
            email=user["email"],
            full_name=user.get("username", ""),  # Map username to full_name
            created_at=user.get("created_at")
        )
        
    except Exception as e:
        print(f"Supabase error: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

# Debug endpoint to list all users (for development only)
@app.get("/api/debug/users")
async def list_all_users():
    """Debug endpoint to list all users in memory storage"""
    if supabase is None:
        # Return users without passwords for security
        safe_users = []
        for user in users:
            safe_users.append({
                "id": user["id"],
                "email": user["email"],
                "full_name": user["full_name"],
                "created_at": user["created_at"]
            })
        return {"users": safe_users, "total": len(safe_users)}
    else:
        return {"message": "This endpoint only works with in-memory storage"}

# Fallback in-memory storage if Supabase isn't configured
todos: List[Todo] = []

@app.get("/api/todos")
async def get_todos(current_user_id: int = Depends(get_current_user)):
    if supabase is None:
        user_todos = [todo for todo in todos if todo.user_id == current_user_id]
        return user_todos
    try:
        response = supabase.table('todos').select("*").eq("user_id", current_user_id).execute()
        return response.data
    except Exception as e:
        print(f"Supabase error: {str(e)}")
        user_todos = [todo for todo in todos if todo.user_id == current_user_id]
        return user_todos

@app.post("/api/todos")
async def create_todo(todo: Todo, current_user_id: int = Depends(get_current_user)):
    if supabase is None:
        todo.id = len(todos) + 1
        todo.user_id = current_user_id
        todos.append(todo)
        return todo
    try:
        response = supabase.table('todos').insert({
            "title": todo.title,
            "completed": todo.completed,
            "user_id": current_user_id
        }).execute()
        return response.data[0]
    except Exception as e:
        print(f"Supabase error: {str(e)}")
        todo.id = len(todos) + 1
        todo.user_id = current_user_id
        todos.append(todo)
        return todo

@app.put("/api/todos/{todo_id}")
async def update_todo(todo_id: int, updated_todo: TodoUpdate, current_user_id: int = Depends(get_current_user)):
    if supabase is None:
        for todo in todos:
            if todo.id == todo_id and todo.user_id == current_user_id:
                # Only update the fields that are provided
                if updated_todo.title is not None:
                    todo.title = updated_todo.title
                if updated_todo.completed is not None:
                    todo.completed = updated_todo.completed
                return todo
        raise HTTPException(status_code=404, detail="Todo not found")
    try:
        # Only update the fields that are provided
        update_data = {}
        if updated_todo.title is not None:
            update_data["title"] = updated_todo.title
        if updated_todo.completed is not None:
            update_data["completed"] = updated_todo.completed
            
        response = supabase.table('todos').update(update_data).eq("id", todo_id).eq("user_id", current_user_id).execute()
        
        if not response.data:
            raise HTTPException(status_code=404, detail="Todo not found")
            
        return response.data[0]
    except Exception as e:
        print(f"Supabase error: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

@app.delete("/api/todos/{todo_id}")
async def delete_todo(todo_id: int, current_user_id: int = Depends(get_current_user)):
    if supabase is None:
        for index, todo in enumerate(todos):
            if todo.id == todo_id and todo.user_id == current_user_id:
                return todos.pop(index)
        raise HTTPException(status_code=404, detail="Todo not found")
    try:
        response = supabase.table('todos').delete().eq("id", todo_id).eq("user_id", current_user_id).execute()
        
        if not response.data:
            raise HTTPException(status_code=404, detail="Todo not found")
            
        return {"message": "Todo deleted successfully"}
    except Exception as e:
        print(f"Supabase error: {str(e)}")
        for index, todo in enumerate(todos):
            if todo.id == todo_id and todo.user_id == current_user_id:
                return todos.pop(index)
        raise HTTPException(status_code=404, detail="Todo not found")

@app.post("/api/create_user_profile", response_model=UserProfile)
async def create_user_profile(profile_data: UserProfileCreate, current_user_id: int = Depends(get_current_user)):
    """
    Create a new user profile with onboarding information.
    
    This endpoint creates a new record in the user_profiles table
    with all the information collected during onboarding.
    """
    try:
        if supabase is None:
            raise HTTPException(status_code=500, detail="Database not configured")
        
        # Check if user already has a profile
        try:
            existing_profile = supabase.table('user_profiles').select("*").eq("user_id", current_user_id).execute()
            if existing_profile.data:
                raise HTTPException(status_code=400, detail="User profile already exists. Use update endpoint instead.")
        except Exception as table_error:
            error_msg = str(table_error).lower()
            if 'does not exist' in error_msg or 'relation' in error_msg:
                raise HTTPException(status_code=500, detail="Database table 'user_profiles' does not exist. Please create the table first using the SQL schema provided in the documentation.")
            else:
                raise HTTPException(status_code=500, detail=f"Database error: {str(table_error)}")
        
        # Prepare profile data
        profile_record = {
            "user_id": current_user_id,
        }
        
        # Add basic information
        if profile_data.name is not None:
            profile_record["name"] = profile_data.name
        if profile_data.age is not None:
            profile_record["age"] = profile_data.age
        if profile_data.gender is not None:
            profile_record["gender"] = profile_data.gender.lower()
        if profile_data.height_ft is not None:
            profile_record["height_ft"] = profile_data.height_ft
        if profile_data.weight_lbs is not None:
            profile_record["weight_lbs"] = profile_data.weight_lbs
        if profile_data.activity_level is not None:
            profile_record["activity_level"] = profile_data.activity_level.lower().replace(' ', '_')
        if profile_data.location is not None:
            profile_record["location"] = profile_data.location
        
        # Add health goals
        if profile_data.health_goals is not None:
            profile_record["health_goals"] = [goal.lower() for goal in profile_data.health_goals]
        if profile_data.custom_health_goal is not None:
            profile_record["custom_health_goal"] = profile_data.custom_health_goal.lower()
        
        # Add preferences as JSONB
        if profile_data.preferences is not None:
            preferences_dict = profile_data.preferences.dict(exclude_none=True)
            # Convert lists to lowercase for consistency
            if "diet" in preferences_dict and preferences_dict["diet"]:
                preferences_dict["diet"] = [item.lower() for item in preferences_dict["diet"]]
            if "likes" in preferences_dict and preferences_dict["likes"]:
                preferences_dict["likes"] = [item.lower() for item in preferences_dict["likes"]]
            if "dislikes" in preferences_dict and preferences_dict["dislikes"]:
                preferences_dict["dislikes"] = [item.lower() for item in preferences_dict["dislikes"]]
            if "allergies" in preferences_dict and preferences_dict["allergies"]:
                preferences_dict["allergies"] = [item.lower() for item in preferences_dict["allergies"]]
            if "conditions" in preferences_dict and preferences_dict["conditions"]:
                preferences_dict["conditions"] = [item.lower() for item in preferences_dict["conditions"]]
            
            profile_record["preferences"] = preferences_dict
        
        # Create the profile in Supabase
        response = supabase.table('user_profiles').insert(profile_record).execute()
        
        if not response.data:
            raise HTTPException(status_code=500, detail="Failed to create user profile")
        
        created_profile = response.data[0]
        
        return UserProfile(
            id=created_profile["id"],
            user_id=created_profile["user_id"],
            name=created_profile.get("name"),
            age=created_profile.get("age"),
            gender=created_profile.get("gender"),
            height_ft=created_profile.get("height_ft"),
            weight_lbs=created_profile.get("weight_lbs"),
            activity_level=created_profile.get("activity_level"),
            health_goals=created_profile.get("health_goals"),
            custom_health_goal=created_profile.get("custom_health_goal"),
            location=created_profile.get("location"),
            preferences=created_profile.get("preferences"),
            created_at=created_profile.get("created_at"),
            updated_at=created_profile.get("updated_at")
        )
        
    except HTTPException:
        # Re-raise HTTP exceptions
        raise
    except Exception as e:
        print(f"Error creating user profile: {str(e)}")
        print(f"Error type: {type(e)}")
        print(f"Current user ID: {current_user_id}")
        print(f"Profile data received: {profile_data}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@app.put("/api/update_user_profile", response_model=UserProfile)
async def update_user_profile(profile_data: UserProfileCreate, current_user_id: int = Depends(get_current_user)):
    """
    Update an existing user profile with new onboarding information.
    """
    try:
        if supabase is None:
            raise HTTPException(status_code=500, detail="Database not configured")
        
        # Check if user has a profile
        try:
            existing_profile = supabase.table('user_profiles').select("*").eq("user_id", current_user_id).execute()
            if not existing_profile.data:
                raise HTTPException(status_code=404, detail="User profile not found. Create one first.")
        except Exception as table_error:
            error_msg = str(table_error).lower()
            if 'does not exist' in error_msg or 'relation' in error_msg:
                raise HTTPException(status_code=500, detail="Database table 'user_profiles' does not exist.")
            else:
                raise HTTPException(status_code=500, detail=f"Database error: {str(table_error)}")
        
        # Prepare update data - only include fields that are provided
        update_data = {}
        
        if profile_data.name is not None:
            update_data["name"] = profile_data.name
        if profile_data.age is not None:
            update_data["age"] = profile_data.age
        if profile_data.gender is not None:
            update_data["gender"] = profile_data.gender.lower()
        if profile_data.height_ft is not None:
            update_data["height_ft"] = profile_data.height_ft
        if profile_data.weight_lbs is not None:
            update_data["weight_lbs"] = profile_data.weight_lbs
        if profile_data.activity_level is not None:
            update_data["activity_level"] = profile_data.activity_level.lower().replace(' ', '_')
        if profile_data.location is not None:
            update_data["location"] = profile_data.location
        if profile_data.health_goals is not None:
            update_data["health_goals"] = [goal.lower() for goal in profile_data.health_goals]
        if profile_data.custom_health_goal is not None:
            update_data["custom_health_goal"] = profile_data.custom_health_goal.lower()
        if profile_data.preferences is not None:
            preferences_dict = profile_data.preferences.dict(exclude_none=True)
            # Convert lists to lowercase for consistency
            if "diet" in preferences_dict and preferences_dict["diet"]:
                preferences_dict["diet"] = [item.lower() for item in preferences_dict["diet"]]
            if "likes" in preferences_dict and preferences_dict["likes"]:
                preferences_dict["likes"] = [item.lower() for item in preferences_dict["likes"]]
            if "dislikes" in preferences_dict and preferences_dict["dislikes"]:
                preferences_dict["dislikes"] = [item.lower() for item in preferences_dict["dislikes"]]
            if "allergies" in preferences_dict and preferences_dict["allergies"]:
                preferences_dict["allergies"] = [item.lower() for item in preferences_dict["allergies"]]
            if "conditions" in preferences_dict and preferences_dict["conditions"]:
                preferences_dict["conditions"] = [item.lower() for item in preferences_dict["conditions"]]
            
            update_data["preferences"] = preferences_dict
        
        # Update the profile in Supabase
        response = supabase.table('user_profiles').update(update_data).eq("user_id", current_user_id).execute()
        
        if not response.data:
            raise HTTPException(status_code=500, detail="Failed to update user profile")
        
        updated_profile = response.data[0]
        
        return UserProfile(
            id=updated_profile["id"],
            user_id=updated_profile["user_id"],
            name=updated_profile.get("name"),
            age=updated_profile.get("age"),
            gender=updated_profile.get("gender"),
            height_ft=updated_profile.get("height_ft"),
            weight_lbs=updated_profile.get("weight_lbs"),
            activity_level=updated_profile.get("activity_level"),
            health_goals=updated_profile.get("health_goals"),
            custom_health_goal=updated_profile.get("custom_health_goal"),
            location=updated_profile.get("location"),
            preferences=updated_profile.get("preferences"),
            created_at=updated_profile.get("created_at"),
            updated_at=updated_profile.get("updated_at")
        )
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error updating user profile: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@app.get("/api/user_profile", response_model=UserProfile)
async def get_user_profile(current_user_id: int = Depends(get_current_user)):
    """Get the current user's profile."""
    try:
        if supabase is None:
            raise HTTPException(status_code=500, detail="Database not configured")
        
        try:
            response = supabase.table('user_profiles').select("*").eq("user_id", current_user_id).execute()
        except Exception as table_error:
            error_msg = str(table_error).lower()
            if 'does not exist' in error_msg or 'relation' in error_msg:
                raise HTTPException(status_code=500, detail="Database table 'user_profiles' does not exist. Please create the table first using the SQL schema provided in the documentation.")
            else:
                raise HTTPException(status_code=500, detail=f"Database error: {str(table_error)}")
        
        if not response.data:
            raise HTTPException(status_code=404, detail="User profile not found")
        
        profile = response.data[0]
        
        return UserProfile(
            id=profile["id"],
            user_id=profile["user_id"],
            name=profile.get("name"),
            age=profile.get("age"),
            gender=profile.get("gender"),
            height_ft=profile.get("height_ft"),
            weight_lbs=profile.get("weight_lbs"),
            activity_level=profile.get("activity_level"),
            health_goals=profile.get("health_goals"),
            custom_health_goal=profile.get("custom_health_goal"),
            location=profile.get("location"),
            preferences=profile.get("preferences"),
            created_at=profile.get("created_at"),
            updated_at=profile.get("updated_at")
        )
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error fetching user profile: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@app.post("/api/complete_user_registration", response_model=dict)
async def complete_user_registration(profile_data: UserProfileCreate):
    """
    Complete user registration flow:
    1. Create user account in users table
    2. Create user profile in user_profiles table
    3. Return authentication token
    
    This endpoint handles the full onboarding process.
    """
    try:
        if supabase is None:
            raise HTTPException(status_code=500, detail="Database not configured")
        
        # Validate required fields for user creation
        if not profile_data.name:
            raise HTTPException(status_code=400, detail="Name is required")
        if not hasattr(profile_data, 'email') or not profile_data.email:
            raise HTTPException(status_code=400, detail="Email is required")
        if not hasattr(profile_data, 'password') or not profile_data.password:
            raise HTTPException(status_code=400, detail="Password is required")
        
        # Check if user already exists
        try:
            existing_user = supabase.table('users').select("*").eq("email", profile_data.email).execute()
            if existing_user.data:
                raise HTTPException(status_code=400, detail="Email already registered")
        except Exception as e:
            if "already registered" in str(e):
                raise
            # Continue if it's just a table access issue
        
        # Step 1: Create user account
        hashed_password = hash_password(profile_data.password)
        user_response = supabase.table('users').insert({
            "email": profile_data.email,
            "username": profile_data.name,  # Use name as username
            "password_hash": hashed_password
        }).execute()
        
        if not user_response.data:
            raise HTTPException(status_code=500, detail="Failed to create user account")
        
        created_user = user_response.data[0]
        user_id = created_user["id"]
        
        print(f"✅ User created with ID: {user_id}")
        
        # Step 2: Create user profile
        profile_record = {
            "user_id": user_id,
        }
        
        # Add profile data (excluding auth fields)
        if profile_data.name is not None:
            profile_record["name"] = profile_data.name
        if profile_data.age is not None:
            profile_record["age"] = profile_data.age
        if profile_data.gender is not None:
            profile_record["gender"] = profile_data.gender.lower()
        if profile_data.height_ft is not None:
            profile_record["height_ft"] = profile_data.height_ft
        if profile_data.weight_lbs is not None:
            profile_record["weight_lbs"] = profile_data.weight_lbs
        if profile_data.activity_level is not None:
            profile_record["activity_level"] = profile_data.activity_level.lower().replace(' ', '_')
        if profile_data.location is not None:
            profile_record["location"] = profile_data.location
        
        # Add health goals
        if profile_data.health_goals is not None:
            profile_record["health_goals"] = [goal.lower() for goal in profile_data.health_goals]
        if profile_data.custom_health_goal is not None:
            profile_record["custom_health_goal"] = profile_data.custom_health_goal.lower()
        
        # Add preferences as JSONB
        if profile_data.preferences is not None:
            preferences_dict = profile_data.preferences.dict(exclude_none=True)
            # Convert lists to lowercase for consistency
            if "diet" in preferences_dict and preferences_dict["diet"]:
                preferences_dict["diet"] = [item.lower() for item in preferences_dict["diet"]]
            if "likes" in preferences_dict and preferences_dict["likes"]:
                preferences_dict["likes"] = [item.lower() for item in preferences_dict["likes"]]
            if "dislikes" in preferences_dict and preferences_dict["dislikes"]:
                preferences_dict["dislikes"] = [item.lower() for item in preferences_dict["dislikes"]]
            if "allergies" in preferences_dict and preferences_dict["allergies"]:
                preferences_dict["allergies"] = [item.lower() for item in preferences_dict["allergies"]]
            if "conditions" in preferences_dict and preferences_dict["conditions"]:
                preferences_dict["conditions"] = [item.lower() for item in preferences_dict["conditions"]]
            
            profile_record["preferences"] = preferences_dict
        
        # Create the profile in Supabase
        profile_response = supabase.table('user_profiles').insert(profile_record).execute()
        
        if not profile_response.data:
            # If profile creation fails, we should clean up the user account
            # But for now, we'll just report the error
            raise HTTPException(status_code=500, detail="Failed to create user profile")
        
        created_profile = profile_response.data[0]
        print(f"✅ Profile created with ID: {created_profile['id']}")
        
        # Step 3: Create authentication token
        access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = create_access_token(
            data={"sub": str(user_id)}, expires_delta=access_token_expires
        )
        
        # Return success response with token and user info
        user_response_obj = User(
            id=created_user["id"],
            email=created_user["email"],
            full_name=created_user.get("username", profile_data.name),
            created_at=created_user.get("created_at")
        )
        
        return {
            "success": True,
            "message": "Account created successfully",
            "access_token": access_token,
            "token_type": "bearer",
            "user": user_response_obj.dict(),
            "profile": {
                "id": created_profile["id"],
                "user_id": created_profile["user_id"],
                "name": created_profile.get("name"),
                "age": created_profile.get("age"),
                "gender": created_profile.get("gender"),
                "height_ft": created_profile.get("height_ft"),
                "weight_lbs": created_profile.get("weight_lbs"),
                "activity_level": created_profile.get("activity_level"),
                "health_goals": created_profile.get("health_goals"),
                "custom_health_goal": created_profile.get("custom_health_goal"),
                "location": created_profile.get("location"),
                "preferences": created_profile.get("preferences"),
                "created_at": created_profile.get("created_at"),
                "updated_at": created_profile.get("updated_at")
            }
        }
        
    except HTTPException:
        # Re-raise HTTP exceptions
        raise
    except Exception as e:
        print(f"Error in complete user registration: {str(e)}")
        print(f"Error type: {type(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Registration failed: {str(e)}")

# ===== MEAL PLANNING ENDPOINTS =====

@app.post("/api/generate-meal-plan", response_model=MealPlanResponse)
async def create_meal_plan(
    force_refresh: bool = Query(False, description="Force refresh of meal plan, bypassing cache"),
    current_user_id: int = Depends(get_current_user)
):
    """
    Generate a personalized 7-day meal plan based on user's profile
    
    - **force_refresh**: Set to true to generate a fresh meal plan, bypassing cache
    - Requires authentication
    - Uses all onboarding data from user's profile
    - Returns structured meal plan with shopping list
    """
    try:
        # Get user's profile from database
        if supabase is None:
            raise HTTPException(status_code=500, detail="Database not configured for meal planning")
        
        # Fetch user profile
        profile_response = supabase.table('user_profiles').select("*").eq("user_id", current_user_id).execute()
        
        if not profile_response.data:
            raise HTTPException(status_code=404, detail="User profile not found. Please complete onboarding first.")
        
        profile_data = profile_response.data[0]
        
        # Convert database profile to the format expected by meal planner
        # Safely get preferences with null checking
        preferences = profile_data.get("preferences") or {}
        
        user_profile = {
            "basicInformation": {
                "username": profile_data.get("name", "User"),
                "height": profile_data.get("height_ft", 5.5),
                "weight": profile_data.get("weight_lbs", 150),
                "activityLevel": profile_data.get("activity_level", "Moderate")
            },
            "medicalConditions": {"conditions": preferences.get("conditions", []) if preferences else []},
            "healthGoal": {
                "goal": profile_data.get("health_goals", ["General health"])[0] if profile_data.get("health_goals") else "General health"
            },
            "dietaryPreferences": {
                "preferences": preferences.get("diet", []) if preferences else []
            },
            "allergiesIntolerances": {
                "allergies": preferences.get("allergies", []) if preferences else []
            },
            "mealHabits": {
                "mealsPerDay": preferences.get("meals_per_day", 3) if preferences else 3,
                "snacks": preferences.get("snacks", False) if preferences else False,
                "cooksOften": preferences.get("cooks_often", True) if preferences else True,
                "foodsDisliked": ", ".join(preferences.get("dislikes", [])) if preferences and preferences.get("dislikes") else ""
            },
            "location": {
                "zipCodeOrCity": profile_data.get("location", "United States")
            }
        }
        
        print(f"🍽️ Generating meal plan for user {current_user_id}")
        print(f"Profile summary: {user_profile}")
        
        # Generate meal plan
        meal_plan = await generate_meal_plan(user_profile, force_refresh=force_refresh)
        
        return meal_plan
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Error generating meal plan: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Failed to generate meal plan: {str(e)}")


@app.get("/api/meal-plan-cache/stats")
async def get_meal_plan_cache_stats(current_user_id: int = Depends(get_current_user)):
    """Get statistics about the Redis meal plan cache"""
    try:
        stats = await get_cache_stats()
        return {
            "cache_stats": stats,
            "message": "Cache statistics retrieved successfully"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get cache stats: {str(e)}")


@app.delete("/api/meal-plan-cache")
async def clear_user_meal_plan_cache(current_user_id: int = Depends(get_current_user)):
    """Clear Redis meal plan cache for the current user"""
    try:
        # Get user profile to generate cache key
        if supabase is None:
            raise HTTPException(status_code=500, detail="Database not configured")
        
        profile_response = supabase.table('user_profiles').select("*").eq("user_id", current_user_id).execute()
        
        if profile_response.data:
            profile_data = profile_response.data[0]
            # Convert to user profile format for cache key generation (full profile needed for accurate cache key)
            # Safely get preferences with null checking
            preferences = profile_data.get("preferences") or {}
            
            user_profile = {
                "basicInformation": {
                    "username": profile_data.get("name", "User"),
                    "height": profile_data.get("height_ft", 5.5),
                    "weight": profile_data.get("weight_lbs", 150),
                    "activityLevel": profile_data.get("activity_level", "Moderate")
                },
                "medicalConditions": {"conditions": preferences.get("conditions", []) if preferences else []},
                "healthGoal": {
                    "goal": profile_data.get("health_goals", ["General health"])[0] if profile_data.get("health_goals") else "General health"
                },
                "dietaryPreferences": {
                    "preferences": preferences.get("diet", []) if preferences else []
                },
                "allergiesIntolerances": {
                    "allergies": preferences.get("allergies", []) if preferences else []
                },
                "mealHabits": {
                    "mealsPerDay": preferences.get("meals_per_day", 3) if preferences else 3,
                    "snacks": preferences.get("snacks", False) if preferences else False,
                    "cooksOften": preferences.get("cooks_often", True) if preferences else True,
                    "foodsDisliked": ", ".join(preferences.get("dislikes", [])) if preferences and preferences.get("dislikes") else ""
                },
                "location": {
                    "zipCodeOrCity": profile_data.get("location", "United States")
                }
            }
            
            result = await clear_meal_plan_cache(user_profile)
            return {
                "message": "Meal plan cache cleared successfully",
                "result": result
            }
        
        return {"message": "No user profile found, nothing to clear"}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to clear cache: {str(e)}")


@app.delete("/api/meal-plan-cache/all")
async def clear_all_meal_plan_cache(current_user_id: int = Depends(get_current_user)):
    """Clear all Redis meal plan cache entries (admin operation)"""
    try:
        result = await clear_meal_plan_cache()  # No user_profile means clear all
        return {
            "message": "All meal plan cache entries cleared",
            "result": result
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to clear all cache: {str(e)}")


@app.get("/api/user-profile-for-meal-planning")
async def get_user_profile_summary(current_user_id: int = Depends(get_current_user)):
    """Get user profile summary formatted for meal planning preview"""
    try:
        if supabase is None:
            raise HTTPException(status_code=500, detail="Database not configured")
        
        # Fetch user profile
        profile_response = supabase.table('user_profiles').select("*").eq("user_id", current_user_id).execute()
        
        if not profile_response.data:
            raise HTTPException(status_code=404, detail="User profile not found")
        
        profile_data = profile_response.data[0]
        
        # Format for display
        # Safely get preferences with null checking
        preferences = profile_data.get("preferences") or {}
        
        summary = {
            "basic_info": {
                "name": profile_data.get("name", "User"),
                "height_ft": profile_data.get("height_ft"),
                "weight_lbs": profile_data.get("weight_lbs"),
                "activity_level": profile_data.get("activity_level")
            },
            "health_goals": profile_data.get("health_goals", []),
            "dietary_preferences": preferences.get("diet", []) if preferences else [],
            "allergies": preferences.get("allergies", []) if preferences else [],
            "meal_habits": {
                "meals_per_day": preferences.get("meals_per_day", 3) if preferences else 3,
                "snacks": preferences.get("snacks", False) if preferences else False,
                "cooks_often": preferences.get("cooks_often", True) if preferences else True,
                "dislikes": preferences.get("dislikes", []) if preferences else []
            },
            "location": profile_data.get("location", "United States")
        }
        
        return {
            "profile": summary,
            "meal_planning_ready": True,
            "message": "Profile ready for meal planning"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error getting profile summary: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to get profile summary: {str(e)}")


# Test endpoint for meal planning (development only)
@app.post("/api/test-meal-plan")
async def test_meal_planning():
    """Test meal planning with sample data (development only)"""
    sample_profile = {
        "basicInformation": {
            "username": "testuser",
            "height": 5.8,
            "weight": 150,
            "activityLevel": "Moderate"
        },
        "medicalConditions": {
            "conditions": ["Diabetes"],
            "diabetesInsulin": True
        },
        "healthGoal": {
            "goal": "Lose weight"
        },
        "dietaryPreferences": {
            "preferences": ["Vegetarian"]
        },
        "allergiesIntolerances": {
            "allergies": ["Nuts"]
        },
        "mealHabits": {
            "mealsPerDay": 3,
            "snacks": True,
            "cooksOften": True,
            "foodsDisliked": "Spinach, Mushrooms"
        },
        "location": {
            "zipCodeOrCity": "New York, NY"
        }
    }
    
    try:
        meal_plan = await generate_meal_plan(sample_profile)
        return {
            "message": "Test meal plan generated successfully",
            "meal_plan": meal_plan,
            "note": "This is a test endpoint for development only"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Test failed: {str(e)}")

async def store_meal_plan_in_database(user_id: int, meal_plan_data: dict) -> dict:
    """
    Store a generated meal plan in Supabase database with transaction-like behavior
    
    Args:
        user_id: The authenticated user's ID
        meal_plan_data: The meal plan data in the expected format:
        {
            "start_date": "2025-06-30",
            "mealPlan": [
                {
                    "day": "Monday",
                    "meals": [
                        {
                            "meal_type": "breakfast",
                            "title": "Oatmeal with Berries",
                            "description": "...",
                            "calories": 300,
                            "cook_time": 10,
                            "tags": ["vegetarian", "gluten-free"],
                            "ingredients": ["1 cup rolled oats", ...]
                        }
                    ]
                }
            ],
            "shoppingList": {
                "Dairy": [
                    {"item_name": "Greek yogurt", "quantity": "1 quart", "price_range": "$4–5"}
                ]
            }
        }
        
    Returns:
        dict: Success message and meal_plan_id
    """
    meal_plan_id = None
    created_recipe_ids = []
    created_meal_plan_item_ids = []
    created_shopping_item_ids = []
    
    try:
        if supabase is None:
            raise HTTPException(status_code=500, detail="Database not configured")
        
        import re
        from datetime import datetime, timedelta
        
        # Extract data from meal plan
        start_date = meal_plan_data.get("start_date")
        meal_plan = meal_plan_data.get("mealPlan", [])
        shopping_list = meal_plan_data.get("shoppingList", {})
        
        if not start_date:
            raise ValueError("start_date is required")
        
        # Parse start_date and calculate end_date (7-day plan)
        start_date_obj = datetime.strptime(start_date, "%Y-%m-%d").date()
        end_date_obj = start_date_obj + timedelta(days=6)
        
        # Helper function to parse price range
        def parse_price_range(price_range: str) -> tuple:
            """Parse price range like '$4–5' or '$3-4' into (min, max)"""
            if not price_range:
                return None, None
            
            # Remove $ and spaces, handle both – and - separators
            clean_price = price_range.replace('$', '').replace(' ', '')
            
            # Try different patterns
            patterns = [
                r'(\d+(?:\.\d{2})?)[–-](\d+(?:\.\d{2})?)',  # $4–5 or $4-5
                r'(\d+(?:\.\d{2})?)',  # Just $4
            ]
            
            for pattern in patterns:
                match = re.search(pattern, clean_price)
                if match:
                    if len(match.groups()) == 2:
                        return float(match.group(1)), float(match.group(2))
                    else:
                        price = float(match.group(1))
                        return price, price
            
            return None, None
        
        # Helper function to normalize dietary tags
        def normalize_tags(tags: list) -> list:
            """Normalize dietary tags"""
            if not tags:
                return []
            
            tag_mapping = {
                '🚫🌾': 'gluten-free',
                '🌱': 'vegan',
                '🥛': 'vegetarian',
                '🐟': 'pescatarian',
                '🥩': 'keto',
                '🌾': 'whole-grain',
            }
            
            normalized = []
            for tag in tags:
                # Apply mapping if exists, otherwise keep original (lowercased)
                normalized_tag = tag_mapping.get(tag, str(tag).lower().strip())
                if normalized_tag:
                    normalized.append(normalized_tag)
            
            return normalized
        
        # Start transaction-like operations
        logger.info(f"📝 Storing meal plan for user {user_id} from {start_date} to {end_date_obj}")
        
        # 1. Insert meal plan
        meal_plan_insert = {
            "user_id": user_id,
            "start_date": start_date,
            "end_date": str(end_date_obj),
            "is_basket": False
        }
        
        meal_plan_response = supabase.table('meal_plans').insert(meal_plan_insert).execute()
        
        if not meal_plan_response.data:
            raise Exception("Failed to create meal plan record")
        
        meal_plan_id = meal_plan_response.data[0]['id']
        logger.info(f"✅ Created meal plan with ID: {meal_plan_id}")
        
        # 2. Process meals and recipes
        recipe_cache = {}  # Cache to avoid duplicate recipe lookups
        
        for day_index, day_data in enumerate(meal_plan):
            day_name = day_data.get("day", f"Day {day_index + 1}")
            meals = day_data.get("meals", [])
            
            # Handle different meal plan structures
            if not meals:
                # Try alternate structure with direct meal properties (for backwards compatibility)
                meal_types = ['breakfast', 'lunch', 'dinner', 'snacks']
                for meal_type in meal_types:
                    if meal_type in day_data:
                        meal_data = day_data[meal_type]
                        if meal_data:
                            if meal_type == 'snacks' and isinstance(meal_data, list):
                                # Handle snacks as array
                                for snack in meal_data:
                                    meals.append({
                                        'meal_type': 'snack',
                                        **snack
                                    })
                            else:
                                meals.append({
                                    'meal_type': meal_type,
                                    **meal_data
                                })
            
            for meal in meals:
                meal_type = meal.get("meal_type", "unknown")
                title = meal.get("title", "")
                description = meal.get("description", "")
                calories = meal.get("calories", 0)
                cook_time = meal.get("cook_time", meal.get("cooking_time", "0 minutes"))
                tags = meal.get("tags", meal.get("dietary_tags", []))
                ingredients = meal.get("ingredients", [])
                
                if not title:
                    continue
                
                # Parse cook time (extract minutes)
                cook_time_minutes = 0
                if isinstance(cook_time, str):
                    time_match = re.search(r'(\d+)', cook_time)
                    if time_match:
                        cook_time_minutes = int(time_match.group(1))
                elif isinstance(cook_time, (int, float)):
                    cook_time_minutes = int(cook_time)
                
                # Normalize tags
                normalized_tags = normalize_tags(tags)
                
                # Check if recipe already exists (by title)
                recipe_id = recipe_cache.get(title)
                
                if not recipe_id:
                    # Check database for existing recipe
                    existing_recipe = supabase.table('recipes').select("id").eq("name", title).execute()
                    
                    if existing_recipe.data:
                        recipe_id = existing_recipe.data[0]['id']
                        recipe_cache[title] = recipe_id
                    else:
                        # Create new recipe
                        recipe_insert = {
                            "name": title,
                            "description": description,
                            "prep_time_minutes": 0,  # Not provided in current structure
                            "cook_time_minutes": cook_time_minutes,
                            "total_calories": calories,
                            "tags": normalized_tags,
                            "ingredients": ingredients
                        }
                        
                        recipe_response = supabase.table('recipes').insert(recipe_insert).execute()
                        
                        if not recipe_response.data:
                            raise Exception(f"Failed to create recipe: {title}")
                        
                        recipe_id = recipe_response.data[0]['id']
                        recipe_cache[title] = recipe_id
                        logger.info(f"✅ Created recipe: {title} (ID: {recipe_id})")
                
                # Insert meal plan item (calculate actual date for the day)
                day_date = start_date_obj + timedelta(days=day_index)
                meal_plan_item_insert = {
                    "meal_plan_id": meal_plan_id,
                    "day": str(day_date),  # Actual date (YYYY-MM-DD format)
                    "meal_type": meal_type,
                    "recipe_id": recipe_id
                }
                
                meal_plan_item_response = supabase.table('meal_plan_items').insert(meal_plan_item_insert).execute()
                
                if not meal_plan_item_response.data:
                    raise Exception(f"Failed to create meal plan item for {title}")
                
                # Track created items for potential rollback
                created_meal_plan_item_ids.append(meal_plan_item_response.data[0]['id'])
        
        # 3. Process shopping list
        shopping_items_created = 0
        
        for category, items in shopping_list.items():
            for item in items:
                item_name = item.get("item_name", item.get("item", ""))
                quantity = item.get("quantity", "1 item")
                price_range = item.get("price_range", item.get("estimated_cost", ""))
                
                if not item_name:
                    continue
                
                # Parse price range
                price_min, price_max = parse_price_range(price_range)
                
                shopping_item_insert = {
                    "meal_plan_id": meal_plan_id,
                    "category": category,
                    "item_name": item_name,
                    "quantity": quantity,
                    "price_min": price_min,
                    "price_max": price_max,
                    "is_checked": False
                }
                
                shopping_item_response = supabase.table('shopping_list_items').insert(shopping_item_insert).execute()
                
                if shopping_item_response.data:
                    shopping_items_created += 1
                    # Track created items for potential rollback
                    created_shopping_item_ids.append(shopping_item_response.data[0]['id'])
        
        logger.info(f"✅ Stored meal plan successfully!")
        logger.info(f"📊 Created {len(recipe_cache)} recipes, {shopping_items_created} shopping items")
        
        return {
            "success": True,
            "message": "Meal plan stored successfully",
            "meal_plan_id": meal_plan_id,
            "recipes_created": len(recipe_cache),
            "shopping_items_created": shopping_items_created,
            "start_date": start_date,
            "end_date": str(end_date_obj)
        }
        
    except Exception as e:
        logger.error(f"❌ Error storing meal plan: {str(e)}")
        import traceback
        traceback.print_exc()
        
        # Rollback: Clean up any created records
        logger.warning("🔄 Rolling back created records...")
        
        try:
            # Delete shopping list items
            if created_shopping_item_ids:
                for item_id in created_shopping_item_ids:
                    supabase.table('shopping_list_items').delete().eq('id', item_id).execute()
                logger.info(f"🗑️ Rolled back {len(created_shopping_item_ids)} shopping items")
            
            # Delete meal plan items
            if created_meal_plan_item_ids:
                for item_id in created_meal_plan_item_ids:
                    supabase.table('meal_plan_items').delete().eq('id', item_id).execute()
                logger.info(f"🗑️ Rolled back {len(created_meal_plan_item_ids)} meal plan items")
            
            # Delete meal plan (this will cascade delete related items)
            if meal_plan_id:
                supabase.table('meal_plans').delete().eq('id', meal_plan_id).execute()
                logger.info(f"🗑️ Rolled back meal plan {meal_plan_id}")
            
            # Note: We don't delete recipes as they can be reused by other meal plans
            
        except Exception as rollback_error:
            logger.error(f"❌ Error during rollback: {str(rollback_error)}")
        
        raise Exception(f"Failed to store meal plan: {str(e)}")


@app.post("/api/store-meal-plan")
async def store_meal_plan_endpoint(
    meal_plan_data: dict,
    current_user_id: int = Depends(get_current_user)
):
    """
    Store a generated meal plan in the database
    
    Expected format:
    {
        "start_date": "2025-06-30",
        "mealPlan": [
            {
                "day": "Monday",
                "meals": [
                    {
                        "meal_type": "breakfast",
                        "title": "Oatmeal with Berries",
                        "description": "A healthy breakfast...",
                        "calories": 300,
                        "cook_time": 10,
                        "tags": ["vegetarian", "gluten-free"],
                        "ingredients": ["1 cup rolled oats", "2 cups water", ...]
                    }
                ]
            }
        ],
        "shoppingList": {
            "Dairy": [
                {"item_name": "Greek yogurt", "quantity": "1 quart", "price_range": "$4–5"}
            ],
            "Produce": [
                {"item_name": "Strawberries", "quantity": "1 pint", "price_range": "$3–4"}
            ]
        }
    }
    """
    try:
        logger.info(f"🔄 Storing meal plan for user {current_user_id}")
        logger.info(f"📋 Meal plan data keys: {list(meal_plan_data.keys())}")
        
        result = await store_meal_plan_in_database(current_user_id, meal_plan_data)
        return result
    except Exception as e:
        logger.error(f"❌ Store meal plan endpoint error: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/generate-and-store-meal-plan")
async def generate_and_store_meal_plan(
    start_date: str = Query(..., description="Start date for meal plan (YYYY-MM-DD)"),
    force_refresh: bool = Query(False, description="Force refresh of meal plan, bypassing cache"),
    current_user_id: int = Depends(get_current_user)
):
    """
    Generate a meal plan and automatically store it in the database
    
    This combines meal plan generation with database storage
    """
    try:
        # Get user's profile from database
        if supabase is None:
            raise HTTPException(status_code=500, detail="Database not configured for meal planning")
        
        # Fetch user profile
        profile_response = supabase.table('user_profiles').select("*").eq("user_id", current_user_id).execute()
        
        if not profile_response.data:
            raise HTTPException(status_code=404, detail="User profile not found. Please complete onboarding first.")
        
        profile_data = profile_response.data[0]
        
        # Convert database profile to the format expected by meal planner
        # Safely get preferences with null checking
        preferences = profile_data.get("preferences") or {}
        
        user_profile = {
            "basicInformation": {
                "username": profile_data.get("name", "User"),
                "height": profile_data.get("height_ft", 5.5),
                "weight": profile_data.get("weight_lbs", 150),
                "activityLevel": profile_data.get("activity_level", "Moderate")
            },
            "medicalConditions": {"conditions": preferences.get("conditions", []) if preferences else []},
            "healthGoal": {
                "goal": profile_data.get("health_goals", ["General health"])[0] if profile_data.get("health_goals") else "General health"
            },
            "dietaryPreferences": {
                "preferences": preferences.get("diet", []) if preferences else []
            },
            "allergiesIntolerances": {
                "allergies": preferences.get("allergies", []) if preferences else []
            },
            "mealHabits": {
                "mealsPerDay": preferences.get("meals_per_day", 3) if preferences else 3,
                "snacks": preferences.get("snacks", False) if preferences else False,
                "cooksOften": preferences.get("cooks_often", True) if preferences else True,
                "foodsDisliked": ", ".join(preferences.get("dislikes", [])) if preferences and preferences.get("dislikes") else ""
            },
            "location": {
                "zipCodeOrCity": profile_data.get("location", "United States")
            }
        }
        
        print(f"🍽️ Generating and storing meal plan for user {current_user_id}")
        
        # Generate meal plan
        meal_plan_response = await generate_meal_plan(user_profile, force_refresh=force_refresh)
        
        # Convert to storage format
        storage_data = {
            "start_date": start_date,
            "mealPlan": meal_plan_response.meal_plan,
            "shoppingList": {}
        }
        
        # Convert shopping list to grouped format
        for item in meal_plan_response.shopping_list:
            category = item.category
            if category not in storage_data["shoppingList"]:
                storage_data["shoppingList"][category] = []
            
            storage_data["shoppingList"][category].append({
                "item_name": item.item,
                "quantity": item.quantity,
                "price_range": item.estimated_cost or ""
            })
        
        # Store in database
        storage_result = await store_meal_plan_in_database(current_user_id, storage_data)
        
        return {
            "meal_plan": meal_plan_response,
            "storage_result": storage_result,
            "message": "Meal plan generated and stored successfully"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Error in generate and store: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Failed to generate and store meal plan: {str(e)}")


# Test endpoint for meal planning (development only)
