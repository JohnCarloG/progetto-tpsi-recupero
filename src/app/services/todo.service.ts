import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';

export interface Todo {
  userId: number;
  id: number;
  title: string;
  completed: boolean;
}

@Injectable({ providedIn: 'root' })
export class TodoService {
  private readonly http = inject(HttpClient);
  private readonly url = 'https://jsonplaceholder.typicode.com/todos';

  // Stato privato: solo il servizio può modificarlo
  private readonly _todos = signal<Todo[]>([]);
  private readonly _selected = signal<Todo | null>(null);
  private readonly _loading = signal(false);
  private readonly _error = signal<string | null>(null);

  // Stato pubblico in sola lettura per i componenti
  readonly todos = this._todos.asReadonly();
  readonly selected = this._selected.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly error = this._error.asReadonly();

  /** GET /todos: legge l'elenco completo */
  loadAll(): void {
    this._loading.set(true);
    this._error.set(null);
    this.http.get<Todo[]>(this.url).subscribe({
      next: (todos) => {
        this._todos.set(todos);
        this._loading.set(false);
      },
      error: (err: HttpErrorResponse) => this.handleError(err),
    });
  }

  /** GET /todos/:id: legge un singolo elemento */
  loadOne(id: number): void {
    this._loading.set(true);
    this._error.set(null);
    this._selected.set(null);
    this.http.get<Todo>(`${this.url}/${id}`).subscribe({
      next: (todo) => {
        this._selected.set(todo);
        this._loading.set(false);
      },
      error: (err: HttpErrorResponse) => this.handleError(err),
    });
  }

  /** POST /todos: crea un nuovo elemento e lo aggiunge in cima all'elenco */
  create(title: string): void {
    const nuovo = { userId: 1, title, completed: false };
    this._loading.set(true);
    this._error.set(null);
    this.http.post<Todo>(this.url, nuovo).subscribe({
      next: (creato) => {
        // JSONPlaceholder non salva davvero: risponde sempre con id 201
        this._todos.update((lista) => [creato, ...lista]);
        this._loading.set(false);
      },
      error: (err: HttpErrorResponse) => this.handleError(err),
    });
  }

  private handleError(err: HttpErrorResponse): void {
    this._loading.set(false);
    if (err.status === 404) {
      this._error.set('Elemento inesistente (errore 404).');
    } else if (err.status === 0) {
      this._error.set('Rete assente: impossibile contattare il server.');
    } else {
      this._error.set(`Errore del server (${err.status}).`);
    }
  }
}
