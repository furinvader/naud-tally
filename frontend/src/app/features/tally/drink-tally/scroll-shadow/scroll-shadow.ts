import { afterEveryRender, Directive, ElementRef, inject, signal } from '@angular/core';

@Directive({
  selector: '[ntScrollShadow]',
  host: {
    '[class.nt-scroll-shadow]': 'true',
    '[class.nt-scroll-shadow--scrolled]': 'scrolled()',
    '(scroll)': 'sync()',
  },
})
export class ScrollShadow {
  readonly scrolled = signal(false);

  private readonly hostElement = inject<ElementRef<HTMLElement>>(ElementRef);

  constructor() {
    afterEveryRender(() => {
      this.sync();
    });
  }

  sync(): void {
    this.scrolled.set(this.hostElement.nativeElement.scrollTop > 0);
  }
}
