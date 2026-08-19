import type { SpacingMetrics, TypeMetrics } from '../metrics.js';
import type { BaselineReading } from './baseline.js';
import { firstFamily, num, px, shorthand, signed } from './format.js';
import type { Rect } from './geometry.js';
import { div } from './host.js';

export interface PanelData {
  readonly label: string;
  readonly border: Rect;
  readonly type: TypeMetrics;
  readonly spacing: SpacingMetrics;
  readonly baseline: BaselineReading | null;
}

export interface Panel {
  render(data: PanelData): void;
  /** Positions the card near (x, y), flipping sides to stay in the viewport. */
  place(x: number, y: number): void;
  hide(): void;
}

/** Gap between cursor and card, and the card's minimum inset from the edge. */
const CURSOR_GAP = 16;
const EDGE_GAP = 8;

interface Row {
  readonly el: HTMLElement;
  readonly value: HTMLElement;
}

function addRow(parent: HTMLElement, label: string): Row {
  const el = div('row');
  const name = div('row__label');
  name.textContent = label;
  const value = div('row__value');
  el.append(name, value);
  parent.append(el);
  return { el, value };
}

function set(row: Row, text: string | null, state?: 'on' | 'off'): void {
  row.el.hidden = text === null;
  if (text === null) return;
  row.value.textContent = text;
  row.el.classList.toggle('row--on', state === 'on');
  row.el.classList.toggle('row--off', state === 'off');
}

export function createPanel(shadow: ShadowRoot): Panel {
  const el = div('panel');
  const head = div('panel__head');
  const name = div('panel__name');
  const size = div('panel__size');
  head.append(name, size);
  el.append(head);

  const rows = {
    font: addRow(el, 'font'),
    size: addRow(el, 'size'),
    tracking: addRow(el, 'tracking'),
    margin: addRow(el, 'margin'),
    padding: addRow(el, 'padding'),
    gap: addRow(el, 'gap'),
    baseline: addRow(el, 'baseline'),
  };

  shadow.append(el);

  return {
    render(data) {
      const { type, spacing, baseline } = data;
      name.textContent = data.label;
      size.textContent = `${num(data.border.width, 1)} × ${num(data.border.height, 1)}`;

      set(rows.font, `${firstFamily(type.fontFamily)} ${num(type.fontWeight, 0)}`);
      const lineHeight = type.lineHeight === null ? 'normal' : px(type.lineHeight, 1);
      const leading = type.leading === null ? '' : `  ·  ${num(type.leading, 2)}`;
      set(rows.size, `${px(type.fontSize, 1)} / ${lineHeight}${leading}`);
      set(rows.tracking, `${signed(type.tracking, 1)}/1000em  ·  ${px(type.letterSpacing, 2)}`);
      set(rows.margin, shorthand(spacing.margin));
      set(rows.padding, shorthand(spacing.padding));
      set(
        rows.gap,
        spacing.rowGap === 0 && spacing.columnGap === 0
          ? null
          : `${px(spacing.rowGap, 1)} / ${px(spacing.columnGap, 1)}`,
      );
      set(
        rows.baseline,
        baseline === null
          ? null
          : baseline.onGrid
            ? `on ${px(baseline.interval, 0)} grid`
            : `${signed(baseline.delta, 1)}px off ${px(baseline.interval, 0)} grid`,
        baseline === null ? undefined : baseline.onGrid ? 'on' : 'off',
      );

      el.style.display = 'block';
    },

    place(x, y) {
      const viewportWidth = document.documentElement.clientWidth;
      const viewportHeight = document.documentElement.clientHeight;
      const { offsetWidth: width, offsetHeight: height } = el;

      let left = x + CURSOR_GAP;
      if (left + width > viewportWidth - EDGE_GAP) left = x - CURSOR_GAP - width;
      left = Math.max(EDGE_GAP, Math.min(left, viewportWidth - width - EDGE_GAP));

      let top = y + CURSOR_GAP;
      if (top + height > viewportHeight - EDGE_GAP) top = y - CURSOR_GAP - height;
      top = Math.max(EDGE_GAP, Math.min(top, viewportHeight - height - EDGE_GAP));

      el.style.transform = `translate(${left}px, ${top}px)`;
    },

    hide() {
      el.style.display = 'none';
    },
  };
}
