import { Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { catchError, map, of, startWith, switchMap } from 'rxjs';
import { Post, PostsService, errorMessage } from './posts.service';
interface DetailState { loading: boolean; post: Post | null; error: string; }
@Component({selector: 'app-post-detail', imports: [RouterLink], template: `
  <a routerLink="/posts">← Tutti i post</a>
  <section class="panel detail">
    @if (state().loading) { <p role="status">Caricamento del post…</p> }
    @if (state().error) { <h1>Impossibile aprire il post</h1><p role="alert" class="error">{{ state().error }}</p> }
    @if (state().post; as post) {
      <span class="badge">POST #{{ post.id }} · UTENTE {{ post.userId }}</span>
      <h1>{{ post.title }}</h1><p class="post-body">{{ post.body }}</p>
    }
    <nav aria-label="Navigazione post">
      @if (id() > 1) { <a class="button" [routerLink]="['/posts', id() - 1]">← Precedente</a> }
      @else { <span class="button disabled" aria-disabled="true">← Precedente</span> }
      @if (id() > 0 && id() < maxId()) { <a class="button" [routerLink]="['/posts', id() + 1]">Successivo →</a> }
      @else { <span class="button disabled" aria-disabled="true">Successivo →</span> }
    </nav>
  </section>
`})
export class PostDetail {
  private readonly service = inject(PostsService);
  readonly id = signal(0);
  readonly maxId = computed(() => Math.max(100, ...this.service.posts().map(post => post.id)));
  readonly state = signal<DetailState>({loading: true, post: null, error: ''});
  constructor() {
    inject(ActivatedRoute).paramMap.pipe(switchMap(params => {
      const rawId = params.get('id') ?? '';
      const id = /^\d+$/.test(rawId) ? Number(rawId) : 0;
      this.id.set(id);
      if (!Number.isSafeInteger(id) || id < 1) return of<DetailState>({loading: false, post: null, error: 'Post inesistente (404): identificativo non valido.'});
      return this.service.getOne(id).pipe(
        map(post => ({loading: false, post, error: ''} as DetailState)),
        catchError(error => of<DetailState>({loading: false, post: null, error: errorMessage(error)})),
        startWith<DetailState>({loading: true, post: null, error: ''}),
      );
    }), takeUntilDestroyed()).subscribe(state => this.state.set(state));
  }
}
