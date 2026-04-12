# Document-Type Drift

Use these checks to catch documentation drift that is really a document-structure problem.

This reference borrows the practical distinction from Diataxis: tutorials, how-to guides, reference, and explanation should stay meaningfully distinct when that separation helps users and maintainers.

## What To Look For

- reference docs that contain too much narrative rationale or workflow guidance
- task briefs that contain durable research, design rationale, or glossary content
- product or architecture docs that contain low-level task history
- plans that duplicate task briefs instead of linking them
- the same workflow re-explained in product, UX, design, task, and plan docs without clear ownership

## Quick Tests

- If the reader mainly needs facts, should this be reference instead of explanation?
- If the reader mainly needs steps, should this be task or how-to guidance instead of reference?
- If the content exists to justify a choice, should it live in decisions or explanation instead of a task brief?
- If the content is durable vocabulary, should it live in the glossary?

## Repo-Specific Application

In this repo:

- product docs should own product scope
- architecture docs should own boundaries and ownership
- decision docs should own durable tradeoffs
- glossary should own stable terms
- task files should stay focused on scope, acceptance, and outcome
- plans should extend task execution context without replacing task routing
