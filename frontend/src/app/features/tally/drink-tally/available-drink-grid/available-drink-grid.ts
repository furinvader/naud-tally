import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';

import { AvailableDrinkReference, DrinkId } from '../drink-tally.store';

@Component({
  selector: 'nt-available-drink-grid',
  imports: [MatButtonModule],
  templateUrl: './available-drink-grid.html',
  styleUrl: './available-drink-grid.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AvailableDrinkGrid {
  readonly drinks = input.required<ReadonlyArray<AvailableDrinkReference>>();
  readonly actionLabel = input('Add');
  readonly addDrink = output<DrinkId>();
}
