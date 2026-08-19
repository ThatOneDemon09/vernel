import type { BoxModel, Rect } from './geometry.js';
import { div } from './host.js';

/**
 * Margin and padding are drawn as the *border* of a box sized to the outer
 * rect: an exact ring, so the two bands never tint each other where they meet,
 * and nothing is painted outside the element's own footprint.
 */
export interface Boxes {
  update(box: BoxModel): void;
  hide(): void;
}

function place(el: HTMLElement, rect: Rect): void {
  el.style.left = `${rect.x}px`;
  el.style.top = `${rect.y}px`;
  el.style.width = `${rect.width}px`;
  el.style.height = `${rect.height}px`;
}

export function createBoxes(shadow: ShadowRoot): Boxes {
  const margin = div('band', 'band--margin');
  const padding = div('band', 'band--padding');
  const content = div('box', 'box--content');
  shadow.append(margin, padding, content);

  const all = [margin, padding, content];

  return {
    update(box) {
      place(margin, box.margin);
      margin.style.borderWidth = `${box.sides.margin.top}px ${box.sides.margin.right}px ${box.sides.margin.bottom}px ${box.sides.margin.left}px`;

      place(padding, box.padding);
      padding.style.borderWidth = `${box.sides.padding.top}px ${box.sides.padding.right}px ${box.sides.padding.bottom}px ${box.sides.padding.left}px`;

      place(content, box.content);

      for (const el of all) el.style.display = 'block';
    },
    hide() {
      for (const el of all) el.style.display = 'none';
    },
  };
}
