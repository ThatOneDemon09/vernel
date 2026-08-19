# vernel

Spacing and typography inspection for the web.

npm: `vernel` (published, 0.0.1)
repo: https://github.com/ThatOneDemon09/vernel

## What it is

A browser overlay that reads spacing and type metrics off live DOM elements and
shows them together. Devtools splits these across separate panels — you check
`font-size` in one place and `margin` in another, and lose the relationship
between them. The whole point of vernel is that spacing and typography are one
problem.

Target user: designers and front-end devs auditing a page. Someone who wants to
know "is this heading actually on the 8px grid, and is its leading consistent
with the body" without clicking through four inspector tabs.

## Design constraints

These are non-negotiable. Ask before breaking any of them.

- **Zero runtime dependencies.** Nothing ships to the consumer but this package.
  Dev dependencies are fine.
- **ESM only.** `"type": "module"`. No CJS build, no dual-package hazard.
- **The overlay must not mutate the inspected page.** Render into a shadow root
  attached to a single appended host element. No global style injection, no
  classes added to user elements, no layout-affecting DOM.
- **Metrics come from `getComputedStyle`.** Never parse stylesheets, never read
  inline `style` attributes directly.
- **Tracking reports in 1/1000 em**, the unit type designers actually use, not
  raw px letter-spacing.
- **TypeScript strict.** No `any`, no non-null assertions without a comment
  explaining why it's safe.

## Current state

Readers, and a working overlay in light and dark. `npx tsc --noEmit` is clean.

Public surface, all of `src/index.ts`:

- `readType(el)` → `TypeMetrics` — fontFamily, fontSize, fontWeight, lineHeight,
  leading (ratio), letterSpacing (px), tracking (1/1000 em). `lineHeight` and
  `leading` are `null` when the computed value is the keyword `normal`.
- `readSpacing(el)` → `SpacingMetrics` — margin/padding on all four sides,
  rowGap, columnGap
- `readRole(el)` → `string` — the semantic name a designer would use:
  "Headline Block", "Narrative Text", "Radio Input", "Eyebrow Label"
- `readFont(el)` → `FontResolution` — the declared stack, the family actually
  rendering, and whether that is a fallback
- `vernel(options)` → `VernelInstance` — `{ enabled, enable(), disable(),
  toggle(), destroy() }`, driving the real overlay. Options: `baseline`,
  `hotkey`, `root`, `theme`.

The overlay draws margin/padding/content bands, an outline with corner handles, a
dashed rule on the first text baseline, the baseline grid, blue gap bands to the
neighbouring siblings, green padding measure lines with end caps, and chip rows
anchored to the element: role plus selector on the left, type metrics on the
right, size and spacing below. Chips read in the units type is specced in — rem,
the unitless leading ratio, em tracking — and name the colour's design token when
one in scope matches.

Decisions worth knowing about, all adjacent to the constraints above:

- **Tracking is held in 1/1000 em and displayed as em.** `TypeMetrics.tracking`
  keeps the 1/1000 em contract; the chip shows the same number as `-0.02em`.
- **An off-document canvas answers three questions no computed style will.** Font
  ascent and descent, to place a baseline inside a line box; the sRGB bytes of a
  colour, to match tokens across colour syntaxes and to judge how light the page
  is; and whether a family is really available, to name the face that is actually
  rendering rather than the one declared first. The canvas is never appended, no
  stylesheet is parsed, and no inline `style` is read.
- **Padding lines carry two numbers.** CSS padding, and what the border adds on
  top of it — the distance a designer measures in Figma, where the border sits
  inside the shape.
- **Chrome follows the page, not the OS.** `theme: 'auto'` reads the first
  painted background above the hovered element; `prefers-color-scheme` is only
  the fallback, for pages that leave the canvas to the UA.

## Next

- Interface design is still being reworked from a reference; treat the chip
  visuals as provisional and keep them in the one stylesheet in
  `src/overlay/host.ts`, which holds both token sets.
- Geist Mono is asked for by family name only. Guaranteeing it would mean
  `document.fonts.add(new FontFace(...))` with an embedded subset, since
  `@font-face` does not apply inside a shadow root — needs a call on shipping a
  font file in the package.
- No test harness in the repo. The overlay is verified by a Playwright script
  driving the demo page; adding it would mean a Playwright dev dependency.

## Structure

- `src/index.ts` — public API only. Keep this file small.
- `src/overlay/` — renderer internals, not exported.
- `dist/` — build output. Gitignored, published.
- Build is `tsc` only. Add a bundler only if there's a concrete reason.

## Style

- Named exports plus a default export of `vernel`.
- Keep the public API surface small. New internals go under `src/`, unexported.
- Prefer small pure functions over classes.
- Comments explain *why*, not *what*.

## Working agreement

- Work on a branch, not `main`. Branch per feature: `feat/overlay-renderer`.
- Don't bump the version or publish to npm. I'll do that.
- Run `npx tsc --noEmit` before saying something is done.
- If a design constraint above is blocking you, say so instead of working
  around it silently.
