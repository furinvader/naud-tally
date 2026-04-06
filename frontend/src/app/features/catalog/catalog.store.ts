import {
  patchState,
  signalStore,
  withHooks,
  withMethods,
  withState,
} from '@ngrx/signals';

import { loadDrinkCatalog, saveDrinkCatalog } from './catalog.repository';

export { DRINK_CATALOG_STORAGE_KEY } from './catalog.repository';

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
        saveDrinkCatalog(nextDrinkCatalog);

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
      saveDrinkCatalog(nextDrinkCatalog);

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
      saveDrinkCatalog(nextDrinkCatalog);

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
      saveDrinkCatalog(nextDrinkCatalog);

      return true;
    },
  })),
  withHooks({
    onInit(store): void {
      const restoredDrinkCatalog = loadDrinkCatalog(createDefaultDrinkCatalog);

      patchState(store, {
        drinkCatalog: restoredDrinkCatalog,
      });
      saveDrinkCatalog(restoredDrinkCatalog);
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

function normalizeDisplayText(value: unknown): string {
  if (typeof value !== 'string') {
    return '';
  }

  return value.trim().replace(/\s+/g, ' ');
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
