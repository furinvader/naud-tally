import { computed, inject } from '@angular/core';
import {
  patchState,
  signalStore,
  withComputed,
  withMethods,
  withState,
} from '@ngrx/signals';

import { CatalogStore, DrinkId } from '../catalog';
import { GuestTabsStore } from '../guest-tabs';
import { RoomsStore } from '../rooms';
import {
  RoomGuestViewModel,
  RoomListItemViewModel,
  SelectedGuestOrderViewModel,
  createRoomGuestViewModels,
  createRoomListItemViewModels,
  createSelectedGuestOrderViewModel,
} from './order-entry.models';

type OrderEntryState = {
  selectedRoomId: string | null;
  selectedGuestId: string | null;
  guestDraftOpen: boolean;
  draftGuestFullName: string;
  interactionVersion: number;
};

const initialState: OrderEntryState = {
  selectedRoomId: null,
  selectedGuestId: null,
  guestDraftOpen: false,
  draftGuestFullName: '',
  interactionVersion: 0,
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
              entry.id === selectedGuestId && entry.roomNumber === currentRoom.roomNumber,
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
    const guestTabsStore = inject(GuestTabsStore);
    const catalogStore = inject(CatalogStore);
    const roomsStore = inject(RoomsStore);

    function patchInteractionState(nextState: Partial<OrderEntryState>): void {
      patchState(store, {
        ...nextState,
        interactionVersion: store.interactionVersion() + 1,
      });
    }

    function finalizeSelectedGuestTab(): void {
      const selectedGuestId = store.selectedGuestId();

      if (!selectedGuestId) {
        return;
      }

      guestTabsStore.finalizeGuestTab(selectedGuestId);
    }

    function clearScreenState(shouldIncrementInteraction = false): void {
      finalizeSelectedGuestTab();

      const nextState: Partial<OrderEntryState> = {
        selectedRoomId: null,
        selectedGuestId: null,
        guestDraftOpen: false,
        draftGuestFullName: '',
      };

      if (shouldIncrementInteraction) {
        patchInteractionState(nextState);
        return;
      }

      patchState(store, nextState);
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

      patchInteractionState({});
    }

    function getSelectedRoom() {
      const selectedRoomId = store.selectedRoomId();

      if (!selectedRoomId) {
        return null;
      }

      return roomsStore.rooms().find((room) => room.id === selectedRoomId) ?? null;
    }

    return {
      selectRoom(roomId: string): void {
        const room = roomsStore.rooms().find((entry) => entry.id === roomId);

        if (!room) {
          return;
        }

        if (store.selectedRoomId() === room.id) {
          patchInteractionState({});
          return;
        }

        finalizeSelectedGuestTab();

        patchInteractionState({
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

        patchInteractionState({
          selectedGuestId: null,
          guestDraftOpen: true,
          draftGuestFullName: '',
        });
      },
      cancelGuestDraft(): void {
        patchInteractionState({
          guestDraftOpen: false,
          draftGuestFullName: '',
        });
      },
      updateDraftGuestFullName(fullName: string): void {
        patchInteractionState({
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

        patchInteractionState({
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
            (entry) => entry.id === guestId && entry.roomNumber === selectedRoom.roomNumber,
          );

        if (!guest) {
          return;
        }

        if (store.selectedGuestId() === guest.id) {
          finalizeSelectedGuestTab();

          patchInteractionState({
            selectedGuestId: null,
            guestDraftOpen: false,
            draftGuestFullName: '',
          });
          return;
        }

        patchInteractionState({
          selectedGuestId: guest.id,
          guestDraftOpen: false,
          draftGuestFullName: '',
        });
      },
      incrementDrink(drinkId: DrinkId): void {
        updateSelectedGuestCountsByDelta(drinkId, 1);
      },
      decrementDrink(drinkId: DrinkId): void {
        updateSelectedGuestCountsByDelta(drinkId, -1);
      },
      clearTransientState(): void {
        clearScreenState(true);
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
