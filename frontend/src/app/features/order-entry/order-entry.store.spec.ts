import { TestBed } from '@angular/core/testing';

import { DRINK_CATALOG } from '../catalog';
import { DrinkCounts, GUEST_TABS_STORAGE_KEY } from '../guest-tabs';
import { ROOMS_STORAGE_KEY } from '../rooms';
import { OrderEntryStore } from './order-entry.store';

describe('OrderEntryStore', () => {
  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [OrderEntryStore],
    });
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should initialize with no configured rooms and no selection', () => {
    const store = TestBed.inject(OrderEntryStore);

    expect(store.rooms()).toEqual([]);
    expect(store.selectedRoom()).toBeNull();
    expect(store.selectedGuest()).toBeNull();
    expect(store.roomGuests()).toEqual([]);
  });

  it('should select a room and create a guest with full name only', () => {
    seedRooms();
    const store = TestBed.inject(OrderEntryStore);

    store.selectRoom('room-204');
    store.openGuestDraft();
    store.updateDraftGuestFullName(' Grace Hopper ');
    store.submitGuestIdentity();

    expect(store.selectedRoom()?.roomNumber).toBe('204');
    expect(store.selectedGuest()?.roomNumber).toBe('204');
    expect(store.selectedGuest()?.fullName).toBe('Grace Hopper');
    expect(store.selectedGuest()?.totalCount).toBe(0);
    expect(localStorage.getItem(GUEST_TABS_STORAGE_KEY)).toContain('"roomNumber":"204"');
  });

  it('should reuse an existing guest when the same normalized identity is submitted in the same room', () => {
    seedRooms();
    const store = TestBed.inject(OrderEntryStore);

    store.selectRoom('room-101');
    store.openGuestDraft();
    store.updateDraftGuestFullName('Ada Lovelace');
    store.submitGuestIdentity();

    const originalGuestId = store.selectedGuest()?.id;

    store.clearTransientState();
    store.selectRoom('room-101');
    store.openGuestDraft();
    store.updateDraftGuestFullName(' ada   lovelace ');
    store.submitGuestIdentity();

    expect(store.roomGuests()).toHaveLength(1);
    expect(store.selectedGuest()?.id).toBe(originalGuestId);
  });

  it('should filter guests to the selected room', () => {
    seedRooms();
    localStorage.setItem(
      GUEST_TABS_STORAGE_KEY,
      JSON.stringify([
        {
          id: 'guest-101',
          roomNumber: '101',
          fullName: 'Ada Lovelace',
          counts: buildCounts({ water: 1 }),
          createdAt: '2026-04-01T08:00:00.000Z',
          updatedAt: '2026-04-01T08:00:00.000Z',
        },
        {
          id: 'guest-102',
          roomNumber: '102',
          fullName: 'Grace Hopper',
          counts: buildCounts({ beer: 1 }),
          createdAt: '2026-04-01T08:10:00.000Z',
          updatedAt: '2026-04-01T08:10:00.000Z',
        },
      ]),
    );

    const store = TestBed.inject(OrderEntryStore);

    store.selectRoom('room-101');

    expect(store.roomGuests().map((guest) => guest.fullName)).toEqual(['Ada Lovelace']);
  });

  it('should clear the transient room and guest draft state without mutating persistent rooms', () => {
    seedRooms();
    const store = TestBed.inject(OrderEntryStore);

    store.selectRoom('room-101');
    store.openGuestDraft();
    store.updateDraftGuestFullName('Ada Lovelace');
    store.clearTransientState();

    expect(store.selectedRoom()).toBeNull();
    expect(store.guestDraft()).toEqual({
      isOpen: false,
      fullName: '',
    });
    expect(store.rooms().map((room) => room.roomNumber)).toEqual(['101', '204']);
  });
});

function seedRooms(): void {
  localStorage.setItem(
    ROOMS_STORAGE_KEY,
    JSON.stringify([
      {
        id: 'room-101',
        roomNumber: '101',
        createdAt: '2026-04-01T08:00:00.000Z',
        updatedAt: '2026-04-01T08:00:00.000Z',
      },
      {
        id: 'room-204',
        roomNumber: '204',
        createdAt: '2026-04-01T08:05:00.000Z',
        updatedAt: '2026-04-01T08:05:00.000Z',
      },
    ]),
  );
}

function buildCounts(overrides: Partial<DrinkCounts>): DrinkCounts {
  return DRINK_CATALOG.reduce((counts, drink) => {
    const count = overrides[drink.id];

    if (typeof count === 'number' && count > 0) {
      counts[drink.id] = count;
    }

    return counts;
  }, {} as DrinkCounts);
}
