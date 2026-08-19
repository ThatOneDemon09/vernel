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

/**
 * Two complete token sets. The overlay is drawn *on* the page, so its chrome has
 * to sit on whatever ground the page is using — and a site with its own theme
 * toggle changes that without touching any browser setting.
 */
const DARK = `
  --accent: #e2603c;
  --accent-dim: rgba(226, 96, 60, 0.62);
  --chip-bg: rgba(72, 26, 17, 0.94);
  --chip-edge: rgba(226, 96, 60, 0.24);
  --chip-note: rgba(255, 255, 255, 0.42);
  --role-ink: #f2a189;
  --warn: #f0b429;
  --margin-fill: rgba(246, 173, 85, 0.3);
  --padding-fill: rgba(104, 211, 145, 0.3);
  --content-fill: rgba(255, 255, 255, 0.06);
  --pad-ink: #6fd39b;
  --pad-chip-bg: rgba(13, 43, 29, 0.94);
  --pad-chip-edge: rgba(111, 211, 155, 0.28);
  --gap-ink: #85c9ee;
  --gap-fill: rgba(78, 163, 217, 0.18);
  --gap-edge: rgba(133, 201, 238, 0.5);
  --gap-chip-bg: rgba(13, 34, 47, 0.94);
  --gap-chip-edge: rgba(133, 201, 238, 0.28);
  --rule: rgba(236, 72, 153, 0.18);
  --baseline-ink: rgba(236, 72, 153, 0.65);
  --handle-fill: #17100e;
`;

const LIGHT = `
  --accent: #b8431f;
  --accent-dim: rgba(184, 67, 31, 0.6);
  --chip-bg: rgba(253, 232, 223, 0.96);
  --chip-edge: rgba(184, 67, 31, 0.2);
  --chip-note: rgba(61, 41, 33, 0.5);
  --role-ink: #8f3315;
  --warn: #a35a06;
  --margin-fill: rgba(230, 145, 40, 0.28);
  --padding-fill: rgba(22, 150, 90, 0.24);
  --content-fill: rgba(22, 22, 32, 0.05);
  --pad-ink: #12704a;
  --pad-chip-bg: rgba(224, 246, 233, 0.96);
  --pad-chip-edge: rgba(18, 112, 74, 0.22);
  --gap-ink: #1f6d9e;
  --gap-fill: rgba(56, 145, 205, 0.16);
  --gap-edge: rgba(31, 109, 158, 0.42);
  --gap-chip-bg: rgba(223, 239, 250, 0.96);
  --gap-chip-edge: rgba(31, 109, 158, 0.24);
  --rule: rgba(190, 24, 93, 0.08);
  --baseline-ink: rgba(190, 24, 93, 0.5);
  --handle-fill: #fffaf7;
`;

const STYLE = `
:host {
  all: initial;
  --mono: ${MONO};
${DARK}}
/* Namespaced, so a page that styles [data-theme] itself cannot reach in. */
:host([data-vernel-theme='light']) {
${LIGHT}}
* { box-sizing: border-box; }

.grid {
  position: absolute;
  inset: 0;
  display: none;
}

.gap, .band, .box, .outline, .handle, .baseline-mark, .measure, .chips, .chip--gap, .chip--pad {
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
  background: var(--handle-fill);
  border: 1.5px solid var(--accent);
}

.baseline-mark { border-top: 1px dashed var(--baseline-ink); }

/* A spacing line with end caps, the way a spec sheet draws a distance. */
.measure { background: var(--pad-ink); }
.measure::before, .measure::after {
  content: '';
  position: absolute;
  background: var(--pad-ink);
}
.measure--y::before, .measure--y::after { left: -3px; width: 7px; height: 1px; }
.measure--y::before { top: 0; }
.measure--y::after { bottom: 0; }
.measure--x::before, .measure--x::after { top: -3px; width: 1px; height: 7px; }
.measure--x::before { left: 0; }
.measure--x::after { right: 0; }

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
.chip__note { color: var(--chip-note); }
.chip__note:empty { display: none; }
/* The role names the thing, so it reads a step brighter than the numbers. */
.chip--role { color: var(--role-ink); }
.chip--color .chip__icon { border-bottom: 2px solid currentColor; }
.chip--off .chip__value { color: var(--warn); }
/* The declared face is not the one drawing: say so where the name is shown. */
.chip--fallback .chip__icon { color: var(--warn); }
.chip--gap {
  color: var(--gap-ink);
  background: var(--gap-chip-bg);
  border-color: var(--gap-chip-edge);
}
.chip--pad {
  color: var(--pad-ink);
  background: var(--pad-chip-bg);
  border-color: var(--pad-chip-edge);
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
