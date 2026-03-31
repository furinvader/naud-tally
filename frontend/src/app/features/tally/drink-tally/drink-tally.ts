import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatToolbarModule } from '@angular/material/toolbar';

import { DrinkTallyStore } from './drink-tally.store';

const DRINK_TALLY_COPY = {
  title: 'Naud Tally',
  eyebrow: 'Guest drink tally',
  headline: 'Tap drinks as they are taken.',
  instructions:
    'Every tap updates the total right away and saves on this tablet so the count survives a reload.',
  toolbarHint: 'Shared tablet mode',
  totalLabel: 'Total drinks',
  totalCaption: 'Across all drinks',
  drinkSubtitle: 'Quick tally',
  countLabel: 'Recorded',
} as const;

@Component({
  selector: 'nt-drink-tally',
  imports: [MatButtonModule, MatCardModule, MatToolbarModule],
  templateUrl: './drink-tally.html',
  styleUrl: './drink-tally.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DrinkTally {
  protected readonly copy = DRINK_TALLY_COPY;
  protected readonly tallyStore = inject(DrinkTallyStore);
}
