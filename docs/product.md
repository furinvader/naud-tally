# Product Scope

## Working Definition

This project is a tablet-first tally app for guests at an event. Guests use the app to record which drinks they take and how many.

The first version is a pilot, not a full event management system.

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

## Pilot Assumptions

These are the current assumptions until we replace them with confirmed decisions:

- one tablet is used at a time
- one event context is active at a time
- the drink list is predefined
- guests do not need accounts
- the UI is optimized for quick tapping, not detailed data entry
- simple local persistence is enough for the first pilot

## Primary Users

- Guests: want a fast, obvious way to record a drink
- Organizer or host: wants accurate totals and a way to reset or export data

## Core User Flow

1. A guest opens the app on the tablet.
2. The guest sees a list of available drinks with large touch-friendly controls.
3. The guest increments or decrements the count for the drink they took.
4. The app immediately updates totals and saves the current state.
5. The organizer can later review totals, reset the event, or export the tally.

## In Scope for the Pilot

- tablet-first layout
- predefined drink catalog
- add and remove counts for each drink
- always-visible current totals
- persistence across reloads
- simple organizer actions such as reset and export
- basic protection against accidental data loss

## Out of Scope for the Pilot

- payments
- inventory tracking
- user accounts or guest identity
- multi-tablet live synchronization
- advanced reporting
- role-based permissions
- polished branding or theming beyond what is needed for usability

## UX Principles

- Large touch targets suitable for a tablet.
- Minimal text and minimal navigation.
- Clear feedback after each tap.
- No hidden state changes.
- Recovery should be simple if someone taps the wrong thing.

## Functional Requirements

- The app must show all available drinks on the main screen.
- Each drink must support increment and decrement actions.
- The current count for each drink must always be visible.
- The total number of drinks must be visible.
- Data must persist across page reloads during the event.
- The organizer must be able to reset counts.
- The organizer must be able to export or copy the final tally in a simple format.

## Non-Functional Requirements

- The app should be usable on a tablet without onboarding.
- Common actions should take one tap when possible.
- The app should remain understandable in a busy social setting.
- The first version should stay simple enough that Codex can build it in small, reviewable steps.

## Risks

- Guests may forget to record drinks unless the interaction is extremely fast.
- A shared tablet may lead to accidental taps or double taps.
- Local-only persistence may be limiting if the event later needs backups or multiple devices.

## Open Questions

- What exact drinks need to be in the catalog?
- Should the app support multiple languages?
- Does the organizer need a hidden admin area or just a reset/export control?
- Should totals be per drink only, or also per category?
- Is offline support required from day one?
- Is the event always a single session, or do we need named events?
