import type { TypeMetrics } from '../metrics.js';
import type { BoxModel } from './geometry.js';
import { div } from './host.js';

export interface BaselineReading {
  /** Grid interval in px. */
  readonly interval: number;
  /** px from the nearest grid line; positive means the baseline sits below it. */
  readonly delta: number;
  readonly onGrid: boolean;
}

export interface Grid {
  update(interval: number, originY: number): void;
  hide(): void;
}

const LINE = 'rgba(236, 72, 153, 0.22)';

/**
 * One element with a repeating gradient rather than N rules: a 4000px page at
 * an 8px baseline is 500 nodes to keep in sync on every scroll frame.
 */
export function createGrid(shadow: ShadowRoot): Grid {
  const el = div('grid');
  shadow.append(el);
  let painted = 0;

  return {
    update(interval, originY) {
      if (interval !== painted) {
        el.style.backgroundImage = `repeating-linear-gradient(to bottom, ${LINE} 0, ${LINE} 1px, transparent 1px, transparent ${interval}px)`;
        painted = interval;
      }
      // The host is viewport-fixed, so the grid has to be re-anchored to the
      // root element's current offset on every scroll.
      const offset = ((originY % interval) + interval) % interval;
      el.style.backgroundPosition = `0 ${offset}px`;
      el.style.display = 'block';
    },
    hide() {
      el.style.display = 'none';
    },
  };
}

interface VerticalMetrics {
  readonly ascent: number;
  readonly descent: number;
}

const metricsCache = new Map<string, VerticalMetrics>();

let context: CanvasRenderingContext2D | null | undefined;

function measureContext(): CanvasRenderingContext2D | null {
  if (context === undefined) {
    // Never appended: the canvas exists only to ask the font system a question.
    context = document.createElement('canvas').getContext('2d');
  }
  return context;
}

/**
 * Where the first baseline sits inside a line box needs the font's own ascent
 * and descent, and no computed style exposes them. Canvas text metrics do, for
 * exactly the font shorthand `getComputedStyle` just handed us.
 */
function verticalMetrics(cs: CSSStyleDeclaration, type: TypeMetrics): VerticalMetrics {
  const fallback: VerticalMetrics = { ascent: type.fontSize * 0.8, descent: type.fontSize * 0.2 };
  if (type.fontSize === 0) return fallback;

  const font = `${cs.fontStyle} ${type.fontWeight} ${type.fontSize}px ${type.fontFamily}`;
  const cached = metricsCache.get(font);
  if (cached) return cached;

  const ctx = measureContext();
  if (!ctx) return fallback;

  ctx.font = font;
  const measured = ctx.measureText('Hxp');
  const resolved: VerticalMetrics = {
    ascent: Number.isFinite(measured.fontBoundingBoxAscent) ? measured.fontBoundingBoxAscent : fallback.ascent,
    descent: Number.isFinite(measured.fontBoundingBoxDescent) ? measured.fontBoundingBoxDescent : fallback.descent,
  };
  metricsCache.set(font, resolved);
  return resolved;
}

/** Webfonts swap in after first paint, invalidating anything measured before. */
export function clearFontMetricsCache(): void {
  metricsCache.clear();
}

/**
 * A container whose first child is a block gets its first line — and therefore
 * its first baseline — from that child, in that child's font. Reporting the
 * container's own font metrics there would be a confidently wrong number, so
 * the reading is only offered for elements that own the line themselves.
 */
function ownsFirstLine(el: Element): boolean {
  for (const node of el.childNodes) {
    if (node.nodeType !== Node.TEXT_NODE) continue;
    if (node.nodeValue !== null && node.nodeValue.trim() !== '') return true;
  }
  return false;
}

/** Viewport y of the first text baseline in the element's content box. */
function firstBaselineY(box: BoxModel, cs: CSSStyleDeclaration, type: TypeMetrics): number {
  const { ascent, descent } = verticalMetrics(cs, type);
  const lineHeight = type.lineHeight ?? ascent + descent;
  const halfLeading = (lineHeight - (ascent + descent)) / 2;
  return box.content.y + halfLeading + ascent;
}

/** How far the first baseline of `el` sits from the nearest grid line. */
export function readBaseline(
  el: Element,
  box: BoxModel,
  cs: CSSStyleDeclaration,
  type: TypeMetrics,
  originY: number,
  interval: number,
): BaselineReading | null {
  if (!(interval > 0) || !ownsFirstLine(el)) return null;
  const relative = firstBaselineY(box, cs, type) - originY;
  const modulo = ((relative % interval) + interval) % interval;
  const delta = modulo <= interval / 2 ? modulo : modulo - interval;
  // Sub-half-pixel is below what anyone can see or fix; call it on the grid.
  return { interval, delta, onGrid: Math.abs(delta) < 0.5 };
}
