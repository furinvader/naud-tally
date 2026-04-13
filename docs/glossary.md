# Glossary

This glossary keeps the project vocabulary stable for both humans and AI agents.

If a term changes in meaning and that change should matter in later sessions, update this file together with the relevant product or architecture docs.

When another doc introduces one of these project-specific terms, prefer linking the first meaningful mention to the matching glossary entry instead of linking every repetition.

## Product Terms

### Order Entry Screen

The current primary tablet-first working surface for `room number -> full name -> orders -> billing`.

### Order-Entry Feature

The route-level frontend feature that composes the order entry screen and owns transient order-entry UI state.

### Overview Screen (Deferred)

A future landing surface that may later replace the order entry screen as the main screen.

### Open Tab

A guest tab that is still active and not yet billed.

### Guest Tab

The persistent record for one guest's active orders, identified in the pilot by room number and full name.

### Selected Guest

The currently active guest context on the order entry screen.

### Catalog Item

A live or inactive product entry with a name, price, and product identity.

### Billed Tab

The immutable billing snapshot created when an open guest tab is closed and moved into billed history.

### Billing History

The recent collection of billed tabs kept for host review.

### Sync Status

The current user-facing state of remote recovery work, such as idle, pending, offline, or failed.

### Recovery

Restoring app state after reconnect, reinstall, or replacement-device setup.

## Architecture Terms

### Modular Monolith

One deployable app with explicit internal module boundaries.

### Composition Root

The route or feature that wires together lower-level capabilities without owning all of their business logic.

### Capability Feature

A feature area that owns one durable business concept, such as guest tabs or catalog management.

### Public API

The small, intentional surface another feature is allowed to import from a capability feature.

### Deep Import

Importing an internal file from another feature instead of using that feature's public API.

### Persistent Business State

State that should survive reloads and belongs to a business capability.

### Transient Route State

Screen-specific UI state that should stay near the route composition feature.

### Adapter

An infrastructure-facing boundary that translates between app-owned logic and an external mechanism such as browser storage, HTTP, or sync.

### Repository

One kind of [adapter](#adapter) that reads and writes a capability's persisted data.

### Outbox

The local queue or operation log used to defer remote sync work until connectivity is available.

### Domain Rule

A business rule that should remain true regardless of UI layout or storage mechanism.
