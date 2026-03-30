# Task Backlog

This backlog is intentionally ordered around learning and shipping a usable pilot. The Angular scaffold is now in place, and the next implementation step is the guest tally screen.

## Current Status

- Documentation foundation: done
- Open-source repo basics: done
- Open-source license: done
- Pilot rules: confirmed for the first implementation
- First vertical slice: defined at the product level
- Technical stack: chosen
- App scaffold: done
- UI implementation: not started beyond the scaffold placeholder

## Next Tasks

### T-000: Choose the Open-Source License

Goal:
Pick the license before the repository is published publicly.

Done when:

- a license is chosen and added to the repo
- the choice is recorded in `docs/decisions.md`

Status:

- done, using `MIT`

### T-001: Confirm Pilot Rules

Goal:
Lock down the minimum product behavior before choosing a stack.

Done when:

- the open questions in `docs/product.md` are either answered or intentionally deferred

Status:

- done

Outcome:

- the first implementation is a single tally screen
- the drink list is fixed for now using sample drinks
- there is no guest model yet
- the UI is English-only for now, with future i18n kept in mind
- reload-safe local persistence is required
- organizer functionality is deferred to a later task

### T-002: Choose the Initial Stack

Goal:
Pick the simplest stack that supports a tablet-friendly UI and a smooth Codex workflow.

Decision criteria:

- easy to scaffold
- easy to run locally
- good fit for touch-first UI
- easy to extend later if the pilot works
- teaches patterns that transfer to future AI-assisted projects

Done when:

- the chosen stack and rationale are added to `docs/decisions.md`

Status:

- done

Outcome:

- use `Angular` for the application framework
- use `Angular Material` for the component and theming foundation
- use `NgRx SignalStore` for the first state management layer
- keep the first build client-side and local-first
- use `npm` as the package manager
- pin `Node 24.14.0` via `.nvmrc`

### T-003: Define the First Vertical Slice

Goal:
Describe the exact first buildable screen and its acceptance criteria.

Defined slice:

- a single guest-facing screen
- fixed sample drink cards
- increment and decrement controls
- visible per-drink counts
- visible total count
- persistence after reload
- English UI text

Done when:

- the first implementation prompt can be written without ambiguity

Status:

- done at the product-definition level

## Later Tasks

### T-004: Scaffold the App

Goal:
Create the initial Angular app scaffold using the chosen stack.

Target outcome:

- an Angular app exists in the repo
- Angular Material is installed and configured
- NgRx SignalStore is available for the first feature state
- `npm start` runs the app locally
- `npm run build` produces a production build
- `npm test` runs the default unit-test setup

Status:

- done

Outcome:

- Angular 21 standalone app scaffolded in the repo
- Angular Material installed and configured
- `@ngrx/signals` installed for the first state layer
- `.nvmrc` works with `nvm use`
- `npm start`, `npm run build`, and `npm test` are now valid project commands

### T-005: Build the Guest Tally Screen

Target outcome:

- guests can quickly record drinks on a tablet

### T-006: Add Organizer Controls

Target outcome:

- organizer can reset and export the tally safely

### T-008: Add i18n Support

Target outcome:

- the UI supports multiple languages starting from the English-first structure

### T-009: Introduce Guest-Based Tracking

Target outcome:

- the app can move beyond a single shared tally and attach counts to guests

### T-007: Test the Pilot in a Real Usage Scenario

Target outcome:

- validate whether guests understand the flow without explanation

## Parking Lot

These ideas are intentionally deferred until the pilot proves useful:

- multiple simultaneous tablets
- authentication
- reports and dashboards
- inventory management
- integration with payment or POS systems
