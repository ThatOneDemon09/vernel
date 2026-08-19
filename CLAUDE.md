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

`src/index.ts` holds the entire public surface. It typechecks and the metric
readers work today:

- `readType(el)` → `TypeMetrics` — fontFamily, fontSize, fontWeight, lineHeight,
  leading (ratio), letterSpacing (px), tracking (1/1000 em)
- `readSpacing(el)` → `SpacingMetrics` — margin/padding on all four sides,
  rowGap, columnGap
- `vernel(options)` → `VernelInstance` — **stub**. Returns an object with the
  right shape but `enable()`/`disable()`/`toggle()` only flip a boolean.

## What to build next, in order

1. **Overlay renderer.** Shadow root host, absolutely positioned boxes drawn
   over the hovered element. Margin band, padding band, content box — three
   distinct fills, low opacity, no borders that shift perceived size.
2. **Hover hit testing.** `document.elementFromPoint` on pointermove, throttled
   to rAF. Ignore the overlay host itself. Handle scroll and resize via
   `ResizeObserver` and a scroll listener on the capture phase.
3. **Type readout panel.** Fixed-position card near the cursor showing the
   `TypeMetrics` for the hovered element. Flip sides when it would overflow the
   viewport.
4. **Baseline grid.** When `baseline > 0`, draw horizontal rules at that
   interval across the root. Show whether the hovered element's baseline sits on
   or off the grid, and by how many px.
5. **Hotkey binding.** Bind `options.hotkey` on keydown. Skip when focus is in
   an input, textarea, or contenteditable. `null` disables.

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
