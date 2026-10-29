/**
 * Changed-files panel: file list on top, diff preview below.
 * Split of the IntelliJ "Local Changes" tool window.
 */

import { html } from '../html';
import { getState, subscribeFields, FileDiff, DiffLine } from '../state';
import { ServiceClient } from '../service';
import { showFileContextMenu } from './file-context-menu';
import { t } from '../i18n';
import { highlightLine } from '../syntax';

export function createFileDiffPanel(
  container: HTMLElement,
  service: ServiceClient,
  directory: string
): { dispose: () => void } {
  let disposed = false;
  let listContainer: HTMLElement | null = null;
  let previewContainer: HTMLElement | null = null;
  let selectedPath: string | null = null;
  let unsubscribe: (() => void) | null = null;
  let titleEl: HTMLElement | null = null;

  const findPathFromEvent = (e: Event): string | null => {
    const target = e.target as HTMLElement;
    const item = target.closest('[data-path]');
    if (!item) return null;
    return item.getAttribute('data-path');
  };

  /** Reflect the selected file in the list without touching inline styles. */
  const paintSelection = (path: string | null): void => {
    listContainer?.querySelectorAll<HTMLElement>('[data-path]').forEach((el) => {
      el.setAttribute('aria-selected', String(el.getAttribute('data-path') === path));
    });
  };

  const renderPreview = (diff: FileDiff | null) => {
    if (!previewContainer) return;
    previewContainer.innerHTML = '';

    if (!diff) {
      previewContainer.innerHTML = `<div class="gm-empty">${t('file.selectDiff')}</div>`;
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
      diffContent.innerHTML = `<div class="gm-empty">${t('file.noDiff')}</div>`;
    }

    previewContainer.appendChild(diffContent);
  };

  const render = () => {
    if (disposed) return;
    container.innerHTML = '';

    const state = getState();
    titleEl = html`
      <div class="gm-pane-header">
        ${t('file.changedFiles')}
        <span class="gm-pane-header__count" data-file-count>${state.diffs.length}</span>
      </div>
    `;
    container.appendChild(titleEl);

    // File list and preview share the column.
    const splitArea = html`
      <div class="gm-diff"></div>
    `;

    listContainer = html`
      <div class="gm-file-list"></div>
    `;

    listContainer.addEventListener('click', (e) => {
      const path = findPathFromEvent(e);
      if (!path) return;
      selectedPath = path;
      const diff = getState().diffs.find(d => d.path === path) || null;
      renderPreview(diff);
      paintSelection(path);
    });

    listContainer.addEventListener('contextmenu', (e) => {
      const path = findPathFromEvent(e);
      if (path) {
        e.preventDefault();
        const diff = getState().diffs.find(d => d.path === path);
        if (diff) showFileContextMenu(e, diff, service, directory);
      }
    });

    splitArea.appendChild(listContainer);

    previewContainer = html`
      <div class="gm-diff__preview"></div>
    `;
    splitArea.appendChild(previewContainer);

    container.appendChild(splitArea);

    renderFileList();
    renderPreview(null);

    // Keep the header count and the list in step when the commit changes.
    if (unsubscribe) unsubscribe();
    unsubscribe = subscribeFields(['diffs'], () => {
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
    const span = titleEl.querySelector('[data-file-count]');
    if (span) span.textContent = String(count);
  };

  const renderFileList = () => {
    if (!listContainer) return;
    const state = getState();
    listContainer.innerHTML = '';
    if (state.diffs.length === 0) {
      listContainer.innerHTML = `<div class="gm-empty">${t('file.noChanges')}</div>`;
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
  render();
  return { dispose };
}

/**
 * Render one diff line (also reused by the compare view).
 * @param line Diff line
 * @returns Diff line element
 */
export function createDiffLine(line: DiffLine): HTMLElement {
  const isAdd = line.type === 'add';
  const isDelete = line.type === 'delete';
  const type = isAdd ? 'add' : isDelete ? 'delete' : 'context';
  const prefix = isAdd ? '+' : isDelete ? '-' : ' ';

  const lineNum = line.newLine !== undefined ? String(line.newLine) : ' ';
  const oldNum = line.oldLine !== undefined ? String(line.oldLine) : ' ';

  return html`
    <div class="gm-diff__line" data-type="${type}">
      <span class="gm-diff__num">${oldNum}</span>
      <span class="gm-diff__num">${lineNum}</span>
      <span class="gm-diff__sign">${prefix}</span>
      <span class="gm-diff__text">${highlightLine(line.content)}</span>
    </div>
  `;
}

function createFileDiffItem(diff: FileDiff): HTMLElement {
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

function getStatusLabel(path: string): string {
  if (path.includes('.new.') || path.includes('.added.')) return 'A';
  if (path.includes('.deleted.') || path.includes('.removed.')) return 'D';
  if (path.includes('.modified.') || path.includes('.changed.')) return 'M';
  if (path.includes('.renamed.')) return 'R';
  return 'M';
}
