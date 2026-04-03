import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  effect,
  ElementRef,
  inject,
  Injector,
  input,
  OnInit,
  output,
  signal,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';

import { ActiveGuestListCopy } from '../drink-tally.copy';
import { GuestTabCard } from '../guest-tab-card/guest-tab-card';
import { GuestCardViewModel } from '../drink-tally.store';

@Component({
  selector: 'nt-active-guest-list-panel',
  imports: [GuestTabCard, MatButtonModule, MatCardModule],
  templateUrl: './active-guest-list-panel.html',
  styleUrl: './active-guest-list-panel.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ActiveGuestListPanel implements OnInit {
  readonly guests = input.required<ReadonlyArray<GuestCardViewModel>>();
  readonly selectedGuestId = input<string | null>(null);
  readonly entryOpen = input(false);
  readonly copy = input.required<ActiveGuestListCopy>();
  readonly startAddGuest = output<void>();
  readonly selectGuest = output<string>();

  protected readonly guestListScrolled = signal(false);

  private readonly hostElement = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly injector = inject(Injector);

  ngOnInit(): void {
    effect(
      () => {
        this.guests();
        this.selectedGuestId();
        this.entryOpen();
        afterNextRender(() => {
          this.syncScrollShadowState();
        }, { injector: this.injector });
      },
      { injector: this.injector },
    );
  }

  protected onGuestListScroll(event: Event): void {
    const scrollContainer = event.target as HTMLElement | null;
    this.guestListScrolled.set((scrollContainer?.scrollTop ?? 0) > 0);
  }

  private syncScrollShadowState(): void {
    const guestListScroll = this.hostElement.nativeElement.querySelector<HTMLElement>(
      '[data-testid="active-guest-list-scroll"]',
    );

    this.guestListScrolled.set((guestListScroll?.scrollTop ?? 0) > 0);
  }
}
