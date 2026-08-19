import type { BoxSides } from '../metrics.js';

/** Trims float noise without hiding the sub-pixel values that matter. */
export function num(value: number, decimals = 2): string {
  const rounded = Number(value.toFixed(decimals));
  return Object.is(rounded, -0) ? '0' : String(rounded);
}

export function px(value: number, decimals = 2): string {
  return `${num(value, decimals)}px`;
}

export function signed(value: number, decimals = 2): string {
  const text = num(value, decimals);
  return value > 0 ? `+${text}` : text;
}

/** CSS shorthand collapsing, exactly as a stylesheet would serialize it. */
export function shorthand(sides: BoxSides): string {
  const { top, right, bottom, left } = sides;
  if (left !== right) return `${px(top)} ${px(right)} ${px(bottom)} ${px(left)}`;
  if (top !== bottom) return `${px(top)} ${px(right)} ${px(bottom)}`;
  if (top !== right) return `${px(top)} ${px(right)}`;
  return px(top);
}

/** First family in a computed font stack, unquoted. */
export function firstFamily(stack: string): string {
  const first = stack.split(',')[0]?.trim() ?? '';
  return first.replace(/^["']|["']$/g, '') || 'unknown';
}

/** `h1#title.lead` — enough to recognise the element without the full path. */
export function describe(el: Element): string {
  const tag = el.tagName.toLowerCase();
  const id = el.id ? `#${el.id}` : '';
  const classes =
    typeof el.className === 'string'
      ? el.className
          .trim()
          .split(/\s+/)
          .filter(Boolean)
          .slice(0, 2)
          .map((c) => `.${c}`)
          .join('')
      : '';
  return `${tag}${id}${classes}`;
}
