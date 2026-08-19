import { clearFontAvailability, resolveFont } from '../fonts.js';
import { spacingFrom, typeFrom } from '../metrics.js';
import { classifyRole } from '../roles.js';
import { resolveTheme, type ThemeSetting } from '../theme.js';
import { clearTokenCache, colorTokenName } from '../tokens.js';
import { baselineY, clearFontMetricsCache, createBaselineMarker, createGrid, gridOffset } from './baseline.js';
import { createBoxes } from './boxes.js';
import { describe } from './format.js';
import { createGapLayer, measureGaps, type Side } from './gaps.js';
import { measure } from './geometry.js';
import { createHost } from './host.js';
import { createHover, type HoverTarget } from './hover.js';
import { createMeasures } from './measure.js';
import { createReadout } from './readout.js';

export interface OverlayConfig {
  /** Baseline grid interval in px; 0 draws no grid. */
  readonly baseline: number;
  /** Element the baseline grid is anchored to. */
  readonly root: Element;
  /** Chrome palette; `auto` follows the page, then the browser setting. */
  readonly theme: ThemeSetting;
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
  const gaps = createGapLayer(host.shadow);
  const boxes = createBoxes(host.shadow);
  const measures = createMeasures(host.shadow);
  const marker = createBaselineMarker(host.shadow);
  const readout = createReadout(host.shadow);
  let enabled = false;

  function draw(target: HoverTarget): void {
    const originY = config.baseline > 0 ? config.root.getBoundingClientRect().top : 0;
    if (config.baseline > 0) grid.update(config.baseline, originY);
    else grid.hide();

    const element = target.element;
    const theme = resolveTheme(config.theme, element);
    if (host.element.getAttribute('data-vernel-theme') !== theme) {
      host.element.setAttribute('data-vernel-theme', theme);
      // A theme switch rewrites every token, so any name read before it is stale.
      clearTokenCache();
    }

    if (element === null) {
      gaps.hide();
      boxes.hide();
      measures.hide();
      marker.hide();
      readout.hide();
      return;
    }

    // One style read per frame, shared by every metric below it.
    const style = getComputedStyle(element);
    const box = measure(element, style);
    const type = typeFrom(style);
    const rootFontSize = Number.parseFloat(getComputedStyle(config.root).fontSize) || 16;

    const bands = measureGaps(element, host.element);
    const explained = new Set<Side>(bands.map((gap) => gap.side));
    boxes.update(box, explained);
    measures.update(box);
    gaps.update(bands, rootFontSize);

    const baseline = baselineY(element, box, style, type);
    if (baseline === null) marker.hide();
    else marker.update(box.content, baseline);

    readout.update({
      role: classifyRole(element, style, rootFontSize),
      selector: describe(element),
      box: box.border,
      bounds: {
        top: Math.min(box.border.y, ...bands.map((gap) => gap.rect.y)),
        bottom: Math.max(
          box.border.y + box.border.height,
          ...bands.map((gap) => gap.rect.y + gap.rect.height),
        ),
      },
      type,
      font: resolveFont(type.fontFamily),
      spacing: spacingFrom(style),
      borders: box.borders,
      color: style.color,
      colorToken: colorTokenName(style.color),
      baseline: baseline === null ? null : gridOffset(baseline, originY, config.baseline),
      rootFontSize,
    });
  }

  const hover = createHover({ host: host.element, root: config.root, onFrame: draw });

  function onFontsDone(): void {
    clearFontMetricsCache();
    clearFontAvailability();
    hover.schedule();
  }

  return {
    get enabled() {
      return enabled;
    },

    enable() {
      if (enabled) return;
      enabled = true;
      clearTokenCache();
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
      gaps.hide();
      boxes.hide();
      measures.hide();
      marker.hide();
      readout.hide();
      host.unmount();
    },

    destroy() {
      this.disable();
    },
  };
}
