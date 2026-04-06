import { ChangeDetectionStrategy, Component } from '@angular/core';

import { ScrollShadow } from '../scroll-shadow/scroll-shadow';

@Component({
  selector: 'nt-scroll-region',
  template: '<ng-content></ng-content>',
  styleUrl: './scroll-region.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'nt-scroll-region',
  },
  hostDirectives: [
    {
      directive: ScrollShadow,
      inputs: ['ntScrollShadow:shadow'],
    },
  ],
})
export class ScrollRegion {}
