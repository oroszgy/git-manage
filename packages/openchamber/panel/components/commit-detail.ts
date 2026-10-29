/**
 * Commit detail panel: hash, author, date and the full message.
 */

import { html } from '../html';
import { t, getLang } from '../i18n';
import { getState, subscribeFields, CommitInfo } from '../state';
import { ServiceClient } from '../service';

export function createCommitDetailPanel(
  container: HTMLElement,
  // Construction contract only: the panel renders from state.
  _service: ServiceClient,
  _directory: string
): { dispose: () => void } {
  let disposed = false;
  let unsubscribe: (() => void) | null = null;

  const render = () => {
    if (disposed) return;
    container.innerHTML = '';

    const state = getState();

    container.appendChild(html`
      <div class="gm-pane-header">${t('detail.title')}</div>
    `);

    const content = html`
      <div class="gm-detail"></div>
    `;

    if (!state.commitDetail) {
      content.innerHTML = `<div class="gm-empty">${t('commit.noSelection')}</div>`;
    } else {
      renderCommitDetail(content, state.commitDetail);
    }

    container.appendChild(content);

    // Rebuild the content area when the selected commit changes.
    if (unsubscribe) unsubscribe();
    unsubscribe = subscribeFields(['commitDetail'], () => {
      if (disposed) return;
      render();
    });
  };

  const renderCommitDetail = (target: HTMLElement, commit: CommitInfo) => {
    target.innerHTML = '';

    const fields = [
      { label: t('detail.hash'), value: commit.hash, mono: true },
      { label: t('detail.author'), value: `${commit.authorName} <${commit.authorEmail}>`, mono: false },
      { label: t('detail.date'), value: new Date(commit.date).toLocaleString(getLang()), mono: false },
    ];

    for (const field of fields) {
      target.appendChild(html`
        <div class="gm-detail__field">
          <div class="gm-detail__label">${field.label}</div>
          <div class="gm-detail__value ${field.mono ? 'gm-mono' : ''}">${field.value}</div>
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
  render();
  return { dispose };
}
