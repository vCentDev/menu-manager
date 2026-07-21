import { CurrencyPipe } from '@angular/common';
import { Component, input } from '@angular/core';

import { BadgeModule } from 'primeng/badge';

import { LocalizedDish } from '@menu/util/menu.model';
import { localizeAllergen } from '@menu/util/menu-localization';

@Component({
  selector: 'app-dish-card',
  imports: [CurrencyPipe, BadgeModule],
  templateUrl: './dish-card.component.html',
  styleUrl: './dish-card.component.css',
})
export class DishCardComponent {
  protected readonly localizeAllergen = localizeAllergen;

  readonly dish = input.required<LocalizedDish>();
  readonly lang = input<'es' | 'en'>('es');
}
