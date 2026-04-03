# Public Tally View and Guest Tab UX

This brief describes the intended user experience for the public tally view and the guest-tab flow it exposes on the shared tablet.

It supports the repository decision recorded in [`../decisions.md`](../decisions.md) and the product scope in [`../product.md`](../product.md), but it is intentionally focused on the interaction model rather than the decision itself.

## Context

- The host bills guests on departure, so anonymous drink totals are not accurate enough.
- There are no integrated hotel systems available to verify or preload guest identity.
- The app can only rely on the information entered directly on the shared tablet.
- The interaction should stay close to a real paper tally: visible at a glance, low-friction, and light on repeated input.
- The first pilot treats the main screen as a public shared surface, not as a private personal workspace.

## UX Goals

- Prioritize returning guests by showing active tabs prominently.
- Give new guests a clear `Add yourself` entry point.
- Require guest identification before drinks are recorded.
- Keep the experience on one screen without route changes or interruptive dialogs.
- Let returning guests continue without re-entering their details.
- Reduce accidental carryover from one guest to the next on a shared tablet.
- Stay simple enough to use without explanation in a busy social setting.

## Required Guest Information

- Room number
- Full name

This identification model is trust-based. The app should support it clearly, but it should not imply stronger verification than it actually provides.

## Working Terms

- Public tally view: the default shared-tablet screen with a top drink-and-price bar, a prominent active guest list, and an `Add yourself` action.
- Active guest: any guest with an existing open tab in the current tally.
- Personal tally surface: the non-modal drawer or panel that expands in place for the selected guest.

## Recommended Screen Model

- Keep the experience on one screen.
- The default public tally view should show a top bar with drink names and display prices.
- The main body should prioritize active guests with existing tabs.
- A clear `Add yourself` control should remain visible even when active guests exist.
- Make guest selection mandatory before drink controls are active.
- Let a new guest create a tab by following the `room number -> full name` path once.
- Let a returning guest select an existing tab instead of retyping those details.
- Selecting or creating a guest should expand the personal tally surface in place.
- The personal tally surface should show the selected guest clearly while drinks are being recorded.

## Recommended Layout

- Use a single-screen shared-tablet layout with distinct public and personal layers.
- A top bar should show the fixed drink catalog and display prices as informational reference.
- The active guest list should be the primary interactive zone of the public screen.
- The `Add yourself` control should stay visible alongside the active guest list.
- The personal tally surface should expand as a non-modal drawer or panel within the same screen.
- The personal tally surface should include a prominent close action.

## Interaction Notes

- Active guest listing should optimize for fast recognition and repeat use, not for exhaustive hotel browsing.
- Room number should be selected before full name when creating a new guest tab.
- Full name should confirm identity within the selected room.
- The personal tally surface must make the selected guest unmistakable.
- Creating a guest tab should feel lightweight, not like account registration.
- After each drink change, the app should give immediate feedback and make recovery easy, such as through `Undo`.
- The personal tally surface should close after inactivity, explicit close, or a combination of both so the next person does not accidentally use the previous tab.
- If the active guest list grows large, later archive, grouping, or recency rules may become necessary to avoid stale noise.

## Flow Patterns Considered

### Room-First Default Screen

- Start the whole experience on room selection.
- This was not preferred because repeat guests should not need to begin from rooms when active tabs already exist, and it hides the active shared usage of the tablet.

### Drinks-First Shared Overview

- Start on the drink overview and ask for room number and name only when a guest wants to add drinks.
- This was not preferred because the drink area becomes too dominant for a public shared surface and the new-guest path stays less explicit.

### Active-Guest Public View

- Start on a public screen with a drink-and-price reference bar, a prominent active guest list, and a clear `Add yourself` action.
- Selecting or creating a guest opens a personal tally surface in place without route changes or dialogs.
- This is the preferred base pattern because it keeps repeat use fast, gives first-time guests a clear entry path, and preserves the one-screen shared-tablet model.

## Out of Scope for This UX Slice

- QR identification or other shortcut identification methods
- external hotel or billing system integrations
- payment processing or checkout flows
- calculated billing subtotals inside the guest-facing tally flow
- stronger identity verification than the trust-based room-plus-name model

## Follow-Up

- Treat this file and [`../product.md`](../product.md) as the UX reference for [`../tasks/open/T-009.md`](../tasks/open/T-009.md).
- A future host or admin surface can be revisited later as a separate slice from this public tally view.
- QR identification can be revisited later as an optional shortcut, but it is explicitly out of scope for the current slice.
