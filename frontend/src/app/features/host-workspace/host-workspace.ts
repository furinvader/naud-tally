import { ChangeDetectionStrategy, Component } from '@angular/core';

import { DrinkTally } from '../tally/drink-tally/drink-tally';

@Component({
  selector: 'nt-host-workspace',
  imports: [DrinkTally],
  templateUrl: './host-workspace.html',
  styleUrl: './host-workspace.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HostWorkspace {}
