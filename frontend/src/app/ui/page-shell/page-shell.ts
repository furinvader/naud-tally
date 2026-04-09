import { booleanAttribute, ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'nt-page-shell',
  templateUrl: './page-shell.html',
  styleUrl: './page-shell.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class.nt-page-shell--body-scrollable]': 'bodyScrollable()',
    '[class.nt-page-shell--body-fixed]': '!bodyScrollable()',
    '[style.--nt-page-shell-max-width]': 'maxWidth()',
    '[style.--nt-page-shell-padding]': 'contentPadding()',
    '[style.--nt-page-shell-compact-padding]': 'compactPadding()',
    '[style.--nt-page-shell-background]': 'background()',
  },
})
export class PageShell {
  readonly maxWidth = input('100%');
  readonly contentPadding = input('clamp(var(--nt-space-md), 4vw, var(--nt-space-xl))');
  readonly compactPadding = input('var(--nt-space-sm)');
  readonly background = input('transparent');
  readonly bodyScrollable = input(true, { transform: booleanAttribute });
}
