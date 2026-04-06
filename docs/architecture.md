# Architecture Guide

This document records the target application architecture for the current pilot and the next scaling steps we want to take before adding more product work.

It complements the product scope in [`product.md`](product.md), the workflow guidance in [`agentic-workflow.md`](agentic-workflow.md), the repository decisions in [`decisions.md`](decisions.md), and the frontend-local conventions in [`../frontend/decisions.md`](../frontend/decisions.md).

## Purpose

- Keep the app easy to reason about for both humans and AI agents as the codebase grows.
- Preserve the simplicity of one deployable app while making module boundaries explicit.
- Give future tasks a stable architecture map so agents do not need to infer structure from the current implementation alone.

## Current Context

The current frontend is still small, but a few pressure points are already visible:

- the default route now points at a lightweight host-workspace composition root in [`../frontend/src/app/features/host-workspace/host-workspace/host-workspace.ts`](../frontend/src/app/features/host-workspace/host-workspace/host-workspace.ts), but that route still mounts the older tally surface while the migration continues
- the current host admin screen imports the tally store directly from [`../frontend/src/app/features/tally/drink-tally/drink-tally.store.ts`](../frontend/src/app/features/tally/drink-tally/drink-tally.store.ts)
- that store currently mixes domain types, business rules, route state, view-model shaping, and browser persistence

That is acceptable for an early slice, but it is not the architecture we want to scale.

## Target Direction

We want a modular monolith:

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

- `host-workspace`: the route-level composition root for the main pilot screen
- `guest-tabs`: open guest tabs, guest identity rules, and tab lifecycle rules
- `catalog`: product catalog and price-management rules
- `billing-history`: billed-tab creation and recent billed history
- `sync-recovery`: sync status, local outbox or operation log, and remote recovery integration
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
    host-workspace/
      host-workspace.ts
      host-workspace.store.ts
      host-workspace.facade.ts
    guest-tabs/
    catalog/
    billing-history/
    sync-recovery/
    admin-tools/
```

The exact file count can vary, but the ownership model should stay consistent.

## Ownership Rules

### Route Composition

The route feature for the host pilot should be the composition root.

That route feature should:

- compose the visible host screen
- coordinate capability facades
- own transient host-screen UI state
- avoid taking ownership of catalog, guest-tab, billing-history, or sync persistence rules

### Capability Features

Each durable business capability should own:

- its domain models
- its domain rules
- its persistent state
- its data adapters and serialization rules
- its focused tests

Each capability should expose a small public API, usually through a facade or clearly named public file.

### Shared UI

Shared UI under [`../frontend/src/app/ui/`](../frontend/src/app/ui/) should stay:

- presentation-focused
- feature-agnostic
- state-light

Shared UI should not import feature stores, feature copy, or feature-specific business rules.

## Dependency Rules

These are the intended dependency boundaries:

- [`../frontend/src/app/app.ts`](../frontend/src/app/app.ts) and [`../frontend/src/app/app.routes.ts`](../frontend/src/app/app.routes.ts) may depend on feature public APIs and shared UI
- `host-workspace` may depend on public APIs from `guest-tabs`, `catalog`, `billing-history`, and `sync-recovery`
- `admin-tools` may depend on those same public APIs
- capability features should not deep-import each other's internal files
- shared UI should not depend on feature-owned business code
- domain rules should not depend on browser storage or remote APIs directly

If one feature needs another feature's behavior, add or refine the other feature's public API instead of importing its internal store or helper file directly.

## State Ownership

### Persistent Business State

Persistent state should live with the capability that owns the business concept.

Examples:

- open guest tabs belong to `guest-tabs`
- live catalog entries belong to `catalog`
- billed guest records belong to `billing-history`
- sync metadata and queued operations belong to `sync-recovery`

### Transient Route State

Transient screen state should live with the route composition feature.

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

Capability features should read and write through repositories or equivalent data adapters.

That means:

- no direct `localStorage` access from route components
- no direct `localStorage` access from business-rule files
- serialization and hydration logic live in data adapters, not in route composition code

### Local-First Write Path

The intended write model is:

1. validate the user action against domain rules
2. update local capability state
3. persist locally through the capability repository
4. record sync metadata or queue a sync operation when that architecture is introduced

### Sync and Recovery Boundary

The app will eventually need a local outbox or operation-log-style boundary for remote recovery and sync.

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

1. [T-024 Create the Host Workspace Composition Root](tasks/done/T-024.md)
2. [T-025 Separate Host-Screen UI State From Persistent Business State](tasks/open/T-025.md)
3. [T-026 Split Tally Logic Into Guest Tabs, Catalog, and Billing History Modules](tasks/open/T-026.md)
4. [T-027 Introduce Repository Adapters for Local Persistence](tasks/open/T-027.md)
5. [T-028 Expose Feature Public APIs and Remove Cross-Feature Internal Imports](tasks/open/T-028.md)
6. [T-029 Add Frontend Import Boundary Checks](tasks/open/T-029.md)

The host-screen product work should continue after these architectural seams are in place.
