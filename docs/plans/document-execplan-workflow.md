# Document the repo ExecPlan workflow

This ExecPlan is a living document. The sections `Progress`, `Surprises & Discoveries`, `Decision Log`, and `Outcomes & Retrospective` must be kept up to date as work proceeds. Maintain this document in accordance with [`PLANS.md`](../../PLANS.md).

Related tasks: none yet. This plan establishes repository workflow rather than product scope.

Related docs: [`AGENTS.md`](../../AGENTS.md), [`PLANS.md`](../../PLANS.md), [`docs/agentic-workflow.md`](../agentic-workflow.md), [`docs/decisions.md`](../decisions.md), [`docs/tasks/README.md`](../tasks/README.md).

## Purpose / Big Picture

After this change, the repository will have a clear, reusable way to store long-form execution plans. Contributors will be able to create a root [`PLANS.md`](../../PLANS.md) file that defines the ExecPlan contract, store individual plans under [`docs/plans/`](./), and link those plans from task briefs without turning plan files into default reading material for every task.

## Progress

- [x] (2026-04-08 04:01Z) Reviewed the repo routing docs and the published Codex ExecPlan guidance to define a repo-specific planning convention.
- [x] (2026-04-08 04:01Z) Added [`PLANS.md`](../../PLANS.md) and this seeded plan file under [`docs/plans/`](./).
- [x] (2026-04-08 04:01Z) Updated the repo routing, workflow, and decision docs so plans can be linked to tasks without becoming default context.
- [x] (2026-04-08 04:03Z) Verified the new docs wiring with a repo search and confirmed the markdown edits were clean with `git diff --check`.
- [x] (2026-04-08 04:12Z) Fixed the first PR's `repo-hygiene` failure by removing raw tracked-path mentions that violated the markdown link rule and by adding the new planning docs to the required-files check.
- [x] (2026-04-08 04:17Z) Simplified the workflow by removing the plans-local index and making [`PLANS.md`](../../PLANS.md) the single routing entrypoint for plan work.

## Surprises & Discoveries

- Observation: [`docs/plans/`](./) already existed as an empty directory, so the new convention fit cleanly into the current docs layout without adding another top-level area.
  Evidence: Listing the directory showed no existing plan files.

- Observation: The existing task template already had a `Related docs` slot, so plan-to-task linking could be added without changing the task file structure.
  Evidence: [`docs/tasks/README.md`](../tasks/README.md) defines `Related docs` as part of the standard task layout.

- Observation: The repo markdown-link checker treats raw tracked-path mentions in inline code and indented command examples as failures, so even validation examples inside plan docs need link-safe wording.
  Evidence: `python3 scripts/check-markdown-repo-links.py` initially flagged raw mentions of [`PLANS.md`](../../PLANS.md), [`docs/plans/`](./), and command-argument path tokens in this file, then passed after those references were rewritten.

## Decision Log

- Decision: Keep repository-wide ExecPlan rules and the plan index in [`PLANS.md`](../../PLANS.md), while storing individual plans under [`docs/plans/`](./).
  Rationale: This keeps one shared contract for plan structure while preserving the existing docs tree organization.
  Date/Author: 2026-04-08 / Codex

- Decision: Link plans from task files through `Related docs` instead of expanding the task template with a new dedicated plan section.
  Rationale: Reusing the existing task structure keeps task briefs compact and avoids introducing another required task-field convention.
  Date/Author: 2026-04-08 / Codex

- Decision: Treat [`PLANS.md`](../../PLANS.md) as the single routing entrypoint for plan work and avoid a plans-local index unless the folder later grows enough to need one.
  Rationale: The extra local index added ceremony without adding meaningful routing beyond what [`PLANS.md`](../../PLANS.md) already provides.
  Date/Author: 2026-04-08 / Codex

