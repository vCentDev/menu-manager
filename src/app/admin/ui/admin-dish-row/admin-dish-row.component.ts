import { CurrencyPipe } from '@angular/common';
import { Component, input } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';

import { TagModule } from 'primeng/tag';

import type { AdminDishRow } from '../../util/admin.model';
import { centsToEuros } from '../../util/price';

@Component({
  selector: 'app-admin-dish-row',
  imports: [CurrencyPipe, TagModule, TranslatePipe],
  templateUrl: './admin-dish-row.component.html',
  styleUrl: './admin-dish-row.component.css',
})
export class AdminDishRowComponent {
  readonly row = input.required<AdminDishRow>();
  protected readonly centsToEuros = centsToEuros;
}
