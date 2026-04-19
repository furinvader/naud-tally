# Simplify agent context routing

This ExecPlan is a living document. The sections `Progress`, `Surprises & Discoveries`, `Decision Log`, and `Outcomes & Retrospective` must be kept up to date as work proceeds. Maintain this document in accordance with [`PLANS.md`](../../PLANS.md).

Related tasks: [`docs/tasks/done/T-030.md`](../tasks/done/T-030.md).

Related docs: [`AGENTS.md`](../../AGENTS.md), [`README.md`](../../README.md), [`PLANS.md`](../../PLANS.md), [`docs/agentic-workflow.md`](../agentic-workflow.md), [`docs/decisions.md`](../decisions.md), [`ARCHITECTURE.md`](../../ARCHITECTURE.md), [`docs/architecture/layering.md`](../architecture/layering.md), [`docs/tasks.md`](../tasks.md), [`docs/tasks/README.md`](../tasks/README.md), [`frontend/AGENTS.md`](../../frontend/AGENTS.md), [`frontend/README.md`](../../frontend/README.md), [`frontend/decisions.md`](../../frontend/decisions.md), [`docs/workflows/publish.md`](../workflows/publish.md), [`docs/design/README.md`](../design/README.md).

## Purpose / Big Picture

After this change, the repository should use a smaller and more standard agent-context setup: one repo-level [`AGENTS.md`](../../AGENTS.md), one frontend-local [`frontend/AGENTS.md`](../../frontend/AGENTS.md), and ordinary human-facing docs for navigation and source-of-truth content. The old routing-tree files should be removed.

The goal is not to remove all guidance. The goal is to reduce duplicated routing instructions, move durable behavior rules into the repository instruction layer, and let [`README.md`](../../README.md) plus the existing docs own the knowledge layer. This change should make the workflow easier to maintain while preserving the constraints that matter most for reliable agent behavior. If later usage shows a real quality drop, the follow-up response should be targeted and documented rather than a reflexive return to the old routing tree.

## Progress

- [x] (2026-04-16 04:09Z) Reviewed the current routing setup, the repo's ExecPlan convention, and the existing docs that would need to absorb routing responsibilities if the routing tree is retired.
- [x] (2026-04-16 04:09Z) Added this ExecPlan and indexed it in [`PLANS.md`](../../PLANS.md) so the later implementation work has a checked-in guide.
- [x] (2026-04-16 04:09Z) Verified the new plan file and plan-index update read cleanly and that `git diff --check` returned no output.
- [x] (2026-04-18 13:06Z) Revised the plan from an observation-first migration to a direct removal plan with targeted follow-up mitigation only if later work shows a real regression.
- [x] (2026-04-18 13:06Z) Added [`docs/tasks/done/T-030.md`](../tasks/done/T-030.md) so the planned routing-doc removal now has a backlog entry linked to this ExecPlan.
- [x] (2026-04-18 21:47Z) Replaced the active routing convention in [`AGENTS.md`](../../AGENTS.md) so it now points to source-of-truth docs and [`frontend/AGENTS.md`](../../frontend/AGENTS.md) instead of a routing-tree lookup order.
- [x] (2026-04-18 21:47Z) Added [`frontend/AGENTS.md`](../../frontend/AGENTS.md) and [`docs/tasks/README.md`](../tasks/README.md) so frontend-local execution rules and task-brief guidance survive without the old routing files.
- [x] (2026-04-18 21:47Z) Updated current workflow docs, open tasks, historical task and plan references, and the surviving plan and task records so the repo no longer contains dead markdown links to removed routing files.
- [x] (2026-04-18 21:47Z) Removed the routing-tree files and validated the cleanup with [`scripts/check-markdown-repo-links.py`](../../scripts/check-markdown-repo-links.py), targeted repo searches, and `git diff --check`.
- [x] (2026-04-18 21:47Z) Confirmed the targeted-mitigation path still stands: if later usage exposes a real quality drop, the fix should land in the smallest surviving source doc rather than by restoring the removed routing tree.

