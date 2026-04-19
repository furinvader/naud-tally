# Planning Subagent Workflow

## Goal

- Run a predictable, explicit workflow for research, repository-doc review, and plan creation without making the coordinator infer which support steps to use.

## Manual Invocation Rule

- This workflow is manual-only.
- The exact phrase `planning subagent workflow` is the canonical trigger.
- Treat prompts such as `Use the planning subagent workflow for ...` or `I would like to use the planning subagent workflow for ...` as explicit invocation.
- Do not treat it as the default path for every request.

## Default Phase Sequence

- When the planning subagent workflow is invoked, run `research`, `repo_docs_reader`, then `plan`.
- `research` and `repo_docs_reader` may run in parallel when both are active.
- `plan` always runs after the active read-only phases finish.
- Only skip a phase when the user explicitly says `skip research`, `skip repo docs`, or `skip plan`.

## Phase Boundaries

- `research` means live web research and external documentation only.
- `repo_docs_reader` means repository-tracked docs and local reference files only.
- `plan` means creating or updating an ExecPlan plus directly related planning docs such as [`../../PLANS.md`](../../PLANS.md).

The boundary is strict on purpose:

- `research` owns outside sources.
- `repo_docs_reader` owns what the repository itself says.
- `plan` is the single writer and should not expand into general implementation or product-doc edits.

If a question is not answered in repo docs, `repo_docs_reader` should return the gap instead of reaching outside the repository.

## Plan Target Rule

- If `plan` is active and the user already said whether to create a new plan or update an existing one, follow that instruction.
- If `plan` is active and the target is still ambiguous, the coordinator should ask whether to create a new ExecPlan or update an existing one.
- When a new ExecPlan is created or an existing one is materially revised, keep [`../../PLANS.md`](../../PLANS.md) aligned with the change.

## Current Agent Set

- [`../../.codex/agents/web-researcher.toml`](../../.codex/agents/web-researcher.toml): read-only agent for live web and external docs.
- [`../../.codex/agents/repo-docs-reader.toml`](../../.codex/agents/repo-docs-reader.toml): read-only agent for repo-tracked docs and local reference files only.
- [`../../.codex/agents/plan-editor.toml`](../../.codex/agents/plan-editor.toml): the only write-capable agent, limited to ExecPlans and directly related planning docs.
- [`../../.codex/config.toml`](../../.codex/config.toml): keeps the workflow shallow with `max_depth = 1` and `max_threads = 4`.

## Prompt Shapes

Use prompts shaped like these:

```text
Use the planning subagent workflow for evaluating the next sync milestone. Create a new plan.
```

```text
Use the planning subagent workflow for tightening the recovery workflow docs. Skip research. Update plan: <existing ExecPlan>.
```

```text
Use the planning subagent workflow for comparing remote backup options. Skip repo docs. Skip plan.
```

```text
I would like to use the planning subagent workflow for reviewing our agent setup. Skip plan.
```

## Coordinator Expectations

- Do not ask which phases to run. The default is already `research`, `repo_docs_reader`, and `plan`.
- Do ask for the plan destination if `plan` is active and the user did not say whether to create or update one.
- Do not perform internet research unless the planning subagent workflow was explicitly invoked and `research` was not skipped.
- Prefer concise summaries from the read-only phases before the `plan` phase writes anything.

## Tradeoffs and Limits

- This workflow is slower and more expensive than a narrower single-agent run because it does more tool and model work by default.
- The strict split between outside sources and repo docs improves traceability, but it also means the coordinator may need to reconcile two different summaries.
- The workflow intentionally keeps one writer at a time and does not support broad parallel editing.
- If the workflow feels too heavy for a task, use explicit skip flags rather than loosening the default boundaries.

## References

- [Agentic Workflow](../agentic-workflow.md)
- [Codex Subagent Workflows Research](../research/codex-subagent-workflows.md)
- [Repo Instructions](../../AGENTS.md)
- [ExecPlan Contract](../../PLANS.md)
