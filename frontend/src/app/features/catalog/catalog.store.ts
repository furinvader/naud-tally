import {
  patchState,
  signalStore,
  withHooks,
  withMethods,
  withState,
} from '@ngrx/signals';

import {
  DrinkCatalogEntry,
  createDefaultDrinkCatalog,
  createDrinkCatalogId,
  normalizeDisplayText,
  normalizePriceCents,
} from './catalog.domain';
import { loadDrinkCatalog, saveDrinkCatalog } from './catalog.repository';

export { DRINK_CATALOG_STORAGE_KEY } from './catalog.repository';

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

function createTimestamp(): string {
  return new Date().toISOString();
}
