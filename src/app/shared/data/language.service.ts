import { Injectable, signal } from '@angular/core';
import type { LanguageCode } from '../util/language.model';

function readStoredLanguage(): LanguageCode {
  return localStorage.getItem('lang') === 'en' ? 'en' : 'es';
}

@Injectable({
  providedIn: 'root',
})
export class LanguageService {
  private readonly _lang = signal<LanguageCode>(readStoredLanguage());
  readonly lang = this._lang.asReadonly();

  changeLanguage(newLanguage: LanguageCode): void {
    this._lang.set(newLanguage);
    localStorage.setItem('lang', newLanguage);
  }
}
