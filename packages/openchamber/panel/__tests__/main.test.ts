/**
 * Smoke test for the shell render.
 *
 * It mounts the real panel against a fake host and service and checks that the
 * three-column layout and every divider are built. This catches ordering bugs
 * in `render()` that component tests cannot see, such as a splitter reading a
 * pane declared later in the function.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const { hostMock, serviceMock, directoryListeners, readyListeners } = vi.hoisted(() => {
  const directoryListeners: Array<(directory: string | null) => void> = [];
  const readyListeners: Array<(context: unknown) => void> = [];
  return {
    directoryListeners,
    readyListeners,
    hostMock: {
      onReady: (listener: (context: unknown) => void) => {
        readyListeners.push(listener);
        return () => {};
      },
      onDirectory: (listener: (directory: string | null) => void) => {
        directoryListeners.push(listener);
        return () => {};
      },
      toast: async () => {},
      storage: {
        get: async () => undefined,
        set: async () => {},
      },
    },
    serviceMock: {
      isGitRepository: async () => true,
      getBranches: async () => [],
      getFavorites: async () => [],
      getLog: async () => [],
      getStatus: async () => ({
        currentBranch: 'main',
        files: [],
        hasStagedChanges: false,
        hasUnstagedChanges: false,
        hasUntrackedFiles: false,
      }),
      debugLog: async () => {},
    },
  };
});

vi.mock('../host', () => ({ host: hostMock }));
vi.mock('../service', () => ({ createServiceClient: () => serviceMock }));

beforeEach(() => {
  vi.resetModules();
  directoryListeners.length = 0;
  readyListeners.length = 0;
  document.body.innerHTML = '<div id="root"></div>';
});

afterEach(() => {
  document.body.innerHTML = '';
  document.documentElement.removeAttribute('style');
  document.documentElement.removeAttribute('data-oc-fallback');
  document.documentElement.removeAttribute('data-oc-theme');
});

describe('panel shell', () => {
  it('renders the three columns and all dividers for a git repository', async () => {
    await import('../main');

    expect(directoryListeners).toHaveLength(1);
    directoryListeners[0]('/repo');

    await vi.waitFor(() => {
      expect(document.querySelector('.gm-shell')).toBeTruthy();
    });

    expect(document.querySelector('.gm-branches')).toBeTruthy();
    expect(document.querySelector('.gm-main')).toBeTruthy();
    expect(document.querySelector('.gm-side')).toBeTruthy();
    expect(document.querySelector('.gm-file-list')).toBeTruthy();
    expect(document.querySelector('.gm-diff__preview')).toBeTruthy();

    const splitters = [...document.querySelectorAll('.gm-splitter')];
    expect(splitters).toHaveLength(5);
    expect(splitters.filter(el => el.getAttribute('aria-orientation') === 'vertical')).toHaveLength(2);
    expect(splitters.filter(el => el.getAttribute('aria-orientation') === 'horizontal')).toHaveLength(3);
    // The bottom divider stays hidden until Console/Worktrees is selected.
    expect((splitters.at(-1) as HTMLElement).hidden).toBe(true);
  });
});
