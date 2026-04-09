# Build the room-first order entry screen

This ExecPlan is a living document. The sections `Progress`, `Surprises & Discoveries`, `Decision Log`, and `Outcomes & Retrospective` must be kept up to date as work proceeds. Maintain this document in accordance with [`PLANS.md`](../../PLANS.md).

Related tasks: [`docs/tasks/open/T-018.md`](../tasks/open/T-018.md), [`docs/tasks/open/T-014.md`](../tasks/open/T-014.md), [`docs/tasks/open/T-019.md`](../tasks/open/T-019.md).

Related docs: [`docs/product.md`](../product.md), [`docs/ux/host-workflow-ux.md`](../ux/host-workflow-ux.md), [`docs/architecture.md`](../architecture.md), [`frontend/README.md`](../../frontend/README.md), [`frontend/agent-index.md`](../../frontend/agent-index.md), [`docs/design/foundations/README.md`](../design/foundations/README.md), [`docs/design/penpot-codex-workflow.md`](../design/penpot-codex-workflow.md).

## Purpose / Big Picture

After this change, the active pilot surface will stop behaving like a guest-facing tally screen and will become a host-only order-entry workflow optimized for speed on a tablet. The host will work from a fixed room list, move through a focused `room -> guest -> drinks` stepper, and record drinks immediately without sharing the main surface with billing or catalog-management detail.

The repo should also gain the documentation needed to carry that work across multiple sessions: a checked-in ExecPlan, updated product and UX docs, and a task-specific design brief plus SVG artifact that capture the focused room-first stepper before or alongside the Angular implementation.

## Progress

- [x] (2026-04-08 13:24Z) Confirmed the current pilot docs, task briefs, frontend routing guidance, and ExecPlan workflow requirements.
- [x] (2026-04-08 13:24Z) Confirmed the current route already renders [`OrderEntry`](../../frontend/src/app/features/order-entry/order-entry.ts) at `/`, but that feature still composes the legacy [`DrinkTally`](../../frontend/src/app/features/drink-tally/drink-tally.ts) surface.
- [x] (2026-04-08 13:24Z) Confirmed the current repo has catalog, guest-tab, and billing-history capabilities, but no room-list capability yet.
- [x] (2026-04-08 13:47Z) Added this ExecPlan, linked it from [`PLANS.md`](../../PLANS.md) and the relevant open tasks, and updated the product, UX, decision, architecture, and frontend guidance docs to describe the room-first flow.
- [x] (2026-04-08 13:47Z) Added the task-specific design brief and SVG artifact under [`docs/design/order-entry-screen/`](../design/order-entry-screen/).
- [x] (2026-04-08 13:47Z) Implemented the new [`rooms`](../../frontend/src/app/features/rooms/) capability with repository-backed local persistence and focused tests.
- [x] (2026-04-08 13:47Z) Extended [`frontend/src/app/features/host-admin/`](../../frontend/src/app/features/host-admin/) so the host can manage rooms alongside the live catalog and billing tools.
- [x] (2026-04-08 13:47Z) Replaced the active order-entry route UI and store with the room-first host workflow and removed the route’s dependency on the legacy guest-tally surface.
- [x] (2026-04-08 13:47Z) Ran `npm test -- --watch=false`, `npm run build`, and `git diff --check` successfully after the implementation.
- [x] (2026-04-09 13:47Z) Confirmed the current order-entry route, task briefs, and design artifact still described a simultaneous three-panel layout that no longer matched the preferred host workflow.
- [x] (2026-04-09 13:47Z) Refined [`frontend/src/app/features/order-entry/`](../../frontend/src/app/features/order-entry/) into a focused stepper with explicit step state, tappable completed steps, responsive room and guest grids, and unchanged drink-entry controls.
- [x] (2026-04-09 13:47Z) Updated the product, UX, task, design, and plan docs so they consistently describe the focused stepper model instead of the older simultaneous tablet layout.
- [x] (2026-04-09 13:51Z) Re-ran `npm test -- --watch=false`, `npm run build`, and `git diff --check` successfully after the stepper refinement and documentation updates.

## Surprises & Discoveries

- Observation: The current default route work in [`docs/tasks/open/T-019.md`](../tasks/open/T-019.md) is partially complete already because [`frontend/src/app/app.routes.ts`](../../frontend/src/app/app.routes.ts) already points `/` at [`OrderEntry`](../../frontend/src/app/features/order-entry/order-entry.ts).
  Evidence: The current routes array maps the empty path directly to [`OrderEntry`](../../frontend/src/app/features/order-entry/order-entry.ts).

- Observation: The active pilot docs still describe room number as direct entry text rather than a host-managed list, so the new fixed-room requirement is a product-doc change, not just a frontend implementation detail.
  Evidence: [`docs/product.md`](../product.md) and [`docs/ux/host-workflow-ux.md`](../ux/host-workflow-ux.md) still describe room entry as typed input.

