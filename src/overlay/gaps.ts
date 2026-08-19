import { isInFlow, isRendered } from '../dom.js';
import { rem } from './format.js';
import type { Rect } from './geometry.js';
import { div } from './host.js';

/** Which edge of the hovered element a gap sits against. */
export type Side = 'top' | 'right' | 'bottom' | 'left';

/** The empty space between the hovered element and one of its neighbours. */
export interface Gap {
  readonly rect: Rect;
  readonly distance: number;
  readonly axis: 'x' | 'y';
  readonly side: Side;
}

/** Below this, the space is a rounding artefact rather than a decision. */
const MIN_GAP = 0.5;

function rectOf(el: Element): Rect {
  const { x, y, width, height } = el.getBoundingClientRect();
  return { x, y, width, height };
}

function neighbour(el: Element, host: Element, forward: boolean): Element | null {
  let sibling = forward ? el.nextElementSibling : el.previousElementSibling;
  while (sibling !== null) {
    if (sibling !== host && isRendered(sibling) && isInFlow(getComputedStyle(sibling))) return sibling;
    sibling = forward ? sibling.nextElementSibling : sibling.previousElementSibling;
  }
  return null;
}

/**
 * The measured space between two boxes, which is what a reader sees — collapsed
 * margins, `gap`, and any `line-height` slack already folded in, unlike the
 * `margin-bottom` a stylesheet declares.
 */
function gapBetween(first: Rect, second: Rect, before: boolean): Gap | null {
  const vertical = second.y - (first.y + first.height);
  const horizontal = second.x - (first.x + first.width);

  // A wrapped flex row separates on both axes; the larger one is the real gap.
  if (vertical >= MIN_GAP && vertical >= horizontal) {
    const left = Math.max(first.x, second.x);
    const right = Math.min(first.x + first.width, second.x + second.width);
    const overlaps = right - left > 1;
    return {
      rect: {
        x: overlaps ? left : Math.min(first.x, second.x),
        y: first.y + first.height,
        width: overlaps ? right - left : Math.max(first.width, second.width),
        height: vertical,
      },
      distance: vertical,
      axis: 'y',
      side: before ? 'top' : 'bottom',
    };
  }

  if (horizontal >= MIN_GAP) {
    const top = Math.max(first.y, second.y);
    const bottom = Math.min(first.y + first.height, second.y + second.height);
    const overlaps = bottom - top > 1;
    return {
      rect: {
        x: first.x + first.width,
        y: overlaps ? top : Math.min(first.y, second.y),
        width: horizontal,
        height: overlaps ? bottom - top : Math.max(first.height, second.height),
      },
      distance: horizontal,
      axis: 'x',
      side: before ? 'left' : 'right',
    };
  }

  return null;
}

/** Gaps to the previous and next in-flow siblings, in that order. */
export function measureGaps(el: Element, host: Element): Gap[] {
  const own = rectOf(el);
  const gaps: Gap[] = [];

  const previous = neighbour(el, host, false);
  if (previous !== null) {
    const gap = gapBetween(rectOf(previous), own, true);
    if (gap !== null) gaps.push(gap);
  }

  const next = neighbour(el, host, true);
  if (next !== null) {
    const gap = gapBetween(own, rectOf(next), false);
    if (gap !== null) gaps.push(gap);
  }

  return gaps;
}

export interface GapLayer {
  update(gaps: Gap[], rootFontSize: number): void;
  hide(): void;
}

const EDGE_GAP = 6;

export function createGapLayer(shadow: ShadowRoot): GapLayer {
  const slots = [0, 1].map(() => {
    const band = div('gap');
    const label = div('chip', 'chip--gap');
    const icon = div('chip__icon');
    const value = div('chip__value');
    label.append(icon, value);
    shadow.append(band, label);
    return { band, label, icon, value };
  });

  function hideFrom(index: number): void {
    for (let i = index; i < slots.length; i += 1) {
      const slot = slots[i];
      if (slot === undefined) continue;
      slot.band.style.display = 'none';
      slot.label.style.display = 'none';
    }
  }

  return {
    update(gaps, rootFontSize) {
      gaps.forEach((gap, index) => {
        const slot = slots[index];
        if (slot === undefined) return;

        slot.band.className = gap.axis === 'y' ? 'gap gap--y' : 'gap gap--x';
        slot.band.style.transform = `translate(${gap.rect.x}px, ${gap.rect.y}px)`;
        slot.band.style.width = `${gap.rect.width}px`;
        slot.band.style.height = `${gap.rect.height}px`;
        slot.band.style.display = 'block';

        slot.icon.textContent = gap.axis === 'y' ? '↕' : '↔';
        slot.value.textContent = rem(gap.distance, rootFontSize);
        slot.label.style.display = 'flex';

        const width = slot.label.offsetWidth;
        const height = slot.label.offsetHeight;
        // A horizontal gap is too narrow to label beside, and the space above it
        // belongs to the chip rows, so it is labelled inside its own band.
        const left =
          gap.axis === 'y'
            ? Math.max(EDGE_GAP, gap.rect.x - width - EDGE_GAP)
            : gap.rect.x + gap.rect.width / 2 - width / 2;
        const top = gap.rect.y + gap.rect.height / 2 - height / 2;
        slot.label.style.transform = `translate(${Math.round(left)}px, ${Math.round(top)}px)`;
      });

      hideFrom(gaps.length);
    },

    hide() {
      hideFrom(0);
    },
  };
}
