/**
 * Minimal line-oriented syntax highlighter for the diff and console panes.
 *
 * The host sends the eight syntax colours in `ready.theme.tokens`
 * (`--oc-syntax-keyword` … `--oc-syntax-operator`), so the panel only has to
 * mark tokens; colours come from styles.css. No dependency: the guest frame's
 * CSP allows no external script, and a diff line rarely needs more than
 * keywords, strings, comments, numbers and calls.
 */

/** Token classes emitted as `gm-tok--<kind>`; each maps to a `--oc-syntax-*`. */
export type TokenKind = 'kw' | 'str' | 'com' | 'num' | 'fn' | 'type' | 'var' | 'op';

/** Keywords per family the panel's log and diffs actually contain. */
const KEYWORDS = new Set([
  // JS/TS
  'const', 'let', 'var', 'function', 'return', 'if', 'else', 'for', 'while', 'of', 'in',
  'import', 'from', 'export', 'default', 'class', 'extends', 'new', 'await', 'async',
  'try', 'catch', 'finally', 'throw', 'switch', 'case', 'break', 'continue', 'typeof',
  'instanceof', 'interface', 'type', 'enum', 'implements', 'public', 'private', 'readonly',
  'static', 'this', 'null', 'undefined', 'true', 'false', 'void', 'yield', 'super',
  // Python / shell / git-adjacent
  'def', 'elif', 'None', 'True', 'False', 'and', 'or', 'not', 'with', 'as', 'lambda',
  'pass', 'raise', 'global', 'then', 'fi', 'do', 'done', 'echo', 'local',
]);

/** Capitalised identifiers treated as types when they are not calls. */
const TYPE_HINT = /^[A-Z][A-Za-z0-9_]*$/;

/**
 * Escape text for HTML.
 * @param text Raw text
 * @returns Escaped text
 */
export function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

const TOKEN = new RegExp([
  // line comment, block comment fragment, string, number, identifier, operator
  '(?<com>\\/\\/[^\\n]*|\\/\\*[^*]*\\*?\\/?|#[^\\n]*|--[^\\n]*)',
  '(?<str>"(?:[^"\\\\]|\\\\.)*"?|\'(?:[^\'\\\\]|\\\\.)*\'?|`(?:[^`\\\\]|\\\\.)*`?)',
  '(?<num>\\b\\d[\\w.]*\\b)',
  '(?<ident>[A-Za-z_$][\\w$]*)',
  '(?<op>[=+\\-*/<>!&|%^~?:;,.()\\[\\]{}]+)',
].join('|'), 'g');

/**
 * Highlight one line of code.
 * @param text Source line (no newline)
 * @returns HTML with `gm-tok--*` spans, always wrapped so callers can inject it
 */
export function highlightLine(text: string): string {
  if (!text) return '<span class="gm-line"></span>';

  let out = '';
  let last = 0;
  // A `#` only starts a comment in the sh/Python-ish languages; keeping the
  // rule here matches how the console prints shell output.
  TOKEN.lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = TOKEN.exec(text)) !== null) {
    if (match.index > last) {
      out += escapeHtml(text.slice(last, match.index));
    }
    const groups = match.groups ?? {};
    const value = match[0];

    if (groups.com) {
      out += `<span class="gm-tok gm-tok--com">${escapeHtml(value)}</span>`;
    } else if (groups.str) {
      out += `<span class="gm-tok gm-tok--str">${escapeHtml(value)}</span>`;
    } else if (groups.num) {
      out += `<span class="gm-tok gm-tok--num">${escapeHtml(value)}</span>`;
    } else if (groups.ident) {
      // Look ahead for "(" to tell a call from a plain identifier.
      const isCall = text[match.index + value.length] === '(';
      const kind: TokenKind | null = KEYWORDS.has(value)
        ? 'kw'
        : isCall
          ? 'fn'
          : TYPE_HINT.test(value)
            ? 'type'
            : null;
      out += kind
        ? `<span class="gm-tok gm-tok--${kind}">${escapeHtml(value)}</span>`
        : escapeHtml(value);
    } else {
      out += `<span class="gm-tok gm-tok--op">${escapeHtml(value)}</span>`;
    }
    last = match.index + value.length;
  }

  if (last < text.length) {
    out += escapeHtml(text.slice(last));
  }
  return `<span class="gm-line">${out}</span>`;
}
