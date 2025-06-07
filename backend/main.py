from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Optional
from pydantic import BaseModel
from database import supabase

app = FastAPI()

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Todo model
class Todo(BaseModel):
    id: Optional[int] = None
    title: str
    completed: bool = False

# User model
class User(BaseModel):
    id: Optional[int] = None
    username: str
    email: str
    password_hash: Optional[str] = None
    age: Optional[int] = None
    health_goals: Optional[List[str]] = None  # Array of health goals
    preferences: Optional[dict] = None  # JSON object for preferences
    created_at: Optional[str] = None

# Fallback in-memory storage if Supabase isn't configured
todos: List[Todo] = []
users: List[User] = []

# ============= TODO ENDPOINTS =============

@app.get("/api/todos")
async def get_todos():
    if supabase is None:
        return todos
    try:
        response = supabase.table('todos').select("*").execute()
        return response.data
    except Exception as e:
        print(f"Supabase error: {str(e)}")
        return todos
    

@app.post("/api/todos")
async def create_todo(todo: Todo):
    if supabase is None:
        todo.id = len(todos) + 1
        todos.append(todo)
        return todo
    try:
        response = supabase.table('todos').insert({
            "title": todo.title,
            "completed": todo.completed
        }).execute()
        return response.data[0]
    except Exception as e:
        print(f"Supabase error: {str(e)}")
        todo.id = len(todos) + 1
        todos.append(todo)
        return todo

@app.put("/api/todos/{todo_id}")
async def update_todo(todo_id: int, updated_todo: Todo):
    if supabase is None:
        for todo in todos:
            if todo.id == todo_id:
                todo.title = updated_todo.title
                todo.completed = updated_todo.completed
                return todo
        raise HTTPException(status_code=404, detail="Todo not found")
    try:
        response = supabase.table('todos').update({
            "title": updated_todo.title,
            "completed": updated_todo.completed
        }).eq("id", todo_id).execute()
        
        if not response.data:
            raise HTTPException(status_code=404, detail="Todo not found")
            
        return response.data[0]
    except Exception as e:
        print(f"Supabase error: {str(e)}")
        for todo in todos:
            if todo.id == todo_id:
                todo.title = updated_todo.title
                todo.completed = updated_todo.completed
                return todo
        raise HTTPException(status_code=404, detail="Todo not found")

@app.delete("/api/todos/{todo_id}")
async def delete_todo(todo_id: int):
    if supabase is None:
        for index, todo in enumerate(todos):
            if todo.id == todo_id:
                return todos.pop(index)
        raise HTTPException(status_code=404, detail="Todo not found")
    try:
        response = supabase.table('todos').delete().eq("id", todo_id).execute()
        
        if not response.data:
            raise HTTPException(status_code=404, detail="Todo not found")
            
        return {"message": "Todo deleted successfully"}
    except Exception as e:
        print(f"Supabase error: {str(e)}")
        for index, todo in enumerate(todos):
            if todo.id == todo_id:
                return todos.pop(index)
        raise HTTPException(status_code=404, detail="Todo not found")

# ============= USER ENDPOINTS =============

@app.get("/api/users")
async def get_users():
    if supabase is None:
        return users
    try:
        response = supabase.table('users').select("*").execute()
        return response.data
    except Exception as e:
        print(f"Supabase error: {str(e)}")
        return users

@app.get("/api/users/{user_id}")
async def get_user(user_id: int):
    if supabase is None:
        for user in users:
            if user.id == user_id:
                return user
        raise HTTPException(status_code=404, detail="User not found")
    try:
        response = supabase.table('users').select("*").eq("id", user_id).execute()
        
        if not response.data:
            raise HTTPException(status_code=404, detail="User not found")
            
        return response.data[0]
    except Exception as e:
        print(f"Supabase error: {str(e)}")
        for user in users:
            if user.id == user_id:
                return user
        raise HTTPException(status_code=404, detail="User not found")

@app.post("/api/users")
async def create_user(user: User):
    if supabase is None:
        user.id = len(users) + 1
        users.append(user)
        return user
    try:
        response = supabase.table('users').insert({
            "username": user.username,
            "email": user.email,
            "password_hash": user.password_hash,
            "age": user.age,
            "health_goals": user.health_goals,
            "preferences": user.preferences
        }).execute()
        return response.data[0]
    except Exception as e:
        print(f"Supabase error: {str(e)}")
        user.id = len(users) + 1
        users.append(user)
        return user

@app.put("/api/users/{user_id}")
async def update_user(user_id: int, updated_user: User):
    if supabase is None:
        for user in users:
            if user.id == user_id:
                user.username = updated_user.username
                user.email = updated_user.email
                user.password_hash = updated_user.password_hash
                user.age = updated_user.age
                user.health_goals = updated_user.health_goals
                user.preferences = updated_user.preferences
                return user
        raise HTTPException(status_code=404, detail="User not found")
    try:
        response = supabase.table('users').update({
            "username": updated_user.username,
            "email": updated_user.email,
            "password_hash": updated_user.password_hash,
            "age": updated_user.age,
            "health_goals": updated_user.health_goals,
            "preferences": updated_user.preferences
        }).eq("id", user_id).execute()
        
        if not response.data:
            raise HTTPException(status_code=404, detail="User not found")
            
        return response.data[0]
    except Exception as e:
        print(f"Supabase error: {str(e)}")
        for user in users:
            if user.id == user_id:
                user.username = updated_user.username
                user.email = updated_user.email
                user.password_hash = updated_user.password_hash
                user.age = updated_user.age
                user.health_goals = updated_user.health_goals
                user.preferences = updated_user.preferences
                return user
        raise HTTPException(status_code=404, detail="User not found")

@app.delete("/api/users/{user_id}")
async def delete_user(user_id: int):
    if supabase is None:
        for index, user in enumerate(users):
            if user.id == user_id:
                return users.pop(index)
        raise HTTPException(status_code=404, detail="User not found")
    try:
        response = supabase.table('users').delete().eq("id", user_id).execute()
        
        if not response.data:
            raise HTTPException(status_code=404, detail="User not found")
            
        return {"message": "User deleted successfully"}
    except Exception as e:
        print(f"Supabase error: {str(e)}")
        for index, user in enumerate(users):
            if user.id == user_id:
                return users.pop(index)
        raise HTTPException(status_code=404, detail="User not found")
