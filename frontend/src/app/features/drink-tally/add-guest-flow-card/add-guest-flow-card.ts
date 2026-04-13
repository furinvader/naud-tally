import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

import { AddGuestFlowCopy } from '../drink-tally.copy';
import { AddGuestFlowViewModel } from '../drink-tally.models';

@Component({
  selector: 'nt-add-guest-flow-card',
  imports: [MatButtonModule, MatCardModule, MatFormFieldModule, MatInputModule],
  templateUrl: './add-guest-flow-card.html',
  styleUrl: './add-guest-flow-card.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AddGuestFlowCard {
  readonly flow = input.required<AddGuestFlowViewModel>();
  readonly copy = input.required<AddGuestFlowCopy>();
  readonly roomNumberInput = output<string>();
  readonly fullNameInput = output<string>();
  readonly submitRoomNumber = output<void>();
  readonly submitGuestIdentity = output<void>();
  readonly back = output<void>();
  readonly cancelFlow = output<void>();

  protected onRoomNumberInput(event: Event): void {
    this.roomNumberInput.emit(this.readInputValue(event));
  }

  protected onFullNameInput(event: Event): void {
    this.fullNameInput.emit(this.readInputValue(event));
  }

  protected onRoomNumberSubmit(event: Event): void {
    event.preventDefault();
    this.submitRoomNumber.emit();
  }

  protected onGuestIdentitySubmit(event: Event): void {
    event.preventDefault();
    this.submitGuestIdentity.emit();
  }

  private readInputValue(event: Event): string {
    return (event.target as HTMLInputElement | null)?.value ?? '';
  }
}
