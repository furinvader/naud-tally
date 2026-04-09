import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { vi } from 'vitest';

import { DRINK_CATALOG } from '../catalog';
import { DrinkCounts, GUEST_TABS_STORAGE_KEY } from '../guest-tabs';
import { ROOMS_STORAGE_KEY } from '../rooms';
import { GUEST_TAB_INACTIVITY_TIMEOUT_MS, OrderEntry } from './order-entry';

describe('OrderEntry', () => {
  beforeEach(async () => {
    localStorage.clear();

    await TestBed.configureTestingModule({
      imports: [OrderEntry],
      providers: [provideRouter([])],
    }).compileComponents();
  });

  afterEach(() => {
    vi.useRealTimers();
    localStorage.clear();
  });

  it('should render the no-rooms empty state by default', async () => {
    const fixture = TestBed.createComponent(OrderEntry);
    fixture.detectChanges();
    await fixture.whenStable();

    const compiled = fixture.nativeElement as HTMLElement;
    const pageShell = compiled.querySelector('nt-page-shell');

    expect(pageShell).not.toBeNull();
    expect(pageShell?.classList.contains('nt-page-shell--body-fixed')).toBe(true);
    expect(compiled.querySelector('nt-app-bar')?.textContent).toContain('Order entry');
    expect(compiled.querySelector('[data-testid="no-rooms-empty-state"]')).not.toBeNull();
    expect(compiled.querySelector('[data-testid="room-list-scroll"]')).toBeNull();
    expect(compiled.querySelector('[data-testid="no-rooms-host-tools-link"]')).not.toBeNull();
    expect(compiled.querySelector('nt-drink-tally')).toBeNull();
  });

  it('should render the room list and placeholders when rooms are configured', async () => {
    seedRooms();

    const fixture = TestBed.createComponent(OrderEntry);
    fixture.detectChanges();
    await fixture.whenStable();

    const compiled = fixture.nativeElement as HTMLElement;

    expect(compiled.querySelector('[data-testid="room-list-scroll"]')).not.toBeNull();
    expect(compiled.textContent).toContain('Choose a room');
    expect(compiled.querySelector('button[aria-label="Open room 101"]')?.textContent).toContain(
      '101',
    );
    expect(compiled.querySelector('[data-testid="no-room-selected"]')).not.toBeNull();
    expect(compiled.querySelector('[data-testid="no-room-order-panel"]')).not.toBeNull();
  });

  it('should let the host add a guest after selecting a room', async () => {
    seedRooms();

    const fixture = TestBed.createComponent(OrderEntry);
    fixture.detectChanges();
    await fixture.whenStable();

    const compiled = fixture.nativeElement as HTMLElement;
    const roomButton = compiled.querySelector(
      'button[aria-label="Open room 101"]',
    ) as HTMLButtonElement | null;

    roomButton?.click();
    fixture.detectChanges();
    await fixture.whenStable();

    const addGuestButton = compiled.querySelector(
      '[data-testid="open-guest-draft-button"]',
    ) as HTMLButtonElement | null;

    addGuestButton?.click();
    fixture.detectChanges();
    await fixture.whenStable();

    const guestInput = compiled.querySelector(
      '[data-testid="guest-name-input"]',
    ) as HTMLInputElement | null;

    if (guestInput) {
      guestInput.value = 'Ada Lovelace';
      guestInput.dispatchEvent(new Event('input'));
    }

    fixture.detectChanges();

    const submitButton = compiled.querySelector(
      '[data-testid="submit-guest-draft-button"]',
    ) as HTMLButtonElement | null;

    submitButton?.click();
    fixture.detectChanges();
    await fixture.whenStable();

    expect(compiled.querySelector('[data-testid="selected-guest-panel"]')?.textContent).toContain(
      'Ada Lovelace',
    );
    expect(compiled.querySelector('[data-testid="selected-guest-panel"]')?.textContent).toContain(
      'Room 101',
    );
  });

  it('should render existing room guests and let the host increment a drink count', async () => {
    seedRooms();
    seedGuestTabs();

    const fixture = TestBed.createComponent(OrderEntry);
    fixture.detectChanges();
    await fixture.whenStable();

    const compiled = fixture.nativeElement as HTMLElement;
    const roomButton = compiled.querySelector(
      'button[aria-label="Open room 101"]',
    ) as HTMLButtonElement | null;

    roomButton?.click();
    fixture.detectChanges();
    await fixture.whenStable();

    const guestButton = compiled.querySelector(
      'button[aria-label="Open tab for room 101, Ada Lovelace"]',
    ) as HTMLButtonElement | null;

    guestButton?.click();
    fixture.detectChanges();
    await fixture.whenStable();

    const incrementButton = compiled.querySelector(
      'button[aria-label="Add one Water"]',
    ) as HTMLButtonElement | null;

    incrementButton?.click();
    fixture.detectChanges();
    await fixture.whenStable();

    expect(compiled.querySelector('[data-testid="selected-guest-total-count"]')?.textContent).toContain(
      '2',
    );
  });

  it('should reset the inactivity timeout after interaction and clear the transient state', async () => {
    vi.useFakeTimers();
    seedRooms();
    seedGuestTabs();

    const fixture = TestBed.createComponent(OrderEntry);
    fixture.detectChanges();
    await fixture.whenStable();

    const compiled = fixture.nativeElement as HTMLElement;
    const roomButton = compiled.querySelector(
      'button[aria-label="Open room 101"]',
    ) as HTMLButtonElement | null;

    roomButton?.click();
    fixture.detectChanges();
    await fixture.whenStable();

    const guestButton = compiled.querySelector(
      'button[aria-label="Open tab for room 101, Ada Lovelace"]',
    ) as HTMLButtonElement | null;

    guestButton?.click();
    fixture.detectChanges();
    await fixture.whenStable();

    await vi.advanceTimersByTimeAsync(10_000);

    const incrementButton = compiled.querySelector(
      'button[aria-label="Add one Water"]',
    ) as HTMLButtonElement | null;

    incrementButton?.click();
    fixture.detectChanges();
    await fixture.whenStable();

    await vi.advanceTimersByTimeAsync(GUEST_TAB_INACTIVITY_TIMEOUT_MS - 1);
    fixture.detectChanges();
    await fixture.whenStable();

    expect(compiled.querySelector('[data-testid="selected-guest-panel"]')).not.toBeNull();

    await vi.advanceTimersByTimeAsync(1);
    fixture.detectChanges();
    await fixture.whenStable();

    expect(compiled.querySelector('[data-testid="selected-guest-panel"]')).toBeNull();
    expect(compiled.querySelector('[data-testid="no-room-selected"]')).not.toBeNull();
  });
});

