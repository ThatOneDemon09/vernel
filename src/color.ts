/**
 * Colour normalisation. An off-document canvas is the only thing that will
 * resolve any colour syntax the engine understands — `oklch()`, `color()`,
 * named, hex — down to comparable sRGB bytes. It is created but never appended.
 */

export type Rgba = readonly [number, number, number, number];

let paint: CanvasRenderingContext2D | null | undefined;

function paintContext(): CanvasRenderingContext2D | null {
  if (paint === undefined) {
    paint = document.createElement('canvas').getContext('2d', { willReadFrequently: true });
  }
  return paint;
}

/** sRGB bytes for a colour value, or null when the value is not a colour. */
export function toRgba(value: string): Rgba | null {
  const ctx = paintContext();
  if (ctx === null || value === '') return null;

  // An invalid assignment leaves fillStyle alone, so a value that parses lands
  // on the same colour from either sentinel and one that does not never moves.
  ctx.fillStyle = '#000000';
  ctx.fillStyle = value;
  const fromBlack = ctx.fillStyle;
  ctx.fillStyle = '#ffffff';
  ctx.fillStyle = value;
  if (ctx.fillStyle !== fromBlack) return null;

  ctx.clearRect(0, 0, 1, 1);
  ctx.fillRect(0, 0, 1, 1);
  const [r = 0, g = 0, b = 0, a = 0] = ctx.getImageData(0, 0, 1, 1).data;
  return [r, g, b, a];
}

export function rgbaKey(value: string): string | null {
  const rgba = toRgba(value);
  return rgba === null ? null : rgba.join(',');
}

/** `#rrggbb` for opaque colours, the engine's `rgba()` serialisation otherwise. */
export function formatColor(color: string): string {
  const ctx = paintContext();
  if (ctx === null) return color;
  ctx.fillStyle = '#000000';
  ctx.fillStyle = color;
  return typeof ctx.fillStyle === 'string' ? ctx.fillStyle : color;
}

/** WCAG relative luminance, 0 (black) to 1 (white). */
export function luminance([r, g, b]: Rgba): number {
  const channel = (byte: number): number => {
    const value = byte / 255;
    return value <= 0.03928 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
}
