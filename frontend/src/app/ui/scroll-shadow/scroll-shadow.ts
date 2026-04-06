import {
  afterEveryRender,
  booleanAttribute,
  Directive,
  ElementRef,
  inject,
  input,
  signal,
} from '@angular/core';

@Directive({
  selector: '[ntScrollShadow]',
  host: {
    '[class.nt-scroll-shadow]': 'enabled()',
    '[class.nt-scroll-shadow--scrolled]': 'enabled() && scrolled()',
    '(scroll)': 'sync()',
  },
})
export class ScrollShadow {
  readonly enabled = input(true, {
    alias: 'ntScrollShadow',
    transform: booleanAttribute,
  });
  readonly scrolled = signal(false);

  private readonly hostElement = inject<ElementRef<HTMLElement>>(ElementRef);

  constructor() {
    afterEveryRender(() => {
      this.sync();
    });
  }

  sync(): void {
    if (!this.enabled()) {
      this.scrolled.set(false);
      return;
    }

    this.scrolled.set(this.hostElement.nativeElement.scrollTop > 0);
  }
}
