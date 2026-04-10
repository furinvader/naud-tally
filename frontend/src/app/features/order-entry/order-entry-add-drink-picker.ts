import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';

import { DrinkId } from '../catalog';
import { ORDER_ENTRY_COPY } from './order-entry.copy';
import { AvailableDrinkViewModel } from './order-entry.models';

@Component({
  selector: 'nt-order-entry-add-drink-picker',
  imports: [MatButtonModule],
  templateUrl: './order-entry-add-drink-picker.html',
  styleUrl: './order-entry-add-drink-picker.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrderEntryAddDrinkPicker {
  readonly drinks = input.required<ReadonlyArray<AvailableDrinkViewModel>>();
  readonly closeRequested = output<void>();
  readonly drinkSelected = output<DrinkId>();
  protected readonly copy = ORDER_ENTRY_COPY;
}
