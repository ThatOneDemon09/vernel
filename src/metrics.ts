/**
 * Metric readers. Everything here goes through `getComputedStyle` — used values
 * are the only ones that answer "what is on screen right now".
 */

/** Distances for the four sides of a box, in px. */
export interface BoxSides {
  readonly top: number;
  readonly right: number;
  readonly bottom: number;
  readonly left: number;
}

export interface TypeMetrics {
  /** Full computed font stack, as authored. */
  readonly fontFamily: string;
  /** px */
  readonly fontSize: number;
  readonly fontWeight: number;
  /** px, or `null` when the computed line-height is the keyword `normal`. */
  readonly lineHeight: number | null;
  /** lineHeight / fontSize, or `null` when line-height is `normal`. */
  readonly leading: number | null;
  /** px */
  readonly letterSpacing: number;
  /** 1/1000 em — the unit type is specced in, unlike px letter-spacing. */
  readonly tracking: number;
}

export interface SpacingMetrics {
  readonly margin: BoxSides;
  readonly padding: BoxSides;
  /** px, 0 when the computed gap is `normal` — i.e. not a flex/grid container. */
  readonly rowGap: number;
  readonly columnGap: number;
}

/**
 * Computed lengths always serialize to px, so a parse is enough. Keywords
 * (`normal`, `auto`) parse to NaN and collapse to 0; the one place that
 * distinction matters — line-height — checks the raw string first.
 */
function px(value: string): number {
  const n = Number.parseFloat(value);
  return Number.isFinite(n) ? n : 0;
}

/**
 * Engines resolve font-weight to a number, but keyword pass-through still shows
 * up in older WebKit, and a NaN in the readout is worse than a mapped guess.
 */
const WEIGHT_KEYWORDS: Readonly<Record<string, number>> = { normal: 400, bold: 700 };

function sides(cs: CSSStyleDeclaration, prefix: string, suffix = ''): BoxSides {
  return {
    top: px(cs.getPropertyValue(`${prefix}-top${suffix}`)),
    right: px(cs.getPropertyValue(`${prefix}-right${suffix}`)),
    bottom: px(cs.getPropertyValue(`${prefix}-bottom${suffix}`)),
    left: px(cs.getPropertyValue(`${prefix}-left${suffix}`)),
  };
}

/**
 * The `*From` readers take a style declaration so the overlay can compute a
 * whole frame from one `getComputedStyle` call per element.
 */
export function typeFrom(cs: CSSStyleDeclaration): TypeMetrics {
  const fontSize = px(cs.fontSize);
  const lineHeight = cs.lineHeight === 'normal' ? null : px(cs.lineHeight);
  const letterSpacing = px(cs.letterSpacing);
  return {
    fontFamily: cs.fontFamily,
    fontSize,
    fontWeight: WEIGHT_KEYWORDS[cs.fontWeight] ?? px(cs.fontWeight),
    lineHeight,
    leading: lineHeight === null || fontSize === 0 ? null : lineHeight / fontSize,
    letterSpacing,
    tracking: fontSize === 0 ? 0 : (letterSpacing / fontSize) * 1000,
  };
}

export function spacingFrom(cs: CSSStyleDeclaration): SpacingMetrics {
  return {
    margin: sides(cs, 'margin'),
    padding: sides(cs, 'padding'),
    rowGap: px(cs.rowGap),
    columnGap: px(cs.columnGap),
  };
}

/** Border widths — not public, but the overlay needs them to inset the boxes. */
export function bordersFrom(cs: CSSStyleDeclaration): BoxSides {
  return sides(cs, 'border', '-width');
}

/** Type metrics for `el` as it is currently rendered. */
export function readType(el: Element): TypeMetrics {
  return typeFrom(getComputedStyle(el));
}

/** Spacing metrics for `el` as it is currently rendered. */
export function readSpacing(el: Element): SpacingMetrics {
  return spacingFrom(getComputedStyle(el));
}
