import { Injectable } from 'angular2/core';
import { TodoBackendService } from '../TodoBackendService';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import { Todo } from '../Todo';
import { List } from 'immutable';
import { asObservable } from './asObservable';
import { BehaviorSubject } from 'rxjs/Rx';

@Injectable()
export class TodoStore {
  private _todos: BehaviorSubject<List<Todo>> = new BehaviorSubject(List([]));
  public readonly todos: Observable<List<Todo>> = this._todos.asObservable();

  constructor(private todoBackendService: TodoBackendService) {
    this.loadInitialData();
  }

  loadInitialData() {
    this.todoBackendService.getAllTodos().subscribe(
      res => {
        const todos = (<Object[]>res.json()).map(
          (todo: any) =>
            new Todo({
              id: todo.id,
              description: todo.description,
              completed: todo.completed
            })
        );

        this._todos.next(List(todos));
      },
      err => console.log('Error retrieving Todos')
    );
  }

  addTodo(newTodo: Todo): Observable {
    const obs = this.todoBackendService.saveTodo(newTodo);

    obs.subscribe(res => {
      this._todos.next(this._todos.getValue().push(newTodo));
    });

    return obs;
  }

  toggleTodo(toggled: Todo): Observable {
    const obs: Observable = this.todoBackendService.toggleTodo(toggled);

    obs.subscribe(res => {
      const todos = this._todos.getValue();
      const index = todos.findIndex((todo: Todo) => todo.id === toggled.id);
      const todo: Todo = todos.get(index);
      this._todos.next(
        todos.set(
          index,
          new Todo({
            id: toggled.id,
            description: toggled.description,
            completed: !toggled.completed
          })
        )
      );
    });

    return obs;
  }

  deleteTodo(deleted: Todo): Observable {
    const obs: Observable = this.todoBackendService.deleteTodo(deleted);

    obs.subscribe(res => {
      const todos: List<Todo> = this._todos.getValue();
      const index = todos.findIndex(todo => todo.id === deleted.id);
      this._todos.next(todos.delete(index));
    });

    return obs;
  }
}
