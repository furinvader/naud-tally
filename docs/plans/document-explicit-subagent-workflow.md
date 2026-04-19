# Document the planning subagent workflow

This ExecPlan is a living document. The sections `Progress`, `Surprises & Discoveries`, `Decision Log`, and `Outcomes & Retrospective` must be kept up to date as work proceeds. Maintain this document in accordance with [`PLANS.md`](../../PLANS.md).

Related tasks: none yet. This plan establishes repository workflow rather than product scope.

Related docs: [`AGENTS.md`](../../AGENTS.md), [`PLANS.md`](../../PLANS.md), [`docs/agentic-workflow.md`](../agentic-workflow.md), [`docs/decisions.md`](../decisions.md), [`docs/research/codex-subagent-workflows.md`](../research/codex-subagent-workflows.md), [`docs/workflows/planning-subagent-workflow.md`](../workflows/planning-subagent-workflow.md), [`.codex/config.toml`](../../.codex/config.toml), and [`.codex/agents/`](../../.codex/agents/).

## Purpose / Big Picture

After this change, the repository should have one explicit, manually invoked planning subagent workflow for research and planning work. The coordinator should not need to infer which support phases to run. Instead, the default workflow should be `research`, `repo_docs_reader`, and `plan`, with explicit skip flags when the user wants a narrower run.

The design goal is to keep the workflow shallow, readable, and safe. `research` should own outside sources, `repo_docs_reader` should own repository-tracked docs and local reference files, and `plan` should remain the only write-capable phase. The workflow should be discoverable from the normal repo entry points rather than hidden only in chat or in custom-agent config.

## Progress

- [x] (2026-04-19 18:27Z) Reviewed the repo instruction layer, current workflow docs, the ExecPlan contract, and the existing subagent research brief to define the smallest coherent workflow change.
- [x] (2026-04-19 18:27Z) Added project-scoped custom agent files under [`.codex/agents/`](../../.codex/agents/) and expanded [`.codex/config.toml`](../../.codex/config.toml) with shallow subagent settings.
- [x] (2026-04-19 18:27Z) Added [`docs/workflows/planning-subagent-workflow.md`](../workflows/planning-subagent-workflow.md) and updated the root instructions, workflow docs, decision log, README, and research brief so the new pattern is reachable from normal repo entry points.
- [x] (2026-04-19 18:27Z) Fixed the repo ignore rules so the new project-scoped agent files under [`.codex/agents/`](../../.codex/agents/) are tracked alongside the rest of the workflow contract.
- [x] (2026-04-19 18:27Z) Validated the docs wiring and repo hygiene with targeted searches, the markdown repo-link checker, `codex --help`, and `git diff --check`.

## Surprises & Discoveries

- Observation: the current project-scoped Codex config was still minimal and only handled Penpot MCP wiring, so adding shallow subagent defaults fit cleanly into [`.codex/config.toml`](../../.codex/config.toml) without needing a broader config refactor.
  Evidence: before this change, [`.codex/config.toml`](../../.codex/config.toml) contained only the Penpot MCP settings.

- Observation: the repo already had a research brief about subagent workflows, which meant the new workflow docs could focus on the repo contract instead of re-explaining Codex subagents from scratch.
  Evidence: [`docs/research/codex-subagent-workflows.md`](../research/codex-subagent-workflows.md) already covered the Codex concepts, tradeoffs, and role ideas.

- Observation: the most important clarity requirement was not technical fan-out; it was keeping repository-local docs separate from outside research so later planning output is easy to audit.
  Evidence: the workflow request explicitly distinguished `repo_docs_reader` from online or external docs and treated that split as part of the desired user experience.

- Observation: the repo's ignore rules already hid most of [`.codex/`](../../.codex/), so new project-scoped agent files would not have been committed without an explicit allow-list update.
  Evidence: `git check-ignore -v` reported that [`.gitignore`](../../.gitignore) matched all three files under [`.codex/agents/`](../../.codex/agents/).

