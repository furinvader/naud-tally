import { computed } from '@angular/core';
import {
  patchState,
  signalStore,
  withComputed,
  withHooks,
  withMethods,
  withState,
} from '@ngrx/signals';

import { loadRooms, saveRooms } from './rooms.repository';

export { ROOMS_STORAGE_KEY } from './rooms.repository';

export type Room = {
  id: string;
  roomNumber: string;
  createdAt: string;
  updatedAt: string;
};

export type AddRoomResult =
  | {
      ok: true;
      roomId: string;
    }
  | {
      ok: false;
      reason: 'invalidRoomNumber' | 'duplicateRoomNumber';
    };

type RoomsState = {
  rooms: Room[];
};

const roomNumberCollator = new Intl.Collator(undefined, {
  numeric: true,
  sensitivity: 'base',
});

const initialState: RoomsState = {
  rooms: [],
};

export const RoomsStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withComputed((store) => ({
    activeRoomCount: computed(() => store.rooms().length),
  })),
  withMethods((store) => ({
    addRoom(roomNumber: string): AddRoomResult {
      const normalizedRoomNumber = normalizeDisplayText(roomNumber);

      if (!normalizedRoomNumber) {
        return { ok: false, reason: 'invalidRoomNumber' };
      }

      const existingRoom = store
        .rooms()
        .find((room) => room.roomNumber.toLowerCase() === normalizedRoomNumber.toLowerCase());

      if (existingRoom) {
        return { ok: false, reason: 'duplicateRoomNumber' };
      }

      const timestamp = createTimestamp();
      const room: Room = {
        id: createRoomId(),
        roomNumber: normalizedRoomNumber,
        createdAt: timestamp,
        updatedAt: timestamp,
      };
      const nextRooms = sortRooms([...store.rooms(), room]);

      patchState(store, {
        rooms: nextRooms,
      });
      saveRooms(nextRooms);

      return { ok: true, roomId: room.id };
    },
    removeRoom(roomId: string, openGuestCount: number): boolean {
      if (openGuestCount > 0) {
        return false;
      }

      const nextRooms = store.rooms().filter((room) => room.id !== roomId);

      if (nextRooms.length === store.rooms().length) {
        return false;
      }

      patchState(store, {
        rooms: nextRooms,
      });
      saveRooms(nextRooms);

      return true;
    },
  })),
  withHooks({
    onInit(store): void {
      const restoredRooms = sortRooms(loadRooms());

      patchState(store, {
        rooms: restoredRooms,
      });
      saveRooms(restoredRooms);
    },
  }),
);

export function sortRooms(rooms: Room[]): Room[] {
  return [...rooms].sort((left, right) =>
    roomNumberCollator.compare(left.roomNumber, right.roomNumber),
  );
}

function normalizeDisplayText(value: unknown): string {
  if (typeof value !== 'string') {
    return '';
  }

  return value.trim().replace(/\s+/g, ' ');
}

function createRoomId(): string {
  return createRecordId('room');
}

function createRecordId(prefix: string): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return `${prefix}-${crypto.randomUUID()}`;
  }

  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function createTimestamp(): string {
  return new Date().toISOString();
}
