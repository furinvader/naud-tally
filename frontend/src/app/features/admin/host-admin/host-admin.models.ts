import { DrinkCatalogEntry, DrinkId, formatEuroPrice } from '../../catalog';
import {
  BilledGuestTab,
  GuestBillLineItem,
  calculateGuestTotalPriceCents,
  createBillLineItems,
} from '../../billing-history';
import { GuestTab, countDrinks, getDrinkCount } from '../../guest-tabs';

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

export type OpenGuestBillViewModel = GuestTab & {
  totalCount: number;
  totalPriceCents: number;
  displayTotalPrice: string;
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

const billedTimestampFormatter = new Intl.DateTimeFormat(undefined, {
  month: 'short',
  day: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
});

const drinkNameCollator = new Intl.Collator(undefined, {
  sensitivity: 'base',
});

export function createHostDrinkCatalogItems(
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

export function createOpenGuestBillViewModel(
  guest: GuestTab,
  drinkCatalog: ReadonlyArray<DrinkCatalogEntry>,
): OpenGuestBillViewModel {
  const lineItems = createGuestBillLineItemViewModels(createBillLineItems(guest.counts, drinkCatalog));
  const totalPriceCents = lineItems.reduce(
    (total, lineItem) => total + lineItem.totalPriceCents,
    0,
  );

  return {
    ...guest,
    totalCount: countDrinks(guest.counts),
    totalPriceCents,
    displayTotalPrice: formatEuroPrice(totalPriceCents),
    lineItems,
  };
}

export function createBilledGuestBillViewModel(
  guest: BilledGuestTab,
): BilledGuestBillViewModel {
  return {
    ...guest,
    lineItems: createGuestBillLineItemViewModels(guest.lineItems),
    displayTotalPrice: formatEuroPrice(guest.totalPriceCents),
    displayBilledAt: formatBilledTimestamp(guest.billedAt),
  };
}

export function createHostSummaryViewModel(
  drinkCatalog: ReadonlyArray<DrinkCatalogEntry>,
  guestTabs: ReadonlyArray<GuestTab>,
  billedGuestTabs: ReadonlyArray<BilledGuestTab>,
): HostSummaryViewModel {
  const activeDrinkCount = drinkCatalog.filter((drink) => drink.isActive).length;
  const removedDrinkCount = drinkCatalog.length - activeDrinkCount;
  const openGuestCount = guestTabs.length;
  const billedGuestCount = billedGuestTabs.length;
  const pendingTotalCents = guestTabs.reduce(
    (total, guest) => total + calculateGuestTotalPriceCents(guest.counts, drinkCatalog),
    0,
  );
  const billedTotalCents = billedGuestTabs.reduce(
    (total, guest) => total + guest.totalPriceCents,
    0,
  );

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
}

export function countOpenGuestsUsingDrink(
  guestTabs: ReadonlyArray<GuestTab>,
  drinkId: string,
): number {
  return guestTabs.reduce(
    (total, guest) => total + (getDrinkCount(guest.counts, drinkId) > 0 ? 1 : 0),
    0,
  );
}

function createGuestBillLineItemViewModels(
  lineItems: ReadonlyArray<GuestBillLineItem>,
): GuestBillLineItemViewModel[] {
  return lineItems.map((lineItem) => ({
    ...lineItem,
    displayUnitPrice: formatEuroPrice(lineItem.unitPriceCents),
    displayTotalPrice: formatEuroPrice(lineItem.totalPriceCents),
  }));
}

function formatBilledTimestamp(timestamp: string): string {
  const parsed = Date.parse(timestamp);

  if (Number.isNaN(parsed)) {
    return timestamp;
  }

  return billedTimestampFormatter.format(parsed);
}
