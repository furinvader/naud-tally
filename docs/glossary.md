# Glossary

This glossary keeps the project vocabulary stable for both humans and AI agents.

If a term changes in meaning and that change should matter in later sessions, update this file together with the relevant product or architecture docs.

## Product Terms

- Order entry screen: the current primary tablet-first working surface for `room number -> full name -> orders -> billing`
- Order-entry feature: the route-level frontend feature that composes the order entry screen and owns transient order-entry UI state
- Overview screen (deferred): a future landing surface that may later replace the order entry screen as the main screen
- Open tab: a guest tab that is still active and not yet billed
- Guest tab: the persistent record for one guest's active orders, identified in the pilot by room number and full name
- Selected guest: the currently active guest context on the order entry screen
- Catalog item: a live or inactive product entry with a name, price, and product identity
- Billed tab: the immutable billing snapshot created when an open guest tab is closed and moved into billed history
- Billing history: the recent collection of billed tabs kept for host review
- Sync status: the current user-facing state of remote recovery work, such as idle, pending, offline, or failed
- Recovery: restoring app state after reconnect, reinstall, or replacement-device setup

## Architecture Terms

- Modular monolith: one deployable app with explicit internal module boundaries
- Composition root: the route or feature that wires together lower-level capabilities without owning all of their business logic
- Capability feature: a feature area that owns one durable business concept, such as guest tabs or catalog management
- Public API: the small, intentional surface another feature is allowed to import from a capability feature
- Deep import: importing an internal file from another feature instead of using that feature's public API
- Persistent business state: state that should survive reloads and belongs to a business capability
- Transient route state: screen-specific UI state that should stay near the route composition feature
- Repository: the adapter that reads and writes a capability's persisted data
- Outbox: the local queue or operation log used to defer remote sync work until connectivity is available
- Domain rule: a business rule that should remain true regardless of UI layout or storage mechanism
