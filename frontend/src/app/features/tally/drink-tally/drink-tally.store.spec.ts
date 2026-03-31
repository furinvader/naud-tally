import { TestBed } from '@angular/core/testing';

import {
  DRINK_CATALOG,
  DRINK_TALLY_STORAGE_KEY,
  DrinkTallyStore,
} from './drink-tally.store';

describe('DrinkTallyStore', () => {
  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({});
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should start with the fixed drink catalog and zero counts', () => {
    const store = TestBed.inject(DrinkTallyStore);

    expect(store.drinkTallies().map((drink) => drink.name)).toEqual(
      DRINK_CATALOG.map((drink) => drink.name),
    );
    expect(store.drinkTallies().every((drink) => drink.count === 0)).toBe(true);
    expect(store.totalCount()).toBe(0);
  });

  it('should increment and decrement without going below zero', () => {
    const store = TestBed.inject(DrinkTallyStore);

    store.incrementDrink('water');
    store.incrementDrink('beer');
    store.decrementDrink('water');
    store.decrementDrink('water');

    expect(store.drinkTallies().find((drink) => drink.id === 'water')?.count).toBe(0);
    expect(store.drinkTallies().find((drink) => drink.id === 'beer')?.count).toBe(1);
    expect(store.totalCount()).toBe(1);
  });

  it('should restore persisted counts from local storage', () => {
    localStorage.setItem(
      DRINK_TALLY_STORAGE_KEY,
      JSON.stringify({
        water: 2,
        beer: 3,
        cola: -4,
        guestChoice: 7,
      }),
    );

    const store = TestBed.inject(DrinkTallyStore);

    expect(store.drinkTallies().find((drink) => drink.id === 'water')?.count).toBe(2);
    expect(store.drinkTallies().find((drink) => drink.id === 'beer')?.count).toBe(3);
    expect(store.drinkTallies().find((drink) => drink.id === 'cola')?.count).toBe(0);
    expect(store.totalCount()).toBe(5);
  });
});
