import { describe, expect, it } from 'vitest';

import { escapeHtml, highlightLine } from '../syntax';

describe('syntax', () => {
  it('wraps every result so callers can inject it as raw HTML', () => {
    expect(highlightLine('')).toBe('<span></span>');
    expect(highlightLine('plain text').startsWith('<span>')).toBe(true);
  });

  it('marks keywords, strings, numbers and calls', () => {
    const html = highlightLine('const name = readConfig("app.json", 3);');

    expect(html).toContain('gm-tok--kw');
    expect(html).toContain('gm-tok--str');
    expect(html).toContain('gm-tok--num');
    // readConfig is followed by "(" so it is a call, not a type.
    expect(html).toContain('gm-tok--fn');
  });

  it('marks line and block comments, including shell style', () => {
    expect(highlightLine('x = 1 // note')).toContain('gm-tok--com');
    expect(highlightLine('/* fragment *')).toContain('gm-tok--com');
    expect(highlightLine('# shell comment')).toContain('gm-tok--com');
  });

  it('escapes markup instead of injecting it', () => {
    const html = highlightLine('<img src=x onerror="alert(1)">');
    expect(html).not.toContain('<img');
    // The angle bracket is escaped and, being punctuation, becomes an operator token.
    expect(html).toContain('&lt;');
    expect(html).toContain('&gt;');
    expect(escapeHtml(`a"b'c&d<e>`)).toBe('a&quot;b&#039;c&amp;d&lt;e&gt;');
  });

  it('leaves plain identifiers alone', () => {
    const html = highlightLine('commit message text');
    expect(html).toContain('commit message text');
    expect(html).not.toContain('gm-tok--kw');
  });

  it('treats a capitalised non-call identifier as a type', () => {
    const html = highlightLine('const ctx: HostReadyContext = value;');
    expect(html).toContain('gm-tok--type');
  });
});
