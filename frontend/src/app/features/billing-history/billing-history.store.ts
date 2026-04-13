import { computed } from '@angular/core';
import {
  patchState,
  signalStore,
  withComputed,
  withHooks,
  withMethods,
  withState,
} from '@ngrx/signals';

import { DrinkCatalogEntry } from '../catalog';
import { GuestTab } from '../guest-tabs';
import {
  BilledGuestTab,
  createBilledGuestTab,
  sortBilledGuestTabs,
} from './billing-history.domain';
import { loadBilledGuestTabs, saveBilledGuestTabs } from './billing-history.repository';

type BillingHistoryState = {
  billedGuestTabs: BilledGuestTab[];
};

const initialState: BillingHistoryState = {
  billedGuestTabs: [],
};

export const BillingHistoryStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withComputed((store) => ({
    billedGuestCount: computed(() => store.billedGuestTabs().length),
  })),
  withMethods((store) => ({
    recordBilledGuestTab(
      guestTab: GuestTab,
      drinkCatalog: ReadonlyArray<DrinkCatalogEntry>,
    ): BilledGuestTab {
      const billedGuestTab = createBilledGuestTab(guestTab, drinkCatalog);
      const nextBilledGuestTabs = sortBilledGuestTabs([billedGuestTab, ...store.billedGuestTabs()]);

      patchState(store, {
        billedGuestTabs: nextBilledGuestTabs,
      });
      saveBilledGuestTabs(nextBilledGuestTabs);

      return billedGuestTab;
    },
  })),
  withHooks({
    onInit(store): void {
      const restoredBilledGuestTabs = sortBilledGuestTabs(loadBilledGuestTabs());

      patchState(store, {
        billedGuestTabs: restoredBilledGuestTabs,
      });
      saveBilledGuestTabs(restoredBilledGuestTabs);
    },
  }),
);
