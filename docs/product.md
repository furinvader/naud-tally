# Product Scope

## Working Definition

This project is a tablet-first tally app for guests and hosts. The main pilot screen is a public tally view on a shared tablet: active guests with existing tabs are listed prominently, a fixed drink catalog with reference prices stays visible in a top bar, and new guests can start from a clear `Add yourself` entry point. Guests identify themselves with their room number and full name, then record which drinks they take and how many inside their personal guest tab so the host can bill them on departure. Inside that personal tally surface, already-recorded drinks stay visible in a focused `Your drinks` list while zero-count drinks remain available through a separate `Add a drink` list.

The current pilot direction stays intentionally narrow: a single-screen public tally flow with guest tabs and local persistence, not a full guest-management, billing, or hotel-integration system.

The supporting UX reference for this flow lives in [`ux/guest-tab-ux.md`](ux/guest-tab-ux.md).

## Project Goals

### Goal 1: Learn Agentic AI Development

We want a real project that teaches a reusable way to work with Codex:

- define scope clearly
- break work into small tasks
- let the agent implement from written context
- review behavior and diffs
- record decisions and lessons

### Goal 2: Ship a Functional Pilot

We want a usable first version that can run on a tablet in a real-world setting and solve one narrow problem well: counting drinks taken by guests.

## Confirmed Pilot Rules

These are the rules for the current pilot direction:

- one tablet is used at a time
- the main experience stays on one screen
- the drink catalog is fixed and predefined
- the main screen shows drink names and reference prices in a top bar
- guests must identify themselves before drinks are assigned
- guest identification uses room number and full name
- guest identification is trust-based and stored only in the app
- active guests are any guests with an existing open tab in the current tally
- active guests should be shown prominently on the public screen
- new guests should start from a clear `Add yourself` entry path
- there are no accounts or integrated hotel systems
- returning guests should be able to reuse an existing tab instead of re-entering their details
- selecting or creating a guest tab should expand a non-modal personal tally surface on the same screen
- the personal tally surface should show already-recorded drinks separately from zero-count drinks
- tapping the currently selected guest again should close their personal tally surface
- the personal tally surface should close after 90 seconds of inactivity
- the UI is optimized for quick tapping and minimal navigation
- the UI is English-only for now
- the code should keep future i18n in mind
- local persistence is required so state survives a reload
- proper offline support beyond reload persistence is deferred to a later task

## Initial Sample Drink Catalog

The public tally view should show these fixed sample drinks and reference prices in a top reference bar.

- Water `€2.00`
- Sparkling Water `€2.50`
- Cola `€3.00`
- Cola Zero `€3.00`
- Lemon Soda `€3.00`
- Orange Soda `€3.00`
- Apple Juice `€3.50`
- Beer `€4.50`
- White Wine `€5.00`

## Primary Users

- Guests: want to find themselves quickly from the public screen or add themselves once, then record drinks without repeated typing
- Organizer or host: wants a clear shared-tablet view of active guest tabs by room and name so drinks can be billed on departure

## Core User Flow

1. A guest opens the app on the tablet.
2. The guest sees the public tally view with a top bar of drinks and reference prices, a prominent list of active guests, and an `Add yourself` entry point.
3. A returning guest selects their existing guest tab from the active list, or a new guest starts from `Add yourself`.
4. A new guest follows the `room number -> full name` path once to create a tab.
5. The app expands a non-modal personal tally surface for the selected guest and shows that guest's current tab clearly.
6. The guest uses `Add a drink` to record a first drink, then increments or decrements drinks from `Your drinks`.
7. The app immediately updates the selected guest counts, keeps broader tally information available on the main screen, and saves the current state.
8. The guest taps the currently selected guest again to close the personal tally surface, or the app closes it after 90 seconds of inactivity so the next person does not accidentally continue the previous tab.
9. If the page reloads, the previous tally state is restored and existing guest tabs remain available from the public tally view.

## In Scope for the Current Pilot

