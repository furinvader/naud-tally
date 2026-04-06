import { computed, inject } from '@angular/core';
import {
  patchState,
  signalStore,
  withComputed,
  withMethods,
  withState,
} from '@ngrx/signals';

import {
  AddGuestFlowViewModel,
  AddGuestStep,
  createSelectedGuestDrinkOrder,
  createSelectedGuestViewModel,
  DrinkId,
  DrinkTallyStore,
  SelectedGuestViewModel,
  updateSelectedGuestDrinkOrder,
} from '../tally/drink-tally/drink-tally.store';

type HostWorkspaceState = {
  selectedGuestId: string | null;
  selectedGuestDrinkOrder: DrinkId[];
  addGuestStep: AddGuestStep;
  draftRoomNumber: string;
  draftFullName: string;
  interactionVersion: number;
};

const initialState: HostWorkspaceState = {
  selectedGuestId: null,
  selectedGuestDrinkOrder: [],
  addGuestStep: 'closed',
  draftRoomNumber: '',
  draftFullName: '',
  interactionVersion: 0,
};

export const HostWorkspaceStore = signalStore(
  withState(initialState),
  withComputed((store) => {
    const tallyStore = inject(DrinkTallyStore);

    return {
      activeGuests: computed(() => tallyStore.activeGuests()),
      selectedGuest: computed<SelectedGuestViewModel | null>(() => {
        const selectedGuestId = store.selectedGuestId();

        if (!selectedGuestId) {
          return null;
        }

        const guest = tallyStore.guestTabs().find((entry) => entry.id === selectedGuestId);

        if (!guest) {
          return null;
        }

        return createSelectedGuestViewModel(
          guest,
          store.selectedGuestDrinkOrder(),
          tallyStore.drinkCatalog(),
        );
      }),
      addGuestFlow: computed<AddGuestFlowViewModel>(() => ({
        step: store.addGuestStep(),
        roomNumber: store.draftRoomNumber(),
        fullName: store.draftFullName(),
      })),
    };
  }),
  withMethods((store) => {
    const tallyStore = inject(DrinkTallyStore);

    function patchInteractionState(nextState: Partial<HostWorkspaceState>): void {
      patchState(store, {
        ...nextState,
        interactionVersion: store.interactionVersion() + 1,
      });
    }

    function clearScreenState(shouldIncrementInteraction = false): void {
      const nextState: Partial<HostWorkspaceState> = {
        selectedGuestId: null,
        selectedGuestDrinkOrder: [],
        addGuestStep: 'closed',
        draftRoomNumber: '',
        draftFullName: '',
      };

      if (shouldIncrementInteraction) {
        patchInteractionState(nextState);
        return;
      }

      patchState(store, nextState);
    }

    function closeSelectedGuestTabAndClearState(): void {
      const selectedGuestId = store.selectedGuestId();

      if (selectedGuestId) {
        tallyStore.finalizeGuestTab(selectedGuestId);
      }

      clearScreenState(true);
    }

    function updateSelectedGuestCountsByDelta(drinkId: DrinkId, delta: number): void {
      const selectedGuestId = store.selectedGuestId();

      if (!selectedGuestId) {
        return;
      }

      const selectedGuest = store.selectedGuest();
      const guest = tallyStore.guestTabs().find((entry) => entry.id === selectedGuestId);

      if (!guest) {
        clearScreenState();
        return;
      }

      const previousCount =
        selectedGuest?.activeDrinkTallies.find((drink) => drink.id === drinkId)?.count ?? 0;
      const nextCount = Math.max(0, previousCount + delta);

      if (!tallyStore.updateGuestDrinkCount(selectedGuestId, drinkId, delta)) {
        return;
      }

      patchInteractionState({
        selectedGuestDrinkOrder: updateSelectedGuestDrinkOrder(
          guest.counts,
          store.selectedGuestDrinkOrder(),
          drinkId,
          previousCount,
          nextCount,
          tallyStore.drinkCatalog(),
        ),
      });
    }

    return {
      startAddGuestFlow(): void {
        patchInteractionState({
          selectedGuestId: null,
          selectedGuestDrinkOrder: [],
          addGuestStep: 'roomNumber',
          draftRoomNumber: '',
          draftFullName: '',
        });
      },
      cancelAddGuestFlow(): void {
        patchState(store, {
          addGuestStep: 'closed',
          draftRoomNumber: '',
          draftFullName: '',
        });
      },
      returnToRoomNumberStep(): void {
        patchInteractionState({
          addGuestStep: 'roomNumber',
          draftFullName: '',
        });
      },
      updateDraftRoomNumber(roomNumber: string): void {
        patchInteractionState({
          draftRoomNumber: roomNumber,
        });
      },
      submitRoomNumber(): void {
        const roomNumber = normalizeDisplayText(store.draftRoomNumber());

        if (!roomNumber) {
          return;
        }

        patchInteractionState({
          draftRoomNumber: roomNumber,
          addGuestStep: 'fullName',
        });
      },
      updateDraftFullName(fullName: string): void {
        patchInteractionState({
          draftFullName: fullName,
        });
      },
      submitGuestIdentity(): void {
        const roomNumber = normalizeDisplayText(store.draftRoomNumber());
        const fullName = normalizeDisplayText(store.draftFullName());

        if (!roomNumber || !fullName) {
          return;
        }

        const guest = tallyStore.ensureGuestTab(roomNumber, fullName);

        if (!guest) {
          return;
        }

        patchInteractionState({
          selectedGuestId: guest.id,
          selectedGuestDrinkOrder: createSelectedGuestDrinkOrder(
            guest.counts,
            tallyStore.drinkCatalog(),
          ),
          addGuestStep: 'closed',
          draftRoomNumber: '',
          draftFullName: '',
        });
      },
      selectGuestTab(guestId: string): void {
        const guest = tallyStore.guestTabs().find((entry) => entry.id === guestId);

        if (!guest) {
          return;
        }

        if (store.selectedGuestId() === guestId) {
          closeSelectedGuestTabAndClearState();
          return;
        }

        patchInteractionState({
          selectedGuestId: guestId,
          selectedGuestDrinkOrder: createSelectedGuestDrinkOrder(
            guest.counts,
            tallyStore.drinkCatalog(),
          ),
          addGuestStep: 'closed',
          draftRoomNumber: '',
          draftFullName: '',
        });
      },
      closeSelectedGuestTab(): void {
        if (!store.selectedGuestId()) {
          return;
        }

        closeSelectedGuestTabAndClearState();
      },
      incrementDrink(drinkId: DrinkId): void {
        updateSelectedGuestCountsByDelta(drinkId, 1);
      },
      decrementDrink(drinkId: DrinkId): void {
        updateSelectedGuestCountsByDelta(drinkId, -1);
      },
      clearTransientState(): void {
        if (store.selectedGuestId()) {
          closeSelectedGuestTabAndClearState();
          return;
        }

        clearScreenState();
      },
    };
  }),
);

function normalizeDisplayText(value: unknown): string {
  if (typeof value !== 'string') {
    return '';
  }

  return value.trim().replace(/\s+/g, ' ');
}
