# Naud Tally

`Naud Tally` is a new pilot project with two goals:

1. Learn agentic AI development by building with Codex end-to-end.
2. Ship a functional, tablet-first tally app that lets guests record which drinks they take and how many.

This repository is intentionally starting with documentation before scaffolding. The docs are the first layer of the product and the first layer of the agent workflow.

The project is also being prepared to live well as an open-source repository with a clean public history and visible GitHub workflow activity.

## Current Phase

We are in the `scaffolded` phase.

What exists today:

- project vision
- pilot product scope
- decision log
- first task backlog
- agentic workflow notes
- initial stack decision
- Angular app scaffold under `frontend/` with Material and SignalStore dependencies

What is intentionally not done yet:

- guest tally implementation
- organizer functionality
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

## Local Setup

1. Run `nvm use`
2. Change into `frontend/`
3. Run `npm install`
4. Start the app with `npm start`

Useful commands in `frontend/`:

- `npm run build`
- `npm test`

Directory notes:

- the repo root is reserved for project docs, GitHub config, and future shared concerns
- the Angular app and its Node tooling live under `frontend/`

## Pilot Success

The pilot is successful if:

- a guest can use the app on a tablet without explanation
- drink choices are fast to record with large touch targets
- counts survive a page reload or accidental refresh
- the first implementation stays focused on the guest-facing tally screen
- the build process teaches a repeatable Codex-driven workflow

## Notes

Some product details are still intentionally open. Those are captured as assumptions and questions in the docs so we can refine them before scaffolding.
