---
name: Bedrock Admin
description: A production-credible, rebrandable admin design system for operators.
colors:
  ink: "oklch(0.145 0 0)"
  paper: "oklch(1 0 0)"
  primary: "oklch(0.505 0.18 266)"
  primary-on: "oklch(0.985 0 0)"
  surface-muted: "oklch(0.97 0 0)"
  ink-muted: "oklch(0.556 0 0)"
  hairline: "oklch(0.922 0 0)"
  ring: "oklch(0.708 0 0)"
  destructive: "oklch(0.577 0.245 27.325)"
  info: "oklch(0.6 0.118 248)"
  success: "oklch(0.6 0.13 150)"
  warning: "oklch(0.68 0.15 65)"
typography:
  display:
    fontFamily: "Geist Variable, system-ui, -apple-system, Segoe UI, Helvetica, Arial, sans-serif"
    fontSize: "1.875rem"
    fontWeight: 600
    lineHeight: 1.2
    letterSpacing: "-0.02em"
  headline:
    fontFamily: "Geist Variable, system-ui, -apple-system, Segoe UI, Helvetica, Arial, sans-serif"
    fontSize: "1.5rem"
    fontWeight: 600
    lineHeight: 1.25
    letterSpacing: "-0.015em"
  title:
    fontFamily: "Geist Variable, system-ui, -apple-system, Segoe UI, Helvetica, Arial, sans-serif"
    fontSize: "1.125rem"
    fontWeight: 600
    lineHeight: 1.3
    letterSpacing: "-0.01em"
  body:
    fontFamily: "Geist Variable, system-ui, -apple-system, Segoe UI, Helvetica, Arial, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: "normal"
  label:
    fontFamily: "Geist Variable, system-ui, -apple-system, Segoe UI, Helvetica, Arial, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 500
    lineHeight: 1.4
    letterSpacing: "normal"
  mono:
    fontFamily: "Geist Mono Variable, ui-monospace, SFMono-Regular, Menlo, Consolas, monospace"
    fontSize: "0.8125rem"
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: "normal"
rounded:
  sm: "6px"
  md: "8px"
  lg: "10px"
  xl: "14px"
spacing:
  sm: "8px"
  md: "16px"
  lg: "24px"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.primary-on}"
    rounded: "{rounded.md}"
    padding: "8px 16px"
    height: "36px"
  button-secondary:
    backgroundColor: "{colors.surface-muted}"
    textColor: "{colors.ink}"
    rounded: "{rounded.md}"
    padding: "8px 16px"
    height: "36px"
  button-outline:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    rounded: "{rounded.md}"
    padding: "8px 16px"
    height: "36px"
  input:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    rounded: "{rounded.md}"
    padding: "4px 12px"
    height: "36px"
  card:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    rounded: "{rounded.xl}"
    padding: "24px"
  badge:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.primary-on}"
    rounded: "{rounded.md}"
    padding: "2px 8px"
---

# Design System: Bedrock Admin

## Overview

**Creative North Star: "The Production Desk"**

Bedrock's UI should read like a finished, shipped admin product from the first paint — never a scaffold or a demo. An operator sitting down at it feels like they've opened a real, mature tool: everything is where a category-fluent user expects it, nothing is subtly off, and the interface disappears into the task. This is a workbench for people doing fast, accurate CRUD and oversight, and its credibility is the point.

The voice is **soft-gloss-minimal, warm and precise**. Restraint comes first: a warm, accent-tinted canvas, hairline structure, meaning-only color, a tight and consistent type scale. The gloss is quiet and specific, never decorative — cards sit at ~95% opacity so the warm ground *just* reads through them, and lift on a single soft shadow. The reference point is a quietly premium instrument: crafted, legible, never stark and never a playful consumer app.

