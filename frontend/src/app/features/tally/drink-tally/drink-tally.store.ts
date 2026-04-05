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
export const GUEST_TAB_INACTIVITY_TIMEOUT_MS = 90_000;

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
  selectedGuestDrinkOrder: DrinkId[];
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

export type AvailableDrinkReference = {
  id: DrinkId;
  name: string;
  displayPrice: string;
};

export type SelectedGuestViewModel = GuestCardViewModel & {
  activeDrinkTallies: SelectedGuestDrinkTally[];
  availableDrinks: AvailableDrinkReference[];
};

const roomNumberCollator = new Intl.Collator(undefined, {
  numeric: true,
  sensitivity: 'base',
});
const drinkNameCollator = new Intl.Collator(undefined, {
  sensitivity: 'base',
});
const drinkCatalogIndexById = new Map(
  DRINK_CATALOG.map((drink, index) => [drink.id, index]),
);

const initialState: DrinkTallyState = {
  guestTabs: [],
  selectedGuestId: null,
  selectedGuestDrinkOrder: [],
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
        activeDrinkTallies: normalizeSelectedGuestDrinkOrder(
          guest.counts,
          store.selectedGuestDrinkOrder(),
        ).map((drinkId) => createSelectedGuestDrinkTally(drinkId, guest.counts[drinkId])),
        availableDrinks: createAvailableDrinkReferences(guest.counts),
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
          selectedGuestDrinkOrder: [],
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
          selectedGuestDrinkOrder: [],
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
        selectedGuestDrinkOrder: [],
        addGuestStep: 'closed',
        draftRoomNumber: '',
        draftFullName: '',
        interactionVersion: store.interactionVersion() + 1,
      });
      persistGuestTabs(sortedGuestTabs);
    }

    function selectGuestTabById(guestId: string): void {
      const guest = store.guestTabs().find((entry) => entry.id === guestId);

      if (!guest) {
        return;
      }

      patchState(store, {
        selectedGuestId: guestId,
        selectedGuestDrinkOrder: createSelectedGuestDrinkOrder(guest.counts),
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
      let nextSelectedGuestDrinkOrder = store.selectedGuestDrinkOrder();
      const nextGuestTabs = store.guestTabs().map((guest) => {
        if (guest.id !== selectedGuestId) {
          return guest;
        }

        const previousCount = guest.counts[drinkId];
        const nextCount = Math.max(0, previousCount + delta);

        if (nextCount === previousCount) {
          return guest;
        }

        didUpdate = true;
        nextSelectedGuestDrinkOrder = updateSelectedGuestDrinkOrder(
          guest.counts,
          store.selectedGuestDrinkOrder(),
          drinkId,
          previousCount,
          nextCount,
        );

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
        selectedGuestDrinkOrder: nextSelectedGuestDrinkOrder,
        interactionVersion: store.interactionVersion() + 1,
      });
      persistGuestTabs(nextGuestTabs);
    }

    return {
      startAddGuestFlow(): void {
        patchState(store, {
          selectedGuestId: null,
          selectedGuestDrinkOrder: [],
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
          selectedGuestDrinkOrder: [],
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

        if (store.selectedGuestId() === guestId) {
          closeSelectedGuestTabAndUpdateOrder();
          return;
        }

        selectGuestTabById(guestId);
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
          selectedGuestDrinkOrder: [],
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

function createSelectedGuestDrinkOrder(counts: DrinkCounts): DrinkId[] {
  return [...DRINK_CATALOG]
    .filter((drink) => counts[drink.id] > 0)
    .sort((left, right) => compareActiveDrinkIds(left.id, right.id, counts))
    .map((drink) => drink.id);
}

function normalizeSelectedGuestDrinkOrder(
  counts: DrinkCounts,
  currentOrder: ReadonlyArray<DrinkId>,
): DrinkId[] {
  const normalizedOrder: DrinkId[] = [];
  const seen = new Set<DrinkId>();

  for (const drinkId of currentOrder) {
    if (counts[drinkId] <= 0 || seen.has(drinkId)) {
      continue;
    }

    normalizedOrder.push(drinkId);
    seen.add(drinkId);
  }

  for (const drinkId of createSelectedGuestDrinkOrder(counts)) {
    if (seen.has(drinkId)) {
      continue;
    }

    normalizedOrder.push(drinkId);
    seen.add(drinkId);
  }

  return normalizedOrder;
}

function updateSelectedGuestDrinkOrder(
  counts: DrinkCounts,
  currentOrder: ReadonlyArray<DrinkId>,
  drinkId: DrinkId,
  previousCount: number,
  nextCount: number,
): DrinkId[] {
  const normalizedOrder = normalizeSelectedGuestDrinkOrder(counts, currentOrder);

  if (previousCount === 0 && nextCount > 0) {
    return insertSelectedGuestDrinkOrderEntry(
      normalizedOrder,
      {
        ...counts,
        [drinkId]: nextCount,
      },
      drinkId,
    );
  }

  if (previousCount > 0 && nextCount === 0) {
    return normalizedOrder.filter((entry) => entry !== drinkId);
  }

  return normalizedOrder;
}

function insertSelectedGuestDrinkOrderEntry(
  currentOrder: ReadonlyArray<DrinkId>,
  counts: DrinkCounts,
  drinkId: DrinkId,
): DrinkId[] {
  const nextOrder = currentOrder.filter((entry) => entry !== drinkId);
  const insertIndex = nextOrder.findIndex(
    (currentDrinkId) => compareActiveDrinkIds(drinkId, currentDrinkId, counts) < 0,
  );

  if (insertIndex === -1) {
    return [...nextOrder, drinkId];
  }

  return [
    ...nextOrder.slice(0, insertIndex),
    drinkId,
    ...nextOrder.slice(insertIndex),
  ];
}

function compareActiveDrinkIds(leftId: DrinkId, rightId: DrinkId, counts: DrinkCounts): number {
  const countDifference = counts[rightId] - counts[leftId];

  if (countDifference !== 0) {
    return countDifference;
  }

  return (drinkCatalogIndexById.get(leftId) ?? 0) - (drinkCatalogIndexById.get(rightId) ?? 0);
}

function createSelectedGuestDrinkTally(
  drinkId: DrinkId,
  count: number,
): SelectedGuestDrinkTally {
  const drink = getDrinkById(drinkId);

  return {
    id: drink.id,
    name: drink.name,
    count,
    displayPrice: formatEuroPrice(drink.priceCents),
  };
}

function createAvailableDrinkReferences(counts: DrinkCounts): AvailableDrinkReference[] {
  return [...DRINK_CATALOG]
    .filter((drink) => counts[drink.id] === 0)
    .sort((left, right) => drinkNameCollator.compare(left.name, right.name))
    .map((drink) => ({
      id: drink.id,
      name: drink.name,
      displayPrice: formatEuroPrice(drink.priceCents),
    }));
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

function getDrinkById(drinkId: DrinkId) {
  const drink = DRINK_CATALOG.find((entry) => entry.id === drinkId);

  if (!drink) {
    throw new Error(`Unknown drink id: ${drinkId}`);
  }

  return drink;
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
