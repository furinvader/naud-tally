# Feature Layering Guide

This guide defines the logical layer rules inside one feature or one real subfeature.

It complements the feature-first structure in [`../../ARCHITECTURE.md`](../../ARCHITECTURE.md) and the area-specific implementation conventions recorded in local docs such as [`../../frontend/README.md`](../../frontend/README.md). It does not replace feature ownership, route composition, or the cross-feature [public API](../glossary.md#public-api) rules owned by each area.

## Scope

- Apply these rules inside one top-level feature or one real subfeature.
- Keep the primary structure feature-first or subfeature-first.
- Do not create `presentation/`, `application/`, `adapters/`, or `domain/` folders by convention.
- Treat public entrypoints as the [public API](../glossary.md#public-api), not as part of the layer model.
- Keep area-specific shared-module, app-shell, and tooling rules in the nearest local docs for that area.

## Layer Names

Use these four layer names when describing feature-internal responsibilities:

- `presentation`: components, templates, local view models, and screen wiring
- `application`: stores, facades, use-case orchestration, and workflow coordination
- `adapters`: repositories, storage adapters, HTTP clients, sync clients, serializers, and other infrastructure-facing boundaries
- `domain`: business types, [domain rules](../glossary.md#domain-rule), invariants, and pure transformations

## Dependency Rule

Dependencies flow inward:

```text
presentation -> application
application -> adapters
application -> domain
adapters -> domain
domain -> nothing
```

Use these rules when deciding whether one file may import another:

- `presentation` may depend on `application`.
- `presentation` may read stable `domain` types or pure display helpers when that keeps templates simple.
- `presentation` must not import `adapters`.
- `application` may depend on `domain` and `adapters`.
- `application` must not depend on `presentation`.
- `adapters` may depend on `domain`.
- `adapters` must not depend on `presentation` or `application`.
- `domain` must not depend on framework, browser, storage, transport, or dependency-injection code.

Practical shorthand:

- writes to persistent business state should flow through `application`
- browser storage, remote IO, and serialization should stay in `adapters`
- pure business rules and business types should stay in `domain`

## Feature Boundary Rule

Feature boundaries and layer boundaries are different rules.

- Cross-feature imports go through the providing feature's public entrypoint.
- Internal files inside one feature should import each other directly instead of looping through that same public entrypoint.
- Public entrypoints should export only the cross-feature surface another feature is allowed to know about.
- Repositories and other adapters are internal by default and should not be exported from the public entrypoint unless there is a deliberate reason to make them part of the feature contract.
- If you want layer-aware rules across features, the public entrypoint itself must also be split by responsibility. One mixed public API can protect internal files, but it cannot tell a linter which exports are `domain`-safe versus presentation- or application-oriented.

## Folders and Naming

In this repository, subfolders should mean ownership, not layer.

- Use subfolders for real subfeatures or clearly owned internal areas.
- Never create `presentation/`, `application/`, `adapters/`, or `domain/` folders as a default convention.
- If a future exception is ever proposed, it should be treated as a deliberate architecture change and documented explicitly before implementation.
- Express layers through local naming conventions and import rules first.

Rule of thumb:

- folder name answers "what part of the feature is this?"
- file suffix answers "what responsibility does this file have?"

If a proposed folder name answers "which layer is this?" instead of "which owned area is this?", that folder is probably the wrong abstraction for this repository.

## Local Conventions

Concrete file names, suffixes, and language-specific examples should live in the nearest area-specific docs.

- use this guide for the logical responsibilities and allowed dependency direction
- use the local area docs for concrete naming examples such as file suffixes, public entrypoint names, or area-specific tooling checks

If a file starts to span more than one responsibility, prefer splitting it rather than weakening the layer rule.

## Allowed and Disallowed Patterns

Allowed:

- `presentation` depends on local `application` code and, when needed, stable `domain` types or pure helpers
- `application` depends on local `adapters` and pure `domain` code
- `adapters` depend on `domain` types needed for persistence or transport normalization
- one feature imports another feature through that feature's public entrypoint

Disallowed:

- `presentation` imports `adapters` directly
- `adapters` import `application` code or application-owned types
- a domain file imports framework code, browser storage, HTTP clients, or dependency-injection helpers
- one feature deep-imports another feature's internal file instead of using its public entrypoint
- an internal file imports its own feature public entrypoint as a shortcut

## Adoption Guidance

- Adopt this guide incrementally instead of refactoring every feature at once.
- When an application file currently owns both orchestration and domain logic, move pure business types and rules into a domain-owned file before tightening import checks.
- When an adapter currently depends on application-owned types, move those types into `domain` or another pure file owned by the same feature.
- Start with the feature that has the clearest payoff rather than the biggest feature by file count.
- When cross-feature consumers need stricter guarantees than "public API only", create narrower public surfaces first instead of expecting a linter to infer layer intent from one mixed entrypoint.
