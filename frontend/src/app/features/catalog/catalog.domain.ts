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

export function createDefaultDrinkCatalog(): DrinkCatalogEntry[] {
  const timestamp = createTimestamp();

  return DRINK_CATALOG.map((drink) => ({
    ...drink,
    isActive: true,
    createdAt: timestamp,
    updatedAt: timestamp,
  }));
}

export function normalizeDisplayText(value: unknown): string {
  if (typeof value !== 'string') {
    return '';
  }

  return value.trim().replace(/\s+/g, ' ');
}

export function normalizePriceCents(value: unknown): number | null {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    return null;
  }

  return Math.max(0, Math.round(value));
}

export function createDrinkCatalogId(name: string, suffixSeed?: number): string {
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

function humanizeDrinkId(drinkId: string): string {
  return drinkId
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/[-_]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/\b\w/g, (match) => match.toUpperCase());
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
