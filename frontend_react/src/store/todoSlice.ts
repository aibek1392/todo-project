import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { TodoState, Todo } from '../types/todo';
import { todoAPI } from '../services/api';

// Initial state
const initialState: TodoState = {
  todos: [],
  isLoading: false,
  error: null,
};

// Async thunks
export const fetchTodos = createAsyncThunk(
  'todos/fetchTodos',
  async (_, { rejectWithValue }) => {
    try {
      const todos = await todoAPI.getTodos();
      return todos;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to fetch todos');
    }
  }
);

export const createTodo = createAsyncThunk(
  'todos/createTodo',
  async (todo: Omit<Todo, 'id' | 'user_id'>, { rejectWithValue }) => {
    try {
      const newTodo = await todoAPI.createTodo(todo);
      return newTodo;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to create todo');
    }
  }
);

export const updateTodo = createAsyncThunk(
  'todos/updateTodo',
  async ({ id, updates }: { id: number; updates: Partial<Todo> }, { rejectWithValue }) => {
    try {
      const updatedTodo = await todoAPI.updateTodo(id, updates);
      return updatedTodo;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to update todo');
    }
  }
);

export const deleteTodo = createAsyncThunk(
  'todos/deleteTodo',
  async (id: number, { rejectWithValue }) => {
    try {
      await todoAPI.deleteTodo(id);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to delete todo');
    }
  }
);

// Todo slice
const todoSlice = createSlice({
  name: 'todos',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearTodos: (state) => {
      state.todos = [];
    },
  },
  extraReducers: (builder) => {
    // Fetch todos
    builder
      .addCase(fetchTodos.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchTodos.fulfilled, (state, action) => {
        state.isLoading = false;
        state.todos = action.payload;
      })
      .addCase(fetchTodos.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Create todo
    builder
      .addCase(createTodo.pending, (state) => {
        state.error = null;
      })
      .addCase(createTodo.fulfilled, (state, action) => {
        state.todos.push(action.payload);
      })
      .addCase(createTodo.rejected, (state, action) => {
        state.error = action.payload as string;
      });

    // Update todo
    builder
      .addCase(updateTodo.pending, (state) => {
        state.error = null;
      })
      .addCase(updateTodo.fulfilled, (state, action) => {
        const index = state.todos.findIndex(todo => todo.id === action.payload.id);
        if (index !== -1) {
          state.todos[index] = action.payload;
        }
      })
      .addCase(updateTodo.rejected, (state, action) => {
        state.error = action.payload as string;
      });

    // Delete todo
    builder
      .addCase(deleteTodo.pending, (state) => {
        state.error = null;
      })
      .addCase(deleteTodo.fulfilled, (state, action) => {
        state.todos = state.todos.filter(todo => todo.id !== action.payload);
      })
      .addCase(deleteTodo.rejected, (state, action) => {
        state.error = action.payload as string;
      });
  },
});

export const { clearError, clearTodos } = todoSlice.actions;
export default todoSlice.reducer; 