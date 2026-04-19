# Repo Decisions

This file records repository-wide decisions that shape the build. Each decision can be revised later, but changes should be explicit.

### Local Decision Files

- Frontend-local decisions live in [`../frontend/decisions.md`](../frontend/decisions.md).

### Keep This File Small

- Keep a decision here only if it affects multiple top-level areas, the whole repository workflow, or every future agent session.
- Keep area-specific decisions in local decision files such as [`../frontend/decisions.md`](../frontend/decisions.md).

## Name Scoped Decision Files [`decisions.md`](decisions.md)

- Status: accepted
- Why: these files hold general project decisions, not agent-only instructions, and the shorter name is easier to scan beside area-local [`AGENTS.md`](../frontend/AGENTS.md) or [`README.md`](../frontend/README.md) guidance
- Consequence: repository-wide decisions live in [`docs/decisions.md`](decisions.md)
- Consequence: area-specific decisions should live in the nearest scoped [`decisions.md`](../frontend/decisions.md) when a separate file is useful
- Consequence: keep decision content separate from instruction files and README-style navigation unless the decision set grows enough to justify a dedicated catalog

## Start With Docs Before Scaffolding

- Status: accepted
- Why: the repo is new, product details are still forming, and good docs will improve every later Codex task
- Consequence: we spend the first step defining scope and workflow instead of generating code immediately

## Build a Narrow Pilot First

- Status: accepted
- Why: a small vertical slice teaches more than an oversized backlog that never ships
- Consequence: the current pilot focuses on a host-operated room-name-order-billing workflow on a shared tablet
- Consequence: public guest self-service remains deferred until the host workflow is solid

## Grow the App as a Modular Monolith With Explicit Capability Boundaries

- Status: accepted
- Why: the pilot still fits comfortably in one deployable app, but we want boundaries that remain understandable for both humans and AI agents as the codebase grows
- Consequence: keep one Angular app under [`../frontend/`](../frontend/) rather than splitting into services or packages prematurely
- Consequence: organize durable business capabilities into explicit internal modules such as order entry, guest tabs, catalog, billing history, and sync or recovery
- Consequence: prefer small public APIs between capabilities over direct imports into another feature's internal files
- Consequence: use [`ARCHITECTURE.md`](../ARCHITECTURE.md) as the repository-level map for those boundaries

## Use Logical Layers Inside Features Without Replacing Feature-First Structure

- Status: accepted
- Why: feature-first ownership keeps the repository navigable, but growing features still need a clear way to separate screen wiring, orchestration, infrastructure boundaries, and pure business rules
- Consequence: keep top-level structure feature-first, and use subfolders for real subfeatures or clearly owned internal areas instead of default layer folders
- Consequence: use the logical layer names `presentation`, `application`, `adapters`, and `domain` inside one feature or subfeature
- Consequence: do not create `presentation/`, `application/`, `adapters/`, or `domain/` folders as a repository convention
- Consequence: keep the general dependency rules in [`architecture/layering.md`](architecture/layering.md), and keep concrete naming examples in the nearest area-specific docs
- Consequence: treat a feature-root `index.ts` as that feature's public API rather than as a shortcut for internal imports

## Keep a Repo-Native Architecture Map and Glossary

- Status: accepted
- Why: stable architecture and vocabulary should live in the repository so future prompts do not depend on chat memory or reverse-engineering the current implementation
- Consequence: keep the current target structure in [`ARCHITECTURE.md`](../ARCHITECTURE.md)
- Consequence: keep stable domain and architecture terms in [`glossary.md`](glossary.md)
- Consequence: update those docs when durable boundaries, ownership rules, or vocabulary change

## Link First Mentions of Glossary Terms

- Status: accepted
- Why: humans and agents both understand project-specific language faster when a term points directly to its canonical definition
- Consequence: keep glossary entries as direct-linkable headings in [`glossary.md`](glossary.md)
- Consequence: when a markdown doc introduces or relies on a glossary-defined term, link the first meaningful mention to that glossary entry
- Consequence: avoid linking every repetition of the same term so docs stay readable

## Optimize for Tablet-First Web Delivery

- Status: accepted
- Why: the pilot should run well on a shared or dedicated host tablet without requiring native packaging first
- Consequence: we will build a browser-based tablet app and only revisit native packaging if the product later proves it is necessary

## Prefer Local-First Persistence for the Pilot

- Status: accepted
- Why: immediate local saves keep the host working during service and remain the simplest trustworthy first persistence layer
- Consequence: the app should still write locally first, even after remote recovery is added
- Consequence: local-only persistence is no longer enough for the target pilot because it does not solve reinstall or replacement-device recovery

