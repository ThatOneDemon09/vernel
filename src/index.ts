import { bindHotkey } from './overlay/hotkey.js';
import { createOverlay, type Overlay } from './overlay/index.js';

export type { BoxSides, SpacingMetrics, TypeMetrics } from './metrics.js';
export { readSpacing, readType } from './metrics.js';

export interface VernelOptions {
  /** Baseline grid interval in px. 0 — the default — draws no grid. */
  readonly baseline?: number;
  /** Toggle hotkey: `"Alt+V"`, `"Mod+Shift+K"`, `"F2"`. `null` binds nothing. */
  readonly hotkey?: string | null;
  /** Element the baseline grid is anchored to. Defaults to `<html>`. */
  readonly root?: Element;
}

export interface VernelInstance {
  readonly enabled: boolean;
  enable(): void;
  disable(): void;
  toggle(): void;
  /** Unbinds the hotkey and removes the overlay host from the page. */
  destroy(): void;
}

const DEFAULT_HOTKEY = 'Alt+V';

const INERT: VernelInstance = {
  enabled: false,
  enable: () => {},
  disable: () => {},
  toggle: () => {},
  destroy: () => {},
};

export function vernel(options: VernelOptions = {}): VernelInstance {
  // An inspector has nothing to inspect during SSR, and throwing there would
  // break the render of a page that only ever wanted this in the browser.
  if (typeof document === 'undefined') return INERT;

  const config = {
    baseline: options.baseline ?? 0,
    root: options.root ?? document.documentElement,
  };
  const hotkey = options.hotkey === undefined ? DEFAULT_HOTKEY : options.hotkey;

  // The host element is only built on first enable, so an instance that is
  // never turned on costs the page nothing.
  let overlay: Overlay | null = null;

  function enable(): void {
    (overlay ??= createOverlay(config)).enable();
  }

  function disable(): void {
    overlay?.disable();
  }

  function toggle(): void {
    if (overlay?.enabled === true) disable();
    else enable();
  }

  const unbind = hotkey === null ? null : bindHotkey(hotkey, toggle);

  return {
    get enabled() {
      return overlay?.enabled ?? false;
    },
    enable,
    disable,
    toggle,
    destroy() {
      unbind?.();
      overlay?.destroy();
      overlay = null;
    },
  };
}

export default vernel;
