/**
 * Unit tests for the layout store: clamping, parsing, CSS variables and host
 * storage round-trips.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  DEFAULT_LAYOUT,
  LAYOUT_LIMITS,
  applyLayout,
  bindLayoutStorage,
  clampLayoutSize,
  commitLayout,
  getLayout,
  loadLayout,
  parseLayout,
  serializeLayout,
  setLayoutSize,
} from '../layout';
import type { LayoutSizeKey, LayoutStorage } from '../layout';

const KEYS = Object.keys(DEFAULT_LAYOUT) as LayoutSizeKey[];

function createStorage(value?: unknown): LayoutStorage & {
  get: ReturnType<typeof vi.fn>;
  set: ReturnType<typeof vi.fn>;
} {
  return {
    get: vi.fn().mockResolvedValue(value),
    set: vi.fn().mockResolvedValue(undefined),
  };
}

beforeEach(() => {
  // The store is a module singleton; each test starts from the defaults.
  for (const key of KEYS) setLayoutSize(key, DEFAULT_LAYOUT[key]);
});

afterEach(() => {
  vi.restoreAllMocks();
  document.documentElement.removeAttribute('style');
});

describe('clampLayoutSize', () => {
  it('clamps to the sanity limits and rounds to whole pixels', () => {
    expect(clampLayoutSize('branches', 10)).toBe(LAYOUT_LIMITS.branches.min);
    expect(clampLayoutSize('branches', 9999)).toBe(LAYOUT_LIMITS.branches.max);
    expect(clampLayoutSize('side', 300.6)).toBe(301);
  });

  it('lets the branch column shrink to 160px', () => {
    expect(LAYOUT_LIMITS.branches.min).toBe(160);
  });

  it('falls back to the default for non-finite values', () => {
    expect(clampLayoutSize('side', Number.NaN)).toBe(DEFAULT_LAYOUT.side);
    expect(clampLayoutSize('side', Number.POSITIVE_INFINITY)).toBe(DEFAULT_LAYOUT.side);
  });

  it('keeps 0 as the auto-split sentinel for the changed-files pane', () => {
    expect(clampLayoutSize('filesPane', 0)).toBe(0);
    expect(clampLayoutSize('filesPane', 1)).toBe(LAYOUT_LIMITS.filesPane.min);
  });
});

describe('parseLayout', () => {
  it('reads valid numbers and keeps defaults for invalid entries', () => {
    const parsed = parseLayout({
      branches: 360,
      side: 'wide',
      filesPreview: -5,
      filesPane: 0,
      bottom: 300.4,
    });

    expect(parsed).toEqual({
      branches: 360,
      side: DEFAULT_LAYOUT.side,
      filesPreview: LAYOUT_LIMITS.filesPreview.min,
      filesPane: 0,
      bottom: 300,
    });
  });

  it('returns the defaults for missing or non-object values', () => {
    expect(parseLayout(undefined)).toEqual(DEFAULT_LAYOUT);
    expect(parseLayout(null)).toEqual(DEFAULT_LAYOUT);
    expect(parseLayout('layout')).toEqual(DEFAULT_LAYOUT);
  });
});

describe('applyLayout', () => {
  it('writes every size to a CSS custom property on the document', () => {
    setLayoutSize('branches', 340);
    setLayoutSize('side', 420);
    setLayoutSize('filesPreview', 180);
    setLayoutSize('bottom', 260);

    const style = document.documentElement.style;
    expect(style.getPropertyValue('--gm-branches-w')).toBe('340px');
    expect(style.getPropertyValue('--gm-side-w')).toBe('420px');
    expect(style.getPropertyValue('--gm-preview-h')).toBe('180px');
    expect(style.getPropertyValue('--gm-bottom-h')).toBe('260px');
    // 0 means "use the stylesheet's 50/50 default".
    expect(style.getPropertyValue('--gm-files-pane-h')).toBe('');
  });

  it('sets and clears the changed-files pane height', () => {
    setLayoutSize('filesPane', 320);
    expect(document.documentElement.style.getPropertyValue('--gm-files-pane-h')).toBe('320px');

    setLayoutSize('filesPane', 0);
    expect(document.documentElement.style.getPropertyValue('--gm-files-pane-h')).toBe('');
  });

  it('can repaint the current sizes on demand', () => {
    document.documentElement.removeAttribute('style');
    applyLayout();
    expect(document.documentElement.style.getPropertyValue('--gm-side-w')).toBe('300px');
  });

  it('paints narrower columns when a wide layout reopens in a small viewport', () => {
    Object.defineProperty(document.documentElement, 'clientWidth', {
      configurable: true,
      value: 600,
    });

    setLayoutSize('branches', 500);
    setLayoutSize('side', 600);

    const style = document.documentElement.style;
    expect(style.getPropertyValue('--gm-branches-w')).toBe('200px');
    expect(style.getPropertyValue('--gm-side-w')).toBe('240px');
    // The stored preference is unchanged, so a wide window gets it back.
    expect(getLayout()).toMatchObject({ branches: 500, side: 600 });

    delete (document.documentElement as unknown as { clientWidth?: number }).clientWidth;
  });
});

describe('host storage', () => {
  it('loads stored sizes and applies them', async () => {
    const storage = createStorage({ branches: 320, side: 360, filesPane: 180 });
    bindLayoutStorage(storage);

    await loadLayout();

    expect(storage.get).toHaveBeenCalledWith('layout.v1');
    expect(getLayout()).toMatchObject({ branches: 320, side: 360, filesPane: 180 });
    expect(document.documentElement.style.getPropertyValue('--gm-branches-w')).toBe('320px');
  });

  it('keeps the current sizes when loading fails', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const storage = createStorage(undefined);
    storage.get.mockRejectedValueOnce(new Error('offline'));
    bindLayoutStorage(storage);

    await loadLayout();

    expect(getLayout()).toEqual(DEFAULT_LAYOUT);
    expect(warn).toHaveBeenCalledTimes(1);
  });

  it('persists all sizes when a drag ends', () => {
    const storage = createStorage();
    bindLayoutStorage(storage);
    setLayoutSize('branches', 350);
    setLayoutSize('filesPane', 220);

    commitLayout();

    expect(storage.set).toHaveBeenCalledWith('layout.v1', serializeLayout(getLayout()));
    expect(storage.set.mock.calls[0][1]).toMatchObject({ branches: 350, filesPane: 220 });
  });

  it('reports a save failure without throwing', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const storage = createStorage();
    storage.set.mockRejectedValueOnce(new Error('disk full'));
    bindLayoutStorage(storage);

    commitLayout();
    await Promise.resolve();

    expect(warn).toHaveBeenCalledTimes(1);
  });
});