## Ship the Pilot as a PWA With Offline Behavior

- Status: accepted
- Why: the host needs the app to stay usable when connectivity drops and to feel installable on a tablet
- Consequence: the frontend should evolve into a Progressive Web App with offline shell behavior
- Consequence: offline behavior should preserve core host workflows instead of degrading into a blank or unusable state
- Consequence: PWA work does not replace remote recovery or sync; it complements it

## Require Remote Recovery Beyond Same-Device Persistence

- Status: accepted
- Why: the tablet may break, be stolen, or be reinstalled, so same-device local storage is not enough
- Supporting research: [`research/remote-persistence-options.md`](research/remote-persistence-options.md)
- Consequence: the product now requires a simple remote recovery path in addition to local-first persistence
- Consequence: the exact backend remains open until a short evaluation task resolves the setup, conflict, and recovery tradeoffs
- Consequence: Google Sheets can still be considered for backup or export, but it is not assumed to be the primary sync engine

## Use Codex as the Primary Builder

- Status: accepted
- Why: one of the project goals is learning agentic AI development through real implementation work
- Consequence: tasks should be written clearly enough that Codex can execute them from repo context, not only from chat memory

## Keep ExecPlans in [`PLANS.md`](../PLANS.md) and [`plans/`](plans/)

- Status: accepted
- Why: complex work benefits from a living, self-contained plan, but loading long-form plans by default would add noise to ordinary task execution
- Consequence: repository-wide ExecPlan rules and the project plan index live in [`../PLANS.md`](../PLANS.md)
- Consequence: individual plan files live under [`plans/`](plans/) with short, action-oriented kebab-case filenames
- Consequence: task briefs should link relevant plans from `Related docs` instead of copying the full plan into the task file
- Consequence: agents should open plan files only when explicitly asked or when a linked plan provides needed implementation context

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

## Keep the Pilot on One English Host-Operated Order Entry Screen

- Status: accepted
- Why: the pilot should stay easy to learn and efficient to use on a tablet during real service
- Consequence: the target product should center on one main order entry screen, English UI, and minimal navigation
- Consequence: supporting tools such as room setup, billing history, or catalog editing should stay easy to reach from that main working surface without crowding the order-taking path
- Consequence: a broader overview screen can come later, but it remains deferred until the order-entry workflow is stable

## Shift the Pilot to a Host-Operated Order Entry Screen

- Status: accepted
- Why: the host, not the guest, is now the primary user we need to optimize for
- Why: host-side order entry, product management, and billing match the real operating model better than public self-service on a shared tablet
- Supporting UX reference: [`ux/host-workflow-ux.md`](ux/host-workflow-ux.md)
- Deferred future UX: [`ux/guest-tab-ux.md`](ux/guest-tab-ux.md)
- Consequence: the main accessible product surface should become a host-operated order entry route and working screen
- Consequence: room number and full name remain the practical trust-based guest identifiers in the pilot
- Consequence: room selection should come from a fixed host-managed room list before guest selection and order entry
- Consequence: the host workflow should support quick guest lookup or creation, order entry, and billing from one primary screen
- Consequence: the first order-entry iteration may keep room setup, catalog management, and billing on the host tools screen while the main route focuses on fast order taking
- Consequence: live product management and billed history remain in scope because they directly support the host workflow
- Consequence: a future overview screen remains deferred until the order-entry screen is solid
- Consequence: the public guest tally flow is now future consideration only and should not stay part of the active pilot surface

## Route Agents Through [`AGENTS.md`](../AGENTS.md), [`frontend/AGENTS.md`](../frontend/AGENTS.md), and Source-of-Truth Docs

- Status: accepted
- Why: chat context is temporary, so the repository needs small, reliable entrypoints that let agents recover the right context quickly without maintaining a parallel tree of routing-only docs
- Consequence: agents should start with [`AGENTS.md`](../AGENTS.md), use [`frontend/AGENTS.md`](../frontend/AGENTS.md) for frontend work, and load the smallest relevant source docs instead of scanning broad context by default
- Consequence: ordinary docs such as [`docs/tasks.md`](tasks.md), [`docs/tasks/README.md`](tasks/README.md), [`frontend/README.md`](../frontend/README.md), and [`docs/design/README.md`](design/README.md) carry the durable navigation layer

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
- Consequence: research briefs live under [`docs/research/`](research/) in a flat, topic-based layout
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
