# Repo Decisions

This file records repository-wide decisions that shape the build. Each decision can be revised later, but changes should be explicit.

### Local Decision Files

- Frontend-local decisions live in [`../frontend/decisions.md`](../frontend/decisions.md).

### Keep This File Small

- Keep a decision here only if it affects multiple top-level areas, the whole repository workflow, or every future agent session.
- Keep area-specific decisions in local decision files such as [`../frontend/decisions.md`](../frontend/decisions.md).

## Name Scoped Decision Files [`decisions.md`](decisions.md)

- Status: accepted
- Why: these files hold general project decisions, not agent-only instructions, and the shorter name is easier to scan beside local [`agent-index.md`](../agent-index.md) routing docs
- Consequence: repository-wide decisions live in [`docs/decisions.md`](decisions.md)
- Consequence: area-specific decisions should live in the nearest scoped [`decisions.md`](../frontend/decisions.md) when a separate file is useful
- Consequence: keep decision content separate from routing indexes unless the decision set grows enough to justify a dedicated catalog

## Start With Docs Before Scaffolding

- Status: accepted
- Why: the repo is new, product details are still forming, and good docs will improve every later Codex task
- Consequence: we spend the first step defining scope and workflow instead of generating code immediately

## Build a Narrow Pilot First

- Status: accepted
- Why: a small vertical slice teaches more than an oversized backlog that never ships
- Consequence: the first version focuses on counting drinks on a shared tablet before evolving into guest tabs or organizer management

## Optimize for Tablet-First Web Delivery

- Status: accepted
- Why: the first implementation is a single local-first screen and does not need native device APIs or a backend
- Consequence: we will build a browser-based tablet app and only revisit native packaging if the product later proves it is necessary

## Prefer Local-First Persistence for the Pilot

- Status: accepted
- Why: reload-safe local persistence is required for the first implementation, and it keeps the first slice simple
- Consequence: the first version will work without a backend, but it will not yet solve backups, multi-device use, or full offline behavior

## Use Codex as the Primary Builder

- Status: accepted
- Why: one of the project goals is learning agentic AI development through real implementation work
- Consequence: tasks should be written clearly enough that Codex can execute them from repo context, not only from chat memory

## Keep Open Questions Visible

- Status: accepted
- Why: unresolved decisions are normal early on, but hidden uncertainty makes implementation worse
- Consequence: product unknowns stay in the docs until we resolve them, instead of being guessed silently during build

## Prepare the Repository for Public Development

- Status: accepted
- Why: the project should be shareable as open source and useful as a portfolio piece
- Consequence: we value clean PR titles, squash-merge-friendly workflow, visible CI activity, and contributor-facing docs from the start

## Use the MIT License

- Status: accepted
- Why: it is permissive, widely understood, and includes a clear warranty and liability disclaimer
- Consequence: others can reuse the project broadly as long as the license notice is preserved

## Start With a Single English Tally Screen

- Status: accepted
- Why: the fastest useful first version is the guest-facing tally screen with no organizer area and no guest model yet
- Consequence: the initial build will focus on one screen, fixed sample drinks, English UI, and local persistence
- Consequence: later guest-identification changes should preserve the one-screen constraint when possible

## Evolve to a Single-Screen Public Tally View With Guest Tabs

- Status: accepted
- Why: the host must bill guests on departure, so anonymous totals are not accurate enough
- Why: room number and full name are the only practical trust-based identifiers available to the app today
- Why: the public shared-tablet surface should prioritize repeat guests and a clear self-entry path without breaking the one-screen model
- Supporting UX reference: [`ux/guest-tab-ux.md`](ux/guest-tab-ux.md)
- Consequence: guest identification becomes required before drinks can be recorded
- Consequence: guests are represented in local app state by room number, full name, and drink counts
- Consequence: the main screen should stay on one route and avoid interruptive modal flows, but it can expand in place to open a guest's personal tally surface
- Consequence: the default public tally view should show a prominent active guest list, a clear `Add yourself` action, and a top reference bar with drinks and display prices
- Consequence: active guests are guests with existing open tabs in the current tally
- Consequence: returning guests should select an existing tab from the active guest list instead of retyping their identity details
- Consequence: new guests should follow the `room number -> full name` path when creating a tab
- Consequence: prices are reference-only in this slice and do not yet require subtotals or checkout logic
- Consequence: future shortcuts such as QR identification and future host or admin surfaces can be explored later, but they are out of current scope

