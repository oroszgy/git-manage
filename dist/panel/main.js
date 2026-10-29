"use strict";
(() => {
  // ../../node_modules/.pnpm/@openchamber+sdk@2.5.1/node_modules/@openchamber/sdk/dist/ui/theme.js
  var TOKEN_VARS = [
    ["--oc-bg", "background"],
    ["--oc-elevated", "elevated"],
    ["--oc-fg", "foreground"],
    ["--oc-muted", "muted"],
    ["--oc-subtle", "subtle"],
    ["--oc-border", "border"],
    ["--oc-hover", "hover"],
    ["--oc-selection", "selection"],
    ["--oc-focus", "focus"],
    ["--oc-primary", "primary"],
    ["--oc-muted-surface", "mutedSurface"],
    ["--oc-elevated-fg", "elevatedForeground"],
    ["--oc-active", "active"],
    ["--oc-selection-fg", "selectionForeground"],
    ["--oc-primary-fg", "primaryForeground"],
    ["--oc-primary-text", "primaryText"],
    ["--oc-success-text", "successText"],
    ["--oc-warning-text", "warningText"],
    ["--oc-error-text", "errorText"],
    ["--oc-info-text", "infoText"],
    ["--oc-success", "success"],
    ["--oc-warning", "warning"],
    ["--oc-error", "error"],
    ["--oc-info", "info"],
    ["--oc-font", "font"],
    ["--oc-mono", "mono"],
    ["--oc-radius", "radius"],
    ["--surface-background", "background"],
    ["--surface-elevated", "elevated"],
    ["--surface-foreground", "foreground"],
    ["--surface-muted-foreground", "muted"],
    ["--surface-subtle", "subtle"],
    ["--interactive-border", "border"],
    ["--interactive-hover", "hover"],
    ["--interactive-selection", "selection"],
    ["--interactive-focus-ring", "focus"],
    ["--primary", "primary"],
    ["--surface-muted", "mutedSurface"],
    ["--surface-elevated-foreground", "elevatedForeground"],
    ["--interactive-active", "active"],
    ["--interactive-selection-foreground", "selectionForeground"],
    ["--primary-foreground", "primaryForeground"],
    ["--primary-text", "primaryText"],
    ["--success-text", "successText"],
    ["--warning-text", "warningText"],
    ["--error-text", "errorText"],
    ["--info-text", "infoText"],
    ["--status-success", "success"],
    ["--status-warning", "warning"],
    ["--status-error", "error"],
    ["--status-info", "info"],
    ["--font-sans", "font"],
    ["--font-mono", "mono"],
    ["--radius", "radius"]
  ];
  var SYNTAX_TOKEN_VARS = [
    ["--oc-syntax-keyword", "--syntax-keyword", "syntaxKeyword"],
    ["--oc-syntax-string", "--syntax-string", "syntaxString"],
    ["--oc-syntax-number", "--syntax-number", "syntaxNumber"],
    ["--oc-syntax-function", "--syntax-function", "syntaxFunction"],
    ["--oc-syntax-type", "--syntax-type", "syntaxType"],
    ["--oc-syntax-comment", "--syntax-comment", "syntaxComment"],
    ["--oc-syntax-variable", "--syntax-variable", "syntaxVariable"],
    ["--oc-syntax-operator", "--syntax-operator", "syntaxOperator"]
  ];
  var applyHostTheme = (theme, root2) => {
    root2.style.colorScheme = theme.mode;
    for (const [name, key] of TOKEN_VARS) {
      root2.style.setProperty(name, theme.tokens[key]);
    }
    for (const [alias, hostName, key] of SYNTAX_TOKEN_VARS) {
      const value = theme.tokens[key] ?? "";
      root2.style.setProperty(alias, value);
      root2.style.setProperty(hostName, value);
    }
    root2.style.setProperty("font-family", theme.tokens.font);
    root2.style.setProperty("font-size", "0.875rem");
    root2.style.setProperty("line-height", "1.45");
    root2.style.setProperty("color", theme.tokens.foreground);
  };
  var applyHostReady = (ctx, root2) => {
    applyHostTheme(ctx.theme, root2);
    if (root2.dataset) {
      root2.dataset.ocSurface = ctx.surface;
      root2.dataset.ocTheme = ctx.theme.mode;
    }
  };

  // ../../node_modules/.pnpm/@openchamber+sdk@2.5.1/node_modules/@openchamber/sdk/dist/scrollbar-style.js
  var GUEST_SCROLLING_ATTRIBUTE = "data-oc-scrolling";
  var GUEST_SCROLLBAR_CSS = `
:root {
  /* Quiet at rest like the app's own thumbs; hover gives a clear grab target. */
  --oc-scrollbar-thumb: color-mix(in srgb, var(--oc-muted, currentColor) 18%, transparent);
  --oc-scrollbar-thumb-hover: color-mix(in srgb, var(--oc-muted, currentColor) 36%, transparent);
  scrollbar-gutter: stable;
}
* {
  scrollbar-width: thin;
  scrollbar-color: transparent transparent;
}
:hover, [${GUEST_SCROLLING_ATTRIBUTE}] {
  scrollbar-color: var(--oc-scrollbar-thumb) transparent;
}
/* Chromium's standard scrollbar properties otherwise override its pseudo-elements. */
@supports selector(::-webkit-scrollbar) {
  *, :hover, [${GUEST_SCROLLING_ATTRIBUTE}] { scrollbar-width: auto; scrollbar-color: auto; }
  ::-webkit-scrollbar { width: 6px; height: 6px; background: transparent; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb {
    background: transparent;
    border-radius: 999px;
    min-width: 24px;
    min-height: 24px;
  }
  :hover::-webkit-scrollbar-thumb, [${GUEST_SCROLLING_ATTRIBUTE}]::-webkit-scrollbar-thumb { background: var(--oc-scrollbar-thumb); }
  ::-webkit-scrollbar-thumb:hover { background: var(--oc-scrollbar-thumb-hover); }
  ::-webkit-scrollbar-corner { background: transparent; }
  ::-webkit-scrollbar-button { display: none; width: 0; height: 0; }
}
@media (forced-colors: active) {
  *, :hover, [${GUEST_SCROLLING_ATTRIBUTE}] { scrollbar-color: auto; }
  ::-webkit-scrollbar-thumb, ::-webkit-scrollbar-thumb:hover { background: CanvasText; }
}
`;
  function installGuestScrollbarActivity(doc) {
    const root2 = doc.documentElement;
    if (root2.hasAttribute("data-oc-scrollbar-activity"))
      return;
    root2.setAttribute("data-oc-scrollbar-activity", "");
    const timers = /* @__PURE__ */ new WeakMap();
    doc.addEventListener("scroll", (event) => {
      const target = event.target === doc ? root2 : event.target;
      if (!(target instanceof Element))
        return;
      if (!target.hasAttribute("data-oc-scrolling"))
        target.setAttribute("data-oc-scrolling", "");
      const pending = timers.get(target);
      if (pending !== void 0)
        clearTimeout(pending);
      timers.set(target, setTimeout(() => {
        timers.delete(target);
        target.removeAttribute("data-oc-scrolling");
      }, 1e3));
    }, { capture: true, passive: true });
  }
  var GUEST_SCROLLBAR_SCRIPT = `(${installGuestScrollbarActivity.toString()})(document);`;

  // ../../node_modules/.pnpm/@openchamber+sdk@2.5.1/node_modules/@openchamber/sdk/dist/ui/style.js
  var OC_ALIAS = {
    "surface-background": "bg",
    "surface-elevated": "elevated",
    "surface-elevated-foreground": "elevated-fg",
    "surface-foreground": "fg",
    "surface-muted-foreground": "muted",
    "surface-muted": "muted-surface",
    "surface-subtle": "subtle",
    "interactive-border": "border",
    "interactive-hover": "hover",
    "interactive-active": "active",
    "interactive-selection": "selection",
    "interactive-selection-foreground": "selection-fg",
    "interactive-focus-ring": "focus",
    "primary": "primary",
    "primary-foreground": "primary-fg",
    "primary-text": "primary-text",
    "success-text": "success-text",
    "warning-text": "warning-text",
    "error-text": "error-text",
    "info-text": "info-text",
    "status-success": "success",
    "status-warning": "warning",
    "status-error": "error",
    "status-info": "info",
    "font-sans": "font",
    "font-mono": "mono",
    "radius": "radius"
  };
  var v = (name, fallback) => `var(--${name}, var(--oc-${OC_ALIAS[name]}, ${fallback}))`;
  var bg = v("surface-background", "transparent");
  var elevated = v("surface-elevated", "transparent");
  var elevatedFg = v("surface-elevated-foreground", "inherit");
  var fg = v("surface-foreground", "inherit");
  var muted = v("surface-muted-foreground", "gray");
  var secondary = v("surface-muted", "transparent");
  var border = v("interactive-border", "currentColor");
  var hover = v("interactive-hover", "transparent");
  var active = v("interactive-active", "transparent");
  var selection = v("interactive-selection", "transparent");
  var selectionFg = v("interactive-selection-foreground", "inherit");
  var primary = v("primary", "currentColor");
  var primaryText = v("primary-text", "inherit");
  var errorText = v("error-text", "inherit");
  var font = v("font-sans", "inherit");
  var mono = v("font-mono", "monospace");
  var radius = v("radius", "9px");
  var controlRadius = `calc(${radius} - 2px)`;
  var smallRadius = `calc(${radius} - 4px)`;
  var mix = (color, pct, base = "transparent") => `color-mix(in srgb, ${color} ${pct}%, ${base})`;
  var focusFill = `background-image: linear-gradient(${hover}, ${hover});`;
  var field = (edge) => `box-shadow: inset 0 0 0 1px ${edge}, var(--oc-sdk-field-lift);`;
  var raised = "border-color: var(--oc-sdk-edge); box-shadow: var(--oc-sdk-raised-lift);";
  var litButton = "box-shadow: var(--oc-sdk-lit);";
  var darkLift = `inset 0 1px 0 0 ${mix(fg, 1.5)}, 0 1px 1px 0 rgb(0 0 0 / 0.28), 0 2px 3px -2px rgb(0 0 0 / 0.2)`;
  var THEME_VARS = `
:root {
  --oc-sdk-edge: ${mix(fg, 10)};
  --oc-sdk-field-bg: ${elevated};
  --oc-sdk-raised-bg: ${bg};
  --oc-sdk-field-lift: inset 0 1px 2px 0 rgb(0 0 0 / 0.04);
  --oc-sdk-raised-lift: 0 1px 2px 0 rgb(0 0 0 / 0.06);
  --oc-sdk-lit: inset 0 1px 0 0 rgb(255 255 255 / 0.45), 0 1px 2px 0 rgb(0 0 0 / 0.08);
  --oc-sdk-float-edge: rgb(0 0 0 / 0.1);
  --oc-sdk-float: inset 0 1px 0 0 rgb(255 255 255 / 0.8), inset 0 0 0 1px rgb(0 0 0 / 0.04), 0 1px 2px -0.5px rgb(0 0 0 / 0.08), 0 4px 8px -2px rgb(0 0 0 / 0.08), 0 12px 20px -4px rgb(0 0 0 / 0.08);
}
:root[data-oc-theme="dark"] {
  --oc-sdk-edge: ${mix(fg, 6)};
  --oc-sdk-field-bg: ${mix(bg, 50, elevated)};
  --oc-sdk-raised-bg: ${elevated};
  --oc-sdk-field-lift: ${darkLift};
  --oc-sdk-raised-lift: ${darkLift};
  --oc-sdk-lit: inset 0 1px 0 0 ${mix(fg, 1.5)}, 0 1px 1px 0 rgb(0 0 0 / 0.28), 0 2px 3px -2px rgb(0 0 0 / 0.2);
  --oc-sdk-float-edge: rgb(0 0 0 / 0.36);
  --oc-sdk-float: inset 0 1px 0 0 rgb(255 255 255 / 0.06), inset 0 0 0 1px rgb(255 255 255 / 0.08), 0 1px 1px -0.5px rgb(0 0 0 / 0.22), 0 3px 3px -1.5px rgb(0 0 0 / 0.2), 0 6px 6px -3px rgb(0 0 0 / 0.16);
}`;
  var tone = (name) => {
    const color = v(`status-${name}`, "currentColor");
    return `
.oc-sdk[data-tone="${name}"], .oc-sdk [data-tone="${name}"] { --oc-sdk-tone: ${color}; --oc-sdk-tone-text: ${v(`${name}-text`, "inherit")}; }`;
  };
  var UI_SIZE_CSS = `
.oc-sdk { box-sizing: border-box; font-size: 0.875rem; line-height: 1.45; }
.oc-sdk *, .oc-sdk *::before, .oc-sdk *::after { box-sizing: border-box; }
/* :where() keeps the reset at zero specificity so every primitive class below overrides it. */
:where(.oc-sdk) :where(button, input, textarea), :where(button.oc-sdk, input.oc-sdk, textarea.oc-sdk) { font: inherit; color: inherit; margin: 0; }
:where(.oc-sdk) :where(button), :where(button.oc-sdk) { cursor: pointer; background: none; border: 0; padding: 0; }
.oc-sdk button:disabled, button.oc-sdk:disabled, .oc-sdk[aria-disabled="true"], .oc-sdk [aria-disabled="true"] { opacity: .5; pointer-events: none; }

.oc-sdk-btn { display: inline-flex; align-items: center; justify-content: center; gap: 8px; height: 32px; padding: 0 12px; border: 1px solid transparent; font-size: 0.875rem; font-weight: 500; line-height: 1; white-space: nowrap; }
.oc-sdk-btn[data-size="sm"] { gap: 6px; height: 28px; padding: 0 10px; font-size: 0.8125rem; }
.oc-sdk-btn[data-size="xs"] { gap: 4px; height: 24px; padding: 0 8px; font-size: 0.75rem; }
.oc-sdk-btn[data-loading="true"] { opacity: .5; pointer-events: none; }
.oc-sdk-btn > .oc-sdk-spinner-ring { width: 14px; height: 14px; }

.oc-sdk-field { display: flex; flex-direction: column; gap: 4px; min-width: 0; }
.oc-sdk-field-label { font-size: 0.8125rem; font-weight: 500; }
.oc-sdk-field-note { font-size: 0.75rem; }
.oc-sdk-input { display: block; width: 100%; min-width: 0; height: 32px; padding: 0 10px; border: 0; font-size: 0.875rem; line-height: 1.45; appearance: none; }
textarea.oc-sdk-input { height: auto; padding: 8px 10px; resize: vertical; }

.oc-sdk-search { position: relative; min-width: 0; }
.oc-sdk-search .oc-sdk-input { padding-left: 34px; padding-right: 34px; }
.oc-sdk-search-icon { position: absolute; left: 11px; top: 50%; transform: translateY(-50%); pointer-events: none; }
.oc-sdk-search-clear { position: absolute; right: 6px; top: 50%; transform: translateY(-50%); display: none; align-items: center; justify-content: center; width: 24px; height: 24px; }
.oc-sdk-search[data-active="true"] .oc-sdk-search-clear { display: inline-flex; }

.oc-sdk-select { position: relative; display: flex; flex-direction: column; gap: 4px; min-width: 0; }
.oc-sdk-trigger { display: inline-flex; align-items: center; gap: 6px; align-self: flex-start; width: auto; max-width: 100%; min-width: 0; height: 28px; padding: 0 10px; border: 1px solid transparent; font-size: 0.8125rem; text-align: left; }
.oc-sdk-trigger-value { flex: 1 1 auto; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.oc-sdk-trigger-chevron { flex: 0 0 auto; }
.oc-sdk-popup { position: fixed; z-index: 50; display: flex; flex-direction: column; gap: 2px; min-width: 160px; max-width: calc(100vw - 16px); max-height: min(320px, calc(100vh - 16px)); overflow: auto; padding: 4px; border: 1px solid transparent; }
.oc-sdk-popup-search { flex: 0 0 auto; padding: 2px 2px 4px; }
.oc-sdk-popup-search .oc-sdk-input { height: 28px; font-size: 0.8125rem; }
.oc-sdk-option { display: flex; align-items: center; gap: 8px; width: 100%; padding: 6px 8px; font-size: 0.8125rem; text-align: left; }
.oc-sdk-option-label { flex: 1 1 auto; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.oc-sdk-option-hint { flex: 0 0 auto; font-size: 0.75rem; }
.oc-sdk-option-check { flex: 0 0 auto; display: inline-flex; width: 14px; visibility: hidden; }
.oc-sdk-option[aria-selected="true"] > .oc-sdk-option-check { visibility: visible; }
.oc-sdk-popup-empty { padding: 8px; font-size: 0.8125rem; }

.oc-sdk-check { display: inline-flex; align-items: flex-start; gap: 8px; width: 100%; text-align: left; }
.oc-sdk-check-box { flex: 0 0 auto; display: inline-flex; align-items: center; justify-content: center; width: 14px; height: 14px; margin-top: 3px; border: 1px solid transparent; }
.oc-sdk-check-box > svg { display: none; }
.oc-sdk-check[aria-checked="true"] .oc-sdk-check-box > svg { display: block; }
.oc-sdk-check-thumb { flex: 0 0 auto; position: relative; width: 36px; height: 20px; }
.oc-sdk-check-thumb::after { content: ""; position: absolute; top: 2px; left: 2px; width: 16px; height: 16px; }
.oc-sdk-check-text { display: flex; flex-direction: column; min-width: 0; }
.oc-sdk-check-label { font-size: 0.875rem; }
.oc-sdk-check-desc { font-size: 0.75rem; }

.oc-sdk-tabs { display: inline-flex; gap: 2px; padding: 2px; max-width: 100%; overflow: auto; }
.oc-sdk-tab { display: inline-flex; align-items: center; gap: 6px; height: 28px; padding: 0 10px; border: 1px solid transparent; font-size: 0.8125rem; font-weight: 500; white-space: nowrap; }
.oc-sdk-tab-count { font-size: 0.75rem; font-variant-numeric: tabular-nums; }

.oc-sdk-badge { display: inline-flex; align-items: center; padding: 1px 6px; font-size: 11px; font-weight: 500; line-height: 16px; white-space: nowrap; }

.oc-sdk-list { display: flex; flex-direction: column; gap: 1px; min-width: 0; }
.oc-sdk-row { display: flex; align-items: center; gap: 8px; width: 100%; padding: 6px 8px; text-align: left; }
.oc-sdk-row-lead { flex: 0 0 auto; width: 64px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-size: 0.75rem; }
.oc-sdk-row-main { flex: 1 1 auto; min-width: 0; display: flex; flex-direction: column; }
.oc-sdk-row-title { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.oc-sdk-row-sub { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-size: 0.75rem; }
.oc-sdk-row-meta { flex: 0 0 auto; font-size: 0.75rem; font-variant-numeric: tabular-nums; }
.oc-sdk-list-empty { padding: 16px 8px; text-align: center; font-size: 0.8125rem; }

.oc-sdk-empty { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 4px; padding: 40px 16px; text-align: center; }
.oc-sdk-empty-title { margin: 0; font-size: 0.8125rem; font-weight: 600; }
.oc-sdk-empty-body { margin: 0; max-width: 32rem; font-size: 0.8125rem; }
.oc-sdk-empty-action { margin-top: 12px; }

@keyframes oc-sdk-spin { to { transform: rotate(360deg); } }
.oc-sdk-spinner { display: inline-flex; align-items: center; gap: 8px; font-size: 0.8125rem; }
.oc-sdk-spinner-ring { width: 16px; height: 16px; border: 2px solid transparent; animation: oc-sdk-spin .8s linear infinite; }
.oc-sdk-spinner[data-size="sm"] .oc-sdk-spinner-ring { width: 12px; height: 12px; }

.oc-sdk-banner { display: flex; align-items: flex-start; gap: 12px; padding: 8px 12px; border: 1px solid transparent; }
.oc-sdk-banner-text { flex: 1 1 auto; min-width: 0; display: flex; flex-direction: column; gap: 2px; }
.oc-sdk-banner-title { font-size: 0.8125rem; font-weight: 500; }
.oc-sdk-banner-body { font-size: 0.8125rem; }
.oc-sdk-banner-action { flex: 0 0 auto; }

.oc-sdk-separator { display: flex; align-items: center; gap: 8px; width: 100%; margin: 8px 0; font-size: 0.75rem; }
.oc-sdk-separator::before, .oc-sdk-separator::after { content: ""; flex: 1 1 auto; height: 1px; }
.oc-sdk-separator[data-labeled="false"]::after { display: none; }
.oc-sdk-popup > .oc-sdk-separator { margin: 4px 0; }

.oc-sdk-progress { display: flex; flex-direction: column; gap: 4px; min-width: 0; }
.oc-sdk-progress-label { display: flex; justify-content: space-between; font-size: 0.75rem; font-variant-numeric: tabular-nums; }
.oc-sdk-progress-track { height: 6px; overflow: hidden; }
.oc-sdk-progress-fill { height: 100%; transform-origin: left; transition: transform 200ms ease-out; }

.oc-sdk-menu { position: relative; display: inline-flex; }

.oc-sdk-text { white-space: pre-wrap; overflow-wrap: anywhere; }
.oc-sdk-text img { display: block; max-width: 100%; margin: 8px 0; }
`;
  var GUEST_UI_LOOK_CSS = `${THEME_VARS}
.oc-sdk { color: ${fg}; font-family: ${font}; }
.oc-sdk :focus-visible, .oc-sdk:focus-visible { outline: none; }
.oc-sdk :where(button, a[href], [role="button"], [role="tab"], [role="option"]):focus-visible, button.oc-sdk:focus-visible { ${focusFill} }
.oc-sdk-mono { font-family: ${mono}; }
.oc-sdk-muted { color: ${muted}; }
${tone("success")}${tone("warning")}${tone("error")}${tone("info")}
.oc-sdk[data-tone="primary"], .oc-sdk [data-tone="primary"] { --oc-sdk-tone: ${primary}; --oc-sdk-tone-text: ${primaryText}; }

.oc-sdk-btn { border-radius: ${controlRadius}; transition: background 150ms ease-out, color 150ms ease-out; }
.oc-sdk-btn[data-size="xs"] { border-radius: ${smallRadius}; }
.oc-sdk-btn[data-variant="default"] { color: ${primaryText}; background: ${mix(primary, 10, bg)}; border-color: ${mix(primary, 12)}; ${litButton} }
.oc-sdk-btn[data-variant="default"]:hover { background: ${mix(primary, 16, bg)}; }
.oc-sdk-btn[data-variant="default"]:active { background: ${mix(primary, 22, bg)}; box-shadow: none; }
.oc-sdk-btn[data-variant="secondary"] { background: ${secondary}; color: var(--oc-fg); }
.oc-sdk-btn[data-variant="secondary"]:hover { background-image: linear-gradient(${hover}, ${hover}); }
.oc-sdk-btn[data-variant="secondary"]:active { background-image: linear-gradient(${active}, ${active}); }
.oc-sdk-btn[data-variant="outline"] { background: var(--oc-sdk-raised-bg); color: ${elevatedFg}; ${raised} }
.oc-sdk-btn[data-variant="outline"]:hover { background-image: linear-gradient(${hover}, ${hover}); }
.oc-sdk-btn[data-variant="outline"]:active { background-image: linear-gradient(${active}, ${active}); box-shadow: none; }
.oc-sdk-btn[data-variant="ghost"] { background: transparent; }
.oc-sdk-btn[data-variant="ghost"]:hover { background: ${hover}; }
.oc-sdk-btn[data-variant="ghost"]:active { background: ${active}; }
.oc-sdk-btn[data-variant="destructive"] { --oc-sdk-tone: ${v("status-error", "red")}; color: ${errorText}; background: ${mix("var(--oc-sdk-tone)", 7, bg)}; border-color: ${mix("var(--oc-sdk-tone)", 12)}; ${litButton} }
.oc-sdk-btn[data-variant="destructive"]:hover { background: ${mix("var(--oc-sdk-tone)", 9, bg)}; }
.oc-sdk-btn[data-variant="destructive"]:active { background: ${mix("var(--oc-sdk-tone)", 11, bg)}; box-shadow: none; }

.oc-sdk-field-note { color: ${muted}; }
.oc-sdk-field[data-invalid="true"] .oc-sdk-field-note { color: ${errorText}; }
.oc-sdk-input { border-radius: ${controlRadius}; background: var(--oc-sdk-field-bg); color: ${elevatedFg}; ${field("var(--oc-sdk-edge)")} transition: background 150ms ease-out; }
.oc-sdk-input::placeholder { color: ${muted}; }
.oc-sdk-input:hover:not(:focus) { background-image: linear-gradient(${hover}, ${hover}); }
.oc-sdk-input:focus, .oc-sdk-input:focus-visible { ${field(mix(fg, 26))} }
.oc-sdk-field[data-invalid="true"] .oc-sdk-input, .oc-sdk-field[data-invalid="true"] .oc-sdk-input:focus { ${field(v("status-error", "red"))} }
.oc-sdk-input[data-mono="true"] { font-family: ${mono}; }

.oc-sdk-search-icon { color: ${muted}; }
.oc-sdk-search[data-active="true"] .oc-sdk-search-icon { color: ${primary}; }
.oc-sdk-search-clear { border-radius: ${smallRadius}; color: ${muted}; }
.oc-sdk-search-clear:hover { background: ${hover}; color: ${fg}; }

.oc-sdk-trigger { border-radius: ${controlRadius}; background: var(--oc-sdk-raised-bg); color: ${elevatedFg}; ${raised} transition: background 150ms ease-out; }
.oc-sdk-trigger:hover { background-image: linear-gradient(${hover}, ${hover}); }
.oc-sdk-trigger[aria-expanded="true"] { background-image: linear-gradient(${active}, ${active}); }
.oc-sdk-trigger-value[data-empty="true"] { color: ${muted}; }
.oc-sdk-trigger-chevron { color: ${muted}; }
/* The app's dropdown light: lit top, hairline rings and a layered shadow. Its outer ring is the border, over the page like the app's. */
.oc-sdk-popup { --surface-foreground: ${elevatedFg}; border-color: var(--oc-sdk-float-edge); border-radius: 12px; background: ${elevated}; background-clip: padding-box; color: ${elevatedFg}; box-shadow: var(--oc-sdk-float); }
.oc-sdk-option { border-radius: 8px; }
.oc-sdk-option[data-active="true"] { background: ${hover}; }
/* A selected option shows a check mark in the text colour, like the app's own pickers. Options without the mark come
   from bundles built before it existed and keep the selection fill as their only sign of the choice. */
.oc-sdk-option[aria-selected="true"]:not([data-mark]) { background: ${selection}; color: ${selectionFg}; }
.oc-sdk-option-check { color: ${fg}; }
.oc-sdk-option[data-destructive="true"] { color: ${errorText}; }
.oc-sdk-option[data-destructive="true"][data-active="true"] { background: ${mix(v("status-error", "red"), 10)}; }
.oc-sdk-option-hint { color: ${muted}; }
.oc-sdk-popup-empty { color: ${muted}; }

/* Checked stays neutral: the mark carries the state, and the primary colour stays with primary actions. */
.oc-sdk-check-box { border-color: ${border}; border-radius: 4px; color: ${fg}; transition: border-color 150ms ease-out; }
.oc-sdk-check[aria-checked="true"] .oc-sdk-check-box { border-color: ${mix(fg, 60, border)}; }
.oc-sdk-check-thumb { border-radius: 9999px; background: ${border}; transition: background 150ms ease-out; }
.oc-sdk-check-thumb::after { border-radius: 9999px; background: ${bg}; transition: transform 150ms ease-out; }
.oc-sdk-check[aria-checked="true"] .oc-sdk-check-thumb { background: ${primary}; }
.oc-sdk-check[aria-checked="true"] .oc-sdk-check-thumb::after { transform: translateX(16px); }
.oc-sdk-check:focus-visible { box-shadow: none; }
.oc-sdk-check:focus-visible .oc-sdk-check-box, .oc-sdk-check:focus-visible .oc-sdk-check-thumb { ${focusFill} }
.oc-sdk-check-desc { color: ${muted}; }

.oc-sdk-tabs { border-radius: 10px; }
.oc-sdk-tabs[data-track="true"] { background: ${mix(fg, 4)}; box-shadow: inset 0 1px 2px 0 rgb(0 0 0 / 0.16); }
.oc-sdk-tab { border-radius: 8px; color: ${muted}; transition: color 150ms ease-out, background 150ms ease-out; }
.oc-sdk-tab:hover { color: ${fg}; }
.oc-sdk-tab[aria-selected="true"] { color: ${selectionFg}; background: ${selection}; border-color: ${border}; }
.oc-sdk-tabs[data-track="true"] .oc-sdk-tab[aria-selected="true"] { color: ${elevatedFg}; background: var(--oc-sdk-raised-bg); ${raised} }
.oc-sdk-tab-count { color: ${muted}; }

.oc-sdk-badge { border-radius: 9999px; background: ${hover}; color: ${muted}; }
.oc-sdk-badge[data-tone] { color: var(--oc-sdk-tone-text, var(--oc-sdk-tone)); background: ${mix("var(--oc-sdk-tone)", 15)}; }

.oc-sdk-row { border-radius: 6px; transition: background 120ms ease-out; }
.oc-sdk-row:hover, .oc-sdk-row[data-active="true"] { background: ${hover}; }
.oc-sdk-row[aria-selected="true"] { background: ${selection}; color: ${selectionFg}; }
.oc-sdk-row-lead { font-family: ${mono}; color: ${muted}; }
.oc-sdk-row-sub { color: ${muted}; }
.oc-sdk-row-meta { color: ${muted}; }
.oc-sdk-row[aria-selected="true"] .oc-sdk-row-lead, .oc-sdk-row[aria-selected="true"] .oc-sdk-row-sub, .oc-sdk-row[aria-selected="true"] .oc-sdk-row-meta { color: inherit; opacity: .75; }
.oc-sdk-list-empty { color: ${muted}; }

.oc-sdk-empty-body { color: ${muted}; }

.oc-sdk-spinner { color: ${muted}; }
.oc-sdk-spinner-ring { border-color: ${border}; border-top-color: ${primary}; border-radius: 9999px; }

/* Set apart by its tint alone, like the app's banners. */
.oc-sdk-banner { border-color: transparent; border-radius: 8px; background: ${mix("var(--oc-sdk-tone)", 10)}; }
.oc-sdk-banner-title { color: var(--oc-sdk-tone-text, var(--oc-sdk-tone)); }
.oc-sdk-banner-body { color: ${muted}; }

.oc-sdk-separator { color: ${muted}; }
.oc-sdk-separator::before, .oc-sdk-separator::after { background: ${mix(border, 40)}; }

.oc-sdk-progress-label { color: ${muted}; }
.oc-sdk-progress-track { border-radius: 9999px; background: ${border}; }
.oc-sdk-progress-fill { border-radius: 9999px; background: var(--oc-sdk-tone, ${primary}); }

.oc-sdk-text a { color: ${primaryText}; text-decoration: underline; text-underline-offset: 2px; }
.oc-sdk-text img { border-radius: 8px; border: 1px solid ${mix(border, 60)}; }
`;
  var UI_CSS = `
${GUEST_SCROLLBAR_CSS}
${UI_SIZE_CSS}
${GUEST_UI_LOOK_CSS}`;

  // ../../node_modules/.pnpm/@openchamber+sdk@2.5.1/node_modules/@openchamber/sdk/dist/ui/dom.js
  var STYLE_ID = "oc-sdk-ui-style";
  var ensureStyle = (css) => {
    const existing = document.getElementById(STYLE_ID);
    if (existing instanceof HTMLStyleElement) {
      if (existing.textContent !== css) {
        existing.textContent = css;
      }
      return;
    }
    installGuestScrollbarActivity(document);
    const style = document.createElement("style");
    style.id = STYLE_ID;
    style.textContent = css;
    document.head.appendChild(style);
  };
  var el = (tag, className) => {
    const node = document.createElement(tag);
    if (className) {
      node.className = className;
    }
    return node;
  };
  var button = (className) => {
    const node = el("button", className);
    node.type = "button";
    return node;
  };
  var setText = (node, text) => {
    const next = text ?? "";
    if (node.textContent !== next) {
      node.textContent = next;
    }
  };
  var setAttr = (node, name, value) => {
    if (value === void 0 || value === null || value === "") {
      node.removeAttribute(name);
    } else if (node.getAttribute(name) !== value) {
      node.setAttribute(name, value);
    }
  };

  // ../../node_modules/.pnpm/@openchamber+sdk@2.5.1/node_modules/@openchamber/sdk/dist/ui/button.js
  var ring = () => {
    const spinner = document.createElement("span");
    spinner.className = "oc-sdk-spinner-ring";
    spinner.setAttribute("aria-hidden", "true");
    return spinner;
  };
  var mountButton = (root2, initial) => {
    ensureStyle(UI_CSS);
    let props = initial;
    const node = button("oc-sdk oc-sdk-btn");
    const spinner = ring();
    const label = document.createElement("span");
    node.append(label);
    root2.append(node);
    const paint = () => {
      node.dataset.variant = props.variant ?? "default";
      node.dataset.size = props.size ?? "default";
      node.disabled = Boolean(props.disabled) || Boolean(props.loading);
      node.dataset.loading = props.loading ? "true" : "false";
      node.setAttribute("aria-busy", props.loading ? "true" : "false");
      if (props.loading && spinner.parentNode !== node) {
        node.prepend(spinner);
      } else if (!props.loading && spinner.parentNode === node) {
        spinner.remove();
      }
      setText(label, props.label);
    };
    const onClick = () => {
      if (props.disabled || props.loading) {
        return;
      }
      props.onClick();
    };
    node.addEventListener("click", onClick);
    paint();
    return {
      update: (next) => {
        props = { ...props, ...next };
        paint();
      },
      dispose: () => {
        node.removeEventListener("click", onClick);
        node.remove();
      }
    };
  };

  // ../../node_modules/.pnpm/@openchamber+sdk@2.5.1/node_modules/@openchamber/sdk/dist/ui/icons.js
  var SVG_NS = "http://www.w3.org/2000/svg";
  var ICON_PATH = {
    search: "M18.031 16.617l4.283 4.282-1.415 1.415-4.282-4.283A8.96 8.96 0 0 1 11 20c-4.968 0-9-4.032-9-9s4.032-9 9-9 9 4.032 9 9a8.96 8.96 0 0 1-1.969 5.617zm-2.006-.742A6.977 6.977 0 0 0 18 11c0-3.868-3.133-7-7-7-3.868 0-7 3.132-7 7 0 3.867 3.132 7 7 7a6.977 6.977 0 0 0 4.875-1.975l.15-.15z",
    chevron: "M12 13.172l4.95-4.95 1.414 1.414L12 16 5.636 9.636 7.05 8.222z",
    check: "M10 15.172l9.192-9.193 1.415 1.414L10 18l-6.364-6.364 1.414-1.414z",
    close: "M12 10.586l4.95-4.95 1.414 1.414-4.95 4.95 4.95 4.95-1.414 1.414-4.95-4.95-4.95 4.95-1.414-1.414 4.95-4.95-4.95-4.95L7.05 5.636z"
  };
  var icon = (name, size, className) => {
    const node = document.createElementNS(SVG_NS, "svg");
    node.setAttribute("viewBox", "0 0 24 24");
    node.setAttribute("width", String(size));
    node.setAttribute("height", String(size));
    node.setAttribute("aria-hidden", "true");
    node.setAttribute("fill", "currentColor");
    if (className) {
      node.setAttribute("class", className);
    }
    const path = document.createElementNS(SVG_NS, "path");
    path.setAttribute("d", ICON_PATH[name]);
    node.append(path);
    return node;
  };

  // ../../node_modules/.pnpm/@openchamber+sdk@2.5.1/node_modules/@openchamber/sdk/dist/ui/search.js
  var mountSearchField = (root2, initial) => {
    ensureStyle(UI_CSS);
    let props = initial;
    const wrap = el("div", "oc-sdk oc-sdk-search");
    const input = el("input", "oc-sdk-input");
    input.type = "text";
    input.spellcheck = false;
    input.autocomplete = "off";
    input.setAttribute("role", "searchbox");
    const clear = button("oc-sdk-search-clear");
    clear.append(icon("close", 14));
    clear.tabIndex = -1;
    wrap.append(icon("search", 16, "oc-sdk-search-icon"), input, clear);
    root2.append(wrap);
    const paint = () => {
      const placeholder = props.placeholder ?? "Search";
      setAttr(input, "placeholder", placeholder);
      input.setAttribute("aria-label", props.label ?? placeholder);
      clear.setAttribute("aria-label", "Clear search");
      if (input.value !== props.value) {
        input.value = props.value;
      }
      wrap.dataset.active = props.value.trim() === "" ? "false" : "true";
    };
    const clearValue = () => {
      if (props.value !== "") {
        props.onChange("");
      }
      input.focus();
    };
    const onInput = () => {
      props.onChange(input.value);
    };
    const onKeyDown = (event) => {
      if (event.key === "Escape" && input.value !== "") {
        event.preventDefault();
        clearValue();
      }
    };
    input.addEventListener("input", onInput);
    input.addEventListener("keydown", onKeyDown);
    clear.addEventListener("click", clearValue);
    paint();
    if (props.autofocus) {
      input.focus();
    }
    return {
      update: (next) => {
        props = { ...props, ...next };
        paint();
      },
      dispose: () => {
        input.removeEventListener("input", onInput);
        input.removeEventListener("keydown", onKeyDown);
        clear.removeEventListener("click", clearValue);
        wrap.remove();
      }
    };
  };

  // ../../node_modules/.pnpm/@openchamber+sdk@2.5.1/node_modules/@openchamber/sdk/dist/ui/empty.js
  var mountEmpty = (root2, initial) => {
    ensureStyle(UI_CSS);
    let props = initial;
    const shell = el("div", "oc-sdk oc-sdk-empty");
    const title = el("h2", "oc-sdk-empty-title");
    const body = el("p", "oc-sdk-empty-body");
    const slot = el("div", "oc-sdk-empty-action");
    shell.append(title, body, slot);
    root2.append(shell);
    let action = null;
    const paint = () => {
      setText(title, props.title);
      setText(body, props.body);
      body.hidden = !props.body;
      slot.hidden = !props.action;
      if (!props.action) {
        action?.dispose();
        action = null;
        return;
      }
      const next = { label: props.action.label, onClick: props.action.onClick };
      if (action) {
        action.update(next);
      } else {
        action = mountButton(slot, { ...next, variant: "outline", size: "sm" });
      }
    };
    paint();
    return {
      update: (next) => {
        props = { ...props, ...next };
        paint();
      },
      dispose: () => {
        action?.dispose();
        action = null;
        shell.remove();
      }
    };
  };

  // panel/html.ts
  function html(strings, ...values) {
    const parts = [];
    const domElements = [];
    for (let i = 0; i < strings.length; i++) {
      parts.push(strings[i]);
      if (i < values.length) {
        const value = values[i];
        if (value == null || value === false) {
        } else if (typeof value === "string") {
          if (value.startsWith("<")) {
            parts.push(value);
          } else {
            parts.push(escapeHTML(value));
          }
        } else if (typeof value === "number") {
          parts.push(String(value));
        } else if (typeof value === "boolean") {
          parts.push(value ? "true" : "");
        } else if (Array.isArray(value)) {
          const arrElements = [];
          for (const item of value) {
            if (item instanceof HTMLElement || item instanceof SVGElement) {
              arrElements.push(item);
              parts.push(`<!--m-${domElements.length}-${arrElements.length - 1}-->`);
            } else {
              parts.push(String(item ?? ""));
            }
          }
          if (arrElements.length > 0) {
            domElements.push(arrElements);
          }
        } else if (value instanceof HTMLElement || value instanceof SVGElement) {
          const idx = domElements.length;
          domElements.push([value]);
          parts.push(`<!--m-${idx}-0-->`);
        }
      }
    }
    const rawHTML = parts.join("");
    const container = document.createElement("div");
    container.style.display = "none";
    document.body.appendChild(container);
    try {
      container.innerHTML = rawHTML;
      const root2 = container.firstElementChild;
      if (!root2) {
        throw new Error("\u65E0\u6CD5\u89E3\u6790 HTML \u6A21\u677F");
      }
      const walker = document.createTreeWalker(root2, NodeFilter.SHOW_COMMENT, null);
      const comments = [];
      let node;
      while (node = walker.nextNode()) {
        comments.push(node);
      }
      for (const comment of comments) {
        const text = comment.textContent || "";
        const match = text.match(/^m-(\d+)-(\d+)$/);
        if (match) {
          const [, groupIdx, elemIdx] = match;
          const group = domElements[parseInt(groupIdx)];
          if (group) {
            const elem = group[parseInt(elemIdx)];
            if (elem) {
              comment.parentNode?.replaceChild(elem, comment);
            }
          }
        }
      }
      return root2;
    } finally {
      document.body.removeChild(container);
    }
  }
  function escapeHTML(str) {
    return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
  }

  // ../../node_modules/.pnpm/@openchamber+sdk@2.5.1/node_modules/@openchamber/sdk/dist/api-version.js
  var OPENCHAMBER_SDK_CHANNEL = "openchamber.sdk";
  var OPENCHAMBER_SDK_API_VERSION = 1;

  // ../../node_modules/.pnpm/@openchamber+sdk@2.5.1/node_modules/@openchamber/sdk/dist/workspace.js
  var GUEST_STORAGE_KEY_MAX = 128;
  var GUEST_STORAGE_VALUE_BYTES = 65536;

  // ../../node_modules/.pnpm/@openchamber+sdk@2.5.1/node_modules/@openchamber/sdk/dist/shells.js
  var GUEST_SHELL_ID_MAX = 128;
  var GUEST_SHELL_OUTPUT_TAIL_MAX = 65536;

  // ../../node_modules/.pnpm/@openchamber+sdk@2.5.1/node_modules/@openchamber/sdk/dist/status-controls.js
  var GUEST_STATUS_CONTROLS_MAX = 4;
  var GUEST_STATUS_CONTROL_ID = /^[a-z][a-z0-9-]{0,39}$/;
  var GUEST_STATUS_CONTROL_LABEL_MAX = 60;
  var GUEST_STATUS_CONTROL_OPTIONS_MAX = 16;
  var GUEST_STATUS_CONTROL_VALUE_MAX = 80;
  var isControlObject = (value) => Object(value) === value && !Array.isArray(value);
  var hasOnlyKeys = (value, keys) => Object.keys(value).every((key) => keys.includes(key));
  var isLabel = (value) => String(value) === value && value.length >= 1 && value.length <= GUEST_STATUS_CONTROL_LABEL_MAX;
  var isValue = (value) => String(value) === value && value.length >= 1 && value.length <= GUEST_STATUS_CONTROL_VALUE_MAX;
  var isGuestStatusControls = (controls) => {
    if (!Array.isArray(controls) || controls.length > GUEST_STATUS_CONTROLS_MAX)
      return false;
    const ids = /* @__PURE__ */ new Set();
    for (const control of controls) {
      if (!isControlObject(control) || !GUEST_STATUS_CONTROL_ID.test(control.id) || !isLabel(control.label))
        return false;
      if (control.disabled !== void 0 && control.disabled !== true && control.disabled !== false)
        return false;
      if (ids.has(control.id))
        return false;
      ids.add(control.id);
      if (control.kind === "button") {
        if (!hasOnlyKeys(control, ["kind", "id", "label", "disabled"]))
          return false;
        continue;
      }
      if (control.kind !== "select" || !hasOnlyKeys(control, ["kind", "id", "label", "value", "options", "disabled"]))
        return false;
      if (!isValue(control.value) || !Array.isArray(control.options) || control.options.length < 1 || control.options.length > GUEST_STATUS_CONTROL_OPTIONS_MAX)
        return false;
      const values = /* @__PURE__ */ new Set();
      for (const option of control.options) {
        if (!isControlObject(option) || !hasOnlyKeys(option, ["value", "label"]) || !isValue(option.value) || !isLabel(option.label) || values.has(option.value))
          return false;
        values.add(option.value);
      }
      if (!values.has(control.value))
        return false;
    }
    return true;
  };

  // ../../node_modules/.pnpm/@openchamber+sdk@2.5.1/node_modules/@openchamber/sdk/dist/file-editor.js
  var GUEST_FILE_EDITOR_CONTENT_MAX = 2e7;
  var GUEST_FILE_EDITOR_VERSION_MAX = 256;
  var fileEditorPayloadSize = (value) => "bytes" in value ? value.bytes.byteLength : value.content.length;
  var sameFileEditorDocument = (left, right) => {
    if (left.path !== right.path || left.readOnly !== right.readOnly)
      return false;
    if (left.encoding === "text" || right.encoding === "text") {
      return left.encoding === "text" && right.encoding === "text" && left.content === right.content;
    }
    if (left.bytes.byteLength !== right.bytes.byteLength)
      return false;
    for (let index = 0; index < left.bytes.byteLength; index += 1) {
      if (left.bytes[index] !== right.bytes[index])
        return false;
    }
    return true;
  };

  // ../../node_modules/.pnpm/@openchamber+sdk@2.5.1/node_modules/@openchamber/sdk/dist/popover.js
  var GUEST_POPOVER_ID = /^[A-Za-z0-9_-]{1,80}$/;
  var GUEST_POPOVER_COORDINATE_MAX = 1e5;
  var GUEST_POPOVER_WIDTH_MIN = 160;
  var GUEST_POPOVER_WIDTH_MAX = 640;
  var GUEST_POPOVER_HEIGHT_MIN = 48;
  var GUEST_POPOVER_HEIGHT_MAX = 480;
  var GUEST_POPOVER_DATA_MAX = 16e3;
  var GUEST_POPOVER_DATA_DEPTH_MAX = 32;
  var GUEST_POPOVER_SIDES = ["left", "right", "top", "bottom"];
  var hasBoundedJsonTree = (value, depth = 0, budget = { remaining: GUEST_POPOVER_DATA_MAX }) => {
    if (--budget.remaining < 0 || depth >= GUEST_POPOVER_DATA_DEPTH_MAX)
      return false;
    if (value === null)
      return true;
    const children = Array.isArray(value) ? value : Object(value) === value ? Object.values(value) : [];
    for (const item of children) {
      if (!hasBoundedJsonTree(item, depth + 1, budget))
        return false;
    }
    return true;
  };
  var isFiniteJson = (value) => {
    if (value === null || value === true || value === false)
      return true;
    if (Array.isArray(value))
      return Object.keys(value).every((key) => /^(0|[1-9]\d*)$/.test(key) && Number(key) < value.length) && value.every(isFiniteJson);
    if (Object(value) === value) {
      const prototype = Object.getPrototypeOf(value);
      return (prototype === null || prototype === Object.prototype) && Object.values(value).every(isFiniteJson);
    }
    return String(value) === value || Number.isFinite(value);
  };
  var isGuestPopoverRequest = (request) => {
    try {
      if (String(request.id) !== request.id || !GUEST_POPOVER_ID.test(request.id) || !Number.isFinite(request.anchor.x) || Math.abs(request.anchor.x) > GUEST_POPOVER_COORDINATE_MAX || !Number.isFinite(request.anchor.y) || Math.abs(request.anchor.y) > GUEST_POPOVER_COORDINATE_MAX || !Number.isFinite(request.anchor.width) || !Number.isFinite(request.anchor.height) || request.anchor.width <= 0 || request.anchor.height <= 0 || request.anchor.width > GUEST_POPOVER_COORDINATE_MAX || request.anchor.height > GUEST_POPOVER_COORDINATE_MAX || !Number.isInteger(request.width) || request.width < GUEST_POPOVER_WIDTH_MIN || request.width > GUEST_POPOVER_WIDTH_MAX || !Number.isInteger(request.height) || request.height < GUEST_POPOVER_HEIGHT_MIN || request.height > GUEST_POPOVER_HEIGHT_MAX || request.side !== void 0 && !GUEST_POPOVER_SIDES.includes(request.side) || request.focus !== void 0 && request.focus !== true && request.focus !== false || !hasBoundedJsonTree(request.data) || !isFiniteJson(request.data))
        return false;
      return JSON.stringify(request.data).length <= GUEST_POPOVER_DATA_MAX;
    } catch {
      return false;
    }
  };

  // ../../node_modules/.pnpm/@openchamber+sdk@2.5.1/node_modules/@openchamber/sdk/dist/contract.js
  var GUEST_FILE_STAT_KINDS = ["file", "directory", "other", "missing"];
  var isStartSessionResult = (value) => Boolean(value && "sessionId" in value);
  var isPromptResult = (value) => Boolean(value && "sent" in value && !("sessionId" in value));
  var GUEST_COMMIT_SHA = /^[0-9a-f]{7,64}$/i;
  var isGuestCommitSha = (value) => GUEST_COMMIT_SHA.test(value);
  var GUEST_TOAST_MAX = 500;
  var GUEST_CLIPBOARD_TEXT_MAX = 32e3;
  var GUEST_COMPOSE_TEXT_MAX = 16e3;
  var GUEST_ATTACH_ID_MAX = 128;
  var GUEST_ATTACH_TITLE_MAX = 200;
  var GUEST_ATTACH_URL_MAX = 2e3;
  var GUEST_ATTACH_TEXT_MAX = 16e3;
  var GUEST_ATTACH_AUTHOR_MAX = 80;
  var GUEST_ATTACH_BRANCH_MAX = 200;
  var GUEST_ATTACH_DATA_MAX = 16e3;
  var GUEST_REQUEST_PATH_MAX = 2e3;
  var GUEST_REQUEST_TIMEOUT_MS = 2e4;
  var GUEST_FILE_PATH_MAX = 1024;
  var GUEST_FILE_CONTENT_MAX = 2e6;
  var GUEST_GENERATE_PROMPT_MAX = 64e3;
  var GUEST_GENERATE_SYSTEM_MAX = 8e3;
  var GUEST_GENERATE_OUTPUT_TOKENS_MAX = 4e3;
  var GUEST_GENERATE_TIMEOUT_MS = 96e4;
  var GUEST_GENERATE_LATE_KEEP_MS = 60 * 6e4;
  var GUEST_BADGE_MAX = 999;
  var GUEST_FRAME_HEIGHT_MAX = 1e4;
  var GUEST_RESOLVE_ERROR_MAX = 500;
  var HOST_REQUEST_ERROR_CODES = [
    "HOST_UNAVAILABLE",
    "HOST_TIMEOUT",
    "HOST_REJECTED",
    "DISCONNECTED",
    "DISABLED",
    "BAD_PATH",
    "NO_INTEGRATION",
    "NO_SERVICE",
    "SERVICE_FAILED",
    "REQUEST_FAILED",
    "RESPONSE_TOO_LARGE",
    "NO_SESSION",
    "SESSION_BUSY",
    "NOT_GRANTED",
    "NO_DIRECTORY",
    "NOT_FOUND",
    "FILE_TOO_LARGE",
    "DENIED",
    "NO_MODEL",
    "MODEL_FAILED",
    "UNSUPPORTED"
  ];
  var SERVICE_STATUS_VALUES = ["stopped", "starting", "ready", "failed"];
  var hostRequestErrorCodeSet = new Set(HOST_REQUEST_ERROR_CODES);
  var isHostRequestErrorCode = (value) => hostRequestErrorCodeSet.has(value);
  var resolveHostRequestErrorCode = (value) => value && isHostRequestErrorCode(value) ? value : "HOST_REJECTED";
  var isJsonValue = (value) => {
    if (value === void 0)
      return false;
    if (value === null || value === true || value === false)
      return true;
    if (String(value) === value)
      return true;
    if (Number(value) === value)
      return Number.isFinite(value);
    if (Array.isArray(value))
      return value.every(isJsonValue);
    if (Object(value) === value)
      return Object.values(value).every(isJsonValue);
    return false;
  };
  var isAttachData = (value) => isJsonValue(value) && JSON.stringify(value).length <= GUEST_ATTACH_DATA_MAX;
  var clampBranch = (value) => value?.trim().slice(0, GUEST_ATTACH_BRANCH_MAX) ?? "";
  var clampAttachRequest = (request) => {
    const id = request.id.trim().slice(0, GUEST_ATTACH_ID_MAX);
    const title = request.title.trim().slice(0, GUEST_ATTACH_TITLE_MAX);
    const url = request.url.trim().slice(0, GUEST_ATTACH_URL_MAX);
    const text = request.text?.trim().slice(0, GUEST_ATTACH_TEXT_MAX);
    const author = request.author?.trim().slice(0, GUEST_ATTACH_AUTHOR_MAX);
    const kind = request.kind === "pull" ? "pull" : "issue";
    const next = {
      providerId: request.providerId.trim(),
      id,
      title: title || id,
      url,
      kind
    };
    if (text) {
      next.text = text;
    }
    if (author) {
      next.author = author;
    }
    if (kind === "pull") {
      const head = clampBranch(request.branches?.head);
      const base = clampBranch(request.branches?.base);
      if (head && base) {
        next.branches = { head, base };
      }
    }
    if (isAttachData(request.data)) {
      next.data = request.data;
    }
    return next;
  };
  var clampStartSessionRequest = (request) => {
    const next = clampAttachRequest(request);
    if (request.projectId)
      next.projectId = request.projectId;
    if (request.navigation)
      next.navigation = request.navigation;
    if (request.worktree) {
      next.worktree = request.worktree;
    }
    return next;
  };
  var clampPromptRequest = (request) => {
    const next = {
      text: request.text.trim().slice(0, GUEST_COMPOSE_TEXT_MAX)
    };
    if (request.send) {
      next.send = true;
    }
    return next;
  };
  var clampBadgeCount = (count) => {
    if (count === null || !Number.isFinite(count))
      return null;
    return Math.min(GUEST_BADGE_MAX, Math.max(0, Math.round(count)));
  };
  var clampFrameHeight = (height) => {
    if (!Number.isFinite(height))
      return 0;
    return Math.min(GUEST_FRAME_HEIGHT_MAX, Math.max(0, Math.ceil(height)));
  };
  var isGuestFilePath = (value) => value.length > 0 && value.length <= GUEST_FILE_PATH_MAX && !value.includes("\0") && !value.includes("\\");
  var isGuestRequestPath = (value) => {
    if (!value.startsWith("/") || value.includes("\0") || value.includes("\\") || value.includes("://")) {
      return false;
    }
    if (value.length > GUEST_REQUEST_PATH_MAX) {
      return false;
    }
    const segments = value.split("/");
    return !segments.some((segment) => segment === "." || segment === "..");
  };
  var serviceStatusSet = new Set(SERVICE_STATUS_VALUES);
  var isServiceStatusResult = (value) => Boolean(value && "status" in value && serviceStatusSet.has(String(value.status)) && !("body" in value));
  var isGuestRequestResult = (value) => Boolean(value && "status" in value && "body" in value && Number.isInteger(value.status));
  var isFileReadResult = (value) => Boolean(value && "content" in value && String(value.content) === value.content);
  var isFileWriteResult = (value) => Boolean(value && "written" in value && value.written === true);
  var isFileListResult = (value) => Boolean(value && "entries" in value && Array.isArray(value.entries));
  var fileStatKindSet = new Set(GUEST_FILE_STAT_KINDS);
  var isFileStatResult = (value) => Boolean(value && "kind" in value && "size" in value && fileStatKindSet.has(String(value.kind)) && Number.isFinite(value.size));
  var isGenerateResult = (value) => Boolean(value && "text" in value && String(value.text) === value.text && !("status" in value));
  var HOST_PUSH_TYPES = /* @__PURE__ */ new Set([
    "workspace",
    "shells",
    "ready",
    "directory",
    "session",
    "connection",
    "settings",
    "session-lifecycle",
    "item",
    "resolve",
    "action",
    "status-control-event",
    "popover-closed",
    "file-open",
    "file-snapshot",
    "file-saved",
    "generate-late"
  ]);
  var asWireRecord = (data) => Object(data) === data ? data : null;
  var isNonEmptyString = (value) => String(value) === value && value.length > 0;
  var readResultMessage = (wire) => {
    if (!isNonEmptyString(wire.id))
      return null;
    if (wire.ok === true) {
      const message = {
        channel: OPENCHAMBER_SDK_CHANNEL,
        v: OPENCHAMBER_SDK_API_VERSION,
        type: "result",
        id: wire.id,
        ok: true
      };
      if (Object(wire.payload) === wire.payload) {
        message.payload = wire.payload;
      }
      return message;
    }
    if (wire.ok === false && isNonEmptyString(wire.error)) {
      return {
        channel: OPENCHAMBER_SDK_CHANNEL,
        v: OPENCHAMBER_SDK_API_VERSION,
        type: "result",
        id: wire.id,
        ok: false,
        error: wire.error,
        code: resolveHostRequestErrorCode(isNonEmptyString(wire.code) ? wire.code : void 0)
      };
    }
    return null;
  };
  var readHostMessage = (data) => {
    const wire = asWireRecord(data);
    if (!wire || wire.channel !== OPENCHAMBER_SDK_CHANNEL || wire.v !== OPENCHAMBER_SDK_API_VERSION)
      return null;
    if (wire.type === "result")
      return readResultMessage(wire);
    if (!HOST_PUSH_TYPES.has(String(wire.type)) || Object(wire.payload) !== wire.payload)
      return null;
    return wire;
  };

  // ../../node_modules/.pnpm/@openchamber+sdk@2.5.1/node_modules/@openchamber/sdk/dist/host.js
  var isKeyEvent = (event) => "key" in event && "metaKey" in event && "ctrlKey" in event;
  var isSaveShortcut = (event) => (event.metaKey || event.ctrlKey) && !event.altKey && !event.shiftKey && event.key.toLowerCase() === "s";
  var HostRequestError = class extends Error {
    code;
    constructor(code, message) {
      super(message);
      this.name = "HostRequestError";
      this.code = code;
    }
  };
  var rejectBadPath = () => Promise.reject(new HostRequestError("BAD_PATH", 'Request path must start with "/" and stay on the declared origin.'));
  var rejectBadFilePath = () => Promise.reject(new HostRequestError("BAD_PATH", `File path must be 1 to ${GUEST_FILE_PATH_MAX} characters without NUL or backslash.`));
  var deviceStorageScope = (options) => {
    if (options === void 0)
      return void 0;
    if (Object(options) !== options || Array.isArray(options) || options.scope !== void 0 && options.scope !== "instance" && options.scope !== "device") {
      throw new HostRequestError("HOST_REJECTED", 'Storage scope must be "instance" or "device".');
    }
    return options.scope === "device" ? "device" : void 0;
  };
  var nextId = (n) => {
    n.value += 1;
    return `oc-${n.value}`;
  };
  var connectHost = (options = {}) => {
    const target = options.target ?? ("window" in globalThis ? window : null);
    if (!target) {
      throw new HostRequestError("HOST_UNAVAILABLE", "No window. connectHost runs in a browser frame.");
    }
    const acceptSource = options.acceptSource ?? ((source) => source === target.parent);
    const requestTimeoutMs = options.requestTimeoutMs ?? GUEST_REQUEST_TIMEOUT_MS;
    const readyListeners = /* @__PURE__ */ new Set();
    const directoryListeners = /* @__PURE__ */ new Set();
    const sessionListeners = /* @__PURE__ */ new Set();
    const lifecycleListeners = /* @__PURE__ */ new Set();
    const connectionListeners = /* @__PURE__ */ new Set();
    const settingsListeners = /* @__PURE__ */ new Set();
    const itemListeners = /* @__PURE__ */ new Set();
    const statusControlListeners = /* @__PURE__ */ new Set();
    const popoverClosedListeners = /* @__PURE__ */ new Set();
    const lateGenerateListeners = /* @__PURE__ */ new Set();
    const unclaimedLateGenerate = [];
    let resolveHandler = null;
    let actionHandler = null;
    const fileOpenListeners = /* @__PURE__ */ new Set();
    const fileSavedListeners = /* @__PURE__ */ new Set();
    let fileSnapshotHandler = null;
    let lastFile = null;
    let saveShortcutInstalled = false;
    const pending = /* @__PURE__ */ new Map();
    const workspaceListeners = /* @__PURE__ */ new Map();
    const shellsListeners = /* @__PURE__ */ new Map();
    let disposed = false;
    const ids = { value: 0 };
    let lastReady = null;
    let lastLifecycle = null;
    let popoverPointerActive = false;
    let popoverFocusActive = false;
    let popoverActivityReported = null;
    const lifecycleFromSession = (session) => {
      if (!session)
        return null;
      return {
        sessionId: session.id,
        phase: session.busy ? "started" : "completed"
      };
    };
    const post = (message) => {
      target.parent.postMessage(message, "*");
    };
    const listenForLateGenerate = () => {
      if (disposed || target.parent === target || lateGenerateListeners.size === 0 || lastReady?.features?.lateGenerateResults !== true)
        return;
      post({ channel: OPENCHAMBER_SDK_CHANNEL, v: OPENCHAMBER_SDK_API_VERSION, type: "generate-late-listen" });
    };
    const emit = (listeners, value) => {
      for (const listener of listeners) {
        try {
          listener(value);
        } catch (error) {
          console.error(error);
        }
      }
    };
    const onMessage = (event) => {
      if (!(event instanceof MessageEvent))
        return;
      if (!acceptSource(event.source))
        return;
      const message = readHostMessage(event.data);
      if (!message)
        return;
      if (message.type === "workspace") {
        const listener = workspaceListeners.get(message.payload.subscriptionId);
        if (listener)
          emit([listener], message.payload.snapshot);
        return;
      }
      if (message.type === "shells") {
        const listener = shellsListeners.get(message.payload.subscriptionId);
        if (listener)
          emit([listener], message.payload.snapshot);
        return;
      }
      if (message.type === "ready") {
        lastReady = message.payload;
        lastLifecycle = lifecycleFromSession(message.payload.session);
        emit(readyListeners, message.payload);
        emit(directoryListeners, message.payload.directory);
        emit(sessionListeners, message.payload.session);
        if (lastLifecycle) {
          emit(lifecycleListeners, lastLifecycle);
        }
        emit(connectionListeners, message.payload.connection);
        emit(settingsListeners, message.payload.settings);
        emit(itemListeners, message.payload.item);
        listenForLateGenerate();
        return;
      }
      if (message.type === "generate-late") {
        if (lateGenerateListeners.size === 0)
          unclaimedLateGenerate.push(message.payload);
        else
          emit(lateGenerateListeners, message.payload);
        return;
      }
      if (message.type === "directory") {
        if (lastReady) {
          lastReady = { ...lastReady, directory: message.payload.directory };
        }
        emit(directoryListeners, message.payload.directory);
        return;
      }
      if (message.type === "session") {
        if (lastReady) {
          lastReady = { ...lastReady, session: message.payload.session };
        }
        if (!message.payload.session) {
          lastLifecycle = null;
        } else if (lastLifecycle?.sessionId !== message.payload.session.id) {
          lastLifecycle = lifecycleFromSession(message.payload.session);
        }
        emit(sessionListeners, message.payload.session);
        return;
      }
      if (message.type === "session-lifecycle") {
        lastLifecycle = message.payload;
        emit(lifecycleListeners, message.payload);
        return;
      }
      if (message.type === "connection") {
        if (lastReady) {
          lastReady = { ...lastReady, connection: message.payload.connection };
        }
        emit(connectionListeners, message.payload.connection);
        return;
      }
      if (message.type === "settings") {
        if (lastReady) {
          lastReady = { ...lastReady, settings: message.payload.settings };
        }
        emit(settingsListeners, message.payload.settings);
        return;
      }
      if (message.type === "item") {
        if (lastReady) {
          lastReady = { ...lastReady, item: message.payload.item };
        }
        emit(itemListeners, message.payload.item);
        return;
      }
      if (message.type === "status-control-event") {
        emit(statusControlListeners, message.payload);
        return;
      }
      if (message.type === "popover-closed") {
        emit(popoverClosedListeners, message.payload);
        return;
      }
      if (message.type === "action") {
        const answer = (payload) => {
          if (!disposed)
            post({
              channel: OPENCHAMBER_SDK_CHANNEL,
              v: OPENCHAMBER_SDK_API_VERSION,
              type: "action-result",
              id: message.id,
              payload
            });
        };
        const handler = actionHandler;
        if (!handler) {
          answer({ ok: false, error: "This extension does not handle background actions." });
          return;
        }
        Promise.resolve().then(() => handler(message.payload)).then(() => answer({ ok: true }), (error) => {
          const text = (error instanceof Error ? error.message : String(error)).trim();
          answer({ ok: false, error: (text || "Action failed.").slice(0, GUEST_RESOLVE_ERROR_MAX) });
        });
        return;
      }
      if (message.type === "file-open") {
        const next = message.payload;
        if (lastFile && sameFileEditorDocument(lastFile, next))
          return;
        lastFile = next;
        emit(fileOpenListeners, message.payload);
        return;
      }
      if (message.type === "file-saved") {
        emit(fileSavedListeners, message.payload.version);
        return;
      }
      if (message.type === "file-snapshot") {
        const answer = (payload) => {
          if (!disposed)
            post({
              channel: OPENCHAMBER_SDK_CHANNEL,
              v: OPENCHAMBER_SDK_API_VERSION,
              type: "file-snapshot-result",
              id: message.id,
              payload
            });
        };
        const fail = (text) => answer({ error: (text.trim() || "Could not read the edited file.").slice(0, GUEST_RESOLVE_ERROR_MAX) });
        const handler = fileSnapshotHandler;
        if (!handler) {
          fail("This extension does not edit files.");
          return;
        }
        Promise.resolve().then(() => handler(message.payload.purpose)).then((snapshot) => {
          if (fileEditorPayloadSize(snapshot) > GUEST_FILE_EDITOR_CONTENT_MAX) {
            fail(`The file is over ${GUEST_FILE_EDITOR_CONTENT_MAX} ${"bytes" in snapshot ? "bytes" : "characters"}.`);
            return;
          }
          if (snapshot.version.length > GUEST_FILE_EDITOR_VERSION_MAX) {
            fail(`The snapshot version is over ${GUEST_FILE_EDITOR_VERSION_MAX} characters.`);
            return;
          }
          answer({ snapshot: "bytes" in snapshot ? { bytes: snapshot.bytes, version: snapshot.version } : { content: snapshot.content, version: snapshot.version } });
        }, (error) => fail(error instanceof Error ? error.message : String(error)));
        return;
      }
      if (message.type === "resolve") {
        const answer = (payload) => {
          post({
            channel: OPENCHAMBER_SDK_CHANNEL,
            v: OPENCHAMBER_SDK_API_VERSION,
            type: "resolve-result",
            id: message.id,
            payload
          });
        };
        const handler = resolveHandler;
        if (!handler) {
          answer({ error: "This extension does not resolve commands." });
          return;
        }
        Promise.resolve().then(() => handler(message.payload)).then((item) => answer({ item: item ? clampAttachRequest(item) : null }), (error) => {
          const text = (error instanceof Error ? error.message : String(error)).trim();
          answer({ error: (text || "Command failed.").slice(0, GUEST_RESOLVE_ERROR_MAX) });
        });
        return;
      }
      const waiter = pending.get(message.id);
      if (!waiter)
        return;
      clearTimeout(waiter.timer);
      pending.delete(message.id);
      if (message.ok) {
        waiter.resolve(message.payload);
        return;
      }
      waiter.reject(new HostRequestError(message.code, message.error));
    };
    target.addEventListener("message", onMessage);
    post({
      channel: OPENCHAMBER_SDK_CHANNEL,
      v: OPENCHAMBER_SDK_API_VERSION,
      type: "hello"
    });
    const send = (message, timeoutMs = requestTimeoutMs) => {
      if (disposed || target.parent === target) {
        return Promise.reject(new HostRequestError("HOST_UNAVAILABLE", "No host frame. This page is not in an iframe."));
      }
      return new Promise((resolve, reject) => {
        const timer = setTimeout(() => {
          pending.delete(message.id);
          reject(new HostRequestError("HOST_TIMEOUT", "Host did not answer in time."));
        }, timeoutMs);
        pending.set(message.id, { resolve, reject, timer });
        post(message);
      });
    };
    const request = (message) => send(message).then(() => void 0);
    const envelope = { channel: OPENCHAMBER_SDK_CHANNEL, v: OPENCHAMBER_SDK_API_VERSION };
    const notify = (message) => {
      if (!disposed && target.parent !== target)
        post(message);
    };
    const requestFileSave = () => notify({ ...envelope, type: "file-save" });
    const onSaveShortcut = (event) => {
      if (!isKeyEvent(event) || !isSaveShortcut(event))
        return;
      event.preventDefault();
      requestFileSave();
    };
    const onPopoverEscape = (event) => {
      if (!isKeyEvent(event) || event.key !== "Escape" || lastReady?.surface !== "popover" || !lastReady.popover)
        return;
      event.preventDefault();
      void closePopover(lastReady.popover.id, "escape").catch(() => void 0);
    };
    const reportPopoverActivity = () => {
      const popover = lastReady?.surface === "popover" ? lastReady.popover : void 0;
      if (!popover)
        return;
      const active2 = popoverPointerActive || popoverFocusActive;
      if (popoverActivityReported === active2)
        return;
      popoverActivityReported = active2;
      void setPopoverAnchorActive(popover.id, active2).catch(() => void 0);
    };
    const onPopoverPointerOver = () => {
      if (lastReady?.surface !== "popover" || popoverPointerActive)
        return;
      popoverPointerActive = true;
      reportPopoverActivity();
    };
    const onPopoverPointerOut = (event) => {
      if (lastReady?.surface !== "popover" || event.relatedTarget !== null || !popoverPointerActive)
        return;
      popoverPointerActive = false;
      reportPopoverActivity();
    };
    const onPopoverFocus = () => {
      if (lastReady?.surface !== "popover" || popoverFocusActive)
        return;
      popoverFocusActive = true;
      reportPopoverActivity();
    };
    const onPopoverBlur = () => {
      if (lastReady?.surface !== "popover" || !popoverFocusActive)
        return;
      popoverFocusActive = false;
      reportPopoverActivity();
    };
    const requireIdentity = (value, maximum = 1024) => {
      if (!value.trim() || value.length > maximum)
        throw new HostRequestError("HOST_REJECTED", `Identity must contain 1 to ${maximum} characters.`);
    };
    const readWorkspace = async (query) => {
      if (query.kind !== "projects")
        requireIdentity(query.projectId);
      const result = await send({ ...envelope, type: "workspace-read", id: nextId(ids), payload: query });
      if (!result || !("kind" in result) || !("state" in result) || result.kind !== query.kind) {
        throw new HostRequestError("HOST_REJECTED", "Host did not return workspace data.");
      }
      return result;
    };
    const subscribeWorkspace = async (query, listener) => {
      if (query.kind !== "projects")
        requireIdentity(query.projectId);
      const subscriptionId = nextId(ids);
      workspaceListeners.set(subscriptionId, listener);
      try {
        await request({ ...envelope, type: "workspace-subscribe", id: nextId(ids), payload: { subscriptionId, query } });
      } catch (error) {
        workspaceListeners.delete(subscriptionId);
        if (!disposed)
          post({ ...envelope, type: "workspace-unsubscribe", id: nextId(ids), payload: { subscriptionId } });
        throw error;
      }
      return () => {
        if (!workspaceListeners.delete(subscriptionId) || disposed)
          return;
        post({ ...envelope, type: "workspace-unsubscribe", id: nextId(ids), payload: { subscriptionId } });
      };
    };
    const subscribeShells = async (scope, listener) => {
      if (scope.kind === "session")
        requireIdentity(scope.sessionId);
      if (scope.kind === "project")
        requireIdentity(scope.projectId);
      const subscriptionId = nextId(ids);
      shellsListeners.set(subscriptionId, listener);
      try {
        await request({ ...envelope, type: "shells-subscribe", id: nextId(ids), payload: { subscriptionId, scope } });
      } catch (error) {
        shellsListeners.delete(subscriptionId);
        if (!disposed)
          post({ ...envelope, type: "shells-unsubscribe", id: nextId(ids), payload: { subscriptionId } });
        throw error;
      }
      return () => {
        if (!shellsListeners.delete(subscriptionId) || disposed)
          return;
        post({ ...envelope, type: "shells-unsubscribe", id: nextId(ids), payload: { subscriptionId } });
      };
    };
    const storage2 = async (payload) => {
      if ("key" in payload && (payload.key.length === 0 || payload.key.length > GUEST_STORAGE_KEY_MAX)) {
        throw new HostRequestError("HOST_REJECTED", "Storage key must contain 1 to 128 characters.");
      }
      if (payload.op === "set" && !isJsonValue(payload.value)) {
        throw new HostRequestError("HOST_REJECTED", "Storage values must be JSON.");
      }
      if (payload.op === "set" && new TextEncoder().encode(JSON.stringify(payload.value)).length > GUEST_STORAGE_VALUE_BYTES) {
        throw new HostRequestError("HOST_REJECTED", "Storage value exceeds 64 KiB.");
      }
      if (payload.scope === "device" && lastReady?.features?.deviceStorage !== true) {
        throw new HostRequestError("UNSUPPORTED", "This host does not support device storage.");
      }
      const result = await send({ ...envelope, type: "storage", id: nextId(ids), payload });
      if (!result || !("storage" in result) || result.op !== payload.op)
        throw new HostRequestError("HOST_REJECTED", "Host did not return storage data.");
      return result;
    };
    const closePopover = (id, reason) => lastReady?.features?.popovers !== true && !(lastReady?.surface === "popover" && lastReady.popover?.id === id) ? Promise.reject(new HostRequestError("UNSUPPORTED", "This host does not support popovers.")) : request({ ...envelope, type: "popover-close", id: nextId(ids), payload: reason ? { id, reason } : { id } });
    const setPopoverAnchorActive = (id, active2) => lastReady?.features?.popovers !== true && !(lastReady?.surface === "popover" && lastReady.popover?.id === id) ? Promise.reject(new HostRequestError("UNSUPPORTED", "This host does not support popovers.")) : request({ ...envelope, type: "popover-anchor", id: nextId(ids), payload: { id, active: active2 } });
    target.addEventListener("keydown", onPopoverEscape, true);
    target.addEventListener("pointerover", onPopoverPointerOver);
    target.addEventListener("pointermove", onPopoverPointerOver);
    target.addEventListener("pointerout", onPopoverPointerOut);
    target.addEventListener("focus", onPopoverFocus);
    target.addEventListener("blur", onPopoverBlur);
    return {
      onAction: (handler) => {
        actionHandler = handler;
        return () => {
          if (actionHandler === handler)
            actionHandler = null;
        };
      },
      listProjects: async () => {
        const result = await readWorkspace({ kind: "projects" });
        if (result.kind !== "projects")
          throw new HostRequestError("HOST_REJECTED", "Expected projects.");
        return result;
      },
      listWorktrees: async (projectId) => {
        const result = await readWorkspace({ kind: "worktrees", projectId });
        if (result.kind !== "worktrees")
          throw new HostRequestError("HOST_REJECTED", "Expected worktrees.");
        return result;
      },
      listSessions: async (projectId) => {
        const result = await readWorkspace({ kind: "sessions", projectId });
        if (result.kind !== "sessions")
          throw new HostRequestError("HOST_REJECTED", "Expected sessions.");
        return result;
      },
      onProjects: (listener) => subscribeWorkspace({ kind: "projects" }, (snapshot) => {
        if (snapshot.kind === "projects")
          listener(snapshot);
      }),
      onWorktrees: (projectId, listener) => subscribeWorkspace({ kind: "worktrees", projectId }, (snapshot) => {
        if (snapshot.kind === "worktrees")
          listener(snapshot);
      }),
      onSessions: (projectId, listener) => subscribeWorkspace({ kind: "sessions", projectId }, (snapshot) => {
        if (snapshot.kind === "sessions")
          listener(snapshot);
      }),
      onRunningShells: (scope, listener) => subscribeShells(scope, listener),
      readShellOutput: async (shellId, options2) => {
        requireIdentity(shellId, GUEST_SHELL_ID_MAX);
        const cursor = options2?.cursor;
        if (cursor !== void 0 && (!Number.isInteger(cursor) || cursor < 0)) {
          throw new HostRequestError("HOST_REJECTED", "Shell output cursor must be a non-negative integer.");
        }
        const tailBytes = options2?.tailBytes;
        if (tailBytes !== void 0 && (!Number.isInteger(tailBytes) || tailBytes < 1 || tailBytes > GUEST_SHELL_OUTPUT_TAIL_MAX)) {
          throw new HostRequestError("HOST_REJECTED", `Shell output tailBytes must be an integer between 1 and ${GUEST_SHELL_OUTPUT_TAIL_MAX}.`);
        }
        const result = await send({ ...envelope, type: "shell-output", id: nextId(ids), payload: { shellId, cursor, tailBytes } });
        const output = result;
        if (!output || typeof output.output !== "string" || !Number.isFinite(output.cursor)) {
          throw new HostRequestError("HOST_REJECTED", "Host did not return shell output.");
        }
        return output;
      },
      stopShell: async (shellId) => {
        requireIdentity(shellId, GUEST_SHELL_ID_MAX);
        const result = await send({ ...envelope, type: "shell-stop", id: nextId(ids), payload: { shellId } });
        if (result?.stopped !== true)
          throw new HostRequestError("HOST_REJECTED", "Host did not stop the shell.");
        return { stopped: true };
      },
      openSession: async (sessionId) => {
        requireIdentity(sessionId);
        await request({ ...envelope, type: "open-session", id: nextId(ids), payload: { sessionId } });
      },
      storage: {
        get: async (key, options2) => {
          const scope = deviceStorageScope(options2);
          const payload = { op: "get", key };
          if (scope)
            payload.scope = scope;
          const result = await storage2(payload);
          return result.op === "get" && result.found ? result.value : void 0;
        },
        set: async (key, value, options2) => {
          const scope = deviceStorageScope(options2);
          const payload = { op: "set", key, value };
          if (scope)
            payload.scope = scope;
          await storage2(payload);
        },
        delete: async (key, options2) => {
          const scope = deviceStorageScope(options2);
          const payload = { op: "delete", key };
          if (scope)
            payload.scope = scope;
          await storage2(payload);
        },
        keys: async (options2) => {
          const scope = deviceStorageScope(options2);
          const payload = { op: "keys" };
          if (scope)
            payload.scope = scope;
          const result = await storage2(payload);
          if (result.op !== "keys")
            throw new HostRequestError("HOST_REJECTED", "Expected storage keys.");
          return result.keys;
        }
      },
      onReady: (listener) => {
        readyListeners.add(listener);
        if (lastReady)
          listener(lastReady);
        return () => {
          readyListeners.delete(listener);
        };
      },
      onDirectory: (listener) => {
        directoryListeners.add(listener);
        if (lastReady)
          listener(lastReady.directory);
        return () => {
          directoryListeners.delete(listener);
        };
      },
      onSession: (listener) => {
        sessionListeners.add(listener);
        if (lastReady)
          listener(lastReady.session);
        return () => {
          sessionListeners.delete(listener);
        };
      },
      onSessionLifecycle: (listener) => {
        lifecycleListeners.add(listener);
        if (lastLifecycle)
          listener(lastLifecycle);
        return () => {
          lifecycleListeners.delete(listener);
        };
      },
      onConnection: (listener) => {
        connectionListeners.add(listener);
        if (lastReady)
          listener(lastReady.connection);
        return () => {
          connectionListeners.delete(listener);
        };
      },
      onSettings: (listener) => {
        settingsListeners.add(listener);
        if (lastReady)
          listener(lastReady.settings);
        return () => {
          settingsListeners.delete(listener);
        };
      },
      onItem: (listener) => {
        itemListeners.add(listener);
        if (lastReady)
          listener(lastReady.item);
        return () => {
          itemListeners.delete(listener);
        };
      },
      onStatusControl: (listener) => {
        statusControlListeners.add(listener);
        return () => {
          statusControlListeners.delete(listener);
        };
      },
      onPopoverClosed: (listener) => {
        popoverClosedListeners.add(listener);
        return () => {
          popoverClosedListeners.delete(listener);
        };
      },
      setStatusControls: (controls) => {
        if (lastReady?.features?.statusControls !== true) {
          return Promise.reject(new HostRequestError("UNSUPPORTED", "This host does not support status controls."));
        }
        if (!isGuestStatusControls(controls)) {
          return Promise.reject(new HostRequestError("HOST_REJECTED", "Status controls must have unique bounded ids and valid selected options."));
        }
        return request({ ...envelope, type: "status-controls", id: nextId(ids), payload: { controls } });
      },
      openPopover: (payload) => {
        if (lastReady?.features?.popovers !== true) {
          return Promise.reject(new HostRequestError("UNSUPPORTED", "This host does not support popovers."));
        }
        if (!isGuestPopoverRequest(payload)) {
          return Promise.reject(new HostRequestError("HOST_REJECTED", "Popover requests need bounded geometry and JSON data."));
        }
        return request({ ...envelope, type: "popover-open", id: nextId(ids), payload });
      },
      closePopover,
      setPopoverAnchorActive,
      onResolve: (handler) => {
        resolveHandler = handler;
        return () => {
          if (resolveHandler === handler)
            resolveHandler = null;
        };
      },
      toast: (payload) => {
        const message = payload.message.trim();
        if (!message || message.length > GUEST_TOAST_MAX) {
          return Promise.reject(new HostRequestError("HOST_REJECTED", `Toast message must contain 1 to ${GUEST_TOAST_MAX} characters.`));
        }
        if (payload.copy && payload.copy !== true && (!payload.copy.text.length || payload.copy.text.length > GUEST_CLIPBOARD_TEXT_MAX)) {
          return Promise.reject(new HostRequestError("HOST_REJECTED", `Toast copy text must contain 1 to ${GUEST_CLIPBOARD_TEXT_MAX} characters.`));
        }
        return request({
          channel: OPENCHAMBER_SDK_CHANNEL,
          v: OPENCHAMBER_SDK_API_VERSION,
          type: "toast",
          id: nextId(ids),
          payload: { ...payload, message }
        });
      },
      openUrl: (url) => request({
        channel: OPENCHAMBER_SDK_CHANNEL,
        v: OPENCHAMBER_SDK_API_VERSION,
        type: "open-url",
        id: nextId(ids),
        payload: { url }
      }),
      openCommit: (sha) => isGuestCommitSha(sha) ? request({
        channel: OPENCHAMBER_SDK_CHANNEL,
        v: OPENCHAMBER_SDK_API_VERSION,
        type: "open-commit",
        id: nextId(ids),
        payload: { sha }
      }) : Promise.reject(new HostRequestError("HOST_REJECTED", "Commit id must be 7 to 64 hex characters.")),
      openSurface: (surfaceId) => request({
        channel: OPENCHAMBER_SDK_CHANNEL,
        v: OPENCHAMBER_SDK_API_VERSION,
        type: "open-surface",
        id: nextId(ids),
        payload: { surfaceId }
      }),
      writeClipboard: (text) => request({
        channel: OPENCHAMBER_SDK_CHANNEL,
        v: OPENCHAMBER_SDK_API_VERSION,
        type: "clipboard-write",
        id: nextId(ids),
        payload: { text }
      }),
      compose: (payload) => request({
        channel: OPENCHAMBER_SDK_CHANNEL,
        v: OPENCHAMBER_SDK_API_VERSION,
        type: "compose",
        id: nextId(ids),
        payload
      }),
      attach: (payload) => request({
        channel: OPENCHAMBER_SDK_CHANNEL,
        v: OPENCHAMBER_SDK_API_VERSION,
        type: "attach",
        id: nextId(ids),
        payload: clampAttachRequest(payload)
      }),
      startSession: async (payload) => {
        if (payload.projectId !== void 0)
          requireIdentity(payload.projectId);
        const worktree = payload.worktree;
        if (worktree && worktree !== true) {
          if (worktree.kind === "existing")
            requireIdentity(worktree.directory);
          else {
            if (worktree.name !== void 0)
              requireIdentity(worktree.name, 200);
            if (worktree.baseBranch !== void 0)
              requireIdentity(worktree.baseBranch, 200);
          }
        }
        const result = await send({
          channel: OPENCHAMBER_SDK_CHANNEL,
          v: OPENCHAMBER_SDK_API_VERSION,
          type: "start-session",
          id: nextId(ids),
          payload: clampStartSessionRequest(payload)
        }, options.requestTimeoutMs ?? 18e4);
        if (!isStartSessionResult(result)) {
          throw new HostRequestError("HOST_REJECTED", "Host did not return a session.");
        }
        return result;
      },
      prompt: (payload) => send({
        channel: OPENCHAMBER_SDK_CHANNEL,
        v: OPENCHAMBER_SDK_API_VERSION,
        type: "prompt",
        id: nextId(ids),
        payload: clampPromptRequest(payload)
      }).then((result) => {
        if (!isPromptResult(result)) {
          throw new HostRequestError("HOST_REJECTED", "Host did not return a prompt result.");
        }
        return result;
      }),
      sessionLink: (payload) => request({
        channel: OPENCHAMBER_SDK_CHANNEL,
        v: OPENCHAMBER_SDK_API_VERSION,
        type: "session-link",
        id: nextId(ids),
        payload: clampAttachRequest(payload)
      }),
      close: () => request({
        channel: OPENCHAMBER_SDK_CHANNEL,
        v: OPENCHAMBER_SDK_API_VERSION,
        type: "close",
        id: nextId(ids)
      }),
      oauthStart: () => request({
        channel: OPENCHAMBER_SDK_CHANNEL,
        v: OPENCHAMBER_SDK_API_VERSION,
        type: "oauth-start",
        id: nextId(ids)
      }),
      oauthDisconnect: () => request({
        channel: OPENCHAMBER_SDK_CHANNEL,
        v: OPENCHAMBER_SDK_API_VERSION,
        type: "oauth-disconnect",
        id: nextId(ids)
      }),
      request: (payload) => (isGuestRequestPath(payload.path) ? send({
        channel: OPENCHAMBER_SDK_CHANNEL,
        v: OPENCHAMBER_SDK_API_VERSION,
        type: "request",
        id: nextId(ids),
        payload
      }) : rejectBadPath()).then((result) => {
        if (!isGuestRequestResult(result)) {
          throw new HostRequestError("HOST_REJECTED", "Host request result was empty.");
        }
        return result;
      }),
      serviceRequest: (payload) => (isGuestRequestPath(payload.path) ? send({
        channel: OPENCHAMBER_SDK_CHANNEL,
        v: OPENCHAMBER_SDK_API_VERSION,
        type: "service-request",
        id: nextId(ids),
        payload
      }) : rejectBadPath()).then((result) => {
        if (!isGuestRequestResult(result)) {
          throw new HostRequestError("HOST_REJECTED", "Host service request result was empty.");
        }
        return result;
      }),
      serviceStatus: () => send({
        channel: OPENCHAMBER_SDK_CHANNEL,
        v: OPENCHAMBER_SDK_API_VERSION,
        type: "service-status",
        id: nextId(ids)
      }).then((result) => {
        if (!isServiceStatusResult(result)) {
          throw new HostRequestError("HOST_REJECTED", "Host did not return service status.");
        }
        return result;
      }),
      readFile: (path) => (isGuestFilePath(path) ? send({
        channel: OPENCHAMBER_SDK_CHANNEL,
        v: OPENCHAMBER_SDK_API_VERSION,
        type: "file-read",
        id: nextId(ids),
        payload: { path }
      }) : rejectBadFilePath()).then((result) => {
        if (!isFileReadResult(result)) {
          throw new HostRequestError("HOST_REJECTED", "Host did not return file content.");
        }
        return result;
      }),
      writeFile: (path, content) => {
        if (!isGuestFilePath(path)) {
          return rejectBadFilePath();
        }
        if (content.length > GUEST_FILE_CONTENT_MAX) {
          return Promise.reject(new HostRequestError("FILE_TOO_LARGE", `Content is over ${GUEST_FILE_CONTENT_MAX} characters.`));
        }
        return send({
          channel: OPENCHAMBER_SDK_CHANNEL,
          v: OPENCHAMBER_SDK_API_VERSION,
          type: "file-write",
          id: nextId(ids),
          payload: { path, content }
        }).then((result) => {
          if (!isFileWriteResult(result)) {
            throw new HostRequestError("HOST_REJECTED", "Host did not confirm the write.");
          }
          return result;
        });
      },
      listDir: (path) => (isGuestFilePath(path) ? send({
        channel: OPENCHAMBER_SDK_CHANNEL,
        v: OPENCHAMBER_SDK_API_VERSION,
        type: "file-list",
        id: nextId(ids),
        payload: { path }
      }) : rejectBadFilePath()).then((result) => {
        if (!isFileListResult(result)) {
          throw new HostRequestError("HOST_REJECTED", "Host did not return directory entries.");
        }
        return result;
      }),
      stat: (path) => (isGuestFilePath(path) ? send({
        channel: OPENCHAMBER_SDK_CHANNEL,
        v: OPENCHAMBER_SDK_API_VERSION,
        type: "file-stat",
        id: nextId(ids),
        payload: { path }
      }) : rejectBadFilePath()).then((result) => {
        if (!isFileStatResult(result)) {
          throw new HostRequestError("HOST_REJECTED", "Host did not return file status.");
        }
        return result;
      }),
      generate: (input) => {
        const prompt = input.prompt.trim();
        const system = input.system?.trim();
        if (prompt.length === 0 || prompt.length > GUEST_GENERATE_PROMPT_MAX) {
          return Promise.reject(new HostRequestError("HOST_REJECTED", `Prompt must be 1 to ${GUEST_GENERATE_PROMPT_MAX} characters.`));
        }
        if (system !== void 0 && (system.length === 0 || system.length > GUEST_GENERATE_SYSTEM_MAX)) {
          return Promise.reject(new HostRequestError("HOST_REJECTED", `System prompt must be 1 to ${GUEST_GENERATE_SYSTEM_MAX} characters.`));
        }
        const maxOutputTokens = input.maxOutputTokens === void 0 ? void 0 : Math.min(GUEST_GENERATE_OUTPUT_TOKENS_MAX, Math.max(1, Math.floor(input.maxOutputTokens)));
        if (maxOutputTokens !== void 0 && !Number.isFinite(maxOutputTokens)) {
          return Promise.reject(new HostRequestError("HOST_REJECTED", "maxOutputTokens must be a number."));
        }
        const payload = { prompt };
        if (system !== void 0)
          payload.system = system;
        if (maxOutputTokens !== void 0)
          payload.maxOutputTokens = maxOutputTokens;
        return send({
          channel: OPENCHAMBER_SDK_CHANNEL,
          v: OPENCHAMBER_SDK_API_VERSION,
          type: "generate",
          id: nextId(ids),
          payload
        }, options.requestTimeoutMs ?? GUEST_GENERATE_TIMEOUT_MS).then((result) => {
          if (!isGenerateResult(result)) {
            throw new HostRequestError("HOST_REJECTED", "Host did not return generated text.");
          }
          return result;
        });
      },
      onLateGenerateResult: (listener) => {
        lateGenerateListeners.add(listener);
        for (const result of unclaimedLateGenerate.splice(0))
          emit([listener], result);
        listenForLateGenerate();
        return () => {
          lateGenerateListeners.delete(listener);
        };
      },
      setBadge: (count) => request({
        channel: OPENCHAMBER_SDK_CHANNEL,
        v: OPENCHAMBER_SDK_API_VERSION,
        type: "badge",
        id: nextId(ids),
        payload: { count: clampBadgeCount(count) }
      }),
      setHeight: (height) => request({
        channel: OPENCHAMBER_SDK_CHANNEL,
        v: OPENCHAMBER_SDK_API_VERSION,
        type: "resize",
        id: nextId(ids),
        payload: { height: clampFrameHeight(height) }
      }),
      onFileOpen: (listener) => {
        fileOpenListeners.add(listener);
        if (!saveShortcutInstalled) {
          saveShortcutInstalled = true;
          target.addEventListener("keydown", onSaveShortcut, true);
        }
        if (lastFile)
          listener(lastFile);
        return () => {
          fileOpenListeners.delete(listener);
        };
      },
      onFileSnapshot: (handler) => {
        fileSnapshotHandler = handler;
        return () => {
          if (fileSnapshotHandler === handler)
            fileSnapshotHandler = null;
        };
      },
      onFileSaved: (listener) => {
        fileSavedListeners.add(listener);
        return () => {
          fileSavedListeners.delete(listener);
        };
      },
      reportFileChange: (change) => notify({ ...envelope, type: "file-change", payload: { dirty: change.dirty, edited: change.edited } }),
      requestFileSave,
      reportFileUnsupported: () => notify({ ...envelope, type: "file-unsupported" }),
      dispose: () => {
        for (const subscriptionId of workspaceListeners.keys()) {
          post({ ...envelope, type: "workspace-unsubscribe", id: nextId(ids), payload: { subscriptionId } });
        }
        workspaceListeners.clear();
        for (const subscriptionId of shellsListeners.keys()) {
          post({ ...envelope, type: "shells-unsubscribe", id: nextId(ids), payload: { subscriptionId } });
        }
        shellsListeners.clear();
        disposed = true;
        resolveHandler = null;
        actionHandler = null;
        fileSnapshotHandler = null;
        fileOpenListeners.clear();
        fileSavedListeners.clear();
        if (saveShortcutInstalled)
          target.removeEventListener("keydown", onSaveShortcut, true);
        target.removeEventListener("message", onMessage);
        target.removeEventListener("keydown", onPopoverEscape, true);
        target.removeEventListener("pointerover", onPopoverPointerOver);
        target.removeEventListener("pointermove", onPopoverPointerOver);
        target.removeEventListener("pointerout", onPopoverPointerOut);
        target.removeEventListener("focus", onPopoverFocus);
        target.removeEventListener("blur", onPopoverBlur);
        for (const waiter of pending.values()) {
          clearTimeout(waiter.timer);
          waiter.reject(new HostRequestError("HOST_UNAVAILABLE", "Host client was disposed."));
        }
        pending.clear();
        readyListeners.clear();
        directoryListeners.clear();
        sessionListeners.clear();
        lifecycleListeners.clear();
        connectionListeners.clear();
        settingsListeners.clear();
        itemListeners.clear();
        statusControlListeners.clear();
        popoverClosedListeners.clear();
        lateGenerateListeners.clear();
        unclaimedLateGenerate.length = 0;
      }
    };
  };

  // ../../node_modules/.pnpm/@openchamber+sdk@2.5.1/node_modules/@openchamber/sdk/dist/service-providers.js
  var BROWSER_CONTROL_ACTIONS = [
    "browser.open",
    "browser.snapshot",
    "browser.click",
    "browser.type",
    "browser.select",
    "browser.scroll",
    "browser.back",
    "browser.forward",
    "browser.inspect",
    "browser.capture",
    "browser.resize",
    "browser.close"
  ];
  var BROWSER_PROVIDER_IDLE_MS = 10 * 6e4;
  var CONTROL_ACTIONS = new Set(BROWSER_CONTROL_ACTIONS);
  var SOURCE_CONTROL_PROVIDER_IDLE_MS = 10 * 6e4;

  // ../../node_modules/.pnpm/@openchamber+sdk@2.5.1/node_modules/@openchamber/sdk/dist/service-surface.js
  var SURFACE_CONTROLLERS = ["none", "agent", "user"];
  var CONTROLLERS = new Set(SURFACE_CONTROLLERS);

  // panel/host.ts
  var host = connectHost();

  // panel/theme.ts
  var FALLBACK_REVEAL_MS = 1500;
  function installHostTheme(root2, fallbackMs = FALLBACK_REVEAL_MS) {
    let timer = setTimeout(() => {
      timer = null;
      if (!root2.dataset.ocTheme) {
        root2.dataset.ocFallback = "true";
      }
    }, fallbackMs);
    const clearTimer = () => {
      if (timer !== null) {
        clearTimeout(timer);
        timer = null;
      }
    };
    return {
      apply: (context) => {
        clearTimer();
        delete root2.dataset.ocFallback;
        applyHostReady(context, root2);
      },
      dispose: clearTimer
    };
  }

  // panel/state.ts
  function createInitialState() {
    return {
      branches: [],
      allCommits: [],
      filteredCommits: [],
      selectedCommit: null,
      selectedCommits: /* @__PURE__ */ new Set(),
      selectedBranch: null,
      selectedBranches: /* @__PURE__ */ new Set(),
      fetching: false,
      showOnlyMyBranches: false,
      myBranches: /* @__PURE__ */ new Set(),
      commitDetail: null,
      diffs: [],
      gitStatus: null,
      branchFilter: "",
      commitSearch: "",
      logBranch: null,
      loading: false,
      favorites: /* @__PURE__ */ new Set(),
      filterAuthor: "",
      filterDateFrom: "",
      filterDateTo: "",
      filterPaths: [],
      branchPanelHidden: false,
      sortMode: "default",
      displaySettings: {
        showAuthor: true,
        showDate: true,
        showHash: true,
        showLongEdges: true,
        showTagNames: true,
        compactReferences: false,
        preferCommitDate: false,
        referencesOnLeft: false
      },
      searchRegex: false,
      searchCaseSensitive: false
    };
  }
  var StateManager = class {
    state;
    listeners = /* @__PURE__ */ new Set();
    constructor(initialState) {
      this.state = initialState;
    }
    /** 获取当前状态 */
    getState() {
      return this.state;
    }
    /** 更新状态 */
    setState(updater) {
      updater(this.state);
      this.notifyListeners();
    }
    /** 订阅状态变更 */
    subscribe(callback) {
      this.listeners.add(callback);
      return () => {
        this.listeners.delete(callback);
      };
    }
    /** 通知监听器 */
    notifyListeners() {
      for (const listener of this.listeners) {
        listener(this.state);
      }
    }
  };
  var stateManager = new StateManager(createInitialState());
  var getState = () => stateManager.getState();
  var setState = (updater) => stateManager.setState(updater);
  var subscribeState = (callback) => stateManager.subscribe(callback);
  function pickFields(fields) {
    const state = getState();
    const snap = {};
    for (const field2 of fields) {
      snap[field2] = state[field2];
    }
    return snap;
  }
  function subscribeFields(fields, callback) {
    let prev = pickFields(fields);
    return subscribeState((state) => {
      const changed = [];
      for (const field2 of fields) {
        if (prev[field2] !== state[field2]) {
          changed.push(field2);
        }
      }
      if (changed.length === 0) return;
      prev = pickFields(fields);
      callback(changed);
    });
  }

  // panel/i18n.ts
  var en = {
    "branch.checkout": "Checkout Branch",
    "branch.rename": "Rename Branch",
    "branch.merge": "Merge into Current Branch",
    "branch.rebase": "Rebase onto Here",
    "branch.pull": "Pull",
    "branch.push": "Push",
    "branch.favorite": "Add to Favorites",
    "branch.unfavorite": "Remove from Favorites",
    "branch.delete": "Delete Branch",
    // 未合并强制删除对话框 + 删除通知（对齐 IDEA GitDeleteBranchOperation）
    "branch.forceDelete": "Branch {name} has not been merged into the current branch. Force deleting will lose its commits.",
    "branch.forceDeleteButton": "Force Delete",
    "branch.notFound": "Branch {name} does not exist",
    "branch.deleteFailed": "Failed to delete branch",
    "sidebar.deleteBranch": "Delete Branch",
    "branch.batchDeleteDone": "Deleted {n} branches",
    "branch.batchDeletePartial": "Deleted {ok} branch(es), failed: {failed}",
    "branch.selectBranch": "Please select a branch first",
    "branch.deleteCurrent": "Cannot delete the current branch",
    "branch.title": "Branches",
    "branch.searchPlaceholder": "Branch or tag",
    "branch.notifyDeleted": "Deleted branch: {name}",
    "branch.restore": "Restore",
    "branch.deleteTracking": "Delete Tracking Branch",
    "branch.restoreSuccess": "Branch {name} restored",
    "branch.restoreFailed": "Failed to restore branch",
    "branch.deleteTrackingFailed": "Failed to delete tracking branch",
    "commit.copyRevision": "Copy Revision Number",
    "commit.cherryPick": "Cherry-pick",
    "commit.compareLocal": "Compare with Local",
    "commit.reset": "Reset Current Branch to Here",
    "commit.revert": "Revert Commit",
    "commit.newBranch": "New Branch",
    "commit.newTag": "New Tag",
    "batch.selected": "{n} commits selected",
    "batch.copyHashes": "Copy Hash List",
    "batch.cherryPickAll": "Cherry-pick All ({n})",
    "batch.revertAll": "Revert All ({n})",
    "batch.confirmCherryPick": "Cherry-pick {n} selected commits?",
    "batch.confirmRevert": "Revert {n} selected commits?",
    "file.showDiff": "Show Diff",
    "file.showDiffNew": "Show Diff in a New Window",
    "file.compareLocal": "Compare with Local",
    "file.compareBeforeLocal": "Compare Before with Local",
    "file.editSource": "Edit Source",
    "file.openRepoVersion": "Open Repository Version",
    "file.revertChanges": "Revert Selected Changes",
    "file.cherryPickChanges": "Cherry-Pick Selected Changes",
    "file.createPatch": "Create Patch",
    "file.getFromRevision": "Get from Revision",
    "file.historyUpTo": "History Up to Here",
    // 侧边栏图标 / 显示设置 / 跳转 / 排序
    "sidebar.hideBranches": "Hide Git Branches",
    "sidebar.showBranches": "Show Git Branches",
    "sidebar.newBranch": "New Branch",
    "sidebar.refresh": "Refresh",
    "sidebar.update": "Update Selected",
    "sidebar.checkout": "Checkout",
    "sidebar.merge": "Merge",
    "sidebar.search": "Search",
    "sidebar.favorite": "Favorite",
    "sidebar.settings": "Settings",
    "sidebar.pull": "Pull",
    "sidebar.expandAll": "Expand All",
    "sidebar.sort": "Sort",
    "sidebar.close": "Close",
    "sidebar.noSelectedBranch": "No branch selected",
    "settings.title": "Display Settings",
    "settings.showAuthor": "Show Author Column",
    "settings.showDate": "Show Date Column",
    "settings.showHash": "Show Hash Column",
    "goto.title": "Go to Reference",
    "goto.placeholder": "Enter hash or branch name",
    "goto.notFound": "No matches found",
    "goto.ok": "Go",
    "sort.dateAsc": "Sort: Date Ascending",
    "sort.authorAsc": "Sort: Author",
    "sort.messageAsc": "Sort: Message",
    // 工具栏过滤（分支 / 用户 / 日期 / 路径）
    "filter.branch": "Branch",
    "filter.user": "User",
    "filter.date": "Date",
    "filter.path": "Path",
    "filter.selectAll": "Select All",
    "filter.regex": "Regular Expression",
    "filter.case": "Case Sensitive",
    "filter.all": "All",
    "filter.localBranches": "Local Branches",
    "filter.remoteBranches": "Remote Branches",
    "filter.favorites": "Favorites",
    "filter.today": "Today",
    "filter.thisWeek": "This Week",
    "filter.thisMonth": "This Month",
    "filter.thisYear": "This Year",
    "filter.custom": "Custom\u2026",
    "filter.dateFrom": "From Date",
    "filter.dateTo": "To Date",
    "filter.chooseFolder": "Choose folder\u2026",
    "filter.ok": "OK",
    "filter.cancel": "Cancel",
    "filter.clear": "Clear",
    // 路径过滤（多选）
    "filter.selectPaths": "Select paths to filter by",
    "filter.editPaths": "Edit paths\u2026",
    "filter.maxPaths": "At most 100 paths allowed",
    "filter.noPaths": "No selectable paths",
    "filter.loadPathsFailed": "Failed to load paths",
    "dialog.renameBranch": "Rename Branch",
    "dialog.branchName": "Branch name",
    "dialog.startPoint": "Start point",
    "dialog.currentHead": "Current HEAD",
    "dialog.inputBranchName": "Enter branch name\u2026",
    "dialog.checkoutAfterCreate": "Checkout after create",
    "dialog.create": "Create",
    "dialog.dateFilter": "Filter by Date",
    "dialog.startDate": "Start date",
    "dialog.endDate": "End date",
    "dialog.clear": "Clear",
    "dialog.resetTo": "Reset branch to {hash}",
    "dialog.selectResetMode": "Select reset mode:",
    "dialog.resetSoft": "Soft - move HEAD only",
    "dialog.resetMixed": "Mixed - move HEAD + reset index (default)",
    "dialog.resetHard": "Hard - move HEAD + reset index + reset working tree",
    "dialog.reset": "Reset",
    "dialog.branchFromCommit": "Create Branch from Commit",
    "dialog.basedOn": "Based on: {info}",
    "commit.searchPlaceholder": "Text or hash",
    "branch.groupHead": "HEAD (current branch)",
    "branch.groupLocal": "Local",
    "branch.groupRemote": "Remote",
    "file.noDiff": "No differences",
    "file.changedFiles": "Changed files",
    "detail.title": "Commit Details",
    "detail.hash": "Hash",
    "detail.author": "Author",
    "detail.date": "Date",
    "main.loadingTitle": "Loading\u2026",
    "main.loadingBody": "Loading project information.",
    "main.notGitTitle": "Not a Git Repository",
    "main.notGitBody": "The current directory is not a Git repository.",
    "time.justNow": "just now",
    "time.minutesAgo": "{n} min ago",
    "time.hoursAgo": "{n} h ago",
    "time.daysAgo": "{n} d ago",
    "commit.empty": "No commits",
    "commit.noSelection": "Select a commit to view changes",
    "file.selectDiff": "Select a file to view the diff",
    "file.noChanges": "No changed files",
    "layout.resizeDivider": "Drag to resize",
    "main.tabConsole": "Console",
    "reset.title": "Reset Current Branch to Here",
    "reset.softDesc": "keep working tree and index",
    "reset.mixedDesc": "keep working tree, reset index",
    "reset.hardDesc": "discard all changes",
    "dialog.createBranchTitle": "New Branch",
    "dialog.pathPlaceholder": "src/ or packages/core",
    "dialog.cancel": "Cancel",
    "dialog.ok": "OK",
    "filter.selectAllToggle": "Select all / deselect all in the current list",
    "sidebar.compareBranch": "Compare with Current",
    "compare.title": "Comparing {branch} with {current}",
    "compare.branchOnly": "Unique to {branch}",
    "compare.currentOnly": "Unique to {current}",
    "compare.empty": "No commits",
    "compare.loading": "Loading\u2026",
    "compare.loadFailed": "Failed to compare branches",
    "compare.selectBranch": "Select a branch to compare first",
    "compare.currentBranch": "The current branch cannot be compared with itself",
    "compare.noCurrentBranch": "Current branch not loaded yet, please retry",
    "compare.with": "with",
    "compare.identical": "Branches are identical",
    "compare.sameBranch": "Select two different branches",
    "compare.tooMany": "Select at most two branches to compare",
    "sidebar.showMyBranches": "Show My Branches",
    "sidebar.myBranchesFailed": "Failed to load my branches",
    "sidebar.showMyBranchesOn": "Showing My Branches",
    "sidebar.myBranchesUnavailable": "No local branches to filter",
    "sidebar.newBranchUnavailable": "No branches to create from",
    "sidebar.updateUnavailable": "No remote configured",
    "sidebar.deleteRemoteUnavailable": "Remote branches cannot be deleted here",
    "sidebar.expandAllUnavailable": "No branches to expand",
    "sidebar.pullUnavailable": "No remote configured",
    "sidebar.fetch": "Fetch",
    "sidebar.locate": "Select in Git Log",
    "sidebar.collapseAll": "Collapse All",
    "sidebar.locateNotInView": "{branch} head is not in the current log view",
    "sidebar.fetchAuthFailed": "Authentication failed",
    "sidebar.fetchUnreachable": "Remote unreachable",
    "sidebar.fetchNoRemote": "Remote repository not found",
    "sidebar.fetchFailed": "Fetch failed",
    "sidebar.fetchInProgress": "Fetching\u2026",
    "sidebar.fetchSuccessUpdates": "Fetched: {count} branch(es) have new commits",
    "sidebar.fetchSuccessNoUpdates": "Fetched: already up to date",
    "settings.groupView": "View",
    "settings.groupGraph": "Graph",
    "settings.showBranchLabels": "Show Branch Labels",
    "settings.showTagNames": "Tag Names",
    "settings.compactReferences": "Compact References View",
    "settings.preferCommitDate": "Commit Timestamp",
    "settings.referencesOnLeft": "References on the Left",
    "settings.showLongEdges": "Long Edges",
    "commit.copied": "Copied to clipboard",
    "commit.copyFailed": "Copy failed",
    "commit.cherryPickNoSelection": "Please select a commit first",
    "commit.cherryPickDoneMulti": "Cherry-picked {n} commits",
    "commit.cherryPickDone": "Cherry-picked {hash}",
    "commit.cherryPickFailed": "Cherry-pick failed",
    "commit.cherryPickConflict": "Cherry-pick conflict, resolve it and continue or abort",
    "batch.cherryPickDone": "Cherry-picked {n} commits",
    "commit.uncommit": "Undo Commit",
    "commit.uncommitDone": "Undid commit {hash}",
    "commit.uncommitFailed": "Failed to undo commit",
    "commit.reword": "Edit Commit Message",
    "commit.rewordTitle": "Edit Commit Message",
    "commit.rewordEmpty": "Commit message cannot be empty",
    "commit.rewordDone": "Commit message updated",
    "commit.dropCommit": "Delete Commit",
    "commit.dropConfirm": "Delete commit {hash}? History will be rewritten.",
    "commit.dropDone": "Deleted commit {hash}",
    "commit.dropFailed": "Failed to delete commit",
    "commit.pushUpTo": "Push Commits Up To Here",
    "commit.pushUpToDone": "Pushed {ref}",
    "commit.pushUpToRejected": "Push rejected, pull first",
    "commit.pushUpToFailed": "Push failed",
    "commit.pushNoBranch": "No branch contains this commit",
    "commit.dirtyWorkingTree": "Commit or stash your changes before rewriting history",
    "commit.revertDone": "Reverted {hash}",
    "commit.revertFailed": "Revert failed",
    "commit.revertConflict": "Revert conflict, resolve it and continue or abort",
    "op.failed": "Operation failed",
    "op.conflict": "Merge conflict",
    "op.authFailed": "Authentication failed",
    "op.unreachable": "Remote unreachable",
    "op.rejected": "Push rejected, pull first",
    "op.checkoutDone": "Checked out {name}",
    "op.mergeDone": "Merged {name}",
    "op.rebaseDone": "Rebased onto {name}",
    "op.pullDone": "Pulled",
    "op.pushDone": "Pushed",
    "op.deleteDone": "Deleted branch {name}",
    "worktree.refresh": "Refresh",
    "worktree.add": "Add Worktree",
    "worktree.prune": "Prune",
    "worktree.empty": "No worktrees",
    "worktree.main": "main",
    "worktree.remove": "Remove",
    "worktree.removeConfirm": "Remove worktree {path}?",
    "worktree.forceConfirm": "It has uncommitted changes. Force remove?",
    "worktree.loadFailed": "Failed to load worktrees",
    "worktree.addPathPrompt": "Target path for the new worktree:",
    "worktree.addBranchPrompt": "New branch name (based on {base}):",
    "worktree.addFailed": "Failed to add worktree",
    "batch.revertDone": "Reverted {n} commits",
    "op.newBranchDone": "Created branch {name}",
    "op.newBranchFailed": "Failed to create branch",
    "worktree.refreshed": "Worktree list refreshed",
    "worktree.pruneDone": "Pruned {n} stale worktree(s)",
    "worktree.pruneNothing": "No stale worktrees to prune",
    "worktree.pruneFailed": "Prune failed",
    "worktree.removed": "Worktree removed",
    "worktree.added": "Worktree created at {path}",
    "op.branchDirtyWorkingTree": "commit or stash your changes first",
    "op.branchExists": "branch already exists",
    "op.branchInvalidName": "invalid branch name",
    "op.branchCreateGeneric": "see console for details",
    "console.commandCount": "git commands",
    "console.clear": "Clear",
    "console.noCommands": "No git commands yet",
    "console.selectCommand": "Select a command to view output",
    "console.noOutput": "(no output)",
    "console.loadFailed": "Failed to load command log",
    "op.resetFailed": "Reset failed",
    "branch.favoriteSaveFailed": "Failed to save favorites",
    "dialog.renameFailed": "Failed to rename branch",
    "dialog.createBranchFailed": "Failed to create branch",
    "branch.loadFailed": "Failed to load branches",
    "commit.loadDetailFailed": "Failed to load commit details",
    "commit.loadListFailed": "Failed to load commits",
    "worktree.removeFailed": "Failed to remove worktree"
  };
  var zhCN = {
    "branch.checkout": "\u7B7E\u51FA\u5206\u652F",
    "branch.rename": "\u91CD\u547D\u540D\u5206\u652F",
    "branch.merge": "\u5408\u5E76\u5230\u5F53\u524D\u5206\u652F",
    "branch.rebase": "\u53D8\u57FA\u5230\u6B64\u5206\u652F",
    "branch.pull": "\u62C9\u53D6",
    "branch.push": "\u63A8\u9001",
    "branch.favorite": "\u6DFB\u52A0\u6536\u85CF",
    "branch.unfavorite": "\u53D6\u6D88\u6536\u85CF",
    "branch.delete": "\u5220\u9664\u5206\u652F",
    // 未合并强制删除对话框 + 删除通知（对齐 IDEA GitDeleteBranchOperation）
    "branch.forceDelete": "\u5206\u652F {name} \u5C1A\u672A\u5408\u5E76\u5230\u5F53\u524D\u5206\u652F\uFF0C\u5F3A\u5236\u5220\u9664\u5C06\u4E22\u5931\u5176\u4E0A\u7684\u63D0\u4EA4\u3002",
    "branch.forceDeleteButton": "\u5F3A\u5236\u5220\u9664",
    "branch.notFound": "\u5206\u652F {name} \u4E0D\u5B58\u5728",
    "branch.deleteFailed": "\u5220\u9664\u5206\u652F\u5931\u8D25",
    "sidebar.deleteBranch": "\u5220\u9664\u5206\u652F",
    "branch.batchDeleteDone": "\u5DF2\u5220\u9664 {n} \u4E2A\u5206\u652F",
    "branch.batchDeletePartial": "\u5DF2\u5220\u9664 {ok} \u4E2A\u5206\u652F\uFF0C\u5931\u8D25\uFF1A{failed}",
    "branch.selectBranch": "\u8BF7\u5148\u9009\u62E9\u5206\u652F",
    "branch.deleteCurrent": "\u5F53\u524D\u5206\u652F\u4E0D\u80FD\u5220\u9664",
    "branch.title": "\u5206\u652F",
    "branch.searchPlaceholder": "\u5206\u652F\u6216\u6807\u7B7E",
    "branch.notifyDeleted": "\u5DF2\u5220\u9664\u7684\u5206\u652F: {name}",
    "branch.restore": "\u8FD8\u539F",
    "branch.deleteTracking": "\u5220\u9664\u8DDF\u8E2A\u7684\u5206\u652F",
    "branch.restoreSuccess": "\u5206\u652F {name} \u5DF2\u8FD8\u539F",
    "branch.restoreFailed": "\u8FD8\u539F\u5206\u652F\u5931\u8D25",
    "branch.deleteTrackingFailed": "\u5220\u9664\u8DDF\u8E2A\u7684\u5206\u652F\u5931\u8D25",
    "commit.copyRevision": "\u590D\u5236\u63D0\u4EA4\u54C8\u5E0C",
    "commit.cherryPick": "Cherry-pick",
    "commit.compareLocal": "\u4E0E\u672C\u5730\u6BD4\u8F83",
    "commit.reset": "\u5C06\u5F53\u524D\u5206\u652F\u91CD\u7F6E\u5230\u6B64\u5904",
    "commit.revert": "\u56DE\u6EDA\u63D0\u4EA4",
    "commit.newBranch": "\u65B0\u5EFA\u5206\u652F",
    "commit.newTag": "\u65B0\u5EFA\u6807\u7B7E",
    "batch.selected": "\u5DF2\u9009\u4E2D {n} \u4E2A\u63D0\u4EA4",
    "batch.copyHashes": "\u590D\u5236\u54C8\u5E0C\u5217\u8868",
    "batch.cherryPickAll": "Cherry-pick \u5168\u90E8 ({n})",
    "batch.revertAll": "Revert \u5168\u90E8 ({n})",
    "batch.confirmCherryPick": "\u786E\u5B9A\u5BF9 {n} \u4E2A\u63D0\u4EA4\u6267\u884C Cherry-pick \u5417\uFF1F",
    "batch.confirmRevert": "\u786E\u5B9A\u5BF9 {n} \u4E2A\u63D0\u4EA4\u6267\u884C Revert \u5417\uFF1F",
    "file.showDiff": "\u663E\u793A\u5DEE\u5F02",
    "file.showDiffNew": "\u65B0\u7A97\u53E3\u663E\u793A\u5DEE\u5F02",
    "file.compareLocal": "\u4E0E\u672C\u5730\u6BD4\u8F83",
    "file.compareBeforeLocal": "\u6BD4\u8F83\u6539\u52A8\u524D\u4E0E\u672C\u5730",
    "file.editSource": "\u7F16\u8F91\u6E90\u6587\u4EF6",
    "file.openRepoVersion": "\u6253\u5F00\u4ED3\u5E93\u7248\u672C",
    "file.revertChanges": "\u56DE\u6EDA\u9009\u4E2D\u66F4\u6539",
    "file.cherryPickChanges": "\u6458\u53D6\u9009\u4E2D\u66F4\u6539",
    "file.createPatch": "\u521B\u5EFA\u8865\u4E01",
    "file.getFromRevision": "\u4ECE\u7248\u672C\u83B7\u53D6",
    "file.historyUpTo": "\u6B64\u5904\u4E3A\u6B62\u7684\u5386\u53F2",
    // 侧边栏图标 / 显示设置 / 跳转 / 排序
    "sidebar.hideBranches": "\u9690\u85CF Git \u5206\u652F",
    "sidebar.showBranches": "\u663E\u793A Git \u5206\u652F",
    "sidebar.newBranch": "\u65B0\u5EFA\u5206\u652F",
    "sidebar.refresh": "\u5237\u65B0",
    "sidebar.update": "\u66F4\u65B0\u6240\u9009",
    "sidebar.checkout": "\u7B7E\u51FA",
    "sidebar.merge": "\u5408\u5E76",
    "sidebar.search": "\u641C\u7D22",
    "sidebar.favorite": "\u6536\u85CF",
    "sidebar.settings": "\u8BBE\u7F6E",
    "sidebar.pull": "\u62C9\u53D6",
    "sidebar.expandAll": "\u5C55\u5F00\u5168\u90E8",
    "sidebar.sort": "\u6392\u5E8F",
    "sidebar.close": "\u5173\u95ED",
    "sidebar.noSelectedBranch": "\u672A\u9009\u4E2D\u5206\u652F",
    "settings.title": "\u663E\u793A\u8BBE\u7F6E",
    "settings.showAuthor": "\u663E\u793A\u4F5C\u8005\u5217",
    "settings.showDate": "\u663E\u793A\u65E5\u671F\u5217",
    "settings.showHash": "\u663E\u793A\u54C8\u5E0C\u5217",
    "goto.title": "\u8DF3\u8F6C\u5230\u5F15\u7528",
    "goto.placeholder": "\u8F93\u5165\u54C8\u5E0C\u6216\u5206\u652F\u540D",
    "goto.notFound": "\u672A\u627E\u5230\u5339\u914D\u9879",
    "goto.ok": "\u8DF3\u8F6C",
    "sort.dateAsc": "\u6392\u5E8F: \u65E5\u671F\u5347\u5E8F",
    "sort.authorAsc": "\u6392\u5E8F: \u4F5C\u8005",
    "sort.messageAsc": "\u6392\u5E8F: \u6D88\u606F",
    // 工具栏过滤（分支 / 用户 / 日期 / 路径）
    "filter.branch": "\u5206\u652F",
    "filter.user": "\u7528\u6237",
    "filter.date": "\u65E5\u671F",
    "filter.path": "\u8DEF\u5F84",
    "filter.selectAll": "\u5168\u9009",
    "filter.regex": "\u6B63\u5219\u8868\u8FBE\u5F0F",
    "filter.case": "\u5927\u5C0F\u5199\u654F\u611F",
    "filter.all": "\u5168\u90E8",
    "filter.localBranches": "\u672C\u5730\u5206\u652F",
    "filter.remoteBranches": "\u8FDC\u7A0B\u5206\u652F",
    "filter.favorites": "\u6536\u85CF",
    "filter.today": "\u4ECA\u5929",
    "filter.thisWeek": "\u672C\u5468",
    "filter.thisMonth": "\u672C\u6708",
    "filter.thisYear": "\u4ECA\u5E74",
    "filter.custom": "\u81EA\u5B9A\u4E49\u2026",
    "filter.dateFrom": "\u5F00\u59CB\u65E5\u671F",
    "filter.dateTo": "\u7ED3\u675F\u65E5\u671F",
    "filter.chooseFolder": "\u9009\u62E9\u6587\u4EF6\u5939\u2026",
    "filter.ok": "\u786E\u5B9A",
    "filter.cancel": "\u53D6\u6D88",
    "filter.clear": "\u6E05\u9664",
    // 路径过滤（多选）
    "filter.selectPaths": "\u9009\u62E9\u8981\u8FC7\u6EE4\u7684\u8DEF\u5F84",
    "filter.editPaths": "\u7F16\u8F91\u8DEF\u5F84\u2026",
    "filter.maxPaths": "\u6700\u591A\u53EF\u9009 100 \u9879",
    "filter.noPaths": "\u65E0\u53EF\u9009\u8DEF\u5F84",
    "filter.loadPathsFailed": "\u52A0\u8F7D\u8DEF\u5F84\u5931\u8D25",
    "dialog.renameBranch": "\u91CD\u547D\u540D\u5206\u652F",
    "dialog.branchName": "\u5206\u652F\u540D",
    "dialog.startPoint": "\u8D77\u70B9",
    "dialog.currentHead": "\u5F53\u524D HEAD",
    "dialog.inputBranchName": "\u8F93\u5165\u5206\u652F\u540D\u79F0\u2026",
    "dialog.checkoutAfterCreate": "\u521B\u5EFA\u540E\u68C0\u51FA\u8BE5\u5206\u652F",
    "dialog.create": "\u521B\u5EFA",
    "dialog.dateFilter": "\u6309\u65E5\u671F\u8FC7\u6EE4",
    "dialog.startDate": "\u5F00\u59CB\u65E5\u671F",
    "dialog.endDate": "\u7ED3\u675F\u65E5\u671F",
    "dialog.clear": "\u6E05\u9664",
    "dialog.resetTo": "\u91CD\u7F6E\u5206\u652F\u5230 {hash}",
    "dialog.selectResetMode": "\u9009\u62E9\u91CD\u7F6E\u6A21\u5F0F\uFF1A",
    "dialog.resetSoft": "Soft - \u4EC5\u79FB\u52A8 HEAD",
    "dialog.resetMixed": "Mixed - \u79FB\u52A8 HEAD + \u91CD\u7F6E\u7D22\u5F15\uFF08\u9ED8\u8BA4\uFF09",
    "dialog.resetHard": "Hard - \u79FB\u52A8 HEAD + \u91CD\u7F6E\u7D22\u5F15 + \u91CD\u7F6E\u5DE5\u4F5C\u6811",
    "dialog.reset": "\u91CD\u7F6E",
    "dialog.branchFromCommit": "\u4ECE\u63D0\u4EA4\u521B\u5EFA\u5206\u652F",
    "dialog.basedOn": "\u57FA\u4E8E\uFF1A{info}",
    "commit.searchPlaceholder": "\u6587\u672C\u6216\u54C8\u5E0C",
    "branch.groupHead": "HEAD(\u5F53\u524D\u5206\u652F)",
    "branch.groupLocal": "\u672C\u5730",
    "branch.groupRemote": "\u8FDC\u7A0B",
    "file.noDiff": "\u65E0\u5DEE\u5F02\u5185\u5BB9",
    "file.changedFiles": "\u53D8\u66F4\u6587\u4EF6",
    "detail.title": "\u63D0\u4EA4\u8BE6\u60C5",
    "detail.hash": "\u54C8\u5E0C",
    "detail.author": "\u4F5C\u8005",
    "detail.date": "\u65E5\u671F",
    "main.loadingTitle": "\u7B49\u5F85\u521D\u59CB\u5316\u2026",
    "main.loadingBody": "\u6B63\u5728\u52A0\u8F7D\u9879\u76EE\u4FE1\u606F\u3002",
    "main.notGitTitle": "\u975E Git \u4ED3\u5E93",
    "main.notGitBody": "\u5F53\u524D\u76EE\u5F55\u4E0D\u662F Git \u4ED3\u5E93\u3002",
    "time.justNow": "\u521A\u521A",
    "time.minutesAgo": "{n}\u5206\u949F\u524D",
    "time.hoursAgo": "{n}\u5C0F\u65F6\u524D",
    "time.daysAgo": "{n}\u5929\u524D",
    "commit.empty": "\u6682\u65E0\u63D0\u4EA4\u8BB0\u5F55",
    "commit.noSelection": "\u9009\u62E9\u8981\u67E5\u770B\u66F4\u6539\u7684\u63D0\u4EA4",
    "file.selectDiff": "\u9009\u62E9\u6587\u4EF6\u67E5\u770B\u5DEE\u5F02",
    "file.noChanges": "\u6682\u65E0\u53D8\u66F4\u6587\u4EF6",
    "layout.resizeDivider": "\u62D6\u52A8\u8C03\u6574\u5927\u5C0F",
    "main.tabConsole": "\u63A7\u5236\u53F0",
    "reset.title": "\u5C06\u5F53\u524D\u5206\u652F\u91CD\u7F6E\u5230\u6B64\u63D0\u4EA4",
    "reset.softDesc": "\u4FDD\u7559\u5DE5\u4F5C\u533A\u548C\u6682\u5B58\u533A",
    "reset.mixedDesc": "\u4FDD\u7559\u5DE5\u4F5C\u533A\uFF0C\u91CD\u7F6E\u6682\u5B58\u533A",
    "reset.hardDesc": "\u4E22\u5F03\u6240\u6709\u66F4\u6539",
    "dialog.createBranchTitle": "\u65B0\u5EFA\u5206\u652F",
    "dialog.pathPlaceholder": "src/ \u6216 packages/core",
    "dialog.cancel": "\u53D6\u6D88",
    "dialog.ok": "\u786E\u5B9A",
    "filter.selectAllToggle": "\u5168\u9009/\u53D6\u6D88\u5168\u9009\u5F53\u524D\u5217\u8868",
    "sidebar.compareBranch": "\u4E0E\u5F53\u524D\u5206\u652F\u6BD4\u8F83",
    "compare.title": "\u6BD4\u8F83 {branch} \u4E0E {current}",
    "compare.branchOnly": "{branch} \u72EC\u6709\u7684\u63D0\u4EA4",
    "compare.currentOnly": "{current} \u72EC\u6709\u7684\u63D0\u4EA4",
    "compare.empty": "\u65E0\u63D0\u4EA4",
    "compare.loading": "\u52A0\u8F7D\u4E2D\u2026",
    "compare.loadFailed": "\u5206\u652F\u6BD4\u8F83\u5931\u8D25",
    "compare.selectBranch": "\u8BF7\u5148\u9009\u62E9\u8981\u6BD4\u8F83\u7684\u5206\u652F",
    "compare.currentBranch": "\u5F53\u524D\u5206\u652F\u65E0\u6CD5\u4E0E\u81EA\u5DF1\u6BD4\u8F83",
    "compare.noCurrentBranch": "\u5F53\u524D\u5206\u652F\u5C1A\u672A\u52A0\u8F7D\u5B8C\u6210\uFF0C\u8BF7\u7A0D\u540E\u91CD\u8BD5",
    "compare.with": "\u4E0E",
    "compare.identical": "\u4E24\u4E2A\u5206\u652F\u6CA1\u6709\u5DEE\u5F02",
    "compare.sameBranch": "\u8BF7\u9009\u62E9\u4E24\u4E2A\u4E0D\u540C\u7684\u5206\u652F",
    "compare.tooMany": "\u6700\u591A\u9009\u62E9\u4E24\u4E2A\u5206\u652F\u8FDB\u884C\u6BD4\u8F83",
    "sidebar.showMyBranches": "\u53EA\u663E\u793A\u6211\u7684\u5206\u652F",
    "sidebar.myBranchesFailed": "\u52A0\u8F7D\u6211\u7684\u5206\u652F\u5931\u8D25",
    "sidebar.showMyBranchesOn": "\u6B63\u5728\u53EA\u663E\u793A\u6211\u7684\u5206\u652F",
    "sidebar.myBranchesUnavailable": "\u6CA1\u6709\u53EF\u7B5B\u9009\u7684\u672C\u5730\u5206\u652F",
    "sidebar.newBranchUnavailable": "\u6CA1\u6709\u53EF\u57FA\u4E8E\u7684\u5206\u652F",
    "sidebar.updateUnavailable": "\u672A\u914D\u7F6E\u8FDC\u7A0B\u4ED3\u5E93",
    "sidebar.deleteRemoteUnavailable": "\u4E0D\u80FD\u5728\u6B64\u5220\u9664\u8FDC\u7A0B\u5206\u652F",
    "sidebar.expandAllUnavailable": "\u6CA1\u6709\u53EF\u5C55\u5F00\u7684\u5206\u652F",
    "sidebar.pullUnavailable": "\u672A\u914D\u7F6E\u8FDC\u7A0B\u4ED3\u5E93",
    "sidebar.fetch": "\u83B7\u53D6\u8FDC\u7A0B\u66F4\u65B0",
    "sidebar.locate": "\u5728 Git \u65E5\u5FD7\u4E2D\u5B9A\u4F4D",
    "sidebar.collapseAll": "\u6298\u53E0\u5168\u90E8",
    "sidebar.locateNotInView": "{branch} \u7684\u6700\u65B0\u63D0\u4EA4\u4E0D\u5728\u5F53\u524D\u5217\u8868\u4E2D",
    "sidebar.fetchAuthFailed": "\u8BA4\u8BC1\u5931\u8D25",
    "sidebar.fetchUnreachable": "\u65E0\u6CD5\u8FDE\u63A5\u8FDC\u7A0B\u4ED3\u5E93",
    "sidebar.fetchNoRemote": "\u8FDC\u7A0B\u4ED3\u5E93\u4E0D\u5B58\u5728",
    "sidebar.fetchFailed": "\u83B7\u53D6\u8FDC\u7A0B\u66F4\u65B0\u5931\u8D25",
    "sidebar.fetchInProgress": "\u6B63\u5728\u83B7\u53D6\u8FDC\u7A0B\u66F4\u65B0\u2026",
    "sidebar.fetchSuccessUpdates": "\u83B7\u53D6\u5B8C\u6210\uFF1A{count} \u4E2A\u5206\u652F\u6709\u65B0\u63D0\u4EA4",
    "sidebar.fetchSuccessNoUpdates": "\u83B7\u53D6\u5B8C\u6210\uFF1A\u5DF2\u662F\u6700\u65B0",
    "settings.groupView": "\u89C6\u56FE",
    "settings.groupGraph": "\u56FE",
    "settings.showBranchLabels": "\u663E\u793A\u5206\u652F\u6807\u7B7E",
    "settings.showTagNames": "\u6807\u7B7E\u540D\u79F0",
    "settings.compactReferences": "\u7D27\u51D1\u5F15\u7528\u89C6\u56FE",
    "settings.preferCommitDate": "\u63D0\u4EA4\u65F6\u95F4\u6233",
    "settings.referencesOnLeft": "\u5F15\u7528\u663E\u793A\u5728\u5DE6\u4FA7",
    "settings.showLongEdges": "\u957F\u8FB9",
    "commit.copied": "\u5DF2\u590D\u5236\u5230\u526A\u8D34\u677F",
    "commit.copyFailed": "\u590D\u5236\u5931\u8D25",
    "commit.cherryPickNoSelection": "\u8BF7\u5148\u9009\u62E9\u63D0\u4EA4",
    "commit.cherryPickDoneMulti": "\u5DF2 Cherry-pick {n} \u4E2A\u63D0\u4EA4",
    "commit.cherryPickDone": "\u5DF2 Cherry-pick {hash}",
    "commit.cherryPickFailed": "Cherry-pick \u5931\u8D25",
    "commit.cherryPickConflict": "Cherry-pick \u53D1\u751F\u51B2\u7A81\uFF0C\u8BF7\u89E3\u51B3\u540E\u7EE7\u7EED\u6216\u4E2D\u6B62",
    "batch.cherryPickDone": "\u5DF2 Cherry-pick {n} \u4E2A\u63D0\u4EA4",
    "commit.uncommit": "\u64A4\u9500\u63D0\u4EA4",
    "commit.uncommitDone": "\u5DF2\u64A4\u9500\u63D0\u4EA4 {hash}",
    "commit.uncommitFailed": "\u64A4\u9500\u63D0\u4EA4\u5931\u8D25",
    "commit.reword": "\u7F16\u8F91\u63D0\u4EA4\u4FE1\u606F",
    "commit.rewordTitle": "\u7F16\u8F91\u63D0\u4EA4\u4FE1\u606F",
    "commit.rewordEmpty": "\u63D0\u4EA4\u4FE1\u606F\u4E0D\u80FD\u4E3A\u7A7A",
    "commit.rewordDone": "\u63D0\u4EA4\u4FE1\u606F\u5DF2\u66F4\u65B0",
    "commit.dropCommit": "\u5220\u9664\u63D0\u4EA4",
    "commit.dropConfirm": "\u786E\u5B9A\u5220\u9664\u63D0\u4EA4 {hash}\uFF1F\u5386\u53F2\u5C06\u88AB\u6539\u5199\u3002",
    "commit.dropDone": "\u5DF2\u5220\u9664\u63D0\u4EA4 {hash}",
    "commit.dropFailed": "\u5220\u9664\u63D0\u4EA4\u5931\u8D25",
    "commit.pushUpTo": "\u63A8\u9001\u6B64\u524D\u6240\u6709\u63D0\u4EA4",
    "commit.pushUpToDone": "\u5DF2\u63A8\u9001 {ref}",
    "commit.pushUpToRejected": "\u63A8\u9001\u88AB\u62D2\u7EDD\uFF0C\u8BF7\u5148\u62C9\u53D6",
    "commit.pushUpToFailed": "\u63A8\u9001\u5931\u8D25",
    "commit.pushNoBranch": "\u6CA1\u6709\u5305\u542B\u8BE5\u63D0\u4EA4\u7684\u5206\u652F",
    "commit.dirtyWorkingTree": "\u5DE5\u4F5C\u533A\u6709\u672A\u63D0\u4EA4\u7684\u6539\u52A8\uFF0C\u8BF7\u5148\u63D0\u4EA4\u6216\u6682\u5B58\u540E\u518D\u64CD\u4F5C",
    "commit.revertDone": "\u5DF2\u56DE\u6EDA\u63D0\u4EA4 {hash}",
    "commit.revertFailed": "\u56DE\u6EDA\u63D0\u4EA4\u5931\u8D25",
    "commit.revertConflict": "\u56DE\u6EDA\u53D1\u751F\u51B2\u7A81\uFF0C\u8BF7\u89E3\u51B3\u540E\u7EE7\u7EED\u6216\u4E2D\u6B62",
    "op.failed": "\u64CD\u4F5C\u5931\u8D25",
    "op.conflict": "\u5B58\u5728\u5408\u5E76\u51B2\u7A81",
    "op.authFailed": "\u8BA4\u8BC1\u5931\u8D25",
    "op.unreachable": "\u65E0\u6CD5\u8FDE\u63A5\u8FDC\u7A0B\u4ED3\u5E93",
    "op.rejected": "\u63A8\u9001\u88AB\u62D2\u7EDD\uFF0C\u8BF7\u5148\u62C9\u53D6",
    "op.checkoutDone": "\u5DF2\u7B7E\u51FA {name}",
    "op.mergeDone": "\u5DF2\u5408\u5E76 {name}",
    "op.rebaseDone": "\u5DF2\u53D8\u57FA\u5230 {name}",
    "op.pullDone": "\u5DF2\u62C9\u53D6",
    "op.pushDone": "\u5DF2\u63A8\u9001",
    "op.deleteDone": "\u5DF2\u5220\u9664\u5206\u652F {name}",
    "worktree.refresh": "\u5237\u65B0",
    "worktree.add": "\u65B0\u5EFA Worktree",
    "worktree.prune": "\u6E05\u7406\u5931\u6548\u9879",
    "worktree.empty": "\u6CA1\u6709 worktree",
    "worktree.main": "\u4E3B\u5DE5\u4F5C\u533A",
    "worktree.remove": "\u79FB\u9664",
    "worktree.removeConfirm": "\u786E\u5B9A\u79FB\u9664 worktree {path}\uFF1F",
    "worktree.forceConfirm": "\u8BE5 worktree \u6709\u672A\u63D0\u4EA4\u6539\u52A8\uFF0C\u662F\u5426\u5F3A\u5236\u79FB\u9664\uFF1F",
    "worktree.loadFailed": "\u52A0\u8F7D worktree \u5931\u8D25",
    "worktree.addPathPrompt": "\u65B0 worktree \u7684\u76EE\u6807\u8DEF\u5F84\uFF1A",
    "worktree.addBranchPrompt": "\u65B0\u5206\u652F\u540D\uFF08\u57FA\u4E8E {base}\uFF09\uFF1A",
    "worktree.addFailed": "\u521B\u5EFA worktree \u5931\u8D25",
    "batch.revertDone": "\u5DF2\u56DE\u6EDA {n} \u4E2A\u63D0\u4EA4",
    "op.newBranchDone": "\u5DF2\u521B\u5EFA\u5206\u652F {name}",
    "op.newBranchFailed": "\u521B\u5EFA\u5206\u652F\u5931\u8D25",
    "worktree.refreshed": "worktree \u5217\u8868\u5DF2\u5237\u65B0",
    "worktree.pruneDone": "\u5DF2\u6E05\u7406 {n} \u4E2A\u5931\u6548 worktree",
    "worktree.pruneNothing": "\u6CA1\u6709\u9700\u8981\u6E05\u7406\u7684\u5931\u6548 worktree",
    "worktree.pruneFailed": "\u6E05\u7406\u5931\u8D25",
    "worktree.removed": "\u5DF2\u79FB\u9664 worktree",
    "worktree.added": "\u5DF2\u521B\u5EFA worktree\uFF1A{path}",
    "op.branchDirtyWorkingTree": "\u8BF7\u5148\u63D0\u4EA4\u6216\u6682\u5B58\u6539\u52A8",
    "op.branchExists": "\u5206\u652F\u5DF2\u5B58\u5728",
    "op.branchInvalidName": "\u5206\u652F\u540D\u4E0D\u5408\u6CD5",
    "op.branchCreateGeneric": "\u8BE6\u60C5\u89C1\u63A7\u5236\u53F0",
    "console.commandCount": "\u6761 git \u547D\u4EE4",
    "console.clear": "\u6E05\u7A7A",
    "console.noCommands": "\u6682\u65E0 git \u547D\u4EE4",
    "console.selectCommand": "\u9009\u62E9\u4E00\u6761\u547D\u4EE4\u67E5\u770B\u8F93\u51FA",
    "console.noOutput": "\uFF08\u65E0\u8F93\u51FA\uFF09",
    "console.loadFailed": "\u8BFB\u53D6\u547D\u4EE4\u65E5\u5FD7\u5931\u8D25",
    "op.resetFailed": "\u91CD\u7F6E\u5931\u8D25",
    "branch.favoriteSaveFailed": "\u4FDD\u5B58\u6536\u85CF\u5931\u8D25",
    "dialog.renameFailed": "\u91CD\u547D\u540D\u5206\u652F\u5931\u8D25",
    "dialog.createBranchFailed": "\u521B\u5EFA\u5206\u652F\u5931\u8D25",
    "branch.loadFailed": "\u52A0\u8F7D\u5206\u652F\u5931\u8D25",
    "commit.loadDetailFailed": "\u52A0\u8F7D\u63D0\u4EA4\u8BE6\u60C5\u5931\u8D25",
    "commit.loadListFailed": "\u52A0\u8F7D\u63D0\u4EA4\u5217\u8868\u5931\u8D25",
    "worktree.removeFailed": "\u79FB\u9664 worktree \u5931\u8D25"
  };
  var zhTW = {
    "branch.checkout": "\u7C3D\u51FA\u5206\u652F",
    "branch.rename": "\u91CD\u65B0\u547D\u540D\u5206\u652F",
    "branch.merge": "\u5408\u4F75\u5230\u76EE\u524D\u5206\u652F",
    "branch.rebase": "Rebase \u5230\u6B64\u5206\u652F",
    "branch.pull": "\u62C9\u53D6",
    "branch.push": "\u63A8\u9001",
    "branch.favorite": "\u52A0\u5165\u6536\u85CF",
    "branch.unfavorite": "\u53D6\u6D88\u6536\u85CF",
    "branch.delete": "\u522A\u9664\u5206\u652F",
    // 未合并强制删除对话框 + 删除通知（对齐 IDEA GitDeleteBranchOperation）
    "branch.forceDelete": "\u5206\u652F {name} \u5C1A\u672A\u5408\u4F75\u5230\u76EE\u524D\u5206\u652F\uFF0C\u5F37\u5236\u522A\u9664\u5C07\u907A\u5931\u5176\u4E0A\u7684\u63D0\u4EA4\u3002",
    "branch.forceDeleteButton": "\u5F37\u5236\u522A\u9664",
    "branch.notFound": "\u5206\u652F {name} \u4E0D\u5B58\u5728",
    "branch.deleteFailed": "\u522A\u9664\u5206\u652F\u5931\u6557",
    "sidebar.deleteBranch": "\u522A\u9664\u5206\u652F",
    "branch.batchDeleteDone": "\u5DF2\u522A\u9664 {n} \u500B\u5206\u652F",
    "branch.batchDeletePartial": "\u5DF2\u522A\u9664 {ok} \u500B\u5206\u652F\uFF0C\u5931\u6557\uFF1A{failed}",
    "branch.selectBranch": "\u8ACB\u5148\u9078\u64C7\u5206\u652F",
    "branch.deleteCurrent": "\u76EE\u524D\u5206\u652F\u4E0D\u80FD\u522A\u9664",
    "branch.title": "\u5206\u652F",
    "branch.searchPlaceholder": "\u5206\u652F\u6216\u6A19\u7C64",
    "branch.notifyDeleted": "\u5DF2\u522A\u9664\u7684\u5206\u652F: {name}",
    "branch.restore": "\u9084\u539F",
    "branch.deleteTracking": "\u522A\u9664\u8FFD\u8E64\u7684\u5206\u652F",
    "branch.restoreSuccess": "\u5206\u652F {name} \u5DF2\u9084\u539F",
    "branch.restoreFailed": "\u9084\u539F\u5206\u652F\u5931\u6557",
    "branch.deleteTrackingFailed": "\u522A\u9664\u8FFD\u8E64\u7684\u5206\u652F\u5931\u6557",
    "commit.copyRevision": "\u8907\u88FD\u63D0\u4EA4\u96DC\u6E4A",
    "commit.cherryPick": "Cherry-pick",
    "commit.compareLocal": "\u8207\u672C\u6A5F\u6BD4\u8F03",
    "commit.reset": "\u5C07\u76EE\u524D\u5206\u652F\u91CD\u8A2D\u5230\u6B64\u8655",
    "commit.revert": "\u9084\u539F\u63D0\u4EA4",
    "commit.newBranch": "\u65B0\u5EFA\u5206\u652F",
    "commit.newTag": "\u65B0\u5EFA\u6A19\u7C64",
    "batch.selected": "\u5DF2\u9078\u53D6 {n} \u500B\u63D0\u4EA4",
    "batch.copyHashes": "\u8907\u88FD\u96DC\u6E4A\u6E05\u55AE",
    "batch.cherryPickAll": "\u5168\u90E8 Cherry-pick ({n})",
    "batch.revertAll": "\u5168\u90E8\u9084\u539F ({n})",
    "batch.confirmCherryPick": "\u78BA\u5B9A\u5C0D {n} \u500B\u9078\u53D6\u63D0\u4EA4\u57F7\u884C Cherry-pick \u55CE\uFF1F",
    "batch.confirmRevert": "\u78BA\u5B9A\u5C0D {n} \u500B\u9078\u53D6\u63D0\u4EA4\u57F7\u884C\u9084\u539F\u55CE\uFF1F",
    "file.showDiff": "\u986F\u793A\u5DEE\u7570",
    "file.showDiffNew": "\u5728\u65B0\u8996\u7A97\u986F\u793A\u5DEE\u7570",
    "file.compareLocal": "\u8207\u672C\u6A5F\u6BD4\u8F03",
    "file.compareBeforeLocal": "\u6BD4\u8F03\u8B8A\u66F4\u524D\u8207\u672C\u6A5F",
    "file.editSource": "\u7DE8\u8F2F\u539F\u59CB\u6A94",
    "file.openRepoVersion": "\u958B\u555F\u5132\u5B58\u5EAB\u7248\u672C",
    "file.revertChanges": "\u9084\u539F\u9078\u53D6\u7684\u8B8A\u66F4",
    "file.cherryPickChanges": "\u6458\u53D6\u9078\u53D6\u7684\u8B8A\u66F4",
    "file.createPatch": "\u5EFA\u7ACB\u88DC\u4E01",
    "file.getFromRevision": "\u5F9E\u7248\u672C\u53D6\u5F97",
    "file.historyUpTo": "\u81F3\u6B64\u7684\u6B77\u53F2",
    // 侧边栏图标 / 显示设置 / 跳转 / 排序
    "sidebar.hideBranches": "\u96B1\u85CF Git \u5206\u652F",
    "sidebar.showBranches": "\u986F\u793A Git \u5206\u652F",
    "sidebar.newBranch": "\u65B0\u5EFA\u5206\u652F",
    "sidebar.refresh": "\u91CD\u65B0\u6574\u7406",
    "sidebar.update": "\u66F4\u65B0",
    "sidebar.checkout": "\u7C3D\u51FA",
    "sidebar.merge": "\u5408\u4F75",
    "sidebar.search": "\u641C\u5C0B",
    "sidebar.favorite": "\u6536\u85CF",
    "sidebar.settings": "\u8A2D\u5B9A",
    "sidebar.pull": "\u62C9\u53D6",
    "sidebar.expandAll": "\u5168\u90E8\u5C55\u958B",
    "sidebar.sort": "\u6392\u5E8F",
    "sidebar.close": "\u95DC\u9589",
    "sidebar.noSelectedBranch": "\u672A\u9078\u53D6\u5206\u652F",
    "settings.title": "\u986F\u793A\u8A2D\u5B9A",
    "settings.showAuthor": "\u986F\u793A\u4F5C\u8005\u6B04",
    "settings.showDate": "\u986F\u793A\u65E5\u671F\u6B04",
    "settings.showHash": "\u986F\u793A\u96DC\u6E4A\u6B04",
    "goto.title": "\u8DF3\u81F3\u53C3\u7167",
    "goto.placeholder": "\u8F38\u5165\u96DC\u6E4A\u6216\u5206\u652F\u540D\u7A31",
    "goto.notFound": "\u627E\u4E0D\u5230\u7B26\u5408\u9805\u76EE",
    "goto.ok": "\u8DF3\u81F3",
    "sort.dateAsc": "\u6392\u5E8F: \u65E5\u671F\u905E\u589E",
    "sort.authorAsc": "\u6392\u5E8F: \u4F5C\u8005",
    "sort.messageAsc": "\u6392\u5E8F: \u8A0A\u606F",
    // 工具栏过滤（分支 / 用户 / 日期 / 路径）
    "filter.branch": "\u5206\u652F",
    "filter.user": "\u4F7F\u7528\u8005",
    "filter.date": "\u65E5\u671F",
    "filter.path": "\u8DEF\u5F91",
    "filter.selectAll": "\u5168\u9078",
    "filter.regex": "\u6B63\u5247\u8868\u9054\u5F0F",
    "filter.case": "\u5340\u5206\u5927\u5C0F\u5BEB",
    "filter.all": "\u5168\u90E8",
    "filter.localBranches": "\u672C\u6A5F\u5206\u652F",
    "filter.remoteBranches": "\u9060\u7AEF\u5206\u652F",
    "filter.favorites": "\u6536\u85CF",
    "filter.today": "\u4ECA\u5929",
    "filter.thisWeek": "\u672C\u9031",
    "filter.thisMonth": "\u672C\u6708",
    "filter.thisYear": "\u4ECA\u5E74",
    "filter.custom": "\u81EA\u8A02\u2026",
    "filter.dateFrom": "\u958B\u59CB\u65E5\u671F",
    "filter.dateTo": "\u7D50\u675F\u65E5\u671F",
    "filter.chooseFolder": "\u9078\u64C7\u8CC7\u6599\u593E\u2026",
    "filter.ok": "\u78BA\u5B9A",
    "filter.cancel": "\u53D6\u6D88",
    "filter.clear": "\u6E05\u9664",
    // 路径过滤（多选）
    "filter.selectPaths": "\u9078\u64C7\u8981\u904E\u6FFE\u7684\u8DEF\u5F91",
    "filter.editPaths": "\u7DE8\u8F2F\u8DEF\u5F91\u2026",
    "filter.maxPaths": "\u6700\u591A\u53EF\u9078 100 \u9805",
    "filter.noPaths": "\u7121\u53EF\u9078\u8DEF\u5F91",
    "filter.loadPathsFailed": "\u8F09\u5165\u8DEF\u5F91\u5931\u6557",
    "dialog.renameBranch": "\u91CD\u65B0\u547D\u540D\u5206\u652F",
    "dialog.branchName": "\u5206\u652F\u540D\u7A31",
    "dialog.startPoint": "\u8D77\u9EDE",
    "dialog.currentHead": "\u76EE\u524D HEAD",
    "dialog.inputBranchName": "\u8F38\u5165\u5206\u652F\u540D\u7A31\u2026",
    "dialog.checkoutAfterCreate": "\u5EFA\u7ACB\u5F8C\u6AA2\u51FA\u8A72\u5206\u652F",
    "dialog.create": "\u5EFA\u7ACB",
    "dialog.dateFilter": "\u4F9D\u65E5\u671F\u7BE9\u9078",
    "dialog.startDate": "\u958B\u59CB\u65E5\u671F",
    "dialog.endDate": "\u7D50\u675F\u65E5\u671F",
    "dialog.clear": "\u6E05\u9664",
    "dialog.resetTo": "\u5C07\u5206\u652F\u91CD\u8A2D\u81F3 {hash}",
    "dialog.selectResetMode": "\u9078\u64C7\u91CD\u8A2D\u6A21\u5F0F\uFF1A",
    "dialog.resetSoft": "Soft - \u50C5\u79FB\u52D5 HEAD",
    "dialog.resetMixed": "Mixed - \u79FB\u52D5 HEAD + \u91CD\u8A2D\u7D22\u5F15\uFF08\u9810\u8A2D\uFF09",
    "dialog.resetHard": "Hard - \u79FB\u52D5 HEAD + \u91CD\u8A2D\u7D22\u5F15 + \u91CD\u8A2D\u5DE5\u4F5C\u6A39",
    "dialog.reset": "\u91CD\u8A2D",
    "dialog.branchFromCommit": "\u5F9E\u63D0\u4EA4\u5EFA\u7ACB\u5206\u652F",
    "dialog.basedOn": "\u4F9D\u64DA\uFF1A{info}",
    "commit.searchPlaceholder": "\u6587\u5B57\u6216\u96DC\u6E4A",
    "branch.groupHead": "HEAD(\u76EE\u524D\u5206\u652F)",
    "branch.groupLocal": "\u672C\u6A5F",
    "branch.groupRemote": "\u9060\u7AEF",
    "file.noDiff": "\u7121\u5DEE\u7570\u5167\u5BB9",
    "file.changedFiles": "\u8B8A\u66F4\u6A94\u6848",
    "detail.title": "\u63D0\u4EA4\u8A73\u7D30\u8CC7\u6599",
    "detail.hash": "\u96DC\u6E4A",
    "detail.author": "\u4F5C\u8005",
    "detail.date": "\u65E5\u671F",
    "main.loadingTitle": "\u7B49\u5F85\u521D\u59CB\u5316\u2026",
    "main.loadingBody": "\u6B63\u5728\u8F09\u5165\u5C08\u6848\u8CC7\u8A0A\u3002",
    "main.notGitTitle": "\u975E Git \u5132\u5B58\u5EAB",
    "main.notGitBody": "\u76EE\u524D\u76EE\u9304\u4E0D\u662F Git \u5132\u5B58\u5EAB\u3002",
    "time.justNow": "\u525B\u525B",
    "time.minutesAgo": "{n}\u5206\u9418\u524D",
    "time.hoursAgo": "{n}\u5C0F\u6642\u524D",
    "time.daysAgo": "{n}\u5929\u524D",
    "commit.empty": "\u66AB\u7121\u63D0\u4EA4\u8A18\u9304",
    "commit.noSelection": "\u9078\u64C7\u8981\u67E5\u770B\u8B8A\u66F4\u7684\u63D0\u4EA4",
    "file.selectDiff": "\u9078\u64C7\u6A94\u6848\u67E5\u770B\u5DEE\u7570",
    "file.noChanges": "\u66AB\u7121\u8B8A\u66F4\u6A94\u6848",
    "layout.resizeDivider": "\u62D6\u66F3\u8ABF\u6574\u5927\u5C0F",
    "main.tabConsole": "\u4E3B\u63A7\u53F0",
    "reset.title": "\u5C07\u76EE\u524D\u5206\u652F\u91CD\u8A2D\u81F3\u6B64\u63D0\u4EA4",
    "reset.softDesc": "\u4FDD\u7559\u5DE5\u4F5C\u5340\u548C\u66AB\u5B58\u5340",
    "reset.mixedDesc": "\u4FDD\u7559\u5DE5\u4F5C\u5340\uFF0C\u91CD\u8A2D\u66AB\u5B58\u5340",
    "reset.hardDesc": "\u6368\u68C4\u6240\u6709\u8B8A\u66F4",
    "dialog.createBranchTitle": "\u65B0\u5EFA\u5206\u652F",
    "dialog.pathPlaceholder": "src/ \u6216 packages/core",
    "dialog.cancel": "\u53D6\u6D88",
    "dialog.ok": "\u78BA\u5B9A",
    "filter.selectAllToggle": "\u5168\u9078/\u53D6\u6D88\u5168\u9078\u76EE\u524D\u6E05\u55AE",
    "sidebar.compareBranch": "\u8207\u76EE\u524D\u5206\u652F\u6BD4\u8F03",
    "compare.title": "\u6BD4\u8F03 {branch} \u8207 {current}",
    "compare.branchOnly": "{branch} \u7368\u6709\u7684\u63D0\u4EA4",
    "compare.currentOnly": "{current} \u7368\u6709\u7684\u63D0\u4EA4",
    "compare.empty": "\u7121\u63D0\u4EA4",
    "compare.loading": "\u8F09\u5165\u4E2D\u2026",
    "compare.loadFailed": "\u5206\u652F\u6BD4\u8F03\u5931\u6557",
    "compare.selectBranch": "\u8ACB\u5148\u9078\u64C7\u8981\u6BD4\u8F03\u7684\u5206\u652F",
    "compare.currentBranch": "\u76EE\u524D\u5206\u652F\u7121\u6CD5\u8207\u81EA\u5DF1\u6BD4\u8F03",
    "compare.noCurrentBranch": "\u76EE\u524D\u5206\u652F\u5C1A\u672A\u8F09\u5165\u5B8C\u6210\uFF0C\u8ACB\u7A0D\u5F8C\u91CD\u8A66",
    "compare.with": "\u8207",
    "compare.identical": "\u5169\u500B\u5206\u652F\u6C92\u6709\u5DEE\u7570",
    "compare.sameBranch": "\u8ACB\u9078\u64C7\u5169\u500B\u4E0D\u540C\u7684\u5206\u652F",
    "compare.tooMany": "\u6700\u591A\u9078\u64C7\u5169\u500B\u5206\u652F\u9032\u884C\u6BD4\u8F03",
    "sidebar.showMyBranches": "\u53EA\u986F\u793A\u6211\u7684\u5206\u652F",
    "sidebar.myBranchesFailed": "\u8F09\u5165\u6211\u7684\u5206\u652F\u5931\u6557",
    "sidebar.showMyBranchesOn": "\u6B63\u5728\u53EA\u986F\u793A\u6211\u7684\u5206\u652F",
    "sidebar.myBranchesUnavailable": "\u6C92\u6709\u53EF\u7BE9\u9078\u7684\u672C\u6A5F\u5206\u652F",
    "sidebar.newBranchUnavailable": "\u6C92\u6709\u53EF\u4F9D\u64DA\u7684\u5206\u652F",
    "sidebar.updateUnavailable": "\u672A\u8A2D\u5B9A\u9060\u7AEF\u5132\u5B58\u5EAB",
    "sidebar.deleteRemoteUnavailable": "\u4E0D\u80FD\u5728\u6B64\u522A\u9664\u9060\u7AEF\u5206\u652F",
    "sidebar.expandAllUnavailable": "\u6C92\u6709\u53EF\u5C55\u958B\u7684\u5206\u652F",
    "sidebar.pullUnavailable": "\u672A\u8A2D\u5B9A\u9060\u7AEF\u5132\u5B58\u5EAB",
    "sidebar.fetch": "\u53D6\u5F97\u9060\u7AEF\u66F4\u65B0",
    "sidebar.locate": "\u5728 Git \u65E5\u8A8C\u4E2D\u5B9A\u4F4D",
    "sidebar.collapseAll": "\u5168\u90E8\u6536\u5408",
    "sidebar.locateNotInView": "{branch} \u7684\u6700\u65B0\u63D0\u4EA4\u4E0D\u5728\u76EE\u524D\u6E05\u55AE\u4E2D",
    "sidebar.fetchAuthFailed": "\u9A57\u8B49\u5931\u6557",
    "sidebar.fetchUnreachable": "\u7121\u6CD5\u9023\u7DDA\u9060\u7AEF\u5132\u5B58\u5EAB",
    "sidebar.fetchNoRemote": "\u9060\u7AEF\u5132\u5B58\u5EAB\u4E0D\u5B58\u5728",
    "sidebar.fetchFailed": "\u53D6\u5F97\u9060\u7AEF\u66F4\u65B0\u5931\u6557",
    "sidebar.fetchInProgress": "\u6B63\u5728\u53D6\u5F97\u9060\u7AEF\u66F4\u65B0\u2026",
    "sidebar.fetchSuccessUpdates": "\u53D6\u5F97\u5B8C\u6210\uFF1A{count} \u500B\u5206\u652F\u6709\u65B0\u63D0\u4EA4",
    "sidebar.fetchSuccessNoUpdates": "\u53D6\u5F97\u5B8C\u6210\uFF1A\u5DF2\u662F\u6700\u65B0",
    "settings.groupView": "\u6AA2\u8996",
    "settings.groupGraph": "\u5716",
    "settings.showBranchLabels": "\u986F\u793A\u5206\u652F\u6A19\u7C64",
    "settings.showTagNames": "\u6A19\u7C64\u540D\u7A31",
    "settings.compactReferences": "\u7CBE\u7C21\u5F15\u7528\u6AA2\u8996",
    "settings.preferCommitDate": "\u63D0\u4EA4\u6642\u9593\u6233",
    "settings.referencesOnLeft": "\u5F15\u7528\u986F\u793A\u5728\u5DE6\u5074",
    "settings.showLongEdges": "\u9577\u908A",
    "commit.copied": "\u5DF2\u8907\u88FD\u5230\u526A\u8CBC\u7C3F",
    "commit.copyFailed": "\u8907\u88FD\u5931\u6557",
    "commit.cherryPickNoSelection": "\u8ACB\u5148\u9078\u64C7\u63D0\u4EA4",
    "commit.cherryPickDoneMulti": "\u5DF2 Cherry-pick {n} \u500B\u63D0\u4EA4",
    "commit.cherryPickDone": "\u5DF2 Cherry-pick {hash}",
    "commit.cherryPickFailed": "Cherry-pick \u5931\u6557",
    "commit.cherryPickConflict": "Cherry-pick \u767C\u751F\u885D\u7A81\uFF0C\u8ACB\u89E3\u6C7A\u5F8C\u7E7C\u7E8C\u6216\u4E2D\u6B62",
    "batch.cherryPickDone": "\u5DF2 Cherry-pick {n} \u500B\u63D0\u4EA4",
    "commit.uncommit": "\u5FA9\u539F\u63D0\u4EA4",
    "commit.uncommitDone": "\u5DF2\u5FA9\u539F\u63D0\u4EA4 {hash}",
    "commit.uncommitFailed": "\u5FA9\u539F\u63D0\u4EA4\u5931\u6557",
    "commit.reword": "\u7DE8\u8F2F\u63D0\u4EA4\u8A0A\u606F",
    "commit.rewordTitle": "\u7DE8\u8F2F\u63D0\u4EA4\u8A0A\u606F",
    "commit.rewordEmpty": "\u63D0\u4EA4\u8A0A\u606F\u4E0D\u80FD\u70BA\u7A7A",
    "commit.rewordDone": "\u63D0\u4EA4\u8A0A\u606F\u5DF2\u66F4\u65B0",
    "commit.dropCommit": "\u522A\u9664\u63D0\u4EA4",
    "commit.dropConfirm": "\u78BA\u5B9A\u522A\u9664\u63D0\u4EA4 {hash}\uFF1F\u6B77\u53F2\u5C07\u88AB\u6539\u5BEB\u3002",
    "commit.dropDone": "\u5DF2\u522A\u9664\u63D0\u4EA4 {hash}",
    "commit.dropFailed": "\u522A\u9664\u63D0\u4EA4\u5931\u6557",
    "commit.pushUpTo": "\u63A8\u9001\u6B64\u524D\u6240\u6709\u63D0\u4EA4",
    "commit.pushUpToDone": "\u5DF2\u63A8\u9001 {ref}",
    "commit.pushUpToRejected": "\u63A8\u9001\u88AB\u62D2\u7D55\uFF0C\u8ACB\u5148\u62C9\u53D6",
    "commit.pushUpToFailed": "\u63A8\u9001\u5931\u6557",
    "commit.pushNoBranch": "\u6C92\u6709\u5305\u542B\u8A72\u63D0\u4EA4\u7684\u5206\u652F",
    "commit.dirtyWorkingTree": "\u5DE5\u4F5C\u5340\u6709\u672A\u63D0\u4EA4\u7684\u8B8A\u66F4\uFF0C\u8ACB\u5148\u63D0\u4EA4\u6216\u66AB\u5B58\u5F8C\u518D\u64CD\u4F5C",
    "commit.revertDone": "\u5DF2\u56DE\u6EFE\u63D0\u4EA4 {hash}",
    "commit.revertFailed": "\u56DE\u6EFE\u63D0\u4EA4\u5931\u6557",
    "commit.revertConflict": "\u56DE\u6EFE\u767C\u751F\u885D\u7A81\uFF0C\u8ACB\u89E3\u6C7A\u5F8C\u7E7C\u7E8C\u6216\u4E2D\u6B62",
    "op.failed": "\u64CD\u4F5C\u5931\u6557",
    "op.conflict": "\u5B58\u5728\u5408\u4F75\u885D\u7A81",
    "op.authFailed": "\u9A57\u8B49\u5931\u6557",
    "op.unreachable": "\u7121\u6CD5\u9023\u7DDA\u9060\u7AEF\u5132\u5B58\u5EAB",
    "op.rejected": "\u63A8\u9001\u88AB\u62D2\u7D55\uFF0C\u8ACB\u5148\u62C9\u53D6",
    "op.checkoutDone": "\u5DF2\u7C3D\u51FA {name}",
    "op.mergeDone": "\u5DF2\u5408\u4F75 {name}",
    "op.rebaseDone": "\u5DF2\u8B8A\u57FA\u5230 {name}",
    "op.pullDone": "\u5DF2\u62C9\u53D6",
    "op.pushDone": "\u5DF2\u63A8\u9001",
    "op.deleteDone": "\u5DF2\u522A\u9664\u5206\u652F {name}",
    "worktree.refresh": "\u91CD\u65B0\u6574\u7406",
    "worktree.add": "\u65B0\u589E Worktree",
    "worktree.prune": "\u6E05\u7406\u5931\u6548\u9805",
    "worktree.empty": "\u6C92\u6709 worktree",
    "worktree.main": "\u4E3B\u5DE5\u4F5C\u5340",
    "worktree.remove": "\u79FB\u9664",
    "worktree.removeConfirm": "\u78BA\u5B9A\u79FB\u9664 worktree {path}\uFF1F",
    "worktree.forceConfirm": "\u8A72 worktree \u6709\u672A\u63D0\u4EA4\u8B8A\u66F4\uFF0C\u662F\u5426\u5F37\u5236\u79FB\u9664\uFF1F",
    "worktree.loadFailed": "\u8F09\u5165 worktree \u5931\u6557",
    "worktree.addPathPrompt": "\u65B0 worktree \u7684\u76EE\u6A19\u8DEF\u5F91\uFF1A",
    "worktree.addBranchPrompt": "\u65B0\u5206\u652F\u540D\u7A31\uFF08\u57FA\u65BC {base}\uFF09\uFF1A",
    "worktree.addFailed": "\u5EFA\u7ACB worktree \u5931\u6557",
    "batch.revertDone": "\u5DF2\u56DE\u6EFE {n} \u500B\u63D0\u4EA4",
    "op.newBranchDone": "\u5DF2\u5EFA\u7ACB\u5206\u652F {name}",
    "op.newBranchFailed": "\u5EFA\u7ACB\u5206\u652F\u5931\u6557",
    "worktree.refreshed": "worktree \u6E05\u55AE\u5DF2\u91CD\u65B0\u6574\u7406",
    "worktree.pruneDone": "\u5DF2\u6E05\u7406 {n} \u500B\u5931\u6548 worktree",
    "worktree.pruneNothing": "\u6C92\u6709\u9700\u8981\u6E05\u7406\u7684\u5931\u6548 worktree",
    "worktree.pruneFailed": "\u6E05\u7406\u5931\u6557",
    "worktree.removed": "\u5DF2\u79FB\u9664 worktree",
    "worktree.added": "\u5DF2\u5EFA\u7ACB worktree\uFF1A{path}",
    "op.branchDirtyWorkingTree": "\u8ACB\u5148\u63D0\u4EA4\u6216\u66AB\u5B58\u8B8A\u66F4",
    "op.branchExists": "\u5206\u652F\u5DF2\u5B58\u5728",
    "op.branchInvalidName": "\u5206\u652F\u540D\u7A31\u4E0D\u5408\u6CD5",
    "op.branchCreateGeneric": "\u8A73\u60C5\u898B\u4E3B\u63A7\u53F0",
    "console.commandCount": "\u7B46 git \u547D\u4EE4",
    "console.clear": "\u6E05\u7A7A",
    "console.noCommands": "\u5C1A\u7121 git \u547D\u4EE4",
    "console.selectCommand": "\u9078\u64C7\u4E00\u7B46\u547D\u4EE4\u67E5\u770B\u8F38\u51FA",
    "console.noOutput": "\uFF08\u7121\u8F38\u51FA\uFF09",
    "console.loadFailed": "\u8B80\u53D6\u547D\u4EE4\u65E5\u8A8C\u5931\u6557",
    "op.resetFailed": "\u91CD\u8A2D\u5931\u6557",
    "branch.favoriteSaveFailed": "\u5132\u5B58\u6536\u85CF\u5931\u6557",
    "dialog.renameFailed": "\u91CD\u65B0\u547D\u540D\u5206\u652F\u5931\u6557",
    "dialog.createBranchFailed": "\u5EFA\u7ACB\u5206\u652F\u5931\u6557",
    "branch.loadFailed": "\u8F09\u5165\u5206\u652F\u5931\u6557",
    "commit.loadDetailFailed": "\u8F09\u5165\u63D0\u4EA4\u8A73\u60C5\u5931\u6557",
    "commit.loadListFailed": "\u8F09\u5165\u63D0\u4EA4\u6E05\u55AE\u5931\u6557",
    "worktree.removeFailed": "\u79FB\u9664 worktree \u5931\u6557"
  };
  var de = {
    "branch.checkout": "Branch auschecken",
    "branch.rename": "Branch umbenennen",
    "branch.merge": "In aktuelle Branch zusammenf\xFChren",
    "branch.rebase": "Hierher rebase",
    "branch.pull": "Pull",
    "branch.push": "Push",
    "branch.favorite": "Zu Favoriten hinzuf\xFCgen",
    "branch.unfavorite": "Aus Favoriten entfernen",
    "branch.delete": "Branch l\xF6schen",
    // 未合并强制删除对话框 + 删除通知（对齐 IDEA GitDeleteBranchOperation）
    "branch.forceDelete": "Der Branch {name} wurde nicht mit dem aktuellen Branch zusammengef\xFChrt. Ein erzwungenes L\xF6schen f\xFChrt zum Verlust der Commits.",
    "branch.forceDeleteButton": "Erzwungenes L\xF6schen",
    "branch.notFound": "Branch {name} existiert nicht",
    "branch.deleteFailed": "Branch konnte nicht gel\xF6scht werden",
    "sidebar.deleteBranch": "Branch l\xF6schen",
    "branch.batchDeleteDone": "{n} Branches gel\xF6scht",
    "branch.batchDeletePartial": "{ok} Branch(es) gel\xF6scht, fehlgeschlagen: {failed}",
    "branch.selectBranch": "Bitte zuerst einen Branch ausw\xE4hlen",
    "branch.deleteCurrent": "Den aktuellen Branch kann man nicht l\xF6schen",
    "branch.title": "Branches",
    "branch.searchPlaceholder": "Branch oder Tag",
    "branch.notifyDeleted": "Gel\xF6schter Branch: {name}",
    "branch.restore": "Wiederherstellen",
    "branch.deleteTracking": "Tracking-Branch l\xF6schen",
    "branch.restoreSuccess": "Branch {name} wiederhergestellt",
    "branch.restoreFailed": "Branch konnte nicht wiederhergestellt werden",
    "branch.deleteTrackingFailed": "Tracking-Branch konnte nicht gel\xF6scht werden",
    "commit.copyRevision": "Commit-Hash kopieren",
    "commit.cherryPick": "Cherry-pick",
    "commit.compareLocal": "Mit Lokal vergleichen",
    "commit.reset": "Aktuellen Branch hierher zur\xFCcksetzen",
    "commit.revert": "Commit umkehren",
    "commit.newBranch": "Neue Branch",
    "commit.newTag": "Neues Tag",
    "batch.selected": "{n} Commits ausgew\xE4hlt",
    "batch.copyHashes": "Hash-Liste kopieren",
    "batch.cherryPickAll": "Alle cherry-picken ({n})",
    "batch.revertAll": "Alle umkehren ({n})",
    "batch.confirmCherryPick": "{n} ausgew\xE4hlte Commits cherry-picken?",
    "batch.confirmRevert": "{n} ausgew\xE4hlte Commits umkehren?",
    "file.showDiff": "Diff anzeigen",
    "file.showDiffNew": "Diff in neuem Fenster anzeigen",
    "file.compareLocal": "Mit Lokal vergleichen",
    "file.compareBeforeLocal": "Vorher mit Lokal vergleichen",
    "file.editSource": "Quellcode bearbeiten",
    "file.openRepoVersion": "Repository-Version \xF6ffnen",
    "file.revertChanges": "Ausgew\xE4hlte \xC4nderungen zur\xFCcksetzen",
    "file.cherryPickChanges": "Ausgew\xE4hlte \xC4nderungen cherry-picken",
    "file.createPatch": "Patch erstellen",
    "file.getFromRevision": "Aus Revision laden",
    "file.historyUpTo": "Historie bis hierher",
    // 侧边栏图标 / 显示设置 / 跳转 / 排序
    "sidebar.hideBranches": "Git-Branches ausblenden",
    "sidebar.showBranches": "Git-Branches anzeigen",
    "sidebar.newBranch": "Neue Branch",
    "sidebar.refresh": "Aktualisieren",
    "sidebar.update": "Aktualisieren",
    "sidebar.checkout": "Auschecken",
    "sidebar.merge": "Zusammenf\xFChren",
    "sidebar.search": "Suchen",
    "sidebar.favorite": "Favorit",
    "sidebar.settings": "Einstellungen",
    "sidebar.pull": "Pull",
    "sidebar.expandAll": "Alle ausklappen",
    "sidebar.sort": "Sortieren",
    "sidebar.close": "Schlie\xDFen",
    "sidebar.noSelectedBranch": "Keine Branch ausgew\xE4hlt",
    "settings.title": "Anzeigeeinstellungen",
    "settings.showAuthor": "Autorspalte anzeigen",
    "settings.showDate": "Datenspalte anzeigen",
    "settings.showHash": "Hash-Spalte anzeigen",
    "goto.title": "Zu Referenz springen",
    "goto.placeholder": "Hash oder Branch-Namen eingeben",
    "goto.notFound": "Keine \xDCbereinstimmung gefunden",
    "goto.ok": "Springen",
    "sort.dateAsc": "Sortieren: Datum aufsteigend",
    "sort.authorAsc": "Sortieren: Autor",
    "sort.messageAsc": "Sortieren: Nachricht",
    // 工具栏过滤（分支 / 用户 / 日期 / 路径）
    "filter.branch": "Branch",
    "filter.user": "Benutzer",
    "filter.date": "Datum",
    "filter.path": "Pfad",
    "filter.selectAll": "Alle ausw\xE4hlen",
    "filter.regex": "Regul\xE4rer Ausdruck",
    "filter.case": "Gro\xDF-/Kleinschreibung",
    "filter.all": "Alle",
    "filter.localBranches": "Lokale Branches",
    "filter.remoteBranches": "Remote-Branches",
    "filter.favorites": "Favoriten",
    "filter.today": "Heute",
    "filter.thisWeek": "Diese Woche",
    "filter.thisMonth": "Dieser Monat",
    "filter.thisYear": "Dieses Jahr",
    "filter.custom": "Benutzerdefiniert\u2026",
    "filter.dateFrom": "Von Datum",
    "filter.dateTo": "Bis Datum",
    "filter.chooseFolder": "Ordner ausw\xE4hlen\u2026",
    "filter.ok": "OK",
    "filter.cancel": "Abbrechen",
    "filter.clear": "L\xF6schen",
    // 路径过滤（多选）
    "filter.selectPaths": "Pfade zum Filtern ausw\xE4hlen",
    "filter.editPaths": "Pfade bearbeiten\u2026",
    "filter.maxPaths": "H\xF6chstens 100 Pfade zul\xE4ssig",
    "filter.noPaths": "Keine ausw\xE4hlbaren Pfade",
    "filter.loadPathsFailed": "Pfade konnten nicht geladen werden",
    "dialog.renameBranch": "Branch umbenennen",
    "dialog.branchName": "Branch-Name",
    "dialog.startPoint": "Startpunkt",
    "dialog.currentHead": "Aktuelles HEAD",
    "dialog.inputBranchName": "Branch-Namen eingeben\u2026",
    "dialog.checkoutAfterCreate": "Nach dem Erstellen auschecken",
    "dialog.create": "Erstellen",
    "dialog.dateFilter": "Nach Datum filtern",
    "dialog.startDate": "Startdatum",
    "dialog.endDate": "Enddatum",
    "dialog.clear": "L\xF6schen",
    "dialog.resetTo": "Branch zur\xFCcksetzen auf {hash}",
    "dialog.selectResetMode": "Reset-Modus w\xE4hlen:",
    "dialog.resetSoft": "Soft - nur HEAD verschieben",
    "dialog.resetMixed": "Mixed - HEAD verschieben + Index zur\xFCcksetzen (Standard)",
    "dialog.resetHard": "Hard - HEAD verschieben + Index + Arbeitsbaum zur\xFCcksetzen",
    "dialog.reset": "Zur\xFCcksetzen",
    "dialog.branchFromCommit": "Branch aus Commit erstellen",
    "dialog.basedOn": "Basiert auf: {info}",
    "commit.searchPlaceholder": "Text oder Hash",
    "branch.groupHead": "HEAD (aktueller Branch)",
    "branch.groupLocal": "Lokal",
    "branch.groupRemote": "Remote",
    "file.noDiff": "Keine Unterschiede",
    "file.changedFiles": "Ge\xE4nderte Dateien",
    "detail.title": "Commit-Details",
    "detail.hash": "Hash",
    "detail.author": "Autor",
    "detail.date": "Datum",
    "main.loadingTitle": "Initialisierung\u2026",
    "main.loadingBody": "Projektinformationen werden geladen.",
    "main.notGitTitle": "Kein Git-Repository",
    "main.notGitBody": "Das aktuelle Verzeichnis ist kein Git-Repository.",
    "time.justNow": "gerade eben",
    "time.minutesAgo": "vor {n} Min.",
    "time.hoursAgo": "vor {n} Std.",
    "time.daysAgo": "vor {n} Tg.",
    "commit.empty": "Keine Commits",
    "commit.noSelection": "Commit ausw\xE4hlen, um \xC4nderungen zu sehen",
    "file.selectDiff": "Datei ausw\xE4hlen, um den Diff anzuzeigen",
    "file.noChanges": "Keine ge\xE4nderten Dateien",
    "layout.resizeDivider": "Zum \xC4ndern der Gr\xF6\xDFe ziehen",
    "main.tabConsole": "Konsole",
    "reset.title": "Aktuellen Branch hierher zur\xFCcksetzen",
    "reset.softDesc": "Arbeitsbaum und Index behalten",
    "reset.mixedDesc": "Arbeitsbaum behalten, Index zur\xFCcksetzen",
    "reset.hardDesc": "Alle \xC4nderungen verwerfen",
    "dialog.createBranchTitle": "Neue Branch",
    "dialog.pathPlaceholder": "src/ oder packages/core",
    "dialog.cancel": "Abbrechen",
    "dialog.ok": "OK",
    "filter.selectAllToggle": "Alle ausw\xE4hlen / abw\xE4hlen in der aktuellen Liste",
    "sidebar.compareBranch": "Mit aktuellem Branch vergleichen",
    "compare.title": "{branch} mit {current} vergleichen",
    "compare.branchOnly": "Nur in {branch}",
    "compare.currentOnly": "Nur in {current}",
    "compare.empty": "Keine Commits",
    "compare.loading": "Wird geladen\u2026",
    "compare.loadFailed": "Branch-Vergleich fehlgeschlagen",
    "compare.selectBranch": "Bitte zuerst einen Branch ausw\xE4hlen",
    "compare.currentBranch": "Der aktuelle Branch kann nicht mit sich selbst verglichen werden",
    "compare.noCurrentBranch": "Aktueller Branch noch nicht geladen, bitte erneut versuchen",
    "compare.with": "mit",
    "compare.identical": "Branches sind identisch",
    "compare.sameBranch": "Bitte zwei unterschiedliche Branches w\xE4hlen",
    "compare.tooMany": "H\xF6chstens zwei Branches zum Vergleichen ausw\xE4hlen",
    "sidebar.showMyBranches": "Nur meine Branches zeigen",
    "sidebar.myBranchesFailed": "Meine Branches konnten nicht geladen werden",
    "sidebar.showMyBranchesOn": "Es werden nur meine Branches angezeigt",
    "sidebar.myBranchesUnavailable": "Keine lokalen Branches zum Filtern",
    "sidebar.newBranchUnavailable": "Kein Branch zum Ableiten",
    "sidebar.updateUnavailable": "Kein Remote konfiguriert",
    "sidebar.deleteRemoteUnavailable": "Remote-Branches k\xF6nnen hier nicht gel\xF6scht werden",
    "sidebar.expandAllUnavailable": "Keine Branches zum Aufklappen",
    "sidebar.pullUnavailable": "Kein Remote konfiguriert",
    "sidebar.fetch": "Abrufen",
    "sidebar.locate": "Im Git-Log anzeigen",
    "sidebar.collapseAll": "Alle zuklappen",
    "sidebar.locateNotInView": "{branch}-Head ist nicht in der aktuellen Ansicht",
    "sidebar.fetchAuthFailed": "Authentifizierung fehlgeschlagen",
    "sidebar.fetchUnreachable": "Remote nicht erreichbar",
    "sidebar.fetchNoRemote": "Remote-Repository nicht gefunden",
    "sidebar.fetchFailed": "Abrufen fehlgeschlagen",
    "sidebar.fetchInProgress": "Wird abgerufen\u2026",
    "sidebar.fetchSuccessUpdates": "Abgerufen: {count} Branch(es) mit neuen Commits",
    "sidebar.fetchSuccessNoUpdates": "Abgerufen: bereits aktuell",
    "settings.groupView": "Ansicht",
    "settings.groupGraph": "Graph",
    "settings.showBranchLabels": "Branch-Beschriftungen anzeigen",
    "settings.showTagNames": "Tag-Namen",
    "settings.compactReferences": "Kompakte Referenzansicht",
    "settings.preferCommitDate": "Commit-Zeitstempel",
    "settings.referencesOnLeft": "Referenzen links",
    "settings.showLongEdges": "Lange Kanten",
    "commit.copied": "In die Zwischenablage kopiert",
    "commit.copyFailed": "Kopieren fehlgeschlagen",
    "commit.cherryPickNoSelection": "Bitte zuerst einen Commit ausw\xE4hlen",
    "commit.cherryPickDoneMulti": "{n} Commits gecherry-pickt",
    "commit.cherryPickDone": "{hash} gecherry-pickt",
    "commit.cherryPickFailed": "Cherry-Pick fehlgeschlagen",
    "commit.cherryPickConflict": "Cherry-Pick-Konflikt, bitte l\xF6sen und fortsetzen oder abbrechen",
    "batch.cherryPickDone": "{n} Commits gecherry-pickt",
    "commit.uncommit": "Commit r\xFCckg\xE4ngig machen",
    "commit.uncommitDone": "Commit {hash} r\xFCckg\xE4ngig gemacht",
    "commit.uncommitFailed": "Commit konnte nicht r\xFCckg\xE4ngig gemacht werden",
    "commit.reword": "Commit-Nachricht bearbeiten",
    "commit.rewordTitle": "Commit-Nachricht bearbeiten",
    "commit.rewordEmpty": "Commit-Nachricht darf nicht leer sein",
    "commit.rewordDone": "Commit-Nachricht aktualisiert",
    "commit.dropCommit": "Commit l\xF6schen",
    "commit.dropConfirm": "Commit {hash} l\xF6schen? Die Historie wird umgeschrieben.",
    "commit.dropDone": "Commit {hash} gel\xF6scht",
    "commit.dropFailed": "Commit konnte nicht gel\xF6scht werden",
    "commit.pushUpTo": "Commits bis hierher \xFCbertragen",
    "commit.pushUpToDone": "{ref} \xFCbertragen",
    "commit.pushUpToRejected": "\xDCbertragung abgelehnt, bitte zuerst abrufen",
    "commit.pushUpToFailed": "\xDCbertragung fehlgeschlagen",
    "commit.pushNoBranch": "Kein Branch enth\xE4lt diesen Commit",
    "commit.dirtyWorkingTree": "Bitte \xC4nderungen committen oder stashen, bevor die Historie umgeschrieben wird",
    "commit.revertDone": "{hash} zur\xFCckgesetzt",
    "commit.revertFailed": "Zur\xFCcksetzen fehlgeschlagen",
    "commit.revertConflict": "Revert-Konflikt, bitte l\xF6sen und fortsetzen oder abbrechen",
    "op.failed": "Vorgang fehlgeschlagen",
    "op.conflict": "Merge-Konflikt",
    "op.authFailed": "Authentifizierung fehlgeschlagen",
    "op.unreachable": "Remote nicht erreichbar",
    "op.rejected": "\xDCbertragung abgelehnt, bitte zuerst abrufen",
    "op.checkoutDone": "{name} ausgecheckt",
    "op.mergeDone": "{name} gemergt",
    "op.rebaseDone": "Auf {name} rebased",
    "op.pullDone": "Abgerufen",
    "op.pushDone": "\xDCbertragen",
    "op.deleteDone": "Branch {name} gel\xF6scht",
    "worktree.refresh": "Aktualisieren",
    "worktree.add": "Worktree hinzuf\xFCgen",
    "worktree.prune": "Bereinigen",
    "worktree.empty": "Keine Worktrees",
    "worktree.main": "Haupt",
    "worktree.remove": "Entfernen",
    "worktree.removeConfirm": "Worktree {path} entfernen?",
    "worktree.forceConfirm": "Nicht \xFCbernommene \xC4nderungen vorhanden. Erzwungen entfernen?",
    "worktree.loadFailed": "Worktrees konnten nicht geladen werden",
    "worktree.addPathPrompt": "Zielpfad f\xFCr den neuen Worktree:",
    "worktree.addBranchPrompt": "Neuer Branchname (basierend auf {base}):",
    "worktree.addFailed": "Worktree konnte nicht hinzugef\xFCgt werden",
    "batch.revertDone": "{n} Commits zur\xFCckgesetzt",
    "op.newBranchDone": "Branch {name} erstellt",
    "op.newBranchFailed": "Branch konnte nicht erstellt werden",
    "worktree.refreshed": "Worktree-Liste aktualisiert",
    "worktree.pruneDone": "{n} veraltete Worktrees bereinigt",
    "worktree.pruneNothing": "Keine veralteten Worktrees zu bereinigen",
    "worktree.pruneFailed": "Bereinigen fehlgeschlagen",
    "worktree.removed": "Worktree entfernt",
    "worktree.added": "Worktree erstellt: {path}",
    "op.branchDirtyWorkingTree": "Bitte zuerst \xC4nderungen committen oder stashen",
    "op.branchExists": "Branch existiert bereits",
    "op.branchInvalidName": "Ung\xFCltiger Branch-Name",
    "op.branchCreateGeneric": "Details siehe Konsole",
    "console.commandCount": "git-Befehle",
    "console.clear": "Leeren",
    "console.noCommands": "Noch keine git-Befehle",
    "console.selectCommand": "Befehl ausw\xE4hlen",
    "console.noOutput": "(keine Ausgabe)",
    "console.loadFailed": "Befehlsprotokoll konnte nicht geladen werden",
    "op.resetFailed": "Zur\xFCcksetzen fehlgeschlagen",
    "branch.favoriteSaveFailed": "Favoriten konnten nicht gespeichert werden",
    "dialog.renameFailed": "Branch konnte nicht umbenannt werden",
    "dialog.createBranchFailed": "Branch konnte nicht erstellt werden",
    "branch.loadFailed": "Branches konnten nicht geladen werden",
    "commit.loadDetailFailed": "Commit-Details konnten nicht geladen werden",
    "commit.loadListFailed": "Commits konnten nicht geladen werden",
    "worktree.removeFailed": "Worktree konnte nicht entfernt werden"
  };
  var fr = {
    "branch.checkout": "Checkout de la branche",
    "branch.rename": "Renommer la branche",
    "branch.merge": "Fusionner avec la branche actuelle",
    "branch.rebase": "Rebase ici",
    "branch.pull": "Pull",
    "branch.push": "Push",
    "branch.favorite": "Ajouter aux favoris",
    "branch.unfavorite": "Retirer des favoris",
    "branch.delete": "Supprimer la branche",
    // 未合并强制删除对话框 + 删除通知（对齐 IDEA GitDeleteBranchOperation）
    "branch.forceDelete": "La branche {name} n'a pas \xE9t\xE9 fusionn\xE9e avec la branche actuelle. La suppression forc\xE9e fera perdre ses commits.",
    "branch.forceDeleteButton": "Suppression forc\xE9e",
    "branch.notFound": "La branche {name} n'existe pas",
    "branch.deleteFailed": "\xC9chec de la suppression de la branche",
    "sidebar.deleteBranch": "Supprimer la branche",
    "branch.batchDeleteDone": "{n} branches supprim\xE9es",
    "branch.batchDeletePartial": "{ok} branche(s) supprim\xE9e(s), \xE9chec : {failed}",
    "branch.selectBranch": "Veuillez d\u2019abord s\xE9lectionner une branche",
    "branch.deleteCurrent": "Impossible de supprimer la branche actuelle",
    "branch.title": "Branches",
    "branch.searchPlaceholder": "Branche ou tag",
    "branch.notifyDeleted": "Branche supprim\xE9e : {name}",
    "branch.restore": "Restaurer",
    "branch.deleteTracking": "Supprimer la branche de suivi",
    "branch.restoreSuccess": "La branche {name} a \xE9t\xE9 restaur\xE9e",
    "branch.restoreFailed": "\xC9chec de la restauration de la branche",
    "branch.deleteTrackingFailed": "\xC9chec de la suppression de la branche de suivi",
    "commit.copyRevision": "Copier le hash du commit",
    "commit.cherryPick": "Cherry-pick",
    "commit.compareLocal": "Comparer avec local",
    "commit.reset": "R\xE9initialiser la branche actuelle ici",
    "commit.revert": "Annuler le commit",
    "commit.newBranch": "Nouvelle branche",
    "commit.newTag": "Nouveau tag",
    "batch.selected": "{n} commits s\xE9lectionn\xE9s",
    "batch.copyHashes": "Copier la liste des hash",
    "batch.cherryPickAll": "Tout cherry-picker ({n})",
    "batch.revertAll": "Tout annuler ({n})",
    "batch.confirmCherryPick": "Cherry-picker les {n} commits s\xE9lectionn\xE9s ?",
    "batch.confirmRevert": "Annuler les {n} commits s\xE9lectionn\xE9s ?",
    "file.showDiff": "Afficher le diff",
    "file.showDiffNew": "Afficher le diff dans une nouvelle fen\xEAtre",
    "file.compareLocal": "Comparer avec local",
    "file.compareBeforeLocal": "Comparer avant avec local",
    "file.editSource": "Modifier la source",
    "file.openRepoVersion": "Ouvrir la version du d\xE9p\xF4t",
    "file.revertChanges": "Annuler les changements s\xE9lectionn\xE9s",
    "file.cherryPickChanges": "Cherry-pick des changements s\xE9lectionn\xE9s",
    "file.createPatch": "Cr\xE9er un patch",
    "file.getFromRevision": "R\xE9cup\xE9rer depuis la r\xE9vision",
    "file.historyUpTo": "Historique jusqu'ici",
    // 侧边栏图标 / 显示设置 / 跳转 / 排序
    "sidebar.hideBranches": "Masquer les branches Git",
    "sidebar.showBranches": "Afficher les branches Git",
    "sidebar.newBranch": "Nouvelle branche",
    "sidebar.refresh": "Actualiser",
    "sidebar.update": "Mettre \xE0 jour",
    "sidebar.checkout": "Checkout",
    "sidebar.merge": "Fusionner",
    "sidebar.search": "Rechercher",
    "sidebar.favorite": "Favori",
    "sidebar.settings": "Param\xE8tres",
    "sidebar.pull": "Pull",
    "sidebar.expandAll": "Tout d\xE9velopper",
    "sidebar.sort": "Trier",
    "sidebar.close": "Fermer",
    "sidebar.noSelectedBranch": "Aucune branche s\xE9lectionn\xE9e",
    "settings.title": "Param\xE8tres d'affichage",
    "settings.showAuthor": "Afficher la colonne de l'auteur",
    "settings.showDate": "Afficher la colonne de date",
    "settings.showHash": "Afficher la colonne de hash",
    "goto.title": "Aller \xE0 la r\xE9f\xE9rence",
    "goto.placeholder": "Saisir un hash ou un nom de branche",
    "goto.notFound": "Aucun r\xE9sultat trouv\xE9",
    "goto.ok": "Aller",
    "sort.dateAsc": "Trier : date croissante",
    "sort.authorAsc": "Trier : auteur",
    "sort.messageAsc": "Trier : message",
    // 工具栏过滤（分支 / 用户 / 日期 / 路径）
    "filter.branch": "Branche",
    "filter.user": "Utilisateur",
    "filter.date": "Date",
    "filter.path": "Chemin",
    "filter.selectAll": "Tout s\xE9lectionner",
    "filter.regex": "Expression rationnelle",
    "filter.case": "Respecter la casse",
    "filter.all": "Tout",
    "filter.localBranches": "Branches locales",
    "filter.remoteBranches": "Branches distantes",
    "filter.favorites": "Favoris",
    "filter.today": "Aujourd'hui",
    "filter.thisWeek": "Cette semaine",
    "filter.thisMonth": "Ce mois-ci",
    "filter.thisYear": "Cette ann\xE9e",
    "filter.custom": "Personnalis\xE9\u2026",
    "filter.dateFrom": "Date de d\xE9but",
    "filter.dateTo": "Date de fin",
    "filter.chooseFolder": "Choisir un dossier\u2026",
    "filter.ok": "OK",
    "filter.cancel": "Annuler",
    "filter.clear": "Effacer",
    // 路径过滤（多选）
    "filter.selectPaths": "S\xE9lectionner les chemins \xE0 filtrer",
    "filter.editPaths": "Modifier les chemins\u2026",
    "filter.maxPaths": "Au maximum 100 chemins autoris\xE9s",
    "filter.noPaths": "Aucun chemin s\xE9lectionnable",
    "filter.loadPathsFailed": "\xC9chec du chargement des chemins",
    "dialog.renameBranch": "Renommer la branche",
    "dialog.branchName": "Nom de la branche",
    "dialog.startPoint": "Point de d\xE9part",
    "dialog.currentHead": "HEAD actuel",
    "dialog.inputBranchName": "Saisir un nom de branche\u2026",
    "dialog.checkoutAfterCreate": "Basculer apr\xE8s cr\xE9ation",
    "dialog.create": "Cr\xE9er",
    "dialog.dateFilter": "Filtrer par date",
    "dialog.startDate": "Date de d\xE9but",
    "dialog.endDate": "Date de fin",
    "dialog.clear": "Effacer",
    "dialog.resetTo": "R\xE9initialiser la branche vers {hash}",
    "dialog.selectResetMode": "Choisir le mode de r\xE9initialisation :",
    "dialog.resetSoft": "Soft - d\xE9placer HEAD uniquement",
    "dialog.resetMixed": "Mixed - d\xE9placer HEAD + r\xE9initialiser l'index (par d\xE9faut)",
    "dialog.resetHard": "Hard - d\xE9placer HEAD + r\xE9initialiser l'index et l'arbre de travail",
    "dialog.reset": "R\xE9initialiser",
    "dialog.branchFromCommit": "Cr\xE9er une branche \xE0 partir du commit",
    "dialog.basedOn": "Bas\xE9 sur : {info}",
    "commit.searchPlaceholder": "Texte ou hash",
    "branch.groupHead": "HEAD (branche actuelle)",
    "branch.groupLocal": "Locale",
    "branch.groupRemote": "Distante",
    "file.noDiff": "Aucune diff\xE9rence",
    "file.changedFiles": "Fichiers modifi\xE9s",
    "detail.title": "D\xE9tails du commit",
    "detail.hash": "Hash",
    "detail.author": "Auteur",
    "detail.date": "Date",
    "main.loadingTitle": "Initialisation\u2026",
    "main.loadingBody": "Chargement des informations du projet.",
    "main.notGitTitle": "Pas un d\xE9p\xF4t Git",
    "main.notGitBody": "Le r\xE9pertoire courant n'est pas un d\xE9p\xF4t Git.",
    "time.justNow": "\xE0 l'instant",
    "time.minutesAgo": "il y a {n} min",
    "time.hoursAgo": "il y a {n} h",
    "time.daysAgo": "il y a {n} j",
    "commit.empty": "Aucun commit",
    "commit.noSelection": "S\xE9lectionnez un commit pour voir les modifications",
    "file.selectDiff": "S\xE9lectionnez un fichier pour voir le diff",
    "file.noChanges": "Aucun fichier modifi\xE9",
    "layout.resizeDivider": "Faire glisser pour redimensionner",
    "main.tabConsole": "Console",
    "reset.title": "R\xE9initialiser la branche actuelle ici",
    "reset.softDesc": "conserver l'arbre de travail et l'index",
    "reset.mixedDesc": "conserver l'arbre de travail, r\xE9initialiser l'index",
    "reset.hardDesc": "abandonner toutes les modifications",
    "dialog.createBranchTitle": "Nouvelle branche",
    "dialog.pathPlaceholder": "src/ ou packages/core",
    "dialog.cancel": "Annuler",
    "dialog.ok": "OK",
    "filter.selectAllToggle": "Tout s\xE9lectionner / d\xE9s\xE9lectionner dans la liste actuelle",
    "sidebar.compareBranch": "Comparer avec la branche actuelle",
    "compare.title": "Comparaison de {branch} avec {current}",
    "compare.branchOnly": "Propres \xE0 {branch}",
    "compare.currentOnly": "Propres \xE0 {current}",
    "compare.empty": "Aucun commit",
    "compare.loading": "Chargement\u2026",
    "compare.loadFailed": "\xC9chec de la comparaison des branches",
    "compare.selectBranch": "Veuillez d\u2019abord s\xE9lectionner une branche",
    "compare.currentBranch": "La branche actuelle ne peut pas \xEAtre compar\xE9e \xE0 elle-m\xEAme",
    "compare.noCurrentBranch": "Branche actuelle pas encore charg\xE9e, veuillez r\xE9essayer",
    "compare.with": "avec",
    "compare.identical": "Les branches sont identiques",
    "compare.sameBranch": "S\xE9lectionnez deux branches diff\xE9rentes",
    "compare.tooMany": "S\xE9lectionnez au plus deux branches \xE0 comparer",
    "sidebar.showMyBranches": "Afficher mes branches",
    "sidebar.myBranchesFailed": "\xC9chec du chargement de mes branches",
    "sidebar.showMyBranchesOn": "Affichage de mes branches uniquement",
    "sidebar.myBranchesUnavailable": "Aucune branche locale \xE0 filtrer",
    "sidebar.newBranchUnavailable": "Aucune branche source",
    "sidebar.updateUnavailable": "Aucun d\xE9p\xF4t distant configur\xE9",
    "sidebar.deleteRemoteUnavailable": "Impossible de supprimer une branche distante ici",
    "sidebar.expandAllUnavailable": "Aucune branche \xE0 d\xE9plier",
    "sidebar.pullUnavailable": "Aucun d\xE9p\xF4t distant configur\xE9",
    "sidebar.fetch": "R\xE9cup\xE9rer",
    "sidebar.locate": "Afficher dans le journal Git",
    "sidebar.collapseAll": "Tout r\xE9duire",
    "sidebar.locateNotInView": "La t\xEAte de {branch} n'est pas dans la vue actuelle",
    "sidebar.fetchAuthFailed": "\xC9chec de l'authentification",
    "sidebar.fetchUnreachable": "D\xE9p\xF4t distant inaccessible",
    "sidebar.fetchNoRemote": "D\xE9p\xF4t distant introuvable",
    "sidebar.fetchFailed": "\xC9chec de la r\xE9cup\xE9ration",
    "sidebar.fetchInProgress": "R\xE9cup\xE9ration\u2026",
    "sidebar.fetchSuccessUpdates": "R\xE9cup\xE9r\xE9 : {count} branche(s) avec de nouveaux commits",
    "sidebar.fetchSuccessNoUpdates": "R\xE9cup\xE9r\xE9 : d\xE9j\xE0 \xE0 jour",
    "settings.groupView": "Affichage",
    "settings.groupGraph": "Graphe",
    "settings.showBranchLabels": "Afficher les libell\xE9s de branche",
    "settings.showTagNames": "Noms des tags",
    "settings.compactReferences": "Vue compacte des r\xE9f\xE9rences",
    "settings.preferCommitDate": "Horodatage du commit",
    "settings.referencesOnLeft": "R\xE9f\xE9rences \xE0 gauche",
    "settings.showLongEdges": "Ar\xEAtes longues",
    "commit.copied": "Copi\xE9 dans le presse-papiers",
    "commit.copyFailed": "\xC9chec de la copie",
    "commit.cherryPickNoSelection": "S\xE9lectionnez d'abord un commit",
    "commit.cherryPickDoneMulti": "{n} commits cherry-pick\xE9s",
    "commit.cherryPickDone": "{hash} cherry-pick\xE9",
    "commit.cherryPickFailed": "\xC9chec du cherry-pick",
    "commit.cherryPickConflict": "Conflit de cherry-pick, r\xE9solvez-le puis continuez ou abandonnez",
    "batch.cherryPickDone": "{n} commits cherry-pick\xE9s",
    "commit.uncommit": "Annuler le commit",
    "commit.uncommitDone": "Commit {hash} annul\xE9",
    "commit.uncommitFailed": "\xC9chec de l'annulation du commit",
    "commit.reword": "Modifier le message du commit",
    "commit.rewordTitle": "Modifier le message du commit",
    "commit.rewordEmpty": "Le message ne peut pas \xEAtre vide",
    "commit.rewordDone": "Message du commit mis \xE0 jour",
    "commit.dropCommit": "Supprimer le commit",
    "commit.dropConfirm": "Supprimer le commit {hash} ? L'historique sera r\xE9\xE9crit.",
    "commit.dropDone": "Commit {hash} supprim\xE9",
    "commit.dropFailed": "\xC9chec de la suppression du commit",
    "commit.pushUpTo": "Pousser les commits jusqu'ici",
    "commit.pushUpToDone": "{ref} pouss\xE9",
    "commit.pushUpToRejected": "Push rejet\xE9, r\xE9cup\xE9rez d'abord",
    "commit.pushUpToFailed": "\xC9chec du push",
    "commit.pushNoBranch": "Aucune branche ne contient ce commit",
    "commit.dirtyWorkingTree": "Commitez ou remisez vos modifications avant de r\xE9\xE9crire l'historique",
    "commit.revertDone": "{hash} annul\xE9",
    "commit.revertFailed": "\xC9chec de l'annulation",
    "commit.revertConflict": "Conflit de revert, r\xE9solvez-le puis continuez ou abandonnez",
    "op.failed": "\xC9chec de l'op\xE9ration",
    "op.conflict": "Conflit de fusion",
    "op.authFailed": "\xC9chec de l'authentification",
    "op.unreachable": "D\xE9p\xF4t distant inaccessible",
    "op.rejected": "Push rejet\xE9, r\xE9cup\xE9rez d'abord",
    "op.checkoutDone": "{name} extrait",
    "op.mergeDone": "{name} fusionn\xE9",
    "op.rebaseDone": "Rebas\xE9 sur {name}",
    "op.pullDone": "R\xE9cup\xE9r\xE9",
    "op.pushDone": "Pouss\xE9",
    "op.deleteDone": "Branche {name} supprim\xE9e",
    "worktree.refresh": "Actualiser",
    "worktree.add": "Ajouter un worktree",
    "worktree.prune": "Nettoyer",
    "worktree.empty": "Aucun worktree",
    "worktree.main": "principal",
    "worktree.remove": "Supprimer",
    "worktree.removeConfirm": "Supprimer le worktree {path} ?",
    "worktree.forceConfirm": "Modifications non valid\xE9es. Forcer la suppression ?",
    "worktree.loadFailed": "\xC9chec du chargement des worktrees",
    "worktree.addPathPrompt": "Chemin cible du nouveau worktree :",
    "worktree.addBranchPrompt": "Nom de la nouvelle branche (bas\xE9e sur {base}) :",
    "worktree.addFailed": "\xC9chec de l'ajout du worktree",
    "batch.revertDone": "{n} commits annul\xE9s",
    "op.newBranchDone": "Branche {name} cr\xE9\xE9e",
    "op.newBranchFailed": "\xC9chec de la cr\xE9ation de la branche",
    "worktree.refreshed": "Liste des worktrees actualis\xE9e",
    "worktree.pruneDone": "{n} worktree(s) obsol\xE8te(s) nettoy\xE9(s)",
    "worktree.pruneNothing": "Aucun worktree obsol\xE8te \xE0 nettoyer",
    "worktree.pruneFailed": "\xC9chec du nettoyage",
    "worktree.removed": "Worktree supprim\xE9",
    "worktree.added": "Worktree cr\xE9\xE9 : {path}",
    "op.branchDirtyWorkingTree": "validez ou remisez vos modifications d'abord",
    "op.branchExists": "la branche existe d\xE9j\xE0",
    "op.branchInvalidName": "nom de branche invalide",
    "op.branchCreateGeneric": "d\xE9tails dans la console",
    "console.commandCount": "commandes git",
    "console.clear": "Effacer",
    "console.noCommands": "Aucune commande git",
    "console.selectCommand": "S\xE9lectionnez une commande",
    "console.noOutput": "(aucune sortie)",
    "console.loadFailed": "\xC9chec du chargement du journal",
    "op.resetFailed": "\xC9chec de la r\xE9initialisation",
    "branch.favoriteSaveFailed": "\xC9chec de l'enregistrement des favoris",
    "dialog.renameFailed": "\xC9chec du renommage de la branche",
    "dialog.createBranchFailed": "\xC9chec de la cr\xE9ation de la branche",
    "branch.loadFailed": "\xC9chec du chargement des branches",
    "commit.loadDetailFailed": "\xC9chec du chargement des d\xE9tails du commit",
    "commit.loadListFailed": "\xC9chec du chargement des commits",
    "worktree.removeFailed": "\xC9chec de la suppression du worktree"
  };
  var uk = {
    "branch.checkout": "\u041F\u0435\u0440\u0435\u0439\u0442\u0438 \u043D\u0430 \u0433\u0456\u043B\u043A\u0443",
    "branch.rename": "\u041F\u0435\u0440\u0435\u0439\u043C\u0435\u043D\u0443\u0432\u0430\u0442\u0438 \u0433\u0456\u043B\u043A\u0443",
    "branch.merge": "\u0417\u043B\u0438\u0442\u0438 \u0432 \u043F\u043E\u0442\u043E\u0447\u043D\u0443 \u0433\u0456\u043B\u043A\u0443",
    "branch.rebase": "Rebase \u043D\u0430 \u0446\u044E \u0433\u0456\u043B\u043A\u0443",
    "branch.pull": "Pull",
    "branch.push": "Push",
    "branch.favorite": "\u0414\u043E\u0434\u0430\u0442\u0438 \u0434\u043E \u043E\u0431\u0440\u0430\u043D\u043E\u0433\u043E",
    "branch.unfavorite": "\u0412\u0438\u0434\u0430\u043B\u0438\u0442\u0438 \u0437 \u043E\u0431\u0440\u0430\u043D\u043E\u0433\u043E",
    "branch.delete": "\u0412\u0438\u0434\u0430\u043B\u0438\u0442\u0438 \u0433\u0456\u043B\u043A\u0443",
    // 未合并强制删除对话框 + 删除通知（对齐 IDEA GitDeleteBranchOperation）
    "branch.forceDelete": "\u0413\u0456\u043B\u043A\u0443 {name} \u043D\u0435 \u0437\u043B\u0438\u0442\u043E \u0432 \u043F\u043E\u0442\u043E\u0447\u043D\u0443 \u0433\u0456\u043B\u043A\u0443. \u041F\u0440\u0438\u043C\u0443\u0441\u043E\u0432\u0435 \u0432\u0438\u0434\u0430\u043B\u0435\u043D\u043D\u044F \u043F\u0440\u0438\u0437\u0432\u0435\u0434\u0435 \u0434\u043E \u0432\u0442\u0440\u0430\u0442\u0438 \u0457\u0457 \u043A\u043E\u043C\u0456\u0442\u0456\u0432.",
    "branch.forceDeleteButton": "\u041F\u0440\u0438\u043C\u0443\u0441\u043E\u0432\u043E \u0432\u0438\u0434\u0430\u043B\u0438\u0442\u0438",
    "branch.notFound": "\u0413\u0456\u043B\u043A\u0443 {name} \u043D\u0435 \u0456\u0441\u043D\u0443\u0454",
    "branch.deleteFailed": "\u041D\u0435 \u0432\u0434\u0430\u043B\u043E\u0441\u044F \u0432\u0438\u0434\u0430\u043B\u0438\u0442\u0438 \u0433\u0456\u043B\u043A\u0443",
    "sidebar.deleteBranch": "\u0412\u0438\u0434\u0430\u043B\u0438\u0442\u0438 \u0433\u0456\u043B\u043A\u0443",
    "branch.batchDeleteDone": "\u0412\u0438\u0434\u0430\u043B\u0435\u043D\u043E {n} \u0433\u0456\u043B\u043E\u043A",
    "branch.batchDeletePartial": "\u0412\u0438\u0434\u0430\u043B\u0435\u043D\u043E {ok} \u0433\u0456\u043B\u043E\u043A, \u043D\u0435 \u0432\u0434\u0430\u043B\u043E\u0441\u044F: {failed}",
    "branch.selectBranch": "\u0421\u043F\u043E\u0447\u0430\u0442\u043A\u0443 \u0432\u0438\u0431\u0435\u0440\u0456\u0442\u044C \u0433\u0456\u043B\u043A\u0443",
    "branch.deleteCurrent": "\u041D\u0435\u043C\u043E\u0436\u043B\u0438\u0432\u043E \u0432\u0438\u0434\u0430\u043B\u0438\u0442\u0438 \u043F\u043E\u0442\u043E\u0447\u043D\u0443 \u0433\u0456\u043B\u043A\u0443",
    "branch.title": "Ramas",
    "branch.searchPlaceholder": "\u0413\u0456\u043B\u043A\u0430 \u0430\u0431\u043E \u0442\u0435\u0433",
    "branch.notifyDeleted": "\u0412\u0438\u0434\u0430\u043B\u0435\u043D\u0430 \u0433\u0456\u043B\u043A\u0430: {name}",
    "branch.restore": "\u0412\u0456\u0434\u043D\u043E\u0432\u0438\u0442\u0438",
    "branch.deleteTracking": "\u0412\u0438\u0434\u0430\u043B\u0438\u0442\u0438 \u0433\u0456\u043B\u043A\u0443 \u0432\u0456\u0434\u0441\u0442\u0435\u0436\u0435\u043D\u043D\u044F",
    "branch.restoreSuccess": "\u0413\u0456\u043B\u043A\u0443 {name} \u0432\u0456\u0434\u043D\u043E\u0432\u043B\u0435\u043D\u043E",
    "branch.restoreFailed": "\u041D\u0435 \u0432\u0434\u0430\u043B\u043E\u0441\u044F \u0432\u0456\u0434\u043D\u043E\u0432\u0438\u0442\u0438 \u0433\u0456\u043B\u043A\u0443",
    "branch.deleteTrackingFailed": "\u041D\u0435 \u0432\u0434\u0430\u043B\u043E\u0441\u044F \u0432\u0438\u0434\u0430\u043B\u0438\u0442\u0438 \u0433\u0456\u043B\u043A\u0443 \u0432\u0456\u0434\u0441\u0442\u0435\u0436\u0435\u043D\u043D\u044F",
    "commit.copyRevision": "\u041A\u043E\u043F\u0456\u044E\u0432\u0430\u0442\u0438 \u0445\u0435\u0448 \u043A\u043E\u043C\u0456\u0442\u0443",
    "commit.cherryPick": "Cherry-pick",
    "commit.compareLocal": "\u041F\u043E\u0440\u0456\u0432\u043D\u044F\u0442\u0438 \u0437 \u043B\u043E\u043A\u0430\u043B\u044C\u043D\u0438\u043C",
    "commit.reset": "\u0421\u043A\u0438\u043D\u0443\u0442\u0438 \u043F\u043E\u0442\u043E\u0447\u043D\u0443 \u0433\u0456\u043B\u043A\u0443 \u043D\u0430 \u0446\u0435\u0439 \u043A\u043E\u043C\u0456\u0442",
    "commit.revert": "\u0412\u0456\u0434\u043A\u043E\u0442\u0438\u0442\u0438 \u043A\u043E\u043C\u0456\u0442",
    "commit.newBranch": "\u041D\u043E\u0432\u0430 \u0433\u0456\u043B\u043A\u0430",
    "commit.newTag": "\u041D\u043E\u0432\u0438\u0439 \u0442\u0435\u0433",
    "batch.selected": "\u0412\u0438\u0431\u0440\u0430\u043D\u043E {n} \u043A\u043E\u043C\u0456\u0442\u0456\u0432",
    "batch.copyHashes": "\u041A\u043E\u043F\u0456\u044E\u0432\u0430\u0442\u0438 \u0441\u043F\u0438\u0441\u043E\u043A \u0445\u0435\u0448\u0456\u0432",
    "batch.cherryPickAll": "Cherry-pick \u0443\u0441\u0456\u0445 ({n})",
    "batch.revertAll": "\u0412\u0456\u0434\u043A\u043E\u0442\u0438\u0442\u0438 \u0432\u0441\u0456 ({n})",
    "batch.confirmCherryPick": "\u0412\u0438\u043A\u043E\u043D\u0430\u0442\u0438 cherry-pick \u0434\u043B\u044F {n} \u0432\u0438\u0431\u0440\u0430\u043D\u0438\u0445 \u043A\u043E\u043C\u0456\u0442\u0456\u0432?",
    "batch.confirmRevert": "\u0412\u0456\u0434\u043A\u043E\u0442\u0438\u0442\u0438 {n} \u0432\u0438\u0431\u0440\u0430\u043D\u0438\u0445 \u043A\u043E\u043C\u0456\u0442\u0456\u0432?",
    "file.showDiff": "\u041F\u043E\u043A\u0430\u0437\u0430\u0442\u0438 diff",
    "file.showDiffNew": "\u041F\u043E\u043A\u0430\u0437\u0430\u0442\u0438 diff \u0443 \u043D\u043E\u0432\u043E\u043C\u0443 \u0432\u0456\u043A\u043D\u0456",
    "file.compareLocal": "\u041F\u043E\u0440\u0456\u0432\u043D\u044F\u0442\u0438 \u0437 \u043B\u043E\u043A\u0430\u043B\u044C\u043D\u0438\u043C",
    "file.compareBeforeLocal": "\u041F\u043E\u0440\u0456\u0432\u043D\u044F\u0442\u0438 \u0434\u043E \u0437\u043C\u0456\u043D \u0437 \u043B\u043E\u043A\u0430\u043B\u044C\u043D\u0438\u043C",
    "file.editSource": "\u0420\u0435\u0434\u0430\u0433\u0443\u0432\u0430\u0442\u0438 \u0434\u0436\u0435\u0440\u0435\u043B\u043E",
    "file.openRepoVersion": "\u0412\u0456\u0434\u043A\u0440\u0438\u0442\u0438 \u0432\u0435\u0440\u0441\u0456\u044E \u0440\u0435\u043F\u043E\u0437\u0438\u0442\u043E\u0440\u0456\u044E",
    "file.revertChanges": "\u0421\u043A\u0430\u0441\u0443\u0432\u0430\u0442\u0438 \u0432\u0438\u0431\u0440\u0430\u043D\u0456 \u0437\u043C\u0456\u043D\u0438",
    "file.cherryPickChanges": "Cherry-pick \u0432\u0438\u0431\u0440\u0430\u043D\u0438\u0445 \u0437\u043C\u0456\u043D",
    "file.createPatch": "\u0421\u0442\u0432\u043E\u0440\u0438\u0442\u0438 \u043F\u0430\u0442\u0447",
    "file.getFromRevision": "\u041E\u0442\u0440\u0438\u043C\u0430\u0442\u0438 \u0437 \u0440\u0435\u0432\u0456\u0437\u0456\u0457",
    "file.historyUpTo": "\u0406\u0441\u0442\u043E\u0440\u0456\u044F \u0434\u043E \u0446\u044C\u043E\u0433\u043E \u043C\u0456\u0441\u0446\u044F",
    // 侧边栏图标 / 显示设置 / 跳转 / 排序
    "sidebar.hideBranches": "\u041F\u0440\u0438\u0445\u043E\u0432\u0430\u0442\u0438 \u0433\u0456\u043B\u043A\u0438 Git",
    "sidebar.showBranches": "\u041F\u043E\u043A\u0430\u0437\u0430\u0442\u0438 \u0433\u0456\u043B\u043A\u0438 Git",
    "sidebar.newBranch": "\u041D\u043E\u0432\u0430 \u0433\u0456\u043B\u043A\u0430",
    "sidebar.refresh": "\u041E\u043D\u043E\u0432\u0438\u0442\u0438",
    "sidebar.update": "\u041E\u043D\u043E\u0432\u0438\u0442\u0438",
    "sidebar.checkout": "\u041F\u0435\u0440\u0435\u0439\u0442\u0438",
    "sidebar.merge": "\u0417\u043B\u0438\u0442\u0438",
    "sidebar.search": "\u041F\u043E\u0448\u0443\u043A",
    "sidebar.favorite": "\u041E\u0431\u0440\u0430\u043D\u0435",
    "sidebar.settings": "\u041D\u0430\u043B\u0430\u0448\u0442\u0443\u0432\u0430\u043D\u043D\u044F",
    "sidebar.pull": "Pull",
    "sidebar.expandAll": "\u0420\u043E\u0437\u0433\u043E\u0440\u043D\u0443\u0442\u0438 \u0432\u0441\u0456",
    "sidebar.sort": "\u0421\u043E\u0440\u0442\u0443\u0432\u0430\u043D\u043D\u044F",
    "sidebar.close": "\u0417\u0430\u043A\u0440\u0438\u0442\u0438",
    "sidebar.noSelectedBranch": "\u0413\u0456\u043B\u043A\u0443 \u043D\u0435 \u0432\u0438\u0431\u0440\u0430\u043D\u043E",
    "settings.title": "\u041D\u0430\u043B\u0430\u0448\u0442\u0443\u0432\u0430\u043D\u043D\u044F \u0432\u0456\u0434\u043E\u0431\u0440\u0430\u0436\u0435\u043D\u043D\u044F",
    "settings.showAuthor": "\u041F\u043E\u043A\u0430\u0437\u0443\u0432\u0430\u0442\u0438 \u0441\u0442\u043E\u0432\u043F\u0435\u0446\u044C \u0430\u0432\u0442\u043E\u0440\u0430",
    "settings.showDate": "\u041F\u043E\u043A\u0430\u0437\u0443\u0432\u0430\u0442\u0438 \u0441\u0442\u043E\u0432\u043F\u0435\u0446\u044C \u0434\u0430\u0442\u0438",
    "settings.showHash": "\u041F\u043E\u043A\u0430\u0437\u0443\u0432\u0430\u0442\u0438 \u0441\u0442\u043E\u0432\u043F\u0435\u0446\u044C \u0445\u0435\u0448\u0443",
    "goto.title": "\u041F\u0435\u0440\u0435\u0439\u0442\u0438 \u0434\u043E \u0440\u0435\u0444\u0435\u0440\u0435\u043D\u0441\u0443",
    "goto.placeholder": "\u0412\u0432\u0435\u0434\u0456\u0442\u044C \u0445\u0435\u0448 \u0430\u0431\u043E \u043D\u0430\u0437\u0432\u0443 \u0433\u0456\u043B\u043A\u0438",
    "goto.notFound": "\u041D\u0456\u0447\u043E\u0433\u043E \u043D\u0435 \u0437\u043D\u0430\u0439\u0434\u0435\u043D\u043E",
    "goto.ok": "\u041F\u0435\u0440\u0435\u0439\u0442\u0438",
    "sort.dateAsc": "\u0421\u043E\u0440\u0442\u0443\u0432\u0430\u043D\u043D\u044F: \u0437\u0430 \u0434\u0430\u0442\u043E\u044E",
    "sort.authorAsc": "\u0421\u043E\u0440\u0442\u0443\u0432\u0430\u043D\u043D\u044F: \u0437\u0430 \u0430\u0432\u0442\u043E\u0440\u043E\u043C",
    "sort.messageAsc": "\u0421\u043E\u0440\u0442\u0443\u0432\u0430\u043D\u043D\u044F: \u0437\u0430 \u043F\u043E\u0432\u0456\u0434\u043E\u043C\u043B\u0435\u043D\u043D\u044F\u043C",
    // 工具栏过滤（分支 / 用户 / 日期 / 路径）
    "filter.branch": "\u0413\u0456\u043B\u043A\u0430",
    "filter.user": "\u041A\u043E\u0440\u0438\u0441\u0442\u0443\u0432\u0430\u0447",
    "filter.date": "\u0414\u0430\u0442\u0430",
    "filter.path": "\u0428\u043B\u044F\u0445",
    "filter.selectAll": "\u0412\u0438\u0431\u0440\u0430\u0442\u0438 \u0432\u0441\u0456",
    "filter.regex": "\u0420\u0435\u0433\u0443\u043B\u044F\u0440\u043D\u0438\u0439 \u0432\u0438\u0440\u0430\u0437",
    "filter.case": "\u0417 \u0443\u0440\u0430\u0445\u0443\u0432\u0430\u043D\u043D\u044F\u043C \u0440\u0435\u0433\u0456\u0441\u0442\u0440\u0443",
    "filter.all": "\u0423\u0441\u0456",
    "filter.localBranches": "\u041B\u043E\u043A\u0430\u043B\u044C\u043D\u0456 \u0433\u0456\u043B\u043A\u0438",
    "filter.remoteBranches": "\u0412\u0456\u0434\u0434\u0430\u043B\u0435\u043D\u0456 \u0433\u0456\u043B\u043A\u0438",
    "filter.favorites": "\u041E\u0431\u0440\u0430\u043D\u0435",
    "filter.today": "\u0421\u044C\u043E\u0433\u043E\u0434\u043D\u0456",
    "filter.thisWeek": "\u0426\u0435\u0439 \u0442\u0438\u0436\u0434\u0435\u043D\u044C",
    "filter.thisMonth": "\u0426\u0435\u0439 \u043C\u0456\u0441\u044F\u0446\u044C",
    "filter.thisYear": "\u0426\u0435\u0439 \u0440\u0456\u043A",
    "filter.custom": "\u0412\u043B\u0430\u0441\u043D\u0438\u0439\u2026",
    "filter.dateFrom": "\u0414\u0430\u0442\u0430 \u043F\u043E\u0447\u0430\u0442\u043A\u0443",
    "filter.dateTo": "\u0414\u0430\u0442\u0430 \u0437\u0430\u0432\u0435\u0440\u0448\u0435\u043D\u043D\u044F",
    "filter.chooseFolder": "\u0412\u0438\u0431\u0440\u0430\u0442\u0438 \u0442\u0435\u043A\u0443\u2026",
    "filter.ok": "\u0413\u0430\u0440\u0430\u0437\u0434",
    "filter.cancel": "\u0421\u043A\u0430\u0441\u0443\u0432\u0430\u0442\u0438",
    "filter.clear": "\u041E\u0447\u0438\u0441\u0442\u0438\u0442\u0438",
    // 路径过滤（多选）
    "filter.selectPaths": "\u0412\u0438\u0431\u0435\u0440\u0456\u0442\u044C \u0448\u043B\u044F\u0445\u0438 \u0434\u043B\u044F \u0444\u0456\u043B\u044C\u0442\u0440\u0443\u0432\u0430\u043D\u043D\u044F",
    "filter.editPaths": "\u0420\u0435\u0434\u0430\u0433\u0443\u0432\u0430\u0442\u0438 \u0448\u043B\u044F\u0445\u0438\u2026",
    "filter.maxPaths": "\u0429\u043E\u043D\u0430\u0439\u0431\u0456\u043B\u044C\u0448\u0435 100 \u0448\u043B\u044F\u0445\u0456\u0432",
    "filter.noPaths": "\u041D\u0435\u043C\u0430\u0454 \u0448\u043B\u044F\u0445\u0456\u0432 \u0434\u043B\u044F \u0432\u0438\u0431\u043E\u0440\u0443",
    "filter.loadPathsFailed": "\u041D\u0435 \u0432\u0434\u0430\u043B\u043E\u0441\u044F \u0437\u0430\u0432\u0430\u043D\u0442\u0430\u0436\u0438\u0442\u0438 \u0448\u043B\u044F\u0445\u0438",
    "dialog.renameBranch": "\u041F\u0435\u0440\u0435\u0439\u043C\u0435\u043D\u0443\u0432\u0430\u0442\u0438 \u0433\u0456\u043B\u043A\u0443",
    "dialog.branchName": "\u041D\u0430\u0437\u0432\u0430 \u0433\u0456\u043B\u043A\u0438",
    "dialog.startPoint": "\u041F\u043E\u0447\u0430\u0442\u043A\u043E\u0432\u0430 \u0442\u043E\u0447\u043A\u0430",
    "dialog.currentHead": "\u041F\u043E\u0442\u043E\u0447\u043D\u0438\u0439 HEAD",
    "dialog.inputBranchName": "\u0412\u0432\u0435\u0434\u0456\u0442\u044C \u043D\u0430\u0437\u0432\u0443 \u0433\u0456\u043B\u043A\u0438\u2026",
    "dialog.checkoutAfterCreate": "\u041F\u0435\u0440\u0435\u0439\u0442\u0438 \u043F\u0456\u0441\u043B\u044F \u0441\u0442\u0432\u043E\u0440\u0435\u043D\u043D\u044F",
    "dialog.create": "\u0421\u0442\u0432\u043E\u0440\u0438\u0442\u0438",
    "dialog.dateFilter": "\u0424\u0456\u043B\u044C\u0442\u0440\u0443\u0432\u0430\u0442\u0438 \u0437\u0430 \u0434\u0430\u0442\u043E\u044E",
    "dialog.startDate": "\u0414\u0430\u0442\u0430 \u043F\u043E\u0447\u0430\u0442\u043A\u0443",
    "dialog.endDate": "\u0414\u0430\u0442\u0430 \u0437\u0430\u0432\u0435\u0440\u0448\u0435\u043D\u043D\u044F",
    "dialog.clear": "\u041E\u0447\u0438\u0441\u0442\u0438\u0442\u0438",
    "dialog.resetTo": "\u0421\u043A\u0438\u043D\u0443\u0442\u0438 \u0433\u0456\u043B\u043A\u0443 \u043D\u0430 {hash}",
    "dialog.selectResetMode": "\u0412\u0438\u0431\u0435\u0440\u0456\u0442\u044C \u0440\u0435\u0436\u0438\u043C \u0441\u043A\u0438\u0434\u0430\u043D\u043D\u044F:",
    "dialog.resetSoft": "Soft - \u043B\u0438\u0448\u0435 \u043F\u0435\u0440\u0435\u043C\u0456\u0441\u0442\u0438\u0442\u0438 HEAD",
    "dialog.resetMixed": "Mixed - \u043F\u0435\u0440\u0435\u043C\u0456\u0441\u0442\u0438\u0442\u0438 HEAD + \u0441\u043A\u0438\u043D\u0443\u0442\u0438 \u0456\u043D\u0434\u0435\u043A\u0441 (\u0442\u0438\u043F\u043E\u0432\u043E)",
    "dialog.resetHard": "Hard - \u043F\u0435\u0440\u0435\u043C\u0456\u0441\u0442\u0438\u0442\u0438 HEAD + \u0441\u043A\u0438\u043D\u0443\u0442\u0438 \u0456\u043D\u0434\u0435\u043A\u0441 \u0456 \u0440\u043E\u0431\u043E\u0447\u0435 \u0434\u0435\u0440\u0435\u0432\u043E",
    "dialog.reset": "\u0421\u043A\u0438\u043D\u0443\u0442\u0438",
    "dialog.branchFromCommit": "\u0421\u0442\u0432\u043E\u0440\u0438\u0442\u0438 \u0433\u0456\u043B\u043A\u0443 \u0437 \u043A\u043E\u043C\u0456\u0442\u0443",
    "dialog.basedOn": "\u041D\u0430 \u043E\u0441\u043D\u043E\u0432\u0456: {info}",
    "commit.searchPlaceholder": "\u0422\u0435\u043A\u0441\u0442 \u0430\u0431\u043E \u0445\u0435\u0448",
    "branch.groupHead": "HEAD (\u043F\u043E\u0442\u043E\u0447\u043D\u0430 \u0433\u0456\u043B\u043A\u0430)",
    "branch.groupLocal": "\u041B\u043E\u043A\u0430\u043B\u044C\u043D\u0456",
    "branch.groupRemote": "\u0412\u0456\u0434\u0434\u0430\u043B\u0435\u043D\u0456",
    "file.noDiff": "\u0411\u0435\u0437 \u0440\u0456\u0437\u043D\u0438\u0446\u0456",
    "file.changedFiles": "\u0417\u043C\u0456\u043D\u0435\u043D\u0456 \u0444\u0430\u0439\u043B\u0438",
    "detail.title": "\u0414\u0435\u0442\u0430\u043B\u0456 \u043A\u043E\u043C\u0456\u0442\u0443",
    "detail.hash": "\u0425\u0435\u0448",
    "detail.author": "\u0410\u0432\u0442\u043E\u0440",
    "detail.date": "\u0414\u0430\u0442\u0430",
    "main.loadingTitle": "\u0406\u043D\u0456\u0446\u0456\u0430\u043B\u0456\u0437\u0430\u0446\u0456\u044F\u2026",
    "main.loadingBody": "\u0417\u0430\u0432\u0430\u043D\u0442\u0430\u0436\u0435\u043D\u043D\u044F \u0456\u043D\u0444\u043E\u0440\u043C\u0430\u0446\u0456\u0457 \u043F\u0440\u043E \u043F\u0440\u043E\u0454\u043A\u0442.",
    "main.notGitTitle": "\u041D\u0435 Git-\u0440\u0435\u043F\u043E\u0437\u0438\u0442\u043E\u0440\u0456\u0439",
    "main.notGitBody": "\u041F\u043E\u0442\u043E\u0447\u043D\u0438\u0439 \u043A\u0430\u0442\u0430\u043B\u043E\u0433 \u043D\u0435 \u0454 Git-\u0440\u0435\u043F\u043E\u0437\u0438\u0442\u043E\u0440\u0456\u0454\u043C.",
    "time.justNow": "\u0449\u043E\u0439\u043D\u043E",
    "time.minutesAgo": "{n} \u0445\u0432 \u0442\u043E\u043C\u0443",
    "time.hoursAgo": "{n} \u0433\u043E\u0434 \u0442\u043E\u043C\u0443",
    "time.daysAgo": "{n} \u0434\u043D \u0442\u043E\u043C\u0443",
    "commit.empty": "\u041D\u0435\u043C\u0430\u0454 \u043A\u043E\u043C\u0456\u0442\u0456\u0432",
    "commit.noSelection": "\u0412\u0438\u0431\u0435\u0440\u0456\u0442\u044C \u043A\u043E\u043C\u0456\u0442, \u0449\u043E\u0431 \u043F\u043E\u0431\u0430\u0447\u0438\u0442\u0438 \u0437\u043C\u0456\u043D\u0438",
    "file.selectDiff": "\u0412\u0438\u0431\u0435\u0440\u0456\u0442\u044C \u0444\u0430\u0439\u043B, \u0449\u043E\u0431 \u043F\u043E\u0431\u0430\u0447\u0438\u0442\u0438 \u0440\u0456\u0437\u043D\u0438\u0446\u044E",
    "file.noChanges": "\u041D\u0435\u043C\u0430\u0454 \u0437\u043C\u0456\u043D\u0435\u043D\u0438\u0445 \u0444\u0430\u0439\u043B\u0456\u0432",
    "layout.resizeDivider": "\u041F\u0435\u0440\u0435\u0442\u044F\u0433\u043D\u0456\u0442\u044C, \u0449\u043E\u0431 \u0437\u043C\u0456\u043D\u0438\u0442\u0438 \u0440\u043E\u0437\u043C\u0456\u0440",
    "main.tabConsole": "\u041A\u043E\u043D\u0441\u043E\u043B\u044C",
    "reset.title": "\u0421\u043A\u0438\u043D\u0443\u0442\u0438 \u043F\u043E\u0442\u043E\u0447\u043D\u0443 \u0433\u0456\u043B\u043A\u0443 \u043D\u0430 \u0446\u0435\u0439 \u043A\u043E\u043C\u0456\u0442",
    "reset.softDesc": "\u0437\u0431\u0435\u0440\u0435\u0433\u0442\u0438 \u0440\u043E\u0431\u043E\u0447\u0435 \u0434\u0435\u0440\u0435\u0432\u043E \u0442\u0430 \u0456\u043D\u0434\u0435\u043A\u0441",
    "reset.mixedDesc": "\u0437\u0431\u0435\u0440\u0435\u0433\u0442\u0438 \u0440\u043E\u0431\u043E\u0447\u0435 \u0434\u0435\u0440\u0435\u0432\u043E, \u0441\u043A\u0438\u043D\u0443\u0442\u0438 \u0456\u043D\u0434\u0435\u043A\u0441",
    "reset.hardDesc": "\u0432\u0456\u0434\u0445\u0438\u043B\u0438\u0442\u0438 \u0432\u0441\u0456 \u0437\u043C\u0456\u043D\u0438",
    "dialog.createBranchTitle": "\u041D\u043E\u0432\u0430 \u0433\u0456\u043B\u043A\u0430",
    "dialog.pathPlaceholder": "src/ \u0430\u0431\u043E packages/core",
    "dialog.cancel": "\u0421\u043A\u0430\u0441\u0443\u0432\u0430\u0442\u0438",
    "dialog.ok": "\u0413\u0430\u0440\u0430\u0437\u0434",
    "filter.selectAllToggle": "\u0412\u0438\u0431\u0440\u0430\u0442\u0438 \u0432\u0441\u0435 / \u0437\u043D\u044F\u0442\u0438 \u0432\u0438\u0431\u0456\u0440 \u0443 \u043F\u043E\u0442\u043E\u0447\u043D\u043E\u043C\u0443 \u0441\u043F\u0438\u0441\u043A\u0443",
    "sidebar.compareBranch": "\u041F\u043E\u0440\u0456\u0432\u043D\u044F\u0442\u0438 \u0437 \u043F\u043E\u0442\u043E\u0447\u043D\u043E\u044E",
    "compare.title": "\u041F\u043E\u0440\u0456\u0432\u043D\u044F\u043D\u043D\u044F {branch} \u0437 {current}",
    "compare.branchOnly": "\u041B\u0438\u0448\u0435 \u0432 {branch}",
    "compare.currentOnly": "\u041B\u0438\u0448\u0435 \u0432 {current}",
    "compare.empty": "\u041D\u0435\u043C\u0430\u0454 \u043A\u043E\u043C\u0456\u0442\u0456\u0432",
    "compare.loading": "\u0417\u0430\u0432\u0430\u043D\u0442\u0430\u0436\u0435\u043D\u043D\u044F\u2026",
    "compare.loadFailed": "\u041D\u0435 \u0432\u0434\u0430\u043B\u043E\u0441\u044F \u043F\u043E\u0440\u0456\u0432\u043D\u044F\u0442\u0438 \u0433\u0456\u043B\u043A\u0438",
    "compare.selectBranch": "\u0421\u043F\u043E\u0447\u0430\u0442\u043A\u0443 \u0432\u0438\u0431\u0435\u0440\u0456\u0442\u044C \u0433\u0456\u043B\u043A\u0443",
    "compare.currentBranch": "\u041F\u043E\u0442\u043E\u0447\u043D\u0443 \u0433\u0456\u043B\u043A\u0443 \u043D\u0435 \u043C\u043E\u0436\u043D\u0430 \u043F\u043E\u0440\u0456\u0432\u043D\u044F\u0442\u0438 \u0441\u0430\u043C\u0443 \u0437 \u0441\u043E\u0431\u043E\u044E",
    "compare.noCurrentBranch": "\u041F\u043E\u0442\u043E\u0447\u043D\u0443 \u0433\u0456\u043B\u043A\u0443 \u0449\u0435 \u043D\u0435 \u0437\u0430\u0432\u0430\u043D\u0442\u0430\u0436\u0435\u043D\u043E, \u0441\u043F\u0440\u043E\u0431\u0443\u0439\u0442\u0435 \u043F\u0456\u0437\u043D\u0456\u0448\u0435",
    "compare.with": "\u0437",
    "compare.identical": "\u0413\u0456\u043B\u043A\u0438 \u043E\u0434\u043D\u0430\u043A\u043E\u0432\u0456",
    "compare.sameBranch": "\u0412\u0438\u0431\u0435\u0440\u0456\u0442\u044C \u0434\u0432\u0456 \u0440\u0456\u0437\u043D\u0456 \u0433\u0456\u043B\u043A\u0438",
    "compare.tooMany": "\u0412\u0438\u0431\u0435\u0440\u0456\u0442\u044C \u0449\u043E\u043D\u0430\u0439\u0431\u0456\u043B\u044C\u0448\u0435 \u0434\u0432\u0456 \u0433\u0456\u043B\u043A\u0438 \u0434\u043B\u044F \u043F\u043E\u0440\u0456\u0432\u043D\u044F\u043D\u043D\u044F",
    "sidebar.showMyBranches": "\u041F\u043E\u043A\u0430\u0437\u0430\u0442\u0438 \u043C\u043E\u0457 \u0433\u0456\u043B\u043A\u0438",
    "sidebar.myBranchesFailed": "\u041D\u0435 \u0432\u0434\u0430\u043B\u043E\u0441\u044F \u0437\u0430\u0432\u0430\u043D\u0442\u0430\u0436\u0438\u0442\u0438 \u043C\u043E\u0457 \u0433\u0456\u043B\u043A\u0438",
    "sidebar.showMyBranchesOn": "\u041F\u043E\u043A\u0430\u0437\u0430\u043D\u043E \u043B\u0438\u0448\u0435 \u043C\u043E\u0457 \u0433\u0456\u043B\u043A\u0438",
    "sidebar.myBranchesUnavailable": "\u041D\u0435\u043C\u0430\u0454 \u043B\u043E\u043A\u0430\u043B\u044C\u043D\u0438\u0445 \u0433\u0456\u043B\u043E\u043A \u0434\u043B\u044F \u0444\u0456\u043B\u044C\u0442\u0440\u0430\u0446\u0456\u0457",
    "sidebar.newBranchUnavailable": "\u041D\u0435\u043C\u0430\u0454 \u0433\u0456\u043B\u043A\u0438 \u0434\u043B\u044F \u0441\u0442\u0432\u043E\u0440\u0435\u043D\u043D\u044F",
    "sidebar.updateUnavailable": "\u0412\u0456\u0434\u0434\u0430\u043B\u0435\u043D\u0438\u0439 \u0440\u0435\u043F\u043E\u0437\u0438\u0442\u043E\u0440\u0456\u0439 \u043D\u0435 \u043D\u0430\u043B\u0430\u0448\u0442\u043E\u0432\u0430\u043D\u043E",
    "sidebar.deleteRemoteUnavailable": "\u0422\u0443\u0442 \u043D\u0435 \u043C\u043E\u0436\u043D\u0430 \u0432\u0438\u0434\u0430\u043B\u044F\u0442\u0438 \u0432\u0456\u0434\u0434\u0430\u043B\u0435\u043D\u0456 \u0433\u0456\u043B\u043A\u0438",
    "sidebar.expandAllUnavailable": "\u041D\u0435\u043C\u0430\u0454 \u0433\u0456\u043B\u043E\u043A \u0434\u043B\u044F \u0440\u043E\u0437\u0433\u043E\u0440\u0442\u0430\u043D\u043D\u044F",
    "sidebar.pullUnavailable": "\u0412\u0456\u0434\u0434\u0430\u043B\u0435\u043D\u0438\u0439 \u0440\u0435\u043F\u043E\u0437\u0438\u0442\u043E\u0440\u0456\u0439 \u043D\u0435 \u043D\u0430\u043B\u0430\u0448\u0442\u043E\u0432\u0430\u043D\u043E",
    "sidebar.fetch": "\u041E\u0442\u0440\u0438\u043C\u0430\u0442\u0438 \u0437\u043C\u0456\u043D\u0438",
    "sidebar.locate": "\u041F\u043E\u043A\u0430\u0437\u0430\u0442\u0438 \u0432 \u0436\u0443\u0440\u043D\u0430\u043B\u0456 Git",
    "sidebar.collapseAll": "\u0417\u0433\u043E\u0440\u043D\u0443\u0442\u0438 \u0432\u0441\u0435",
    "sidebar.locateNotInView": "\u041E\u0441\u0442\u0430\u043D\u043D\u0456\u0439 \u043A\u043E\u043C\u0456\u0442 {branch} \u0432\u0456\u0434\u0441\u0443\u0442\u043D\u0456\u0439 \u0443 \u043F\u043E\u0442\u043E\u0447\u043D\u043E\u043C\u0443 \u0441\u043F\u0438\u0441\u043A\u0443",
    "sidebar.fetchAuthFailed": "\u041F\u043E\u043C\u0438\u043B\u043A\u0430 \u0430\u0432\u0442\u0435\u043D\u0442\u0438\u0444\u0456\u043A\u0430\u0446\u0456\u0457",
    "sidebar.fetchUnreachable": "\u0412\u0456\u0434\u0434\u0430\u043B\u0435\u043D\u0438\u0439 \u0440\u0435\u043F\u043E\u0437\u0438\u0442\u043E\u0440\u0456\u0439 \u043D\u0435\u0434\u043E\u0441\u0442\u0443\u043F\u043D\u0438\u0439",
    "sidebar.fetchNoRemote": "\u0412\u0456\u0434\u0434\u0430\u043B\u0435\u043D\u0438\u0439 \u0440\u0435\u043F\u043E\u0437\u0438\u0442\u043E\u0440\u0456\u0439 \u043D\u0435 \u0437\u043D\u0430\u0439\u0434\u0435\u043D\u043E",
    "sidebar.fetchFailed": "\u041D\u0435 \u0432\u0434\u0430\u043B\u043E\u0441\u044F \u043E\u0442\u0440\u0438\u043C\u0430\u0442\u0438 \u0437\u043C\u0456\u043D\u0438",
    "sidebar.fetchInProgress": "\u041E\u0442\u0440\u0438\u043C\u0430\u043D\u043D\u044F \u0437\u043C\u0456\u043D\u2026",
    "sidebar.fetchSuccessUpdates": "\u041E\u0442\u0440\u0438\u043C\u0430\u043D\u043E: \u043D\u043E\u0432\u0456 \u043A\u043E\u043C\u0456\u0442\u0438 \u0432 {count} \u0433\u0456\u043B\u043A\u0430\u0445",
    "sidebar.fetchSuccessNoUpdates": "\u041E\u0442\u0440\u0438\u043C\u0430\u043D\u043E: \u0443\u0436\u0435 \u0430\u043A\u0442\u0443\u0430\u043B\u044C\u043D\u043E",
    "settings.groupView": "\u0412\u0438\u0433\u043B\u044F\u0434",
    "settings.groupGraph": "\u0413\u0440\u0430\u0444",
    "settings.showBranchLabels": "\u041F\u043E\u043A\u0430\u0437\u0443\u0432\u0430\u0442\u0438 \u043C\u0456\u0442\u043A\u0438 \u0433\u0456\u043B\u043E\u043A",
    "settings.showTagNames": "\u041D\u0430\u0437\u0432\u0438 \u0442\u0435\u0433\u0456\u0432",
    "settings.compactReferences": "\u041A\u043E\u043C\u043F\u0430\u043A\u0442\u043D\u0438\u0439 \u0432\u0438\u0433\u043B\u044F\u0434 \u043F\u043E\u0441\u0438\u043B\u0430\u043D\u044C",
    "settings.preferCommitDate": "\u0427\u0430\u0441 \u043A\u043E\u043C\u0456\u0442\u0443",
    "settings.referencesOnLeft": "\u041F\u043E\u0441\u0438\u043B\u0430\u043D\u043D\u044F \u043B\u0456\u0432\u043E\u0440\u0443\u0447",
    "settings.showLongEdges": "\u0414\u043E\u0432\u0433\u0456 \u0440\u0435\u0431\u0440\u0430",
    "commit.copied": "\u0421\u043A\u043E\u043F\u0456\u0439\u043E\u0432\u0430\u043D\u043E \u0434\u043E \u0431\u0443\u0444\u0435\u0440\u0430 \u043E\u0431\u043C\u0456\u043D\u0443",
    "commit.copyFailed": "\u041D\u0435 \u0432\u0434\u0430\u043B\u043E\u0441\u044F \u0441\u043A\u043E\u043F\u0456\u044E\u0432\u0430\u0442\u0438",
    "commit.cherryPickNoSelection": "\u0421\u043F\u0435\u0440\u0448\u0443 \u0432\u0438\u0431\u0435\u0440\u0456\u0442\u044C \u043A\u043E\u043C\u0456\u0442",
    "commit.cherryPickDoneMulti": "Cherry-pick \u0432\u0438\u043A\u043E\u043D\u0430\u043D\u043E \u0434\u043B\u044F {n} \u043A\u043E\u043C\u0456\u0442\u0456\u0432",
    "commit.cherryPickDone": "\u0412\u0438\u043A\u043E\u043D\u0430\u043D\u043E cherry-pick {hash}",
    "commit.cherryPickFailed": "\u041F\u043E\u043C\u0438\u043B\u043A\u0430 cherry-pick",
    "commit.cherryPickConflict": "\u041A\u043E\u043D\u0444\u043B\u0456\u043A\u0442 cherry-pick, \u0440\u043E\u0437\u0432'\u044F\u0436\u0456\u0442\u044C \u0439\u043E\u0433\u043E \u0442\u0430 \u043F\u0440\u043E\u0434\u043E\u0432\u0436\u0442\u0435 \u0430\u0431\u043E \u0441\u043A\u0430\u0441\u0443\u0439\u0442\u0435",
    "batch.cherryPickDone": "\u0412\u0438\u043A\u043E\u043D\u0430\u043D\u043E cherry-pick {n} \u043A\u043E\u043C\u0456\u0442\u0456\u0432",
    "commit.uncommit": "\u0421\u043A\u0430\u0441\u0443\u0432\u0430\u0442\u0438 \u043A\u043E\u043C\u0456\u0442",
    "commit.uncommitDone": "\u041A\u043E\u043C\u0456\u0442 {hash} \u0441\u043A\u0430\u0441\u043E\u0432\u0430\u043D\u043E",
    "commit.uncommitFailed": "\u041D\u0435 \u0432\u0434\u0430\u043B\u043E\u0441\u044F \u0441\u043A\u0430\u0441\u0443\u0432\u0430\u0442\u0438 \u043A\u043E\u043C\u0456\u0442",
    "commit.reword": "\u0420\u0435\u0434\u0430\u0433\u0443\u0432\u0430\u0442\u0438 \u043F\u043E\u0432\u0456\u0434\u043E\u043C\u043B\u0435\u043D\u043D\u044F \u043A\u043E\u043C\u0456\u0442\u0443",
    "commit.rewordTitle": "\u0420\u0435\u0434\u0430\u0433\u0443\u0432\u0430\u0442\u0438 \u043F\u043E\u0432\u0456\u0434\u043E\u043C\u043B\u0435\u043D\u043D\u044F \u043A\u043E\u043C\u0456\u0442\u0443",
    "commit.rewordEmpty": "\u041F\u043E\u0432\u0456\u0434\u043E\u043C\u043B\u0435\u043D\u043D\u044F \u043D\u0435 \u043C\u043E\u0436\u0435 \u0431\u0443\u0442\u0438 \u043F\u043E\u0440\u043E\u0436\u043D\u0456\u043C",
    "commit.rewordDone": "\u041F\u043E\u0432\u0456\u0434\u043E\u043C\u043B\u0435\u043D\u043D\u044F \u043A\u043E\u043C\u0456\u0442\u0443 \u043E\u043D\u043E\u0432\u043B\u0435\u043D\u043E",
    "commit.dropCommit": "\u0412\u0438\u0434\u0430\u043B\u0438\u0442\u0438 \u043A\u043E\u043C\u0456\u0442",
    "commit.dropConfirm": "\u0412\u0438\u0434\u0430\u043B\u0438\u0442\u0438 \u043A\u043E\u043C\u0456\u0442 {hash}? \u0406\u0441\u0442\u043E\u0440\u0456\u044E \u0431\u0443\u0434\u0435 \u043F\u0435\u0440\u0435\u043F\u0438\u0441\u0430\u043D\u043E.",
    "commit.dropDone": "\u041A\u043E\u043C\u0456\u0442 {hash} \u0432\u0438\u0434\u0430\u043B\u0435\u043D\u043E",
    "commit.dropFailed": "\u041D\u0435 \u0432\u0434\u0430\u043B\u043E\u0441\u044F \u0432\u0438\u0434\u0430\u043B\u0438\u0442\u0438 \u043A\u043E\u043C\u0456\u0442",
    "commit.pushUpTo": "\u041D\u0430\u0434\u0456\u0441\u043B\u0430\u0442\u0438 \u043A\u043E\u043C\u0456\u0442\u0438 \u0434\u043E \u0446\u044C\u043E\u0433\u043E",
    "commit.pushUpToDone": "\u041D\u0430\u0434\u0456\u0441\u043B\u0430\u043D\u043E {ref}",
    "commit.pushUpToRejected": "\u041D\u0430\u0434\u0441\u0438\u043B\u0430\u043D\u043D\u044F \u0432\u0456\u0434\u0445\u0438\u043B\u0435\u043D\u043E, \u0441\u043F\u0435\u0440\u0448\u0443 \u043E\u0442\u0440\u0438\u043C\u0430\u0439\u0442\u0435 \u0437\u043C\u0456\u043D\u0438",
    "commit.pushUpToFailed": "\u041D\u0435 \u0432\u0434\u0430\u043B\u043E\u0441\u044F \u043D\u0430\u0434\u0456\u0441\u043B\u0430\u0442\u0438",
    "commit.pushNoBranch": "\u0416\u043E\u0434\u043D\u0430 \u0433\u0456\u043B\u043A\u0430 \u043D\u0435 \u043C\u0456\u0441\u0442\u0438\u0442\u044C \u0446\u0435\u0439 \u043A\u043E\u043C\u0456\u0442",
    "commit.dirtyWorkingTree": "\u0417\u0430\u043A\u043E\u043C\u0456\u0442\u044C\u0442\u0435 \u0430\u0431\u043E \u0441\u0445\u043E\u0432\u0430\u0439\u0442\u0435 \u0437\u043C\u0456\u043D\u0438 \u043F\u0435\u0440\u0435\u0434 \u043F\u0435\u0440\u0435\u0437\u0430\u043F\u0438\u0441\u043E\u043C \u0456\u0441\u0442\u043E\u0440\u0456\u0457",
    "commit.revertDone": "\u0421\u043A\u0430\u0441\u043E\u0432\u0430\u043D\u043E {hash}",
    "commit.revertFailed": "\u041D\u0435 \u0432\u0434\u0430\u043B\u043E\u0441\u044F \u0441\u043A\u0430\u0441\u0443\u0432\u0430\u0442\u0438 \u043A\u043E\u043C\u0456\u0442",
    "commit.revertConflict": "\u041A\u043E\u043D\u0444\u043B\u0456\u043A\u0442 revert, \u0440\u043E\u0437\u0432'\u044F\u0436\u0456\u0442\u044C \u0439\u043E\u0433\u043E \u0442\u0430 \u043F\u0440\u043E\u0434\u043E\u0432\u0436\u0442\u0435 \u0430\u0431\u043E \u0441\u043A\u0430\u0441\u0443\u0439\u0442\u0435",
    "op.failed": "\u041F\u043E\u043C\u0438\u043B\u043A\u0430 \u043E\u043F\u0435\u0440\u0430\u0446\u0456\u0457",
    "op.conflict": "\u041A\u043E\u043D\u0444\u043B\u0456\u043A\u0442 \u0437\u043B\u0438\u0442\u0442\u044F",
    "op.authFailed": "\u041F\u043E\u043C\u0438\u043B\u043A\u0430 \u0430\u0432\u0442\u0435\u043D\u0442\u0438\u0444\u0456\u043A\u0430\u0446\u0456\u0457",
    "op.unreachable": "\u0412\u0456\u0434\u0434\u0430\u043B\u0435\u043D\u0438\u0439 \u0440\u0435\u043F\u043E\u0437\u0438\u0442\u043E\u0440\u0456\u0439 \u043D\u0435\u0434\u043E\u0441\u0442\u0443\u043F\u043D\u0438\u0439",
    "op.rejected": "\u041D\u0430\u0434\u0441\u0438\u043B\u0430\u043D\u043D\u044F \u0432\u0456\u0434\u0445\u0438\u043B\u0435\u043D\u043E, \u0441\u043F\u0435\u0440\u0448\u0443 \u043E\u0442\u0440\u0438\u043C\u0430\u0439\u0442\u0435 \u0437\u043C\u0456\u043D\u0438",
    "op.checkoutDone": "\u041F\u0435\u0440\u0435\u043A\u043B\u044E\u0447\u0435\u043D\u043E \u043D\u0430 {name}",
    "op.mergeDone": "\u0417\u043B\u0438\u0442\u043E {name}",
    "op.rebaseDone": "\u041F\u0435\u0440\u0435\u0431\u0430\u0437\u043E\u0432\u0430\u043D\u043E \u043D\u0430 {name}",
    "op.pullDone": "\u041E\u0442\u0440\u0438\u043C\u0430\u043D\u043E",
    "op.pushDone": "\u041D\u0430\u0434\u0456\u0441\u043B\u0430\u043D\u043E",
    "op.deleteDone": "\u0413\u0456\u043B\u043A\u0443 {name} \u0432\u0438\u0434\u0430\u043B\u0435\u043D\u043E",
    "worktree.refresh": "\u041E\u043D\u043E\u0432\u0438\u0442\u0438",
    "worktree.add": "\u0414\u043E\u0434\u0430\u0442\u0438 worktree",
    "worktree.prune": "\u041E\u0447\u0438\u0441\u0442\u0438\u0442\u0438",
    "worktree.empty": "\u041D\u0435\u043C\u0430\u0454 worktree",
    "worktree.main": "\u043E\u0441\u043D\u043E\u0432\u043D\u0435",
    "worktree.remove": "\u0412\u0438\u0434\u0430\u043B\u0438\u0442\u0438",
    "worktree.removeConfirm": "\u0412\u0438\u0434\u0430\u043B\u0438\u0442\u0438 worktree {path}?",
    "worktree.forceConfirm": "\u0404 \u043D\u0435\u0437\u0431\u0435\u0440\u0435\u0436\u0435\u043D\u0456 \u0437\u043C\u0456\u043D\u0438. \u041F\u0440\u0438\u043C\u0443\u0441\u043E\u0432\u043E \u0432\u0438\u0434\u0430\u043B\u0438\u0442\u0438?",
    "worktree.loadFailed": "\u041D\u0435 \u0432\u0434\u0430\u043B\u043E\u0441\u044F \u0437\u0430\u0432\u0430\u043D\u0442\u0430\u0436\u0438\u0442\u0438 worktree",
    "worktree.addPathPrompt": "\u0426\u0456\u043B\u044C\u043E\u0432\u0438\u0439 \u0448\u043B\u044F\u0445 \u043D\u043E\u0432\u043E\u0433\u043E worktree:",
    "worktree.addBranchPrompt": "\u041D\u0430\u0437\u0432\u0430 \u043D\u043E\u0432\u043E\u0457 \u0433\u0456\u043B\u043A\u0438 (\u043D\u0430 \u043E\u0441\u043D\u043E\u0432\u0456 {base}):",
    "worktree.addFailed": "\u041D\u0435 \u0432\u0434\u0430\u043B\u043E\u0441\u044F \u0441\u0442\u0432\u043E\u0440\u0438\u0442\u0438 worktree",
    "batch.revertDone": "\u0421\u043A\u0430\u0441\u043E\u0432\u0430\u043D\u043E {n} \u043A\u043E\u043C\u0456\u0442\u0456\u0432",
    "op.newBranchDone": "\u0413\u0456\u043B\u043A\u0443 {name} \u0441\u0442\u0432\u043E\u0440\u0435\u043D\u043E",
    "op.newBranchFailed": "\u041D\u0435 \u0432\u0434\u0430\u043B\u043E\u0441\u044F \u0441\u0442\u0432\u043E\u0440\u0438\u0442\u0438 \u0433\u0456\u043B\u043A\u0443",
    "worktree.refreshed": "\u0421\u043F\u0438\u0441\u043E\u043A worktree \u043E\u043D\u043E\u0432\u043B\u0435\u043D\u043E",
    "worktree.pruneDone": "\u041E\u0447\u0438\u0449\u0435\u043D\u043E {n} \u0437\u0430\u0441\u0442\u0430\u0440\u0456\u043B\u0438\u0445 worktree",
    "worktree.pruneNothing": "\u041D\u0435\u043C\u0430\u0454 \u0437\u0430\u0441\u0442\u0430\u0440\u0456\u043B\u0438\u0445 worktree",
    "worktree.pruneFailed": "\u041D\u0435 \u0432\u0434\u0430\u043B\u043E\u0441\u044F \u043E\u0447\u0438\u0441\u0442\u0438\u0442\u0438",
    "worktree.removed": "Worktree \u0432\u0438\u0434\u0430\u043B\u0435\u043D\u043E",
    "worktree.added": "Worktree \u0441\u0442\u0432\u043E\u0440\u0435\u043D\u043E: {path}",
    "op.branchDirtyWorkingTree": "\u0441\u043F\u0435\u0440\u0448\u0443 \u0437\u0430\u043A\u043E\u043C\u0456\u0442\u044C\u0442\u0435 \u0430\u0431\u043E \u0441\u0445\u043E\u0432\u0430\u0439\u0442\u0435 \u0437\u043C\u0456\u043D\u0438",
    "op.branchExists": "\u0433\u0456\u043B\u043A\u0430 \u0432\u0436\u0435 \u0456\u0441\u043D\u0443\u0454",
    "op.branchInvalidName": "\u043D\u0435\u043F\u0440\u0438\u043F\u0443\u0441\u0442\u0438\u043C\u0430 \u043D\u0430\u0437\u0432\u0430 \u0433\u0456\u043B\u043A\u0438",
    "op.branchCreateGeneric": "\u043F\u043E\u0434\u0440\u043E\u0431\u0438\u0446\u0456 \u0432 \u043A\u043E\u043D\u0441\u043E\u043B\u0456",
    "console.commandCount": "\u043A\u043E\u043C\u0430\u043D\u0434 git",
    "console.clear": "\u041E\u0447\u0438\u0441\u0442\u0438\u0442\u0438",
    "console.noCommands": "\u041A\u043E\u043C\u0430\u043D\u0434 git \u0449\u0435 \u043D\u0435\u043C\u0430\u0454",
    "console.selectCommand": "\u0412\u0438\u0431\u0435\u0440\u0456\u0442\u044C \u043A\u043E\u043C\u0430\u043D\u0434\u0443",
    "console.noOutput": "(\u043D\u0435\u043C\u0430\u0454 \u0432\u0438\u0432\u043E\u0434\u0443)",
    "console.loadFailed": "\u041D\u0435 \u0432\u0434\u0430\u043B\u043E\u0441\u044F \u0437\u0430\u0432\u0430\u043D\u0442\u0430\u0436\u0438\u0442\u0438 \u0436\u0443\u0440\u043D\u0430\u043B",
    "op.resetFailed": "\u041D\u0435 \u0432\u0434\u0430\u043B\u043E\u0441\u044F \u0441\u043A\u0438\u043D\u0443\u0442\u0438",
    "branch.favoriteSaveFailed": "\u041D\u0435 \u0432\u0434\u0430\u043B\u043E\u0441\u044F \u0437\u0431\u0435\u0440\u0435\u0433\u0442\u0438 \u043E\u0431\u0440\u0430\u043D\u0435",
    "dialog.renameFailed": "\u041D\u0435 \u0432\u0434\u0430\u043B\u043E\u0441\u044F \u043F\u0435\u0440\u0435\u0439\u043C\u0435\u043D\u0443\u0432\u0430\u0442\u0438 \u0433\u0456\u043B\u043A\u0443",
    "dialog.createBranchFailed": "\u041D\u0435 \u0432\u0434\u0430\u043B\u043E\u0441\u044F \u0441\u0442\u0432\u043E\u0440\u0438\u0442\u0438 \u0433\u0456\u043B\u043A\u0443",
    "branch.loadFailed": "\u041D\u0435 \u0432\u0434\u0430\u043B\u043E\u0441\u044F \u0437\u0430\u0432\u0430\u043D\u0442\u0430\u0436\u0438\u0442\u0438 \u0433\u0456\u043B\u043A\u0438",
    "commit.loadDetailFailed": "\u041D\u0435 \u0432\u0434\u0430\u043B\u043E\u0441\u044F \u0437\u0430\u0432\u0430\u043D\u0442\u0430\u0436\u0438\u0442\u0438 \u043F\u043E\u0434\u0440\u043E\u0431\u0438\u0446\u0456 \u043A\u043E\u043C\u0456\u0442\u0443",
    "commit.loadListFailed": "\u041D\u0435 \u0432\u0434\u0430\u043B\u043E\u0441\u044F \u0437\u0430\u0432\u0430\u043D\u0442\u0430\u0436\u0438\u0442\u0438 \u043A\u043E\u043C\u0456\u0442\u0438",
    "worktree.removeFailed": "\u041D\u0435 \u0432\u0434\u0430\u043B\u043E\u0441\u044F \u0432\u0438\u0434\u0430\u043B\u0438\u0442\u0438 worktree"
  };
  var es = {
    "branch.checkout": "Checkout de la rama",
    "branch.rename": "Renombrar rama",
    "branch.merge": "Fusionar en la rama actual",
    "branch.rebase": "Rebase aqu\xED",
    "branch.pull": "Pull",
    "branch.push": "Push",
    "branch.favorite": "A\xF1adir a favoritos",
    "branch.unfavorite": "Quitar de favoritos",
    "branch.delete": "Eliminar rama",
    // 未合并强制删除对话框 + 删除通知（对齐 IDEA GitDeleteBranchOperation）
    "branch.forceDelete": "La rama {name} no se ha fusionado con la rama actual. La eliminaci\xF3n forzada har\xE1 perder sus commits.",
    "branch.forceDeleteButton": "Eliminar de forma forzada",
    "branch.notFound": "La rama {name} no existe",
    "branch.deleteFailed": "Error al eliminar la rama",
    "sidebar.deleteBranch": "Eliminar rama",
    "branch.batchDeleteDone": "Se eliminaron {n} ramas",
    "branch.batchDeletePartial": "Se eliminaron {ok} ramas, fallaron: {failed}",
    "branch.selectBranch": "Primero seleccione una rama",
    "branch.deleteCurrent": "No se puede eliminar la rama actual",
    "branch.title": "Branches",
    "branch.searchPlaceholder": "Rama o etiqueta",
    "branch.notifyDeleted": "Rama eliminada: {name}",
    "branch.restore": "Restaurar",
    "branch.deleteTracking": "Eliminar rama de seguimiento",
    "branch.restoreSuccess": "La rama {name} se ha restaurado",
    "branch.restoreFailed": "Error al restaurar la rama",
    "branch.deleteTrackingFailed": "Error al eliminar la rama de seguimiento",
    "commit.copyRevision": "Copiar hash del commit",
    "commit.cherryPick": "Cherry-pick",
    "commit.compareLocal": "Comparar con local",
    "commit.reset": "Restablecer la rama actual aqu\xED",
    "commit.revert": "Revertir commit",
    "commit.newBranch": "Nueva rama",
    "commit.newTag": "Nueva etiqueta",
    "batch.selected": "{n} commits seleccionados",
    "batch.copyHashes": "Copiar lista de hashes",
    "batch.cherryPickAll": "Cherry-pick de todos ({n})",
    "batch.revertAll": "Revertir todos ({n})",
    "batch.confirmCherryPick": "\xBFCherry-pick de los {n} commits seleccionados?",
    "batch.confirmRevert": "\xBFRevertir los {n} commits seleccionados?",
    "file.showDiff": "Mostrar diff",
    "file.showDiffNew": "Mostrar diff en una ventana nueva",
    "file.compareLocal": "Comparar con local",
    "file.compareBeforeLocal": "Comparar antes con local",
    "file.editSource": "Editar c\xF3digo fuente",
    "file.openRepoVersion": "Abrir versi\xF3n del repositorio",
    "file.revertChanges": "Revertir cambios seleccionados",
    "file.cherryPickChanges": "Cherry-pick de cambios seleccionados",
    "file.createPatch": "Crear parche",
    "file.getFromRevision": "Obtener de la revisi\xF3n",
    "file.historyUpTo": "Historia hasta aqu\xED",
    // 侧边栏图标 / 显示设置 / 跳转 / 排序
    "sidebar.hideBranches": "Ocultar ramas de Git",
    "sidebar.showBranches": "Mostrar ramas de Git",
    "sidebar.newBranch": "Nueva rama",
    "sidebar.refresh": "Actualizar",
    "sidebar.update": "Actualizar",
    "sidebar.checkout": "Checkout",
    "sidebar.merge": "Fusionar",
    "sidebar.search": "Buscar",
    "sidebar.favorite": "Favorito",
    "sidebar.settings": "Configuraci\xF3n",
    "sidebar.pull": "Pull",
    "sidebar.expandAll": "Expandir todo",
    "sidebar.sort": "Ordenar",
    "sidebar.close": "Cerrar",
    "sidebar.noSelectedBranch": "Ninguna rama seleccionada",
    "settings.title": "Configuraci\xF3n de visualizaci\xF3n",
    "settings.showAuthor": "Mostrar columna de autor",
    "settings.showDate": "Mostrar columna de fecha",
    "settings.showHash": "Mostrar columna de hash",
    "goto.title": "Ir a la referencia",
    "goto.placeholder": "Introducir hash o nombre de la rama",
    "goto.notFound": "No se encontraron coincidencias",
    "goto.ok": "Ir",
    "sort.dateAsc": "Ordenar: fecha ascendente",
    "sort.authorAsc": "Ordenar: autor",
    "sort.messageAsc": "Ordenar: mensaje",
    // 工具栏过滤（分支 / 用户 / 日期 / 路径）
    "filter.branch": "Rama",
    "filter.user": "Usuario",
    "filter.date": "Fecha",
    "filter.path": "Ruta",
    "filter.selectAll": "Seleccionar todo",
    "filter.regex": "Expresi\xF3n regular",
    "filter.case": "Distinguir may\xFAsculas",
    "filter.all": "Todos",
    "filter.localBranches": "Ramas locales",
    "filter.remoteBranches": "Ramas remotas",
    "filter.favorites": "Favoritos",
    "filter.today": "Hoy",
    "filter.thisWeek": "Esta semana",
    "filter.thisMonth": "Este mes",
    "filter.thisYear": "Este a\xF1o",
    "filter.custom": "Personalizado\u2026",
    "filter.dateFrom": "Fecha de inicio",
    "filter.dateTo": "Fecha de fin",
    "filter.chooseFolder": "Elegir carpeta\u2026",
    "filter.ok": "Aceptar",
    "filter.cancel": "Cancelar",
    "filter.clear": "Borrar",
    // 路径过滤（多选）
    "filter.selectPaths": "Seleccionar rutas para filtrar",
    "filter.editPaths": "Editar rutas\u2026",
    "filter.maxPaths": "M\xE1ximo 100 rutas permitidas",
    "filter.noPaths": "No hay rutas seleccionables",
    "filter.loadPathsFailed": "Error al cargar las rutas",
    "dialog.renameBranch": "Renombrar rama",
    "dialog.branchName": "Nombre de la rama",
    "dialog.startPoint": "Punto de partida",
    "dialog.currentHead": "HEAD actual",
    "dialog.inputBranchName": "Introducir nombre de la rama\u2026",
    "dialog.checkoutAfterCreate": "Cambiar a la rama tras crear",
    "dialog.create": "Crear",
    "dialog.dateFilter": "Filtrar por fecha",
    "dialog.startDate": "Fecha de inicio",
    "dialog.endDate": "Fecha de fin",
    "dialog.clear": "Borrar",
    "dialog.resetTo": "Restablecer rama a {hash}",
    "dialog.selectResetMode": "Seleccionar modo de restablecimiento:",
    "dialog.resetSoft": "Soft - solo mover HEAD",
    "dialog.resetMixed": "Mixed - mover HEAD + restablecer \xEDndice (predeterminado)",
    "dialog.resetHard": "Hard - mover HEAD + restablecer \xEDndice y \xE1rbol de trabajo",
    "dialog.reset": "Restablecer",
    "dialog.branchFromCommit": "Crear rama a partir del commit",
    "dialog.basedOn": "Basado en: {info}",
    "commit.searchPlaceholder": "Texto o hash",
    "branch.groupHead": "HEAD (rama actual)",
    "branch.groupLocal": "Local",
    "branch.groupRemote": "Remota",
    "file.noDiff": "Sin diferencias",
    "file.changedFiles": "Archivos modificados",
    "detail.title": "Detalles del commit",
    "detail.hash": "Hash",
    "detail.author": "Autor",
    "detail.date": "Fecha",
    "main.loadingTitle": "Inicializando\u2026",
    "main.loadingBody": "Cargando informaci\xF3n del proyecto.",
    "main.notGitTitle": "No es un repositorio Git",
    "main.notGitBody": "El directorio actual no es un repositorio Git.",
    "time.justNow": "hace un momento",
    "time.minutesAgo": "hace {n} min",
    "time.hoursAgo": "hace {n} h",
    "time.daysAgo": "hace {n} d",
    "commit.empty": "Sin commits",
    "commit.noSelection": "Seleccione un commit para ver los cambios",
    "file.selectDiff": "Seleccione un archivo para ver las diferencias",
    "file.noChanges": "Sin archivos modificados",
    "layout.resizeDivider": "Arrastra para cambiar el tama\xF1o",
    "main.tabConsole": "Consola",
    "reset.title": "Restablecer la rama actual aqu\xED",
    "reset.softDesc": "conservar \xE1rbol de trabajo e \xEDndice",
    "reset.mixedDesc": "conservar \xE1rbol de trabajo, restablecer \xEDndice",
    "reset.hardDesc": "descartar todos los cambios",
    "dialog.createBranchTitle": "Nueva rama",
    "dialog.pathPlaceholder": "src/ o packages/core",
    "dialog.cancel": "Cancelar",
    "dialog.ok": "Aceptar",
    "filter.selectAllToggle": "Seleccionar todo / deseleccionar en la lista actual",
    "sidebar.compareBranch": "Comparar con la rama actual",
    "compare.title": "Comparando {branch} con {current}",
    "compare.branchOnly": "Exclusivos de {branch}",
    "compare.currentOnly": "Exclusivos de {current}",
    "compare.empty": "Sin commits",
    "compare.loading": "Cargando\u2026",
    "compare.loadFailed": "Error al comparar las ramas",
    "compare.selectBranch": "Primero seleccione una rama",
    "compare.currentBranch": "La rama actual no se puede comparar consigo misma",
    "compare.noCurrentBranch": "La rama actual a\xFAn no se ha cargado, int\xE9ntelo de nuevo",
    "compare.with": "con",
    "compare.identical": "Las ramas son id\xE9nticas",
    "compare.sameBranch": "Seleccione dos ramas diferentes",
    "compare.tooMany": "Seleccione como m\xE1ximo dos ramas para comparar",
    "sidebar.showMyBranches": "Mostrar mis ramas",
    "sidebar.myBranchesFailed": "Error al cargar mis ramas",
    "sidebar.showMyBranchesOn": "Mostrando solo mis ramas",
    "sidebar.myBranchesUnavailable": "No hay ramas locales que filtrar",
    "sidebar.newBranchUnavailable": "No hay rama base",
    "sidebar.updateUnavailable": "No hay remoto configurado",
    "sidebar.deleteRemoteUnavailable": "Las ramas remotas no se pueden eliminar aqu\xED",
    "sidebar.expandAllUnavailable": "No hay ramas que expandir",
    "sidebar.pullUnavailable": "No hay remoto configurado",
    "sidebar.fetch": "Obtener cambios",
    "sidebar.locate": "Mostrar en el registro Git",
    "sidebar.collapseAll": "Contraer todo",
    "sidebar.locateNotInView": "El \xFAltimo commit de {branch} no est\xE1 en la vista actual",
    "sidebar.fetchAuthFailed": "Error de autenticaci\xF3n",
    "sidebar.fetchUnreachable": "Remoto inaccesible",
    "sidebar.fetchNoRemote": "Repositorio remoto no encontrado",
    "sidebar.fetchFailed": "Error al obtener cambios",
    "sidebar.fetchInProgress": "Obteniendo cambios\u2026",
    "sidebar.fetchSuccessUpdates": "Obtenido: {count} rama(s) con nuevos commits",
    "sidebar.fetchSuccessNoUpdates": "Obtenido: ya est\xE1 actualizado",
    "settings.groupView": "Vista",
    "settings.groupGraph": "Grafo",
    "settings.showBranchLabels": "Mostrar etiquetas de rama",
    "settings.showTagNames": "Nombres de etiquetas",
    "settings.compactReferences": "Vista compacta de referencias",
    "settings.preferCommitDate": "Marca de tiempo del commit",
    "settings.referencesOnLeft": "Referencias a la izquierda",
    "settings.showLongEdges": "Aristas largas",
    "commit.copied": "Copiado al portapapeles",
    "commit.copyFailed": "Error al copiar",
    "commit.cherryPickNoSelection": "Seleccione un commit primero",
    "commit.cherryPickDoneMulti": "Se aplic\xF3 cherry-pick a {n} commits",
    "commit.cherryPickDone": "Cherry-pick aplicado a {hash}",
    "commit.cherryPickFailed": "Error al aplicar cherry-pick",
    "commit.cherryPickConflict": "Conflicto de cherry-pick, resu\xE9lvelo y contin\xFAa o aborta",
    "batch.cherryPickDone": "{n} commits aplicados con cherry-pick",
    "commit.uncommit": "Deshacer commit",
    "commit.uncommitDone": "Commit {hash} deshecho",
    "commit.uncommitFailed": "Error al deshacer el commit",
    "commit.reword": "Editar mensaje del commit",
    "commit.rewordTitle": "Editar mensaje del commit",
    "commit.rewordEmpty": "El mensaje no puede estar vac\xEDo",
    "commit.rewordDone": "Mensaje del commit actualizado",
    "commit.dropCommit": "Eliminar commit",
    "commit.dropConfirm": "\xBFEliminar el commit {hash}? Se reescribir\xE1 el historial.",
    "commit.dropDone": "Commit {hash} eliminado",
    "commit.dropFailed": "Error al eliminar el commit",
    "commit.pushUpTo": "Enviar commits hasta aqu\xED",
    "commit.pushUpToDone": "Enviado {ref}",
    "commit.pushUpToRejected": "Env\xEDo rechazado, obtenga primero",
    "commit.pushUpToFailed": "Error al enviar",
    "commit.pushNoBranch": "Ninguna rama contiene este commit",
    "commit.dirtyWorkingTree": "Confirme o guarde los cambios antes de reescribir el historial",
    "commit.revertDone": "{hash} revertido",
    "commit.revertFailed": "Error al revertir",
    "commit.revertConflict": "Conflicto de revert, resu\xE9lvelo y contin\xFAa o aborta",
    "op.failed": "Error en la operaci\xF3n",
    "op.conflict": "Conflicto de fusi\xF3n",
    "op.authFailed": "Error de autenticaci\xF3n",
    "op.unreachable": "Remoto inaccesible",
    "op.rejected": "Env\xEDo rechazado, obtenga primero",
    "op.checkoutDone": "Cambiado a {name}",
    "op.mergeDone": "{name} fusionado",
    "op.rebaseDone": "Rebasado sobre {name}",
    "op.pullDone": "Obtenido",
    "op.pushDone": "Enviado",
    "op.deleteDone": "Rama {name} eliminada",
    "worktree.refresh": "Actualizar",
    "worktree.add": "A\xF1adir worktree",
    "worktree.prune": "Limpiar",
    "worktree.empty": "Sin worktrees",
    "worktree.main": "principal",
    "worktree.remove": "Eliminar",
    "worktree.removeConfirm": "\xBFEliminar el worktree {path}?",
    "worktree.forceConfirm": "Tiene cambios sin confirmar. \xBFForzar eliminaci\xF3n?",
    "worktree.loadFailed": "Error al cargar los worktrees",
    "worktree.addPathPrompt": "Ruta destino del nuevo worktree:",
    "worktree.addBranchPrompt": "Nombre de la nueva rama (basada en {base}):",
    "worktree.addFailed": "Error al a\xF1adir el worktree",
    "batch.revertDone": "{n} commits revertidos",
    "op.newBranchDone": "Rama {name} creada",
    "op.newBranchFailed": "Error al crear la rama",
    "worktree.refreshed": "Lista de worktrees actualizada",
    "worktree.pruneDone": "Se limpiaron {n} worktree(s) obsoleto(s)",
    "worktree.pruneNothing": "No hay worktrees obsoletos que limpiar",
    "worktree.pruneFailed": "Error al limpiar",
    "worktree.removed": "Worktree eliminado",
    "worktree.added": "Worktree creado en {path}",
    "op.branchDirtyWorkingTree": "confirme o guarde los cambios primero",
    "op.branchExists": "la rama ya existe",
    "op.branchInvalidName": "nombre de rama no v\xE1lido",
    "op.branchCreateGeneric": "ver detalles en la consola",
    "console.commandCount": "comandos git",
    "console.clear": "Limpiar",
    "console.noCommands": "A\xFAn no hay comandos git",
    "console.selectCommand": "Seleccione un comando",
    "console.noOutput": "(sin salida)",
    "console.loadFailed": "Error al cargar el registro",
    "op.resetFailed": "Error al restablecer",
    "branch.favoriteSaveFailed": "Error al guardar los favoritos",
    "dialog.renameFailed": "Error al renombrar la rama",
    "dialog.createBranchFailed": "Error al crear la rama",
    "branch.loadFailed": "Error al cargar las ramas",
    "commit.loadDetailFailed": "Error al cargar los detalles del commit",
    "commit.loadListFailed": "Error al cargar los commits",
    "worktree.removeFailed": "Error al eliminar el worktree"
  };
  var ptBR = {
    "branch.checkout": "Fazer checkout do branch",
    "branch.rename": "Renomear branch",
    "branch.merge": "Merge no branch atual",
    "branch.rebase": "Rebase aqui",
    "branch.pull": "Pull",
    "branch.push": "Push",
    "branch.favorite": "Adicionar aos favoritos",
    "branch.unfavorite": "Remover dos favoritos",
    "branch.delete": "Excluir branch",
    // 未合并强制删除对话框 + 删除通知（对齐 IDEA GitDeleteBranchOperation）
    "branch.forceDelete": "O branch {name} n\xE3o foi mesclado no branch atual. A exclus\xE3o for\xE7ada far\xE1 com que seus commits sejam perdidos.",
    "branch.forceDeleteButton": "Exclus\xE3o for\xE7ada",
    "branch.notFound": "O branch {name} n\xE3o existe",
    "branch.deleteFailed": "Falha ao excluir o branch",
    "sidebar.deleteBranch": "Excluir branch",
    "branch.batchDeleteDone": "{n} branches exclu\xEDdos",
    "branch.batchDeletePartial": "{ok} branch(es) exclu\xEDdo(s), falhou: {failed}",
    "branch.selectBranch": "Selecione uma branch primeiro",
    "branch.deleteCurrent": "N\xE3o \xE9 poss\xEDvel excluir a branch atual",
    "branch.title": "\u0413\u0456\u043B\u043A\u0438",
    "branch.searchPlaceholder": "Branch ou tag",
    "branch.notifyDeleted": "Branch exclu\xEDdo: {name}",
    "branch.restore": "Restaurar",
    "branch.deleteTracking": "Excluir branch de rastreamento",
    "branch.restoreSuccess": "O branch {name} foi restaurado",
    "branch.restoreFailed": "Falha ao restaurar o branch",
    "branch.deleteTrackingFailed": "Falha ao excluir o branch de rastreamento",
    "commit.copyRevision": "Copiar hash do commit",
    "commit.cherryPick": "Cherry-pick",
    "commit.compareLocal": "Comparar com local",
    "commit.reset": "Redefinir o branch atual para aqui",
    "commit.revert": "Reverter commit",
    "commit.newBranch": "Novo branch",
    "commit.newTag": "Nova tag",
    "batch.selected": "{n} commits selecionados",
    "batch.copyHashes": "Copiar lista de hashes",
    "batch.cherryPickAll": "Cherry-pick de todos ({n})",
    "batch.revertAll": "Reverter todos ({n})",
    "batch.confirmCherryPick": "Fazer cherry-pick dos {n} commits selecionados?",
    "batch.confirmRevert": "Reverter os {n} commits selecionados?",
    "file.showDiff": "Mostrar diff",
    "file.showDiffNew": "Mostrar diff em nova janela",
    "file.compareLocal": "Comparar com local",
    "file.compareBeforeLocal": "Comparar antes com local",
    "file.editSource": "Editar c\xF3digo-fonte",
    "file.openRepoVersion": "Abrir vers\xE3o do reposit\xF3rio",
    "file.revertChanges": "Reverter altera\xE7\xF5es selecionadas",
    "file.cherryPickChanges": "Cherry-pick das altera\xE7\xF5es selecionadas",
    "file.createPatch": "Criar patch",
    "file.getFromRevision": "Obter da revis\xE3o",
    "file.historyUpTo": "Hist\xF3rico at\xE9 aqui",
    // 侧边栏图标 / 显示设置 / 跳转 / 排序
    "sidebar.hideBranches": "Ocultar branches do Git",
    "sidebar.showBranches": "Mostrar branches do Git",
    "sidebar.newBranch": "Novo branch",
    "sidebar.refresh": "Atualizar",
    "sidebar.update": "Atualizar",
    "sidebar.checkout": "Checkout",
    "sidebar.merge": "Merge",
    "sidebar.search": "Buscar",
    "sidebar.favorite": "Favorito",
    "sidebar.settings": "Configura\xE7\xF5es",
    "sidebar.pull": "Pull",
    "sidebar.expandAll": "Expandir tudo",
    "sidebar.sort": "Ordenar",
    "sidebar.close": "Fechar",
    "sidebar.noSelectedBranch": "Nenhum branch selecionado",
    "settings.title": "Configura\xE7\xF5es de exibi\xE7\xE3o",
    "settings.showAuthor": "Mostrar coluna de autor",
    "settings.showDate": "Mostrar coluna de data",
    "settings.showHash": "Mostrar coluna de hash",
    "goto.title": "Ir para a refer\xEAncia",
    "goto.placeholder": "Digite o hash ou o nome do branch",
    "goto.notFound": "Nenhuma correspond\xEAncia encontrada",
    "goto.ok": "Ir",
    "sort.dateAsc": "Ordenar: data crescente",
    "sort.authorAsc": "Ordenar: autor",
    "sort.messageAsc": "Ordenar: mensagem",
    // 工具栏过滤（分支 / 用户 / 日期 / 路径）
    "filter.branch": "Branch",
    "filter.user": "Usu\xE1rio",
    "filter.date": "Data",
    "filter.path": "Caminho",
    "filter.selectAll": "Selecionar tudo",
    "filter.regex": "Express\xE3o regular",
    "filter.case": "Diferenciar mai\xFAsculas",
    "filter.all": "Todos",
    "filter.localBranches": "Branches locais",
    "filter.remoteBranches": "Branches remotos",
    "filter.favorites": "Favoritos",
    "filter.today": "Hoje",
    "filter.thisWeek": "Esta semana",
    "filter.thisMonth": "Este m\xEAs",
    "filter.thisYear": "Este ano",
    "filter.custom": "Personalizado\u2026",
    "filter.dateFrom": "Data de in\xEDcio",
    "filter.dateTo": "Data de t\xE9rmino",
    "filter.chooseFolder": "Escolher pasta\u2026",
    "filter.ok": "OK",
    "filter.cancel": "Cancelar",
    "filter.clear": "Limpar",
    // 路径过滤（多选）
    "filter.selectPaths": "Selecionar caminhos para filtrar",
    "filter.editPaths": "Editar caminhos\u2026",
    "filter.maxPaths": "No m\xE1ximo 100 caminhos permitidos",
    "filter.noPaths": "Nenhum caminho selecion\xE1vel",
    "filter.loadPathsFailed": "Falha ao carregar os caminhos",
    "dialog.renameBranch": "Renomear branch",
    "dialog.branchName": "Nome do branch",
    "dialog.startPoint": "Ponto de partida",
    "dialog.currentHead": "HEAD atual",
    "dialog.inputBranchName": "Digite o nome do branch\u2026",
    "dialog.checkoutAfterCreate": "Mudar para ap\xF3s criar",
    "dialog.create": "Criar",
    "dialog.dateFilter": "Filtrar por data",
    "dialog.startDate": "Data de in\xEDcio",
    "dialog.endDate": "Data de t\xE9rmino",
    "dialog.clear": "Limpar",
    "dialog.resetTo": "Redefinir branch para {hash}",
    "dialog.selectResetMode": "Selecionar modo de redefini\xE7\xE3o:",
    "dialog.resetSoft": "Soft - mover apenas o HEAD",
    "dialog.resetMixed": "Mixed - mover HEAD + redefinir \xEDndice (padr\xE3o)",
    "dialog.resetHard": "Hard - mover HEAD + redefinir \xEDndice e \xE1rvore de trabalho",
    "dialog.reset": "Redefinir",
    "dialog.branchFromCommit": "Criar branch a partir do commit",
    "dialog.basedOn": "Baseado em: {info}",
    "commit.searchPlaceholder": "Texto ou hash",
    "branch.groupHead": "HEAD (branch atual)",
    "branch.groupLocal": "Local",
    "branch.groupRemote": "Remoto",
    "file.noDiff": "Sem diferen\xE7as",
    "file.changedFiles": "Arquivos modificados",
    "detail.title": "Detalhes do commit",
    "detail.hash": "Hash",
    "detail.author": "Autor",
    "detail.date": "Data",
    "main.loadingTitle": "Inicializando\u2026",
    "main.loadingBody": "Carregando informa\xE7\xF5es do projeto.",
    "main.notGitTitle": "N\xE3o \xE9 um reposit\xF3rio Git",
    "main.notGitBody": "O diret\xF3rio atual n\xE3o \xE9 um reposit\xF3rio Git.",
    "time.justNow": "agora mesmo",
    "time.minutesAgo": "{n} min atr\xE1s",
    "time.hoursAgo": "{n} h atr\xE1s",
    "time.daysAgo": "{n} d atr\xE1s",
    "commit.empty": "Sem commits",
    "commit.noSelection": "Selecione um commit para ver as altera\xE7\xF5es",
    "file.selectDiff": "Selecione um arquivo para ver as diferen\xE7as",
    "file.noChanges": "Sem arquivos modificados",
    "layout.resizeDivider": "Arraste para redimensionar",
    "main.tabConsole": "Console",
    "reset.title": "Redefinir o branch atual para aqui",
    "reset.softDesc": "manter \xE1rvore de trabalho e \xEDndice",
    "reset.mixedDesc": "manter \xE1rvore de trabalho, redefinir \xEDndice",
    "reset.hardDesc": "descartar todas as altera\xE7\xF5es",
    "dialog.createBranchTitle": "Novo branch",
    "dialog.pathPlaceholder": "src/ ou packages/core",
    "dialog.cancel": "Cancelar",
    "dialog.ok": "OK",
    "filter.selectAllToggle": "Selecionar tudo / desmarcar na lista atual",
    "sidebar.compareBranch": "Comparar com o branch atual",
    "compare.title": "Comparando {branch} com {current}",
    "compare.branchOnly": "Exclusivos de {branch}",
    "compare.currentOnly": "Exclusivos de {current}",
    "compare.empty": "Sem commits",
    "compare.loading": "Carregando\u2026",
    "compare.loadFailed": "Falha ao comparar branches",
    "compare.selectBranch": "Selecione um branch primeiro",
    "compare.currentBranch": "O branch atual n\xE3o pode ser comparado consigo mesmo",
    "compare.noCurrentBranch": "O branch atual ainda n\xE3o foi carregado, tente novamente",
    "compare.with": "com",
    "compare.identical": "Os branches s\xE3o id\xEAnticos",
    "compare.sameBranch": "Selecione dois branches diferentes",
    "compare.tooMany": "Selecione no m\xE1ximo dois branches para comparar",
    "sidebar.showMyBranches": "Mostrar meus branches",
    "sidebar.myBranchesFailed": "Falha ao carregar meus branches",
    "sidebar.showMyBranchesOn": "Mostrando apenas meus branches",
    "sidebar.myBranchesUnavailable": "Nenhum branch local para filtrar",
    "sidebar.newBranchUnavailable": "Nenhum branch de origem",
    "sidebar.updateUnavailable": "Nenhum remoto configurado",
    "sidebar.deleteRemoteUnavailable": "Branches remotos n\xE3o podem ser exclu\xEDdos aqui",
    "sidebar.expandAllUnavailable": "Nenhum branch para expandir",
    "sidebar.pullUnavailable": "Nenhum remoto configurado",
    "sidebar.fetch": "Buscar altera\xE7\xF5es",
    "sidebar.locate": "Mostrar no log do Git",
    "sidebar.collapseAll": "Recolher tudo",
    "sidebar.locateNotInView": "O commit mais recente de {branch} n\xE3o est\xE1 na visualiza\xE7\xE3o atual",
    "sidebar.fetchAuthFailed": "Falha na autentica\xE7\xE3o",
    "sidebar.fetchUnreachable": "Remoto inacess\xEDvel",
    "sidebar.fetchNoRemote": "Reposit\xF3rio remoto n\xE3o encontrado",
    "sidebar.fetchFailed": "Falha ao buscar altera\xE7\xF5es",
    "sidebar.fetchInProgress": "Buscando altera\xE7\xF5es\u2026",
    "sidebar.fetchSuccessUpdates": "Buscado: {count} branch(es) com novos commits",
    "sidebar.fetchSuccessNoUpdates": "Buscado: j\xE1 atualizado",
    "settings.groupView": "Exibi\xE7\xE3o",
    "settings.groupGraph": "Grafo",
    "settings.showBranchLabels": "Mostrar r\xF3tulos de branch",
    "settings.showTagNames": "Nomes das tags",
    "settings.compactReferences": "Vis\xE3o compacta de refer\xEAncias",
    "settings.preferCommitDate": "Carimbo de data do commit",
    "settings.referencesOnLeft": "Refer\xEAncias \xE0 esquerda",
    "settings.showLongEdges": "Arestas longas",
    "commit.copied": "Copiado para a \xE1rea de transfer\xEAncia",
    "commit.copyFailed": "Falha ao copiar",
    "commit.cherryPickNoSelection": "Selecione um commit primeiro",
    "commit.cherryPickDoneMulti": "Cherry-pick aplicado em {n} commits",
    "commit.cherryPickDone": "Cherry-pick aplicado em {hash}",
    "commit.cherryPickFailed": "Falha no cherry-pick",
    "commit.cherryPickConflict": "Conflito de cherry-pick, resolva e continue ou aborte",
    "batch.cherryPickDone": "{n} commits aplicados com cherry-pick",
    "commit.uncommit": "Desfazer commit",
    "commit.uncommitDone": "Commit {hash} desfeito",
    "commit.uncommitFailed": "Falha ao desfazer o commit",
    "commit.reword": "Editar mensagem do commit",
    "commit.rewordTitle": "Editar mensagem do commit",
    "commit.rewordEmpty": "A mensagem n\xE3o pode ficar vazia",
    "commit.rewordDone": "Mensagem do commit atualizada",
    "commit.dropCommit": "Excluir commit",
    "commit.dropConfirm": "Excluir o commit {hash}? O hist\xF3rico ser\xE1 reescrito.",
    "commit.dropDone": "Commit {hash} exclu\xEDdo",
    "commit.dropFailed": "Falha ao excluir o commit",
    "commit.pushUpTo": "Enviar commits at\xE9 aqui",
    "commit.pushUpToDone": "{ref} enviado",
    "commit.pushUpToRejected": "Envio rejeitado, busque primeiro",
    "commit.pushUpToFailed": "Falha ao enviar",
    "commit.pushNoBranch": "Nenhum branch cont\xE9m este commit",
    "commit.dirtyWorkingTree": "Fa\xE7a commit ou stash das altera\xE7\xF5es antes de reescrever o hist\xF3rico",
    "commit.revertDone": "{hash} revertido",
    "commit.revertFailed": "Falha ao reverter",
    "commit.revertConflict": "Conflito de revert, resolva e continue ou aborte",
    "op.failed": "Falha na opera\xE7\xE3o",
    "op.conflict": "Conflito de merge",
    "op.authFailed": "Falha na autentica\xE7\xE3o",
    "op.unreachable": "Remoto inacess\xEDvel",
    "op.rejected": "Envio rejeitado, busque primeiro",
    "op.checkoutDone": "Alterado para {name}",
    "op.mergeDone": "{name} mesclado",
    "op.rebaseDone": "Rebaseado em {name}",
    "op.pullDone": "Buscado",
    "op.pushDone": "Enviado",
    "op.deleteDone": "Branch {name} exclu\xEDdo",
    "worktree.refresh": "Atualizar",
    "worktree.add": "Adicionar worktree",
    "worktree.prune": "Limpar",
    "worktree.empty": "Nenhum worktree",
    "worktree.main": "principal",
    "worktree.remove": "Remover",
    "worktree.removeConfirm": "Remover o worktree {path}?",
    "worktree.forceConfirm": "H\xE1 altera\xE7\xF5es n\xE3o commitadas. For\xE7ar remo\xE7\xE3o?",
    "worktree.loadFailed": "Falha ao carregar os worktrees",
    "worktree.addPathPrompt": "Caminho de destino do novo worktree:",
    "worktree.addBranchPrompt": "Nome do novo branch (baseado em {base}):",
    "worktree.addFailed": "Falha ao adicionar o worktree",
    "batch.revertDone": "{n} commits revertidos",
    "op.newBranchDone": "Branch {name} criado",
    "op.newBranchFailed": "Falha ao criar o branch",
    "worktree.refreshed": "Lista de worktrees atualizada",
    "worktree.pruneDone": "{n} worktree(s) obsoleto(s) limpo(s)",
    "worktree.pruneNothing": "Nenhum worktree obsoleto para limpar",
    "worktree.pruneFailed": "Falha ao limpar",
    "worktree.removed": "Worktree removido",
    "worktree.added": "Worktree criado em {path}",
    "op.branchDirtyWorkingTree": "fa\xE7a commit ou stash das altera\xE7\xF5es primeiro",
    "op.branchExists": "o branch j\xE1 existe",
    "op.branchInvalidName": "nome de branch inv\xE1lido",
    "op.branchCreateGeneric": "detalhes no console",
    "console.commandCount": "comandos git",
    "console.clear": "Limpar",
    "console.noCommands": "Ainda n\xE3o h\xE1 comandos git",
    "console.selectCommand": "Selecione um comando",
    "console.noOutput": "(sem sa\xEDda)",
    "console.loadFailed": "Falha ao carregar o log",
    "op.resetFailed": "Falha ao redefinir",
    "branch.favoriteSaveFailed": "Falha ao salvar favoritos",
    "dialog.renameFailed": "Falha ao renomear o branch",
    "dialog.createBranchFailed": "Falha ao criar o branch",
    "branch.loadFailed": "Falha ao carregar branches",
    "commit.loadDetailFailed": "Falha ao carregar detalhes do commit",
    "commit.loadListFailed": "Falha ao carregar commits",
    "worktree.removeFailed": "Falha ao remover o worktree"
  };
  var ko = {
    "branch.checkout": "\uBE0C\uB79C\uCE58 \uCCB4\uD06C\uC544\uC6C3",
    "branch.rename": "\uBE0C\uB79C\uCE58 \uC774\uB984 \uBCC0\uACBD",
    "branch.merge": "\uD604\uC7AC \uBE0C\uB79C\uCE58\uB85C \uBCD1\uD569",
    "branch.rebase": "\uC5EC\uAE30\uB85C \uB9AC\uBCA0\uC774\uC2A4",
    "branch.pull": "\uD480",
    "branch.push": "\uD478\uC2DC",
    "branch.favorite": "\uC990\uACA8\uCC3E\uAE30\uC5D0 \uCD94\uAC00",
    "branch.unfavorite": "\uC990\uACA8\uCC3E\uAE30\uC5D0\uC11C \uC81C\uAC70",
    "branch.delete": "\uBE0C\uB79C\uCE58 \uC0AD\uC81C",
    // 未合并强制删除对话框 + 删除通知（对齐 IDEA GitDeleteBranchOperation）
    "branch.forceDelete": "{name} \uBE0C\uB79C\uCE58\uAC00 \uD604\uC7AC \uBE0C\uB79C\uCE58\uC5D0 \uBCD1\uD569\uB418\uC9C0 \uC54A\uC558\uC2B5\uB2C8\uB2E4. \uAC15\uC81C \uC0AD\uC81C\uD558\uBA74 \uD574\uB2F9 \uBE0C\uB79C\uCE58\uC758 \uCEE4\uBC0B\uC774 \uC720\uC2E4\uB429\uB2C8\uB2E4.",
    "branch.forceDeleteButton": "\uAC15\uC81C \uC0AD\uC81C",
    "branch.notFound": "{name} \uBE0C\uB79C\uCE58\uAC00 \uC874\uC7AC\uD558\uC9C0 \uC54A\uC2B5\uB2C8\uB2E4",
    "branch.deleteFailed": "\uBE0C\uB79C\uCE58 \uC0AD\uC81C \uC2E4\uD328",
    "sidebar.deleteBranch": "\uBE0C\uB79C\uCE58 \uC0AD\uC81C",
    "branch.batchDeleteDone": "\uBE0C\uB79C\uCE58 {n}\uAC1C\uB97C \uC0AD\uC81C\uD588\uC2B5\uB2C8\uB2E4",
    "branch.batchDeletePartial": "\uBE0C\uB79C\uCE58 {ok}\uAC1C \uC0AD\uC81C, \uC2E4\uD328: {failed}",
    "branch.selectBranch": "\uBA3C\uC800 \uBE0C\uB79C\uCE58\uB97C \uC120\uD0DD\uD558\uC138\uC694",
    "branch.deleteCurrent": "\uD604\uC7AC \uBE0C\uB79C\uCE58\uB294 \uC0AD\uC81C\uD560 \uC218 \uC5C6\uC2B5\uB2C8\uB2E4",
    "branch.title": "Ga\u0142\u0119zie",
    "branch.searchPlaceholder": "\uBE0C\uB79C\uCE58 \uB610\uB294 \uD0DC\uADF8",
    "branch.notifyDeleted": "\uC0AD\uC81C\uB41C \uBE0C\uB79C\uCE58: {name}",
    "branch.restore": "\uBCF5\uC6D0",
    "branch.deleteTracking": "\uCD94\uC801 \uBE0C\uB79C\uCE58 \uC0AD\uC81C",
    "branch.restoreSuccess": "\uBE0C\uB79C\uCE58 {name}\uC774(\uAC00) \uBCF5\uC6D0\uB418\uC5C8\uC2B5\uB2C8\uB2E4",
    "branch.restoreFailed": "\uBE0C\uB79C\uCE58 \uBCF5\uC6D0 \uC2E4\uD328",
    "branch.deleteTrackingFailed": "\uCD94\uC801 \uBE0C\uB79C\uCE58 \uC0AD\uC81C \uC2E4\uD328",
    "commit.copyRevision": "\uCEE4\uBC0B \uD574\uC2DC \uBCF5\uC0AC",
    "commit.cherryPick": "\uCCB4\uB9AC\uD53D",
    "commit.compareLocal": "\uB85C\uCEEC\uACFC \uBE44\uAD50",
    "commit.reset": "\uD604\uC7AC \uBE0C\uB79C\uCE58\uB97C \uC5EC\uAE30\uB85C \uC7AC\uC124\uC815",
    "commit.revert": "\uCEE4\uBC0B \uB418\uB3CC\uB9AC\uAE30",
    "commit.newBranch": "\uC0C8 \uBE0C\uB79C\uCE58",
    "commit.newTag": "\uC0C8 \uD0DC\uADF8",
    "batch.selected": "{n}\uAC1C \uCEE4\uBC0B \uC120\uD0DD\uB428",
    "batch.copyHashes": "\uD574\uC2DC \uBAA9\uB85D \uBCF5\uC0AC",
    "batch.cherryPickAll": "\uBAA8\uB450 \uCCB4\uB9AC\uD53D ({n})",
    "batch.revertAll": "\uBAA8\uB450 \uB418\uB3CC\uB9AC\uAE30 ({n})",
    "batch.confirmCherryPick": "\uC120\uD0DD\uD55C {n}\uAC1C \uCEE4\uBC0B\uC744 \uCCB4\uB9AC\uD53D\uD558\uC2DC\uACA0\uC2B5\uB2C8\uAE4C?",
    "batch.confirmRevert": "\uC120\uD0DD\uD55C {n}\uAC1C \uCEE4\uBC0B\uC744 \uB418\uB3CC\uB9AC\uC2DC\uACA0\uC2B5\uB2C8\uAE4C?",
    "file.showDiff": "\uCC28\uC774 \uD45C\uC2DC",
    "file.showDiffNew": "\uC0C8 \uCC3D\uC5D0\uC11C \uCC28\uC774 \uD45C\uC2DC",
    "file.compareLocal": "\uB85C\uCEEC\uACFC \uBE44\uAD50",
    "file.compareBeforeLocal": "\uBCC0\uACBD \uC804\uACFC \uB85C\uCEEC \uBE44\uAD50",
    "file.editSource": "\uC18C\uC2A4 \uD3B8\uC9D1",
    "file.openRepoVersion": "\uC800\uC7A5\uC18C \uBC84\uC804 \uC5F4\uAE30",
    "file.revertChanges": "\uC120\uD0DD\uD55C \uBCC0\uACBD \uB418\uB3CC\uB9AC\uAE30",
    "file.cherryPickChanges": "\uC120\uD0DD\uD55C \uBCC0\uACBD \uCCB4\uB9AC\uD53D",
    "file.createPatch": "\uD328\uCE58 \uB9CC\uB4E4\uAE30",
    "file.getFromRevision": "\uB9AC\uBE44\uC804\uC5D0\uC11C \uAC00\uC838\uC624\uAE30",
    "file.historyUpTo": "\uC5EC\uAE30\uAE4C\uC9C0\uC758 \uAE30\uB85D",
    // 侧边栏图标 / 显示设置 / 跳转 / 排序
    "sidebar.hideBranches": "Git \uBE0C\uB79C\uCE58 \uC228\uAE30\uAE30",
    "sidebar.showBranches": "Git \uBE0C\uB79C\uCE58 \uD45C\uC2DC",
    "sidebar.newBranch": "\uC0C8 \uBE0C\uB79C\uCE58",
    "sidebar.refresh": "\uC0C8\uB85C\uACE0\uCE68",
    "sidebar.update": "\uC5C5\uB370\uC774\uD2B8",
    "sidebar.checkout": "\uCCB4\uD06C\uC544\uC6C3",
    "sidebar.merge": "\uBCD1\uD569",
    "sidebar.search": "\uAC80\uC0C9",
    "sidebar.favorite": "\uC990\uACA8\uCC3E\uAE30",
    "sidebar.settings": "\uC124\uC815",
    "sidebar.pull": "\uD480",
    "sidebar.expandAll": "\uBAA8\uB450 \uD3BC\uCE58\uAE30",
    "sidebar.sort": "\uC815\uB82C",
    "sidebar.close": "\uB2EB\uAE30",
    "sidebar.noSelectedBranch": "\uC120\uD0DD\uB41C \uBE0C\uB79C\uCE58 \uC5C6\uC74C",
    "settings.title": "\uD45C\uC2DC \uC124\uC815",
    "settings.showAuthor": "\uC791\uC131\uC790 \uC5F4 \uD45C\uC2DC",
    "settings.showDate": "\uB0A0\uC9DC \uC5F4 \uD45C\uC2DC",
    "settings.showHash": "\uD574\uC2DC \uC5F4 \uD45C\uC2DC",
    "goto.title": "\uCC38\uC870\uB85C \uC774\uB3D9",
    "goto.placeholder": "\uD574\uC2DC \uB610\uB294 \uBE0C\uB79C\uCE58 \uC774\uB984 \uC785\uB825",
    "goto.notFound": "\uC77C\uCE58\uD558\uB294 \uD56D\uBAA9 \uC5C6\uC74C",
    "goto.ok": "\uC774\uB3D9",
    "sort.dateAsc": "\uC815\uB82C: \uB0A0\uC9DC \uC624\uB984\uCC28\uC21C",
    "sort.authorAsc": "\uC815\uB82C: \uC791\uC131\uC790",
    "sort.messageAsc": "\uC815\uB82C: \uBA54\uC2DC\uC9C0",
    // 工具栏过滤（分支 / 用户 / 日期 / 路径）
    "filter.branch": "\uBE0C\uB79C\uCE58",
    "filter.user": "\uC0AC\uC6A9\uC790",
    "filter.date": "\uB0A0\uC9DC",
    "filter.path": "\uACBD\uB85C",
    "filter.selectAll": "\uBAA8\uB450 \uC120\uD0DD",
    "filter.regex": "\uC815\uADDC\uC2DD",
    "filter.case": "\uB300\uC18C\uBB38\uC790 \uAD6C\uBD84",
    "filter.all": "\uC804\uCCB4",
    "filter.localBranches": "\uB85C\uCEEC \uBE0C\uB79C\uCE58",
    "filter.remoteBranches": "\uC6D0\uACA9 \uBE0C\uB79C\uCE58",
    "filter.favorites": "\uC990\uACA8\uCC3E\uAE30",
    "filter.today": "\uC624\uB298",
    "filter.thisWeek": "\uC774\uBC88 \uC8FC",
    "filter.thisMonth": "\uC774\uBC88 \uB2EC",
    "filter.thisYear": "\uC62C\uD574",
    "filter.custom": "\uC0AC\uC6A9\uC790 \uC9C0\uC815\u2026",
    "filter.dateFrom": "\uC2DC\uC791 \uB0A0\uC9DC",
    "filter.dateTo": "\uC885\uB8CC \uB0A0\uC9DC",
    "filter.chooseFolder": "\uD3F4\uB354 \uC120\uD0DD\u2026",
    "filter.ok": "\uD655\uC778",
    "filter.cancel": "\uCDE8\uC18C",
    "filter.clear": "\uC9C0\uC6B0\uAE30",
    // 路径过滤（多选）
    "filter.selectPaths": "\uD544\uD130\uB9C1\uD560 \uACBD\uB85C \uC120\uD0DD",
    "filter.editPaths": "\uACBD\uB85C \uD3B8\uC9D1\u2026",
    "filter.maxPaths": "\uCD5C\uB300 100\uAC1C\uAE4C\uC9C0 \uC120\uD0DD \uAC00\uB2A5",
    "filter.noPaths": "\uC120\uD0DD \uAC00\uB2A5\uD55C \uACBD\uB85C \uC5C6\uC74C",
    "filter.loadPathsFailed": "\uACBD\uB85C \uBD88\uB7EC\uC624\uAE30 \uC2E4\uD328",
    "dialog.renameBranch": "\uBE0C\uB79C\uCE58 \uC774\uB984 \uBCC0\uACBD",
    "dialog.branchName": "\uBE0C\uB79C\uCE58 \uC774\uB984",
    "dialog.startPoint": "\uC2DC\uC791 \uC9C0\uC810",
    "dialog.currentHead": "\uD604\uC7AC HEAD",
    "dialog.inputBranchName": "\uBE0C\uB79C\uCE58 \uC774\uB984 \uC785\uB825\u2026",
    "dialog.checkoutAfterCreate": "\uC0DD\uC131 \uD6C4 \uCCB4\uD06C\uC544\uC6C3",
    "dialog.create": "\uB9CC\uB4E4\uAE30",
    "dialog.dateFilter": "\uB0A0\uC9DC\uB85C \uD544\uD130",
    "dialog.startDate": "\uC2DC\uC791 \uB0A0\uC9DC",
    "dialog.endDate": "\uC885\uB8CC \uB0A0\uC9DC",
    "dialog.clear": "\uC9C0\uC6B0\uAE30",
    "dialog.resetTo": "\uBE0C\uB79C\uCE58\uB97C {hash}(\uC73C)\uB85C \uC7AC\uC124\uC815",
    "dialog.selectResetMode": "\uC7AC\uC124\uC815 \uBAA8\uB4DC \uC120\uD0DD:",
    "dialog.resetSoft": "Soft - HEAD\uB9CC \uC774\uB3D9",
    "dialog.resetMixed": "Mixed - HEAD \uC774\uB3D9 + \uC778\uB371\uC2A4 \uC7AC\uC124\uC815 (\uAE30\uBCF8\uAC12)",
    "dialog.resetHard": "Hard - HEAD \uC774\uB3D9 + \uC778\uB371\uC2A4 \uBC0F \uC791\uC5C5 \uD2B8\uB9AC \uC7AC\uC124\uC815",
    "dialog.reset": "\uC7AC\uC124\uC815",
    "dialog.branchFromCommit": "\uCEE4\uBC0B\uC5D0\uC11C \uBE0C\uB79C\uCE58 \uB9CC\uB4E4\uAE30",
    "dialog.basedOn": "\uAE30\uC900: {info}",
    "commit.searchPlaceholder": "\uD14D\uC2A4\uD2B8 \uB610\uB294 \uD574\uC2DC",
    "branch.groupHead": "HEAD (\uD604\uC7AC \uBE0C\uB79C\uCE58)",
    "branch.groupLocal": "\uB85C\uCEEC",
    "branch.groupRemote": "\uC6D0\uACA9",
    "file.noDiff": "\uCC28\uC774 \uC5C6\uC74C",
    "file.changedFiles": "\uBCC0\uACBD\uB41C \uD30C\uC77C",
    "detail.title": "\uCEE4\uBC0B \uC0C1\uC138",
    "detail.hash": "\uD574\uC2DC",
    "detail.author": "\uC791\uC131\uC790",
    "detail.date": "\uB0A0\uC9DC",
    "main.loadingTitle": "\uCD08\uAE30\uD654 \uC911\u2026",
    "main.loadingBody": "\uD504\uB85C\uC81D\uD2B8 \uC815\uBCF4\uB97C \uBD88\uB7EC\uC624\uB294 \uC911\uC785\uB2C8\uB2E4.",
    "main.notGitTitle": "Git \uC800\uC7A5\uC18C \uC544\uB2D8",
    "main.notGitBody": "\uD604\uC7AC \uB514\uB809\uD130\uB9AC\uB294 Git \uC800\uC7A5\uC18C\uAC00 \uC544\uB2D9\uB2C8\uB2E4.",
    "time.justNow": "\uBC29\uAE08",
    "time.minutesAgo": "{n}\uBD84 \uC804",
    "time.hoursAgo": "{n}\uC2DC\uAC04 \uC804",
    "time.daysAgo": "{n}\uC77C \uC804",
    "commit.empty": "\uCEE4\uBC0B \uC5C6\uC74C",
    "commit.noSelection": "\uBCC0\uACBD \uC0AC\uD56D\uC744 \uBCFC \uCEE4\uBC0B\uC744 \uC120\uD0DD\uD558\uC138\uC694",
    "file.selectDiff": "\uCC28\uC774\uB97C \uBCFC \uD30C\uC77C\uC744 \uC120\uD0DD\uD558\uC138\uC694",
    "file.noChanges": "\uBCC0\uACBD\uB41C \uD30C\uC77C \uC5C6\uC74C",
    "layout.resizeDivider": "\uB4DC\uB798\uADF8\uD558\uC5EC \uD06C\uAE30 \uC870\uC815",
    "main.tabConsole": "\uCF58\uC194",
    "reset.title": "\uD604\uC7AC \uBE0C\uB79C\uCE58\uB97C \uC5EC\uAE30\uB85C \uC7AC\uC124\uC815",
    "reset.softDesc": "\uC791\uC5C5 \uD2B8\uB9AC\uC640 \uC778\uB371\uC2A4 \uC720\uC9C0",
    "reset.mixedDesc": "\uC791\uC5C5 \uD2B8\uB9AC \uC720\uC9C0, \uC778\uB371\uC2A4 \uC7AC\uC124\uC815",
    "reset.hardDesc": "\uBAA8\uB4E0 \uBCC0\uACBD \uC0AC\uD56D \uD3D0\uAE30",
    "dialog.createBranchTitle": "\uC0C8 \uBE0C\uB79C\uCE58",
    "dialog.pathPlaceholder": "src/ \uB610\uB294 packages/core",
    "dialog.cancel": "\uCDE8\uC18C",
    "dialog.ok": "\uD655\uC778",
    "filter.selectAllToggle": "\uD604\uC7AC \uBAA9\uB85D \uC804\uCCB4 \uC120\uD0DD/\uC120\uD0DD \uD574\uC81C",
    "sidebar.compareBranch": "\uD604\uC7AC \uBE0C\uB79C\uCE58\uC640 \uBE44\uAD50",
    "compare.title": "{branch}\uACFC {current} \uBE44\uAD50",
    "compare.branchOnly": "{branch}\uC5D0\uB9CC \uC788\uB294 \uCEE4\uBC0B",
    "compare.currentOnly": "{current}\uC5D0\uB9CC \uC788\uB294 \uCEE4\uBC0B",
    "compare.empty": "\uCEE4\uBC0B \uC5C6\uC74C",
    "compare.loading": "\uBD88\uB7EC\uC624\uB294 \uC911\u2026",
    "compare.loadFailed": "\uBE0C\uB79C\uCE58 \uBE44\uAD50 \uC2E4\uD328",
    "compare.selectBranch": "\uBA3C\uC800 \uBE44\uAD50\uD560 \uBE0C\uB79C\uCE58\uB97C \uC120\uD0DD\uD558\uC138\uC694",
    "compare.currentBranch": "\uD604\uC7AC \uBE0C\uB79C\uCE58\uB294 \uC790\uAE30 \uC790\uC2E0\uACFC \uBE44\uAD50\uD560 \uC218 \uC5C6\uC2B5\uB2C8\uB2E4",
    "compare.noCurrentBranch": "\uD604\uC7AC \uBE0C\uB79C\uCE58\uAC00 \uC544\uC9C1 \uB85C\uB4DC\uB418\uC9C0 \uC54A\uC558\uC2B5\uB2C8\uB2E4. \uC7A0\uC2DC \uD6C4 \uB2E4\uC2DC \uC2DC\uB3C4\uD558\uC138\uC694",
    "compare.with": "\uC640",
    "compare.identical": "\uB450 \uBE0C\uB79C\uCE58\uAC00 \uB3D9\uC77C\uD569\uB2C8\uB2E4",
    "compare.sameBranch": "\uC11C\uB85C \uB2E4\uB978 \uBE0C\uB79C\uCE58 \uB450 \uAC1C\uB97C \uC120\uD0DD\uD558\uC138\uC694",
    "compare.tooMany": "\uBE44\uAD50\uD560 \uBE0C\uB79C\uCE58\uB294 \uCD5C\uB300 \uB450 \uAC1C\uAE4C\uC9C0 \uC120\uD0DD\uD560 \uC218 \uC788\uC2B5\uB2C8\uB2E4",
    "sidebar.showMyBranches": "\uB0B4 \uBE0C\uB79C\uCE58\uB9CC \uD45C\uC2DC",
    "sidebar.myBranchesFailed": "\uB0B4 \uBE0C\uB79C\uCE58\uB97C \uBD88\uB7EC\uC624\uC9C0 \uBABB\uD588\uC2B5\uB2C8\uB2E4",
    "sidebar.showMyBranchesOn": "\uB0B4 \uBE0C\uB79C\uCE58\uB9CC \uD45C\uC2DC \uC911",
    "sidebar.myBranchesUnavailable": "\uD544\uD130\uB9C1\uD560 \uB85C\uCEEC \uBE0C\uB79C\uCE58\uAC00 \uC5C6\uC2B5\uB2C8\uB2E4",
    "sidebar.newBranchUnavailable": "\uAE30\uC900\uC73C\uB85C \uC0BC\uC744 \uBE0C\uB79C\uCE58\uAC00 \uC5C6\uC2B5\uB2C8\uB2E4",
    "sidebar.updateUnavailable": "\uC6D0\uACA9 \uC800\uC7A5\uC18C\uAC00 \uC124\uC815\uB418\uC9C0 \uC54A\uC558\uC2B5\uB2C8\uB2E4",
    "sidebar.deleteRemoteUnavailable": "\uC5EC\uAE30\uC11C \uC6D0\uACA9 \uBE0C\uB79C\uCE58\uB294 \uC0AD\uC81C\uD560 \uC218 \uC5C6\uC2B5\uB2C8\uB2E4",
    "sidebar.expandAllUnavailable": "\uD3BC\uCE60 \uBE0C\uB79C\uCE58\uAC00 \uC5C6\uC2B5\uB2C8\uB2E4",
    "sidebar.pullUnavailable": "\uC6D0\uACA9 \uC800\uC7A5\uC18C\uAC00 \uC124\uC815\uB418\uC9C0 \uC54A\uC558\uC2B5\uB2C8\uB2E4",
    "sidebar.fetch": "\uC6D0\uACA9 \uBCC0\uACBD \uAC00\uC838\uC624\uAE30",
    "sidebar.locate": "Git \uB85C\uADF8\uC5D0\uC11C \uCC3E\uAE30",
    "sidebar.collapseAll": "\uBAA8\uB450 \uC811\uAE30",
    "sidebar.locateNotInView": "{branch}\uC758 \uCD5C\uC2E0 \uCEE4\uBC0B\uC774 \uD604\uC7AC \uBAA9\uB85D\uC5D0 \uC5C6\uC2B5\uB2C8\uB2E4",
    "sidebar.fetchAuthFailed": "\uC778\uC99D \uC2E4\uD328",
    "sidebar.fetchUnreachable": "\uC6D0\uACA9 \uC800\uC7A5\uC18C\uC5D0 \uC5F0\uACB0\uD560 \uC218 \uC5C6\uC74C",
    "sidebar.fetchNoRemote": "\uC6D0\uACA9 \uC800\uC7A5\uC18C\uB97C \uCC3E\uC744 \uC218 \uC5C6\uC74C",
    "sidebar.fetchFailed": "\uC6D0\uACA9 \uBCC0\uACBD\uC744 \uAC00\uC838\uC624\uC9C0 \uBABB\uD588\uC2B5\uB2C8\uB2E4",
    "sidebar.fetchInProgress": "\uC6D0\uACA9 \uBCC0\uACBD \uAC00\uC838\uC624\uB294 \uC911\u2026",
    "sidebar.fetchSuccessUpdates": "\uAC00\uC838\uC624\uAE30 \uC644\uB8CC: {count}\uAC1C \uBE0C\uB79C\uCE58\uC5D0 \uC0C8 \uCEE4\uBC0B\uC774 \uC788\uC2B5\uB2C8\uB2E4",
    "sidebar.fetchSuccessNoUpdates": "\uAC00\uC838\uC624\uAE30 \uC644\uB8CC: \uCD5C\uC2E0 \uC0C1\uD0DC\uC785\uB2C8\uB2E4",
    "settings.groupView": "\uBCF4\uAE30",
    "settings.groupGraph": "\uADF8\uB798\uD504",
    "settings.showBranchLabels": "\uBE0C\uB79C\uCE58 \uB77C\uBCA8 \uD45C\uC2DC",
    "settings.showTagNames": "\uD0DC\uADF8 \uC774\uB984",
    "settings.compactReferences": "\uAC04\uB2E8\uD55C \uCC38\uC870 \uBCF4\uAE30",
    "settings.preferCommitDate": "\uCEE4\uBC0B \uD0C0\uC784\uC2A4\uD0EC\uD504",
    "settings.referencesOnLeft": "\uCC38\uC870\uB97C \uC67C\uCABD\uC5D0 \uD45C\uC2DC",
    "settings.showLongEdges": "\uAE34 \uAC04\uC120",
    "commit.copied": "\uD074\uB9BD\uBCF4\uB4DC\uC5D0 \uBCF5\uC0AC\uB418\uC5C8\uC2B5\uB2C8\uB2E4",
    "commit.copyFailed": "\uBCF5\uC0AC \uC2E4\uD328",
    "commit.cherryPickNoSelection": "\uBA3C\uC800 \uCEE4\uBC0B\uC744 \uC120\uD0DD\uD558\uC138\uC694",
    "commit.cherryPickDoneMulti": "\uCEE4\uBC0B {n}\uAC1C\uB97C \uCCB4\uB9AC\uD53D\uD588\uC2B5\uB2C8\uB2E4",
    "commit.cherryPickDone": "{hash} \uCCB4\uB9AC\uD53D \uC644\uB8CC",
    "commit.cherryPickFailed": "\uCCB4\uB9AC\uD53D \uC2E4\uD328",
    "commit.cherryPickConflict": "\uCCB4\uB9AC\uD53D \uCDA9\uB3CC\uC774 \uBC1C\uC0DD\uD588\uC2B5\uB2C8\uB2E4. \uD574\uACB0 \uD6C4 \uACC4\uC18D\uD558\uAC70\uB098 \uC911\uB2E8\uD558\uC138\uC694",
    "batch.cherryPickDone": "{n}\uAC1C \uCEE4\uBC0B \uCCB4\uB9AC\uD53D \uC644\uB8CC",
    "commit.uncommit": "\uCEE4\uBC0B \uCDE8\uC18C",
    "commit.uncommitDone": "\uCEE4\uBC0B {hash} \uCDE8\uC18C\uB428",
    "commit.uncommitFailed": "\uCEE4\uBC0B \uCDE8\uC18C \uC2E4\uD328",
    "commit.reword": "\uCEE4\uBC0B \uBA54\uC2DC\uC9C0 \uD3B8\uC9D1",
    "commit.rewordTitle": "\uCEE4\uBC0B \uBA54\uC2DC\uC9C0 \uD3B8\uC9D1",
    "commit.rewordEmpty": "\uCEE4\uBC0B \uBA54\uC2DC\uC9C0\uB294 \uBE44\uC6B8 \uC218 \uC5C6\uC2B5\uB2C8\uB2E4",
    "commit.rewordDone": "\uCEE4\uBC0B \uBA54\uC2DC\uC9C0\uAC00 \uC5C5\uB370\uC774\uD2B8\uB418\uC5C8\uC2B5\uB2C8\uB2E4",
    "commit.dropCommit": "\uCEE4\uBC0B \uC0AD\uC81C",
    "commit.dropConfirm": "\uCEE4\uBC0B {hash}\uC744(\uB97C) \uC0AD\uC81C\uD560\uAE4C\uC694? \uAE30\uB85D\uC774 \uB2E4\uC2DC \uC791\uC131\uB429\uB2C8\uB2E4.",
    "commit.dropDone": "\uCEE4\uBC0B {hash} \uC0AD\uC81C\uB428",
    "commit.dropFailed": "\uCEE4\uBC0B \uC0AD\uC81C \uC2E4\uD328",
    "commit.pushUpTo": "\uC5EC\uAE30\uAE4C\uC9C0 \uCEE4\uBC0B \uD478\uC2DC",
    "commit.pushUpToDone": "{ref} \uD478\uC2DC\uB428",
    "commit.pushUpToRejected": "\uD478\uC2DC\uAC00 \uAC70\uBD80\uB418\uC5C8\uC2B5\uB2C8\uB2E4. \uBA3C\uC800 \uAC00\uC838\uC624\uC138\uC694",
    "commit.pushUpToFailed": "\uD478\uC2DC \uC2E4\uD328",
    "commit.pushNoBranch": "\uC774 \uCEE4\uBC0B\uC744 \uD3EC\uD568\uD55C \uBE0C\uB79C\uCE58\uAC00 \uC5C6\uC2B5\uB2C8\uB2E4",
    "commit.dirtyWorkingTree": "\uAE30\uB85D\uC744 \uB2E4\uC2DC \uC791\uC131\uD558\uAE30 \uC804\uC5D0 \uBCC0\uACBD \uC0AC\uD56D\uC744 \uCEE4\uBC0B\uD558\uAC70\uB098 \uC2A4\uD0DC\uC2DC\uD558\uC138\uC694",
    "commit.revertDone": "{hash} \uB418\uB3CC\uB9BC \uC644\uB8CC",
    "commit.revertFailed": "\uB418\uB3CC\uB9AC\uAE30 \uC2E4\uD328",
    "commit.revertConflict": "\uB418\uB3CC\uB9AC\uAE30 \uCDA9\uB3CC\uC774 \uBC1C\uC0DD\uD588\uC2B5\uB2C8\uB2E4. \uD574\uACB0 \uD6C4 \uACC4\uC18D\uD558\uAC70\uB098 \uC911\uB2E8\uD558\uC138\uC694",
    "op.failed": "\uC791\uC5C5 \uC2E4\uD328",
    "op.conflict": "\uBCD1\uD569 \uCDA9\uB3CC",
    "op.authFailed": "\uC778\uC99D \uC2E4\uD328",
    "op.unreachable": "\uC6D0\uACA9 \uC800\uC7A5\uC18C\uC5D0 \uC5F0\uACB0\uD560 \uC218 \uC5C6\uC74C",
    "op.rejected": "\uD478\uC2DC\uAC00 \uAC70\uBD80\uB418\uC5C8\uC2B5\uB2C8\uB2E4. \uBA3C\uC800 \uAC00\uC838\uC624\uC138\uC694",
    "op.checkoutDone": "{name}(\uC73C)\uB85C \uC804\uD658\uB428",
    "op.mergeDone": "{name} \uBCD1\uD569\uB428",
    "op.rebaseDone": "{name}(\uC73C)\uB85C \uB9AC\uBCA0\uC774\uC2A4\uB428",
    "op.pullDone": "\uAC00\uC838\uC634",
    "op.pushDone": "\uD478\uC2DC\uB428",
    "op.deleteDone": "\uBE0C\uB79C\uCE58 {name} \uC0AD\uC81C\uB428",
    "worktree.refresh": "\uC0C8\uB85C \uACE0\uCE68",
    "worktree.add": "Worktree \uCD94\uAC00",
    "worktree.prune": "\uC815\uB9AC",
    "worktree.empty": "worktree \uC5C6\uC74C",
    "worktree.main": "\uAE30\uBCF8",
    "worktree.remove": "\uC81C\uAC70",
    "worktree.removeConfirm": "worktree {path}\uC744(\uB97C) \uC81C\uAC70\uD560\uAE4C\uC694?",
    "worktree.forceConfirm": "\uCEE4\uBC0B\uB418\uC9C0 \uC54A\uC740 \uBCC0\uACBD \uC0AC\uD56D\uC774 \uC788\uC2B5\uB2C8\uB2E4. \uAC15\uC81C\uB85C \uC81C\uAC70\uD560\uAE4C\uC694?",
    "worktree.loadFailed": "worktree\uB97C \uBD88\uB7EC\uC624\uC9C0 \uBABB\uD588\uC2B5\uB2C8\uB2E4",
    "worktree.addPathPrompt": "\uC0C8 worktree\uC758 \uB300\uC0C1 \uACBD\uB85C:",
    "worktree.addBranchPrompt": "\uC0C8 \uBE0C\uB79C\uCE58 \uC774\uB984({base} \uAE30\uC900):",
    "worktree.addFailed": "worktree \uCD94\uAC00 \uC2E4\uD328",
    "batch.revertDone": "{n}\uAC1C \uCEE4\uBC0B \uB418\uB3CC\uB9BC \uC644\uB8CC",
    "op.newBranchDone": "{name} \uBE0C\uB79C\uCE58 \uC0DD\uC131\uB428",
    "op.newBranchFailed": "\uBE0C\uB79C\uCE58 \uC0DD\uC131 \uC2E4\uD328",
    "worktree.refreshed": "worktree \uBAA9\uB85D\uC744 \uC0C8\uB85C \uACE0\uCCE4\uC2B5\uB2C8\uB2E4",
    "worktree.pruneDone": "\uC624\uB798\uB41C worktree {n}\uAC1C\uB97C \uC815\uB9AC\uD588\uC2B5\uB2C8\uB2E4",
    "worktree.pruneNothing": "\uC815\uB9AC\uD560 \uC624\uB798\uB41C worktree\uAC00 \uC5C6\uC2B5\uB2C8\uB2E4",
    "worktree.pruneFailed": "\uC815\uB9AC \uC2E4\uD328",
    "worktree.removed": "worktree\uB97C \uC81C\uAC70\uD588\uC2B5\uB2C8\uB2E4",
    "worktree.added": "worktree\uB97C \uC0DD\uC131\uD588\uC2B5\uB2C8\uB2E4: {path}",
    "op.branchDirtyWorkingTree": "\uBA3C\uC800 \uBCC0\uACBD \uC0AC\uD56D\uC744 \uCEE4\uBC0B\uD558\uAC70\uB098 \uC2A4\uD0DC\uC2DC\uD558\uC138\uC694",
    "op.branchExists": "\uBE0C\uB79C\uCE58\uAC00 \uC774\uBBF8 \uC874\uC7AC\uD569\uB2C8\uB2E4",
    "op.branchInvalidName": "\uC798\uBABB\uB41C \uBE0C\uB79C\uCE58 \uC774\uB984\uC785\uB2C8\uB2E4",
    "op.branchCreateGeneric": "\uC790\uC138\uD55C \uB0B4\uC6A9\uC740 \uCF58\uC194\uC744 \uD655\uC778\uD558\uC138\uC694",
    "console.commandCount": "\uAC1C git \uBA85\uB839",
    "console.clear": "\uC9C0\uC6B0\uAE30",
    "console.noCommands": "git \uBA85\uB839\uC774 \uC5C6\uC2B5\uB2C8\uB2E4",
    "console.selectCommand": "\uBA85\uB839\uC744 \uC120\uD0DD\uD558\uC138\uC694",
    "console.noOutput": "(\uCD9C\uB825 \uC5C6\uC74C)",
    "console.loadFailed": "\uBA85\uB839 \uB85C\uADF8\uB97C \uBD88\uB7EC\uC624\uC9C0 \uBABB\uD588\uC2B5\uB2C8\uB2E4",
    "op.resetFailed": "\uC7AC\uC124\uC815 \uC2E4\uD328",
    "branch.favoriteSaveFailed": "\uC990\uACA8\uCC3E\uAE30 \uC800\uC7A5 \uC2E4\uD328",
    "dialog.renameFailed": "\uBE0C\uB79C\uCE58 \uC774\uB984 \uBCC0\uACBD \uC2E4\uD328",
    "dialog.createBranchFailed": "\uBE0C\uB79C\uCE58 \uC0DD\uC131 \uC2E4\uD328",
    "branch.loadFailed": "\uBE0C\uB79C\uCE58\uB97C \uBD88\uB7EC\uC624\uC9C0 \uBABB\uD588\uC2B5\uB2C8\uB2E4",
    "commit.loadDetailFailed": "\uCEE4\uBC0B \uC0C1\uC138\uB97C \uBD88\uB7EC\uC624\uC9C0 \uBABB\uD588\uC2B5\uB2C8\uB2E4",
    "commit.loadListFailed": "\uCEE4\uBC0B \uBAA9\uB85D\uC744 \uBD88\uB7EC\uC624\uC9C0 \uBABB\uD588\uC2B5\uB2C8\uB2E4",
    "worktree.removeFailed": "worktree \uC81C\uAC70 \uC2E4\uD328"
  };
  var pl = {
    "branch.checkout": "Przejd\u017A na ga\u0142\u0105\u017A",
    "branch.rename": "Zmie\u0144 nazw\u0119 ga\u0142\u0119zi",
    "branch.merge": "Scal z bie\u017C\u0105c\u0105 ga\u0142\u0119zi\u0105",
    "branch.rebase": "Rebase tutaj",
    "branch.pull": "Pobierz",
    "branch.push": "Wy\u015Blij",
    "branch.favorite": "Dodaj do ulubionych",
    "branch.unfavorite": "Usu\u0144 z ulubionych",
    "branch.delete": "Usu\u0144 ga\u0142\u0105\u017A",
    // 未合并强制删除对话框 + 删除通知（对齐 IDEA GitDeleteBranchOperation）
    "branch.forceDelete": "Ga\u0142\u0105\u017A {name} nie zosta\u0142a scalona z bie\u017C\u0105c\u0105 ga\u0142\u0119zi\u0105. Wymuszone usuni\u0119cie spowoduje utrat\u0119 jej commit\xF3w.",
    "branch.forceDeleteButton": "Usu\u0144 wymuszenie",
    "branch.notFound": "Ga\u0142\u0105\u017A {name} nie istnieje",
    "branch.deleteFailed": "Nie uda\u0142o si\u0119 usun\u0105\u0107 ga\u0142\u0119zi",
    "sidebar.deleteBranch": "Usu\u0144 ga\u0142\u0105\u017A",
    "branch.batchDeleteDone": "Usuni\u0119to {n} ga\u0142\u0119zi",
    "branch.batchDeletePartial": "Usuni\u0119to {ok} ga\u0142\u0119zi, nie uda\u0142o si\u0119: {failed}",
    "branch.selectBranch": "Najpierw wybierz ga\u0142\u0105\u017A",
    "branch.deleteCurrent": "Nie mo\u017Cna usun\u0105\u0107 bie\u017C\u0105cej ga\u0142\u0119zi",
    "branch.title": "\uBE0C\uB79C\uCE58",
    "branch.searchPlaceholder": "Ga\u0142\u0105\u017A lub tag",
    "branch.notifyDeleted": "Usuni\u0119ta ga\u0142\u0105\u017A: {name}",
    "branch.restore": "Przywr\xF3\u0107",
    "branch.deleteTracking": "Usu\u0144 ga\u0142\u0105\u017A \u015Bledzenia",
    "branch.restoreSuccess": "Ga\u0142\u0105\u017A {name} zosta\u0142a przywr\xF3cona",
    "branch.restoreFailed": "Nie uda\u0142o si\u0119 przywr\xF3ci\u0107 ga\u0142\u0119zi",
    "branch.deleteTrackingFailed": "Nie uda\u0142o si\u0119 usun\u0105\u0107 ga\u0142\u0119zi \u015Bledzenia",
    "commit.copyRevision": "Kopiuj hash commita",
    "commit.cherryPick": "Cherry-pick",
    "commit.compareLocal": "Por\xF3wnaj z lokalnym",
    "commit.reset": "Zresetuj bie\u017C\u0105c\u0105 ga\u0142\u0105\u017A tutaj",
    "commit.revert": "Cofnij commit",
    "commit.newBranch": "Nowa ga\u0142\u0105\u017A",
    "commit.newTag": "Nowy tag",
    "batch.selected": "Wybrano {n} commit\xF3w",
    "batch.copyHashes": "Kopiuj list\u0119 hashy",
    "batch.cherryPickAll": "Cherry-pick wszystkich ({n})",
    "batch.revertAll": "Cofnij wszystkie ({n})",
    "batch.confirmCherryPick": "Wykona\u0107 cherry-pick {n} wybranych commit\xF3w?",
    "batch.confirmRevert": "Cofn\u0105\u0107 {n} wybranych commit\xF3w?",
    "file.showDiff": "Poka\u017C diff",
    "file.showDiffNew": "Poka\u017C diff w nowym oknie",
    "file.compareLocal": "Por\xF3wnaj z lokalnym",
    "file.compareBeforeLocal": "Por\xF3wnaj przed zmian\u0105 z lokalnym",
    "file.editSource": "Edytuj kod \u017Ar\xF3d\u0142owy",
    "file.openRepoVersion": "Otw\xF3rz wersj\u0119 repozytorium",
    "file.revertChanges": "Cofnij zaznaczone zmiany",
    "file.cherryPickChanges": "Cherry-pick zaznaczonych zmian",
    "file.createPatch": "Utw\xF3rz poprawk\u0119",
    "file.getFromRevision": "Pobierz z rewizji",
    "file.historyUpTo": "Historia do tego miejsca",
    // 侧边栏图标 / 显示设置 / 跳转 / 排序
    "sidebar.hideBranches": "Ukryj ga\u0142\u0119zie Git",
    "sidebar.showBranches": "Poka\u017C ga\u0142\u0119zie Git",
    "sidebar.newBranch": "Nowa ga\u0142\u0105\u017A",
    "sidebar.refresh": "Od\u015Bwie\u017C",
    "sidebar.update": "Aktualizuj",
    "sidebar.checkout": "Przejd\u017A",
    "sidebar.merge": "Scal",
    "sidebar.search": "Szukaj",
    "sidebar.favorite": "Ulubione",
    "sidebar.settings": "Ustawienia",
    "sidebar.pull": "Pobierz",
    "sidebar.expandAll": "Rozwi\u0144 wszystkie",
    "sidebar.sort": "Sortuj",
    "sidebar.close": "Zamknij",
    "sidebar.noSelectedBranch": "Nie wybrano ga\u0142\u0119zi",
    "settings.title": "Ustawienia widoku",
    "settings.showAuthor": "Poka\u017C kolumn\u0119 autora",
    "settings.showDate": "Poka\u017C kolumn\u0119 daty",
    "settings.showHash": "Poka\u017C kolumn\u0119 hashu",
    "goto.title": "Przejd\u017A do referencji",
    "goto.placeholder": "Wprowad\u017A hash lub nazw\u0119 ga\u0142\u0119zi",
    "goto.notFound": "Nie znaleziono dopasowa\u0144",
    "goto.ok": "Przejd\u017A",
    "sort.dateAsc": "Sortuj: rosn\u0105co wed\u0142ug daty",
    "sort.authorAsc": "Sortuj: autor",
    "sort.messageAsc": "Sortuj: wiadomo\u015B\u0107",
    // 工具栏过滤（分支 / 用户 / 日期 / 路径）
    "filter.branch": "Ga\u0142\u0105\u017A",
    "filter.user": "U\u017Cytkownik",
    "filter.date": "Data",
    "filter.path": "\u015Acie\u017Cka",
    "filter.selectAll": "Zaznacz wszystko",
    "filter.regex": "Wyra\u017Cenie regularne",
    "filter.case": "Uwzgl\u0119dnij wielko\u015B\u0107 liter",
    "filter.all": "Wszystkie",
    "filter.localBranches": "Ga\u0142\u0119zie lokalne",
    "filter.remoteBranches": "Ga\u0142\u0119zie zdalne",
    "filter.favorites": "Ulubione",
    "filter.today": "Dzisiaj",
    "filter.thisWeek": "Ten tydzie\u0144",
    "filter.thisMonth": "Ten miesi\u0105c",
    "filter.thisYear": "Ten rok",
    "filter.custom": "Niestandardowe\u2026",
    "filter.dateFrom": "Data od",
    "filter.dateTo": "Data do",
    "filter.chooseFolder": "Wybierz folder\u2026",
    "filter.ok": "OK",
    "filter.cancel": "Anuluj",
    "filter.clear": "Wyczy\u015B\u0107",
    // 路径过滤（多选）
    "filter.selectPaths": "Wybierz \u015Bcie\u017Cki do filtrowania",
    "filter.editPaths": "Edytuj \u015Bcie\u017Cki\u2026",
    "filter.maxPaths": "Maksymalnie 100 \u015Bcie\u017Cek",
    "filter.noPaths": "Brak \u015Bcie\u017Cek do wyboru",
    "filter.loadPathsFailed": "Nie uda\u0142o si\u0119 wczyta\u0107 \u015Bcie\u017Cek",
    "dialog.renameBranch": "Zmie\u0144 nazw\u0119 ga\u0142\u0119zi",
    "dialog.branchName": "Nazwa ga\u0142\u0119zi",
    "dialog.startPoint": "Punkt startowy",
    "dialog.currentHead": "Aktualny HEAD",
    "dialog.inputBranchName": "Wprowad\u017A nazw\u0119 ga\u0142\u0119zi\u2026",
    "dialog.checkoutAfterCreate": "Prze\u0142\u0105cz po utworzeniu",
    "dialog.create": "Utw\xF3rz",
    "dialog.dateFilter": "Filtruj wed\u0142ug daty",
    "dialog.startDate": "Data rozpocz\u0119cia",
    "dialog.endDate": "Data zako\u0144czenia",
    "dialog.clear": "Wyczy\u015B\u0107",
    "dialog.resetTo": "Zresetuj ga\u0142\u0105\u017A do {hash}",
    "dialog.selectResetMode": "Wybierz tryb resetowania:",
    "dialog.resetSoft": "Soft - tylko przesu\u0144 HEAD",
    "dialog.resetMixed": "Mixed - przesu\u0144 HEAD + zresetuj indeks (domy\u015Blnie)",
    "dialog.resetHard": "Hard - przesu\u0144 HEAD + zresetuj indeks i drzewo robocze",
    "dialog.reset": "Zresetuj",
    "dialog.branchFromCommit": "Utw\xF3rz ga\u0142\u0105\u017A z commitu",
    "dialog.basedOn": "Na podstawie: {info}",
    "commit.searchPlaceholder": "Tekst lub hash",
    "branch.groupHead": "HEAD (aktualna ga\u0142\u0105\u017A)",
    "branch.groupLocal": "Lokalne",
    "branch.groupRemote": "Zdalne",
    "file.noDiff": "Brak r\xF3\u017Cnic",
    "file.changedFiles": "Zmienione pliki",
    "detail.title": "Szczeg\xF3\u0142y commita",
    "detail.hash": "Hash",
    "detail.author": "Autor",
    "detail.date": "Data",
    "main.loadingTitle": "Inicjalizacja\u2026",
    "main.loadingBody": "\u0141adowanie informacji o projekcie.",
    "main.notGitTitle": "To nie jest repozytorium Git",
    "main.notGitBody": "Bie\u017C\u0105cy katalog nie jest repozytorium Git.",
    "time.justNow": "przed chwil\u0105",
    "time.minutesAgo": "{n} min temu",
    "time.hoursAgo": "{n} godz. temu",
    "time.daysAgo": "{n} dni temu",
    "commit.empty": "Brak commit\xF3w",
    "commit.noSelection": "Wybierz commit, aby zobaczy\u0107 zmiany",
    "file.selectDiff": "Wybierz plik, aby zobaczy\u0107 r\xF3\u017Cnice",
    "file.noChanges": "Brak zmienionych plik\xF3w",
    "layout.resizeDivider": "Przeci\u0105gnij, aby zmieni\u0107 rozmiar",
    "main.tabConsole": "Konsola",
    "reset.title": "Zresetuj bie\u017C\u0105c\u0105 ga\u0142\u0105\u017A do tego commitu",
    "reset.softDesc": "zachowaj drzewo robocze i indeks",
    "reset.mixedDesc": "zachowaj drzewo robocze, zresetuj indeks",
    "reset.hardDesc": "odrzu\u0107 wszystkie zmiany",
    "dialog.createBranchTitle": "Nowa ga\u0142\u0105\u017A",
    "dialog.pathPlaceholder": "src/ lub packages/core",
    "dialog.cancel": "Anuluj",
    "dialog.ok": "OK",
    "filter.selectAllToggle": "Zaznacz wszystko / odznacz na bie\u017C\u0105cej li\u015Bcie",
    "sidebar.compareBranch": "Por\xF3wnaj z bie\u017C\u0105c\u0105 ga\u0142\u0119zi\u0105",
    "compare.title": "Por\xF3wnywanie {branch} z {current}",
    "compare.branchOnly": "Tylko w {branch}",
    "compare.currentOnly": "Tylko w {current}",
    "compare.empty": "Brak commit\xF3w",
    "compare.loading": "\u0141adowanie\u2026",
    "compare.loadFailed": "Nie uda\u0142o si\u0119 por\xF3wna\u0107 ga\u0142\u0119zi",
    "compare.selectBranch": "Najpierw wybierz ga\u0142\u0105\u017A",
    "compare.currentBranch": "Bie\u017C\u0105cej ga\u0142\u0119zi nie mo\u017Cna por\xF3wna\u0107 z ni\u0105 sam\u0105",
    "compare.noCurrentBranch": "Bie\u017C\u0105ca ga\u0142\u0105\u017A nie zosta\u0142a jeszcze wczytana, spr\xF3buj ponownie",
    "compare.with": "z",
    "compare.identical": "Ga\u0142\u0119zie s\u0105 identyczne",
    "compare.sameBranch": "Wybierz dwie r\xF3\u017Cne ga\u0142\u0119zie",
    "compare.tooMany": "Wybierz najwy\u017Cej dwie ga\u0142\u0119zie do por\xF3wnania",
    "sidebar.showMyBranches": "Poka\u017C moje ga\u0142\u0119zie",
    "sidebar.myBranchesFailed": "Nie uda\u0142o si\u0119 wczyta\u0107 moich ga\u0142\u0119zi",
    "sidebar.showMyBranchesOn": "Pokazywane s\u0105 tylko moje ga\u0142\u0119zie",
    "sidebar.myBranchesUnavailable": "Brak lokalnych ga\u0142\u0119zi do filtrowania",
    "sidebar.newBranchUnavailable": "Brak ga\u0142\u0119zi bazowej",
    "sidebar.updateUnavailable": "Nie skonfigurowano zdalnego repozytorium",
    "sidebar.deleteRemoteUnavailable": "Nie mo\u017Cna tu usuwa\u0107 ga\u0142\u0119zi zdalnych",
    "sidebar.expandAllUnavailable": "Brak ga\u0142\u0119zi do rozwini\u0119cia",
    "sidebar.pullUnavailable": "Nie skonfigurowano zdalnego repozytorium",
    "sidebar.fetch": "Pobierz zmiany",
    "sidebar.locate": "Poka\u017C w dzienniku Git",
    "sidebar.collapseAll": "Zwi\u0144 wszystko",
    "sidebar.locateNotInView": "Ostatni commit ga\u0142\u0119zi {branch} nie jest widoczny",
    "sidebar.fetchAuthFailed": "Uwierzytelnianie nie powiod\u0142o si\u0119",
    "sidebar.fetchUnreachable": "Zdalne repozytorium nieosi\u0105galne",
    "sidebar.fetchNoRemote": "Nie znaleziono zdalnego repozytorium",
    "sidebar.fetchFailed": "Nie uda\u0142o si\u0119 pobra\u0107 zmian",
    "sidebar.fetchInProgress": "Pobieranie zmian\u2026",
    "sidebar.fetchSuccessUpdates": "Pobrano: {count} ga\u0142\u0119zi z nowymi commitami",
    "sidebar.fetchSuccessNoUpdates": "Pobrano: ju\u017C aktualne",
    "settings.groupView": "Widok",
    "settings.groupGraph": "Graf",
    "settings.showBranchLabels": "Poka\u017C etykiety ga\u0142\u0119zi",
    "settings.showTagNames": "Nazwy tag\xF3w",
    "settings.compactReferences": "Kompaktowy widok odwo\u0142a\u0144",
    "settings.preferCommitDate": "Znacznik czasu commita",
    "settings.referencesOnLeft": "Odwo\u0142ania po lewej",
    "settings.showLongEdges": "D\u0142ugie kraw\u0119dzie",
    "commit.copied": "Skopiowano do schowka",
    "commit.copyFailed": "Nie uda\u0142o si\u0119 skopiowa\u0107",
    "commit.cherryPickNoSelection": "Najpierw wybierz commit",
    "commit.cherryPickDoneMulti": "Cherry-pick wykonano dla {n} commit\xF3w",
    "commit.cherryPickDone": "Zastosowano cherry-pick {hash}",
    "commit.cherryPickFailed": "Nie uda\u0142o si\u0119 wykona\u0107 cherry-pick",
    "commit.cherryPickConflict": "Konflikt cherry-pick, rozwi\u0105\u017C go i kontynuuj lub przerwij",
    "batch.cherryPickDone": "Zastosowano cherry-pick {n} commit\xF3w",
    "commit.uncommit": "Cofnij commit",
    "commit.uncommitDone": "Cofni\u0119to commit {hash}",
    "commit.uncommitFailed": "Nie uda\u0142o si\u0119 cofn\u0105\u0107 commita",
    "commit.reword": "Edytuj opis commita",
    "commit.rewordTitle": "Edytuj opis commita",
    "commit.rewordEmpty": "Opis nie mo\u017Ce by\u0107 pusty",
    "commit.rewordDone": "Opis commita zaktualizowany",
    "commit.dropCommit": "Usu\u0144 commit",
    "commit.dropConfirm": "Usun\u0105\u0107 commit {hash}? Historia zostanie przepisana.",
    "commit.dropDone": "Usuni\u0119to commit {hash}",
    "commit.dropFailed": "Nie uda\u0142o si\u0119 usun\u0105\u0107 commita",
    "commit.pushUpTo": "Wy\u015Blij commity do tego miejsca",
    "commit.pushUpToDone": "Wys\u0142ano {ref}",
    "commit.pushUpToRejected": "Wysy\u0142ka odrzucona, najpierw pobierz zmiany",
    "commit.pushUpToFailed": "Wysy\u0142ka nie powiod\u0142a si\u0119",
    "commit.pushNoBranch": "\u017Badna ga\u0142\u0105\u017A nie zawiera tego commita",
    "commit.dirtyWorkingTree": "Zacommituj lub od\u0142\xF3\u017C zmiany przed przepisaniem historii",
    "commit.revertDone": "Wycofano {hash}",
    "commit.revertFailed": "Nie uda\u0142o si\u0119 wycofa\u0107",
    "commit.revertConflict": "Konflikt revert, rozwi\u0105\u017C go i kontynuuj lub przerwij",
    "op.failed": "Operacja nie powiod\u0142a si\u0119",
    "op.conflict": "Konflikt scalania",
    "op.authFailed": "Uwierzytelnianie nie powiod\u0142o si\u0119",
    "op.unreachable": "Zdalne repozytorium nieosi\u0105galne",
    "op.rejected": "Wysy\u0142ka odrzucona, najpierw pobierz zmiany",
    "op.checkoutDone": "Prze\u0142\u0105czono na {name}",
    "op.mergeDone": "Scalono {name}",
    "op.rebaseDone": "Zrebazowano na {name}",
    "op.pullDone": "Pobrano",
    "op.pushDone": "Wys\u0142ano",
    "op.deleteDone": "Usuni\u0119to ga\u0142\u0105\u017A {name}",
    "worktree.refresh": "Od\u015Bwie\u017C",
    "worktree.add": "Dodaj worktree",
    "worktree.prune": "Wyczy\u015B\u0107",
    "worktree.empty": "Brak worktree",
    "worktree.main": "g\u0142\xF3wne",
    "worktree.remove": "Usu\u0144",
    "worktree.removeConfirm": "Usun\u0105\u0107 worktree {path}?",
    "worktree.forceConfirm": "Istniej\u0105 niezatwierdzone zmiany. Wymusi\u0107 usuni\u0119cie?",
    "worktree.loadFailed": "Nie uda\u0142o si\u0119 wczyta\u0107 worktree",
    "worktree.addPathPrompt": "\u015Acie\u017Cka docelowa nowego worktree:",
    "worktree.addBranchPrompt": "Nazwa nowej ga\u0142\u0119zi (na podstawie {base}):",
    "worktree.addFailed": "Nie uda\u0142o si\u0119 doda\u0107 worktree",
    "batch.revertDone": "Wycofano {n} commit\xF3w",
    "op.newBranchDone": "Utworzono ga\u0142\u0105\u017A {name}",
    "op.newBranchFailed": "Nie uda\u0142o si\u0119 utworzy\u0107 ga\u0142\u0119zi",
    "worktree.refreshed": "Od\u015Bwie\u017Cono list\u0119 worktree",
    "worktree.pruneDone": "Wyczyszczono {n} nieaktualnych worktree",
    "worktree.pruneNothing": "Brak nieaktualnych worktree",
    "worktree.pruneFailed": "Czyszczenie nie powiod\u0142o si\u0119",
    "worktree.removed": "Usuni\u0119to worktree",
    "worktree.added": "Utworzono worktree: {path}",
    "op.branchDirtyWorkingTree": "najpierw zacommituj lub od\u0142\xF3\u017C zmiany",
    "op.branchExists": "ga\u0142\u0105\u017A ju\u017C istnieje",
    "op.branchInvalidName": "nieprawid\u0142owa nazwa ga\u0142\u0119zi",
    "op.branchCreateGeneric": "szczeg\xF3\u0142y w konsoli",
    "console.commandCount": "polece\u0144 git",
    "console.clear": "Wyczy\u015B\u0107",
    "console.noCommands": "Brak polece\u0144 git",
    "console.selectCommand": "Wybierz polecenie",
    "console.noOutput": "(brak wyj\u015Bcia)",
    "console.loadFailed": "Nie uda\u0142o si\u0119 wczyta\u0107 dziennika",
    "op.resetFailed": "Resetowanie nie powiod\u0142o si\u0119",
    "branch.favoriteSaveFailed": "Nie uda\u0142o si\u0119 zapisa\u0107 ulubionych",
    "dialog.renameFailed": "Nie uda\u0142o si\u0119 zmieni\u0107 nazwy ga\u0142\u0119zi",
    "dialog.createBranchFailed": "Nie uda\u0142o si\u0119 utworzy\u0107 ga\u0142\u0119zi",
    "branch.loadFailed": "Nie uda\u0142o si\u0119 wczyta\u0107 ga\u0142\u0119zi",
    "commit.loadDetailFailed": "Nie uda\u0142o si\u0119 wczyta\u0107 szczeg\xF3\u0142\xF3w commita",
    "commit.loadListFailed": "Nie uda\u0142o si\u0119 wczyta\u0107 commit\xF3w",
    "worktree.removeFailed": "Nie uda\u0142o si\u0119 usun\u0105\u0107 worktree"
  };
  var ja = {
    "branch.checkout": "\u30D6\u30E9\u30F3\u30C1\u3092\u30C1\u30A7\u30C3\u30AF\u30A2\u30A6\u30C8",
    "branch.rename": "\u30D6\u30E9\u30F3\u30C1\u306E\u540D\u524D\u3092\u5909\u66F4",
    "branch.merge": "\u73FE\u5728\u306E\u30D6\u30E9\u30F3\u30C1\u306B\u30DE\u30FC\u30B8",
    "branch.rebase": "\u3053\u3053\u306B\u30EA\u30D9\u30FC\u30B9",
    "branch.pull": "\u30D7\u30EB",
    "branch.push": "\u30D7\u30C3\u30B7\u30E5",
    "branch.favorite": "\u304A\u6C17\u306B\u5165\u308A\u306B\u8FFD\u52A0",
    "branch.unfavorite": "\u304A\u6C17\u306B\u5165\u308A\u304B\u3089\u524A\u9664",
    "branch.delete": "\u30D6\u30E9\u30F3\u30C1\u3092\u524A\u9664",
    // 未合并强制删除对话框 + 删除通知（对齐 IDEA GitDeleteBranchOperation）
    "branch.forceDelete": "\u30D6\u30E9\u30F3\u30C1 {name} \u306F\u73FE\u5728\u306E\u30D6\u30E9\u30F3\u30C1\u306B\u30DE\u30FC\u30B8\u3055\u308C\u3066\u3044\u307E\u305B\u3093\u3002\u5F37\u5236\u524A\u9664\u3059\u308B\u3068\u305D\u306E\u4E0A\u306E\u30B3\u30DF\u30C3\u30C8\u306F\u5931\u308F\u308C\u307E\u3059\u3002",
    "branch.forceDeleteButton": "\u5F37\u5236\u524A\u9664",
    "branch.notFound": "\u30D6\u30E9\u30F3\u30C1 {name} \u306F\u5B58\u5728\u3057\u307E\u305B\u3093",
    "branch.deleteFailed": "\u30D6\u30E9\u30F3\u30C1\u306E\u524A\u9664\u306B\u5931\u6557\u3057\u307E\u3057\u305F",
    "sidebar.deleteBranch": "\u30D6\u30E9\u30F3\u30C1\u3092\u524A\u9664",
    "branch.batchDeleteDone": "{n} \u500B\u306E\u30D6\u30E9\u30F3\u30C1\u3092\u524A\u9664\u3057\u307E\u3057\u305F",
    "branch.batchDeletePartial": "{ok} \u500B\u524A\u9664\u3001\u5931\u6557: {failed}",
    "branch.selectBranch": "\u307E\u305A\u30D6\u30E9\u30F3\u30C1\u3092\u9078\u629E\u3057\u3066\u304F\u3060\u3055\u3044",
    "branch.deleteCurrent": "\u73FE\u5728\u306E\u30D6\u30E9\u30F3\u30C1\u306F\u524A\u9664\u3067\u304D\u307E\u305B\u3093",
    "branch.title": "\u30D6\u30E9\u30F3\u30C1",
    "branch.searchPlaceholder": "\u30D6\u30E9\u30F3\u30C1\u307E\u305F\u306F\u30BF\u30B0",
    "branch.notifyDeleted": "\u524A\u9664\u3057\u305F\u30D6\u30E9\u30F3\u30C1: {name}",
    "branch.restore": "\u5143\u306B\u623B\u3059",
    "branch.deleteTracking": "\u8FFD\u8DE1\u30D6\u30E9\u30F3\u30C1\u3092\u524A\u9664",
    "branch.restoreSuccess": "\u30D6\u30E9\u30F3\u30C1 {name} \u3092\u5FA9\u5143\u3057\u307E\u3057\u305F",
    "branch.restoreFailed": "\u30D6\u30E9\u30F3\u30C1\u306E\u5FA9\u5143\u306B\u5931\u6557\u3057\u307E\u3057\u305F",
    "branch.deleteTrackingFailed": "\u8FFD\u8DE1\u30D6\u30E9\u30F3\u30C1\u306E\u524A\u9664\u306B\u5931\u6557\u3057\u307E\u3057\u305F",
    "commit.copyRevision": "\u30B3\u30DF\u30C3\u30C8\u30CF\u30C3\u30B7\u30E5\u3092\u30B3\u30D4\u30FC",
    "commit.cherryPick": "\u30C1\u30A7\u30EA\u30FC\u30D4\u30C3\u30AF",
    "commit.compareLocal": "\u30ED\u30FC\u30AB\u30EB\u3068\u6BD4\u8F03",
    "commit.reset": "\u73FE\u5728\u306E\u30D6\u30E9\u30F3\u30C1\u3092\u3053\u3053\u306B\u30EA\u30BB\u30C3\u30C8",
    "commit.revert": "\u30B3\u30DF\u30C3\u30C8\u3092 revert",
    "commit.newBranch": "\u65B0\u3057\u3044\u30D6\u30E9\u30F3\u30C1",
    "commit.newTag": "\u65B0\u3057\u3044\u30BF\u30B0",
    "batch.selected": "{n} \u4EF6\u306E\u30B3\u30DF\u30C3\u30C8\u3092\u9078\u629E\u4E2D",
    "batch.copyHashes": "\u30CF\u30C3\u30B7\u30E5\u4E00\u89A7\u3092\u30B3\u30D4\u30FC",
    "batch.cherryPickAll": "\u3059\u3079\u3066\u30C1\u30A7\u30EA\u30FC\u30D4\u30C3\u30AF ({n})",
    "batch.revertAll": "\u3059\u3079\u3066 revert ({n})",
    "batch.confirmCherryPick": "\u9078\u629E\u3057\u305F {n} \u4EF6\u306E\u30B3\u30DF\u30C3\u30C8\u3092\u30C1\u30A7\u30EA\u30FC\u30D4\u30C3\u30AF\u3057\u307E\u3059\u304B\uFF1F",
    "batch.confirmRevert": "\u9078\u629E\u3057\u305F {n} \u4EF6\u306E\u30B3\u30DF\u30C3\u30C8\u3092 revert \u3057\u307E\u3059\u304B\uFF1F",
    "file.showDiff": "\u5DEE\u5206\u3092\u8868\u793A",
    "file.showDiffNew": "\u65B0\u3057\u3044\u30A6\u30A3\u30F3\u30C9\u30A6\u3067\u5DEE\u5206\u3092\u8868\u793A",
    "file.compareLocal": "\u30ED\u30FC\u30AB\u30EB\u3068\u6BD4\u8F03",
    "file.compareBeforeLocal": "\u5909\u66F4\u524D\u3068\u30ED\u30FC\u30AB\u30EB\u3092\u6BD4\u8F03",
    "file.editSource": "\u30BD\u30FC\u30B9\u3092\u7DE8\u96C6",
    "file.openRepoVersion": "\u30EA\u30DD\u30B8\u30C8\u30EA\u306E\u30D0\u30FC\u30B8\u30E7\u30F3\u3092\u958B\u304F",
    "file.revertChanges": "\u9078\u629E\u3057\u305F\u5909\u66F4\u3092 revert",
    "file.cherryPickChanges": "\u9078\u629E\u3057\u305F\u5909\u66F4\u3092\u30C1\u30A7\u30EA\u30FC\u30D4\u30C3\u30AF",
    "file.createPatch": "\u30D1\u30C3\u30C1\u3092\u4F5C\u6210",
    "file.getFromRevision": "\u30EA\u30D3\u30B8\u30E7\u30F3\u304B\u3089\u53D6\u5F97",
    "file.historyUpTo": "\u3053\u3053\u307E\u3067\u306E\u5C65\u6B74",
    // 侧边栏图标 / 显示设置 / 跳转 / 排序
    "sidebar.hideBranches": "Git \u30D6\u30E9\u30F3\u30C1\u3092\u96A0\u3059",
    "sidebar.showBranches": "Git \u30D6\u30E9\u30F3\u30C1\u3092\u8868\u793A",
    "sidebar.newBranch": "\u65B0\u3057\u3044\u30D6\u30E9\u30F3\u30C1",
    "sidebar.refresh": "\u66F4\u65B0",
    "sidebar.update": "\u66F4\u65B0",
    "sidebar.checkout": "\u30C1\u30A7\u30C3\u30AF\u30A2\u30A6\u30C8",
    "sidebar.merge": "\u30DE\u30FC\u30B8",
    "sidebar.search": "\u691C\u7D22",
    "sidebar.favorite": "\u304A\u6C17\u306B\u5165\u308A",
    "sidebar.settings": "\u8A2D\u5B9A",
    "sidebar.pull": "\u30D7\u30EB",
    "sidebar.expandAll": "\u3059\u3079\u3066\u5C55\u958B",
    "sidebar.sort": "\u4E26\u3079\u66FF\u3048",
    "sidebar.close": "\u9589\u3058\u308B",
    "sidebar.noSelectedBranch": "\u30D6\u30E9\u30F3\u30C1\u304C\u672A\u9078\u629E",
    "settings.title": "\u8868\u793A\u8A2D\u5B9A",
    "settings.showAuthor": "\u4F5C\u8005\u5217\u3092\u8868\u793A",
    "settings.showDate": "\u65E5\u4ED8\u5217\u3092\u8868\u793A",
    "settings.showHash": "\u30CF\u30C3\u30B7\u30E5\u5217\u3092\u8868\u793A",
    "goto.title": "\u53C2\u7167\u3078\u79FB\u52D5",
    "goto.placeholder": "\u30CF\u30C3\u30B7\u30E5\u307E\u305F\u306F\u30D6\u30E9\u30F3\u30C1\u540D\u3092\u5165\u529B",
    "goto.notFound": "\u4E00\u81F4\u3059\u308B\u9805\u76EE\u304C\u898B\u3064\u304B\u308A\u307E\u305B\u3093",
    "goto.ok": "\u79FB\u52D5",
    "sort.dateAsc": "\u4E26\u3079\u66FF\u3048: \u65E5\u4ED8\u306E\u6607\u9806",
    "sort.authorAsc": "\u4E26\u3079\u66FF\u3048: \u4F5C\u8005",
    "sort.messageAsc": "\u4E26\u3079\u66FF\u3048: \u30E1\u30C3\u30BB\u30FC\u30B8",
    // 工具栏过滤（分支 / 用户 / 日期 / 路径）
    "filter.branch": "\u30D6\u30E9\u30F3\u30C1",
    "filter.user": "\u30E6\u30FC\u30B6\u30FC",
    "filter.date": "\u65E5\u4ED8",
    "filter.path": "\u30D1\u30B9",
    "filter.selectAll": "\u3059\u3079\u3066\u9078\u629E",
    "filter.regex": "\u6B63\u898F\u8868\u73FE",
    "filter.case": "\u5927\u6587\u5B57\u3068\u5C0F\u6587\u5B57\u3092\u533A\u5225",
    "filter.all": "\u3059\u3079\u3066",
    "filter.localBranches": "\u30ED\u30FC\u30AB\u30EB\u30D6\u30E9\u30F3\u30C1",
    "filter.remoteBranches": "\u30EA\u30E2\u30FC\u30C8\u30D6\u30E9\u30F3\u30C1",
    "filter.favorites": "\u304A\u6C17\u306B\u5165\u308A",
    "filter.today": "\u4ECA\u65E5",
    "filter.thisWeek": "\u4ECA\u9031",
    "filter.thisMonth": "\u4ECA\u6708",
    "filter.thisYear": "\u4ECA\u5E74",
    "filter.custom": "\u30AB\u30B9\u30BF\u30E0\u2026",
    "filter.dateFrom": "\u958B\u59CB\u65E5",
    "filter.dateTo": "\u7D42\u4E86\u65E5",
    "filter.chooseFolder": "\u30D5\u30A9\u30EB\u30C0\u30FC\u3092\u9078\u629E\u2026",
    "filter.ok": "OK",
    "filter.cancel": "\u30AD\u30E3\u30F3\u30BB\u30EB",
    "filter.clear": "\u30AF\u30EA\u30A2",
    // 路径过滤（多选）
    "filter.selectPaths": "\u30D5\u30A3\u30EB\u30BF\u30FC\u3059\u308B\u30D1\u30B9\u306E\u9078\u629E\u2026",
    "filter.editPaths": "\u30D1\u30B9\u3092\u7DE8\u96C6\u2026",
    "filter.maxPaths": "\u6700\u5927 100 \u4EF6\u307E\u3067\u9078\u629E\u53EF\u80FD",
    "filter.noPaths": "\u9078\u629E\u53EF\u80FD\u306A\u30D1\u30B9\u304C\u3042\u308A\u307E\u305B\u3093",
    "filter.loadPathsFailed": "\u30D1\u30B9\u306E\u8AAD\u307F\u8FBC\u307F\u306B\u5931\u6557\u3057\u307E\u3057\u305F",
    "dialog.renameBranch": "\u30D6\u30E9\u30F3\u30C1\u540D\u306E\u5909\u66F4",
    "dialog.branchName": "\u30D6\u30E9\u30F3\u30C1\u540D",
    "dialog.startPoint": "\u958B\u59CB\u30DD\u30A4\u30F3\u30C8",
    "dialog.currentHead": "\u73FE\u5728\u306E HEAD",
    "dialog.inputBranchName": "\u30D6\u30E9\u30F3\u30C1\u540D\u3092\u5165\u529B\u2026",
    "dialog.checkoutAfterCreate": "\u4F5C\u6210\u5F8C\u306B\u30C1\u30A7\u30C3\u30AF\u30A2\u30A6\u30C8",
    "dialog.create": "\u4F5C\u6210",
    "dialog.dateFilter": "\u65E5\u4ED8\u3067\u30D5\u30A3\u30EB\u30BF",
    "dialog.startDate": "\u958B\u59CB\u65E5",
    "dialog.endDate": "\u7D42\u4E86\u65E5",
    "dialog.clear": "\u30AF\u30EA\u30A2",
    "dialog.resetTo": "\u30D6\u30E9\u30F3\u30C1\u3092 {hash} \u306B\u30EA\u30BB\u30C3\u30C8",
    "dialog.selectResetMode": "\u30EA\u30BB\u30C3\u30C8\u30E2\u30FC\u30C9\u3092\u9078\u629E:",
    "dialog.resetSoft": "Soft - HEAD \u306E\u307F\u79FB\u52D5",
    "dialog.resetMixed": "Mixed - HEAD \u3092\u79FB\u52D5 + \u30A4\u30F3\u30C7\u30C3\u30AF\u30B9\u3092\u30EA\u30BB\u30C3\u30C8\uFF08\u30C7\u30D5\u30A9\u30EB\u30C8\uFF09",
    "dialog.resetHard": "Hard - HEAD \u3092\u79FB\u52D5 + \u30A4\u30F3\u30C7\u30C3\u30AF\u30B9\u3068\u4F5C\u696D\u30C4\u30EA\u30FC\u3092\u30EA\u30BB\u30C3\u30C8",
    "dialog.reset": "\u30EA\u30BB\u30C3\u30C8",
    "dialog.branchFromCommit": "\u30B3\u30DF\u30C3\u30C8\u304B\u3089\u30D6\u30E9\u30F3\u30C1\u3092\u4F5C\u6210",
    "dialog.basedOn": "\u57FA\u6E96: {info}",
    "commit.searchPlaceholder": "\u30C6\u30AD\u30B9\u30C8\u307E\u305F\u306F\u30CF\u30C3\u30B7\u30E5",
    "branch.groupHead": "HEAD\uFF08\u73FE\u5728\u306E\u30D6\u30E9\u30F3\u30C1\uFF09",
    "branch.groupLocal": "\u30ED\u30FC\u30AB\u30EB",
    "branch.groupRemote": "\u30EA\u30E2\u30FC\u30C8",
    "file.noDiff": "\u5DEE\u5206\u306A\u3057",
    "file.changedFiles": "\u5909\u66F4\u3055\u308C\u305F\u30D5\u30A1\u30A4\u30EB",
    "detail.title": "\u30B3\u30DF\u30C3\u30C8\u8A73\u7D30",
    "detail.hash": "\u30CF\u30C3\u30B7\u30E5",
    "detail.author": "\u4F5C\u6210\u8005",
    "detail.date": "\u65E5\u4ED8",
    "main.loadingTitle": "\u521D\u671F\u5316\u4E2D\u2026",
    "main.loadingBody": "\u30D7\u30ED\u30B8\u30A7\u30AF\u30C8\u60C5\u5831\u3092\u8AAD\u307F\u8FBC\u3093\u3067\u3044\u307E\u3059\u3002",
    "main.notGitTitle": "Git \u30EA\u30DD\u30B8\u30C8\u30EA\u3067\u306F\u3042\u308A\u307E\u305B\u3093",
    "main.notGitBody": "\u73FE\u5728\u306E\u30C7\u30A3\u30EC\u30AF\u30C8\u30EA\u306F Git \u30EA\u30DD\u30B8\u30C8\u30EA\u3067\u306F\u3042\u308A\u307E\u305B\u3093\u3002",
    "time.justNow": "\u305F\u3063\u305F\u4ECA",
    "time.minutesAgo": "{n}\u5206\u524D",
    "time.hoursAgo": "{n}\u6642\u9593\u524D",
    "time.daysAgo": "{n}\u65E5\u524D",
    "commit.empty": "\u30B3\u30DF\u30C3\u30C8\u306F\u3042\u308A\u307E\u305B\u3093",
    "commit.noSelection": "\u5909\u66F4\u3092\u8868\u793A\u3059\u308B\u30B3\u30DF\u30C3\u30C8\u3092\u9078\u629E\u3057\u3066\u304F\u3060\u3055\u3044",
    "file.selectDiff": "\u5DEE\u5206\u3092\u8868\u793A\u3059\u308B\u30D5\u30A1\u30A4\u30EB\u3092\u9078\u629E\u3057\u3066\u304F\u3060\u3055\u3044",
    "file.noChanges": "\u5909\u66F4\u3055\u308C\u305F\u30D5\u30A1\u30A4\u30EB\u306F\u3042\u308A\u307E\u305B\u3093",
    "layout.resizeDivider": "\u30C9\u30E9\u30C3\u30B0\u3057\u3066\u30B5\u30A4\u30BA\u5909\u66F4",
    "main.tabConsole": "\u30B3\u30F3\u30BD\u30FC\u30EB",
    "reset.title": "\u73FE\u5728\u306E\u30D6\u30E9\u30F3\u30C1\u3092\u3053\u3053\u306B\u30EA\u30BB\u30C3\u30C8",
    "reset.softDesc": "\u4F5C\u696D\u30C4\u30EA\u30FC\u3068\u30A4\u30F3\u30C7\u30C3\u30AF\u30B9\u3092\u4FDD\u6301",
    "reset.mixedDesc": "\u4F5C\u696D\u30C4\u30EA\u30FC\u3092\u4FDD\u6301\u3057\u3001\u30A4\u30F3\u30C7\u30C3\u30AF\u30B9\u3092\u30EA\u30BB\u30C3\u30C8",
    "reset.hardDesc": "\u3059\u3079\u3066\u306E\u5909\u66F4\u3092\u7834\u68C4",
    "dialog.createBranchTitle": "\u65B0\u3057\u3044\u30D6\u30E9\u30F3\u30C1",
    "dialog.pathPlaceholder": "src/ \u307E\u305F\u306F packages/core",
    "dialog.cancel": "\u30AD\u30E3\u30F3\u30BB\u30EB",
    "dialog.ok": "OK",
    "filter.selectAllToggle": "\u73FE\u5728\u306E\u30EA\u30B9\u30C8\u3092\u3059\u3079\u3066\u9078\u629E/\u89E3\u9664",
    "sidebar.compareBranch": "\u73FE\u5728\u306E\u30D6\u30E9\u30F3\u30C1\u3068\u6BD4\u8F03",
    "compare.title": "{branch} \u3068 {current} \u306E\u6BD4\u8F03",
    "compare.branchOnly": "{branch} \u306E\u307F\u306E\u30B3\u30DF\u30C3\u30C8",
    "compare.currentOnly": "{current} \u306E\u307F\u306E\u30B3\u30DF\u30C3\u30C8",
    "compare.empty": "\u30B3\u30DF\u30C3\u30C8\u306A\u3057",
    "compare.loading": "\u8AAD\u307F\u8FBC\u307F\u4E2D\u2026",
    "compare.loadFailed": "\u30D6\u30E9\u30F3\u30C1\u306E\u6BD4\u8F03\u306B\u5931\u6557\u3057\u307E\u3057\u305F",
    "compare.selectBranch": "\u5148\u306B\u6BD4\u8F03\u3059\u308B\u30D6\u30E9\u30F3\u30C1\u3092\u9078\u629E\u3057\u3066\u304F\u3060\u3055\u3044",
    "compare.currentBranch": "\u73FE\u5728\u306E\u30D6\u30E9\u30F3\u30C1\u306F\u81EA\u5206\u81EA\u8EAB\u3068\u6BD4\u8F03\u3067\u304D\u307E\u305B\u3093",
    "compare.noCurrentBranch": "\u73FE\u5728\u306E\u30D6\u30E9\u30F3\u30C1\u304C\u307E\u3060\u8AAD\u307F\u8FBC\u307E\u308C\u3066\u3044\u307E\u305B\u3093\u3002\u3057\u3070\u3089\u304F\u3057\u3066\u304B\u3089\u518D\u8A66\u884C\u3057\u3066\u304F\u3060\u3055\u3044",
    "compare.with": "\u3068",
    "compare.identical": "\u30D6\u30E9\u30F3\u30C1\u306B\u5DEE\u7570\u306F\u3042\u308A\u307E\u305B\u3093",
    "compare.sameBranch": "\u7570\u306A\u308B 2 \u3064\u306E\u30D6\u30E9\u30F3\u30C1\u3092\u9078\u629E\u3057\u3066\u304F\u3060\u3055\u3044",
    "compare.tooMany": "\u6BD4\u8F03\u3067\u304D\u308B\u30D6\u30E9\u30F3\u30C1\u306F\u6700\u5927 2 \u3064\u3067\u3059",
    "sidebar.showMyBranches": "\u81EA\u5206\u306E\u30D6\u30E9\u30F3\u30C1\u306E\u307F\u8868\u793A",
    "sidebar.myBranchesFailed": "\u81EA\u5206\u306E\u30D6\u30E9\u30F3\u30C1\u3092\u8AAD\u307F\u8FBC\u3081\u307E\u305B\u3093\u3067\u3057\u305F",
    "sidebar.showMyBranchesOn": "\u81EA\u5206\u306E\u30D6\u30E9\u30F3\u30C1\u306E\u307F\u8868\u793A\u4E2D",
    "sidebar.myBranchesUnavailable": "\u7D5E\u308A\u8FBC\u3081\u308B\u30ED\u30FC\u30AB\u30EB\u30D6\u30E9\u30F3\u30C1\u304C\u3042\u308A\u307E\u305B\u3093",
    "sidebar.newBranchUnavailable": "\u4F5C\u6210\u5143\u306E\u30D6\u30E9\u30F3\u30C1\u304C\u3042\u308A\u307E\u305B\u3093",
    "sidebar.updateUnavailable": "\u30EA\u30E2\u30FC\u30C8\u304C\u8A2D\u5B9A\u3055\u308C\u3066\u3044\u307E\u305B\u3093",
    "sidebar.deleteRemoteUnavailable": "\u3053\u3053\u3067\u306F\u30EA\u30E2\u30FC\u30C8\u30D6\u30E9\u30F3\u30C1\u3092\u524A\u9664\u3067\u304D\u307E\u305B\u3093",
    "sidebar.expandAllUnavailable": "\u5C55\u958B\u3067\u304D\u308B\u30D6\u30E9\u30F3\u30C1\u304C\u3042\u308A\u307E\u305B\u3093",
    "sidebar.pullUnavailable": "\u30EA\u30E2\u30FC\u30C8\u304C\u8A2D\u5B9A\u3055\u308C\u3066\u3044\u307E\u305B\u3093",
    "sidebar.fetch": "\u30D5\u30A7\u30C3\u30C1",
    "sidebar.locate": "Git \u30ED\u30B0\u3067\u8868\u793A",
    "sidebar.collapseAll": "\u3059\u3079\u3066\u6298\u308A\u305F\u305F\u3080",
    "sidebar.locateNotInView": "{branch} \u306E\u6700\u65B0\u30B3\u30DF\u30C3\u30C8\u304C\u73FE\u5728\u306E\u4E00\u89A7\u306B\u3042\u308A\u307E\u305B\u3093",
    "sidebar.fetchAuthFailed": "\u8A8D\u8A3C\u306B\u5931\u6557\u3057\u307E\u3057\u305F",
    "sidebar.fetchUnreachable": "\u30EA\u30E2\u30FC\u30C8\u306B\u63A5\u7D9A\u3067\u304D\u307E\u305B\u3093",
    "sidebar.fetchNoRemote": "\u30EA\u30E2\u30FC\u30C8\u30EA\u30DD\u30B8\u30C8\u30EA\u304C\u898B\u3064\u304B\u308A\u307E\u305B\u3093",
    "sidebar.fetchFailed": "\u30D5\u30A7\u30C3\u30C1\u306B\u5931\u6557\u3057\u307E\u3057\u305F",
    "sidebar.fetchInProgress": "\u30D5\u30A7\u30C3\u30C1\u4E2D\u2026",
    "sidebar.fetchSuccessUpdates": "\u30D5\u30A7\u30C3\u30C1\u5B8C\u4E86: {count} \u500B\u306E\u30D6\u30E9\u30F3\u30C1\u306B\u65B0\u3057\u3044\u30B3\u30DF\u30C3\u30C8\u304C\u3042\u308A\u307E\u3059",
    "sidebar.fetchSuccessNoUpdates": "\u30D5\u30A7\u30C3\u30C1\u5B8C\u4E86: \u6700\u65B0\u306E\u72B6\u614B\u3067\u3059",
    "settings.groupView": "\u8868\u793A",
    "settings.groupGraph": "\u30B0\u30E9\u30D5",
    "settings.showBranchLabels": "\u30D6\u30E9\u30F3\u30C1\u30E9\u30D9\u30EB\u3092\u8868\u793A",
    "settings.showTagNames": "\u30BF\u30B0\u540D",
    "settings.compactReferences": "\u53C2\u7167\u306E\u30B3\u30F3\u30D1\u30AF\u30C8\u8868\u793A",
    "settings.preferCommitDate": "\u30B3\u30DF\u30C3\u30C8\u6642\u523B",
    "settings.referencesOnLeft": "\u53C2\u7167\u3092\u5DE6\u306B\u8868\u793A",
    "settings.showLongEdges": "\u9577\u3044\u30A8\u30C3\u30B8",
    "commit.copied": "\u30AF\u30EA\u30C3\u30D7\u30DC\u30FC\u30C9\u306B\u30B3\u30D4\u30FC\u3057\u307E\u3057\u305F",
    "commit.copyFailed": "\u30B3\u30D4\u30FC\u306B\u5931\u6557\u3057\u307E\u3057\u305F",
    "commit.cherryPickNoSelection": "\u5148\u306B\u30B3\u30DF\u30C3\u30C8\u3092\u9078\u629E\u3057\u3066\u304F\u3060\u3055\u3044",
    "commit.cherryPickDoneMulti": "{n} \u4EF6\u306E\u30B3\u30DF\u30C3\u30C8\u3092\u30C1\u30A7\u30EA\u30FC\u30D4\u30C3\u30AF\u3057\u307E\u3057\u305F",
    "commit.cherryPickDone": "{hash} \u3092\u30C1\u30A7\u30EA\u30FC\u30D4\u30C3\u30AF\u3057\u307E\u3057\u305F",
    "commit.cherryPickFailed": "\u30C1\u30A7\u30EA\u30FC\u30D4\u30C3\u30AF\u306B\u5931\u6557\u3057\u307E\u3057\u305F",
    "commit.cherryPickConflict": "\u30C1\u30A7\u30EA\u30FC\u30D4\u30C3\u30AF\u3067\u7AF6\u5408\u304C\u767A\u751F\u3057\u307E\u3057\u305F\u3002\u89E3\u6C7A\u3057\u3066\u7D9A\u884C\u3059\u308B\u304B\u4E2D\u6B62\u3057\u3066\u304F\u3060\u3055\u3044",
    "batch.cherryPickDone": "{n} \u500B\u306E\u30B3\u30DF\u30C3\u30C8\u3092\u30C1\u30A7\u30EA\u30FC\u30D4\u30C3\u30AF\u3057\u307E\u3057\u305F",
    "commit.uncommit": "\u30B3\u30DF\u30C3\u30C8\u3092\u53D6\u308A\u6D88\u3059",
    "commit.uncommitDone": "\u30B3\u30DF\u30C3\u30C8 {hash} \u3092\u53D6\u308A\u6D88\u3057\u307E\u3057\u305F",
    "commit.uncommitFailed": "\u30B3\u30DF\u30C3\u30C8\u306E\u53D6\u308A\u6D88\u3057\u306B\u5931\u6557\u3057\u307E\u3057\u305F",
    "commit.reword": "\u30B3\u30DF\u30C3\u30C8\u30E1\u30C3\u30BB\u30FC\u30B8\u3092\u7DE8\u96C6",
    "commit.rewordTitle": "\u30B3\u30DF\u30C3\u30C8\u30E1\u30C3\u30BB\u30FC\u30B8\u3092\u7DE8\u96C6",
    "commit.rewordEmpty": "\u30B3\u30DF\u30C3\u30C8\u30E1\u30C3\u30BB\u30FC\u30B8\u306F\u7A7A\u306B\u3067\u304D\u307E\u305B\u3093",
    "commit.rewordDone": "\u30B3\u30DF\u30C3\u30C8\u30E1\u30C3\u30BB\u30FC\u30B8\u3092\u66F4\u65B0\u3057\u307E\u3057\u305F",
    "commit.dropCommit": "\u30B3\u30DF\u30C3\u30C8\u3092\u524A\u9664",
    "commit.dropConfirm": "\u30B3\u30DF\u30C3\u30C8 {hash} \u3092\u524A\u9664\u3057\u307E\u3059\u304B\uFF1F\u5C65\u6B74\u304C\u66F8\u304D\u63DB\u3048\u3089\u308C\u307E\u3059\u3002",
    "commit.dropDone": "\u30B3\u30DF\u30C3\u30C8 {hash} \u3092\u524A\u9664\u3057\u307E\u3057\u305F",
    "commit.dropFailed": "\u30B3\u30DF\u30C3\u30C8\u306E\u524A\u9664\u306B\u5931\u6557\u3057\u307E\u3057\u305F",
    "commit.pushUpTo": "\u3053\u3053\u307E\u3067\u306E\u30B3\u30DF\u30C3\u30C8\u3092\u30D7\u30C3\u30B7\u30E5",
    "commit.pushUpToDone": "{ref} \u3092\u30D7\u30C3\u30B7\u30E5\u3057\u307E\u3057\u305F",
    "commit.pushUpToRejected": "\u30D7\u30C3\u30B7\u30E5\u304C\u62D2\u5426\u3055\u308C\u307E\u3057\u305F\u3002\u5148\u306B\u30D5\u30A7\u30C3\u30C1\u3057\u3066\u304F\u3060\u3055\u3044",
    "commit.pushUpToFailed": "\u30D7\u30C3\u30B7\u30E5\u306B\u5931\u6557\u3057\u307E\u3057\u305F",
    "commit.pushNoBranch": "\u3053\u306E\u30B3\u30DF\u30C3\u30C8\u3092\u542B\u3080\u30D6\u30E9\u30F3\u30C1\u304C\u3042\u308A\u307E\u305B\u3093",
    "commit.dirtyWorkingTree": "\u5C65\u6B74\u3092\u66F8\u304D\u63DB\u3048\u308B\u524D\u306B\u5909\u66F4\u3092\u30B3\u30DF\u30C3\u30C8\u307E\u305F\u306F\u30B9\u30BF\u30C3\u30B7\u30E5\u3057\u3066\u304F\u3060\u3055\u3044",
    "commit.revertDone": "{hash} \u3092\u30EA\u30D0\u30FC\u30C8\u3057\u307E\u3057\u305F",
    "commit.revertFailed": "\u30EA\u30D0\u30FC\u30C8\u306B\u5931\u6557\u3057\u307E\u3057\u305F",
    "commit.revertConflict": "\u30EA\u30D0\u30FC\u30C8\u3067\u7AF6\u5408\u304C\u767A\u751F\u3057\u307E\u3057\u305F\u3002\u89E3\u6C7A\u3057\u3066\u7D9A\u884C\u3059\u308B\u304B\u4E2D\u6B62\u3057\u3066\u304F\u3060\u3055\u3044",
    "op.failed": "\u64CD\u4F5C\u306B\u5931\u6557\u3057\u307E\u3057\u305F",
    "op.conflict": "\u30DE\u30FC\u30B8\u7AF6\u5408",
    "op.authFailed": "\u8A8D\u8A3C\u306B\u5931\u6557\u3057\u307E\u3057\u305F",
    "op.unreachable": "\u30EA\u30E2\u30FC\u30C8\u306B\u63A5\u7D9A\u3067\u304D\u307E\u305B\u3093",
    "op.rejected": "\u30D7\u30C3\u30B7\u30E5\u304C\u62D2\u5426\u3055\u308C\u307E\u3057\u305F\u3002\u5148\u306B\u30D5\u30A7\u30C3\u30C1\u3057\u3066\u304F\u3060\u3055\u3044",
    "op.checkoutDone": "{name} \u306B\u5207\u308A\u66FF\u3048\u307E\u3057\u305F",
    "op.mergeDone": "{name} \u3092\u30DE\u30FC\u30B8\u3057\u307E\u3057\u305F",
    "op.rebaseDone": "{name} \u306B\u30EA\u30D9\u30FC\u30B9\u3057\u307E\u3057\u305F",
    "op.pullDone": "\u30D7\u30EB\u3057\u307E\u3057\u305F",
    "op.pushDone": "\u30D7\u30C3\u30B7\u30E5\u3057\u307E\u3057\u305F",
    "op.deleteDone": "\u30D6\u30E9\u30F3\u30C1 {name} \u3092\u524A\u9664\u3057\u307E\u3057\u305F",
    "worktree.refresh": "\u66F4\u65B0",
    "worktree.add": "worktree \u3092\u8FFD\u52A0",
    "worktree.prune": "\u6574\u7406",
    "worktree.empty": "worktree \u306F\u3042\u308A\u307E\u305B\u3093",
    "worktree.main": "\u30E1\u30A4\u30F3",
    "worktree.remove": "\u524A\u9664",
    "worktree.removeConfirm": "worktree {path} \u3092\u524A\u9664\u3057\u307E\u3059\u304B\uFF1F",
    "worktree.forceConfirm": "\u672A\u30B3\u30DF\u30C3\u30C8\u306E\u5909\u66F4\u304C\u3042\u308A\u307E\u3059\u3002\u5F37\u5236\u524A\u9664\u3057\u307E\u3059\u304B\uFF1F",
    "worktree.loadFailed": "worktree \u306E\u8AAD\u307F\u8FBC\u307F\u306B\u5931\u6557\u3057\u307E\u3057\u305F",
    "worktree.addPathPrompt": "\u65B0\u3057\u3044 worktree \u306E\u30D1\u30B9:",
    "worktree.addBranchPrompt": "\u65B0\u3057\u3044\u30D6\u30E9\u30F3\u30C1\u540D\uFF08{base} \u3092\u57FA\u6E96\uFF09:",
    "worktree.addFailed": "worktree \u306E\u8FFD\u52A0\u306B\u5931\u6557\u3057\u307E\u3057\u305F",
    "batch.revertDone": "{n} \u500B\u306E\u30B3\u30DF\u30C3\u30C8\u3092\u30EA\u30D0\u30FC\u30C8\u3057\u307E\u3057\u305F",
    "op.newBranchDone": "\u30D6\u30E9\u30F3\u30C1 {name} \u3092\u4F5C\u6210\u3057\u307E\u3057\u305F",
    "op.newBranchFailed": "\u30D6\u30E9\u30F3\u30C1\u306E\u4F5C\u6210\u306B\u5931\u6557\u3057\u307E\u3057\u305F",
    "worktree.refreshed": "worktree \u4E00\u89A7\u3092\u66F4\u65B0\u3057\u307E\u3057\u305F",
    "worktree.pruneDone": "\u4E0D\u8981\u306A worktree \u3092 {n} \u4EF6\u6574\u7406\u3057\u307E\u3057\u305F",
    "worktree.pruneNothing": "\u6574\u7406\u3059\u308B worktree \u306F\u3042\u308A\u307E\u305B\u3093",
    "worktree.pruneFailed": "\u6574\u7406\u306B\u5931\u6557\u3057\u307E\u3057\u305F",
    "worktree.removed": "worktree \u3092\u524A\u9664\u3057\u307E\u3057\u305F",
    "worktree.added": "worktree \u3092\u4F5C\u6210\u3057\u307E\u3057\u305F: {path}",
    "op.branchDirtyWorkingTree": "\u5148\u306B\u5909\u66F4\u3092\u30B3\u30DF\u30C3\u30C8\u307E\u305F\u306F\u30B9\u30BF\u30C3\u30B7\u30E5\u3057\u3066\u304F\u3060\u3055\u3044",
    "op.branchExists": "\u30D6\u30E9\u30F3\u30C1\u306F\u65E2\u306B\u5B58\u5728\u3057\u307E\u3059",
    "op.branchInvalidName": "\u30D6\u30E9\u30F3\u30C1\u540D\u304C\u4E0D\u6B63\u3067\u3059",
    "op.branchCreateGeneric": "\u8A73\u7D30\u306F\u30B3\u30F3\u30BD\u30FC\u30EB\u3092\u53C2\u7167",
    "console.commandCount": "\u4EF6\u306E git \u30B3\u30DE\u30F3\u30C9",
    "console.clear": "\u30AF\u30EA\u30A2",
    "console.noCommands": "git \u30B3\u30DE\u30F3\u30C9\u306F\u307E\u3060\u3042\u308A\u307E\u305B\u3093",
    "console.selectCommand": "\u30B3\u30DE\u30F3\u30C9\u3092\u9078\u629E",
    "console.noOutput": "\uFF08\u51FA\u529B\u306A\u3057\uFF09",
    "console.loadFailed": "\u30B3\u30DE\u30F3\u30C9\u30ED\u30B0\u306E\u8AAD\u307F\u8FBC\u307F\u306B\u5931\u6557\u3057\u307E\u3057\u305F",
    "op.resetFailed": "\u30EA\u30BB\u30C3\u30C8\u306B\u5931\u6557\u3057\u307E\u3057\u305F",
    "branch.favoriteSaveFailed": "\u304A\u6C17\u306B\u5165\u308A\u306E\u4FDD\u5B58\u306B\u5931\u6557\u3057\u307E\u3057\u305F",
    "dialog.renameFailed": "\u30D6\u30E9\u30F3\u30C1\u540D\u306E\u5909\u66F4\u306B\u5931\u6557\u3057\u307E\u3057\u305F",
    "dialog.createBranchFailed": "\u30D6\u30E9\u30F3\u30C1\u306E\u4F5C\u6210\u306B\u5931\u6557\u3057\u307E\u3057\u305F",
    "branch.loadFailed": "\u30D6\u30E9\u30F3\u30C1\u306E\u8AAD\u307F\u8FBC\u307F\u306B\u5931\u6557\u3057\u307E\u3057\u305F",
    "commit.loadDetailFailed": "\u30B3\u30DF\u30C3\u30C8\u8A73\u7D30\u306E\u8AAD\u307F\u8FBC\u307F\u306B\u5931\u6557\u3057\u307E\u3057\u305F",
    "commit.loadListFailed": "\u30B3\u30DF\u30C3\u30C8\u4E00\u89A7\u306E\u8AAD\u307F\u8FBC\u307F\u306B\u5931\u6557\u3057\u307E\u3057\u305F",
    "worktree.removeFailed": "worktree \u306E\u524A\u9664\u306B\u5931\u6557\u3057\u307E\u3057\u305F"
  };
  var tr = {
    "branch.checkout": "Dal\u0131 checkout et",
    "branch.rename": "Dal\u0131 yeniden adland\u0131r",
    "branch.merge": "Ge\xE7erli dala birle\u015Ftir",
    "branch.rebase": "Buraya rebase et",
    "branch.pull": "Pull",
    "branch.push": "Push",
    "branch.favorite": "Favorilere ekle",
    "branch.unfavorite": "Favorilerden kald\u0131r",
    "branch.delete": "Dal\u0131 sil",
    // 未合并强制删除对话框 + 删除通知（对齐 IDEA GitDeleteBranchOperation）
    "branch.forceDelete": "{name} dal\u0131 ge\xE7erli dala birle\u015Ftirilmemi\u015F. Zorla silmek \xFCzerindeki commitlerin kaybolmas\u0131na neden olur.",
    "branch.forceDeleteButton": "Zorla sil",
    "branch.notFound": "{name} dal\u0131 mevcut de\u011Fil",
    "branch.deleteFailed": "Dal silinemedi",
    "sidebar.deleteBranch": "Dal\u0131 sil",
    "branch.batchDeleteDone": "{n} dal silindi",
    "branch.batchDeletePartial": "{ok} dal silindi, ba\u015Far\u0131s\u0131z: {failed}",
    "branch.selectBranch": "\xD6nce bir dal se\xE7in",
    "branch.deleteCurrent": "Ge\xE7erli dal silinemez",
    "branch.title": "Dallar",
    "branch.searchPlaceholder": "Dal veya etiket",
    "branch.notifyDeleted": "Silinen dal: {name}",
    "branch.restore": "Geri y\xFCkle",
    "branch.deleteTracking": "\u0130zleme dal\u0131n\u0131 sil",
    "branch.restoreSuccess": "Dal {name} geri y\xFCklendi",
    "branch.restoreFailed": "Dal geri y\xFCklenemedi",
    "branch.deleteTrackingFailed": "\u0130zleme dal\u0131 silinemedi",
    "commit.copyRevision": "Commit hash'ini kopyala",
    "commit.cherryPick": "Cherry-pick",
    "commit.compareLocal": "Yerel ile kar\u015F\u0131la\u015Ft\u0131r",
    "commit.reset": "Ge\xE7erli dal\u0131 buraya s\u0131f\u0131rla",
    "commit.revert": "Commit'i geri al",
    "commit.newBranch": "Yeni dal",
    "commit.newTag": "Yeni etiket",
    "batch.selected": "{n} commit se\xE7ildi",
    "batch.copyHashes": "Hash listesini kopyala",
    "batch.cherryPickAll": "T\xFCm\xFCn\xFC cherry-pick et ({n})",
    "batch.revertAll": "T\xFCm\xFCn\xFC geri al ({n})",
    "batch.confirmCherryPick": "Se\xE7ili {n} commit cherry-pick edilsin mi?",
    "batch.confirmRevert": "Se\xE7ili {n} commit geri al\u0131ns\u0131n m\u0131?",
    "file.showDiff": "Fark\u0131 g\xF6ster",
    "file.showDiffNew": "Fark\u0131 yeni pencerede g\xF6ster",
    "file.compareLocal": "Yerel ile kar\u015F\u0131la\u015Ft\u0131r",
    "file.compareBeforeLocal": "De\u011Fi\u015Fiklik \xF6ncesi ile yereli kar\u015F\u0131la\u015Ft\u0131r",
    "file.editSource": "Kayna\u011F\u0131 d\xFCzenle",
    "file.openRepoVersion": "Depo s\xFCr\xFCm\xFCn\xFC a\xE7",
    "file.revertChanges": "Se\xE7ili de\u011Fi\u015Fiklikleri geri al",
    "file.cherryPickChanges": "Se\xE7ili de\u011Fi\u015Fiklikleri cherry-pick et",
    "file.createPatch": "Yama olu\u015Ftur",
    "file.getFromRevision": "Revizyondan al",
    "file.historyUpTo": "Buraya kadar ge\xE7mi\u015F",
    // 侧边栏图标 / 显示设置 / 跳转 / 排序
    "sidebar.hideBranches": "Git dallar\u0131n\u0131 gizle",
    "sidebar.showBranches": "Git dallar\u0131n\u0131 g\xF6ster",
    "sidebar.newBranch": "Yeni dal",
    "sidebar.refresh": "Yenile",
    "sidebar.update": "G\xFCncelle",
    "sidebar.checkout": "Checkout",
    "sidebar.merge": "Birle\u015Ftir",
    "sidebar.search": "Ara",
    "sidebar.favorite": "Favori",
    "sidebar.settings": "Ayarlar",
    "sidebar.pull": "Pull",
    "sidebar.expandAll": "T\xFCm\xFCn\xFC geni\u015Flet",
    "sidebar.sort": "S\u0131rala",
    "sidebar.close": "Kapat",
    "sidebar.noSelectedBranch": "Dal se\xE7ilmedi",
    "settings.title": "G\xF6r\xFCn\xFCm ayarlar\u0131",
    "settings.showAuthor": "Yazar s\xFCtununu g\xF6ster",
    "settings.showDate": "Tarih s\xFCtununu g\xF6ster",
    "settings.showHash": "Hash s\xFCtununu g\xF6ster",
    "goto.title": "Referansa git",
    "goto.placeholder": "Hash veya dal ad\u0131 girin",
    "goto.notFound": "E\u015Fle\u015Fme bulunamad\u0131",
    "goto.ok": "Git",
    "sort.dateAsc": "S\u0131rala: tarihe g\xF6re artan",
    "sort.authorAsc": "S\u0131rala: yazar",
    "sort.messageAsc": "S\u0131rala: mesaj",
    // 工具栏过滤（分支 / 用户 / 日期 / 路径）
    "filter.branch": "Dal",
    "filter.user": "Kullan\u0131c\u0131",
    "filter.date": "Tarih",
    "filter.path": "Yol",
    "filter.selectAll": "T\xFCm\xFCn\xFC se\xE7",
    "filter.regex": "D\xFCzenli ifade",
    "filter.case": "B\xFCy\xFCk/k\xFC\xE7\xFCk harf duyarl\u0131",
    "filter.all": "T\xFCm\xFC",
    "filter.localBranches": "Yerel dallar",
    "filter.remoteBranches": "Uzak dallar",
    "filter.favorites": "Favoriler",
    "filter.today": "Bug\xFCn",
    "filter.thisWeek": "Bu hafta",
    "filter.thisMonth": "Bu ay",
    "filter.thisYear": "Bu y\u0131l",
    "filter.custom": "\xD6zel\u2026",
    "filter.dateFrom": "Ba\u015Flang\u0131\xE7 tarihi",
    "filter.dateTo": "Biti\u015F tarihi",
    "filter.chooseFolder": "Klas\xF6r se\xE7\u2026",
    "filter.ok": "Tamam",
    "filter.cancel": "\u0130ptal",
    "filter.clear": "Temizle",
    // 路径过滤（多选）
    "filter.selectPaths": "Filtrelenecek yollar\u0131 se\xE7",
    "filter.editPaths": "Yollar\u0131 d\xFCzenle\u2026",
    "filter.maxPaths": "En fazla 100 yol se\xE7ilebilir",
    "filter.noPaths": "Se\xE7ilebilir yol yok",
    "filter.loadPathsFailed": "Yollar y\xFCklenemedi",
    "dialog.renameBranch": "Dal\u0131 yeniden adland\u0131r",
    "dialog.branchName": "Dal ad\u0131",
    "dialog.startPoint": "Ba\u015Flang\u0131\xE7 noktas\u0131",
    "dialog.currentHead": "Ge\xE7erli HEAD",
    "dialog.inputBranchName": "Dal ad\u0131 girin\u2026",
    "dialog.checkoutAfterCreate": "Olu\u015Fturduktan sonra ge\xE7",
    "dialog.create": "Olu\u015Ftur",
    "dialog.dateFilter": "Tarihe g\xF6re filtrele",
    "dialog.startDate": "Ba\u015Flang\u0131\xE7 tarihi",
    "dialog.endDate": "Biti\u015F tarihi",
    "dialog.clear": "Temizle",
    "dialog.resetTo": "Dal\u0131 \u015Fu ana s\u0131f\u0131rla: {hash}",
    "dialog.selectResetMode": "S\u0131f\u0131rlama modu se\xE7in:",
    "dialog.resetSoft": "Soft - yaln\u0131zca HEAD ta\u015F\u0131",
    "dialog.resetMixed": "Mixed - HEAD ta\u015F\u0131 + dizini s\u0131f\u0131rla (varsay\u0131lan)",
    "dialog.resetHard": "Hard - HEAD ta\u015F\u0131 + dizin ve \xE7al\u0131\u015Fma a\u011Fac\u0131n\u0131 s\u0131f\u0131rla",
    "dialog.reset": "S\u0131f\u0131rla",
    "dialog.branchFromCommit": "Commit'ten dal olu\u015Ftur",
    "dialog.basedOn": "Dayanak: {info}",
    "commit.searchPlaceholder": "Metin veya hash",
    "branch.groupHead": "HEAD (ge\xE7erli dal)",
    "branch.groupLocal": "Yerel",
    "branch.groupRemote": "Uzak",
    "file.noDiff": "Fark yok",
    "file.changedFiles": "De\u011Fi\u015Fen dosyalar",
    "detail.title": "Commit ayr\u0131nt\u0131lar\u0131",
    "detail.hash": "Hash",
    "detail.author": "Yazar",
    "detail.date": "Tarih",
    "main.loadingTitle": "Ba\u015Flat\u0131l\u0131yor\u2026",
    "main.loadingBody": "Proje bilgileri y\xFCkleniyor.",
    "main.notGitTitle": "Git deposu de\u011Fil",
    "main.notGitBody": "Ge\xE7erli dizin bir Git deposu de\u011Fil.",
    "time.justNow": "az \xF6nce",
    "time.minutesAgo": "{n} dk \xF6nce",
    "time.hoursAgo": "{n} sa \xF6nce",
    "time.daysAgo": "{n} g\xFCn \xF6nce",
    "commit.empty": "Commit yok",
    "commit.noSelection": "De\u011Fi\u015Fiklikleri g\xF6rmek i\xE7in bir commit se\xE7in",
    "file.selectDiff": "Fark\u0131 g\xF6rmek i\xE7in bir dosya se\xE7in",
    "file.noChanges": "De\u011Fi\u015Fen dosya yok",
    "layout.resizeDivider": "Boyutland\u0131rmak i\xE7in s\xFCr\xFCkleyin",
    "main.tabConsole": "Konsol",
    "reset.title": "Ge\xE7erli dal\u0131 buraya s\u0131f\u0131rla",
    "reset.softDesc": "\xE7al\u0131\u015Fma a\u011Fac\u0131n\u0131 ve dizini koru",
    "reset.mixedDesc": "\xE7al\u0131\u015Fma a\u011Fac\u0131n\u0131 koru, dizini s\u0131f\u0131rla",
    "reset.hardDesc": "t\xFCm de\u011Fi\u015Fiklikleri iptal et",
    "dialog.createBranchTitle": "Yeni dal",
    "dialog.pathPlaceholder": "src/ veya packages/core",
    "dialog.cancel": "\u0130ptal",
    "dialog.ok": "Tamam",
    "filter.selectAllToggle": "Ge\xE7erli listede t\xFCm\xFCn\xFC se\xE7 / se\xE7imi kald\u0131r",
    "sidebar.compareBranch": "Ge\xE7erli dalla kar\u015F\u0131la\u015Ft\u0131r",
    "compare.title": "{branch} ile {current} kar\u015F\u0131la\u015Ft\u0131r\u0131l\u0131yor",
    "compare.branchOnly": "Yaln\u0131zca {branch} i\xE7inde",
    "compare.currentOnly": "Yaln\u0131zca {current} i\xE7inde",
    "compare.empty": "Commit yok",
    "compare.loading": "Y\xFCkleniyor\u2026",
    "compare.loadFailed": "Dallar kar\u015F\u0131la\u015Ft\u0131r\u0131lamad\u0131",
    "compare.selectBranch": "\xD6nce kar\u015F\u0131la\u015Ft\u0131r\u0131lacak bir dal se\xE7in",
    "compare.currentBranch": "Ge\xE7erli dal kendisiyle kar\u015F\u0131la\u015Ft\u0131r\u0131lamaz",
    "compare.noCurrentBranch": "Ge\xE7erli dal hen\xFCz y\xFCklenmedi, l\xFCtfen tekrar deneyin",
    "compare.with": "ile",
    "compare.identical": "Dallar ayn\u0131",
    "compare.sameBranch": "\u0130ki farkl\u0131 dal se\xE7in",
    "compare.tooMany": "Kar\u015F\u0131la\u015Ft\u0131rmak i\xE7in en fazla iki dal se\xE7in",
    "sidebar.showMyBranches": "Yaln\u0131zca kendi dallar\u0131m\u0131 g\xF6ster",
    "sidebar.myBranchesFailed": "Kendi dallar\u0131m y\xFCklenemedi",
    "sidebar.showMyBranchesOn": "Yaln\u0131zca kendi dallar\u0131m g\xF6steriliyor",
    "sidebar.myBranchesUnavailable": "Filtrelenecek yerel dal yok",
    "sidebar.newBranchUnavailable": "Olu\u015Fturulacak dal yok",
    "sidebar.updateUnavailable": "Uzak depo yap\u0131land\u0131r\u0131lmam\u0131\u015F",
    "sidebar.deleteRemoteUnavailable": "Uzak dallar burada silinemez",
    "sidebar.expandAllUnavailable": "Geni\u015Fletilecek dal yok",
    "sidebar.pullUnavailable": "Uzak depo yap\u0131land\u0131r\u0131lmam\u0131\u015F",
    "sidebar.fetch": "De\u011Fi\u015Fiklikleri getir",
    "sidebar.locate": "Git g\xFCnl\xFC\u011F\xFCnde g\xF6ster",
    "sidebar.collapseAll": "T\xFCm\xFCn\xFC daralt",
    "sidebar.locateNotInView": "{branch} son commit'i mevcut listede de\u011Fil",
    "sidebar.fetchAuthFailed": "Kimlik do\u011Frulama ba\u015Far\u0131s\u0131z",
    "sidebar.fetchUnreachable": "Uzak depoya ula\u015F\u0131lam\u0131yor",
    "sidebar.fetchNoRemote": "Uzak depo bulunamad\u0131",
    "sidebar.fetchFailed": "Uzak de\u011Fi\u015Fiklikler al\u0131namad\u0131",
    "sidebar.fetchInProgress": "De\u011Fi\u015Fiklikler al\u0131n\u0131yor\u2026",
    "sidebar.fetchSuccessUpdates": "Al\u0131nd\u0131: {count} dalda yeni commit var",
    "sidebar.fetchSuccessNoUpdates": "Al\u0131nd\u0131: zaten g\xFCncel",
    "settings.groupView": "G\xF6r\xFCn\xFCm",
    "settings.groupGraph": "Graf",
    "settings.showBranchLabels": "Dal etiketlerini g\xF6ster",
    "settings.showTagNames": "Etiket adlar\u0131",
    "settings.compactReferences": "Kompakt referans g\xF6r\xFCn\xFCm\xFC",
    "settings.preferCommitDate": "Commit zaman damgas\u0131",
    "settings.referencesOnLeft": "Referanslar solda",
    "settings.showLongEdges": "Uzun kenarlar",
    "commit.copied": "Panoya kopyaland\u0131",
    "commit.copyFailed": "Kopyalama ba\u015Far\u0131s\u0131z",
    "commit.cherryPickNoSelection": "\xD6nce bir commit se\xE7in",
    "commit.cherryPickDoneMulti": "{n} commit cherry-pick edildi",
    "commit.cherryPickDone": "{hash} cherry-pick yap\u0131ld\u0131",
    "commit.cherryPickFailed": "Cherry-pick ba\u015Far\u0131s\u0131z",
    "commit.cherryPickConflict": "Cherry-pick \xE7ak\u0131\u015Fmas\u0131, \xE7\xF6z\xFCp devam edin veya iptal edin",
    "batch.cherryPickDone": "{n} commit cherry-pick yap\u0131ld\u0131",
    "commit.uncommit": "Commit'i geri al",
    "commit.uncommitDone": "{hash} commit'i geri al\u0131nd\u0131",
    "commit.uncommitFailed": "Commit geri al\u0131namad\u0131",
    "commit.reword": "Commit mesaj\u0131n\u0131 d\xFCzenle",
    "commit.rewordTitle": "Commit mesaj\u0131n\u0131 d\xFCzenle",
    "commit.rewordEmpty": "Commit mesaj\u0131 bo\u015F olamaz",
    "commit.rewordDone": "Commit mesaj\u0131 g\xFCncellendi",
    "commit.dropCommit": "Commit'i sil",
    "commit.dropConfirm": "{hash} commit'i silinsin mi? Ge\xE7mi\u015F yeniden yaz\u0131lacak.",
    "commit.dropDone": "{hash} commit'i silindi",
    "commit.dropFailed": "Commit silinemedi",
    "commit.pushUpTo": "Buraya kadarki commit'leri g\xF6nder",
    "commit.pushUpToDone": "{ref} g\xF6nderildi",
    "commit.pushUpToRejected": "G\xF6nderim reddedildi, \xF6nce \xE7ekin",
    "commit.pushUpToFailed": "G\xF6nderim ba\u015Far\u0131s\u0131z",
    "commit.pushNoBranch": "Bu commit'i i\xE7eren dal yok",
    "commit.dirtyWorkingTree": "Ge\xE7mi\u015Fi yeniden yazmadan \xF6nce de\u011Fi\u015Fiklikleri commit'leyin veya stash'leyin",
    "commit.revertDone": "{hash} geri al\u0131nd\u0131",
    "commit.revertFailed": "Geri alma ba\u015Far\u0131s\u0131z",
    "commit.revertConflict": "Revert \xE7ak\u0131\u015Fmas\u0131, \xE7\xF6z\xFCp devam edin veya iptal edin",
    "op.failed": "\u0130\u015Flem ba\u015Far\u0131s\u0131z",
    "op.conflict": "Birle\u015Ftirme \xE7ak\u0131\u015Fmas\u0131",
    "op.authFailed": "Kimlik do\u011Frulama ba\u015Far\u0131s\u0131z",
    "op.unreachable": "Uzak depoya ula\u015F\u0131lam\u0131yor",
    "op.rejected": "G\xF6nderim reddedildi, \xF6nce \xE7ekin",
    "op.checkoutDone": "{name} dal\u0131na ge\xE7ildi",
    "op.mergeDone": "{name} birle\u015Ftirildi",
    "op.rebaseDone": "{name} \xFCzerine rebase yap\u0131ld\u0131",
    "op.pullDone": "\xC7ekildi",
    "op.pushDone": "G\xF6nderildi",
    "op.deleteDone": "{name} dal\u0131 silindi",
    "worktree.refresh": "Yenile",
    "worktree.add": "Worktree ekle",
    "worktree.prune": "Temizle",
    "worktree.empty": "Worktree yok",
    "worktree.main": "ana",
    "worktree.remove": "Kald\u0131r",
    "worktree.removeConfirm": "{path} worktree'si kald\u0131r\u0131ls\u0131n m\u0131?",
    "worktree.forceConfirm": "Commit edilmemi\u015F de\u011Fi\u015Fiklikler var. Zorla kald\u0131r\u0131ls\u0131n m\u0131?",
    "worktree.loadFailed": "Worktree'ler y\xFCklenemedi",
    "worktree.addPathPrompt": "Yeni worktree i\xE7in hedef yol:",
    "worktree.addBranchPrompt": "Yeni dal ad\u0131 ({base} temel al\u0131narak):",
    "worktree.addFailed": "Worktree eklenemedi",
    "batch.revertDone": "{n} commit geri al\u0131nd\u0131",
    "op.newBranchDone": "{name} dal\u0131 olu\u015Fturuldu",
    "op.newBranchFailed": "Dal olu\u015Fturulamad\u0131",
    "worktree.refreshed": "Worktree listesi yenilendi",
    "worktree.pruneDone": "{n} eski worktree temizlendi",
    "worktree.pruneNothing": "Temizlenecek eski worktree yok",
    "worktree.pruneFailed": "Temizleme ba\u015Far\u0131s\u0131z",
    "worktree.removed": "Worktree kald\u0131r\u0131ld\u0131",
    "worktree.added": "Worktree olu\u015Fturuldu: {path}",
    "op.branchDirtyWorkingTree": "\xF6nce de\u011Fi\u015Fiklikleri commit'leyin veya stash'leyin",
    "op.branchExists": "dal zaten var",
    "op.branchInvalidName": "ge\xE7ersiz dal ad\u0131",
    "op.branchCreateGeneric": "ayr\u0131nt\u0131lar konsolda",
    "console.commandCount": "git komutu",
    "console.clear": "Temizle",
    "console.noCommands": "Hen\xFCz git komutu yok",
    "console.selectCommand": "Bir komut se\xE7in",
    "console.noOutput": "(\xE7\u0131kt\u0131 yok)",
    "console.loadFailed": "Komut g\xFCnl\xFC\u011F\xFC y\xFCklenemedi",
    "op.resetFailed": "S\u0131f\u0131rlama ba\u015Far\u0131s\u0131z",
    "branch.favoriteSaveFailed": "S\u0131k kullan\u0131lanlar kaydedilemedi",
    "dialog.renameFailed": "Dal ad\u0131 de\u011Fi\u015Ftirilemedi",
    "dialog.createBranchFailed": "Dal olu\u015Fturulamad\u0131",
    "branch.loadFailed": "Dallar y\xFCklenemedi",
    "commit.loadDetailFailed": "Commit ayr\u0131nt\u0131lar\u0131 y\xFCklenemedi",
    "commit.loadListFailed": "Commit listesi y\xFCklenemedi",
    "worktree.removeFailed": "Worktree kald\u0131r\u0131lamad\u0131"
  };
  var dicts = {
    en,
    "zh-CN": zhCN,
    "zh-TW": zhTW,
    de,
    fr,
    uk,
    es,
    "pt-BR": ptBR,
    ko,
    pl,
    ja,
    tr
  };
  var SUPPORTED = new Set(Object.keys(dicts).map((k) => k.toLowerCase()));
  var current = "zh-CN";
  function resolveLocale(raw) {
    const lower = raw.toLowerCase();
    if (SUPPORTED.has(lower)) {
      return Object.keys(dicts).find((k) => k.toLowerCase() === lower);
    }
    const base = lower.split(/[-_]/)[0];
    if (base === "zh") {
      if (lower.includes("tw") || lower.includes("hk") || lower.includes("hant")) return "zh-TW";
      return "zh-CN";
    }
    if (SUPPORTED.has(base)) {
      return Object.keys(dicts).find((k) => k.toLowerCase() === base);
    }
    const prefixed = Object.keys(dicts).find((k) => k.toLowerCase().startsWith(`${base}-`));
    return prefixed ?? "en";
  }
  function setLocale(locale) {
    current = resolveLocale(locale);
  }
  function getLang() {
    return current;
  }
  function t(key, params) {
    let text = dicts[current][key] ?? zhCN[key] ?? key;
    if (params) {
      for (const [name, value] of Object.entries(params)) {
        text = text.replaceAll(`{${name}}`, String(value));
      }
    }
    return text;
  }

  // panel/service.ts
  function createServiceClient(host2) {
    async function serviceCall(path, body) {
      const result = await host2.serviceRequest({
        method: "POST",
        path: `/${path}`,
        body: JSON.stringify(body)
      });
      if (result.status !== 200) {
        throw new Error(result.body);
      }
      try {
        return JSON.parse(result.body);
      } catch {
        throw new Error(`\u89E3\u6790\u54CD\u5E94\u5931\u8D25: ${result.body}`);
      }
    }
    async function safeServiceCall(path, body) {
      try {
        const data = await serviceCall(path, body);
        return { success: true, data };
      } catch (e) {
        const error = e instanceof Error ? e.message : String(e);
        console.error(`[git-manager] ${path} \u8C03\u7528\u5931\u8D25:`, error);
        return { success: false, error };
      }
    }
    async function getMyBranches(directory2) {
      return serviceCall("git-my-branches", { directory: directory2 });
    }
    async function getBranches(directory2) {
      return serviceCall(
        "git-branches",
        { directory: directory2 }
      );
    }
    async function checkoutBranch(directory2, branch) {
      await serviceCall("git-stash", { directory: directory2 });
      await serviceCall("git-checkout", { directory: directory2, branch });
    }
    async function mergeBranch(directory2, branch) {
      return serviceCall("git-merge", { directory: directory2, branch });
    }
    async function deleteBranch(directory2, branch, force) {
      return serviceCall("git-delete-branch", { directory: directory2, branch, force });
    }
    async function restoreBranch(directory2, branch, tip, upstream) {
      return serviceCall("git-restore-branch", {
        directory: directory2,
        branch,
        tip,
        // undefined/null 不携带该键，与"省略 upstream"语义一致
        ...upstream ? { upstream } : {}
      });
    }
    async function deleteRemoteBranch(directory2, remote, branch) {
      return serviceCall("git-delete-remote-branch", { directory: directory2, remote, branch });
    }
    async function checkoutNewBranch(directory2, name, startPoint) {
      return serviceCall("git-checkout-new", { directory: directory2, name, startPoint });
    }
    async function createNewBranch(directory2, name, startPoint) {
      return serviceCall("git-create-branch", { directory: directory2, name, startPoint });
    }
    async function debugLog(event, data = {}) {
      try {
        await serviceCall("git-debug-log", { event, data });
      } catch {
      }
    }
    async function renameBranch(directory2, oldName, newName) {
      return serviceCall("git-rename-branch", { directory: directory2, oldName, newName });
    }
    async function rebaseBranch(directory2, branch) {
      return serviceCall("git-rebase", { directory: directory2, branch });
    }
    async function rebaseAbort(directory2) {
      return serviceCall("git-rebase-abort", { directory: directory2 });
    }
    async function rebaseContinue(directory2) {
      return serviceCall("git-rebase-continue", { directory: directory2 });
    }
    async function cherryPick(directory2, hash) {
      return serviceCall("git-cherry-pick", { directory: directory2, hash });
    }
    async function stash(directory2) {
      return serviceCall("git-stash-now", { directory: directory2 });
    }
    async function fetch2(directory2) {
      return serviceCall("git-fetch", { directory: directory2 });
    }
    async function pull(directory2) {
      return serviceCall("git-pull", { directory: directory2 });
    }
    async function push(directory2) {
      return serviceCall("git-push", { directory: directory2 });
    }
    async function forcePush(directory2) {
      return serviceCall("git-force-push", { directory: directory2 });
    }
    async function getLog(directory2, branch, paths) {
      return serviceCall(
        "git-log",
        { directory: directory2, branch, path: paths }
      );
    }
    async function listFiles(directory2) {
      return serviceCall(
        "git-files",
        { directory: directory2 }
      );
    }
    async function getCommitDetail(directory2, hash) {
      return serviceCall("git-commit-detail", { directory: directory2, hash });
    }
    async function getCommitDiffs(directory2, hash) {
      return serviceCall("git-commit-diffs", { directory: directory2, hash });
    }
    async function diffVsLocal(directory2, hash) {
      return serviceCall("git-diff-vs-local", { directory: directory2, hash });
    }
    async function getBranchDiff(directory2, from, to) {
      return serviceCall("git-branch-diff", { directory: directory2, from, to });
    }
    async function getCommitEditInfo(directory2, hash) {
      return serviceCall("git-commit-edit-info", { directory: directory2, hash });
    }
    async function rewordCommit(directory2, hash, message) {
      return serviceCall("git-reword-commit", { directory: directory2, hash, message });
    }
    async function dropCommit(directory2, hash) {
      return serviceCall("git-drop-commit", { directory: directory2, hash });
    }
    async function pushUpTo(directory2, hash, branch) {
      return serviceCall("git-push-up-to", { directory: directory2, hash, branch });
    }
    async function listWorktrees(directory2) {
      return serviceCall("git-worktree-list", { directory: directory2 });
    }
    async function addWorktree(directory2, path, branch, createBranch, startPoint) {
      return serviceCall("git-worktree-add", { directory: directory2, path, branch, createBranch, startPoint });
    }
    async function removeWorktree(directory2, path, force) {
      return serviceCall("git-worktree-remove", { directory: directory2, path, force });
    }
    async function pruneWorktrees(directory2) {
      return serviceCall("git-worktree-prune", { directory: directory2 });
    }
    async function getCommandLogs(directory2, since) {
      return serviceCall("git-command-logs", { directory: directory2, since });
    }
    async function clearCommandLogs(directory2) {
      return serviceCall("git-command-logs-clear", { directory: directory2 });
    }
    async function reset(directory2, hash, mode) {
      return serviceCall("git-reset", { directory: directory2, hash, mode });
    }
    async function revert(directory2, hash) {
      return serviceCall("git-revert", { directory: directory2, hash });
    }
    async function undoCommit(directory2, hash) {
      return serviceCall("git-undo-commit", { directory: directory2, hash });
    }
    async function isWorkingTreeClean(directory2) {
      return serviceCall("git-working-tree-clean", { directory: directory2 });
    }
    async function getStatus(directory2) {
      return serviceCall("git-status", { directory: directory2 });
    }
    async function getFavorites(directory2) {
      return serviceCall("git-favorites-get", { directory: directory2 });
    }
    async function saveFavorites(directory2, favorites) {
      return serviceCall("git-favorites-set", { directory: directory2, favorites });
    }
    async function isGitRepository(directory2) {
      return serviceCall("git-is-repo", { directory: directory2 });
    }
    return {
      serviceCall,
      safeServiceCall,
      getBranches,
      getMyBranches,
      checkoutBranch,
      mergeBranch,
      deleteBranch,
      restoreBranch,
      deleteRemoteBranch,
      checkoutNewBranch,
      createNewBranch,
      debugLog,
      renameBranch,
      rebaseBranch,
      rebaseAbort,
      rebaseContinue,
      cherryPick,
      stash,
      fetch: fetch2,
      pull,
      push,
      forcePush,
      getLog,
      listFiles,
      getCommitDetail,
      getCommitDiffs,
      diffVsLocal,
      getBranchDiff,
      reset,
      listWorktrees,
      addWorktree,
      removeWorktree,
      pruneWorktrees,
      getCommandLogs,
      clearCommandLogs,
      revert,
      undoCommit,
      getCommitEditInfo,
      rewordCommit,
      dropCommit,
      pushUpTo,
      getStatus,
      isWorkingTreeClean,
      getFavorites,
      saveFavorites,
      isGitRepository
    };
  }

  // panel/components/errors.ts
  function classifyGitError(message) {
    const text = message.toLowerCase();
    if (text.includes("conflict") || text.includes("merge conflict")) return "op.conflict";
    if (text.includes("authentication failed") || text.includes("could not read username") || text.includes("permission denied")) return "op.authFailed";
    if (text.includes("could not resolve host") || text.includes("connection refused") || text.includes("connection timed out")) return "op.unreachable";
    if (text.includes("rejected") || text.includes("non-fast-forward")) return "op.rejected";
    return null;
  }
  function classifyCreateBranchError(message) {
    const text = message.toLowerCase();
    if (text.includes("would be overwritten") || text.includes("please commit your changes")) {
      return "op.branchDirtyWorkingTree";
    }
    if (text.includes("already exists")) return "op.branchExists";
    if (text.includes("not a valid branch name") || text.includes("invalid branch name")) {
      return "op.branchInvalidName";
    }
    return "op.branchCreateGeneric";
  }
  function errorText2(error) {
    return error instanceof Error ? error.message : String(error);
  }
  function showOperationError(error, fallbackKey, logPrefix, event, hostClient = host) {
    const message = errorText2(error);
    console.error(JSON.stringify({ prefix: logPrefix, event, error: message }));
    const reasonKey = classifyGitError(message);
    const text = reasonKey ? `${t(reasonKey)}: ${message}` : `${t(fallbackKey)}: ${message}`;
    void hostClient.toast({ kind: "error", message: text, copy: true, dismiss: true })?.catch((toastErr) => {
      console.error(JSON.stringify({ prefix: logPrefix, event: `${event}_toast_error`, error: String(toastErr) }));
    });
  }

  // panel/components/dialogs.ts
  function showRenameDialog(branch, service2, directory2) {
    const overlay = html`
    <div class="gm-dialog-backdrop">
      <div class="gm-dialog">
        <div class="gm-dialog__title">${t("dialog.renameBranch")}: ${branch.name}</div>
        <input id="rename-input" type="text" value="${branch.name}" class="gm-input" />
        <div class="gm-dialog__actions">
          <button id="rename-cancel" class="gm-btn">${t("dialog.cancel")}</button>
          <button id="rename-ok" class="gm-btn gm-btn--primary">${t("dialog.ok")}</button>
        </div>
      </div>
    </div>
  `;
    document.body.appendChild(overlay);
    const input = overlay.querySelector("#rename-input");
    input.focus();
    input.select();
    const close = () => overlay.remove();
    overlay.querySelector("#rename-cancel")?.addEventListener("click", close);
    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) close();
    });
    overlay.querySelector("#rename-ok")?.addEventListener("click", async () => {
      const newName = input.value.trim();
      if (!newName || newName === branch.name) {
        close();
        return;
      }
      try {
        await service2.renameBranch(directory2, branch.name, newName);
        const branches = await service2.getBranches(directory2);
        setState((s) => {
          s.branches = branches;
        });
      } catch (e) {
        showOperationError(e, "dialog.renameFailed", "[dialog]", "rename_branch_error");
        return;
      }
      close();
    });
  }
  function showCreateBranchDialog(options) {
    const { service: service2, directory: directory2, startPoint, startPointLabel, titleKey, onCreated, entry } = options;
    const startText = startPointLabel ?? `${t("dialog.startPoint")}\uFF1A${startPoint ? startPoint.slice(0, 8) : t("dialog.currentHead")}`;
    const overlay = html`
    <div class="gm-dialog-backdrop">
      <div class="gm-dialog">
        <div class="gm-dialog__title">${t(titleKey ?? "dialog.createBranchTitle")}</div>
        <div class="gm-dialog__hint">${startText}</div>
        <div class="gm-dialog__field">
          <input id="new-branch-input" type="text" placeholder="${t("dialog.inputBranchName")}" class="gm-input" />
        </div>
        <label class="gm-check">
          <input id="new-branch-checkout" type="checkbox" checked />
          ${t("dialog.checkoutAfterCreate")}
        </label>
        <div class="gm-dialog__actions">
          <button id="create-cancel" class="gm-btn">${t("dialog.cancel")}</button>
          <button id="create-ok" class="gm-btn gm-btn--primary">${t("dialog.create")}</button>
        </div>
      </div>
    </div>
  `;
    document.body.appendChild(overlay);
    const input = overlay.querySelector("#new-branch-input");
    input.focus();
    const close = () => overlay.remove();
    overlay.querySelector("#create-cancel")?.addEventListener("click", close);
    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) close();
    });
    const doCreate = async () => {
      const name = input.value.trim();
      if (!name) return;
      const checkout = overlay.querySelector("#new-branch-checkout")?.checked ?? true;
      void service2.debugLog?.("create-branch-submit", { name, startPoint: startPoint ?? null, checkout, entry });
      try {
        if (checkout) {
          await service2.checkoutNewBranch(directory2, name, startPoint);
        } else {
          await service2.createNewBranch(directory2, name, startPoint);
        }
        const branches = await service2.getBranches(directory2);
        setState((s) => {
          s.branches = branches;
        });
        await onCreated?.();
      } catch (e) {
        const reason = classifyCreateBranchError(errorText2(e));
        showOperationError(e, reason, "[dialog]", "create_branch_error");
        return;
      }
      close();
    };
    overlay.querySelector("#create-ok")?.addEventListener("click", doCreate);
    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") doCreate();
    });
  }
  function showGotoDialog(onSubmit) {
    const overlay = html`
    <div class="gm-dialog-backdrop">
      <div class="gm-dialog">
        <div class="gm-dialog__title">${t("goto.title")}</div>
        <div class="gm-dialog__field">
          <input id="goto-input" type="text" placeholder="${t("goto.placeholder")}" class="gm-input" />
        </div>
        <div id="goto-error" class="gm-dialog__error" hidden></div>
        <div class="gm-dialog__actions">
          <button id="goto-cancel" class="gm-btn">${t("dialog.cancel")}</button>
          <button id="goto-ok" class="gm-btn gm-btn--primary">${t("goto.ok")}</button>
        </div>
      </div>
    </div>
  `;
    document.body.appendChild(overlay);
    const input = overlay.querySelector("#goto-input");
    const errorEl = overlay.querySelector("#goto-error");
    input.focus();
    const close = () => overlay.remove();
    const clearError = () => {
      errorEl.textContent = "";
      errorEl.hidden = true;
    };
    const submit = () => {
      const query = input.value.trim();
      if (!query) return;
      if (onSubmit(query)) {
        close();
        return;
      }
      errorEl.textContent = t("goto.notFound");
      errorEl.hidden = false;
    };
    overlay.querySelector("#goto-cancel")?.addEventListener("click", close);
    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) close();
    });
    input.addEventListener("input", clearError);
    overlay.querySelector("#goto-ok")?.addEventListener("click", submit);
    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") submit();
    });
  }
  function showDateRangeDialog(onApply) {
    const overlay = html`
    <div class="gm-dialog-backdrop">
      <div class="gm-dialog">
        <div class="gm-dialog__title">${t("filter.date")}</div>
        <div class="gm-dialog__field">
          <div class="gm-dialog__label">${t("filter.dateFrom")}</div>
          <input id="daterange-from" type="date" class="gm-input" />
        </div>
        <div class="gm-dialog__field">
          <div class="gm-dialog__label">${t("filter.dateTo")}</div>
          <input id="daterange-to" type="date" class="gm-input" />
        </div>
        <div class="gm-dialog__actions">
          <button id="daterange-ok" class="gm-btn gm-btn--primary">${t("filter.ok")}</button>
          <button id="daterange-clear" class="gm-btn">${t("filter.clear")}</button>
          <button id="daterange-cancel" class="gm-btn">${t("filter.cancel")}</button>
        </div>
      </div>
    </div>
  `;
    document.body.appendChild(overlay);
    let closed = false;
    const close = () => {
      if (closed) return;
      closed = true;
      document.removeEventListener("keydown", onKeydown);
      overlay.remove();
    };
    const onKeydown = (e) => {
      if (e.key === "Escape") close();
    };
    document.addEventListener("keydown", onKeydown);
    overlay.querySelector("#daterange-cancel")?.addEventListener("click", close);
    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) close();
    });
    overlay.querySelector("#daterange-ok")?.addEventListener("click", () => {
      const fromInput = overlay.querySelector("#daterange-from");
      const toInput = overlay.querySelector("#daterange-to");
      let from = fromInput.value;
      let to = toInput.value;
      if (from && to && from > to) {
        console.debug(JSON.stringify({ prefix: "[dialog]", event: "date_range_swap", from, to }));
        [from, to] = [to, from];
      }
      onApply({ from, to });
      close();
    });
    overlay.querySelector("#daterange-clear")?.addEventListener("click", () => {
      onApply({ from: "", to: "" });
      close();
    });
    return close;
  }
  var MAX_SELECTABLE_PATHS = 100;
  function parsePathLines(raw) {
    const seen = /* @__PURE__ */ new Set();
    const result = [];
    for (const line of raw.split("\n")) {
      const path = line.trim();
      if (!path || seen.has(path)) continue;
      seen.add(path);
      result.push(path);
    }
    return result;
  }
  function showPathFilterDialog(selected, onApply) {
    const overlay = html`
    <div class="gm-dialog-backdrop">
      <div class="gm-dialog gm-dialog--wide">
        <div class="gm-dialog__title">${t("filter.path")}</div>
        <div class="gm-dialog__label">${t("filter.editPaths")}</div>
        <textarea id="pathfilter-input" placeholder="${t("dialog.pathPlaceholder")}" class="gm-textarea">${selected.join("\n")}</textarea>
        <div id="pathfilter-hint" class="gm-dialog__error" hidden></div>
        <div class="gm-dialog__actions">
          <button id="pathfilter-ok" class="gm-btn gm-btn--primary">${t("filter.ok")}</button>
          <button id="pathfilter-clear" class="gm-btn">${t("filter.clear")}</button>
          <button id="pathfilter-cancel" class="gm-btn">${t("filter.cancel")}</button>
        </div>
      </div>
    </div>
  `;
    document.body.appendChild(overlay);
    let closed = false;
    const close = () => {
      if (closed) return;
      closed = true;
      document.removeEventListener("keydown", onKeydown);
      overlay.remove();
    };
    const onKeydown = (e) => {
      if (e.key === "Escape") close();
    };
    document.addEventListener("keydown", onKeydown);
    const input = overlay.querySelector("#pathfilter-input");
    const hintEl = overlay.querySelector("#pathfilter-hint");
    const showHint = (message) => {
      hintEl.textContent = message;
      hintEl.hidden = false;
    };
    const hideHint = () => {
      hintEl.textContent = "";
      hintEl.hidden = true;
    };
    input.addEventListener("input", hideHint);
    overlay.querySelector("#pathfilter-cancel")?.addEventListener("click", close);
    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) close();
    });
    overlay.querySelector("#pathfilter-ok")?.addEventListener("click", () => {
      const paths = parsePathLines(input.value);
      if (paths.length > MAX_SELECTABLE_PATHS) {
        showHint(t("filter.maxPaths"));
        console.debug(JSON.stringify({ prefix: "[dialog]", event: "path_filter_overflow", count: paths.length }));
        return;
      }
      console.debug(JSON.stringify({ prefix: "[dialog]", event: "path_filter_apply", paths }));
      onApply(paths);
      close();
    });
    overlay.querySelector("#pathfilter-clear")?.addEventListener("click", () => {
      console.debug(JSON.stringify({ prefix: "[dialog]", event: "path_filter_clear" }));
      onApply([]);
      close();
    });
  }
  function buildPathTree(files) {
    const roots = [];
    const byPath = /* @__PURE__ */ new Map();
    for (const file of files) {
      if (!file) continue;
      const segments = file.split("/");
      let parentNode = null;
      let currentPath = "";
      for (let i = 0; i < segments.length; i++) {
        const segment = segments[i];
        if (!segment) continue;
        currentPath = currentPath ? `${currentPath}/${segment}` : segment;
        const isLast = i === segments.length - 1;
        let node = byPath.get(currentPath);
        if (!node) {
          node = { path: currentPath, name: segment, isDir: !isLast, children: [] };
          byPath.set(currentPath, node);
          if (parentNode) parentNode.children.push(node);
          else roots.push(node);
        } else if (!isLast) {
          node.isDir = true;
        }
        parentNode = node;
      }
    }
    sortPathNodes(roots);
    return { roots, byPath };
  }
  function sortPathNodes(nodes) {
    nodes.sort((a, b) => {
      if (a.isDir !== b.isDir) return a.isDir ? -1 : 1;
      return a.name < b.name ? -1 : a.name > b.name ? 1 : 0;
    });
    for (const node of nodes) {
      if (node.children.length > 0) sortPathNodes(node.children);
    }
  }
  function ancestorPathsOf(path) {
    const segments = path.split("/");
    const result = [];
    let acc = "";
    for (let i = 0; i < segments.length - 1; i++) {
      if (!segments[i]) continue;
      acc = acc ? `${acc}/${segments[i]}` : segments[i];
      result.push(acc);
    }
    return result;
  }
  function computeCheckStates(roots, selected) {
    const states = /* @__PURE__ */ new Map();
    const walk = (node) => {
      const covered = selected.has(node.path) || ancestorPathsOf(node.path).some((p) => selected.has(p));
      let state;
      if (covered) {
        state = "on";
      } else if (node.children.length === 0) {
        state = "off";
      } else {
        const childStates = node.children.map(walk);
        const checkedCount = childStates.filter((s) => s !== "off").length;
        if (checkedCount === 0) state = "off";
        else if (checkedCount === childStates.length && childStates.every((s) => s === "on")) state = "on";
        else state = "half";
      }
      states.set(node.path, state);
      if (covered) {
        node.children.forEach(walk);
      }
      return state;
    };
    roots.forEach(walk);
    return states;
  }
  function fillSiblingsAlongPath(selected, byPath, ancestor, target) {
    const segments = target.slice(ancestor.length + 1).split("/").filter(Boolean);
    let parentPath = ancestor;
    for (const segment of segments) {
      const parentNode = byPath.get(parentPath);
      if (!parentNode) break;
      const nextHop = `${parentPath}/${segment}`;
      for (const child of parentNode.children) {
        if (child.path !== nextHop) selected.add(child.path);
      }
      parentPath = nextHop;
    }
  }
  function showPathTreeDialog(service2, directory2, selected, onApply) {
    const overlay = html`
    <div class="gm-dialog-backdrop">
      <div class="gm-dialog gm-dialog--wide">
        <div class="gm-dialog__title">${t("filter.selectPaths")}</div>
        <div id="pathtree-list" class="gm-tree"></div>
        <div id="pathtree-hint" class="gm-dialog__error" hidden></div>
        <div class="gm-dialog__actions">
          <button id="pathtree-ok" class="gm-btn gm-btn--primary" disabled>${t("filter.ok")}</button>
          <button id="pathtree-clear" class="gm-btn">${t("filter.clear")}</button>
          <button id="pathtree-cancel" class="gm-btn">${t("filter.cancel")}</button>
        </div>
      </div>
    </div>
  `;
    document.body.appendChild(overlay);
    const selectedSet = new Set(selected);
    const expanded = /* @__PURE__ */ new Set();
    let roots = [];
    let byPath = /* @__PURE__ */ new Map();
    let orphanPaths = [];
    let loaded = false;
    let failed = false;
    let closed = false;
    const listEl = overlay.querySelector("#pathtree-list");
    const hintEl = overlay.querySelector("#pathtree-hint");
    const okBtn = overlay.querySelector("#pathtree-ok");
    const close = () => {
      if (closed) return;
      closed = true;
      document.removeEventListener("keydown", onKeydown);
      overlay.remove();
    };
    const onKeydown = (e) => {
      if (e.key === "Escape") close();
    };
    document.addEventListener("keydown", onKeydown);
    const showHint = (message) => {
      hintEl.textContent = message;
      hintEl.hidden = false;
    };
    const hideHint = () => {
      hintEl.textContent = "";
      hintEl.hidden = true;
    };
    const handleCheckClick = (path) => {
      const snapshot = new Set(selectedSet);
      if (selectedSet.has(path)) {
        selectedSet.delete(path);
      } else {
        const coveredAncestor = ancestorPathsOf(path).reverse().find((p) => selectedSet.has(p));
        if (coveredAncestor) {
          selectedSet.delete(coveredAncestor);
          fillSiblingsAlongPath(selectedSet, byPath, coveredAncestor, path);
        } else {
          selectedSet.add(path);
        }
      }
      if (selectedSet.size > MAX_SELECTABLE_PATHS) {
        selectedSet.clear();
        for (const value of snapshot) selectedSet.add(value);
        showHint(t("filter.maxPaths"));
        console.debug(JSON.stringify({ prefix: "[dialog]", event: "path_tree_overflow", size: snapshot.size }));
      } else {
        hideHint();
      }
      render2();
    };
    const renderNode = (node, depth, states, container) => {
      const state = states.get(node.path) ?? "off";
      const expandable = node.isDir && node.children.length > 0;
      const isExpanded = expanded.has(node.path);
      const row = document.createElement("div");
      row.className = "pathtree-row gm-tree-row";
      row.dataset.path = node.path;
      row.dataset.depth = String(depth);
      row.style.paddingLeft = `${6 + depth * 14}px`;
      const toggle = document.createElement("span");
      toggle.className = "pathtree-toggle gm-tree-toggle";
      toggle.textContent = expandable ? isExpanded ? "\u25BE" : "\u25B8" : "";
      row.appendChild(toggle);
      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.checked = state === "on";
      checkbox.indeterminate = state === "half";
      row.appendChild(checkbox);
      const label = document.createElement("span");
      label.className = "gm-tree-label";
      const labelText = document.createElement("span");
      labelText.className = "gm-tree-label__text";
      labelText.textContent = node.name;
      label.appendChild(labelText);
      row.appendChild(label);
      row.addEventListener("click", (e) => {
        const target = e.target;
        if (target.classList.contains("pathtree-toggle")) {
          if (!expandable) return;
          if (expanded.has(node.path)) expanded.delete(node.path);
          else expanded.add(node.path);
          render2();
          return;
        }
        handleCheckClick(node.path);
      });
      container.appendChild(row);
      if (expandable && isExpanded) {
        for (const child of node.children) renderNode(child, depth + 1, states, container);
      }
    };
    const render2 = () => {
      if (closed) return;
      listEl.innerHTML = "";
      if (failed) {
        const error = document.createElement("div");
        error.id = "pathtree-error";
        error.className = "gm-dialog__error";
        error.textContent = t("filter.loadPathsFailed");
        listEl.appendChild(error);
        return;
      }
      if (!loaded) return;
      const nodes = [...roots];
      for (const path of orphanPaths) {
        nodes.push({ path, name: path, isDir: false, children: [] });
      }
      sortPathNodes(nodes);
      if (nodes.length === 0) {
        const empty = document.createElement("div");
        empty.id = "pathtree-empty";
        empty.className = "gm-dialog__hint";
        empty.textContent = t("filter.noPaths");
        listEl.appendChild(empty);
        okBtn.disabled = true;
        return;
      }
      okBtn.disabled = false;
      const states = computeCheckStates(nodes, selectedSet);
      for (const node of nodes) renderNode(node, 0, states, listEl);
    };
    overlay.querySelector("#pathtree-cancel")?.addEventListener("click", close);
    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) close();
    });
    okBtn.addEventListener("click", () => {
      const paths = [...selectedSet];
      console.debug(JSON.stringify({ prefix: "[dialog]", event: "path_tree_apply", count: paths.length }));
      onApply(paths);
      close();
    });
    overlay.querySelector("#pathtree-clear")?.addEventListener("click", () => {
      selectedSet.clear();
      console.debug(JSON.stringify({ prefix: "[dialog]", event: "path_tree_clear" }));
      onApply([]);
      close();
    });
    render2();
    service2.listFiles(directory2).then((files) => {
      if (closed) return;
      const tree = buildPathTree(files ?? []);
      roots = tree.roots;
      byPath = tree.byPath;
      orphanPaths = [...selected].filter((p) => !byPath.has(p));
      for (const node of roots) {
        if (node.isDir && node.children.length > 0) expanded.add(node.path);
      }
      loaded = true;
      render2();
    }).catch((e) => {
      if (closed) return;
      failed = true;
      console.error(JSON.stringify({ prefix: "[dialog]", event: "list_files_error", directory: directory2, error: String(e) }));
      render2();
    });
  }
  function parseDeleteBranchError(e) {
    const raw = e instanceof Error ? e.message : String(e);
    try {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === "object") {
        return {
          code: typeof parsed.code === "string" ? parsed.code : void 0,
          message: typeof parsed.message === "string" ? parsed.message : raw
        };
      }
    } catch {
    }
    return { message: raw };
  }
  function showDeleteBranchDialog(branchName, onConfirm) {
    const overlay = html`
    <div class="gm-dialog-backdrop">
      <div class="gm-dialog gm-dialog--wide">
        <div id="delete-branch-message" class="gm-dialog__message">${t("branch.forceDelete", { name: branchName })}</div>
        <div id="delete-branch-error" class="gm-dialog__error" hidden></div>
        <div class="gm-dialog__actions">
          <button id="delete-branch-cancel" class="gm-btn">${t("filter.cancel")}</button>
          <button id="delete-branch-ok" class="gm-btn gm-btn--primary">${t("branch.forceDeleteButton")}</button>
        </div>
      </div>
    </div>
  `;
    document.body.appendChild(overlay);
    let pending = false;
    let closed = false;
    const errorEl = overlay.querySelector("#delete-branch-error");
    const okBtn = overlay.querySelector("#delete-branch-ok");
    const close = () => {
      if (closed) return;
      closed = true;
      document.removeEventListener("keydown", onKeydown);
      overlay.remove();
    };
    const onKeydown = (e) => {
      if (e.key === "Escape") close();
    };
    document.addEventListener("keydown", onKeydown);
    const showError = (message) => {
      errorEl.textContent = message;
      errorEl.hidden = false;
    };
    const hideError = () => {
      errorEl.textContent = "";
      errorEl.hidden = true;
    };
    const submit = async () => {
      if (pending) return;
      pending = true;
      okBtn.disabled = true;
      hideError();
      console.debug(JSON.stringify({ prefix: "[dialog]", event: "branch_delete_confirm", branch: branchName, force: true }));
      try {
        await onConfirm(true);
        close();
      } catch (e) {
        const { code, message } = parseDeleteBranchError(e);
        if (code === "NOT_FOUND") {
          showError(t("branch.notFound", { name: branchName }));
        } else if (code === "GIT_ERROR") {
          showError(`${t("branch.deleteFailed")}: ${message}`);
        } else {
          showError(message);
        }
        console.debug(JSON.stringify({
          prefix: "[dialog]",
          event: "branch_delete_failed",
          branch: branchName,
          code: code ?? null,
          message
        }));
      } finally {
        pending = false;
        if (!closed) okBtn.disabled = false;
      }
    };
    overlay.querySelector("#delete-branch-cancel")?.addEventListener("click", close);
    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) close();
    });
    okBtn.addEventListener("click", () => {
      void submit();
    });
  }
  function showRewordCommitDialog(currentMessage, onConfirm) {
    const overlay = html`
    <div class="gm-dialog-backdrop">
      <div class="gm-dialog gm-dialog--xwide">
        <div class="gm-dialog__title">${t("commit.rewordTitle")}</div>
        <textarea id="reword-input" class="gm-textarea"></textarea>
        <div id="reword-error" class="gm-dialog__error" hidden></div>
        <div class="gm-dialog__actions">
          <button id="reword-cancel" class="gm-btn">${t("dialog.cancel")}</button>
          <button id="reword-ok" class="gm-btn gm-btn--primary">${t("dialog.ok")}</button>
        </div>
      </div>
    </div>
  `;
    document.body.appendChild(overlay);
    let closed = false;
    const input = overlay.querySelector("#reword-input");
    const errorEl = overlay.querySelector("#reword-error");
    const okBtn = overlay.querySelector("#reword-ok");
    input.value = currentMessage;
    input.focus();
    input.setSelectionRange(input.value.length, input.value.length);
    const close = () => {
      if (closed) return;
      closed = true;
      document.removeEventListener("keydown", onKeydown);
      overlay.remove();
    };
    const onKeydown = (e) => {
      if (e.key === "Escape") close();
    };
    document.addEventListener("keydown", onKeydown);
    overlay.querySelector("#reword-cancel")?.addEventListener("click", close);
    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) close();
    });
    let pending = false;
    okBtn.addEventListener("click", () => {
      if (pending) return;
      const next = input.value.trim();
      if (!next) {
        errorEl.textContent = t("commit.rewordEmpty");
        errorEl.hidden = false;
        return;
      }
      pending = true;
      okBtn.disabled = true;
      errorEl.hidden = true;
      void onConfirm(next).then(() => {
        close();
      }).catch((e) => {
        errorEl.textContent = e instanceof Error ? e.message : String(e);
        errorEl.hidden = false;
      }).finally(() => {
        pending = false;
        if (!closed) okBtn.disabled = false;
      });
    });
  }
  function showConfirmDialog(message, onConfirm, danger = false) {
    const overlay = html`
    <div class="gm-dialog-backdrop">
      <div class="gm-dialog gm-dialog--wide">
        <div id="confirm-message" class="gm-dialog__message"></div>
        <div class="gm-dialog__actions">
          <button id="confirm-cancel" class="gm-btn">${t("dialog.cancel")}</button>
          <button id="confirm-ok" class="${danger ? "gm-btn gm-btn--destructive-filled" : "gm-btn gm-btn--primary"}">${t("dialog.ok")}</button>
        </div>
      </div>
    </div>
  `;
    overlay.querySelector("#confirm-message").textContent = message;
    document.body.appendChild(overlay);
    const close = () => {
      overlay.remove();
    };
    overlay.querySelector("#confirm-cancel")?.addEventListener("click", close);
    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) close();
    });
    overlay.querySelector("#confirm-ok")?.addEventListener("click", () => {
      close();
      void onConfirm();
    });
  }
  function showPromptDialog(title, fields, onConfirm) {
    const overlay = html`
    <div class="gm-dialog-backdrop">
      <div class="gm-dialog gm-dialog--wide">
        <div id="prompt-title" class="gm-dialog__title"></div>
        <div id="prompt-fields"></div>
        <div class="gm-dialog__actions">
          <button id="prompt-cancel" class="gm-btn">${t("dialog.cancel")}</button>
          <button id="prompt-ok" class="gm-btn gm-btn--primary">${t("dialog.ok")}</button>
        </div>
      </div>
    </div>
  `;
    overlay.querySelector("#prompt-title").textContent = title;
    const fieldsEl = overlay.querySelector("#prompt-fields");
    const inputs = [];
    for (const [index, field2] of fields.entries()) {
      const wrapper = document.createElement("div");
      wrapper.className = "gm-dialog__field";
      const label = document.createElement("div");
      label.className = "gm-dialog__label";
      label.textContent = field2.label;
      wrapper.appendChild(label);
      const input = document.createElement("input");
      input.type = "text";
      input.className = "gm-input";
      input.dataset.promptIndex = String(index);
      input.value = field2.value ?? "";
      input.placeholder = field2.placeholder ?? "";
      wrapper.appendChild(input);
      fieldsEl.appendChild(wrapper);
      inputs.push(input);
    }
    document.body.appendChild(overlay);
    inputs[0]?.focus();
    const close = () => {
      overlay.remove();
    };
    const submit = () => {
      const values = inputs.map((i) => i.value.trim());
      close();
      void onConfirm(values);
    };
    overlay.querySelector("#prompt-cancel")?.addEventListener("click", close);
    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) close();
    });
    overlay.querySelector("#prompt-ok")?.addEventListener("click", submit);
    overlay.addEventListener("keydown", (e) => {
      if (e.key === "Enter") submit();
    });
  }

  // panel/components/notify.ts
  var NOTIFY_TTL_MS = 1e4;
  var currentClose = null;
  function showBranchDeletedNotify(options) {
    currentClose?.();
    const card = document.createElement("div");
    card.id = "git-branch-deleted-notify";
    card.className = "gm-notify";
    const message = document.createElement("div");
    message.textContent = t("branch.notifyDeleted", { name: options.branchName });
    card.appendChild(message);
    let remaining = NOTIFY_TTL_MS;
    let startedAt = 0;
    let timer = null;
    let closed = false;
    const close = () => {
      if (closed) return;
      closed = true;
      if (timer !== null) {
        clearTimeout(timer);
        timer = null;
      }
      if (currentClose === close) currentClose = null;
      card.remove();
      console.debug(JSON.stringify({ prefix: "[notify]", event: "branch_notify_close", branch: options.branchName }));
    };
    currentClose = close;
    const startTimer = () => {
      if (closed || timer !== null) return;
      startedAt = Date.now();
      timer = setTimeout(() => {
        timer = null;
        console.debug(JSON.stringify({ prefix: "[notify]", event: "branch_notify_expire", branch: options.branchName }));
        close();
      }, remaining);
    };
    const pauseTimer = () => {
      if (timer === null) return;
      clearTimeout(timer);
      timer = null;
      remaining = Math.max(0, remaining - (Date.now() - startedAt));
    };
    const actions = [];
    if (options.onRestore) {
      actions.push({ label: t("branch.restore"), kind: "restore", run: options.onRestore });
    }
    if (options.onDeleteTracking) {
      actions.push({ label: t("branch.deleteTracking"), kind: "deleteTracking", run: options.onDeleteTracking });
    }
    if (actions.length > 0) {
      const row = document.createElement("div");
      row.className = "gm-notify__actions";
      for (const action of actions) {
        const link = document.createElement("a");
        link.textContent = action.label;
        link.className = "gm-notify__action";
        let busy = false;
        link.addEventListener("click", () => {
          if (busy || closed) return;
          busy = true;
          link.dataset.busy = "true";
          void (async () => {
            try {
              await action.run();
              console.debug(JSON.stringify({
                prefix: "[notify]",
                event: "branch_notify_action_success",
                action: action.kind,
                branch: options.branchName
              }));
              close();
            } catch (err) {
              busy = false;
              link.dataset.busy = "false";
              const raw = err instanceof Error ? err.message : String(err);
              const prefixText = action.kind === "restore" ? t("branch.restoreFailed") : t("branch.deleteTrackingFailed");
              console.error(JSON.stringify({
                prefix: "[notify]",
                event: "branch_notify_action_error",
                action: action.kind,
                branch: options.branchName,
                error: raw
              }));
              void host.toast({ kind: "error", message: `${prefixText}: ${raw}` }).catch((toastErr) => {
                console.error(JSON.stringify({ prefix: "[notify]", event: "branch_notify_toast_error", error: String(toastErr) }));
              });
            }
          })();
        });
        row.appendChild(link);
      }
      card.appendChild(row);
    }
    card.addEventListener("mouseenter", pauseTimer);
    card.addEventListener("mouseleave", startTimer);
    document.body.appendChild(card);
    startTimer();
    console.debug(JSON.stringify({
      prefix: "[notify]",
      event: "branch_notify_show",
      branch: options.branchName,
      actions: actions.map((a) => a.kind)
    }));
  }

  // panel/components/context-menu.ts
  function hideContextMenu() {
    const existing = document.getElementById("git-context-menu");
    if (existing) existing.remove();
  }
  async function onBranchDeleted(res, branch, service2, directory2) {
    const wasSelected = getState().selectedBranch?.name === branch.name;
    showBranchDeletedNotify({
      branchName: branch.name,
      // 仅本地分支提供"还原"：按删除前捕获的 tip（与 upstream）重建分支
      onRestore: res.kind === "local" ? async () => {
        await service2.restoreBranch(directory2, branch.name, res.tip, res.upstream);
        try {
          const branches = await service2.getBranches(directory2);
          setState((s) => {
            s.branches = branches;
            if (wasSelected) s.selectedBranch = branches.find((b) => b.name === branch.name) ?? null;
          });
        } catch (refreshErr) {
          console.error(JSON.stringify({
            prefix: "[context-menu]",
            event: "branch_restore_refresh_error",
            branch: branch.name,
            error: String(refreshErr)
          }));
        }
        void host.toast({ kind: "success", message: t("branch.restoreSuccess", { name: branch.name }) }).catch((toastErr) => {
          console.error(JSON.stringify({ prefix: "[context-menu]", event: "branch_restore_toast_error", error: String(toastErr) }));
        });
      } : void 0,
      // 本地分支且服务端允许删跟踪分支、有 upstream 时提供"删除跟踪的分支"
      onDeleteTracking: res.kind === "local" && res.canDeleteTracking && res.upstream ? async () => {
        await service2.deleteRemoteBranch(directory2, res.upstream.remote, res.upstream.branch);
        try {
          const branches = await service2.getBranches(directory2);
          setState((s) => {
            s.branches = branches;
          });
        } catch (refreshErr) {
          console.error(JSON.stringify({
            prefix: "[context-menu]",
            event: "branch_delete_tracking_refresh_error",
            branch: branch.name,
            error: String(refreshErr)
          }));
        }
      } : void 0
    });
    try {
      const branches = await service2.getBranches(directory2);
      setState((s) => {
        s.branches = branches;
        if (s.selectedBranch?.name === branch.name) s.selectedBranch = null;
      });
    } catch (refreshErr) {
      console.error(JSON.stringify({
        prefix: "[context-menu]",
        event: "branch_delete_refresh_error",
        branch: branch.name,
        error: String(refreshErr)
      }));
    }
    console.debug(JSON.stringify({ prefix: "[context-menu]", event: "branch_delete_success", branch: branch.name, kind: res.kind }));
  }
  async function performBranchDelete(service2, directory2, branch) {
    console.debug(JSON.stringify({ prefix: "[context-menu]", event: "branch_delete_start", branch: branch.name }));
    try {
      const res = await service2.deleteBranch(directory2, branch.name);
      await onBranchDeleted(res, branch, service2, directory2);
      return true;
    } catch (e) {
      const { code, message } = parseDeleteBranchError(e);
      console.debug(JSON.stringify({
        prefix: "[context-menu]",
        event: "branch_delete_failed",
        branch: branch.name,
        code: code ?? null
      }));
      if (code === "NOT_MERGED") {
        showDeleteBranchDialog(branch.name, async (force) => {
          const forceRes = await service2.deleteBranch(directory2, branch.name, force);
          await onBranchDeleted(forceRes, branch, service2, directory2);
        });
      } else if (code === "NOT_FOUND") {
        void host.toast({ kind: "error", message: t("branch.notFound", { name: branch.name }) }).catch((toastErr) => {
          console.error(JSON.stringify({ prefix: "[context-menu]", event: "branch_delete_toast_error", error: String(toastErr) }));
        });
      } else {
        void host.toast({ kind: "error", message: `${t("branch.deleteFailed")}: ${message}` }).catch((toastErr) => {
          console.error(JSON.stringify({ prefix: "[context-menu]", event: "branch_delete_toast_error", error: String(toastErr) }));
        });
      }
      return false;
    }
  }
  async function runGitAction(options) {
    const { service: service2, directory: directory2, action, run, successMessage } = options;
    console.debug(JSON.stringify({ prefix: "[context-menu]", event: `${action}_start` }));
    try {
      await run();
      if (options.refreshBranches) {
        try {
          const branches = await service2.getBranches(directory2);
          setState((s) => {
            s.branches = branches;
          });
        } catch (e) {
          console.error(JSON.stringify({ prefix: "[context-menu]", event: `${action}_refresh_branches_error`, error: String(e) }));
        }
      }
      if (options.refreshCommits) {
        await reloadCommits(service2, directory2);
      }
      console.debug(JSON.stringify({ prefix: "[context-menu]", event: `${action}_done` }));
      void host.toast({ kind: "success", message: successMessage }).catch(() => {
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.error(JSON.stringify({ prefix: "[context-menu]", event: `${action}_error`, error: message }));
      const reasonKey = classifyGitError(message);
      const text = reasonKey ? `${t(reasonKey)}: ${message}` : `${t("op.failed")}: ${message}`;
      void host.toast({ kind: "error", message: text, copy: true, dismiss: true }).catch(() => {
      });
    }
  }
  function showContextMenu(e, branch, service2, directory2) {
    hideContextMenu();
    const state = getState();
    const menu = document.createElement("div");
    menu.id = "git-context-menu";
    menu.className = "gm-popup gm-popup--wide";
    menu.style.left = `${e.clientX}px`;
    menu.style.top = `${e.clientY}px`;
    const deleteTargets = resolveDeleteTargets(
      getState().branches,
      branch,
      getState().selectedBranches
    );
    const items = [
      {
        label: t("branch.checkout"),
        action: () => runGitAction({
          service: service2,
          directory: directory2,
          action: "checkout",
          refreshBranches: true,
          refreshCommits: true,
          successMessage: t("op.checkoutDone", { name: branch.name }),
          run: async () => {
            await service2.checkoutBranch(directory2, branch.name);
          }
        })
      },
      {
        label: t("branch.rename"),
        action: () => showRenameDialog(branch, service2, directory2)
      },
      {
        label: t("branch.merge"),
        action: () => runGitAction({
          service: service2,
          directory: directory2,
          action: "merge",
          refreshBranches: true,
          refreshCommits: true,
          successMessage: t("op.mergeDone", { name: branch.name }),
          run: async () => {
            await service2.mergeBranch(directory2, branch.name);
          }
        })
      },
      {
        label: t("branch.rebase"),
        action: () => runGitAction({
          service: service2,
          directory: directory2,
          action: "rebase",
          refreshBranches: true,
          refreshCommits: true,
          successMessage: t("op.rebaseDone", { name: branch.name }),
          run: async () => {
            await service2.rebaseBranch(directory2, branch.name);
          }
        })
      },
      { type: "separator" },
      {
        label: t("branch.pull"),
        action: () => runGitAction({
          service: service2,
          directory: directory2,
          action: "pull",
          refreshBranches: true,
          refreshCommits: true,
          successMessage: t("op.pullDone"),
          run: async () => {
            await service2.pull(directory2);
          }
        })
      },
      {
        label: t("branch.push"),
        action: () => runGitAction({
          service: service2,
          directory: directory2,
          action: "push",
          refreshBranches: true,
          successMessage: t("op.pushDone"),
          run: async () => {
            await service2.push(directory2);
          }
        })
      },
      { type: "separator" },
      {
        label: state.favorites.has(branch.name) ? t("branch.unfavorite") : t("branch.favorite"),
        action: async () => {
          const previous = getState().favorites;
          const next = new Set(previous);
          if (next.has(branch.name)) {
            next.delete(branch.name);
          } else {
            next.add(branch.name);
          }
          setState((s) => {
            s.favorites = next;
          });
          try {
            await service2.saveFavorites(directory2, [...next]);
          } catch (e2) {
            setState((s) => {
              s.favorites = previous;
            });
            showOperationError(e2, "branch.favoriteSaveFailed", "[context-menu]", "save_favorites_error");
          }
        }
      },
      { type: "separator" },
      {
        label: t("branch.delete"),
        danger: true,
        // IDEA DeleteBranchAction：多选时批量删除全部选中分支，含当前分支时整体禁用
        disabled: deleteTargets.kind === "current",
        action: async () => {
          if (deleteTargets.kind !== "ok") return;
          await deleteBranches(service2, host, directory2, deleteTargets.targets);
          setState((s) => {
            s.selectedBranches = /* @__PURE__ */ new Set();
          });
        }
      }
    ];
    const findItemByLabel = (label) => items.find((i) => !("type" in i) && i.label === label);
    for (const item of items) {
      if ("type" in item && item.type === "separator") {
        const sep = document.createElement("div");
        sep.className = "gm-popup__sep";
        menu.appendChild(sep);
        continue;
      }
      const menuItem = item;
      const el2 = document.createElement("div");
      el2.className = menuItem.danger ? "gm-menu-item gm-menu-item--destructive" : "gm-menu-item";
      el2.dataset.disabled = menuItem.disabled ? "true" : "false";
      el2.textContent = menuItem.label;
      menu.appendChild(el2);
    }
    menu.addEventListener("click", async (e2) => {
      const target = e2.target.closest("div");
      if (!target || target.parentElement !== menu) return;
      const item = findItemByLabel(target.textContent);
      if (!item || target.dataset.disabled === "true") return;
      hideContextMenu();
      await item.action();
    });
    document.body.appendChild(menu);
    const closeHandler2 = (ev) => {
      if (!menu.contains(ev.target)) {
        hideContextMenu();
        document.removeEventListener("click", closeHandler2);
      }
    };
    setTimeout(() => document.addEventListener("click", closeHandler2), 0);
  }
  function showCommitContextMenu(e, commit, service2, directory2, batchHashes, dirtyWorkingTree = false) {
    hideContextMenu();
    const isBatch = !!batchHashes && batchHashes.length > 1;
    const items = isBatch ? buildBatchCommitItems(batchHashes, service2, directory2) : buildSingleCommitItems(commit, service2, directory2, dirtyWorkingTree);
    const findItemByLabel = (label) => items.find((i) => !("type" in i) && i.label === label);
    const menu = html`
    <div id="git-context-menu" class="gm-popup gm-popup--wide"></div>
  `;
    menu.style.left = `${e.clientX}px`;
    menu.style.top = `${e.clientY}px`;
    for (const item of items) {
      if ("type" in item && item.type === "separator") {
        const sep = document.createElement("div");
        sep.className = "gm-popup__sep";
        menu.appendChild(sep);
        continue;
      }
      const menuItem = item;
      const el2 = document.createElement("div");
      el2.className = menuItem.danger ? "gm-menu-item gm-menu-item--destructive" : "gm-menu-item";
      el2.dataset.disabled = menuItem.disabled ? "true" : "false";
      el2.textContent = menuItem.label;
      menu.appendChild(el2);
    }
    menu.addEventListener("click", async (ev) => {
      const target = ev.target.closest("div");
      if (!target || target.parentElement !== menu) return;
      const item = findItemByLabel(target.textContent);
      if (!item || target.dataset.disabled === "true") return;
      hideContextMenu();
      await item.action();
    });
    document.body.appendChild(menu);
    const closeHandler2 = (ev) => {
      if (!menu.contains(ev.target)) {
        hideContextMenu();
        document.removeEventListener("click", closeHandler2);
      }
    };
    setTimeout(() => document.addEventListener("click", closeHandler2), 0);
  }
  async function reloadCommits(service2, directory2) {
    const state = getState();
    const branch = state.logBranch || void 0;
    const paths = state.filterPaths.length ? [...state.filterPaths] : void 0;
    try {
      const commits = await service2.getLog(directory2, branch, paths);
      setState((s) => {
        s.allCommits = commits;
        s.filteredCommits = commits;
      });
      console.debug(JSON.stringify({ prefix: "[context-menu]", event: "commits_reloaded", count: commits.length }));
    } catch (e) {
      console.error(JSON.stringify({ prefix: "[context-menu]", event: "commits_reload_error", error: String(e) }));
    }
  }
  async function copyToClipboard(text, label) {
    try {
      await host.writeClipboard(text);
      console.debug(JSON.stringify({ prefix: "[context-menu]", event: "clipboard_copied", label, via: "host" }));
      void host.toast({ kind: "success", message: t("commit.copied") }).catch(() => {
      });
      return true;
    } catch (e) {
      console.debug(JSON.stringify({ prefix: "[context-menu]", event: "clipboard_host_failed", label, error: String(e) }));
    }
    try {
      await navigator.clipboard.writeText(text);
      console.debug(JSON.stringify({ prefix: "[context-menu]", event: "clipboard_copied", label, via: "navigator" }));
      void host.toast({ kind: "success", message: t("commit.copied") }).catch(() => {
      });
      return true;
    } catch (e) {
      console.debug(JSON.stringify({ prefix: "[context-menu]", event: "clipboard_navigator_failed", label, error: String(e) }));
    }
    try {
      const area = document.createElement("textarea");
      area.value = text;
      area.style.position = "fixed";
      area.style.opacity = "0";
      document.body.appendChild(area);
      area.select();
      const ok = document.execCommand("copy");
      area.remove();
      if (ok) {
        console.debug(JSON.stringify({ prefix: "[context-menu]", event: "clipboard_copied", label, via: "execCommand" }));
        void host.toast({ kind: "success", message: t("commit.copied") }).catch(() => {
        });
        return true;
      }
    } catch (e) {
      console.error(JSON.stringify({ prefix: "[context-menu]", event: "clipboard_exec_failed", label, error: String(e) }));
    }
    console.error(JSON.stringify({ prefix: "[context-menu]", event: "clipboard_failed", label }));
    void host.toast({ kind: "error", message: t("commit.copyFailed") }).catch(() => {
    });
    return false;
  }
  function isCurrentHead(commit) {
    const current3 = getState().branches.find((b) => b.isCurrent);
    if (!current3?.commit) return false;
    return commit.hash.startsWith(current3.commit);
  }
  function buildSingleCommitItems(commit, service2, directory2, dirtyWorkingTree = false) {
    return [
      {
        label: t("commit.copyRevision"),
        action: () => {
          void copyToClipboard(commit.hash, "revision");
        }
      },
      { type: "separator" },
      {
        label: t("commit.cherryPick"),
        action: async () => {
          console.debug(JSON.stringify({ prefix: "[context-menu]", event: "cherry_pick_start", hash: commit.hash }));
          try {
            await service2.cherryPick(directory2, commit.hash);
            await reloadCommits(service2, directory2);
            console.debug(JSON.stringify({ prefix: "[context-menu]", event: "cherry_pick_done", hash: commit.hash }));
            void host.toast({ kind: "success", message: t("commit.cherryPickDone", { hash: commit.shortHash }) }).catch(() => {
            });
          } catch (err) {
            const message = err instanceof Error ? err.message : String(err);
            console.error(JSON.stringify({
              prefix: "[context-menu]",
              event: "cherry_pick_error",
              hash: commit.hash,
              error: message
            }));
            const conflict = message.toLowerCase().includes("conflict") || message.toLowerCase().includes("cherry-pick is already in progress");
            void host.toast({
              kind: "error",
              message: conflict ? t("commit.cherryPickConflict") : `${t("commit.cherryPickFailed")}: ${message}`,
              copy: true,
              dismiss: true
            }).catch(() => {
            });
          }
        }
      },
      {
        label: t("commit.compareLocal"),
        action: async () => {
          try {
            const diffs = await service2.diffVsLocal(directory2, commit.hash);
            setState((s) => {
              s.diffs = diffs;
            });
            hideContextMenu();
          } catch (err) {
            showOperationError(err, "compare.loadFailed", "[context-menu]", "compare_local_error");
          }
        }
      },
      { type: "separator" },
      {
        label: t("commit.reset"),
        action: () => {
          showResetDialog(commit, service2, directory2);
        }
      },
      {
        label: t("commit.revert"),
        action: async () => {
          console.debug(JSON.stringify({ prefix: "[context-menu]", event: "revert_start", hash: commit.hash }));
          try {
            await service2.revert(directory2, commit.hash);
            await reloadCommits(service2, directory2);
            console.debug(JSON.stringify({ prefix: "[context-menu]", event: "revert_done", hash: commit.hash }));
            void host.toast({ kind: "success", message: t("commit.revertDone", { hash: commit.shortHash }) }).catch(() => {
            });
          } catch (err) {
            const message = err instanceof Error ? err.message : String(err);
            console.error(JSON.stringify({
              prefix: "[context-menu]",
              event: "revert_error",
              hash: commit.hash,
              error: message
            }));
            const conflict = message.toLowerCase().includes("conflict") || message.toLowerCase().includes("revert is already in progress");
            void host.toast({
              kind: "error",
              message: conflict ? t("commit.revertConflict") : `${t("commit.revertFailed")}: ${message}`,
              copy: true,
              dismiss: true
            }).catch(() => {
            });
          }
        }
      },
      { type: "separator" },
      {
        // 撤销提交：仅选中当前分支最新提交时可用（对齐 IDEA Uncommit 的置灰规则）
        // 非 HEAD 提交点了会失败，故直接禁用，避免用户误以为成功
        label: t("commit.uncommit"),
        disabled: !isCurrentHead(commit),
        action: async () => {
          try {
            await service2.undoCommit(directory2, commit.hash);
            await reloadCommits(service2, directory2);
            void host.toast({ kind: "success", message: t("commit.uncommitDone", { hash: commit.shortHash }) }).catch(() => {
            });
          } catch (err) {
            const message = err instanceof Error ? err.message : String(err);
            console.error(JSON.stringify({ prefix: "[context-menu]", event: "uncommit_error", hash: commit.hash, error: message }));
            void host.toast({ kind: "error", message: `${t("commit.uncommitFailed")}: ${message}`, copy: true, dismiss: true }).catch(() => {
            });
          }
        }
      },
      {
        label: t("commit.reword"),
        // 工作区不干净时置灰（菜单打开即判定，对齐 IDEA 禁用不可用项的做法）
        disabled: dirtyWorkingTree,
        action: async () => {
          showRewordCommitDialog(commit.message, async (message) => {
            await service2.rewordCommit(directory2, commit.hash, message);
            await reloadCommits(service2, directory2);
            void host.toast({ kind: "success", message: t("commit.rewordDone") }).catch(() => {
            });
          });
        }
      },
      {
        label: t("commit.dropCommit"),
        danger: true,
        disabled: dirtyWorkingTree,
        action: () => {
          showConfirmDialog(t("commit.dropConfirm", { hash: commit.shortHash }), async () => {
            try {
              await service2.dropCommit(directory2, commit.hash);
              await reloadCommits(service2, directory2);
              void host.toast({ kind: "success", message: t("commit.dropDone", { hash: commit.shortHash }) }).catch(() => {
              });
            } catch (err) {
              const message = err instanceof Error ? err.message : String(err);
              console.error(JSON.stringify({ prefix: "[context-menu]", event: "drop_commit_error", hash: commit.hash, error: message }));
              void host.toast({ kind: "error", message: `${t("commit.dropFailed")}: ${message}`, copy: true, dismiss: true }).catch(() => {
              });
            }
          }, true);
        }
      },
      { type: "separator" },
      {
        // 推送此前所有提交：把当前分支推到远端（含所选提交）
        label: t("commit.pushUpTo"),
        action: async () => {
          const branch = getState().branches.find((b) => b.isCurrent)?.name ?? getState().branches.find((b) => !b.isRemote && b.commit === commit.hash)?.name;
          if (!branch) {
            void host.toast({ kind: "error", message: t("commit.pushNoBranch") }).catch(() => {
            });
            return;
          }
          try {
            const res = await service2.pushUpTo(directory2, commit.hash, branch);
            void host.toast({ kind: "success", message: t("commit.pushUpToDone", { ref: res.ref }) }).catch(() => {
            });
          } catch (err) {
            const message = err instanceof Error ? err.message : String(err);
            console.error(JSON.stringify({ prefix: "[context-menu]", event: "push_up_to_error", hash: commit.hash, error: message }));
            const rejected = message.toLowerCase().includes("rejected") || message.toLowerCase().includes("non-fast-forward");
            void host.toast({
              kind: "error",
              message: rejected ? t("commit.pushUpToRejected") : `${t("commit.pushUpToFailed")}: ${message}`,
              copy: true,
              dismiss: true
            }).catch(() => {
            });
          }
        }
      },
      { type: "separator" },
      {
        label: t("commit.newBranch"),
        action: () => {
          showCreateBranchDialog({
            service: service2,
            directory: directory2,
            startPoint: commit.hash,
            startPointLabel: t("dialog.basedOn", { info: `${commit.shortHash} - ${commit.message}` }),
            titleKey: "dialog.branchFromCommit",
            entry: "context-menu",
            onCreated: () => reloadCommits(service2, directory2)
          });
        }
      },
      {
        label: t("commit.newTag"),
        action: () => {
          console.log("[git-manager] New Tag from commit:", commit.hash);
        }
      }
    ];
  }
  function buildBatchCommitItems(hashes, service2, directory2) {
    return [
      {
        label: t("batch.selected", { n: hashes.length }),
        disabled: true,
        action: () => {
        }
      },
      { type: "separator" },
      {
        label: t("batch.copyHashes"),
        action: async () => {
          await copyToClipboard(hashes.join("\n"), "hash-list");
        }
      },
      {
        label: t("batch.cherryPickAll", { n: hashes.length }),
        action: () => {
          showConfirmDialog(t("batch.confirmCherryPick", { n: hashes.length }), async () => {
            console.debug(JSON.stringify({ prefix: "[context-menu]", event: "batch_cherry_pick_start", count: hashes.length }));
            let done = 0;
            for (const hash of hashes) {
              try {
                await service2.cherryPick(directory2, hash);
                done += 1;
              } catch (err) {
                const message = err instanceof Error ? err.message : String(err);
                console.error(JSON.stringify({
                  prefix: "[context-menu]",
                  event: "batch_cherry_pick_error",
                  hash,
                  done,
                  total: hashes.length,
                  error: message
                }));
                await reloadCommits(service2, directory2);
                const conflict = message.toLowerCase().includes("conflict");
                void host.toast({
                  kind: "error",
                  message: `${conflict ? t("commit.cherryPickConflict") : t("commit.cherryPickFailed")}: ${message}`,
                  copy: true,
                  dismiss: true
                }).catch(() => {
                });
                return;
              }
            }
            await reloadCommits(service2, directory2);
            console.debug(JSON.stringify({ prefix: "[context-menu]", event: "batch_cherry_pick_done", count: done }));
            void host.toast({ kind: "success", message: t("batch.cherryPickDone", { n: done }) }).catch(() => {
            });
          });
        }
      },
      {
        label: t("batch.revertAll", { n: hashes.length }),
        action: () => {
          showConfirmDialog(t("batch.confirmRevert", { n: hashes.length }), async () => {
            let done = 0;
            for (const hash of hashes) {
              try {
                await service2.revert(directory2, hash);
                done += 1;
              } catch (err) {
                const message = err instanceof Error ? err.message : String(err);
                console.error(JSON.stringify({
                  prefix: "[context-menu]",
                  event: "batch_revert_error",
                  hash,
                  done,
                  total: hashes.length,
                  error: message
                }));
                await reloadCommits(service2, directory2);
                const conflict = message.toLowerCase().includes("conflict");
                void host.toast({
                  kind: "error",
                  message: conflict ? t("commit.revertConflict") : `${t("commit.revertFailed")}: ${message}`,
                  copy: true,
                  dismiss: true
                }).catch(() => {
                });
                return;
              }
            }
            await reloadCommits(service2, directory2);
            void host.toast({ kind: "success", message: t("batch.revertDone", { n: done }) }).catch(() => {
            });
          });
        }
      }
    ];
  }
  function showResetDialog(commit, service2, directory2) {
    const overlay = html`
    <div class="gm-dialog-backdrop">
      <div class="gm-dialog gm-dialog--wide">
        <div class="gm-dialog__title">${t("reset.title")}</div>
        <div class="gm-dialog__hint">${commit.shortHash} - ${commit.message}</div>
        <div class="gm-dialog__choices">
          <label class="gm-check">
            <input type="radio" name="reset-mode" value="soft" checked />
            <span><b>--soft</b> ${t("reset.softDesc")}</span>
          </label>
          <label class="gm-check">
            <input type="radio" name="reset-mode" value="mixed" />
            <span><b>--mixed</b> ${t("reset.mixedDesc")}</span>
          </label>
          <label class="gm-check">
            <input type="radio" name="reset-mode" value="hard" />
            <span><b>--hard</b> ${t("reset.hardDesc")}</span>
          </label>
        </div>
        <div class="gm-dialog__actions">
          <button id="reset-cancel" class="gm-btn">${t("dialog.cancel")}</button>
          <button id="reset-ok" class="gm-btn gm-btn--destructive-filled">Reset</button>
        </div>
      </div>
    </div>
  `;
    document.body.appendChild(overlay);
    const close = () => overlay.remove();
    overlay.querySelector("#reset-cancel")?.addEventListener("click", close);
    overlay.addEventListener("click", (ev) => {
      if (ev.target === overlay) close();
    });
    overlay.querySelector("#reset-ok")?.addEventListener("click", async () => {
      const modeInput = overlay.querySelector('input[name="reset-mode"]:checked');
      const mode = modeInput?.value || "mixed";
      try {
        await service2.reset(directory2, commit.hash, mode);
        await reloadCommits(service2, directory2);
      } catch (err) {
        showOperationError(err, "op.resetFailed", "[context-menu]", "reset_error");
        return;
      }
      close();
    });
  }

  // panel/components/batch-delete.ts
  function resolveDeleteTargets(branches, selectedBranch, selectedBranches) {
    const targets = selectedBranches.size > 0 ? [...selectedBranches].map((name) => branches.find((b) => b.name === name)).filter((b) => b != null) : selectedBranch ? [selectedBranch] : [];
    if (targets.length === 0) return { kind: "none" };
    if (targets.some((b) => b.isCurrent)) return { kind: "current" };
    return { kind: "ok", targets };
  }
  async function deleteBranches(service2, host2, directory2, branches) {
    const total = branches.length;
    console.debug(JSON.stringify({
      prefix: "[batch-delete]",
      event: "start",
      names: branches.map((b) => b.name)
    }));
    const failed = [];
    for (const branch of branches) {
      try {
        const ok = await performBranchDelete(service2, directory2, branch);
        if (!ok) failed.push(branch.name);
      } catch (err) {
        failed.push(branch.name);
        console.error(JSON.stringify({
          prefix: "[batch-delete]",
          event: "unexpected_error",
          branch: branch.name,
          error: String(err)
        }));
      }
    }
    const removed = total - failed.length;
    console.debug(JSON.stringify({
      prefix: "[batch-delete]",
      event: "done",
      total,
      removed,
      failed
    }));
    if (total > 1) {
      if (failed.length === 0) {
        void host2.toast({ kind: "success", message: t("branch.batchDeleteDone", { n: removed }) }).catch(() => {
        });
      } else {
        void host2.toast({
          kind: "error",
          message: t("branch.batchDeletePartial", { ok: removed, failed: failed.join(", ") }),
          copy: true,
          dismiss: true
        }).catch(() => {
        });
      }
    }
    return removed;
  }

  // panel/icons.ts
  var ICONS = {
    // 隐藏分支面板 (←)：分支面板展开时显示，点击可收起
    hideBranches: {
      svg: `<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M10 13L5 8L10 3" stroke="currentColor" stroke-width="2"/></svg>`
    },
    // 显示分支面板 (>)：分支面板隐藏时显示，点击可展开
    showBranches: {
      svg: `<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M6 13L11 8L6 3" stroke="currentColor" stroke-width="2"/></svg>`
    },
    // 删除所选分支（IDEA AllIcons.Actions.GC 垃圾桶字形，新 UI 灰色）
    deleteBranch: {
      svg: `<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill="currentColor" d="M6,2 L6,1 L10,1 L10,2 L13,2 L13,4 L3,4 L3,2 L6,2 Z M4,12.7142858 L4,5 L12,5 L12,12.7142858 C12,13.4214286 11.4,14 10.6666667,14 L5.33333333,14 C4.6,14 4,13.4214286 4,12.7142858 Z"/></svg>`
    },
    // 与当前分支比较（IDEA AllIcons.Vcs.Diff 字形，新 UI 灰色双向箭头）
    compareBranch: {
      svg: `<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M5.85355 8.14645C5.65829 7.95118 5.34171 7.95118 5.14645 8.14645C4.95118 8.34171 4.95118 8.65829 5.14645 8.85355L7.29289 11H0.5C0.223858 11 0 11.2239 0 11.5C0 11.7761 0.223858 12 0.5 12H7.29289L5.14645 14.1464C4.95118 14.3417 4.95118 14.6583 5.14645 14.8536C5.34171 15.0488 5.65829 15.0488 5.85355 14.8536L8.85355 11.8536L9.20711 11.5L8.85355 11.1464L5.85355 8.14645Z" fill="currentColor"/><path fill-rule="evenodd" clip-rule="evenodd" d="M10.1464 1.14645C10.3417 0.951185 10.6583 0.951185 10.8536 1.14645C11.0488 1.34171 11.0488 1.65829 10.8536 1.85355L8.70711 4H15.5C15.7761 4 16 4.22386 16 4.5C16 4.77614 15.7761 5 15.5 5H8.70711L10.8536 7.14645C11.0488 7.34171 11.0488 7.65829 10.8536 7.85355C10.6583 8.04882 10.3417 8.04882 10.1464 7.85355L7.14645 4.85355L6.79289 4.5L7.14645 4.14645L10.1464 1.14645Z" fill="currentColor"/></svg>`
    },
    // 只显示我的分支（人形图标，与搜索框的放大镜区分）
    myBranches: {
      svg: `<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="8" cy="5.4" r="2.6" stroke="currentColor" stroke-width="1.4"/><path d="M3.4 13.4c.7-2.5 2.5-3.7 4.6-3.7s3.9 1.2 4.6 3.7" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg>`
    },
    // 新建分支 (+)
    newBranch: {
      svg: `<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M8 2V14M2 8H14" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>`
    },
    // 签出分支 (checkout)
    checkout: {
      svg: `<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><g fill="none" fill-rule="evenodd"><rect width="2" height="12.332" x="7.927" y=".901" style="fill: var(--oc-primary)" transform="rotate(45 8.927 7.067)"/><polygon style="fill: var(--oc-primary)" points="3 6 10 13 3 13"/></g></svg>`
    },
    // 删除分支 (trash)
    delete: {
      svg: `<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3 4H13M5 4V3C5 2.45 5.45 2 6 2H10C10.55 2 11 2.45 11 3V4M4 4L5 14H11L12 4M6.5 7V11M9.5 7V11" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`
    },
    // 更新所选（IDEA AllIcons.Actions.CheckOut 字形，Update Selected 动作图标；新 UI 下渲染为灰色）
    updateSelected: {
      svg: `<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><g fill="none" fill-rule="evenodd"><rect width="2" height="12.332" x="7.927" y=".901" fill="currentColor" transform="rotate(45 8.927 7.067)"/><polygon fill="currentColor" points="3 6 10 13 3 13"/></g></svg>`
    },
    // 刷新 (refresh)
    refresh: {
      svg: `<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M12.5747152,11.8852806 C11.4741474,13.1817355 9.83247882,14.0044386 7.99865879,14.0044386 C5.03907292,14.0044386 2.57997332,11.8615894 2.08820756,9.0427473 L3.94774327,9.10768372 C4.43372186,10.8898575 6.06393114,12.2000519 8.00015362,12.2000519 C9.30149237,12.2000519 10.4645985,11.6082097 11.2349873,10.6790094 L9.05000019,8.71167959 L14.0431479,8.44999981 L14.3048222,13.4430431 L12.5747152,11.8852806 Z M3.42785637,4.11741586 C4.52839138,2.82452748 6.16775464,2.00443857 7.99865879,2.00443857 C10.918604,2.00443857 13.3513802,4.09026967 13.8882946,6.8532307 L12.0226389,6.78808057 C11.5024872,5.05935553 9.89838095,3.8000774 8.00015362,3.8000774 C6.69867367,3.8000774 5.53545628,4.39204806 4.76506921,5.32142241 L6.95482203,7.29304326 L1.96167436,7.55472304 L1.70000005,2.56167973 L3.42785637,4.11741586 Z" fill="currentColor"/></svg>`
    },
    // 收藏 (star)
    favorite: {
      svg: `<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M8.46197 2.38123C8.38441 2.19475 8.20227 2.07324 8.00031 2.07324C7.79834 2.07324 7.61621 2.19475 7.53865 2.38123L6.06891 5.9149L2.25401 6.22074C2.05269 6.23688 1.88085 6.37255 1.81844 6.56463C1.75603 6.75671 1.8153 6.96748 1.96869 7.09887L4.87524 9.58864L3.98724 13.3113C3.94038 13.5078 4.01631 13.7131 4.1797 13.8319C4.3431 13.9506 4.56186 13.9593 4.73422 13.854L8.00031 11.8591L11.2664 13.854C11.4387 13.9593 11.6575 13.9506 11.8209 13.8319C11.9843 13.7131 12.0602 13.5078 12.0134 13.3113L11.1254 9.58864L14.0319 7.09887C14.1853 6.96748 14.2446 6.75671 14.1822 6.56463C14.1198 6.37255 13.9479 6.23688 13.7466 6.22074L9.9317 5.9149L8.46197 2.38123Z" style="fill: var(--oc-warning)"/></svg>`
    },
    // 未收藏 (star outline)
    favoriteOutline: {
      svg: `<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M7.99982 2.073C8.20178 2.073 8.38392 2.1945 8.46148 2.38098L9.93122 5.91466L13.7461 6.2205C13.9474 6.23664 14.1193 6.37231 14.1817 6.56439C14.2441 6.75647 14.1848 6.96723 14.0314 7.09862L11.1249 9.58839L12.0129 13.3111C12.0597 13.5075 11.9838 13.7129 11.8204 13.8316C11.657 13.9503 11.4383 13.9591 11.2659 13.8538L7.99982 11.8589L4.73373 13.8538C4.56138 13.9591 4.34261 13.9503 4.17921 13.8316C4.01582 13.7129 3.93989 13.5075 3.98675 13.3111L4.87475 9.58839L1.9682 7.09862C1.81482 6.96723 1.75554 6.75647 1.81795 6.56439C1.88036 6.37231 2.0522 6.23664 2.25352 6.2205L6.06842 5.91466L7.53816 2.38098C7.61572 2.1945 7.79785 2.073 7.99982 2.073ZM7.99982 3.87498L6.87446 6.58067C6.80245 6.75379 6.63965 6.87207 6.45275 6.88705L3.53173 7.12123L5.75724 9.02762C5.89964 9.14959 5.96182 9.34098 5.91832 9.52336L5.23839 12.3738L7.73919 10.8463C7.8992 10.7486 8.10044 10.7486 8.26045 10.8463L10.7612 12.3738L10.0813 9.52336C10.0378 9.34098 10.1 9.14959 10.2424 9.02762L12.4679 7.12123L9.54688 6.88705C9.35999 6.87207 9.19718 6.75379 9.12518 6.58067L7.99982 3.87498Z" style="fill: var(--oc-warning)"/></svg>`
    },
    // 设置 (gear)
    settings: {
      svg: `<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill="currentColor" fill-rule="evenodd" d="M12.7078144,8.94092644 L14.1860171,10.0014962 C13.9015285,10.8814083 13.4345167,11.6792367 12.8296171,12.3503459 L11.1720587,11.6025852 C10.7002906,12.0182974 10.1462196,12.3427961 9.53742767,12.5484995 L9.35682478,14.3581758 C8.91920787,14.4511061 8.46531382,14.5 8,14.5 C7.53468618,14.5 7.08079213,14.4511061 6.64317522,14.3581758 L6.46257231,12.5484994 C5.85378047,12.3427959 5.29970962,12.0182972 4.82794166,11.6025851 L3.1703829,12.3503459 C2.5654833,11.6792367 2.0984715,10.8814083 1.8139829,10.0014962 L3.29218604,8.94092614 C3.23171292,8.63665953 3.20000005,8.32203335 3.20000005,8.00000024 C3.20000005,7.67796698 3.23171295,7.36334066 3.29218612,7.05907392 L1.8139829,5.99850385 C2.0984715,5.11859166 2.5654833,4.32076327 3.1703829,3.64965409 L4.82794202,4.39741509 C5.29970989,3.98170311 5.85378059,3.65720451 6.46257226,3.45150114 L6.64317522,1.64182422 C7.08079213,1.54889386 7.53468618,1.5 8,1.5 C8.46531382,1.5 8.91920787,1.54889386 9.35682478,1.64182422 L9.53742772,3.45150097 C10.1462195,3.65720431 10.7002903,3.98170292 11.1720583,4.39741495 L12.8296171,3.64965409 C13.4345167,4.32076327 13.9015285,5.11859166 14.1860171,5.99850385 L12.7078143,7.05907362 C12.7682875,7.36334046 12.8000004,7.67796687 12.8000004,8.00000024 C12.8000004,8.32203346 12.7682875,8.63665973 12.7078144,8.94092644 Z M7.99999976,10.3003956 C9.27025466,10.3003956 10.2999997,9.27056196 10.2999997,8.00019773 C10.2999997,6.72983349 9.27025466,5.69999981 7.99999976,5.69999981 C6.72974486,5.69999981 5.69999981,6.72983349 5.69999981,8.00019773 C5.69999981,9.27056196 6.72974486,10.3003956 7.99999976,10.3003956 Z"/></svg>`
    },
    // 全部展开 (expand)
    expandAll: {
      svg: `<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M4.5 5.5L8 2L11.5 5.5" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"/><path d="M4.5 10.5L8 14L11.5 10.5" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"/></svg>`
    },
    // Cherry-pick（两个分支节点 + 挑拣箭头）
    cherryPick: {
      svg: `<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M6.5 11C6.5 12.1046 5.60457 13 4.5 13C3.39543 13 2.5 12.1046 2.5 11C2.5 9.89543 3.39543 9 4.5 9C5.60457 9 6.5 9.89543 6.5 11ZM4.5 14C6.15685 14 7.5 12.6569 7.5 11C7.5 9.34315 6.15685 8 4.5 8C2.84315 8 1.5 9.34315 1.5 11C1.5 12.6569 2.84315 14 4.5 14ZM13.5 11C13.5 12.1046 12.6046 13 11.5 13C10.3954 13 9.5 12.1046 9.5 11C9.5 9.89543 10.3954 9 11.5 9C12.6046 9 13.5 9.89543 13.5 11ZM11.5 14C13.1569 14 14.5 12.6569 14.5 11C14.5 9.34315 13.1569 8 11.5 8C9.84315 8 8.5 9.34315 8.5 11C8.5 12.6569 9.84315 14 11.5 14Z" fill="currentColor"/><path fill-rule="evenodd" clip-rule="evenodd" d="M11.8537 1.14647C11.7934 1.08617 11.7216 1.04449 11.6453 1.02143C11.5869 1.00372 11.5244 0.996452 11.46 1.00164L11.4585 1.00175L11.4577 1.00183C8.89299 1.21581 7.10682 2.51359 5.92996 4.03112C4.76214 5.53699 4.18349 7.26955 4.00588 8.424C3.9639 8.69693 4.15111 8.95222 4.42404 8.99421C4.69697 9.0362 4.95227 8.84899 4.99426 8.57606C5.14998 7.56384 5.67133 5.9964 6.72018 4.64394C7.43375 3.72381 8.38624 2.9082 9.6361 2.42686L10.8329 1.87283L10.1507 2.48553C9.63716 3.45813 9.48624 4.482 9.53842 5.42758C9.61459 6.8079 10.1221 8.0385 10.5761 8.76503C10.7225 8.9992 11.031 9.07038 11.2651 8.92403C11.4993 8.77767 11.5705 8.4692 11.4241 8.23503C11.0449 7.62822 10.6024 6.55883 10.5369 5.37248C10.4723 4.20114 10.7737 2.93361 11.8537 1.85358C12.049 1.65832 12.049 1.34174 11.8537 1.14647Z" fill="currentColor"/></svg>`
    },
    // 折叠全部
    collapseAll: {
      svg: `<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M4.5 2.5L8 6L11.5 2.5" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"/><path d="M4.5 13.5L8 10L11.5 13.5" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"/></svg>`
    },
    // 获取远程更新（fetch）
    fetch: {
      svg: `<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12.8536 3.14645C13.0488 3.34171 13.0488 3.65829 12.8536 3.85355L11.4393 5.26777C11.2441 5.46303 10.9275 5.46303 10.7322 5.26777C10.537 5.0725 10.537 4.75592 10.7322 4.56066L12.1464 3.14645C12.3417 2.95118 12.6583 2.95118 12.8536 3.14645Z" fill="currentColor"/><path d="M10.0251 5.97487C10.2204 6.17014 10.2204 6.48672 10.0251 6.68198L8.61091 8.09619C8.41565 8.29146 8.09907 8.29146 7.90381 8.09619C7.70854 7.90093 7.70854 7.58435 7.90381 7.38909L9.31802 5.97487C9.51328 5.77961 9.82986 5.77961 10.0251 5.97487Z" fill="currentColor"/><path d="M7.1967 8.8033C7.39196 8.99856 7.39196 9.31515 7.1967 9.51041L5.78249 10.9246C5.58722 11.1199 5.27064 11.1199 5.07538 10.9246C4.88012 10.7294 4.88012 10.4128 5.07538 10.2175L6.48959 8.8033C6.68485 8.60804 7.00144 8.60804 7.1967 8.8033Z" fill="currentColor"/><path d="M3.5 5C3.77614 5 4 5.22386 4 5.5V7.5C4 7.77614 3.77614 8 3.5 8C3.22386 8 3 7.77614 3 7.5V5.5C3 5.22386 3.22386 5 3.5 5Z" fill="currentColor"/><path d="M3.5 9C3.77614 9 4 9.22386 4 9.5V12H6.5C6.77614 12 7 12.2239 7 12.5C7 12.7761 6.77614 13 6.5 13H3.5C3.22386 13 3 12.7761 3 12.5V9.5C3 9.22386 3.22386 9 3.5 9Z" fill="currentColor"/><path d="M8 12.5C8 12.2239 8.22386 12 8.5 12H10.5C10.7761 12 11 12.2239 11 12.5C11 12.7761 10.7761 13 10.5 13H8.5C8.22386 13 8 12.7761 8 12.5Z" fill="currentColor"/></svg>`
    },
    // 在日志中定位所选分支（Locate）
    locate: {
      svg: `<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M8.5 5V2.02054C11.4149 2.26101 13.739 4.5851 13.9795 7.5H11C10.7239 7.5 10.5 7.72386 10.5 8C10.5 8.27614 10.7239 8.5 11 8.5H13.9795C13.739 11.4149 11.4149 13.739 8.5 13.9795V11C8.5 10.7239 8.27614 10.5 8 10.5C7.72386 10.5 7.5 10.7239 7.5 11V13.9795C4.5851 13.739 2.26101 11.4149 2.02054 8.5H5C5.27614 8.5 5.5 8.27614 5.5 8C5.5 7.72386 5.27614 7.5 5 7.5H2.02054C2.26101 4.5851 4.5851 2.26101 7.5 2.02054V5C7.5 5.27614 7.72386 5.5 8 5.5C8.27614 5.5 8.5 5.27614 8.5 5ZM1 8C1 4.13401 4.13401 1 8 1C11.866 1 15 4.13401 15 8C15 11.866 11.866 15 8 15C4.13401 15 1 11.866 1 8Z" fill="currentColor"/></svg>`
    },
    // 排序 (sort)
    sort: {
      svg: `<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M4 3V13M4 13L2 11M4 13L6 11M12 13V3M12 3L10 5M12 3L14 5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`
    },
    // 远程 (globe)
    remote: {
      svg: `<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="8" cy="8" r="6" stroke="currentColor" stroke-width="1.5"/><path d="M2 8H14M8 2C10 4 10 12 8 14M6 2C4 4 4 12 6 14M10 2C12 4 12 12 10 14" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>`
    },
    // Pull (下载)
    pull: {
      svg: `<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M8 2V10M8 10L5 7M8 10L11 7M2 12V14H14V12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`
    },
    // Push (上传)
    push: {
      svg: `<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M8 10V2M8 2L5 5M8 2L11 5M2 12V14H14V12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`
    },
    // 关闭 (x)
    close: {
      svg: `<svg width="10" height="10" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M2 2L8 8M8 2L2 8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>`
    },
    // 更多选项 (more)
    more: {
      svg: `<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="8" cy="3" r="1.5" fill="currentColor"/><circle cx="8" cy="8" r="1.5" fill="currentColor"/><circle cx="8" cy="13" r="1.5" fill="currentColor"/></svg>`
    },
    // 正则 (regex)
    regex: {
      svg: `<svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3 7C3 5 5 3 7 3C9 3 11 5 11 7C11 9 9 11 7 11" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/><path d="M4 4L2 2M10 4L12 2" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/></svg>`
    },
    // 搜索 (magnifier)
    search: {
      svg: `<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="7" cy="7" r="4.5" stroke="currentColor" stroke-width="1.5"/><path d="M10.5 10.5L14 14" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>`
    },
    // 当前分支 (checkmark)
    currentBranch: {
      svg: `<svg width="12" height="12" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M4 8L7 11L12 5" style="stroke: var(--oc-primary)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`
    },
    // 未推送 (上传箭头)
    unpushed: {
      svg: `<svg width="10" height="10" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M8 10V2M8 2L5 5M8 2L11 5" style="stroke: var(--oc-success)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`
    },
    // 未拉取 (下载箭头)
    unpulled: {
      svg: `<svg width="10" height="10" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M8 2V10M8 10L5 7M8 10L11 7" style="stroke: var(--oc-primary)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`
    },
    // 本地分支 (分支图标)
    localBranch: {
      svg: `<svg width="14" height="14" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M4 2V14M12 2V14M4 8H12M4 5H12M4 11H12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>`
    },
    // 远程分支 (分支图标)
    remoteBranch: {
      svg: `<svg width="14" height="14" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M4 2V14M12 2V14M4 8H12M4 5H12M4 11H12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><circle cx="4" cy="5" r="1.5" fill="currentColor"/><circle cx="12" cy="5" r="1.5" fill="currentColor"/></svg>`
    },
    // 标签 (tag)
    tag: {
      svg: `<svg width="14" height="14" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M2 2H7L14 9L9 14L2 7V2Z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/></svg>`
    },
    // 加载中 (spinner)
    loading: {
      svg: `<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M8 1V3M8 13V15M1 8H3M13 8H15M2.9 2.9L4.3 4.3M11.7 11.7L13.1 13.1M13.1 2.9L11.7 4.3M4.3 11.7L2.9 13.1" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><animateTransform attributeName="transform" type="rotate" from="0 8 8" to="360 8 8" dur="1s" repeatCount="indefinite"/></path></svg>`
    },
    // 下载 (download)
    download: {
      svg: `<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M8 2V10M8 10L5 7M8 10L11 7M2 12V14H14V12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`
    },
    // 对比 (compare)
    compare: {
      svg: `<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M4 3V13M12 3V13M4 8H12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><path d="M6 5L3 8L6 11" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M10 5L13 8L10 11" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`
    },
    // 分支图标 (branch)
    branchIcon: {
      svg: `<svg width="14" height="14" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M5 2V14M11 2V14M5 8H11" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><circle cx="5" cy="5" r="2" fill="currentColor"/><circle cx="11" cy="11" r="2" fill="currentColor"/></svg>`
    },
    // 图形 (graph)
    graph: {
      svg: `<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="4" cy="4" r="2" stroke="currentColor" stroke-width="1.5"/><circle cx="4" cy="12" r="2" stroke="currentColor" stroke-width="1.5"/><circle cx="12" cy="8" r="2" stroke="currentColor" stroke-width="1.5"/><path d="M4 6V10M6 4H8L10 8M6 12H8L10 8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>`
    },
    // 设置齿轮 (gearSettings)
    gearSettings: {
      svg: `<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill="currentColor" fill-rule="evenodd" d="M12.7078144,8.94092644 L14.1860171,10.0014962 C13.9015285,10.8814083 13.4345167,11.6792367 12.8296171,12.3503459 L11.1720587,11.6025852 C10.7002906,12.0182974 10.1462196,12.3427961 9.53742767,12.5484995 L9.35682478,14.3581758 C8.91920787,14.4511061 8.46531382,14.5 8,14.5 C7.53468618,14.5 7.08079213,14.4511061 6.64317522,14.3581758 L6.46257231,12.5484994 C5.85378047,12.3427959 5.29970962,12.0182972 4.82794166,11.6025851 L3.1703829,12.3503459 C2.5654833,11.6792367 2.0984715,10.8814083 1.8139829,10.0014962 L3.29218604,8.94092614 C3.23171292,8.63665953 3.20000005,8.32203335 3.20000005,8.00000024 C3.20000005,7.67796698 3.23171295,7.36334066 3.29218612,7.05907392 L1.8139829,5.99850385 C2.0984715,5.11859166 2.5654833,4.32076327 3.1703829,3.64965409 L4.82794202,4.39741509 C5.29970989,3.98170311 5.85378059,3.65720451 6.46257226,3.45150114 L6.64317522,1.64182422 C7.08079213,1.54889386 7.53468618,1.5 8,1.5 C8.46531382,1.5 8.91920787,1.54889386 9.35682478,1.64182422 L9.53742772,3.45150097 C10.1462195,3.65720431 10.7002903,3.98170292 11.1720583,4.39741495 L12.8296171,3.64965409 C13.4345167,4.32076327 13.9015285,5.11859166 14.1860171,5.99850385 L12.7078143,7.05907362 C12.7682875,7.36334046 12.8000004,7.67796687 12.8000004,8.00000024 C12.8000004,8.32203346 12.7682875,8.63665973 12.7078144,8.94092644 Z M7.99999976,10.3003956 C9.27025466,10.3003956 10.2999997,9.27056196 10.2999997,8.00019773 C10.2999997,6.72983349 9.27025466,5.69999981 7.99999976,5.69999981 C6.72974486,5.69999981 5.69999981,6.72983349 5.69999981,8.00019773 C5.69999981,9.27056196 6.72974486,10.3003956 7.99999976,10.3003956 Z"/></svg>`
    },
    // 跳转到引用 (goToRef)
    goToRef: {
      svg: `<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3 8H13M13 8L9 4M13 8L9 12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`
    }
  };
  function getIcon(name) {
    return ICONS[name]?.svg ?? "";
  }

  // panel/components/branch-panel.ts
  var HEADER_ACTIONS = [
    { key: "newBranch", icon: "newBranch", titleKey: "sidebar.newBranch" },
    { key: "refresh", icon: "updateSelected", titleKey: "sidebar.update" },
    { key: "fetch", icon: "fetch", titleKey: "sidebar.fetch" },
    { key: "delete", icon: "deleteBranch", titleKey: "sidebar.deleteBranch" },
    { key: "compare", icon: "compareBranch", titleKey: "sidebar.compareBranch" },
    { key: "favorite", icon: "favoriteOutline", titleKey: "sidebar.favorite" },
    { key: "expandAll", icon: "expandAll", titleKey: "sidebar.expandAll" },
    { key: "collapseAll", icon: "collapseAll", titleKey: "sidebar.collapseAll" }
  ];
  function unavailableReason(key, state) {
    const localBranches = state.branches.filter((b) => !b.isRemote);
    const hasRemote = state.branches.some((b) => b.isRemote);
    const selected = state.selectedBranch;
    switch (key) {
      case "newBranch":
        return localBranches.length === 0 ? t("sidebar.newBranchUnavailable") : null;
      case "refresh":
        return hasRemote ? null : t("sidebar.updateUnavailable");
      case "fetch":
        if (state.fetching) return t("sidebar.fetchInProgress");
        return hasRemote ? null : t("sidebar.updateUnavailable");
      case "delete":
        if (!selected) return t("branch.selectBranch");
        if (selected.isCurrent) return t("branch.deleteCurrent");
        if (selected.isRemote) return t("sidebar.deleteRemoteUnavailable");
        return null;
      case "compare":
        if (state.selectedBranches.size === 2) return null;
        if (!selected) return t("compare.selectBranch");
        if (selected.isCurrent) return t("compare.currentBranch");
        return null;
      case "favorite":
        return selected || state.selectedBranches.size > 0 ? null : t("branch.selectBranch");
      case "expandAll":
      case "collapseAll":
        return state.branches.length === 0 ? t("sidebar.expandAllUnavailable") : null;
      default:
        return null;
    }
  }
  function createBranchPanel(container, service2, directory2, onBranchSelect, onSelectionCleared, actions) {
    let disposed = false;
    let listContainer = null;
    let search = null;
    let myBranchesBtn = null;
    const headerButtons = /* @__PURE__ */ new Map();
    const expandedGroups = /* @__PURE__ */ new Set([t("branch.groupHead"), t("branch.groupLocal")]);
    let unsubscribe = null;
    const findBranchFromEvent = (e) => {
      const target = e.target;
      const item = target.closest("[data-branch]");
      if (!item) return null;
      const branchName = item.getAttribute("data-branch");
      if (!branchName) return null;
      const state = getState();
      const branch = state.branches.find((b) => b.name === branchName) || null;
      if (!branch) {
        console.error(JSON.stringify({
          prefix: "[branch-panel]",
          event: "branch_not_found",
          branchName,
          availableCount: state.branches.length,
          targetTag: target.tagName
        }));
      }
      return branch;
    };
    const findGroupFromEvent = (e) => {
      const target = e.target;
      const item = target.closest("[data-group]");
      if (!item) return null;
      return item.getAttribute("data-group");
    };
    const buildHeader = () => {
      const header = html`
      <div class="gm-branches__header">
        <span class="gm-branches__title">${t("branch.title")}</span>
      </div>
    `;
      for (const action of HEADER_ACTIONS) {
        const title = t(action.titleKey);
        const btn = html`
        <button type="button" class="gm-icon-btn" data-branch-action="${action.key}" title="${title}" aria-label="${title}">
          ${getIcon(action.icon)}
        </button>
      `;
        header.appendChild(btn);
        headerButtons.set(action.key, btn);
      }
      header.addEventListener("click", (e) => {
        if (disposed) return;
        const btn = e.target.closest("[data-branch-action]");
        if (!btn) return;
        const key = btn.dataset.branchAction ?? "";
        if (key === "newBranch") actions.onNewBranch();
        else if (key === "refresh") actions.onUpdateSelected();
        else if (key === "fetch") actions.onFetch();
        else if (key === "delete") actions.onDeleteBranch();
        else if (key === "compare") actions.onCompareBranch();
        else if (key === "favorite") actions.onFavorite();
        else if (key === "expandAll") expandAll();
        else if (key === "collapseAll") collapseAll();
      });
      return header;
    };
    const buildSearchRow = () => {
      const row = html`<div class="gm-branches__search"></div>`;
      search = mountSearchField(row, {
        value: getState().branchFilter,
        placeholder: t("branch.searchPlaceholder"),
        label: t("branch.searchPlaceholder"),
        onChange: (value) => {
          setState((s) => {
            s.branchFilter = value;
          });
        }
      });
      const title = t("sidebar.showMyBranches");
      myBranchesBtn = html`
      <button type="button" class="gm-icon-btn" data-branch-action="myBranches" title="${title}" aria-label="${title}" aria-pressed="false">
        ${getIcon("myBranches")}
      </button>
    `;
      myBranchesBtn.addEventListener("click", () => {
        if (disposed) return;
        const state = getState();
        if (!state.branches.some((b) => !b.isRemote)) return;
        actions.onToggleMyBranches();
      });
      row.appendChild(myBranchesBtn);
      return row;
    };
    const syncActions = () => {
      const state = getState();
      for (const action of HEADER_ACTIONS) {
        const btn = headerButtons.get(action.key);
        if (!btn) continue;
        const reason = unavailableReason(action.key, state);
        btn.setAttribute("aria-disabled", String(reason !== null));
        if (reason === null) {
          btn.removeAttribute("disabled");
          btn.setAttribute("title", t(action.titleKey));
          btn.setAttribute("aria-label", t(action.titleKey));
        } else {
          btn.setAttribute("disabled", "");
          btn.setAttribute("title", reason);
          btn.setAttribute("aria-label", reason);
        }
      }
      const favourite = headerButtons.get("favorite");
      if (favourite) {
        const names = state.selectedBranches.size > 0 ? [...state.selectedBranches] : state.selectedBranch ? [state.selectedBranch.name] : [];
        const allFavorited = names.length > 0 && names.every((name) => state.favorites.has(name));
        favourite.innerHTML = allFavorited ? getIcon("favorite") : getIcon("favoriteOutline");
      }
      if (myBranchesBtn) {
        const hasLocal = state.branches.some((b) => !b.isRemote);
        myBranchesBtn.setAttribute("aria-pressed", String(state.showOnlyMyBranches));
        myBranchesBtn.setAttribute("aria-disabled", String(!hasLocal));
        const title = !hasLocal ? t("sidebar.myBranchesUnavailable") : state.showOnlyMyBranches ? t("sidebar.showMyBranchesOn") : t("sidebar.showMyBranches");
        myBranchesBtn.setAttribute("title", title);
        myBranchesBtn.setAttribute("aria-label", title);
      }
      search?.update({ value: state.branchFilter });
    };
    const renderList = () => {
      if (disposed || !listContainer) return;
      const state = getState();
      listContainer.innerHTML = "";
      const filteredBranches = state.branches.filter((branch) => {
        if (state.showOnlyMyBranches && !state.myBranches.has(branch.name)) {
          return false;
        }
        if (!state.branchFilter) return true;
        return branch.name.toLowerCase().includes(state.branchFilter.toLowerCase());
      });
      const current3 = filteredBranches.filter((b) => b.isCurrent);
      const local = filteredBranches.filter((b) => !b.isRemote);
      const remote = filteredBranches.filter((b) => b.isRemote);
      if (current3.length > 0) {
        listContainer.appendChild(
          createGroup(t("branch.groupHead"), current3, expandedGroups.has(t("branch.groupHead")))
        );
      }
      if (local.length > 0) {
        const groups = groupBranches(local);
        listContainer.appendChild(createCollapsibleGroup(t("branch.groupLocal"), groups));
      }
      if (remote.length > 0) {
        listContainer.appendChild(
          createGroup(t("branch.groupRemote"), remote, expandedGroups.has(t("branch.groupRemote")))
        );
      }
    };
    const expandAll = () => {
      if (disposed) return;
      expandedGroups.add(t("branch.groupHead"));
      expandedGroups.add(t("branch.groupLocal"));
      expandedGroups.add(t("branch.groupRemote"));
      for (const branch of getState().branches) {
        const parts = branch.name.split("/");
        if (parts.length > 1) {
          expandedGroups.add(parts[0]);
        }
      }
      console.debug(JSON.stringify({
        prefix: "[branch-panel]",
        event: "expand_all",
        groupCount: expandedGroups.size
      }));
      renderList();
    };
    const collapseAll = () => {
      if (disposed) return;
      expandedGroups.clear();
      console.debug(JSON.stringify({
        prefix: "[branch-panel]",
        event: "collapse_all"
      }));
      renderList();
    };
    function groupBranches(branches) {
      const groups = /* @__PURE__ */ new Map();
      const rootBranches = [];
      for (const branch of branches) {
        const parts = branch.name.split("/");
        if (parts.length > 1) {
          const folderName = parts[0];
          if (!groups.has(folderName)) {
            groups.set(folderName, []);
          }
          groups.get(folderName).push(branch);
        } else {
          rootBranches.push(branch);
        }
      }
      const result = /* @__PURE__ */ new Map();
      for (const branch of rootBranches) {
        result.set(branch.name, [branch]);
      }
      for (const [folder, branchList] of groups) {
        result.set(folder, branchList);
      }
      return result;
    }
    function groupHeader(title, key, expanded) {
      return html`
      <div data-group="${key}" class="gm-branch-group__header" role="button" tabindex="0">
        <span class="gm-branch-group__caret">${expanded ? "\u25BC" : "\u25B6"}</span>
        ${title}
      </div>
    `;
    }
    function createCollapsibleGroup(title, groups) {
      const isExpanded = expandedGroups.has(title);
      const groupEl = html`<div class="gm-branch-group"></div>`;
      groupEl.appendChild(groupHeader(title, title, isExpanded));
      if (!isExpanded) return groupEl;
      for (const [key, branches] of groups) {
        if (branches.length === 1 && key === branches[0].name) {
          groupEl.appendChild(createBranchItem(branches[0]));
          continue;
        }
        const folderExpanded = expandedGroups.has(key);
        const folderEl = html`<div class="gm-branch-group gm-branch-group--nested"></div>`;
        folderEl.appendChild(groupHeader(key, key, folderExpanded));
        if (folderExpanded) {
          for (const branch of branches) {
            const branchItem = createBranchItem(branch);
            branchItem.classList.add("gm-branch-item--nested");
            folderEl.appendChild(branchItem);
          }
        }
        groupEl.appendChild(folderEl);
      }
      return groupEl;
    }
    function createGroup(title, branches, expanded) {
      const group = html`<div class="gm-branch-group"></div>`;
      group.appendChild(groupHeader(title, title, expanded));
      if (expanded) {
        for (const branch of branches) {
          group.appendChild(createBranchItem(branch));
        }
      }
      return group;
    }
    function createBranchItem(branch) {
      const state = getState();
      const isFavorite = state.favorites.has(branch.name);
      const isSelected = state.selectedBranches.has(branch.name) || state.selectedBranches.size === 0 && state.selectedBranch?.name === branch.name;
      const item = html`
      <div
        class="gm-branch-item"
        data-branch="${branch.name}"
        data-current="${branch.isCurrent ? "true" : "false"}"
        aria-selected="${isSelected ? "true" : "false"}"
      >
        <span class="gm-branch-item__icon">${getIcon("branchIcon")}</span>
        ${isFavorite ? html`<span class="gm-branch-item__favorite" title="${t("branch.unfavorite")}">${getIcon("favorite")}</span>` : ""}
        <span class="gm-branch-item__name">${branch.name}</span>
        ${branch.hasUnpushed && branch.unpushedCount ? html`<span class="gm-branch-item__count gm-branch-item__count--unpushed">↑${branch.unpushedCount}</span>` : ""}
        ${branch.hasUnpulled && branch.unpulledCount ? html`<span class="gm-branch-item__count gm-branch-item__count--unpulled">↓${branch.unpulledCount}</span>` : ""}
      </div>
    `;
      return item;
    }
    const render2 = () => {
      if (disposed) return;
      container.innerHTML = "";
      container.appendChild(buildHeader());
      container.appendChild(buildSearchRow());
      listContainer = html`
      <div class="gm-branches__list" data-branch-list></div>
    `;
      listContainer.addEventListener("click", (e) => {
        const branch = findBranchFromEvent(e);
        if (branch) {
          const multi = e.metaKey || e.ctrlKey;
          console.debug(JSON.stringify({
            prefix: "[branch-panel]",
            event: "branch_click",
            branchName: branch.name,
            multi
          }));
          if (multi) {
            setState((s) => {
              const next = new Set(s.selectedBranches);
              if (next.has(branch.name)) next.delete(branch.name);
              else next.add(branch.name);
              s.selectedBranches = next;
              const names = [...next];
              s.selectedBranch = names.length === 1 ? s.branches.find((b) => b.name === names[0]) ?? branch : null;
            });
            renderList();
            return;
          }
          try {
            console.debug(JSON.stringify({ prefix: "[branch-panel]", event: "before_on_branch_select", branchName: branch.name }));
            onBranchSelect(branch);
            console.debug(JSON.stringify({ prefix: "[branch-panel]", event: "after_on_branch_select", branchName: branch.name }));
          } catch (err) {
            console.error(JSON.stringify({ prefix: "[branch-panel]", event: "on_branch_select_error", error: String(err) }));
          }
          setState((s) => {
            s.selectedBranch = s.branches.find((b) => b.name === branch.name) ?? branch;
            s.selectedBranches = /* @__PURE__ */ new Set();
          });
          renderList();
          return;
        }
        const groupEl = findGroupFromEvent(e);
        if (groupEl) {
          console.debug(JSON.stringify({
            prefix: "[branch-panel]",
            event: "group_click",
            groupName: groupEl
          }));
          if (expandedGroups.has(groupEl)) {
            expandedGroups.delete(groupEl);
          } else {
            expandedGroups.add(groupEl);
          }
          renderList();
          return;
        }
        const state = getState();
        if (state.selectedBranch || state.logBranch) {
          console.debug(JSON.stringify({ prefix: "[branch-panel]", event: "blank_clear" }));
          onSelectionCleared();
        } else {
          console.debug(JSON.stringify({ prefix: "[branch-panel]", event: "blank_clear_noop" }));
        }
      });
      listContainer.addEventListener("contextmenu", (e) => {
        const branch = findBranchFromEvent(e);
        if (branch) {
          e.preventDefault();
          showContextMenu(e, branch, service2, directory2);
        }
      });
      container.appendChild(listContainer);
      syncActions();
      renderList();
      if (unsubscribe) unsubscribe();
      unsubscribe = subscribeFields(
        ["branches", "branchFilter", "favorites", "selectedBranch", "selectedBranches", "showOnlyMyBranches", "myBranches", "fetching"],
        () => {
          if (disposed) return;
          syncActions();
          renderList();
        }
      );
    };
    const dispose = () => {
      disposed = true;
      if (unsubscribe) {
        unsubscribe();
        unsubscribe = null;
      }
      search?.dispose();
      search = null;
      myBranchesBtn = null;
      headerButtons.clear();
    };
    render2();
    return { dispose, expandAll, collapseAll };
  }

  // panel/components/settings-menu.ts
  var SETTINGS_ITEMS = [
    // 表头列开关（对应 IDEA Toggle Columns）
    { key: "showAuthor", labelKey: "settings.showAuthor" },
    { key: "showDate", labelKey: "settings.showDate" },
    { key: "showHash", labelKey: "settings.showHash" },
    // 表格与提交图显示项
    { key: "showTagNames", labelKey: "settings.showTagNames" },
    { key: "compactReferences", labelKey: "settings.compactReferences" },
    { key: "showLongEdges", labelKey: "settings.showLongEdges" },
    { key: "preferCommitDate", labelKey: "settings.preferCommitDate" },
    { key: "referencesOnLeft", labelKey: "settings.referencesOnLeft" }
  ];
  var closeHandler = null;
  function removeCloseHandler() {
    if (!closeHandler) return;
    document.removeEventListener("click", closeHandler);
    closeHandler = null;
  }
  function hideSettingsMenu() {
    removeCloseHandler();
    const existing = document.getElementById("git-settings-menu");
    if (existing) existing.remove();
  }
  function syncChecks(menu) {
    const settings = getState().displaySettings;
    for (const item of SETTINGS_ITEMS) {
      const check = menu.querySelector(`[data-key="${item.key}"]`)?.querySelector(".git-settings-check");
      if (check) {
        check.textContent = settings[item.key] ? "\u2713" : "";
      }
    }
  }
  function showSettingsMenu(e) {
    hideSettingsMenu();
    const menu = document.createElement("div");
    menu.id = "git-settings-menu";
    menu.className = "gm-popup";
    menu.style.left = `${e.clientX}px`;
    menu.style.top = `${e.clientY}px`;
    const title = document.createElement("div");
    title.textContent = t("settings.title");
    title.className = "gm-popup__group";
    menu.appendChild(title);
    const separator = document.createElement("div");
    separator.className = "gm-popup__sep";
    menu.appendChild(separator);
    for (const [index, item] of SETTINGS_ITEMS.entries()) {
      if (index === 3) {
        const midSep = document.createElement("div");
        midSep.className = "gm-popup__sep";
        menu.appendChild(midSep);
      }
      {
        const el2 = document.createElement("div");
        el2.dataset.key = item.key;
        el2.className = "gm-menu-item";
        const check = document.createElement("span");
        check.className = "git-settings-check gm-menu-item__check";
        const label = document.createElement("span");
        label.textContent = t(item.labelKey);
        el2.appendChild(check);
        el2.appendChild(label);
        menu.appendChild(el2);
      }
    }
    syncChecks(menu);
    document.body.appendChild(menu);
    menu.addEventListener("click", (ev) => {
      const target = ev.target.closest("div");
      if (!target || target.parentElement !== menu) return;
      const key = target.dataset.key;
      if (!key) return;
      setState((s) => {
        s.displaySettings[key] = !s.displaySettings[key];
      });
      syncChecks(menu);
    });
    const handler = (ev) => {
      if (!menu.isConnected) {
        document.removeEventListener("click", handler);
        return;
      }
      if (!menu.contains(ev.target)) {
        hideSettingsMenu();
      }
    };
    closeHandler = handler;
    setTimeout(() => document.addEventListener("click", handler), 0);
  }

  // panel/components/dropdown-menu.ts
  var ANCHOR_GAP = 2;
  var VIEWPORT_MARGIN = 4;
  var current2 = null;
  function logDropdown(event, detail = {}) {
    console.debug("[dropdown]", JSON.stringify({ event, ...detail }));
  }
  function closeMenu(instance, reason) {
    if (instance.closed) return;
    instance.closed = true;
    if (instance.outsideTimer !== null) {
      clearTimeout(instance.outsideTimer);
      instance.outsideTimer = null;
    }
    document.removeEventListener("click", instance.onOutsideClick);
    document.removeEventListener("keydown", instance.onKeydown);
    instance.menu.remove();
    if (current2 === instance) current2 = null;
    logDropdown("close", { reason });
  }
  function createRow(item) {
    const kind = item.kind ?? "item";
    const row = document.createElement("div");
    row.dataset.kind = kind;
    row.dataset.id = item.id;
    if (kind === "separator") {
      row.classList.add("gm-popup__sep");
      return row;
    }
    if (kind === "group") {
      row.classList.add("gm-popup__group");
      row.textContent = item.label;
      return row;
    }
    row.classList.add("gm-menu-item");
    if (item.disabled) {
      row.dataset.disabled = "true";
    } else {
      row.dataset.disabled = "false";
    }
    const check = document.createElement("span");
    check.className = "git-dropdown-check gm-menu-item__check";
    check.textContent = item.checked ? "\u2713" : "";
    const label = document.createElement("span");
    label.textContent = item.label;
    row.appendChild(check);
    row.appendChild(label);
    return row;
  }
  function computePosition(anchor, menu) {
    const rect = anchor.getBoundingClientRect();
    const width = menu.offsetWidth;
    const height = menu.offsetHeight;
    const left = Math.max(0, Math.min(rect.left, window.innerWidth - width - VIEWPORT_MARGIN));
    const spaceBelow = window.innerHeight - rect.bottom;
    const flipped = spaceBelow < height + ANCHOR_GAP && rect.top >= height + ANCHOR_GAP;
    const top = flipped ? rect.top - ANCHOR_GAP - height : rect.bottom + ANCHOR_GAP;
    return { left, top, flipped };
  }
  function showDropdownMenu(anchor, items, onSelect) {
    if (current2 && current2.anchor === anchor) {
      const instance2 = current2;
      closeMenu(instance2, "toggle");
      return () => closeMenu(instance2, "api");
    }
    if (current2) closeMenu(current2, "replace");
    const menu = document.createElement("div");
    menu.id = "git-dropdown-menu";
    menu.className = "gm-popup";
    for (const item of items) {
      menu.appendChild(createRow(item));
    }
    document.body.appendChild(menu);
    const pos = computePosition(anchor, menu);
    menu.style.left = `${pos.left}px`;
    menu.style.top = `${pos.top}px`;
    const instance = {
      menu,
      anchor,
      closed: false,
      outsideTimer: null,
      onOutsideClick: () => {
      },
      onKeydown: () => {
      }
    };
    instance.onOutsideClick = (ev) => {
      if (!menu.isConnected) {
        document.removeEventListener("click", instance.onOutsideClick);
        return;
      }
      if (!menu.contains(ev.target)) {
        closeMenu(instance, "outside");
      }
    };
    instance.onKeydown = (ev) => {
      if (ev.key === "Escape") closeMenu(instance, "escape");
    };
    menu.addEventListener("click", (ev) => {
      const target = ev.target.closest("div");
      if (!target || target.parentElement !== menu) return;
      if (target.dataset.kind !== "item") return;
      if (target.dataset.disabled === "true") return;
      const id = target.dataset.id ?? "";
      logDropdown("select", { id });
      onSelect(id);
      closeMenu(instance, "select");
    });
    instance.outsideTimer = setTimeout(() => {
      instance.outsideTimer = null;
      document.addEventListener("click", instance.onOutsideClick);
    }, 0);
    document.addEventListener("keydown", instance.onKeydown);
    current2 = instance;
    logDropdown("open", { anchor: anchor.id || anchor.tagName, count: items.length });
    return () => closeMenu(instance, "api");
  }

  // panel/components/commit-list.ts
  function createCommitListPanel(container, service2, directory2, onCommitSelect, actions = {}) {
    let disposed = false;
    let listContainer = null;
    let toolbar = null;
    let filterTag = null;
    let unsubscribe = null;
    let unsubscribeDisplay = null;
    let searchHandle = null;
    let lastClickIndex = null;
    let filterBtnRefs = { regex: null, caseSensitive: null, branch: null, user: null, date: null, path: null };
    const findCommitFromEvent = (e) => {
      const target = e.target;
      const item = target.closest("[data-hash]");
      if (!item) return null;
      const hash = item.getAttribute("data-hash");
      if (!hash) return null;
      const state = getState();
      return state.filteredCommits.find((c) => c.hash === hash) || null;
    };
    const scrollToRow = (hash) => {
      if (!hash) return;
      const target = container.querySelector(`[data-hash="${hash}"]`);
      if (!target) return;
      if (typeof target.scrollIntoView === "function") {
        target.scrollIntoView({ block: "nearest" });
      } else {
        container.scrollTop = target.offsetTop;
      }
    };
    const gotoReference = (query) => {
      const state = getState();
      const keyword = query.toLowerCase();
      const hitCommit = state.allCommits.find((c) => c.hash.toLowerCase().startsWith(keyword));
      if (hitCommit) {
        setState((s) => {
          s.selectedCommit = hitCommit;
          s.selectedCommits = /* @__PURE__ */ new Set([hitCommit.hash]);
        });
        onCommitSelect(hitCommit);
        scrollToRow(hitCommit.hash);
        console.debug(JSON.stringify({ prefix: "[commit-list]", event: "goto_commit", hash: hitCommit.hash }));
        return true;
      }
      const hitBranch = state.branches.find((b) => b.name === query);
      if (hitBranch) {
        const branchCommit = (hitBranch.commit ? state.allCommits.find((c) => c.hash.startsWith(hitBranch.commit)) : void 0) ?? state.filteredCommits[0] ?? state.allCommits[0] ?? null;
        setState((s) => {
          s.logBranch = hitBranch.name;
          if (branchCommit) {
            s.selectedCommit = branchCommit;
            s.selectedCommits = /* @__PURE__ */ new Set([branchCommit.hash]);
          }
        });
        if (branchCommit) onCommitSelect(branchCommit);
        scrollToRow(branchCommit?.hash);
        console.debug(JSON.stringify({ prefix: "[commit-list]", event: "goto_branch", branchName: hitBranch.name }));
        return true;
      }
      console.debug(JSON.stringify({ prefix: "[commit-list]", event: "goto_not_found", query }));
      return false;
    };
    const updateFilterButtons = () => {
      const state = getState();
      const activeFlags = [
        [filterBtnRefs.regex, state.searchRegex],
        [filterBtnRefs.caseSensitive, state.searchCaseSensitive],
        [filterBtnRefs.branch, !!state.logBranch],
        [filterBtnRefs.user, !!state.filterAuthor],
        [filterBtnRefs.date, !!(state.filterDateFrom || state.filterDateTo)],
        [filterBtnRefs.path, state.filterPaths.length > 0]
      ];
      for (const [btn, active2] of activeFlags) {
        if (!btn) continue;
        btn.setAttribute("aria-pressed", String(active2));
      }
    };
    const syncBranchToggle = () => {
      const btn = toolbar?.querySelector('[data-action="btn-toggle-branches"]');
      if (!btn) return;
      const hidden = getState().branchPanelHidden;
      const title = hidden ? t("sidebar.showBranches") : t("sidebar.hideBranches");
      btn.setAttribute("title", title);
      btn.setAttribute("aria-label", title);
      btn.innerHTML = hidden ? getIcon("showBranches") : getIcon("hideBranches");
    };
    const render2 = () => {
      if (disposed) return;
      container.innerHTML = "";
      toolbar = html`
      <div class="gm-toolbar"></div>
    `;
      const branchHidden = getState().branchPanelHidden;
      const toggleTitle = branchHidden ? t("sidebar.showBranches") : t("sidebar.hideBranches");
      const branchToggle = html`
      <button type="button" class="gm-icon-btn" data-action="btn-toggle-branches" title="${toggleTitle}" aria-label="${toggleTitle}">
        ${branchHidden ? getIcon("showBranches") : getIcon("hideBranches")}
      </button>
    `;
      toolbar.appendChild(branchToggle);
      const searchWrap = html`
      <div class="gm-toolbar__search"></div>
    `;
      searchHandle = mountSearchField(searchWrap, {
        value: getState().commitSearch,
        placeholder: t("commit.searchPlaceholder"),
        label: t("commit.searchPlaceholder"),
        onChange: (value) => {
          setState((s) => {
            s.commitSearch = value;
          });
        }
      });
      searchWrap.querySelector("input")?.setAttribute("data-search-input", "");
      toolbar.appendChild(searchWrap);
      toolbar.insertAdjacentHTML("beforeend", `
      <button type="button" class="gm-filter-btn gm-filter-btn--code" data-action="btn-regex" aria-pressed="false" title="${t("filter.regex")}">.*</button>
      <button type="button" class="gm-filter-btn gm-filter-btn--code" data-action="btn-case" aria-pressed="false" title="${t("filter.case")}">Cc</button>
      <div class="gm-toolbar__divider"></div>
      <button type="button" class="gm-filter-btn" data-action="btn-filter-branch" aria-pressed="false">${t("filter.branch")} \u25BE</button>
      <button type="button" class="gm-filter-btn" data-action="btn-filter-user" aria-pressed="false">${t("filter.user")} \u25BE</button>
      <button type="button" class="gm-filter-btn" data-action="btn-filter-date" aria-pressed="false">${t("filter.date")} \u25BE</button>
      <button type="button" class="gm-filter-btn" data-action="btn-filter-path" aria-pressed="false">${t("filter.path")} \u25BE</button>
      <div class="gm-toolbar__divider"></div>
      <button type="button" class="gm-icon-btn" data-action="btn-locate" title="${t("sidebar.locate")}" aria-label="${t("sidebar.locate")}">${getIcon("locate")}</button>
      <button type="button" class="gm-icon-btn" data-action="btn-refresh" title="${t("sidebar.refresh")}" aria-label="${t("sidebar.refresh")}">${getIcon("refresh")}</button>
      <button type="button" class="gm-icon-btn" data-action="btn-cherry-pick" title="${t("commit.cherryPick")}" aria-label="${t("commit.cherryPick")}">${getIcon("cherryPick")}</button>
      <button type="button" class="gm-icon-btn" data-action="btn-settings" title="${t("settings.title")}" aria-label="${t("settings.title")}">${getIcon("gearSettings")}</button>
      <button type="button" class="gm-icon-btn" data-action="btn-goto" title="${t("goto.title")}" aria-label="${t("goto.title")}">${getIcon("search")}</button>
    `);
      const handleCherryPick = async () => {
        const state = getState();
        const hashes = state.selectedCommits.size > 0 ? state.filteredCommits.filter((c) => state.selectedCommits.has(c.hash)).map((c) => c.hash).reverse() : state.selectedCommit ? [state.selectedCommit.hash] : [];
        if (hashes.length === 0) {
          console.error(JSON.stringify({ prefix: "[commit-list]", event: "cherry_pick_no_selection" }));
          void host.toast({ kind: "error", message: t("commit.cherryPickNoSelection") }).catch((toastErr) => {
            console.error(JSON.stringify({ prefix: "[commit-list]", event: "cherry_pick_toast_error", error: String(toastErr) }));
          });
          return;
        }
        console.debug(JSON.stringify({ prefix: "[commit-list]", event: "cherry_pick_start", count: hashes.length, hashes }));
        try {
          for (const hash of hashes) {
            await service2.cherryPick(directory2, hash);
          }
          await refreshCommits(service2, directory2);
          console.debug(JSON.stringify({ prefix: "[commit-list]", event: "cherry_pick_done", count: hashes.length }));
          void host.toast({
            kind: "success",
            message: hashes.length > 1 ? t("commit.cherryPickDoneMulti", { n: hashes.length }) : t("commit.cherryPickDone", { hash: hashes[0].slice(0, 7) })
          }).catch(() => {
          });
        } catch (e) {
          const message = e instanceof Error ? e.message : String(e);
          console.error(JSON.stringify({
            prefix: "[commit-list]",
            event: "cherry_pick_error",
            hashes,
            error: message
          }));
          void host.toast({
            kind: "error",
            message: `${t("commit.cherryPickFailed")}: ${message}`,
            copy: true,
            dismiss: true
          }).catch((toastErr) => {
            console.error(JSON.stringify({ prefix: "[commit-list]", event: "cherry_pick_toast_error", error: String(toastErr) }));
          });
        }
      };
      toolbar.addEventListener("click", (e) => {
        const target = e.target.closest("[data-action]");
        if (!target) return;
        const action = target.getAttribute("data-action");
        if (action === "btn-refresh") refreshCommits(service2, directory2);
        else if (action === "btn-toggle-branches") actions.onToggleBranchPanel?.();
        else if (action === "btn-locate") actions.onLocateBranch?.();
        else if (action === "btn-regex") toggleRegex();
        else if (action === "btn-case") toggleCase();
        else if (action === "btn-filter-branch") openBranchDropdown(target);
        else if (action === "btn-filter-user") openUserDropdown(target);
        else if (action === "btn-filter-date") openDateDropdown(target);
        else if (action === "btn-filter-path") openPathDropdown(target);
        else if (action === "btn-cherry-pick") void handleCherryPick();
        else if (action === "btn-settings") showSettingsMenu(e);
        else if (action === "btn-goto") showGotoDialog(gotoReference);
      });
      container.appendChild(toolbar);
      filterBtnRefs = {
        regex: toolbar.querySelector('[data-action="btn-regex"]'),
        caseSensitive: toolbar.querySelector('[data-action="btn-case"]'),
        branch: toolbar.querySelector('[data-action="btn-filter-branch"]'),
        user: toolbar.querySelector('[data-action="btn-filter-user"]'),
        date: toolbar.querySelector('[data-action="btn-filter-date"]'),
        path: toolbar.querySelector('[data-action="btn-filter-path"]')
      };
      updateFilterButtons();
      renderFilterTag();
      listContainer = html`
      <div tabindex="0" class="gm-commit-list"></div>
    `;
      listContainer.addEventListener("keydown", (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "a") {
          e.preventDefault();
          const all = getState().filteredCommits.map((c) => c.hash);
          setState((s) => {
            s.selectedCommits = new Set(all);
          });
          console.debug(JSON.stringify({ prefix: "[commit-list]", event: "select_all", count: all.length }));
        }
      });
      let dragging = false;
      let dragStartIndex = -1;
      listContainer.addEventListener("mousedown", (e) => {
        if (e.button !== 0) return;
        const commit = findCommitFromEvent(e);
        if (!commit) return;
        const idx = getState().filteredCommits.findIndex((c) => c.hash === commit.hash);
        if (idx < 0) return;
        dragging = true;
        dragStartIndex = idx;
        listContainer?.focus();
      });
      listContainer.addEventListener("mousemove", (e) => {
        if (!dragging) return;
        const commit = findCommitFromEvent(e);
        if (!commit) return;
        const idx = getState().filteredCommits.findIndex((c) => c.hash === commit.hash);
        if (idx < 0) return;
        const start = Math.min(dragStartIndex, idx);
        const end = Math.max(dragStartIndex, idx);
        const range = getState().filteredCommits.slice(start, end + 1).map((c) => c.hash);
        setState((s) => {
          if (s.selectedCommits.size === range.length && range.every((h) => s.selectedCommits.has(h))) return;
          s.selectedCommits = new Set(range);
        });
      });
      const endDrag = () => {
        dragging = false;
        dragStartIndex = -1;
      };
      listContainer.addEventListener("mouseup", endDrag);
      listContainer.addEventListener("mouseleave", endDrag);
      window.addEventListener("mouseup", endDrag);
      listContainer.addEventListener("click", (e) => {
        const commit = findCommitFromEvent(e);
        if (!commit) return;
        const state = getState();
        const idx = state.filteredCommits.findIndex((c) => c.hash === commit.hash);
        if (e.shiftKey && lastClickIndex !== null && idx >= 0) {
          const start = Math.min(lastClickIndex, idx);
          const end = Math.max(lastClickIndex, idx);
          const range = state.filteredCommits.slice(start, end + 1).map((c) => c.hash);
          setState((s) => {
            s.selectedCommits = new Set(range);
            s.selectedCommit = commit;
          });
        } else if (e.ctrlKey || e.metaKey) {
          const next = new Set(state.selectedCommits);
          if (next.has(commit.hash)) {
            next.delete(commit.hash);
          } else {
            next.add(commit.hash);
          }
          setState((s) => {
            s.selectedCommits = next;
            s.selectedCommit = commit;
          });
          lastClickIndex = idx >= 0 ? idx : null;
        } else {
          setState((s) => {
            s.selectedCommits = /* @__PURE__ */ new Set([commit.hash]);
            s.selectedCommit = commit;
          });
          lastClickIndex = idx >= 0 ? idx : null;
        }
        onCommitSelect(commit);
      });
      listContainer.addEventListener("contextmenu", (e) => {
        const commit = findCommitFromEvent(e);
        if (!commit) return;
        e.preventDefault();
        const state = getState();
        let batch;
        if (state.selectedCommits.size > 1 && state.selectedCommits.has(commit.hash)) {
          batch = state.filteredCommits.filter((c) => state.selectedCommits.has(c.hash)).map((c) => c.hash).reverse();
        }
        const { clientX, clientY } = e;
        void service2.isWorkingTreeClean(directory2).catch(() => false).then((clean) => {
          const anchor = { clientX, clientY };
          showCommitContextMenu(anchor, commit, service2, directory2, batch, !clean);
        });
      });
      container.appendChild(listContainer);
      renderList();
      if (unsubscribe) unsubscribe();
      unsubscribe = subscribeFields(
        [
          "filteredCommits",
          "branches",
          "logBranch",
          "selectedCommit",
          "selectedCommits",
          "commitSearch",
          "sortMode",
          "filterAuthor",
          "filterDateFrom",
          "filterDateTo",
          // filterPaths 按引用比较即内容变化：所有写入方均为整体替换新数组（从不原地变异），
          // 对话框应用另有深比较守卫阻止"同内容新引用"写入，故引用不同 = 内容确实变化
          "filterPaths",
          "searchRegex",
          "searchCaseSensitive",
          "branchPanelHidden"
        ],
        (changed) => {
          if (disposed) return;
          console.debug(JSON.stringify({ prefix: "[commit-list]", event: "sub_changed", changed }));
          updateFilterButtons();
          if (changed.includes("branchPanelHidden")) syncBranchToggle();
          if (changed.includes("commitSearch")) {
            searchHandle?.update({ value: getState().commitSearch });
          }
          if (changed.includes("searchRegex") || changed.includes("searchCaseSensitive")) {
            filterCommits();
          }
          if (changed.includes("logBranch")) {
            lastClickIndex = null;
          }
          if (changed.includes("logBranch") || changed.includes("sortMode")) {
            renderFilterTag();
          }
          if (changed.includes("commitSearch")) {
            filterCommits();
            return;
          }
          if (changed.includes("sortMode")) {
            console.debug(JSON.stringify({ prefix: "[commit-list]", event: "sort_changed", sortMode: getState().sortMode }));
            filterCommits();
            return;
          }
          if (changed.includes("filteredCommits") || changed.includes("branches") || changed.includes("selectedCommit") || changed.includes("selectedCommits")) {
            const current3 = getState();
            if (changed.includes("filteredCommits") && current3.sortMode !== "default" && !isSortedCommits(current3.filteredCommits, current3.sortMode)) {
              console.debug(JSON.stringify({ prefix: "[commit-list]", event: "sort_realign", sortMode: current3.sortMode }));
              setState((s) => {
                s.filteredCommits = sortCommits(s.filteredCommits, s.sortMode);
              });
              return;
            }
            console.debug(JSON.stringify({ prefix: "[commit-list]", event: "render_list", count: getState().filteredCommits.length }));
            renderList();
          }
        }
      );
      if (unsubscribeDisplay) unsubscribeDisplay();
      let prevDisplay = { ...getState().displaySettings };
      unsubscribeDisplay = subscribeState(() => {
        const settings = getState().displaySettings;
        const changed = Object.keys(settings).some((k) => settings[k] !== prevDisplay[k]);
        if (!changed) return;
        prevDisplay = { ...settings };
        if (disposed) return;
        console.debug(JSON.stringify({ prefix: "[commit-list]", event: "display_changed", settings: prevDisplay }));
        renderList();
      });
    };
    const renderFilterTag = () => {
      if (!toolbar) return;
      if (filterTag) {
        filterTag.remove();
        filterTag = null;
      }
      const state = getState();
      const hasSort = state.sortMode !== "default";
      if (!hasSort) return;
      const sortLabelKey = {
        "date-asc": "sort.dateAsc",
        "author-asc": "sort.authorAsc",
        "message-asc": "sort.messageAsc"
      };
      const sortTag = html`
      <span class="gm-filter-tag">
        <span class="gm-filter-tag__label">${t(sortLabelKey[state.sortMode])}</span>
        <span data-action="btn-clear-sort" class="gm-filter-tag__clear">×</span>
      </span>
    `;
      filterTag = html`
      <span class="gm-filter-tag-wrap">
        ${sortTag}
      </span>
    `;
      filterTag.addEventListener("click", (e) => {
        const target = e.target.closest("[data-action]");
        if (!target) return;
        const action = target.getAttribute("data-action");
        if (action === "btn-clear-sort") setState((s) => {
          s.sortMode = "default";
        });
      });
      toolbar.appendChild(filterTag);
    };
    const openBranchDropdown = (anchor) => {
      const state = getState();
      const isFav = (b) => !b.isCurrent && state.favorites.has(b.name);
      const localBranches = state.branches.filter((b) => !b.isRemote && !isFav(b));
      const remoteBranches = state.branches.filter((b) => b.isRemote && !isFav(b));
      const favoriteBranches = state.branches.filter((b) => isFav(b));
      const items = [
        { id: "all", label: t("filter.all"), checked: state.logBranch === null },
        { id: "sep-branch", label: "", kind: "separator" }
      ];
      const pushGroup = (labelKey, groupId, branches) => {
        if (branches.length === 0) return;
        items.push({ id: groupId, label: t(labelKey), kind: "group" });
        for (const b of branches) {
          items.push({ id: b.name, label: b.name, checked: state.logBranch === b.name });
        }
      };
      pushGroup("filter.localBranches", "group-local", localBranches);
      pushGroup("filter.remoteBranches", "group-remote", remoteBranches);
      pushGroup("filter.favorites", "group-favorites", favoriteBranches);
      showDropdownMenu(anchor, items, (id) => {
        console.debug(JSON.stringify({
          prefix: "[commit-list]",
          event: "branch_dropdown_select",
          branch: id === "all" ? null : id
        }));
        if (id === "all") {
          setState((s) => {
            s.logBranch = null;
            s.selectedBranch = null;
            s.selectedCommits = /* @__PURE__ */ new Set();
          });
        } else {
          const branch = getState().branches.find((b) => b.name === id) ?? null;
          setState((s) => {
            s.logBranch = id;
            s.selectedBranch = branch;
            s.selectedCommits = /* @__PURE__ */ new Set();
          });
        }
        void refreshCommits(service2, directory2);
      });
    };
    const openUserDropdown = (anchor) => {
      const state = getState();
      const authors = [...new Set(state.allCommits.map((c) => c.authorName))].sort();
      const items = [
        { id: "all", label: t("filter.all"), checked: state.filterAuthor === "" }
      ];
      for (const name of authors) {
        items.push({ id: name, label: name, checked: state.filterAuthor === name });
      }
      showDropdownMenu(anchor, items, (id) => {
        const author = id === "all" ? "" : id;
        console.debug(JSON.stringify({
          prefix: "[commit-list]",
          event: "user_dropdown_select",
          author
        }));
        setState((s) => {
          s.filterAuthor = author;
        });
        filterCommits();
      });
    };
    const openDateDropdown = (anchor) => {
      const state = getState();
      const now = /* @__PURE__ */ new Date();
      const presets = ["today", "thisWeek", "thisMonth", "thisYear"];
      const presetLabelKey = {
        today: "filter.today",
        thisWeek: "filter.thisWeek",
        thisMonth: "filter.thisMonth",
        thisYear: "filter.thisYear"
      };
      const items = [
        {
          id: "all",
          label: t("filter.all"),
          checked: state.filterDateFrom === "" && state.filterDateTo === ""
        }
      ];
      for (const preset of presets) {
        const range = computeDateRange(preset, now);
        items.push({
          id: preset,
          label: t(presetLabelKey[preset]),
          checked: state.filterDateFrom === range.from && state.filterDateTo === range.to
        });
      }
      items.push({ id: "sep-date", label: "", kind: "separator" });
      items.push({ id: "custom", label: t("filter.custom") });
      showDropdownMenu(anchor, items, (id) => {
        console.debug(JSON.stringify({
          prefix: "[commit-list]",
          event: "date_dropdown_select",
          preset: id
        }));
        if (id === "custom") {
          showDateRangeDialog((range) => {
            setState((s) => {
              s.filterDateFrom = range.from;
              s.filterDateTo = range.to;
            });
            filterCommits();
          });
          return;
        }
        if (id === "all") {
          setState((s) => {
            s.filterDateFrom = "";
            s.filterDateTo = "";
          });
        } else {
          const range = computeDateRange(
            id,
            /* @__PURE__ */ new Date()
          );
          setState((s) => {
            s.filterDateFrom = range.from;
            s.filterDateTo = range.to;
          });
        }
        filterCommits();
      });
    };
    const openPathDropdown = (anchor) => {
      const current3 = getState().filterPaths;
      const items = [
        { id: "all", label: t("filter.all"), checked: !current3.length }
      ];
      for (const path of current3) {
        items.push({ id: `p:${path}`, label: path, checked: true });
      }
      items.push({ id: "sep-path", label: "", kind: "separator" });
      items.push({ id: "pick", label: t("filter.chooseFolder") });
      items.push({ id: "edit", label: t("filter.editPaths") });
      showDropdownMenu(anchor, items, (id) => {
        if (id === "all") {
          console.debug(JSON.stringify({
            prefix: "[commit-list]",
            event: "path_dropdown_select",
            path: []
          }));
          setState((s) => {
            s.filterPaths = [];
          });
          void refreshCommits(service2, directory2);
          return;
        }
        if (id.startsWith("p:")) {
          const path = id.slice(2);
          const next = getState().filterPaths.filter((p) => p !== path);
          console.debug(JSON.stringify({
            prefix: "[commit-list]",
            event: "path_dropdown_select",
            path: next
          }));
          setState((s) => {
            s.filterPaths = next;
          });
          void refreshCommits(service2, directory2);
          return;
        }
        if (id === "pick" || id === "edit") {
          const snapshot = [...getState().filterPaths];
          const onApply = (paths) => {
            if (samePaths(paths, snapshot)) return;
            console.debug(JSON.stringify({
              prefix: "[commit-list]",
              event: "path_dropdown_select",
              path: paths
            }));
            setState((s) => {
              s.filterPaths = [...paths];
            });
            void refreshCommits(service2, directory2);
          };
          if (id === "pick") {
            showPathTreeDialog(service2, directory2, snapshot, onApply);
          } else {
            showPathFilterDialog(snapshot, onApply);
          }
        }
      });
    };
    const renderList = () => {
      if (disposed || !listContainer) return;
      const state = getState();
      listContainer.innerHTML = "";
      const commits = state.filteredCommits;
      if (commits.length === 0) {
        listContainer.innerHTML = `<div class="gm-empty">${t("commit.empty")}</div>`;
        return;
      }
      const branchMap = /* @__PURE__ */ new Map();
      for (const branch of state.branches) {
        if (!branch.commit) continue;
        const existing = branchMap.get(branch.commit) ?? [];
        existing.push(branch.name);
        branchMap.set(branch.commit, existing);
      }
      for (const commit of commits) {
        const branches = [];
        for (const [shortHash, names] of branchMap) {
          if (commit.hash.startsWith(shortHash)) branches.push(...names);
        }
        const item = createCommitItem(commit, branches);
        listContainer.appendChild(item);
      }
    };
    const dispose = () => {
      disposed = true;
      if (unsubscribe) {
        unsubscribe();
        unsubscribe = null;
      }
      if (unsubscribeDisplay) {
        unsubscribeDisplay();
        unsubscribeDisplay = null;
      }
      searchHandle?.dispose();
      searchHandle = null;
    };
    render2();
    return { dispose };
  }
  function createCommitItem(commit, branches = []) {
    const state = getState();
    const settings = state.displaySettings;
    const isSelected = state.selectedCommits.has(commit.hash) || state.selectedCommit?.hash === commit.hash;
    const renderRef = (name, isTag) => {
      const isLocal = !isTag && !name.includes("/") && name !== "HEAD";
      const kind = isTag ? "tag" : isLocal ? "local" : "remote";
      const label = isTag && !settings.showTagNames ? "" : name;
      return `<span data-ref="${name}" class="gm-ref gm-ref--${kind}">${label}</span>`;
    };
    const refs = branches.map((b) => ({ name: b, isTag: b.startsWith("tag:") }));
    const branchTags = (() => {
      if (refs.length === 0) return "";
      if (settings.compactReferences) {
        const first = refs[0];
        return renderRef(first.name, first.isTag);
      }
      return refs.map((r) => renderRef(r.name, r.isTag)).join("");
    })();
    const hashCol = settings.showHash ? `<span data-col="hash" class="gm-commit-row__hash">${escapeText(commit.shortHash)}</span>` : "";
    const dateCol = settings.showDate ? `<span data-col="date" class="gm-commit-row__date">${formatDate(
      settings.preferCommitDate && commit.commitDate ? commit.commitDate : commit.date
    )}</span>` : "";
    const authorCol = settings.showAuthor ? `<span data-col="author" class="gm-commit-row__author">${escapeText(commit.authorName)}</span>` : "";
    const item = html`
    <div
      class="gm-commit-row${settings.showDate ? "" : " gm-commit-row--no-date"}"
      data-hash="${commit.hash}"
      aria-selected="${isSelected ? "true" : "false"}"
    >
      <span class="gm-commit-row__dot">
        <svg width="10" height="10" viewBox="0 0 10 10" aria-hidden="true"><circle cx="5" cy="5" r="4" fill="currentColor"/></svg>
      </span>
      ${hashCol}
      ${settings.referencesOnLeft ? branchTags : ""}
      <span class="gm-commit-row__message">${commit.message}</span>
      ${settings.referencesOnLeft ? "" : branchTags}
      ${dateCol}
      ${authorCol}
    </div>
  `;
    return item;
  }
  function escapeText(str) {
    return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }
  function compareCommits(a, b, mode) {
    const dateA = new Date(a.date).getTime();
    const dateB = new Date(b.date).getTime();
    if (mode === "date-asc") {
      return dateA - dateB;
    }
    if (mode === "author-asc") {
      return a.authorName.localeCompare(b.authorName) || dateB - dateA;
    }
    if (mode === "message-asc") {
      return a.message.localeCompare(b.message) || dateB - dateA;
    }
    return 0;
  }
  function sortCommits(commits, mode) {
    if (mode === "default") return [...commits];
    return [...commits].sort((a, b) => compareCommits(a, b, mode));
  }
  function isSortedCommits(commits, mode) {
    if (mode === "default") return true;
    for (let i = 1; i < commits.length; i++) {
      if (compareCommits(commits[i - 1], commits[i], mode) > 0) return false;
    }
    return true;
  }
  function matchesSearch(text, pattern, caseSensitive, regex) {
    if (regex) {
      try {
        const re = new RegExp(pattern, caseSensitive ? "" : "i");
        return re.test(text);
      } catch (e) {
        console.error(JSON.stringify({
          prefix: "[commit-list]",
          event: "regex_invalid",
          error: String(e)
        }));
        return caseSensitive ? text.includes(pattern) : text.toLowerCase().includes(pattern.toLowerCase());
      }
    }
    return caseSensitive ? text.includes(pattern) : text.toLowerCase().includes(pattern.toLowerCase());
  }
  function samePaths(a, b) {
    if (a.length !== b.length) return false;
    return a.every((path, index) => path === b[index]);
  }
  function computeDateRange(preset, now) {
    const y = now.getFullYear();
    const m = now.getMonth();
    const d = now.getDate();
    let start;
    let end;
    if (preset === "today") {
      start = new Date(y, m, d, 0, 0, 0, 0);
      end = new Date(y, m, d, 23, 59, 59, 999);
    } else if (preset === "thisWeek") {
      const offset = (now.getDay() + 6) % 7;
      start = new Date(y, m, d - offset, 0, 0, 0, 0);
      end = new Date(y, m, d - offset + 6, 23, 59, 59, 999);
    } else if (preset === "thisMonth") {
      start = new Date(y, m, 1, 0, 0, 0, 0);
      end = new Date(y, m + 1, 0, 23, 59, 59, 999);
    } else {
      start = new Date(y, 0, 1, 0, 0, 0, 0);
      end = new Date(y, 11, 31, 23, 59, 59, 999);
    }
    return { from: start.toISOString(), to: end.toISOString() };
  }
  function filterCommits() {
    const state = getState();
    let commits = [...state.allCommits];
    if (state.commitSearch) {
      commits = commits.filter(
        (c) => matchesSearch(c.message, state.commitSearch, state.searchCaseSensitive, state.searchRegex) || matchesSearch(c.shortHash, state.commitSearch, state.searchCaseSensitive, state.searchRegex) || matchesSearch(c.authorName, state.commitSearch, state.searchCaseSensitive, state.searchRegex)
      );
    }
    if (state.filterAuthor) {
      commits = commits.filter((c) => c.authorName === state.filterAuthor);
    }
    if (state.filterDateFrom) {
      commits = commits.filter((c) => new Date(c.date) >= new Date(state.filterDateFrom));
    }
    if (state.filterDateTo) {
      commits = commits.filter((c) => new Date(c.date) <= new Date(state.filterDateTo));
    }
    setState((s) => {
      s.filteredCommits = sortCommits(commits, state.sortMode);
    });
  }
  async function refreshCommits(service2, directory2) {
    const state = getState();
    const branch = state.logBranch || void 0;
    const paths = state.filterPaths.length ? [...state.filterPaths] : void 0;
    try {
      const commits = await service2.getLog(directory2, branch, paths);
      setState((s) => {
        s.allCommits = commits;
        s.filteredCommits = commits;
      });
      filterCommits();
    } catch (e) {
      showOperationError(e, "commit.loadListFailed", "[commit-list]", "refresh_commits_error");
    }
  }
  function toggleRegex() {
    setState((s) => {
      s.searchRegex = !s.searchRegex;
    });
    filterCommits();
    console.debug(JSON.stringify({
      prefix: "[commit-list]",
      event: "search_regex_toggled",
      value: getState().searchRegex
    }));
  }
  function toggleCase() {
    setState((s) => {
      s.searchCaseSensitive = !s.searchCaseSensitive;
    });
    filterCommits();
    console.debug(JSON.stringify({
      prefix: "[commit-list]",
      event: "search_case_toggled",
      value: getState().searchCaseSensitive
    }));
  }
  function formatDate(dateStr) {
    const date = new Date(dateStr);
    const now = /* @__PURE__ */ new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMin = Math.floor(diffMs / 6e4);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);
    if (diffMin < 1) return t("time.justNow");
    if (diffMin < 60) return t("time.minutesAgo", { n: diffMin });
    if (diffHour < 24) return t("time.hoursAgo", { n: diffHour });
    if (diffDay < 7) return t("time.daysAgo", { n: diffDay });
    return date.toLocaleDateString(getLang());
  }

  // panel/components/file-context-menu.ts
  function hideFileContextMenu() {
    const existing = document.getElementById("git-file-context-menu");
    if (existing) existing.remove();
  }
  function showFileContextMenu(e, fileDiff, _service, _directory) {
    hideFileContextMenu();
    const items = [
      {
        label: t("file.showDiff"),
        action: () => {
          console.log("[git-manager] Show Diff:", fileDiff.path);
        }
      },
      {
        label: t("file.showDiffNew"),
        action: () => {
          console.log("[git-manager] Show Diff in New Window:", fileDiff.path);
        }
      },
      { type: "separator" },
      {
        label: t("file.compareLocal"),
        action: () => {
          console.log("[git-manager] Compare with Local:", fileDiff.path);
        }
      },
      {
        label: t("file.compareBeforeLocal"),
        action: () => {
          console.log("[git-manager] Compare Before with Local:", fileDiff.path);
        }
      },
      { type: "separator" },
      {
        label: t("file.editSource"),
        action: () => {
          console.log("[git-manager] Edit Source:", fileDiff.path);
        }
      },
      {
        label: t("file.openRepoVersion"),
        action: () => {
          console.log("[git-manager] Open Repository Version:", fileDiff.path);
        }
      },
      { type: "separator" },
      {
        label: t("file.revertChanges"),
        danger: true,
        action: async () => {
          console.log("[git-manager] Revert Selected Changes:", fileDiff.path);
        }
      },
      {
        label: t("file.cherryPickChanges"),
        action: async () => {
          console.log("[git-manager] Cherry-Pick Selected Changes:", fileDiff.path);
        }
      },
      { type: "separator" },
      {
        label: t("file.createPatch"),
        action: () => {
          console.log("[git-manager] Create Patch:", fileDiff.path);
        }
      },
      {
        label: t("file.getFromRevision"),
        action: () => {
          console.log("[git-manager] Get from Revision:", fileDiff.path);
        }
      },
      {
        label: t("file.historyUpTo"),
        action: () => {
          console.log("[git-manager] History Up to Here:", fileDiff.path);
        }
      }
    ];
    const menu = html`
    <div id="git-file-context-menu" class="gm-popup gm-popup--wide"></div>
  `;
    menu.style.left = `${e.clientX}px`;
    menu.style.top = `${e.clientY}px`;
    for (const item of items) {
      if ("type" in item && item.type === "separator") {
        const sep = document.createElement("div");
        sep.className = "gm-popup__sep";
        menu.appendChild(sep);
        continue;
      }
      const menuItem = item;
      const el2 = document.createElement("div");
      el2.className = menuItem.danger ? "gm-menu-item gm-menu-item--destructive" : "gm-menu-item";
      el2.dataset.disabled = "false";
      el2.textContent = menuItem.label;
      menu.appendChild(el2);
    }
    menu.addEventListener("click", async (ev) => {
      const target = ev.target.closest("div");
      if (!target || target.parentElement !== menu) return;
      const label = target.textContent;
      const item = items.find((i) => !("type" in i) && i.label === label);
      if (!item) return;
      hideFileContextMenu();
      await item.action();
    });
    document.body.appendChild(menu);
    const closeHandler2 = (ev) => {
      if (!menu.contains(ev.target)) {
        hideFileContextMenu();
        document.removeEventListener("click", closeHandler2);
      }
    };
    setTimeout(() => document.addEventListener("click", closeHandler2), 0);
  }

  // panel/syntax.ts
  var KEYWORDS = /* @__PURE__ */ new Set([
    // JS/TS
    "const",
    "let",
    "var",
    "function",
    "return",
    "if",
    "else",
    "for",
    "while",
    "of",
    "in",
    "import",
    "from",
    "export",
    "default",
    "class",
    "extends",
    "new",
    "await",
    "async",
    "try",
    "catch",
    "finally",
    "throw",
    "switch",
    "case",
    "break",
    "continue",
    "typeof",
    "instanceof",
    "interface",
    "type",
    "enum",
    "implements",
    "public",
    "private",
    "readonly",
    "static",
    "this",
    "null",
    "undefined",
    "true",
    "false",
    "void",
    "yield",
    "super",
    // Python / shell / git-adjacent
    "def",
    "elif",
    "None",
    "True",
    "False",
    "and",
    "or",
    "not",
    "with",
    "as",
    "lambda",
    "pass",
    "raise",
    "global",
    "then",
    "fi",
    "do",
    "done",
    "echo",
    "local"
  ]);
  var TYPE_HINT = /^[A-Z][A-Za-z0-9_]*$/;
  function escapeHtml(text) {
    return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
  }
  var TOKEN = new RegExp([
    // line comment, block comment fragment, string, number, identifier, operator
    "(?<com>\\/\\/[^\\n]*|\\/\\*[^*]*\\*?\\/?|#[^\\n]*|--[^\\n]*)",
    "(?<str>\"(?:[^\"\\\\]|\\\\.)*\"?|'(?:[^'\\\\]|\\\\.)*'?|`(?:[^`\\\\]|\\\\.)*`?)",
    "(?<num>\\b\\d[\\w.]*\\b)",
    "(?<ident>[A-Za-z_$][\\w$]*)",
    "(?<op>[=+\\-*/<>!&|%^~?:;,.()\\[\\]{}]+)"
  ].join("|"), "g");
  function highlightLine(text) {
    if (!text) return "<span></span>";
    let out = "";
    let last = 0;
    TOKEN.lastIndex = 0;
    let match;
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
        const isCall = text[match.index + value.length] === "(";
        const kind = KEYWORDS.has(value) ? "kw" : isCall ? "fn" : TYPE_HINT.test(value) ? "type" : null;
        out += kind ? `<span class="gm-tok gm-tok--${kind}">${escapeHtml(value)}</span>` : escapeHtml(value);
      } else {
        out += `<span class="gm-tok gm-tok--op">${escapeHtml(value)}</span>`;
      }
      last = match.index + value.length;
    }
    if (last < text.length) {
      out += escapeHtml(text.slice(last));
    }
    return `<span>${out}</span>`;
  }

  // panel/components/splitter.ts
  var KEY_STEP = 8;
  var KEY_STEP_LARGE = 32;
  function createSplitter(options) {
    const vertical = options.axis === "x";
    const el2 = html`
    <div
      class="gm-splitter gm-splitter--${vertical ? "x" : "y"}"
      role="separator"
      tabindex="0"
      aria-orientation="${vertical ? "vertical" : "horizontal"}"
      aria-label="${t("layout.resizeDivider")}"
    ></div>
  `;
    let dragging = false;
    let pointerId = -1;
    let origin = 0;
    let startSize = 0;
    let currentSize = 0;
    const bounds = () => {
      const min = Math.max(1, Math.round(options.min()));
      const max = Math.max(min, Math.round(options.max()));
      return { min, max };
    };
    const clamp = (px) => {
      const { min, max } = bounds();
      return Math.round(Math.min(max, Math.max(min, px)));
    };
    const syncAria = () => {
      const { min, max } = bounds();
      el2.setAttribute("aria-valuemin", String(min));
      el2.setAttribute("aria-valuemax", String(max));
      el2.setAttribute("aria-valuenow", String(clamp(options.value())));
    };
    const move = (event) => {
      if (!dragging) return;
      event.preventDefault();
      const pointer = vertical ? event.clientX : event.clientY;
      currentSize = clamp(startSize + (pointer - origin) * options.sign);
      options.onResize(currentSize);
      syncAria();
    };
    const finish = () => {
      if (!dragging) return;
      dragging = false;
      window.removeEventListener("pointermove", moveListener);
      window.removeEventListener("pointerup", endListener);
      window.removeEventListener("pointercancel", endListener);
      el2.classList.remove("gm-splitter--active");
      document.documentElement.classList.remove("gm-splitter-dragging");
      document.documentElement.classList.remove("gm-splitter-dragging--x");
      document.documentElement.classList.remove("gm-splitter-dragging--y");
      try {
        el2.releasePointerCapture(pointerId);
      } catch {
      }
      options.onCommit(currentSize);
    };
    const moveListener = (event) => {
      move(event);
    };
    const endListener = () => {
      finish();
    };
    el2.addEventListener("pointerdown", (event) => {
      const pointer = event;
      if (pointer.button !== 0) return;
      event.preventDefault();
      dragging = true;
      pointerId = pointer.pointerId;
      origin = vertical ? pointer.clientX : pointer.clientY;
      startSize = options.value();
      currentSize = clamp(startSize);
      el2.classList.add("gm-splitter--active");
      document.documentElement.classList.add("gm-splitter-dragging");
      document.documentElement.classList.add(vertical ? "gm-splitter-dragging--x" : "gm-splitter-dragging--y");
      try {
        el2.setPointerCapture(pointer.pointerId);
      } catch {
      }
      window.addEventListener("pointermove", moveListener);
      window.addEventListener("pointerup", endListener);
      window.addEventListener("pointercancel", endListener);
    });
    el2.addEventListener("keydown", (event) => {
      const { min, max } = bounds();
      let next = null;
      if (event.key === "Home") {
        next = min;
      } else if (event.key === "End") {
        next = max;
      } else {
        const step = event.shiftKey ? KEY_STEP_LARGE : KEY_STEP;
        const grow = vertical ? "ArrowRight" : "ArrowDown";
        const shrink = vertical ? "ArrowLeft" : "ArrowUp";
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
    el2.addEventListener("focus", syncAria);
    syncAria();
    return el2;
  }

  // panel/layout.ts
  var DEFAULT_LAYOUT = {
    branches: 280,
    side: 300,
    filesPreview: 120,
    filesPane: 0,
    bottom: 220
  };
  var LAYOUT_LIMITS = {
    branches: { min: 160, max: 640 },
    side: { min: 220, max: 900 },
    filesPreview: { min: 40, max: 2e3 },
    filesPane: { min: 80, max: 4e3 },
    bottom: { min: 120, max: 900 }
  };
  var STORAGE_KEY = "layout.v1";
  var SIZE_KEYS = Object.keys(DEFAULT_LAYOUT);
  function clampLayoutSize(key, value) {
    if (!Number.isFinite(value)) return DEFAULT_LAYOUT[key];
    if (key === "filesPane" && value === 0) return 0;
    const { min, max } = LAYOUT_LIMITS[key];
    return Math.round(Math.min(max, Math.max(min, value)));
  }
  function parseLayout(value) {
    const next = { ...DEFAULT_LAYOUT };
    if (!value || typeof value !== "object") return next;
    const stored = value;
    for (const key of SIZE_KEYS) {
      const raw = stored[key];
      if (typeof raw === "number" && Number.isFinite(raw)) {
        next[key] = clampLayoutSize(key, raw);
      }
    }
    return next;
  }
  function serializeLayout(sizes2) {
    return {
      branches: sizes2.branches,
      side: sizes2.side,
      filesPreview: sizes2.filesPreview,
      filesPane: sizes2.filesPane,
      bottom: sizes2.bottom
    };
  }
  var sizes = { ...DEFAULT_LAYOUT };
  var storage = null;
  function getLayout() {
    return sizes;
  }
  function applyLayout() {
    let branches = sizes.branches;
    let side = sizes.side;
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
    const root2 = document.documentElement;
    root2.style.setProperty("--gm-branches-w", `${branches}px`);
    root2.style.setProperty("--gm-side-w", `${side}px`);
    root2.style.setProperty("--gm-preview-h", `${sizes.filesPreview}px`);
    root2.style.setProperty("--gm-bottom-h", `${sizes.bottom}px`);
    if (sizes.filesPane > 0) {
      root2.style.setProperty("--gm-files-pane-h", `${sizes.filesPane}px`);
    } else {
      root2.style.removeProperty("--gm-files-pane-h");
    }
  }
  function setLayoutSize(key, value) {
    sizes = { ...sizes, [key]: clampLayoutSize(key, value) };
    applyLayout();
    return sizes[key];
  }
  function bindLayoutStorage(next) {
    storage = next;
  }
  async function loadLayout() {
    if (!storage) return;
    try {
      sizes = parseLayout(await storage.get(STORAGE_KEY));
      applyLayout();
    } catch (e) {
      console.warn(JSON.stringify({ prefix: "[layout]", event: "load_failed", error: String(e) }));
    }
  }
  function commitLayout() {
    if (!storage) return;
    void storage.set(STORAGE_KEY, serializeLayout(sizes)).catch((e) => {
      console.warn(JSON.stringify({ prefix: "[layout]", event: "save_failed", error: String(e) }));
    });
  }

  // panel/components/file-diff.ts
  function createFileDiffPanel(container, service2, directory2) {
    let disposed = false;
    let listContainer = null;
    let previewContainer = null;
    let selectedPath = null;
    let unsubscribe = null;
    let titleEl = null;
    const findPathFromEvent = (e) => {
      const target = e.target;
      const item = target.closest("[data-path]");
      if (!item) return null;
      return item.getAttribute("data-path");
    };
    const paintSelection = (path) => {
      listContainer?.querySelectorAll("[data-path]").forEach((el2) => {
        el2.setAttribute("aria-selected", String(el2.getAttribute("data-path") === path));
      });
    };
    const renderPreview = (diff) => {
      if (!previewContainer) return;
      previewContainer.innerHTML = "";
      if (!diff) {
        previewContainer.innerHTML = `<div class="gm-empty">${t("file.selectDiff")}</div>`;
        return;
      }
      const title = html`
      <div class="gm-diff__file">${diff.path}</div>
    `;
      previewContainer.appendChild(title);
      const diffContent = html`
      <div class="gm-diff__body"></div>
    `;
      if (diff.lines && diff.lines.length > 0) {
        for (const line of diff.lines) {
          diffContent.appendChild(createDiffLine(line));
        }
      } else {
        diffContent.innerHTML = `<div class="gm-empty">${t("file.noDiff")}</div>`;
      }
      previewContainer.appendChild(diffContent);
    };
    const render2 = () => {
      if (disposed) return;
      container.innerHTML = "";
      const state = getState();
      titleEl = html`
      <div class="gm-pane-header">
        ${t("file.changedFiles")}
        <span class="gm-pane-header__count" data-file-count>${state.diffs.length}</span>
      </div>
    `;
      container.appendChild(titleEl);
      const splitArea = html`
      <div class="gm-diff"></div>
    `;
      listContainer = html`
      <div class="gm-file-list"></div>
    `;
      listContainer.addEventListener("click", (e) => {
        const path = findPathFromEvent(e);
        if (!path) return;
        selectedPath = path;
        const diff = getState().diffs.find((d) => d.path === path) || null;
        renderPreview(diff);
        paintSelection(path);
      });
      listContainer.addEventListener("contextmenu", (e) => {
        const path = findPathFromEvent(e);
        if (path) {
          e.preventDefault();
          const diff = getState().diffs.find((d) => d.path === path);
          if (diff) showFileContextMenu(e, diff, service2, directory2);
        }
      });
      splitArea.appendChild(listContainer);
      previewContainer = html`
      <div class="gm-diff__preview"></div>
    `;
      const previewSplitter = createSplitter({
        axis: "y",
        sign: -1,
        value: () => Math.round(previewContainer?.getBoundingClientRect().height ?? 0) || getLayout().filesPreview,
        min: () => 40,
        max: () => Math.max(40, splitArea.clientHeight - 65),
        onResize: (px) => {
          setLayoutSize("filesPreview", px);
        },
        onCommit: () => {
          commitLayout();
        }
      });
      splitArea.appendChild(previewSplitter);
      splitArea.appendChild(previewContainer);
      container.appendChild(splitArea);
      renderFileList();
      renderPreview(null);
      if (unsubscribe) unsubscribe();
      unsubscribe = subscribeFields(["diffs"], () => {
        if (disposed) return;
        updateTitleCount();
        selectedPath = null;
        renderFileList();
        renderPreview(null);
      });
    };
    const updateTitleCount = () => {
      if (!titleEl) return;
      const count = getState().diffs.length;
      const span = titleEl.querySelector("[data-file-count]");
      if (span) span.textContent = String(count);
    };
    const renderFileList = () => {
      if (!listContainer) return;
      const state = getState();
      listContainer.innerHTML = "";
      if (state.diffs.length === 0) {
        listContainer.innerHTML = `<div class="gm-empty">${t("file.noChanges")}</div>`;
        return;
      }
      for (const diff of state.diffs) {
        listContainer.appendChild(createFileDiffItem(diff));
      }
      paintSelection(selectedPath);
    };
    const dispose = () => {
      disposed = true;
      if (unsubscribe) {
        unsubscribe();
        unsubscribe = null;
      }
    };
    render2();
    return { dispose };
  }
  function createDiffLine(line) {
    const isAdd = line.type === "add";
    const isDelete = line.type === "delete";
    const type = isAdd ? "add" : isDelete ? "delete" : "context";
    const prefix = isAdd ? "+" : isDelete ? "-" : " ";
    const lineNum = line.newLine !== void 0 ? String(line.newLine) : " ";
    const oldNum = line.oldLine !== void 0 ? String(line.oldLine) : " ";
    return html`
    <div class="gm-diff__line" data-type="${type}">
      <span class="gm-diff__num">${oldNum}</span>
      <span class="gm-diff__num">${lineNum}</span>
      <span class="gm-diff__sign">${prefix}</span>
      <span class="gm-diff__text">${highlightLine(line.content)}</span>
    </div>
  `;
  }
  function createFileDiffItem(diff) {
    const statusLabel = getStatusLabel(diff.path);
    return html`
    <div
      class="gm-file-item"
      data-path="${diff.path}"
      aria-selected="false"
    >
      <span class="gm-file-item__status" data-kind="${statusLabel}">${statusLabel}</span>
      <span class="gm-file-item__path">${diff.path}</span>
      <span class="gm-file-item__add">+${diff.additions}</span>
      <span class="gm-file-item__del">-${diff.deletions}</span>
    </div>
  `;
  }
  function getStatusLabel(path) {
    if (path.includes(".new.") || path.includes(".added.")) return "A";
    if (path.includes(".deleted.") || path.includes(".removed.")) return "D";
    if (path.includes(".modified.") || path.includes(".changed.")) return "M";
    if (path.includes(".renamed.")) return "R";
    return "M";
  }

  // panel/components/commit-detail.ts
  function createCommitDetailPanel(container, _service, _directory) {
    let disposed = false;
    let unsubscribe = null;
    const render2 = () => {
      if (disposed) return;
      container.innerHTML = "";
      const state = getState();
      container.appendChild(html`
      <div class="gm-pane-header">${t("detail.title")}</div>
    `);
      const content = html`
      <div class="gm-detail"></div>
    `;
      if (!state.commitDetail) {
        content.innerHTML = `<div class="gm-empty">${t("commit.noSelection")}</div>`;
      } else {
        renderCommitDetail(content, state.commitDetail);
      }
      container.appendChild(content);
      if (unsubscribe) unsubscribe();
      unsubscribe = subscribeFields(["commitDetail"], () => {
        if (disposed) return;
        render2();
      });
    };
    const renderCommitDetail = (target, commit) => {
      target.innerHTML = "";
      const fields = [
        { label: t("detail.hash"), value: commit.hash, mono: true },
        { label: t("detail.author"), value: `${commit.authorName} <${commit.authorEmail}>`, mono: false },
        { label: t("detail.date"), value: new Date(commit.date).toLocaleString(getLang()), mono: false }
      ];
      for (const field2 of fields) {
        target.appendChild(html`
        <div class="gm-detail__field">
          <div class="gm-detail__label">${field2.label}</div>
          <div class="gm-detail__value ${field2.mono ? "gm-mono" : ""}">${field2.value}</div>
        </div>
      `);
      }
      target.appendChild(html`
      <div class="gm-detail__message">${commit.message}</div>
    `);
    };
    const dispose = () => {
      disposed = true;
      if (unsubscribe) {
        unsubscribe();
        unsubscribe = null;
      }
    };
    render2();
    return { dispose };
  }

  // panel/components/console-panel.ts
  var POLL_INTERVAL_MS = 1e3;
  function formatTime(ts) {
    const d = new Date(ts);
    return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}:${String(d.getSeconds()).padStart(2, "0")}`;
  }
  function createConsolePanel(container, service2, directory2) {
    let disposed = false;
    let pollTimer = null;
    let lastId = 0;
    let entries = [];
    let selectedId = null;
    container.innerHTML = "";
    const root2 = html`
    <div class="gm-console"></div>
  `;
    container.appendChild(root2);
    const header = html`
    <div class="gm-console__head">
      <span data-log-count>0</span>
      <span>${t("console.commandCount")}</span>
      <span class="gm-console__spacer"></span>
      <button type="button" data-log-clear class="gm-btn gm-btn--small">${t("console.clear")}</button>
    </div>
  `;
    root2.appendChild(header);
    const body = html`
    <div class="gm-console__body"></div>
  `;
    root2.appendChild(body);
    const listEl = html`
    <div data-log-list class="gm-console__list"></div>
  `;
    body.appendChild(listEl);
    const outputEl = html`
    <div data-log-output class="gm-console__output"></div>
  `;
    body.appendChild(outputEl);
    const countEl = header.querySelector("[data-log-count]");
    const renderList = () => {
      countEl.textContent = String(entries.length);
      listEl.innerHTML = "";
      if (entries.length === 0) {
        const empty = document.createElement("div");
        empty.className = "gm-console__empty";
        empty.textContent = t("console.noCommands");
        listEl.appendChild(empty);
        return;
      }
      for (const entry of [...entries].reverse()) {
        const row = document.createElement("div");
        row.dataset.logId = String(entry.id);
        row.className = "gm-console__row";
        row.setAttribute("aria-selected", String(selectedId === entry.id));
        const cmd = document.createElement("div");
        cmd.className = "gm-console__cmd";
        if (!entry.ok) cmd.dataset.state = "error";
        cmd.textContent = entry.command;
        cmd.title = entry.command;
        row.appendChild(cmd);
        const meta = document.createElement("div");
        meta.className = "gm-console__meta";
        meta.textContent = `${formatTime(entry.startedAt)} \xB7 ${entry.durationMs}ms \xB7 ${entry.ok ? "0" : entry.exitCode}`;
        row.appendChild(meta);
        row.addEventListener("click", () => {
          selectedId = entry.id;
          renderList();
          renderOutput();
        });
        listEl.appendChild(row);
      }
    };
    const renderOutput = () => {
      if (selectedId === null) {
        outputEl.textContent = t("console.selectCommand");
        return;
      }
      const entry = entries.find((e) => e.id === selectedId);
      if (!entry) {
        outputEl.textContent = t("console.selectCommand");
        return;
      }
      const parts = [`$ ${entry.command}`, `# ${entry.cwd}`, ""];
      if (entry.stdout) parts.push(entry.stdout);
      if (entry.stderr) parts.push(entry.stderr);
      if (!entry.stdout && !entry.stderr) parts.push(t("console.noOutput"));
      outputEl.textContent = parts.join("\n");
    };
    const refresh = async () => {
      if (disposed) return;
      try {
        const logs = await service2.getCommandLogs(directory2, lastId);
        if (disposed) return;
        if (logs.length > 0) {
          lastId = Math.max(lastId, ...logs.map((l) => l.id));
          entries = [...entries, ...logs];
          if (entries.length > 200) entries = entries.slice(-200);
          renderList();
          if (selectedId === null) selectedId = entries[entries.length - 1].id;
          renderOutput();
          console.debug(JSON.stringify({
            prefix: "[console]",
            event: "logs_loaded",
            added: logs.length,
            total: entries.length
          }));
        }
      } catch (err) {
        if (disposed) return;
        console.error(JSON.stringify({ prefix: "[console]", event: "load_error", error: String(err) }));
        outputEl.textContent = `${t("console.loadFailed")}: ${err instanceof Error ? err.message : String(err)}`;
      }
    };
    header.querySelector("[data-log-clear]")?.addEventListener("click", () => {
      void (async () => {
        try {
          await service2.clearCommandLogs(directory2);
          entries = [];
          selectedId = null;
          renderList();
          renderOutput();
        } catch (err) {
          console.error(JSON.stringify({ prefix: "[console]", event: "clear_error", error: String(err) }));
        }
      })();
    });
    void refresh().then(() => {
      if (disposed) return;
      pollTimer = window.setInterval(() => {
        void refresh();
      }, POLL_INTERVAL_MS);
    });
    renderList();
    renderOutput();
    return {
      dispose: () => {
        if (disposed) return;
        disposed = true;
        if (pollTimer !== null) window.clearInterval(pollTimer);
        pollTimer = null;
        container.innerHTML = "";
      }
    };
  }

  // panel/components/worktrees-panel.ts
  function createWorktreesPanel(container, service2, directory2, host2) {
    let disposed = false;
    container.innerHTML = "";
    const root2 = html`
    <div class="gm-wt"></div>
  `;
    container.appendChild(root2);
    const toolbar = html`
    <div class="gm-wt__head">
      <button type="button" data-wt-action="add" class="gm-btn gm-btn--small">${t("worktree.add")}</button>
      <button type="button" data-wt-action="prune" class="gm-btn gm-btn--small">${t("worktree.prune")}</button>
      <button type="button" data-wt-action="refresh" class="gm-btn gm-btn--small">${t("worktree.refresh")}</button>
      <span data-wt-count class="gm-wt__count"></span>
    </div>
  `;
    root2.appendChild(toolbar);
    const listEl = html`
    <div data-wt-list class="gm-wt__list"></div>
  `;
    root2.appendChild(listEl);
    const countEl = toolbar.querySelector("[data-wt-count]");
    console.debug(JSON.stringify({
      prefix: "[worktree]",
      event: "panel_created",
      toolbarButtons: toolbar.querySelectorAll("[data-wt-action]").length,
      containerChildren: container.children.length
    }));
    const renderList = (list) => {
      countEl.textContent = `(${list.length})`;
      listEl.innerHTML = "";
      if (list.length === 0) {
        const empty = document.createElement("div");
        empty.className = "gm-wt__empty";
        empty.textContent = t("worktree.empty");
        listEl.appendChild(empty);
        return;
      }
      for (const wt of list) {
        const row = document.createElement("div");
        row.dataset.path = wt.path;
        row.className = "gm-wt__row";
        const branch = document.createElement("span");
        branch.className = "gm-wt__branch";
        branch.dataset.current = String(wt.isMain);
        branch.textContent = wt.detached ? `detached ${wt.head.slice(0, 7)}` : (wt.branch ?? "").replace("refs/heads/", "");
        row.appendChild(branch);
        const pathEl = document.createElement("span");
        pathEl.className = "gm-wt__path";
        pathEl.textContent = wt.path;
        pathEl.title = wt.path;
        row.appendChild(pathEl);
        if (wt.isMain) {
          const main = document.createElement("span");
          main.className = "gm-wt__badge--main";
          main.textContent = t("worktree.main");
          row.appendChild(main);
        }
        if (wt.locked) {
          const lock = document.createElement("span");
          lock.className = "gm-wt__badge--lock";
          lock.textContent = `\u{1F512} ${wt.locked}`;
          row.appendChild(lock);
        }
        if (!wt.isMain) {
          const removeBtn = document.createElement("button");
          removeBtn.type = "button";
          removeBtn.textContent = t("worktree.remove");
          removeBtn.className = "gm-btn gm-btn--small";
          removeBtn.addEventListener("click", () => {
            showConfirmDialog(t("worktree.removeConfirm", { path: wt.path }), async () => {
              try {
                await service2.removeWorktree(directory2, wt.path, false);
                await refresh();
                void host2.toast({ kind: "success", message: t("worktree.removed") }).catch(() => {
                });
              } catch (e) {
                const message = e instanceof Error ? e.message : String(e);
                console.error(JSON.stringify({ prefix: "[worktree]", event: "remove_error", path: wt.path, error: message }));
                if (message.toLowerCase().includes("modified") || message.toLowerCase().includes("untracked")) {
                  showConfirmDialog(t("worktree.forceConfirm", { path: wt.path }), async () => {
                    try {
                      await service2.removeWorktree(directory2, wt.path, true);
                      await refresh();
                      void host2.toast({ kind: "success", message: t("worktree.removed") }).catch(() => {
                      });
                    } catch (forceErr) {
                      showOperationError(forceErr, "worktree.removeFailed", "[worktree]", "force_remove_error", host2);
                    }
                  }, true);
                } else {
                  showOperationError(e, "worktree.removeFailed", "[worktree]", "remove_error", host2);
                }
              }
            }, true);
          });
          row.appendChild(removeBtn);
        }
        listEl.appendChild(row);
      }
    };
    const refresh = async () => {
      if (disposed) return;
      try {
        const list = await service2.listWorktrees(directory2);
        if (disposed) return;
        renderList(list);
        console.debug(JSON.stringify({ prefix: "[worktree]", event: "list_loaded", count: list.length }));
      } catch (e) {
        if (disposed) return;
        console.error(JSON.stringify({ prefix: "[worktree]", event: "list_error", error: String(e) }));
        listEl.innerHTML = `<div class="gm-wt__error">${t("worktree.loadFailed")}</div>`;
      }
    };
    toolbar.addEventListener("click", async (e) => {
      const target = e.target.closest("[data-wt-action]");
      console.debug(JSON.stringify({
        prefix: "[worktree]",
        event: "toolbar_click",
        targetTag: e.target.tagName,
        action: target?.dataset.wtAction ?? null,
        toolbarConnected: toolbar.isConnected,
        listConnected: listEl.isConnected
      }));
      if (!target) return;
      const action = target.dataset.wtAction;
      if (action === "refresh") {
        await refresh();
        void host2.toast({ kind: "success", message: t("worktree.refreshed") }).catch(() => {
        });
        return;
      }
      if (action === "prune") {
        try {
          const before = listEl.querySelectorAll("[data-path]").length;
          await service2.pruneWorktrees(directory2);
          await refresh();
          const after = listEl.querySelectorAll("[data-path]").length;
          const removed = before - after;
          void host2.toast({
            kind: "success",
            message: removed > 0 ? t("worktree.pruneDone", { n: removed }) : t("worktree.pruneNothing")
          }).catch(() => {
          });
        } catch (err) {
          const message = err instanceof Error ? err.message : String(err);
          console.error(JSON.stringify({ prefix: "[worktree]", event: "prune_error", error: message }));
          void host2.toast({ kind: "error", message: `${t("worktree.pruneFailed")}: ${message}`, copy: true, dismiss: true }).catch(() => {
          });
        }
        return;
      }
      if (action === "add") {
        showPromptDialog(
          t("worktree.add"),
          [
            { label: t("worktree.addPathPrompt"), placeholder: "/path/to/worktree" },
            { label: t("worktree.addBranchPrompt", { base: "HEAD" }), placeholder: "feature/xxx" }
          ],
          async ([path, branch]) => {
            if (!path || !branch) return;
            try {
              await service2.addWorktree(directory2, path, branch, true, void 0);
              await refresh();
              void host2.toast({ kind: "success", message: t("worktree.added", { path }) }).catch(() => {
              });
            } catch (err) {
              const message = err instanceof Error ? err.message : String(err);
              console.error(JSON.stringify({ prefix: "[worktree]", event: "add_error", path, branch, error: message }));
              showConfirmDialog(`${t("worktree.addFailed")}: ${message}`, () => {
              }, true);
            }
          }
        );
      }
    });
    void refresh();
    return {
      refresh,
      dispose: () => {
        if (disposed) return;
        disposed = true;
        container.innerHTML = "";
      }
    };
  }

  // panel/components/compare-view.ts
  var OVERLAY_ID = "git-compare-branches";
  function formatDate2(date) {
    const d = new Date(date);
    const diffMin = Math.floor((Date.now() - d.getTime()) / 6e4);
    if (diffMin < 1) return t("time.justNow");
    if (diffMin < 60) return t("time.minutesAgo", { n: diffMin });
    if (Math.floor(diffMin / 60) < 24) return t("time.hoursAgo", { n: Math.floor(diffMin / 60) });
    if (Math.floor(diffMin / 1440) < 7) return t("time.daysAgo", { n: Math.floor(diffMin / 1440) });
    return d.toLocaleDateString(getLang());
  }
  function renderCommitList(commits, emptyText, onCommitClick) {
    const list = document.createElement("div");
    list.className = "gm-compare__commits";
    if (commits.length === 0) {
      const empty = document.createElement("div");
      empty.className = "gm-compare__loading";
      empty.textContent = emptyText;
      list.appendChild(empty);
      return list;
    }
    for (const commit of commits) {
      const row = document.createElement("div");
      row.dataset.hash = commit.hash;
      row.className = "gm-commit-row";
      row.setAttribute("aria-selected", "false");
      const dot = document.createElement("span");
      dot.className = "gm-commit-row__dot";
      dot.innerHTML = '<svg width="10" height="10" viewBox="0 0 10 10" aria-hidden="true"><circle cx="5" cy="5" r="4" fill="currentColor"/></svg>';
      row.appendChild(dot);
      const hashEl = document.createElement("span");
      hashEl.className = "gm-commit-row__hash";
      hashEl.textContent = commit.shortHash;
      row.appendChild(hashEl);
      const msgEl = document.createElement("span");
      msgEl.className = "gm-commit-row__message";
      msgEl.textContent = commit.message;
      msgEl.title = commit.message;
      row.appendChild(msgEl);
      const dateEl = document.createElement("span");
      dateEl.className = "gm-commit-row__date";
      dateEl.textContent = formatDate2(commit.date);
      row.appendChild(dateEl);
      const authorEl = document.createElement("span");
      authorEl.className = "gm-commit-row__author";
      authorEl.textContent = commit.authorName;
      row.appendChild(authorEl);
      row.addEventListener("click", () => onCommitClick(commit));
      list.appendChild(row);
    }
    return list;
  }
  function showCompareBranchesView(service2, directory2, branches, initialLeft, initialRight) {
    document.getElementById(OVERLAY_ID)?.remove();
    let closed = false;
    let leftBranch = initialLeft;
    let rightBranch = initialRight;
    let selectedHash = null;
    const overlay = html`
    <div id="${OVERLAY_ID}" class="gm-dialog-backdrop">
      <div class="gm-compare">
        <!-- Title row: branch pickers -->
        <div class="gm-compare__head">
          <span class="gm-compare__icon">${getIcon("compareBranch")}</span>
          <button type="button" id="compare-left-btn" class="gm-btn gm-compare__branch"></button>
          <span class="gm-compare__with">${t("compare.with")}</span>
          <button type="button" id="compare-right-btn" class="gm-btn gm-compare__branch"></button>
          <span id="compare-summary" class="gm-compare__summary"></span>
          <span class="gm-compare__spacer"></span>
          <span id="compare-close" class="gm-compare__close" title="${t("sidebar.close")}">×</span>
        </div>

        <div class="gm-compare__body">
          <!-- Left: the two commit lists -->
          <div class="gm-compare__lists">
            <div class="gm-compare__section-head">
              <span id="compare-left-title" class="gm-compare__section-title"></span>
              <span id="compare-left-count" class="gm-compare__section-count">…</span>
            </div>
            <div id="compare-left-list" class="gm-compare__list gm-compare__list--divided">
              <div class="gm-compare__loading">${t("compare.loading")}</div>
            </div>

            <div class="gm-compare__section-head">
              <span id="compare-right-title" class="gm-compare__section-title"></span>
              <span id="compare-right-count" class="gm-compare__section-count">…</span>
            </div>
            <div id="compare-right-list" class="gm-compare__list">
              <div class="gm-compare__loading">${t("compare.loading")}</div>
            </div>
          </div>

          <!-- Right: selected commit, its files and their diffs -->
          <div class="gm-compare__detail-wrap">
            <div id="compare-detail" class="gm-compare__detail">
              <div class="gm-empty">${t("commit.noSelection")}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
    document.body.appendChild(overlay);
    const leftListEl = overlay.querySelector("#compare-left-list");
    const rightListEl = overlay.querySelector("#compare-right-list");
    const leftCountEl = overlay.querySelector("#compare-left-count");
    const rightCountEl = overlay.querySelector("#compare-right-count");
    const leftTitleEl = overlay.querySelector("#compare-left-title");
    const rightTitleEl = overlay.querySelector("#compare-right-title");
    const leftBtn = overlay.querySelector("#compare-left-btn");
    const rightBtn = overlay.querySelector("#compare-right-btn");
    const detailEl = overlay.querySelector("#compare-detail");
    const summaryEl = overlay.querySelector("#compare-summary");
    const close = () => {
      if (closed) return;
      closed = true;
      document.removeEventListener("keydown", onKeydown);
      overlay.remove();
    };
    const onKeydown = (e) => {
      if (e.key === "Escape") close();
    };
    document.addEventListener("keydown", onKeydown);
    overlay.querySelector("#compare-close")?.addEventListener("click", close);
    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) close();
    });
    const renderDetail = (commit, detail, diffs) => {
      detailEl.innerHTML = "";
      let expandedPath = null;
      const head = document.createElement("div");
      head.className = "gm-compare__head-block";
      const msg = document.createElement("div");
      msg.className = "gm-compare__msg";
      msg.textContent = commit.message;
      head.appendChild(msg);
      const rows = [
        [t("detail.hash"), commit.hash],
        [t("detail.author"), `${commit.authorName} <${commit.authorEmail}>`],
        [t("detail.date"), new Date(commit.date).toLocaleString(getLang())]
      ];
      for (const [label, value] of rows) {
        const row = document.createElement("div");
        row.className = "gm-compare__field";
        const labelEl = document.createElement("span");
        labelEl.className = "gm-compare__field-label";
        labelEl.textContent = label;
        const valueEl = document.createElement("span");
        valueEl.className = "gm-compare__field-value";
        valueEl.textContent = value;
        row.append(labelEl, valueEl);
        head.appendChild(row);
      }
      detailEl.appendChild(head);
      const fileTitle = document.createElement("div");
      fileTitle.className = "gm-compare__file-title";
      fileTitle.textContent = `${t("file.changedFiles")} (${diffs.length})`;
      detailEl.appendChild(fileTitle);
      if (diffs.length === 0) {
        const empty = document.createElement("div");
        empty.className = "gm-compare__parents";
        empty.textContent = t("file.noChanges");
        detailEl.appendChild(empty);
        return;
      }
      for (const diff of diffs) {
        const row = document.createElement("div");
        row.dataset.comparePath = diff.path;
        row.className = "gm-compare__file";
        row.setAttribute("aria-expanded", "false");
        const caret = document.createElement("span");
        caret.className = "gm-compare__file-caret";
        caret.textContent = expandedPath === diff.path ? "\u25BE" : "\u25B8";
        row.appendChild(caret);
        const pathEl = document.createElement("span");
        pathEl.className = "gm-compare__file-path";
        pathEl.textContent = diff.path;
        pathEl.title = diff.path;
        row.appendChild(pathEl);
        const addEl = document.createElement("span");
        addEl.className = "gm-compare__file-add";
        addEl.textContent = `+${diff.additions}`;
        row.appendChild(addEl);
        const delEl = document.createElement("span");
        delEl.className = "gm-compare__file-del";
        delEl.textContent = `-${diff.deletions}`;
        row.appendChild(delEl);
        const content = document.createElement("div");
        content.dataset.compareDiff = diff.path;
        content.className = "gm-compare__file-diff";
        content.hidden = true;
        row.addEventListener("click", () => {
          const willExpand = expandedPath !== diff.path;
          expandedPath = willExpand ? diff.path : null;
          caret.textContent = willExpand ? "\u25BE" : "\u25B8";
          row.setAttribute("aria-expanded", String(willExpand));
          if (willExpand) {
            content.innerHTML = "";
            if (!diff.lines || diff.lines.length === 0) {
              const noDiff = document.createElement("div");
              noDiff.className = "gm-compare__loading";
              noDiff.textContent = t("file.noDiff");
              content.appendChild(noDiff);
            } else {
              for (const line of diff.lines) content.appendChild(createDiffLine(line));
            }
          }
          content.hidden = !willExpand;
        });
        const wrapper = document.createElement("div");
        wrapper.append(row, content);
        detailEl.appendChild(wrapper);
      }
      if (detail && Array.isArray(detail.parents)) {
        const parents = detail.parents ?? [];
        if (parents.length > 0) {
          const parentsTitle = document.createElement("div");
          parentsTitle.className = "gm-compare__parents-title";
          parentsTitle.textContent = "parents";
          detailEl.appendChild(parentsTitle);
          const parentsEl = document.createElement("div");
          parentsEl.className = "gm-compare__parents";
          parentsEl.textContent = parents.join(", ");
          detailEl.appendChild(parentsEl);
        }
      }
    };
    const loadCommitInto = async (commit) => {
      selectedHash = commit.hash;
      detailEl.innerHTML = `<div class="gm-compare__loading">${t("compare.loading")}</div>`;
      try {
        const [detail, diffs] = await Promise.all([
          service2.getCommitDetail(directory2, commit.hash),
          service2.getCommitDiffs(directory2, commit.hash)
        ]);
        if (closed || selectedHash !== commit.hash) return;
        renderDetail(commit, detail, diffs ?? []);
      } catch (e) {
        if (closed || selectedHash !== commit.hash) return;
        console.error(JSON.stringify({
          prefix: "[compare]",
          event: "commit_detail_error",
          hash: commit.hash,
          error: String(e)
        }));
        detailEl.innerHTML = "";
        const error = document.createElement("div");
        error.className = "gm-compare__error";
        error.textContent = `${t("compare.loadFailed")}: ${e instanceof Error ? e.message : String(e)}`;
        detailEl.appendChild(error);
      }
    };
    const fill = (target, countEl, commits) => {
      target.innerHTML = "";
      countEl.textContent = `(${commits.length})`;
      target.appendChild(renderCommitList(commits, t("compare.empty"), (commit) => {
        void loadCommitInto(commit);
      }));
    };
    const load = async () => {
      leftBtn.textContent = leftBranch;
      rightBtn.textContent = rightBranch;
      leftTitleEl.textContent = t("compare.branchOnly", { branch: leftBranch });
      rightTitleEl.textContent = t("compare.branchOnly", { branch: rightBranch });
      console.debug(JSON.stringify({
        prefix: "[compare]",
        event: "load_start",
        left: leftBranch,
        right: rightBranch
      }));
      leftListEl.innerHTML = `<div class="gm-compare__loading">${t("compare.loading")}</div>`;
      rightListEl.innerHTML = `<div class="gm-compare__loading">${t("compare.loading")}</div>`;
      leftCountEl.textContent = "\u2026";
      rightCountEl.textContent = "\u2026";
      summaryEl.textContent = "";
      try {
        const [onlyLeft, onlyRight] = await Promise.all([
          service2.getLog(directory2, `${rightBranch}..${leftBranch}`),
          service2.getLog(directory2, `${leftBranch}..${rightBranch}`)
        ]);
        if (closed) return;
        fill(leftListEl, leftCountEl, onlyLeft);
        fill(rightListEl, rightCountEl, onlyRight);
        summaryEl.textContent = onlyLeft.length === 0 && onlyRight.length === 0 ? t("compare.identical") : "";
        console.debug(JSON.stringify({
          prefix: "[compare]",
          event: "load_done",
          left: leftBranch,
          right: rightBranch,
          leftCount: onlyLeft.length,
          rightCount: onlyRight.length
        }));
      } catch (e) {
        console.error(JSON.stringify({
          prefix: "[compare]",
          event: "load_error",
          left: leftBranch,
          right: rightBranch,
          error: String(e)
        }));
        if (closed) return;
        const errorText3 = `${t("compare.loadFailed")}: ${e instanceof Error ? e.message : String(e)}`;
        for (const [target, countEl] of [[leftListEl, leftCountEl], [rightListEl, rightCountEl]]) {
          target.innerHTML = "";
          countEl.textContent = "";
          const error = document.createElement("div");
          error.className = "gm-compare__error";
          error.textContent = errorText3;
          target.appendChild(error);
        }
      }
    };
    const openBranchPicker = (e, side) => {
      const anchor = side === "left" ? leftBtn : rightBtn;
      const currentName = side === "left" ? leftBranch : rightBranch;
      const items = branches.map((b) => ({
        id: b.name,
        label: b.name,
        checked: b.name === currentName
      }));
      showDropdownMenu(anchor, items, (id) => {
        if (side === "left") leftBranch = id;
        else rightBranch = id;
        if (leftBranch === rightBranch) {
          summaryEl.textContent = t("compare.sameBranch");
          leftBtn.textContent = leftBranch;
          rightBtn.textContent = rightBranch;
          return;
        }
        void load();
      });
      void e;
    };
    leftBtn.addEventListener("click", (e) => {
      openBranchPicker(e, "left");
    });
    rightBtn.addEventListener("click", (e) => {
      openBranchPicker(e, "right");
    });
    void load();
    return { dispose: close };
  }

  // panel/main.ts
  var root = document.querySelector("#root");
  var service = createServiceClient(host);
  var disposables = [];
  var activeBottomTab = "git";
  var directory = null;
  var rendering = false;
  var loadingData = false;
  var clearingBranchFilter = false;
  function getDir() {
    if (!directory) throw new Error("\u76EE\u5F55\u672A\u521D\u59CB\u5316");
    return directory;
  }
  function clearAll() {
    for (const d of disposables) {
      d.dispose();
    }
    disposables = [];
    root.innerHTML = "";
  }
  async function render() {
    if (rendering) return;
    rendering = true;
    try {
      let updateTabStyles2 = function() {
        tabBar.querySelectorAll("[data-tab]").forEach((el2) => {
          const isActive = el2.dataset.tab === activeTab && activeTab !== "git";
          el2.setAttribute("aria-selected", String(isActive));
        });
      };
      var updateTabStyles = updateTabStyles2;
      clearAll();
      if (!directory) {
        const empty = mountEmpty(root, {
          title: t("main.loadingTitle"),
          body: t("main.loadingBody")
        });
        disposables.push(empty);
        return;
      }
      const isGit = await checkGitRepository();
      if (!isGit) {
        root.innerHTML = "";
        const empty = mountEmpty(root, {
          title: t("main.notGitTitle"),
          body: t("main.notGitBody")
        });
        disposables.push(empty);
        return;
      }
      const mainLayout = html`
      <div class="gm-shell"></div>
    `;
      const progressBar = html`
      <div data-progress class="gm-progress">
        <div data-progress-inner class="gm-progress__bar"></div>
      </div>
    `;
      mainLayout.appendChild(progressBar);
      progress = createProgressBar(progressBar);
      const contentArea = html`
      <div class="gm-content"></div>
    `;
      mainLayout.appendChild(contentArea);
      const branchPanel = html`
      <div class="gm-branches"></div>
    `;
      branchPanel.hidden = getState().branchPanelHidden;
      contentArea.appendChild(branchPanel);
      const sidePanelWidth = () => Math.round(
        contentArea.querySelector(".gm-side")?.getBoundingClientRect().width ?? 0
      ) || getLayout().side;
      const branchesSplitter = createSplitter({
        axis: "x",
        sign: 1,
        value: () => Math.round(branchPanel.getBoundingClientRect().width) || getLayout().branches,
        min: () => 160,
        max: () => Math.max(160, contentArea.clientWidth - sidePanelWidth() - 210),
        onResize: (px) => {
          setLayoutSize("branches", px);
        },
        onCommit: () => {
          commitLayout();
        }
      });
      branchesSplitter.hidden = branchPanel.hidden;
      contentArea.appendChild(branchesSplitter);
      const toggleBranchPanel = () => {
        setState((s) => {
          s.branchPanelHidden = !s.branchPanelHidden;
        });
        branchPanel.hidden = getState().branchPanelHidden;
        branchesSplitter.hidden = branchPanel.hidden;
      };
      const commitListPanel = html`
      <div class="gm-main"></div>
    `;
      contentArea.appendChild(commitListPanel);
      const commitListComp = createCommitListPanel(
        commitListPanel,
        service,
        getDir(),
        (commit) => {
          loadCommitDetail(commit.hash);
        },
        {
          onToggleBranchPanel: toggleBranchPanel,
          onLocateBranch: () => {
            void runSidebarLocateBranch();
          }
        }
      );
      disposables.push(commitListComp);
      const branchActions = {
        onNewBranch: () => {
          try {
            const selected = getState().selectedCommit?.hash ?? null;
            void service.debugLog("new-branch-dialog-open", { selectedCommit: selected });
            showCreateBranchDialog({ service, directory: getDir(), startPoint: selected ?? void 0, entry: "branchPanel" });
          } catch (e) {
            console.error(JSON.stringify({ prefix: "[branch-panel]", event: "new_branch_error", error: String(e) }));
          }
        },
        onUpdateSelected: () => {
          void runSidebarUpdate();
        },
        onFetch: () => {
          void runSidebarFetch();
        },
        onDeleteBranch: () => {
          const state = getState();
          const resolved = resolveDeleteTargets(state.branches, state.selectedBranch, state.selectedBranches);
          if (resolved.kind === "none") {
            void host.toast({ kind: "error", message: t("branch.selectBranch") }).catch((toastErr) => {
              console.error(JSON.stringify({ prefix: "[sidebar]", event: "delete_branch_toast_error", error: String(toastErr) }));
            });
            return;
          }
          if (resolved.kind === "current") {
            void host.toast({ kind: "error", message: t("branch.deleteCurrent") }).catch((toastErr) => {
              console.error(JSON.stringify({ prefix: "[sidebar]", event: "delete_branch_toast_error", error: String(toastErr) }));
            });
            return;
          }
          void (async () => {
            await deleteBranches(service, host, getDir(), resolved.targets);
            setState((s) => {
              s.selectedBranches = /* @__PURE__ */ new Set();
            });
            try {
              const next = await service.getBranches(getDir());
              setState((s) => {
                s.branches = next;
              });
            } catch (err) {
              console.error(JSON.stringify({ prefix: "[sidebar]", event: "reload_branches_error", error: String(err) }));
            }
          })();
        },
        onCompareBranch: () => {
          const state = getState();
          const multi = [...state.selectedBranches];
          const selectedName = state.selectedBranch?.name ?? null;
          const branch = selectedName ? state.branches.find((b) => b.name === selectedName) ?? state.selectedBranch : null;
          console.debug(JSON.stringify({
            prefix: "[sidebar]",
            event: "compare_branch_click",
            selectedName,
            multiSelected: multi,
            branchCount: state.branches.length,
            branchesWithIsCurrent: state.branches.filter((b) => b.isCurrent).map((b) => b.name),
            logBranch: state.logBranch
          }));
          if (multi.length === 2) {
            const [left, right] = multi;
            void service.debugLog("compare-branch-open", { left, right, via: "multi" });
            showCompareBranchesView(service, getDir(), getState().branches, left, right);
            return;
          }
          if (multi.length > 2) {
            void host.toast({ kind: "error", message: t("compare.tooMany") }).catch((toastErr) => {
              console.error(JSON.stringify({ prefix: "[sidebar]", event: "compare_toast_error", error: String(toastErr) }));
            });
            return;
          }
          if (!branch) {
            void host.toast({ kind: "error", message: t("compare.selectBranch") }).catch((toastErr) => {
              console.error(JSON.stringify({ prefix: "[sidebar]", event: "compare_toast_error", error: String(toastErr) }));
            });
            return;
          }
          void (async () => {
            let current3 = getState().branches.find((b) => b.isCurrent)?.name ?? "";
            if (!current3) {
              try {
                const status = await service.getStatus(getDir());
                current3 = status.currentBranch ?? "";
              } catch (statusErr) {
                console.error(JSON.stringify({
                  prefix: "[sidebar]",
                  event: "compare_get_status_error",
                  error: String(statusErr)
                }));
              }
            }
            console.debug(JSON.stringify({
              prefix: "[sidebar]",
              event: "compare_resolve_current",
              currentBranch: current3 || null
            }));
            if (!current3) {
              console.error(JSON.stringify({ prefix: "[sidebar]", event: "compare_no_current_branch", branch: branch.name }));
              void host.toast({ kind: "error", message: t("compare.noCurrentBranch") }).catch((toastErr) => {
                console.error(JSON.stringify({ prefix: "[sidebar]", event: "compare_toast_error", error: String(toastErr) }));
              });
              return;
            }
            if (branch.name === current3) {
              void host.toast({ kind: "error", message: t("compare.currentBranch") }).catch((toastErr) => {
                console.error(JSON.stringify({ prefix: "[sidebar]", event: "compare_toast_error", error: String(toastErr) }));
              });
              return;
            }
            void service.debugLog("compare-branch-open", { branch: branch.name, current: current3 });
            showCompareBranchesView(service, getDir(), getState().branches, branch.name, current3);
          })();
        },
        onToggleMyBranches: () => {
          void toggleMyBranches();
        },
        onFavorite: () => {
          void runSidebarFavorite();
        }
      };
      const branchPanelComp = createBranchPanel(
        branchPanel,
        service,
        getDir(),
        (branch) => {
          console.debug(JSON.stringify({ prefix: "[main]", event: "on_branch_select_cb", branchName: branch.name }));
          loadCommitsForBranch(branch.name);
        },
        // Empty space: clear the selection and the branch filter, restore all commits.
        () => {
          clearBranchFilter();
        },
        branchActions
      );
      disposables.push(branchPanelComp);
      const detailPanel = html`
      <div class="gm-side"></div>
    `;
      const sideSplitter = createSplitter({
        axis: "x",
        sign: -1,
        value: () => Math.round(detailPanel.getBoundingClientRect().width) || getLayout().side,
        min: () => 220,
        max: () => Math.max(
          220,
          contentArea.clientWidth - (Math.round(branchPanel.getBoundingClientRect().width) || getLayout().branches) - 210
        ),
        onResize: (px) => {
          setLayoutSize("side", px);
        },
        onCommit: () => {
          commitLayout();
        }
      });
      contentArea.appendChild(sideSplitter);
      contentArea.appendChild(detailPanel);
      const fileDiffPanel = html`
      <div class="gm-pane gm-pane--stacked"></div>
    `;
      detailPanel.appendChild(fileDiffPanel);
      const fileDiffComp = createFileDiffPanel(fileDiffPanel, service, getDir());
      disposables.push(fileDiffComp);
      const detailSplitter = createSplitter({
        axis: "y",
        sign: 1,
        value: () => Math.round(fileDiffPanel.getBoundingClientRect().height) || getLayout().filesPane || 240,
        min: () => 80,
        max: () => Math.max(80, detailPanel.clientHeight - 80 - 5),
        onResize: (px) => {
          setLayoutSize("filesPane", px);
        },
        onCommit: () => {
          commitLayout();
        }
      });
      detailPanel.appendChild(detailSplitter);
      const commitDetailPanel = html`
      <div class="gm-pane"></div>
    `;
      detailPanel.appendChild(commitDetailPanel);
      const commitDetailComp = createCommitDetailPanel(commitDetailPanel, service, getDir());
      disposables.push(commitDetailComp);
      root.appendChild(mainLayout);
      const bottomPanel = html`
      <div data-bottom-panel class="gm-bottom"></div>
    `;
      root.appendChild(bottomPanel);
      const bottomSplitter = createSplitter({
        axis: "y",
        sign: -1,
        value: () => Math.round(bottomPanel.getBoundingClientRect().height) || getLayout().bottom,
        min: () => 120,
        max: () => Math.max(120, root.clientHeight - 180),
        onResize: (px) => {
          setLayoutSize("bottom", px);
        },
        onCommit: () => {
          commitLayout();
        }
      });
      bottomSplitter.hidden = true;
      root.insertBefore(bottomSplitter, bottomPanel);
      let bottomHandle = null;
      let activeTab = activeBottomTab;
      const switchTab = (tab) => {
        if (activeTab === tab && tab !== "git") {
          activeTab = "git";
        } else {
          activeTab = tab;
        }
        activeBottomTab = activeTab;
        bottomHandle?.dispose();
        bottomHandle = null;
        bottomPanel.innerHTML = "";
        if (activeTab === "git") {
          bottomPanel.dataset.open = "false";
          bottomSplitter.hidden = true;
        } else if (activeTab === "console") {
          bottomPanel.dataset.open = "true";
          bottomSplitter.hidden = false;
          bottomHandle = createConsolePanel(bottomPanel, service, getDir());
        } else {
          bottomPanel.dataset.open = "true";
          bottomSplitter.hidden = false;
          bottomHandle = createWorktreesPanel(bottomPanel, service, getDir(), host);
        }
        updateTabStyles2();
      };
      const tabBar = createTabBar(switchTab);
      root.appendChild(tabBar);
      disposables.push({
        dispose: () => {
          bottomHandle?.dispose();
        }
      });
      if (activeBottomTab !== "git") {
        switchTab(activeBottomTab);
      }
    } finally {
      rendering = false;
    }
  }
  function createProgressBar(element) {
    const inner = element.querySelector("[data-progress-inner]");
    let pending = 0;
    let animation = null;
    const start = () => {
      pending += 1;
      if (pending > 1) return;
      element.style.height = "2px";
      if (inner) {
        inner.style.opacity = "1";
        animation = inner.animate(
          [
            { transform: "translateX(-100%)" },
            { transform: "translateX(340%)" }
          ],
          { duration: 1100, iterations: Infinity, easing: "ease-in-out" }
        );
      }
    };
    const done = () => {
      if (pending === 0) return;
      pending -= 1;
      if (pending > 0) return;
      animation?.cancel();
      animation = null;
      if (inner) inner.style.opacity = "0";
      element.style.height = "0";
    };
    return { start, done };
  }
  function createTabBar(onSwitch) {
    const bar = html`
    <div class="gm-tabbar">
      <div class="gm-tabbar__row" role="tablist">
        <div data-tab="git" class="gm-tab" role="tab" aria-selected="false">Git</div>
        <div data-tab="console" class="gm-tab" role="tab" aria-selected="false">${t("main.tabConsole")}</div>
        <div data-tab="worktrees" class="gm-tab" role="tab" aria-selected="false">Worktrees</div>
      </div>
    </div>
  `;
    bar.addEventListener("click", (e) => {
      const target = e.target.closest("[data-tab]");
      if (!target) return;
      const tab = target.dataset.tab;
      onSwitch(tab);
    });
    return bar;
  }
  async function runSidebarFavorite() {
    const state = getState();
    const names = state.selectedBranches.size > 0 ? [...state.selectedBranches] : state.selectedBranch ? [state.selectedBranch.name] : [];
    if (names.length === 0) {
      console.error(JSON.stringify({ prefix: "[sidebar]", event: "favorite_no_branch" }));
      void host.toast({ kind: "error", message: t("branch.selectBranch") }).catch(() => {
      });
      return;
    }
    const next = new Set(state.favorites);
    const allFavorited = names.every((n) => next.has(n));
    for (const name of names) {
      if (allFavorited) next.delete(name);
      else next.add(name);
    }
    console.debug(JSON.stringify({
      prefix: "[sidebar]",
      event: "favorite_toggle",
      branches: names,
      favorited: !allFavorited
    }));
    const previous = state.favorites;
    setState((s) => {
      s.favorites = next;
    });
    try {
      await service.saveFavorites(getDir(), [...next]);
    } catch (e) {
      setState((s) => {
        s.favorites = previous;
      });
      showOperationError(e, "branch.favoriteSaveFailed", "[sidebar]", "save_favorites_error");
    }
  }
  async function runSidebarUpdate() {
    try {
      await service.fetch(getDir());
      await loadData();
    } catch (e) {
      showOperationError(e, "sidebar.fetchFailed", "[sidebar]", "update_error");
    }
  }
  var progress = { start: () => {
  }, done: () => {
  } };
  function classifyFetchError(message) {
    const text = message.toLowerCase();
    if (text.includes("authentication failed") || text.includes("could not read username") || text.includes("permission denied") || text.includes("access denied") || text.includes("403")) {
      return "sidebar.fetchAuthFailed";
    }
    if (text.includes("could not resolve host") || text.includes("connection refused") || text.includes("connection timed out") || text.includes("network is unreachable") || text.includes("failed to connect")) {
      return "sidebar.fetchUnreachable";
    }
    if (text.includes("does not appear to be a git repository") || text.includes("no such remote")) {
      return "sidebar.fetchNoRemote";
    }
    return "sidebar.fetchFailed";
  }
  async function runSidebarFetch() {
    if (getState().fetching) {
      console.debug(JSON.stringify({ prefix: "[sidebar]", event: "fetch_skipped_running" }));
      return;
    }
    setState((s) => {
      s.fetching = true;
    });
    progress.start();
    const startedAt = Date.now();
    console.debug(JSON.stringify({ prefix: "[sidebar]", event: "fetch_start" }));
    try {
      await service.fetch(getDir());
      await loadBranches();
      const unpulledBranches = getState().branches.filter((b) => b.hasUnpulled && (b.unpulledCount ?? 0) > 0).map((b) => b.name);
      console.debug(JSON.stringify({
        prefix: "[sidebar]",
        event: "fetch_done",
        elapsedMs: Date.now() - startedAt,
        unpulledCount: unpulledBranches.length
      }));
      void host.toast({
        kind: "success",
        message: unpulledBranches.length > 0 ? t("sidebar.fetchSuccessUpdates", { count: unpulledBranches.length }) : t("sidebar.fetchSuccessNoUpdates")
      }).catch((toastErr) => {
        console.error(JSON.stringify({ prefix: "[sidebar]", event: "fetch_toast_error", error: String(toastErr) }));
      });
    } catch (e) {
      const message = e instanceof Error ? e.message : String(e);
      const reasonKey = classifyFetchError(message);
      console.error(JSON.stringify({
        prefix: "[sidebar]",
        event: "fetch_error",
        elapsedMs: Date.now() - startedAt,
        reasonKey,
        error: message
      }));
      void host.toast({
        kind: "error",
        message: `${t(reasonKey)}: ${message}`,
        copy: true,
        dismiss: true
      }).catch((toastErr) => {
        console.error(JSON.stringify({ prefix: "[sidebar]", event: "fetch_toast_error", error: String(toastErr) }));
      });
    } finally {
      setState((s) => {
        s.fetching = false;
      });
      progress.done();
    }
  }
  async function runSidebarLocateBranch() {
    const state = getState();
    const selected = state.selectedBranch ?? (state.selectedBranches.size === 1 ? state.branches.find((b) => b.name === [...state.selectedBranches][0]) ?? null : null);
    if (!selected) {
      console.debug(JSON.stringify({ prefix: "[sidebar]", event: "locate_no_branch" }));
      return;
    }
    const headHash = selected.commit ?? (await service.getLog(getDir(), selected.name)).at(0)?.hash;
    if (!headHash) {
      console.debug(JSON.stringify({ prefix: "[sidebar]", event: "locate_no_commit", branchName: selected.name }));
      return;
    }
    const found = getState().allCommits.find(
      (c) => c.hash === headHash || c.shortHash === headHash || c.hash.startsWith(headHash)
    );
    console.debug(JSON.stringify({
      prefix: "[sidebar]",
      event: "locate_branch",
      branchName: selected.name,
      headHash,
      visible: Boolean(found)
    }));
    if (!found) {
      void host.toast({ kind: "info", message: t("sidebar.locateNotInView", { branch: selected.name }) }).catch((toastErr) => {
        console.error(JSON.stringify({ prefix: "[sidebar]", event: "locate_toast_error", error: String(toastErr) }));
      });
      return;
    }
    setState((s) => {
      s.selectedCommit = found;
      s.selectedCommits = /* @__PURE__ */ new Set([found.hash]);
    });
    await loadCommitDetail(found.hash);
  }
  async function loadCommitsForBranch(branchName) {
    console.debug(JSON.stringify({ prefix: "[main]", event: "load_branch_start", branchName }));
    setState((s) => {
      s.logBranch = branchName;
      s.selectedCommits = /* @__PURE__ */ new Set();
    });
    console.debug(JSON.stringify({ prefix: "[main]", event: "log_branch_set", branchName }));
    try {
      const commits = await service.getLog(getDir(), branchName, getState().filterPaths.length ? getState().filterPaths : void 0);
      console.debug(JSON.stringify({ prefix: "[main]", event: "get_log_done", count: commits.length }));
      setState((s) => {
        s.allCommits = commits;
        s.filteredCommits = commits;
      });
      console.debug(JSON.stringify({ prefix: "[main]", event: "commits_set", count: commits.length }));
    } catch (e) {
      showOperationError(e, "commit.loadListFailed", "[main]", "load_branch_error");
    }
  }
  async function clearBranchFilter() {
    if (clearingBranchFilter) {
      console.debug(JSON.stringify({ prefix: "[main]", event: "clear_branch_filter_skipped" }));
      return;
    }
    clearingBranchFilter = true;
    try {
      setState((s) => {
        s.selectedBranch = null;
        s.logBranch = null;
        s.selectedCommits = /* @__PURE__ */ new Set();
      });
      const commits = await service.getLog(getDir(), void 0, getState().filterPaths.length ? getState().filterPaths : void 0);
      setState((s) => {
        s.allCommits = commits;
        s.filteredCommits = commits;
      });
      filterCommits();
      console.debug(JSON.stringify({ prefix: "[main]", event: "branch_filter_cleared", count: commits.length }));
    } catch (e) {
      showOperationError(e, "commit.loadListFailed", "[main]", "clear_branch_filter_error");
    } finally {
      clearingBranchFilter = false;
    }
  }
  async function loadCommitDetail(hash) {
    try {
      const detail = await service.getCommitDetail(getDir(), hash);
      const diffs = await service.getCommitDiffs(getDir(), hash);
      setState((s) => {
        s.commitDetail = detail;
        s.diffs = diffs;
      });
    } catch (e) {
      showOperationError(e, "commit.loadDetailFailed", "[main]", "load_commit_detail_error");
    }
  }
  async function loadBranches() {
    try {
      const branches = await service.getBranches(getDir());
      setState((s) => {
        s.branches = branches;
      });
    } catch (e) {
      showOperationError(e, "branch.loadFailed", "[main]", "load_branches_error");
    }
  }
  async function toggleMyBranches() {
    const next = !getState().showOnlyMyBranches;
    console.debug(JSON.stringify({ prefix: "[sidebar]", event: "toggle_my_branches", enabled: next }));
    if (!next) {
      setState((s) => {
        s.showOnlyMyBranches = false;
      });
      return;
    }
    setState((s) => {
      s.showOnlyMyBranches = true;
    });
    try {
      const mine = await service.getMyBranches(getDir());
      console.debug(JSON.stringify({ prefix: "[sidebar]", event: "my_branches_loaded", count: mine.length, names: mine }));
      setState((s) => {
        s.myBranches = new Set(mine);
      });
    } catch (e) {
      console.error(JSON.stringify({ prefix: "[sidebar]", event: "my_branches_error", error: String(e) }));
      setState((s) => {
        s.showOnlyMyBranches = false;
      });
      void host.toast({ kind: "error", message: t("sidebar.myBranchesFailed") }).catch((toastErr) => {
        console.error(JSON.stringify({ prefix: "[sidebar]", event: "my_branches_toast_error", error: String(toastErr) }));
      });
    }
  }
  async function loadFavorites() {
    try {
      const favorites = await service.getFavorites(getDir());
      setState((s) => {
        s.favorites = new Set(favorites);
      });
    } catch (e) {
      console.error("[git-manager] \u52A0\u8F7D\u6536\u85CF\u5931\u8D25:", e);
    }
  }
  async function checkGitRepository() {
    try {
      return await service.isGitRepository(getDir());
    } catch {
      return false;
    }
  }
  async function init() {
    const theme = installHostTheme(document.documentElement);
    bindLayoutStorage(host.storage);
    applyLayout();
    host.onReady((context) => {
      theme.apply(context);
      setLocale(context.locale);
      void loadLayout();
    });
    host.onDirectory((dir) => {
      console.debug(JSON.stringify({
        prefix: "[main]",
        event: "on_directory",
        dir,
        prevDir: directory,
        same: dir === directory
      }));
      const prevDir = directory;
      directory = dir;
      if (!dir) return;
      if (prevDir === dir) {
        console.debug(JSON.stringify({ prefix: "[main]", event: "on_directory_same_skip", dir }));
        return;
      }
      loadData({ reset: true });
    });
  }
  async function loadData(options = {}) {
    if (!directory) return;
    if (loadingData) {
      console.debug(JSON.stringify({ prefix: "[main]", event: "load_data_skipped" }));
      return;
    }
    loadingData = true;
    try {
      const reset = options.reset === true;
      const mode = reset ? "reset" : "refresh";
      console.debug(JSON.stringify({ prefix: "[main]", event: "load_data_start", directory, mode }));
      if (reset) {
        setState((s) => {
          s.branches = [];
          s.allCommits = [];
          s.filteredCommits = [];
          s.logBranch = null;
          s.selectedBranch = null;
          s.selectedCommit = null;
          s.selectedCommits = /* @__PURE__ */ new Set();
          s.commitDetail = null;
          s.diffs = [];
          s.branchFilter = "";
          s.commitSearch = "";
          s.filterAuthor = "";
          s.filterDateFrom = "";
          s.filterDateTo = "";
          s.filterPaths = [];
        });
        const isGit = await checkGitRepository();
        if (!isGit) {
          root.innerHTML = "";
          const empty = mountEmpty(root, {
            title: t("main.notGitTitle"),
            body: t("main.notGitBody")
          });
          disposables.push(empty);
          return;
        }
      }
      await Promise.all([
        loadBranches(),
        loadFavorites()
      ]);
      try {
        const branch = getState().logBranch || void 0;
        const commits = await service.getLog(getDir(), branch, getState().filterPaths.length ? getState().filterPaths : void 0);
        console.debug(JSON.stringify({ prefix: "[main]", event: "load_data_commits", count: commits.length }));
        setState((s) => {
          s.allCommits = commits;
          s.filteredCommits = commits;
          const hashes = new Set(commits.map((c) => c.hash));
          if (s.selectedCommit && !hashes.has(s.selectedCommit.hash)) {
            s.selectedCommit = null;
            s.commitDetail = null;
            s.diffs = [];
          }
          if (s.selectedCommits.size > 0) {
            s.selectedCommits = new Set([...s.selectedCommits].filter((h) => hashes.has(h)));
          }
        });
        filterCommits();
      } catch (e) {
        showOperationError(e, "commit.loadListFailed", "[main]", "load_data_commits_error");
      }
      if (reset) {
        await render();
      }
      console.debug(JSON.stringify({ prefix: "[main]", event: "load_data_done" }));
    } finally {
      loadingData = false;
    }
  }
  document.addEventListener("click", () => {
    hideContextMenu();
  });
  init();
  void service.debugLog("panel-loaded", { ts: (/* @__PURE__ */ new Date()).toISOString() });
})();
