# Design Artifacts

This directory holds the repo-native design workflow for `Naud Tally`.

Penpot is still the project's default design workspace, but the default repo handoff is a markdown brief plus a committed SVG artifact inside [`docs/design/`](./).

## Layout

- Foundations: [`foundations/`](foundations/)
- Workflow guide: [`penpot-codex-workflow.md`](penpot-codex-workflow.md)
- Smoke tests: [`smoke-tests/`](smoke-tests/)

## Tablet Foundation

- Folder: [`foundations/tablet-foundation/`](foundations/tablet-foundation/)
- Brief: [`foundations/tablet-foundation/README.md`](foundations/tablet-foundation/README.md)
- SVG artifact: [`foundations/tablet-foundation/tablet-foundation.svg`](foundations/tablet-foundation/tablet-foundation.svg)

## Current Smoke Test

- Folder: [`smoke-tests/drink-tally/`](smoke-tests/drink-tally/)
- Brief: [`smoke-tests/drink-tally/README.md`](smoke-tests/drink-tally/README.md)
- SVG artifact: [`smoke-tests/drink-tally/guest-tally.svg`](smoke-tests/drink-tally/guest-tally.svg)

## Notes

- Commit SVG design artifacts only.
- Keep the markdown brief in the same folder as the SVG artifact when the files describe one concrete design target.
- Treat the tablet foundation brief in [`foundations/tablet-foundation/README.md`](foundations/tablet-foundation/README.md) as the visual system baseline for future screen work.
- Keep Penpot-specific intent, state notes, and follow-ups in the brief instead of trying to encode everything into the SVG export.
