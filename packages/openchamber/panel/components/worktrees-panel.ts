/**
 * Worktrees 面板
 * 对齐 IDEA 的 Git worktree 管理：列出、创建、移除与清理。
 * 数据来自本地 git 命令（service 路由），不依赖宿主。
 */

import { html } from '../html';
import { t } from '../i18n';
import type { ServiceClient } from '../service';
import { showConfirmDialog, showPromptDialog } from './dialogs';
import { showOperationError } from './errors';
import type { HostClient } from '@openchamber/sdk';
/** worktree 信息（与 service 返回结构对齐） */
export interface WorktreeInfo {
  /** worktree 绝对路径 */
  path: string;
  /** 检出的提交哈希 */
  head: string;
  /** 分支引用或 null */
  branch: string | null;
  /** 是否裸仓库 */
  bare: boolean;
  /** 是否 detached HEAD */
  detached: boolean;
  /** 锁定原因 */
  locked: string | null;
  /** 是否主工作区 */
  isMain: boolean;
}

/** 面板句柄 */
export interface WorktreesPanelHandle {
  /** 重新加载列表 */
  refresh: () => Promise<void>;
  /** 释放资源 */
  dispose: () => void;
}

/**
 * 创建 Worktrees 面板
 * @param container 挂载容器
 * @param service 服务客户端
 * @param directory 仓库目录
 * @returns 面板句柄
 */
