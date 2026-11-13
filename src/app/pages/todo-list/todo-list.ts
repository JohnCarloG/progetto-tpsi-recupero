import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TodoService } from '../../services/todo.service';

type Stato = 'tutti' | 'completati' | 'da-fare';

@Component({
  selector: 'app-todo-list',
  imports: [RouterLink],
  templateUrl: './todo-list.html',
})
export class TodoList implements OnInit {
  protected readonly service = inject(TodoService);

  protected readonly testo = signal('');
  protected readonly stato = signal<Stato>('tutti');
  protected readonly nuovoTitolo = signal('');

  // Elenco filtrato: si ricalcola da solo quando cambiano todos, testo o stato
  protected readonly filtrati = computed(() => {
    const cerca = this.testo().toLowerCase();
    return this.service.todos().filter((t) => {
      const okTesto = t.title.toLowerCase().includes(cerca);
      const okStato =
        this.stato() === 'tutti' ||
        (this.stato() === 'completati' && t.completed) ||
        (this.stato() === 'da-fare' && !t.completed);
      return okTesto && okStato;
    });
  });

  protected readonly completati = computed(
    () => this.service.todos().filter((t) => t.completed).length,
  );

  ngOnInit(): void {
    if (this.service.todos().length === 0) {
      this.service.loadAll();
    }
  }

  protected aggiungi(): void {
    const titolo = this.nuovoTitolo().trim();
    if (titolo) {
      this.service.create(titolo);
      this.nuovoTitolo.set('');
    }
  }

  protected leggi(event: Event): string {
    return (event.target as HTMLInputElement).value;
  }
}
