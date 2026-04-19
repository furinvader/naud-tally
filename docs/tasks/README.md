# Task Briefs

This directory holds the active backlog task briefs and the completed task history for the repository.

## Status Model

- [`open/`](open/) holds active planning work and tasks that are not done yet. Current-priority tasks stay in this folder; they do not get a separate status.
- [`done/`](done/) holds completed task history. Prefer open tasks unless you need implementation history, prior decisions, or past outcomes.

## How To Use Task Docs

- Start with [`../tasks.md`](../tasks.md) for the human-facing task-status overview and current priority.
- Open only the task file that matches the current goal.
- If a task is completed, move it from [`open/`](open/) to [`done/`](done/) and update [`../tasks.md`](../tasks.md).

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

## Related Docs And Supporting Context

- Keep supporting research in [`../research/`](../research/) as flat, topic-based briefs. Link the relevant research brief from `Related docs` instead of adding a `Research Notes` section to the task file.
- If a task has a detailed execution plan, link the relevant plan from `Related docs` instead of duplicating the full plan in the task file.
- Use `Related docs` for the smallest set of product, architecture, design, UX, research, or plan docs needed to execute or understand the task.