## Surprises & Discoveries

- Observation: the repo already has strong human-facing docs in places where some of the current routing files duplicate guidance, especially under [`frontend/`](../../frontend/) and [`docs/design/`](../design/).
  Evidence: [`frontend/README.md`](../../frontend/README.md) already contains runtime setup, layout, feature-structure, and styling guidance, and [`docs/design/README.md`](../design/README.md) already explains the design directory layout.

- Observation: the current repo contains many references to the routing files, but most of them are historical references in done task files and older plans rather than active routing entrypoints.
  Evidence: a repository search before drafting this plan returned 61 matches, including current docs, open task files, done task files, and historical plan files.

- Observation: the riskiest behavior regression was likely in frontend work, because the former frontend routing file carried real behavioral rules such as running `nvm use`, validation commands, and scope constraints.
  Evidence: the old frontend routing file included runtime-setup and validation sections, while several of the docs-only indexes were almost pure navigation lists.

## Decision Log

- Decision: remove the old routing-tree files in the main implementation pass instead of keeping a temporary deprecation-stub phase.
  Rationale: the prior review concluded that the repo can safely rely on a smaller [`AGENTS.md`](../../AGENTS.md) plus [`README.md`](../../README.md)-based setup, and an extra stub phase would prolong duplicated workflow guidance and cleanup churn.
  Date/Author: 2026-04-18 / Codex

- Decision: keep the new durable instruction layer intentionally small: root [`AGENTS.md`](../../AGENTS.md) plus [`frontend/AGENTS.md`](../../frontend/AGENTS.md) only.
  Rationale: this covers the one subtree with genuinely distinct execution behavior while avoiding another broad hierarchy of local instruction files.
  Date/Author: 2026-04-16 / Codex

- Decision: do not add optional cross-tool compatibility files as part of this migration.
  Rationale: this change is about simplifying the repo's native workflow, not broadening tool support.
  Date/Author: 2026-04-16 / Codex

- Decision: update active guidance and open-task references, but do not churn historical done-task records merely to remove old links.
  Rationale: done task files are history first; they should remain readable, while active docs should reflect the new workflow clearly. Historical files should still be updated when needed to avoid broken links after the removals land.
  Date/Author: 2026-04-18 / Codex

- Decision: if later usage reveals a real quality regression, respond with a targeted and documented mitigation instead of reintroducing the old routing tree by default.
  Rationale: focused fixes in [`AGENTS.md`](../../AGENTS.md), [`frontend/AGENTS.md`](../../frontend/AGENTS.md), [`frontend/README.md`](../../frontend/README.md), or task and workflow docs will be easier to reason about and maintain than restoring a broad parallel routing layer.
  Date/Author: 2026-04-18 / Codex

## Outcomes & Retrospective

The repo now uses root [`AGENTS.md`](../../AGENTS.md) plus [`frontend/AGENTS.md`](../../frontend/AGENTS.md) as the instruction layer, while [`docs/tasks/README.md`](../tasks/README.md), [`frontend/README.md`](../../frontend/README.md), and the existing source-of-truth docs carry the human-facing navigation layer. The old routing-tree files are gone, and tracked markdown references now point only at surviving docs.

No immediate quality regression surfaced during the cleanup. The targeted mitigation path remains the same: if later work reveals missing context, add it to the smallest surviving source doc rather than restoring the removed routing tree by default.

## Context and Orientation

The earlier repository workflow used a root [`AGENTS.md`](../../AGENTS.md) plus a tree of local routing files. The root instruction file explicitly required those indexes in its lookup order, the root [`README.md`](../../README.md) described that structure, and repository workflow docs such as [`docs/agentic-workflow.md`](../agentic-workflow.md) and [`docs/decisions.md`](../decisions.md) presented it as the accepted convention.

At the same time, much of the knowledge that matters for implementation already lives in ordinary docs. [`frontend/README.md`](../../frontend/README.md) already explains the frontend runtime setup and structure. [`docs/tasks.md`](../tasks.md) already lists current work. [`docs/design/README.md`](../design/README.md) already explains the design area. The remaining value in the routing tree is therefore uneven: the frontend index carries meaningful behavioral rules, while several other indexes mainly add an extra hop.

