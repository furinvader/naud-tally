# GitHub Setup

This file documents the repository settings we should use once the project is pushed to GitHub.

Some of these settings are not stored in the repository itself, so this document acts as the source of truth.

## Goal

Keep the repository public-ready, easy to review, and active enough that GitHub visibly reflects ongoing work.

## Recommended Repository Settings

### Visibility

- Set the repository to `Public` when you are ready to publish it.

### Pull Requests

- Enable pull requests.
- Enable `Squash merge`.
- Disable `Merge commits` if you want `main` to stay especially clean.
- Disable `Rebase merge` unless you have a strong reason to keep it.
- Enable auto-delete for head branches after merge.

Why:

- squash merging keeps `main` readable
- PR titles become a clean public change log
- branch cleanup stays automatic

### Branch Protection for `main`

- Require a pull request before merging.
- Require status checks to pass before merging.
- Require branches to be up to date before merging if the repo becomes more active.
- Require linear history if you disable merge commits.
- Do not allow force pushes to `main`.

Why:

- protects the public history
- makes CI meaningful
- nudges all work through the same visible review path

### Actions

- Keep GitHub Actions enabled.
- Use the [`Repo Checks`](../.github/workflows/repo-checks.yml) workflow as the minimum required status check.

Why:

- creates visible workflow activity on pushes and PRs
- enforces pull request title naming so squash commits stay consistent
- catches unlinked repo file and directory mentions in tracked markdown docs
- gives the repo an observable engineering rhythm, even early

## Repository Files Added for This Goal

- [`CONTRIBUTING.md`](../CONTRIBUTING.md)
- [`.github/pull_request_template.md`](../.github/pull_request_template.md)
- [`.github/workflows/repo-checks.yml`](../.github/workflows/repo-checks.yml)
- [`.gitignore`](../.gitignore)

These files support the public workflow, but they do not replace the manual GitHub settings above.

## License

The repository uses the `MIT` license.

Keep the [`LICENSE`](../LICENSE) file in the repo root and preserve the license notice in distributed copies.

## Suggested Publishing Checklist

- push the repository to GitHub
- enable squash merge
- protect `main`
- require the `Repo Checks` workflow
- enable auto-delete for merged branches
- create the first issues from [`docs/tasks/agent-index.md`](tasks/agent-index.md)
