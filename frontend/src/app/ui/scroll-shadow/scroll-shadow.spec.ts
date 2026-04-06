import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { ScrollShadow } from './scroll-shadow';

@Component({
  template: `
    <div
      class="scroll-container"
      ntScrollShadow
      [attr.data-version]="version()"
      data-testid="scroll-container"
    ></div>
  `,
  imports: [ScrollShadow],
})
class TestHostComponent {
  readonly version = signal('one');
}

describe('ScrollShadow', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestHostComponent],
    }).compileComponents();
  });

  it('should toggle the scrolled class as the container scrolls', async () => {
    const fixture = TestBed.createComponent(TestHostComponent);
    fixture.detectChanges();
    await fixture.whenStable();

    const scrollContainer = fixture.nativeElement.querySelector(
      '[data-testid="scroll-container"]',
    ) as HTMLDivElement | null;

    expect(scrollContainer?.classList.contains('nt-scroll-shadow')).toBe(true);
    expect(scrollContainer?.classList.contains('nt-scroll-shadow--scrolled')).toBe(false);

    if (scrollContainer) {
      scrollContainer.scrollTop = 24;
      scrollContainer.dispatchEvent(new Event('scroll'));
    }

    fixture.detectChanges();

    expect(scrollContainer?.classList.contains('nt-scroll-shadow--scrolled')).toBe(true);

    if (scrollContainer) {
      scrollContainer.scrollTop = 0;
      scrollContainer.dispatchEvent(new Event('scroll'));
    }

    fixture.detectChanges();

    expect(scrollContainer?.classList.contains('nt-scroll-shadow--scrolled')).toBe(false);
  });

  it('should resync the scrolled class after rendering', async () => {
    const fixture = TestBed.createComponent(TestHostComponent);
    fixture.detectChanges();
    await fixture.whenStable();

    const scrollContainer = fixture.nativeElement.querySelector(
      '[data-testid="scroll-container"]',
    ) as HTMLDivElement | null;

    if (scrollContainer) {
      scrollContainer.scrollTop = 24;
    }

    fixture.componentInstance.version.set('two');
    fixture.detectChanges();
    await fixture.whenStable();

    expect(scrollContainer?.classList.contains('nt-scroll-shadow--scrolled')).toBe(true);

    if (scrollContainer) {
      scrollContainer.scrollTop = 0;
    }

    fixture.componentInstance.version.set('three');
    fixture.detectChanges();
    await fixture.whenStable();

    expect(scrollContainer?.classList.contains('nt-scroll-shadow--scrolled')).toBe(false);
  });
});
