import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatToolbarModule } from '@angular/material/toolbar';
import { RouterLink } from '@angular/router';

import { HOST_ADMIN_COPY } from './host-admin.copy';
import {
  DrinkTallyStore,
  HostDrinkCatalogItem,
  OpenGuestBillViewModel,
} from '../../tally/drink-tally/drink-tally.store';

type FlashMessage = {
  text: string;
  tone: 'success' | 'error';
};

@Component({
  selector: 'nt-host-admin',
  imports: [
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatToolbarModule,
    RouterLink,
  ],
  templateUrl: './host-admin.html',
  styleUrl: './host-admin.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HostAdmin {
  protected readonly copy = HOST_ADMIN_COPY;
  protected readonly tallyStore = inject(DrinkTallyStore);
  protected readonly draftDrinkName = signal('');
  protected readonly draftDrinkPrice = signal('');
  protected readonly flashMessage = signal<FlashMessage | null>(null);
  protected readonly activeDrinks = computed(() =>
    this.tallyStore.hostDrinkCatalog().filter((drink) => drink.isActive),
  );
  protected readonly removedDrinks = computed(() =>
    this.tallyStore.hostDrinkCatalog().filter((drink) => !drink.isActive),
  );
  protected readonly canSubmitDrink = computed(
    () =>
      normalizeAdminText(this.draftDrinkName()).length > 0 &&
      parsePriceInputToCents(this.draftDrinkPrice()) !== null,
  );

  protected updateDraftDrinkName(value: string): void {
    this.draftDrinkName.set(value);
  }

  protected updateDraftDrinkPrice(value: string): void {
    this.draftDrinkPrice.set(value);
  }

  protected submitAddDrink(event: Event): void {
    event.preventDefault();

    const priceCents = parsePriceInputToCents(this.draftDrinkPrice());
    const result = this.tallyStore.addDrink(this.draftDrinkName(), priceCents ?? Number.NaN);

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

    if (this.tallyStore.removeDrink(drink.id)) {
      this.showFlashMessage(this.copy.flashSuccessRemove, 'success');
    }
  }

  protected restoreDrink(drink: HostDrinkCatalogItem): void {
    if (this.tallyStore.restoreDrink(drink.id)) {
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

    if (this.tallyStore.billGuestTab(guest.id)) {
      this.showFlashMessage(this.copy.flashSuccessBill, 'success');
    }
  }

  private showFlashMessage(text: string, tone: FlashMessage['tone']): void {
    this.flashMessage.set({ text, tone });
  }
}

function normalizeAdminText(value: string): string {
  return value.trim().replace(/\s+/g, ' ');
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