Identity is a thin, swappable layer. Bedrock ships an **Indigo** brand by default, but that brand is a single white-label knob (`--primary`) an adopter changes to make the app theirs; generated screens must be indistinguishable from hand-built ones. The design system's job is to make "rebrandable by default" and "consistent by construction" true in practice. State only confirmed rejections: decorative color, heavy or hard shadows, glass-as-decoration, display type in UI chrome, and invented affordances for standard tasks.

**Key Characteristics:**
- Production-credible from the first paint; earned familiarity over novelty.
- Warm, accent-tinted canvas with soft-gloss-minimal cards (~95% opacity, one soft lift).
- Indigo brand by default, carried entirely by a single white-label token.
- Color carries meaning only — state and the one brand accent.
- One primary action per view; importance via hierarchy, never ad-hoc color.
- Brand is a single token; generated and hand-built screens are visually identical.

## Colors

An achromatic, gently warm neutral canvas where the only saturated color is meaningful — brand accent on primary actions and selection, and the semantic quartet for state. Values are authored in OKLCH in `src/styles/globals.css`; light mode is the base, dark mode inverts the same roles under `.dark`.

### Primary
- **Brand Indigo** (`oklch(0.505 0.18 266)` light · `oklch(0.62 0.17 266)` dark): the `--primary` token — the single white-label knob. It fills primary buttons, the current selection, active nav, the focus ring, and accent-tinted charts. An adopter rebrands the entire product by changing this one token (and its foreground) in light and dark; nothing else moves.

### Neutral
- **Ink** (`oklch(0.145 0 0)`): primary text and high-emphasis foreground.
- **Ink Muted** (`oklch(0.556 0 0)`): secondary text, captions, table meta, placeholder.
- **Paper** (`oklch(1 0 0)`): the app and card background — the working surface.
- **Surface Muted** (`oklch(0.97 0 0)`): secondary/accent fills — hovered rows, secondary buttons, muted panels, and the sidebar plane.
- **Hairline** (`oklch(0.922 0 0)`): borders, input strokes, and dividers. The primary structural device of the whole system.
- **Ring** (`oklch(0.708 0 0)`): focus ring color, rendered at partial opacity.

### Semantic (meaning-only)
- **Info** (`oklch(0.6 0.118 248)`): informational status and neutral notices.
- **Success** (`oklch(0.6 0.13 150)`): confirmations, healthy/active status.
- **Warning** (`oklch(0.68 0.15 65)`): caution, pending, needs-attention status.
- **Destructive** (`oklch(0.577 0.245 27.325)`): errors, destructive actions, invalid fields.

### Named Rules
**The Single-Knob Rule.** Brand identity lives in exactly one token pair (`--primary` / `--primary-foreground`, light + dark). A brand color is never hard-coded into a component; every primary button, active state, and focus emphasis reads from the token. Rebranding is a one-line change, by design.

**The Meaning-Only Color Rule.** Saturated color is reserved for the brand accent (primary actions, current selection, state indicators) and the semantic quartet. Everything else is neutral. On any given screen, chromatic pixels stay a small minority — their rarity is what makes state legible at a glance. Never use color as decoration.

## Typography

**Display / Body / Label Font:** Geist Variable (with system-ui, -apple-system, Segoe UI, Helvetica, Arial fallbacks)
**Mono Font:** Geist Mono Variable (with ui-monospace, SFMono-Regular, Menlo, Consolas fallbacks)

**Character:** One humanist-geometric sans carries the entire interface — headings, controls, labels, body, and dense data. Geist is precise and contemporary without being cold; at UI sizes it stays quiet and legible, which is exactly what an operator surface needs. Mono is reserved for IDs, tokens, code, and audit payloads.

### Hierarchy
- **Display** (600, 1.875rem/30px, line-height 1.2, tracking -0.02em): the largest page or screen title; used sparingly, one per view at most.
- **Headline** (600, 1.5rem/24px, 1.25): section and screen headers.
- **Title** (600, 1.125rem/18px, 1.3): card titles, dialog titles, panel headers.
- **Body** (400, 0.875rem/14px, 1.5): the workhorse — default UI text, form values, table cells, descriptions. Prose columns cap at 65–75ch; tables and dense UI may run wider.
- **Label** (500, 0.75rem/12px, 1.4): field labels, table column headers, badges, metadata, overline.
- **Mono** (400, 0.8125rem/13px, 1.5): identifiers, code, keys, audit-log values.

