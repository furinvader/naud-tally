import { computed } from '@angular/core';
import {
  patchState,
  signalStore,
  withComputed,
  withHooks,
  withMethods,
  withState,
} from '@ngrx/signals';

export const DRINK_TALLY_STORAGE_KEY = 'naud-tally.drink-counts';

export const DRINK_CATALOG = [
  { id: 'water', name: 'Water' },
  { id: 'sparklingWater', name: 'Sparkling Water' },
  { id: 'cola', name: 'Cola' },
  { id: 'colaZero', name: 'Cola Zero' },
  { id: 'lemonSoda', name: 'Lemon Soda' },
  { id: 'orangeSoda', name: 'Orange Soda' },
  { id: 'appleJuice', name: 'Apple Juice' },
  { id: 'beer', name: 'Beer' },
  { id: 'whiteWine', name: 'White Wine' },
] as const;

export type DrinkId = (typeof DRINK_CATALOG)[number]['id'];

type DrinkCounts = Record<DrinkId, number>;

type DrinkTallyState = {
  counts: DrinkCounts;
};

const initialState: DrinkTallyState = {
  counts: createEmptyCounts(),
};

export const DrinkTallyStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withComputed((store) => ({
    drinkTallies: computed(() =>
      DRINK_CATALOG.map((drink) => ({
        ...drink,
        count: store.counts()[drink.id],
      })),
    ),
    totalCount: computed(() =>
      Object.values(store.counts()).reduce((total, count) => total + count, 0),
    ),
  })),
  withMethods((store) => ({
    incrementDrink(drinkId: DrinkId): void {
      const currentCounts = store.counts();
      const nextCounts = {
        ...currentCounts,
        [drinkId]: currentCounts[drinkId] + 1,
      };

      patchState(store, { counts: nextCounts });
      persistCounts(nextCounts);
    },
    decrementDrink(drinkId: DrinkId): void {
      const currentCounts = store.counts();
      const nextCounts = {
        ...currentCounts,
        [drinkId]: Math.max(0, currentCounts[drinkId] - 1),
      };

      patchState(store, { counts: nextCounts });
      persistCounts(nextCounts);
    },
  })),
  withHooks({
    onInit(store): void {
      const restoredCounts = readPersistedCounts();

      if (!restoredCounts) {
        return;
      }

      patchState(store, { counts: restoredCounts });
      persistCounts(restoredCounts);
    },
  }),
);

function createEmptyCounts(): DrinkCounts {
  return DRINK_CATALOG.reduce(
    (counts, drink) => {
      counts[drink.id] = 0;
      return counts;
    },
    {} as DrinkCounts,
  );
}

function readPersistedCounts(): DrinkCounts | null {
  const storage = getStorage();

  if (!storage) {
    return null;
  }

  const rawCounts = storage.getItem(DRINK_TALLY_STORAGE_KEY);

  if (!rawCounts) {
    return null;
  }

  try {
    return normalizeCounts(JSON.parse(rawCounts));
  } catch {
    return null;
  }
}

function normalizeCounts(value: unknown): DrinkCounts {
  const counts = createEmptyCounts();

  if (!value || typeof value !== 'object') {
    return counts;
  }

  const persistedCounts = value as Record<string, unknown>;

  for (const drink of DRINK_CATALOG) {
    counts[drink.id] = normalizeCountValue(persistedCounts[drink.id]);
  }

  return counts;
}

function normalizeCountValue(value: unknown): number {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    return 0;
  }

  return Math.max(0, Math.trunc(value));
}

function persistCounts(counts: DrinkCounts): void {
  const storage = getStorage();

  if (!storage) {
    return;
  }

  try {
    storage.setItem(DRINK_TALLY_STORAGE_KEY, JSON.stringify(counts));
  } catch {
    // Ignore storage failures so the tally still works in restricted contexts.
  }
}

function getStorage(): Storage | null {
  try {
    return globalThis.localStorage;
  } catch {
    return null;
  }
}
