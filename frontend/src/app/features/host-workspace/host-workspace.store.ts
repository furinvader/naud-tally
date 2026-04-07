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
  createGuestCardViewModel,
  createSelectedGuestDrinkOrder,
  createSelectedGuestViewModel,
  SelectedGuestViewModel,
  updateSelectedGuestDrinkOrder,
} from '../drink-tally';
import { CatalogStore, DrinkId } from '../catalog';
import { GuestTabsStore } from '../guest-tabs';

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
    const guestTabsStore = inject(GuestTabsStore);
    const catalogStore = inject(CatalogStore);

    return {
      activeGuests: computed(() =>
        guestTabsStore
          .guestTabs()
          .map((guest) => createGuestCardViewModel(guest, catalogStore.drinkCatalog())),
      ),
      selectedGuest: computed<SelectedGuestViewModel | null>(() => {
        const selectedGuestId = store.selectedGuestId();

        if (!selectedGuestId) {
          return null;
        }

        const guest = guestTabsStore.guestTabs().find((entry) => entry.id === selectedGuestId);

        if (!guest) {
          return null;
        }

        return createSelectedGuestViewModel(
          guest,
          store.selectedGuestDrinkOrder(),
          catalogStore.drinkCatalog(),
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
    const guestTabsStore = inject(GuestTabsStore);
    const catalogStore = inject(CatalogStore);

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
        guestTabsStore.finalizeGuestTab(selectedGuestId);
      }

      clearScreenState(true);
    }

    function updateSelectedGuestCountsByDelta(drinkId: DrinkId, delta: number): void {
      const selectedGuestId = store.selectedGuestId();

      if (!selectedGuestId) {
        return;
      }

      const selectedGuest = store.selectedGuest();
      const guest = guestTabsStore.guestTabs().find((entry) => entry.id === selectedGuestId);

      if (!guest) {
        clearScreenState();
        return;
      }

      const drinkCatalog = catalogStore.drinkCatalog();

      const previousCount =
        selectedGuest?.activeDrinkTallies.find((drink) => drink.id === drinkId)?.count ?? 0;
      const nextCount = Math.max(0, previousCount + delta);

      if (!guestTabsStore.updateGuestDrinkCount(selectedGuestId, drinkId, delta, drinkCatalog)) {
        return;
      }

      patchInteractionState({
        selectedGuestDrinkOrder: updateSelectedGuestDrinkOrder(
          guest.counts,
          store.selectedGuestDrinkOrder(),
          drinkId,
          previousCount,
          nextCount,
          drinkCatalog,
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

        const guest = guestTabsStore.ensureGuestTab(roomNumber, fullName);

        if (!guest) {
          return;
        }

        patchInteractionState({
          selectedGuestId: guest.id,
          selectedGuestDrinkOrder: createSelectedGuestDrinkOrder(guest.counts, catalogStore.drinkCatalog()),
          addGuestStep: 'closed',
          draftRoomNumber: '',
          draftFullName: '',
        });
      },
      selectGuestTab(guestId: string): void {
        const guest = guestTabsStore.guestTabs().find((entry) => entry.id === guestId);

        if (!guest) {
          return;
        }

        if (store.selectedGuestId() === guestId) {
          closeSelectedGuestTabAndClearState();
          return;
        }

        patchInteractionState({
          selectedGuestId: guestId,
          selectedGuestDrinkOrder: createSelectedGuestDrinkOrder(guest.counts, catalogStore.drinkCatalog()),
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
