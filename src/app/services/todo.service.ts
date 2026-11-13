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
  private http = inject(HttpClient);
  private url = 'https://jsonplaceholder.typicode.com/todos';

  // Signal privati: solo il servizio li può modificare
  private _todos = signal<Todo[]>([]);
  private _todo = signal<Todo | null>(null);
  private _loading = signal(false);
  private _error = signal('');

  // Versioni in sola lettura per i componenti
  todos = this._todos.asReadonly();
  todo = this._todo.asReadonly();
  loading = this._loading.asReadonly();
  error = this._error.asReadonly();

  // GET /todos
  loadAll() {
    this._loading.set(true);
    this._error.set('');
    this.http.get<Todo[]>(this.url).subscribe({
      next: (todos) => {
        this._todos.set(todos);
        this._loading.set(false);
      },
      error: (err) => this.showError(err),
    });
  }

  // GET /todos/:id
  loadOne(id: number) {
    this._loading.set(true);
    this._error.set('');
    this._todo.set(null);
    this.http.get<Todo>(`${this.url}/${id}`).subscribe({
      next: (todo) => {
        this._todo.set(todo);
        this._loading.set(false);
      },
      error: (err) => this.showError(err),
    });
  }

  // POST /todos (JSONPlaceholder finge di salvare e risponde sempre con id 201)
  create(title: string) {
    const nuovo = { userId: 1, title: title, completed: false };
    this.http.post<Todo>(this.url, nuovo).subscribe({
      next: (todo) => this._todos.update((lista) => [todo, ...lista]),
      error: (err) => this.showError(err),
    });
  }

  private showError(err: HttpErrorResponse) {
    this._loading.set(false);
    if (err.status === 404) {
      this._error.set('Elemento inesistente (404)');
    } else if (err.status === 0) {
      this._error.set('Rete assente: controlla la connessione');
    } else {
      this._error.set('Errore del server (' + err.status + ')');
    }
  }
}
