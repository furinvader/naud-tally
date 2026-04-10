import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';

import { ORDER_ENTRY_COPY } from './order-entry.copy';
import { SelectedGuestOrderViewModel } from './order-entry.models';

@Component({
  selector: 'nt-order-entry-bill-guest-dialog',
  imports: [MatButtonModule],
  templateUrl: './order-entry-bill-guest-dialog.html',
  styleUrl: './order-entry-bill-guest-dialog.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrderEntryBillGuestDialog {
  readonly guest = input.required<SelectedGuestOrderViewModel>();
  readonly closeRequested = output<void>();
  readonly confirmRequested = output<void>();
  protected readonly copy = ORDER_ENTRY_COPY;
}
