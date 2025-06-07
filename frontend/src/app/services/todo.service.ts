import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, throwError } from 'rxjs';
import { Todo } from '../interfaces/todo.interface';
import { catchError, retry, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class TodoService {
  private apiUrl = 'http://localhost:8000/api/todos';
  private todosSubject = new BehaviorSubject<Todo[]>([]);
  public todos$ = this.todosSubject.asObservable();

  constructor(private http: HttpClient) {
    this.loadTodos();
  }

  private loadTodos(): void {
    this.http.get<Todo[]>(this.apiUrl)
      .pipe(
        retry(2),
        catchError(this.handleError)
      )
      .subscribe(todos => {
        this.todosSubject.next(todos);
      });
  }

  getTodos(): Observable<Todo[]> {
    return this.todos$;
  }

  addTodo(todo: Todo): Observable<Todo> {
    return this.http.post<Todo>(this.apiUrl, todo)
      .pipe(
        retry(1),
        tap((newTodo: Todo) => {
          const currentTodos = this.todosSubject.value;
          this.todosSubject.next([...currentTodos, newTodo]);
        }),
        catchError(this.handleError)
      );
  }

  updateTodo(todo: Todo): Observable<Todo> {
    return this.http.put<Todo>(`${this.apiUrl}/${todo.id}`, todo)
      .pipe(
        retry(1),
        tap((updatedTodo: Todo) => {
          const currentTodos = this.todosSubject.value;
          const index = currentTodos.findIndex(t => t.id === updatedTodo.id);
          if (index !== -1) {
            currentTodos[index] = updatedTodo;
            this.todosSubject.next([...currentTodos]);
          }
        }),
        catchError(this.handleError)
      );
  }

  deleteTodo(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`)
      .pipe(
        retry(1),
        tap(() => {
          const currentTodos = this.todosSubject.value;
          const filteredTodos = currentTodos.filter(todo => todo.id !== id);
          this.todosSubject.next(filteredTodos);
        }),
        catchError(this.handleError)
      );
  }

  // Optimistic update methods
  optimisticUpdateTodo(todo: Todo): void {
    const currentTodos = this.todosSubject.value;
    const index = currentTodos.findIndex(t => t.id === todo.id);
    if (index !== -1) {
      currentTodos[index] = { ...todo };
      this.todosSubject.next([...currentTodos]);
    }
  }

  optimisticDeleteTodo(id: number): Todo | null {
    const currentTodos = this.todosSubject.value;
    const todoToDelete = currentTodos.find(t => t.id === id);
    if (todoToDelete) {
      const filteredTodos = currentTodos.filter(todo => todo.id !== id);
      this.todosSubject.next(filteredTodos);
      return todoToDelete;
    }
    return null;
  }

  revertOptimisticUpdate(todos: Todo[]): void {
    this.todosSubject.next([...todos]);
  }

  refreshTodos(): void {
    this.loadTodos();
  }

  private handleError(error: any): Observable<never> {
    console.error('TodoService error:', error);
    return throwError(() => new Error('Something went wrong. Please try again.'));
  }
}
