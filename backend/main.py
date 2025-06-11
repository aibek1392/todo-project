from fastapi import FastAPI, HTTPException, Query, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from typing import List, Optional
from pydantic import BaseModel, EmailStr
from database import supabase
import jwt
import bcrypt
from datetime import datetime, timedelta
import os

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
    email: EmailStr
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
        
        # Always use in-memory storage for now (since we disabled Supabase)
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
        
        print("Creating user response...")
        user_response = User(
            id=new_user["id"],
            email=new_user["email"],
            full_name=new_user["full_name"],
            created_at=new_user["created_at"]
        )
        print("User response created successfully")
        
        token_response = Token(access_token=access_token, token_type="bearer", user=user_response)
        print("Signup successful!")
        return token_response
        
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
        # Find user in memory
        user = None
        for u in users:
            if u["email"] == user_credentials.email:
                user = u
                break
        
        if not user or not verify_password(user_credentials.password, user["password"]):
            raise HTTPException(status_code=401, detail="Incorrect email or password")
        
        # Create token
        access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = create_access_token(
            data={"sub": str(user["id"])}, expires_delta=access_token_expires
        )
        
        user_response = User(
            id=user["id"],
            email=user["email"],
            full_name=user["full_name"],
            created_at=user["created_at"]
        )
        
        return Token(access_token=access_token, token_type="bearer", user=user_response)
    
    try:
        # Find user in Supabase
        response = supabase.table('users').select("*").eq("email", user_credentials.email).execute()
        
        if not response.data:
            raise HTTPException(status_code=401, detail="Incorrect email or password")
        
        user = response.data[0]
        
        if not verify_password(user_credentials.password, user["password"]):
            raise HTTPException(status_code=401, detail="Incorrect email or password")
        
        # Create token
        access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = create_access_token(
            data={"sub": str(user["id"])}, expires_delta=access_token_expires
        )
        
        user_response = User(
            id=user["id"],
            email=user["email"],
            full_name=user["full_name"],
            created_at=user.get("created_at")
        )
        
        return Token(access_token=access_token, token_type="bearer", user=user_response)
        
    except Exception as e:
        print(f"Supabase error: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

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
            full_name=user["full_name"],
            created_at=user.get("created_at")
        )
        
    except Exception as e:
        print(f"Supabase error: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

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
async def update_todo(todo_id: int, updated_todo: Todo, current_user_id: int = Depends(get_current_user)):
    if supabase is None:
        for todo in todos:
            if todo.id == todo_id and todo.user_id == current_user_id:
                todo.title = updated_todo.title
                todo.completed = updated_todo.completed
                return todo
        raise HTTPException(status_code=404, detail="Todo not found")
    try:
        response = supabase.table('todos').update({
            "title": updated_todo.title,
            "completed": updated_todo.completed
        }).eq("id", todo_id).eq("user_id", current_user_id).execute()
        
        if not response.data:
            raise HTTPException(status_code=404, detail="Todo not found")
            
        return response.data[0]
    except Exception as e:
        print(f"Supabase error: {str(e)}")
        for todo in todos:
            if todo.id == todo_id and todo.user_id == current_user_id:
                todo.title = updated_todo.title
                todo.completed = updated_todo.completed
                return todo
        raise HTTPException(status_code=404, detail="Todo not found")

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
