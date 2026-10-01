import { Component, input, output } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';

import type { AdminSectionNode } from '../../util/admin.model';
import { AdminDishRow } from '../admin-dish-row/admin-dish-row';

@Component({
  selector: 'app-admin-section-group',
  imports: [AdminDishRow, AdminSectionGroup, TranslatePipe],
  templateUrl: './admin-section-group.html',
  styleUrl: './admin-section-group.css',
})
export class AdminSectionGroup {
  readonly node = input.required<AdminSectionNode>();
  readonly level = input(0);
  readonly updateAvailability = output<{
    id: string;
    available: boolean;
  }>();
  readonly updatePrice = output<{ id: string; price: number }>();
}
