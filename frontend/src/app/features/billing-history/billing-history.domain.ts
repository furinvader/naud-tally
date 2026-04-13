import { DrinkCatalogEntry, DrinkId, getDrinkById } from '../catalog';
import { DrinkCounts, GuestTab, countDrinks, getDrinkCount } from '../guest-tabs';

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

const roomNumberCollator = new Intl.Collator(undefined, {
  numeric: true,
  sensitivity: 'base',
});

const drinkNameCollator = new Intl.Collator(undefined, {
  sensitivity: 'base',
});

export function createBillLineItems(
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

export function calculateGuestTotalPriceCents(
  counts: DrinkCounts,
  drinkCatalog: ReadonlyArray<DrinkCatalogEntry>,
): number {
  return createBillLineItems(counts, drinkCatalog).reduce(
    (total, lineItem) => total + lineItem.totalPriceCents,
    0,
  );
}

export function sortBilledGuestTabs(guestTabs: ReadonlyArray<BilledGuestTab>): BilledGuestTab[] {
  return [...guestTabs].sort((left, right) => {
    const timestampDifference = Date.parse(right.billedAt) - Date.parse(left.billedAt);

    if (!Number.isNaN(timestampDifference) && timestampDifference !== 0) {
      return timestampDifference;
    }

    return roomNumberCollator.compare(left.roomNumber, right.roomNumber);
  });
}

export function createBilledGuestTab(
  guest: GuestTab,
  drinkCatalog: ReadonlyArray<DrinkCatalogEntry>,
): BilledGuestTab {
  const billedAt = createTimestamp();
  const lineItems = createBillLineItems(guest.counts, drinkCatalog);
  const totalPriceCents = lineItems.reduce(
    (total, lineItem) => total + lineItem.totalPriceCents,
    0,
  );

  return {
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

function createTimestamp(): string {
  return new Date().toISOString();
}
