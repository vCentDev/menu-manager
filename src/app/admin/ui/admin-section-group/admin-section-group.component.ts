import { Component, input, output } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';

import type { AdminSectionNode } from '../../util/admin.model';
import { AdminDishRowComponent } from '../admin-dish-row/admin-dish-row.component';

@Component({
  selector: 'app-admin-section-group',
  imports: [AdminDishRowComponent, AdminSectionGroupComponent, TranslatePipe],
  templateUrl: './admin-section-group.component.html',
  styleUrl: './admin-section-group.component.css',
})
export class AdminSectionGroupComponent {
  readonly node = input.required<AdminSectionNode>();
  readonly level = input(0);
  readonly updateAvailability = output<{
    id: string;
    available: boolean;
  }>();
  readonly updatePrice = output<{ id: string; price: number }>();
}
