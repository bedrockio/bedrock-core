---
name: Bedrock Admin — Operator's Console
description: A data-first, white-label admin console for operators.
colors:
  ink: 'oklch(0.24 0.008 285)'
  paper: 'oklch(1 0 0)'
  primary: 'oklch(0.505 0.18 266)'
  primary-on: 'oklch(0.985 0 0)'
  surface-muted: 'oklch(0.97 0 0)'
  ink-muted: 'oklch(0.556 0 0)'
  hairline: 'oklch(0.922 0 0)'
  ring: 'oklch(0.55 0.16 266)'
  sidebar: 'oklch(0.978 0.004 285)'
  destructive: 'oklch(0.577 0.245 27.325)'
  info: 'oklch(0.6 0.118 248)'
  success: 'oklch(0.6 0.13 150)'
  warning: 'oklch(0.68 0.15 65)'
typography:
  display:
    fontFamily: 'Bricolage Grotesque, Geist Variable, system-ui, sans-serif'
    fontSize: '1.5rem'
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: '-0.01em'
  title:
    fontFamily: 'Bricolage Grotesque, Geist Variable, system-ui, sans-serif'
    fontSize: '1.125rem'
    fontWeight: 700
    lineHeight: 1.3
    letterSpacing: '-0.01em'
  body:
    fontFamily:
      'Geist Variable, system-ui, -apple-system, Segoe UI, Helvetica, Arial,
      sans-serif'
    fontSize: '0.875rem'
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: 'normal'
  label:
    fontFamily: 'Geist Variable, system-ui, sans-serif'
    fontSize: '0.75rem'
    fontWeight: 600
    lineHeight: 1.4
    letterSpacing: '0.03em'
  mono:
    fontFamily:
      'Geist Mono Variable, ui-monospace, SFMono-Regular, Menlo, Consolas,
      monospace'
    fontSize: '0.8125rem'
    fontWeight: 500
    lineHeight: 1.4
    letterSpacing: 'normal'
rounded:
  sm: '6px'
  md: '8px'
  lg: '10px'
  xl: '14px'
  2xl: '16px'
spacing:
  sm: '8px'
  md: '16px'
  lg: '24px'
components:
  button-primary:
    backgroundColor: '{colors.primary}'
    textColor: '{colors.primary-on}'
    rounded: '{rounded.md}'
    padding: '8px 16px'
    height: '36px'
  card:
    backgroundColor: '{colors.paper}'
    textColor: '{colors.ink}'
    rounded: '{rounded.2xl}'
    padding: '20px'
  stat-card:
    backgroundColor: '{colors.paper}'
    textColor: '{colors.ink}'
    rounded: '{rounded.2xl}'
    padding: '16px'
  input:
    backgroundColor: '{colors.paper}'
    textColor: '{colors.ink}'
    rounded: '{rounded.md}'
    padding: '4px 12px'
    height: '36px'
---

# Design System: Bedrock Admin — Operator's Console

## Overview

**Creative North Star: "The Operator's Console"**

Bedrock's admin is a console for operators who live in data all day — managing
organizations, shops, products, users, and reviewing the audit log. Data leads;
chrome recedes. The surface is a calm, near-white field over which **borderless
cards float on their own light**, a single brand accent does all the pointing,
and dense tables read at a glance. It should read as a finished, precise,
production-credible tool from the first paint — the modern dev-console lineage
(Linear / Vercel / Stripe), raised toward information density.

It refuses the two category defaults: the pastel-SaaS dashboard (rounded cards
on a flat grey slab, a gradient hero, whitespace inflation) and its raw-terminal
opposite. Instead: a warm-neutral-to-cool light field carrying a faint
**accent-tinted aurora glow** at the top-right, cards with no borders that lift
on one soft Highlight + Shadow depth, characterful **Bricolage** headings
against a quiet workhorse body, and a decisive, swappable accent.

Identity is a thin, swappable layer. Bedrock ships **Indigo** by default, but
the brand is a single white-label token (`--primary`) — an adopter changes it
and the whole system, including the aurora glow, re-tints coherently. Generated
screens must be indistinguishable from hand-built ones.

