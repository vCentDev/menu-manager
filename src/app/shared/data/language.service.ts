import { effect, inject, Injectable, signal } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import type { LanguageCode } from '@shared/util/language.model';

function readStoredLanguage(): LanguageCode {
  return localStorage.getItem('lang') === 'en' ? 'en' : 'es';
}

@Injectable({
  providedIn: 'root',
})
export class LanguageService {
  private readonly translate = inject(TranslateService);
  private readonly _lang = signal<LanguageCode>(readStoredLanguage());
  readonly lang = this._lang.asReadonly();

  constructor() {
    effect(() => {
      this.translate.use(this.lang());
    });
  }

  changeLanguage(newLanguage: LanguageCode): void {
    this._lang.set(newLanguage);
    localStorage.setItem('lang', newLanguage);
  }
}
