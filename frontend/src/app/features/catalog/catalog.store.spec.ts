import { TestBed } from '@angular/core/testing';

import {
  CatalogStore,
  DRINK_CATALOG,
  DRINK_CATALOG_STORAGE_KEY,
} from './catalog.store';

describe('CatalogStore', () => {
  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({});
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should initialize with the seeded active drink catalog', () => {
    const store = TestBed.inject(CatalogStore);

    expect(store.drinkCatalog().map((drink) => drink.name)).toEqual(
      DRINK_CATALOG.map((drink) => drink.name),
    );
    expect(store.drinkCatalog().every((drink) => drink.isActive)).toBe(true);
  });

  it('should add a drink to the live catalog and persist it', () => {
    const store = TestBed.inject(CatalogStore);

    expect(store.addDrink('Iced Tea', 420)).toEqual({
      ok: true,
      action: 'added',
      drinkId: expect.any(String),
    });
    expect(store.drinkCatalog().map((drink) => drink.name)).toContain('Iced Tea');
    expect(localStorage.getItem(DRINK_CATALOG_STORAGE_KEY)).toContain('"name":"Iced Tea"');
  });

  it('should remove and restore a drink only when it is not in use', () => {
    const store = TestBed.inject(CatalogStore);

    expect(store.removeDrink('beer', 1)).toBe(false);
    expect(store.removeDrink('sparklingWater', 0)).toBe(true);
    expect(store.drinkCatalog().find((drink) => drink.id === 'sparklingWater')?.isActive).toBe(
      false,
    );
    expect(store.restoreDrink('sparklingWater')).toBe(true);
    expect(store.drinkCatalog().find((drink) => drink.id === 'sparklingWater')?.isActive).toBe(
      true,
    );
  });

  it('should restore persisted catalog entries', () => {
    localStorage.setItem(
      DRINK_CATALOG_STORAGE_KEY,
      JSON.stringify([
        {
          id: 'iced-tea',
          name: 'Iced Tea',
          priceCents: 420,
          isActive: true,
          createdAt: '2026-04-01T08:00:00.000Z',
          updatedAt: '2026-04-01T08:00:00.000Z',
        },
      ]),
    );

    const store = TestBed.inject(CatalogStore);

    expect(store.drinkCatalog()).toEqual([
      {
        id: 'iced-tea',
        name: 'Iced Tea',
        priceCents: 420,
        isActive: true,
        createdAt: '2026-04-01T08:00:00.000Z',
        updatedAt: '2026-04-01T08:00:00.000Z',
      },
    ]);
  });
});
