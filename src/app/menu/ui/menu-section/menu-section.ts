import { Component, input } from '@angular/core';

import { SectionNode } from '@menu/util/menu.model';
import { DishCard } from '../dish-card/dish-card';

@Component({
  selector: 'app-menu-section',
  imports: [DishCard],
  templateUrl: './menu-section.html',
  styleUrl: './menu-section.css',
})
export class MenuSection {
  readonly node = input.required<SectionNode>();
  readonly level = input(0);
  readonly lang = input<'en' | 'es'>('es');
}
