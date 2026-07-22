import {
  Component,
  computed,
  inject,
  input,
  model,
  output,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';

import { IconFieldModule } from 'primeng/iconfield';
import { InputTextModule } from 'primeng/inputtext';
import { InputIconModule } from 'primeng/inputicon';
import { SelectButtonModule } from 'primeng/selectbutton';
import { ButtonModule } from 'primeng/button';
import { Times } from '@primeicons/angular/times';
import { Search } from '@primeicons/angular/search';

import type { OrderCriteria } from '../../util/menu.model';
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
  templateUrl: './menu-filters.component.html',
  styleUrl: './menu-filters.component.css',
})
export class MenuFiltersComponent {
  private readonly translate = inject(TranslateService);
  protected readonly localizeAllergen = localizeAllergen;

  private readonly sortOptionDefs = [
    { value: 'default' as const, labelKey: 'filters.sort.default' },
    { value: 'price-asc' as const, labelKey: 'filters.sort.priceAsc' },
    { value: 'price-desc' as const, labelKey: 'filters.sort.priceDesc' },
  ];

  protected readonly sortOptions = computed(() => {
    this.lang();
    return this.sortOptionDefs.map((def) => ({
      value: def.value,
      label: this.translate.instant(def.labelKey),
    }));
  });

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
