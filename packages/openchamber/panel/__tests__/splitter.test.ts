/**
 * Unit tests for the divider: pointer drags along the axis, clamping, sign
 * direction, keyboard nudges and ARIA values.
 */
import { afterEach, describe, expect, it } from 'vitest';

import { createSplitter } from '../components/splitter';

function pointerEvent(type: string, x: number, y: number, button = 0): MouseEvent {
  return new MouseEvent(type, {
    clientX: x,
    clientY: y,
    button,
    bubbles: true,
    cancelable: true,
  });
}

function keyEvent(key: string, shiftKey = false): KeyboardEvent {
  return new KeyboardEvent('keydown', { key, shiftKey, bubbles: true, cancelable: true });
}

interface Harness {
  el: HTMLElement;
  size: () => number;
  commits: number[];
  setSize: (px: number) => void;
}

function createHarness(options: {
  axis: 'x' | 'y';
  sign: 1 | -1;
  size?: number;
  min?: number;
  max?: number;
}): Harness {
  let size = options.size ?? 300;
  const commits: number[] = [];
  const el = createSplitter({
    axis: options.axis,
    sign: options.sign,
    value: () => size,
    min: () => options.min ?? 200,
    max: () => options.max ?? 500,
    onResize: (px) => { size = px; },
    onCommit: (px) => { commits.push(px); },
  });
  document.body.appendChild(el);
  return { el, size: () => size, commits, setSize: (px) => { size = px; } };
}

afterEach(() => {
  document.body.innerHTML = '';
  document.documentElement.className = '';
});

describe('createSplitter', () => {
  it('renders a focusable separator with its current bounds', () => {
    const { el } = createHarness({ axis: 'x', sign: 1 });

    expect(el.getAttribute('role')).toBe('separator');
    expect(el.getAttribute('aria-orientation')).toBe('vertical');
    expect(el.getAttribute('aria-valuemin')).toBe('200');
    expect(el.getAttribute('aria-valuemax')).toBe('500');
    expect(el.getAttribute('aria-valuenow')).toBe('300');
    expect(el.tabIndex).toBe(0);
    expect(el.classList.contains('gm-splitter--x')).toBe(true);
  });

  it('grows the sized pane when dragging along the positive axis', () => {
    const { el, size, commits } = createHarness({ axis: 'x', sign: 1 });

    el.dispatchEvent(pointerEvent('pointerdown', 300, 0));
    expect(el.classList.contains('gm-splitter--active')).toBe(true);
    expect(document.documentElement.classList.contains('gm-splitter-dragging--x')).toBe(true);

    window.dispatchEvent(pointerEvent('pointermove', 348, 0));
    expect(size()).toBe(348);
    expect(el.getAttribute('aria-valuenow')).toBe('348');

    window.dispatchEvent(pointerEvent('pointerup', 348, 0));
    expect(commits).toEqual([348]);
    expect(el.classList.contains('gm-splitter--active')).toBe(false);
    expect(document.documentElement.classList.contains('gm-splitter-dragging')).toBe(false);
  });

  it('shrinks the sized pane when the sign is negative', () => {
    const { el, size } = createHarness({ axis: 'x', sign: -1 });

    el.dispatchEvent(pointerEvent('pointerdown', 400, 0));
    window.dispatchEvent(pointerEvent('pointermove', 350, 0));

    // Pointer moved 50px toward the pane, so the pane gained 50px.
    expect(size()).toBe(350);
  });

  it('clamps to the live minimum and maximum', () => {
    const { el, size } = createHarness({ axis: 'y', sign: 1 });

    el.dispatchEvent(pointerEvent('pointerdown', 200, 200));
    window.dispatchEvent(pointerEvent('pointermove', 200, 2000));
    expect(size()).toBe(500);

    window.dispatchEvent(pointerEvent('pointermove', 200, -2000));
    expect(size()).toBe(200);

    window.dispatchEvent(pointerEvent('pointerup', 0, 0));
  });

  it('ignores pointer buttons other than the primary one', () => {
    const { el, size, commits } = createHarness({ axis: 'x', sign: 1 });

    el.dispatchEvent(pointerEvent('pointerdown', 300, 0, 2));
    window.dispatchEvent(pointerEvent('pointermove', 400, 0));

    expect(size()).toBe(300);
    expect(commits).toEqual([]);
    expect(el.classList.contains('gm-splitter--active')).toBe(false);
  });

  it('nudges with the arrow keys and jumps to the bounds with Home/End', () => {
    const { el, size, commits } = createHarness({ axis: 'x', sign: 1 });

    el.dispatchEvent(keyEvent('ArrowRight'));
    expect(size()).toBe(308);

    el.dispatchEvent(keyEvent('ArrowLeft', true));
    expect(size()).toBe(276);

    el.dispatchEvent(keyEvent('Home'));
    expect(size()).toBe(200);

    el.dispatchEvent(keyEvent('End'));
    expect(size()).toBe(500);
    expect(commits).toEqual([308, 276, 200, 500]);
  });

  it('maps arrow keys to the pane direction for a negative sign', () => {
    const { el, size } = createHarness({ axis: 'y', sign: -1 });

    // Moving the divider up (ArrowUp) grows a pane sized from the bottom.
    el.dispatchEvent(keyEvent('ArrowUp'));
    expect(size()).toBe(308);

    el.dispatchEvent(keyEvent('ArrowDown'));
    expect(size()).toBe(300);
  });

  it('does not react to unrelated keys', () => {
    const { el, size, commits } = createHarness({ axis: 'x', sign: 1 });

    const event = keyEvent('a');
    el.dispatchEvent(event);

    expect(size()).toBe(300);
    expect(commits).toEqual([]);
    expect(event.defaultPrevented).toBe(false);
  });

  it('refreshes the ARIA bounds when the viewport changes', () => {
    const { el } = createHarness({ axis: 'x', sign: 1, min: 220, max: 640 });

    el.dispatchEvent(new FocusEvent('focus'));
    expect(el.getAttribute('aria-valuemin')).toBe('220');
    expect(el.getAttribute('aria-valuemax')).toBe('640');
  });
});
