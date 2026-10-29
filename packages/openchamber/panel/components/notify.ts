/**
 * 分支删除通知卡片
 * 对齐 IDEA GitDeleteBranchOperation 通知交互：正文 + 还原/删除跟踪动作链接，
 * 10 秒自动过期（悬停暂停计时），同一时刻仅保留一条，动作失败保留卡片可重试
 */

import { t } from '../i18n';
import { host } from '../host';

/** 通知自动过期时长（毫秒，对齐 IDEA 通知默认存活 10 秒） */
const NOTIFY_TTL_MS = 10000;

/** 分支删除通知（对齐 IDEA GitDeleteBranchOperation 通知：正文 + 还原/删除跟踪的分支动作） */
export interface BranchDeletedNotifyOptions {
  branchName: string;
  /** 本地分支提供"还原"动作（远程分支不传 → 仅正文无动作） */
  onRestore?: () => Promise<void>;
  /** 服务端 canDeleteTracking 且有 upstream 时提供（context-menu 据此传入） */
  onDeleteTracking?: () => Promise<void>;
}

/** 当前展示中的通知关闭函数（同刻仅一条：新的 show 先关闭旧卡片） */
let currentClose: (() => void) | null = null;

/**
 * 显示分支删除通知卡片（自绘深色卡片，固定于面板右下角）
 * 行为：正文 + 动作链接（蓝链横排）；10 秒无操作自动过期，mouseenter 暂停、mouseleave 恢复；
 * 动作点击 → 立即禁用链接防重复 → resolve 关闭卡片、reject 弹错误 toast 且保留卡片（链接恢复可点）
 * @param options 通知内容与可选动作回调
 */
export function showBranchDeletedNotify(options: BranchDeletedNotifyOptions): void {
  // 同刻仅一条：先关闭旧卡片（旧 close 幂等且自清理 currentClose）
  currentClose?.();

  const card = document.createElement('div');
  card.id = 'git-branch-deleted-notify';
  card.className = 'gm-notify';

  const message = document.createElement('div');
  message.textContent = t('branch.notifyDeleted', { name: options.branchName });
  card.appendChild(message);

  /** 剩余存活毫秒数（悬停暂停时据此扣减并恢复计时） */
  let remaining = NOTIFY_TTL_MS;
  /** 本轮计时启动时刻（fake timers 下随虚拟时钟推进） */
  let startedAt = 0;
  /** 自动过期计时器句柄（null 表示未在计时） */
  let timer: ReturnType<typeof setTimeout> | null = null;
  let closed = false;

  /** 关闭通知：清理计时器与 DOM（幂等，重复调用无副作用） */
  const close = (): void => {
    if (closed) return;
    closed = true;
    if (timer !== null) {
      clearTimeout(timer);
      timer = null;
    }
    if (currentClose === close) currentClose = null;
    card.remove();
    console.debug(JSON.stringify({ prefix: '[notify]', event: 'branch_notify_close', branch: options.branchName }));
  };
  currentClose = close;

  /** 启动（或恢复）自动过期计时 */
  const startTimer = (): void => {
    if (closed || timer !== null) return;
    startedAt = Date.now();
    timer = setTimeout(() => {
      timer = null;
      console.debug(JSON.stringify({ prefix: '[notify]', event: 'branch_notify_expire', branch: options.branchName }));
      close();
    }, remaining);
  };

  /** 暂停计时（mouseenter）：扣减已消耗时长后释放句柄 */
  const pauseTimer = (): void => {
    if (timer === null) return;
    clearTimeout(timer);
    timer = null;
    remaining = Math.max(0, remaining - (Date.now() - startedAt));
  };

  /** 待渲染的动作（按 还原 → 删除跟踪 顺序横排） */
  const actions: Array<{ label: string; kind: 'restore' | 'deleteTracking'; run: () => Promise<void> }> = [];
  if (options.onRestore) {
    actions.push({ label: t('branch.restore'), kind: 'restore', run: options.onRestore });
  }
  if (options.onDeleteTracking) {
    actions.push({ label: t('branch.deleteTracking'), kind: 'deleteTracking', run: options.onDeleteTracking });
  }

  if (actions.length > 0) {
    const row = document.createElement('div');
    row.className = 'gm-notify__actions';
    for (const action of actions) {
      const link = document.createElement('a');
      link.textContent = action.label;
      link.className = 'gm-notify__action';
      /** 动作执行中（防重复点击哨兵） */
      let busy = false;

      link.addEventListener('click', () => {
        if (busy || closed) return;
        busy = true;
        link.dataset.busy = 'true';
        void (async () => {
          try {
            await action.run();
            console.debug(JSON.stringify({
              prefix: '[notify]',
              event: 'branch_notify_action_success',
              action: action.kind,
              branch: options.branchName,
            }));
            close();
          } catch (err) {
            // 失败不 expire（对齐 IDEA）：toast 提示 + 卡片保留 + 链接恢复可点
            busy = false;
            link.dataset.busy = 'false';
            const raw = err instanceof Error ? err.message : String(err);
            const prefixText = action.kind === 'restore'
              ? t('branch.restoreFailed')
              : t('branch.deleteTrackingFailed');
            console.error(JSON.stringify({
              prefix: '[notify]',
              event: 'branch_notify_action_error',
              action: action.kind,
              branch: options.branchName,
              error: raw,
            }));
            void host.toast({ kind: 'error', message: `${prefixText}: ${raw}` })
              .catch((toastErr) => {
                console.error(JSON.stringify({ prefix: '[notify]', event: 'branch_notify_toast_error', error: String(toastErr) }));
              });
          }
        })();
      });

      row.appendChild(link);
    }
    card.appendChild(row);
  }

  // 悬停暂停过期计时，移出后恢复
  card.addEventListener('mouseenter', pauseTimer);
  card.addEventListener('mouseleave', startTimer);

  document.body.appendChild(card);
  startTimer();
  console.debug(JSON.stringify({
    prefix: '[notify]',
    event: 'branch_notify_show',
    branch: options.branchName,
    actions: actions.map(a => a.kind),
  }));
}
