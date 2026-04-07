import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { vi } from 'vitest';

import { DRINK_CATALOG } from '../catalog';
import { DrinkCounts, GUEST_TABS_STORAGE_KEY } from '../guest-tabs';
import { GUEST_TAB_INACTIVITY_TIMEOUT_MS, HostWorkspace } from './host-workspace';

describe('HostWorkspace', () => {
  beforeEach(async () => {
    localStorage.clear();

    await TestBed.configureTestingModule({
      imports: [HostWorkspace],
      providers: [provideRouter([])],
    }).compileComponents();
  });

  afterEach(() => {
    vi.useRealTimers();
    localStorage.clear();
  });

  it('should create the host workspace feature', () => {
    const fixture = TestBed.createComponent(HostWorkspace);
    const component = fixture.componentInstance;

    expect(component).toBeTruthy();
  });

  it('should compose the current drink tally screen while the migration continues', async () => {
    const fixture = TestBed.createComponent(HostWorkspace);
    fixture.detectChanges();
    await fixture.whenStable();

    const compiled = fixture.nativeElement as HTMLElement;

    expect(compiled.querySelector('nt-drink-tally')).not.toBeNull();
  });

  it('should render the public guest-tab screen by default', async () => {
    const fixture = TestBed.createComponent(HostWorkspace);
    fixture.detectChanges();
    await fixture.whenStable();

    const compiled = fixture.nativeElement as HTMLElement;

    expect(compiled.textContent).not.toContain(
      'Open your tab and tally drinks on the shared tablet.',
    );
    expect(compiled.querySelector('nt-page-shell')).not.toBeNull();
    expect(compiled.querySelector('nt-app-bar')?.textContent).toContain('Naud Tally');
    expect(compiled.textContent).toContain('Add yourself');
    expect(compiled.textContent).toContain('No guest tabs yet');
    expect(compiled.querySelector('[data-testid="add-yourself-button"]')).not.toBeNull();
    expect(compiled.querySelector('.entry-card')).toBeNull();
    expect(compiled.querySelector('[data-testid="selected-guest-panel"]')).toBeNull();
    expect(compiled.querySelector('[data-testid="empty-personal-panel"]')).not.toBeNull();
    expect(compiled.querySelector('nt-personal-panel-summary')).toBeNull();
  });

  it('should render only the placeholder copy when no guest is selected', async () => {
    const fixture = TestBed.createComponent(HostWorkspace);
    fixture.detectChanges();
    await fixture.whenStable();

    const compiled = fixture.nativeElement as HTMLElement;
    const placeholder = compiled.querySelector(
      '[data-testid="empty-personal-panel"]',
    ) as HTMLElement | null;
    const placeholderCopy = compiled.querySelector(
      '[data-testid="empty-personal-panel-copy"]',
    ) as HTMLElement | null;

    expect(placeholder?.firstElementChild).toBe(placeholderCopy);
    expect(placeholder?.children).toHaveLength(1);
    expect(placeholder?.querySelector('nt-personal-panel-summary')).toBeNull();
  });

  it('should not render the toolbar price reference on the public screen', async () => {
    const fixture = TestBed.createComponent(HostWorkspace);
    fixture.detectChanges();
    await fixture.whenStable();

    const compiled = fixture.nativeElement as HTMLElement;

    expect(compiled.querySelector('nt-drink-price-reference')).toBeNull();
    expect(compiled.textContent).not.toContain('Price reference');
    expect(compiled.textContent).not.toContain('€2.00');
  });

  it('should place the Add yourself action inside the active guest tabs header', async () => {
    const fixture = TestBed.createComponent(HostWorkspace);
    fixture.detectChanges();
    await fixture.whenStable();

    const compiled = fixture.nativeElement as HTMLElement;
    const sectionHeading = compiled.querySelector('.section-heading') as HTMLElement | null;
    const addYourselfButton = compiled.querySelector(
      '[data-testid="add-yourself-button"]',
    ) as HTMLButtonElement | null;

    expect(sectionHeading).not.toBeNull();
    expect(addYourselfButton).not.toBeNull();
    expect(sectionHeading?.contains(addYourselfButton)).toBe(true);

    addYourselfButton?.click();
    fixture.detectChanges();
    await fixture.whenStable();

    expect(compiled.querySelector('.entry-card')).not.toBeNull();
    expect(
      compiled.querySelector('.section-heading [data-testid="add-yourself-button"]'),
    ).toBeNull();
  });

  it('should open the personal tally panel when selecting an active guest', async () => {
    seedGuestTabs();

    const fixture = TestBed.createComponent(HostWorkspace);
    fixture.detectChanges();
    await fixture.whenStable();

    const compiled = fixture.nativeElement as HTMLElement;
    const guestButton = compiled.querySelector(
      'button[aria-label="Open tab for room 101, Ada Lovelace"]',
    ) as HTMLButtonElement | null;

    guestButton?.click();
    fixture.detectChanges();
    await fixture.whenStable();

    const selectedPanel = compiled.querySelector(
      '[data-testid="selected-guest-panel"]',
    ) as HTMLElement | null;
    const panelHeader = compiled.querySelector(
      '[data-testid="selected-guest-panel-header"]',
    ) as HTMLElement | null;
    const panelTotal = compiled.querySelector(
      '[data-testid="selected-guest-total"]',
    ) as HTMLElement | null;
    const panelScroll = compiled.querySelector(
      '[data-testid="selected-guest-panel-scroll"]',
    ) as HTMLElement | null;
    const activeDrinkSection = compiled.querySelector(
      '[data-testid="selected-guest-active-drinks-section"]',
    ) as HTMLElement | null;
    const availableDrinkSection = compiled.querySelector(
      '[data-testid="selected-guest-available-drinks-section"]',
    ) as HTMLElement | null;

    expect(selectedPanel?.textContent).toContain('Ada Lovelace');
    expect(panelHeader?.textContent).toContain('Ada Lovelace');
    expect(panelTotal?.textContent).toContain('Total drinks');
    expect(panelTotal?.textContent).toContain('4');
    expect(activeDrinkSection?.textContent).toContain('Your drinks');
    expect(availableDrinkSection?.textContent).toContain('Add a drink');
    expect(selectedPanel?.querySelector('nt-tally-stat-card')).toBeNull();
    expect(selectedPanel?.firstElementChild).toBe(panelHeader?.parentElement);
    expect(panelHeader?.parentElement?.nextElementSibling).toBe(panelScroll);
    expect(compiled.querySelector('[data-testid="inactivity-hint"]')).toBeNull();
    expect(compiled.querySelector('[data-testid="close-personal-tab"]')).toBeNull();
    expect(compiled.querySelector('[data-testid="empty-personal-panel"]')).toBeNull();
  });

  it('should deselect the active guest when the same guest card is clicked again', async () => {
    seedGuestTabs();

    const fixture = TestBed.createComponent(HostWorkspace);
    fixture.detectChanges();
    await fixture.whenStable();

    const compiled = fixture.nativeElement as HTMLElement;
    const guestButton = compiled.querySelector(
      'button[aria-label="Open tab for room 101, Ada Lovelace"]',
    ) as HTMLButtonElement | null;

    guestButton?.click();
    fixture.detectChanges();
    await fixture.whenStable();

    expect(compiled.querySelector('[data-testid="selected-guest-panel"]')).not.toBeNull();

    guestButton?.click();
    fixture.detectChanges();
    await fixture.whenStable();

    expect(compiled.querySelector('[data-testid="selected-guest-panel"]')).toBeNull();
    expect(compiled.querySelector('[data-testid="empty-personal-panel"]')).not.toBeNull();
  });

  it('should reset the inactivity timeout after interaction even without showing the hint', async () => {
    vi.useFakeTimers();
    seedGuestTabs();

    const fixture = TestBed.createComponent(HostWorkspace);
    fixture.detectChanges();
    await fixture.whenStable();

    const compiled = fixture.nativeElement as HTMLElement;
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

    expect(compiled.querySelector('[data-testid="selected-guest-panel"]')).not.toBeNull();

    await vi.advanceTimersByTimeAsync(GUEST_TAB_INACTIVITY_TIMEOUT_MS - 1);
    fixture.detectChanges();
    await fixture.whenStable();

    expect(compiled.querySelector('[data-testid="selected-guest-panel"]')).not.toBeNull();

    await vi.advanceTimersByTimeAsync(1);
    fixture.detectChanges();
    await fixture.whenStable();

    expect(compiled.querySelector('[data-testid="selected-guest-panel"]')).toBeNull();
  });

  it('should show a top shadow on the selected guest panel only after scrolling', async () => {
    seedGuestTabs();

    const fixture = TestBed.createComponent(HostWorkspace);
    fixture.detectChanges();
    await fixture.whenStable();

    const compiled = fixture.nativeElement as HTMLElement;
    const guestButton = compiled.querySelector(
      'button[aria-label="Open tab for room 101, Ada Lovelace"]',
    ) as HTMLButtonElement | null;

    guestButton?.click();
    fixture.detectChanges();
    await fixture.whenStable();

    const scrollContainer = compiled.querySelector(
      '[data-testid="selected-guest-panel-scroll"]',
    ) as HTMLDivElement | null;

    expect(scrollContainer?.classList.contains('nt-scroll-shadow--scrolled')).toBe(false);

    if (scrollContainer) {
      scrollContainer.scrollTop = 32;
      scrollContainer.dispatchEvent(new Event('scroll'));
    }

    fixture.detectChanges();

    expect(scrollContainer?.classList.contains('nt-scroll-shadow--scrolled')).toBe(true);

    if (scrollContainer) {
      scrollContainer.scrollTop = 0;
      scrollContainer.dispatchEvent(new Event('scroll'));
    }

    fixture.detectChanges();

    expect(scrollContainer?.classList.contains('nt-scroll-shadow--scrolled')).toBe(false);
  });

  it('should show a top shadow on the active guest list only after scrolling', async () => {
    seedGuestTabs();

    const fixture = TestBed.createComponent(HostWorkspace);
    fixture.detectChanges();
    await fixture.whenStable();

    const compiled = fixture.nativeElement as HTMLElement;
    const scrollContainer = compiled.querySelector(
      '[data-testid="active-guest-list-scroll"]',
    ) as HTMLDivElement | null;

    expect(scrollContainer?.classList.contains('nt-scroll-shadow--scrolled')).toBe(false);

    if (scrollContainer) {
      scrollContainer.scrollTop = 32;
      scrollContainer.dispatchEvent(new Event('scroll'));
    }

    fixture.detectChanges();

    expect(scrollContainer?.classList.contains('nt-scroll-shadow--scrolled')).toBe(true);

    if (scrollContainer) {
      scrollContainer.scrollTop = 0;
      scrollContainer.dispatchEvent(new Event('scroll'));
    }

    fixture.detectChanges();

    expect(scrollContainer?.classList.contains('nt-scroll-shadow--scrolled')).toBe(false);
  });

  it('should preserve both scroll shadows when selecting another guest', async () => {
    seedMultipleGuestTabs();

    const fixture = TestBed.createComponent(HostWorkspace);
    fixture.detectChanges();
    await fixture.whenStable();

    const compiled = fixture.nativeElement as HTMLElement;
    const firstGuestButton = compiled.querySelector(
      'button[aria-label="Open tab for room 101, Ada Lovelace"]',
    ) as HTMLButtonElement | null;

    firstGuestButton?.click();
    fixture.detectChanges();
    await fixture.whenStable();

    const guestListScroll = compiled.querySelector(
      '[data-testid="active-guest-list-scroll"]',
    ) as HTMLDivElement | null;
    const selectedPanelScroll = compiled.querySelector(
      '[data-testid="selected-guest-panel-scroll"]',
    ) as HTMLDivElement | null;

    if (guestListScroll) {
      guestListScroll.scrollTop = 32;
      guestListScroll.dispatchEvent(new Event('scroll'));
    }

    if (selectedPanelScroll) {
      selectedPanelScroll.scrollTop = 32;
      selectedPanelScroll.dispatchEvent(new Event('scroll'));
    }

    fixture.detectChanges();

    expect(guestListScroll?.classList.contains('nt-scroll-shadow--scrolled')).toBe(true);
    expect(selectedPanelScroll?.classList.contains('nt-scroll-shadow--scrolled')).toBe(true);

    const secondGuestButton = compiled.querySelector(
      'button[aria-label="Open tab for room 204, Grace Hopper"]',
    ) as HTMLButtonElement | null;

    secondGuestButton?.click();
    fixture.detectChanges();
    await fixture.whenStable();

    const nextGuestListScroll = compiled.querySelector(
      '[data-testid="active-guest-list-scroll"]',
    ) as HTMLDivElement | null;
    const nextSelectedPanelScroll = compiled.querySelector(
      '[data-testid="selected-guest-panel-scroll"]',
    ) as HTMLDivElement | null;

    expect(nextGuestListScroll?.classList.contains('nt-scroll-shadow--scrolled')).toBe(true);
    expect(nextSelectedPanelScroll?.classList.contains('nt-scroll-shadow--scrolled')).toBe(true);
  });

  it('should create and select a guest from the inline Add yourself flow', async () => {
    const fixture = TestBed.createComponent(HostWorkspace);
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
    expect(
      compiled.querySelector('[data-testid="selected-guest-active-drinks-section"]'),
    ).toBeNull();
    expect(
      compiled.querySelector('[data-testid="selected-guest-available-drinks-section"]')
        ?.textContent,
    ).toContain('Add a drink');
    expect(localStorage.getItem(GUEST_TABS_STORAGE_KEY)).toContain('"roomNumber":"204"');
  });

  it('should move a newly added drink from the add-drink section into Your drinks', async () => {
    const fixture = TestBed.createComponent(HostWorkspace);
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
    roomNumberInput!.value = '305';
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
    fullNameInput!.value = 'Katherine Johnson';
    fullNameInput?.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    const createTabButton = compiled.querySelector(
      '[data-testid="create-tab-button"]',
    ) as HTMLButtonElement | null;
    createTabButton?.click();
    fixture.detectChanges();
    await fixture.whenStable();

    expect(
      compiled.querySelector('[data-testid="selected-guest-active-drinks-section"]'),
    ).toBeNull();

    const addDrinkButton = compiled.querySelector(
      'button[aria-label="Add one Water"]',
    ) as HTMLButtonElement | null;

    addDrinkButton?.click();
    fixture.detectChanges();
    await fixture.whenStable();

    expect(
      compiled.querySelector('[data-testid="selected-guest-active-drinks-section"]'),
    ).not.toBeNull();
    expect(compiled.querySelector('button[aria-label="Remove one Water"]')).not.toBeNull();
  });

  it('should clear the selected guest after the inactivity timeout', async () => {
    vi.useFakeTimers();
    seedGuestTabs();

    const fixture = TestBed.createComponent(HostWorkspace);
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
    GUEST_TABS_STORAGE_KEY,
    JSON.stringify([
      {
        id: 'guest-1',
        roomNumber: '101',
        fullName: 'Ada Lovelace',
        counts: buildCounts({ sparklingWater: 1, water: 2, beer: 1 }),
        createdAt: '2026-04-01T08:00:00.000Z',
        updatedAt: '2026-04-02T10:00:00.000Z',
      },
    ]),
  );
}

function seedMultipleGuestTabs(): void {
  localStorage.setItem(
    GUEST_TABS_STORAGE_KEY,
    JSON.stringify([
      {
        id: 'guest-1',
        roomNumber: '101',
        fullName: 'Ada Lovelace',
        counts: buildCounts({ sparklingWater: 1, water: 2, beer: 1 }),
        createdAt: '2026-04-01T08:00:00.000Z',
        updatedAt: '2026-04-02T10:00:00.000Z',
      },
      {
        id: 'guest-2',
        roomNumber: '204',
        fullName: 'Grace Hopper',
        counts: buildCounts({ water: 1, whiteWine: 2 }),
        createdAt: '2026-04-02T08:00:00.000Z',
        updatedAt: '2026-04-03T10:00:00.000Z',
      },
    ]),
  );
}

function buildCounts(overrides: Partial<DrinkCounts>): DrinkCounts {
  return DRINK_CATALOG.reduce((counts, drink) => {
    counts[drink.id] = overrides[drink.id] ?? 0;
    return counts;
  }, {} as DrinkCounts);
}
