import { computed, inject } from '@angular/core';
import {
  patchState,
  signalStore,
  withComputed,
  withMethods,
  withState,
} from '@ngrx/signals';

import { BillingHistoryStore } from '../billing-history';
import { CatalogStore, DrinkId } from '../catalog';
import { GuestTabsStore, roomNumbersMatch } from '../guest-tabs';
import { RoomsStore } from '../rooms';
import {
  RoomGuestViewModel,
  RoomListItemViewModel,
  SelectedGuestOrderViewModel,
  createRoomGuestViewModels,
  createRoomListItemViewModels,
  createSelectedGuestOrderViewModel,
} from './order-entry.models';

export type OrderEntryStep = 'room' | 'guest' | 'drinks';

type OrderEntryState = {
  activeStep: OrderEntryStep;
  selectedRoomId: string | null;
  selectedGuestId: string | null;
  guestDraftOpen: boolean;
  draftGuestFullName: string;
};

const initialState: OrderEntryState = {
  activeStep: 'room',
  selectedRoomId: null,
  selectedGuestId: null,
  guestDraftOpen: false,
  draftGuestFullName: '',
};

export const OrderEntryStore = signalStore(
  withState(initialState),
  withComputed((store) => {
    const guestTabsStore = inject(GuestTabsStore);
    const catalogStore = inject(CatalogStore);
    const roomsStore = inject(RoomsStore);
    const selectedRoom = computed(() => {
      const selectedRoomId = store.selectedRoomId();

      if (!selectedRoomId) {
        return null;
      }

      return roomsStore.rooms().find((room) => room.id === selectedRoomId) ?? null;
    });

    return {
      rooms: computed<ReadonlyArray<RoomListItemViewModel>>(() =>
        createRoomListItemViewModels(roomsStore.rooms(), guestTabsStore.guestTabs()),
      ),
      selectedRoom,
      roomGuests: computed<ReadonlyArray<RoomGuestViewModel>>(() => {
        const currentRoom = selectedRoom();

        if (!currentRoom) {
          return [];
        }

        return createRoomGuestViewModels(
          currentRoom.roomNumber,
          guestTabsStore.guestTabs(),
          catalogStore.drinkCatalog(),
        );
      }),
      selectedGuest: computed<SelectedGuestOrderViewModel | null>(() => {
        const selectedGuestId = store.selectedGuestId();
        const currentRoom = selectedRoom();

        if (!selectedGuestId || !currentRoom) {
          return null;
        }

        const guest = guestTabsStore
          .guestTabs()
          .find(
            (entry) =>
              entry.id === selectedGuestId &&
              roomNumbersMatch(entry.roomNumber, currentRoom.roomNumber),
          );

        if (!guest) {
          return null;
        }

        return createSelectedGuestOrderViewModel(guest, catalogStore.drinkCatalog());
      }),
      guestDraft: computed(() => ({
        isOpen: store.guestDraftOpen(),
        fullName: store.draftGuestFullName(),
      })),
    };
  }),
  withMethods((store) => {
    const billingHistoryStore = inject(BillingHistoryStore);
    const guestTabsStore = inject(GuestTabsStore);
    const catalogStore = inject(CatalogStore);
    const roomsStore = inject(RoomsStore);

    function finalizeSelectedGuestTab(): void {
      const selectedGuestId = store.selectedGuestId();

      if (!selectedGuestId) {
        return;
      }

      guestTabsStore.finalizeGuestTab(selectedGuestId);
    }

    function clearScreenState(): void {
      finalizeSelectedGuestTab();

      patchState(store, {
        activeStep: 'room',
        selectedRoomId: null,
        selectedGuestId: null,
        guestDraftOpen: false,
        draftGuestFullName: '',
      });
    }

    function updateSelectedGuestCountsByDelta(drinkId: DrinkId, delta: number): void {
      const selectedGuestId = store.selectedGuestId();

      if (!selectedGuestId) {
        return;
      }

      const guest = guestTabsStore.guestTabs().find((entry) => entry.id === selectedGuestId);

      if (!guest) {
        clearScreenState();
        return;
      }

      if (
        !guestTabsStore.updateGuestDrinkCount(
          selectedGuestId,
          drinkId,
          delta,
          catalogStore.drinkCatalog(),
        )
      ) {
        return;
      }
    }

    function updateSelectedGuestCount(drinkId: DrinkId, nextCount: number): void {
      const selectedGuest = store.selectedGuest();

      if (!selectedGuest) {
        return;
      }

      const selectedDrink = selectedGuest.drinks.find((drink) => drink.id === drinkId);

      if (!selectedDrink) {
        return;
      }

      const delta = nextCount - selectedDrink.count;

      if (delta === 0) {
        return;
      }

      updateSelectedGuestCountsByDelta(drinkId, delta);
    }

    function getSelectedRoom() {
      const selectedRoomId = store.selectedRoomId();

      if (!selectedRoomId) {
        return null;
      }

      return roomsStore.rooms().find((room) => room.id === selectedRoomId) ?? null;
    }

    return {
      activateStep(step: OrderEntryStep): void {
        if (step === 'guest' && !store.selectedRoomId()) {
          return;
        }

        if (step === 'drinks' && !store.selectedGuestId()) {
          return;
        }

        if (store.activeStep() === step) {
          return;
        }

        patchState(store, {
          activeStep: step,
        });
      },
      selectRoom(roomId: string): void {
        const room = roomsStore.rooms().find((entry) => entry.id === roomId);

        if (!room) {
          return;
        }

        if (store.selectedRoomId() === room.id) {
          patchState(store, {
            activeStep: 'guest',
          });
          return;
        }

        finalizeSelectedGuestTab();

        patchState(store, {
          activeStep: 'guest',
          selectedRoomId: room.id,
          selectedGuestId: null,
          guestDraftOpen: false,
          draftGuestFullName: '',
        });
      },
      openGuestDraft(): void {
        if (!getSelectedRoom()) {
          return;
        }

        finalizeSelectedGuestTab();

        patchState(store, {
          activeStep: 'guest',
          selectedGuestId: null,
          guestDraftOpen: true,
          draftGuestFullName: '',
        });
      },
      cancelGuestDraft(): void {
        patchState(store, {
          activeStep: 'guest',
          guestDraftOpen: false,
          draftGuestFullName: '',
        });
      },
      updateDraftGuestFullName(fullName: string): void {
        patchState(store, {
          draftGuestFullName: fullName,
        });
      },
      submitGuestIdentity(): void {
        const selectedRoom = getSelectedRoom();
        const fullName = normalizeDisplayText(store.draftGuestFullName());

        if (!selectedRoom || !fullName) {
          return;
        }

        const guest = guestTabsStore.ensureGuestTab(selectedRoom.roomNumber, fullName);

        if (!guest) {
          return;
        }

        patchState(store, {
          activeStep: 'drinks',
          selectedGuestId: guest.id,
          guestDraftOpen: false,
          draftGuestFullName: '',
        });
      },
      selectGuestTab(guestId: string): void {
        const selectedRoom = getSelectedRoom();

        if (!selectedRoom) {
          return;
        }

        const guest = guestTabsStore
          .guestTabs()
          .find(
            (entry) =>
              entry.id === guestId && roomNumbersMatch(entry.roomNumber, selectedRoom.roomNumber),
          );

        if (!guest) {
          return;
        }

        if (store.selectedGuestId() === guest.id) {
          patchState(store, {
            activeStep: 'drinks',
          });
          return;
        }

        finalizeSelectedGuestTab();

        patchState(store, {
          activeStep: 'drinks',
          selectedGuestId: guest.id,
          guestDraftOpen: false,
          draftGuestFullName: '',
        });
      },
      setDrinkCount(drinkId: DrinkId, nextCount: unknown): void {
        updateSelectedGuestCount(drinkId, normalizeRequestedDrinkCount(nextCount));
      },
      billSelectedGuest(): boolean {
        const selectedGuestId = store.selectedGuestId();

        if (!selectedGuestId) {
          return false;
        }

        const closedGuestTab = guestTabsStore.closeGuestTab(selectedGuestId);

        if (!closedGuestTab) {
          patchState(store, {
            activeStep: store.selectedRoomId() ? 'guest' : 'room',
            selectedGuestId: null,
            guestDraftOpen: false,
            draftGuestFullName: '',
          });
          return false;
        }

        billingHistoryStore.recordBilledGuestTab(closedGuestTab, catalogStore.drinkCatalog());

        patchState(store, {
          activeStep: store.selectedRoomId() ? 'guest' : 'room',
          selectedGuestId: null,
          guestDraftOpen: false,
          draftGuestFullName: '',
        });

        return true;
      },
      incrementDrink(drinkId: DrinkId): void {
        updateSelectedGuestCountsByDelta(drinkId, 1);
      },
      decrementDrink(drinkId: DrinkId): void {
        updateSelectedGuestCountsByDelta(drinkId, -1);
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

function normalizeRequestedDrinkCount(value: unknown): number {
  if (typeof value === 'string' && value.trim().length === 0) {
    return 0;
  }

  const numericValue =
    typeof value === 'number' ? value : typeof value === 'string' ? Number(value) : NaN;

  if (!Number.isFinite(numericValue)) {
    return 0;
  }

  return Math.max(0, Math.trunc(numericValue));
}
