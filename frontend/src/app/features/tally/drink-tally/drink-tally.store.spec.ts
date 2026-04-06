import { TestBed } from '@angular/core/testing';

import {
  BILLED_GUEST_TABS_STORAGE_KEY,
  DRINK_CATALOG,
  DRINK_CATALOG_STORAGE_KEY,
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

  it('should initialize with priced drinks and no guest tabs', () => {
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
    expect(store.publicTotalCount()).toBe(0);
  });

  it('should create a guest tab and persist it', () => {
    const store = TestBed.inject(DrinkTallyStore);

    const guest = store.ensureGuestTab(' 204 ', ' Grace Hopper ');

    expect(guest?.roomNumber).toBe('204');
    expect(guest?.fullName).toBe('Grace Hopper');
    expect(store.activeGuestCount()).toBe(1);
    expect(localStorage.getItem(DRINK_TALLY_STORAGE_KEY)).toContain('"roomNumber":"204"');
  });

  it('should reuse an existing guest when the normalized identity already exists', () => {
    const store = TestBed.inject(DrinkTallyStore);

    const firstGuest = store.ensureGuestTab('101', 'Ada Lovelace');
    const secondGuest = store.ensureGuestTab(' 101 ', ' ada    lovelace ');

    expect(firstGuest?.id).toBe(secondGuest?.id);
    expect(store.activeGuestCount()).toBe(1);
  });

  it('should update only the targeted guest counts', () => {
    const store = TestBed.inject(DrinkTallyStore);

    const firstGuestId = store.ensureGuestTab('101', 'Ada Lovelace')?.id;
    const secondGuestId = store.ensureGuestTab('102', 'Grace Hopper')?.id;

    store.updateGuestDrinkCount(secondGuestId!, 'beer', 1);
    store.updateGuestDrinkCount(secondGuestId!, 'water', 1);
    store.updateGuestDrinkCount(firstGuestId!, 'cola', 1);

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

  it('should remove a drink from the guest counts when its tally returns to zero', () => {
    const store = TestBed.inject(DrinkTallyStore);

    const guestId = store.ensureGuestTab('101', 'Ada Lovelace')?.id;

    store.updateGuestDrinkCount(guestId!, 'beer', 1);
    store.updateGuestDrinkCount(guestId!, 'beer', -1);

    expect(store.activeGuests()[0]?.drinkSummary).toEqual([]);
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

    store.updateGuestDrinkCount('guest-1', 'beer', 1);

    expect(store.activeGuests().map((guest) => guest.id)).toEqual([
      'guest-3',
      'guest-2',
      'guest-1',
    ]);

    store.finalizeGuestTab('guest-1');

    expect(store.activeGuests().map((guest) => guest.id)).toEqual([
      'guest-3',
      'guest-1',
      'guest-2',
    ]);
  });

  it('should restore persisted guests and counts', () => {
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
    expect(store.publicTotalCount()).toBe(3);
  });

  it('should add a drink to the live catalog and make it available to open tabs', () => {
    const store = TestBed.inject(DrinkTallyStore);
    const guestId = store.ensureGuestTab('101', 'Ada Lovelace')?.id;

    expect(store.addDrink('Iced Tea', 420)).toEqual({
      ok: true,
      action: 'added',
      drinkId: expect.any(String),
    });
    expect(store.activeGuests().find((guest) => guest.id === guestId)?.drinkSummary).toEqual([]);
    expect(store.hostDrinkCatalog().map((drink) => drink.name)).toContain('Iced Tea');
    expect(localStorage.getItem(DRINK_CATALOG_STORAGE_KEY)).toContain('"name":"Iced Tea"');
  });

  it('should remove only unused drinks from the guest catalog', () => {
    const store = TestBed.inject(DrinkTallyStore);
    const guestId = store.ensureGuestTab('101', 'Ada Lovelace')?.id;

    store.updateGuestDrinkCount(guestId!, 'beer', 1);

    expect(store.removeDrink('beer')).toBe(false);
    expect(store.removeDrink('sparklingWater')).toBe(true);
    expect(store.toolbarDrinkReferences().map((drink) => drink.name)).not.toContain(
      'Sparkling Water',
    );
  });

  it('should bill a guest tab and move it into billed history', () => {
    const store = TestBed.inject(DrinkTallyStore);
    const guestId = store.ensureGuestTab('101', 'Ada Lovelace')?.id;

    store.updateGuestDrinkCount(guestId!, 'beer', 1);
    store.updateGuestDrinkCount(guestId!, 'water', 1);

    expect(store.billGuestTab(guestId!)).toBe(true);
    expect(store.activeGuestCount()).toBe(0);
    expect(store.billedGuestBills()).toHaveLength(1);
    expect(store.billedGuestBills()[0]?.fullName).toBe('Ada Lovelace');
    expect(store.billedGuestBills()[0]?.displayTotalPrice).toBe('€6.50');
    expect(localStorage.getItem(BILLED_GUEST_TABS_STORAGE_KEY)).toContain(
      '"fullName":"Ada Lovelace"',
    );
  });
});

function buildCounts(overrides: Partial<DrinkCounts>): DrinkCounts {
  return DRINK_CATALOG.reduce((counts, drink) => {
    counts[drink.id] = overrides[drink.id] ?? 0;
    return counts;
  }, {} as DrinkCounts);
}
