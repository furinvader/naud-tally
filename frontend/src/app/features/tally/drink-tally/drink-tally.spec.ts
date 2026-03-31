import { TestBed } from '@angular/core/testing';

import { DrinkTally } from './drink-tally';
import { DRINK_TALLY_STORAGE_KEY } from './drink-tally.store';

describe('DrinkTally', () => {
  beforeEach(async () => {
    localStorage.clear();

    await TestBed.configureTestingModule({
      imports: [DrinkTally],
    }).compileComponents();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should create the feature', () => {
    const fixture = TestBed.createComponent(DrinkTally);
    const component = fixture.componentInstance;
    expect(component).toBeTruthy();
  });

  it('should render the guest tally screen', async () => {
    const fixture = TestBed.createComponent(DrinkTally);
    fixture.detectChanges();
    await fixture.whenStable();

    const compiled = fixture.nativeElement as HTMLElement;

    expect(compiled.textContent).toContain('Naud Tally');
    expect(compiled.textContent).toContain('Tap drinks as they are taken.');
    expect(compiled.textContent).toContain('Water');
    expect(compiled.textContent).toContain('White Wine');
  });

  it('should update the total and persist after a tap', () => {
    const fixture = TestBed.createComponent(DrinkTally);
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const addWaterButton = compiled.querySelector(
      'button[aria-label="Add one Water"]',
    ) as HTMLButtonElement | null;

    addWaterButton?.click();
    fixture.detectChanges();

    expect(compiled.querySelector('.hero-total-value')?.textContent?.trim()).toBe(
      '1',
    );
    expect(localStorage.getItem(DRINK_TALLY_STORAGE_KEY)).toContain('"water":1');
  });
});
