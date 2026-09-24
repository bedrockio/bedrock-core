# AGENTS.md — Bedrock Web (admin UI)

Contract for any agent (Claude Code, Cursor, Codex, …) writing or editing UI in `services/web`.

This file routes; it does not restate. Each fact below lives in exactly one place, so fixing
it once fixes it everywhere.

## Read first

| Question | File |
|---|---|
| Who uses this and why? | [PRODUCT.md](PRODUCT.md) |
| What may I make it look like? | [DESIGN.md](DESIGN.md) — **read before any UI edit** |
| How do I rebrand / theme it? | [THEME.md](THEME.md) |
| How do I run, test, configure it? | [README.md](README.md) |
| What are the live token values? | [src/styles/globals.css](src/styles/globals.css) |

**[DESIGN.md](DESIGN.md) is the design contract.** Do not invent a look, and do not copy its
rules into other files — apply them from there.

## Stack

**JavaScript/JSX — not TypeScript** (`components.json` has `tsx: false`). Tailwind v4 is
CSS-first: there is no `tailwind.config`. Full list: [README.md](README.md#frameworks-used).

## Working rules

- **Reuse `src/components/ui/*` first.** Don't hand-roll a button, dialog, input or table that
  already exists, and don't add another component library. Adding or updating one: see
  [THEME.md](THEME.md#adding-components).
- **Style through tokens, never literals.** New meaning → add a token in `globals.css` first.
  The rest of the visual doctrine is in [DESIGN.md](DESIGN.md).
- **Where code goes:** composed components in `src/components/*`, screens in `src/screens/*`,
  shells in `src/layouts/*`.
- **Imports:** `@/*` → `src/*` (shadcn convention). Bare aliases also exist — `components/`,
  `screens/`, `layouts/`, `stores/`, `hooks/`, `utils/`, `helpers/`, `styles/`, `docs/`. Match
  the file you're editing.
