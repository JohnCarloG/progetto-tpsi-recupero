# Todo — progetto TPSI

App Angular che usa la risorsa **todos** di [JSONPlaceholder](https://jsonplaceholder.typicode.com).

```sh
npm ci
npm start      # http://localhost:4200
npm run build
```

- `TodoService`: GET elenco, GET singolo, POST; dati in signal privati esposti con `asReadonly()`.
- `/todos`: elenco con ricerca e conteggio dei completati calcolati con `computed`.
- `/todos/:id`: dettaglio con «precedente» e «successivo».
- Messaggio di caricamento ed errori diversi per 404 e rete assente (stato 0).

I testi sono in latino perché JSONPlaceholder restituisce dati di esempio "lorem ipsum".
