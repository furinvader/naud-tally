import { TestBed } from '@angular/core/testing';

import { App } from './app';
import { DRINK_TALLY_STORAGE_KEY } from './drink-tally.store';

describe('App', () => {
  beforeEach(async () => {
    localStorage.clear();

    await TestBed.configureTestingModule({
      imports: [App],
    }).compileComponents();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('should render the guest tally screen', async () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    await fixture.whenStable();

    const compiled = fixture.nativeElement as HTMLElement;

    expect(compiled.textContent).toContain('Naud Tally');
    expect(compiled.textContent).toContain('Tap drinks as they are taken.');
    expect(compiled.textContent).toContain('Water');
    expect(compiled.textContent).toContain('White Wine');
  });

  it('should update the total and persist after a tap', () => {
    const fixture = TestBed.createComponent(App);
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
