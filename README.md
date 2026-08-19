# vernel

Read spacing and type metrics off any element without opening devtools.

Devtools splits these across separate panels — you check `font-size` in one
place and `margin` in another, and lose the relationship between them. vernel
treats spacing and typography as one problem and annotates the live page with
both at once.

## Install

```sh
npm install vernel
```

## Use

```js
import vernel from 'vernel';

const inspector = vernel({ baseline: 8 });
inspector.enable();
```

Hover anything. `Alt+V` toggles it.

```
┌ Headline Block ─────────────────────── Geist 600  Aa 2.6rem  ↕ 1.15  ↔ -0.02em  A text-primary ┐
│                                                                                                │
│   The product designers.                                                                       │
│ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ first baseline ─ ─ ─ │
└─────────────────────── W 1104px  H 47.8px  M 0 0 32px  ⎯ -3.2px off grid ──────────────────────┘
```

The overlay draws, all anchored to the element rather than the cursor:

- **A role chip** naming what the element is — `Headline Block`, `Narrative
  Text`, `Radio Input`, `Eyebrow Label`, `Layout Block` — inferred from the tag,
  ARIA role, input type, and, for untagged text, its own size and treatment.
- **Type chips** in the units type is specced in: `rem` for size, the unitless
  ratio for leading, `em` for tracking, and the **design-token name** for the
  colour when one in scope matches.
- **Size chips** below: border-box width and height, declared margin and
  padding, `gap`, and how far the first baseline sits off the grid.
- **Blue gap bands** to the previous and next in-flow sibling, labelled in rem.
  This is the space a reader actually sees — collapsed margins and `gap`
  already folded in — not the `margin-bottom` a stylesheet declares. Where a gap
  band explains a side, the margin band steps aside instead of tinting the same
  space twice.
- **Margin, padding and content bands**, each an exact ring, so the two never
  tint each other where they meet.
- **A dashed rule on the first text baseline**, and horizontal rules at the
  baseline interval when `baseline` is set.

## Read the metrics directly

No overlay, no side effects:

```js
import { readType, readSpacing, readRole } from 'vernel';

readType(document.querySelector('h1'));
// { fontFamily: 'Geist, system-ui, sans-serif', fontSize: 41.6, fontWeight: 600,
//   lineHeight: 47.84, leading: 1.15, letterSpacing: -0.832, tracking: -20 }

readSpacing(document.querySelector('.row'));
// { margin: { top: 32, right: 0, bottom: 32, left: 0 },
//   padding: { top: 0, right: 0, bottom: 0, left: 0 }, rowGap: 12, columnGap: 20 }

readRole(document.querySelector('input[type=radio]'));
// 'Radio Input'
```

`tracking` is in 1/1000 em — the unit type is specced in — alongside the raw px
`letterSpacing`; the overlay shows the same number as `em`. `lineHeight` and
`leading` are `null` when the computed line-height is the keyword `normal`.

## Options

| Option     | Default   | Meaning                                                          |
| ---------- | --------- | ---------------------------------------------------------------- |
| `baseline` | `0`       | Baseline grid interval in px. `0` draws no grid.                  |
| `hotkey`   | `'Alt+V'` | Toggle binding: `'Mod+Shift+K'`, `'F2'`, … `null` binds nothing.  |
| `root`     | `<html>`  | Element the baseline grid and `rem` are measured against.        |

The instance is `{ enabled, enable(), disable(), toggle(), destroy() }`.
`destroy()` unbinds the hotkey and removes the overlay.

## Design tokens

Colour chips show a token name — `text-primary` — rather than
`rgb(244, 244, 245)`, by matching the element's computed colour against the
custom properties in scope on the root element, read back through
`getComputedStyle`. No stylesheet is parsed. Values in any colour syntax are
compared as sRGB bytes, so a token written in `oklch()` still matches a computed
`rgb()`. Where several names share a colour, the one that reads as a text role
wins. Engines that do not enumerate custom properties in computed style yield no
tokens, and the chip falls back to the hex value.

## Typeface

The readout asks for **Geist Mono** and falls back through `ui-monospace`. If
your page loads Geist Mono, the overlay picks it up; `@font-face` is ignored
inside a shadow root, and declaring one on the document would be exactly the
global style injection this overlay refuses.

## What it does to your page

Nothing. One `<vernel-overlay>` element is appended to `<body>` with a shadow
root, and every style lives inside it. No global CSS, no classes added to your
elements, no layout-affecting DOM. Metrics come from `getComputedStyle`, so what
you read is what is rendered. Zero runtime dependencies, ESM only.

Two things no computed style can answer are asked of an off-document canvas,
which is created but never appended: the font's ascent and descent, needed to
locate a baseline inside a line box, and the sRGB bytes of a colour, needed to
compare token values across colour syntaxes.

## Run it on a page you do not control

`vernel.snippet.js` in the repo root is the whole tool bundled into one file for
pasting into a devtools console. Open the page you want to audit, open the
console, paste the file, press enter: the overlay switches itself on with an 8px
grid. `Alt+V` toggles, `vernelInstance.destroy()` removes it. For repeat use,
keep it in **devtools → Sources → Snippets** and run it with `Ctrl/Cmd+Enter`.

Or skip the copying, on any page whose CSP allows it:

```js
fetch('https://raw.githubusercontent.com/ThatOneDemon09/vernel/main/vernel.snippet.js')
  .then((r) => r.text())
  .then(eval);
```

The file is committed so it can be used without a toolchain. Regenerate it after
changing `src/`:

```sh
npm run snippet
```

That is the one place a bundler is involved. `npm run build` is still `tsc` only,
and `dist/` is still unbundled ESM.

## Demo page

```sh
npm install
npm run build
npx http-server -p 8080     # then open /demo/
```

## Browser support

Any engine with shadow DOM, `ResizeObserver` and `elementFromPoint` — Chrome,
Edge, Firefox and Safari. Calling `vernel()` where there is no `document` (SSR)
returns an inert instance instead of throwing.

## License

MIT