- tablet-first public tally layout
- predefined sample drink catalog with display prices shown as reference information
- single-screen public tally flow with guest tabs
- foundation-aligned baseline theming for the main tally UI
- prominent active guest list for existing guest tabs
- clear `Add yourself` entry path for new guests
- room-number then full-name capture when creating a guest tab
- non-modal expandable personal tally surface for a selected guest
- split selected-guest drink entry with `Your drinks` and `Add a drink` sections
- add and remove counts for each drink within the selected guest context
- visible guest-specific counts and current tab context
- overall tally information that remains accessible from the main screen
- shared-tablet handoff behavior with tap-again close and inactivity timeout
- persistence across reloads
- English UI text
- simple structure that can grow into i18n later

## Out of Scope for the Current Pilot

- separate organizer or admin area beyond the main tally screen
- authentication
- payments or checkout processing
- calculated monetary subtotals or checkout totals inside guest tabs
- inventory tracking
- hotel or billing system integration
- QR identification or other shortcut identification methods
- multi-tablet live synchronization
- advanced reporting
- role-based permissions
- proper offline support beyond reload persistence
- multilingual UI beyond English
- larger branding work beyond the shared design foundation and usability-driven theming

## UX Principles

- Large touch targets suitable for a tablet.
- Minimal text and minimal navigation.
- The public screen should prioritize active guests and a clear starting point for new guests.
- Keep drink names and reference prices visible without making the drink bar the primary interaction zone.
- Keep guest context unmistakable whenever a personal tally surface is open.
- Keep the selected-guest drink controls calm by surfacing only already-recorded drinks in the main tally list.
- Let repeat guests continue without re-entering identity details.
- Clear feedback after each tap.
- No hidden state changes.
- Recovery should be simple if someone taps the wrong thing.

## Functional Requirements

- The app must show a prominent list of active guests on the main screen.
- The app must offer a clear `Add yourself` action on the main screen.
- The app must use the fixed sample drink list for the current pilot.
- The app must show the fixed drink catalog and reference prices in a top bar on the main screen.
- A new guest tab must require room number followed by full name.
- A returning guest must be able to select an existing tab without re-entering those details.
- Selecting or creating a guest tab must expand a non-modal personal tally surface on the same screen without changing routes or opening an interruptive dialog.
- Drink actions must support one-tap add, increment, and decrement within a selected guest context.
- Zero-count drinks must be available through a separate `Add a drink` list in the personal tally surface.
- The current counts for the selected guest's recorded drinks must always be visible while that guest's tally surface is open.
- Prices must be displayed as reference information only; the current pilot does not require running monetary subtotals or checkout logic.
- The total number of drinks across all guests and a per-guest summary must remain available from the main screen without separate navigation.
- The personal tally surface must close when the selected guest is tapped again and after 90 seconds of inactivity.
- Data must persist across page reloads on the same device.
- The current pilot must use English UI text.

## Non-Functional Requirements

- The app should be usable on a tablet without onboarding.
- Common actions should take one tap when possible after a guest has selected their tab.
- The app should remain understandable in a busy social setting with a shared tablet handoff.
- The first version should stay simple enough that Codex can build it in small, reviewable steps.
- Text and labels should be easy to move into a future i18n layer.

## Risks

- First-time guests may miss the `Add yourself` entry point unless it is extremely obvious.
- A long active guest list may grow stale or crowded without a later archive or close-tab concept.
- A shared tablet may carry the previous guest context into the next interaction if the personal tally surface is not cleared clearly enough.
- Publicly showing room numbers and guest names increases privacy exposure on the shared tablet.
- Trust-based identification can still produce wrong-room or wrong-name entries.
- The 90-second inactivity timeout could still close a guest's tally surface while they are still using it.
- Reload-safe local persistence is not the same as full offline support.
- The fixed drink list and prices are only pilot placeholders.

## Deferred Questions

- Should guest tabs age out of the active guest list after inactivity, explicit close, or a later archive rule?
- What should the organizer area include first: reset, export, pricing, or room summary?
- When should QR or another shortcut identification method be added, if at all?
- How should the app handle edge cases such as guests with similar names in the same room?
- What level of offline support do we want beyond reload-safe local persistence?
- When we add i18n, which languages should come first after English?
