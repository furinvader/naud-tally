import type { BilledGuestTab, GuestBillLineItem } from './billing-history.store';

export const BILLED_GUEST_TABS_STORAGE_KEY = 'naud-tally.billed-guest-tabs';

export function loadBilledGuestTabs(): BilledGuestTab[] {
  const storage = getStorage();

  if (!storage) {
    return [];
  }

  const rawBilledGuestTabs = storage.getItem(BILLED_GUEST_TABS_STORAGE_KEY);

  if (!rawBilledGuestTabs) {
    return [];
  }

  try {
    return normalizeBilledGuestTabs(JSON.parse(rawBilledGuestTabs));
  } catch {
    return [];
  }
}

export function saveBilledGuestTabs(guestTabs: ReadonlyArray<BilledGuestTab>): void {
  const storage = getStorage();

  if (!storage) {
    return;
  }

  try {
    storage.setItem(BILLED_GUEST_TABS_STORAGE_KEY, JSON.stringify(guestTabs));
  } catch {
    // Ignore storage failures so the billing history still works in restricted contexts.
  }
}

function normalizeBilledGuestTabs(value: unknown): BilledGuestTab[] {
  if (!Array.isArray(value)) {
    return [];
  }

  const seenIds = new Set<string>();

  return value
    .map((guestTab) => normalizeBilledGuestTab(guestTab))
    .filter((guestTab): guestTab is BilledGuestTab => {
      if (!guestTab || seenIds.has(guestTab.id)) {
        return false;
      }

      seenIds.add(guestTab.id);
      return true;
    });
}

function normalizeBilledGuestTab(value: unknown): BilledGuestTab | null {
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
  const lineItems = normalizeBillLineItems(guestTab['lineItems']);

  return {
    id: normalizeId(guestTab['id']) ?? createGuestTabId(),
    roomNumber,
    fullName,
    lineItems,
    totalCount: normalizeCountValue(
      guestTab['totalCount'] ?? lineItems.reduce((total, lineItem) => total + lineItem.count, 0),
    ),
    totalPriceCents:
      normalizePriceCents(
        guestTab['totalPriceCents'] ??
          lineItems.reduce((total, lineItem) => total + lineItem.totalPriceCents, 0),
      ) ?? 0,
    createdAt: normalizeTimestamp(guestTab['createdAt'], timestamp),
    updatedAt: normalizeTimestamp(guestTab['updatedAt'], timestamp),
    billedAt: normalizeTimestamp(guestTab['billedAt'], timestamp),
  };
}

function normalizeBillLineItems(value: unknown): GuestBillLineItem[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((lineItem) => normalizeBillLineItem(lineItem))
    .filter((lineItem): lineItem is GuestBillLineItem => lineItem !== null);
}

function normalizeBillLineItem(value: unknown): GuestBillLineItem | null {
  if (!value || typeof value !== 'object') {
    return null;
  }

  const lineItem = value as Record<string, unknown>;
  const name = normalizeDisplayText(lineItem['name']);
  const count = normalizeCountValue(lineItem['count']);
  const unitPriceCents = normalizePriceCents(lineItem['unitPriceCents']) ?? 0;

  if (!name || count <= 0) {
    return null;
  }

  return {
    id: normalizeId(lineItem['id']) ?? createDrinkCatalogId(name),
    name,
    count,
    unitPriceCents,
    totalPriceCents: normalizePriceCents(lineItem['totalPriceCents']) ?? count * unitPriceCents,
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

function normalizeCountValue(value: unknown): number {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    return 0;
  }

  return Math.max(0, Math.trunc(value));
}

function normalizePriceCents(value: unknown): number | null {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    return null;
  }

  return Math.max(0, Math.round(value));
}

function createGuestTabId(): string {
  return createRecordId('guest');
}

function createDrinkCatalogId(name: string): string {
  const slug = normalizeDisplayText(name)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 24);

  return `${slug || 'drink'}-${createRecordId('catalog').slice(-8)}`;
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
