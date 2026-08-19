import { rgbaKey } from './color.js';

/**
 * Design-token names for colours. `text-primary` tells you which decision the
 * page made; `rgb(244, 244, 245)` only tells you what fell out of it.
 *
 * Names come from the custom properties in scope on the root element, read back
 * through `getComputedStyle` — no stylesheet is parsed. Engines that do not
 * enumerate custom properties in computed style yield no tokens, and the readout
 * falls back to the colour itself.
 */

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

/** The token name for a computed colour, or null when nothing in scope matches. */
export function colorTokenName(color: string): string | null {
  const key = rgbaKey(color);
  if (key === null) return null;
  const names = tokenMap().get(key);
  return names === undefined ? null : preferred(names);
}
