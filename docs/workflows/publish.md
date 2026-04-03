# Publish Workflow

This file is publish-time context. Load it only when preparing branch, commit, or pull request work.

## When to Read

- before creating or renaming a branch
- before writing a commit title meant to stay in project history
- before opening, renaming, or updating a pull request

## Allowed Types

Use one of these types for branch names, commit titles, and pull request titles:

- `feat`
- `fix`
- `docs`
- `chore`
- `refactor`
- `test`

## Branch Names

Pattern:

- `<type>/<short-kebab-scope>`

Rules:

- use one of the [allowed types](#allowed-types)
- branch from `main`
- keep names short and specific
- make one branch represent one coherent change

Examples:

- `feat/organizer-controls`
- `docs/agent-routing`
- `fix/export-reset-guard`

## Commit Titles

Pattern:

- `<type>: <imperative summary>`

Rules:

- use one of the [allowed types](#allowed-types)
- prefer one clear verb
- optimize for a clean public history, not a verbose local diary
- local in-progress commits may be rough, but any commit meant to stay in history should follow this format

Examples:

- `feat: add organizer reset controls`
- `docs: add agent index routing`
- `fix: prevent accidental tally reset`

## Pull Request Titles

Pattern:

- use the same `<type>: <summary>` format as the final squash commit

Rules:

- use one of the [allowed types](#allowed-types)
- assume the PR title will become the squash commit title on `main`
- if the scope changes materially, update the PR title before merge
- keep the title short enough to read well in the repository history
- [`Repo Checks`](../../.github/workflows/repo-checks.yml) enforces this title pattern on pull requests

Examples:

- `feat: add organizer controls`
- `docs: add agent routing`

## Pull Request Body

Each pull request should:

- explain the goal or problem
- describe the change in plain language
- say how it was checked
- call out follow-up work or open questions

## Minimal Publish Checklist

1. Confirm the relevant task from [`docs/tasks.md`](../tasks.md) still matches the change.
2. Use a branch name that fits the change type and scope.
3. Make sure the PR title reads well as a squash commit.
4. Before merge, make sure docs and task status reflect the final outcome.
