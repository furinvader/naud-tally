# Agentic Workflow

## Purpose

This document captures how we want to work with Codex so the lessons from this project transfer cleanly to future AI-assisted projects.

## Core Principles

- Keep context explicit. Important assumptions belong in docs, not only in chat.
- Start architecture changes in docs before starting larger refactors.
- Ask for small, testable changes.
- Prefer one coherent task at a time over vague multi-part requests.
- Review behavior, not just generated code.
- Record decisions so future prompts stay grounded.

## Repo Context Routing

- [`AGENTS.md`](../AGENTS.md) is the repo-level instruction layer for agent behavior.
- [`frontend/AGENTS.md`](../frontend/AGENTS.md) is the only subtree-specific instruction layer and carries the frontend-local execution rules.
- Use source-of-truth docs such as [`docs/tasks.md`](tasks.md), [`docs/tasks/README.md`](tasks/README.md), [`frontend/README.md`](../frontend/README.md), and [`docs/design/README.md`](design/README.md) to load only the context the current task actually needs.
- Load [`docs/workflows/publish.md`](workflows/publish.md) only when branch, commit, or pull request work is happening.

## Recommended Working Loop

1. Update the docs if the product, architecture, or constraints changed.
2. For complex or multi-session work, create or update an ExecPlan in [`plans/`](plans/) and keep it aligned with [`../PLANS.md`](../PLANS.md).
3. Give Codex one focused task with a clear outcome.
4. Let Codex inspect the repo and implement the change.
5. Review the diff and the behavior together.
6. Run checks or tests where possible.
7. Capture decisions, follow-ups, and lessons learned.

For Penpot-driven UI work, treat [`docs/design/penpot-codex-workflow.md`](design/penpot-codex-workflow.md) as the operational guide for how the browser file, MCP connection, and repo-native brief fit together.

## Good Task Shape

A strong Codex task usually includes:

- the goal
- relevant constraints
- what success looks like
- where the change should live
- what should not be touched

Example:

> Build the tablet drink counter screen using the existing product docs. Keep it local-first, optimize for large touch targets, and do not add authentication yet.

## Review Checklist

When Codex completes a task, review these points:

- Does the result match the written requirement?
- Is the scope still narrow and understandable?
- Are assumptions visible in code or docs?
- Is the UI behavior obvious for a real user?
- Did we accidentally add complexity too early?

## Documentation Rules

- [`README.md`](../README.md) explains the project at a glance.
- [`docs/product.md`](product.md) is the source of truth for product scope.
- [`../ARCHITECTURE.md`](../ARCHITECTURE.md) records the target module map, dependency boundaries, and state ownership model.
- [`docs/architecture/layering.md`](architecture/layering.md) records the feature-internal layer rules.
- [`docs/glossary.md`](glossary.md) keeps domain and architecture vocabulary stable.
- [`docs/decisions.md`](decisions.md) records repository-wide decisions and tradeoffs.
- reusable research briefs live under [`docs/research/`](research/).
- [`docs/design/penpot-codex-workflow.md`](design/penpot-codex-workflow.md) explains how Penpot should be used in a Codex-first workflow.
- [`docs/tasks/README.md`](tasks/README.md) explains task brief structure, status meanings, and when to open one task versus task history.
- local [`decisions.md`](../frontend/decisions.md) files record area-specific decisions, while [`../frontend/AGENTS.md`](../frontend/AGENTS.md) carries frontend-local execution rules.
- [`docs/tasks.md`](tasks.md) tracks current task status and links to the current task briefs.
- [`../PLANS.md`](../PLANS.md) defines the ExecPlan format and indexes checked-in plans under [`plans/`](plans/).
- when a markdown doc mentions a repo file or directory, it should use a markdown link to that path

If a prompt depends on knowledge that should matter next week, it belongs in the repo docs.

## Team Agreement for This Pilot

- We will try to build the project through Codex rather than manually writing code.
- We will pause before scaffolding or large architectural changes if the product scope is still fuzzy.
- We will prefer simple technologies and predictable flows over novelty.
- We will keep the pilot small enough that we can finish and learn from it.

## What Success Looks Like

By the end of the pilot, we should have:

- a working app
- a clear record of why it was built that way
- a repeatable way to brief Codex on future projects

That transferability is part of the product.