### Named Rules
**The Fixed-Scale Rule.** Type sizes are a fixed rem scale, never fluid `clamp()`. Operators view at consistent DPI across long sessions; a heading that shrinks in a sidebar or reflows by viewport reads as broken, not responsive. Steps stay in a tight ~1.2 ratio so many adjacent UI elements don't create noise.

## Layout

A conventional admin shell: a persistent left sidebar (secondary neutral plane) against a paper content canvas, with a top header for context and page-level actions. Content sits on a comfortable max width with generous gutters; dense surfaces (tables, detail panels) may use the full width.

- **Spacing rhythm** follows Tailwind's 4px base scale. The recurring rhythm is 8 / 16 / 24px; cards and panels use 24px internal padding, and 24px is the default gap between stacked sections.
- **Density** is deliberate: comfortable by default, with room to go denser on data-heavy tables where operators need to scan many rows.
- **Responsive behavior is structural, not fluid** — collapse the sidebar to icons, stack columns at breakpoints, switch tables to a responsive treatment. Type and spacing scales stay fixed. Breakpoints follow Tailwind defaults (sm 640, md 768, lg 1024, xl 1280).

## Elevation & Depth

This system uses **soft-gloss-minimal** depth. The app canvas is a warm, accent-tinted ground (`--app-ground`, light and dark). Cards sit on it at **~95% opacity** — enough that the warm ground *just* reads through, never enough to cost legibility — and lift on a **single soft shadow** (offset + blur, never a zero-offset halo). A subtle backdrop blur is a specific, restrained effect, not decoration. Borders are hairlines; a faint top highlight completes the glass. One token system carries both themes: in dark, the ground deepens to a warm-navy with an accent glow and cards tint toward the brand.

### Elevation tokens (globals.css)
- **`--app-ground`**: the warm + accent-tinted canvas gradient behind screens (not the flat `--background` token).
- **`--shadow-rest`**: the single soft lift on cards and panels (`0 1px 2px …, 0 10px 24px -14px …`).
- **`--shadow-raised`**: menus, popovers, hover elevation.
- **`--shadow-overlay`**: dialogs and sheets above dimmed content.
- Card surface recipe: `color-mix(in oklch, var(--card) 95%, transparent)` + `backdrop-filter: blur(12px)` + a `1px` hairline border + `inset 0 1px 0` top highlight.

### Named Rules
**The Soft-Gloss Rule.** Depth is one soft lift plus ~95% translucency over the warm ground — no stacked shadows, no hard or heavy shadow, no glass-as-decoration. Legibility outranks the effect: if the translucency or blur ever costs contrast, dial it back. Focus is communicated by the brand ring, never by a shadow.

## Shapes

A softened-rectangle form language. The radius scale derives from a single `--radius` base of 10px: `sm` 6px, `md` 8px, `lg` 10px, `xl` 14px. Controls (buttons, inputs, selects, badges) use `md` (8px); cards, dialogs, and larger containers use `xl` (14px), which is what gives the system its warmth without tipping into playful. Borders are consistently 1px hairlines in the `hairline` token. Avatars and status dots are the only fully round forms. Corners are never sharp (0px) and never pill-round on rectangular controls.

## Components

Every interactive component ships the full state set and shares one control vocabulary, so the same "save" button looks and behaves identically everywhere — including on generated screens.

