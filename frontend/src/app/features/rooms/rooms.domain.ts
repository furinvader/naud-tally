export type Room = {
  id: string;
  roomNumber: string;
  createdAt: string;
  updatedAt: string;
};

const roomNumberCollator = new Intl.Collator(undefined, {
  numeric: true,
  sensitivity: 'base',
});

export function sortRooms(rooms: Room[]): Room[] {
  return [...rooms].sort((left, right) =>
    roomNumberCollator.compare(left.roomNumber, right.roomNumber),
  );
}

export function normalizeDisplayText(value: unknown): string {
  if (typeof value !== 'string') {
    return '';
  }

  return value.trim().replace(/\s+/g, ' ');
}
