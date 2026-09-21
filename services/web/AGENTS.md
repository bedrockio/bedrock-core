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

## What this app is

A React admin UI for the Bedrock boilerplate: the operator-facing dashboard. Optimised first
for **end operators** doing fast, accurate CRUD, and second for **adopting developers** forking
Bedrock. Shops and Products are replaceable CRUD demos, not fixed features.

## Stack

React 19 + Vite 6, **JavaScript/JSX — not TypeScript** (`components.json` has `tsx: false`),
Tailwind CSS v4 (CSS-first, no `tailwind.config`), shadcn/ui on Radix primitives with the source
vendored into `src/components/ui`. Package manager pnpm; Node >= 26. Full list: [README.md](README.md).

## Working rules

- **Reuse `src/components/ui/*` first.** Don't hand-roll a button, dialog, input or table that
  already exists. Adding or updating one: see [THEME.md](THEME.md#adding-components).
- **Style through tokens, never literals.** New meaning → add a token in `globals.css` first.
  The rest of the visual doctrine is in [DESIGN.md](DESIGN.md).
- **Where code goes:** composed components in `src/components/*`, screens in `src/screens/*`,
  shells in `src/layouts/*`.
- **Icons:** lucide-react. Never Unicode or emoji as icons.
- **Imports:** `@/*` → `src/*` (shadcn convention). Bare aliases also exist — `components/`,
  `screens/`, `layouts/`, `stores/`, `hooks/`, `utils/`, `helpers/`, `styles/`, `docs/`. Match
  the file you're editing.

## Commands

```bash
pnpm start      # dev server → http://localhost:2200
pnpm build      # vite production build
pnpm test       # vitest
pnpm lint       # eslint
```

(Or `docker compose up` from the repo root for the full stack.)

## Don'ts

- Don't add raw colours, fluid `clamp()` type sizing, display fonts in UI chrome, or reach for a
  modal as the first solution.
- Don't introduce a component library other than the vendored shadcn/ui + Radix.
