import { TestBed } from '@angular/core/testing';
import { vi } from 'vitest';

import { DRINK_TALLY_COPY } from '../drink-tally.copy';
import {
  AvailableDrinkReference,
  DrinkCounts,
  SelectedGuestDrinkTally,
  SelectedGuestViewModel,
} from '../drink-tally.store';
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
    fixture.componentRef.setInput('copy', {
      selectedGuestPanel: DRINK_TALLY_COPY.selectedGuestPanel,
      placeholder: DRINK_TALLY_COPY.placeholder,
    });
    fixture.detectChanges();
    await fixture.whenStable();

    const compiled = fixture.nativeElement as HTMLElement;

    expect(compiled.querySelector('[data-testid="selected-guest-panel"]')).toBeNull();
    expect(compiled.textContent).toContain('Choose a guest to start tallying.');
    expect(compiled.querySelector('nt-personal-panel-summary')).toBeNull();
    expect(compiled.textContent).not.toContain('Across all active guest tabs');
  });

  it('should render the selected guest state and emit increment and decrement actions', async () => {
    const fixture = TestBed.createComponent(SelectedGuestPanel);
    const incrementDrink = vi.fn();
    const decrementDrink = vi.fn();

    fixture.componentInstance.incrementDrink.subscribe(incrementDrink);
    fixture.componentInstance.decrementDrink.subscribe(decrementDrink);
    fixture.componentRef.setInput('selectedGuest', createSelectedGuestViewModel());
    fixture.componentRef.setInput('copy', {
      selectedGuestPanel: DRINK_TALLY_COPY.selectedGuestPanel,
      placeholder: DRINK_TALLY_COPY.placeholder,
    });
    fixture.detectChanges();
    await fixture.whenStable();

    const compiled = fixture.nativeElement as HTMLElement;
    const addDrinkButton = compiled.querySelector(
      'button[aria-label="Add one Cola"]',
    ) as HTMLButtonElement | null;
    const decrementButton = compiled.querySelector(
      'button[aria-label="Remove one Water"]',
    ) as HTMLButtonElement | null;

    expect(compiled.textContent).toContain('Ada Lovelace');
    expect(
      compiled.querySelector('[data-testid="selected-guest-active-drinks-section"]')?.textContent,
    ).toContain('Your drinks');
    expect(
      compiled.querySelector('[data-testid="selected-guest-available-drinks-section"]')
        ?.textContent,
    ).toContain('Add a drink');
    expect(compiled.querySelector('[data-testid="inactivity-hint"]')).toBeNull();
    expect(compiled.querySelector('[data-testid="close-personal-tab"]')).toBeNull();

    addDrinkButton?.click();
    decrementButton?.click();

    expect(incrementDrink).toHaveBeenCalledWith('cola');
    expect(decrementDrink).toHaveBeenCalledWith('water');
  });

  it('should render only the add-drink section when no drinks are recorded yet', async () => {
    const fixture = TestBed.createComponent(SelectedGuestPanel);

    fixture.componentRef.setInput('selectedGuest', createSelectedGuestViewModel([], [
      { id: 'appleJuice', name: 'Apple Juice', displayPrice: '€3.50' },
      { id: 'water', name: 'Water', displayPrice: '€2.00' },
    ]));
    fixture.componentRef.setInput('copy', {
      selectedGuestPanel: DRINK_TALLY_COPY.selectedGuestPanel,
      placeholder: DRINK_TALLY_COPY.placeholder,
    });
    fixture.detectChanges();
    await fixture.whenStable();

    const compiled = fixture.nativeElement as HTMLElement;

    expect(compiled.querySelector('[data-testid="selected-guest-active-drinks-section"]')).toBeNull();
    expect(
      compiled.querySelector('[data-testid="selected-guest-available-drinks-section"]')
        ?.textContent,
    ).toContain('Add a drink');
  });

  it('should show a top shadow only after the selected guest panel is scrolled', async () => {
    const fixture = TestBed.createComponent(SelectedGuestPanel);

    fixture.componentRef.setInput('selectedGuest', createSelectedGuestViewModel());
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

function createSelectedGuestViewModel(
  activeDrinkTallies: SelectedGuestDrinkTally[] = [
    { id: 'water', name: 'Water', count: 2, displayPrice: '€2.00' },
    { id: 'beer', name: 'Beer', count: 1, displayPrice: '€4.50' },
  ],
  availableDrinks: AvailableDrinkReference[] = [
    { id: 'appleJuice', name: 'Apple Juice', displayPrice: '€3.50' },
    { id: 'cola', name: 'Cola', displayPrice: '€3.00' },
  ],
): SelectedGuestViewModel {
  const counts = buildCounts(
    Object.fromEntries(activeDrinkTallies.map((drink) => [drink.id, drink.count])) as Partial<
      DrinkCounts
    >,
  );
  const totalCount = activeDrinkTallies.reduce((total, drink) => total + drink.count, 0);

  return {
    id: 'guest-1',
    roomNumber: '101',
    fullName: 'Ada Lovelace',
    counts,
    createdAt: '2026-04-01T08:00:00.000Z',
    updatedAt: '2026-04-02T10:00:00.000Z',
    totalCount,
    drinkSummary: activeDrinkTallies.map((drink) => ({
      id: drink.id,
      name: drink.name,
      count: drink.count,
    })),
    activeDrinkTallies,
    availableDrinks,
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
