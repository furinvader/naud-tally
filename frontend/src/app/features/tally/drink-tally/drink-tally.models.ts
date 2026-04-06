import {
  DrinkCatalogEntry,
  DrinkId,
  formatEuroPrice,
  getDrinkById,
} from '../../catalog/catalog.store';
import { calculateGuestTotalPriceCents } from '../../billing-history/billing-history.store';
import { DrinkCounts, GuestTab, countDrinks, getDrinkCount } from '../../guest-tabs/guest-tabs.store';

export type AddGuestStep = 'closed' | 'roomNumber' | 'fullName';

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

const drinkNameCollator = new Intl.Collator(undefined, {
  sensitivity: 'base',
});

export function createGuestCardViewModel(
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

export function createSelectedGuestViewModel(
  guest: GuestTab,
  selectedGuestDrinkOrder: ReadonlyArray<DrinkId>,
  drinkCatalog: ReadonlyArray<DrinkCatalogEntry>,
): SelectedGuestViewModel {
  return {
    ...createGuestCardViewModel(guest, drinkCatalog),
    activeDrinkTallies: normalizeSelectedGuestDrinkOrder(
      guest.counts,
      selectedGuestDrinkOrder,
      drinkCatalog,
    ).map((drinkId) =>
      createSelectedGuestDrinkTally(drinkId, getDrinkCount(guest.counts, drinkId), drinkCatalog),
    ),
    availableDrinks: createAvailableDrinkReferences(guest.counts, drinkCatalog),
  };
}

export function createSelectedGuestDrinkOrder(
  counts: DrinkCounts,
  drinkCatalog: ReadonlyArray<DrinkCatalogEntry>,
): DrinkId[] {
  const drinkCatalogIndexById = createDrinkCatalogIndexById(drinkCatalog);

  return getCountedDrinkIds(counts, drinkCatalog).sort((leftId, rightId) =>
    compareActiveDrinkIds(leftId, rightId, counts, drinkCatalogIndexById),
  );
}

export function updateSelectedGuestDrinkOrder(
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

function setDrinkCount(counts: DrinkCounts, drinkId: string, count: number): DrinkCounts {
  const normalizedCount = Math.max(0, Math.trunc(Number.isFinite(count) ? count : 0));
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
