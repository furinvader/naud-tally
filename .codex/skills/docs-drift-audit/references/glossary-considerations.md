# Glossary Considerations

Treat glossary checks as part of every docs-drift audit in this repo.

## What To Check

- Does a doc use a glossary-defined term with a meaning that no longer matches [`docs/glossary.md`](../../../../docs/glossary.md)?
- Does the first meaningful mention of a glossary-defined term link to the glossary entry when the term matters for understanding?
- Has the product or architecture language changed without updating the glossary?
- Does a task, plan, or historical doc preserve an older term that should now be framed as historical context?
- Did a rename happen, but older aliases still survive in active docs?

## Common Cases

- route names versus screen names
- feature names versus capability names
- product-scope terms such as current main surface, host tools, recovery, or sync status
- architecture terms such as composition root, public API, repository, or transient route state
- old feature or route aliases that still appear after a rename

## Rename Propagation Check

When a term changes:

1. Update the glossary entry if the canonical term changed.
2. Update the owning source doc that defines or depends on the term.
3. Search for the old alias across active docs, not just historical docs.
4. Keep the old alias only where historical framing is intentional and explicit.

## Fix Strategy

- If the term itself changed, update the glossary and the owning source doc together.
- If only one doc drifted, update that doc to match the glossary or the owning source doc.
- If a historical doc intentionally preserves older terminology, make that historical framing explicit instead of silently rewriting the history.
