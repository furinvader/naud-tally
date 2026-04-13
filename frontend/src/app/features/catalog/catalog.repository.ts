import {
  DrinkCatalogEntry,
  createDrinkCatalogId,
  normalizeDisplayText,
  normalizePriceCents,
} from './catalog.domain';

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
