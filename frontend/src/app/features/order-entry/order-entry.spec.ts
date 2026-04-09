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
    expect(compiled.querySelector('[data-testid="step-nav-room"]')).toBeNull();
    expect(compiled.querySelector('[data-testid="no-rooms-host-tools-link"]')).not.toBeNull();
  });

  it('should start on the room step and keep later steps disabled until selections exist', async () => {
    seedRooms();

    const fixture = TestBed.createComponent(OrderEntry);
    fixture.detectChanges();
    await fixture.whenStable();

    const compiled = fixture.nativeElement as HTMLElement;
    const roomStepButton = compiled.querySelector(
      '[data-testid="step-nav-room"]',
    ) as HTMLButtonElement | null;
    const guestStepButton = compiled.querySelector(
      '[data-testid="step-nav-guest"]',
    ) as HTMLButtonElement | null;
    const drinksStepButton = compiled.querySelector(
      '[data-testid="step-nav-drinks"]',
    ) as HTMLButtonElement | null;

    expect(compiled.querySelector('[data-testid="room-step-panel"]')).not.toBeNull();
    expect(compiled.querySelector('[data-testid="guest-step-panel"]')).toBeNull();
    expect(compiled.querySelector('[data-testid="drinks-step-panel"]')).toBeNull();
    expect(compiled.querySelector('[data-testid="room-list-scroll"]')).not.toBeNull();
    expect(roomStepButton?.getAttribute('aria-current')).toBe('step');
    expect(guestStepButton?.disabled).toBe(true);
    expect(drinksStepButton?.disabled).toBe(true);
  });

  it('should auto-advance to the guest step after selecting a room', async () => {
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

    const guestStepButton = compiled.querySelector(
      '[data-testid="step-nav-guest"]',
    ) as HTMLButtonElement | null;
    const drinksStepButton = compiled.querySelector(
      '[data-testid="step-nav-drinks"]',
    ) as HTMLButtonElement | null;

    expect(compiled.querySelector('[data-testid="room-step-panel"]')).toBeNull();
    expect(compiled.querySelector('[data-testid="guest-step-panel"]')).not.toBeNull();
    expect(compiled.querySelector('[data-testid="drinks-step-panel"]')).toBeNull();
    expect(compiled.querySelector('[data-testid="open-guest-draft-button"]')).not.toBeNull();
    expect(guestStepButton?.getAttribute('aria-current')).toBe('step');
    expect(guestStepButton?.disabled).toBe(false);
    expect(drinksStepButton?.disabled).toBe(true);
  });

  it('should let the host add a guest and advance to the drinks step', async () => {
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

    const drinksStepButton = compiled.querySelector(
      '[data-testid="step-nav-drinks"]',
    ) as HTMLButtonElement | null;

    expect(compiled.querySelector('[data-testid="guest-step-panel"]')).toBeNull();
    expect(compiled.querySelector('[data-testid="drinks-step-panel"]')).not.toBeNull();
    expect(compiled.querySelector('[data-testid="selected-guest-panel"]')?.textContent).toContain(
      'Ada Lovelace',
    );
    expect(compiled.querySelector('[data-testid="selected-guest-panel"]')?.textContent).toContain(
      'Room 101',
    );
    expect(drinksStepButton?.getAttribute('aria-current')).toBe('step');
  });

  it('should let the host reopen the guest step and return to drinks for the same guest', async () => {
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

    const guestStepButton = compiled.querySelector(
      '[data-testid="step-nav-guest"]',
    ) as HTMLButtonElement | null;

    guestStepButton?.click();
    fixture.detectChanges();
    await fixture.whenStable();

    const reopenedGuestButton = compiled.querySelector(
      'button[aria-label="Open tab for room 101, Ada Lovelace"]',
    ) as HTMLButtonElement | null;

    expect(compiled.querySelector('[data-testid="guest-step-panel"]')).not.toBeNull();
    expect(compiled.querySelector('[data-testid="drinks-step-panel"]')).toBeNull();
    expect(reopenedGuestButton?.classList.contains('selection-card--selected')).toBe(true);

    reopenedGuestButton?.click();
    fixture.detectChanges();
    await fixture.whenStable();

    expect(compiled.querySelector('[data-testid="guest-step-panel"]')).toBeNull();
    expect(compiled.querySelector('[data-testid="drinks-step-panel"]')).not.toBeNull();
  });

  it('should let the host go back without warning and change the room context', async () => {
    const confirmSpy = vi.spyOn(window, 'confirm');
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

    const roomStepButton = compiled.querySelector(
      '[data-testid="step-nav-room"]',
    ) as HTMLButtonElement | null;

    roomStepButton?.click();
    fixture.detectChanges();
    await fixture.whenStable();

    expect(confirmSpy).not.toHaveBeenCalled();
    expect(compiled.querySelector('[data-testid="room-step-panel"]')).not.toBeNull();
    expect(compiled.querySelector('[data-testid="drinks-step-panel"]')).toBeNull();

    const otherRoomButton = compiled.querySelector(
      'button[aria-label="Open room 102"]',
    ) as HTMLButtonElement | null;

    otherRoomButton?.click();
    fixture.detectChanges();
    await fixture.whenStable();

    const drinksStepButton = compiled.querySelector(
      '[data-testid="step-nav-drinks"]',
    ) as HTMLButtonElement | null;

    expect(compiled.querySelector('[data-testid="guest-step-panel"]')).not.toBeNull();
    expect(compiled.querySelector('[data-testid="selected-guest-panel"]')).toBeNull();
    expect(compiled.querySelector('button[aria-label="Open tab for room 101, Ada Lovelace"]')).toBeNull();
    expect(compiled.querySelector('button[aria-label="Open tab for room 102, Grace Hopper"]')).not.toBeNull();
    expect(drinksStepButton?.disabled).toBe(true);

    confirmSpy.mockRestore();
  });

  it('should reset the inactivity timeout after interaction and return to the room step', async () => {
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

    const guestStepButton = compiled.querySelector(
      '[data-testid="step-nav-guest"]',
    ) as HTMLButtonElement | null;

    expect(compiled.querySelector('[data-testid="selected-guest-panel"]')).toBeNull();
    expect(compiled.querySelector('[data-testid="room-step-panel"]')).not.toBeNull();
    expect(guestStepButton?.disabled).toBe(true);
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