This plan intentionally keeps the change narrow. It does not introduce additional compatibility files, tool-specific instruction systems, or new task-management structure. It removes the current routing tree and replaces it with a simpler durable-context setup.

## Plan of Work

First, make the new instruction boundary explicit. Rewrite the root [`AGENTS.md`](../../AGENTS.md) so it no longer requires the routing tree and instead points directly to the source-of-truth docs for product, tasks, plans, publish rules, and frontend work. Add a new [`frontend/AGENTS.md`](../../frontend/AGENTS.md) with the frontend-local behavior that must remain easy for agents to discover, especially runtime setup, default validation commands, and the scope boundaries that protect the pilot architecture.

Second, move any still-useful navigation content out of the active routing files and into ordinary docs where humans would also expect to find it. [`docs/tasks.md`](../tasks.md) and [`docs/tasks/README.md`](../tasks/README.md) should absorb the active task-routing guidance. Existing docs such as [`frontend/README.md`](../../frontend/README.md) and [`docs/design/README.md`](../design/README.md) should absorb any missing orientation details they still need.

Third, clean up every tracked markdown reference that would otherwise point at a removed routing file. This includes active docs first and then any historical docs or older plans whose links would become invalid once the files are removed. Historical narrative may remain historical, but broken references should not remain in the tree.

Finally, remove the routing files and validate the repo as the new default workflow. If later usage uncovers a real regression, add a targeted documented mitigation in the most appropriate surviving source rather than reintroducing the full routing tree.

## Concrete Steps

From the repository root at [`./`](../../), edit [`AGENTS.md`](../../AGENTS.md) so the required lookup order becomes direct and source-of-truth oriented. The file should keep the runtime setup rule for frontend commands, the planning rule for ExecPlans, the publish-time rule, and the documentation update rule, but it should stop requiring the current routing files.

Add a new [`frontend/AGENTS.md`](../../frontend/AGENTS.md). Keep it short. It should cover:

- running `nvm use` before `npm` or `ng` commands in a fresh shell
- the default validation commands from [`frontend/README.md`](../../frontend/README.md)
- the expectation to start from the current task brief when changing behavior
- when to consult [`../../ARCHITECTURE.md`](../../ARCHITECTURE.md), [`../architecture/layering.md`](../architecture/layering.md), and [`decisions.md`](../../frontend/decisions.md)
- when to update [`frontend/README.md`](../../frontend/README.md), [`frontend/decisions.md`](../../frontend/decisions.md), and [`docs/decisions.md`](../decisions.md)

Add a new [`docs/tasks/README.md`](../tasks/README.md) that takes over the useful, human-facing parts of the old task-routing docs: task layout, the `open` and `done` status model, when to open one task file versus the full backlog, and the role of `Related docs`.

Then update the active docs that currently present the routing tree as the current workflow: [`README.md`](../../README.md), [`docs/agentic-workflow.md`](../agentic-workflow.md), [`docs/decisions.md`](../decisions.md), [`ARCHITECTURE.md`](../../ARCHITECTURE.md), [`docs/architecture/layering.md`](../architecture/layering.md), [`docs/tasks.md`](../tasks.md), [`frontend/README.md`](../../frontend/README.md), and [`frontend/decisions.md`](../../frontend/decisions.md). Keep the edits focused on current workflow. Preserve historical narrative where appropriate, but do not leave current guidance pointing at files that are about to be removed.

After the new authoritative docs are in place, remove the repo-root routing file plus the routing files under the docs, design, design foundations, research, tasks, open-tasks, done-tasks, workflows, UX, and frontend subtrees.

