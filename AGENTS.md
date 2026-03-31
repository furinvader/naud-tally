# AGENTS Instructions

## Start Here

- Read [`agent-index.md`](agent-index.md) at the repository root at the start of every task.
- Before reading files in a directory, read the nearest agent index file in that directory or its closest ancestor inside the repository.
- Only follow the links needed for the current task. Do not scan broad docs by default.

## Required Lookup Order

1. Start every task with [`agent-index.md`](agent-index.md).
2. Before reading files under [`docs/`](docs/), read [`docs/agent-index.md`](docs/agent-index.md).
3. Before reading files under [`docs/tasks/`](docs/tasks/), read [`docs/tasks/agent-index.md`](docs/tasks/agent-index.md), then open only the relevant task file.
4. Before reading files under [`docs/workflows/`](docs/workflows/), read [`docs/workflows/agent-index.md`](docs/workflows/agent-index.md).
5. Before reading files under [`frontend/`](frontend/), read [`frontend/agent-index.md`](frontend/agent-index.md).

## Runtime Setup Rule

- Before running frontend `npm` or `ng` commands, follow the runtime setup note in [`frontend/agent-index.md`](frontend/agent-index.md).

## Publish-Time Rule

- Read [`docs/workflows/publish.md`](docs/workflows/publish.md) only when creating or renaming a branch, writing a commit title meant to stay in history, or opening, renaming, or updating a pull request.
- Use the naming conventions from that file for branch names, commit titles, and PR titles.

## Documentation Update Rule

- If product scope changes, update [`docs/product.md`](docs/product.md) and any other affected product docs.
- If a workflow or architecture decision changes, update [`docs/decisions.md`](docs/decisions.md).
- If task state changes, update the relevant task file and [`docs/tasks/agent-index.md`](docs/tasks/agent-index.md).
- When a markdown doc mentions a repo file or directory, use a markdown link to that path.
