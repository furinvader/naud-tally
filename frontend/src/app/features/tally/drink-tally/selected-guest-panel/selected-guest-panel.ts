import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  effect,
  ElementRef,
  inject,
  Injector,
  input,
  OnInit,
  output,
  signal,
} from '@angular/core';

import { SelectedGuestPanelSectionCopy } from '../drink-tally.copy';
import { DrinkCounterGrid } from '../drink-counter-grid/drink-counter-grid';
import { InactivityCountdownHint } from '../inactivity-countdown-hint/inactivity-countdown-hint';
import { PersonalPanelSummary } from '../personal-panel-summary/personal-panel-summary';
import { DrinkId, SelectedGuestViewModel } from '../drink-tally.store';

@Component({
  selector: 'nt-selected-guest-panel',
  imports: [DrinkCounterGrid, InactivityCountdownHint, PersonalPanelSummary],
  templateUrl: './selected-guest-panel.html',
  styleUrl: './selected-guest-panel.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SelectedGuestPanel implements OnInit {
  readonly selectedGuest = input<SelectedGuestViewModel | null>(null);
  readonly publicTotalCount = input.required<number>();
  readonly activeGuestCount = input.required<number>();
  readonly timeoutProgressPercent = input('0%');
  readonly timeoutRingOffset = input('0');
  readonly copy = input.required<SelectedGuestPanelSectionCopy>();
  readonly incrementDrink = output<DrinkId>();
  readonly decrementDrink = output<DrinkId>();
  readonly close = output<void>();

  protected readonly selectedGuestPanelScrolled = signal(false);

  private readonly hostElement = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly injector = inject(Injector);

  ngOnInit(): void {
    effect(
      () => {
        this.selectedGuest()?.id ?? null;
        afterNextRender(() => {
          this.syncScrollShadowState();
        }, { injector: this.injector });
      },
      { injector: this.injector },
    );
  }

  protected onSelectedGuestPanelScroll(event: Event): void {
    const scrollContainer = event.target as HTMLElement | null;
    this.selectedGuestPanelScrolled.set((scrollContainer?.scrollTop ?? 0) > 0);
  }

  private syncScrollShadowState(): void {
    const selectedGuestPanelScroll = this.hostElement.nativeElement.querySelector<HTMLElement>(
      '[data-testid="selected-guest-panel-scroll"]',
    );

    this.selectedGuestPanelScrolled.set((selectedGuestPanelScroll?.scrollTop ?? 0) > 0);
  }
}
