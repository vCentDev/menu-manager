import { Component, input, model, output } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { IconFieldModule } from 'primeng/iconfield';
import { InputTextModule } from 'primeng/inputtext';
import { InputIconModule } from 'primeng/inputicon';
import { SelectButtonModule } from 'primeng/selectbutton';
import { ButtonModule } from 'primeng/button';
import { Times } from '@primeicons/angular/times';

import type { OrderCriteria } from '../../util/menu.model';
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
  ],
  templateUrl: './menu-filters.component.html',
  styleUrl: './menu-filters.component.css',
})
export class MenuFiltersComponent {
  protected readonly localizeAllergen = localizeAllergen;

  protected readonly sortOptions: { label: string; value: OrderCriteria }[] = [
    { value: 'default', label: 'Por defecto' },
    { value: 'price-asc', label: 'Precio ↑' },
    { value: 'price-desc', label: 'Precio ↓' },
  ];
  protected readonly langOptions = [
    { value: 'es', label: 'ES' },
    { value: 'en', label: 'EN' },
  ];

  readonly allergens = input.required<Allergen[]>();
  readonly excludedAllergens = input<Set<string>>(new Set());

  readonly search = model('');
  readonly sort = model<OrderCriteria>('default');
  readonly lang = model<'es' | 'en'>('es');

  readonly allergenToggle = output<string>();
  readonly clearAllergens = output();
}