- Observation: The repo does not yet have a dedicated feature for room configuration or persistence.
  Evidence: The current top-level feature set under [`frontend/src/app/features/`](../../frontend/src/app/features/) includes order entry, guest tabs, catalog, billing history, host admin, and drink tally, but no room capability.

- Observation: The new room capability fit the existing local-first repository pattern almost one-for-one, which kept the host-tools and order-entry integration smaller than a full domain redesign.
  Evidence: [`frontend/src/app/features/rooms/rooms.store.ts`](../../frontend/src/app/features/rooms/rooms.store.ts) and [`frontend/src/app/features/rooms/rooms.repository.ts`](../../frontend/src/app/features/rooms/rooms.repository.ts) now mirror the shape already used by the catalog and guest-tab capabilities.

- Observation: The order-entry route already owned nearly all of the transient state needed for a stepper, so the refinement only required explicit step state rather than another capability or persistence layer.
  Evidence: [`frontend/src/app/features/order-entry/order-entry.store.ts`](../../frontend/src/app/features/order-entry/order-entry.store.ts) already tracked selected room, selected guest, guest draft state, and inactivity clearing before the stepper refactor.

## Decision Log

- Decision: The order-entry screen will optimize only for order taking in this slice; billing and catalog management will remain on the host screen instead of sharing the main order-entry surface.
  Rationale: This keeps the highest-frequency path narrow and fast while still keeping the broader host tools one tap away.
  Date/Author: 2026-04-08 / Codex with user direction

- Decision: The host workflow will become `select room -> select guest -> select drinks`, with rooms coming from a fixed host-managed list rather than free-text entry on the order-entry screen.
  Rationale: This matches the user’s clarified operating model and removes one repeated text-entry step from the busiest path.
  Date/Author: 2026-04-08 / Codex with user direction

- Decision: A new durable `rooms` feature should be introduced instead of hiding room data inside the order-entry route state or reusing guest-tab persistence.
  Rationale: The room list is persistent business data that belongs in its own capability boundary and should be configurable from the host screen.
  Date/Author: 2026-04-08 / Codex

- Decision: The current [`DrinkTally`](../../frontend/src/app/features/drink-tally/drink-tally.ts) surface should stop being the active pilot screen contract.
  Rationale: The room-first host workflow differs enough in structure and copy that continuing to evolve the guest-tally presentation would make ownership and testing less clear.
  Date/Author: 2026-04-08 / Codex

- Decision: Do not auto-select a room when the order-entry route opens, even when rooms already exist.
  Rationale: Requiring an explicit room choice keeps the first step intentional and reduces the chance of taking an order in the wrong room on a shared tablet.
  Date/Author: 2026-04-08 / Codex

- Decision: Keep the stepper header local to [`frontend/src/app/features/order-entry/`](../../frontend/src/app/features/order-entry/) instead of introducing Angular Material stepper or a shared `ui` abstraction.
  Rationale: The host workflow needs a narrow, route-specific interaction pattern, and there is not yet a second consumer that would justify promoting it into shared UI.
  Date/Author: 2026-04-09 / Codex with user direction

- Decision: Let the host step back to Room or Guest without a warning dialog, while leaving already recorded drinks on the originally selected guest until the host makes a new selection.
  Rationale: Quick correction is more important than interruption during service, and automatic drink reassignment would add risky hidden behavior.
  Date/Author: 2026-04-09 / Codex with user direction

## Outcomes & Retrospective

The active pilot route now renders a host-first order-entry screen built around a focused three-step flow: Room, Guest, and Drinks. Only one step body is visible at a time, completed steps remain tappable from the compact stepper, and the room and guest steps now use touch-friendly grids while the drinks step preserves the familiar selected-guest summary and drink controls. The route still preserves the transient inactivity reset, but it no longer uses the legacy guest-facing tally presentation as its screen contract.

The repo also now has a durable [`rooms`](../../frontend/src/app/features/rooms/) capability and a host-tools screen that manages rooms, catalog items, and billing together. That keeps setup and billing one tap away without crowding the main order-entry surface.

Validation evidence for this implementation:

- `npm test -- --watch=false` passed from [`frontend/`](../../frontend/)
- `npm run build` passed from [`frontend/`](../../frontend/), including the import-boundary check
- `git diff --check` passed from the repository root

## Context and Orientation

The current repo already has the architecture seams needed for this refinement. [`frontend/src/app/features/order-entry/order-entry.store.ts`](../../frontend/src/app/features/order-entry/order-entry.store.ts) owns transient route state. [`frontend/src/app/features/guest-tabs/`](../../frontend/src/app/features/guest-tabs/) owns open guest tabs identified by room number and full name. [`frontend/src/app/features/catalog/`](../../frontend/src/app/features/catalog/) owns the live drink catalog. [`frontend/src/app/features/billing-history/`](../../frontend/src/app/features/billing-history/) owns billed history. [`frontend/src/app/features/host-admin/`](../../frontend/src/app/features/host-admin/) already provides the host-side screen for catalog and billing actions.

