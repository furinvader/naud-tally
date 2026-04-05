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
export const DRINK_CATALOG_STORAGE_KEY = 'naud-tally.drink-catalog';
export const BILLED_GUEST_TABS_STORAGE_KEY = 'naud-tally.billed-guest-tabs';
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

type SeedDrinkId = (typeof DRINK_CATALOG)[number]['id'];

export type DrinkId = SeedDrinkId | string;
export type DrinkCounts = Partial<Record<SeedDrinkId, number>> & Record<string, number>;
export type AddGuestStep = 'closed' | 'roomNumber' | 'fullName';

export type DrinkCatalogEntry = {
  id: string;
  name: string;
  priceCents: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type GuestTab = {
  id: string;
  roomNumber: string;
  fullName: string;
  counts: DrinkCounts;
  createdAt: string;
  updatedAt: string;
};

export type GuestBillLineItem = {
  id: string;
  name: string;
  count: number;
  unitPriceCents: number;
  totalPriceCents: number;
};

export type BilledGuestTab = {
  id: string;
  roomNumber: string;
  fullName: string;
  lineItems: GuestBillLineItem[];
  totalCount: number;
  totalPriceCents: number;
  createdAt: string;
  updatedAt: string;
  billedAt: string;
};

type DrinkTallyState = {
  guestTabs: GuestTab[];
  billedGuestTabs: BilledGuestTab[];
  drinkCatalog: DrinkCatalogEntry[];
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
  totalPriceCents: number;
  displayTotalPrice: string;
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

export type HostDrinkCatalogItem = {
  id: DrinkId;
  name: string;
  priceCents: number;
  displayPrice: string;
  isActive: boolean;
  openGuestCount: number;
  openDrinkCount: number;
  canRemove: boolean;
};

export type GuestBillLineItemViewModel = GuestBillLineItem & {
  displayUnitPrice: string;
  displayTotalPrice: string;
};

export type OpenGuestBillViewModel = GuestCardViewModel & {
  lineItems: GuestBillLineItemViewModel[];
};

export type BilledGuestBillViewModel = BilledGuestTab & {
  lineItems: GuestBillLineItemViewModel[];
  displayTotalPrice: string;
  displayBilledAt: string;
};

export type HostSummaryViewModel = {
  activeDrinkCount: number;
  removedDrinkCount: number;
  openGuestCount: number;
  billedGuestCount: number;
  pendingTotalCents: number;
  billedTotalCents: number;
  displayPendingTotal: string;
  displayBilledTotal: string;
};

export type AddDrinkResult =
  | {
      ok: true;
      action: 'added' | 'restored';
      drinkId: string;
    }
  | {
      ok: false;
      reason: 'invalidName' | 'invalidPrice' | 'duplicateName';
    };

const roomNumberCollator = new Intl.Collator(undefined, {
  numeric: true,
  sensitivity: 'base',
});
const drinkNameCollator = new Intl.Collator(undefined, {
  sensitivity: 'base',
});
const billedTimestampFormatter = new Intl.DateTimeFormat(undefined, {
  month: 'short',
  day: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
});

const initialState: DrinkTallyState = {
  guestTabs: [],
  billedGuestTabs: [],
  drinkCatalog: createDefaultDrinkCatalog(),
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
      store
        .drinkCatalog()
        .filter((drink) => drink.isActive)
        .map((drink) => ({
          id: drink.id,
          name: drink.name,
          displayPrice: formatEuroPrice(drink.priceCents),
        })),
    ),
    publicTotalCount: computed(() =>
      store.guestTabs().reduce((total, guest) => total + countDrinks(guest.counts), 0),
    ),
    activeGuestCount: computed(() => store.guestTabs().length),
    activeGuests: computed<GuestCardViewModel[]>(() =>
      store.guestTabs().map((guest) => createGuestCardViewModel(guest, store.drinkCatalog())),
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
        ...createGuestCardViewModel(guest, store.drinkCatalog()),
        activeDrinkTallies: normalizeSelectedGuestDrinkOrder(
          guest.counts,
          store.selectedGuestDrinkOrder(),
          store.drinkCatalog(),
        ).map((drinkId) =>
          createSelectedGuestDrinkTally(
            drinkId,
            getDrinkCount(guest.counts, drinkId),
            store.drinkCatalog(),
          ),
        ),
        availableDrinks: createAvailableDrinkReferences(guest.counts, store.drinkCatalog()),
      };
    }),
    addGuestFlow: computed<AddGuestFlowViewModel>(() => ({
      step: store.addGuestStep(),
      roomNumber: store.draftRoomNumber(),
      fullName: store.draftFullName(),
    })),
    hostDrinkCatalog: computed<HostDrinkCatalogItem[]>(() =>
      createHostDrinkCatalogItems(store.drinkCatalog(), store.guestTabs()),
    ),
    openGuestBills: computed<OpenGuestBillViewModel[]>(() =>
      store.guestTabs().map((guest) => createOpenGuestBillViewModel(guest, store.drinkCatalog())),
    ),
    billedGuestBills: computed<BilledGuestBillViewModel[]>(() =>
      store.billedGuestTabs().map((guest) => createBilledGuestBillViewModel(guest)),
    ),
    hostSummary: computed<HostSummaryViewModel>(() => {
      const catalog = store.drinkCatalog();
      const activeDrinkCount = catalog.filter((drink) => drink.isActive).length;
      const removedDrinkCount = catalog.length - activeDrinkCount;
      const openGuestCount = store.guestTabs().length;
      const billedGuestCount = store.billedGuestTabs().length;
      const pendingTotalCents = store
        .guestTabs()
        .reduce((total, guest) => total + calculateGuestTotalPriceCents(guest.counts, catalog), 0);
      const billedTotalCents = store
        .billedGuestTabs()
        .reduce((total, guest) => total + guest.totalPriceCents, 0);

      return {
        activeDrinkCount,
        removedDrinkCount,
        openGuestCount,
        billedGuestCount,
        pendingTotalCents,
        billedTotalCents,
        displayPendingTotal: formatEuroPrice(pendingTotalCents),
        displayBilledTotal: formatEuroPrice(billedTotalCents),
      };
    }),
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
        selectedGuestDrinkOrder: createSelectedGuestDrinkOrder(guest.counts, store.drinkCatalog()),
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

      const catalogDrink = findDrinkById(store.drinkCatalog(), drinkId);
      if (delta > 0 && (!catalogDrink || !catalogDrink.isActive)) {
        return;
      }

      let didUpdate = false;
      let nextSelectedGuestDrinkOrder = store.selectedGuestDrinkOrder();
      const nextGuestTabs = store.guestTabs().map((guest) => {
        if (guest.id !== selectedGuestId) {
          return guest;
        }

        const previousCount = getDrinkCount(guest.counts, drinkId);
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
          store.drinkCatalog(),
        );

        return {
          ...guest,
          counts: setDrinkCount(guest.counts, drinkId, nextCount),
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
          counts: {},
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
      addDrink(name: string, priceCents: number): AddDrinkResult {
        const normalizedName = normalizeDisplayText(name);
        const normalizedPriceCents = normalizePriceCents(priceCents);

        if (!normalizedName) {
          return { ok: false, reason: 'invalidName' };
        }

        if (normalizedPriceCents === null) {
          return { ok: false, reason: 'invalidPrice' };
        }

        const existingDrink = store
          .drinkCatalog()
          .find(
            (drink) =>
              normalizeDisplayText(drink.name).toLowerCase() === normalizedName.toLowerCase(),
          );
        const timestamp = createTimestamp();

        if (existingDrink?.isActive) {
          return { ok: false, reason: 'duplicateName' };
        }

        if (existingDrink) {
          const nextDrinkCatalog = store.drinkCatalog().map((drink) =>
            drink.id === existingDrink.id
              ? {
                  ...drink,
                  name: normalizedName,
                  priceCents: normalizedPriceCents,
                  isActive: true,
                  updatedAt: timestamp,
                }
              : drink,
          );

          patchState(store, { drinkCatalog: nextDrinkCatalog });
          persistDrinkCatalog(nextDrinkCatalog);

          return { ok: true, action: 'restored', drinkId: existingDrink.id };
        }

        const drinkId = createDrinkCatalogId(normalizedName);
        const nextDrinkCatalog = [
          ...store.drinkCatalog(),
          {
            id: drinkId,
            name: normalizedName,
            priceCents: normalizedPriceCents,
            isActive: true,
            createdAt: timestamp,
            updatedAt: timestamp,
          },
        ];

        patchState(store, { drinkCatalog: nextDrinkCatalog });
        persistDrinkCatalog(nextDrinkCatalog);

        return { ok: true, action: 'added', drinkId };
      },
      removeDrink(drinkId: string): boolean {
        const drink = store.drinkCatalog().find((entry) => entry.id === drinkId);

        if (!drink?.isActive || countOpenGuestsUsingDrink(store.guestTabs(), drinkId) > 0) {
          return false;
        }

        const timestamp = createTimestamp();
        const nextDrinkCatalog = store.drinkCatalog().map((entry) =>
          entry.id === drinkId
            ? {
                ...entry,
                isActive: false,
                updatedAt: timestamp,
              }
            : entry,
        );

        patchState(store, { drinkCatalog: nextDrinkCatalog });
        persistDrinkCatalog(nextDrinkCatalog);

        return true;
      },
      restoreDrink(drinkId: string): boolean {
        const drink = store.drinkCatalog().find((entry) => entry.id === drinkId);

        if (!drink || drink.isActive) {
          return false;
        }

        const timestamp = createTimestamp();
        const nextDrinkCatalog = store.drinkCatalog().map((entry) =>
          entry.id === drinkId
            ? {
                ...entry,
                isActive: true,
                updatedAt: timestamp,
              }
            : entry,
        );

        patchState(store, { drinkCatalog: nextDrinkCatalog });
        persistDrinkCatalog(nextDrinkCatalog);

        return true;
      },
      billGuestTab(guestId: string): boolean {
        const guest = store.guestTabs().find((entry) => entry.id === guestId);

        if (!guest) {
          return false;
        }

        const billedAt = createTimestamp();
        const lineItems = createBillLineItems(guest.counts, store.drinkCatalog());
        const totalPriceCents = lineItems.reduce(
          (total, lineItem) => total + lineItem.totalPriceCents,
          0,
        );
        const billedGuestTab: BilledGuestTab = {
          id: guest.id,
          roomNumber: guest.roomNumber,
          fullName: guest.fullName,
          lineItems,
          totalCount: countDrinks(guest.counts),
          totalPriceCents,
          createdAt: guest.createdAt,
          updatedAt: guest.updatedAt,
          billedAt,
        };
        const nextGuestTabs = sortGuestTabs(
          store.guestTabs().filter((entry) => entry.id !== guestId),
        );
        const nextBilledGuestTabs = sortBilledGuestTabs([
          billedGuestTab,
          ...store.billedGuestTabs(),
        ]);
        const shouldClearSelection = store.selectedGuestId() === guestId;

        patchState(store, {
          guestTabs: nextGuestTabs,
          billedGuestTabs: nextBilledGuestTabs,
          selectedGuestId: shouldClearSelection ? null : store.selectedGuestId(),
          selectedGuestDrinkOrder: shouldClearSelection ? [] : store.selectedGuestDrinkOrder(),
          interactionVersion: store.interactionVersion() + 1,
        });
        persistGuestTabs(nextGuestTabs);
        persistBilledGuestTabs(nextBilledGuestTabs);

        return true;
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
      const restoredDrinkCatalog = readPersistedDrinkCatalog();
      const restoredGuestTabs = sortGuestTabs(readPersistedGuestTabs());
      const restoredBilledGuestTabs = sortBilledGuestTabs(readPersistedBilledGuestTabs());

      patchState(store, {
        drinkCatalog: restoredDrinkCatalog,
        guestTabs: restoredGuestTabs,
        billedGuestTabs: restoredBilledGuestTabs,
      });
      persistDrinkCatalog(restoredDrinkCatalog);
      persistGuestTabs(restoredGuestTabs);
      persistBilledGuestTabs(restoredBilledGuestTabs);
    },
  }),
);

