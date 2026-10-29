import '@angular/compiler';
import { describe, it, expect } from 'vitest';
import { App } from './app';

describe('App Component', () => {
  it('should instantiate successfully', () => {
    const app = new App();
    expect(app).toBeTruthy();
  });

  it('should toggle handset view signal', () => {
    const app = new App();
    expect(app.isHandsetView()).toBe(false);
    app.toggleHandsetView();
    expect(app.isHandsetView()).toBe(true);
    app.toggleHandsetView();
    expect(app.isHandsetView()).toBe(false);
  });
});