**Key Characteristics:**

- Data-first; the interface disappears into the task (Operate mode).
- Borderless cards floating on ONE Highlight + Shadow depth, light and dark.
- A faint accent-tinted aurora glow that follows the white-label brand token.
- Bricolage display headings over a Geist body and tabular-mono numerics.
- One decisive accent; semantic status colour kept apart from the brand.

## Colors

A cool-neutral field where the only saturated colour is meaningful — the brand
accent on primary actions, active nav, and the aurora glow, plus the semantic
quartet for state. Authored in OKLCH in `src/styles/globals.css`; light is the
base, dark inverts the roles under `.dark`.

### Primary

- **Brand Indigo** (`oklch(0.505 0.18 266)` light · `oklch(0.62 0.17 266)`
  dark): the `--primary` token — the single white-label knob. It fills primary
  buttons, the active-nav pill and text, the focus ring, the sort chevron, and
  (as a `color-mix`) the aurora glow and stat-card icon chips. An adopter
  rebrands the whole product by changing this token pair; every accent surface
  and the glow follow.

### Neutral

- **Ink** (`oklch(0.17 0 0)`): primary text.
- **Ink Muted** (`oklch(0.556 0 0)`): labels, captions, table meta,
  placeholders.
- **Paper** (`oklch(1 0 0)`): card surface — the working plane the data sits on.
- **Sidebar** (`oklch(0.978 0.004 285)` light · `oklch(0.145 0.01 285)` dark): a
  lighter (light) / deeper (dark) recessive plane, faintly cool.
- **Hairline** (`oklch(0.922 0 0)`): the only rules in the system — inside
  tables and dividers. Cards carry none.

### Semantic (meaning-only)

- **Info** `oklch(0.6 0.118 248)` · **Success** `oklch(0.6 0.13 150)` ·
  **Warning** `oklch(0.68 0.15 65)` · **Destructive**
  `oklch(0.577 0.245 27.325)`. Status badges are the primary legitimate use of
  colour in tables.

### Named Rules

**The Single-Knob Rule.** Brand identity is exactly one token pair (`--primary`
/ `--primary-foreground`, light + dark). Never hard-code a brand colour in a
component; the aurora glow, accents, and active states all `color-mix` from it,
so a rebrand is a one-line change and the whole system re-tints.

**The Meaning-Only Colour Rule.** Saturated colour is the brand accent plus the
semantic quartet; everything else is neutral. Semantic status colours stay fixed
regardless of the brand accent — brand ≠ meaning — so a green Active badge still
reads under an emerald brand.

## Typography

**Display Font:** Bricolage Grotesque (headings, page/section/card titles,
brand) — a contemporary grotesque with genuine character. **Body Font:** Geist
Variable (with system-ui fallbacks) — a quiet, precise workhorse. **Mono Font:**
Geist Mono Variable — every figure, identifier, timestamp, and count, set
`tabular-nums`.

**Character:** Bricolage gives the console a distinct, confident voice at the
title level; the body stays neutral so dense data leads; tabular mono keeps
numbers aligned in columns. (The exploration referenced Inter + JetBrains Mono
for body/numerics; Bedrock ships the near-identical already-self-hosted Geist
pair to avoid extra font downloads — a deliberate, swappable substitution.)

### Hierarchy

- **Display** (Bricolage 700, ~1.5rem, tracking -0.01em): page titles ("Users",
  "Welcome back, …").
- **Title** (Bricolage 700, 1.125rem): card and section titles.
- **Body** (Geist 400, 0.875rem/14px): the workhorse — table cells, form values,
  descriptions.
- **Label** (Geist 600, 0.75rem, tracking 0.03em, UPPERCASE): column headers,
  KPI labels, section eyebrows, overline.
- **Mono** (Geist Mono 500, 0.8125rem, tabular): KPI values, table figures, IDs,
  timestamps.

### Named Rules

