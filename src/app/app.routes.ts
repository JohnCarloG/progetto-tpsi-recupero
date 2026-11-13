import { Routes } from '@angular/router';
import { PostList } from './posts/post-list';
import { PostDetail } from './posts/post-detail';
export const routes: Routes = [
  { path: '', redirectTo: 'posts', pathMatch: 'full' },
  { path: 'posts', component: PostList },
  { path: 'posts/:id', component: PostDetail },
  { path: '**', redirectTo: 'posts' },
];
