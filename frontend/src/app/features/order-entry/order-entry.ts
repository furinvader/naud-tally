import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  effect,
  inject,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { RouterLink } from '@angular/router';

import { AppBar } from '../../ui/app-bar/app-bar';
import { PageShell } from '../../ui/page-shell/page-shell';
import { ScrollRegion } from '../../ui/scroll-region/scroll-region';
import { ORDER_ENTRY_COPY } from './order-entry.copy';
import { OrderEntryStore } from './order-entry.store';

export const GUEST_TAB_INACTIVITY_TIMEOUT_MS = 90_000;

@Component({
  selector: 'nt-order-entry',
  imports: [
    AppBar,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    PageShell,
    RouterLink,
    ScrollRegion,
  ],
  providers: [OrderEntryStore],
  templateUrl: './order-entry.html',
  styleUrl: './order-entry.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrderEntry {
  protected readonly orderEntryStore = inject(OrderEntryStore);
  protected readonly copy = ORDER_ENTRY_COPY;
  protected readonly hostRoute = '/host';
  protected readonly shellBackground = `
    radial-gradient(
      circle at top right,
      color-mix(in srgb, var(--nt-color-action) 12%, transparent),
      transparent 34%
    ),
    radial-gradient(
      circle at top left,
      color-mix(in srgb, var(--nt-color-accent) 13%, transparent),
      transparent 38%
    ),
    linear-gradient(
      180deg,
      var(--nt-color-canvas),
      color-mix(in srgb, var(--nt-color-canvas) 88%, var(--nt-color-surface))
    )
  `;

  private readonly destroyRef = inject(DestroyRef);
  private inactivityTimerId: ReturnType<typeof setTimeout> | null = null;

  constructor() {
    effect(() => {
      const selectedRoomId = this.orderEntryStore.selectedRoomId();
      const selectedGuest = this.orderEntryStore.selectedGuest();
      const guestDraft = this.orderEntryStore.guestDraft();
      this.orderEntryStore.interactionVersion();

      if (!selectedRoomId && !selectedGuest && !guestDraft.isOpen) {
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
