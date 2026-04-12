# Report Template

Use this report shape when returning audit findings.

## Stale

- Likely behind current code, backlog state, or repo workflow.

## Contradictory

- Material disagreement between docs, or between docs and current implementation state.

## Missing

- Expected documentation updates that never happened.

## Superfluous

- Repeated, noisy, or compressible wording that can be simplified without losing meaning.

## Checks Run

- Markdown link scan
- targeted search passes
- other relevant validation such as `git diff --check`
