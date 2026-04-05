import { computed } from '@angular/core';
import {
  patchState,
  signalStore,
  withComputed,
  withHooks,
  withMethods,
  withState,
} from '@ngrx/signals';

export const DRINK_TALLY_STORAGE_KEY = 'naud-tally.guest-tabs';
export const GUEST_TAB_INACTIVITY_TIMEOUT_MS = 180_000;

export const DRINK_CATALOG = [
  { id: 'water', name: 'Water', priceCents: 200 },
  { id: 'sparklingWater', name: 'Sparkling Water', priceCents: 250 },
  { id: 'cola', name: 'Cola', priceCents: 300 },
  { id: 'colaZero', name: 'Cola Zero', priceCents: 300 },
  { id: 'lemonSoda', name: 'Lemon Soda', priceCents: 300 },
  { id: 'orangeSoda', name: 'Orange Soda', priceCents: 300 },
  { id: 'appleJuice', name: 'Apple Juice', priceCents: 350 },
  { id: 'beer', name: 'Beer', priceCents: 450 },
  { id: 'whiteWine', name: 'White Wine', priceCents: 500 },
] as const;

export type DrinkId = (typeof DRINK_CATALOG)[number]['id'];
export type DrinkCounts = Record<DrinkId, number>;
export type AddGuestStep = 'closed' | 'roomNumber' | 'fullName';

export type GuestTab = {
  id: string;
  roomNumber: string;
  fullName: string;
  counts: DrinkCounts;
  createdAt: string;
  updatedAt: string;
};

type DrinkTallyState = {
  guestTabs: GuestTab[];
  selectedGuestId: string | null;
  addGuestStep: AddGuestStep;
  draftRoomNumber: string;
  draftFullName: string;
  interactionVersion: number;
};

export type AddGuestFlowViewModel = {
  step: AddGuestStep;
  roomNumber: string;
  fullName: string;
};

export type DrinkSummaryItem = {
  id: DrinkId;
  name: string;
  count: number;
};

export type GuestCardViewModel = GuestTab & {
  totalCount: number;
  drinkSummary: DrinkSummaryItem[];
};

export type SelectedGuestDrinkTally = {
  id: DrinkId;
  name: string;
  count: number;
  displayPrice: string;
};

export type SelectedGuestViewModel = GuestCardViewModel & {
  drinkTallies: SelectedGuestDrinkTally[];
};

const roomNumberCollator = new Intl.Collator(undefined, {
  numeric: true,
  sensitivity: 'base',
});

const initialState: DrinkTallyState = {
  guestTabs: [],
  selectedGuestId: null,
  addGuestStep: 'closed',
  draftRoomNumber: '',
  draftFullName: '',
  interactionVersion: 0,
};

