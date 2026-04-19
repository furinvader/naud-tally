# Frontend Instructions

## Start Here

- Start frontend work from [`../docs/tasks.md`](../docs/tasks.md) and the relevant task file before changing behavior.
- Use [`README.md`](README.md) for frontend structure, conventions, and default commands.
- Re-read [`../docs/product.md`](../docs/product.md) or the relevant UX brief under [`../docs/ux/`](../docs/ux/) only when the task changes behavior or user expectations.

## Runtime Setup

- The pinned Node version lives in [`.nvmrc`](.nvmrc).
- Before running `npm` or `ng` commands in a new shell session, run `nvm use` from [`frontend/`](./).
- Reuse the same shell session for multiple frontend commands when possible.

## Validation

- Run from [`frontend/`](./) when the touched code warrants it:
  - `npm run lint`
  - `npm test -- --watch=false`
  - `npm run build`

## When To Load More Context

- Read [`../docs/architecture.md`](../docs/architecture.md) and [`../docs/layering.md`](../docs/layering.md) when changing feature boundaries, state ownership, persistence shape, or feature-internal layer rules.
- Read [`decisions.md`](decisions.md) when changing frontend-local architecture, tooling, runtime setup, or default conventions.
- Read [`README.md#feature-implementation`](README.md#feature-implementation) before creating a new feature or restructuring frontend files.

## Constraints

- Keep the pilot local-first unless a task explicitly changes that.
- Put new feature work under [`src/app/features/`](src/app/features/) unless the change is specifically app shell, bootstrap wiring, or cross-feature shared UI.
- Put cross-feature reusable presentation and layout primitives under [`src/app/ui/`](src/app/ui/).

## Documentation Update Rule

- Update [`README.md`](README.md) if the frontend directory shape, feature conventions, or validation guidance changes.
- Update [`decisions.md`](decisions.md) if the change affects frontend-local architecture, tooling, runtime setup, or default conventions.
- Update [`../docs/decisions.md`](../docs/decisions.md) if the change affects a repo-wide decision.
