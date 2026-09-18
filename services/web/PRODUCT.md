# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Two audiences, in order of who this design work optimizes for right now:

1. **End operators (primary focus for current work)** — internal staff/admins using an app built on Bedrock day to day: managing organizations, products, shops, applications, invites, users, and reviewing the audit log. Their job is fast, accurate CRUD and oversight, not exploration.
2. **Adopting developers** — engineers evaluating or scaffolding a new admin dashboard/SaaS backend from this boilerplate (`services/api` + `services/web`, plus the `generator` for schema-driven CRUD scaffolding). Their first impression of the default UI shapes whether they trust and keep it.

## Product Purpose

Bedrock is an open-source, full-stack boilerplate for quickly standing up an admin dashboard / SaaS backend: a Node/Mongo API (`services/api`) paired with a React admin UI (`services/web`), plus a code generator that scaffolds new CRUD screens and models from a schema. Success is twofold: developers can fork it and have a working, production-credible admin app fast, and the operators who end up using that app can do their daily admin work efficiently.

## Positioning

A batteries-included, code-generator-backed starter that pairs a real API with a real admin UI — not a low-code platform, not a single-purpose SaaS. The differentiator is that new CRUD screens generated from a schema are expected to look and behave identically to hand-built ones, because they share the same component/token system.

## Operating Context

- Local dev via `docker compose up` or `pnpm start`; admin dashboard served at `http://localhost:2200`.
- Auth flows: login, signup, invite acceptance, forgot/reset password, lockout.
- Core entities/screens: Organizations, Products, Shops, Applications, Invites, Audit Log, Settings, Onboard.
- API documentation portal generated from Markdown + OpenAPI helpers (`src/docs`).

## Capabilities and Constraints

- Stack: React 19, Vite, Tailwind CSS v4, shadcn/ui (owned source copied into `src/components/ui`) on Radix UI primitives, Bedrock Router, Sentry error monitoring, WebAuthn (`@simplewebauthn`).
- Design tokens centralized in `src/styles/globals.css` as CSS variables; brand color is a single knob (`--primary` / `--primary-foreground`, light + dark); default typeface is Geist (`@fontsource-variable/geist`).
- Dark mode via a `.dark` class on `<html>`, toggled from the user dropdown (Light / Dark / System); defaults to System, including on the logged-out auth screens, resolved before first paint to avoid a flash of the wrong theme.
- Screens like Shops and Products are reference/example CRUD implementations meant to be adapted or replaced by adopters, not fixed product features.
- Generated screens (via the schema-driven generator) must stay visually and structurally consistent with hand-built screens.

## Brand Commitments

None fixed. "Bedrock," the neutral shadcn palette, and Geist are defaults meant to be rebranded per adopter, not a binding identity — treat brand/visual choices here as swappable, not as constraints to preserve.

## Evidence on Hand

None. No real customer content, testimonials, or case studies exist in this repo; Shops/Products/etc. are placeholder CRUD demos, not real data to preserve as fact.

## Product Principles

- Operator efficiency first: scanability, consistency, and native web-admin expectations outrank decorative expression (Operate mode) for the current work.
- Production-credible defaults: the out-of-the-box look should read as a real, finished admin product, not a scaffold demo — it's also the first impression for adopting developers.
- Rebrandable by design: visual identity stays a thin, swappable layer (one primary-color token, one swappable font stack), never hard-baked into components.
- Consistency across generated and hand-built screens: the generator's schema-driven CRUD output must match hand-built UI patterns exactly.

## Accessibility & Inclusion

Built on Radix UI primitives, which are accessible by default. No additional product-specific accessibility requirement has been established beyond that baseline.
