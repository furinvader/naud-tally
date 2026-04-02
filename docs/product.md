# Product Scope

## Working Definition

This project is a tablet-first tally app for guests and hosts. Guests identify themselves with their room number and full name, then record which drinks they take and how many so the host can bill them on departure.

The current pilot direction stays intentionally narrow: a single-screen guest-tab flow with local persistence, not a full guest-management, billing, or hotel-integration system.

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
- the drink list is fixed and predefined
- guests must identify themselves before drinks are assigned
- guest identification uses room number and full name
- guest identification is trust-based and stored only in the app
- there are no accounts or integrated hotel systems
- returning guests should be able to reuse an existing tab instead of re-entering their details
- the UI is optimized for quick tapping and minimal navigation
- the UI is English-only for now
- the code should keep future i18n in mind
- local persistence is required so state survives a reload
- proper offline support beyond reload persistence is deferred to a later task

## Initial Sample Drink List

We will start with a fixed example list for implementation and testing:

- Water
- Sparkling Water
- Cola
- Cola Zero
- Lemon Soda
- Orange Soda
- Apple Juice
- Beer
- White Wine

## Primary Users

- Guests: want a fast, obvious way to identify themselves once and then record drinks without repeated typing
- Organizer or host: wants a clear guest-by-guest overview by room and name so drinks can be billed on departure

## Core User Flow

1. A guest opens the app on the tablet.
2. The guest sees the drink list and the current guest tabs on the same screen.
3. A new guest creates a tab by entering room number and full name, or a returning guest selects an existing tab.
4. The app shows the active guest clearly and enables drink controls in that guest context.
5. The guest increments or decrements the drinks they took.
6. The app immediately updates the selected guest counts, updates overall totals, and saves the current state.
7. The guest finishes, or the app clears the active guest after inactivity so the next person does not accidentally continue the previous tab.
8. If the page reloads, the previous guest and tally state is restored.

## In Scope for the Current Pilot

- tablet-first layout
- predefined sample drink catalog
- single-screen guest-tab flow
- foundation-aligned baseline theming for the main tally UI
- create and select guest tabs using room number and full name
- add and remove counts for each drink within the active guest context
- always-visible drink overview
- always-visible guest list or open tabs
- visible guest-specific counts and overall totals
- shared-tablet handoff behavior that reduces accidental carryover between guests
- persistence across reloads
- English UI text
- simple structure that can grow into i18n later

## Out of Scope for the Current Pilot

- separate organizer or admin area beyond the main tally screen
- authentication
- payments or checkout processing
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
- Keep drink choices and guest context visible together.
- Let repeat guests continue without re-entering identity details.
- Clear feedback after each tap.
- No hidden state changes.
- Recovery should be simple if someone taps the wrong thing.

## Functional Requirements

- The app must show all available drinks on the main screen.
- The app must show the current guest list on the main screen.
- The app must use the fixed sample drink list for the current pilot.
- A new guest tab must require room number and full name.
- A returning guest must be able to select an existing tab without re-entering those details.
- Drink actions must support increment and decrement within an active guest context.
- The current counts for the active guest's drinks must always be visible.
- The total number of drinks across all guests and a per-guest summary must be visible.
- Data must persist across page reloads on the same device.
- The current pilot must use English UI text.

## Non-Functional Requirements

- The app should be usable on a tablet without onboarding.
- Common actions should take one tap when possible after a guest has selected their tab.
- The app should remain understandable in a busy social setting with a shared tablet handoff.
- The first version should stay simple enough that Codex can build it in small, reviewable steps.
- Text and labels should be easy to move into a future i18n layer.

## Risks

- Guests may forget to identify themselves before recording drinks unless the interaction is extremely fast and obvious.
- A shared tablet may carry the previous guest context into the next interaction if the active tab is not cleared clearly enough.
- Trust-based identification can still produce wrong-room or wrong-name entries.
- Reload-safe local persistence is not the same as full offline support.
- The fixed drink list is only a testing and pilot placeholder.

## Deferred Questions

- Should the active guest clear after a short idle timeout, after explicit confirmation, or both?
- What should the organizer area include first: reset, export, pricing, or room summary?
- When should QR or another shortcut identification method be added, if at all?
- How should the app handle edge cases such as guests with similar names in the same room?
- What level of offline support do we want beyond reload-safe local persistence?
- When we add i18n, which languages should come first after English?
