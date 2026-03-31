# Decision Log

This file records decisions that shape the build. Each decision can be revised later, but changes should be explicit.

## D-001: Start With Docs Before Scaffolding

- Status: accepted
- Why: the repo is new, product details are still forming, and good docs will improve every later Codex task
- Consequence: we spend the first step defining scope and workflow instead of generating code immediately

## D-002: Build a Narrow Pilot First

- Status: accepted
- Why: a small vertical slice teaches more than an oversized backlog that never ships
- Consequence: the first version focuses on counting drinks on a shared tablet, not broader guest or organizer management

## D-003: Optimize for Tablet-First Web Delivery

- Status: accepted
- Why: the first implementation is a single local-first screen and does not need native device APIs or a backend
- Consequence: we will build a browser-based tablet app and only revisit native packaging if the product later proves it is necessary

## D-004: Prefer Local-First Persistence for the Pilot

- Status: accepted
- Why: reload-safe local persistence is required for the first implementation, and it keeps the first slice simple
- Consequence: the first version will work without a backend, but it will not yet solve backups, multi-device use, or full offline behavior

## D-005: Use Codex as the Primary Builder

- Status: accepted
- Why: one of the project goals is learning agentic AI development through real implementation work
- Consequence: tasks should be written clearly enough that Codex can execute them from repo context, not only from chat memory

## D-006: Keep Open Questions Visible

- Status: accepted
- Why: unresolved decisions are normal early on, but hidden uncertainty makes implementation worse
- Consequence: product unknowns stay in the docs until we resolve them, instead of being guessed silently during build

## D-007: Prepare the Repository for Public Development

- Status: accepted
- Why: the project should be shareable as open source and useful as a portfolio piece
- Consequence: we value clean PR titles, squash-merge-friendly workflow, visible CI activity, and contributor-facing docs from the start

## D-008: Use the MIT License

- Status: accepted
- Why: it is permissive, widely understood, and includes a clear warranty and liability disclaimer
- Consequence: others can reuse the project broadly as long as the license notice is preserved

## D-009: Start With a Single English Tally Screen

- Status: accepted
- Why: the fastest useful first version is the guest-facing tally screen with no organizer area and no guest model yet
- Consequence: the initial build will focus on one screen, fixed sample drinks, English UI, and local persistence

## D-010: Use Angular, Angular Material, and NgRx SignalStore

- Status: accepted
- Why: this stack matches existing team familiarity, supports a scalable UI architecture, and keeps the learning focused on agent workflow rather than relearning the frontend stack
- Consequence: the initial scaffold should use Angular with standalone APIs, Angular Material for the component foundation, and NgRx SignalStore for the first state layer

## D-011: Pin Node 24.14.0 With nvm

- Status: accepted
- Why: Angular's current compatibility guide supports Node `^24.0.0`, and Node `24.14.0` is a current release in that supported major line
- Consequence: the repo uses [`.nvmrc`](../.nvmrc), and local work should start with `nvm use` before installing or running Angular tooling

## D-012: Keep the Angular App Under [`frontend/`](../frontend/)

- Status: accepted
- Why: the project is intended to grow as a monolith, so the repo root should stay focused on project-level concerns while the browser app remains self-contained
- Consequence: Angular and Node files such as [`frontend/angular.json`](../frontend/angular.json), [`frontend/package.json`](../frontend/package.json), [`frontend/package-lock.json`](../frontend/package-lock.json), [`frontend/tsconfig.json`](../frontend/tsconfig.json), [`frontend/tsconfig.app.json`](../frontend/tsconfig.app.json), and [`frontend/tsconfig.spec.json`](../frontend/tsconfig.spec.json) live under [`frontend/`](../frontend/), while the repo root stays reserved for shared docs, GitHub config, and top-level metadata

## D-013: Route Agents Through [`AGENTS.md`](../AGENTS.md) and [`agent-index.md`](../agent-index.md)

- Status: accepted
- Why: chat context is temporary, so the repository needs small, reliable entrypoints that let agents recover the right context quickly
- Consequence: agents should start with [`AGENTS.md`](../AGENTS.md) and the nearest relevant [`agent-index.md`](../agent-index.md), following links instead of scanning broad docs by default

## D-014: Load Publish Rules Only at Publish Time

- Status: accepted
- Why: branch, commit, and pull request naming conventions matter, but they should not add noise to implementation context before they are needed
- Consequence: publish-time naming rules live in [`docs/workflows/publish.md`](workflows/publish.md) and should be consulted when branching, committing, or opening or updating a pull request

## D-015: Link Repo File References in Markdown Docs

- Status: accepted
- Why: humans and agents both navigate repository context faster when file references are clickable instead of only written as inline code
- Consequence: when a markdown doc mentions a repo file or directory, it should use a markdown link to that path

## D-016: Organize New Frontend Work Under Feature Areas

- Status: accepted
- Why: the official [Angular Style Guide](https://angular.dev/style-guide) recommends organizing code by feature areas and grouping closely related files together, which improves discoverability for both humans and agents
- Consequence: new frontend feature work should live under [`frontend/src/app/features/`](../frontend/src/app/features/), using the pattern `<feature-group>/<feature-name>/`, while app shell and bootstrap files stay under [`frontend/src/app/`](../frontend/src/app/) and [`frontend/src/main.ts`](../frontend/src/main.ts)
- Consequence: frontend implementation conventions are documented in [`frontend/README.md`](../frontend/README.md) and agents should consult that guide before creating or restructuring frontend features
