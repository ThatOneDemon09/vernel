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

const STYLE = `
:host { all: initial; }
* { box-sizing: border-box; }
.grid {
  position: absolute;
  inset: 0;
  display: none;
}
.band, .box {
  position: absolute;
  display: none;
  border-style: solid;
  border-color: transparent;
  border-width: 0;
}
.band--margin { border-color: rgba(246, 173, 85, 0.38); }
.band--padding { border-color: rgba(104, 211, 145, 0.38); }
.box--content { background: rgba(99, 179, 237, 0.3); }
.panel {
  position: absolute;
  top: 0;
  left: 0;
  display: none;
  max-width: 320px;
  padding: 7px 9px;
  border: 1px solid rgba(255, 255, 255, 0.09);
  border-radius: 7px;
  /* Opaque: a baseline grid showing through the numbers is unreadable. */
  background: #121218;
  color: #f4f4f5;
  box-shadow: 0 6px 22px rgba(0, 0, 0, 0.38);
  font: 11px/1.55 ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace;
  letter-spacing: 0;
  white-space: nowrap;
  will-change: transform;
}
.panel__head {
  display: flex;
  gap: 12px;
  justify-content: space-between;
  margin-bottom: 4px;
  padding-bottom: 4px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.12);
  color: #9ae6b4;
}
.panel__size { color: rgba(244, 244, 245, 0.55); }
.row { display: flex; gap: 10px; justify-content: space-between; }
.row[hidden] { display: none; }
.row__label { color: rgba(244, 244, 245, 0.5); }
.row__value { color: #f4f4f5; }
.row--off .row__value { color: #f6ad55; }
.row--on .row__value { color: #9ae6b4; }
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
