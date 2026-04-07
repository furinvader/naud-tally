import { TestBed } from '@angular/core/testing';

import { DRINK_CATALOG, DrinkCatalogEntry } from '../catalog';
import {
  DrinkCounts,
  GUEST_TABS_STORAGE_KEY,
  GuestTabsStore,
} from './guest-tabs.store';

describe('GuestTabsStore', () => {
  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({});
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should initialize with no guest tabs', () => {
    const store = TestBed.inject(GuestTabsStore);

    expect(store.guestTabs()).toEqual([]);
    expect(store.activeGuestCount()).toBe(0);
  });

  it('should create a guest tab and persist it', () => {
    const store = TestBed.inject(GuestTabsStore);

    const guest = store.ensureGuestTab(' 204 ', ' Grace Hopper ');

    expect(guest?.roomNumber).toBe('204');
    expect(guest?.fullName).toBe('Grace Hopper');
    expect(store.activeGuestCount()).toBe(1);
    expect(localStorage.getItem(GUEST_TABS_STORAGE_KEY)).toContain('"roomNumber":"204"');
  });

  it('should reuse an existing guest when the normalized identity already exists', () => {
    const store = TestBed.inject(GuestTabsStore);

    const firstGuest = store.ensureGuestTab('101', 'Ada Lovelace');
    const secondGuest = store.ensureGuestTab(' 101 ', ' ada    lovelace ');

    expect(firstGuest?.id).toBe(secondGuest?.id);
    expect(store.activeGuestCount()).toBe(1);
  });

  it('should update only the targeted guest counts', () => {
    const store = TestBed.inject(GuestTabsStore);

    const firstGuestId = store.ensureGuestTab('101', 'Ada Lovelace')?.id;
    const secondGuestId = store.ensureGuestTab('102', 'Grace Hopper')?.id;
    const catalog = createCatalogSnapshot();

    store.updateGuestDrinkCount(secondGuestId!, 'beer', 1, catalog);
    store.updateGuestDrinkCount(secondGuestId!, 'water', 1, catalog);
    store.updateGuestDrinkCount(firstGuestId!, 'cola', 1, catalog);

    const firstGuest = store.guestTabs().find((guest) => guest.id === firstGuestId);
    const secondGuest = store.guestTabs().find((guest) => guest.id === secondGuestId);

    expect(firstGuest?.counts).toEqual({ cola: 1 });
    expect(secondGuest?.counts).toEqual({ beer: 1, water: 1 });
  });

  it('should remove a drink from the guest counts when its tally returns to zero', () => {
    const store = TestBed.inject(GuestTabsStore);
    const guestId = store.ensureGuestTab('101', 'Ada Lovelace')?.id;
    const catalog = createCatalogSnapshot();

    store.updateGuestDrinkCount(guestId!, 'beer', 1, catalog);
    store.updateGuestDrinkCount(guestId!, 'beer', -1, catalog);

    expect(store.guestTabs()[0]?.counts).toEqual({});
  });

  it('should keep guest ordering stable while tallying and sort finalized tabs by drinks then room number', () => {
    localStorage.setItem(
      GUEST_TABS_STORAGE_KEY,
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

    const store = TestBed.inject(GuestTabsStore);
    const catalog = createCatalogSnapshot();

    expect(store.guestTabs().map((guest) => guest.id)).toEqual(['guest-3', 'guest-2', 'guest-1']);

    store.updateGuestDrinkCount('guest-1', 'beer', 1, catalog);

    expect(store.guestTabs().map((guest) => guest.id)).toEqual(['guest-3', 'guest-2', 'guest-1']);

    store.finalizeGuestTab('guest-1');

    expect(store.guestTabs().map((guest) => guest.id)).toEqual(['guest-3', 'guest-1', 'guest-2']);
  });

  it('should restore persisted guests and counts', () => {
    localStorage.setItem(
      GUEST_TABS_STORAGE_KEY,
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

    const store = TestBed.inject(GuestTabsStore);

    expect(store.activeGuestCount()).toBe(1);
    expect(store.guestTabs()[0]?.counts).toEqual(buildCounts({ water: 2, beer: 1 }));
  });
});

function buildCounts(overrides: Partial<DrinkCounts>): DrinkCounts {
  return DRINK_CATALOG.reduce((counts, drink) => {
    const count = overrides[drink.id];

    if (typeof count === 'number' && count > 0) {
      counts[drink.id] = count;
    }

    return counts;
  }, {} as DrinkCounts);
}

function createCatalogSnapshot(): DrinkCatalogEntry[] {
  return DRINK_CATALOG.map((drink) => ({
    ...drink,
    isActive: true,
    createdAt: '2026-04-01T08:00:00.000Z',
    updatedAt: '2026-04-01T08:00:00.000Z',
  }));
}
