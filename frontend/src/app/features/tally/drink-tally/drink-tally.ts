import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { RouterLink } from '@angular/router';

import { AppBar } from '../../../ui/app-bar/app-bar';
import { DrinkId } from '../../catalog/catalog.store';
import { PageShell } from '../../../ui/page-shell/page-shell';
import { ActiveGuestListPanel } from './active-guest-list-panel/active-guest-list-panel';
import { AddGuestFlowCard } from './add-guest-flow-card/add-guest-flow-card';
import { DRINK_TALLY_COPY, SelectedGuestPanelSectionCopy } from './drink-tally.copy';
import {
  AddGuestFlowViewModel,
  GuestCardViewModel,
  SelectedGuestViewModel,
} from './drink-tally.models';
import { SelectedGuestPanel } from './selected-guest-panel/selected-guest-panel';

@Component({
  selector: 'nt-drink-tally',
  imports: [
    ActiveGuestListPanel,
    AddGuestFlowCard,
    AppBar,
    MatButtonModule,
    PageShell,
    RouterLink,
    SelectedGuestPanel,
  ],
  templateUrl: './drink-tally.html',
  styleUrl: './drink-tally.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DrinkTally {
  readonly activeGuests = input.required<ReadonlyArray<GuestCardViewModel>>();
  readonly selectedGuestId = input<string | null>(null);
  readonly addGuestFlow = input.required<AddGuestFlowViewModel>();
  readonly selectedGuest = input<SelectedGuestViewModel | null>(null);
  readonly startAddGuest = output<void>();
  readonly updateDraftRoomNumber = output<string>();
  readonly updateDraftFullName = output<string>();
  readonly submitRoomNumber = output<void>();
  readonly submitGuestIdentity = output<void>();
  readonly returnToRoomNumberStep = output<void>();
  readonly cancelAddGuestFlow = output<void>();
  readonly selectGuest = output<string>();
  readonly incrementDrink = output<DrinkId>();
  readonly decrementDrink = output<DrinkId>();
  protected readonly copy = DRINK_TALLY_COPY;
  protected readonly hostRoute = '/host';
  protected readonly shellBackground = `
    radial-gradient(
      circle at top right,
      color-mix(in srgb, var(--nt-color-action) 11%, transparent),
      transparent 34%
    ),
    radial-gradient(
      circle at top left,
      color-mix(in srgb, var(--nt-color-accent) 13%, transparent),
      transparent 38%
    ),
    linear-gradient(
      180deg,
      var(--nt-color-canvas),
      color-mix(in srgb, var(--nt-color-canvas) 88%, var(--nt-color-surface))
    )
  `;
  protected readonly selectedGuestPanelCopy: SelectedGuestPanelSectionCopy = {
    selectedGuestPanel: DRINK_TALLY_COPY.selectedGuestPanel,
    placeholder: DRINK_TALLY_COPY.placeholder,
  };
  protected readonly entryOpen = computed(() => this.addGuestFlow().step !== 'closed');
}
