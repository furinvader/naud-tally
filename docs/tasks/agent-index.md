# Task Agent Index

Use this file before reading task files under [`docs/tasks/`](./).

## Layout

- Task files live in status folders as [`docs/tasks/<status>/T-<task-id>.md`](./).
- Use only these task statuses:
  - `open`
  - `done`
- Current-priority tasks still live in [`open/`](open/); they do not get a separate status.
- Before opening a task file, read the matching status-folder index first.

## Task File Structure

Each task file should use this order:

- `Status`
- `Goal` or `Target outcome`
- `Done when`
- `In scope`
- `Out of scope`
- `Likely files`
- `Related docs`
- `Recommendations`, if the task is evaluative
- `Outcome`, if the task is done

Supporting research belongs in [`docs/research/agent-index.md`](../research/agent-index.md). Link the relevant research brief from `Related docs` instead of adding a `Research Notes` section to the task file.
If a task has a detailed execution plan, link the relevant plan from `Related docs` instead of duplicating the full plan in the task file.

## Load Rules

- For the human-facing backlog and task-status overview, read [`../tasks.md`](../tasks.md).
- Read the relevant status-folder index before opening a task file.
- Open only the task file you are actively planning, implementing, or reviewing.
- Load a linked plan only if it adds material context for the current task.
- Do not scan every task file unless the user asks for backlog triage.

## Status Folders

- [Open Tasks](open/agent-index.md)
- [Done Tasks](done/agent-index.md)
