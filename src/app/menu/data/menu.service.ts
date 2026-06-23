import { Injectable, inject, signal } from '@angular/core';
import { LanguageService } from '../../shared/api';
import { MenuClient } from './menu.client';
import { Dish, Section } from '../util/menu.model';

@Injectable({
  providedIn: 'root',
})
export class MenuService {
  private readonly menuClient = inject(MenuClient);
  private readonly languageService = inject(LanguageService);

  private readonly _dishes = signal<Dish[]>([]);
  readonly dishes = this._dishes.asReadonly();
  private readonly _sections = signal<Section[]>([]);
  readonly sections = this._sections.asReadonly();
  private readonly _status = signal<'idle' | 'loading' | 'ready' | 'error'>(
    'idle',
  );
  readonly status = this._status.asReadonly();
  private readonly _error = signal<string | null>(null);
  readonly error = this._error.asReadonly();

  async load() {
    if (this.status() === 'loading') return;

    this._status.set('loading');
    this._error.set(null);

    try {
      const [dishes, sections] = await Promise.all([
        this.menuClient.getDishes(),
        this.menuClient.getSections(),
      ]);
      this._dishes.set(dishes);
      this._sections.set(sections);
      this._status.set('ready');
    } catch (error) {
      this._error.set('No se pudo cargar la carta');
      this._status.set('error');
    }
  }
}
