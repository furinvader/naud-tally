import { TestBed } from '@angular/core/testing';

import { DRINK_CATALOG, DrinkCatalogEntry } from '../catalog/catalog.store';
import { BILLED_GUEST_TABS_STORAGE_KEY, BillingHistoryStore } from './billing-history.store';

describe('BillingHistoryStore', () => {
  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({});
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should initialize with no billed history', () => {
    const store = TestBed.inject(BillingHistoryStore);

    expect(store.billedGuestTabs()).toEqual([]);
    expect(store.billedGuestCount()).toBe(0);
  });

  it('should record a billed guest tab and persist it', () => {
    const store = TestBed.inject(BillingHistoryStore);

    const billedGuest = store.recordBilledGuestTab(
      {
        id: 'guest-ada',
        roomNumber: '101',
        fullName: 'Ada Lovelace',
        counts: { beer: 1, water: 1 },
        createdAt: '2026-04-01T08:00:00.000Z',
        updatedAt: '2026-04-01T08:30:00.000Z',
      },
      createCatalogSnapshot(),
    );

    expect(billedGuest.totalCount).toBe(2);
    expect(billedGuest.totalPriceCents).toBe(650);
    expect(billedGuest.lineItems).toEqual([
      {
        id: 'water',
        name: 'Water',
        count: 1,
        unitPriceCents: 200,
        totalPriceCents: 200,
      },
      {
        id: 'beer',
        name: 'Beer',
        count: 1,
        unitPriceCents: 450,
        totalPriceCents: 450,
      },
    ]);
    expect(localStorage.getItem(BILLED_GUEST_TABS_STORAGE_KEY)).toContain(
      '"fullName":"Ada Lovelace"',
    );
  });

  it('should restore persisted billed history', () => {
    localStorage.setItem(
      BILLED_GUEST_TABS_STORAGE_KEY,
      JSON.stringify([
        {
          id: 'guest-ada',
          roomNumber: '101',
          fullName: 'Ada Lovelace',
          lineItems: [
            {
              id: 'beer',
              name: 'Beer',
              count: 1,
              unitPriceCents: 450,
              totalPriceCents: 450,
            },
          ],
          totalCount: 1,
          totalPriceCents: 450,
          createdAt: '2026-04-01T08:00:00.000Z',
          updatedAt: '2026-04-01T08:30:00.000Z',
          billedAt: '2026-04-01T09:00:00.000Z',
        },
      ]),
    );

    const store = TestBed.inject(BillingHistoryStore);

    expect(store.billedGuestCount()).toBe(1);
    expect(store.billedGuestTabs()[0]?.fullName).toBe('Ada Lovelace');
    expect(store.billedGuestTabs()[0]?.lineItems[0]?.name).toBe('Beer');
  });
});

function createCatalogSnapshot(): DrinkCatalogEntry[] {
  return DRINK_CATALOG.map((drink) => ({
    ...drink,
    isActive: true,
    createdAt: '2026-04-01T08:00:00.000Z',
    updatedAt: '2026-04-01T08:00:00.000Z',
  }));
}
