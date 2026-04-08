# Architecture Guide

This document records the target application architecture for the current pilot and the next scaling steps we want to take before adding more product work.

It complements the product scope in [`product.md`](product.md), the workflow guidance in [`agentic-workflow.md`](agentic-workflow.md), the repository decisions in [`decisions.md`](decisions.md), and the frontend-local conventions in [`../frontend/decisions.md`](../frontend/decisions.md).

## Purpose

- Keep the app easy to reason about for both humans and AI agents as the codebase grows.
- Preserve the simplicity of one deployable app while making module boundaries explicit.
- Give future tasks a stable architecture map so agents do not need to infer structure from the current implementation alone.

## Current Context

The current frontend is still small, but a few pressure points are already visible:

- the default route now points at an order-entry composition root in [`../frontend/src/app/features/order-entry/order-entry.ts`](../frontend/src/app/features/order-entry/order-entry.ts), and transient order-entry screen state now lives in [`../frontend/src/app/features/order-entry/order-entry.store.ts`](../frontend/src/app/features/order-entry/order-entry.store.ts) while the migration continues
- durable room, guest-tab, catalog, and billed-history state now live in [`../frontend/src/app/features/rooms/rooms.store.ts`](../frontend/src/app/features/rooms/rooms.store.ts), [`../frontend/src/app/features/guest-tabs/guest-tabs.store.ts`](../frontend/src/app/features/guest-tabs/guest-tabs.store.ts), [`../frontend/src/app/features/catalog/catalog.store.ts`](../frontend/src/app/features/catalog/catalog.store.ts), and [`../frontend/src/app/features/billing-history/billing-history.store.ts`](../frontend/src/app/features/billing-history/billing-history.store.ts), with adjacent repository adapters in [`../frontend/src/app/features/rooms/rooms.repository.ts`](../frontend/src/app/features/rooms/rooms.repository.ts), [`../frontend/src/app/features/guest-tabs/guest-tabs.repository.ts`](../frontend/src/app/features/guest-tabs/guest-tabs.repository.ts), [`../frontend/src/app/features/catalog/catalog.repository.ts`](../frontend/src/app/features/catalog/catalog.repository.ts), and [`../frontend/src/app/features/billing-history/billing-history.repository.ts`](../frontend/src/app/features/billing-history/billing-history.repository.ts)
- the order entry and host admin screens now compose those capability stores through local view-model helpers instead of a single broad tally store, and the active route no longer treats [`../frontend/src/app/features/drink-tally/`](../frontend/src/app/features/drink-tally/) as its screen contract
- public feature API entrypoints now live at feature roots, and import-boundary enforcement now runs through [`../frontend/scripts/check-import-boundaries.mjs`](../frontend/scripts/check-import-boundaries.mjs)

That is closer to the architecture we want to scale, and the next priority can now shift back to product-surface work on top of those seams.

## Target Direction

