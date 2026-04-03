import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'nt-personal-panel-summary',
  templateUrl: './personal-panel-summary.html',
  styleUrl: './personal-panel-summary.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'data-testid': 'empty-personal-panel-summary',
  },
})
export class PersonalPanelSummary {
  readonly primaryLabel = input.required<string>();
  readonly primaryValue = input.required<string | number>();
  readonly primaryCaption = input('');
  readonly secondaryLabel = input.required<string>();
  readonly secondaryValue = input.required<string | number>();
  readonly secondaryCaption = input('');
}
