/**
 * 右键菜单组件
 * 显示分支操作菜单
 */

import { html } from '../html';
import { getState, setState, Branch, CommitInfo } from '../state';
import { t } from '../i18n';
import { host } from '../host';
import { ServiceClient, DeleteBranchResult } from '../service';
import { showRenameDialog, showDeleteBranchDialog, parseDeleteBranchError, showRewordCommitDialog, showConfirmDialog, showCreateBranchDialog } from './dialogs';
import { showBranchDeletedNotify } from './notify';
import { classifyGitError, showOperationError } from './errors';
import { deleteBranches, resolveDeleteTargets } from './batch-delete';

/** 隐藏右键菜单 */
export function hideContextMenu(): void {
  const existing = document.getElementById('git-context-menu');
  if (existing) existing.remove();
}

/**
 * 删除分支成功后的统一处理（对齐 IDEA GitDeleteBranchOperation）：
 * ① 发删除通知卡片（还原 / 删除跟踪动作闭包在此构造）
 * ② 刷新分支列表并清理选中态（刷新失败仅记日志——删除成功事实优先）
 * ③ 输出成功日志
 * @param res service.deleteBranch 成功响应（含还原所需的 kind/tip/upstream/canDeleteTracking）
 * @param branch 被删除的分支
 * @param service 服务客户端（刷新与还原/删跟踪回调共用）
 * @param directory 仓库目录
 */
async function onBranchDeleted(
  res: DeleteBranchResult,
  branch: Branch,
  service: ServiceClient,
  directory: string,
): Promise<void> {
  // 删除时是否命中选中分支：还原回调据此恢复 selectedBranch
  const wasSelected = getState().selectedBranch?.name === branch.name;

  showBranchDeletedNotify({
    branchName: branch.name,
    // 仅本地分支提供"还原"：按删除前捕获的 tip（与 upstream）重建分支
    onRestore: res.kind === 'local'
      ? async () => {
          await service.restoreBranch(directory, branch.name, res.tip, res.upstream);
          // 刷新失败仅日志：回调 resolve 以 restoreBranch 成功为准（通知卡片正常关闭）
          try {
            const branches = await service.getBranches(directory);
            setState(s => {
              s.branches = branches;
              // 因删除而清空的选中分支：还原成功后恢复选中
              if (wasSelected) s.selectedBranch = branches.find(b => b.name === branch.name) ?? null;
            });
          } catch (refreshErr) {
            console.error(JSON.stringify({
              prefix: '[context-menu]',
              event: 'branch_restore_refresh_error',
              branch: branch.name,
              error: String(refreshErr),
            }));
          }
          // 还原成功提示（IDEA：删除跟踪成功无额外提示）
          void host.toast({ kind: 'success', message: t('branch.restoreSuccess', { name: branch.name }) })
            .catch((toastErr) => {
              console.error(JSON.stringify({ prefix: '[context-menu]', event: 'branch_restore_toast_error', error: String(toastErr) }));
            });
        }
      : undefined,
    // 本地分支且服务端允许删跟踪分支、有 upstream 时提供"删除跟踪的分支"
    onDeleteTracking: res.kind === 'local' && res.canDeleteTracking && res.upstream
      ? async () => {
          await service.deleteRemoteBranch(directory, res.upstream!.remote, res.upstream!.branch);
          // 刷新失败仅日志：通知卡片正常关闭
          try {
            const branches = await service.getBranches(directory);
            setState(s => { s.branches = branches; });
          } catch (refreshErr) {
            console.error(JSON.stringify({
              prefix: '[context-menu]',
              event: 'branch_delete_tracking_refresh_error',
              branch: branch.name,
              error: String(refreshErr),
            }));
          }
        }
      : undefined,
  });

  // 删除后刷新：失败只记日志不回抛（已删成功的事实优先，不显示删除失败）
  try {
    const branches = await service.getBranches(directory);
    setState(s => {
      s.branches = branches;
      // 删除的是选中分支时清空选中态
      if (s.selectedBranch?.name === branch.name) s.selectedBranch = null;
    });
  } catch (refreshErr) {
    console.error(JSON.stringify({
      prefix: '[context-menu]',
      event: 'branch_delete_refresh_error',
      branch: branch.name,
      error: String(refreshErr),
    }));
  }

  console.debug(JSON.stringify({ prefix: '[context-menu]', event: 'branch_delete_success', branch: branch.name, kind: res.kind }));
}

