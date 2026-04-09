import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  computed,
  effect,
  inject,
  viewChild,
} from '@angular/core';
import { StepperSelectionEvent } from '@angular/cdk/stepper';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatStepper, MatStepperModule } from '@angular/material/stepper';
import { RouterLink } from '@angular/router';

import { AppBar } from '../../ui/app-bar/app-bar';
import { PageShell } from '../../ui/page-shell/page-shell';
import { ScrollRegion } from '../../ui/scroll-region/scroll-region';
import { ORDER_ENTRY_COPY } from './order-entry.copy';
import { OrderEntryStep, OrderEntryStore } from './order-entry.store';

export const GUEST_TAB_INACTIVITY_TIMEOUT_MS = 90_000;
const ORDER_ENTRY_STEPS: readonly OrderEntryStep[] = ['room', 'guest', 'drinks'];

@Component({
  selector: 'nt-order-entry',
  imports: [
    AppBar,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatStepperModule,
    PageShell,
    RouterLink,
    ScrollRegion,
  ],
  providers: [OrderEntryStore],
  templateUrl: './order-entry.html',
  styleUrl: './order-entry.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrderEntry {
  protected readonly orderEntryStore = inject(OrderEntryStore);
  protected readonly copy = ORDER_ENTRY_COPY;
  protected readonly hostRoute = '/host';
  protected readonly activeStepIndex = computed(() =>
    ORDER_ENTRY_STEPS.indexOf(this.orderEntryStore.activeStep()),
  );
  protected readonly shellBackground = `
    radial-gradient(
      circle at top right,
      color-mix(in srgb, var(--nt-color-action) 12%, transparent),
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

  private readonly destroyRef = inject(DestroyRef);
  private readonly stepper = viewChild(MatStepper);
  private inactivityTimerId: ReturnType<typeof setTimeout> | null = null;

  constructor() {
    effect(() => {
      const selectedRoomId = this.orderEntryStore.selectedRoomId();
      const selectedGuest = this.orderEntryStore.selectedGuest();
      const guestDraft = this.orderEntryStore.guestDraft();
      this.orderEntryStore.interactionVersion();

      if (!selectedRoomId && !selectedGuest && !guestDraft.isOpen) {
        this.clearInactivityTimer();
        return;
      }

      this.scheduleInactivityTimer();
    });

    effect(() => {
      const stepper = this.stepper();
      const activeStepIndex = this.activeStepIndex();

      if (!stepper || stepper.selectedIndex === activeStepIndex) {
        return;
      }

      stepper.selectedIndex = activeStepIndex;
    });

    this.destroyRef.onDestroy(() => {
      this.clearInactivityTimer();
    });
  }

  protected activateStep(step: OrderEntryStep): void {
    this.orderEntryStore.activateStep(step);
  }

  protected onStepperSelectionChange(event: StepperSelectionEvent): void {
    const selectedStep = ORDER_ENTRY_STEPS[event.selectedIndex];

    if (!selectedStep) {
      return;
    }

    this.activateStep(selectedStep);
  }

  private scheduleInactivityTimer(): void {
    this.clearInactivityTimer();
    this.inactivityTimerId = setTimeout(() => {
      this.orderEntryStore.clearTransientState();
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
