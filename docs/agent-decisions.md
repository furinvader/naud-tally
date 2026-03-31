# Repo Agent Decisions

This file records repository-wide decisions that shape the build. Each decision can be revised later, but changes should be explicit.

## Local Decision Files

- Frontend-local decisions live in [`../frontend/agent-decisions.md`](../frontend/agent-decisions.md).

## Keep This File Small

- Keep a decision here only if it affects multiple top-level areas, the whole repository workflow, or every future agent session.
- Keep area-specific decisions in local decision files such as [`../frontend/agent-decisions.md`](../frontend/agent-decisions.md).

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