- Decision: Keep [`PLANS.md`](../../PLANS.md) in the repo-hygiene required-files list and keep plan validation prose free of raw tracked-path tokens.
  Rationale: The planning convention is now repository-level workflow, so the hygiene workflow should enforce the shared root contract, and the plan file itself should comply with the repo's markdown-link rule.
  Date/Author: 2026-04-08 / Codex

## Outcomes & Retrospective

The repo now has a documented ExecPlan convention, a plan index, and a first plan file that records how the convention was introduced. [`PLANS.md`](../../PLANS.md) is the single routing entrypoint for plan work, which keeps the workflow discoverable without adding an extra plans-local index layer.

No product or runtime behavior changed. Future work should only add more plan files when the task is large enough to benefit from a living execution document.

## Context and Orientation

Before this change, the repository already had a strong routing pattern built around [`AGENTS.md`](../../AGENTS.md) and local routing files, plus human-facing workflow guidance in [`docs/agentic-workflow.md`](../agentic-workflow.md). It did not have a checked-in [`PLANS.md`](../../PLANS.md) file or a defined place to store repository execution plans.

Task files already support `Related docs`, and repository-wide workflow decisions already live in [`docs/decisions.md`](../decisions.md). That meant the smallest coherent change was to add a plan contract and index in [`PLANS.md`](../../PLANS.md), store individual plans under [`docs/plans/`](./), and connect the convention to the existing task and workflow docs.

## Plan of Work

Add a root [`PLANS.md`](../../PLANS.md) file that explains when to use an ExecPlan in this repository, restates the required structure of a plan, and indexes the checked-in plan files. Use that root file as the routing entrypoint for any later work under [`docs/plans/`](./).

Then update [`AGENTS.md`](../../AGENTS.md), the repo workflow docs, and [`docs/tasks/README.md`](../tasks/README.md) so plans fit into the normal lookup order without becoming default reading. Update [`docs/agentic-workflow.md`](../agentic-workflow.md) and [`docs/decisions.md`](../decisions.md) so the convention is recorded as a repository workflow choice and task briefs know how to link plans.

## Concrete Steps

From the repository root at [`./`](../../), inspect the current routing docs and workflow docs, then edit the documentation files listed in this plan to add the new planning convention.

After editing, verify the wiring by searching for links to the root plan contract and the plans subtree across the repo docs so the new convention is reachable from the normal agent entry points.

## Validation and Acceptance

Run a repository search from the root and confirm that the new plan files and routing references exist.

One reliable way is to search all tracked markdown docs for the new plan links, for example by matching the link target fragments rather than raw path tokens.

Acceptance is met when the output shows:

- [`PLANS.md`](../../PLANS.md) defining the ExecPlan rules and indexing the checked-in plans
- Existing routing or workflow docs linking to the new plan convention
- [`docs/tasks/README.md`](../tasks/README.md) describing how tasks should link plans through `Related docs`

## Idempotence and Recovery

These changes are documentation-only and idempotent. Reapplying the convention should converge on the same files and links rather than creating duplicate structures.

If a future rename changes a plan filename, update [`PLANS.md`](../../PLANS.md) first and then update any task or doc links that reference the renamed plan.

## Artifacts and Notes

The most important artifact is the docs wiring itself: a root plan contract plus repo docs that point to it only when appropriate.

The validation search command is intentionally simple so future contributors can rerun it after any plan-related documentation edit.

Validation evidence:

- A repository search for the new plan-link targets returned hits in the repo instruction layer, the routing docs, the workflow docs, the task guidance, and the new plan files.
- `git diff --check` returned no output.

## Interfaces and Dependencies

[`AGENTS.md`](../../AGENTS.md) defines the repo instruction layer. [`PLANS.md`](../../PLANS.md) defines the ExecPlan contract, provides plan-routing guidance, and indexes the stored plans. [`docs/tasks/README.md`](../tasks/README.md) is the task integration point that lets task briefs link plans without changing their structure.

Change note: 2026-04-08 / Codex. Created the initial repo ExecPlan workflow and seeded the first indexed plan so future plan work has a documented starting point.
