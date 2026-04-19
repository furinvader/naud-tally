---
name: docs-drift-audit
description: Audit and repair documentation drift in this repository. Use when Codex needs to review repo-owned Markdown for stale statements, contradictory guidance, missing documentation coverage, moved or removed file references, backlog or task-state drift, glossary inconsistencies, or redundant wording, or when a user asks for a docs audit, cleanup, or documentation refactor.
---

# Docs Drift Audit

Audit repo-owned documentation in two modes:

- Audit mode: find stale, contradictory, missing, superfluous, or glossary-drift issues and report them clearly.
- Cleanup mode: fix the confirmed issues, then rerun validation so the docs converge on one consistent story.

Start by following the repository's own routing rules. In this repo that usually means reading [`AGENTS.md`](../../../AGENTS.md) and the nearest docs indexes before scanning broadly.

## Quality Lenses

Use these lenses while auditing:

- accuracy: does the doc still match the code, backlog, or repo workflow?
- consistency: do related docs tell the same story?
- completeness: is an expected doc or update missing?
- timelessness: does the wording avoid time-anchored phrasing that ages badly?
- type fit: does the page still behave like the kind of doc it claims to be?

The timelessness lens is borrowed from Google's documentation guidance. The type-fit lens is borrowed from Diataxis: reference, explanation, and task guidance should not collapse into one muddy document when separation would make maintenance easier.

## Quick Start

1. Inventory repo-owned Markdown, not dependency docs.
2. Identify the source-of-truth docs for the area being audited.
3. Run five passes:
   - stale and timeless wording
   - contradictions
   - missing coverage
   - document-type or document-placement drift
   - glossary and terminology drift
4. Run [`scripts/scan_markdown_links.py`](scripts/scan_markdown_links.py) to catch broken local links.
5. Report findings with the buckets in [`references/report-template.md`](references/report-template.md).
6. If asked to clean up, edit source-of-truth docs first, then backlog or historical docs, then rerun validation.

Load references only when needed:

- [`references/audit-checklist.md`](references/audit-checklist.md): fuller audit checklist
- [`references/timeless-wording.md`](references/timeless-wording.md): time-anchored phrasing to flag or rewrite
- [`references/document-type-drift.md`](references/document-type-drift.md): Diataxis-inspired document-type checks
- [`references/glossary-considerations.md`](references/glossary-considerations.md): terminology and glossary checks
- [`references/report-template.md`](references/report-template.md): stable reporting shape
- [`references/docs-as-code-hardening.md`](references/docs-as-code-hardening.md): optional follow-up hardening ideas

## Source-of-Truth Order

Prefer updating the smallest true source of truth instead of papering over disagreements in many files.

In this repo, the usual order is:

1. [`README.md`](../../../README.md) for the project overview.
2. [`docs/product.md`](../../../docs/product.md) for product scope.
3. [`ARCHITECTURE.md`](../../../ARCHITECTURE.md) for module boundaries and ownership.
4. [`docs/decisions.md`](../../../docs/decisions.md) and local decision docs such as [`frontend/decisions.md`](../../../frontend/decisions.md) for durable decisions.
5. [`docs/glossary.md`](../../../docs/glossary.md) for stable term definitions.
6. [`docs/tasks.md`](../../../docs/tasks.md), task indexes, and task briefs for backlog state.
7. Plans under [`docs/plans/`](../../../docs/plans/) only when plan-linked tasks or implementation history matter.

When implementation state is relevant, confirm against the current repo instead of trusting older docs.

## Audit Workflow

### 1. Choose Scope

Decide whether you want:

- tracked docs only: stable repo audit, good for PR-ready checks
- all docs on disk: useful while cleaning up a dirty working tree with moved or newly added docs

### 2. Inventory Markdown

Prefer tracked or repo-owned Markdown only. Exclude dependency trees such as `frontend/node_modules`.

Useful patterns:

```bash
git ls-files '*.md'
python3 .codex/skills/docs-drift-audit/scripts/scan_markdown_links.py --tracked-only
python3 .codex/skills/docs-drift-audit/scripts/scan_markdown_links.py --all-on-disk
```

Use `--all-on-disk` while a cleanup is in progress and files have moved or been newly added.

### 3. Run the Audit Passes

#### Stale and Timeless Wording

Use `rg` to find higher-signal stale patterns first:

- removed or moved file paths
- renamed features or routes
- `current priority`
- `default route`
- `future work`
- `does not yet`
- `currently`
- `now`
- `latest`

Use weaker signals such as `still` or `next` only after you have a concrete hypothesis.

#### Contradictions

Look for disagreements between:

- `README` and product docs
- product docs and architecture docs
- task indexes and task files
- task files and linked plans
- frontend docs and current feature boundaries
- glossary definitions and the language used elsewhere

#### Missing Coverage

Look for places where a change happened but no owning docs were updated:

- task moved but indexes were not updated
- feature renamed but routing docs still use the old name
- implementation changed but the source-of-truth doc never absorbed it
- glossary-worthy term change that never reached [`docs/glossary.md`](../../../docs/glossary.md)

#### Document-Type and Placement Drift

Use the checks in [`references/document-type-drift.md`](references/document-type-drift.md).

Common failures:

- a task brief carrying long-lived research or explanation
- a reference doc mixing procedural guidance and narrative rationale
- the same workflow repeated across product, UX, design, task, and plan docs when one doc should own the detail

#### Glossary and Terminology Drift

Use the checks in [`references/glossary-considerations.md`](references/glossary-considerations.md).

Pay special attention to:

- first meaningful glossary links
- changed meanings
- legacy aliases after renames

### 4. Validate Local Links

Run:

```bash
python3 .codex/skills/docs-drift-audit/scripts/scan_markdown_links.py --tracked-only
```

Use `--all-on-disk` during cleanup when the working tree is ahead of the index.

### 5. Report Clearly

Use the buckets in [`references/report-template.md`](references/report-template.md):

- stale
- contradictory
- missing
- superfluous

Favor practical findings over perfect precision.

## Cleanup Mode

When the user asks you to fix the drift:

1. Update source-of-truth docs first.
2. Update task and plan routing next.
3. Repair historical links and stale file references after the source docs are aligned.
4. Keep wording concise and timeless; collapse repeated explanations when one source doc can carry them.
5. Rerun link validation and targeted `rg` searches for the drift you removed.

Useful final checks:

```bash
git diff --check
python3 .codex/skills/docs-drift-audit/scripts/scan_markdown_links.py --all-on-disk
rg -n "phrase-to-verify" README.md docs frontend
```

If drift keeps recurring, use [`references/docs-as-code-hardening.md`](references/docs-as-code-hardening.md) to suggest CI or lint follow-ups.

## Repo-Specific Notes

- Follow the repo's document-routing rules before loading broad docs.
- Treat task state, plan links, and index pages as part of the documentation surface, not just the product docs.
- When a historical task references a removed implementation file, preserve the history but retarget the link to surviving files or directories when possible.
- When a template intentionally uses placeholder text, prefer plain placeholder text over a knowingly broken local link.
