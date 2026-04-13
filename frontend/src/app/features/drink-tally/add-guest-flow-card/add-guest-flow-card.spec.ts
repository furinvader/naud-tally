import { TestBed } from '@angular/core/testing';
import { vi } from 'vitest';

import { DRINK_TALLY_COPY } from '../drink-tally.copy';
import { AddGuestFlowCard } from './add-guest-flow-card';

describe('AddGuestFlowCard', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddGuestFlowCard],
    }).compileComponents();
  });

  it('should render the room-number step and emit room input, submit, and cancel actions', async () => {
    const fixture = TestBed.createComponent(AddGuestFlowCard);
    const roomNumberInput = vi.fn();
    const submitRoomNumber = vi.fn();
    const cancelFlow = vi.fn();

    fixture.componentInstance.roomNumberInput.subscribe(roomNumberInput);
    fixture.componentInstance.submitRoomNumber.subscribe(submitRoomNumber);
    fixture.componentInstance.cancelFlow.subscribe(cancelFlow);
    fixture.componentRef.setInput('flow', {
      step: 'roomNumber',
      roomNumber: '',
      fullName: '',
    });
    fixture.componentRef.setInput('copy', DRINK_TALLY_COPY.addGuestFlow);
    fixture.detectChanges();
    await fixture.whenStable();

    const compiled = fixture.nativeElement as HTMLElement;
    const input = compiled.querySelector('[data-testid="room-number-input"]') as HTMLInputElement;
    const continueButton = compiled.querySelector(
      '[data-testid="room-number-continue"]',
    ) as HTMLButtonElement | null;
    const cancelButton = Array.from(compiled.querySelectorAll('button')).find((button) =>
      button.textContent?.includes('Cancel'),
    ) as HTMLButtonElement | undefined;

    expect(compiled.textContent).toContain('Enter your room number');
    expect(continueButton?.disabled).toBe(true);

    input.value = '204';
    input.dispatchEvent(new Event('input'));
    fixture.componentRef.setInput('flow', {
      step: 'roomNumber',
      roomNumber: '204',
      fullName: '',
    });
    fixture.detectChanges();
    await fixture.whenStable();

    expect(roomNumberInput).toHaveBeenCalledWith('204');
    expect(continueButton?.disabled).toBe(false);

    continueButton?.click();
    cancelButton?.click();

    expect(submitRoomNumber).toHaveBeenCalledTimes(1);
    expect(cancelFlow).toHaveBeenCalledTimes(1);
  });

  it('should render the full-name step and emit full-name input, submit, and back actions', async () => {
    const fixture = TestBed.createComponent(AddGuestFlowCard);
    const fullNameInput = vi.fn();
    const submitGuestIdentity = vi.fn();
    const back = vi.fn();

    fixture.componentInstance.fullNameInput.subscribe(fullNameInput);
    fixture.componentInstance.submitGuestIdentity.subscribe(submitGuestIdentity);
    fixture.componentInstance.back.subscribe(back);
    fixture.componentRef.setInput('flow', {
      step: 'fullName',
      roomNumber: '204',
      fullName: '',
    });
    fixture.componentRef.setInput('copy', DRINK_TALLY_COPY.addGuestFlow);
    fixture.detectChanges();
    await fixture.whenStable();

    const compiled = fixture.nativeElement as HTMLElement;
    const input = compiled.querySelector('[data-testid="full-name-input"]') as HTMLInputElement;
    const createTabButton = compiled.querySelector(
      '[data-testid="create-tab-button"]',
    ) as HTMLButtonElement | null;
    const backButton = Array.from(compiled.querySelectorAll('button')).find((button) =>
      button.textContent?.includes('Back'),
    ) as HTMLButtonElement | undefined;

    expect(compiled.textContent).toContain('Enter your full name');
    expect(compiled.textContent).toContain('Room 204');
    expect(createTabButton?.disabled).toBe(true);

    input.value = 'Grace Hopper';
    input.dispatchEvent(new Event('input'));
    fixture.componentRef.setInput('flow', {
      step: 'fullName',
      roomNumber: '204',
      fullName: 'Grace Hopper',
    });
    fixture.detectChanges();
    await fixture.whenStable();

    expect(fullNameInput).toHaveBeenCalledWith('Grace Hopper');
    expect(createTabButton?.disabled).toBe(false);

    createTabButton?.click();
    backButton?.click();

    expect(submitGuestIdentity).toHaveBeenCalledTimes(1);
    expect(back).toHaveBeenCalledTimes(1);
  });
});
