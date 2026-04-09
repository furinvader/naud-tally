import { calculateGuestTotalPriceCents } from '../billing-history';
import { DrinkCatalogEntry, formatEuroPrice } from '../catalog';
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
  id: string;
  name: string;
  count: number;
  displayPrice: string;
};

export type SelectedGuestOrderViewModel = RoomGuestViewModel & {
  drinks: SelectedGuestOrderDrinkViewModel[];
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
  return {
    ...createRoomGuestViewModel(guest, drinkCatalog),
    drinks: drinkCatalog
      .filter((drink) => drink.isActive)
      .map((drink) => ({
        id: drink.id,
        name: drink.name,
        count: getDrinkCount(guest.counts, drink.id),
        displayPrice: formatEuroPrice(drink.priceCents),
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