**The Fixed-Scale Rule.** A fixed rem scale, never fluid `clamp()`. Operators
view at consistent DPI across long sessions.

## Layout

A conventional operator shell: a lighter, recessive left sidebar against the
`--app-ground` content canvas, with the page title, search, and one primary
action across the top. Content sits at a comfortable width; dense tables use the
full width.

- **App ground** (`--app-ground`): a warm-neutral-to-cool near-white field
  (dark: near-black) carrying a faint **accent-tinted aurora glow** in the
  top-right corner — the glow follows `--primary`. Applied at layout level, not
  to the flat `--background` token.
- **Spacing rhythm** follows Tailwind's 4px base; cards use 16–20px padding;
  24px between stacked sections.
- **Responsive** is structural: the sidebar collapses to a header-menu drawer on
  mobile; tables scroll within their card; type and spacing stay fixed.
  Breakpoints follow Tailwind defaults.

## Elevation & Depth

**Borderless, floating, one language across both modes.** Cards have **no
border**; they float on a single **Highlight + Shadow** treatment: a light
top-edge highlight + a soft offset shadow, tuned per theme (in dark, a subtle
tonal lift and a stronger shadow carry it). The `.card-soft` recipe applies it
to every card — KPI cards, table panels, dashboard tiles. The aurora ground
gives cards something to float above; in dark it deepens to near-black with the
accent glow.

### Elevation tokens (globals.css)

- **`--app-ground`**: the accent-tinted aurora canvas (light + dark).
- **`.card-soft`**: borderless card surface + the Highlight + Shadow box-shadow
  (with a `.dark` override).
- Tables expand to their full height inside the floating card; the page scrolls,
  not the card (no nested scrollbar). Narrow viewports scroll the table
  horizontally within its own `overflow-x` container so the page body never
  scrolls sideways.

### Named Rules

**The Float Rule.** Cards are borderless and defined by light — the Highlight +
Shadow — never by a hairline box. Depth is one soft offset+blur shadow plus a
light top edge; never a hard or zero-offset halo, never glass-as-decoration. The
same recipe carries light and dark so a card is the same object in both. Focus
is the brand ring, never a shadow.

## Shapes

Softened rectangles. Cards and panels use the `2xl` radius (16px); controls
(buttons, inputs, badges) use `md` (8px). Avatars and status dots are the only
round forms. Corners are never sharp and never pill on rectangular controls. The
only 1px rules in the system are hairlines inside tables and dividers.

## Components

Every interactive component ships the full state set and shares one vocabulary,
so generated and hand-built screens match.

### Buttons

- **Primary:** `primary` (Indigo) fill, white text, `md` radius, a soft accent
  glow shadow. One per view.
- **Ghost / Outline:** paper fill + hairline for secondary/toolbar actions;
  importance is by variant, never ad-hoc colour.
- **Destructive:** `destructive` fill, always with confirmation.
- **States:** default, hover, focus-visible (ring), active, disabled (50%),
  loading.

### Cards & Stat cards

- Borderless, `2xl` radius, `.card-soft` Highlight + Shadow. Stat cards:
  uppercase label, big tabular-mono value, muted context hint; optional
  accent-tinted icon chip (`bg-primary/10 text-primary`).

### Tables (the core surface)

- Panel is a borderless floating card that **expands to full height** — the page
  scrolls, not the card. A wide table scrolls horizontally within its own
  `overflow-x` container so the body never scrolls sideways. Uppercase header
  row. Cells carry comfortable edge padding (24px against the card, 12px between
  columns) so data never hugs the border.
- **Header labels** are near-black (`--ink`, Geist 600 uppercase) and uniform
  across every column — readable, not a muted micro-label. Colour never marks
  the sorted column.
- **Sort:** sortable columns show a muted up/down on hover; the active column
  shows its direction chevron in the brand accent (no accent underline, and no
  darkened text — the chevron alone marks it).
- **Density:** a global **Comfortable / Compact** preference (`data-density` on
  `<html>`, toggled in the footer like dark mode) tightens rows for long lists.