function createGuestCardViewModel(
  guest: GuestTab,
  drinkCatalog: ReadonlyArray<DrinkCatalogEntry>,
): GuestCardViewModel {
  const totalPriceCents = calculateGuestTotalPriceCents(guest.counts, drinkCatalog);

  return {
    ...guest,
    totalCount: countDrinks(guest.counts),
    totalPriceCents,
    displayTotalPrice: formatEuroPrice(totalPriceCents),
    drinkSummary: createDrinkSummary(guest.counts, drinkCatalog),
  };
}

function createOpenGuestBillViewModel(
  guest: GuestTab,
  drinkCatalog: ReadonlyArray<DrinkCatalogEntry>,
): OpenGuestBillViewModel {
  return {
    ...createGuestCardViewModel(guest, drinkCatalog),
    lineItems: createBillLineItemViewModels(createBillLineItems(guest.counts, drinkCatalog)),
  };
}

function createBilledGuestBillViewModel(guest: BilledGuestTab): BilledGuestBillViewModel {
  return {
    ...guest,
    lineItems: createBillLineItemViewModels(guest.lineItems),
    displayTotalPrice: formatEuroPrice(guest.totalPriceCents),
    displayBilledAt: formatBilledTimestamp(guest.billedAt),
  };
}

function createDrinkSummary(
  counts: DrinkCounts,
  drinkCatalog: ReadonlyArray<DrinkCatalogEntry>,
): DrinkSummaryItem[] {
  return getCountedDrinkIds(counts, drinkCatalog).map((drinkId) => ({
    id: drinkId,
    name: getDrinkById(drinkCatalog, drinkId).name,
    count: getDrinkCount(counts, drinkId),
  }));
}

