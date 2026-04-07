import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'nt-tally-stat-card',
  templateUrl: './tally-stat-card.html',
  styleUrl: './tally-stat-card.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TallyStatCard {
  readonly label = input.required<string>();
  readonly value = input.required<string | number>();
  readonly caption = input('');
  readonly emphasis = input<'default' | 'accent'>('default');
}
