import { TestBed } from '@angular/core/testing';
import { vi } from 'vitest';

import { DRINK_TALLY_COPY } from '../drink-tally.copy';
import { DrinkCounts, SelectedGuestViewModel } from '../drink-tally.store';
import { SelectedGuestPanel } from './selected-guest-panel';

describe('SelectedGuestPanel', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SelectedGuestPanel],
    }).compileComponents();
  });

  it('should render the placeholder state when no guest is selected', async () => {
    const fixture = TestBed.createComponent(SelectedGuestPanel);

    fixture.componentRef.setInput('selectedGuest', null);
    fixture.componentRef.setInput('publicTotalCount', 7);
    fixture.componentRef.setInput('activeGuestCount', 2);
    fixture.componentRef.setInput('copy', {
      selectedGuestPanel: DRINK_TALLY_COPY.selectedGuestPanel,
      placeholder: DRINK_TALLY_COPY.placeholder,
    });
    fixture.detectChanges();
    await fixture.whenStable();

    const compiled = fixture.nativeElement as HTMLElement;

    expect(compiled.querySelector('[data-testid="selected-guest-panel"]')).toBeNull();
    expect(compiled.textContent).toContain('Choose a guest to start tallying.');
    expect(compiled.textContent).toContain('Total drinks');
    expect(compiled.textContent).toContain('Active guests');
  });

  it('should render the selected guest state and emit increment, decrement, and close actions', async () => {
    const fixture = TestBed.createComponent(SelectedGuestPanel);
    const incrementDrink = vi.fn();
    const decrementDrink = vi.fn();
    const close = vi.fn();

    fixture.componentInstance.incrementDrink.subscribe(incrementDrink);
    fixture.componentInstance.decrementDrink.subscribe(decrementDrink);
    fixture.componentInstance.close.subscribe(close);
    fixture.componentRef.setInput('selectedGuest', createSelectedGuestViewModel());
    fixture.componentRef.setInput('publicTotalCount', 4);
    fixture.componentRef.setInput('activeGuestCount', 1);
    fixture.componentRef.setInput('timeoutProgressPercent', '12.50%');
    fixture.componentRef.setInput('timeoutRingOffset', '12.50');
    fixture.componentRef.setInput('copy', {
      selectedGuestPanel: DRINK_TALLY_COPY.selectedGuestPanel,
      placeholder: DRINK_TALLY_COPY.placeholder,
    });
    fixture.detectChanges();
    await fixture.whenStable();

    const compiled = fixture.nativeElement as HTMLElement;
    const incrementButton = compiled.querySelector(
      'button[aria-label="Add one Water"]',
    ) as HTMLButtonElement | null;
    const decrementButton = compiled.querySelector(
      'button[aria-label="Remove one Water"]',
    ) as HTMLButtonElement | null;
    const closeButton = compiled.querySelector(
      '[data-testid="close-personal-tab"]',
    ) as HTMLButtonElement | null;

    expect(compiled.textContent).toContain('Ada Lovelace');
    expect(compiled.textContent).toContain('Tap to close now');

    incrementButton?.click();
    decrementButton?.click();
    closeButton?.click();

    expect(incrementDrink).toHaveBeenCalledWith('water');
    expect(decrementDrink).toHaveBeenCalledWith('water');
    expect(close).toHaveBeenCalledTimes(1);
  });

  it('should show a top shadow only after the selected guest panel is scrolled', async () => {
    const fixture = TestBed.createComponent(SelectedGuestPanel);

    fixture.componentRef.setInput('selectedGuest', createSelectedGuestViewModel());
    fixture.componentRef.setInput('publicTotalCount', 4);
    fixture.componentRef.setInput('activeGuestCount', 1);
    fixture.componentRef.setInput('copy', {
      selectedGuestPanel: DRINK_TALLY_COPY.selectedGuestPanel,
      placeholder: DRINK_TALLY_COPY.placeholder,
    });
    fixture.detectChanges();
    await fixture.whenStable();

    const compiled = fixture.nativeElement as HTMLElement;
    const scrollContainer = compiled.querySelector(
      '[data-testid="selected-guest-panel-scroll"]',
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

function createSelectedGuestViewModel(): SelectedGuestViewModel {
  const counts = buildCounts({ water: 2, beer: 1 });

  return {
    id: 'guest-1',
    roomNumber: '101',
    fullName: 'Ada Lovelace',
    counts,
    createdAt: '2026-04-01T08:00:00.000Z',
    updatedAt: '2026-04-02T10:00:00.000Z',
    totalCount: 3,
    drinkSummary: [
      { id: 'water', name: 'Water', count: 2 },
      { id: 'beer', name: 'Beer', count: 1 },
    ],
    drinkTallies: [
      { id: 'water', name: 'Water', count: 2, displayPrice: '€2.00' },
      { id: 'sparklingWater', name: 'Sparkling Water', count: 0, displayPrice: '€2.50' },
      { id: 'cola', name: 'Cola', count: 0, displayPrice: '€3.00' },
      { id: 'colaZero', name: 'Cola Zero', count: 0, displayPrice: '€3.00' },
      { id: 'lemonSoda', name: 'Lemon Soda', count: 0, displayPrice: '€3.00' },
      { id: 'orangeSoda', name: 'Orange Soda', count: 0, displayPrice: '€3.00' },
      { id: 'appleJuice', name: 'Apple Juice', count: 0, displayPrice: '€3.50' },
      { id: 'beer', name: 'Beer', count: 1, displayPrice: '€4.50' },
      { id: 'whiteWine', name: 'White Wine', count: 0, displayPrice: '€5.00' },
    ],
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
