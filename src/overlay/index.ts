import { spacingFrom, typeFrom } from '../metrics.js';
import { clearFontMetricsCache, createGrid, readBaseline } from './baseline.js';
import { createBoxes } from './boxes.js';
import { describe } from './format.js';
import { measure } from './geometry.js';
import { createHost } from './host.js';
import { createHover, type HoverTarget } from './hover.js';
import { createPanel } from './panel.js';

export interface OverlayConfig {
  /** Baseline grid interval in px; 0 draws no grid. */
  readonly baseline: number;
  /** Element the baseline grid is anchored to. */
  readonly root: Element;
}

export interface Overlay {
  readonly enabled: boolean;
  enable(): void;
  disable(): void;
  destroy(): void;
}

export function createOverlay(config: OverlayConfig): Overlay {
  const host = createHost();
  const grid = createGrid(host.shadow);
  const boxes = createBoxes(host.shadow);
  const panel = createPanel(host.shadow);
  let enabled = false;

  function draw({ element, x, y }: HoverTarget): void {
    const originY = config.baseline > 0 ? config.root.getBoundingClientRect().top : 0;
    if (config.baseline > 0) grid.update(config.baseline, originY);
    else grid.hide();

    if (element === null) {
      boxes.hide();
      panel.hide();
      return;
    }

    // One style read per frame, shared by every metric below it.
    const style = getComputedStyle(element);
    const box = measure(element, style);
    const type = typeFrom(style);

    boxes.update(box);
    panel.render({
      label: describe(element),
      border: box.border,
      type,
      spacing: spacingFrom(style),
      baseline: readBaseline(element, box, style, type, originY, config.baseline),
    });
    // Render first: placement needs the card's measured size.
    panel.place(x, y);
  }

  const hover = createHover({ host: host.element, root: config.root, onFrame: draw });

  function onFontsDone(): void {
    clearFontMetricsCache();
    hover.schedule();
  }

  return {
    get enabled() {
      return enabled;
    },

    enable() {
      if (enabled) return;
      enabled = true;
      host.mount();
      hover.start();
      document.fonts?.addEventListener('loadingdone', onFontsDone);
    },

    disable() {
      if (!enabled) return;
      enabled = false;
      hover.stop();
      document.fonts?.removeEventListener('loadingdone', onFontsDone);
      grid.hide();
      boxes.hide();
      panel.hide();
      host.unmount();
    },

    destroy() {
      this.disable();
    },
  };
}
