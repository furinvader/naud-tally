# Deferred Public Tally and Guest Self-Service UX

This brief describes a deferred future mode where guests interact with a shared tablet directly.

It remains useful as historical context for the guest-centric slices already shipped in [`../tasks/done/T-009.md`](../tasks/done/T-009.md) and [`../tasks/done/T-015.md`](../tasks/done/T-015.md), but it is not the current pilot target. The active pilot is now described in [`host-workflow-ux.md`](host-workflow-ux.md) and [`../product.md`](../product.md).

## Status

- deferred future consideration
- not part of the current accessible pilot surface

## Original Intent

- Let returning guests find an existing tab quickly from a shared tablet.
- Let new guests create a tab with room number and full name.
- Keep drink recording on one screen with minimal navigation.
- Reduce accidental carryover between guests on a shared public device.

## Future-Slice Constraints

- The host still needs billable tabs tied to room number and full name.
- Any future public mode should preserve the host-operated product and billing model instead of replacing it.
- Public self-service should only return if it clearly improves the real host workflow instead of adding operational risk.
- Privacy, mistaken identity, and accidental access remain stronger concerns on a public screen than on a host-operated one.

## Future Screen Model

- If this mode returns, keep it separate from the current host-operated pilot scope.
- A future public screen may still use an active-guest list, an `Add yourself` action, and a non-modal personal tally surface.
- Room number and full name would remain the trust-based identifiers unless a better verified shortcut is introduced later.
- The host workflow should remain authoritative for billing, product control, and recovery.

## Reasons It Is Deferred

- The host is now the primary user we need to optimize for.
- The current code already includes host-side catalog management and billing, which aligns better with the real operating model.
- Public access adds privacy and misuse risks while the data-safety and sync story is still being defined.
- The backlog now prioritizes host workflow, PWA support, and remote recovery first.

## Follow-Up

- Treat this file as historical and future reference for [`../tasks/done/T-009.md`](../tasks/done/T-009.md) and [`../tasks/done/T-015.md`](../tasks/done/T-015.md).
- Do not treat this file as the UX reference for any current open task unless the pilot scope changes again later.