export function createWorktreesPanel(
  container: HTMLElement,
  service: ServiceClient,
  directory: string,
  host: HostClient,
): WorktreesPanelHandle {
  let disposed = false;

  container.innerHTML = '';
  // Container size belongs to the caller; the panel only fills it.
  const root = html`
    <div class="gm-wt"></div>
  `;
  container.appendChild(root);

  // Toolbar
  const toolbar = html`
    <div class="gm-wt__head">
      <button type="button" data-wt-action="add" class="gm-btn gm-btn--small">${t('worktree.add')}</button>
      <button type="button" data-wt-action="prune" class="gm-btn gm-btn--small">${t('worktree.prune')}</button>
      <button type="button" data-wt-action="refresh" class="gm-btn gm-btn--small">${t('worktree.refresh')}</button>
      <span data-wt-count class="gm-wt__count"></span>
    </div>
  `;
  root.appendChild(toolbar);

  // List
  const listEl = html`
    <div data-wt-list class="gm-wt__list"></div>
  `;
  root.appendChild(listEl);

  const countEl = toolbar.querySelector('[data-wt-count]') as HTMLElement;
  console.debug(JSON.stringify({
    prefix: '[worktree]',
    event: 'panel_created',
    toolbarButtons: toolbar.querySelectorAll('[data-wt-action]').length,
    containerChildren: container.children.length,
  }));

  /**
   * 渲染 worktree 列表
   * @param list worktree 数据
   */
  const renderList = (list: WorktreeInfo[]): void => {
    countEl.textContent = `(${list.length})`;
    listEl.innerHTML = '';

    if (list.length === 0) {
      const empty = document.createElement('div');
      empty.className = 'gm-wt__empty';
      empty.textContent = t('worktree.empty');
      listEl.appendChild(empty);
      return;
    }

    for (const wt of list) {
      const row = document.createElement('div');
      row.dataset.path = wt.path;
      row.className = 'gm-wt__row';

      // Branch name (short hash when detached)
      const branch = document.createElement('span');
      branch.className = 'gm-wt__branch';
      branch.dataset.current = String(wt.isMain);
      branch.textContent = wt.detached
        ? `detached ${wt.head.slice(0, 7)}`
        : (wt.branch ?? '').replace('refs/heads/', '');
      row.appendChild(branch);

      // 路径
      const pathEl = document.createElement('span');
      pathEl.className = 'gm-wt__path';
      pathEl.textContent = wt.path;
      pathEl.title = wt.path;
      row.appendChild(pathEl);

      // 主工作区标记
      if (wt.isMain) {
        const main = document.createElement('span');
        main.className = 'gm-wt__badge--main';
        main.textContent = t('worktree.main');
        row.appendChild(main);
      }

      // 锁定标记
      if (wt.locked) {
        const lock = document.createElement('span');
        lock.className = 'gm-wt__badge--lock';
        lock.textContent = `🔒 ${wt.locked}`;
        row.appendChild(lock);
      }

      // 移除按钮（主工作区不可移除，对齐 git 行为）
      if (!wt.isMain) {
        const removeBtn = document.createElement('button');
        removeBtn.type = 'button';
        removeBtn.textContent = t('worktree.remove');
        removeBtn.className = 'gm-btn gm-btn--small';
        removeBtn.addEventListener('click', () => {
          // 沙箱中 window.confirm 不可用，改用扩展自身对话框
          showConfirmDialog(t('worktree.removeConfirm', { path: wt.path }), async () => {
            try {
              await service.removeWorktree(directory, wt.path, false);
              await refresh();
              void host.toast({ kind: 'success', message: t('worktree.removed') }).catch(() => {});
            } catch (e) {
              const message = e instanceof Error ? e.message : String(e);
              console.error(JSON.stringify({ prefix: '[worktree]', event: 'remove_error', path: wt.path, error: message }));
              // 有未提交改动时 git 会拒绝，询问是否强制移除
              if (message.toLowerCase().includes('modified') || message.toLowerCase().includes('untracked')) {
                showConfirmDialog(t('worktree.forceConfirm', { path: wt.path }), async () => {
                  try {
                    await service.removeWorktree(directory, wt.path, true);
                    await refresh();
                    void host.toast({ kind: 'success', message: t('worktree.removed') }).catch(() => {});
                  } catch (forceErr) {
                    // 回归：强制移除失败此前只写 console，用户看不到结果
                    showOperationError(forceErr, 'worktree.removeFailed', '[worktree]', 'force_remove_error', host);
                  }
                }, true);
              } else {
                // 非「有改动」类失败（权限、被占用等）同样需要提示
                showOperationError(e, 'worktree.removeFailed', '[worktree]', 'remove_error', host);
              }
            }
          }, true);
        });
        row.appendChild(removeBtn);
      }

      listEl.appendChild(row);
    }
  };

  /**
   * 重新加载 worktree 列表
   */
  const refresh = async (): Promise<void> => {
    if (disposed) return;
    try {
      const list = await service.listWorktrees(directory);
      if (disposed) return;
      renderList(list);
      console.debug(JSON.stringify({ prefix: '[worktree]', event: 'list_loaded', count: list.length }));
    } catch (e) {
      if (disposed) return;
      console.error(JSON.stringify({ prefix: '[worktree]', event: 'list_error', error: String(e) }));
      listEl.innerHTML = `<div class="gm-wt__error">${t('worktree.loadFailed')}</div>`;
    }
  };

  // 工具栏事件
  toolbar.addEventListener('click', async (e) => {
    const target = (e.target as HTMLElement).closest('[data-wt-action]') as HTMLElement | null;
    console.debug(JSON.stringify({
      prefix: '[worktree]',
      event: 'toolbar_click',
      targetTag: (e.target as HTMLElement).tagName,
      action: target?.dataset.wtAction ?? null,
      toolbarConnected: toolbar.isConnected,
      listConnected: listEl.isConnected,
    }));
    if (!target) return;
    const action = target.dataset.wtAction;

    if (action === 'refresh') {
      await refresh();
      // 刷新本身无数据变化时用户会以为「没反应」，给出明确反馈
      void host.toast({ kind: 'success', message: t('worktree.refreshed') }).catch(() => {});
      return;
    }

    if (action === 'prune') {
      try {
        const before = listEl.querySelectorAll('[data-path]').length;
        await service.pruneWorktrees(directory);
        await refresh();
        const after = listEl.querySelectorAll('[data-path]').length;
        const removed = before - after;
        void host.toast({
          kind: 'success',
          message: removed > 0
            ? t('worktree.pruneDone', { n: removed })
            : t('worktree.pruneNothing'),
        }).catch(() => {});
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        console.error(JSON.stringify({ prefix: '[worktree]', event: 'prune_error', error: message }));
        void host.toast({ kind: 'error', message: `${t('worktree.pruneFailed')}: ${message}`, copy: true, dismiss: true }).catch(() => {});
      }
      return;
    }

    if (action === 'add') {
      // 沙箱中 window.prompt 不可用（返回 null），改用扩展自身输入对话框
      showPromptDialog(
        t('worktree.add'),
        [
          { label: t('worktree.addPathPrompt'), placeholder: '/path/to/worktree' },
          { label: t('worktree.addBranchPrompt', { base: 'HEAD' }), placeholder: 'feature/xxx' },
        ],
        async ([path, branch]) => {
          if (!path || !branch) return;
          try {
            // createBranch=true：以新分支创建 worktree
            await service.addWorktree(directory, path, branch, true, undefined);
            await refresh();
            void host.toast({ kind: 'success', message: t('worktree.added', { path }) }).catch(() => {});
          } catch (err) {
            const message = err instanceof Error ? err.message : String(err);
            console.error(JSON.stringify({ prefix: '[worktree]', event: 'add_error', path, branch, error: message }));
            showConfirmDialog(`${t('worktree.addFailed')}: ${message}`, () => {}, true);
          }
        },
      );
    }
  });

  void refresh();

  return {
    refresh,
    dispose: () => {
      if (disposed) return;
      disposed = true;
      container.innerHTML = '';
    },
  };
}
