# Order Entry Screen Brief

## Artifact

- Repo artifact directory: [`./`](./)
- Repo SVG export: [`order-entry-screen.svg`](order-entry-screen.svg)
- Optional Penpot share link: `not required for the repo workflow`
- Status: `updated for the focused room-first stepper on 2026-04-09`

## Goal

- Describe the focused room-first host order-entry screen that replaces the legacy guest-facing tally layout and the earlier simultaneous three-panel tablet layout on the active route.

## Screens

- Main order-entry screen for the active pilot route.
- Start from the mobile-first baseline in [`../foundations/README.md`](../foundations/README.md).
- Keep the host tools screen separate; this brief only covers the route that optimizes order taking.
- Keep one visible workflow step at a time: `room -> guest -> drinks`.

## Layout and Spacing Notes

- Keep a persistent step header below the app bar with three chips for Room, Guest, and Drinks.
- Each step chip should show the step number, the step label, and a short summary such as the selected room, selected guest, or running total.
- Completed and current step chips should stay tappable; future steps should stay disabled until their prerequisites exist.
- Smallest supported layout: stack the step chips vertically, then show one step panel below them.
- Tablet layout: keep the step chips in one row and show one dominant step panel below them.
- Stay aligned with the shared foundation: `16` radius outer panels, `14` radius selection and drink cards, `10` radius action controls, `8` radius compact inputs, and subtle tighter shadows only where containers need separation.
- Present rooms in a responsive grid with large tap targets and visible open-guest counts.
- Present guests for the selected room in a responsive grid with full name, drinks summary, and running total.
- Keep the guest-add form inline inside the guest step instead of turning it into a separate step or modal.
- Keep the selected guest header and running total anchored at the top of the drinks step.
- Keep room, guest, and drinks lists in owned scroll regions so the main browser page does not become the primary scroll surface.
- Keep the host-tools shortcut in the top app bar instead of embedding room setup, catalog forms, or billing cards into the main route.

## Key States or Variants

- No rooms configured yet: show an empty-state message and a clear action that sends the host to the host tools screen to configure rooms.
- Room step: show the fixed room grid, keep the selected room highlighted if one already exists, and auto-advance to Guest after a room is tapped.
- Guest step with no open guests: show the selected room context, render an empty guest grid state, and keep the inline add-guest action visible.
- Guest step with existing guests: show guest cards for that room only and allow quick reselection of an open tab.
- Guest step with add-guest open: keep the draft field inline above the guest grid and let the host cancel back to the guest list.
- Drinks step: show the guest identity, room, running total, and the fast drink grid with add and remove controls.
- Correction path: let the host tap Room or Guest in the step header without a warning dialog, while leaving already recorded drinks on the original tab until a new room or guest is chosen.

## Content and Copy Notes

- Primary route title stays `Naud Tally`.
- Main host-tools action should read as a host-facing shortcut such as `Host tools`.
- Room step heading should describe configured rooms, not open tabs.
- Guest step heading should describe guests in the selected room.
- Add-guest action should ask only for full name because room context is already fixed.
- The step header should keep the selected room and guest visible once they are chosen.
- Selected guest header should show room and guest name together.
- The drinks step should show running price totals rather than billing-copy framing.

## Implementation Notes for Codex

- Keep the route composition under [`../../../frontend/src/app/features/order-entry/`](../../../frontend/src/app/features/order-entry/).
- Keep the step header local to the order-entry feature instead of promoting it to [`../../../frontend/src/app/ui/`](../../../frontend/src/app/ui/) too early.
- Reuse the shared shell primitives from [`../../../frontend/src/app/ui/`](../../../frontend/src/app/ui/) rather than rebuilding page chrome locally.
- Treat the current [`../../../frontend/src/app/features/drink-tally/`](../../../frontend/src/app/features/drink-tally/) surface as legacy presentation, not as the long-term contract for the active route.
- Keep the drinks step visually close to the current selected-guest panel and drink grid so the interaction change stays focused on navigation rather than drink-entry retraining.
- Preserve large touch targets and clear visual confirmation when counts change.

## Open Questions or Follow-Up

- If the room or guest grids grow much larger later, revisit search, recents, grouping, or paging.
- Re-evaluate whether billing should stay separate after real host usage confirms the speed tradeoff.
- Revisit an adaptive split view later if very wide tablets would benefit from showing more than one step at a time.
