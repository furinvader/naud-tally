import type { DrinkCounts, GuestTab } from './guest-tabs.store';

export const GUEST_TABS_STORAGE_KEY = 'naud-tally.guest-tabs';

export function loadGuestTabs(): GuestTab[] {
  const storage = getStorage();

  if (!storage) {
    return [];
  }

  const rawGuestTabs = storage.getItem(GUEST_TABS_STORAGE_KEY);

  if (!rawGuestTabs) {
    return [];
  }

  try {
    return normalizeGuestTabs(JSON.parse(rawGuestTabs));
  } catch {
    return [];
  }
}

export function saveGuestTabs(guestTabs: ReadonlyArray<GuestTab>): void {
  const storage = getStorage();

  if (!storage) {
    return;
  }

  try {
    storage.setItem(GUEST_TABS_STORAGE_KEY, JSON.stringify(guestTabs));
  } catch {
    // Ignore storage failures so the guest-tab flow still works in restricted contexts.
  }
}

function normalizeGuestTabs(value: unknown): GuestTab[] {
  if (!Array.isArray(value)) {
    return [];
  }

  const seenIds = new Set<string>();

  return value
    .map((guestTab) => normalizeGuestTab(guestTab))
    .filter((guestTab): guestTab is GuestTab => {
      if (!guestTab || seenIds.has(guestTab.id)) {
        return false;
      }

      seenIds.add(guestTab.id);
      return true;
    });
}

function normalizeGuestTab(value: unknown): GuestTab | null {
  if (!value || typeof value !== 'object') {
    return null;
  }

  const guestTab = value as Record<string, unknown>;
  const roomNumber = normalizeDisplayText(guestTab['roomNumber']);
  const fullName = normalizeDisplayText(guestTab['fullName']);

  if (!roomNumber || !fullName) {
    return null;
  }

  const timestamp = createTimestamp();
  const counts = normalizeCounts(guestTab['counts']);

  return {
    id: normalizeId(guestTab['id']) ?? createGuestTabId(),
    roomNumber,
    fullName,
    counts,
    drinkOrder: normalizeDrinkOrder(guestTab['drinkOrder'], counts),
    createdAt: normalizeTimestamp(guestTab['createdAt'], timestamp),
    updatedAt: normalizeTimestamp(guestTab['updatedAt'], timestamp),
  };
}

function normalizeCounts(value: unknown): DrinkCounts {
  if (!value || typeof value !== 'object') {
    return {};
  }

  const persistedCounts = value as Record<string, unknown>;
  const counts: DrinkCounts = {};

  for (const [drinkId, countValue] of Object.entries(persistedCounts)) {
    const normalizedDrinkId = normalizeId(drinkId);
    const normalizedCount = normalizeCountValue(countValue);

    if (!normalizedDrinkId || normalizedCount <= 0) {
      continue;
    }

    counts[normalizedDrinkId] = normalizedCount;
  }

  return counts;
}

function normalizeDrinkOrder(value: unknown, counts: DrinkCounts): string[] {
  const normalizedOrder: string[] = [];
  const seen = new Set<string>();

  if (Array.isArray(value)) {
    for (const entry of value) {
      if (typeof entry !== 'string') {
        continue;
      }

      const normalizedEntry = entry.trim();

      if (
        !normalizedEntry ||
        seen.has(normalizedEntry) ||
        normalizeCountValue(counts[normalizedEntry]) <= 0
      ) {
        continue;
      }

      normalizedOrder.push(normalizedEntry);
      seen.add(normalizedEntry);
    }
  }

  for (const drinkId of Object.keys(counts)) {
    if (seen.has(drinkId) || normalizeCountValue(counts[drinkId]) <= 0) {
      continue;
    }

    normalizedOrder.push(drinkId);
    seen.add(drinkId);
  }

  return normalizedOrder;
}

function normalizeId(value: unknown): string | null {
  if (typeof value !== 'string') {
    return null;
  }

  const normalized = value.trim();
  return normalized ? normalized : null;
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

function normalizeDisplayText(value: unknown): string {
  if (typeof value !== 'string') {
    return '';
  }

  return value.trim().replace(/\s+/g, ' ');
}

function normalizeCountValue(value: unknown): number {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    return 0;
  }

  return Math.max(0, Math.trunc(value));
}

function createGuestTabId(): string {
  return createRecordId('guest');
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