/**
 * 删除分支统一入口（IDEA DeleteBranchAction 语义）：
 * 无确认直接删除，服务端返回 NOT_MERGED 时弹强制删除对话框，其余错误 toast 提示
 * @param service 服务客户端
 * @param directory 仓库目录
 * @param branch 目标分支
 * @returns 是否删除成功；未合并时返回 false（强制删除交由对话框异步完成），批量场景据此汇总
 */
export async function performBranchDelete(
  service: ServiceClient,
  directory: string,
  branch: Branch,
): Promise<boolean> {
  console.debug(JSON.stringify({ prefix: '[context-menu]', event: 'branch_delete_start', branch: branch.name }));
  try {
    // 对齐 IDEA：无确认直接删除，仅服务端返回 NOT_MERGED 时才弹强制删除对话框
    const res = await service.deleteBranch(directory, branch.name);
    await onBranchDeleted(res, branch, service, directory);
    return true;
  } catch (e) {
    const { code, message } = parseDeleteBranchError(e);
    console.debug(JSON.stringify({
      prefix: '[context-menu]',
      event: 'branch_delete_failed',
      branch: branch.name,
      code: code ?? null,
    }));
    if (code === 'NOT_MERGED') {
      // IDEA 未合并语义：仅此时打开强制删除对话框（打开即 force 模式）
      showDeleteBranchDialog(branch.name, async (force) => {
        const forceRes = await service.deleteBranch(directory, branch.name, force);
        await onBranchDeleted(forceRes, branch, service, directory);
      });
    } else if (code === 'NOT_FOUND') {
      void host.toast({ kind: 'error', message: t('branch.notFound', { name: branch.name }) })
        .catch((toastErr) => {
          console.error(JSON.stringify({ prefix: '[context-menu]', event: 'branch_delete_toast_error', error: String(toastErr) }));
        });
    } else {
      // GIT_ERROR / 非 JSON（网络层等）：失败前缀 + 原始 message
      void host.toast({ kind: 'error', message: `${t('branch.deleteFailed')}: ${message}` })
        .catch((toastErr) => {
          console.error(JSON.stringify({ prefix: '[context-menu]', event: 'branch_delete_toast_error', error: String(toastErr) }));
        });
    }
    return false;
  }
}

/** 菜单项类型 */
interface MenuItem {
  label: string;
  icon?: string;
  danger?: boolean;
  /** 禁用态（仅展示，不可点击执行） */
  disabled?: boolean;
  action: () => void | Promise<void>;
}

interface MenuSeparator {
  type: 'separator';
}

/** 显示右键菜单 */
/**
 * 统一执行分支/提交类操作：成功刷新并提示，失败分类提示
 * 供右键菜单复用，避免每个动作各自实现（历史上多处只写 console 导致「点击无反应」）
 * @param options 执行参数
 */
async function runGitAction(options: {
  /** 服务客户端 */
  service: ServiceClient;
  /** 仓库目录 */
  directory: string;
  /** 日志与提示中使用的动作名 */
  action: string;
  /** 实际执行体 */
  run: () => Promise<void>;
  /** 成功提示文案（已含参数） */
  successMessage: string;
  /** 是否刷新分支列表（签出/删除/新建等需要） */
  refreshBranches?: boolean;
  /** 是否刷新提交列表（提交类操作需要） */
  refreshCommits?: boolean;
}): Promise<void> {
  const { service, directory, action, run, successMessage } = options;
  console.debug(JSON.stringify({ prefix: '[context-menu]', event: `${action}_start` }));
  try {
    await run();
    // 刷新：任一步失败只记录日志，不影响「操作成功」这一事实
    if (options.refreshBranches) {
      try {
        const branches = await service.getBranches(directory);
        setState(s => { s.branches = branches; });
      } catch (e) {
        console.error(JSON.stringify({ prefix: '[context-menu]', event: `${action}_refresh_branches_error`, error: String(e) }));
      }
    }
    if (options.refreshCommits) {
      await reloadCommits(service, directory);
    }
    console.debug(JSON.stringify({ prefix: '[context-menu]', event: `${action}_done` }));
    void host.toast({ kind: 'success', message: successMessage }).catch(() => {});
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(JSON.stringify({ prefix: '[context-menu]', event: `${action}_error`, error: message }));
    const reasonKey = classifyGitError(message);
    // 已知类型用专门文案，其余附带原始错误便于排查
    const text = reasonKey
      ? `${t(reasonKey)}: ${message}`
      : `${t('op.failed')}: ${message}`;
    void host.toast({ kind: 'error', message: text, copy: true, dismiss: true }).catch(() => {});
  }
}

