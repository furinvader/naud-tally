# Frontend Agent Index

Read this file before exploring files under [`frontend/`](./).

## Start From the Task

- Read the current task brief from [`../docs/tasks/agent-index.md`](../docs/tasks/agent-index.md) before changing frontend behavior.
- Re-read [`../docs/product.md`](../docs/product.md) only if the task changes product behavior or UX expectations.

## File Routing

- For the main screen and layout, read [`src/app/app.ts`](src/app/app.ts), [`src/app/app.html`](src/app/app.html), and [`src/app/app.scss`](src/app/app.scss).
- For tally state and persistence, read [`src/app/drink-tally.store.ts`](src/app/drink-tally.store.ts) and [`src/app/drink-tally.store.spec.ts`](src/app/drink-tally.store.spec.ts).
- For app-level UI tests, read [`src/app/app.spec.ts`](src/app/app.spec.ts).
- For bootstrap and app wiring, read [`src/main.ts`](src/main.ts), [`src/app/app.config.ts`](src/app/app.config.ts), and [`src/app/app.routes.ts`](src/app/app.routes.ts).
- For global styling, read [`src/styles.scss`](src/styles.scss).

## Validation

Run from [`frontend/`](./):

- `npm test -- --watch=false`
- `npm run build`

## Constraints

- Keep the pilot local-first unless a task explicitly changes that.
- Avoid expanding beyond the current task brief.
- Update docs if the implementation changes product scope or decisions.
