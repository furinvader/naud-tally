import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  signal,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { RouterLink } from '@angular/router';

import { AppBar } from '../../ui/app-bar/app-bar';
import { PageShell } from '../../ui/page-shell/page-shell';
import { ScrollRegion } from '../../ui/scroll-region/scroll-region';
import { OrderEntryAddDrinkPicker } from './order-entry-add-drink-picker/order-entry-add-drink-picker';
import { OrderEntryBillGuestDialog } from './order-entry-bill-guest-dialog/order-entry-bill-guest-dialog';
import { ORDER_ENTRY_COPY } from './order-entry.copy';
import { OrderEntryStep, OrderEntryStore } from './order-entry.store';

@Component({
  selector: 'nt-order-entry',
  imports: [
    AppBar,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    OrderEntryAddDrinkPicker,
    OrderEntryBillGuestDialog,
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
  protected readonly addDrinkPickerOpen = signal(false);
  protected readonly billGuestDialogOpen = signal(false);
  protected readonly steps = computed(() => {
    const activeStep = this.orderEntryStore.activeStep();
    const selectedRoom = this.orderEntryStore.selectedRoom();
    const selectedGuest = this.orderEntryStore.selectedGuest();

    return [
      {
        id: 'room' as const,
        label: this.copy.roomStepLabel,
        detail: selectedRoom
          ? `${this.copy.roomLabel} ${selectedRoom.roomNumber}`
          : this.copy.roomStepPlaceholder,
        isEnabled: true,
        isCurrent: activeStep === 'room',
        isComplete: !!selectedRoom && activeStep !== 'room',
        testId: 'step-nav-room',
      },
      {
        id: 'guest' as const,
        label: this.copy.guestStepLabel,
        detail: selectedGuest ? selectedGuest.fullName : this.copy.guestStepPlaceholder,
        isEnabled: !!selectedRoom,
        isCurrent: activeStep === 'guest',
        isComplete: !!selectedGuest && activeStep !== 'guest',
        testId: 'step-nav-guest',
      },
      {
        id: 'drinks' as const,
        label: this.copy.drinksStepLabel,
        detail: selectedGuest
          ? `${this.copy.orderPanelTotalLabel}: ${selectedGuest.displayTotalPrice}`
          : this.copy.drinksStepPlaceholder,
        isEnabled: !!selectedGuest,
        isCurrent: activeStep === 'drinks',
        isComplete: false,
        testId: 'step-nav-drinks',
      },
    ];
  });
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

  constructor() {
    effect(() => {
      const selectedGuest = this.orderEntryStore.selectedGuest();
      const activeStep = this.orderEntryStore.activeStep();

      if (activeStep !== 'drinks' || !selectedGuest) {
        this.billGuestDialogOpen.set(false);
        this.addDrinkPickerOpen.set(false);
        return;
      }

      if (selectedGuest.availableDrinks.length === 0) {
        this.addDrinkPickerOpen.set(false);
      }
    });
  }

  protected activateStep(step: OrderEntryStep): void {
    this.orderEntryStore.activateStep(step);
  }

  protected openAddDrinkPicker(): void {
    if (!this.orderEntryStore.selectedGuest()?.availableDrinks.length) {
      return;
    }

    this.billGuestDialogOpen.set(false);
    this.addDrinkPickerOpen.set(true);
  }

  protected closeAddDrinkPicker(): void {
    this.addDrinkPickerOpen.set(false);
  }

  protected openBillGuestDialog(): void {
    if (!this.orderEntryStore.selectedGuest()) {
      return;
    }

    this.addDrinkPickerOpen.set(false);
    this.billGuestDialogOpen.set(true);
  }

  protected closeBillGuestDialog(): void {
    this.billGuestDialogOpen.set(false);
  }

  protected confirmBilling(): void {
    this.orderEntryStore.billSelectedGuest();
    this.closeBillGuestDialog();
  }

  protected addDrink(drinkId: string): void {
    this.orderEntryStore.incrementDrink(drinkId);
    this.closeAddDrinkPicker();
  }

  protected selectDrinkCount(event: FocusEvent): void {
    const target = event.target;

    if (!(target instanceof HTMLInputElement)) {
      return;
    }

    target.select();
  }
}
