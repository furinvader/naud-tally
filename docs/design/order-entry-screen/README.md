# Order Entry Screen Brief

## Artifact

- Repo artifact directory: [`./`](./)
- Repo SVG export: [`order-entry-screen.svg`](order-entry-screen.svg)
- Optional Penpot share link: `not required for the repo workflow`
- Status: `brief updated for the ordered-drinks and inline-billing drinks-step refinement on 2026-04-10; the SVG still captures the broader focused-stepper shell`

## Goal

- Describe the focused room-first host order-entry screen that replaces the legacy guest-facing tally layout and the earlier simultaneous three-panel tablet layout on the active route.

## Screens

- Main order-entry screen for the active pilot route.
- Start from the mobile-first baseline in [`../foundations/README.md`](../foundations/README.md).
- Keep the host tools screen separate for room and catalog management, but allow the route to own lightweight per-guest billing confirmation.
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
- Keep the `Bill guest` action in the drinks-step summary row beside the running-total context.
- Keep the `Add drink` action anchored at the top of the drinks step so new drink types are easy to introduce without filling the main panel with the full catalog.
- Keep room and guest context visible in the step header instead of repeating a large descriptive header inside the drinks panel.
- Keep room, guest, and drinks lists in owned scroll regions so the main browser page does not become the primary scroll surface.
- Keep the host-tools shortcut in the top app bar instead of embedding room setup, catalog forms, or billing cards into the main route.

## Key States or Variants

- No rooms configured yet: show an empty-state message and a clear action that sends the host to the host tools screen to configure rooms.
- Room step: show the fixed room grid, keep the selected room highlighted if one already exists, and auto-advance to Guest after a room is tapped.
- Guest step with no open guests: show the selected room context, render an empty guest grid state, and keep the inline add-guest action visible.
- Guest step with existing guests: show guest cards for that room only and allow quick reselection of an open tab.
- Guest step with add-guest open: keep the draft field inline above the guest grid and let the host cancel back to the guest list.
- Drinks step: show only ordered drinks, keep them in first-added order, and place `Add drink` above the list so the host can open a lightweight picker for another drink type.
- Billing modal: open from the drinks step, show the guest identity, ordered drinks, and totals, and let the host cancel or confirm billing without leaving the route.
- Add-drink overlay: show active catalog items that are not yet on the current tab, with large tap targets and clear prices.
- Correction path: let the host tap Room or Guest in the step header without a warning dialog, while leaving already recorded drinks on the original tab until a new room or guest is chosen.

## Content and Copy Notes

- Primary route title stays `Naud Tally`.
- Main host-tools action should read as a host-facing shortcut such as `Host tools`.
- Room step heading should describe configured rooms, not open tabs.
- Guest step heading should describe guests in the selected room.
- Add-guest action should ask only for full name because room context is already fixed.
- The step header should keep the selected room and guest visible once they are chosen.
- The drinks step should show running price totals rather than billing-copy framing.
- The drinks step should not show the whole catalog by default; the add-drink overlay owns that broader selection moment.
- The billing modal should use concise confirm/cancel copy and let the line items do most of the explanation.

## Implementation Notes for Codex

- Keep the route composition under [`../../../frontend/src/app/features/order-entry/`](../../../frontend/src/app/features/order-entry/).
- Keep the step header local to the order-entry feature instead of promoting it to [`../../../frontend/src/app/ui/`](../../../frontend/src/app/ui/) too early.
- Reuse the shared shell primitives from [`../../../frontend/src/app/ui/`](../../../frontend/src/app/ui/) rather than rebuilding page chrome locally.
- Treat the current [`../../../frontend/src/app/features/drink-tally/`](../../../frontend/src/app/features/drink-tally/) surface as legacy presentation, not as the long-term contract for the active route.
- Keep the drinks step visually close to the current selected-guest panel and drink grid so the interaction change stays focused on navigation rather than drink-entry retraining.
- Keep the main drinks list limited to ordered drinks, preserving first-added order on the tab instead of re-sorting by count.
- Use a lightweight local overlay for `Add drink` before introducing a shared dialog abstraction.
- Use a similar lightweight local overlay for `Bill guest`, and close the tab into billed history when confirmation succeeds.
- Preserve large touch targets and clear visual confirmation when counts change.

## Open Questions or Follow-Up

- If the room or guest grids grow much larger later, revisit search, recents, grouping, or paging.
- Re-evaluate whether broader billing history or checkout details should stay separate after real host usage confirms the speed tradeoff.
- Revisit an adaptive split view later if very wide tablets would benefit from showing more than one step at a time.
