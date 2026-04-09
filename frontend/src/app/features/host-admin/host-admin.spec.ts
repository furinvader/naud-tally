import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { vi } from 'vitest';

import { DRINK_CATALOG } from '../catalog';
import { DrinkCounts, GUEST_TABS_STORAGE_KEY } from '../guest-tabs';
import { ROOMS_STORAGE_KEY } from '../rooms';
import { HostAdmin } from './host-admin';

describe('HostAdmin', () => {
  beforeEach(async () => {
    localStorage.clear();

    await TestBed.configureTestingModule({
      imports: [HostAdmin],
      providers: [provideRouter([{ path: '', component: HostAdmin }])],
    }).compileComponents();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    localStorage.clear();
  });

  it('should render the host admin summary and guest billing list', async () => {
    seedOpenGuestTabs();
    seedRooms();

    const fixture = TestBed.createComponent(HostAdmin);
    fixture.detectChanges();
    await fixture.whenStable();

    const compiled = fixture.nativeElement as HTMLElement;

    expect(compiled.querySelector('nt-page-shell')).not.toBeNull();
    expect(compiled.querySelector('nt-app-bar')?.textContent).toContain('Host route');
    expect(compiled.textContent).toContain('Host admin');
    expect(
      compiled.querySelector('[data-testid="host-summary-active-rooms"]')?.textContent,
    ).toContain('2');
    expect(
      compiled.querySelector('[data-testid="host-summary-open-guests"]')?.textContent,
    ).toContain('1');
    expect(compiled.querySelector('[data-testid="host-room-list"]')?.textContent).toContain(
      'Room 101',
    );
    expect(compiled.querySelector('[data-testid="host-open-guest-list"]')?.textContent).toContain(
      'Ada Lovelace',
    );
    expect(compiled.querySelector('[data-testid="host-open-guest-list"]')?.textContent).toContain(
      '€6.50',
    );
  });

  it('should let the host add a new drink to the live catalog', async () => {
    const fixture = TestBed.createComponent(HostAdmin);
    fixture.detectChanges();
    await fixture.whenStable();

    const compiled = fixture.nativeElement as HTMLElement;
    const nameInput = compiled.querySelector(
      '[data-testid="host-drink-name-input"]',
    ) as HTMLInputElement | null;
    const priceInput = compiled.querySelector(
      '[data-testid="host-drink-price-input"]',
    ) as HTMLInputElement | null;
    const submitButton = compiled.querySelector(
      '[data-testid="host-add-drink-button"]',
    ) as HTMLButtonElement | null;

    if (nameInput) {
      nameInput.value = 'Iced Tea';
      nameInput.dispatchEvent(new Event('input'));
    }

    if (priceInput) {
      priceInput.value = '4.20';
      priceInput.dispatchEvent(new Event('input'));
    }

    fixture.detectChanges();

    submitButton?.click();
    fixture.detectChanges();
    await fixture.whenStable();

    expect(compiled.querySelector('[data-testid="host-active-drink-list"]')?.textContent).toContain(
      'Iced Tea',
    );
    expect(compiled.querySelector('[data-testid="host-active-drink-list"]')?.textContent).toContain(
      '€4.20',
    );
    expect(compiled.querySelector('[data-testid="host-flash-message"]')?.textContent).toContain(
      'Drink added to the live catalog.',
    );
  });

  it('should let the host add a new room to the live room list', async () => {
    const fixture = TestBed.createComponent(HostAdmin);
    fixture.detectChanges();
    await fixture.whenStable();

    const compiled = fixture.nativeElement as HTMLElement;
    const roomInput = compiled.querySelector(
      '[data-testid="host-room-number-input"]',
    ) as HTMLInputElement | null;
    const submitButton = compiled.querySelector(
      '[data-testid="host-add-room-button"]',
    ) as HTMLButtonElement | null;

    if (roomInput) {
      roomInput.value = '204';
      roomInput.dispatchEvent(new Event('input'));
    }

    fixture.detectChanges();

    submitButton?.click();
    fixture.detectChanges();
    await fixture.whenStable();

    expect(compiled.querySelector('[data-testid="host-room-list"]')?.textContent).toContain(
      'Room 204',
    );
    expect(compiled.querySelector('[data-testid="host-flash-message"]')?.textContent).toContain(
      'Room added to the live room list.',
    );
  });

  it('should keep room removal disabled when open tabs only differ by room-number casing', async () => {
    seedMixedCaseRooms();
    seedMixedCaseGuestTabs();

    const fixture = TestBed.createComponent(HostAdmin);
    fixture.detectChanges();
    await fixture.whenStable();

    const compiled = fixture.nativeElement as HTMLElement;
    const roomItems = [...compiled.querySelectorAll('[data-testid="host-room-list"] .catalog-item')];
    const mixedCaseRoom = roomItems.find((item) => item.textContent?.includes('Room 1A'));
    const removeButton = mixedCaseRoom?.querySelector(
      '[data-testid="host-remove-room-button"]',
    ) as HTMLButtonElement | null;

    expect(
      compiled.querySelector('[data-testid="host-summary-open-guests"]')?.textContent,
    ).toContain('1');
    expect(mixedCaseRoom?.textContent).toContain('1');
    expect(removeButton?.disabled).toBe(true);
  });

  it('should remove an unused drink and move a billed guest into history', async () => {
    vi.stubGlobal(
      'confirm',
      vi.fn(() => true),
    );
    seedOpenGuestTabs();
    seedRooms();

    const fixture = TestBed.createComponent(HostAdmin);
    fixture.detectChanges();
    await fixture.whenStable();

    const compiled = fixture.nativeElement as HTMLElement;
    const activeDrinkList = compiled.querySelector(
      '[data-testid="host-active-drink-list"]',
    ) as HTMLElement | null;
    const removeButtons = compiled.querySelectorAll(
      '[data-testid="host-remove-drink-button"]',
    ) as NodeListOf<HTMLButtonElement>;
    const sparklingWaterButton = [...removeButtons].find((button) =>
      button.closest('.catalog-item')?.textContent?.includes('Sparkling Water'),
    );

    sparklingWaterButton?.click();
    fixture.detectChanges();
    await fixture.whenStable();

    expect(activeDrinkList?.textContent).not.toContain('Sparkling Water');
    expect(
      compiled.querySelector('[data-testid="host-removed-drink-list"]')?.textContent,
    ).toContain('Sparkling Water');

    const billButton = compiled.querySelector(
      '[data-testid="host-bill-guest-button"]',
    ) as HTMLButtonElement | null;

    billButton?.click();
    fixture.detectChanges();
    await fixture.whenStable();

    expect(compiled.querySelector('[data-testid="host-open-guest-empty"]')).not.toBeNull();
    expect(compiled.querySelector('[data-testid="host-billed-guest-list"]')?.textContent).toContain(
      'Ada Lovelace',
    );
    expect(compiled.querySelector('[data-testid="host-billed-guest-list"]')?.textContent).toContain(
      '€6.50',
    );
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

function seedMixedCaseRooms(): void {
  localStorage.setItem(
    ROOMS_STORAGE_KEY,
    JSON.stringify([
      {
        id: 'room-1A',
        roomNumber: '1A',
        createdAt: '2026-04-01T08:00:00.000Z',
        updatedAt: '2026-04-01T08:00:00.000Z',
      },
    ]),
  );
}

function seedOpenGuestTabs(): void {
  localStorage.setItem(
    GUEST_TABS_STORAGE_KEY,
    JSON.stringify([
      {
        id: 'guest-ada',
        roomNumber: '101',
        fullName: 'Ada Lovelace',
        counts: buildCounts({ beer: 1, water: 1 }),
        createdAt: '2026-04-01T08:00:00.000Z',
        updatedAt: '2026-04-01T08:30:00.000Z',
      },
    ]),
  );
}

function seedMixedCaseGuestTabs(): void {
  localStorage.setItem(
    GUEST_TABS_STORAGE_KEY,
    JSON.stringify([
      {
        id: 'guest-ada',
        roomNumber: '1a',
        fullName: 'Ada Lovelace',
        counts: buildCounts({ beer: 1, water: 1 }),
        createdAt: '2026-04-01T08:00:00.000Z',
        updatedAt: '2026-04-01T08:30:00.000Z',
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
