import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatToolbarModule } from '@angular/material/toolbar';

import { DrinkTallyStore } from './drink-tally.store';

const APP_COPY = {
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
  selector: 'nt-root',
  imports: [MatButtonModule, MatCardModule, MatToolbarModule],
  templateUrl: './app.html',
  styleUrl: './app.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {
  protected readonly copy = APP_COPY;
  protected readonly tallyStore = inject(DrinkTallyStore);
}
