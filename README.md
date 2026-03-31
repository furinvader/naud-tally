# Naud Tally

`Naud Tally` is a new pilot project with two goals:

1. Learn agentic AI development by building with Codex end-to-end.
2. Ship a functional, tablet-first tally app that lets guests record which drinks they take and how many.

This repository is intentionally starting with documentation before scaffolding. The docs are the first layer of the product and the first layer of the agent workflow.

The project is also being prepared to live well as an open-source repository with a clean public history and visible GitHub workflow activity.

The repo now uses [`AGENTS.md`](AGENTS.md) plus small [`agent-index.md`](agent-index.md) files so future agent sessions can recover context from the repository instead of relying on chat history.

## Current Phase

We have shipped the first guest tally slice and are now improving the repository's agent-facing structure before continuing with the next product slice.

What exists today:

- project vision
- pilot product scope
- decision log
- task index with per-task briefs
- agent routing docs
- agentic workflow notes
- initial stack decision
- Angular app scaffold under [`frontend/`](frontend/) with Material and SignalStore dependencies
- first guest tally screen with reload-safe local persistence

What is intentionally not done yet:

- organizer functionality
- guest-based tracking
- backend implementation

## Project Principles

- Build in small vertical slices.
- Prefer boring, reliable product decisions for the pilot.
- Keep the pilot local-first unless a clear need appears.
- Make every important decision explicit in docs.
- Use Codex as the primary implementation partner.
- Optimize for transferable learning, not one-off hacks.

## Docs

- [Publishing Workflow](docs/workflows/publish.md)
- [Frontend Guide](frontend/README.md)
- [Product](docs/product.md)
- [Agentic Workflow](docs/agentic-workflow.md)
- [Decisions](docs/decisions.md)
- [GitHub Setup](docs/github-setup.md)
- [Contributing](CONTRIBUTING.md)

## License

This project is licensed under the [MIT License](LICENSE).

## Local Setup

1. Change into [`frontend/`](frontend/)
2. Run `nvm use`
3. Run `npm install`
4. Start the app with `npm start`

Useful commands in [`frontend/`](frontend/):

- `npm run build`
- `npm test`

Directory notes:

- the repo root is reserved for project docs, GitHub config, and future shared concerns
- the Angular app and its Node tooling live under [`frontend/`](frontend/)

## Pilot Success

The pilot is successful if:

- a guest can use the app on a tablet without explanation
- drink choices are fast to record with large touch targets
- counts survive a page reload or accidental refresh
- the first implementation stays focused on the guest-facing tally screen
- the build process teaches a repeatable Codex-driven workflow

## Notes

Some product details are still intentionally open. Those are captured as assumptions and questions in the docs so we can refine them before scaffolding.
