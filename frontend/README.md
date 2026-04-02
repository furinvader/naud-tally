# Frontend Guide

This guide explains how frontend work should be structured in this repository.

It adapts the official [Angular Style Guide](https://angular.dev/style-guide) to this project so humans and agents can implement features consistently.

## Runtime Setup

- The frontend Node version is pinned in [`.nvmrc`](.nvmrc).
- Before running `npm` or `ng` commands in a new shell session, run `nvm use` from [`frontend/`](./).
- Reuse the same shell session for multiple frontend commands when possible.

## Current Frontend Layout

- The Angular app entry point lives in [`src/main.ts`](src/main.ts).
- Frontend-specific Node tooling is pinned in [`.nvmrc`](.nvmrc).
- App-level wiring stays in [`src/app/app.ts`](src/app/app.ts), [`src/app/app.html`](src/app/app.html), [`src/app/app.scss`](src/app/app.scss), [`src/app/app.routes.ts`](src/app/app.routes.ts), and [`src/app/app.config.ts`](src/app/app.config.ts).
- The current drink tally feature lives in [`src/app/features/tally/drink-tally/`](src/app/features/tally/drink-tally/).
- Global styles stay in [`src/styles.scss`](src/styles.scss).
- New feature work should follow the feature structure below.

## Feature Implementation

### Feature Areas

- Put new feature code under [`src/app/features/`](src/app/features/).
- Organize features by feature area, not by technical type.
- Use the directory pattern `<feature-group>/<feature-name>/` under [`src/app/features/`](src/app/features/).
- Keep app shell and bootstrap files in [`src/app/`](src/app/) and [`src/main.ts`](src/main.ts), not inside feature folders.

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

### Structure Rules

- Group closely related files together in the same directory.
- Keep one concept per file whenever practical.
- Avoid type-based top-level folders such as `components/`, `services/`, or `directives/`.
- If a directory starts to collect too many files, split it into clearer feature subdirectories instead of flattening more into one place.

### Component and Logic Rules

- Keep components focused on presentation and page interaction.
- Move reusable or non-UI logic into nearby store, service, model, or helper files inside the same feature area.
- Keep template logic straightforward. If a template expression starts getting complex, move that logic into TypeScript, usually with a computed value or method.
- Prefer `inject()` over constructor injection.
- Use `protected` for class members that are only read by the template.
- Use `readonly` for Angular-managed properties that should not be reassigned.
- Prefer `class` and `style` bindings over `ngClass` and `ngStyle`.
- Name event handlers for what they do, not for the triggering event.

### Styling and Theme Rules

- Keep the shared theme in [`src/styles.scss`](src/styles.scss) and any imported global theme partials.
- Use app-owned `--nt-*` tokens as the only repo-authored CSS variable contract.
- If a component needs local custom properties, prefix them `--nt-<component>-*`.
- Prefer Angular Material theme and component overrides before adding one-off component colors, radii, shadows, or typography values.
- Do not read Angular Material `--mat-*` variables directly in repo-authored app or component styles.

## When To Update This Guide

- Update this file if the frontend directory shape changes.
- Update this file if the project adopts additional Angular conventions that should be followed by default.
- If the change affects frontend-local architecture, tooling, or conventions, also update [`decisions.md`](decisions.md).
- If the change affects a repo-wide decision, also update [`../docs/decisions.md`](../docs/decisions.md).
