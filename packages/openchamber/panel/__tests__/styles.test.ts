import { readFileSync, readdirSync } from 'node:fs';
import { resolve } from 'node:path';

import { describe, expect, it } from 'vitest';

/**
 * Appearance contract for the panel.
 *
 * The panel takes every colour, font and radius from the host theme, so the
 * sources must not hardcode a palette, and every `gm-*` class the components
 * use must exist in styles.css. Both rules are cheap to break by hand and
 * expensive to notice in review.
 */
const PANEL_DIR = resolve(__dirname, '..');
const COMPONENT_DIR = resolve(PANEL_DIR, 'components');

/** Every panel source that renders DOM (tests and the stylesheet excluded). */
function sourceFiles(): string[] {
  const files = readdirSync(COMPONENT_DIR)
    .filter(name => name.endsWith('.ts') && !name.endsWith('.d.ts'))
    .map(name => resolve(COMPONENT_DIR, name));
  return [
    ...files,
    resolve(PANEL_DIR, 'main.ts'),
    resolve(PANEL_DIR, 'html.ts'),
    resolve(PANEL_DIR, 'syntax.ts'),
    resolve(PANEL_DIR, 'theme.ts'),
  ];
}

/** Remove comments so documentation examples never trip the checks. */
function stripComments(source: string): string {
  return source
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/(^|[^:])\/\/[^\n]*/g, '$1');
}

const CSS = readFileSync(resolve(PANEL_DIR, 'styles.css'), 'utf-8');

describe('panel appearance contract', () => {
  it('does not hardcode colours outside the fallback palette', () => {
    const offenders: string[] = [];
    for (const file of sourceFiles()) {
      const body = stripComments(readFileSync(file, 'utf-8'));
      // `&#039;` is an HTML entity, not a colour.
      for (const match of body.matchAll(/(?<!&)#[0-9a-fA-F]{3,8}\b/g)) {
        offenders.push(`${file.slice(PANEL_DIR.length + 1)}: ${match[0]}`);
      }
    }
    expect(offenders).toEqual([]);
  });

  it('defines every gm-* class the components use', () => {
    const missing = new Set<string>();
    for (const file of sourceFiles()) {
      const body = readFileSync(file, 'utf-8');
      const classValues = [
        // class="gm-a gm-b" (static values only: stop at interpolation or tag end)
        ...[...body.matchAll(/class="([^"$>]*)"/g)].map(m => m[1]),
        ...[...body.matchAll(/class='([^'$>]*)'/g)].map(m => m[1]),
        // classList.add('gm-a')
        ...[...body.matchAll(/classList\.add\('([^'$]+)'\)/g)].map(m => m[1]),
        // el.className = 'gm-a'
        ...[...body.matchAll(/className = ?['"]([^'"$]+)['"]/g)].map(m => m[1]),
      ];
      for (const value of classValues) {
        for (const token of value.split(/\s+/)) {
          if (!token.startsWith('gm-')) continue;
          // Only class selectors count; a rule may also be an attribute selector.
          if (!CSS.includes(`.${token}`)) missing.add(token);
        }
      }
    }
    expect([...missing]).toEqual([]);
  });

  it('keeps the stylesheet free of authored colours, using host tokens instead', () => {
    const body = stripComments(CSS);
    // The only literals allowed are the neutral fallback palette and shadows.
    const literals = [...body.matchAll(/#[0-9a-fA-F]{3,8}\b/g)].map(m => m[0]);
    const fallbackOnly = literals.every(literal => {
      const index = body.indexOf(literal);
      const before = body.slice(0, index);
      // Everything before the base section is the fallback palette.
      return before.includes('[data-oc-fallback]') && !before.includes('.gm-shell');
    });
    expect(fallbackOnly).toBe(true);
  });
});
