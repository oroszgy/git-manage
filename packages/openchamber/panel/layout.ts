/**
 * Persisted panel layout.
 *
 * Divider positions live as CSS custom properties on <html>, so a rebuild of
 * the three-column shell keeps them without passing sizes through every
 * component. The values are written to the host's extension storage on every
 * drag end.
 */

/** Divider whose position the user can change. */
export type LayoutSizeKey =
  | 'branches'
  | 'side'
  | 'filesPreview'
  | 'filesPane'
  | 'bottom';

/** Pixel sizes for every draggable divider. */
export interface LayoutSizes {
  /** Width of the branch column. */
  branches: number;
  /** Width of the right-hand details column. */
  side: number;
  /** Height of the diff preview under the changed-file list. */
  filesPreview: number;
  /** Height of the changed-files pane above the commit detail; 0 = 50/50. */
  filesPane: number;
  /** Height of the bottom console/worktrees panel. */
  bottom: number;
}

/** Sizes used before anything is dragged and when storage is unreadable. */
export const DEFAULT_LAYOUT: LayoutSizes = {
  branches: 280,
  side: 300,
  filesPreview: 120,
  filesPane: 0,
  bottom: 220,
};

/**
 * Sanity limits independent of the current viewport. A splitter also clamps to
 * the space its container actually has; these keep stored values usable when
 * the panel is reopened in a different window.
 */
export const LAYOUT_LIMITS: Record<LayoutSizeKey, { min: number; max: number }> = {
  branches: { min: 220, max: 640 },
  side: { min: 220, max: 900 },
  filesPreview: { min: 40, max: 2000 },
  filesPane: { min: 80, max: 4000 },
  bottom: { min: 120, max: 900 },
};

const STORAGE_KEY = 'layout.v1';
const SIZE_KEYS = Object.keys(DEFAULT_LAYOUT) as LayoutSizeKey[];

/** Clamp one stored value to its sanity limits. */
export function clampLayoutSize(key: LayoutSizeKey, value: number): number {
  if (!Number.isFinite(value)) return DEFAULT_LAYOUT[key];
  // 0 is the sentinel for the default 50/50 split of the details column.
  if (key === 'filesPane' && value === 0) return 0;
  const { min, max } = LAYOUT_LIMITS[key];
  return Math.round(Math.min(max, Math.max(min, value)));
}

/** Read a stored layout, keeping defaults for missing or invalid entries. */
export function parseLayout(value: unknown): LayoutSizes {
  const next: LayoutSizes = { ...DEFAULT_LAYOUT };
  if (!value || typeof value !== 'object') return next;

  const stored = value as Record<string, unknown>;
  for (const key of SIZE_KEYS) {
    const raw = stored[key];
    if (typeof raw === 'number' && Number.isFinite(raw)) {
      next[key] = clampLayoutSize(key, raw);
    }
  }
  return next;
}

/** Plain JSON object for host storage. */
export function serializeLayout(sizes: LayoutSizes): Record<string, number> {
  return {
    branches: sizes.branches,
    side: sizes.side,
    filesPreview: sizes.filesPreview,
    filesPane: sizes.filesPane,
    bottom: sizes.bottom,
  };
}

/** The slice of `host.storage` the layout needs. */
export interface LayoutStorage {
  get(key: string): Promise<unknown>;
  set(key: string, value: Record<string, number>): Promise<unknown>;
}

let sizes: LayoutSizes = { ...DEFAULT_LAYOUT };
let storage: LayoutStorage | null = null;

/** Current divider sizes. */
export function getLayout(): LayoutSizes {
  return sizes;
}

/** Push the current sizes onto the document as CSS custom properties. */
export function applyLayout(): void {
  let branches = sizes.branches;
  let side = sizes.side;

  // A layout saved in a wide window must not bury the commit list when the
  // panel is reopened narrower. Shrink both columns proportionally, keeping
  // their minimums, without touching the stored preference.
  const width = document.documentElement.clientWidth || window.innerWidth || 0;
  if (width > 0) {
    const maxCombined = Math.max(440, width - 215);
    const total = branches + side;
    if (total > maxCombined) {
      const ratio = maxCombined / total;
      branches = Math.max(LAYOUT_LIMITS.branches.min, Math.round(branches * ratio));
      side = Math.max(LAYOUT_LIMITS.side.min, Math.round(side * ratio));
    }
  }

  const root = document.documentElement;
  root.style.setProperty('--gm-branches-w', `${branches}px`);
  root.style.setProperty('--gm-side-w', `${side}px`);
  root.style.setProperty('--gm-preview-h', `${sizes.filesPreview}px`);
  root.style.setProperty('--gm-bottom-h', `${sizes.bottom}px`);
  if (sizes.filesPane > 0) {
    root.style.setProperty('--gm-files-pane-h', `${sizes.filesPane}px`);
  } else {
    root.style.removeProperty('--gm-files-pane-h');
  }
}

/**
 * Move one divider and repaint immediately. Storage is written on drag end by
 * {@link commitLayout}, not on every pointermove.
 * @returns the clamped size that was applied
 */
export function setLayoutSize(key: LayoutSizeKey, value: number): number {
  sizes = { ...sizes, [key]: clampLayoutSize(key, value) };
  applyLayout();
  return sizes[key];
}

/** Use the host's extension storage for later loads and saves. */
export function bindLayoutStorage(next: LayoutStorage): void {
  storage = next;
}

/** Load stored sizes; failures keep the defaults rather than blocking the panel. */
export async function loadLayout(): Promise<void> {
  if (!storage) return;
  try {
    sizes = parseLayout(await storage.get(STORAGE_KEY));
    applyLayout();
  } catch (e) {
    console.warn(JSON.stringify({ prefix: '[layout]', event: 'load_failed', error: String(e) }));
  }
}

/** Persist the current sizes after a drag. */
export function commitLayout(): void {
  if (!storage) return;
  void storage.set(STORAGE_KEY, serializeLayout(sizes)).catch((e: unknown) => {
    console.warn(JSON.stringify({ prefix: '[layout]', event: 'save_failed', error: String(e) }));
  });
}