### Buttons
- **Character:** refined, confident, quietly premium — solid controls with a soft rest lift.
- **Shape:** `md` radius (8px).
- **Primary:** `primary` (Indigo) fill, `primary-on` text (`--primary` / `--primary-foreground`), rest shadow, 8×16px padding, 36px height. One per view.
- **Secondary:** `surface-muted` fill, `ink` text — the at-most-one supporting action.
- **Outline / Ghost:** `paper`/transparent with hairline border (outline) or bare (ghost) for tertiary and toolbar actions; importance is expressed by variant, never by ad-hoc color.
- **Destructive:** `destructive` fill for irreversible actions, always paired with confirmation.
- **States:** default, hover (subtle fill/opacity shift), focus-visible (3px ring at `ring/50` + border shift), active, disabled (50% opacity, no pointer), loading (spinner replaces label, width held), and — where relevant — a distinct pending state.

### Inputs / Fields
- **Style:** transparent fill, 1px `hairline` border, `md` radius, 36px height, 12px horizontal padding, hairline `xs` shadow.
- **Focus:** border shifts to `ring` and a 3px `ring/50` ring appears — the signature focus treatment across the system.
- **Error:** `destructive` border and ring driven by `aria-invalid`; message in `destructive` below the field.
- **Disabled:** 50% opacity, not-allowed cursor.

### Cards / Containers
- **Corner:** `xl` radius (14px).
- **Background:** `paper`; **Border:** 1px `hairline`; **Shadow:** Rest (see Elevation).
- **Internal padding:** 24px; internal rhythm 24px.

### Navigation
- **Sidebar:** the `surface-muted` plane. Nav items are `body` weight; the active item uses the brand accent (fill or text + indicator); hover uses a muted fill. Collapses to icons at narrow widths.
- **Header:** paper, hairline bottom border; holds breadcrumbs/title on the left and page actions on the right.

### Badges / Status
- **Style:** `label` type; brand-accent default, semantic variants (`info`/`success`/`warning`/`destructive`) for status. Status is the primary legitimate use of color in tables.

### Feedback surfaces
- **Toasts** (Sonner): transient, top-right, semantic accent by type.
- **Skeletons:** used for loading content regions — never a centered spinner mid-content.
- **Empty states:** teach the interface (what this is, how to add the first item), never a bare "nothing here."

### Named Rules
**The One Primary Rule.** Exactly one primary button per view. Competing primaries destroy the hierarchy that makes an operator fast.

**The Seven States Rule.** Every interactive component defines default, hover, focus-visible, active, disabled, loading, and error. Shipping half of them is shipping an unfinished component.

**The Parity Rule.** A screen scaffolded by the generator must be visually and structurally indistinguishable from a hand-built one — same components, same tokens, same states. If a generated CRUD screen looks even slightly different from a hand-built equivalent, one of them is wrong. This is Bedrock's defining constraint.

## Do's and Don'ts

### Do:
- **Do** rebrand through the single `--primary` / `--primary-foreground` token pair (light + dark); optionally match `--ring` and `--sidebar-primary`.
- **Do** keep saturated color for the brand accent and the semantic quartet only; let neutrals carry everything else.
- **Do** use hairline borders as the primary structural device, with soft Rest/Raised/Overlay shadows layered on for elevation.
- **Do** use a fixed rem type scale in a tight ratio, one Geist family across the whole UI.
- **Do** give every component all seven states, skeletons for loading, and teaching empty states.
- **Do** keep generated and hand-built screens on the exact same components and tokens (Parity Rule).
- **Do** let overlays escape their container (dialog, popover, portal) so dropdowns never clip inside `overflow` ancestors.

### Don't:
- **Don't** hard-code a brand color into a component or express importance with ad-hoc color instead of variant.
- **Don't** use color as decoration, or put more than one primary action in a view.
- **Don't** use hard, heavy, or exaggerated shadows, or communicate focus with a shadow instead of the ring.
- **Don't** use fluid `clamp()` type sizing or display fonts in labels, buttons, or data.
- **Don't** reach for a modal as the first solution — exhaust inline and progressive alternatives first.
- **Don't** invent non-standard affordances (custom scrollbars, odd form controls) for standard admin tasks.