function seedRooms(): void {
  localStorage.setItem(
    ROOMS_STORAGE_KEY,
    JSON.stringify([
      {
        id: 'room-101',
        roomNumber: '101',
        createdAt: '2026-04-01T08:00:00.000Z',
        updatedAt: '2026-04-01T08:00:00.000Z',
      },
      {
        id: 'room-102',
        roomNumber: '102',
        createdAt: '2026-04-01T08:05:00.000Z',
        updatedAt: '2026-04-01T08:05:00.000Z',
      },
    ]),
  );
}

function seedGuestTabs(): void {
  localStorage.setItem(
    GUEST_TABS_STORAGE_KEY,
    JSON.stringify([
      {
        id: 'guest-ada',
        roomNumber: '101',
        fullName: 'Ada Lovelace',
        counts: buildCounts({ water: 1 }),
        createdAt: '2026-04-01T08:00:00.000Z',
        updatedAt: '2026-04-01T08:30:00.000Z',
      },
      {
        id: 'guest-grace',
        roomNumber: '102',
        fullName: 'Grace Hopper',
        counts: buildCounts({ beer: 1 }),
        createdAt: '2026-04-01T08:10:00.000Z',
        updatedAt: '2026-04-01T08:40:00.000Z',
      },
    ]),
  );
}

function buildCounts(overrides: Partial<DrinkCounts>): DrinkCounts {
  return DRINK_CATALOG.reduce((counts, drink) => {
    const count = overrides[drink.id];

    if (typeof count === 'number' && count > 0) {
      counts[drink.id] = count;
    }

    return counts;
  }, {} as DrinkCounts);
}
