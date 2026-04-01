# Penpot + Codex Workflow

## Goal

- Keep `Codex` as the main working surface while using `Penpot` as the visual design context.

## Reality Check

- Penpot's official MCP flow lets an AI client read and modify the currently open design file.
- The current Penpot architecture still requires one live browser tab with the Penpot MCP plugin UI open and connected.
- In practice, the smooth workflow is:
  - one terminal tab running the Penpot MCP services
  - one terminal tab running Codex with Penpot prewired
  - one background browser tab with the Penpot file and plugin panel open

## Repo Entry Points

- Start the Penpot MCP services with [`../../scripts/penpot-mcp.sh`](../../scripts/penpot-mcp.sh).
- Open Codex from the repo root and let the project-scoped config in [`.codex/config.toml`](../../.codex/config.toml) wire in Penpot automatically.
- Optional convenience entry point: [`../../scripts/codex-penpot.sh`](../../scripts/codex-penpot.sh).
- Keep the current design brief in a repo-native markdown file such as [`smoke-tests/drink-tally/README.md`](smoke-tests/drink-tally/README.md).
- Keep committed design artifacts in the matching folder under [`./`](./), with SVG as the only committed export format.

## Project-Scoped Codex Config

- Codex supports project-scoped MCP configuration through `.codex/config.toml`.
- This repository now uses that standard path directly in [`.codex/config.toml`](../../.codex/config.toml).
- The global Codex config must mark the repo as trusted before Codex loads project-scoped config.
- [`../../scripts/codex-penpot.sh`](../../scripts/codex-penpot.sh) is now only a convenience launcher that opens Codex in the repo root.

## First-Time Setup

1. Start the Penpot MCP services with `./scripts/penpot-mcp.sh`.
2. Open Penpot in the browser and create a blank file named `Naud Tally - MCP Example`.
3. In that file, open `Plugins` and load `http://localhost:4400/manifest.json`.
4. In the plugin UI, click `Connect to MCP server`.
5. Keep the plugin UI open while Codex is working with Penpot.
6. Start Codex from the repo root with `codex` or `./scripts/codex-penpot.sh`.

## Per-Session Workflow

1. Open the Penpot file you want Codex to use.
2. Reconnect the Penpot MCP plugin if needed.
3. Start Codex in the repo so it loads [`.codex/config.toml`](../../.codex/config.toml).
4. Point Codex at the repo-native handoff brief for that file.
5. After a meaningful design change, export a committed SVG artifact into the matching folder under [`./`](./) and save the artifact path plus any implementation notes back into the brief.
6. Add a Penpot share link only when interactive review, comments, or prototype playback adds value beyond the committed repo artifact.

## Committed Artifact Pattern

- Commit SVG artifacts only.
- Do not commit PNG design previews; SVG is sufficient for public display and keeps the design history text-diffable in Git.
- Keep the markdown brief in the same folder as the SVG artifact when the files describe the same design target.
- Treat the committed SVG artifact as the default handoff for the repo and the optional Penpot share link as a convenience layer for live review.

## Repo-Native Handoff Pattern

Each Penpot-driven task should have a markdown brief that includes:

- Penpot file name
- repo artifact directory
- repo SVG export path
- optional Penpot share link
- current status
- design goal
- screen list
- layout and spacing notes
- key states or variants
- implementation notes for Codex
- open questions or follow-ups

[`smoke-tests/drink-tally/README.md`](smoke-tests/drink-tally/README.md) is the first example of that format.

## Recommended Codex Prompt

Use a prompt shaped like this once the Penpot file and plugin are live:

> Use Penpot to update the active design file using [`docs/design/smoke-tests/drink-tally/README.md`](./smoke-tests/drink-tally/README.md) as the source of truth. Create the described smoke-test layout, then summarize what you created and any gaps between the brief and Penpot.

## Current Limits

- Codex cannot work with Penpot until a design file is already open in the browser.
- Closing the Penpot plugin UI breaks the MCP connection.
- Chromium-based browsers may block local-network access to `localhost`; if that happens, approve the prompt or use `Firefox`.
- SVG exports are the preferred repo artifact, but they are still generated from a live Penpot session, so the browser-side plugin connection remains part of the workflow.
- Reimporting an exported design artifact can lose Penpot-specific details, so keep the markdown brief and Penpot file for richer editing context when needed.

## References

- [Penpot MCP README](https://github.com/penpot/penpot/blob/develop/mcp/README.md)
- [Penpot View Mode](https://help.penpot.app/user-guide/prototyping-testing/testing-view-mode/)
