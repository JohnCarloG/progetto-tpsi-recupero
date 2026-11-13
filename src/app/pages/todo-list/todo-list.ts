import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TodoService } from '../../services/todo.service';

@Component({
  selector: 'app-todo-list',
  imports: [RouterLink],
  templateUrl: './todo-list.html',
})
export class TodoList implements OnInit {
  service = inject(TodoService);

  cerca = signal('');

  // Si ricalcola da solo quando cambiano i todo o il testo cercato
  filtrati = computed(() =>
    this.service.todos().filter((t) => t.title.includes(this.cerca())),
  );
  completati = computed(() => this.service.todos().filter((t) => t.completed).length);

  ngOnInit() {
    this.service.loadAll();
  }

  aggiungi(titolo: string) {
    if (titolo.trim() !== '') {
      this.service.create(titolo);
    }
  }
}
