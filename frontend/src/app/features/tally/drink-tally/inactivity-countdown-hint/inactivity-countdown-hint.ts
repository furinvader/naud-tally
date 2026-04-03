import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'nt-inactivity-countdown-hint',
  templateUrl: './inactivity-countdown-hint.html',
  styleUrl: './inactivity-countdown-hint.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'data-testid': 'inactivity-hint',
  },
})
export class InactivityCountdownHint {
  readonly message = input.required<string>();
  readonly progressPercent = input('0%');
  readonly ringOffset = input('0');
}
