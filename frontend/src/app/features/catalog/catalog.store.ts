import {
  patchState,
  signalStore,
  withHooks,
  withMethods,
  withState,
} from '@ngrx/signals';

export const DRINK_CATALOG_STORAGE_KEY = 'naud-tally.drink-catalog';

export const DRINK_CATALOG = [
  { id: 'water', name: 'Water', priceCents: 200 },
  { id: 'sparklingWater', name: 'Sparkling Water', priceCents: 250 },
  { id: 'cola', name: 'Cola', priceCents: 300 },
  { id: 'colaZero', name: 'Cola Zero', priceCents: 300 },
  { id: 'lemonSoda', name: 'Lemon Soda', priceCents: 300 },
  { id: 'orangeSoda', name: 'Orange Soda', priceCents: 300 },
  { id: 'appleJuice', name: 'Apple Juice', priceCents: 350 },
  { id: 'beer', name: 'Beer', priceCents: 450 },
  { id: 'whiteWine', name: 'White Wine', priceCents: 500 },
] as const;

type SeedDrinkId = (typeof DRINK_CATALOG)[number]['id'];

export type DrinkId = SeedDrinkId | string;

export type DrinkCatalogEntry = {
  id: string;
  name: string;
  priceCents: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type AddDrinkResult =
  | {
      ok: true;
      action: 'added' | 'restored';
      drinkId: string;
    }
  | {
      ok: false;
      reason: 'invalidName' | 'invalidPrice' | 'duplicateName';
    };

type CatalogState = {
  drinkCatalog: DrinkCatalogEntry[];
};

const initialState: CatalogState = {
  drinkCatalog: createDefaultDrinkCatalog(),
};

export const CatalogStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withMethods((store) => ({
    addDrink(name: string, priceCents: number): AddDrinkResult {
      const normalizedName = normalizeDisplayText(name);
      const normalizedPriceCents = normalizePriceCents(priceCents);

      if (!normalizedName) {
        return { ok: false, reason: 'invalidName' };
      }

      if (normalizedPriceCents === null) {
        return { ok: false, reason: 'invalidPrice' };
      }

      const existingDrink = store
        .drinkCatalog()
        .find(
          (drink) =>
            normalizeDisplayText(drink.name).toLowerCase() === normalizedName.toLowerCase(),
        );
      const timestamp = createTimestamp();

      if (existingDrink?.isActive) {
        return { ok: false, reason: 'duplicateName' };
      }

      if (existingDrink) {
        const nextDrinkCatalog = store.drinkCatalog().map((drink) =>
          drink.id === existingDrink.id
            ? {
                ...drink,
                name: normalizedName,
                priceCents: normalizedPriceCents,
                isActive: true,
                updatedAt: timestamp,
              }
            : drink,
        );

        patchState(store, { drinkCatalog: nextDrinkCatalog });
        persistDrinkCatalog(nextDrinkCatalog);

        return { ok: true, action: 'restored', drinkId: existingDrink.id };
      }

      const drinkId = createDrinkCatalogId(normalizedName);
      const nextDrinkCatalog = [
        ...store.drinkCatalog(),
        {
          id: drinkId,
          name: normalizedName,
          priceCents: normalizedPriceCents,
          isActive: true,
          createdAt: timestamp,
          updatedAt: timestamp,
        },
      ];

      patchState(store, { drinkCatalog: nextDrinkCatalog });
      persistDrinkCatalog(nextDrinkCatalog);

      return { ok: true, action: 'added', drinkId };
    },
    removeDrink(drinkId: string, openGuestCount: number): boolean {
      const drink = store.drinkCatalog().find((entry) => entry.id === drinkId);

      if (!drink?.isActive || openGuestCount > 0) {
        return false;
      }

      const timestamp = createTimestamp();
      const nextDrinkCatalog = store.drinkCatalog().map((entry) =>
        entry.id === drinkId
          ? {
              ...entry,
              isActive: false,
              updatedAt: timestamp,
            }
          : entry,
      );

      patchState(store, { drinkCatalog: nextDrinkCatalog });
      persistDrinkCatalog(nextDrinkCatalog);

      return true;
    },
    restoreDrink(drinkId: string): boolean {
      const drink = store.drinkCatalog().find((entry) => entry.id === drinkId);

      if (!drink || drink.isActive) {
        return false;
      }

      const timestamp = createTimestamp();
      const nextDrinkCatalog = store.drinkCatalog().map((entry) =>
        entry.id === drinkId
          ? {
              ...entry,
              isActive: true,
              updatedAt: timestamp,
            }
          : entry,
      );

      patchState(store, { drinkCatalog: nextDrinkCatalog });
      persistDrinkCatalog(nextDrinkCatalog);

      return true;
    },
  })),
  withHooks({
    onInit(store): void {
      const restoredDrinkCatalog = readPersistedDrinkCatalog();

      patchState(store, {
        drinkCatalog: restoredDrinkCatalog,
      });
      persistDrinkCatalog(restoredDrinkCatalog);
    },
  }),
);

export function findDrinkById(
  drinkCatalog: ReadonlyArray<DrinkCatalogEntry>,
  drinkId: DrinkId,
): DrinkCatalogEntry | null {
  return drinkCatalog.find((entry) => entry.id === drinkId) ?? null;
}

export function getDrinkById(
  drinkCatalog: ReadonlyArray<DrinkCatalogEntry>,
  drinkId: DrinkId,
): DrinkCatalogEntry {
  return (
    findDrinkById(drinkCatalog, drinkId) ?? {
      id: drinkId,
      name: humanizeDrinkId(drinkId),
      priceCents: 0,
      isActive: false,
      createdAt: '',
      updatedAt: '',
    }
  );
}

export function formatEuroPrice(priceCents: number): string {
  return `€${(priceCents / 100).toFixed(2)}`;
}

function readPersistedDrinkCatalog(): DrinkCatalogEntry[] {
  const storage = getStorage();

  if (!storage) {
    return createDefaultDrinkCatalog();
  }

  const rawDrinkCatalog = storage.getItem(DRINK_CATALOG_STORAGE_KEY);

  if (!rawDrinkCatalog) {
    return createDefaultDrinkCatalog();
  }

  try {
    return normalizeDrinkCatalog(JSON.parse(rawDrinkCatalog));
  } catch {
    return createDefaultDrinkCatalog();
  }
}

function normalizeDrinkCatalog(value: unknown): DrinkCatalogEntry[] {
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

function humanizeDrinkId(drinkId: string): string {
  return drinkId
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/[-_]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/\b\w/g, (match) => match.toUpperCase());
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

function createDefaultDrinkCatalog(): DrinkCatalogEntry[] {
  const timestamp = createTimestamp();

  return DRINK_CATALOG.map((drink) => ({
    ...drink,
    isActive: true,
    createdAt: timestamp,
    updatedAt: timestamp,
  }));
}

function persistDrinkCatalog(drinkCatalog: DrinkCatalogEntry[]): void {
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

function getStorage(): Storage | null {
  try {
    return globalThis.localStorage;
  } catch {
    return null;
  }
}
