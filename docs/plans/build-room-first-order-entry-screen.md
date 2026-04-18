# Build the room-first order entry screen

This ExecPlan is a living document. The sections `Progress`, `Surprises & Discoveries`, `Decision Log`, and `Outcomes & Retrospective` must be kept up to date as work proceeds. Maintain this document in accordance with [`PLANS.md`](../../PLANS.md).

Related tasks: [`docs/tasks/done/T-018.md`](../tasks/done/T-018.md), [`docs/tasks/done/T-014.md`](../tasks/done/T-014.md), [`docs/tasks/done/T-019.md`](../tasks/done/T-019.md).

Related docs: [`docs/product.md`](../product.md), [`docs/ux/host-workflow-ux.md`](../ux/host-workflow-ux.md), [`docs/architecture.md`](../architecture.md), [`frontend/AGENTS.md`](../../frontend/AGENTS.md), [`frontend/README.md`](../../frontend/README.md), [`docs/design/foundations/README.md`](../design/foundations/README.md), [`docs/design/penpot-codex-workflow.md`](../design/penpot-codex-workflow.md).

## Purpose / Big Picture

After this change, the active pilot surface will stop behaving like a guest-facing tally screen and will become a host-only order-entry workflow optimized for speed on a tablet. The host will work from a fixed room list, move through a focused `room -> guest -> drinks` stepper, record drinks immediately, and confirm billing for the current guest from the drinks step without bringing room or catalog-management detail onto the main surface.

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
- [x] (2026-04-10 03:41Z) Removed the order-entry inactivity reset so the host now changes room or guest context explicitly from the step header instead of waiting for an idle timeout.
- [x] (2026-04-10 04:36Z) Refined the drinks step so it now shows only ordered drinks, keeps them in first-added order, and uses a lightweight `Add drink` overlay plus direct quantity entry for larger repeat orders.
- [x] (2026-04-10 04:40Z) Re-ran `npm test -- --watch=false`, `npm run build`, and `git diff --check` after the ordered-drinks refinement and supporting doc updates.
- [x] (2026-04-10 10:59Z) Added inline guest billing from the drinks step with a confirmation modal that closes the open tab into billed history and returns the host to the guest list for the current room.
- [x] (2026-04-10 11:02Z) Re-ran `npm test -- --watch=false`, `npm run build`, and `git diff --check` after the inline-billing implementation and documentation updates.

## Surprises & Discoveries

- Observation: The current default route work in [`docs/tasks/done/T-019.md`](../tasks/done/T-019.md) was partially complete already because [`frontend/src/app/app.routes.ts`](../../frontend/src/app/app.routes.ts) already pointed `/` at [`OrderEntry`](../../frontend/src/app/features/order-entry/order-entry.ts).
  Evidence: The current routes array maps the empty path directly to [`OrderEntry`](../../frontend/src/app/features/order-entry/order-entry.ts).

- Observation: The active pilot docs still describe room number as direct entry text rather than a host-managed list, so the new fixed-room requirement is a product-doc change, not just a frontend implementation detail.
  Evidence: [`docs/product.md`](../product.md) and [`docs/ux/host-workflow-ux.md`](../ux/host-workflow-ux.md) still describe room entry as typed input.

- Observation: The repo does not yet have a dedicated feature for room configuration or persistence.
  Evidence: The current top-level feature set under [`frontend/src/app/features/`](../../frontend/src/app/features/) includes order entry, guest tabs, catalog, billing history, host admin, and drink tally, but no room capability.

- Observation: The new room capability fit the existing local-first repository pattern almost one-for-one, which kept the host-tools and order-entry integration smaller than a full domain redesign.
  Evidence: [`frontend/src/app/features/rooms/rooms.store.ts`](../../frontend/src/app/features/rooms/rooms.store.ts) and [`frontend/src/app/features/rooms/rooms.repository.ts`](../../frontend/src/app/features/rooms/rooms.repository.ts) now mirror the shape already used by the catalog and guest-tab capabilities.

- Observation: The order-entry route already owned nearly all of the transient state needed for a stepper, so the refinement only required explicit step state rather than another capability or persistence layer.
  Evidence: [`frontend/src/app/features/order-entry/order-entry.store.ts`](../../frontend/src/app/features/order-entry/order-entry.store.ts) already tracked selected room, selected guest, and guest draft state before the stepper refactor.

