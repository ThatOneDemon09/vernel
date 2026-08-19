import { hasDirectText } from './dom.js';
import { typeFrom } from './metrics.js';

/**
 * A semantic name for what the element *is*, in the vocabulary a designer would
 * use in a layer list — "Headline Block", "Narrative Text", "Radio Input" —
 * rather than the tag name a browser would use.
 */

const INPUT_ROLES: Readonly<Record<string, string>> = {
  radio: 'Radio Input',
  checkbox: 'Checkbox Input',
  range: 'Range Input',
  color: 'Color Input',
  file: 'File Input',
  date: 'Date Input',
  'datetime-local': 'Date Time Input',
  month: 'Month Input',
  week: 'Week Input',
  time: 'Time Input',
  email: 'Email Input',
  password: 'Password Input',
  search: 'Search Input',
  tel: 'Phone Input',
  url: 'URL Input',
  number: 'Number Input',
  hidden: 'Hidden Input',
  submit: 'Button',
  button: 'Button',
  reset: 'Button',
  image: 'Image Button',
};

const TAG_ROLES: Readonly<Record<string, string>> = {
  h1: 'Headline Block',
  h2: 'Headline Block',
  h3: 'Subhead Block',
  h4: 'Subhead Block',
  h5: 'Subhead Block',
  h6: 'Subhead Block',
  p: 'Narrative Text',
  li: 'List Item Text',
  dt: 'Term Text',
  dd: 'Definition Text',
  blockquote: 'Quote Block',
  q: 'Quote Text',
  cite: 'Citation Text',
  figcaption: 'Caption Text',
  caption: 'Caption Text',
  small: 'Caption Text',
  label: 'Label Text',
  legend: 'Legend Text',
  a: 'Link Text',
  button: 'Button',
  summary: 'Summary Text',
  th: 'Table Head Cell',
  td: 'Table Cell',
  strong: 'Strong Text',
  b: 'Strong Text',
  em: 'Italic Text',
  i: 'Italic Text',
  code: 'Code Text',
  kbd: 'Code Text',
  samp: 'Code Text',
  pre: 'Code Block',
  textarea: 'Text Area',
  select: 'Select Input',
  option: 'Option Text',
  progress: 'Progress Bar',
  meter: 'Meter Bar',
  img: 'Image',
  picture: 'Image',
  svg: 'Vector',
  canvas: 'Canvas',
  video: 'Video',
  audio: 'Audio',
  iframe: 'Frame',
  hr: 'Divider',
  ul: 'List Group',
  ol: 'List Group',
  dl: 'List Group',
  nav: 'Nav Group',
  header: 'Header Group',
  footer: 'Footer Group',
  main: 'Main Group',
  section: 'Section Group',
  article: 'Article Group',
  aside: 'Aside Group',
  form: 'Form Group',
  fieldset: 'Field Group',
  table: 'Table Group',
  thead: 'Table Head Group',
  tbody: 'Table Body Group',
  tfoot: 'Table Foot Group',
  tr: 'Table Row',
  figure: 'Figure Group',
  dialog: 'Dialog Group',
  details: 'Disclosure Group',
  html: 'Root Block',
  body: 'Page Block',
};

const ARIA_ROLES: Readonly<Record<string, string>> = {
  heading: 'Headline Block',
  paragraph: 'Narrative Text',
  button: 'Button',
  link: 'Link Text',
  listitem: 'List Item Text',
  textbox: 'Text Input',
  searchbox: 'Search Input',
  checkbox: 'Checkbox Input',
  radio: 'Radio Input',
  switch: 'Switch Input',
  slider: 'Range Input',
  combobox: 'Select Input',
  option: 'Option Text',
  img: 'Image',
  separator: 'Divider',
  list: 'List Group',
  navigation: 'Nav Group',
  banner: 'Header Group',
  contentinfo: 'Footer Group',
  main: 'Main Group',
  complementary: 'Aside Group',
  region: 'Section Group',
  dialog: 'Dialog Group',
  alertdialog: 'Dialog Group',
  tablist: 'Tab Group',
  tab: 'Tab Text',
  tabpanel: 'Tab Panel Group',
  menu: 'Menu Group',
  menuitem: 'Menu Item Text',
  table: 'Table Group',
  row: 'Table Row',
  cell: 'Table Cell',
  columnheader: 'Table Head Cell',
  rowheader: 'Table Head Cell',
};

function titleCase(value: string): string {
  return value.replace(/(^|[\s-])([a-z])/g, (_, lead: string, letter: string) => lead + letter.toUpperCase());
}

/**
 * Tags whose look may outrank their name. An uppercase, wide-tracked, small
 * line is an eyebrow whether it is a span, a p or an h6 — but a button with the
 * same treatment is still a button, so interactive and tabular tags keep theirs.
 */
const EYEBROW_TAGS = new Set(['p', 'span', 'div', 'li', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'strong', 'em', 'small']);

function remSize(cs: CSSStyleDeclaration, rootFontSize: number): number {
  const size = typeFrom(cs).fontSize;
  return rootFontSize === 0 ? size / 16 : size / rootFontSize;
}

function isEyebrow(cs: CSSStyleDeclaration, rootFontSize: number): boolean {
  if (cs.textTransform !== 'uppercase') return false;
  const trackingEm = typeFrom(cs).tracking / 1000;
  return trackingEm >= 0.04 && remSize(cs, rootFontSize) <= 1.05;
}

/** Text with no tag of its own to go on: size alone has to carry the meaning. */
function classifyText(cs: CSSStyleDeclaration, rootFontSize: number): string {
  const rem = remSize(cs, rootFontSize);
  if (rem >= 2) return 'Display Text';
  if (rem <= 0.8) return 'Caption Text';
  return 'Body Text';
}

/**
 * The semantic name for `el` as it is currently rendered — "Headline Block",
 * "Narrative Text", "Radio Input".
 */
export function readRole(el: Element): string {
  const root = el.ownerDocument.documentElement;
  const rootFontSize = Number.parseFloat(getComputedStyle(root).fontSize) || 16;
  return classifyRole(el, getComputedStyle(el), rootFontSize);
}

/** The semantic name shown for `el`. Never empty. */
export function classifyRole(el: Element, cs: CSSStyleDeclaration, rootFontSize: number): string {
  if (el instanceof HTMLElement && el.isContentEditable) return 'Editable Text';

  if (el instanceof HTMLInputElement) return INPUT_ROLES[el.type] ?? 'Text Input';

  const aria = el.getAttribute('role');
  if (aria !== null && aria !== '') {
    const first = aria.trim().split(/\s+/)[0] ?? '';
    return ARIA_ROLES[first] ?? `${titleCase(first)} Element`;
  }

  const tag = el.tagName.toLowerCase();
  const hasText = hasDirectText(el);
  if (hasText && EYEBROW_TAGS.has(tag) && isEyebrow(cs, rootFontSize)) return 'Eyebrow Label';

  const byTag = TAG_ROLES[tag];
  if (byTag !== undefined) return byTag;

  if (hasText) return classifyText(cs, rootFontSize);

  const display = cs.display;
  if (display.includes('flex') || display.includes('grid')) return 'Layout Block';
  if (display.startsWith('inline')) return 'Inline Group';
  return 'Container Block';
}
