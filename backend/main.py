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
@app.get("/api/todos")
def get_todos2(todo_name: str = Query(None, description = 'optional query')):
    if todo_name is not None:
        return {
            "status": "success",
            'message': "Here all of your todos" + todo_name
        }
    else:
        return {
            "status": "success",
            'message': "Here all of your todo for "
        }

# Todo model
class Todo(BaseModel):
    id: Optional[int] = None
    title: str
    completed: bool = False

# Fallback in-memory storage if Supabase isn't configured
todos: List[Todo] = []

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