- **States:** skeleton rows while loading (`Search.Loading`), teaching empty
  states ("No X yet — do this next"), error surfaced in the toolbar status.
  Rows: neutral hover, no accent tint.

### Navigation

- **Sidebar:** a lighter/deeper recessive plane. Brand + workspace switcher, a
  single **Workspace** nav group (uppercase label), and a **user block** at the
  bottom-left whose dropdown holds account and app actions — My Settings,
  Organization Settings, the theme choice (Light / Dark / System), and Log Out.
  **Active item** = tinted pill (`bg-primary/12`) + accent text and icon. There
  is no app footer — theme lives in the user dropdown, and the old density
  toggle and "powered by" logo are gone.
- **Settings areas** are pages with a secondary nav: **My Settings** (horizontal
  tabs) and **Organization Settings** (a persistent vertical nav that houses the
  org-level admin sections — Templates, Applications, Audit Log — under
  `/organization/*`).
- **Header:** page title (Bricolage) + breadcrumb, with search and the primary
  action on the right.
- **Create / edit forms are pages, not modals** (so forms can be large). Every
  such page carries the same dismiss pattern: a **close (✕)** icon top-right
  (returns to the list for a new object, the detail for an edit), and a quiet
  **Cancel** beside the primary submit at the bottom. In edit mode the row's `…`
  menu is hidden — the header offers only the ✕. Breadcrumbs read
  `Home / <Section> / New <Object>` (create) or `Home / <Section> / <Name>`
  (edit).

- An at-a-glance overview that is also a launchpad: breadcrumb + "Dashboard"
  title (no greeting); a five-tile KPI strip (Products and Shops drill into
  their sections, plus Featured, Expiring-soon, and Catalog value); a **Top
  shops** row of three storefront cards (stats + a share-of-catalog-value bar,
  each opening that shop); then a **Catalog analytics** section — the "Catalog
  by price" distribution beside a Featured-mix donut with average/median price.
  Every section header links to its full view (`All shops →`,
  `View products →`).
- Counts are exact (search `meta.total`, filtered for Featured/Expiring).
  Catalog value, avg/median price, the price distribution, and the per-shop
  rollups are computed client-side from a bounded product sample.
- **Charts** live in a `card-soft` panel and use the brand accent for the data
  mark (`bg-primary` bars) over a muted track, mono tabular figures, and no
  chart library — a lightweight bar built from the same tokens as everything
  else.

### Icons

- **One system: Lucide** (`lucide-react`), consistent stroke. Brand marks Lucide
  lacks (Apple/Google) are inline SVG — the single exception.

### Named Rules

**The One Primary Rule.** Exactly one primary button per view. **The Seven
States Rule.** Every interactive component defines default, hover,
focus-visible, active, disabled, loading, and error; tables add skeleton-loading
and teaching empty states. **The Parity Rule.** A generator-scaffolded screen
must be visually and structurally indistinguishable from a hand-built one — same
components, same tokens. Bedrock's defining constraint.

## Do's and Don'ts

### Do:

- **Do** rebrand through the single `--primary` / `--primary-foreground` pair;
  the aurora glow and every accent follow it.
- **Do** keep cards borderless, floating on `.card-soft`; let the Highlight +
  Shadow define them, not a box.
- **Do** keep saturated colour for the brand accent and the semantic quartet
  only; semantic colours stay fixed across brands.
- **Do** set headings in Bricolage, body in Geist, and every figure in tabular
  mono.
- **Do** give tables an uppercase header row, a clear sort affordance, density,
  skeletons, and teaching empty states.
- **Do** keep generated and hand-built screens on the exact same components and
  tokens (Parity Rule).

### Don't:

- **Don't** put a border on a card, or define depth with a hard/zero-offset
  halo, or use glass-as-decoration.
- **Don't** hard-code a brand colour, or let the accent decorate rather than
  point.
- **Don't** accent-underline the sorted column or tint the hovered row — keep
  the data calm.
- **Don't** use fluid `clamp()` sizing or a display font in table data.
- **Don't** mix icon families or use Unicode/emoji as icons.
