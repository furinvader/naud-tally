# Naud Tally

`Naud Tally` is a new pilot project with two goals:

1. Learn agentic AI development by building with Codex end-to-end.
2. Ship a functional, tablet-first tally app that lets guests record which drinks they take and how many.

This repository is intentionally starting with documentation before scaffolding. The docs are the first layer of the product and the first layer of the agent workflow.

The project is also being prepared to live well as an open-source repository with a clean public history and visible GitHub workflow activity.

## Current Phase

We are in the `docs-first` phase.

What exists today:

- project vision
- pilot product scope
- decision log
- first task backlog
- agentic workflow notes

What is intentionally not done yet:

- framework selection
- project scaffolding
- UI implementation
- backend implementation

## Project Principles

- Build in small vertical slices.
- Prefer boring, reliable product decisions for the pilot.
- Keep the pilot local-first unless a clear need appears.
- Make every important decision explicit in docs.
- Use Codex as the primary implementation partner.
- Optimize for transferable learning, not one-off hacks.

## Docs

- [Product](docs/product.md)
- [Agentic Workflow](docs/agentic-workflow.md)
- [Decisions](docs/decisions.md)
- [Tasks](docs/tasks.md)
- [GitHub Setup](docs/github-setup.md)
- [Contributing](CONTRIBUTING.md)

## License

This project is licensed under the [MIT License](LICENSE).

## Pilot Success

The pilot is successful if:

- a guest can use the app on a tablet without explanation
- drink choices are fast to record with large touch targets
- counts survive a page reload or accidental refresh
- an organizer can reset or export the tally without developer help
- the build process teaches a repeatable Codex-driven workflow

## Notes

Some product details are still intentionally open. Those are captured as assumptions and questions in the docs so we can refine them before scaffolding.
