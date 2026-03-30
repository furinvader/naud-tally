# Task Backlog

This backlog is intentionally ordered around learning and shipping a usable pilot. Scaffolding is listed, but not started yet.

## Current Status

- Documentation foundation: done
- Open-source repo basics: done
- Open-source license: done
- Product details: partially defined
- Technical stack: not chosen
- App scaffold: not started
- UI implementation: not started

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

Questions to answer:

- What drinks should be included?
- What should the organizer be able to do besides reset and export?
- Is this for one event at a time?
- Does the app need offline behavior beyond simple local persistence?

Done when:

- the open questions in `docs/product.md` are either answered or intentionally deferred

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

### T-003: Define the First Vertical Slice

Goal:
Describe the exact first buildable screen and its acceptance criteria.

Candidate slice:

- a single guest-facing screen
- fixed drink cards
- increment and decrement controls
- visible totals
- persistence after reload

Done when:

- the first implementation prompt can be written without ambiguity

## Later Tasks

### T-004: Scaffold the App

Not started on purpose. This begins only after the pilot rules and stack are clear.

### T-005: Build the Guest Tally Screen

Target outcome:

- guests can quickly record drinks on a tablet

### T-006: Add Organizer Controls

Target outcome:

- organizer can reset and export the tally safely

### T-007: Test the Pilot in a Real Usage Scenario

Target outcome:

- validate whether guests understand the flow without explanation

## Parking Lot

These ideas are intentionally deferred until the pilot proves useful:

- multiple simultaneous tablets
- named events
- authentication
- reports and dashboards
- inventory management
- integration with payment or POS systems
