import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

import { DrinkCounterGrid } from '../drink-counter-grid/drink-counter-grid';
import { SelectedGuestPanelSectionCopy } from '../drink-tally.copy';
import { DrinkId, SelectedGuestViewModel } from '../drink-tally.store';
import { InactivityCountdownHint } from '../inactivity-countdown-hint/inactivity-countdown-hint';
import { PersonalPanelSummary } from '../personal-panel-summary/personal-panel-summary';
import { ScrollShadow } from '../scroll-shadow/scroll-shadow';

@Component({
  selector: 'nt-selected-guest-panel',
  imports: [DrinkCounterGrid, InactivityCountdownHint, PersonalPanelSummary, ScrollShadow],
  templateUrl: './selected-guest-panel.html',
  styleUrl: './selected-guest-panel.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SelectedGuestPanel {
  readonly selectedGuest = input<SelectedGuestViewModel | null>(null);
  readonly publicTotalCount = input.required<number>();
  readonly activeGuestCount = input.required<number>();
  readonly timeoutProgressPercent = input('0%');
  readonly timeoutRingOffset = input('0');
  readonly copy = input.required<SelectedGuestPanelSectionCopy>();
  readonly incrementDrink = output<DrinkId>();
  readonly decrementDrink = output<DrinkId>();
  readonly close = output<void>();
}
