import { Component, inject, input, model, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';

import { IconFieldModule } from 'primeng/iconfield';
import { InputTextModule } from 'primeng/inputtext';
import { InputIconModule } from 'primeng/inputicon';
import { SelectButtonModule } from 'primeng/selectbutton';
import { ButtonModule } from 'primeng/button';
import { Times } from '@primeicons/angular/times';
import { Search } from '@primeicons/angular/search';

import type { Allergen } from '../../util/menu.model';
import { localizeAllergen } from '../../util/menu-localization';

@Component({
  selector: 'app-menu-filters',
  imports: [
    IconFieldModule,
    InputIconModule,
    InputTextModule,
    SelectButtonModule,
    ButtonModule,
    Search,
    Times,
    FormsModule,
    TranslatePipe,
  ],
  templateUrl: './menu-filters.html',
  styleUrl: './menu-filters.css',
})
export class MenuFilters {
  private readonly translate = inject(TranslateService);
  protected readonly localizeAllergen = localizeAllergen;

  protected readonly langOptions = [
    { value: 'es', label: 'ES' },
    { value: 'en', label: 'EN' },
  ];

  readonly allergens = input.required<Allergen[]>();
  readonly excludedAllergens = input<Set<string>>(new Set());

  readonly search = model('');
  readonly lang = model<'es' | 'en'>('es');

  readonly allergenToggle = output<string>();
  readonly clearAllergens = output();
}