What changed in this follow-up is the interaction model, not the underlying capability split. The repo now needs the route UI, tests, and supporting docs to agree on a focused stepper instead of the earlier simultaneous three-panel tablet layout.

## Plan of Work

Start by updating the repo-native documentation. Refresh the product, UX, task, and design artifacts so they replace the simultaneous tablet layout with the focused stepper model and record the likely follow-ups.

Then refine the order-entry route as a host-first composition root. Add explicit step state, keep the step header local to the feature, and rebuild the visible route content so only one step body is shown at a time.

Finally, update the route-level and store-level tests to cover auto-advance, tappable completed steps, correction paths, and the preserved inactivity reset.

## Concrete Steps

1. Update [`docs/product.md`](../product.md), [`docs/ux/host-workflow-ux.md`](../ux/host-workflow-ux.md), the relevant open task briefs, and this ExecPlan so they describe a focused `room -> guest -> drinks` stepper with tappable completed steps.
2. Refresh the design brief and SVG artifact under [`docs/design/order-entry-screen/`](../design/order-entry-screen/) so they show one visible step at a time, grid-based room and guest selection, and the persistent step header.
3. Add explicit `activeStep` state to [`frontend/src/app/features/order-entry/order-entry.store.ts`](../../frontend/src/app/features/order-entry/order-entry.store.ts), preserving the current capability boundaries and inactivity reset.
4. Refactor [`frontend/src/app/features/order-entry/order-entry.html`](../../frontend/src/app/features/order-entry/order-entry.html) and [`frontend/src/app/features/order-entry/order-entry.scss`](../../frontend/src/app/features/order-entry/order-entry.scss) into a single visible step panel with a local step header and responsive room or guest grids.
5. Update [`frontend/src/app/features/order-entry/order-entry.spec.ts`](../../frontend/src/app/features/order-entry/order-entry.spec.ts) and [`frontend/src/app/features/order-entry/order-entry.store.spec.ts`](../../frontend/src/app/features/order-entry/order-entry.store.spec.ts) so they validate auto-advance, back navigation, room changes, and the preserved inactivity reset.

## Validation and Acceptance

From [`frontend/`](../../frontend/), run `nvm use`, then run `npm test -- --watch=false` and `npm run build`. The build command also covers the import-boundary check.

From the repository root at [`./`](../../), run `git diff --check` after the edits. Acceptance is met when:

- the active route renders the room-first stepper instead of the legacy guest tally shell or the earlier simultaneous tablet layout
- the host screen manages rooms, catalog, and billing without breaking existing local persistence
- the updated docs consistently describe room selection from a host-managed list, a focused stepper flow, and billing/catalog staying off the main order-entry screen for now
- the new ExecPlan and design artifact are linked from the appropriate repo entrypoints

## Idempotence and Recovery

The doc updates are idempotent and should converge cleanly if reapplied. The new room capability should hydrate from persisted local state the same way the existing catalog, guest tabs, and billed history do, so reloading the app should keep the configured room list without extra setup.

If the UI refactor becomes unstable, revert only the new order-entry screen assembly first and leave the room capability plus doc updates in place. That preserves the discovered product direction while narrowing the recovery surface.

## Artifacts and Notes

The primary non-code artifacts for this work are this ExecPlan, the task-specific design brief at [`docs/design/order-entry-screen/README.md`](../design/order-entry-screen/README.md), and the committed SVG layout snapshot at [`docs/design/order-entry-screen/order-entry-screen.svg`](../design/order-entry-screen/order-entry-screen.svg). Those files now capture the no-rooms state, the focused stepper header, the room and guest grid states, the drinks step, and the host-tools shortcut so future sessions do not need to reconstruct the intended flow from chat history.

The most likely follow-up after this plan is a real-usage validation pass that decides whether the stepper needs search, recents, or an adaptive split view before billing moves any closer to the order-entry surface.

## Interfaces and Dependencies

The new `rooms` capability will depend on the same local-first repository pattern used by [`frontend/src/app/features/catalog/`](../../frontend/src/app/features/catalog/), [`frontend/src/app/features/guest-tabs/`](../../frontend/src/app/features/guest-tabs/), and [`frontend/src/app/features/billing-history/`](../../frontend/src/app/features/billing-history/). The order-entry route may depend on the public APIs of those capability features plus the new room API, but it should keep ownership of only transient route state.

The host admin route depends on room, catalog, guest-tab, and billing-history public APIs. The design docs depend on the shared foundation brief in [`docs/design/foundations/README.md`](../design/foundations/README.md) and the Penpot workflow guidance in [`docs/design/penpot-codex-workflow.md`](../design/penpot-codex-workflow.md).
