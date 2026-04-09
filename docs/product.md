# Product Scope

## Working Definition

This project is a tablet-first tally app operated by the host. The current pilot should give the host a primary [order entry screen](glossary.md#order-entry-screen) where they move through a focused `room -> guest -> drinks` flow, can revisit completed steps to correct a miss-tap, and record orders with an intuitive tap-first flow. Product management and billing remain part of the pilot, but they should live on the host tools screen instead of sharing the main order-entry surface for now.

That order entry screen remains the main app surface for now. A broader overview screen may replace it later, but that work is deferred.

The product should stay simple enough for a small team to build and operate, but it now needs stronger data safety than same-device reload persistence. The app should keep working with offline-first local state on the tablet, then recover and sync safely after reconnect, reinstall, or replacement-device setup through a simple remote backup or sync solution.

The current implementation already has host-side catalog management, billing, [billing history](glossary.md#billing-history), and local persistence, but the default route and older core docs still reflect the earlier guest-first public-tablet slice.

The supporting UX reference for the current pilot lives in [`ux/host-workflow-ux.md`](ux/host-workflow-ux.md). The older public self-service concept is kept only as deferred future work in [`ux/guest-tab-ux.md`](ux/guest-tab-ux.md). Remote persistence tradeoffs are summarized in [`research/remote-persistence-options.md`](research/remote-persistence-options.md).

## Project Goals

### Goal 1: Learn Agentic AI Development

We want a real project that teaches a reusable way to work with Codex:

- define scope clearly
- break work into small tasks
- let the agent implement from written context
- review behavior and diffs
- record decisions and lessons

### Goal 2: Ship a Functional Host-Operated Pilot

We want a functional, host-operated tablet app that lets the host quickly record guest orders from a fixed room list, manage rooms, manage products and prices, bill tabs on departure, and recover safely after reloads, reinstall, or connection loss.

## Confirmed Pilot Rules

These are the rules for the current pilot direction:

- one host-operated tablet is used at a time during the pilot
- the app remains a tablet-first web app
- the host is the primary app user in the current pilot
- the host's main workflow is `select room -> select guest -> orders -> billing`
- guest identification remains trust-based and is entered directly by the host
- rooms come from a fixed list configured by the host on the host tools screen
- guest identification uses room number and full name
- the app must support creating and updating the live product catalog with prices
- the app must support creating and updating the live room list
- the app must support billing a [guest tab](glossary.md#guest-tab) and keeping recent [billing history](glossary.md#billing-history)
- the current implementation already persists drink catalog, open tabs, and billed history locally across reloads
- the product requirement now expands persistence to offline-first local app state plus remote recovery or sync
- the app should continue working when internet access is unavailable
- the app should sync or back up changes after connectivity returns
- setup for the remote recovery solution should stay simple for the host
- reinstall or replacement-device recovery is required for the target product direction
- simultaneous multi-tablet live collaboration is not required for the current pilot
- the current pilot surface is host-operated only
- the order entry screen is the current main app surface, while a future overview screen remains deferred
- the public tally screen remains deferred future work and should not be accessible in the active pilot
- the UI is English-only for now
- the code should keep future i18n in mind

## Initial Sample Drink Catalog

The app should still start from these sample drinks and reference prices until the host changes the live catalog:

- Water `EUR 2.00`
- Sparkling Water `EUR 2.50`
- Cola `EUR 3.00`
- Cola Zero `EUR 3.00`
- Lemon Soda `EUR 3.00`
- Orange Soda `EUR 3.00`
- Apple Juice `EUR 3.50`
- Beer `EUR 4.50`
- White Wine `EUR 5.00`

## Primary Users

- Host or organizer: wants one main order entry screen for quick room selection, guest selection, and rapid order entry, with room setup, product management, and billing available on the host tools screen
- Guest or customer: is represented in the tally data and billed by the host, but does not use the app directly in the current pilot

## Core User Flow

1. The host opens the app on the tablet.
2. The host lands on the order entry screen, which serves as the main screen for now.
3. The host selects a room from the fixed room list shown on the order entry screen.
4. The app advances to the guest step, where the host reopens an existing [guest tab](glossary.md#guest-tab) in that room or creates a new one by entering the guest's full name.
5. The app advances to the drinks step so the host can record one or more orders immediately from the same working surface.
6. The app keeps the selected room and [selected guest](glossary.md#selected-guest) context obvious in the step header, and completed steps remain tappable so the host can correct the room or guest without a warning dialog.
7. The host can open the host tools screen to manage rooms, adjust products and prices, or bill guests on departure.
8. The app saves changes locally immediately so the host can continue working offline.
9. When connectivity is available, the app syncs or backs up local changes to the chosen remote recovery store.
10. On departure, the host reviews the open tab from the host tools screen, bills it, and moves it into billed history.
11. If the tablet reloads, loses connection, or must be replaced, the host can recover the data from local storage first and from the remote source when needed.

## In Scope for the Current Pilot

- tablet-first host-operated order entry screen
- fixed room-list selection followed by guest lookup or creation
- rapid product selection and quantity changes for a selected guest
- visible open-tab context for the currently selected guest
- host-managed room list
- host-managed drink or product catalog
- local price management
- host-side billing with per-guest totals
- recent billed-tab history
- offline-first local app state
- eventual PWA installability and offline shell behavior
- remote recovery and sync requirements for reconnect, reinstall, and replacement-device scenarios
- English UI text
- simple structure that can grow into i18n later

## Out of Scope for the Current Pilot

- public guest self-service access
- payment processing
- hotel or billing system integrations
- inventory tracking
- role-based permissions
- simultaneous multi-tablet live collaboration
- advanced reporting
- multilingual UI beyond English
- larger branding work beyond the shared design foundation and usability-driven theming

## UX Principles

- Large touch targets suitable for a tablet.
- Minimal navigation during service.
- One workflow step should be the clear focus at a time instead of trying to show every step equally.
- Room, full name, and the current order context should stay easy to verify at a glance.
- After a room or guest is chosen, the step header should keep that context visible and make correction paths obvious.
- Room and guest selection should use large grid cards that work well for quick taps on a tablet.
- Common order-entry actions should take as few taps as possible.
- Room setup, product management, and billing should stay one clear step away on the host tools screen without crowding the main order-entry workflow.
- Offline behavior should fail gently and keep the host moving.
- [Sync status](glossary.md#sync-status) should be understandable without becoming noisy.
- [Recovery](glossary.md#recovery) should be simple if the host taps the wrong thing or loses connection.

## Functional Requirements

- The app must provide a primary order entry screen for the `select room -> select guest -> orders -> billing` workflow.
- The active order-entry surface should focus on one visible step at a time while keeping completed steps reachable from a persistent step header.
- The app must let the host manage a fixed room list from the host tools screen.
- The app must let the host create a new guest tab from a selected room followed by the guest's full name.
- The app must let the host reopen an existing guest tab without re-entering the full record manually.
- The app must let the host revisit completed room or guest steps without modal warnings so they can correct a miss-tap quickly.
- The app must support fast add, increment, and decrement order actions for the selected guest.
- The app must let the host manage the live product catalog and prices.
- The app must calculate per-guest totals for billing.
- The app must move billed tabs out of the open working set while preserving recent billed history.
- The app must persist current state locally so reloads on the same device do not lose work.
- The app must work while offline and sync or back up local changes after connectivity returns.
- The app must support recovery after reinstall or setup on a replacement device through the chosen remote solution.
- The app must keep the public tally flow out of the active pilot surface.
- The current pilot must use English UI text.

## Non-Functional Requirements

- The app should be usable on a tablet without onboarding.
- Common host actions should stay efficient in a busy service environment.
- The first version should stay simple enough that Codex can build it in small, reviewable steps.
- Remote recovery setup should be simple enough for a non-technical host to complete.
- Text and labels should be easy to move into a future i18n layer.

## Risks

- The current codebase still centers the default route and primary copy around a guest-facing public tablet flow.
- An order entry screen can become cluttered if room selection, guest selection, and product controls are not grouped carefully.
- A focused stepper removes cross-step visibility, so the selected room and selected guest context must stay obvious even while only one step body is visible.
- Trust-based room and name entry can still produce mistaken identity or duplicate tabs.
- Going back to fix room or guest selection does not automatically move drinks that were already recorded on the wrong tab.
- Offline-first local state plus later sync introduces conflict and recovery rules that the current store does not yet define.
- Reinstall recovery raises expectations that local-only storage cannot satisfy today.
- A remote solution that is too technical to set up will reduce real-world reliability even if it is technically strong.
- A PWA alone will not solve backup or replacement-device recovery.
- Guest-identifying data now has a longer persistence horizon, which increases privacy and retention concerns.

## Deferred Questions

- Which remote persistence approach should we choose for the pilot: Google Sheets as backup or export, Firestore-style app sync, or a custom backend?
- What is the simplest acceptable host setup for the remote recovery flow?
- How should the room list scale if the host later manages far more rooms than the pilot expects today?
- What kind of overview screen, if any, should later replace order entry as the main landing surface?
- When should billing or catalog work move closer to order entry, if later real usage shows the separate host tools screen is too slow?
- What conflict rule should apply if local changes and remote state differ during reconnect or restore?
- What reset, export, or manual backup tools should exist alongside remote sync?
- When we add i18n, which languages should come first after English?
