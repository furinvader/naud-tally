import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

type GuestTabCardSummaryItem = {
  id: string;
  name: string;
  count: number;
};

@Component({
  selector: 'nt-guest-tab-card',
  templateUrl: './guest-tab-card.html',
  styleUrl: './guest-tab-card.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GuestTabCard {
  readonly roomNumber = input.required<string>();
  readonly fullName = input.required<string>();
  readonly totalCount = input.required<number>();
  readonly drinkSummary = input.required<ReadonlyArray<GuestTabCardSummaryItem>>();
  readonly selected = input(false);
  readonly roomLabel = input('Room');
  readonly emptySummaryLabel = input('No drinks recorded yet.');
  readonly selectTab = output<void>();
}