export function showContextMenu(
  e: MouseEvent,
  branch: Branch,
  service: ServiceClient,
  directory: string
): void {
  hideContextMenu();

  const state = getState();

  const menu = document.createElement("div");
  menu.id = "git-context-menu";
  menu.className = "gm-popup gm-popup--wide";
  // 坐标在打开时按指针计算，属于运行时数据；外观全部来自 .gm-popup
  menu.style.left = `${e.clientX}px`;
  menu.style.top = `${e.clientY}px`;

  // 删除目标：多选时作用于全部选中分支；未多选时就是右键的这个分支。
  // 参数语义与侧栏删除按钮一致：selectedBranches 非空时以多选为准
  const deleteTargets = resolveDeleteTargets(
    getState().branches,
    branch,
    getState().selectedBranches,
  );

  const items: (MenuItem | MenuSeparator)[] = [
    {
      label: t('branch.checkout'),
      action: () => runGitAction({
        service, directory, action: 'checkout', refreshBranches: true, refreshCommits: true,
        successMessage: t('op.checkoutDone', { name: branch.name }),
        run: async () => { await service.checkoutBranch(directory, branch.name); },
      }),
    },
    {
      label: t('branch.rename'),
      action: () => showRenameDialog(branch, service, directory),
    },
    {
      label: t('branch.merge'),
      action: () => runGitAction({
        service, directory, action: 'merge', refreshBranches: true, refreshCommits: true,
        successMessage: t('op.mergeDone', { name: branch.name }),
        run: async () => { await service.mergeBranch(directory, branch.name); },
      }),
    },
    {
      label: t('branch.rebase'),
      action: () => runGitAction({
        service, directory, action: 'rebase', refreshBranches: true, refreshCommits: true,
        successMessage: t('op.rebaseDone', { name: branch.name }),
        run: async () => { await service.rebaseBranch(directory, branch.name); },
      }),
    },
    { type: "separator" },
    {
      label: t('branch.pull'),
      action: () => runGitAction({
        service, directory, action: 'pull', refreshBranches: true, refreshCommits: true,
        successMessage: t('op.pullDone'),
        run: async () => { await service.pull(directory); },
      }),
    },
    {
      label: t('branch.push'),
      action: () => runGitAction({
        service, directory, action: 'push', refreshBranches: true,
        successMessage: t('op.pushDone'),
        run: async () => { await service.push(directory); },
      }),
    },
    { type: "separator" },
    {
      label: state.favorites.has(branch.name) ? t('branch.unfavorite') : t('branch.favorite'),
      action: async () => {
        const previous = getState().favorites;
        const next = new Set(previous);
        if (next.has(branch.name)) {
          next.delete(branch.name);
        } else {
          next.add(branch.name);
        }
        setState(s => { s.favorites = next; });
        try {
          await service.saveFavorites(directory, [...next]);
        } catch (e) {
          // 保存失败需回滚本地状态，否则界面显示已收藏但实际未落盘
          setState(s => { s.favorites = previous; });
          showOperationError(e, 'branch.favoriteSaveFailed', '[context-menu]', 'save_favorites_error');
        }
      },
    },
    { type: "separator" },
    {
      label: t('branch.delete'),
      danger: true,
      // IDEA DeleteBranchAction：多选时批量删除全部选中分支，含当前分支时整体禁用
      disabled: deleteTargets.kind === 'current',
      action: async () => {
        if (deleteTargets.kind !== 'ok') return;
        await deleteBranches(service, host, directory, deleteTargets.targets);
        // 删除后清空多选集合，避免下次操作仍指向已删除分支
        setState(s => { s.selectedBranches = new Set<string>(); });
      },
    },
  ];

  /**
   * 按文案在菜单项列表中查找对应项（分隔线无文案不会命中）
   * @param label 菜单项文案
   * @returns 命中的菜单项；未命中返回 undefined
   */
  const findItemByLabel = (label: string | null): MenuItem | undefined =>
    items.find(i => !("type" in i) && (i as MenuItem).label === label) as MenuItem | undefined;

  for (const item of items) {
    if ("type" in item && item.type === "separator") {
      const sep = document.createElement("div");
      sep.className = "gm-popup__sep";
      menu.appendChild(sep);
      continue;
    }

    const menuItem = item as MenuItem;
    const el = document.createElement("div");
    el.className = menuItem.danger ? "gm-menu-item gm-menu-item--destructive" : "gm-menu-item";
    el.dataset.disabled = menuItem.disabled ? "true" : "false";
    el.textContent = menuItem.label;

    menu.appendChild(el);
  }

  // 悬停高亮由样式表 .gm-menu-item:hover 承担，禁用项由 [data-disabled="true"] 兜底

  menu.addEventListener('click', async (e) => {
    const target = (e.target as HTMLElement).closest('div');
    if (!target || target.parentElement !== menu) return;

    const item = findItemByLabel(target.textContent);
    // 禁用项（如当前分支的删除）点击不执行动作、不关闭菜单
    if (!item || target.dataset.disabled === 'true') return;
    hideContextMenu();
    await item.action();
  });

  document.body.appendChild(menu);

  // 点击其他地方关闭
  const closeHandler = (ev: MouseEvent) => {
    if (!menu.contains(ev.target as Node)) {
      hideContextMenu();
      document.removeEventListener("click", closeHandler);
    }
  };
  setTimeout(() => document.addEventListener("click", closeHandler), 0);
}

