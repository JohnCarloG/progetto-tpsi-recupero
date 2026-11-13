import { TestBed } from '@angular/core/testing';
import { App } from './app';

describe('App', () => {
  it('crea l’app', () => {
    const fixture = TestBed.createComponent(App);
    expect(fixture.componentInstance).toBeTruthy();
  });
});
