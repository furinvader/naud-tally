import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  effect,
  inject,
  signal,
} from '@angular/core';
import { MatToolbarModule } from '@angular/material/toolbar';

import { ActiveGuestListPanel } from './active-guest-list-panel/active-guest-list-panel';
import { AddGuestFlowCard } from './add-guest-flow-card/add-guest-flow-card';
import {
  DRINK_TALLY_COPY,
  SelectedGuestPanelSectionCopy,
} from './drink-tally.copy';
import {
  DrinkTallyStore,
  GUEST_TAB_INACTIVITY_TIMEOUT_MS,
} from './drink-tally.store';
import { SelectedGuestPanel } from './selected-guest-panel/selected-guest-panel';

@Component({
  selector: 'nt-drink-tally',
  imports: [
    ActiveGuestListPanel,
    AddGuestFlowCard,
    MatToolbarModule,
    SelectedGuestPanel,
  ],
  templateUrl: './drink-tally.html',
  styleUrl: './drink-tally.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DrinkTally {
  protected readonly copy = DRINK_TALLY_COPY;
  protected readonly selectedGuestPanelCopy: SelectedGuestPanelSectionCopy = {
    selectedGuestPanel: DRINK_TALLY_COPY.selectedGuestPanel,
    placeholder: DRINK_TALLY_COPY.placeholder,
  };
  protected readonly tallyStore = inject(DrinkTallyStore);
  protected readonly entryOpen = computed(
    () => this.tallyStore.addGuestFlow().step !== 'closed',
  );
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
}
