import { formatColor } from '../color.js';
import type { FontResolution } from '../fonts.js';
import type { BoxSides, SpacingMetrics, TypeMetrics } from '../metrics.js';
import type { BaselineReading } from './baseline.js';
import { em, num, px, rem, shorthand, signed } from './format.js';
import { clampInto, type Rect } from './geometry.js';
import { div } from './host.js';

export interface ReadoutData {
  readonly role: string;
  /** `h1#title` — the role names it for a designer, this locates it for a dev. */
  readonly selector: string;
  /** Border box, which is what the size chips report. */
  readonly box: Rect;
  /**
   * Vertical extent of everything drawn for this element, gap bands included,
   * so the chip rows sit outside the annotation rather than on top of it.
   */
  readonly bounds: { readonly top: number; readonly bottom: number };
  readonly type: TypeMetrics;
  /** Which family is really drawing the text, which may not be the first asked for. */
  readonly font: FontResolution;
  readonly spacing: SpacingMetrics;
  readonly borders: BoxSides;
  /** Computed `color`, and the design token that matches it if there is one. */
  readonly color: string;
  readonly colorToken: string | null;
  readonly baseline: BaselineReading | null;
  readonly rootFontSize: number;
}

export interface Readout {
  update(data: ReadoutData): void;
  hide(): void;
}

/** Distance from the element's box to a chip row, and between stacked rows. */
const BOX_GAP = 8;
const ROW_GAP = 4;

interface Chip {
  readonly el: HTMLElement;
  readonly icon: HTMLElement;
  /** Dim trailing text: the thing the number needs, not the number itself. */
  readonly note: HTMLElement;
  set(value: string | null): void;
}

function createChip(parent: HTMLElement, icon: string, modifier?: string): Chip {
  const el = div(modifier === undefined ? 'chip' : `chip ${modifier}`);
  const iconEl = div('chip__icon');
  iconEl.textContent = icon;
  const value = div('chip__value');
  const note = div('chip__note');
  el.append(iconEl, value, note);
  parent.append(el);

  return {
    el,
    icon: iconEl,
    note,
    set(text) {
      el.style.display = text === null ? 'none' : 'flex';
      if (text !== null) value.textContent = text;
    },
  };
}

function place(group: HTMLElement, left: number, top: number): void {
  group.style.transform = `translate(${Math.round(left)}px, ${Math.round(top)}px)`;
}

/**
 * Chips are anchored to the element rather than the cursor: the role reads from
 * its left edge and the type metrics from its right, the way an annotated
 * design file labels a block, so the numbers stay put while the pointer moves.
 */
export function createReadout(shadow: ShadowRoot): Readout {
  const roleGroup = div('chips');
  const typeGroup = div('chips');
  const sizeGroup = div('chips');
  shadow.append(roleGroup, typeGroup, sizeGroup);

  const role = createChip(roleGroup, '', 'chip--role');
  const family = createChip(typeGroup, '');
  const fontSize = createChip(typeGroup, 'Aa');
  const leading = createChip(typeGroup, '↕');
  const tracking = createChip(typeGroup, '↔');
  const color = createChip(typeGroup, 'A', 'chip--color');
  const width = createChip(sizeGroup, 'W');
  const height = createChip(sizeGroup, 'H');
  const margin = createChip(sizeGroup, 'M');
  const padding = createChip(sizeGroup, 'P');
  const border = createChip(sizeGroup, 'B');
  const gap = createChip(sizeGroup, 'G');
  const baseline = createChip(sizeGroup, '⎯');

  return {
    update(data) {
      const { type, spacing, box, rootFontSize } = data;

      role.set(data.role);
      role.note.textContent = data.selector;
      // The rendered family, not the declared one: a stack that asks for a face
      // it never loaded still reports that face in computed style.
      family.set(`${data.font.rendered} ${num(type.fontWeight, 0)}`);
      family.icon.textContent = data.font.fallback ? '↳' : '';
      family.el.classList.toggle('chip--fallback', data.font.fallback);
      fontSize.set(rem(type.fontSize, rootFontSize));
      leading.set(type.leading === null ? 'normal' : num(type.leading, 2));
      tracking.set(em(type.tracking));
      color.set(data.colorToken ?? formatColor(data.color));
      color.icon.style.borderBottomColor = data.color;

      width.set(px(box.width, 1));
      height.set(px(box.height, 1));
      // Bands show the space that is really there; the chip shows what was
      // declared, which is the number you would go and change.
      const hasMargin =
        spacing.margin.top !== 0 ||
        spacing.margin.right !== 0 ||
        spacing.margin.bottom !== 0 ||
        spacing.margin.left !== 0;
      margin.set(hasMargin ? shorthand(spacing.margin) : null);
      const hasPadding =
        spacing.padding.top !== 0 ||
        spacing.padding.right !== 0 ||
        spacing.padding.bottom !== 0 ||
        spacing.padding.left !== 0;
      padding.set(hasPadding ? shorthand(spacing.padding) : null);
      const hasBorder =
        data.borders.top !== 0 ||
        data.borders.right !== 0 ||
        data.borders.bottom !== 0 ||
        data.borders.left !== 0;
      border.set(hasBorder ? shorthand(data.borders) : null);
      gap.set(
        spacing.rowGap === 0 && spacing.columnGap === 0
          ? null
          : `${px(spacing.rowGap, 1)} / ${px(spacing.columnGap, 1)}`,
      );
      baseline.set(
        data.baseline === null
          ? null
          : data.baseline.onGrid
            ? `on ${px(data.baseline.interval, 0)} grid`
            : `${signed(data.baseline.delta, 1)}px off grid`,
      );
      baseline.el.classList.toggle('chip--off', data.baseline !== null && !data.baseline.onGrid);

      for (const group of [roleGroup, typeGroup, sizeGroup]) group.style.display = 'flex';

      const viewportWidth = document.documentElement.clientWidth;
      const viewportHeight = document.documentElement.clientHeight;
      const rowHeight = roleGroup.offsetHeight;
      const roleWidth = roleGroup.offsetWidth;
      const typeWidth = typeGroup.offsetWidth;
      const right = box.x + box.width;

      const topRow = clampInto(data.bounds.top - rowHeight - BOX_GAP, rowHeight, viewportHeight);
      // On a narrow element the two groups would collide, so the type metrics
      // step up a row instead of overprinting the role.
      const collides = box.x + roleWidth + BOX_GAP > right - typeWidth;
      const typeRow = collides ? clampInto(topRow - rowHeight - ROW_GAP, rowHeight, viewportHeight) : topRow;

      place(roleGroup, clampInto(box.x, roleWidth, viewportWidth), topRow);
      place(typeGroup, clampInto(right - typeWidth, typeWidth, viewportWidth), typeRow);
      place(
        sizeGroup,
        clampInto(box.x + box.width / 2 - sizeGroup.offsetWidth / 2, sizeGroup.offsetWidth, viewportWidth),
        clampInto(data.bounds.bottom + BOX_GAP, sizeGroup.offsetHeight, viewportHeight),
      );
    },

    hide() {
      for (const group of [roleGroup, typeGroup, sizeGroup]) group.style.display = 'none';
    },
  };
}
