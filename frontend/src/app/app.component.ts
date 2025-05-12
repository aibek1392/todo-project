import { Component } from '@angular/core';
import { TodoListComponent } from './components/todo-list/todo-list.component';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [TodoListComponent, FormsModule],
  template: `
    <app-todo-list></app-todo-list>
  `,
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'frontend';
}
