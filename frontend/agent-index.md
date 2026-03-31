# Frontend Agent Index

Read this file before exploring files under [`frontend/`](./).

## Start From the Task

- Read the current task brief from [`../docs/tasks/agent-index.md`](../docs/tasks/agent-index.md) before changing frontend behavior.
- Re-read [`../docs/product.md`](../docs/product.md) only if the task changes product behavior or UX expectations.
- If the task changes frontend architecture, tooling, runtime setup, or default conventions, read [`agent-decisions.md`](agent-decisions.md).
- Before creating a new feature or restructuring frontend files, read [`README.md#feature-implementation`](README.md#feature-implementation).

## File Routing

- For frontend structure and feature-creation rules, read [`README.md`](README.md).
- For frontend runtime setup and local commands, read [`README.md#runtime-setup`](README.md#runtime-setup).
- Put new feature work under [`src/app/features/`](src/app/features/), unless the change is specifically app shell or bootstrap wiring.
- For the current drink tally feature, read [`src/app/features/tally/drink-tally/drink-tally.ts`](src/app/features/tally/drink-tally/drink-tally.ts), [`src/app/features/tally/drink-tally/drink-tally.html`](src/app/features/tally/drink-tally/drink-tally.html), and [`src/app/features/tally/drink-tally/drink-tally.scss`](src/app/features/tally/drink-tally/drink-tally.scss).
- For tally state and persistence, read [`src/app/features/tally/drink-tally/drink-tally.store.ts`](src/app/features/tally/drink-tally/drink-tally.store.ts) and [`src/app/features/tally/drink-tally/drink-tally.store.spec.ts`](src/app/features/tally/drink-tally/drink-tally.store.spec.ts).
- For feature-level UI tests, read [`src/app/features/tally/drink-tally/drink-tally.spec.ts`](src/app/features/tally/drink-tally/drink-tally.spec.ts).
- For the app shell that hosts the feature, read [`src/app/app.ts`](src/app/app.ts), [`src/app/app.html`](src/app/app.html), [`src/app/app.scss`](src/app/app.scss), and [`src/app/app.spec.ts`](src/app/app.spec.ts).
- For bootstrap and app wiring, read [`src/main.ts`](src/main.ts), [`src/app/app.config.ts`](src/app/app.config.ts), and [`src/app/app.routes.ts`](src/app/app.routes.ts).
- For global styling, read [`src/styles.scss`](src/styles.scss).

## Validation

Before running `npm` or `ng` commands in a new shell session, run `nvm use` from [`frontend/`](./) so Node matches [`.nvmrc`](.nvmrc). Reuse the same shell session for multiple frontend commands when possible.

Run from [`frontend/`](./):

- `npm test -- --watch=false`
- `npm run build`

## Constraints

- Keep the pilot local-first unless a task explicitly changes that.
- Avoid expanding beyond the current task brief.
- Update [`agent-decisions.md`](agent-decisions.md) if the implementation changes frontend-local decisions.
- Update [`../docs/agent-decisions.md`](../docs/agent-decisions.md) if the change affects a repo-wide decision.
- Update [`README.md`](README.md) if the frontend feature structure or default Angular conventions change.
