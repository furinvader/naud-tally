import { DRINK_CATALOG, DrinkCatalogEntry } from '../catalog';
import {
  calculateGuestTotalPriceCents,
  createBillLineItems,
  sortBilledGuestTabs,
} from './billing-history.domain';

describe('billing-history domain', () => {
  it('should build bill line items in catalog order and keep unknown drinks last', () => {
    const lineItems = createBillLineItems(
      {
        beer: 2,
        water: 1,
        mysteryTea: 3,
      },
      createCatalogSnapshot(),
    );

    expect(lineItems).toEqual([
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
        count: 2,
        unitPriceCents: 450,
        totalPriceCents: 900,
      },
      {
        id: 'mysteryTea',
        name: 'Mystery Tea',
        count: 3,
        unitPriceCents: 0,
        totalPriceCents: 0,
      },
    ]);
    expect(
      calculateGuestTotalPriceCents(
        {
          beer: 2,
          water: 1,
          mysteryTea: 3,
        },
        createCatalogSnapshot(),
      ),
    ).toBe(1100);
  });

  it('should sort billed guests by billed time and then room number', () => {
    const sortedGuestTabs = sortBilledGuestTabs([
      createBilledGuestTabSnapshot({
        id: 'guest-room-12',
        roomNumber: '12',
        fullName: 'Ada Lovelace',
        billedAt: '2026-04-01T10:00:00.000Z',
      }),
      createBilledGuestTabSnapshot({
        id: 'guest-room-2',
        roomNumber: '2',
        fullName: 'Grace Hopper',
        billedAt: '2026-04-01T10:00:00.000Z',
      }),
      createBilledGuestTabSnapshot({
        id: 'guest-room-5',
        roomNumber: '5',
        fullName: 'Katherine Johnson',
        billedAt: '2026-04-01T11:00:00.000Z',
      }),
    ]);

    expect(sortedGuestTabs.map((guest) => guest.id)).toEqual([
      'guest-room-5',
      'guest-room-2',
      'guest-room-12',
    ]);
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

function createBilledGuestTabSnapshot(
  overrides: Partial<{
    id: string;
    roomNumber: string;
    fullName: string;
    billedAt: string;
  }>,
) {
  return {
    id: overrides.id ?? 'guest-default',
    roomNumber: overrides.roomNumber ?? '101',
    fullName: overrides.fullName ?? 'Ada Lovelace',
    lineItems: [],
    totalCount: 0,
    totalPriceCents: 0,
    createdAt: '2026-04-01T08:00:00.000Z',
    updatedAt: '2026-04-01T08:30:00.000Z',
    billedAt: overrides.billedAt ?? '2026-04-01T09:00:00.000Z',
  };
}
