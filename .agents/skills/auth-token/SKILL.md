---
name: auth-token
description: Mint a dev auth token for any Bedrock user and use it to call the API or to sign a browser session into the admin UI without the login form. Use when asked to authenticate as a user, act as admin, call an endpoint that needs auth, reproduce a permissions issue, or test / click through / screenshot / debug a screen in the running dashboard.
---

# Auth token

Mints an auth token for any user straight from the database, for authenticating API calls or a
browser session. Local development only — never point this at staging or production.

## Mint

```bash
cd services/api && ./scripts/tokens/mint
```

Prints a 30-day token for `ADMIN_EMAIL`; `--email <address>` mints for another user. Only Mongo has
to be up — the API does not. The script records the token's `jti` on the user document, which
`authorizeUser` requires, so a bare `jwt.sign` with `JWT_SECRET` will not authenticate.

## Use it against the API

```bash
curl -s -H "Authorization: Bearer $TOKEN" http://localhost:2300/1/users/me
```

Mint for a lower-privileged user to reproduce a permissions or role issue —
[`fixtures/users`](../../../services/api/fixtures/users) has the seeded accounts, and roles are
defined in [`src/roles.json`](../../../services/api/src/roles.json).

## Use it in the browser

Both services must be up for this:

```bash
curl -sf http://localhost:2300/1/status && curl -sfo /dev/null http://localhost:2200/
```

If either fails, start them with `docker compose up -d` from the repo root, or separately with
`cd services/api && pnpm start` and `cd services/web && pnpm start`. The API seeds fixtures
(including the admin user) on boot in `development`. In a worktree, compose will fail to bind
27017/2300 if another checkout's stack already holds them — that stack serves the same dev database,
so reuse it rather than starting a second one.

Then set the token on the `http://localhost:2200` origin:

1. `mcp__Claude_Browser__navigate` to `http://localhost:2200`.
2. `mcp__Claude_Browser__javascript_tool`:
   ```js
   sessionStorage.removeItem('jwt');
   localStorage.removeItem('session');
   localStorage.setItem('jwt', '<token>');
   ```
3. Navigate again to the screen you want.

`getToken()` reads `sessionStorage.jwt` first and falls back to `localStorage.jwt`, which is why the
session copy is cleared. `localStorage.session` is a cached user blob; stale values confuse the
session store on boot.

The dashboard now renders instead of the login screen. Prefer `read_page` / `get_page_text` over
screenshots — they are cheaper and assert text and structure. After exercising a screen, read
`read_console_messages` (errors only) and `read_network_requests` for failed API calls; a UI that
renders while a request 4xx's is still broken.

## Reference

| | |
|---|---|
| Web | `http://localhost:2200` ([`services/web/.env`](../../../services/web/.env) → `SERVER_PORT`) |
| API | `http://localhost:2300` ([`services/api/.env`](../../../services/api/.env) → `SERVER_PORT`) |
| Token storage | `localStorage.jwt` ([`token.js`](../../../services/web/src/utils/api/token.js)) |
| Mint script | [`services/api/scripts/tokens/mint`](../../../services/api/scripts/tokens/mint) |

The web app calls the API cross-origin at `API_URL`; there is no Vite proxy, so the API must be up
independently of the dev server.

Before UI edits, read [`services/web/AGENTS.md`](../../../services/web/AGENTS.md) and
[`services/web/DESIGN.md`](../../../services/web/DESIGN.md) — this skill only gets you authenticated.
