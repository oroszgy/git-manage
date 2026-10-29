/**
 * 控制台面板
 * 展示扩展自身执行过的 git 命令日志（命令、耗时、退出码、输出）。
 *
 * 能力边界：本扩展的 git 命令由 service 进程通过 execFile 直接执行，
 * 不经过宿主 shell 体系，因此订阅宿主 shell 看不到这些命令，
 * 改由 core 层在 gitExec 中记录环形缓冲、面板定时轮询增量。
 */

import { html } from '../html';
import { t } from '../i18n';
import type { GitCommandLogEntry, ServiceClient } from '../service';

/** 单次轮询窗口大小 */
const POLL_INTERVAL_MS = 1000;

/** 面板句柄 */
export interface ConsolePanelHandle {
  /** 释放定时器 */
  dispose: () => void;
}

/**
 * 格式化时间戳为本地时分秒
 * @param ts 毫秒时间戳
 * @returns 展示文本
 */
function formatTime(ts: number): string {
  const d = new Date(ts);
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}:${String(d.getSeconds()).padStart(2, '0')}`;
}

/**
 * 创建控制台面板
 * @param container 挂载容器
 * @param service service 客户端
 * @param directory 仓库目录；为空则展示所有仓库的命令
 * @returns 面板句柄
 */
export function createConsolePanel(
  container: HTMLElement,
  service: ServiceClient,
  directory: string,
): ConsolePanelHandle {
  let disposed = false;
  /** 定时轮询器 */
  let pollTimer: number | null = null;
  /** 已拉取到的最大日志 id，用于增量拉取 */
  let lastId = 0;
  /** 当前展示的日志（旧→新） */
  let entries: GitCommandLogEntry[] = [];
  /** 当前展开查看输出的日志 id */
  let selectedId: number | null = null;

  container.innerHTML = '';
  // Container size belongs to the caller; the panel only fills it.
  const root = html`
    <div class="gm-console"></div>
  `;
  container.appendChild(root);

  const header = html`
    <div class="gm-console__head">
      <span data-log-count>0</span>
      <span>${t('console.commandCount')}</span>
      <span class="gm-console__spacer"></span>
      <button type="button" data-log-clear class="gm-btn gm-btn--small">${t('console.clear')}</button>
    </div>
  `;
  root.appendChild(header);

  const body = html`
    <div class="gm-console__body"></div>
  `;
  root.appendChild(body);

  // Left: command list
  const listEl = html`
    <div data-log-list class="gm-console__list"></div>
  `;
  body.appendChild(listEl);

  // Right: full output of the selected command
  const outputEl = html`
    <div data-log-output class="gm-console__output"></div>
  `;
  body.appendChild(outputEl);

  const countEl = header.querySelector('[data-log-count]') as HTMLElement;

  /**
   * 渲染左侧命令列表
   */
  const renderList = (): void => {
    countEl.textContent = String(entries.length);
    listEl.innerHTML = '';

    if (entries.length === 0) {
      const empty = document.createElement('div');
      empty.className = 'gm-console__empty';
      empty.textContent = t('console.noCommands');
      listEl.appendChild(empty);
      return;
    }

    // 新命令在顶部，便于直接看到最近一次操作
    for (const entry of [...entries].reverse()) {
      const row = document.createElement('div');
      row.dataset.logId = String(entry.id);
      row.className = 'gm-console__row';
      row.setAttribute('aria-selected', String(selectedId === entry.id));

      const cmd = document.createElement('div');
      cmd.className = 'gm-console__cmd';
      if (!entry.ok) cmd.dataset.state = 'error';
      cmd.textContent = entry.command;
      cmd.title = entry.command;
      row.appendChild(cmd);

      const meta = document.createElement('div');
      meta.className = 'gm-console__meta';
      meta.textContent = `${formatTime(entry.startedAt)} · ${entry.durationMs}ms · ${entry.ok ? '0' : entry.exitCode}`;
      row.appendChild(meta);

      row.addEventListener('click', () => {
        selectedId = entry.id;
        renderList();
        renderOutput();
      });

      listEl.appendChild(row);
    }
  };

  /**
   * 渲染右侧选中命令的输出
   */
  const renderOutput = (): void => {
    if (selectedId === null) {
      outputEl.textContent = t('console.selectCommand');
      return;
    }
    const entry = entries.find(e => e.id === selectedId);
    if (!entry) {
      outputEl.textContent = t('console.selectCommand');
      return;
    }
    const parts = [`$ ${entry.command}`, `# ${entry.cwd}`, ''];
    if (entry.stdout) parts.push(entry.stdout);
    if (entry.stderr) parts.push(entry.stderr);
    if (!entry.stdout && !entry.stderr) parts.push(t('console.noOutput'));
    outputEl.textContent = parts.join('\n');
  };

  /**
   * 拉取增量日志
   */
  const refresh = async (): Promise<void> => {
    if (disposed) return;
    try {
      const logs = await service.getCommandLogs(directory, lastId);
      if (disposed) return;
      if (logs.length > 0) {
        lastId = Math.max(lastId, ...logs.map(l => l.id));
        entries = [...entries, ...logs];
        // 保持缓冲上限与 core 一致，避免长时间运行无限增长
        if (entries.length > 200) entries = entries.slice(-200);
        renderList();
        // 未选中任何命令时自动选中最新一条，避免右侧空白
        if (selectedId === null) selectedId = entries[entries.length - 1]!.id;
        renderOutput();
        console.debug(JSON.stringify({
          prefix: '[console]',
          event: 'logs_loaded',
          added: logs.length,
          total: entries.length,
        }));
      }
    } catch (err) {
      if (disposed) return;
      console.error(JSON.stringify({ prefix: '[console]', event: 'load_error', error: String(err) }));
      outputEl.textContent = `${t('console.loadFailed')}: ${err instanceof Error ? err.message : String(err)}`;
    }
  };

  // 清空日志（同时清 service 端缓冲，否则下一轮又会拉回来）
  header.querySelector('[data-log-clear]')?.addEventListener('click', () => {
    void (async () => {
      try {
        await service.clearCommandLogs(directory);
        entries = [];
        selectedId = null;
        renderList();
        renderOutput();
      } catch (err) {
        console.error(JSON.stringify({ prefix: '[console]', event: 'clear_error', error: String(err) }));
      }
    })();
  });

  // 首屏拉全量，之后每秒拉增量（git 命令没有推送通道）
  void refresh().then(() => {
    if (disposed) return;
    pollTimer = window.setInterval(() => { void refresh(); }, POLL_INTERVAL_MS);
  });

  renderList();
  renderOutput();

  return {
    dispose: () => {
      if (disposed) return;
      disposed = true;
      if (pollTimer !== null) window.clearInterval(pollTimer);
      pollTimer = null;
      container.innerHTML = '';
    },
  };
}
