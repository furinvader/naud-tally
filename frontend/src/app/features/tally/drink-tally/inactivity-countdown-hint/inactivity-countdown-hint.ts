import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

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
  readonly actionLabel = input('Tap to close now');
  readonly progressPercent = input('0%');
  readonly ringOffset = input('0');
  readonly close = output<void>();
}
