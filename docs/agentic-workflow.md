# Agentic Workflow

## Purpose

This document captures how we want to work with Codex so the lessons from this project transfer cleanly to future AI-assisted projects.

## Core Principles

- Keep context explicit. Important assumptions belong in docs, not only in chat.
- Ask for small, testable changes.
- Prefer one coherent task at a time over vague multi-part requests.
- Review behavior, not just generated code.
- Record decisions so future prompts stay grounded.

## Repo Context Routing

- [`AGENTS.md`](../AGENTS.md) is the repo-level instruction layer for agent behavior.
- [`agent-index.md`](../agent-index.md) files are the small routing files at the repo root and key subtrees.
- Start with the repo root index, then read the nearest relevant subtree index before opening other files there.
- Load [`docs/workflows/publish.md`](workflows/publish.md) only when branch, commit, or pull request work is happening.

## Recommended Working Loop

1. Update the docs if the product or constraints changed.
2. Give Codex one focused task with a clear outcome.
3. Let Codex inspect the repo and implement the change.
4. Review the diff and the behavior together.
5. Run checks or tests where possible.
6. Capture decisions, follow-ups, and lessons learned.

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
- [`docs/agent-decisions.md`](agent-decisions.md) records repository-wide decisions and tradeoffs.
- local [`agent-decisions.md`](../frontend/agent-decisions.md) files record area-specific decisions next to the relevant [`agent-index.md`](../frontend/agent-index.md).
- [`docs/tasks/agent-index.md`](tasks/agent-index.md) routes to the current task briefs.
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
