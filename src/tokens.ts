/**
 * Design-token names for colors. `text-primary` tells you which decision the
 * page made; `rgb(244, 244, 245)` only tells you what fell out of it.
 *
 * Names come from the custom properties in scope on the root element, read back
 * through `getComputedStyle` — no stylesheet is parsed. Engines that do not
 * enumerate custom properties in computed style simply yield no tokens, and the
 * readout falls back to the color itself.
 */

let paint: CanvasRenderingContext2D | null | undefined;

function paintContext(): CanvasRenderingContext2D | null {
  if (paint === undefined) {
    // Off-document, like the font metrics canvas: the page is never touched.
    paint = document.createElement('canvas').getContext('2d', { willReadFrequently: true });
  }
  return paint;
}

/**
 * sRGB bytes for any color syntax the engine understands, so a token written in
 * `oklch()` still matches a computed `rgb()`. Returns null when the value is not
 * a color at all — most custom properties are not.
 */
function rgbaKey(value: string): string | null {
  const ctx = paintContext();
  if (ctx === null || value === '') return null;

  // An invalid assignment leaves fillStyle alone, so a value that parses lands
  // on the same color from either sentinel and one that does not never moves.
  ctx.fillStyle = '#000000';
  ctx.fillStyle = value;
  const fromBlack = ctx.fillStyle;
  ctx.fillStyle = '#ffffff';
  ctx.fillStyle = value;
  if (ctx.fillStyle !== fromBlack) return null;

  ctx.clearRect(0, 0, 1, 1);
  ctx.fillRect(0, 0, 1, 1);
  return Array.from(ctx.getImageData(0, 0, 1, 1).data).join(',');
}

const TTL_MS = 1000;

let tokens: Map<string, string[]> | null = null;
let stamp = 0;

function tokenMap(): Map<string, string[]> {
  // Theme switches rewrite every token, so the map is short-lived by design.
  if (tokens !== null && performance.now() - stamp < TTL_MS) return tokens;

  const byColor = new Map<string, string[]>();
  const cs = getComputedStyle(document.documentElement);
  for (let i = 0; i < cs.length; i += 1) {
    const property = cs.item(i);
    if (!property.startsWith('--')) continue;
    const key = rgbaKey(cs.getPropertyValue(property).trim());
    if (key === null) continue;
    const names = byColor.get(key);
    if (names === undefined) byColor.set(key, [property.slice(2)]);
    else names.push(property.slice(2));
  }

  tokens = byColor;
  stamp = performance.now();
  return byColor;
}

export function clearTokenCache(): void {
  tokens = null;
}

/** Names a palette reuses for several roles; prefer the one about text. */
const TEXT_HINTS = ['text', 'fg', 'foreground', 'ink', 'content', 'copy'];

function preferred(names: string[]): string | null {
  const hinted = names.filter((name) => TEXT_HINTS.some((hint) => name.toLowerCase().includes(hint)));
  const pool = hinted.length > 0 ? hinted : names;
  const sorted = [...pool].sort((a, b) => a.length - b.length || (a < b ? -1 : 1));
  return sorted[0] ?? null;
}

/** The token name for a computed color, or null when nothing in scope matches. */
export function colorTokenName(color: string): string | null {
  const key = rgbaKey(color);
  if (key === null) return null;
  const names = tokenMap().get(key);
  return names === undefined ? null : preferred(names);
}

/** `#rrggbb` for opaque colors, the engine's `rgba()` serialization otherwise. */
export function formatColor(color: string): string {
  const ctx = paintContext();
  if (ctx === null) return color;
  ctx.fillStyle = '#000000';
  ctx.fillStyle = color;
  return typeof ctx.fillStyle === 'string' ? ctx.fillStyle : color;
}