export const DrinkTallyStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withComputed((store) => ({
    toolbarDrinkReferences: computed(() =>
      DRINK_CATALOG.map((drink) => ({
        ...drink,
        displayPrice: formatEuroPrice(drink.priceCents),
      })),
    ),
    publicTotalCount: computed(() =>
      store.guestTabs().reduce((total, guest) => total + countDrinks(guest.counts), 0),
    ),
    activeGuestCount: computed(() => store.guestTabs().length),
    activeGuests: computed<GuestCardViewModel[]>(() =>
      store.guestTabs().map((guest) => ({
        ...guest,
        totalCount: countDrinks(guest.counts),
        drinkSummary: createDrinkSummary(guest.counts),
      })),
    ),
    selectedGuest: computed<SelectedGuestViewModel | null>(() => {
      const selectedGuestId = store.selectedGuestId();

      if (!selectedGuestId) {
        return null;
      }

      const guest = store.guestTabs().find((entry) => entry.id === selectedGuestId);

      if (!guest) {
        return null;
      }

      return {
        ...guest,
        totalCount: countDrinks(guest.counts),
        drinkSummary: createDrinkSummary(guest.counts),
        drinkTallies: DRINK_CATALOG.map((drink) => ({
          id: drink.id,
          name: drink.name,
          count: guest.counts[drink.id],
          displayPrice: formatEuroPrice(drink.priceCents),
        })),
      };
    }),
    addGuestFlow: computed<AddGuestFlowViewModel>(() => ({
      step: store.addGuestStep(),
      roomNumber: store.draftRoomNumber(),
      fullName: store.draftFullName(),
    })),
  })),
  withMethods((store) => {
    function closeSelectedGuestTabAndUpdateOrder(): void {
      const selectedGuestId = store.selectedGuestId();

      if (!selectedGuestId) {
        patchState(store, {
          addGuestStep: 'closed',
          draftRoomNumber: '',
          draftFullName: '',
        });
        return;
      }

      const timestamp = createTimestamp();
      let didUpdate = false;
      const nextGuestTabs = store.guestTabs().map((guest) => {
        if (guest.id !== selectedGuestId) {
          return guest;
        }

        didUpdate = true;
        return {
          ...guest,
          updatedAt: timestamp,
        };
      });

      if (!didUpdate) {
        patchState(store, {
          selectedGuestId: null,
          addGuestStep: 'closed',
          draftRoomNumber: '',
          draftFullName: '',
        });
        return;
      }

      const sortedGuestTabs = sortGuestTabs(nextGuestTabs);

      patchState(store, {
        guestTabs: sortedGuestTabs,
        selectedGuestId: null,
        addGuestStep: 'closed',
        draftRoomNumber: '',
        draftFullName: '',
        interactionVersion: store.interactionVersion() + 1,
      });
      persistGuestTabs(sortedGuestTabs);
    }

    function selectGuestTabById(guestId: string): void {
      if (store.guestTabs().every((guest) => guest.id !== guestId)) {
        return;
      }

      patchState(store, {
        selectedGuestId: guestId,
        addGuestStep: 'closed',
        draftRoomNumber: '',
        draftFullName: '',
        interactionVersion: store.interactionVersion() + 1,
      });
    }

    function updateSelectedGuestCountsByDelta(drinkId: DrinkId, delta: number): void {
      const selectedGuestId = store.selectedGuestId();

      if (!selectedGuestId) {
        return;
      }

      let didUpdate = false;
      const nextGuestTabs = store.guestTabs().map((guest) => {
        if (guest.id !== selectedGuestId) {
          return guest;
        }

        didUpdate = true;
        const nextCount = Math.max(0, guest.counts[drinkId] + delta);

        return {
          ...guest,
          counts: {
            ...guest.counts,
            [drinkId]: nextCount,
          },
        };
      });

      if (!didUpdate) {
        return;
      }

      patchState(store, {
        guestTabs: nextGuestTabs,
        interactionVersion: store.interactionVersion() + 1,
      });
      persistGuestTabs(nextGuestTabs);
    }

    return {
      startAddGuestFlow(): void {
        patchState(store, {
          selectedGuestId: null,
          addGuestStep: 'roomNumber',
          draftRoomNumber: '',
          draftFullName: '',
          interactionVersion: store.interactionVersion() + 1,
        });
      },
      cancelAddGuestFlow(): void {
        patchState(store, {
          addGuestStep: 'closed',
          draftRoomNumber: '',
          draftFullName: '',
        });
      },
      returnToRoomNumberStep(): void {
        patchState(store, {
          addGuestStep: 'roomNumber',
          draftFullName: '',
          interactionVersion: store.interactionVersion() + 1,
        });
      },
      updateDraftRoomNumber(roomNumber: string): void {
        patchState(store, {
          draftRoomNumber: roomNumber,
          interactionVersion: store.interactionVersion() + 1,
        });
      },
      submitRoomNumber(): void {
        const roomNumber = normalizeDisplayText(store.draftRoomNumber());

        if (!roomNumber) {
          return;
        }

        patchState(store, {
          draftRoomNumber: roomNumber,
          addGuestStep: 'fullName',
          interactionVersion: store.interactionVersion() + 1,
        });
      },
      updateDraftFullName(fullName: string): void {
        patchState(store, {
          draftFullName: fullName,
          interactionVersion: store.interactionVersion() + 1,
        });
      },
      submitGuestIdentity(): void {
        const roomNumber = normalizeDisplayText(store.draftRoomNumber());
        const fullName = normalizeDisplayText(store.draftFullName());

        if (!roomNumber || !fullName) {
          return;
        }

        const identityKey = createIdentityKey(roomNumber, fullName);
        const existingGuest = store
          .guestTabs()
          .find((guest) => createIdentityKey(guest.roomNumber, guest.fullName) === identityKey);

        if (existingGuest) {
          selectGuestTabById(existingGuest.id);
          return;
        }

        const timestamp = createTimestamp();
        const guestTab: GuestTab = {
          id: createGuestTabId(),
          roomNumber,
          fullName,
          counts: createEmptyCounts(),
          createdAt: timestamp,
          updatedAt: timestamp,
        };
        const nextGuestTabs = [guestTab, ...store.guestTabs()];

        patchState(store, {
          guestTabs: nextGuestTabs,
          selectedGuestId: guestTab.id,
          addGuestStep: 'closed',
          draftRoomNumber: '',
          draftFullName: '',
          interactionVersion: store.interactionVersion() + 1,
        });
        persistGuestTabs(nextGuestTabs);
      },
      selectGuestTab(guestId: string): void {
        if (store.guestTabs().every((guest) => guest.id !== guestId)) {
          return;
        }

        patchState(store, {
          selectedGuestId: guestId,
          addGuestStep: 'closed',
          draftRoomNumber: '',
          draftFullName: '',
          interactionVersion: store.interactionVersion() + 1,
        });
      },
      closeSelectedGuestTab(): void {
        closeSelectedGuestTabAndUpdateOrder();
      },
      incrementDrink(drinkId: DrinkId): void {
        updateSelectedGuestCountsByDelta(drinkId, 1);
      },
      decrementDrink(drinkId: DrinkId): void {
        updateSelectedGuestCountsByDelta(drinkId, -1);
      },
      clearTransientState(): void {
        if (store.selectedGuestId()) {
          closeSelectedGuestTabAndUpdateOrder();
          return;
        }

        patchState(store, {
          selectedGuestId: null,
          addGuestStep: 'closed',
          draftRoomNumber: '',
          draftFullName: '',
        });
      },
    };
  }),
  withHooks({
    onInit(store): void {
      const restoredGuestTabs = sortGuestTabs(readPersistedGuestTabs());

      if (!restoredGuestTabs.length) {
        return;
      }

      patchState(store, { guestTabs: restoredGuestTabs });
      persistGuestTabs(restoredGuestTabs);
    },
  }),
);

