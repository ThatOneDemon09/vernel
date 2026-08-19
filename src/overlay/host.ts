/**
 * The overlay's only footprint on the page: one custom-tag host element with a
 * shadow root. Nothing else is appended, no page node is touched, and every
 * style lives inside the shadow tree.
 */

const HOST_TAG = 'vernel-overlay';

/**
 * A page can ship `* { position: static !important }` style resets, and losing
 * fixed positioning would silently misplace every box we draw.
 */
const HOST_CSS = [
  'position: fixed !important',
  'inset: 0 !important',
  'margin: 0 !important',
  'padding: 0 !important',
  'border: 0 !important',
  'pointer-events: none !important',
  'z-index: 2147483647 !important',
  'display: block !important',
  'overflow: hidden !important',
  'contain: layout style paint',
].join('; ');

/**
 * Geist Mono is the intended face. `@font-face` is ignored inside a shadow root,
 * and adding one to the document would be exactly the global style injection
 * this overlay refuses, so the family is asked for and falls back cleanly when
 * the page has not loaded it.
 */
const MONO = `'Geist Mono', 'GeistMono', ui-monospace, SFMono-Regular, 'SF Mono', Menlo, Consolas, monospace`;

const STYLE = `
:host {
  all: initial;
  --accent: #e2603c;
  --accent-dim: rgba(226, 96, 60, 0.62);
  --chip-bg: rgba(72, 26, 17, 0.94);
  --chip-edge: rgba(226, 96, 60, 0.24);
  --gap-ink: #85c9ee;
  --gap-fill: rgba(78, 163, 217, 0.18);
  --gap-edge: rgba(133, 201, 238, 0.5);
  --gap-chip-bg: rgba(13, 34, 47, 0.94);
  --margin-fill: rgba(246, 173, 85, 0.3);
  --padding-fill: rgba(104, 211, 145, 0.3);
  --content-fill: rgba(255, 255, 255, 0.06);
  --rule: rgba(236, 72, 153, 0.18);
  --baseline-ink: rgba(236, 72, 153, 0.65);
  --mono: ${MONO};
}
* { box-sizing: border-box; }

.grid {
  position: absolute;
  inset: 0;
  display: none;
}

.gap, .band, .box, .outline, .handle, .baseline-mark, .chips, .chip--gap {
  position: absolute;
  top: 0;
  left: 0;
  display: none;
}

.gap { background: var(--gap-fill); }
.gap--y { box-shadow: inset 0 1px 0 var(--gap-edge), inset 0 -1px 0 var(--gap-edge); }
.gap--x { box-shadow: inset 1px 0 0 var(--gap-edge), inset -1px 0 0 var(--gap-edge); }

.band {
  border-style: solid;
  border-color: transparent;
  border-width: 0;
}
.band--margin { border-color: var(--margin-fill); }
.band--padding { border-color: var(--padding-fill); }
.box--content { background: var(--content-fill); }
.outline { border: 1px solid var(--accent-dim); }

.handle {
  width: 7px;
  height: 7px;
  background: #17100e;
  border: 1.5px solid var(--accent);
}

.baseline-mark { border-top: 1px dashed var(--baseline-ink); }

.chips {
  gap: 5px;
  align-items: center;
}

.chip {
  display: flex;
  align-items: center;
  gap: 6px;
  height: 24px;
  padding: 0 8px;
  border: 1px solid var(--chip-edge);
  border-radius: 5px;
  background: var(--chip-bg);
  color: var(--accent);
  font: 12px/1 var(--mono);
  letter-spacing: 0.01em;
  white-space: nowrap;
}
.chip__icon { color: var(--accent-dim); }
.chip__icon:empty { display: none; }
/* The role names the thing, so it reads a step brighter than the numbers. */
.chip--role { color: #f2a189; }
.chip--color .chip__icon { border-bottom: 2px solid currentColor; }
.chip--off .chip__value { color: #f0b429; }
.chip--gap {
  color: var(--gap-ink);
  background: var(--gap-chip-bg);
  border-color: rgba(133, 201, 238, 0.28);
}
`;

export interface OverlayHost {
  readonly element: HTMLElement;
  readonly shadow: ShadowRoot;
  readonly mounted: boolean;
  mount(): void;
  unmount(): void;
}

export function createHost(): OverlayHost {
  const element = document.createElement(HOST_TAG);
  element.style.cssText = HOST_CSS;
  element.setAttribute('aria-hidden', 'true');

  const shadow = element.attachShadow({ mode: 'open' });
  const style = document.createElement('style');
  style.textContent = STYLE;
  shadow.append(style);

  let mounted = false;

  return {
    element,
    shadow,
    get mounted() {
      return mounted;
    },
    mount() {
      if (mounted) return;
      // Scripts in <head> run before <body> exists.
      (document.body ?? document.documentElement).append(element);
      mounted = true;
    },
    unmount() {
      if (!mounted) return;
      element.remove();
      mounted = false;
    },
  };
}

/** Creates a shadow-tree element with the given classes. */
export function div(...classes: string[]): HTMLDivElement {
  const el = document.createElement('div');
  el.className = classes.join(' ');
  return el;
}
