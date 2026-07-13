import { Component, input } from '@angular/core';

import { SectionNode } from '@menu/util/menu.model';
import { DishCardComponent } from '../dish-card/dish-card.component';

@Component({
  selector: 'app-menu-section',
  imports: [DishCardComponent],
  templateUrl: './menu-section.component.html',
  styleUrl: './menu-section.component.css',
})
export class MenuSectionComponent {
  readonly node = input.required<SectionNode>();
  readonly level = input(0);
  readonly lang = input<'en' | 'es'>('es');
}
