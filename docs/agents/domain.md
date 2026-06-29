# Domain Docs

How the engineering skills should consume this repo's domain documentation.

## Layout

This repo uses a single-context layout:

- `CONTEXT.md` at the repo root for domain language and glossary
- `docs/adr/` for architectural decision records

## Consumer rules

Before exploring an area, read `CONTEXT.md` if it exists.

Read ADRs in `docs/adr/` when they touch the area being changed.

If these files do not exist, proceed silently. The domain-modeling flow can create them later when terminology or decisions are resolved.

When output names a domain concept, use the term as defined in `CONTEXT.md`. If the needed concept is missing, note it as a domain-modeling gap.

If work contradicts an existing ADR, surface the conflict explicitly.
