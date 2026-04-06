import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'nt-app-bar',
  templateUrl: './app-bar.html',
  styleUrl: './app-bar.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppBar {
  readonly title = input.required<string>();
  readonly eyebrow = input<string | null>(null);
}
