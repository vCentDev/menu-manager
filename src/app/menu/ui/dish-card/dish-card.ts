import { CurrencyPipe } from '@angular/common';
import { Component, input } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';

import { BadgeModule } from 'primeng/badge';

import { LocalizedDish } from '@menu/util/menu.model';
import { localizeAllergen } from '@menu/util/menu-localization';

@Component({
  selector: 'app-dish-card',
  imports: [CurrencyPipe, BadgeModule, TranslatePipe],
  templateUrl: './dish-card.html',
  styleUrl: './dish-card.css',
})
export class DishCard {
  protected readonly localizeAllergen = localizeAllergen;

  readonly dish = input.required<LocalizedDish>();
  readonly lang = input<'es' | 'en'>('es');
}
