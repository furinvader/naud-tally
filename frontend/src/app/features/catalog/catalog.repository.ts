import type { DrinkCatalogEntry } from './catalog.store';

export const DRINK_CATALOG_STORAGE_KEY = 'naud-tally.drink-catalog';

export function loadDrinkCatalog(
  createDefaultDrinkCatalog: () => DrinkCatalogEntry[],
): DrinkCatalogEntry[] {
  const storage = getStorage();

  if (!storage) {
    return createDefaultDrinkCatalog();
  }

  const rawDrinkCatalog = storage.getItem(DRINK_CATALOG_STORAGE_KEY);

  if (!rawDrinkCatalog) {
    return createDefaultDrinkCatalog();
  }

  try {
    return normalizeDrinkCatalog(JSON.parse(rawDrinkCatalog), createDefaultDrinkCatalog);
  } catch {
    return createDefaultDrinkCatalog();
  }
}

export function saveDrinkCatalog(drinkCatalog: ReadonlyArray<DrinkCatalogEntry>): void {
  const storage = getStorage();

  if (!storage) {
    return;
  }

  try {
    storage.setItem(DRINK_CATALOG_STORAGE_KEY, JSON.stringify(drinkCatalog));
  } catch {
    // Ignore storage failures so the catalog still works in restricted contexts.
  }
}

function normalizeDrinkCatalog(
  value: unknown,
  createDefaultDrinkCatalog: () => DrinkCatalogEntry[],
): DrinkCatalogEntry[] {
  if (!Array.isArray(value)) {
    return createDefaultDrinkCatalog();
  }

  const seenIds = new Set<string>();
  const timestamp = createTimestamp();
  const normalizedDrinkCatalog = value.flatMap((entry, index) => {
    const normalizedEntry = normalizeDrinkCatalogEntry(entry, index, timestamp);

    if (!normalizedEntry || seenIds.has(normalizedEntry.id)) {
      return [];
    }

    seenIds.add(normalizedEntry.id);
    return [normalizedEntry];
  });

  return normalizedDrinkCatalog.length ? normalizedDrinkCatalog : createDefaultDrinkCatalog();
}

function normalizeDrinkCatalogEntry(
  value: unknown,
  index: number,
  fallbackTimestamp: string,
): DrinkCatalogEntry | null {
  if (!value || typeof value !== 'object') {
    return null;
  }

  const drink = value as Record<string, unknown>;
  const name = normalizeDisplayText(drink['name']);

  if (!name) {
    return null;
  }

  return {
    id: normalizeId(drink['id']) ?? createDrinkCatalogId(name, index),
    name,
    priceCents: normalizePriceCents(drink['priceCents']) ?? 0,
    isActive: normalizeBoolean(drink['isActive'], true),
    createdAt: normalizeTimestamp(drink['createdAt'], fallbackTimestamp),
    updatedAt: normalizeTimestamp(drink['updatedAt'], fallbackTimestamp),
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

function normalizeBoolean(value: unknown, fallback: boolean): boolean {
  return typeof value === 'boolean' ? value : fallback;
}

function normalizePriceCents(value: unknown): number | null {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    return null;
  }

  return Math.max(0, Math.round(value));
}

function createDrinkCatalogId(name: string, suffixSeed?: number): string {
  const slug = normalizeDisplayText(name)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 24);
  const baseId = slug || 'drink';

  if (typeof suffixSeed === 'number') {
    return `${baseId}-${suffixSeed}`;
  }

  return `${baseId}-${createRecordId('catalog').slice(-8)}`;
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