- Observation: Sorting drinks by when they were first ordered could not be derived reliably from the guest-tab counts map alone.
  Evidence: [`frontend/src/app/features/guest-tabs/guest-tabs.store.ts`](../../frontend/src/app/features/guest-tabs/guest-tabs.store.ts) and [`frontend/src/app/features/guest-tabs/guest-tabs.repository.ts`](../../frontend/src/app/features/guest-tabs/guest-tabs.repository.ts) now persist a dedicated `drinkOrder` list alongside `counts`.

## Decision Log

- Decision: The order-entry screen should stay focused on order taking, but the drinks step may also host lightweight per-guest billing confirmation; room and catalog management plus broader billing review remain on the host screen.
  Rationale: Billing the current guest is part of the same service conversation as checking the order, while room setup, catalog changes, and history review still belong on the broader admin surface.
  Date/Author: 2026-04-10 / Codex with user direction

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

- Decision: Remove the order-entry inactivity reset from the host-operated route.
  Rationale: The reset behavior was useful for a public handoff surface, but on a host-only screen it adds surprise and slows repeat entry. The host can intentionally change context by tapping Room or Guest instead.
  Date/Author: 2026-04-10 / Codex with user direction

- Decision: The drinks step should show only drinks already ordered on the active tab, and new drink types should be added from a lightweight local overlay while preserving first-added order.
  Rationale: Rendering the whole catalog inline made the panel feel cluttered and pushed the repeat-order workflow farther from the host's main target area.
  Date/Author: 2026-04-10 / Codex with user direction

- Decision: Billing confirmation from the drinks step should use a lightweight modal that previews the current guest tab before closing it into billed history.
  Rationale: The host and guest need a quick shared review moment, but moving to a separate route or admin panel would add unnecessary friction to checkout.
  Date/Author: 2026-04-10 / Codex with user direction

## Outcomes & Retrospective

The active pilot route now renders a host-first order-entry screen built around a focused three-step flow: Room, Guest, and Drinks. Only one step body is visible at a time, completed steps remain tappable from the persistent step header, and the room and guest steps now use touch-friendly grids. In the drinks step, the panel now shows only ordered drinks, keeps them in first-added order, lets the host add a new drink type from a lightweight overlay, supports direct quantity entry for larger repeat orders, and opens a lightweight billing confirmation modal that closes the tab into billed history when confirmed. Room and guest context now stay active until the host explicitly changes them from the step header, which better fits the host-operated screen contract.

The repo also now has a durable [`rooms`](../../frontend/src/app/features/rooms/) capability and a host-tools screen that manages rooms, catalog items, and billing history together. That keeps broader admin tasks one tap away without crowding the main order-entry surface.

Validation evidence for this implementation:

- `npm test -- --watch=false` passed from [`frontend/`](../../frontend/)
- `npm run build` passed from [`frontend/`](../../frontend/)
- `git diff --check` passed from the repository root

## Context and Orientation

The current repo already has the architecture seams needed for this refinement. [`frontend/src/app/features/order-entry/order-entry.store.ts`](../../frontend/src/app/features/order-entry/order-entry.store.ts) owns transient route state. [`frontend/src/app/features/guest-tabs/`](../../frontend/src/app/features/guest-tabs/) owns open guest tabs identified by room number and full name, and now also persists drink display order per tab. [`frontend/src/app/features/catalog/`](../../frontend/src/app/features/catalog/) owns the live drink catalog. [`frontend/src/app/features/billing-history/`](../../frontend/src/app/features/billing-history/) owns billed history. [`frontend/src/app/features/host-admin/`](../../frontend/src/app/features/host-admin/) already provides the host-side screen for catalog and billing actions.

What changed in this follow-up is the interaction model, not the underlying capability split. The repo now needs the route UI, tests, and supporting docs to agree on a focused stepper instead of the earlier simultaneous three-panel tablet layout.

## Plan of Work

Start by updating the repo-native documentation. Refresh the product, UX, task, and design artifacts so they replace the simultaneous tablet layout with the focused stepper model and record the likely follow-ups.