/** 显示提交右键菜单 @param batchHashes 多选批量操作的提交哈希（旧→新）；为 undefined 时显示单提交菜单 */
export function showCommitContextMenu(
  e: MouseEvent,
  commit: CommitInfo,
  service: ServiceClient,
  directory: string,
  batchHashes?: string[],
  /**
   * 工作区是否有未提交改动（由调用方预先查询）
   * 改写历史的动作（编辑信息/删除提交）在此为 true 时置灰，
   * 与 IDEA 一致：不可用时菜单项直接禁用而非点击后报错
   */
  dirtyWorkingTree = false,
): void {
  hideContextMenu();

  const isBatch = !!batchHashes && batchHashes.length > 1;

  const items: (MenuItem | MenuSeparator)[] = isBatch
    ? buildBatchCommitItems(batchHashes!, service, directory)
    : buildSingleCommitItems(commit, service, directory, dirtyWorkingTree);

  /**
   * 按文案在菜单项列表中查找对应项（分隔线无文案不会命中）
   * @param label 菜单项文案
   * @returns 命中的菜单项；未命中返回 undefined
   */
  const findItemByLabel = (label: string | null): MenuItem | undefined =>
    items.find(i => !("type" in i) && (i as MenuItem).label === label) as MenuItem | undefined;

  const menu = html`
    <div id="git-context-menu" class="gm-popup gm-popup--wide"></div>
  `;
  // 坐标在打开时按指针计算，属于运行时数据；外观全部来自 .gm-popup
  menu.style.left = `${e.clientX}px`;
  menu.style.top = `${e.clientY}px`;

  for (const item of items) {
    if ("type" in item && item.type === "separator") {
      const sep = document.createElement("div");
      sep.className = "gm-popup__sep";
      menu.appendChild(sep);
      continue;
    }

    const menuItem = item as MenuItem;
    const el = document.createElement("div");
    el.className = menuItem.danger ? "gm-menu-item gm-menu-item--destructive" : "gm-menu-item";
    el.dataset.disabled = menuItem.disabled ? "true" : "false";
    el.textContent = menuItem.label;

    menu.appendChild(el);
  }

  // 悬停高亮由样式表 .gm-menu-item:hover 承担，禁用项由 [data-disabled="true"] 兜底

  menu.addEventListener('click', async (ev) => {
    const target = (ev.target as HTMLElement).closest('div');
    if (!target || target.parentElement !== menu) return;

    const item = findItemByLabel(target.textContent);
    // 禁用项（如批量菜单的"已选中"标题）点击不执行动作、不关闭菜单
    if (!item || target.dataset.disabled === 'true') return;
    hideContextMenu();
    await item.action();
  });

  document.body.appendChild(menu);

  const closeHandler = (ev: MouseEvent) => {
    if (!menu.contains(ev.target as Node)) {
      hideContextMenu();
      document.removeEventListener("click", closeHandler);
    }
  };
  setTimeout(() => document.addEventListener("click", closeHandler), 0);
}

