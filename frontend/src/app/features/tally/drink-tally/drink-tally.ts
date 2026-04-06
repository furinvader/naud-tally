import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  effect,
  inject,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { RouterLink } from '@angular/router';

import { AppBar } from '../../../ui/app-bar/app-bar';
import { PageShell } from '../../../ui/page-shell/page-shell';
import { ActiveGuestListPanel } from './active-guest-list-panel/active-guest-list-panel';
import { AddGuestFlowCard } from './add-guest-flow-card/add-guest-flow-card';
import { DRINK_TALLY_COPY, SelectedGuestPanelSectionCopy } from './drink-tally.copy';
import { DrinkTallyStore, GUEST_TAB_INACTIVITY_TIMEOUT_MS } from './drink-tally.store';
import { SelectedGuestPanel } from './selected-guest-panel/selected-guest-panel';

@Component({
  selector: 'nt-drink-tally',
  imports: [
    ActiveGuestListPanel,
    AddGuestFlowCard,
    AppBar,
    MatButtonModule,
    PageShell,
    RouterLink,
    SelectedGuestPanel,
  ],
  templateUrl: './drink-tally.html',
  styleUrl: './drink-tally.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DrinkTally {
  protected readonly copy = DRINK_TALLY_COPY;
  protected readonly hostRoute = '/host';
  protected readonly shellBackground = `
    radial-gradient(
      circle at top right,
      color-mix(in srgb, var(--nt-color-action) 11%, transparent),
      transparent 34%
    ),
    radial-gradient(
      circle at top left,
      color-mix(in srgb, var(--nt-color-accent) 13%, transparent),
      transparent 38%
    ),
    linear-gradient(
      180deg,
      var(--nt-color-canvas),
      color-mix(in srgb, var(--nt-color-canvas) 88%, var(--nt-color-surface))
    )
  `;
  protected readonly selectedGuestPanelCopy: SelectedGuestPanelSectionCopy = {
    selectedGuestPanel: DRINK_TALLY_COPY.selectedGuestPanel,
    placeholder: DRINK_TALLY_COPY.placeholder,
  };
  protected readonly tallyStore = inject(DrinkTallyStore);
  protected readonly entryOpen = computed(() => this.tallyStore.addGuestFlow().step !== 'closed');

  private readonly destroyRef = inject(DestroyRef);
  private inactivityTimerId: ReturnType<typeof setTimeout> | null = null;

  constructor() {
    effect(() => {
      const selectedGuest = this.tallyStore.selectedGuest();
      const addGuestFlow = this.tallyStore.addGuestFlow();
      this.tallyStore.interactionVersion();

      if (!selectedGuest && addGuestFlow.step === 'closed') {
        this.clearInactivityTimer();
        return;
      }

      this.scheduleInactivityTimer();
    });

    this.destroyRef.onDestroy(() => {
      this.clearInactivityTimer();
    });
  }

  private scheduleInactivityTimer(): void {
    this.clearInactivityTimer();
    this.inactivityTimerId = setTimeout(() => {
      this.tallyStore.clearTransientState();
    }, GUEST_TAB_INACTIVITY_TIMEOUT_MS);
  }

  private clearInactivityTimer(): void {
    if (this.inactivityTimerId === null) {
      return;
    }

    clearTimeout(this.inactivityTimerId);
    this.inactivityTimerId = null;
  }
}
