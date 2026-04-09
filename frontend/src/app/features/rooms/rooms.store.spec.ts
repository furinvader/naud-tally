import { TestBed } from '@angular/core/testing';

import {
  ROOMS_STORAGE_KEY,
  RoomsStore,
} from './rooms.store';

describe('RoomsStore', () => {
  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({});
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should initialize with no configured rooms', () => {
    const store = TestBed.inject(RoomsStore);

    expect(store.rooms()).toEqual([]);
    expect(store.activeRoomCount()).toBe(0);
  });

  it('should add rooms, sort them, and persist them', () => {
    const store = TestBed.inject(RoomsStore);

    expect(store.addRoom('204')).toEqual({
      ok: true,
      roomId: expect.any(String),
    });
    expect(store.addRoom('101')).toEqual({
      ok: true,
      roomId: expect.any(String),
    });

    expect(store.rooms().map((room) => room.roomNumber)).toEqual(['101', '204']);
    expect(localStorage.getItem(ROOMS_STORAGE_KEY)).toContain('"roomNumber":"101"');
  });

  it('should reject duplicate normalized room numbers', () => {
    const store = TestBed.inject(RoomsStore);

    expect(store.addRoom(' 101 ')).toEqual({
      ok: true,
      roomId: expect.any(String),
    });
    expect(store.addRoom('101')).toEqual({
      ok: false,
      reason: 'duplicateRoomNumber',
    });
  });

  it('should remove a room only when it is not in use', () => {
    const store = TestBed.inject(RoomsStore);

    store.addRoom('101');
    const roomId = store.rooms()[0]?.id;

    expect(store.removeRoom(roomId ?? '', 1)).toBe(false);
    expect(store.removeRoom(roomId ?? '', 0)).toBe(true);
    expect(store.rooms()).toEqual([]);
  });

  it('should restore persisted rooms', () => {
    localStorage.setItem(
      ROOMS_STORAGE_KEY,
      JSON.stringify([
        {
          id: 'room-101',
          roomNumber: '101',
          createdAt: '2026-04-01T08:00:00.000Z',
          updatedAt: '2026-04-01T08:00:00.000Z',
        },
      ]),
    );

    const store = TestBed.inject(RoomsStore);

    expect(store.rooms()).toEqual([
      {
        id: 'room-101',
        roomNumber: '101',
        createdAt: '2026-04-01T08:00:00.000Z',
        updatedAt: '2026-04-01T08:00:00.000Z',
      },
    ]);
  });
});
