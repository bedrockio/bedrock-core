# Theming

How to rebrand the admin UI. The visual system itself — the rules behind these
tokens — lives in [DESIGN.md](DESIGN.md).

The UI is built on [shadcn/ui](https://ui.shadcn.com/) + Tailwind CSS v4. All
design tokens live in **`src/styles/globals.css`** as CSS variables, defined for
both light (`:root`) and dark (`.dark`).

## Brand colour

The primary colour is a single knob. To brand the app, change `--primary` and
`--primary-foreground` in **both** `:root` and `.dark` (they are tagged
`BRAND PRIMARY` inline). This drives every primary button, the active tab
indicator and (optionally) the focus ring — nothing else needs to change.

```css
/* src/styles/globals.css — example: a green brand */
:root  { --primary: oklch(0.55 0.12 152); --primary-foreground: oklch(0.985 0 0); }
.dark  { --primary: oklch(0.62 0.13 152); --primary-foreground: oklch(0.205 0 0); }
```

## Font

The app ships [Geist](https://vercel.com/font) (bundled via
`@fontsource-variable/geist`, so it's stable across platforms). It's wired in
two places — swap both to use a different font:

- the imports in `src/Wrapper.js` (`@fontsource-variable/geist*`)
- the `--font-sans` / `--font-mono` tokens in `src/styles/globals.css`

## Dark mode

`ThemeProvider` (`src/components/ThemeProvider.jsx`) toggles a `.dark` class on
`<html>`. Choose Light, Dark or System from **Appearance** in the account menu;
the choice persists to `localStorage`.

It defaults to **System**, so a visitor who has never picked a theme gets their
OS preference — including on the logged-out auth screens. `index.html` resolves
the same choice synchronously before first paint to avoid a flash of the wrong
theme.

## Adding components

shadcn components live in `src/components/ui`. Add more with the CLI (config in
`components.json`):

```bash
npx shadcn@latest add <component>
```

Before pulling an upstream change into a component you already have, diff it
first — local customisations (for example Alert's `success` / `info` /
`warning` variants) must be preserved:

```bash
npx shadcn@latest add <component> --diff
```
