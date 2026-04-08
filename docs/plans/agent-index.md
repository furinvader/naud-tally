# Plans Agent Index

Read this file before opening plan files under [`docs/plans/`](./).

## Purpose

- This folder holds long-form execution plans for complex work.
- Plans are intentionally separate from task briefs so they do not become default context for every task.

## Load Rules

- Read [`../../PLANS.md`](../../PLANS.md) before opening any individual plan file in this folder.
- Open a plan file only when the user asks to create, review, or implement from a plan.
- Open a plan file when a task brief or another relevant doc links to it and the extra context is actually needed.
- Do not scan unrelated plan files while working on an ordinary task.

## Layout

- Repository-wide ExecPlan rules and the plan index live in [`../../PLANS.md`](../../PLANS.md).
- Individual plans live in this folder as [`docs/plans/<plan-name>.md`](./).
- Keep filenames short, action-oriented, and kebab-case.

## Maintenance

- When adding or renaming a plan file, update [`../../PLANS.md`](../../PLANS.md).
- When a plan materially changes task scope, update the linked task file or related docs that point to it.
