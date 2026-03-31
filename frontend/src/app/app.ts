import { ChangeDetectionStrategy, Component } from '@angular/core';

import { DrinkTally } from './features/tally/drink-tally/drink-tally';

@Component({
  selector: 'nt-root',
  imports: [DrinkTally],
  templateUrl: './app.html',
  styleUrl: './app.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {}
