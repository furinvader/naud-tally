# Design Artifacts

This directory holds the repo-native design workflow for `Naud Tally`.

Penpot is still the project's default design workspace, but the default repo handoff is a markdown brief plus a committed SVG artifact inside [`docs/design/`](./).

## Layout

- Foundations: [`foundations/`](foundations/)
- Screen brief template: [`screen-brief-template.md`](screen-brief-template.md)
- Workflow guide: [`penpot-codex-workflow.md`](penpot-codex-workflow.md)

## Design Foundation

- Folder: [`foundations/`](foundations/)
- Brief: [`foundations/README.md`](foundations/README.md)
- SVG artifact: [`foundations/design-foundation.svg`](foundations/design-foundation.svg)

## Notes

- Keep this directory intentionally small: one shared foundation, one brief template, and task-specific artifact folders only when they are part of real design work.
- Commit SVG design artifacts only.
- Keep the markdown brief in the same folder as the SVG artifact when the files describe one concrete design target.
- Treat the mobile-first foundation brief in [`foundations/README.md`](foundations/README.md) as the visual system baseline for future screen work.
- Keep the shared foundation flat under [`foundations/`](foundations/) so agents do not have to resolve an extra path layer for the default baseline.
- Start new task-specific briefs from [`screen-brief-template.md`](screen-brief-template.md) instead of inventing one-off structures.
- Keep Penpot-specific intent, state notes, and follow-ups in the brief instead of trying to encode everything into the SVG export.
