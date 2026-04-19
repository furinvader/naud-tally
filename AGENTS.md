# AGENTS Instructions

## Start Here

- Start every task with this file.
- Follow only the smallest set of linked docs needed for the current task.
- Prefer source-of-truth docs over historical task files unless the work depends on prior implementation history.
- Only follow the links needed for the current task. Do not scan broad docs by default.

## Required Lookup Order

1. Start every task with this file.
2. For product scope, architecture, or repo-wide docs, open only the smallest relevant source doc:
   - [`docs/product.md`](docs/product.md) for product scope and user-facing requirements.
   - [`ARCHITECTURE.md`](ARCHITECTURE.md) for module boundaries, state ownership, and dependency boundaries.
   - [`docs/architecture/layering.md`](docs/architecture/layering.md) for feature-internal layer rules.
   - [`docs/glossary.md`](docs/glossary.md) for stable domain and architecture vocabulary.
   - [`docs/decisions.md`](docs/decisions.md) for repo-wide workflow or architecture decisions.
   - [`docs/agentic-workflow.md`](docs/agentic-workflow.md) for Codex collaboration guidance.
   - [`docs/workflows/planning-subagent-workflow.md`](docs/workflows/planning-subagent-workflow.md) when the user explicitly invokes the repo's planning subagent workflow.
   - [`docs/design/README.md`](docs/design/README.md) for design workflow and committed artifacts.
   - the relevant UX brief under [`docs/ux/`](docs/ux/) when a task depends on user-flow detail.
   - the relevant research brief under [`docs/research/`](docs/research/) when a task depends on prior evaluation or comparison work.
3. For task work, start with [`docs/tasks.md`](docs/tasks.md), then [`docs/tasks/README.md`](docs/tasks/README.md), then open only the relevant task file under [`docs/tasks/open/`](docs/tasks/open/) or [`docs/tasks/done/`](docs/tasks/done/).
4. Before reading files under [`frontend/`](frontend/), read [`frontend/AGENTS.md`](frontend/AGENTS.md). Use [`frontend/README.md`](frontend/README.md) for frontend structure, conventions, and runtime commands.

## Runtime Setup Rule

- Before running frontend `npm` or `ng` commands, follow the runtime setup guidance in [`frontend/AGENTS.md`](frontend/AGENTS.md) and [`frontend/README.md#runtime-setup`](frontend/README.md#runtime-setup).

## Planning Rule

- For complex features, significant refactors, or work that benefits from a living implementation plan, use an ExecPlan as defined in [`PLANS.md`](PLANS.md).
- Individual plan files live under [`docs/plans/`](docs/plans/).
- Read [`PLANS.md`](PLANS.md) before opening any plan file under [`docs/plans/`](docs/plans/).
- Do not open plan files by default. Read them only when the user asks for plan work, when a task file links to a plan, or when extra plan context is needed to execute a task safely.

## Subagent Workflow Rule

- The repo's planning subagent workflow is manual-only. Treat the exact phrase `planning subagent workflow` as the canonical trigger.
- When invoked, the default phases are `research`, `repo_docs_reader`, and `plan`, unless the user explicitly skips one.

## Publish-Time Rule

- Read [`docs/workflows/publish.md`](docs/workflows/publish.md) only when creating or renaming a branch, writing a commit title meant to stay in history, or opening, renaming, or updating a pull request.
- Use the naming conventions from that file for branch names, commit titles, and PR titles.

## Documentation Update Rule

- If product scope changes, update [`docs/product.md`](docs/product.md) and any other affected product docs.
- If a repo-wide workflow or architecture decision changes, update [`docs/decisions.md`](docs/decisions.md).
- If a local architecture, tooling, or convention decision changes, update the nearest relevant local decision file, such as [`frontend/decisions.md`](frontend/decisions.md).
- If you create, rename, or materially revise an execution plan, update [`PLANS.md`](PLANS.md) and the relevant file under [`docs/plans/`](docs/plans/).
- Research notes live under [`docs/research/`](docs/research/) in a flat, topic-based layout; link task or decision docs to the matching research brief instead of embedding research sections in task files.
- Task files use only `open` and `done` statuses. Current-priority tasks still remain `open`.
- If task state changes, update [`docs/tasks.md`](docs/tasks.md), move the relevant task file between [`docs/tasks/open/`](docs/tasks/open/) and [`docs/tasks/done/`](docs/tasks/done/), and update [`docs/tasks/README.md`](docs/tasks/README.md) if the task workflow itself changes.
- When a markdown doc mentions a repo file or directory, use a markdown link to that path.
