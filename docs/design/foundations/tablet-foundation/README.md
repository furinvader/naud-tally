# Tablet Foundation

## Artifact

- Repo artifact directory: [`./`](./)
- Repo SVG export: [`tablet-foundation.svg`](tablet-foundation.svg)
- Optional Penpot share link: `not required for the repo workflow`
- Status: `revised on 2026-04-01 to replace the initial Material-influenced pass with a custom tablet-first direction`

## Goal

- Provide a reusable visual-system baseline for all future design work in `Naud Tally`.

## Basis

- Do not anchor the foundation to a named design system by default.
- Base the branding on the actual `Naud Tally` tablet experience instead of a website or marketing page.
- Keep the look modern, calm, and restrained: lower chroma, firmer geometry, and less-rounded controls.

## Foundation Sections

- A restrained tablet-first palette
- Typography roles for headline, section, body, label, and numeric emphasis
- Shape and interaction rules for panels, cards, and buttons
- Icon direction with simple squared line icons
- A branded example of the primary tally screen

## Core Tokens

- `Canvas`: `#F4F2EE`
- `Surface`: `#FBFAF8`
- `Surface Soft`: `#E8E3DC`
- `Line`: `#D7D0C7`
- `Line Strong`: `#B8B0A6`
- `Ink`: `#1E2630`
- `Muted`: `#67717A`
- `Action`: `#355061`
- `Action Soft`: `#E6EDF1`
- `Accent`: `#7E8974`
- `Accent Soft`: `#E7ECE5`
- `Signal`: `#A4653A`

## Typography Roles

- Display typeface: `Manrope`
- UI typeface: `Inter Tight`
- `Display`: `Manrope 62 / 62`
- `Section`: `Manrope 28 / 33`
- `Body`: `Inter Tight 16 / 23`
- `Label`: `Inter Tight 14 / 20`
- `Numeric emphasis`: `Manrope 66 / 63`

## Shape and UI Rules

- Use `16` to `20` radius for cards and major panels.
- Use `14` radius for primary action buttons and counter controls.
- Prefer visible 1px borders over very soft glassmorphism.
- Keep shadows light and functional rather than decorative.
- Use compact chips and utility badges instead of oversized pills.

## Implementation Guidance

- Use `action` for the main positive path: increment, confirm, or focused emphasis.
- Keep most screens in `ink`, `muted`, `canvas`, and `surface`, with `accent` and `signal` used sparingly.
- Make numbers, counts, and totals visually dominant over decorative text.
- Prefer simple outline icons with squared ends and quiet geometry over playful or highly rounded icon families.
- Use the primary tally layout as the branding reference point for future screens instead of inventing unrelated presentation patterns.

## Follow-Up

- Refresh the committed SVG in [`./`](./) after meaningful foundation changes.
- Use this brief plus a task-specific screen brief as the starting context for future design work.
- If the system itself changes, update this brief and the SVG together instead of encoding the change only in chat memory.
