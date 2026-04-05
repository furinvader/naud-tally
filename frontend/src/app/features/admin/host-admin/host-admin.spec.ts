import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { vi } from 'vitest';

import { HostAdmin } from './host-admin';
import {
  DRINK_CATALOG,
  DRINK_TALLY_STORAGE_KEY,
  DrinkCounts,
} from '../../tally/drink-tally/drink-tally.store';

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

    const fixture = TestBed.createComponent(HostAdmin);
    fixture.detectChanges();
    await fixture.whenStable();

    const compiled = fixture.nativeElement as HTMLElement;

    expect(compiled.textContent).toContain('Host admin');
    expect(
      compiled.querySelector('[data-testid="host-summary-open-guests"]')?.textContent,
    ).toContain('1');
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

  it('should remove an unused drink and move a billed guest into history', async () => {
    vi.stubGlobal(
      'confirm',
      vi.fn(() => true),
    );
    seedOpenGuestTabs();

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

function seedOpenGuestTabs(): void {
  localStorage.setItem(
    DRINK_TALLY_STORAGE_KEY,
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

function buildCounts(overrides: Partial<DrinkCounts>): DrinkCounts {
  return DRINK_CATALOG.reduce((counts, drink) => {
    const count = overrides[drink.id];

    if (typeof count === 'number' && count > 0) {
      counts[drink.id] = count;
    }

    return counts;
  }, {} as DrinkCounts);
}