function createBillLineItems(
  counts: DrinkCounts,
  drinkCatalog: ReadonlyArray<DrinkCatalogEntry>,
): GuestBillLineItem[] {
  return getCountedDrinkIds(counts, drinkCatalog).map((drinkId) => {
    const drink = getDrinkById(drinkCatalog, drinkId);
    const count = getDrinkCount(counts, drinkId);
    const totalPriceCents = count * drink.priceCents;

    return {
      id: drink.id,
      name: drink.name,
      count,
      unitPriceCents: drink.priceCents,
      totalPriceCents,
    };
  });
}

function createBillLineItemViewModels(
  lineItems: ReadonlyArray<GuestBillLineItem>,
): GuestBillLineItemViewModel[] {
  return lineItems.map((lineItem) => ({
    ...lineItem,
    displayUnitPrice: formatEuroPrice(lineItem.unitPriceCents),
    displayTotalPrice: formatEuroPrice(lineItem.totalPriceCents),
  }));
}

function calculateGuestTotalPriceCents(
  counts: DrinkCounts,
  drinkCatalog: ReadonlyArray<DrinkCatalogEntry>,
): number {
  return createBillLineItems(counts, drinkCatalog).reduce(
    (total, lineItem) => total + lineItem.totalPriceCents,
    0,
  );
}

