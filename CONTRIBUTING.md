# Contributing

Thanks for taking an interest in `Naud Tally`.

This project is being prepared as a public, portfolio-friendly repository. That means we care about both the product and the quality of the collaboration trail around it.

## Working Style

- Keep changes small and focused.
- Prefer pull requests over direct pushes to `main`.
- Write clear PR titles because the repository is intended to use squash merges.
- Update docs when the product scope or decisions change.
- Avoid mixing unrelated changes in one PR.

## Branching

Use short-lived branches from `main`.

For exact branch, commit, and PR naming patterns, use [`docs/workflows/publish.md`](docs/workflows/publish.md).

Suggested branch name styles:

- `docs/open-source-setup`
- `feat/drink-counter-screen`
- `fix/reset-flow`

## Pull Requests

Each pull request should:

- explain the problem or goal
- describe the change in plain language
- mention how it was checked
- call out any follow-up work or open questions

Because we want a clean public history, assume that:

- the PR title should be good enough to become the final squash commit title
- intermediate branch commits can be messy while working
- `main` should stay readable as a high-level story of the project

See [`docs/workflows/publish.md`](docs/workflows/publish.md) for the exact publish-time naming pattern.

## Commit Guidance

You do not need perfect local commits on a branch if the final PR is clean.

The exact publish-time branch, commit, and PR naming rules live in [`docs/workflows/publish.md`](docs/workflows/publish.md).

Useful commit title styles:

- `docs: define pilot scope`
- `chore: add repo checks workflow`
- `feat: add tablet tally screen`
- `fix: persist counts after reload`

## Documentation Expectations

If a change affects product behavior or architecture, update the relevant file:

- [`README.md`](README.md) for project overview
- [`docs/product.md`](docs/product.md) for product scope
- [`docs/decisions.md`](docs/decisions.md) for important decisions
- [`docs/tasks/agent-index.md`](docs/tasks/agent-index.md) and the relevant task file for backlog and next steps
- when a markdown doc mentions a repo file or directory, use a markdown link to that path

## Before Merging

Before a PR is merged:

- review the diff for accidental complexity
- make sure checks pass
- make sure the PR title reads well as a squash commit
- confirm any open questions are documented
