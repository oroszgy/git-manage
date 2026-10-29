/**
 * Draggable divider between two panes.
 *
 * The splitter knows only the axis, the current size of the pane it resizes
 * and how to clamp it; layout persistence and the actual CSS property stay in
 * the caller. Pointer events are tracked on `window` so a fast drag that
 * leaves the 5px handle keeps working.
 */

import { html } from '../html';
import { t } from '../i18n';

export interface SplitterOptions {
  /** Axis the handle moves along: x for a vertical divider, y for horizontal. */
  axis: 'x' | 'y';
  /** +1 when moving toward +axis grows the sized pane, -1 when it shrinks it. */
  sign: 1 | -1;
  /** Current size of the sized pane in px. */
  value: () => number;
  /** Smallest allowed size in px for the current viewport. */
  min: () => number;
  /** Largest allowed size in px for the current viewport. */
  max: () => number;
  /** Called continuously while dragging. */
  onResize: (px: number) => void;
  /** Called once the pointer or key is released, for persistence. */
  onCommit: (px: number) => void;
}

/** Keyboard nudge; Shift takes a bigger step. */
const KEY_STEP = 8;
const KEY_STEP_LARGE = 32;

interface Bounds {
  min: number;
  max: number;
}

/**
 * Create a separator that resizes its neighbouring pane.
 * @returns the separator element to insert between the two panes
 */
export function createSplitter(options: SplitterOptions): HTMLElement {
  const vertical = options.axis === 'x';

  const el = html`
    <div
      class="gm-splitter gm-splitter--${vertical ? 'x' : 'y'}"
      role="separator"
      tabindex="0"
      aria-orientation="${vertical ? 'vertical' : 'horizontal'}"
      aria-label="${t('layout.resizeDivider')}"
    ></div>
  `;

  let dragging = false;
  let pointerId = -1;
  let origin = 0;
  let startSize = 0;
  let currentSize = 0;

  const bounds = (): Bounds => {
    const min = Math.max(1, Math.round(options.min()));
    const max = Math.max(min, Math.round(options.max()));
    return { min, max };
  };

  const clamp = (px: number): number => {
    const { min, max } = bounds();
    return Math.round(Math.min(max, Math.max(min, px)));
  };

  const syncAria = (): void => {
    const { min, max } = bounds();
    el.setAttribute('aria-valuemin', String(min));
    el.setAttribute('aria-valuemax', String(max));
    el.setAttribute('aria-valuenow', String(clamp(options.value())));
  };

  const move = (event: PointerEvent): void => {
    if (!dragging) return;
    event.preventDefault();
    const pointer = vertical ? event.clientX : event.clientY;
    currentSize = clamp(startSize + (pointer - origin) * options.sign);
    options.onResize(currentSize);
    syncAria();
  };

  const finish = (): void => {
    if (!dragging) return;
    dragging = false;
    window.removeEventListener('pointermove', moveListener);
    window.removeEventListener('pointerup', endListener);
    window.removeEventListener('pointercancel', endListener);
    el.classList.remove('gm-splitter--active');
    document.documentElement.classList.remove('gm-splitter-dragging');
    document.documentElement.classList.remove('gm-splitter-dragging--x');
    document.documentElement.classList.remove('gm-splitter-dragging--y');
    try {
      el.releasePointerCapture(pointerId);
    } catch {
      // Capture was never taken (pointer capture is unavailable in jsdom).
    }
    options.onCommit(currentSize);
  };

  const moveListener = (event: Event): void => { move(event as PointerEvent); };
  const endListener = (): void => { finish(); };

  el.addEventListener('pointerdown', (event) => {
    const pointer = event as PointerEvent;
    if (pointer.button !== 0) return;
    event.preventDefault();
    dragging = true;
    pointerId = pointer.pointerId;
    origin = vertical ? pointer.clientX : pointer.clientY;
    startSize = options.value();
    currentSize = clamp(startSize);
    el.classList.add('gm-splitter--active');
    document.documentElement.classList.add('gm-splitter-dragging');
    document.documentElement.classList.add(vertical ? 'gm-splitter-dragging--x' : 'gm-splitter-dragging--y');
    try {
      el.setPointerCapture(pointer.pointerId);
    } catch {
      // Pointer capture is an optimisation; window listeners still track the drag.
    }
    window.addEventListener('pointermove', moveListener);
    window.addEventListener('pointerup', endListener);
    window.addEventListener('pointercancel', endListener);
  });

  el.addEventListener('keydown', (event) => {
    const { min, max } = bounds();
    let next: number | null = null;

    if (event.key === 'Home') {
      next = min;
    } else if (event.key === 'End') {
      next = max;
    } else {
      const step = event.shiftKey ? KEY_STEP_LARGE : KEY_STEP;
      const grow = vertical ? 'ArrowRight' : 'ArrowDown';
      const shrink = vertical ? 'ArrowLeft' : 'ArrowUp';
      if (event.key === grow) next = options.value() + step * options.sign;
      else if (event.key === shrink) next = options.value() - step * options.sign;
    }

    if (next === null) return;
    event.preventDefault();
    currentSize = clamp(next);
    options.onResize(currentSize);
    syncAria();
    options.onCommit(currentSize);
  });

  el.addEventListener('focus', syncAria);
  syncAria();

  return el;
}
