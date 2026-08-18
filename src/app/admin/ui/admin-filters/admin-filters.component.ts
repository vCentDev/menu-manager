import { Component, computed, inject, input, model } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';

import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { SelectButtonModule } from 'primeng/selectbutton';
import { Search } from '@primeicons/angular/search';

import type {
  AdminAvailabilityFilter,
  AdminSortCriteria,
} from '../../util/admin.model';
import { LanguageService } from '@shared/api';

@Component({
  selector: 'app-admin-filters',
  imports: [
    IconFieldModule,
    InputIconModule,
    InputTextModule,
    Search,
    SelectButtonModule,
    TranslatePipe,
    FormsModule,
  ],
  templateUrl: './admin-filters.component.html',
  styleUrl: './admin-filters.component.css',
})
export class AdminFiltersComponent {
  private readonly translate = inject(TranslateService);

  readonly search = model('');
  readonly sort = model<AdminSortCriteria>('default');
  readonly availability = model<AdminAvailabilityFilter>('all');
  readonly lang = input<'es' | 'en'>('es');

  private readonly sortOptionsDef = [
    { value: 'default' as const, labelKey: 'admin.filters.sort.default' },
    { value: 'price-asc' as const, labelKey: 'admin.filters.sort.priceAsc' },
    { value: 'price-desc' as const, labelKey: 'admin.filters.sort.priceDesc' },
    { value: 'name-asc' as const, labelKey: 'admin.filters.sort.nameAsc' },
    { value: 'name-desc' as const, labelKey: 'admin.filters.sort.nameDesc' },
  ];

  protected readonly sortOptions = computed(() => {
    this.lang();
    return this.sortOptionsDef.map((def) => ({
      value: def.value,
      label: this.translate.instant(def.labelKey),
    }));
  });

  private readonly avalabilityOptionsDef = [
    { value: 'all' as const, labelKey: 'admin.filters.availability.all' },
    {
      value: 'available' as const,
      labelKey: 'admin.filters.availability.available',
    },
    {
      value: 'unavailable' as const,
      labelKey: 'admin.filters.availability.unavailable',
    },
  ];

  protected readonly availabilityOptions = computed(() => {
    this.lang();
    return this.avalabilityOptionsDef.map((def) => ({
      value: def.value,
      label: this.translate.instant(def.labelKey),
    }));
  });
}