Then refine the order-entry route as a host-first composition root. Add explicit step state, keep the step header local to the feature, and rebuild the visible route content so only one step body is shown at a time.

Finally, update the route-level and store-level tests to cover auto-advance, tappable completed steps, correction paths, and the host-controlled context changes.

## Concrete Steps

1. Update [`docs/product.md`](../product.md), [`docs/ux/host-workflow-ux.md`](../ux/host-workflow-ux.md), the relevant open task briefs, and this ExecPlan so they describe a focused `room -> guest -> drinks` stepper with tappable completed steps.
2. Refresh the design brief and SVG artifact under [`docs/design/order-entry-screen/`](../design/order-entry-screen/) so they show one visible step at a time, grid-based room and guest selection, and the persistent step header.
3. Add explicit `activeStep` state to [`frontend/src/app/features/order-entry/order-entry.store.ts`](../../frontend/src/app/features/order-entry/order-entry.store.ts) while keeping the existing capability boundaries intact.
4. Refactor [`frontend/src/app/features/order-entry/order-entry.html`](../../frontend/src/app/features/order-entry/order-entry.html) and [`frontend/src/app/features/order-entry/order-entry.scss`](../../frontend/src/app/features/order-entry/order-entry.scss) into a single visible step panel with a local step header and responsive room or guest grids.
5. Update [`frontend/src/app/features/order-entry/order-entry.spec.ts`](../../frontend/src/app/features/order-entry/order-entry.spec.ts) and [`frontend/src/app/features/order-entry/order-entry.store.spec.ts`](../../frontend/src/app/features/order-entry/order-entry.store.spec.ts) so they validate auto-advance, back navigation, room changes, and the explicit host-controlled context changes.

## Validation and Acceptance

From [`frontend/`](../../frontend/), run `nvm use`, then run `npm run lint`, `npm test -- --watch=false`, and `npm run build`.

From the repository root at [`./`](../../), run `git diff --check` after the edits. Acceptance is met when:

- the active route renders the room-first stepper instead of the legacy guest tally shell or the earlier simultaneous tablet layout
- the host screen manages rooms, catalog, and billing without breaking existing local persistence
- the updated docs consistently describe room selection from a host-managed list, a focused stepper flow, inline guest billing confirmation from the drinks step, and broader room or catalog management staying on the host screen
- the new ExecPlan and design artifact are linked from the appropriate repo entrypoints

## Idempotence and Recovery

The doc updates are idempotent and should converge cleanly if reapplied. The new room capability should hydrate from persisted local state the same way the existing catalog, guest tabs, and billed history do, so reloading the app should keep the configured room list without extra setup.

If the UI refactor becomes unstable, revert only the new order-entry screen assembly first and leave the room capability plus doc updates in place. That preserves the discovered product direction while narrowing the recovery surface.

## Artifacts and Notes

The primary non-code artifacts for this work are this ExecPlan, the task-specific design brief at [`docs/design/order-entry-screen/README.md`](../design/order-entry-screen/README.md), and the committed SVG layout snapshot at [`docs/design/order-entry-screen/order-entry-screen.svg`](../design/order-entry-screen/order-entry-screen.svg). Those files now capture the no-rooms state, the focused stepper header, the room and guest grid states, the drinks step, and the host-tools shortcut so future sessions do not need to reconstruct the intended flow from chat history.

The most likely follow-up after this plan is a real-usage validation pass that decides whether the drinks picker, inline billing modal, or the room and guest grids need search, recents, or an adaptive split view.

## Interfaces and Dependencies

The new `rooms` capability will depend on the same local-first repository pattern used by [`frontend/src/app/features/catalog/`](../../frontend/src/app/features/catalog/), [`frontend/src/app/features/guest-tabs/`](../../frontend/src/app/features/guest-tabs/), and [`frontend/src/app/features/billing-history/`](../../frontend/src/app/features/billing-history/). The order-entry route may depend on the public APIs of those capability features plus the new room API, but it should keep ownership of only transient route state.

The host admin route depends on room, catalog, guest-tab, and billing-history public APIs. The design docs depend on the shared foundation brief in [`docs/design/foundations/README.md`](../design/foundations/README.md) and the Penpot workflow guidance in [`docs/design/penpot-codex-workflow.md`](../design/penpot-codex-workflow.md).
