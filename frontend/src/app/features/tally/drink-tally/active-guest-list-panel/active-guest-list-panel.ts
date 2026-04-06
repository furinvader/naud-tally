import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';

import { ScrollRegion } from '../../../../ui/scroll-region/scroll-region';
import { ActiveGuestListCopy } from '../drink-tally.copy';
import { GuestCardViewModel } from '../drink-tally.models';
import { GuestTabCard } from '../guest-tab-card/guest-tab-card';

@Component({
  selector: 'nt-active-guest-list-panel',
  imports: [GuestTabCard, MatButtonModule, MatCardModule, ScrollRegion],
  templateUrl: './active-guest-list-panel.html',
  styleUrl: './active-guest-list-panel.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ActiveGuestListPanel {
  readonly guests = input.required<ReadonlyArray<GuestCardViewModel>>();
  readonly selectedGuestId = input<string | null>(null);
  readonly entryOpen = input(false);
  readonly copy = input.required<ActiveGuestListCopy>();
  readonly startAddGuest = output<void>();
  readonly selectGuest = output<string>();
}
