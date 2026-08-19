export interface Hotkey {
  readonly key: string;
  readonly alt: boolean;
  readonly ctrl: boolean;
  readonly meta: boolean;
  readonly shift: boolean;
}

function isApplePlatform(): boolean {
  if (typeof navigator === 'undefined') return false;
  return /mac|iphone|ipad|ipod/i.test(navigator.userAgent);
}

/** Parses `"Alt+V"`, `"Mod+Shift+K"`, `"F2"`. Returns null if there is no key. */
export function parseHotkey(spec: string): Hotkey | null {
  const parts = spec
    .split('+')
    .map((part) => part.trim().toLowerCase())
    .filter(Boolean);
  const key = parts.pop();
  if (key === undefined) return null;

  const modifiers = new Set(parts);
  const mod = modifiers.has('mod');
  return {
    key,
    alt: modifiers.has('alt') || modifiers.has('option'),
    ctrl: modifiers.has('ctrl') || modifiers.has('control') || (mod && !isApplePlatform()),
    meta: modifiers.has('meta') || modifiers.has('cmd') || modifiers.has('command') || (mod && isApplePlatform()),
    shift: modifiers.has('shift'),
  };
}

function matches(event: KeyboardEvent, hotkey: Hotkey): boolean {
  if (
    event.altKey !== hotkey.alt ||
    event.ctrlKey !== hotkey.ctrl ||
    event.metaKey !== hotkey.meta ||
    event.shiftKey !== hotkey.shift
  ) {
    return false;
  }
  if (event.key.toLowerCase() === hotkey.key) return true;

  // Alt rewrites `key` on macOS (Alt+V arrives as "√"), so single characters
  // also match on physical position.
  if (hotkey.key.length !== 1) return false;
  if (hotkey.key >= 'a' && hotkey.key <= 'z') return event.code === `Key${hotkey.key.toUpperCase()}`;
  if (hotkey.key >= '0' && hotkey.key <= '9') return event.code === `Digit${hotkey.key}`;
  return false;
}

/** Typing into a field should never toggle an inspector. */
function isEditableTarget(event: KeyboardEvent): boolean {
  const target = event.composedPath()[0] ?? event.target;
  if (!(target instanceof HTMLElement)) return false;
  if (target.isContentEditable) return true;
  const tag = target.tagName;
  return tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT';
}

/** Binds `spec` to `action`. Returns an unbind function, or null if unparseable. */
export function bindHotkey(spec: string, action: () => void): (() => void) | null {
  const hotkey = parseHotkey(spec);
  if (hotkey === null) return null;

  const onKeyDown = (event: KeyboardEvent): void => {
    if (isEditableTarget(event) || !matches(event, hotkey)) return;
    event.preventDefault();
    action();
  };

  window.addEventListener('keydown', onKeyDown, true);
  return () => window.removeEventListener('keydown', onKeyDown, true);
}
