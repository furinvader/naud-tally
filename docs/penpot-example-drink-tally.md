# Penpot Example: Drink Tally Smoke Test

## Penpot File

- File name: `Naud Tally - MCP Example`
- Repo artifact directory: [`../design/`](../design/)
- Repo SVG export: [`../design/drink-tally-smoke-test.svg`](../design/drink-tally-smoke-test.svg)
- Browser preview: [`../design/drink-tally-smoke-test.png`](../design/drink-tally-smoke-test.png)
- Optional Penpot share link: `not required for the repo workflow`
- Status: `first MCP-driven creation pass completed on 2026-04-01; repo SVG and PNG exports are recorded and repo-native artifacts are the default handoff`

## Goal

- Create a small Penpot file that proves Codex can create and edit a simple design without leaving the repo context.

## Scope of This Example

- This is an integration smoke test, not the final product design.
- It should stay close to the product direction in [`docs/product.md`](product.md), but it can use a reduced drink list so the first Penpot pass stays small and easy to verify.

## Screen

- Create one tablet-sized frame named `Guest Tally`.
- Use a portrait tablet layout around `1024 x 1366`.
- Keep everything on a single page named `Drink Tally`.

## Content

- Header title: `Drink Tally`
- Header helper text: `Tap what you took.`
- Summary card label: `Total drinks`
- Summary card value: `7`
- Example drinks for the smoke test:
  - `Water`
  - `Cola`
  - `Beer`
  - `White Wine`

## Layout Notes

- Use a clear top header followed by the total card.
- Show one drink card per row.
- Each drink card should include:
  - drink name
  - current count
  - large `-` button
  - large `+` button
- Optimize for fast tapping and obvious reading distance.

## Visual Direction

- Keep the style clean, bright, and tablet-friendly.
- Prefer a warm light background with dark text and one calm accent color.
- Avoid a dense enterprise-dashboard look.
- Use strong spacing and large touch targets over decorative detail.

## Implementation Notes for Codex

- This file is meant to verify the Penpot connection and the repo handoff flow first.
- Favor simple rectangles, text, and consistent spacing over advanced Penpot features.
- If the Penpot MCP tools support structured naming, name layers clearly enough that a later Codex pass can reference them.

## Suggested Codex Prompt

> Use Penpot to create the smoke-test design described in [`docs/penpot-example-drink-tally.md`](./penpot-example-drink-tally.md). Work in the active Penpot file, create the page and frame if they do not exist, and keep the result simple and easy to inspect.

## Follow-Up

- 2026-04-01: Codex created the example `Drink Tally` page and `Guest Tally` frame through the Penpot MCP connection and recorded both SVG and PNG exports in [`../design/`](../design/).
- Refresh the committed SVG and PNG in [`../design/`](../design/) after meaningful Penpot changes.
- Add an optional Penpot share link only when public review or prototype playback needs more than the committed repo artifact.
- If the first Penpot pass exposes missing brief details, update this file instead of relying on chat memory.
