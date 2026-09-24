# AGENTS.md — Bedrock

Bedrock is an open-source, full-stack boilerplate for standing up an admin dashboard / SaaS backend:
a Node/Mongo API paired with a React admin UI.

## Monorepo layout

- **`services/api`** — Node + MongoDB API.
- **`services/web`** — React 19 admin UI. **See [services/web/AGENTS.md](services/web/AGENTS.md)
  before any UI work** — it routes to the design contract all screens must follow.

## Skills

Shared agent skills live in `.agents/skills/<name>/SKILL.md`. `.claude/skills` is a committed symlink
to that directory so Claude Code finds them; point other tools at `.agents/skills` the same way.
Windows checkouts need `core.symlinks=true` or the link lands as a text file and no skill loads.

Work inside the relevant service; prefer its own AGENTS.md and existing patterns over global assumptions.
