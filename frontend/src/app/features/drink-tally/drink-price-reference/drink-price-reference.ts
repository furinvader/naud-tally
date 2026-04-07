import { ChangeDetectionStrategy, Component, input } from '@angular/core';

type DrinkPriceReferenceItem = {
  id: string;
  name: string;
  displayPrice: string;
};

@Component({
  selector: 'nt-drink-price-reference',
  templateUrl: './drink-price-reference.html',
  styleUrl: './drink-price-reference.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DrinkPriceReference {
  readonly drinks = input.required<ReadonlyArray<DrinkPriceReferenceItem>>();
}
