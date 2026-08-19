import { bordersFrom, spacingFrom, type BoxSides, type SpacingMetrics } from '../metrics.js';

/** Viewport-relative rectangle, matching `DOMRect`'s x/y/width/height. */
export interface Rect {
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
}

export interface BoxModel {
  /** Border box plus margins. */
  readonly margin: Rect;
  /** Border box, i.e. what `getBoundingClientRect` reports. */
  readonly border: Rect;
  /** Border box minus border widths. */
  readonly padding: Rect;
  /** Padding box minus padding. */
  readonly content: Rect;
  readonly sides: SpacingMetrics;
  readonly borders: BoxSides;
}

/** Keeps a box of `size` inside `limit`, never closer than `edge` to either end. */
export function clampInto(value: number, size: number, limit: number, edge = 4): number {
  return Math.max(edge, Math.min(value, limit - size - edge));
}

function outset(rect: Rect, by: BoxSides): Rect {
  return {
    x: rect.x - by.left,
    y: rect.y - by.top,
    width: Math.max(0, rect.width + by.left + by.right),
    height: Math.max(0, rect.height + by.top + by.bottom),
  };
}

function inset(rect: Rect, by: BoxSides): Rect {
  return {
    x: rect.x + by.left,
    y: rect.y + by.top,
    width: Math.max(0, rect.width - by.left - by.right),
    height: Math.max(0, rect.height - by.top - by.bottom),
  };
}

/**
 * The four boxes of the CSS box model in viewport coordinates.
 *
 * `getBoundingClientRect` reports the *transformed* border box while computed
 * padding and border widths are untransformed, so a scaled or rotated element
 * reads slightly off. Live inspection is worth more than exactness in that
 * corner, and the alternative is reimplementing layout.
 */
export function measure(el: Element, cs: CSSStyleDeclaration): BoxModel {
  const rect = el.getBoundingClientRect();
  const border: Rect = { x: rect.x, y: rect.y, width: rect.width, height: rect.height };
  const sides = spacingFrom(cs);
  const borders = bordersFrom(cs);
  const padding = inset(border, borders);
  return {
    margin: outset(border, sides.margin),
    border,
    padding,
    content: inset(padding, sides.padding),
    sides,
    borders,
  };
}
