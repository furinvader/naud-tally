# Product Scope

## Working Definition

This project is a tablet-first tally app for guests. Guests use the app to record which drinks they take and how many.

The first implementation is intentionally a single-screen pilot, not a full guest or organizer management system.

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

These are the rules for the first implementation:

- one tablet is used at a time
- the app is a single guest-facing tally screen
- the drink list is fixed and predefined
- guests do not need accounts or identification
- the UI is optimized for quick tapping, not detailed data entry
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

- Guests: want a fast, obvious way to record a drink
- Organizer or host: future user for later screens such as reset, export, or guest management

## Core User Flow

1. A guest opens the app on the tablet.
2. The guest sees a list of available drinks with large touch-friendly controls.
3. The guest increments or decrements the count for the drink they took.
4. The app immediately updates totals and saves the current state.
5. If the page reloads, the previous tally state is restored.

## In Scope for the First Implementation

- tablet-first layout
- predefined sample drink catalog
- single guest-facing tally screen
- add and remove counts for each drink
- always-visible per-drink counts
- always-visible total count
- persistence across reloads
- English UI text
- simple structure that can grow into i18n later

## Out of Scope for the First Implementation

- organizer or admin area
- guest identification
- guest-based data model
- payments
- inventory tracking
- multi-tablet live synchronization
- advanced reporting
- role-based permissions
- proper offline support beyond reload persistence
- multilingual UI beyond English
- polished branding or theming beyond what is needed for usability

## UX Principles

- Large touch targets suitable for a tablet.
- Minimal text and minimal navigation.
- Clear feedback after each tap.
- No hidden state changes.
- Recovery should be simple if someone taps the wrong thing.

## Functional Requirements

- The app must show all available drinks on the main screen.
- The app must use the fixed sample drink list for the first implementation.
- Each drink must support increment and decrement actions.
- The current count for each drink must always be visible.
- The total number of drinks must be visible.
- Data must persist across page reloads on the same device.
- The first implementation must use English UI text.

## Non-Functional Requirements

- The app should be usable on a tablet without onboarding.
- Common actions should take one tap when possible.
- The app should remain understandable in a busy social setting.
- The first version should stay simple enough that Codex can build it in small, reviewable steps.
- Text and labels should be easy to move into a future i18n layer.

## Risks

- Guests may forget to record drinks unless the interaction is extremely fast.
- A shared tablet may lead to accidental taps or double taps.
- Reload-safe local persistence is not the same as full offline support.
- The fixed drink list is only a testing and pilot placeholder.

## Deferred Questions

- What should the organizer area include first: reset, export, guest management, or something else?
- How should guests be represented once we move beyond a single shared tally screen?
- What level of offline support do we want beyond reload-safe local persistence?
- When we add i18n, which languages should come first after English?
