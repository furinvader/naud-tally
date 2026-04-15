import { computed } from '@angular/core';
import {
  patchState,
  signalStore,
  withComputed,
  withHooks,
  withMethods,
  withState,
} from '@ngrx/signals';

import { DrinkCatalogEntry, DrinkId, findDrinkById } from '../catalog';
import {
  DrinkCounts,
  GuestTab,
  getDrinkCount,
  normalizeDisplayText,
  normalizeDrinkOrder,
  sortGuestTabs,
} from './guest-tabs.domain';
import { loadGuestTabs, saveGuestTabs } from './guest-tabs.repository';

export { GUEST_TABS_STORAGE_KEY } from './guest-tabs.repository';

type GuestTabsState = {
  guestTabs: GuestTab[];
};

const initialState: GuestTabsState = {
  guestTabs: [],
};

export const GuestTabsStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withComputed((store) => ({
    activeGuestCount: computed(() => store.guestTabs().length),
  })),
  withMethods((store) => ({
    ensureGuestTab(roomNumber: string, fullName: string): GuestTab | null {
      const normalizedRoomNumber = normalizeDisplayText(roomNumber);
      const normalizedFullName = normalizeDisplayText(fullName);

      if (!normalizedRoomNumber || !normalizedFullName) {
        return null;
      }

      const identityKey = createIdentityKey(normalizedRoomNumber, normalizedFullName);
      const existingGuest = store
        .guestTabs()
        .find((guest) => createIdentityKey(guest.roomNumber, guest.fullName) === identityKey);

      if (existingGuest) {
        return existingGuest;
      }

      const timestamp = createTimestamp();
      const guestTab: GuestTab = {
        id: createGuestTabId(),
        roomNumber: normalizedRoomNumber,
        fullName: normalizedFullName,
        counts: {},
        drinkOrder: [],
        createdAt: timestamp,
        updatedAt: timestamp,
      };
      const nextGuestTabs = [guestTab, ...store.guestTabs()];

      patchState(store, {
        guestTabs: nextGuestTabs,
      });
      saveGuestTabs(nextGuestTabs);

      return guestTab;
    },
    updateGuestDrinkCount(
      guestId: string,
      drinkId: DrinkId,
      delta: number,
      drinkCatalog: ReadonlyArray<DrinkCatalogEntry>,
    ): boolean {
      if (delta === 0) {
        return false;
      }

      const catalogDrink = findDrinkById(drinkCatalog, drinkId);
      if (delta > 0 && (!catalogDrink || !catalogDrink.isActive)) {
        return false;
      }

      let didUpdate = false;
      const nextGuestTabs = store.guestTabs().map((guest) => {
        if (guest.id !== guestId) {
          return guest;
        }

        const previousCount = getDrinkCount(guest.counts, drinkId);
        const nextCount = Math.max(0, previousCount + delta);

        if (nextCount === previousCount) {
          return guest;
        }

        didUpdate = true;
        const nextCounts = setDrinkCount(guest.counts, drinkId, nextCount);

        return {
          ...guest,
          counts: nextCounts,
          drinkOrder: updateDrinkOrder(guest.drinkOrder, nextCounts, drinkId, previousCount, nextCount),
        };
      });

      if (!didUpdate) {
        return false;
      }

      patchState(store, {
        guestTabs: nextGuestTabs,
      });
      saveGuestTabs(nextGuestTabs);

      return true;
    },
    finalizeGuestTab(guestId: string): boolean {
      const timestamp = createTimestamp();
      let didUpdate = false;
      const nextGuestTabs = store.guestTabs().map((guest) => {
        if (guest.id !== guestId) {
          return guest;
        }

        didUpdate = true;

        return {
          ...guest,
          updatedAt: timestamp,
        };
      });

      if (!didUpdate) {
        return false;
      }

      const sortedGuestTabs = sortGuestTabs(nextGuestTabs);

      patchState(store, {
        guestTabs: sortedGuestTabs,
      });
      saveGuestTabs(sortedGuestTabs);

      return true;
    },
    closeGuestTab(guestId: string): GuestTab | null {
      const guest = store.guestTabs().find((entry) => entry.id === guestId);

      if (!guest) {
        return null;
      }

      const nextGuestTabs = sortGuestTabs(store.guestTabs().filter((entry) => entry.id !== guestId));

      patchState(store, {
        guestTabs: nextGuestTabs,
      });
      saveGuestTabs(nextGuestTabs);

      return guest;
    },
  })),
  withHooks({
    onInit(store): void {
      const restoredGuestTabs = sortGuestTabs(loadGuestTabs());

      patchState(store, {
        guestTabs: restoredGuestTabs,
      });
      saveGuestTabs(restoredGuestTabs);
    },
  }),
);

function setDrinkCount(counts: DrinkCounts, drinkId: string, count: number): DrinkCounts {
  const normalizedCount = normalizeCountValue(count);
  const nextCounts = { ...counts };

  if (normalizedCount === 0) {
    delete nextCounts[drinkId];
    return nextCounts;
  }

  nextCounts[drinkId] = normalizedCount;
  return nextCounts;
}

function updateDrinkOrder(
  currentOrder: ReadonlyArray<DrinkId>,
  nextCounts: DrinkCounts,
  drinkId: DrinkId,
  previousCount: number,
  nextCount: number,
): DrinkId[] {
  const normalizedOrder = normalizeDrinkOrder(currentOrder, nextCounts);

  if (previousCount === 0 && nextCount > 0) {
    return [...normalizedOrder.filter((entry) => entry !== drinkId), drinkId];
  }

  if (previousCount > 0 && nextCount === 0) {
    return normalizedOrder.filter((entry) => entry !== drinkId);
  }

  return normalizedOrder;
}

function createIdentityKey(roomNumber: string, fullName: string): string {
  return `${normalizeDisplayText(roomNumber).toLowerCase()}::${normalizeDisplayText(fullName).toLowerCase()}`;
}

function normalizeCountValue(value: unknown): number {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    return 0;
  }

  return Math.max(0, Math.trunc(value));
}

function createGuestTabId(): string {
  return createRecordId('guest');
}

function createRecordId(prefix: string): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return `${prefix}-${crypto.randomUUID()}`;
  }

  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function createTimestamp(): string {
  return new Date().toISOString();
}
