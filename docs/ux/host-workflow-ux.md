# Host Main Workflow UX

This brief describes the intended user experience for the current host-operated pilot.

It supports the repository decisions recorded in [`../decisions.md`](../decisions.md) and the product scope in [`../product.md`](../product.md), but it is intentionally focused on the interaction model rather than the full implementation.

## Context

- The host is the primary user in the current pilot.
- The host needs one main order entry surface for quick room-first guest selection and rapid drink entry on a tablet.
- Rooms, products, and prices still need lightweight management because the host maintains the live setup.
- Billing on departure remains part of the product workflow, but it does not need to share the main order-entry surface in this slice.
- The app must remain usable when connectivity drops and recover safely after reconnect, reinstall, or replacement-device setup.

## UX Goals

- Keep the host on one primary order entry screen for the main service workflow.
- Make `select room -> select guest -> orders` feel fast and obvious.
- Keep the currently selected guest unmistakable while orders are being recorded.
- Minimize context switching during order taking, while keeping host tools easy to reach when setup or billing work is needed.
- Preserve large touch targets and low-friction use on a tablet.
- Avoid full-page scroll on tablet layouts when an owned screen region can carry the scroll instead.
- Make offline or sync state understandable without distracting the host during service.

## Working Terms

- Order entry screen: the current default pilot surface where the host selects a room, chooses or creates a guest tab inside that room, and records orders. A future overview screen may later replace it as the landing surface, but that work is deferred.
- Open tab: any guest record that is still active and not yet billed.
- Quick order controls: touch-first product controls that let the host add, increment, or decrement orders for the selected guest.
- Host tools screen: the supporting host-operated screen where rooms, products, and billing actions are managed outside the main order-entry surface.

## Recommended Screen Model

- Keep the host workflow on one main route.
- Start from a host-first screen, not from a public guest-facing surface.
- Make room selection, then guest selection or creation, the clear entry path for new orders.
- Let the host reopen an existing guest tab quickly when the guest returns or orders again.
- Keep the selected guest header visible while order controls remain nearby.
- Show order-entry controls as the primary interaction zone once a guest is selected.
- Keep the host tools shortcut visible, but let the main screen focus on order taking rather than setup or billing detail.

## Recommended Layout

- Use a tablet-first layout with one dominant order-entry panel plus supporting room and guest-selection panels.
- Keep the room list and the guest list for the selected room visible enough that the host can switch context without losing the active guest.
- Keep the selected guest identity and running total visible while orders are added.
- Let long lists and tall detail sections scroll inside their own owned regions or route content area instead of the browser page whenever practical.
- Present products as fast tap targets with clear prices and counts.
- Avoid deep modal flows for common service actions.
- Reserve confirmations for destructive actions such as reset, delete, or final billing.
- Keep top navigation and the active-work context visually anchored while supporting regions scroll.
- Keep sync or offline status visible in a calm, low-noise way.

## Interaction Notes

- Creating a guest tab should feel closer to opening a paper tab than to filling out an account form.
- Reopening an existing tab should be faster than creating a new one.
- The host should not need to type a room number while taking an order if the room has already been configured.
- The host should be able to add the most common order with one tap after selecting the guest.
- Moving to host tools for room setup, catalog edits, or billing should be explicit and easy, but not the default interaction path while taking orders.
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

- Treat this file and [`../product.md`](../product.md) as the UX reference for [`../tasks/open/T-018.md`](../tasks/open/T-018.md).
- Treat this file as supporting context for [`../tasks/open/T-019.md`](../tasks/open/T-019.md), [`../tasks/open/T-020.md`](../tasks/open/T-020.md), and [`../tasks/open/T-022.md`](../tasks/open/T-022.md).
- Treat [`guest-tab-ux.md`](guest-tab-ux.md) as deferred future UX, not as the current pilot target.
