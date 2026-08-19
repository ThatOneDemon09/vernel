# vernel

Read spacing and type metrics off any element without opening devtools.

Devtools splits these across separate panels — you check `font-size` in one
place and `margin` in another, and lose the relationship between them. vernel
treats spacing and typography as one problem and shows them together, over the
live page.

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

Hover anything. The overlay draws the element's margin band, padding band and
content box, and puts a card next to the cursor with its type metrics. `Alt+V`
toggles it.

Or read the metrics directly, with no overlay:

```js
import { readType, readSpacing } from 'vernel';

readType(document.querySelector('h1'));
// { fontFamily: 'Inter, sans-serif', fontSize: 40, fontWeight: 700,
//   lineHeight: 48, leading: 1.2, letterSpacing: -0.8, tracking: -20 }

readSpacing(document.querySelector('.card'));
// { margin: { top: 24, right: 0, bottom: 24, left: 0 },
//   padding: { top: 16, right: 20, bottom: 16, left: 20 },
//   rowGap: 0, columnGap: 0 }
```

`tracking` is in 1/1000 em — the unit type is actually specced in — alongside
the raw px `letterSpacing`. `lineHeight` and `leading` are `null` when the
computed line-height is the keyword `normal`.

## Options

| Option     | Default   | Meaning                                                        |
| ---------- | --------- | -------------------------------------------------------------- |
| `baseline` | `0`       | Baseline grid interval in px. `0` draws no grid.                |
| `hotkey`   | `'Alt+V'` | Toggle binding: `'Mod+Shift+K'`, `'F2'`, … `null` binds nothing. |
| `root`     | `<html>`  | Element the baseline grid is anchored to.                       |

The instance is `{ enabled, enable(), disable(), toggle(), destroy() }`.
`destroy()` unbinds the hotkey and removes the overlay.

## Baseline grid

With `baseline` set, vernel rules the page at that interval and reports how far
the hovered element's first text baseline sits from the nearest line — `on 8px
grid`, or `+3.5px off 8px grid`. The reading is only offered for elements that
own their first line of text; a container whose first line comes from a child
gets no reading rather than a confidently wrong one.

## What it does to your page

Nothing. One `<vernel-overlay>` element is appended to `<body>` with a shadow
root, and every style lives inside it. No global CSS, no classes added to your
elements, no layout-affecting DOM. All metrics come from `getComputedStyle`, so
what you read is what is rendered. Zero runtime dependencies, ESM only.

Font ascent and descent — needed to locate a baseline inside a line box, and
exposed by no computed style — come from canvas text metrics on an off-document
canvas.

## Demo

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
