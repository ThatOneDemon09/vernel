/**
 * Which family is *actually* rendering, not which one was asked for first. A
 * stack like `'NoonSans', 'NoonSans Fallback', system-ui` reports NoonSans in
 * computed style whether or not that face ever loaded, and reading the declared
 * name back to a designer who is looking at a fallback is worse than useless.
 */

/** Generic families the engine always satisfies, so the search stops there. */
const GENERIC = new Set([
  'serif',
  'sans-serif',
  'monospace',
  'cursive',
  'fantasy',
  'system-ui',
  'ui-serif',
  'ui-sans-serif',
  'ui-monospace',
  'ui-rounded',
  'math',
  'emoji',
  'fangsong',
]);

/**
 * Mixed widths and shapes, so two faces with the same advance width for this
 * string are the same face for practical purposes.
 */
const PROBE = 'mmmmmmmmmmlliWWWWOO0123';
const PROBE_SIZE = 72;

/** Two sentinels: a face metrically identical to both is beyond coincidence. */
const SENTINELS = ['monospace', 'serif'] as const;

let context: CanvasRenderingContext2D | null | undefined;

function measureContext(): CanvasRenderingContext2D | null {
  if (context === undefined) {
    context = document.createElement('canvas').getContext('2d');
  }
  return context;
}

const available = new Map<string, boolean>();

function widthWith(ctx: CanvasRenderingContext2D, font: string): number {
  ctx.font = `${PROBE_SIZE}px ${font}`;
  return ctx.measureText(PROBE).width;
}

/**
 * A family is present when asking for it changes the measurement against a
 * sentinel it would otherwise have fallen back to.
 */
function isAvailable(family: string): boolean {
  const cached = available.get(family);
  if (cached !== undefined) return cached;

  const ctx = measureContext();
  if (ctx === null) return false;

  const quoted = `"${family.replace(/"/g, '')}"`;
  const present = SENTINELS.some(
    (sentinel) => widthWith(ctx, `${quoted}, ${sentinel}`) !== widthWith(ctx, sentinel),
  );
  available.set(family, present);
  return present;
}

/** Webfonts swap in after first paint, so nothing measured before still holds. */
export function clearFontAvailability(): void {
  available.clear();
}

export interface FontResolution {
  /** The stack as authored, unquoted. */
  readonly declared: readonly string[];
  /** The family actually drawing the glyphs. */
  readonly rendered: string;
  /** True when the first declared family is not the one rendering. */
  readonly fallback: boolean;
}

export function resolveFont(fontFamily: string): FontResolution {
  const declared = fontFamily
    .split(',')
    .map((part) => part.trim().replace(/^["']|["']$/g, ''))
    .filter(Boolean);

  const first = declared[0] ?? 'unknown';
  for (const family of declared) {
    if (GENERIC.has(family.toLowerCase()) || isAvailable(family)) {
      return { declared, rendered: family, fallback: family !== first };
    }
  }

  // Every named family missing and no generic to land on: the engine picked its
  // default, which no API will name.
  return { declared, rendered: first, fallback: false };
}

/** The family actually rendering text in `el`. */
export function readFont(el: Element): FontResolution {
  return resolveFont(getComputedStyle(el).fontFamily);
}