We want a [modular monolith](glossary.md#modular-monolith):

- one Angular app under [`../frontend/`](../frontend/)
- one primary host-operated route surface for the pilot
- several explicit business capabilities inside that app
- stable, documented seams between capabilities

We do not want:

- microservices
- a shared catch-all layer with vague ownership
- direct cross-feature imports into another feature's internal files
- business logic and persistence mixed into route components

## Module Map

At a larger size, the frontend should revolve around these roles:

- `order-entry`: the route-level [composition root](glossary.md#composition-root) for the current main pilot screen
- `rooms`: the fixed room list that the host configures and the order-entry route consumes
- `guest-tabs`: open [guest tabs](glossary.md#guest-tab), guest identity rules, and tab lifecycle rules
- `catalog`: product catalog and price-management rules
- `billing-history`: billed-tab creation and recent billed history
- `sync-recovery`: [sync status](glossary.md#sync-status), local [outbox](glossary.md#outbox) or operation log, and remote recovery integration
- `admin-tools`: host-facing supporting screens that consume the same public feature APIs
- [`../frontend/src/app/ui/`](../frontend/src/app/ui/): shared presentation and layout primitives only
- small app-wide platform helpers under a future `core` area only when they are truly cross-feature and not domain-owned

An example future layout looks like this:

```text
src/app/
  app.ts
  app.routes.ts
  core/
  ui/
  features/
    order-entry/
      order-entry.ts
      order-entry.store.ts
      order-entry.facade.ts
    rooms/
    guest-tabs/
    catalog/
    billing-history/
    sync-recovery/
    admin-tools/
```

The exact file count can vary, but the ownership model should stay consistent.

Top-level feature directories under [`../frontend/src/app/features/`](../frontend/src/app/features/) should stay flat. If a feature needs more internal structure, add subdirectories inside that feature instead of introducing another grouping layer above it.

## Ownership Rules

### Route Composition

The route feature for the current order entry screen should be the [composition root](glossary.md#composition-root).

A future overview screen may later replace it as the default landing surface, but that work is deferred and should not blur the current ownership boundaries.

That route feature should:

- compose the visible order entry screen
- coordinate capability facades
- own transient order-entry screen UI state
- avoid taking ownership of catalog, guest-tab, billing-history, or sync persistence rules

### Capability Features

Each durable [capability feature](glossary.md#capability-feature) should own:

- its domain models
- its [domain rules](glossary.md#domain-rule)
- its [persistent business state](glossary.md#persistent-business-state)
- its data adapters and serialization rules
- its focused tests

Each capability should expose a small [public API](glossary.md#public-api), usually through a facade or clearly named public file.
For top-level features under [`../frontend/src/app/features/`](../frontend/src/app/features/), prefer publishing that surface from the feature root, such as an [`index.ts`](../frontend/src/app/features/catalog/index.ts) entrypoint.

### Shared UI

Shared UI under [`../frontend/src/app/ui/`](../frontend/src/app/ui/) should stay:

- presentation-focused
- feature-agnostic
- state-light

Shared UI should not import feature stores, feature copy, or feature-specific business rules.

## Dependency Rules

These are the intended dependency boundaries:

- [`../frontend/src/app/app.ts`](../frontend/src/app/app.ts) and [`../frontend/src/app/app.routes.ts`](../frontend/src/app/app.routes.ts) may depend on feature public APIs and shared UI
- `order-entry` may depend on public APIs from `rooms`, `guest-tabs`, `catalog`, `billing-history`, and `sync-recovery`
- `admin-tools` may depend on those same public APIs
- capability features should not [deep-import](glossary.md#deep-import) each other's internal files
- cross-feature imports should target the providing feature's public entrypoint instead of a deep file path
- shared UI should not depend on feature-owned business code
- [domain rules](glossary.md#domain-rule) should not depend on browser storage or remote APIs directly

If one feature needs another feature's behavior, add or refine the other feature's [public API](glossary.md#public-api) instead of importing its internal store or helper file directly.

The repo now enforces the frontend part of that boundary in [`../frontend/scripts/check-import-boundaries.mjs`](../frontend/scripts/check-import-boundaries.mjs). The check allows cross-feature imports only when they resolve through a top-level feature root [`index.ts`](../frontend/src/app/features/catalog/index.ts), keeps app-shell files on feature public APIs, and blocks shared UI from importing feature-owned business code.

## State Ownership

### Persistent Business State

[Persistent business state](glossary.md#persistent-business-state) should live with the capability that owns the business concept.

Examples:

- open guest tabs belong to `guest-tabs`
- configured rooms belong to `rooms`
- live catalog entries belong to `catalog`
- billed guest records belong to `billing-history`
- sync metadata and queued operations belong to `sync-recovery`

### Transient Route State

[Transient route state](glossary.md#transient-route-state) should live with the route composition feature.

Examples:

- selected guest
- guest-creation draft values
- active panel or layout mode
- local flash messages
- route-only filters or section expansion state

Persistent stores should not become a grab bag for transient UI state just because that is convenient in the moment.

## Data and Persistence Boundaries

The app should remain local-first, but the code should stop assuming that browser storage details belong inside feature state files.

### Repository Boundary

Capability features should read and write through [repositories](glossary.md#repository) or equivalent data adapters.

That means:

- no direct `localStorage` access from route components
- no direct `localStorage` access from business-rule files
- serialization and hydration logic live in data adapters, not in route composition code

### Local-First Write Path

The intended write model is:

1. validate the user action against [domain rules](glossary.md#domain-rule)
2. update local capability state
3. persist locally through the capability [repository](glossary.md#repository)
4. record sync metadata or queue a sync operation when that architecture is introduced

### Sync and Recovery Boundary

The app will eventually need a local [outbox](glossary.md#outbox) or operation-log-style boundary for remote recovery and sync.

That future boundary should:

- keep local writes fast and reliable offline
- let sync resume when connectivity returns
- avoid coupling route components directly to remote APIs
- make conflict and recovery rules explicit in one place

The remote backend choice remains open, but the architecture should make that choice swappable behind a `sync-recovery` boundary.

## Guidance for Humans and Agents

To keep future work efficient:

- start architecture-changing tasks from [`architecture.md`](architecture.md), [`glossary.md`](glossary.md), and [`../frontend/README.md`](../frontend/README.md)
- prefer one capability-focused task at a time
- add a local [`README.md`](../README.md) or [`agent-index.md`](../agent-index.md) when a feature area becomes large enough that its public API is not obvious
- keep tests close to the feature or capability they protect
- avoid introducing broad `shared`, `common`, or `utils` folders as default destinations

If a future prompt depends on module boundaries, public APIs, or state ownership, update this file instead of leaving the decision in chat history.

## Migration Order

The current backlog should treat these architecture tasks as the near-term implementation path:

1. [T-024 Create the Order Entry Composition Root](tasks/done/T-024.md)
2. [T-025 Separate Order Entry UI State From Persistent Business State](tasks/done/T-025.md)
3. [T-026 Split Tally Logic Into Guest Tabs, Catalog, and Billing History Modules](tasks/done/T-026.md)
4. [T-027 Introduce Repository Adapters for Local Persistence](tasks/done/T-027.md)
5. [T-028 Expose Feature Public APIs and Remove Cross-Feature Internal Imports](tasks/done/T-028.md)
6. [T-029 Add Frontend Import Boundary Checks](tasks/done/T-029.md)

The order-entry product work should continue after these architectural seams are in place.
