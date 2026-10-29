import { describe, expect, it, vi } from 'vitest';
import type { HostReadyContext, HostThemeTokens } from '@openchamber/sdk';

import { FALLBACK_REVEAL_MS, installHostTheme } from '../theme';

/** Minimal dark token bag: only the values the assertions read are distinctive. */
const TOKENS: HostThemeTokens = {
  background: '#101114',
  elevated: '#17181b',
  foreground: '#e7e8ea',
  muted: '#9aa1aa',
  subtle: '#23252a',
  border: '#2f3238',
  hover: 'rgba(255,255,255,0.06)',
  selection: 'rgba(59,130,246,0.2)',
  focus: '#3b82f6',
  primary: '#3b82f6',
  mutedSurface: '#1c1d21',
  elevatedForeground: '#f1f2f4',
  active: 'rgba(255,255,255,0.1)',
  selectionForeground: '#eaf1ff',
  primaryForeground: '#ffffff',
  primaryText: '#93c5fd',
  successText: '#4ade80',
  warningText: '#fbbf24',
  errorText: '#f87171',
  infoText: '#38bdf8',
  success: '#4ade80',
  warning: '#fbbf24',
  error: '#f87171',
  info: '#38bdf8',
  font: 'system-ui',
  mono: 'monospace',
  radius: '8px',
};

function readyContext(overrides: Partial<HostReadyContext> = {}): HostReadyContext {
  return {
    theme: { mode: 'dark', tokens: TOKENS },
    locale: 'en',
    directory: '/repo',
    session: null,
    surface: 'panel',
    connection: { connected: true, account: 'tester' },
    settings: {},
    item: null,
    ...overrides,
  };
}

describe('installHostTheme', () => {
  it('stays hidden until a ready context is applied', () => {
    const root = document.createElement('div');
    const binding = installHostTheme(root, FALLBACK_REVEAL_MS);

    // styles.css reveals the document on [data-oc-theme] or [data-oc-fallback];
    // neither flag exists before the host answers.
    expect(root.dataset.ocTheme).toBeUndefined();
    expect(root.dataset.ocFallback).toBeUndefined();

    binding.apply(readyContext());
    expect(root.dataset.ocTheme).toBe('dark');
    binding.dispose();
  });

  it('writes the host tokens, colour scheme and surface onto the root', () => {
    const root = document.createElement('div');
    const binding = installHostTheme(root);

    binding.apply(readyContext());

    expect(root.dataset.ocTheme).toBe('dark');
    expect(root.dataset.ocSurface).toBe('panel');
    expect(root.style.colorScheme).toBe('dark');
    expect(root.style.getPropertyValue('--oc-bg')).toBe(TOKENS.background);
    expect(root.style.getPropertyValue('--oc-primary')).toBe(TOKENS.primary);
    expect(root.style.getPropertyValue('--oc-font')).toBe(TOKENS.font);
    binding.dispose();
  });

  it('falls back to the neutral palette when the host never answers', () => {
    vi.useFakeTimers();
    try {
      const root = document.createElement('div');
      const binding = installHostTheme(root, 1000);

      expect(root.dataset.ocFallback).toBeUndefined();
      vi.advanceTimersByTime(999);
      expect(root.dataset.ocFallback).toBeUndefined();

      vi.advanceTimersByTime(1);
      expect(root.dataset.ocFallback).toBe('true');
      binding.dispose();
    } finally {
      vi.useRealTimers();
    }
  });

  it('cancels the fallback once a ready context arrives', () => {
    vi.useFakeTimers();
    try {
      const root = document.createElement('div');
      const binding = installHostTheme(root, 1000);

      binding.apply(readyContext());
      vi.advanceTimersByTime(5000);

      expect(root.dataset.ocFallback).toBeUndefined();
      expect(root.dataset.ocTheme).toBe('dark');
      binding.dispose();
    } finally {
      vi.useRealTimers();
    }
  });

  it('repaints the fallback with the real tokens when ready lands late', () => {
    vi.useFakeTimers();
    try {
      const root = document.createElement('div');
      const binding = installHostTheme(root, 1000);
      vi.advanceTimersByTime(1000);
      expect(root.dataset.ocFallback).toBe('true');

      binding.apply(readyContext({ theme: { mode: 'light', tokens: TOKENS }, surface: 'status' }));

      expect(root.dataset.ocFallback).toBeUndefined();
      expect(root.dataset.ocTheme).toBe('light');
      expect(root.dataset.ocSurface).toBe('status');
      binding.dispose();
    } finally {
      vi.useRealTimers();
    }
  });

  it('reapplies a new context when the host pushes another ready', () => {
    const root = document.createElement('div');
    const binding = installHostTheme(root);

    binding.apply(readyContext());
    binding.apply(readyContext({ theme: { mode: 'light', tokens: TOKENS } }));

    expect(root.dataset.ocTheme).toBe('light');
    expect(root.style.colorScheme).toBe('light');
    binding.dispose();
  });
});
