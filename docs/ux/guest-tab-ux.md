# Guest Tab UX

This brief describes the intended user experience for the guest-tab flow.

It supports the repository decision recorded in [`../decisions.md`](../decisions.md) and the product scope in [`../product.md`](../product.md), but it is intentionally focused on the interaction model rather than the decision itself.

## Context

- The host bills guests on departure, so anonymous drink totals are not accurate enough.
- There are no integrated hotel systems available to verify or preload guest identity.
- The app can only rely on the information entered directly on the shared tablet.
- The interaction should stay close to a real paper tally: visible at a glance, low-friction, and light on repeated input.

## UX Goals

- Keep drinks and guest context visible together.
- Require guest identification before drinks are recorded.
- Let returning guests continue without re-entering their details.
- Reduce accidental carryover from one guest to the next on a shared tablet.
- Stay simple enough to use without explanation in a busy social setting.

## Required Guest Information

- Room number
- Full name

This identification model is trust-based. The app should support it clearly, but it should not imply stronger verification than it actually provides.

## Recommended Screen Model

- Keep the experience on one screen.
- Show the drink overview and the current guest tabs at the same time.
- Make guest selection mandatory before drink controls are active.
- Let a new guest create a tab by entering room number and full name once.
- Let a returning guest select an existing tab instead of retyping those details.
- Show the active guest prominently while drinks are being recorded.

## Recommended Layout

- Use a split tablet layout.
- One area should show open guest tabs.
- One area should show the drink grid.
- A prominent active-guest bar should stay visible near the drink controls.
- The active-guest bar should include a clear handoff action such as `Done` or `Switch guest`.

## Interaction Notes

- Room number should be the primary scanning cue in the guest list.
- Full name should confirm identity rather than replace the room as the main anchor.
- Creating a guest tab should feel lightweight, not like account registration.
- After each drink change, the app should give immediate feedback and make recovery easy, such as through `Undo`.
- The active guest should clear after inactivity, explicit handoff, or a combination of both so the next person does not accidentally use the previous tab.
- If the guest list grows large, search, room grouping, or recency sorting may become necessary.

## Flow Patterns Considered

### Step-Based Room-First Flow

- Start on a room overview, then enter name, then move into drink selection.
- This was not preferred because it adds navigation, hides the drinks too early, and makes shared-tablet recovery harder.

### Drinks-First Flow With Identity Prompt

- Start on the drink overview and ask for room number and name only when a guest wants to add drinks.
- This was not preferred because identity becomes an interruption and repeated drink selection can still create too much jumping.

### Single-Screen Guest List Plus Drinks

- Keep drinks and existing guests together on one overview screen.
- This is the preferred base pattern because it matches the real tally best and keeps the interaction understandable at a glance.
- It works best when paired with a clearly visible active-guest state and handoff protection.

## Out of Scope for This UX Slice

- QR identification or other shortcut identification methods
- external hotel or billing system integrations
- payment processing or checkout flows
- stronger identity verification than the trust-based room-plus-name model

## Follow-Up

- Treat this file and [`../product.md`](../product.md) as the UX reference for [`../tasks/open/T-009.md`](../tasks/open/T-009.md).
- QR identification can be revisited later as an optional shortcut, but it is explicitly out of scope for the current slice.
