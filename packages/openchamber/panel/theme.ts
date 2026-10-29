/**
 * Host theme wiring.
 *
 * The panel is painted entirely from `--oc-*` variables, which only exist once
 * the host answers `ready` (the SDK's injected stylesheet defines its own
 * `--oc-sdk-*` helpers, not the tokens). Two consequences shape this module:
 *
 * 1. Every `ready` re-applies the theme, because the host may push a new
 *    context when the user switches theme or moves the frame to another
 *    surface.
 * 2. Until the first `ready` arrives the document stays hidden (see the
 *    `html[data-oc-theme]` gate in styles.css). If the host never answers, a
 *    fallback timer reveals the neutral palette so a broken host still shows a
 *    usable panel instead of a white void.
 */
import { applyHostReady } from '@openchamber/sdk/ui';
import type { HostReadyContext } from '@openchamber/sdk';

/** How long the panel waits for the first `ready` before using the fallback. */
export const FALLBACK_REVEAL_MS = 1500;

export interface HostThemeBinding {
  /** Apply a `ready` context: writes the tokens and reveals the document. */
  apply: (context: HostReadyContext) => void;
  /** Cancel the pending fallback timer. */
  dispose: () => void;
}

/**
 * Bind the host theme to the document root.
 * @param root Element that receives the tokens and the reveal flag
 * @param fallbackMs Delay before the fallback palette is used
 * @returns handle used from the `onReady` subscription
 */
export function installHostTheme(
  root: HTMLElement,
  fallbackMs: number = FALLBACK_REVEAL_MS,
): HostThemeBinding {
  let timer: ReturnType<typeof setTimeout> | null = setTimeout(() => {
    timer = null;
    // Only reveal if no theme has landed yet: a late `ready` then repaints the
    // fallback colours through the inline custom properties it writes.
    if (!root.dataset.ocTheme) {
      root.dataset.ocFallback = 'true';
    }
  }, fallbackMs);

  const clearTimer = (): void => {
    if (timer !== null) {
      clearTimeout(timer);
      timer = null;
    }
  };

  return {
    apply: (context) => {
      clearTimer();
      delete root.dataset.ocFallback;
      applyHostReady(context, root);
    },
    dispose: clearTimer,
  };
}
