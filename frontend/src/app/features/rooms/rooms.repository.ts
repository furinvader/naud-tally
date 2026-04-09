import type { Room } from './rooms.store';

export const ROOMS_STORAGE_KEY = 'naud-tally.rooms';

export function loadRooms(): Room[] {
  const storage = getStorage();

  if (!storage) {
    return [];
  }

  const rawRooms = storage.getItem(ROOMS_STORAGE_KEY);

  if (!rawRooms) {
    return [];
  }

  try {
    return normalizeRooms(JSON.parse(rawRooms));
  } catch {
    return [];
  }
}

export function saveRooms(rooms: ReadonlyArray<Room>): void {
  const storage = getStorage();

  if (!storage) {
    return;
  }

  try {
    storage.setItem(ROOMS_STORAGE_KEY, JSON.stringify(rooms));
  } catch {
    // Ignore storage failures so the room list still works in restricted contexts.
  }
}

function normalizeRooms(value: unknown): Room[] {
  if (!Array.isArray(value)) {
    return [];
  }

  const seenIds = new Set<string>();
  const seenRoomNumbers = new Set<string>();

  return value
    .map((room) => normalizeRoom(room))
    .filter((room): room is Room => {
      if (!room || seenIds.has(room.id)) {
        return false;
      }

      const roomKey = room.roomNumber.toLowerCase();

      if (seenRoomNumbers.has(roomKey)) {
        return false;
      }

      seenIds.add(room.id);
      seenRoomNumbers.add(roomKey);

      return true;
    });
}

function normalizeRoom(value: unknown): Room | null {
  if (!value || typeof value !== 'object') {
    return null;
  }

  const room = value as Record<string, unknown>;
  const roomNumber = normalizeDisplayText(room['roomNumber']);

  if (!roomNumber) {
    return null;
  }

  const timestamp = createTimestamp();

  return {
    id: normalizeId(room['id']) ?? createRoomId(),
    roomNumber,
    createdAt: normalizeTimestamp(room['createdAt'], timestamp),
    updatedAt: normalizeTimestamp(room['updatedAt'], timestamp),
  };
}

function normalizeId(value: unknown): string | null {
  if (typeof value !== 'string') {
    return null;
  }

  const normalized = value.trim();
  return normalized ? normalized : null;
}

function normalizeDisplayText(value: unknown): string {
  if (typeof value !== 'string') {
    return '';
  }

  return value.trim().replace(/\s+/g, ' ');
}

function normalizeTimestamp(value: unknown, fallback: string): string {
  if (typeof value !== 'string') {
    return fallback;
  }

  const normalized = value.trim();

  if (!normalized || Number.isNaN(Date.parse(normalized))) {
    return fallback;
  }

  return normalized;
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

function getStorage(): Storage | null {
  try {
    return globalThis.localStorage;
  } catch {
    return null;
  }
}
