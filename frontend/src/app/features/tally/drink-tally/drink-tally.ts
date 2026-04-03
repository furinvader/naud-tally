import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  ElementRef,
  effect,
  inject,
  Injector,
  signal,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatToolbarModule } from '@angular/material/toolbar';

import { DrinkCounterGrid } from './drink-counter-grid/drink-counter-grid';
import { GuestTabCard } from './guest-tab-card/guest-tab-card';
import { InactivityCountdownHint } from './inactivity-countdown-hint/inactivity-countdown-hint';
import { PersonalPanelSummary } from './personal-panel-summary/personal-panel-summary';
import {
  DrinkTallyStore,
  GUEST_TAB_INACTIVITY_TIMEOUT_MS,
} from './drink-tally.store';

const DRINK_TALLY_COPY = {
  title: 'Naud Tally',
  totalLabel: 'Total drinks',
  totalCaption: 'Across all active guest tabs',
  activeGuestsLabel: 'Active guests',
  activeGuestsCaption: 'Open tabs on this tablet',
  addYourself: 'Add yourself',
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
  closeNowAction: 'Tap to close now',
  inactivityHint: 'This personal tab closes after 180 seconds of inactivity.',
  guestSummaryFallback: 'No drinks recorded yet.',
  drinkSubtitle: 'Quick tally',
  countLabel: 'Recorded',
} as const;

@Component({
  selector: 'nt-drink-tally',
  imports: [
    DrinkCounterGrid,
    GuestTabCard,
    InactivityCountdownHint,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatToolbarModule,
    PersonalPanelSummary,
  ],
  templateUrl: './drink-tally.html',
  styleUrl: './drink-tally.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DrinkTally {
  protected readonly copy = DRINK_TALLY_COPY;
  protected readonly tallyStore = inject(DrinkTallyStore);
  protected readonly guestListScrolled = signal(false);
  protected readonly selectedGuestPanelScrolled = signal(false);
  protected readonly timeoutProgressPercent = computed(
    () => `${(this.timeoutProgress() * 100).toFixed(2)}%`,
  );
  protected readonly timeoutRingOffset = computed(
    () => `${(this.timeoutProgress() * 100).toFixed(2)}`,
  );

  private readonly destroyRef = inject(DestroyRef);
  private readonly hostElement = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly injector = inject(Injector);
  private readonly selectedGuestId = computed(
    () => this.tallyStore.selectedGuest()?.id ?? null,
  );
  private readonly timeoutProgress = signal(0);
  private inactivityTimerId: ReturnType<typeof setTimeout> | null = null;
  private timeoutProgressTimerId: ReturnType<typeof setInterval> | null = null;
  private timeoutProgressStartedAtMs: number | null = null;

  constructor() {
    effect(() => {
      this.selectedGuestId();
      afterNextRender(() => {
        this.syncScrollShadowState();
      }, { injector: this.injector });
    });

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

  protected onSelectedGuestPanelScroll(event: Event): void {
    const scrollContainer = event.target as HTMLElement | null;
    this.selectedGuestPanelScrolled.set((scrollContainer?.scrollTop ?? 0) > 0);
  }

  protected onGuestListScroll(event: Event): void {
    const scrollContainer = event.target as HTMLElement | null;
    this.guestListScrolled.set((scrollContainer?.scrollTop ?? 0) > 0);
  }

  private syncScrollShadowState(): void {
    const host = this.hostElement.nativeElement;
    const guestListScroll = host.querySelector<HTMLElement>(
      '[data-testid="active-guest-list-scroll"]',
    );
    const selectedGuestPanelScroll = host.querySelector<HTMLElement>(
      '[data-testid="selected-guest-panel-scroll"]',
    );

    this.guestListScrolled.set((guestListScroll?.scrollTop ?? 0) > 0);
    this.selectedGuestPanelScrolled.set((selectedGuestPanelScroll?.scrollTop ?? 0) > 0);
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
