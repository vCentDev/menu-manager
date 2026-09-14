import { Component, input, linkedSignal, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslatePipe } from '@ngx-translate/core';

import { TagModule } from 'primeng/tag';
import { InputNumberModule } from 'primeng/inputnumber';
import { ToggleSwitchModule } from 'primeng/toggleswitch';

import type { AdminDishRow } from '../../util/admin.model';
import { centsToEuros } from '../../util/price';

@Component({
  selector: 'app-admin-dish-row',
  imports: [
    FormsModule,
    TagModule,
    TranslatePipe,
    InputNumberModule,
    ToggleSwitchModule,
  ],
  templateUrl: './admin-dish-row.component.html',
  styleUrl: './admin-dish-row.component.css',
})
export class AdminDishRowComponent {
  readonly row = input.required<AdminDishRow>();
  readonly availabilityChange = output<boolean>();
  readonly priceChange = output<number>();
  readonly priceDraft = linkedSignal(() => centsToEuros(this.row().priceCents));

  private cancelPrice(): void {
    this.priceDraft.set(centsToEuros(this.row().priceCents));
  }

  protected updatePrice(newPrice: number) {
    if (newPrice === null || Number.isNaN(newPrice) || newPrice < 0) {
      this.cancelPrice();
      return;
    }

    if (newPrice === centsToEuros(this.row().priceCents)) return;

    this.priceChange.emit(newPrice);
  }

  protected handlePriceChange(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      this.updatePrice(this.priceDraft());
    }

    if (event.key === 'Escape') {
      this.cancelPrice();
    }
  }

  protected selectPriceText(event: Event): void {
    const input = event.target as HTMLInputElement;
    queueMicrotask(() => input.select());
  }
}
