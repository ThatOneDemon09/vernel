export interface HoverTarget {
  readonly element: Element | null;
  readonly x: number;
  readonly y: number;
}

export interface HoverOptions {
  /** The overlay host, which must never be inspected or reported. */
  readonly host: Element;
  /** Element the baseline grid is anchored to; its resizes need a redraw. */
  readonly root: Element;
  readonly onFrame: (target: HoverTarget) => void;
}

export interface Hover {
  start(): void;
  stop(): void;
  /** Coalesced redraw request — safe to call from any event. */
  schedule(): void;
}

/**
 * Web components hide their content behind a shadow root, and hit testing that
 * stops at the host reports a metrics-free wrapper. Open roots re-test at the
 * same point until the innermost element is reached.
 */
function deepElementFromPoint(x: number, y: number): Element | null {
  let element = document.elementFromPoint(x, y);
  for (let depth = 0; depth < 16; depth += 1) {
    const shadow = element?.shadowRoot;
    if (!shadow) break;
    const inner = shadow.elementFromPoint(x, y);
    if (!inner || inner === element) break;
    element = inner;
  }
  return element;
}

export function createHover({ host, root, onFrame }: HoverOptions): Hover {
  let x: number | null = null;
  let y: number | null = null;
  let frame = 0;
  let running = false;
  let observed: Element | null = null;

  const observer =
    typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(() => schedule());

  function schedule(): void {
    if (!running || frame !== 0) return;
    frame = requestAnimationFrame(run);
  }

  function run(): void {
    frame = 0;
    if (!running) return;

    if (x === null || y === null) {
      onFrame({ element: null, x: 0, y: 0 });
      return;
    }

    const hit = deepElementFromPoint(x, y);
    const element = hit === null || hit === host || hit.getRootNode() === host.shadowRoot ? null : hit;

    // Watch the hovered element so it redraws when it resizes under a still
    // cursor — a lazy image landing, a details element opening.
    if (observer && element !== observed) {
      if (observed && observed !== root) observer.unobserve(observed);
      if (element && element !== root) observer.observe(element);
      observed = element;
    }

    onFrame({ element, x, y });
  }

  function onPointerMove(event: PointerEvent): void {
    x = event.clientX;
    y = event.clientY;
    schedule();
  }

  function onPointerLeave(): void {
    x = null;
    y = null;
    schedule();
  }

  return {
    start() {
      if (running) return;
      running = true;
      // Capture phase throughout: a page that stops propagation on its own
      // handlers must not be able to blind the inspector.
      window.addEventListener('pointermove', onPointerMove, { capture: true, passive: true });
      document.addEventListener('scroll', schedule, { capture: true, passive: true });
      window.addEventListener('resize', schedule, { passive: true });
      document.addEventListener('pointerleave', onPointerLeave);
      observer?.observe(root);
      schedule();
    },

    stop() {
      if (!running) return;
      running = false;
      window.removeEventListener('pointermove', onPointerMove, { capture: true });
      document.removeEventListener('scroll', schedule, { capture: true });
      window.removeEventListener('resize', schedule);
      document.removeEventListener('pointerleave', onPointerLeave);
      observer?.disconnect();
      observed = null;
      if (frame !== 0) {
        cancelAnimationFrame(frame);
        frame = 0;
      }
    },

    schedule,
  };
}
