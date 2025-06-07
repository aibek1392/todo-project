import { Component, OnInit, OnDestroy } from '@angular/core';
import { TodoService } from '../../services/todo.service';
import { Todo } from '../../interfaces/todo.interface';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-todo-list',
  templateUrl: './todo-list.component.html',
  styleUrls: ['./todo-list.component.scss'],
  standalone: true,
  imports: [FormsModule]
})
export class TodoListComponent implements OnInit, OnDestroy {
  todos: Todo[] = [];
  newTodoTitle: string = '';
  isLoading: boolean = false;
  isAdding: boolean = false;
  deletingIds: Set<number> = new Set();
  updatingIds: Set<number> = new Set();
  error: string = '';
  private subscription: Subscription = new Subscription();

  constructor(private todoService: TodoService) { }

  ngOnInit(): void {
    this.loadTodos();
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  loadTodos(): void {
    this.isLoading = true;
    this.error = '';
    
    const sub = this.todoService.getTodos().subscribe({
      next: (todos) => {
        this.todos = todos;
        this.isLoading = false;
      },
      error: (error) => {
        this.error = 'Failed to load todos. Please try again.';
        this.isLoading = false;
        console.error('Error loading todos:', error);
      }
    });
    
    this.subscription.add(sub);
  }

  addTodo(): void {
    if (this.newTodoTitle.trim() && !this.isAdding) {
      this.isAdding = true;
      this.error = '';
      
      const newTodo: Todo = {
        title: this.newTodoTitle.trim(),
        completed: false
      };

      // Optimistic update - add to UI immediately
      const tempId = Date.now(); // Temporary ID
      const optimisticTodo = { ...newTodo, id: tempId };
      this.todos = [...this.todos, optimisticTodo];
      const originalTitle = this.newTodoTitle;
      this.newTodoTitle = '';

      const sub = this.todoService.addTodo(newTodo).subscribe({
        next: (createdTodo) => {
          // Replace the optimistic todo with the real one
          this.todos = this.todos.map(t => 
            t.id === tempId ? createdTodo : t
          );
          this.isAdding = false;
        },
        error: (error) => {
          // Revert optimistic update
          this.todos = this.todos.filter(t => t.id !== tempId);
          this.newTodoTitle = originalTitle;
          this.error = 'Failed to add todo. Please try again.';
          this.isAdding = false;
          console.error('Error adding todo:', error);
        }
      });
      
      this.subscription.add(sub);
    }
  }

  toggleTodo(todo: Todo): void {
    if (this.updatingIds.has(todo.id!)) return;
    
    this.updatingIds.add(todo.id!);
    this.error = '';
    
    // Optimistic update
    const originalCompleted = todo.completed;
    todo.completed = !todo.completed;
    this.todoService.optimisticUpdateTodo(todo);

    const sub = this.todoService.updateTodo(todo).subscribe({
      next: () => {
        this.updatingIds.delete(todo.id!);
      },
      error: (error) => {
        // Revert optimistic update
        todo.completed = originalCompleted;
        this.todoService.optimisticUpdateTodo(todo);
        this.updatingIds.delete(todo.id!);
        this.error = 'Failed to update todo. Please try again.';
        console.error('Error updating todo:', error);
      }
    });
    
    this.subscription.add(sub);
  }

  deleteTodo(id: number): void {
    if (this.deletingIds.has(id)) return;
    
    this.deletingIds.add(id);
    this.error = '';
    
    // Optimistic update
    const originalTodos = [...this.todos];
    const deletedTodo = this.todoService.optimisticDeleteTodo(id);
    
    if (!deletedTodo) {
      this.deletingIds.delete(id);
      return;
    }

    const sub = this.todoService.deleteTodo(id).subscribe({
      next: () => {
        this.deletingIds.delete(id);
      },
      error: (error) => {
        // Revert optimistic update
        this.todoService.revertOptimisticUpdate(originalTodos);
        this.deletingIds.delete(id);
        this.error = 'Failed to delete todo. Please try again.';
        console.error('Error deleting todo:', error);
      }
    });
    
    this.subscription.add(sub);
  }

  refreshTodos(): void {
    this.todoService.refreshTodos();
  }

  clearError(): void {
    this.error = '';
  }

  isOperationInProgress(todoId: number): boolean {
    return this.deletingIds.has(todoId) || this.updatingIds.has(todoId);
  }

  trackByFn(index: number, item: Todo): number {
    return item.id || index;
  }
}
