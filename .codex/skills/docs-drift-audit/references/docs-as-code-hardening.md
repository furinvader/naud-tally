# Docs-as-Code Hardening

Use this reference when the same documentation drift keeps recurring and a one-off cleanup is not enough.

This guidance is inspired by practical Write the Docs patterns: keep documentation testable, automate simple checks, and move recurring editorial expectations into shared standards.

## Useful Hardening Options

- keep local or CI link checking
- add prose linting with Vale for repeated wording or terminology problems
- add lightweight task-index consistency checks if task moves are frequent
- keep a small style or terminology guide when recurring naming disputes appear
- add repo checks for known local rules such as clickable tracked-path references

## When To Suggest Hardening

- the same stale phrases recur after several cleanup passes
- task indexes and task files drift repeatedly
- renamed features keep leaving old aliases in active docs
- terminology disputes keep reopening because there is no small shared reference
