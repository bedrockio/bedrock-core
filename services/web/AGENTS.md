# AGENTS.md — Bedrock Web (admin UI)

Contract for any agent (Claude Code, Cursor, Codex, …) writing or editing UI in `services/web`.
Read this, then the two design documents it points to, **before** building a screen or component.

## What this app is

A React admin UI for the Bedrock boilerplate — the operator-facing dashboard (Organizations,
Products, Shops, Applications, Invites, Users, Audit Log, Settings). Optimised first for **end
operators** doing fast, accurate CRUD, and second for **adopting developers** forking Bedrock.
Full product context: [PRODUCT.md](PRODUCT.md).

## Stack

- **React 19** + **Vite 6**, JavaScript/JSX (not TypeScript — `components.json` has `tsx: false`).
- **Tailwind CSS v4** (`@tailwindcss/vite`) — CSS-first config, no `tailwind.config`.
- **shadcn/ui** on **Radix UI** primitives — owned source copied into `src/components/ui`.
- **Bedrock Router** (`@bedrockio/router`), **Sentry**, **WebAuthn** (`@simplewebauthn`).
- Package manager **pnpm**; Node **>= 26**.

## The design system is a contract — follow it

Three source-of-truth files govern all visual work. Do not invent a look; apply this one.

1. **[DESIGN.md](DESIGN.md)** — the visual system (tokens + doctrine). **Read it before any UI edit.**
2. **[.impeccable/design.json](.impeccable/design.json)** — machine-readable sidecar (ramps, shadows, component snippets).
3. **[src/styles/globals.css](src/styles/globals.css)** — the live tokens (CSS variables), light + dark.

### Non-negotiable rules (from DESIGN.md)

- **Brand is one white-label knob.** The brand is Indigo by default, defined only by `--primary` /
  `--primary-foreground` in `:root` and `.dark`. **Never hard-code a brand colour** in a component;
  read it from the token. `--ring`, `--sidebar-primary` and accent charts already follow it.
- **Style through tokens, never literals.** Use `bg-primary`, `text-muted-foreground`, `border`,
  `var(--…)` — never a raw hex/oklch in a component. New meaning → add a token in `globals.css` first.
- **Soft-gloss-minimal depth.** Cards sit at ~95% opacity over `--app-ground` and lift on the single
  `--shadow-rest`. No stacked/hard shadows, no glass-as-decoration. Focus is the ring, never a shadow.
- **Meaning-only colour.** Saturated colour = brand accent + the semantic set (`--info` / `--success`
  / `--warning` / `--destructive`). Everything else is neutral.
- **One primary action per view.** Importance is expressed by variant/hierarchy, never ad-hoc colour.
- **Seven states on every interactive component:** default, hover, focus-visible, active, disabled,
  loading, error — plus skeletons for loading and teaching empty states.
- **Parity.** A generator-scaffolded screen must be visually and structurally indistinguishable from a
  hand-built one — same components, same tokens.

## Components

- **Reuse `src/components/ui/*` (shadcn) first.** Don't hand-roll a button, dialog, input, table, etc.
  that already exists there.
- Add a missing shadcn component with `npx shadcn@latest add <name>` (writes JS into `src/components/ui`).
  Before adopting an upstream change to an existing one, diff it: `npx shadcn@latest add <name> --diff`
  (it flags real drift, but our local customisations — e.g. Alert's `success`/`info`/`warning` variants —
  must be preserved; never blind-overwrite).
- App-specific composed components live in `src/components/*`; screens in `src/screens/*`; shells in
  `src/layouts/*`.
- Icons: **lucide-react** (shadcn default); `react-icons/pi` is also used in the app shell. Match the
  surrounding file — never Unicode/emoji as icons.
- Type: **Geist** (`--font-sans`) / **Geist Mono** (`--font-mono`). One family across the UI.

## Imports & aliases (jsconfig.json)

- `@/*` → `src/*` (shadcn convention: `@/components/ui/button`, `@/lib/utils`).
- Bare app aliases: `components/`, `screens/`, `layouts/`, `stores/`, `hooks/`, `utils/`, `helpers/`,
  `styles/`, `docs/`. Match the style already used in the file you're editing.

## Enforcement & design workflow

- An **Impeccable design detector hook** runs automatically after UI edits and surfaces findings —
  act on them. For real design work (new surface, restyle, critique), invoke the **`impeccable`** skill
  and follow its playbook (`craft-floor.md` before any UI edit; `operate.md` for admin surfaces).
- After a batch of UI edits, run `/impeccable audit` and `/impeccable critique <target>` before shipping.

## Commands

```bash
pnpm start      # dev server → http://localhost:2200
pnpm build      # vite production build
pnpm test       # vitest
pnpm lint       # eslint
```
(Or `docker compose up` from the repo root for the full stack.)

## Don'ts

- Don't introduce TypeScript syntax in `.js`/`.jsx` files (the project is JS; `tsx: false`).
- Don't add raw colours, fluid `clamp()` type sizing, display fonts in UI chrome, or a modal as the
  first solution.
- Don't reach for a component library other than the vendored shadcn/ui + Radix.
