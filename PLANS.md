# Codex Execution Plans (ExecPlans)

This file defines how this repository uses long-form execution plans. It also serves as the index for checked-in plans.

Use an ExecPlan for complex features, significant refactors, multi-session work, or any task where Codex or a human contributor will benefit from a living implementation document that stays aligned with the work.

Do not load plan files by default. Plans are opt-in context. Read them when the user asks for plan work, when a task file links to a relevant plan, or when extra context is needed to execute a task safely.

## How To Use ExecPlans In This Repo

When authoring or revising an ExecPlan, re-read this file first and follow it closely.

When implementing from an ExecPlan, keep the plan current instead of treating it as a frozen spec. Update the living sections as progress is made, as discoveries happen, and as decisions change.

Individual plans live in [`docs/plans/`](docs/plans/), using short, action-oriented kebab-case filenames such as [`docs/plans/document-execplan-workflow.md`](docs/plans/document-execplan-workflow.md).

This file is the routing and context-management entrypoint for plan work in this repository. There is no separate plans-local agent index unless the plans folder grows enough to need one later.

If a task has a relevant plan, link that plan from the task file's `Related docs` section instead of copying the whole plan into the task brief.

## Project Plan Index

- [`docs/plans/document-execplan-workflow.md`](docs/plans/document-execplan-workflow.md): establishes the repo's ExecPlan documentation and routing convention. Related tasks: none yet; related docs: [`AGENTS.md`](AGENTS.md), [`agent-index.md`](agent-index.md), [`docs/agentic-workflow.md`](docs/agentic-workflow.md), [`docs/decisions.md`](docs/decisions.md).
- [`docs/plans/build-room-first-order-entry-screen.md`](docs/plans/build-room-first-order-entry-screen.md): documents the room-first host order-entry implementation, including the durable room capability, the focused stepper refinement for the active route, the host-controlled room or guest correction flow, the ordered-drinks-first drinks step with lightweight add-drink and bill-guest overlays, and supporting [`docs/`](docs/) and [`docs/design/`](docs/design/) artifacts. Related tasks: [`docs/tasks/open/T-018.md`](docs/tasks/open/T-018.md), [`docs/tasks/open/T-014.md`](docs/tasks/open/T-014.md), [`docs/tasks/open/T-019.md`](docs/tasks/open/T-019.md); related docs: [`docs/product.md`](docs/product.md), [`docs/ux/host-workflow-ux.md`](docs/ux/host-workflow-ux.md), [`docs/architecture.md`](docs/architecture.md).

## Non-Negotiable Requirements

- Every ExecPlan must be self-contained. A contributor should be able to succeed with only the current working tree and the single plan file.
- Every ExecPlan is a living document. It must be revised as progress is made, discoveries occur, and design decisions are finalized.
- Every ExecPlan must guide a novice through a demonstrably working outcome, not just code changes.
- Every ExecPlan must define any non-obvious term in plain language or avoid using it.
- Every ExecPlan must include exact files, concrete edits, commands to run, and what to observe.
- Every ExecPlan must keep `Progress`, `Surprises & Discoveries`, `Decision Log`, and `Outcomes & Retrospective` up to date.

## Writing Style And Format

Write in plain prose. Prefer sentences over long enumerations. Avoid tables and checklist-heavy sections except for `Progress`, where checkboxes are required.

Each plan file in [`docs/plans/`](docs/plans/) should contain only the plan document itself, so do not wrap the whole file in an extra fenced code block.

Name files with short, action-oriented kebab-case names that describe the intended outcome.

## Required Plan Structure

Each plan file should use this structure and order:

1. `# <Short, action-oriented description>`
2. A short living-document note that references [`PLANS.md`](PLANS.md)
3. `Related tasks:` with links to the relevant task files, or `none yet` if no task exists
4. `Related docs:` with the most relevant supporting docs
5. `## Purpose / Big Picture`
6. `## Progress`
7. `## Surprises & Discoveries`
8. `## Decision Log`
9. `## Outcomes & Retrospective`
10. `## Context and Orientation`
11. `## Plan of Work`
12. `## Concrete Steps`
13. `## Validation and Acceptance`
14. `## Idempotence and Recovery`
15. `## Artifacts and Notes`
16. `## Interfaces and Dependencies`

Use timestamps in `Progress` entries so later contributors can see the pace and sequence of work.

## Maintenance Rules

- Update this file whenever you add, rename, or materially revise a checked-in plan.
- Keep plan links in sync with the relevant task files and supporting docs.
- Open only the specific plan you need; do not scan the whole plans folder unless the user asks for plan triage.
