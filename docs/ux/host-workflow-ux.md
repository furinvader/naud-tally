# Host Main Workflow UX

This brief describes the intended user experience for the current host-operated pilot.

It supports the repository decisions recorded in [`../decisions.md`](../decisions.md) and the product scope in [`../product.md`](../product.md), but it is intentionally focused on the interaction model rather than the full implementation.

## Context

- The host is the primary user in the current pilot.
- The host needs one main working surface for quick room-name-order-billing flow on a tablet.
- Products and prices still need lightweight management because the host may change the live catalog.
- Billing on departure is part of the core workflow, not a side tool.
- The app must remain usable when connectivity drops and recover safely after reconnect, reinstall, or replacement-device setup.

## UX Goals

- Keep the host on one primary screen for the main service workflow.
- Make `room number -> full name -> orders` feel fast and obvious.
- Keep the currently selected guest unmistakable while orders are being recorded.
- Minimize context switching between order entry, product management, and billing.
- Preserve large touch targets and low-friction use on a tablet.
- Make offline or sync state understandable without distracting the host during service.

## Working Terms

- Host main screen: the default pilot surface where the host finds or creates a guest tab, records orders, and reaches adjacent billing or product actions.
- Open tab: any guest record that is still active and not yet billed.
- Quick order controls: touch-first product controls that let the host add, increment, or decrement orders for the selected guest.
- Billing surface: the part of the host workflow where the host reviews totals and closes a tab on departure.

## Recommended Screen Model

- Keep the host workflow on one main route.
- Start from a host-first screen, not from a public guest-facing surface.
- Make room number and full name the clear entry path for a new guest tab.
- Let the host reopen an existing guest tab quickly when the guest returns or orders again.
- Keep the selected guest header visible while order controls remain nearby.
- Show order-entry controls as the primary interaction zone once a guest is selected.
- Keep billing and product-management actions visible but secondary to rapid order entry.
- Preserve recent billed history as supporting context, not as the main screen focus.

## Recommended Layout

- Use a tablet-first layout with one dominant order-entry panel and supporting side panels or sections.
- Keep the guest lookup or open-tab list visible enough that the host can switch guests without losing context.
- Keep the selected guest identity and running total visible while orders are added.
- Present products as fast tap targets with clear prices and counts.
- Avoid deep modal flows for common service actions.
- Reserve confirmations for destructive actions such as reset, delete, or final billing.
- Keep sync or offline status visible in a calm, low-noise way.

## Interaction Notes

- Creating a guest tab should feel closer to opening a paper tab than to filling out an account form.
- Reopening an existing tab should be faster than creating a new one.
- The host should be able to add the most common order with one tap after selecting the guest.
- Product-management actions should not interrupt active order entry unless they change the live catalog immediately.
- Billing should show enough detail to confirm the tab confidently without turning into a full checkout or payment flow.
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
