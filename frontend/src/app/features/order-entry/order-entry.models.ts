import { calculateGuestTotalPriceCents } from '../billing-history';
import { DrinkCatalogEntry, DrinkId, formatEuroPrice, getDrinkById } from '../catalog';
import { GuestTab, countDrinks, getDrinkCount, roomNumbersMatch } from '../guest-tabs';
import { Room } from '../rooms';

export type RoomListItemViewModel = Room & {
  openGuestCount: number;
};

export type RoomGuestViewModel = GuestTab & {
  totalCount: number;
  totalPriceCents: number;
  displayTotalPrice: string;
};

export type SelectedGuestOrderDrinkViewModel = {
  id: DrinkId;
  name: string;
  count: number;
  displayPrice: string;
  displayLineTotal: string;
};

export type AvailableDrinkViewModel = {
  id: DrinkId;
  name: string;
  displayPrice: string;
};

export type SelectedGuestOrderLineItemViewModel = {
  id: DrinkId;
  name: string;
  count: number;
  displayUnitPrice: string;
  displayLineTotal: string;
};

export type SelectedGuestOrderViewModel = RoomGuestViewModel & {
  drinks: SelectedGuestOrderDrinkViewModel[];
  availableDrinks: AvailableDrinkViewModel[];
  lineItems: SelectedGuestOrderLineItemViewModel[];
};

const fullNameCollator = new Intl.Collator(undefined, {
  sensitivity: 'base',
});

export function createRoomListItemViewModels(
  rooms: ReadonlyArray<Room>,
  guestTabs: ReadonlyArray<GuestTab>,
): RoomListItemViewModel[] {
  return rooms.map((room) => ({
    ...room,
    openGuestCount: guestTabs.reduce(
      (total, guest) => total + (roomNumbersMatch(guest.roomNumber, room.roomNumber) ? 1 : 0),
      0,
    ),
  }));
}

export function createRoomGuestViewModels(
  roomNumber: string,
  guestTabs: ReadonlyArray<GuestTab>,
  drinkCatalog: ReadonlyArray<DrinkCatalogEntry>,
): RoomGuestViewModel[] {
  return guestTabs
    .filter((guest) => roomNumbersMatch(guest.roomNumber, roomNumber))
    .sort((left, right) => fullNameCollator.compare(left.fullName, right.fullName))
    .map((guest) => createRoomGuestViewModel(guest, drinkCatalog));
}

export function createSelectedGuestOrderViewModel(
  guest: GuestTab,
  drinkCatalog: ReadonlyArray<DrinkCatalogEntry>,
): SelectedGuestOrderViewModel {
  const drinks = guest.drinkOrder
    .filter((drinkId) => getDrinkCount(guest.counts, drinkId) > 0)
    .map((drinkId) => {
      const drink = getDrinkById(drinkCatalog, drinkId);
      const count = getDrinkCount(guest.counts, drink.id);

      return {
        id: drink.id,
        name: drink.name,
        count,
        displayPrice: formatEuroPrice(drink.priceCents),
        displayLineTotal: formatEuroPrice(count * drink.priceCents),
      };
    });

  return {
    ...createRoomGuestViewModel(guest, drinkCatalog),
    drinks,
    availableDrinks: drinkCatalog
      .filter((drink) => drink.isActive && getDrinkCount(guest.counts, drink.id) === 0)
      .map((drink) => ({
        id: drink.id,
        name: drink.name,
        displayPrice: formatEuroPrice(drink.priceCents),
      })),
    lineItems: drinks.map((drink) => ({
      id: drink.id,
      name: drink.name,
      count: drink.count,
      displayUnitPrice: drink.displayPrice,
      displayLineTotal: drink.displayLineTotal,
    })),
  };
}

function createRoomGuestViewModel(
  guest: GuestTab,
  drinkCatalog: ReadonlyArray<DrinkCatalogEntry>,
): RoomGuestViewModel {
  const totalPriceCents = calculateGuestTotalPriceCents(guest.counts, drinkCatalog);

  return {
    ...guest,
    totalCount: countDrinks(guest.counts),
    totalPriceCents,
    displayTotalPrice: formatEuroPrice(totalPriceCents),
  };
}
