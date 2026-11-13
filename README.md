# Bacheca Post — progetto TPSI

App Angular 21 standalone che usa la risorsa **posts** di JSONPlaceholder.

Repository pubblico: https://github.com/JohnCarloG/progetto-tpsi-recupero  
Username del proprietario: **JohnCarloG**

## Avvio e verifica

Prerequisiti: Node.js 24 LTS e npm 11 (versione dichiarata in `package.json`).

```sh
npm ci
npm start
npm run build
npm test -- --watch=false
```

Il server di sviluppo usa la porta 4200. La build di produzione si trova in
`dist/bacheca-post/browser`. Per distribuire l'app, configurare il server statico
con fallback a `index.html` per consentire l'apertura diretta di `/posts/:id`.
È necessaria una connessione HTTPS a `jsonplaceholder.typicode.com`.

## Requisiti realizzati

- `PostsService`: `HttpClient`, GET `/posts`, GET `/posts/:id`, POST `/posts`.
  Lo stato è un `signal` privato, esposto attraverso `asReadonly()`.
- `/posts`: elenco, ricerca per titolo/testo e conteggio reattivo con `computed`.
- `/posts/:id`: dettaglio, precedente/successivo e gestione degli estremi.
  Il cambio parametro usa `switchMap` per annullare richieste obsolete.
- Indicatori di caricamento, messaggi distinti per 404, stato 0 e altri errori;
  retry dell'elenco, validazione del form e feedback di pubblicazione.
- Stili responsive, etichette dei form, focus visibile e annunci di stato.

JSONPlaceholder **simula** i POST senza salvarli sul server e restituisce sempre
l'ID 101. L'app assegna ID locali univoci e conserva i nuovi post in memoria:
sono consultabili nel dettaglio, ma scompaiono ricaricando la pagina.
Gli ID remoti validi vanno da 1 a 100; `/posts/999` permette di provare il 404.
Per provare lo stato 0, attivare Offline nei DevTools e aprire un altro dettaglio.

## Test

La suite usa `HttpTestingController` e il router reale con `RouterTestingHarness`:
verifica elenco e filtro, POST e ID univoci, dettaglio e cambio parametro,
404, rete assente, ID non validi, retry e gestione del form.
Le risposte HTTP nei test sono simulate: i test non dipendono dalla rete esterna.

## Lavoro di gruppo e consegna

Ogni componente del gruppo deve usare il proprio account e fare commit del
proprio lavoro. I commit non vanno attribuiti artificialmente ad altri membri.
Ognuno consegna l'URL del repository e il proprio username GitHub.

Per preparare la spiegazione individuale, studiare il servizio e i signal,
il filtro `computed`, il routing e `switchMap`, la gestione degli errori e i test.
Concordare nel gruppo le modifiche da realizzare personalmente e committarle
con messaggi che descrivano il contributo effettivo.