## Decision Log

- Decision: make the planning subagent workflow manual-only and use the exact phrase `planning subagent workflow` as the canonical trigger.
  Rationale: subagents add latency and token cost, so the workflow should run only when the user deliberately asks for it, and one stable phrase reduces invocation ambiguity.
  Date/Author: 2026-04-19 / Codex

- Decision: default to `research`, `repo_docs_reader`, and `plan` instead of asking the user to pick phases every time.
  Rationale: the main usability goal was to remove coordinator guesswork while still allowing narrower runs through explicit skip flags.
  Date/Author: 2026-04-19 / Codex

- Decision: keep `research` and `repo_docs_reader` strictly separate.
  Rationale: later contributors should be able to tell what came from repo-owned docs versus outside sources without reverse-engineering the agent behavior from chat history.
  Date/Author: 2026-04-19 / Codex

- Decision: keep `plan` as the only write-capable phase and limit it to ExecPlans plus directly related planning docs.
  Rationale: a single writer preserves predictability and matches the repo's current need, which is planning support rather than parallel implementation.
  Date/Author: 2026-04-19 / Codex

## Outcomes & Retrospective

The repository now has a documented planning subagent workflow, named custom agents, shallow project-scoped subagent defaults, and ignore rules that allow the new agent files to live in version control. The normal repo entry points now explain when to use the workflow and what each phase owns, so the pattern no longer depends on remembering a chat-only convention.

The workflow is intentionally conservative. It optimizes for clarity and auditability over raw speed, and it keeps custom-agent behavior aligned with the repo's emphasis on explicit docs and small, testable steps.

## Context and Orientation

Before this change, the repo already had documented agent entry points in [`AGENTS.md`](../../AGENTS.md), a general Codex collaboration guide in [`docs/agentic-workflow.md`](../agentic-workflow.md), and a research brief about Codex subagents in [`docs/research/codex-subagent-workflows.md`](../research/codex-subagent-workflows.md). It did not yet have a checked-in repo workflow that turned those ideas into one explicit, reusable subagent contract.

The project-scoped Codex config in [`.codex/config.toml`](../../.codex/config.toml) already existed for Penpot MCP wiring, but there were no project-scoped custom agents under [`.codex/agents/`](../../.codex/agents/) and no repo doc that defined a default research-plus-docs-plus-plan flow.

## Plan of Work

Add shallow global subagent settings to [`.codex/config.toml`](../../.codex/config.toml) and define three project-scoped custom agents under [`.codex/agents/`](../../.codex/agents/). Keep the workflow read-heavy up front by giving `web_researcher` and `repo_docs_reader` read-only defaults, and keep `plan_editor` as the only write-capable agent.

Then add a dedicated workflow doc under [`docs/workflows/`](../workflows/) that explains the invocation rule, default phase order, skip syntax, plan-target rule, and the strict boundary between repo-local docs and outside research. Update the root repo instructions, the general agent workflow guide, the repo decision log, and the README so the workflow is discoverable from the usual entry points. Refresh the existing research brief only enough to keep it aligned with the repo's new default workflow.

## Concrete Steps

From the repository root at [`./`](../../), edit [`.codex/config.toml`](../../.codex/config.toml) so the workflow stays shallow with `max_depth = 1` and `max_threads = 4`, while preserving the Penpot MCP config.

Add [`.codex/agents/web-researcher.toml`](../../.codex/agents/web-researcher.toml), [`.codex/agents/repo-docs-reader.toml`](../../.codex/agents/repo-docs-reader.toml), and [`.codex/agents/plan-editor.toml`](../../.codex/agents/plan-editor.toml). Keep the first two read-only, disable web search for `repo_docs_reader` and `plan_editor`, and describe the repo-docs-versus-outside-research split explicitly in their developer instructions.

