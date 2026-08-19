import type { BoxSides } from '../metrics.js';
import type { Side } from './gaps.js';
import type { BoxModel, Rect } from './geometry.js';
import { div } from './host.js';

/**
 * Margin and padding are drawn as the *border* of a box sized to the outer
 * rect: an exact ring, so the two bands never tint each other where they meet,
 * and nothing is painted outside the element's own footprint.
 */
export interface Boxes {
  /**
   * `explained` names the sides where a gap band is already drawn. The measured
   * gap is the more useful truth — it has collapsing folded in — so the margin
   * band steps aside rather than tinting the same space twice.
   */
  update(box: BoxModel, explained: ReadonlySet<Side>): void;
  hide(): void;
}

function place(el: HTMLElement, rect: Rect): void {
  el.style.transform = `translate(${rect.x}px, ${rect.y}px)`;
  el.style.width = `${rect.width}px`;
  el.style.height = `${rect.height}px`;
}

/** Half a handle, so each one is centred on its corner. */
const HANDLE_OFFSET = 3.5;

export function createBoxes(shadow: ShadowRoot): Boxes {
  const margin = div('band', 'band--margin');
  const padding = div('band', 'band--padding');
  const content = div('box', 'box--content');
  const outline = div('outline');
  const handles = [div('handle'), div('handle'), div('handle'), div('handle')];
  shadow.append(margin, padding, content, outline, ...handles);

  const all = [margin, padding, content, outline, ...handles];

  return {
    update(box, explained) {
      const shown: BoxSides = {
        top: explained.has('top') ? 0 : box.sides.margin.top,
        right: explained.has('right') ? 0 : box.sides.margin.right,
        bottom: explained.has('bottom') ? 0 : box.sides.margin.bottom,
        left: explained.has('left') ? 0 : box.sides.margin.left,
      };
      place(margin, {
        x: box.border.x - shown.left,
        y: box.border.y - shown.top,
        width: box.border.width + shown.left + shown.right,
        height: box.border.height + shown.top + shown.bottom,
      });
      margin.style.borderWidth = `${shown.top}px ${shown.right}px ${shown.bottom}px ${shown.left}px`;

      place(padding, box.padding);
      padding.style.borderWidth = `${box.sides.padding.top}px ${box.sides.padding.right}px ${box.sides.padding.bottom}px ${box.sides.padding.left}px`;

      place(content, box.content);
      place(outline, box.border);

      const right = box.border.x + box.border.width;
      const bottom = box.border.y + box.border.height;
      const corners: ReadonlyArray<readonly [number, number]> = [
        [box.border.x, box.border.y],
        [right, box.border.y],
        [right, bottom],
        [box.border.x, bottom],
      ];
      handles.forEach((handle, index) => {
        const corner = corners[index];
        if (corner === undefined) return;
        handle.style.transform = `translate(${corner[0] - HANDLE_OFFSET}px, ${corner[1] - HANDLE_OFFSET}px)`;
      });

      for (const el of all) el.style.display = 'block';
    },

    hide() {
      for (const el of all) el.style.display = 'none';
    },
  };
}
