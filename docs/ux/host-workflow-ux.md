# Host Main Workflow UX

This brief describes the intended user experience for the current host-operated pilot.

It supports the repository decisions recorded in [`../decisions.md`](../decisions.md) and the product scope in [`../product.md`](../product.md), but it is intentionally focused on the interaction model rather than the full implementation.

## Context

- The host is the primary user in the current pilot.
- The host needs one main order entry surface for quick room-first guest selection and rapid drink entry on a tablet.
- Rooms, products, and prices still need lightweight management because the host maintains the live setup.
- Billing on departure remains part of the product workflow, and the current guest should be billable from the drinks step through a lightweight confirmation modal.
- The app must remain usable when connectivity drops and recover safely after reconnect, reinstall, or replacement-device setup.

## UX Goals

- Keep the host on one primary order entry screen for the main service workflow.
- Make `select room -> select guest -> orders` feel fast and obvious.
- Keep the currently selected guest unmistakable while orders are being recorded.
- Minimize context switching during order taking, while keeping host tools easy to reach when setup or billing work is needed.
- Keep one workflow step in focus at a time without making correction paths feel hidden.
- Preserve large touch targets and low-friction use on a tablet.
- Avoid full-page scroll on tablet layouts when an owned screen region can carry the scroll instead.
- Make offline or sync state understandable without distracting the host during service.

## Working Terms

- Order entry screen: the current default pilot surface where the host selects a room, chooses or creates a guest tab inside that room, and records orders. A future overview screen may later replace it as the landing surface, but that work is deferred.
- Open tab: any guest record that is still active and not yet billed.
- Quick order controls: touch-first product controls that let the host add a drink type, increment or decrement an ordered drink, or type a larger quantity directly for the selected guest.
- Host tools screen: the supporting host-operated screen where rooms, products, and broader billing review are managed outside the main order-entry surface.

## Recommended Screen Model

- Keep the host workflow on one main route.
- Start from a host-first screen, not from a public guest-facing surface.
- Use a visible three-step header for `room -> guest -> drinks`.
- Make room selection, then guest selection or creation, the clear entry path for new orders.
- Let the host tap completed or current steps in the header to move back without opening a separate modal flow.
- Let the host reopen an existing guest tab quickly when the guest returns or orders again.
- Keep the selected room and selected guest visible in the step header after they are chosen.
- Keep the current room and guest active until the host explicitly changes them from the step header.
- Show only one step body at a time, with order-entry controls becoming the primary interaction zone once a guest is selected.
- Keep the host tools shortcut visible, but let the main screen focus on order taking plus lightweight per-guest billing confirmation rather than setup or admin detail.

## Recommended Layout

- Use a tablet-first layout with a persistent step header and one dominant step panel below it.
- Present rooms as a touch-friendly grid in the room step.
- Present guests for the selected room as a touch-friendly grid in the guest step.
- Keep the selected guest identity and running total visible while orders are added in the drinks step.
- Let long room lists, guest lists, and drink lists scroll inside their own owned regions or route content area instead of the browser page whenever practical.
- In the drinks step, show only drinks already recorded on the tab and keep them ordered by when they were first added.
- Keep a `Bill guest` action in the drinks-step summary row, close to the running-total context it acts on.
- Keep an `Add drink` action near the ordered-drinks list that opens a lightweight picker for active catalog items not yet on the tab.
- Let the drinks step open a lightweight billing overview modal where the host and guest can review line items and confirm the tab together.
- Keep direct quantity entry available for larger repeat orders, alongside plus and minus controls for quick adjustments.
- Avoid deep modal flows for common service actions, but allow a lightweight overlay when it clearly reduces clutter.
- Reserve confirmations for destructive actions such as reset, delete, or final billing.
- Keep top navigation and the active-work context visually anchored while supporting regions scroll.
- Keep sync or offline status visible in a calm, low-noise way.

## Interaction Notes

- Creating a guest tab should feel closer to opening a paper tab than to filling out an account form.
- Reopening an existing tab should be faster than creating a new one.
- The host should not need to type a room number while taking an order if the room has already been configured.
- Stepping back to room or guest selection should not interrupt the host with a warning dialog.
- Do not auto-clear the current room or guest after inactivity on the host-operated screen.
- If the host changes room or guest after stepping back, drinks already recorded should remain on the originally selected tab until the host makes a new selection.
- The drinks step should hide unused catalog items until the host explicitly asks to add another drink type.
- Already ordered drinks should stay in first-added order instead of re-sorting by quantity or price.
- The host should be able to repeat an already ordered drink with one tap and type larger counts directly when needed.
- Billing the current guest should happen from the drinks step without forcing a trip to host tools, but broader room setup, catalog edits, and billing history review should still live there.
- If a screen section can own its own scrolling without harming usability, prefer that over a full-window scroll on tablet layouts.
- If connectivity is lost, the app should continue from local state and defer remote sync work.
- When connectivity returns, sync should resume without requiring the host to re-enter data.

## Out of Scope for This UX Slice

- public guest self-service access
- payment processing
- hotel-system integration
- simultaneous multi-tablet live collaboration
- detailed remote-backend setup UI

## Follow-Up

- Treat this file and [`../product.md`](../product.md) as the UX reference for [`../tasks/done/T-018.md`](../tasks/done/T-018.md) and later refinements recorded in [`../tasks/done/T-014.md`](../tasks/done/T-014.md).
- Treat this file as supporting context for [`../tasks/done/T-019.md`](../tasks/done/T-019.md), [`../tasks/open/T-020.md`](../tasks/open/T-020.md), and [`../tasks/open/T-022.md`](../tasks/open/T-022.md).
- Treat [`guest-tab-ux.md`](guest-tab-ux.md) as deferred future UX, not as the current pilot target.
- Revisit search, recents, or grouping if room or guest grids grow beyond the pilot’s small-list assumptions.
- Revisit an adaptive split view later if host testing shows the focused stepper slows extra-wide tablet usage.
