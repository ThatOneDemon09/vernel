/** Small DOM predicates shared by the classifier, the gap reader and baselines. */

/**
 * Whether the element has text of its own, as opposed to inheriting the look of
 * text that actually belongs to a descendant.
 */
export function hasDirectText(el: Element): boolean {
  for (const node of el.childNodes) {
    if (node.nodeType !== Node.TEXT_NODE) continue;
    if (node.nodeValue !== null && node.nodeValue.trim() !== '') return true;
  }
  return false;
}

/** Elements that never produce a box, and so can never be a spacing neighbour. */
const UNRENDERED = new Set(['script', 'style', 'link', 'meta', 'title', 'template', 'noscript', 'br']);

export function isRendered(el: Element): boolean {
  if (UNRENDERED.has(el.tagName.toLowerCase())) return false;
  return el.getClientRects().length > 0;
}

/**
 * Out-of-flow boxes sit wherever they are placed, so the distance to one is not
 * spacing anybody authored.
 */
export function isInFlow(cs: CSSStyleDeclaration): boolean {
  return cs.position !== 'absolute' && cs.position !== 'fixed' && cs.float === 'none';
}
