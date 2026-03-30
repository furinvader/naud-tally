# Decision Log

This file records decisions that shape the build. Each decision can be revised later, but changes should be explicit.

## D-001: Start With Docs Before Scaffolding

- Status: accepted
- Why: the repo is new, product details are still forming, and good docs will improve every later Codex task
- Consequence: we spend the first step defining scope and workflow instead of generating code immediately

## D-002: Build a Narrow Pilot First

- Status: accepted
- Why: a small vertical slice teaches more than an oversized backlog that never ships
- Consequence: the first version focuses on counting drinks on a shared tablet, not broader event management

## D-003: Optimize for Tablet-First Web Delivery

- Status: proposed
- Why: a web app is likely the fastest path to a usable pilot and keeps the learning transferable
- Consequence: we should evaluate a browser-based app with responsive tablet UI before considering native options

## D-004: Prefer Local-First Persistence for the Pilot

- Status: proposed
- Why: it reduces complexity and lets us validate the core interaction before adding servers or sync
- Consequence: the first version may have limitations around backups, multi-device use, and shared real-time updates

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
