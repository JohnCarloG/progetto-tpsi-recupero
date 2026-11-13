import { Component, computed, effect, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TodoService } from '../../services/todo.service';

const ULTIMO_ID = 200; // JSONPlaceholder ha 200 todo

@Component({
  selector: 'app-todo-detail',
  imports: [RouterLink],
  templateUrl: './todo-detail.html',
})
export class TodoDetail {
  protected readonly service = inject(TodoService);

  // Parametro :id della rotta (grazie a withComponentInputBinding)
  readonly id = input.required<string>();

  protected readonly numero = computed(() => Number(this.id()));
  protected readonly haPrecedente = computed(() => this.numero() > 1);
  protected readonly haSuccessivo = computed(() => this.numero() < ULTIMO_ID);

  constructor() {
    // Ogni volta che cambia l'id nella URL ricarico l'elemento
    effect(() => this.service.loadOne(this.numero()));
  }
}
