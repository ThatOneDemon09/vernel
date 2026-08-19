import { num } from './format.js';
import { clampInto, type BoxModel, type Rect } from './geometry.js';
import { div } from './host.js';

/**
 * Padding, drawn the way a spacing spec draws it: a line with end caps across
 * the distance, labelled.
 *
 * A designer measuring the same edge in Figma gets padding *plus* border, since
 * the border is inside the shape they drew. Both numbers are on the label — the
 * padding CSS declares, and what the border adds on top of it — because that
 * mismatch is one of the most common ways a spec and an implementation disagree
 * while both look correct.
 */
export interface Measures {
  update(box: BoxModel): void;
  hide(): void;
}

const SIDES = ['top', 'right', 'bottom', 'left'] as const;
type Side = (typeof SIDES)[number];

const LABEL_GAP = 6;

interface Segment {
  /** The line itself: 1px in its cross axis. */
  readonly line: Rect;
  readonly vertical: boolean;
}

function segmentFor(side: Side, box: BoxModel): Segment {
  const { padding, content } = box;
  const midX = content.x + content.width / 2;
  const midY = content.y + content.height / 2;

  switch (side) {
    case 'top':
      return { line: { x: midX, y: padding.y, width: 0, height: content.y - padding.y }, vertical: true };
    case 'bottom': {
      const from = content.y + content.height;
      return { line: { x: midX, y: from, width: 0, height: padding.y + padding.height - from }, vertical: true };
    }
    case 'left':
      return { line: { x: padding.x, y: midY, width: content.x - padding.x, height: 0 }, vertical: false };
    case 'right': {
      const from = content.x + content.width;
      return { line: { x: from, y: midY, width: padding.x + padding.width - from, height: 0 }, vertical: false };
    }
  }
}

export function createMeasures(shadow: ShadowRoot): Measures {
  const slots = SIDES.map((side) => {
    const line = div('measure', `measure--${side}`);
    const label = div('chip', 'chip--pad');
    const value = div('chip__value');
    const note = div('chip__note');
    label.append(value, note);
    shadow.append(line, label);
    return { side, line, label, value, note };
  });

  function hideAll(): void {
    for (const slot of slots) {
      slot.line.style.display = 'none';
      slot.label.style.display = 'none';
    }
  }

  return {
    update(box) {
      for (const slot of slots) {
        const distance = box.sides.padding[slot.side];
        if (distance < 0.5) {
          slot.line.style.display = 'none';
          slot.label.style.display = 'none';
          continue;
        }

        const { line, vertical } = segmentFor(slot.side, box);
        slot.line.className = `measure ${vertical ? 'measure--y' : 'measure--x'}`;
        slot.line.style.transform = `translate(${line.x}px, ${line.y}px)`;
        slot.line.style.width = `${vertical ? 1 : line.width}px`;
        slot.line.style.height = `${vertical ? line.height : 1}px`;
        slot.line.style.display = 'block';

        const border = box.borders[slot.side];
        slot.value.textContent = `${num(distance, 1)}px`;
        slot.note.textContent = border > 0 ? `+${num(border, 1)} border` : '';
        slot.label.style.display = 'flex';

        const width = slot.label.offsetWidth;
        const height = slot.label.offsetHeight;
        const left = clampInto(
          vertical ? line.x + LABEL_GAP : line.x + line.width / 2 - width / 2,
          width,
          document.documentElement.clientWidth,
        );
        const top = clampInto(
          vertical ? line.y + line.height / 2 - height / 2 : line.y - height - LABEL_GAP,
          height,
          document.documentElement.clientHeight,
        );
        slot.label.style.transform = `translate(${Math.round(left)}px, ${Math.round(top)}px)`;
      }
    },

    hide: hideAll,
  };
}
