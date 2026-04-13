import type { DrinkId } from '../catalog';

export type DrinkCounts = Partial<Record<DrinkId, number>> & Record<string, number>;

export type GuestTab = {
  id: string;
  roomNumber: string;
  fullName: string;
  counts: DrinkCounts;
  drinkOrder: DrinkId[];
  createdAt: string;
  updatedAt: string;
};

const roomNumberCollator = new Intl.Collator(undefined, {
  numeric: true,
  sensitivity: 'base',
});

export function sortGuestTabs(guestTabs: GuestTab[]): GuestTab[] {
  return [...guestTabs].sort((left, right) => {
    const totalDifference = countDrinks(right.counts) - countDrinks(left.counts);

    if (totalDifference !== 0) {
      return totalDifference;
    }

    const roomDifference = roomNumberCollator.compare(left.roomNumber, right.roomNumber);

    if (roomDifference !== 0) {
      return roomDifference;
    }

    return left.fullName.localeCompare(right.fullName);
  });
}

export function countDrinks(counts: DrinkCounts): number {
  return Object.values(counts).reduce((total, count) => total + normalizeCountValue(count), 0);
}

export function roomNumbersMatch(left: unknown, right: unknown): boolean {
  const normalizedLeft = normalizeRoomNumber(left);
  const normalizedRight = normalizeRoomNumber(right);

  return normalizedLeft.length > 0 && normalizedLeft === normalizedRight;
}

export function getDrinkCount(counts: DrinkCounts, drinkId: string): number {
  return normalizeCountValue(counts[drinkId]);
}

export function normalizeDrinkOrder(
  value: unknown,
  counts: DrinkCounts,
): DrinkId[] {
  const normalizedOrder: DrinkId[] = [];
  const seen = new Set<string>();

  if (Array.isArray(value)) {
    for (const entry of value) {
      if (typeof entry !== 'string') {
        continue;
      }

      const normalizedEntry = entry.trim();

      if (!normalizedEntry || seen.has(normalizedEntry) || getDrinkCount(counts, normalizedEntry) <= 0) {
        continue;
      }

      normalizedOrder.push(normalizedEntry);
      seen.add(normalizedEntry);
    }
  }

  for (const drinkId of Object.keys(counts)) {
    if (seen.has(drinkId) || getDrinkCount(counts, drinkId) <= 0) {
      continue;
    }

    normalizedOrder.push(drinkId);
    seen.add(drinkId);
  }

  return normalizedOrder;
}

export function normalizeDisplayText(value: unknown): string {
  if (typeof value !== 'string') {
    return '';
  }

  return value.trim().replace(/\s+/g, ' ');
}

export function normalizeCountValue(value: unknown): number {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    return 0;
  }

  return Math.max(0, Math.trunc(value));
}

function normalizeRoomNumber(value: unknown): string {
  return normalizeDisplayText(value).toLowerCase();
}
