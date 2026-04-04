import { TestBed } from '@angular/core/testing';
import { vi } from 'vitest';

import { DRINK_TALLY_COPY } from '../drink-tally.copy';
import { DrinkCounts, GuestCardViewModel } from '../drink-tally.store';
import { ActiveGuestListPanel } from './active-guest-list-panel';

describe('ActiveGuestListPanel', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ActiveGuestListPanel],
    }).compileComponents();
  });

  it('should show the Add yourself action only when the entry flow is closed and emit on click', async () => {
    const fixture = TestBed.createComponent(ActiveGuestListPanel);
    const startAddGuest = vi.fn();

    fixture.componentInstance.startAddGuest.subscribe(startAddGuest);
    fixture.componentRef.setInput('guests', []);
    fixture.componentRef.setInput('copy', DRINK_TALLY_COPY.activeGuestList);
    fixture.componentRef.setInput('entryOpen', false);
    fixture.detectChanges();
    await fixture.whenStable();

    const compiled = fixture.nativeElement as HTMLElement;
    const addYourselfButton = compiled.querySelector(
      '[data-testid="add-yourself-button"]',
    ) as HTMLButtonElement | null;

    expect(addYourselfButton).not.toBeNull();

    addYourselfButton?.click();

    expect(startAddGuest).toHaveBeenCalledTimes(1);

    fixture.componentRef.setInput('entryOpen', true);
    fixture.detectChanges();

    expect(compiled.querySelector('[data-testid="add-yourself-button"]')).toBeNull();
  });

  it('should render the empty state when there are no active guests', async () => {
    const fixture = TestBed.createComponent(ActiveGuestListPanel);

    fixture.componentRef.setInput('guests', []);
    fixture.componentRef.setInput('copy', DRINK_TALLY_COPY.activeGuestList);
    fixture.detectChanges();
    await fixture.whenStable();

    const compiled = fixture.nativeElement as HTMLElement;

    expect(compiled.textContent).toContain('No guest tabs yet');
    expect(compiled.querySelector('nt-guest-tab-card')).toBeNull();
  });

  it('should render guests and emit the selected guest id', async () => {
    const fixture = TestBed.createComponent(ActiveGuestListPanel);
    const selectGuest = vi.fn();
    const guest = createGuestCardViewModel({
      id: 'guest-1',
      roomNumber: '101',
      fullName: 'Ada Lovelace',
      totalCount: 2,
    });

    fixture.componentInstance.selectGuest.subscribe(selectGuest);
    fixture.componentRef.setInput('guests', [guest]);
    fixture.componentRef.setInput('selectedGuestId', 'guest-1');
    fixture.componentRef.setInput('copy', DRINK_TALLY_COPY.activeGuestList);
    fixture.detectChanges();
    await fixture.whenStable();

    const compiled = fixture.nativeElement as HTMLElement;
    const guestButton = compiled.querySelector(
      'button[aria-label="Open tab for room 101, Ada Lovelace"]',
    ) as HTMLButtonElement | null;

    expect(guestButton?.classList.contains('guest-card--selected')).toBe(true);

    guestButton?.click();

    expect(selectGuest).toHaveBeenCalledWith('guest-1');
  });

  it('should show a top shadow only after the guest list is scrolled', async () => {
    const fixture = TestBed.createComponent(ActiveGuestListPanel);

    fixture.componentRef.setInput('guests', [
      createGuestCardViewModel({
        id: 'guest-1',
        roomNumber: '101',
        fullName: 'Ada Lovelace',
        totalCount: 2,
      }),
    ]);
    fixture.componentRef.setInput('copy', DRINK_TALLY_COPY.activeGuestList);
    fixture.detectChanges();
    await fixture.whenStable();

    const compiled = fixture.nativeElement as HTMLElement;
    const scrollContainer = compiled.querySelector(
      '[data-testid="active-guest-list-scroll"]',
    ) as HTMLDivElement | null;

    expect(scrollContainer?.classList.contains('nt-scroll-shadow--scrolled')).toBe(false);

    if (scrollContainer) {
      scrollContainer.scrollTop = 24;
      scrollContainer.dispatchEvent(new Event('scroll'));
    }

    fixture.detectChanges();

    expect(scrollContainer?.classList.contains('nt-scroll-shadow--scrolled')).toBe(true);
  });
});

function createGuestCardViewModel(overrides: {
  id: string;
  roomNumber: string;
  fullName: string;
  totalCount: number;
}): GuestCardViewModel {
  const counts = buildCounts({ water: overrides.totalCount });

  return {
    id: overrides.id,
    roomNumber: overrides.roomNumber,
    fullName: overrides.fullName,
    counts,
    createdAt: '2026-04-01T08:00:00.000Z',
    updatedAt: '2026-04-02T10:00:00.000Z',
    totalCount: overrides.totalCount,
    drinkSummary: [{ id: 'water', name: 'Water', count: overrides.totalCount }],
  };
}

function buildCounts(overrides: Partial<DrinkCounts>): DrinkCounts {
  return {
    water: overrides.water ?? 0,
    sparklingWater: overrides.sparklingWater ?? 0,
    cola: overrides.cola ?? 0,
    colaZero: overrides.colaZero ?? 0,
    lemonSoda: overrides.lemonSoda ?? 0,
    orangeSoda: overrides.orangeSoda ?? 0,
    appleJuice: overrides.appleJuice ?? 0,
    beer: overrides.beer ?? 0,
    whiteWine: overrides.whiteWine ?? 0,
  };
}
