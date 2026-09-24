# Product

## Platform

web

## Users

Two audiences, in order of who this design work optimizes for right now:

1. **End operators (primary focus for current work)** — internal staff/admins using an app built on Bedrock day to day: working record lists, drilling into details, editing through forms and reviewing history. Their job is fast, accurate CRUD and oversight, not exploration.
2. **Adopting developers** — engineers evaluating or scaffolding a new admin dashboard/SaaS backend from this boilerplate (`services/api` + `services/web`). Their first impression of the default UI shapes whether they trust and keep it.

## Product Purpose

Bedrock is an open-source, full-stack boilerplate for quickly standing up an admin dashboard / SaaS backend: a Node/Mongo API (`services/api`) paired with a React admin UI (`services/web`). Success is twofold: developers can fork it and have a working, production-credible admin app fast, and the operators who end up using that app can do their daily admin work efficiently.

## Positioning

A batteries-included starter that pairs a real API with a real admin UI — not a low-code platform, not a single-purpose SaaS.

## Operating Context

- Auth flows: login, signup, invite acceptance, forgot/reset password, lockout.
- Core screens: Organizations, Users, Invites, Templates, Audit Log, Settings, Onboard, plus Shops and Products as replaceable CRUD demos.
- API documentation portal generated from Markdown + OpenAPI helpers (`src/docs`).

## Capabilities and Constraints

- Stack and theming are documented where they're maintained, not restated here: [README.md](README.md) for the stack and setup, [THEME.md](THEME.md) for branding and dark mode, [DESIGN.md](DESIGN.md) for the visual system.
- Brand is a single white-label knob, so visual identity stays swappable per adopter rather than baked into components.
- Screens like Shops and Products are reference/example CRUD implementations meant to be adapted or replaced by adopters, not fixed product features.

## Brand Commitments

None fixed. "Bedrock," the Indigo primary, and the Geist + Bricolage Grotesque fonts are defaults meant to be rebranded per adopter, not a binding identity — treat brand/visual choices here as swappable, not as constraints to preserve.

## Evidence on Hand

None. No real customer content, testimonials, or case studies exist in this repo; Shops/Products/etc. are placeholder CRUD demos, not real data to preserve as fact.

## Product Principles

- Operator efficiency first: scanability, consistency, and native web-admin expectations outrank decorative expression (Operate mode) for the current work.
- Production-credible defaults: the out-of-the-box look should read as a real, finished admin product, not a scaffold demo — it's also the first impression for adopting developers.
- Rebrandable by design: visual identity stays a thin, swappable layer (one primary-color token, one swappable font stack), never hard-baked into components.
- Accessible by default: built on Radix primitives, with no product-specific requirement established beyond that baseline.
