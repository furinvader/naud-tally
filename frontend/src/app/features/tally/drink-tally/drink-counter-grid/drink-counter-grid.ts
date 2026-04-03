import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';

import { DrinkId } from '../drink-tally.store';

export type DrinkCounterGridItem = {
  id: DrinkId;
  name: string;
  count: number;
  displayPrice?: string;
};

@Component({
  selector: 'nt-drink-counter-grid',
  imports: [MatButtonModule, MatCardModule],
  templateUrl: './drink-counter-grid.html',
  styleUrl: './drink-counter-grid.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DrinkCounterGrid {
  readonly drinks = input.required<ReadonlyArray<DrinkCounterGridItem>>();
  readonly subtitle = input('Quick tally');
  readonly countLabel = input('Recorded');
  readonly incrementDrink = output<DrinkId>();
  readonly decrementDrink = output<DrinkId>();
}
