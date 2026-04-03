import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  effect,
  inject,
  signal,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatToolbarModule } from '@angular/material/toolbar';

import { DrinkCounterGrid } from './drink-counter-grid/drink-counter-grid';
import { DrinkPriceReference } from './drink-price-reference/drink-price-reference';
import { GuestTabCard } from './guest-tab-card/guest-tab-card';
import { InactivityCountdownHint } from './inactivity-countdown-hint/inactivity-countdown-hint';
import { PersonalPanelSummary } from './personal-panel-summary/personal-panel-summary';
import {
  DrinkTallyStore,
  GUEST_TAB_INACTIVITY_TIMEOUT_MS,
} from './drink-tally.store';
import { TallyStatCard } from './tally-stat-card/tally-stat-card';

const DRINK_TALLY_COPY = {
  title: 'Naud Tally',
  toolbarHint: 'Price reference',
  totalLabel: 'Total drinks',
  totalCaption: 'Across all active guest tabs',
  activeGuestsLabel: 'Active guests',
  activeGuestsCaption: 'Open tabs on this tablet',
  addYourself: 'Add yourself',
  addYourselfHint: 'Create or reopen your guest tab without leaving this screen.',
  roomStepLabel: 'Step 1 of 2',
  roomStepTitle: 'Enter your room number',
  roomNumberLabel: 'Room number',
  roomNumberAction: 'Continue',
  nameStepLabel: 'Step 2 of 2',
  nameStepTitle: 'Enter your full name',
  fullNameLabel: 'Full name',
  fullNameAction: 'Open tab',
  backAction: 'Back',
  cancelAction: 'Cancel',
  guestListTitle: 'Active guest tabs',
  guestListHint: 'Tap a guest to continue tallying drinks.',
  emptyGuestListTitle: 'No guest tabs yet',
  emptyGuestListBody: 'Use Add yourself to open the first tab on this shared tablet.',
  personalPanelEyebrow: 'Selected guest',
  personalPanelPlaceholderTitle: 'Choose a guest to start tallying.',
  personalPanelPlaceholderBody:
    'Returning guests can tap their tab from the public list. New guests can use Add yourself first.',
  roomLabel: 'Room',
  closeTabAction: 'Close tab',
  inactivityHint: 'This personal tab closes after 90 seconds of inactivity.',
  guestSummaryFallback: 'No drinks recorded yet.',
  drinkSubtitle: 'Quick tally',
  countLabel: 'Recorded',
} as const;

@Component({
  selector: 'nt-drink-tally',
  imports: [
    DrinkCounterGrid,
    DrinkPriceReference,
    GuestTabCard,
    InactivityCountdownHint,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatToolbarModule,
    PersonalPanelSummary,
    TallyStatCard,
  ],
  templateUrl: './drink-tally.html',
  styleUrl: './drink-tally.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DrinkTally {
  protected readonly copy = DRINK_TALLY_COPY;
  protected readonly tallyStore = inject(DrinkTallyStore);
  protected readonly timeoutProgressPercent = computed(
    () => `${(this.timeoutProgress() * 100).toFixed(2)}%`,
  );
  protected readonly timeoutRingOffset = computed(
    () => `${(this.timeoutProgress() * 100).toFixed(2)}`,
  );

  private readonly destroyRef = inject(DestroyRef);
  private readonly timeoutProgress = signal(0);
  private inactivityTimerId: ReturnType<typeof setTimeout> | null = null;
  private timeoutProgressTimerId: ReturnType<typeof setInterval> | null = null;
  private timeoutProgressStartedAtMs: number | null = null;

  constructor() {
    effect(() => {
      const selectedGuest = this.tallyStore.selectedGuest();
      const addGuestFlow = this.tallyStore.addGuestFlow();
      this.tallyStore.interactionVersion();

      if (!selectedGuest && addGuestFlow.step === 'closed') {
        this.clearInactivityTimer();
        this.resetTimeoutProgress();
        return;
      }

      this.scheduleInactivityTimer();

      if (selectedGuest) {
        this.startTimeoutProgress();
        return;
      }

      this.resetTimeoutProgress();
    });

    this.destroyRef.onDestroy(() => {
      this.clearInactivityTimer();
      this.resetTimeoutProgress();
    });
  }

  protected onRoomNumberInput(event: Event): void {
    this.tallyStore.updateDraftRoomNumber(this.readInputValue(event));
  }

  protected onFullNameInput(event: Event): void {
    this.tallyStore.updateDraftFullName(this.readInputValue(event));
  }

  protected onRoomNumberSubmit(event: Event): void {
    event.preventDefault();
    this.tallyStore.submitRoomNumber();
  }

  protected onGuestIdentitySubmit(event: Event): void {
    event.preventDefault();
    this.tallyStore.submitGuestIdentity();
  }

  private scheduleInactivityTimer(): void {
    this.clearInactivityTimer();
    this.inactivityTimerId = setTimeout(() => {
      this.tallyStore.clearTransientState();
    }, GUEST_TAB_INACTIVITY_TIMEOUT_MS);
  }

  private startTimeoutProgress(): void {
    this.clearTimeoutProgressTimer();
    this.timeoutProgressStartedAtMs = Date.now();
    this.timeoutProgress.set(0);
    this.timeoutProgressTimerId = setInterval(() => {
      this.updateTimeoutProgress();
    }, 100);
  }

  private clearInactivityTimer(): void {
    if (this.inactivityTimerId === null) {
      return;
    }

    clearTimeout(this.inactivityTimerId);
    this.inactivityTimerId = null;
  }

  private updateTimeoutProgress(): void {
    if (this.timeoutProgressStartedAtMs === null) {
      return;
    }

    const elapsedMs = Date.now() - this.timeoutProgressStartedAtMs;
    const nextProgress = Math.min(elapsedMs / GUEST_TAB_INACTIVITY_TIMEOUT_MS, 1);

    this.timeoutProgress.set(nextProgress);

    if (nextProgress >= 1) {
      this.clearTimeoutProgressTimer();
    }
  }

  private resetTimeoutProgress(): void {
    this.clearTimeoutProgressTimer();
    this.timeoutProgressStartedAtMs = null;
    this.timeoutProgress.set(0);
  }

  private clearTimeoutProgressTimer(): void {
    if (this.timeoutProgressTimerId === null) {
      return;
    }

    clearInterval(this.timeoutProgressTimerId);
    this.timeoutProgressTimerId = null;
  }

  private readInputValue(event: Event): string {
    return (event.target as HTMLInputElement | null)?.value ?? '';
  }
}
