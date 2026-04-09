import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { RouterLink } from '@angular/router';

import { AppBar } from '../../ui/app-bar/app-bar';
import { PageShell } from '../../ui/page-shell/page-shell';
import { BillingHistoryStore } from '../billing-history';
import { CatalogStore } from '../catalog';
import { GuestTabsStore } from '../guest-tabs';
import { RoomsStore } from '../rooms';
import { HOST_ADMIN_COPY } from './host-admin.copy';
import {
  HostRoomItem,
  HostDrinkCatalogItem,
  OpenGuestBillViewModel,
  createBilledGuestBillViewModel,
  createHostDrinkCatalogItems,
  createHostRoomItems,
  createHostSummaryViewModel,
  createOpenGuestBillViewModel,
} from './host-admin.models';

type FlashMessage = {
  text: string;
  tone: 'success' | 'error';
};

@Component({
  selector: 'nt-host-admin',
  imports: [
    AppBar,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    PageShell,
    RouterLink,
  ],
  templateUrl: './host-admin.html',
  styleUrl: './host-admin.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HostAdmin {
  protected readonly copy = HOST_ADMIN_COPY;
  protected readonly shellBackground = `
    radial-gradient(
      circle at top right,
      color-mix(in srgb, var(--nt-color-action) 14%, transparent),
      transparent 34%
    ),
    radial-gradient(
      circle at bottom left,
      color-mix(in srgb, var(--nt-color-accent) 16%, transparent),
      transparent 42%
    ),
    linear-gradient(
      180deg,
      color-mix(in srgb, var(--nt-color-canvas) 92%, white),
      var(--nt-color-canvas)
    )
  `;
  protected readonly roomsStore = inject(RoomsStore);
  protected readonly guestTabsStore = inject(GuestTabsStore);
  protected readonly catalogStore = inject(CatalogStore);
  protected readonly billingHistoryStore = inject(BillingHistoryStore);
  protected readonly draftRoomNumber = signal('');
  protected readonly draftDrinkName = signal('');
  protected readonly draftDrinkPrice = signal('');
  protected readonly flashMessage = signal<FlashMessage | null>(null);
  protected readonly hostSummary = computed(() =>
    createHostSummaryViewModel(
      this.roomsStore.rooms(),
      this.catalogStore.drinkCatalog(),
      this.guestTabsStore.guestTabs(),
      this.billingHistoryStore.billedGuestTabs(),
    ),
  );
  protected readonly activeRooms = computed(() =>
    createHostRoomItems(this.roomsStore.rooms(), this.guestTabsStore.guestTabs()),
  );
  protected readonly hostDrinkCatalog = computed(() =>
    createHostDrinkCatalogItems(this.catalogStore.drinkCatalog(), this.guestTabsStore.guestTabs()),
  );
  protected readonly activeDrinks = computed(() =>
    this.hostDrinkCatalog().filter((drink) => drink.isActive),
  );
  protected readonly removedDrinks = computed(() =>
    this.hostDrinkCatalog().filter((drink) => !drink.isActive),
  );
  protected readonly openGuestBills = computed(() =>
    this.guestTabsStore
      .guestTabs()
      .map((guest) => createOpenGuestBillViewModel(guest, this.catalogStore.drinkCatalog())),
  );
  protected readonly billedGuestBills = computed(() =>
    this.billingHistoryStore
      .billedGuestTabs()
      .map((guest) => createBilledGuestBillViewModel(guest)),
  );
  protected readonly canSubmitDrink = computed(
    () =>
      normalizeAdminText(this.draftDrinkName()).length > 0 &&
      parsePriceInputToCents(this.draftDrinkPrice()) !== null,
  );
  protected readonly canSubmitRoom = computed(
    () => normalizeAdminText(this.draftRoomNumber()).length > 0,
  );

  protected updateDraftRoomNumber(value: string): void {
    this.draftRoomNumber.set(value);
  }

  protected updateDraftDrinkName(value: string): void {
    this.draftDrinkName.set(value);
  }

  protected updateDraftDrinkPrice(value: string): void {
    this.draftDrinkPrice.set(value);
  }

  protected submitAddRoom(event: Event): void {
    event.preventDefault();

    const result = this.roomsStore.addRoom(this.draftRoomNumber());

    if (!result.ok) {
      this.showFlashMessage(createAddRoomErrorMessage(result.reason), 'error');
      return;
    }

    this.draftRoomNumber.set('');
    this.showFlashMessage(this.copy.flashSuccessAddRoom, 'success');
  }

  protected submitAddDrink(event: Event): void {
    event.preventDefault();

    const priceCents = parsePriceInputToCents(this.draftDrinkPrice());
    const result = this.catalogStore.addDrink(this.draftDrinkName(), priceCents ?? Number.NaN);

    if (!result.ok) {
      this.showFlashMessage(createAddDrinkErrorMessage(result.reason), 'error');
      return;
    }

    this.draftDrinkName.set('');
    this.draftDrinkPrice.set('');
    this.showFlashMessage(
      result.action === 'restored' ? this.copy.flashSuccessRestore : this.copy.flashSuccessAdd,
      'success',
    );
  }

  protected removeDrink(drink: HostDrinkCatalogItem): void {
    if (!drink.canRemove) {
      return;
    }

    const confirmed = globalThis.confirm?.(
      `Remove ${drink.name} from the guest drink list? Guests will no longer be able to add it.`,
    );

    if (confirmed === false) {
      return;
    }

    if (this.catalogStore.removeDrink(drink.id, drink.openGuestCount)) {
      this.showFlashMessage(this.copy.flashSuccessRemove, 'success');
    }
  }

  protected removeRoom(room: HostRoomItem): void {
    if (!room.canRemove) {
      return;
    }

    const confirmed = globalThis.confirm?.(
      `Remove room ${room.roomNumber} from the order-entry room list? Hosts will no longer be able to select it for new orders.`,
    );

    if (confirmed === false) {
      return;
    }

    if (this.roomsStore.removeRoom(room.id, room.openGuestCount)) {
      this.showFlashMessage(this.copy.flashSuccessRemoveRoom, 'success');
    }
  }

  protected restoreDrink(drink: HostDrinkCatalogItem): void {
    if (this.catalogStore.restoreDrink(drink.id)) {
      this.showFlashMessage(this.copy.flashSuccessRestore, 'success');
    }
  }

  protected billGuest(guest: OpenGuestBillViewModel): void {
    const confirmed = globalThis.confirm?.(
      `Bill ${guest.fullName} in room ${guest.roomNumber} for ${guest.displayTotalPrice} and close the tab?`,
    );

    if (confirmed === false) {
      return;
    }

    const closedGuestTab = this.guestTabsStore.closeGuestTab(guest.id);

    if (!closedGuestTab) {
      return;
    }

    this.billingHistoryStore.recordBilledGuestTab(closedGuestTab, this.catalogStore.drinkCatalog());
    this.showFlashMessage(this.copy.flashSuccessBill, 'success');
  }

  private showFlashMessage(text: string, tone: FlashMessage['tone']): void {
    this.flashMessage.set({ text, tone });
  }
}

function normalizeAdminText(value: string): string {
  return value.trim().replace(/\s+/g, ' ');
}

function createAddRoomErrorMessage(reason: 'invalidRoomNumber' | 'duplicateRoomNumber'): string {
  switch (reason) {
    case 'invalidRoomNumber':
      return 'Enter a room number before adding it.';
    case 'duplicateRoomNumber':
      return 'That room already exists in the live room list.';
  }
}

function parsePriceInputToCents(value: string): number | null {
  const normalized = value.trim().replace(',', '.');

  if (!normalized) {
    return null;
  }

  const parsed = Number(normalized);

  if (!Number.isFinite(parsed) || parsed < 0) {
    return null;
  }

  return Math.round(parsed * 100);
}

function createAddDrinkErrorMessage(
  reason: 'invalidName' | 'invalidPrice' | 'duplicateName',
): string {
  switch (reason) {
    case 'invalidName':
      return 'Enter a drink name before adding it.';
    case 'invalidPrice':
      return 'Enter a valid euro price such as 4.50.';
    case 'duplicateName':
      return 'That drink already exists in the live catalog.';
  }
}
