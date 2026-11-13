import { Routes } from '@angular/router';
import { TodoList } from './pages/todo-list/todo-list';
import { TodoDetail } from './pages/todo-detail/todo-detail';

export const routes: Routes = [
  { path: '', redirectTo: 'todos', pathMatch: 'full' },
  { path: 'todos', component: TodoList },
  { path: 'todos/:id', component: TodoDetail },
  { path: '**', redirectTo: 'todos' },
];