function countDrinks(counts: DrinkCounts): number {
  return Object.values(counts).reduce((total, count) => total + normalizeCountValue(count), 0);
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

function sortBilledGuestTabs(guestTabs: BilledGuestTab[]): BilledGuestTab[] {
  return [...guestTabs].sort((left, right) => {
    const timestampDifference = Date.parse(right.billedAt) - Date.parse(left.billedAt);

    if (!Number.isNaN(timestampDifference) && timestampDifference !== 0) {
      return timestampDifference;
    }

    return roomNumberCollator.compare(left.roomNumber, right.roomNumber);
  });
}

function createSelectedGuestDrinkOrder(
  counts: DrinkCounts,
  drinkCatalog: ReadonlyArray<DrinkCatalogEntry>,
): DrinkId[] {
  const drinkCatalogIndexById = createDrinkCatalogIndexById(drinkCatalog);

  return getCountedDrinkIds(counts, drinkCatalog).sort((leftId, rightId) =>
    compareActiveDrinkIds(leftId, rightId, counts, drinkCatalogIndexById),
  );
}

function normalizeSelectedGuestDrinkOrder(
  counts: DrinkCounts,
  currentOrder: ReadonlyArray<DrinkId>,
  drinkCatalog: ReadonlyArray<DrinkCatalogEntry>,
): DrinkId[] {
  const normalizedOrder: DrinkId[] = [];
  const seen = new Set<DrinkId>();

  for (const drinkId of currentOrder) {
    if (getDrinkCount(counts, drinkId) <= 0 || seen.has(drinkId)) {
      continue;
    }

    normalizedOrder.push(drinkId);
    seen.add(drinkId);
  }

  for (const drinkId of createSelectedGuestDrinkOrder(counts, drinkCatalog)) {
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
  drinkCatalog: ReadonlyArray<DrinkCatalogEntry>,
): DrinkId[] {
  const normalizedOrder = normalizeSelectedGuestDrinkOrder(counts, currentOrder, drinkCatalog);

  if (previousCount === 0 && nextCount > 0) {
    return insertSelectedGuestDrinkOrderEntry(
      normalizedOrder,
      setDrinkCount(counts, drinkId, nextCount),
      drinkId,
      drinkCatalog,
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
  drinkCatalog: ReadonlyArray<DrinkCatalogEntry>,
): DrinkId[] {
  const nextOrder = currentOrder.filter((entry) => entry !== drinkId);
  const drinkCatalogIndexById = createDrinkCatalogIndexById(drinkCatalog);
  const insertIndex = nextOrder.findIndex(
    (currentDrinkId) =>
      compareActiveDrinkIds(drinkId, currentDrinkId, counts, drinkCatalogIndexById) < 0,
  );

  if (insertIndex === -1) {
    return [...nextOrder, drinkId];
  }

  return [...nextOrder.slice(0, insertIndex), drinkId, ...nextOrder.slice(insertIndex)];
}

function compareActiveDrinkIds(
  leftId: DrinkId,
  rightId: DrinkId,
  counts: DrinkCounts,
  drinkCatalogIndexById: ReadonlyMap<string, number>,
): number {
  const countDifference = getDrinkCount(counts, rightId) - getDrinkCount(counts, leftId);

  if (countDifference !== 0) {
    return countDifference;
  }

  const leftIndex = drinkCatalogIndexById.get(leftId);
  const rightIndex = drinkCatalogIndexById.get(rightId);

  if (leftIndex !== undefined && rightIndex !== undefined) {
    return leftIndex - rightIndex;
  }

  if (leftIndex !== undefined) {
    return -1;
  }

  if (rightIndex !== undefined) {
    return 1;
  }

  return drinkNameCollator.compare(leftId, rightId);
}

function createSelectedGuestDrinkTally(
  drinkId: DrinkId,
  count: number,
  drinkCatalog: ReadonlyArray<DrinkCatalogEntry>,
): SelectedGuestDrinkTally {
  const drink = getDrinkById(drinkCatalog, drinkId);

  return {
    id: drink.id,
    name: drink.name,
    count,
    displayPrice: formatEuroPrice(drink.priceCents),
  };
}

function createAvailableDrinkReferences(
  counts: DrinkCounts,
  drinkCatalog: ReadonlyArray<DrinkCatalogEntry>,
): AvailableDrinkReference[] {
  return [...drinkCatalog]
    .filter((drink) => drink.isActive && getDrinkCount(counts, drink.id) === 0)
    .sort((left, right) => drinkNameCollator.compare(left.name, right.name))
    .map((drink) => ({
      id: drink.id,
      name: drink.name,
      displayPrice: formatEuroPrice(drink.priceCents),
    }));
}

function createHostDrinkCatalogItems(
  drinkCatalog: ReadonlyArray<DrinkCatalogEntry>,
  guestTabs: ReadonlyArray<GuestTab>,
): HostDrinkCatalogItem[] {
  return [...drinkCatalog]
    .sort((left, right) => {
      if (left.isActive !== right.isActive) {
        return left.isActive ? -1 : 1;
      }

      return drinkNameCollator.compare(left.name, right.name);
    })
    .map((drink) => {
      const openGuestCount = countOpenGuestsUsingDrink(guestTabs, drink.id);
      const openDrinkCount = guestTabs.reduce(
        (total, guest) => total + getDrinkCount(guest.counts, drink.id),
        0,
      );

      return {
        id: drink.id,
        name: drink.name,
        priceCents: drink.priceCents,
        displayPrice: formatEuroPrice(drink.priceCents),
        isActive: drink.isActive,
        openGuestCount,
        openDrinkCount,
        canRemove: drink.isActive && openGuestCount === 0,
      };
    });
}

function countOpenGuestsUsingDrink(guestTabs: ReadonlyArray<GuestTab>, drinkId: string): number {
  return guestTabs.reduce(
    (total, guest) => total + (getDrinkCount(guest.counts, drinkId) > 0 ? 1 : 0),
    0,
  );
}

function getCountedDrinkIds(
  counts: DrinkCounts,
  drinkCatalog: ReadonlyArray<DrinkCatalogEntry>,
): DrinkId[] {
  const knownDrinkIds = drinkCatalog
    .filter((drink) => getDrinkCount(counts, drink.id) > 0)
    .map((drink) => drink.id);
  const knownDrinkIdSet = new Set(knownDrinkIds);
  const unknownDrinkIds = Object.keys(counts)
    .filter((drinkId) => getDrinkCount(counts, drinkId) > 0 && !knownDrinkIdSet.has(drinkId))
    .sort((left, right) => drinkNameCollator.compare(left, right));

  return [...knownDrinkIds, ...unknownDrinkIds];
}

function getDrinkCount(counts: DrinkCounts, drinkId: string): number {
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

function createDrinkCatalogIndexById(
  drinkCatalog: ReadonlyArray<DrinkCatalogEntry>,
): ReadonlyMap<string, number> {
  return new Map(drinkCatalog.map((drink, index) => [drink.id, index]));
}

function readPersistedDrinkCatalog(): DrinkCatalogEntry[] {
  const storage = getStorage();

  if (!storage) {
    return createDefaultDrinkCatalog();
  }

  const rawDrinkCatalog = storage.getItem(DRINK_CATALOG_STORAGE_KEY);

  if (!rawDrinkCatalog) {
    return createDefaultDrinkCatalog();
  }

  try {
    return normalizeDrinkCatalog(JSON.parse(rawDrinkCatalog));
  } catch {
    return createDefaultDrinkCatalog();
  }
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

function readPersistedBilledGuestTabs(): BilledGuestTab[] {
  const storage = getStorage();

  if (!storage) {
    return [];
  }

  const rawBilledGuestTabs = storage.getItem(BILLED_GUEST_TABS_STORAGE_KEY);

  if (!rawBilledGuestTabs) {
    return [];
  }

  try {
    return normalizeBilledGuestTabs(JSON.parse(rawBilledGuestTabs));
  } catch {
    return [];
  }
}

function normalizeDrinkCatalog(value: unknown): DrinkCatalogEntry[] {
  if (!Array.isArray(value)) {
    return createDefaultDrinkCatalog();
  }

  const seenIds = new Set<string>();
  const timestamp = createTimestamp();
  const normalizedDrinkCatalog = value.flatMap((entry, index) => {
    const normalizedEntry = normalizeDrinkCatalogEntry(entry, index, timestamp);

    if (!normalizedEntry || seenIds.has(normalizedEntry.id)) {
      return [];
    }

    seenIds.add(normalizedEntry.id);
    return [normalizedEntry];
  });

  return normalizedDrinkCatalog.length ? normalizedDrinkCatalog : createDefaultDrinkCatalog();
}

function normalizeDrinkCatalogEntry(
  value: unknown,
  index: number,
  fallbackTimestamp: string,
): DrinkCatalogEntry | null {
  if (!value || typeof value !== 'object') {
    return null;
  }

  const drink = value as Record<string, unknown>;
  const name = normalizeDisplayText(drink['name']);

  if (!name) {
    return null;
  }

  return {
    id: normalizeId(drink['id']) ?? createDrinkCatalogId(name, index),
    name,
    priceCents: normalizePriceCents(drink['priceCents']) ?? 0,
    isActive: normalizeBoolean(drink['isActive'], true),
    createdAt: normalizeTimestamp(drink['createdAt'], fallbackTimestamp),
    updatedAt: normalizeTimestamp(drink['updatedAt'], fallbackTimestamp),
  };
}

function normalizeGuestTabs(value: unknown): GuestTab[] {
  if (!Array.isArray(value)) {
    return [];
  }

  const seenIds = new Set<string>();

  return value
    .map((guestTab) => normalizeGuestTab(guestTab))
    .filter((guestTab): guestTab is GuestTab => {
      if (!guestTab || seenIds.has(guestTab.id)) {
        return false;
      }

      seenIds.add(guestTab.id);
      return true;
    });
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

function normalizeBilledGuestTabs(value: unknown): BilledGuestTab[] {
  if (!Array.isArray(value)) {
    return [];
  }

  const seenIds = new Set<string>();

  return value
    .map((guestTab) => normalizeBilledGuestTab(guestTab))
    .filter((guestTab): guestTab is BilledGuestTab => {
      if (!guestTab || seenIds.has(guestTab.id)) {
        return false;
      }

      seenIds.add(guestTab.id);
      return true;
    });
}

function normalizeBilledGuestTab(value: unknown): BilledGuestTab | null {
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
  const lineItems = normalizeBillLineItems(guestTab['lineItems']);

  return {
    id: normalizeId(guestTab['id']) ?? createGuestTabId(),
    roomNumber,
    fullName,
    lineItems,
    totalCount: normalizeCountValue(
      guestTab['totalCount'] ?? lineItems.reduce((total, lineItem) => total + lineItem.count, 0),
    ),
    totalPriceCents:
      normalizePriceCents(
        guestTab['totalPriceCents'] ??
          lineItems.reduce((total, lineItem) => total + lineItem.totalPriceCents, 0),
      ) ?? 0,
    createdAt: normalizeTimestamp(guestTab['createdAt'], timestamp),
    updatedAt: normalizeTimestamp(guestTab['updatedAt'], timestamp),
    billedAt: normalizeTimestamp(guestTab['billedAt'], timestamp),
  };
}

function normalizeBillLineItems(value: unknown): GuestBillLineItem[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((lineItem) => normalizeBillLineItem(lineItem))
    .filter((lineItem): lineItem is GuestBillLineItem => lineItem !== null);
}

function normalizeBillLineItem(value: unknown): GuestBillLineItem | null {
  if (!value || typeof value !== 'object') {
    return null;
  }

  const lineItem = value as Record<string, unknown>;
  const name = normalizeDisplayText(lineItem['name']);
  const count = normalizeCountValue(lineItem['count']);
  const unitPriceCents = normalizePriceCents(lineItem['unitPriceCents']) ?? 0;

  if (!name || count <= 0) {
    return null;
  }

  return {
    id: normalizeId(lineItem['id']) ?? createDrinkCatalogId(name),
    name,
    count,
    unitPriceCents,
    totalPriceCents: normalizePriceCents(lineItem['totalPriceCents']) ?? count * unitPriceCents,
  };
}

function normalizeCounts(value: unknown): DrinkCounts {
  if (!value || typeof value !== 'object') {
    return {};
  }

  const persistedCounts = value as Record<string, unknown>;
  const counts: DrinkCounts = {};

  for (const [drinkId, countValue] of Object.entries(persistedCounts)) {
    const normalizedDrinkId = normalizeId(drinkId);
    const normalizedCount = normalizeCountValue(countValue);

    if (!normalizedDrinkId || normalizedCount <= 0) {
      continue;
    }

    counts[normalizedDrinkId] = normalizedCount;
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

function normalizeBoolean(value: unknown, fallback: boolean): boolean {
  return typeof value === 'boolean' ? value : fallback;
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

function normalizePriceCents(value: unknown): number | null {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    return null;
  }

  return Math.max(0, Math.round(value));
}

function formatEuroPrice(priceCents: number): string {
  return `€${(priceCents / 100).toFixed(2)}`;
}

function formatBilledTimestamp(timestamp: string): string {
  const parsed = Date.parse(timestamp);

  if (Number.isNaN(parsed)) {
    return timestamp;
  }

  return billedTimestampFormatter.format(parsed);
}

function findDrinkById(
  drinkCatalog: ReadonlyArray<DrinkCatalogEntry>,
  drinkId: DrinkId,
): DrinkCatalogEntry | null {
  return drinkCatalog.find((entry) => entry.id === drinkId) ?? null;
}

function getDrinkById(
  drinkCatalog: ReadonlyArray<DrinkCatalogEntry>,
  drinkId: DrinkId,
): DrinkCatalogEntry {
  return (
    findDrinkById(drinkCatalog, drinkId) ?? {
      id: drinkId,
      name: humanizeDrinkId(drinkId),
      priceCents: 0,
      isActive: false,
      createdAt: '',
      updatedAt: '',
    }
  );
}

function humanizeDrinkId(drinkId: string): string {
  return drinkId
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/[-_]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/\b\w/g, (match) => match.toUpperCase());
}

function createGuestTabId(): string {
  return createRecordId('guest');
}

function createDrinkCatalogId(name: string, suffixSeed?: number): string {
  const slug = normalizeDisplayText(name)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 24);
  const baseId = slug || 'drink';

  if (typeof suffixSeed === 'number') {
    return `${baseId}-${suffixSeed}`;
  }

  return `${baseId}-${createRecordId('catalog').slice(-8)}`;
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

function createDefaultDrinkCatalog(): DrinkCatalogEntry[] {
  const timestamp = createTimestamp();

  return DRINK_CATALOG.map((drink) => ({
    ...drink,
    isActive: true,
    createdAt: timestamp,
    updatedAt: timestamp,
  }));
}

function persistDrinkCatalog(drinkCatalog: DrinkCatalogEntry[]): void {
  const storage = getStorage();

  if (!storage) {
    return;
  }

  try {
    storage.setItem(DRINK_CATALOG_STORAGE_KEY, JSON.stringify(drinkCatalog));
  } catch {
    // Ignore storage failures so the tally still works in restricted contexts.
  }
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

function persistBilledGuestTabs(guestTabs: BilledGuestTab[]): void {
  const storage = getStorage();

  if (!storage) {
    return;
  }

  try {
    storage.setItem(BILLED_GUEST_TABS_STORAGE_KEY, JSON.stringify(guestTabs));
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
