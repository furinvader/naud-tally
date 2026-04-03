import { TestBed } from '@angular/core/testing';
import { vi } from 'vitest';

import { DrinkTally } from './drink-tally';
import {
  DRINK_CATALOG,
  DRINK_TALLY_STORAGE_KEY,
  DrinkCounts,
  GUEST_TAB_INACTIVITY_TIMEOUT_MS,
} from './drink-tally.store';

describe('DrinkTally', () => {
  beforeEach(async () => {
    localStorage.clear();

    await TestBed.configureTestingModule({
      imports: [DrinkTally],
    }).compileComponents();
  });

  afterEach(() => {
    vi.useRealTimers();
    localStorage.clear();
  });

  it('should create the feature', () => {
    const fixture = TestBed.createComponent(DrinkTally);
    const component = fixture.componentInstance;
    expect(component).toBeTruthy();
  });

  it('should render the public guest-tab screen by default', async () => {
    const fixture = TestBed.createComponent(DrinkTally);
    fixture.detectChanges();
    await fixture.whenStable();

    const compiled = fixture.nativeElement as HTMLElement;

    expect(compiled.textContent).not.toContain(
      'Open your tab and tally drinks on the shared tablet.',
    );
    expect(compiled.textContent).toContain('Add yourself');
    expect(compiled.textContent).toContain('No guest tabs yet');
    expect(compiled.querySelector('[data-testid="selected-guest-panel"]')).toBeNull();
    expect(compiled.querySelector('[data-testid="empty-personal-panel"]')?.textContent).toContain(
      'Total drinks',
    );
    expect(compiled.querySelector('[data-testid="empty-personal-panel"]')?.textContent).toContain(
      'Active guests',
    );
  });

  it('should place the placeholder copy before the merged summary block', async () => {
    const fixture = TestBed.createComponent(DrinkTally);
    fixture.detectChanges();
    await fixture.whenStable();

    const compiled = fixture.nativeElement as HTMLElement;
    const placeholder = compiled.querySelector(
      '[data-testid="empty-personal-panel"]',
    ) as HTMLElement | null;
    const placeholderCopy = compiled.querySelector(
      '[data-testid="empty-personal-panel-copy"]',
    ) as HTMLElement | null;
    const placeholderSummary = compiled.querySelector(
      '[data-testid="empty-personal-panel-summary"]',
    ) as HTMLElement | null;

    expect(placeholder?.firstElementChild).toBe(placeholderCopy);
    expect(placeholderCopy?.nextElementSibling).toBe(placeholderSummary);
  });

  it('should render a merged placeholder summary instead of separate stat cards', async () => {
    const fixture = TestBed.createComponent(DrinkTally);
    fixture.detectChanges();
    await fixture.whenStable();

    const compiled = fixture.nativeElement as HTMLElement;
    const placeholder = compiled.querySelector(
      '[data-testid="empty-personal-panel"]',
    ) as HTMLElement | null;
    const placeholderSummary = compiled.querySelector(
      '[data-testid="empty-personal-panel-summary"]',
    ) as HTMLElement | null;

    expect(placeholder?.querySelectorAll('nt-tally-stat-card')).toHaveLength(0);
    expect(placeholderSummary?.textContent).toContain('Total drinks');
    expect(placeholderSummary?.textContent).toContain('Active guests');
  });

  it('should show toolbar price chips for the fixed drink catalog', async () => {
    const fixture = TestBed.createComponent(DrinkTally);
    fixture.detectChanges();
    await fixture.whenStable();

    const compiled = fixture.nativeElement as HTMLElement;

    expect(compiled.textContent).toContain('Water');
    expect(compiled.textContent).toContain('€2.00');
    expect(compiled.textContent).toContain('White Wine');
    expect(compiled.textContent).toContain('€5.00');
  });

  it('should open the personal tally panel when selecting an active guest', async () => {
    seedGuestTabs();

    const fixture = TestBed.createComponent(DrinkTally);
    fixture.detectChanges();
    await fixture.whenStable();

    const compiled = fixture.nativeElement as HTMLElement;
    const guestButton = compiled.querySelector(
      'button[aria-label="Open tab for room 101, Ada Lovelace"]',
    ) as HTMLButtonElement | null;

    guestButton?.click();
    fixture.detectChanges();
    await fixture.whenStable();

    expect(compiled.querySelector('[data-testid="selected-guest-panel"]')?.textContent).toContain(
      'Ada Lovelace',
    );
    expect(compiled.textContent).toContain('This personal tab closes after 90 seconds of inactivity.');
    expect(compiled.querySelector('[data-testid="empty-personal-panel"]')).toBeNull();
  });

  it('should render and reset the inactivity countdown hint after interaction', async () => {
    vi.useFakeTimers();
    seedGuestTabs();

    const fixture = TestBed.createComponent(DrinkTally);
    fixture.detectChanges();
    await fixture.whenStable();

    const compiled = fixture.nativeElement as HTMLElement;
    const guestButton = compiled.querySelector(
      'button[aria-label="Open tab for room 101, Ada Lovelace"]',
    ) as HTMLButtonElement | null;

    guestButton?.click();
    fixture.detectChanges();
    await fixture.whenStable();

    const getHint = (): HTMLElement | null =>
      compiled.querySelector(
        '[data-testid="inactivity-hint"] .inactivity-hint',
      ) as HTMLElement | null;

    expect(compiled.querySelector('[data-testid="inactivity-progress-fill"]')).not.toBeNull();
    expect(compiled.querySelector('[data-testid="inactivity-progress-ring"]')).not.toBeNull();
    expect(getHint()?.style.getPropertyValue('--nt-timeout-progress')).toBe('0.00%');

    await vi.advanceTimersByTimeAsync(10_000);
    fixture.detectChanges();
    await fixture.whenStable();

    expect(getHint()?.style.getPropertyValue('--nt-timeout-progress')).not.toBe('0.00%');

    const incrementButton = compiled.querySelector(
      'button[aria-label="Add one Water"]',
    ) as HTMLButtonElement | null;

    incrementButton?.click();
    fixture.detectChanges();
    await fixture.whenStable();

    expect(getHint()?.style.getPropertyValue('--nt-timeout-progress')).toBe('0.00%');
  });

  it('should create and select a guest from the inline Add yourself flow', async () => {
    const fixture = TestBed.createComponent(DrinkTally);
    fixture.detectChanges();
    await fixture.whenStable();

    const compiled = fixture.nativeElement as HTMLElement;
    const addYourselfButton = compiled.querySelector(
      '[data-testid="add-yourself-button"]',
    ) as HTMLButtonElement | null;

    addYourselfButton?.click();
    fixture.detectChanges();

    const roomNumberInput = compiled.querySelector(
      '[data-testid="room-number-input"]',
    ) as HTMLInputElement | null;
    roomNumberInput!.value = '204';
    roomNumberInput?.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    const continueButton = compiled.querySelector(
      '[data-testid="room-number-continue"]',
    ) as HTMLButtonElement | null;
    continueButton?.click();
    fixture.detectChanges();

    const fullNameInput = compiled.querySelector(
      '[data-testid="full-name-input"]',
    ) as HTMLInputElement | null;
    fullNameInput!.value = 'Grace Hopper';
    fullNameInput?.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    const createTabButton = compiled.querySelector(
      '[data-testid="create-tab-button"]',
    ) as HTMLButtonElement | null;
    createTabButton?.click();
    fixture.detectChanges();
    await fixture.whenStable();

    expect(compiled.querySelector('[data-testid="selected-guest-panel"]')?.textContent).toContain(
      'Grace Hopper',
    );
    expect(localStorage.getItem(DRINK_TALLY_STORAGE_KEY)).toContain('"roomNumber":"204"');
  });

  it('should close the personal tally panel with the explicit close action', async () => {
    seedGuestTabs();

    const fixture = TestBed.createComponent(DrinkTally);
    fixture.detectChanges();
    await fixture.whenStable();

    const compiled = fixture.nativeElement as HTMLElement;
    const guestButton = compiled.querySelector(
      'button[aria-label="Open tab for room 101, Ada Lovelace"]',
    ) as HTMLButtonElement | null;

    guestButton?.click();
    fixture.detectChanges();

    const closeButton = compiled.querySelector(
      '[data-testid="close-personal-tab"]',
    ) as HTMLButtonElement | null;
    closeButton?.click();
    fixture.detectChanges();

    expect(compiled.querySelector('[data-testid="selected-guest-panel"]')).toBeNull();
    expect(compiled.textContent).toContain('Choose a guest to start tallying.');
  });

  it('should clear the selected guest after the inactivity timeout', async () => {
    vi.useFakeTimers();
    seedGuestTabs();

    const fixture = TestBed.createComponent(DrinkTally);
    fixture.detectChanges();
    await fixture.whenStable();

    const compiled = fixture.nativeElement as HTMLElement;
    const guestButton = compiled.querySelector(
      'button[aria-label="Open tab for room 101, Ada Lovelace"]',
    ) as HTMLButtonElement | null;

    guestButton?.click();
    fixture.detectChanges();
    await fixture.whenStable();

    await vi.advanceTimersByTimeAsync(GUEST_TAB_INACTIVITY_TIMEOUT_MS);
    fixture.detectChanges();
    await fixture.whenStable();

    expect(compiled.querySelector('[data-testid="selected-guest-panel"]')).toBeNull();
    expect(compiled.textContent).toContain('Choose a guest to start tallying.');
  });
});

function seedGuestTabs(): void {
  localStorage.setItem(
    DRINK_TALLY_STORAGE_KEY,
    JSON.stringify([
      {
        id: 'guest-1',
        roomNumber: '101',
        fullName: 'Ada Lovelace',
        counts: buildCounts({ water: 2, beer: 1 }),
        createdAt: '2026-04-01T08:00:00.000Z',
        updatedAt: '2026-04-02T10:00:00.000Z',
      },
    ]),
  );
}

function buildCounts(overrides: Partial<DrinkCounts>): DrinkCounts {
  return DRINK_CATALOG.reduce(
    (counts, drink) => {
      counts[drink.id] = overrides[drink.id] ?? 0;
      return counts;
    },
    {} as DrinkCounts,
  );
}