/** 单提交右键菜单项 */
/**
 * 重新拉取提交列表并写入状态
 * 不直接依赖 commit-list 的 refreshCommits：两者互相导入会形成循环依赖，
 * 这里只做数据刷新，界面由 commit-list 的既有订阅驱动重渲染
 * @param service 服务客户端
 * @param directory 仓库目录
 */
async function reloadCommits(service: ServiceClient, directory: string): Promise<void> {
  const state = getState();
  const branch = state.logBranch || undefined;
  const paths = state.filterPaths.length ? [...state.filterPaths] : undefined;
  try {
    const commits = await service.getLog(directory, branch, paths);
    setState(s => {
      s.allCommits = commits;
      s.filteredCommits = commits;
    });
    console.debug(JSON.stringify({ prefix: '[context-menu]', event: 'commits_reloaded', count: commits.length }));
  } catch (e) {
    console.error(JSON.stringify({ prefix: '[context-menu]', event: 'commits_reload_error', error: String(e) }));
  }
}

/**
 * 复制文本到剪贴板
 * 沙箱 iframe 中 navigator.clipboard 常不可用（不安全上下文 / 无用户激活），
 * 故优先走宿主提供的剪贴板通道，失败再回退到浏览器 API 与 execCommand
 * @param text 待复制文本
 * @param label 日志与提示中使用的用途描述
 * @returns 是否复制成功
 */
async function copyToClipboard(text: string, label: string): Promise<boolean> {
  // 1. 宿主通道（沙箱环境唯一可靠方式）
  try {
    await host.writeClipboard(text);
    console.debug(JSON.stringify({ prefix: '[context-menu]', event: 'clipboard_copied', label, via: 'host' }));
    void host.toast({ kind: 'success', message: t('commit.copied') }).catch(() => {});
    return true;
  } catch (e) {
    console.debug(JSON.stringify({ prefix: '[context-menu]', event: 'clipboard_host_failed', label, error: String(e) }));
  }

  // 2. 浏览器 Clipboard API
  try {
    await navigator.clipboard.writeText(text);
    console.debug(JSON.stringify({ prefix: '[context-menu]', event: 'clipboard_copied', label, via: 'navigator' }));
    void host.toast({ kind: 'success', message: t('commit.copied') }).catch(() => {});
    return true;
  } catch (e) {
    console.debug(JSON.stringify({ prefix: '[context-menu]', event: 'clipboard_navigator_failed', label, error: String(e) }));
  }

  // 3. 兜底：隐藏 textarea + execCommand
  try {
    const area = document.createElement('textarea');
    area.value = text;
    area.style.position = 'fixed';
    area.style.opacity = '0';
    document.body.appendChild(area);
    area.select();
    const ok = document.execCommand('copy');
    area.remove();
    if (ok) {
      console.debug(JSON.stringify({ prefix: '[context-menu]', event: 'clipboard_copied', label, via: 'execCommand' }));
      void host.toast({ kind: 'success', message: t('commit.copied') }).catch(() => {});
      return true;
    }
  } catch (e) {
    console.error(JSON.stringify({ prefix: '[context-menu]', event: 'clipboard_exec_failed', label, error: String(e) }));
  }

  console.error(JSON.stringify({ prefix: '[context-menu]', event: 'clipboard_failed', label }));
  void host.toast({ kind: 'error', message: t('commit.copyFailed') }).catch(() => {});
  return false;
}

/**
 * 判断提交是否为当前分支的最新提交
 * 撤销提交只对 HEAD 有效，其余情况应置灰而非点击后失败
 * @param commit 提交
 * @returns 是 HEAD 返回 true
 */
function isCurrentHead(commit: CommitInfo): boolean {
  const current = getState().branches.find(b => b.isCurrent);
  if (!current?.commit) return false;
  return commit.hash.startsWith(current.commit);
}

