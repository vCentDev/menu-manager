import { Component, computed, input, model, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslatePipe } from '@ngx-translate/core';

import { IconFieldModule } from 'primeng/iconfield';
import { InputTextModule } from 'primeng/inputtext';
import { InputIconModule } from 'primeng/inputicon';
import { SelectButtonModule } from 'primeng/selectbutton';
import { ButtonModule } from 'primeng/button';
import { PopoverModule } from 'primeng/popover';
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
    PopoverModule,
    Search,
    Times,
    FormsModule,
    TranslatePipe,
  ],
  templateUrl: './menu-filters.html',
  styleUrl: './menu-filters.css',
})
export class MenuFilters {
  protected readonly localizeAllergen = localizeAllergen;

  protected readonly langOptions = [
    { value: 'es', label: 'ES' },
    { value: 'en', label: 'EN' },
  ];

  readonly allergens = input.required<Allergen[]>();
  readonly excludedAllergens = input<Set<string>>(new Set());
  protected readonly excludedBadge = computed(() =>
    this.excludedAllergens().size > 0
      ? this.excludedAllergens().size.toString()
      : '',
  );

  readonly search = model('');
  readonly lang = model<'es' | 'en'>('es');

  readonly allergenToggle = output<string>();
  readonly clearAllergens = output();
}
