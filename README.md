# Naud Tally

`Naud Tally` is a new pilot project with two goals:

1. Learn agentic AI development by building with Codex end-to-end.
2. Ship a functional, host-operated tablet app that lets the host quickly record guest orders, manage products and prices, bill tabs on departure, and recover safely after reloads, reinstall, or connection loss.

This repository began with documentation rather than app scaffolding, and the docs remain the first layer of the product and the first layer of the agent workflow.

The project is also being prepared to live well as an open-source repository with a clean public history and visible GitHub workflow activity.

The repo now uses [`AGENTS.md`](AGENTS.md) plus a frontend-local [`frontend/AGENTS.md`](frontend/AGENTS.md), with ordinary docs and READMEs carrying the durable navigation and source-of-truth context.

## Current Phase

The repo still includes a guest-facing tally slice plus a separate host tools route at `/host`, but the active pilot is scoped around a host-operated tablet workflow. The order entry screen is the primary tablet experience, and the next product work is installability, offline shell behavior, remote recovery, and host data-safety tooling.

What exists today:

- project vision
- pilot product scope
- decision log
- task index with per-task briefs
- repo and frontend agent instructions
- agentic workflow notes
- repo-tracked design workflow docs and SVG artifacts under [`docs/design/`](docs/design/)
- initial stack decision
- Angular app scaffold under [`frontend/`](frontend/) with Material and SignalStore dependencies
- host-operated order entry route at `/` with a room-first stepper
- separate host route for room management, product management, and broader billing review
- local room, guest-tab, billing history, and live drink catalog management
- historical guest-tab tally slice kept in code as deferred future context

What is intentionally not done yet:

- PWA installability and offline shell behavior
- remote backup and recovery for reinstall or replacement-device scenarios
- a chosen remote sync backend and reconnect-sync implementation

## Project Principles

- Build in small vertical slices.
- Prefer boring, reliable product decisions for the pilot.
- Keep the pilot local-first while still planning for remote recovery.
- Make every important decision explicit in docs.
- Use Codex as the primary implementation partner.
- Optimize for transferable learning, not one-off hacks.

## Docs

- [Publishing Workflow](docs/workflows/publish.md)
- [Frontend Guide](frontend/README.md)
- [Design Artifacts](docs/design/README.md)
- [Product](docs/product.md)
- [Architecture Guide](ARCHITECTURE.md)
- [Feature Layering Guide](docs/architecture/layering.md)
- [Glossary](docs/glossary.md)
- [Host Main Workflow UX](docs/ux/host-workflow-ux.md)
- [Deferred Public Tally and Guest Self-Service UX](docs/ux/guest-tab-ux.md)
- [Remote Persistence Options](docs/research/remote-persistence-options.md)
- [Agentic Workflow](docs/agentic-workflow.md)
- [Repo Decisions](docs/decisions.md)
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
- repo-tracked design briefs and SVG artifacts live under [`docs/design/`](docs/design/)
- the Angular app and its Node tooling live under [`frontend/`](frontend/)

## Pilot Success

The pilot is successful if:

- a host can use the app on a tablet from the order entry screen without extra navigation
- room selection, guest naming, and order entry are quick enough for on-the-fly service
- products and prices can be managed without leaving the host workflow
- billing on departure is clear and reliable
- local state survives reloads and remains usable while offline
- a replacement device can recover state from the chosen remote source after reconnect
- the build process teaches a repeatable Codex-driven workflow

## Notes

Some product details are still intentionally open. Those are captured as assumptions and questions in the docs so we can refine them before deeper implementation.
