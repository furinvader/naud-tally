# Order Entry Screen Brief

## Artifact

- Repo artifact directory: [`./`](./)
- Repo SVG export: [`order-entry-screen.svg`](order-entry-screen.svg)
- Optional Penpot share link: `not required for the repo workflow`
- Status: `updated for the room-first host workflow on 2026-04-09`

## Goal

- Describe the room-first host order-entry screen that replaces the legacy guest-facing tally layout on the active route.

## Screens

- Main order-entry screen for the active pilot route.
- Start from the mobile-first baseline in [`../foundations/README.md`](../foundations/README.md).
- Keep the host tools screen separate; this brief only covers the route that optimizes order taking.

## Layout and Spacing Notes

- Smallest supported layout: stack the room list, guest list, and selected-guest order panel in that order.
- Tablet layout: use three simultaneous regions with a narrow room rail, a guest list for the selected room, and one dominant order-entry panel.
- Stay aligned with the shared foundation: `16` radius outer panels, `14` radius selection and drink cards, `10` radius action controls, `8` radius compact inputs, and subtle tighter shadows only where containers need separation.
- Keep the room list and guest list in owned scroll regions so the main browser page does not become the primary scroll surface.
- Keep the selected guest header and running total anchored at the top of the dominant order-entry panel.
- Keep the host-tools shortcut in the top app bar instead of embedding room setup, catalog forms, or billing cards into the main route.

## Key States or Variants

- No rooms configured yet: show an empty-state message and a clear action that sends the host to the host tools screen to configure rooms.
- Room selected with no open guests: show the room as active, render an empty guest list state, and show a one-step full-name add action.
- Room selected with existing guests: show guest cards for that room only and allow quick reselection of an open tab.
- Guest selected: show the guest identity, room, running total, and the fast drink grid with add and remove controls.
- Narrow layout: preserve the same interaction order while collapsing the simultaneous tablet regions into stacked sections.

## Content and Copy Notes

- Primary route title stays `Naud Tally`.
- Main host-tools action should read as a host-facing shortcut such as `Host tools`.
- Room list heading should describe configured rooms, not open tabs.
- Guest list heading should describe guests in the selected room.
- Add-guest action should ask only for full name because room context is already fixed.
- Selected guest header should show room and guest name together.
- The order-entry panel should show running price totals rather than billing-copy framing.

## Implementation Notes for Codex

- Keep the route composition under [`../../../frontend/src/app/features/order-entry/`](../../../frontend/src/app/features/order-entry/).
- Add room persistence as a new capability under [`../../../frontend/src/app/features/`](../../../frontend/src/app/features/), then consume it through the order-entry route and the host screen.
- Reuse the shared shell primitives from [`../../../frontend/src/app/ui/`](../../../frontend/src/app/ui/) rather than rebuilding page chrome locally.
- Treat the current [`../../../frontend/src/app/features/drink-tally/`](../../../frontend/src/app/features/drink-tally/) surface as legacy presentation, not as the long-term contract for the active route.
- Preserve large touch targets and clear visual confirmation when counts change.

## Open Questions or Follow-Up

- If the room list grows much larger later, revisit whether the room rail needs filtering or grouping.
- Re-evaluate whether billing should stay separate after real host usage confirms the speed tradeoff.
