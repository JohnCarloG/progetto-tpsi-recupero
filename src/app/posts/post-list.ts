import { Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize } from 'rxjs';
import { PostsService, errorMessage } from './posts.service';
@Component({selector: 'app-post-list', imports: [FormsModule, RouterLink], template: `
  <section class="intro"><p class="eyebrow">LA TUA BACHECA</p><h1>Storie da esplorare</h1>
  <p>Leggi i post della community o aggiungi una nuova idea.</p></section>
  <section class="panel"><h2>Esplora i post</h2>
    <label for="search">Cerca nel titolo o nel testo</label>
    <input id="search" type="search" placeholder="Scrivi una parola…" [ngModel]="query()" (ngModelChange)="query.set($event)">
    <p aria-live="polite">{{ filtered().length }} post visibili su {{ service.posts().length }}</p>
    @if (loading()) { <p role="status">Caricamento dei post…</p> }
    @if (error()) { <p class="error" role="alert">{{ error() }}</p><button (click)="load()">Riprova</button> }
  </section>
  <div class="cards">
    @for (post of filtered(); track post.id) {
      <article class="panel"><span class="badge">POST #{{ post.id }} · UTENTE {{ post.userId }}</span>
      <h2><a [routerLink]="['/posts', post.id]">{{ post.title }}</a></h2><p class="excerpt">{{ post.body }}</p>
      <a [routerLink]="['/posts', post.id]">Leggi il post →</a></article>
    } @empty { @if (!loading() && !error()) { <p>Nessun post corrisponde alla ricerca.</p> } }
  </div>
  <section class="panel compose"><h2>Pubblica un’idea</h2>
    <p>Invio POST simulato: il post apparirà nella bacheca fino al ricaricamento.</p>
    <form #form="ngForm" (ngSubmit)="create()">
      <label for="userId">ID utente</label><input id="userId" name="userId" type="number" min="1" step="1" required [(ngModel)]="userId">
      <label for="title">Titolo</label><input id="title" name="title" required maxlength="200" [(ngModel)]="title">
      <label for="body">Testo</label><textarea id="body" name="body" required rows="5" [(ngModel)]="body"></textarea>
      <button type="submit" [disabled]="form.invalid || saving() || !title.trim() || !body.trim()">{{ saving() ? 'Pubblicazione…' : 'Pubblica post' }}</button>
    </form>
    @if (saveError()) { <p role="alert" class="error">{{ saveError() }}</p> }
    @if (success()) { <p role="status" class="success">{{ success() }}</p> }
  </section>
`})
export class PostList {
  readonly service = inject(PostsService);
  private readonly destroyRef = inject(DestroyRef);
  readonly query = signal('');
  readonly filtered = computed(() => {
    const query = this.query().trim().toLocaleLowerCase();
    return this.service.posts().filter(post => `${post.title} ${post.body}`.toLocaleLowerCase().includes(query));
  });
  readonly loading = signal(false);
  readonly error = signal('');
  readonly saving = signal(false);
  readonly saveError = signal('');
  readonly success = signal('');
  userId = 1; title = ''; body = '';
  constructor() { this.load(); }
  load(): void {
    if (this.loading()) return;
    this.loading.set(true); this.error.set('');
    this.service.loadAll().pipe(takeUntilDestroyed(this.destroyRef), finalize(() => this.loading.set(false)))
      .subscribe({error: error => this.error.set(errorMessage(error))});
  }
  create(): void {
    if (this.saving() || !this.title.trim() || !this.body.trim() || !Number.isInteger(this.userId) || this.userId < 1) return;
    this.saving.set(true); this.saveError.set(''); this.success.set('');
    this.service.create({userId: this.userId, title: this.title.trim(), body: this.body.trim()})
      .pipe(takeUntilDestroyed(this.destroyRef), finalize(() => this.saving.set(false)))
      .subscribe({next: () => {
        this.title = ''; this.body = ''; this.query.set('');
        this.success.set('Post creato! Lo trovi nell’elenco e puoi aprirne il dettaglio.');
      }, error: error => this.saveError.set(errorMessage(error))});
  }
}