function buildSingleCommitItems(
  commit: CommitInfo,
  service: ServiceClient,
  directory: string,
  dirtyWorkingTree = false,
): (MenuItem | MenuSeparator)[] {
  return [
    {
      label: t('commit.copyRevision'),
      action: () => { void copyToClipboard(commit.hash, 'revision'); },
    },
    { type: "separator" },
    {
      label: t('commit.cherryPick'),
      action: async () => {
        console.debug(JSON.stringify({ prefix: '[context-menu]', event: 'cherry_pick_start', hash: commit.hash }));
        try {
          await service.cherryPick(directory, commit.hash);
          // 成功后刷新提交列表，让用户看到 pick 出的新提交
          await reloadCommits(service, directory);
          console.debug(JSON.stringify({ prefix: '[context-menu]', event: 'cherry_pick_done', hash: commit.hash }));
          void host.toast({ kind: 'success', message: t('commit.cherryPickDone', { hash: commit.shortHash }) })
            .catch(() => {});
        } catch (err) {
          const message = err instanceof Error ? err.message : String(err);
          console.error(JSON.stringify({
            prefix: '[context-menu]',
            event: 'cherry_pick_error',
            hash: commit.hash,
            error: message,
          }));
          // cherry-pick 冲突时 git 会留下 CHERRY_PICK_HEAD，需提示用户处理
          const conflict = message.toLowerCase().includes('conflict')
            || message.toLowerCase().includes('cherry-pick is already in progress');
          void host.toast({
            kind: 'error',
            message: conflict
              ? t('commit.cherryPickConflict')
              : `${t('commit.cherryPickFailed')}: ${message}`,
            copy: true,
            dismiss: true,
          }).catch(() => {});
        }
      },
    },
    {
      label: t('commit.compareLocal'),
      action: async () => {
        try {
          const diffs = await service.diffVsLocal(directory, commit.hash);
          setState(s => { s.diffs = diffs; });
          hideContextMenu();
        } catch (err) {
          // 回归：此前只写 console，用户点「与本地比较」后界面毫无变化
          showOperationError(err, 'compare.loadFailed', '[context-menu]', 'compare_local_error');
        }
      },
    },
    { type: "separator" },
    {
      label: t('commit.reset'),
      action: () => {
        showResetDialog(commit, service, directory);
      },
    },
    {
      label: t('commit.revert'),
      action: async () => {
        console.debug(JSON.stringify({ prefix: '[context-menu]', event: 'revert_start', hash: commit.hash }));
        try {
          await service.revert(directory, commit.hash);
          // 成功后刷新列表：revert 会新增一条反向提交，不刷新则界面看不到变化
          await reloadCommits(service, directory);
          console.debug(JSON.stringify({ prefix: '[context-menu]', event: 'revert_done', hash: commit.hash }));
          void host.toast({ kind: 'success', message: t('commit.revertDone', { hash: commit.shortHash }) })
            .catch(() => {});
        } catch (err) {
          const message = err instanceof Error ? err.message : String(err);
          console.error(JSON.stringify({
            prefix: '[context-menu]',
            event: 'revert_error',
            hash: commit.hash,
            error: message,
          }));
          // 冲突时 git 会留下 REVERT_HEAD，需提示用户处理
          const conflict = message.toLowerCase().includes('conflict')
            || message.toLowerCase().includes('revert is already in progress');
          void host.toast({
            kind: 'error',
            message: conflict
              ? t('commit.revertConflict')
              : `${t('commit.revertFailed')}: ${message}`,
            copy: true,
            dismiss: true,
          }).catch(() => {});
        }
      },
    },
    { type: "separator" },
    {
      // 撤销提交：仅选中当前分支最新提交时可用（对齐 IDEA Uncommit 的置灰规则）
      // 非 HEAD 提交点了会失败，故直接禁用，避免用户误以为成功
      label: t('commit.uncommit'),
      disabled: !isCurrentHead(commit),
      action: async () => {
        try {
          await service.undoCommit(directory, commit.hash);
          await reloadCommits(service, directory);
          void host.toast({ kind: 'success', message: t('commit.uncommitDone', { hash: commit.shortHash }) }).catch(() => {});
        } catch (err) {
          const message = err instanceof Error ? err.message : String(err);
          console.error(JSON.stringify({ prefix: '[context-menu]', event: 'uncommit_error', hash: commit.hash, error: message }));
          void host.toast({ kind: 'error', message: `${t('commit.uncommitFailed')}: ${message}`, copy: true, dismiss: true }).catch(() => {});
        }
      },
    },
    {
      label: t('commit.reword'),
      // 工作区不干净时置灰（菜单打开即判定，对齐 IDEA 禁用不可用项的做法）
      disabled: dirtyWorkingTree,
      action: async () => {
        showRewordCommitDialog(commit.message, async (message) => {
          await service.rewordCommit(directory, commit.hash, message);
          await reloadCommits(service, directory);
          void host.toast({ kind: 'success', message: t('commit.rewordDone') }).catch(() => {});
        });
      },
    },
    {
      label: t('commit.dropCommit'),
      danger: true,
      disabled: dirtyWorkingTree,
      action: () => {
        // 沙箱中 window.confirm 不可用，改用扩展自身对话框
        showConfirmDialog(t('commit.dropConfirm', { hash: commit.shortHash }), async () => {
        try {
          await service.dropCommit(directory, commit.hash);
          await reloadCommits(service, directory);
          void host.toast({ kind: 'success', message: t('commit.dropDone', { hash: commit.shortHash }) }).catch(() => {});
        } catch (err) {
          const message = err instanceof Error ? err.message : String(err);
          console.error(JSON.stringify({ prefix: '[context-menu]', event: 'drop_commit_error', hash: commit.hash, error: message }));
          void host.toast({ kind: 'error', message: `${t('commit.dropFailed')}: ${message}`, copy: true, dismiss: true }).catch(() => {});
        }
        }, true);
      },
    },
    { type: "separator" },
    {
      // 推送此前所有提交：把当前分支推到远端（含所选提交）
      label: t('commit.pushUpTo'),
      action: async () => {
        const branch = getState().branches.find(b => b.isCurrent)?.name
          ?? getState().branches.find(b => !b.isRemote && b.commit === commit.hash)?.name;
        if (!branch) {
          void host.toast({ kind: 'error', message: t('commit.pushNoBranch') }).catch(() => {});
          return;
        }
        try {
          const res = await service.pushUpTo(directory, commit.hash, branch);
          void host.toast({ kind: 'success', message: t('commit.pushUpToDone', { ref: res.ref }) }).catch(() => {});
        } catch (err) {
          const message = err instanceof Error ? err.message : String(err);
          console.error(JSON.stringify({ prefix: '[context-menu]', event: 'push_up_to_error', hash: commit.hash, error: message }));
          // git 的非快进拒绝需提示先拉取
          const rejected = message.toLowerCase().includes('rejected') || message.toLowerCase().includes('non-fast-forward');
          void host.toast({
            kind: 'error',
            message: rejected ? t('commit.pushUpToRejected') : `${t('commit.pushUpToFailed')}: ${message}`,
            copy: true,
            dismiss: true,
          }).catch(() => {});
        }
      },
    },
    { type: "separator" },
    {
      label: t('commit.newBranch'),
      action: () => {
        // 与侧栏新建分支共用同一对话框，差异仅标题、起点说明与创建后的提交列表刷新
        showCreateBranchDialog({
          service,
          directory,
          startPoint: commit.hash,
          startPointLabel: t('dialog.basedOn', { info: `${commit.shortHash} - ${commit.message}` }),
          titleKey: 'dialog.branchFromCommit',
          entry: 'context-menu',
          onCreated: () => reloadCommits(service, directory),
        });
      },
    },
    {
      label: t('commit.newTag'),
      action: () => {
        console.log("[git-manager] New Tag from commit:", commit.hash);
      },
    },
  ];
}

