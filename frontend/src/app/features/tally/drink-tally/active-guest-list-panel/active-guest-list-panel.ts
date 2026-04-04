import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';

import { ActiveGuestListCopy } from '../drink-tally.copy';
import { GuestCardViewModel } from '../drink-tally.store';
import { GuestTabCard } from '../guest-tab-card/guest-tab-card';
import { ScrollShadow } from '../scroll-shadow/scroll-shadow';

@Component({
  selector: 'nt-active-guest-list-panel',
  imports: [GuestTabCard, MatButtonModule, MatCardModule, ScrollShadow],
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