function createDrinkSummary(counts: DrinkCounts): DrinkSummaryItem[] {
  return DRINK_CATALOG.flatMap((drink) =>
    counts[drink.id] > 0
      ? [{ id: drink.id, name: drink.name, count: counts[drink.id] }]
      : [],
  );
}

function countDrinks(counts: DrinkCounts): number {
  return Object.values(counts).reduce((total, count) => total + count, 0);
}

function sortGuestTabs(guestTabs: GuestTab[]): GuestTab[] {
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

function createEmptyCounts(): DrinkCounts {
  return DRINK_CATALOG.reduce(
    (counts, drink) => {
      counts[drink.id] = 0;
      return counts;
    },
    {} as DrinkCounts,
  );
}

function readPersistedGuestTabs(): GuestTab[] {
  const storage = getStorage();

  if (!storage) {
    return [];
  }

  const rawGuestTabs = storage.getItem(DRINK_TALLY_STORAGE_KEY);

  if (!rawGuestTabs) {
    return [];
  }

  try {
    return normalizeGuestTabs(JSON.parse(rawGuestTabs));
  } catch {
    return [];
  }
}

function normalizeGuestTabs(value: unknown): GuestTab[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((guestTab) => normalizeGuestTab(guestTab))
    .filter((guestTab): guestTab is GuestTab => guestTab !== null);
}

function normalizeGuestTab(value: unknown): GuestTab | null {
  if (!value || typeof value !== 'object') {
    return null;
  }

  const guestTab = value as Record<string, unknown>;
  const roomNumber = normalizeDisplayText(guestTab['roomNumber']);
  const fullName = normalizeDisplayText(guestTab['fullName']);

  if (!roomNumber || !fullName) {
    return null;
  }

  const timestamp = createTimestamp();

  return {
    id: normalizeId(guestTab['id']) ?? createGuestTabId(),
    roomNumber,
    fullName,
    counts: normalizeCounts(guestTab['counts']),
    createdAt: normalizeTimestamp(guestTab['createdAt'], timestamp),
    updatedAt: normalizeTimestamp(guestTab['updatedAt'], timestamp),
  };
}

function normalizeCounts(value: unknown): DrinkCounts {
  const counts = createEmptyCounts();

  if (!value || typeof value !== 'object') {
    return counts;
  }

  const persistedCounts = value as Record<string, unknown>;

  for (const drink of DRINK_CATALOG) {
    counts[drink.id] = normalizeCountValue(persistedCounts[drink.id]);
  }

  return counts;
}

function normalizeId(value: unknown): string | null {
  if (typeof value !== 'string') {
    return null;
  }

  const normalized = value.trim();
  return normalized ? normalized : null;
}

function normalizeTimestamp(value: unknown, fallback: string): string {
  if (typeof value !== 'string') {
    return fallback;
  }

  const normalized = value.trim();

  if (!normalized || Number.isNaN(Date.parse(normalized))) {
    return fallback;
  }

  return normalized;
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

function formatEuroPrice(priceCents: number): string {
  return `€${(priceCents / 100).toFixed(2)}`;
}

function createGuestTabId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }

  return `guest-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function createTimestamp(): string {
  return new Date().toISOString();
}

function persistGuestTabs(guestTabs: GuestTab[]): void {
  const storage = getStorage();

  if (!storage) {
    return;
  }

  try {
    storage.setItem(DRINK_TALLY_STORAGE_KEY, JSON.stringify(guestTabs));
  } catch {
    // Ignore storage failures so the tally still works in restricted contexts.
  }
}

function getStorage(): Storage | null {
  try {
    return globalThis.localStorage;
  } catch {
    return null;
  }
}