Update the open task briefs that still present the former frontend routing file as an active related doc, including at least [`docs/tasks/open/T-006.md`](../tasks/open/T-006.md), [`docs/tasks/open/T-008.md`](../tasks/open/T-008.md), [`docs/tasks/open/T-020.md`](../tasks/open/T-020.md), and [`docs/tasks/open/T-022.md`](../tasks/open/T-022.md). Point them at [`frontend/AGENTS.md`](../../frontend/AGENTS.md) or [`frontend/README.md`](../../frontend/README.md), whichever is the more accurate long-lived reference.

Search the rest of the tracked markdown tree and retarget or rewrite any remaining references that would otherwise break after the removals. Done task files and older plan files may keep their historical wording, but they must not keep dead links to removed files.

## Validation and Acceptance

Run repository searches from the root and confirm that the active workflow now points at [`AGENTS.md`](../../AGENTS.md), [`frontend/AGENTS.md`](../../frontend/AGENTS.md), and the human-facing docs rather than the routing tree.

Useful checks include:

- `rg -n "\\[[^]]+\\]\\([^)]*agent-index\\.md\\)" README.md AGENTS.md docs frontend` from the repository root to find any remaining markdown links to removed files
- a search for new references to [`frontend/AGENTS.md`](../../frontend/AGENTS.md) and [`docs/tasks/README.md`](../tasks/README.md)
- running [`scripts/check-markdown-repo-links.py`](../../scripts/check-markdown-repo-links.py) from the repository root to catch stale tracked-path mentions
- `git diff --check` after the documentation edits

Acceptance is met when:

- the root instruction layer no longer requires the routing tree
- [`frontend/AGENTS.md`](../../frontend/AGENTS.md) exists and carries the frontend-local behavior rules
- task and workflow docs point to ordinary docs and the surviving instruction files instead of local routing indexes
- all routing files have been removed
- tracked markdown docs no longer contain broken links to removed routing files
- no optional compatibility files were added as part of this migration

## Idempotence and Recovery

The migration should be implemented so re-running the edits converges on the same surviving instruction and README files without recreating a parallel routing tree.

If later work shows a real quality drop, do not automatically restore the old routing structure. First identify the specific missing behavior or ambiguity and document a focused mitigation in the most appropriate surviving source, such as [`AGENTS.md`](../../AGENTS.md), [`frontend/AGENTS.md`](../../frontend/AGENTS.md), [`frontend/README.md`](../../frontend/README.md), or the relevant task and workflow docs. If a targeted fix proves insufficient, the old routing files can still be restored from git history, but that should be treated as a deliberate rollback rather than the default response.

## Artifacts and Notes

The key artifacts for this work are:

- the rewritten root [`AGENTS.md`](../../AGENTS.md)
- the new [`frontend/AGENTS.md`](../../frontend/AGENTS.md)
- the new [`docs/tasks/README.md`](../tasks/README.md)
- the updated current workflow docs
- the repo-wide link cleanup that makes the file removals safe

If a follow-up mitigation is ever needed, record it explicitly in the final implementation summary so the repo gains a documented reason for the extra guidance rather than drifting back toward ad hoc routing layers.

## Interfaces and Dependencies

[`AGENTS.md`](../../AGENTS.md) is the repository-level behavior contract. [`frontend/AGENTS.md`](../../frontend/AGENTS.md) becomes the only subtree-specific instruction file in scope for this migration. [`README.md`](../../README.md), [`docs/tasks.md`](../tasks.md), [`docs/tasks/README.md`](../tasks/README.md), [`frontend/README.md`](../../frontend/README.md), [`docs/design/README.md`](../design/README.md), and [`docs/workflows/publish.md`](../workflows/publish.md) become the main human-facing navigation layer.

This plan depends on keeping source-of-truth boundaries clear: product scope still belongs in product and UX docs, architecture still belongs in architecture and decisions docs, and open work still belongs in task briefs. The new instruction files should describe how to work, not duplicate those content sources.

Change note: 2026-04-16 / Codex. Created the initial ExecPlan for simplifying the repository's agent-context routing without adding optional compatibility files. Revised on 2026-04-18 to treat removal of the routing tree as the default implementation path, and updated later that day to record the completed cleanup.
