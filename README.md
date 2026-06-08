# Bedrock Platform

More documentation about specific services and components can be found in the following sections:

- [deployment/](deployment/) - Provisioning, Deployment automation, how to's, playbooks and procedures
- [services/api](services/api) - Data API and data model layer that powers all applications
- [services/web](services/web) - Web application and administration dashboard

## Quick Start

Using Docker Compose you can build and run all services and dependencies as follows:

```bash
docker compose up
```

Open the dashboard at http://localhost:2200/ - Admin login credentials can be seen in the API output.

## Package Management

This repo uses [pnpm](https://pnpm.io/). Node is pinned via [Volta](https://volta.sh/);
pnpm is pinned via the `packageManager` field in each `package.json`. Install pnpm once with
`npm install -g pnpm` (Node 26 no longer bundles corepack). Each service is installed
independently from its own directory:

```bash
cd services/api && pnpm install   # likewise services/web
```

### Supply-chain hardening

Each service's `pnpm-workspace.yaml` enables a few pnpm
[supply-chain](https://pnpm.io/supply-chain-security) protections:

- `minimumReleaseAge: 10080` — refuse to install any package version published less than
  **7 days** ago (lets malware in a fresh release be caught before it lands here). A
  too-new pin in the lockfile is rejected on install; re-resolve to pick a compliant
  version.
- `blockExoticSubdeps: true` — block transitive dependencies that resolve from git/tarball
  URLs instead of the registry.
- `allowBuilds:` — an explicit allowlist of the only dependencies permitted to run install
  scripts (pnpm blocks all others by default). Add a package here if a build it needs is
  being skipped.

### Git worktrees

Worktrees work out of the box — pnpm shares the global content-addressable store across all
worktrees via hardlinks, so each worktree's `pnpm install` is fast and disk-cheap.

If you run **many** parallel worktrees and want to also share the *virtual* store (the
`.pnpm` symlink farm), you can opt in to pnpm's
[global virtual store](https://pnpm.io/git-worktrees) — but enable it in **your own global
pnpm config**, not in the committed `pnpm-workspace.yaml`:

```bash
pnpm config set --global enableGlobalVirtualStore true
```

It is deliberately kept out of the committed config: it turns `node_modules` into symlinks
into an external store, which is great for local worktrees but breaks self-contained Docker
images and the cross-stage copies in the production builds. CI and Docker therefore always
use the committed `nodeLinker: hoisted` (self-contained) layout.

### API Documentation

Full portal with examples:

http://localhost:2200/docs/getting-started

Code documentation:

[services/api](services/api)

### Web Documentation

[services/web](services/web)
