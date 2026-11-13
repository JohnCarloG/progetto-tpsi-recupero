import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { Observable, of, map, tap } from 'rxjs';
export interface Post { id: number; userId: number; title: string; body: string; }
export type NewPost = Omit<Post, 'id'>;
export function errorMessage(error: unknown): string {
  if (error instanceof HttpErrorResponse) {
    if (error.status === 404) return 'Post inesistente (404). Torna all’elenco o scegli un altro post.';
    if (error.status === 0) return 'Rete assente o servizio non raggiungibile (stato 0). Controlla la connessione e riprova.';
  }
  return 'Errore del servizio. Riprova più tardi.';
}
@Injectable({ providedIn: 'root' })
export class PostsService {
  private readonly http = inject(HttpClient);
  private readonly url = 'https://jsonplaceholder.typicode.com/posts';
  private readonly data = signal<Post[]>([]);
  readonly posts = this.data.asReadonly();
  // L'API non persiste le creazioni: i nuovi post restano in memoria.
  private readonly local = new Map<number, Post>();
  loadAll(): Observable<Post[]> {
    return this.http.get<Post[]>(this.url).pipe(tap(posts => this.data.set([...posts, ...this.local.values()])));
  }
  getOne(id: number): Observable<Post> {
    const local = this.local.get(id);
    return local ? of(local) : this.http.get<Post>(`${this.url}/${id}`);
  }
  create(input: NewPost): Observable<Post> {
    return this.http.post<Post>(this.url, input).pipe(map(response => {
      // JSONPlaceholder restituisce sempre 101: evitiamo collisioni locali.
      const id = Math.max(100, ...this.data().map(post => post.id), ...this.local.keys()) + 1;
      const post = { ...response, ...input, id };
      this.local.set(id, post);
      this.data.update(posts => [...posts, post]);
      return post;
    }));
  }
}
