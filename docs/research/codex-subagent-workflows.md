# Codex Subagent Workflows

## Goal

Capture what Codex subagent workflows are, why they are useful, what Codex supports today, and how to start using them with the smallest reliable workflow.

## Related docs

- [Agentic Workflow](../agentic-workflow.md)

## Research snapshot

- April 19, 2026

## What this topic is

- In Codex, a subagent workflow lets one main Codex thread delegate bounded work to other agent threads, wait for their results, and continue from a cleaner summary instead of carrying every intermediate detail in the main conversation.
- The Codex docs frame this as a way to keep the main thread focused on requirements, decisions, and final outputs while side threads handle exploration, tests, log analysis, or other supporting work.

See:

- [Codex Subagents](https://developers.openai.com/codex/subagents)
- [Subagent Concepts](https://developers.openai.com/codex/concepts/subagents)

## Why it matters

- Large tasks can bury the important decisions under noisy intermediate output.
- The Codex docs call out two related failure modes:
  - context pollution, where useful information gets buried under noisy details
  - context rot, where performance degrades as the conversation fills up with less relevant material
- Subagents help by moving noisy work off the main thread and returning distilled results to the coordinator.

See:

- [Subagent Concepts](https://developers.openai.com/codex/concepts/subagents)
- [Codex Best Practices](https://developers.openai.com/codex/learn/best-practices)

## Core terms

- Subagent workflow: a workflow where Codex runs parallel agents and combines their results.
- Subagent: a delegated agent that Codex starts to handle a specific task.
- Agent thread: a separate CLI thread that can be inspected with [`/agent`](https://developers.openai.com/codex/cli/slash-commands).
- Main agent or coordinator: the thread that keeps ownership of the task, decides what to delegate, and integrates the results.

See:

- [Subagent Concepts](https://developers.openai.com/codex/concepts/subagents)
- [Codex Slash Commands](https://developers.openai.com/codex/cli/slash-commands)

## What Codex supports today

### 1. Stable multi-agent support

- The Codex config docs list multi-agent collaboration tools as a stable feature and enabled by default.
- The documented collaboration tools include `spawn_agent`, `send_input`, `resume_agent`, `wait_agent`, and `close_agent`.

See:

- [Codex Config Basics](https://developers.openai.com/codex/config-basic)
- [Codex Config Reference](https://developers.openai.com/codex/config-reference)

### 2. Explicit delegation and waiting

- Codex can spawn new subagents, route follow-up instructions, wait for results, and return a consolidated response.
- Codex does not start subagents automatically. The user has to ask for them explicitly.
- Good prompts say how to split the work, whether Codex should wait before continuing, and what output format to return.

See:

- [Codex Subagents](https://developers.openai.com/codex/subagents)
- [Subagent Concepts](https://developers.openai.com/codex/concepts/subagents)

### 3. Coordinator-style workflows

- The official Codex pattern already matches a coordinator model:
  - the main thread owns the problem
  - subagents handle bounded specialist tasks
  - the main thread waits, compares results, and decides the next step
- This is a good fit for staged work such as:
  - exploration before edits
  - verification after edits
  - docs or API checks alongside code review
  - test or log analysis before deciding on a fix

See:

- [Codex Subagents](https://developers.openai.com/codex/subagents)
- [Codex Best Practices](https://developers.openai.com/codex/learn/best-practices)

### 4. Custom agent roles

- Codex supports project-scoped custom agents through config and per-agent TOML files.
- The documented config surface includes:
  - `agents.max_threads`
  - `agents.max_depth`
  - `agents.<name>.description`
  - `agents.<name>.config_file`
  - `agents.<name>.nickname_candidates`
- Official examples define roles such as:
  - `pr_explorer`
  - `reviewer`
  - `docs_researcher`
  - `browser_debugger`
  - `ui_fixer`
- This makes repeated coordinator workflows more reliable than re-explaining the same worker roles in every prompt.

See:

- [Codex Subagents](https://developers.openai.com/codex/subagents)
- [Codex Config Reference](https://developers.openai.com/codex/config-reference)
- [Codex Advanced Configuration](https://developers.openai.com/codex/config-advanced)

### 5. Model and sandbox choices per agent

- Official guidance says to start with `gpt-5.4` for the main agent and more ambiguous multi-step coordination work.
- `gpt-5.4-mini` is the recommended lighter option for faster, lower-cost read-heavy workers.
- Subagents inherit the current sandbox and approval policy from the parent session, although custom agents can also set their own defaults.
- Read-only agents are a strong default for explorers, reviewers, and verification agents.

See:

- [Subagent Concepts](https://developers.openai.com/codex/concepts/subagents)
- [Codex Subagents](https://developers.openai.com/codex/subagents)

### 6. Thread and session controls

- Useful Codex controls around this workflow include:
  - [`/agent`](https://developers.openai.com/codex/cli/slash-commands) to inspect or switch agent threads
  - [`/compact`](https://developers.openai.com/codex/cli/slash-commands) to summarize long conversations
  - [`/fork`](https://developers.openai.com/codex/cli/slash-commands) and [`/resume`](https://developers.openai.com/codex/cli/slash-commands) to branch or continue work
  - [`/status`](https://developers.openai.com/codex/cli/slash-commands) to inspect session state

See:

- [Codex Slash Commands](https://developers.openai.com/codex/cli/slash-commands)
- [Codex Best Practices](https://developers.openai.com/codex/learn/best-practices)

## Important limits and tradeoffs

- Manual trigger only. Codex will not start subagents unless asked.
- Extra cost. Subagent workflows use more tokens than a similar single-agent run because each subagent does its own tool and model work.
- Default nesting is shallow. The documented default for `agents.max_depth` is `1`, which means the default shape is root thread to child threads, not deeply nested trees of agents spawning more agents.
- Parallel write-heavy work is risky. The Codex docs recommend starting with read-heavy tasks such as exploration, tests, triage, and summarization, and being more careful when multiple agents edit code in parallel.
- Approvals can interrupt the flow. In interactive sessions, approval requests can surface from inactive agent threads. In non-interactive flows, work that needs fresh approval fails and is returned to the parent workflow.

See:

- [Subagent Concepts](https://developers.openai.com/codex/concepts/subagents)
- [Codex Subagents](https://developers.openai.com/codex/subagents)
- [Codex Config Reference](https://developers.openai.com/codex/config-reference)

## Recommended starting approach

- Start with one coordinator thread.
- Give it two to four bounded specialist roles, mostly read-only:
  - explorer
  - reviewer
  - docs checker
  - verifier
- Keep one writer at a time until the workflow feels predictable.
- Ask the coordinator to wait for all delegated work before choosing the next step.
- Prefer short summaries from subagents over raw logs.
- Keep the first version shallow:
  - coordinator to workers
  - optional final verifier
- Only introduce deeper nesting after a simple version is already helping.

See:

- [Codex Best Practices](https://developers.openai.com/codex/learn/best-practices)
- [Subagent Concepts](https://developers.openai.com/codex/concepts/subagents)
- [Codex Subagents](https://developers.openai.com/codex/subagents)

## Fastest path to learn this directly

1. Read [Codex Subagents](https://developers.openai.com/codex/subagents) and [Subagent Concepts](https://developers.openai.com/codex/concepts/subagents) first.
2. Try one prompt-only coordinator workflow on a safe, read-heavy task.
3. Use [`/agent`](https://developers.openai.com/codex/cli/slash-commands) to inspect what each subagent did.
4. If the pattern helps, introduce named custom agents in project-scoped Codex config.
5. Only then increase depth or add more automation.

## Starter workflow for this repo

### Phase 1: Prompt-only delegation

- Keep using the main Codex thread.
- Ask it to spawn a small number of subagents explicitly.
- Confirm that the work split is actually helpful before adding more setup.

### Phase 2: Custom agent roles

- Add named worker roles only after the repeated pattern is clear.
- Make explorers, reviewers, and verifiers read-only first.
- Treat writer agents as the exception, not the default.

### Phase 3: Verification loop

- Once the workflow is stable, add a dedicated verifier or reviewer step after implementation.
- Keep the verifier focused on regressions, test gaps, and risky assumptions instead of style-only feedback.

## Example prompts

```text
Use a coordinator workflow. Spawn one read-only agent to map the affected code paths and one read-only agent to look for risks or missing tests. Wait for both, then summarize what matters and propose the next step.
```

```text
Read the relevant docs first. Spawn an explorer to confirm the files and state ownership, and a docs checker to verify any framework APIs. Wait for both. If the path is clear, do the implementation yourself and then spawn a verifier to review the result.
```

```text
Treat this as a verification pass. Spawn one agent for correctness and regressions, one agent for test gaps, and one agent for docs or API assumptions. Wait for all three, resolve contradictions, and return a short risk summary with file references.
```

## Key takeaways

- Codex already supports a coordinator-with-workers workflow.
- The best first use case is bounded, read-heavy delegation.
- The simplest reliable shape is one main coordinator plus a few specialist read-only workers.
- Custom agents are worth adding after the workflow repeats, not before.
- Keep nesting shallow at first; the documented default depth already nudges in that direction.

## Sources

- [Codex Subagents](https://developers.openai.com/codex/subagents)
- [Subagent Concepts](https://developers.openai.com/codex/concepts/subagents)
- [Codex Best Practices](https://developers.openai.com/codex/learn/best-practices)
- [Codex Slash Commands](https://developers.openai.com/codex/cli/slash-commands)
- [Codex Config Basics](https://developers.openai.com/codex/config-basic)
- [Codex Config Reference](https://developers.openai.com/codex/config-reference)
- [Codex Advanced Configuration](https://developers.openai.com/codex/config-advanced)
- [Custom Instructions with AGENTS.md](https://developers.openai.com/codex/guides/agents-md)
- [Codex App Server](https://developers.openai.com/codex/app-server)
