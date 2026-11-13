import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient, HttpErrorResponse } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { RouterTestingHarness } from '@angular/router/testing';
import { routes } from './app.routes';
import { PostsService, errorMessage } from './posts/posts.service';
import { PostList } from './posts/post-list';
import { PostDetail } from './posts/post-detail';
const url = 'https://jsonplaceholder.typicode.com/posts';
const first = {id: 1, userId: 1, title: 'Primo titolo', body: 'Testo del primo post'};

describe('Bacheca post', () => {
  let http: HttpTestingController;
  beforeEach(() => {
    TestBed.configureTestingModule({providers: [provideRouter(routes), provideHttpClient(), provideHttpClientTesting()]});
    http = TestBed.inject(HttpTestingController);
  });
  afterEach(() => http.verify());

  it('legge GET elenco, filtra con computed e aggiorna il conteggio', async () => {
    const harness = await RouterTestingHarness.create();
    const list = await harness.navigateByUrl('/posts', PostList);
    expect(list.loading()).toBe(true);
    http.expectOne(url).flush([first, {...first, id: 2, title: 'Secondo', body: 'Altro'}]);
    expect(list.loading()).toBe(false);
    expect(list.filtered().length).toBe(2);
    list.query.set('PRIMO');
    expect(list.filtered().map(post => post.id)).toEqual([1]);
    harness.detectChanges();
    expect(harness.routeNativeElement?.textContent).toContain('1 post visibili su 2');
  });

  it('invia POST, assegna ID univoci e conserva i nuovi post dopo un GET', () => {
    const service = TestBed.inject(PostsService);
    const input = {userId: 2, title: 'Nuovo', body: 'Contenuto'};
    for (const id of [101, 102]) {
      service.create(input).subscribe(post => expect(post.id).toBe(id));
      const request = http.expectOne(url);
      expect(request.request.method).toBe('POST');
      expect(request.request.body).toEqual(input);
      request.flush({...input, id: 101});
    }
    service.loadAll().subscribe();
    http.expectOne(url).flush([first]);
    expect(service.posts().map(post => post.id)).toEqual([1, 101, 102]);
    service.getOne(102).subscribe(post => expect(post.title).toBe('Nuovo'));
    http.expectNone(`${url}/102`);
  });

  it('naviga tra dettagli e ricarica il singolo post al cambio parametro', async () => {
    const harness = await RouterTestingHarness.create();
    const detail = await harness.navigateByUrl('/posts/1', PostDetail);
    expect(detail.state().loading).toBe(true);
    http.expectOne(`${url}/1`).flush(first);
    harness.detectChanges();
    expect(harness.routeNativeElement?.textContent).toContain('Primo titolo');
    expect(harness.routeNativeElement?.querySelector('a[href="/posts/2"]')).toBeTruthy();
    await harness.navigateByUrl('/posts/2', PostDetail);
    expect(detail.state().post).toBeNull();
    http.expectOne(`${url}/2`).flush({...first, id: 2});
    expect(detail.state().post?.id).toBe(2);
  });

  it('mostra messaggi distinti per 404 e rete assente', async () => {
    const harness = await RouterTestingHarness.create();
    const detail = await harness.navigateByUrl('/posts/999', PostDetail);
    http.expectOne(`${url}/999`).flush({}, {status: 404, statusText: 'Not Found'});
    expect(detail.state().error).toContain('404');
    await harness.navigateByUrl('/posts/1', PostDetail);
    http.expectOne(`${url}/1`).error(new ProgressEvent('error'));
    expect(detail.state().error).toContain('stato 0');
    expect(detail.state().loading).toBe(false);
  });

  it('rifiuta ID non validi senza inviare richieste e gestisce altri errori', async () => {
    const harness = await RouterTestingHarness.create();
    const detail = await harness.navigateByUrl('/posts/abc', PostDetail);
    expect(detail.state().error).toContain('404');
    http.expectNone(request => request.url.startsWith(url));
    expect(errorMessage(new HttpErrorResponse({status: 500}))).toContain('Errore del servizio');
  });

  it('gestisce errore elenco e retry', async () => {
    const harness = await RouterTestingHarness.create();
    const list = await harness.navigateByUrl('/posts', PostList);
    http.expectOne(url).error(new ProgressEvent('error'));
    expect(list.error()).toContain('stato 0');
    list.load();
    http.expectOne(url).flush([first]);
    expect(list.error()).toBe('');
    expect(list.filtered()).toEqual([first]);
  });

  it('valida il form, gestisce POST fallito e permette un nuovo invio', async () => {
    const harness = await RouterTestingHarness.create();
    const list = await harness.navigateByUrl('/posts', PostList);
    http.expectOne(url).flush([]);
    list.create();
    http.expectNone(url);
    list.title = ' Nuova idea '; list.body = ' Contenuto ';
    list.create();
    expect(list.saving()).toBe(true);
    http.expectOne(url).error(new ProgressEvent('error'));
    expect(list.saveError()).toContain('stato 0');
    expect(list.saving()).toBe(false);
    list.create();
    http.expectOne(url).flush({id: 101, userId: 1, title: 'Nuova idea', body: 'Contenuto'});
    expect(list.success()).toContain('Post creato');
    expect(list.service.posts()[0].title).toBe('Nuova idea');
    expect(list.title).toBe('');
  });
});