Add [`docs/workflows/planning-subagent-workflow.md`](../workflows/planning-subagent-workflow.md) and update [`AGENTS.md`](../../AGENTS.md), [`docs/agentic-workflow.md`](../agentic-workflow.md), [`docs/decisions.md`](../decisions.md), [`README.md`](../../README.md), and [`docs/research/codex-subagent-workflows.md`](../research/codex-subagent-workflows.md) so the workflow rules, references, and examples all point at the same contract.

## Validation and Acceptance

Acceptance is met when:

- the repo contains the three custom agent files under [`.codex/agents/`](../../.codex/agents/)
- [`.codex/config.toml`](../../.codex/config.toml) defines shallow agent limits without removing the Penpot MCP config
- [`docs/workflows/planning-subagent-workflow.md`](../workflows/planning-subagent-workflow.md) documents the invocation rule, default phase sequence, skip syntax, and plan-target rule
- [`AGENTS.md`](../../AGENTS.md), [`docs/agentic-workflow.md`](../agentic-workflow.md), [`docs/decisions.md`](../decisions.md), and [`README.md`](../../README.md) all surface the workflow in the appropriate place
- the repo-docs-versus-external-docs boundary is stated consistently across the workflow doc and the custom agent definitions

Useful checks include:

- `find .codex/agents -maxdepth 1 -type f | sort`
- `rg -n "repo_docs_reader|web_researcher|plan_editor|planning-subagent-workflow" AGENTS.md README.md .codex docs PLANS.md`
- `codex --help`
- the markdown link checker script linked at [`../../scripts/check-markdown-repo-links.py`](../../scripts/check-markdown-repo-links.py)
- `git diff --check`

## Idempotence and Recovery

These changes are docs-and-config work and should be idempotent. Reapplying the same workflow should converge on the same agent files, the same shallow config, and the same doc links rather than creating another parallel workflow layer.

If later usage shows that the full default sequence is too heavy, the first mitigation should be better use of explicit skip flags or a smaller wording tweak in the workflow doc, not a new second workflow. If the custom-agent boundaries prove too restrictive, loosen the smallest relevant agent definition or workflow note instead of broadening every phase at once.

## Artifacts and Notes

The key artifacts are:

- the custom agent files under [`.codex/agents/`](../../.codex/agents/)
- the shallow agent settings in [`.codex/config.toml`](../../.codex/config.toml)
- the workflow contract in [`docs/workflows/planning-subagent-workflow.md`](../workflows/planning-subagent-workflow.md)
- the routing updates in [`AGENTS.md`](../../AGENTS.md), [`docs/agentic-workflow.md`](../agentic-workflow.md), [`docs/decisions.md`](../decisions.md), and [`README.md`](../../README.md)

Validation evidence should be recorded here once the doc and config checks have been rerun after implementation.

Validation evidence:

- `find .codex/agents -maxdepth 1 -type f | sort` showed the three expected custom agent files.
- `rg -n "repo_docs_reader|web_researcher|plan_editor|planning-subagent-workflow" AGENTS.md README.md .codex docs PLANS.md` returned the expected wiring across the repo docs and config.
- The markdown repo-link checker passed.
- `git diff --check` returned no output.

## Interfaces and Dependencies

[`.codex/config.toml`](../../.codex/config.toml) is the project-scoped Codex config layer. [`.codex/agents/`](../../.codex/agents/) defines the reusable project-scoped agent roles. [`AGENTS.md`](../../AGENTS.md) is the repo instruction layer that tells future sessions when to open the workflow doc. [`docs/workflows/planning-subagent-workflow.md`](../workflows/planning-subagent-workflow.md) is the operational contract for invocation, sequencing, and phase boundaries.

[`docs/research/codex-subagent-workflows.md`](../research/codex-subagent-workflows.md) remains the supporting research brief rather than the source-of-truth workflow contract. [`PLANS.md`](../../PLANS.md) remains the plan-routing entrypoint that `plan_editor` should keep aligned when new ExecPlans are created or materially revised.
