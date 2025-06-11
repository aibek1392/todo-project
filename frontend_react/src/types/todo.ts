export interface Todo {
  id?: number;
  title: string;
  completed: boolean;
  user_id?: number;
}

export interface TodoState {
  todos: Todo[];
  isLoading: boolean;
  error: string | null;
} 