import { Routes } from '@angular/router';
import { PostList } from './posts/post-list';
import { PostDetail } from './posts/post-detail';
import { TodoList } from './pages/todo-list/todo-list';
import { TodoDetail } from './pages/todo-detail/todo-detail';
export const routes: Routes = [
  { path: '', redirectTo: 'posts', pathMatch: 'full' },
  { path: 'posts', component: PostList },
  { path: 'posts/:id', component: PostDetail },
  { path: 'todos', component: TodoList },
  { path: 'todos/:id', component: TodoDetail },
  { path: '**', redirectTo: 'posts' },
];
