import { Component, effect, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TodoService } from '../../services/todo.service';

@Component({
  selector: 'app-todo-detail',
  imports: [RouterLink],
  templateUrl: './todo-detail.html',
})
export class TodoDetail {
  service = inject(TodoService);

  // Il parametro :id della rotta arriva qui (withComponentInputBinding)
  id = input.required<number, string>({ transform: Number });

  constructor() {
    // Ogni volta che cambia l'id carico il todo
    effect(() => this.service.loadOne(this.id()));
  }
}
