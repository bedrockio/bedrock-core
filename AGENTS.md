# AGENTS.md — Bedrock

Bedrock is an open-source, full-stack boilerplate for standing up an admin dashboard / SaaS backend:
a Node/Mongo API paired with a React admin UI, plus a schema-driven code generator. New CRUD screens
generated from a schema must look and behave identically to hand-built ones.

## Monorepo layout

- **`services/api`** — Node + MongoDB API.
- **`services/web`** — React 19 admin UI (Vite, Tailwind v4, shadcn/ui). **See
  [services/web/AGENTS.md](services/web/AGENTS.md) before doing any UI work** — it carries the design
  system contract (PRODUCT.md + DESIGN.md + tokens) that all screens must follow.
- **`generator`** — scaffolds CRUD screens + models from a schema; its output must stay visually and
  structurally consistent with hand-built `services/web` screens.

## Conventions

- Package manager **pnpm**; Node **>= 26**. Full stack locally via `docker compose up`.
- **Design/UI**: the visual standard lives in `services/web` — `PRODUCT.md` (who/why), `DESIGN.md`
  (visual system), `THEME.md` (branding + theming), and `src/styles/globals.css` (tokens). Brand is
  a single white-label knob (`--primary`, Indigo by default). Never hard-code brand colours.

## Skills

Shared agent skills live in `.agents/skills/<name>/SKILL.md` and are tracked. Tool-specific skill
directories (`.claude/`, `.github/skills/`) are gitignored, so point your tool at the shared ones:

```bash
mkdir -p .claude && ln -sfn ../.agents/skills .claude/skills
```

Work inside the relevant service; prefer its own AGENTS.md and existing patterns over global assumptions.
