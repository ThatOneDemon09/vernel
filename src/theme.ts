import { luminance, toRgba } from './color.js';

export type Theme = 'light' | 'dark';
export type ThemeSetting = Theme | 'auto';

/** Below this the chrome would be sitting on something too sheer to judge. */
const OPAQUE_ENOUGH = 0.5;

/**
 * A page's own theme is the signal that matters — the chips are drawn on it, and
 * a site with its own toggle changes this without touching an OS setting. The
 * first painted background up from the hovered element wins.
 */
function backdrop(el: Element): Theme | null {
  let node: Element | null = el;
  while (node !== null) {
    const rgba = toRgba(getComputedStyle(node).backgroundColor);
    if (rgba !== null && rgba[3] / 255 >= OPAQUE_ENOUGH) {
      return luminance(rgba) > 0.35 ? 'light' : 'dark';
    }
    node = node.parentElement;
  }
  return null;
}

/**
 * Nothing painted anywhere means the canvas belongs to the UA, and `color-scheme:
 * dark` makes that canvas dark while every computed background stays
 * transparent — so the browser setting is the fallback, not the first answer.
 */
function browserPreference(): Theme {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export function resolveTheme(setting: ThemeSetting, el: Element | null): Theme {
  if (setting !== 'auto') return setting;
  const fromPage = el === null ? null : backdrop(el);
  return fromPage ?? browserPreference();
}
