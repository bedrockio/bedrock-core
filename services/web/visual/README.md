# Visual + conformance gate

The Chrome-based CI cycle for the Mantine → shadcn migration
(`change-ui-framework-to-shadcn.html` §7). It drives a real Chromium against
every screen and checks **two** things:

1. **Pixel parity** — each screen matches a committed baseline.
2. **Design conformance** — each screen satisfies the UI Design Standards (§5):
   one `<h1>` title, breadcrumb, single primary action, CRUD tables, no console
   errors. See `helpers/conformance.js`.

## Layout

| File | Purpose |
| --- | --- |
| `playwright.config.js` | 4 projects: desktop/mobile × light/dark |
| `routes.js` | the screen matrix (§7.4) |
| `global-setup.js` | logs in once, saves a JWT storageState |
| `auth.spec.js` | logged-out screens — **runs with the web server alone** |
| `app.spec.js` | authenticated screens — needs a seeded API session |
| `helpers/capture.js` | settle + mask + `toHaveScreenshot` |
| `helpers/conformance.js` | §7.5 structural assertions |
| `baselines/` | committed golden images |

## Run it

```bash
# 1. Logged-out screens only (no API needed) — start the web dev server first:
yarn start &
yarn test:visual --grep "auth screen"

# 2. Full matrix (authenticated) — boot the stack + seed fixtures, then:
#    (api on :2300, web on :2200, mongo up — see root docker-compose.yml)
E2E_EMAIL=admin@example.com E2E_PASSWORD=… yarn test:visual

# Capture / refresh baselines (review the diff — it's an intentional design delta):
yarn test:visual:update
```

During the migration, scope the gate to converted screens:
`yarn test:visual --grep "login"`.

## ⚠️ Baselines are platform-specific

Playwright suffixes snapshots with the OS (`…-darwin.png`, `…-linux.png`) because
font rendering differs. **Baselines committed from macOS will not match the
Linux CI runner.** Generate the canonical (Linux) baselines in the same image CI
uses so they're byte-comparable:

```bash
docker run --rm -v "$PWD":/w -w /w/services/web --network host \
  mcr.microsoft.com/playwright:v1.60.0-jammy \
  yarn test:visual:update
```

Commit the resulting `…-linux.png` files. The `…-darwin.png` files are for local
iteration only.

## Tightening conformance

`app.spec.js` ships the standards checks **off** so the gate doesn't fail screens
still on Mantine. As each screen is migrated, flip its flags on
(`expectBreadcrumb`, `expectTable`, `expectSinglePrimary`) — the gate then
enforces the standard for that screen going forward (§7.5).

## Env

| Var | Default | Notes |
| --- | --- | --- |
| `PLAYWRIGHT_BASE_URL` | `http://localhost:2200` | web app |
| `API_URL` | `http://localhost:2300` | for login |
| `E2E_EMAIL` / `E2E_PASSWORD` | — | seeded admin; unset → app screens skip |
