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

## Grow Larger Frontend Areas as Capability Modules Inside One App

- Status: accepted
- Why: feature-first folders work well at the current size, but the host workflow will accumulate multiple business capabilities that should not collapse into one oversized route feature or store
- Consequence: keep the frontend as one Angular app under [`./`](./)
- Consequence: use route-level composition features for major screens such as the future host workspace, and separate durable capabilities such as guest tabs, catalog, billing history, and sync or recovery into sibling feature areas under [`src/app/features/`](src/app/features/)
- Consequence: when a feature area grows, expose a small public API or facade rather than letting other features import internal stores or helpers directly
- Consequence: follow the module map in [`../docs/architecture.md`](../docs/architecture.md) when restructuring or adding new large feature areas

## Separate Persistent Business State From Transient Screen State

- Status: accepted
- Why: the current pilot already has state that should survive reloads and other state that only exists to support one route interaction flow, and mixing those concerns makes later refactors harder
- Consequence: persistent business state such as guest tabs, catalog items, billed history, and sync metadata should live with the capability that owns the business concept
- Consequence: transient route state such as selected guest, draft inputs, and local flash messages should stay with the route composition feature that owns the screen interaction
- Consequence: feature stores should avoid accumulating route-only view state just because it is convenient in the short term

## Keep Storage and Remote IO Behind Data Adapters

- Status: accepted
- Why: local-first persistence and later remote recovery will stay easier to reason about if storage details are isolated from route composition code and domain rules
- Consequence: browser persistence should live behind repositories or equivalent data adapters inside the owning feature area
- Consequence: route features, components, and pure domain-rule files should not call browser storage APIs directly
- Consequence: remote sync clients should sit behind the same capability boundary instead of being called from route components

## Use App-Owned `--nt-*` CSS Variables as the Theme Contract

- Status: accepted
- Why: Angular Material provides the component theming engine, but the project still needs a stable theme contract that we own instead of coupling repo-authored styles to Angular Material variable names
- Consequence: app-wide theme tokens use the `--nt-*` prefix
- Consequence: shared theme tokens remain global and may be consumed directly inside component styles
- Consequence: [`src/styles/`](src/styles/) is reserved for globally applied styles, theme partials, and shared tokens, while feature-owned styling stays next to the owning component or feature
- Consequence: component-local override hooks use the `--nt-<component>-*` pattern
- Consequence: parent-facing component custom properties should be consumed inline with fallback to shared theme tokens and local literals, instead of being redefined on `:host`
- Consequence: repo-authored styles should prefer shared theme tokens and Angular Material overrides over one-off local visual values
- Consequence: repo-authored app and component styles should not read Angular Material `--mat-*` variables directly

## Keep Cross-Feature Shared UI Under [`src/app/ui/`](src/app/ui/)

- Status: accepted
- Why: the tablet shell, app bar, and scroll behavior now span multiple routes, so keeping them under feature folders would duplicate route chrome and viewport rules
- Consequence: cross-feature shared presentation and layout primitives live under [`src/app/ui/`](src/app/ui/)
- Consequence: shared UI should stay state-light and feature-agnostic, with content projection and small input APIs preferred over broad configurable wrappers
- Consequence: feature-owned business panels remain in their feature folders until a second consumer or a clearly foundational need appears
- Consequence: the shared UI layer owns the default tablet viewport contract, including preferring owned scroll regions over browser-page scrolling when practical