## Route Agents Through [`AGENTS.md`](../AGENTS.md) and [`agent-index.md`](../agent-index.md)

- Status: accepted
- Why: chat context is temporary, so the repository needs small, reliable entrypoints that let agents recover the right context quickly
- Consequence: agents should start with [`AGENTS.md`](../AGENTS.md) and the nearest relevant [`agent-index.md`](../agent-index.md), following links instead of scanning broad docs by default

## Load Publish Rules Only at Publish Time

- Status: accepted
- Why: branch, commit, and pull request naming conventions matter, but they should not add noise to implementation context before they are needed
- Consequence: publish-time naming rules live in [`docs/workflows/publish.md`](workflows/publish.md) and should be consulted when branching, committing, or opening or updating a pull request

## Link Repo File References in Markdown Docs

- Status: accepted
- Why: humans and agents both navigate repository context faster when file references are clickable instead of only written as inline code
- Consequence: when a markdown doc mentions a repo file or directory, it should use a markdown link to that path
- Consequence: the [`Repo Checks`](../.github/workflows/repo-checks.yml) workflow should fail when tracked markdown files mention repo files or directories without using markdown links

## Keep Research Briefs Under [`docs/research/`](research/)

- Status: accepted
- Why: research findings often support more than one task and stay more useful when they are stored as reusable docs instead of being buried inside task history
- Consequence: research briefs live under [`docs/research/`](research/) with a small routing index at [`docs/research/agent-index.md`](research/agent-index.md)
- Consequence: keep the research folder flat for now and use topic-based filenames so multiple tasks can link to the same brief
- Consequence: research briefs do not need a `Status` section unless a future workflow explicitly requires one
- Consequence: task files should link to the relevant research brief from `Related docs` instead of embedding `Research Notes` sections

## Use Penpot as the Primary Design Workspace

- Status: accepted
- Why: the project needs a browser-accessible design tool that non-editors can review easily, that agents can translate into implementation with minimal handoff loss, and that a small open-source project can adopt without committing to paid seats too early
- Consequence: use Penpot as the default place for screen flows, clickable prototypes, and design review links
- Consequence: keep Figma as the fallback option when Penpot blocks progress or when prompt-driven generation becomes more valuable than openness and inspectability
- Consequence: keep Storybook as a later complementary layer for implementation-adjacent component documentation, not as the primary screen-design workspace
- Consequence: keep the repo-native Penpot workflow, briefs, and committed design artifacts together under [`design/`](design/) so design context stays inside the docs tree
- Consequence: pair each Penpot task with a short repo-native markdown brief and a committed SVG artifact under [`design/`](design/) so humans and AI agents can inspect the target flow without relying on a live Penpot tab
- Consequence: prefer SVG as the committed design artifact because it is browser-viewable, readable by Codex, and text-diffable in Git history
- Consequence: do not commit PNG design previews to the repo; SVG is sufficient for public display and avoids binary churn in Git
- Consequence: keep Penpot share links optional for interactive review or prototype testing instead of treating them as required repo metadata
- Consequence: if direct Penpot access is not practical for a given task, continue from the committed repo artifact and brief before switching tools by default

## Keep a Reusable Design Foundation Board

- Status: accepted
- Why: future screen work will move faster and stay more consistent if colors, typography, icon direction, and component tone already exist as a shared baseline instead of being re-invented task by task
- Consequence: keep the reusable foundation brief and SVG directly in [`docs/design/foundations/`](design/foundations/)
- Consequence: start new Penpot screen work from the calmer custom mobile-first direction recorded in [`docs/design/foundations/README.md`](design/foundations/README.md)
- Consequence: scale tablet layouts from that shared mobile-first baseline instead of treating tablet as a separate foundation
- Consequence: update the foundation artifact and brief when a future design task changes the system itself, not just one screen
