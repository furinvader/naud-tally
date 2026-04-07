import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  effect,
  inject,
} from '@angular/core';

import { DrinkTally } from '../drink-tally';
import { HostWorkspaceStore } from './host-workspace.store';

export const GUEST_TAB_INACTIVITY_TIMEOUT_MS = 90_000;

@Component({
  selector: 'nt-host-workspace',
  imports: [DrinkTally],
  providers: [HostWorkspaceStore],
  templateUrl: './host-workspace.html',
  styleUrl: './host-workspace.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HostWorkspace {
  protected readonly hostWorkspaceStore = inject(HostWorkspaceStore);

  private readonly destroyRef = inject(DestroyRef);
  private inactivityTimerId: ReturnType<typeof setTimeout> | null = null;

  constructor() {
    effect(() => {
      const selectedGuest = this.hostWorkspaceStore.selectedGuest();
      const addGuestFlow = this.hostWorkspaceStore.addGuestFlow();
      this.hostWorkspaceStore.interactionVersion();

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
      this.hostWorkspaceStore.clearTransientState();
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