/** 多选批量右键菜单项 @param hashes 选中提交哈希（旧→新） */
function buildBatchCommitItems(
  hashes: string[],
  service: ServiceClient,
  directory: string
): (MenuItem | MenuSeparator)[] {
  return [
    {
      label: t('batch.selected', { n: hashes.length }),
      disabled: true,
      action: () => {},
    },
    { type: "separator" },
    {
      label: t('batch.copyHashes'),
      action: async () => {
        await copyToClipboard(hashes.join('\n'), 'hash-list');
      },
    },
    {
      label: t('batch.cherryPickAll', { n: hashes.length }),
      action: () => {
        showConfirmDialog(t('batch.confirmCherryPick', { n: hashes.length }), async () => {
        console.debug(JSON.stringify({ prefix: '[context-menu]', event: 'batch_cherry_pick_start', count: hashes.length }));
        let done = 0;
        for (const hash of hashes) {
          try {
            await service.cherryPick(directory, hash);
            done += 1;
          } catch (err) {
            const message = err instanceof Error ? err.message : String(err);
            console.error(JSON.stringify({
              prefix: '[context-menu]',
              event: 'batch_cherry_pick_error',
              hash,
              done,
              total: hashes.length,
              error: message,
            }));
            // 中断：提示已完成数量与失败原因，并刷新已生效的部分
            await reloadCommits(service, directory);
            const conflict = message.toLowerCase().includes('conflict');
            void host.toast({
              kind: 'error',
              message: `${conflict ? t('commit.cherryPickConflict') : t('commit.cherryPickFailed')}: ${message}`,
              copy: true,
              dismiss: true,
            }).catch(() => {});
            return;
          }
        }
        await reloadCommits(service, directory);
        console.debug(JSON.stringify({ prefix: '[context-menu]', event: 'batch_cherry_pick_done', count: done }));
        void host.toast({ kind: 'success', message: t('batch.cherryPickDone', { n: done }) }).catch(() => {});
        });
      },
    },
    {
      label: t('batch.revertAll', { n: hashes.length }),
      action: () => {
        showConfirmDialog(t('batch.confirmRevert', { n: hashes.length }), async () => {
          let done = 0;
          for (const hash of hashes) {
            try {
              await service.revert(directory, hash);
              done += 1;
            } catch (err) {
              const message = err instanceof Error ? err.message : String(err);
              console.error(JSON.stringify({
                prefix: '[context-menu]',
                event: 'batch_revert_error',
                hash,
                done,
                total: hashes.length,
                error: message,
              }));
              // 中断：刷新已生效部分并提示原因
              await reloadCommits(service, directory);
              const conflict = message.toLowerCase().includes('conflict');
              void host.toast({
                kind: 'error',
                message: conflict ? t('commit.revertConflict') : `${t('commit.revertFailed')}: ${message}`,
                copy: true,
                dismiss: true,
              }).catch(() => {});
              return;
            }
          }
          await reloadCommits(service, directory);
          void host.toast({ kind: 'success', message: t('batch.revertDone', { n: done }) }).catch(() => {});
        });
      },
    },
  ];
}

