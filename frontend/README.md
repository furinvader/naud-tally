# Frontend Guide

This guide explains how frontend work should be structured in this repository.

It adapts the official [Angular Style Guide](https://angular.dev/style-guide) to this project so humans and agents can implement features consistently.

## Runtime Setup

- The frontend Node version is pinned in [`.nvmrc`](.nvmrc).
- Before running `npm` or `ng` commands in a new shell session, run `nvm use` from [`frontend/`](./).
- Reuse the same shell session for multiple frontend commands when possible.
- Use [`npm run check:import-boundaries`](scripts/check-import-boundaries.mjs) for a focused module-boundary check, or run [`npm run build`](package.json) to execute that check before the Angular production build.

## Current Frontend Layout

- The Angular app entry point lives in [`src/main.ts`](src/main.ts).
- Frontend-specific Node tooling is pinned in [`.nvmrc`](.nvmrc).
- App-level wiring stays in [`src/app/app.ts`](src/app/app.ts), [`src/app/app.html`](src/app/app.html), [`src/app/app.scss`](src/app/app.scss), [`src/app/app.routes.ts`](src/app/app.routes.ts), and [`src/app/app.config.ts`](src/app/app.config.ts).
- Cross-feature shared presentation and layout primitives live under [`src/app/ui/`](src/app/ui/).
- The route-level order-entry composition root lives in [`src/app/features/order-entry/`](src/app/features/order-entry/).
- [`src/app/features/order-entry/order-entry.store.ts`](src/app/features/order-entry/order-entry.store.ts) owns transient order-entry screen state such as the selected guest, add-guest draft inputs, and inactivity clearing.
- Durable guest tabs, catalog entries, and billed history now live under [`src/app/features/guest-tabs/`](src/app/features/guest-tabs/), [`src/app/features/catalog/`](src/app/features/catalog/), and [`src/app/features/billing-history/`](src/app/features/billing-history/), with adjacent `*.repository.ts` files owning browser persistence.
- The current tally screen implementation lives in [`src/app/features/drink-tally/`](src/app/features/drink-tally/) as a presentational surface composed by the order-entry feature.
- The target architecture for the next iterations is recorded in [`../docs/architecture.md`](../docs/architecture.md).
- Global styles stay in [`src/styles.scss`](src/styles.scss).
- New feature work should follow the feature structure below.

## Feature Implementation

### Feature Areas

- Put new feature code under [`src/app/features/`](src/app/features/).
- Put cross-feature reusable presentation and layout primitives under [`src/app/ui/`](src/app/ui/).
- Organize features by feature area, not by technical type.
- Keep top-level feature paths flat under [`src/app/features/`](src/app/features/), using one directory per feature such as `order-entry/` or `billing-history/`.
- Keep app shell and bootstrap files in [`src/app/`](src/app/) and [`src/main.ts`](src/main.ts), not inside feature folders.

### Scaling a Feature Area

- When one route or screen starts owning several business concepts, keep the route feature as a composition root and split durable capabilities into sibling feature areas instead of growing one giant store.
- Route composition features should own screen assembly and transient route state.
- Capability features should own persistent business state, domain rules, and data adapters.
- When a capability grows beyond a few closely related files, it may use clearer sub-areas or role-specific files such as `*.facade.ts`, `*.repository.ts`, or `*.model.ts`.
- Follow [`../docs/architecture.md`](../docs/architecture.md) for the target module map and ownership model before restructuring a larger area.

### Public APIs Between Features

- If one feature needs another feature's behavior, prefer a small public API or facade file owned by the providing feature.
- For top-level features under [`src/app/features/`](src/app/features/), publish that cross-feature surface from the feature root, typically through an [`index.ts`](src/app/features/catalog/index.ts) entrypoint.
- Import the feature directory path instead of a deep file path when consuming another feature.
- Do not deep-import another feature's internal store, helper, or implementation file by default.
- If a reusable cross-feature API is missing, create it in the owning feature instead of bypassing the boundary.
- [`scripts/check-import-boundaries.mjs`](scripts/check-import-boundaries.mjs) enforces this rule for local validation and CI: app-shell files may import feature roots only, feature-to-feature imports may cross boundaries only through the target feature root, and shared UI may not import feature-owned code.
- Temporary exceptions are off by default. If a migration truly needs one, add a single explicit allowlist entry in [`scripts/check-import-boundaries.mjs`](scripts/check-import-boundaries.mjs) with the task that will remove it.

### Shared UI

- Use [`src/app/ui/`](src/app/ui/) only for app-wide reusable presentation and layout primitives.
- Keep shared UI state-light and feature-agnostic.
- Prefer content projection and a small input surface over large configurable wrappers.
- Do not inject feature stores or feature-specific copy into shared UI primitives.
- Leave business panels in their feature folders until a second consumer or a clearly foundational need appears.

### Feature File Shape

- Give each feature its own directory.
- Use one consistent base name for the primary feature files: `<feature-name>.ts`, `<feature-name>.html`, `<feature-name>.scss`, and `<feature-name>.spec.ts`.
- Add role-specific files only when they clarify intent, such as `<feature-name>.routes.ts`, `<feature-name>.store.ts`, `<feature-name>.service.ts`, or `<feature-name>.model.ts`.
- Keep tests next to the code they cover.

### Naming Rules

- Separate words in file names with hyphens.
- Match file names to what they represent.
- Use the same base name across related files in one feature.
- Prefer descriptive names over vague names like `helpers`, `utils`, or `common`.

### CSS Class Naming

- Prefer semantic, component-scoped class names that describe the UI concept, not raw presentation or tag names.
- When a class names a clear part of that concept, prefer a BEM-inspired element form: `<block>__<element>`.
- When a class names a state or variant, prefer a modifier form: `<block>--<modifier>`.
- Do not force strict BEM when it hurts readability. If an inner area reads more clearly as its own concept, give it its own block name instead of forcing it under the parent block.
- Small local helper names are fine when Angular component scoping keeps them clear and they improve readability.
- Prefer this pattern when it makes templates and stylesheets easier for humans and agents to scan together.

### Structure Rules

- Group closely related files together in the same directory.
- Keep one concept per file whenever practical.
- Avoid type-based top-level folders such as `components/`, `services/`, or `directives/` inside feature areas.
- The exception is [`src/app/ui/`](src/app/ui/) for truly cross-feature shared presentation and layout primitives.
- If a feature directory starts to collect too many files, add clear subdirectories inside that feature instead of adding another grouping layer above the feature itself.

### Component and Logic Rules

- Keep components focused on presentation and page interaction.
- Move reusable or non-UI logic into nearby store, service, model, or helper files inside the same feature area.
- Keep template logic straightforward. If a template expression starts getting complex, move that logic into TypeScript, usually with a computed value or method.
- Prefer `inject()` over constructor injection.
- Use `protected` for class members that are only read by the template.
- Use `readonly` for Angular-managed properties that should not be reassigned.
- Prefer `class` and `style` bindings over `ngClass` and `ngStyle`.
- Name event handlers for what they do, not for the triggering event.

### State and Persistence Rules

- Keep persistent business state with the capability that owns the business concept.
- Keep transient screen state near the route composition feature that owns that interaction flow.
- In the current pilot, [`src/app/features/order-entry/order-entry.store.ts`](src/app/features/order-entry/order-entry.store.ts) owns selection and draft-entry state, while [`src/app/features/guest-tabs/guest-tabs.store.ts`](src/app/features/guest-tabs/guest-tabs.store.ts), [`src/app/features/catalog/catalog.store.ts`](src/app/features/catalog/catalog.store.ts), and [`src/app/features/billing-history/billing-history.store.ts`](src/app/features/billing-history/billing-history.store.ts) own durable business data and delegate browser persistence to their adjacent repository files.
- Do not call browser storage APIs directly from route components or route composition stores.
- Put serialization, hydration, and storage access in repositories or equivalent data adapters inside the owning feature area.

### Styling and Theme Rules

- Keep the shared theme in [`src/styles.scss`](src/styles.scss) and any imported global theme partials.
- Keep feature-specific styles in the feature or component stylesheet that owns them.
- Treat [`src/styles/`](src/styles/) as global-only: theme files, tokens, and styles that intentionally apply across the app.
- Use app-owned `--nt-*` tokens as the only repo-authored CSS variable contract.
- Shared theme tokens stay global and may be consumed directly in component styles.
- If a component needs a parent-facing override hook, prefix it `--nt-<component>-*` and use it inline at the declaration site with fallback to a shared theme token and a component-owned literal default.
- Do not redefine parent-facing component custom properties on `:host`, because that blocks inherited overrides from parent components.
- Prefer Angular Material theme and component overrides before adding one-off component colors, radii, shadows, or typography values.
- Do not read Angular Material `--mat-*` variables directly in repo-authored app or component styles.

## When To Update This Guide

- Update this file if the frontend directory shape changes.
- Update this file if the project adopts additional Angular conventions that should be followed by default.
- If the change affects frontend-local architecture, tooling, or conventions, also update [`decisions.md`](decisions.md).
- If the change affects a repo-wide decision, also update [`../docs/decisions.md`](../docs/decisions.md).
