import { computed } from '@angular/core';
import {
  patchState,
  signalStore,
  withComputed,
  withHooks,
  withMethods,
  withState,
} from '@ngrx/signals';

import { DrinkCatalogEntry, DrinkId, findDrinkById } from '../catalog/catalog.store';
import { loadGuestTabs, saveGuestTabs } from './guest-tabs.repository';

export { GUEST_TABS_STORAGE_KEY } from './guest-tabs.repository';

export type DrinkCounts = Partial<Record<DrinkId, number>> & Record<string, number>;

export type GuestTab = {
  id: string;
  roomNumber: string;
  fullName: string;
  counts: DrinkCounts;
  createdAt: string;
  updatedAt: string;
};

type GuestTabsState = {
  guestTabs: GuestTab[];
};

const roomNumberCollator = new Intl.Collator(undefined, {
  numeric: true,
  sensitivity: 'base',
});

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

        return {
          ...guest,
          counts: setDrinkCount(guest.counts, drinkId, nextCount),
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

export function sortGuestTabs(guestTabs: GuestTab[]): GuestTab[] {
  return [...guestTabs].sort((left, right) => {
    const totalDifference = countDrinks(right.counts) - countDrinks(left.counts);

    if (totalDifference !== 0) {
      return totalDifference;
    }

    const roomDifference = roomNumberCollator.compare(left.roomNumber, right.roomNumber);

    if (roomDifference !== 0) {
      return roomDifference;
    }

    return left.fullName.localeCompare(right.fullName);
  });
}

export function countDrinks(counts: DrinkCounts): number {
  return Object.values(counts).reduce((total, count) => total + normalizeCountValue(count), 0);
}

export function getDrinkCount(counts: DrinkCounts, drinkId: string): number {
  return normalizeCountValue(counts[drinkId]);
}

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

function normalizeDisplayText(value: unknown): string {
  if (typeof value !== 'string') {
    return '';
  }

  return value.trim().replace(/\s+/g, ' ');
}

function createIdentityKey(roomNumber: string, fullName: string): string {
  return `${normalizeDisplayText(roomNumber).toLowerCase()}::${normalizeDisplayText(
    fullName,
  ).toLowerCase()}`;
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