/** 显示 Reset 对话框 */
function showResetDialog(commit: CommitInfo, service: ServiceClient, directory: string): void {
  const overlay = html`
    <div class="gm-dialog-backdrop">
      <div class="gm-dialog gm-dialog--wide">
        <div class="gm-dialog__title">${t('reset.title')}</div>
        <div class="gm-dialog__hint">${commit.shortHash} - ${commit.message}</div>
        <div class="gm-dialog__choices">
          <label class="gm-check">
            <input type="radio" name="reset-mode" value="soft" checked />
            <span><b>--soft</b> ${t('reset.softDesc')}</span>
          </label>
          <label class="gm-check">
            <input type="radio" name="reset-mode" value="mixed" />
            <span><b>--mixed</b> ${t('reset.mixedDesc')}</span>
          </label>
          <label class="gm-check">
            <input type="radio" name="reset-mode" value="hard" />
            <span><b>--hard</b> ${t('reset.hardDesc')}</span>
          </label>
        </div>
        <div class="gm-dialog__actions">
          <button id="reset-cancel" class="gm-btn">${t('dialog.cancel')}</button>
          <button id="reset-ok" class="gm-btn gm-btn--destructive-filled">Reset</button>
        </div>
      </div>
    </div>
  `;

  document.body.appendChild(overlay);

  const close = () => overlay.remove();

  overlay.querySelector('#reset-cancel')?.addEventListener('click', close);
  overlay.addEventListener('click', (ev) => {
    if (ev.target === overlay) close();
  });

  overlay.querySelector('#reset-ok')?.addEventListener('click', async () => {
    const modeInput = overlay.querySelector('input[name="reset-mode"]:checked') as HTMLInputElement;
    const mode = (modeInput?.value || 'mixed') as 'soft' | 'mixed' | 'hard';
    try {
      await service.reset(directory, commit.hash, mode);
      // 重置会移动分支指针，必须刷新，否则界面仍显示旧提交
      await reloadCommits(service, directory);
    } catch (err) {
      // 回归：此前只写 console，用户点确定后对话框直接关闭，看不出失败
      showOperationError(err, 'op.resetFailed', '[context-menu]', 'reset_error');
      return;
    }
    close();
  });
}


