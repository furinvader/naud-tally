import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

import { ScrollRegion } from '../../../../ui/scroll-region/scroll-region';
import { AvailableDrinkGrid } from '../available-drink-grid/available-drink-grid';
import { DrinkCounterGrid } from '../drink-counter-grid/drink-counter-grid';
import { SelectedGuestPanelSectionCopy } from '../drink-tally.copy';
import { DrinkId, SelectedGuestViewModel } from '../drink-tally.store';

@Component({
  selector: 'nt-selected-guest-panel',
  imports: [AvailableDrinkGrid, DrinkCounterGrid, ScrollRegion],
  templateUrl: './selected-guest-panel.html',
  styleUrl: './selected-guest-panel.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SelectedGuestPanel {
  readonly selectedGuest = input<SelectedGuestViewModel | null>(null);
  readonly copy = input.required<SelectedGuestPanelSectionCopy>();
  readonly incrementDrink = output<DrinkId>();
  readonly decrementDrink = output<DrinkId>();
}
