# Frontend Decisions

Read this file only when a task changes frontend architecture, tooling, runtime setup, or default implementation conventions under [`frontend/`](./).

### Scope Rule

- Keep frontend-local decisions here.
- Promote a decision to [`../docs/decisions.md`](../docs/decisions.md) only if it affects multiple top-level areas, the whole repository workflow, or every future agent session.
- Routine feature implementation can usually skip this file and follow [`agent-index.md`](agent-index.md) plus [`README.md`](README.md).

## Use Angular, Angular Material, and NgRx SignalStore

- Status: accepted
- Why: this stack matches existing team familiarity, supports a scalable UI architecture, and keeps the learning focused on agent workflow rather than relearning the frontend stack
- Consequence: the initial scaffold should use Angular with standalone APIs, Angular Material for the component foundation, and NgRx SignalStore for the first state layer

## Pin Node 24.14.0 With nvm

- Status: accepted
- Why: Angular's current compatibility guide supports Node `^24.0.0`, and Node `24.14.0` is a current release in that supported major line
- Consequence: the frontend app uses [`.nvmrc`](.nvmrc), and local frontend work should start with `nvm use` inside [`frontend/`](./) before installing or running Angular tooling

## Keep the Angular App Under [`frontend/`](./)

- Status: accepted
- Why: the project is intended to grow as a monolith, so the repo root should stay focused on project-level concerns while the browser app remains self-contained
- Consequence: Angular and Node files such as [`angular.json`](angular.json), [`package.json`](package.json), [`package-lock.json`](package-lock.json), [`tsconfig.json`](tsconfig.json), [`tsconfig.app.json`](tsconfig.app.json), and [`tsconfig.spec.json`](tsconfig.spec.json) live under [`frontend/`](./), while the repo root stays reserved for shared docs, GitHub config, and top-level metadata

## Organize New Frontend Work Under Feature Areas

- Status: accepted
- Why: the official [Angular Style Guide](https://angular.dev/style-guide) recommends organizing code by feature areas and grouping closely related files together, which improves discoverability for both humans and agents
- Consequence: new frontend feature work should live under [`src/app/features/`](src/app/features/), using the pattern `<feature-group>/<feature-name>/`, while app shell and bootstrap files stay under [`src/app/`](src/app/) and [`src/main.ts`](src/main.ts)
- Consequence: frontend implementation conventions are documented in [`README.md`](README.md) and agents should consult that guide before creating or restructuring frontend features
