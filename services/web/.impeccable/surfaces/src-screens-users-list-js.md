---
version: 1
slug: "src-screens-users-list-js"
primary_target: "src/screens/Users/List.js"
related_targets: []
---

# Surface brief — Admin app (Operator's Console)

**Scope / mode:** The whole authenticated admin app (list screens, detail/forms, Home Dashboard). Operate mode. Primary surface designed: the Users list (KPI row + data table); the same world carries every screen.

**Audience / job / action:** Internal operators doing fast, accurate CRUD + oversight all day (manage orgs, products, shops, users; review audit log). Secondary: adopting developers judging the boilerplate. The job is trust-at-a-glance and speed, not exploration.

**Proof / constraints:** Real dense data must read instantly. White-label: brand is a single `--primary` token (Indigo default, swappable per client) — the accent drives buttons, active nav, and the aurora glow. Semantic status colours (green/amber/red) stay separate from the brand. Full light + dark parity. Built on shadcn/ui + Radix (owned source), Tailwind v4, React 19.

**Memorable moment:** Borderless cards floating on their own light (Highlight + Shadow) over a near-white field, with an accent-tinted aurora glow kissing the top-right corner — the same in dark, where the glow sings.

**Unresolved:** Enterprise table features to build (sort indicators, sticky header, comfortable/compact density, full empty/loading/error states + refined pagination); Home Dashboard composition; whether mono numerics use JetBrains Mono vs the already-installed Geist Mono.

## Direction contract

THESIS: Bedrock's admin is an operator's console — data leads, chrome recedes. It refuses the pastel-SaaS dashboard (rounded cards on flat grey, gradient hero, whitespace inflation) and its raw-terminal opposite. A calm near-white field where borderless cards float on their own light, one brand accent does all the pointing, and dense tables read at a glance.

OWN-WORLD: Near-white ground carrying a faint accent-tinted aurora glow top-right (glow follows the brand token). Borderless cards; one depth language across light and dark — a light top-edge highlight + soft shadow, with tonal lift in dark. Headings Bricolage Grotesque; body Inter; numerics/identifiers mono, tabular. One accent (Indigo default, swappable) for primary action, active nav (tinted pill + accent text/icon) and the sort arrow. Lighter sidebar plane that recedes; hairlines only inside tables. Semantic green/amber/red kept apart from brand.

STORY: An operator lands, sees KPIs and a dense sortable table at once, trusts it instantly (precise, production-credible), and completes CRUD/oversight fast without the interface competing for attention.

FIRST VIEWPORT: Left — lighter sidebar (brand, workspace switcher, Workspace/System groups, user block; active = tinted pill + accent). Right — page title in Bricolage + search + one primary action; a 4-up KPI row of floating cards; then the users table in a floating card: sortable headers (quiet muted arrow, no accent underline), sticky header, status badges, tabular figures, pagination. The aurora glow kisses the top-right; primary action sits top-right of the header.

FORM: The Operator's Console — modern dev-tool lineage (Linear / Vercel / Stripe), ranked #6 of the grounded list, reached via a user-requested bolder re-roll and raised by the Japanese-high-density donation (density courage) and the oscilloscope's instrument numerics. Seed key ee9065fa.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance.
