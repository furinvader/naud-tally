import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  effect,
  inject,
} from '@angular/core';

import { DrinkTally } from '../drink-tally';
import { OrderEntryStore } from './order-entry.store';

export const GUEST_TAB_INACTIVITY_TIMEOUT_MS = 90_000;

@Component({
  selector: 'nt-order-entry',
  imports: [DrinkTally],
  providers: [OrderEntryStore],
  templateUrl: './order-entry.html',
  styleUrl: './order-entry.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrderEntry {
  protected readonly orderEntryStore = inject(OrderEntryStore);

  private readonly destroyRef = inject(DestroyRef);
  private inactivityTimerId: ReturnType<typeof setTimeout> | null = null;

  constructor() {
    effect(() => {
      const selectedGuest = this.orderEntryStore.selectedGuest();
      const addGuestFlow = this.orderEntryStore.addGuestFlow();
      this.orderEntryStore.interactionVersion();

      if (!selectedGuest && addGuestFlow.step === 'closed') {
        this.clearInactivityTimer();
        return;
      }

      this.scheduleInactivityTimer();
    });

    this.destroyRef.onDestroy(() => {
      this.clearInactivityTimer();
    });
  }

  private scheduleInactivityTimer(): void {
    this.clearInactivityTimer();
    this.inactivityTimerId = setTimeout(() => {
      this.orderEntryStore.clearTransientState();
    }, GUEST_TAB_INACTIVITY_TIMEOUT_MS);
  }

  private clearInactivityTimer(): void {
    if (this.inactivityTimerId === null) {
      return;
    }

    clearTimeout(this.inactivityTimerId);
    this.inactivityTimerId = null;
  }
}
