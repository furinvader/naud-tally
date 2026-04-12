# Audit Checklist

Use this checklist when the user asks for a documentation-drift review or cleanup.

## 1. Inventory

- Choose the file set:
  - tracked docs only
  - all docs on disk
- Exclude dependency docs such as `frontend/node_modules`.
- Decide whether the audit should compare against the Git-tracked state, the current working tree, or both.

## 2. Source-of-Truth Pass

- Read the repo routing docs first.
- Identify the owning docs for:
  - project overview
  - product scope
  - architecture
  - decisions
  - glossary
  - task backlog
  - plans, if task-linked

## 3. Stale and Timelessness Pass

Start with stronger signals:

- references to removed or moved files
- renamed features, routes, or screens
- `current priority`
- `default route`
- `future work`
- `does not yet`
- `currently`
- `now`
- `latest`

Use weaker signals such as `still`, `next`, and `historical` only when they line up with a concrete drift hypothesis.

## 4. Contradiction Pass

Look for disagreements between:

- `README` and product docs
- product docs and architecture docs
- task indexes and task files
- task files and linked plans
- frontend docs and current feature boundaries
- glossary definitions and the language used elsewhere

## 5. Missing-Coverage Pass

Flag cases where a change happened but the expected docs did not:

- moved tasks that did not update indexes
- route or feature changes that did not update guide docs
- renamed terminology that did not update the glossary
- source-of-truth pages that were never updated after implementation landed

## 6. Document-Type Drift Pass

Use the Diataxis-inspired checks in [`document-type-drift.md`](document-type-drift.md).

Flag:

- task briefs carrying durable research or explanation
- reference docs carrying procedural workflow steps that belong elsewhere
- the same workflow described in detail across product, UX, design, task, and plan docs without clear ownership

## 7. Glossary and Rename Pass

Use the checks in [`glossary-considerations.md`](glossary-considerations.md).

Pay special attention to:

- first meaningful glossary links
- changed meanings
- legacy aliases that survived a rename

## 8. Superfluous-Content Pass

Flag:

- repeated explanations across several docs when one source doc could carry the detail
- long lists that restate the same workflow in product, UX, task, design, and plan docs
- duplicated workflow guidance across contributing, publish, and setup docs
- historical context that no longer helps active work
- vague or repetitive link text such as `here`, `this doc`, or repeated same-target links when a single link would do

## 9. Cleanup Order

When fixing drift:

1. source-of-truth docs
2. task and plan routing
3. historical docs
4. template cleanups and wording compression
5. validation rerun

## 10. Validation

- Run the local markdown-link scan script.
- Run `git diff --check`.
- Run targeted `rg` searches for phrases or file paths you expected to remove.
- If recurring drift is structural, suggest a hardening step from [`docs-as-code-hardening.md`](docs-as-code-hardening.md).
