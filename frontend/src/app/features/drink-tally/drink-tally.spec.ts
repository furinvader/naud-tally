import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { vi } from 'vitest';

import { DrinkTally } from './drink-tally';

describe('DrinkTally', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DrinkTally],
      providers: [provideRouter([])],
    }).compileComponents();
  });

  it('should create the presentational screen', () => {
    const fixture = createDrinkTallyFixture();

    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should render the empty order entry screen state from inputs', async () => {
    const fixture = createDrinkTallyFixture();
    fixture.detectChanges();
    await fixture.whenStable();

    const compiled = fixture.nativeElement as HTMLElement;
    const pageShell = compiled.querySelector('nt-page-shell');

    expect(pageShell?.classList.contains('nt-page-shell--body-fixed')).toBe(true);
    expect(compiled.textContent).toContain('Add yourself');
    expect(compiled.textContent).toContain('No guest tabs yet');
    expect(compiled.querySelector('[data-testid="selected-guest-panel"]')).toBeNull();
    expect(compiled.querySelector('[data-testid="empty-personal-panel"]')).not.toBeNull();
  });

  it('should emit start-add-guest when the Add yourself button is clicked', async () => {
    const fixture = createDrinkTallyFixture();
    const startAddGuest = vi.fn();
    fixture.componentInstance.startAddGuest.subscribe(startAddGuest);

    fixture.detectChanges();
    await fixture.whenStable();

    const addYourselfButton = fixture.nativeElement.querySelector(
      '[data-testid="add-yourself-button"]',
    ) as HTMLButtonElement | null;

    addYourselfButton?.click();

    expect(startAddGuest).toHaveBeenCalledTimes(1);
  });

  it('should emit room-number flow events from the add-guest card', async () => {
    const fixture = createDrinkTallyFixture({
      addGuestFlow: {
        step: 'roomNumber',
        roomNumber: '',
        fullName: '',
      },
    });
    const roomNumberInput = vi.fn();
    const submitRoomNumber = vi.fn();
    fixture.componentInstance.updateDraftRoomNumber.subscribe(roomNumberInput);
    fixture.componentInstance.submitRoomNumber.subscribe(submitRoomNumber);

    fixture.detectChanges();
    await fixture.whenStable();

    const compiled = fixture.nativeElement as HTMLElement;
    const input = compiled.querySelector('[data-testid="room-number-input"]') as HTMLInputElement;
    input.value = '204';
    input.dispatchEvent(new Event('input'));
    fixture.componentRef.setInput('addGuestFlow', {
      step: 'roomNumber',
      roomNumber: '204',
      fullName: '',
    });
    fixture.detectChanges();
    await fixture.whenStable();

    const continueButton = compiled.querySelector(
      '[data-testid="room-number-continue"]',
    ) as HTMLButtonElement | null;
    continueButton?.click();

    expect(roomNumberInput).toHaveBeenCalledWith('204');
    expect(submitRoomNumber).toHaveBeenCalledTimes(1);
  });

  it('should emit drink tally actions for the selected guest', async () => {
    const fixture = createDrinkTallyFixture({
      activeGuests: [createGuestCardViewModel()],
      selectedGuestId: 'guest-1',
      selectedGuest: createSelectedGuestViewModel(),
    });
    const incrementDrink = vi.fn();
    const decrementDrink = vi.fn();
    fixture.componentInstance.incrementDrink.subscribe(incrementDrink);
    fixture.componentInstance.decrementDrink.subscribe(decrementDrink);

    fixture.detectChanges();
    await fixture.whenStable();

    const compiled = fixture.nativeElement as HTMLElement;
    const addDrinkButton = compiled.querySelector(
      'button[aria-label="Add one Water"]',
    ) as HTMLButtonElement | null;
    const removeDrinkButton = compiled.querySelector(
      'button[aria-label="Remove one Beer"]',
    ) as HTMLButtonElement | null;

    addDrinkButton?.click();
    removeDrinkButton?.click();

    expect(incrementDrink).toHaveBeenCalledWith('water');
    expect(decrementDrink).toHaveBeenCalledWith('beer');
  });
});

type DrinkTallyOverrides = {
  activeGuests?: ReturnType<typeof createGuestCardViewModel>[];
  selectedGuestId?: string | null;
  addGuestFlow?: {
    step: 'closed' | 'roomNumber' | 'fullName';
    roomNumber: string;
    fullName: string;
  };
  selectedGuest?: ReturnType<typeof createSelectedGuestViewModel> | null;
};

function createDrinkTallyFixture(overrides: DrinkTallyOverrides = {}) {
  const fixture = TestBed.createComponent(DrinkTally);

  fixture.componentRef.setInput('activeGuests', overrides.activeGuests ?? []);
  fixture.componentRef.setInput('selectedGuestId', overrides.selectedGuestId ?? null);
  fixture.componentRef.setInput('addGuestFlow', overrides.addGuestFlow ?? createClosedFlow());
  fixture.componentRef.setInput('selectedGuest', overrides.selectedGuest ?? null);

  return fixture;
}

function createClosedFlow() {
  return {
    step: 'closed' as const,
    roomNumber: '',
    fullName: '',
  };
}

function createGuestCardViewModel() {
  return {
    id: 'guest-1',
    roomNumber: '101',
    fullName: 'Ada Lovelace',
    counts: { beer: 1 },
    drinkOrder: ['beer'],
    createdAt: '2026-04-01T08:00:00.000Z',
    updatedAt: '2026-04-02T10:00:00.000Z',
    totalCount: 1,
    totalPriceCents: 450,
    displayTotalPrice: '€4.50',
    drinkSummary: [{ id: 'beer', name: 'Beer', count: 1 }],
  };
}

function createSelectedGuestViewModel() {
  return {
    ...createGuestCardViewModel(),
    activeDrinkTallies: [{ id: 'beer', name: 'Beer', count: 1, displayPrice: '€4.50' }],
    availableDrinks: [{ id: 'water', name: 'Water', displayPrice: '€2.00' }],
  };
}
