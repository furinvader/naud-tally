import { TestBed } from '@angular/core/testing';

import { DRINK_CATALOG } from '../catalog/catalog.store';
import { DrinkCounts, GUEST_TABS_STORAGE_KEY } from '../guest-tabs/guest-tabs.store';
import { HostWorkspaceStore } from './host-workspace.store';

describe('HostWorkspaceStore', () => {
  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [HostWorkspaceStore],
    });
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should initialize with no selected guest and a closed add-guest flow', () => {
    const store = TestBed.inject(HostWorkspaceStore);

    expect(store.selectedGuest()).toBeNull();
    expect(store.addGuestFlow()).toEqual({
      step: 'closed',
      roomNumber: '',
      fullName: '',
    });
    expect(store.activeGuests()).toEqual([]);
  });

  it('should create and select a guest through the room-number then full-name flow', () => {
    const store = TestBed.inject(HostWorkspaceStore);

    store.startAddGuestFlow();
    store.updateDraftRoomNumber(' 204 ');
    store.submitRoomNumber();
    store.updateDraftFullName(' Grace Hopper ');
    store.submitGuestIdentity();

    expect(store.activeGuests()).toHaveLength(1);
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
    expect(localStorage.getItem(GUEST_TABS_STORAGE_KEY)).toContain('"roomNumber":"204"');
  });

  it('should reuse an existing guest when the same normalized identity is submitted again', () => {
    const store = TestBed.inject(HostWorkspaceStore);

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

    expect(store.activeGuests()).toHaveLength(1);
    expect(store.selectedGuest()?.id).toBe(originalGuestId);
    expect(store.selectedGuest()?.fullName).toBe('Ada Lovelace');
  });

  it('should deselect the active guest when the same guest is selected again', () => {
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
      ]),
    );

    const store = TestBed.inject(HostWorkspaceStore);

    expect(store.activeGuests().map((guest) => guest.id)).toEqual(['guest-2', 'guest-1']);

    store.selectGuestTab('guest-1');
    store.incrementDrink('beer');
    store.selectGuestTab('guest-1');

    expect(store.selectedGuest()).toBeNull();
    expect(store.activeGuests().map((guest) => guest.id)).toEqual(['guest-1', 'guest-2']);
    expect(store.activeGuests().find((guest) => guest.id === 'guest-1')?.totalCount).toBe(2);
  });

  it('should keep active drink ordering stable while selected and re-sort it when reopened', () => {
    localStorage.setItem(
      GUEST_TABS_STORAGE_KEY,
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

    const store = TestBed.inject(HostWorkspaceStore);

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

  it('should clear the draft add-guest flow without mutating persistent guest tabs', () => {
    const store = TestBed.inject(HostWorkspaceStore);

    store.startAddGuestFlow();
    store.updateDraftRoomNumber('204');
    store.clearTransientState();

    expect(store.addGuestFlow()).toEqual({
      step: 'closed',
      roomNumber: '',
      fullName: '',
    });
    expect(store.activeGuests()).toEqual([]);
  });
});

function buildCounts(overrides: Partial<DrinkCounts>): DrinkCounts {
  return DRINK_CATALOG.reduce((counts, drink) => {
    counts[drink.id] = overrides[drink.id] ?? 0;
    return counts;
  }, {} as DrinkCounts);
}
