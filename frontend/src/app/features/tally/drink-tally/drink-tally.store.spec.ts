import { TestBed } from '@angular/core/testing';

import {
  DRINK_CATALOG,
  DRINK_TALLY_STORAGE_KEY,
  DrinkCounts,
  DrinkTallyStore,
} from './drink-tally.store';

describe('DrinkTallyStore', () => {
  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({});
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should initialize with priced drinks, no selected guest, and no guest tabs', () => {
    const store = TestBed.inject(DrinkTallyStore);

    expect(store.toolbarDrinkReferences().map((drink) => drink.displayPrice)).toEqual([
      '€2.00',
      '€2.50',
      '€3.00',
      '€3.00',
      '€3.00',
      '€3.00',
      '€3.50',
      '€4.50',
      '€5.00',
    ]);
    expect(store.activeGuests()).toEqual([]);
    expect(store.selectedGuest()).toBeNull();
    expect(store.addGuestFlow().step).toBe('closed');
    expect(store.publicTotalCount()).toBe(0);
  });

  it('should create a guest through the room-number then full-name flow', () => {
    const store = TestBed.inject(DrinkTallyStore);

    store.startAddGuestFlow();
    store.updateDraftRoomNumber(' 204 ');
    store.submitRoomNumber();
    store.updateDraftFullName(' Grace Hopper ');
    store.submitGuestIdentity();

    expect(store.activeGuestCount()).toBe(1);
    expect(store.selectedGuest()?.roomNumber).toBe('204');
    expect(store.selectedGuest()?.fullName).toBe('Grace Hopper');
    expect(store.selectedGuest()?.totalCount).toBe(0);
    expect(store.selectedGuest()?.activeDrinkTallies).toEqual([]);
    expect(store.selectedGuest()?.availableDrinks.map((drink) => drink.name)).toEqual([
      'Apple Juice',
      'Beer',
      'Cola',
      'Cola Zero',
      'Lemon Soda',
      'Orange Soda',
      'Sparkling Water',
      'Water',
      'White Wine',
    ]);
    expect(localStorage.getItem(DRINK_TALLY_STORAGE_KEY)).toContain('"roomNumber":"204"');
  });

  it('should reuse an existing guest when the same normalized identity is submitted again', () => {
    const store = TestBed.inject(DrinkTallyStore);

    store.startAddGuestFlow();
    store.updateDraftRoomNumber('101');
    store.submitRoomNumber();
    store.updateDraftFullName('Ada Lovelace');
    store.submitGuestIdentity();

    const originalGuestId = store.selectedGuest()?.id;

    store.closeSelectedGuestTab();
    store.startAddGuestFlow();
    store.updateDraftRoomNumber(' 101 ');
    store.submitRoomNumber();
    store.updateDraftFullName(' ada    lovelace ');
    store.submitGuestIdentity();

    expect(store.activeGuestCount()).toBe(1);
    expect(store.selectedGuest()?.id).toBe(originalGuestId);
    expect(store.selectedGuest()?.fullName).toBe('Ada Lovelace');
  });

  it('should update only the selected guest counts', () => {
    const store = TestBed.inject(DrinkTallyStore);

    createGuest(store, '101', 'Ada Lovelace');
    const firstGuestId = store.selectedGuest()?.id;

    createGuest(store, '102', 'Grace Hopper');
    const secondGuestId = store.selectedGuest()?.id;

    store.incrementDrink('beer');
    store.incrementDrink('water');
    store.selectGuestTab(firstGuestId!);
    store.incrementDrink('cola');

    const firstGuest = store.activeGuests().find((guest) => guest.id === firstGuestId);
    const secondGuest = store.activeGuests().find((guest) => guest.id === secondGuestId);

    expect(firstGuest?.totalCount).toBe(1);
    expect(firstGuest?.drinkSummary).toEqual([{ id: 'cola', name: 'Cola', count: 1 }]);
    expect(secondGuest?.totalCount).toBe(2);
    expect(secondGuest?.drinkSummary).toEqual([
      { id: 'water', name: 'Water', count: 1 },
      { id: 'beer', name: 'Beer', count: 1 },
    ]);
    expect(store.publicTotalCount()).toBe(3);
  });

  it('should add an available drink at count one and remove it from the add-drink list', () => {
    const store = TestBed.inject(DrinkTallyStore);

    createGuest(store, '101', 'Ada Lovelace');
    store.incrementDrink('whiteWine');

    expect(store.selectedGuest()?.activeDrinkTallies).toEqual([
      { id: 'whiteWine', name: 'White Wine', count: 1, displayPrice: '€5.00' },
    ]);
    expect(store.selectedGuest()?.availableDrinks.some((drink) => drink.id === 'whiteWine')).toBe(
      false,
    );
  });

  it('should remove a drink from the active list when its count returns to zero', () => {
    const store = TestBed.inject(DrinkTallyStore);

    createGuest(store, '101', 'Ada Lovelace');
    store.incrementDrink('beer');
    store.decrementDrink('beer');

    expect(store.selectedGuest()?.activeDrinkTallies).toEqual([]);
    expect(store.selectedGuest()?.availableDrinks.some((drink) => drink.id === 'beer')).toBe(true);
  });

  it('should deselect the active guest when it is selected again', () => {
    localStorage.setItem(
      DRINK_TALLY_STORAGE_KEY,
      JSON.stringify([
        {
          id: 'guest-1',
          roomNumber: '210',
          fullName: 'Ada Lovelace',
          counts: buildCounts({ water: 1 }),
          createdAt: '2026-04-01T08:00:00.000Z',
          updatedAt: '2026-04-01T10:00:00.000Z',
        },
        {
          id: 'guest-2',
          roomNumber: '101',
          fullName: 'Grace Hopper',
          counts: buildCounts({ beer: 1 }),
          createdAt: '2026-04-01T08:30:00.000Z',
          updatedAt: '2026-04-01T09:00:00.000Z',
        },
      ]),
    );

    const store = TestBed.inject(DrinkTallyStore);

    expect(store.activeGuests().map((guest) => guest.id)).toEqual([
      'guest-2',
      'guest-1',
    ]);

    store.selectGuestTab('guest-1');
    store.incrementDrink('beer');
    store.selectGuestTab('guest-1');

    expect(store.selectedGuest()).toBeNull();
    expect(store.activeGuests().map((guest) => guest.id)).toEqual([
      'guest-1',
      'guest-2',
    ]);
    expect(store.activeGuests().find((guest) => guest.id === 'guest-1')?.totalCount).toBe(2);
  });

  it('should keep active drink ordering stable while selected and re-sort it when reopened', () => {
    localStorage.setItem(
      DRINK_TALLY_STORAGE_KEY,
      JSON.stringify([
        {
          id: 'guest-1',
          roomNumber: '101',
          fullName: 'Ada Lovelace',
          counts: buildCounts({ water: 1, beer: 2 }),
          createdAt: '2026-04-01T08:00:00.000Z',
          updatedAt: '2026-04-01T10:00:00.000Z',
        },
      ]),
    );

    const store = TestBed.inject(DrinkTallyStore);

    store.selectGuestTab('guest-1');

    expect(store.selectedGuest()?.activeDrinkTallies.map((drink) => drink.id)).toEqual([
      'beer',
      'water',
    ]);

    store.incrementDrink('water');
    store.incrementDrink('water');

    expect(store.selectedGuest()?.activeDrinkTallies.map((drink) => drink.id)).toEqual([
      'beer',
      'water',
    ]);

    store.closeSelectedGuestTab();
    store.selectGuestTab('guest-1');

    expect(store.selectedGuest()?.activeDrinkTallies.map((drink) => drink.id)).toEqual([
      'water',
      'beer',
    ]);
  });

  it('should keep guest ordering stable while tallying and sort finalized tabs by drinks then room number', () => {
    localStorage.setItem(
      DRINK_TALLY_STORAGE_KEY,
      JSON.stringify([
        {
          id: 'guest-1',
          roomNumber: '210',
          fullName: 'Ada Lovelace',
          counts: buildCounts({ water: 1 }),
          createdAt: '2026-04-01T08:00:00.000Z',
          updatedAt: '2026-04-01T10:00:00.000Z',
        },
        {
          id: 'guest-2',
          roomNumber: '101',
          fullName: 'Grace Hopper',
          counts: buildCounts({ beer: 1 }),
          createdAt: '2026-04-01T08:30:00.000Z',
          updatedAt: '2026-04-01T09:00:00.000Z',
        },
        {
          id: 'guest-3',
          roomNumber: '305',
          fullName: 'Katherine Johnson',
          counts: buildCounts({ water: 2, beer: 1 }),
          createdAt: '2026-04-01T08:45:00.000Z',
          updatedAt: '2026-04-01T08:50:00.000Z',
        },
      ]),
    );

    const store = TestBed.inject(DrinkTallyStore);

    expect(store.activeGuests().map((guest) => guest.id)).toEqual([
      'guest-3',
      'guest-2',
      'guest-1',
    ]);

    store.selectGuestTab('guest-1');
    store.incrementDrink('beer');

    expect(store.activeGuests().map((guest) => guest.id)).toEqual([
      'guest-3',
      'guest-2',
      'guest-1',
    ]);

    store.closeSelectedGuestTab();

    expect(store.activeGuests().map((guest) => guest.id)).toEqual([
      'guest-3',
      'guest-1',
      'guest-2',
    ]);
  });

  it('should restore persisted guests and counts without restoring a selection', () => {
    localStorage.setItem(
      DRINK_TALLY_STORAGE_KEY,
      JSON.stringify([
        {
          id: 'guest-1',
          roomNumber: '301',
          fullName: 'Alan Turing',
          counts: buildCounts({ water: 2, beer: 1 }),
          createdAt: '2026-04-01T08:00:00.000Z',
          updatedAt: '2026-04-02T10:00:00.000Z',
        },
      ]),
    );

    const store = TestBed.inject(DrinkTallyStore);

    expect(store.activeGuestCount()).toBe(1);
    expect(store.activeGuests()[0]?.totalCount).toBe(3);
    expect(store.selectedGuest()).toBeNull();
    expect(store.addGuestFlow().step).toBe('closed');
    expect(store.publicTotalCount()).toBe(3);
  });
});

function createGuest(
  store: {
    startAddGuestFlow(): void;
    updateDraftRoomNumber(roomNumber: string): void;
    submitRoomNumber(): void;
    updateDraftFullName(fullName: string): void;
    submitGuestIdentity(): void;
  },
  roomNumber: string,
  fullName: string,
): void {
  store.startAddGuestFlow();
  store.updateDraftRoomNumber(roomNumber);
  store.submitRoomNumber();
  store.updateDraftFullName(fullName);
  store.submitGuestIdentity();
}

function buildCounts(overrides: Partial<DrinkCounts>): DrinkCounts {
  return DRINK_CATALOG.reduce(
    (counts, drink) => {
      counts[drink.id] = overrides[drink.id] ?? 0;
      return counts;
    },
    {} as DrinkCounts,
  );
}
