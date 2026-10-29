/**
 * Git 管理面板入口
 * 布局与交互参考 IntelliJ IDEA Git Log Tab
 *
 * 布局:
 * ┌──────────┬───────────────────────────┬──────────────────┐
 * │          │ [Toolbar: search + filters]│                  │
 * │ Branch   │ +-------------------------+│  Commit Detail   │
 * │ Panel    | |  Commit List            || (info + files)  │
 * │ (220px)  | |  (graph + msg + branch  ||                  │
 * │          | |   + time + author)      ||                  │
 * │          | +-------------------------+│                  │
 * └──────────┴───────────────────────────┴──────────────────┘
 * │ Git | 控制台 | Worktrees ×                               │
 * └──────────────────────────────────────────────────────────┘
 */

import { mountEmpty } from "@openchamber/sdk/ui";

import { html } from './html';
import { host } from './host';
import { installHostTheme } from './theme';
import { getState, setState } from './state';
import { setLocale, t } from './i18n';
import { createServiceClient } from './service';
import type { BranchActions } from './components/branch-panel';
import { deleteBranches, resolveDeleteTargets } from './components/batch-delete';
import { showOperationError } from './components/errors';
import {
  createBranchPanel,
  createCommitListPanel,
  createFileDiffPanel,
  createCommitDetailPanel,
  createConsolePanel,
  createWorktreesPanel,
  hideContextMenu,
  showCompareBranchesView,
} from './components';
import { showCreateBranchDialog } from './components/dialogs';
import { filterCommits } from './components/commit-list';

const root = document.querySelector("#root")!;
const service = createServiceClient(host);

let disposables: Array<{ dispose: () => void }> = [];

/**
 * 底部页签状态提升到模块级：宿主目录事件会触发整体重建（render），
 * 若存在 render 内的局部变量里，重建后会丢失、回退到 Git 页签，
 * 表现为「点了页签又跳回去、像没反应」。
 */
let activeBottomTab: 'git' | 'console' | 'worktrees' = 'git';
let directory: string | null = null;
let rendering = false;
/** loadData 进行中标志：防止连点刷新等并发触发重复加载 */
let loadingData = false;
/** clearBranchFilter 进行中标志：清除分支过滤期间重复点击空白直接跳过 */
let clearingBranchFilter = false;

function getDir(): string {
  if (!directory) throw new Error("目录未初始化");
  return directory;
}

function clearAll(): void {
  for (const d of disposables) {
    d.dispose();
  }
  disposables = [];
  root.innerHTML = '';
}

/**
 * 主渲染函数 - IntelliJ 三栏布局
 * 仅用于结构性变更（初始化、目录切换）；业务数据更新由组件 subscribeFields 局部渲染
 */
async function render(): Promise<void> {
  if (rendering) return;
  rendering = true;
  try {
    clearAll();

    if (!directory) {
      const empty = mountEmpty(root, {
        title: t('main.loadingTitle'),
        body: t('main.loadingBody'),
      });
      disposables.push(empty);
      return;
    }

    const isGit = await checkGitRepository();
    if (!isGit) {
      root.innerHTML = '';
      const empty = mountEmpty(root, {
        title: t('main.notGitTitle'),
        body: t('main.notGitBody'),
      });
      disposables.push(empty);
      return;
    }

    // 主布局: 上下结构 (内容 + 底部Tab栏)
    const mainLayout = html`
      <div class="gm-shell"></div>
    `;

    // 顶部细进度条：Fetch 等耗时操作期间显示流动动画，空闲时高度为 0 不占位
    const progressBar = html`
      <div data-progress class="gm-progress">
        <div data-progress-inner class="gm-progress__bar"></div>
      </div>
    `;
    mainLayout.appendChild(progressBar);

    /** 进度条控制器（fetch 等操作期间显示/隐藏），赋值给模块级变量供各操作使用 */
    progress = createProgressBar(progressBar);

    // 内容区域: 左中右三栏
    const contentArea = html`
      <div class="gm-content"></div>
    `;
    mainLayout.appendChild(contentArea);

    // A region: branch panel (left). Its header owns the branch actions that
    // used to live in the icon rail, so the rail is gone (issue #23).
    const branchPanel = html`
      <div class="gm-branches"></div>
    `;
    // Session-level visibility, kept across rebuilds.
    branchPanel.hidden = getState().branchPanelHidden;
    contentArea.appendChild(branchPanel);

    const toggleBranchPanel = (): void => {
      setState(s => { s.branchPanelHidden = !s.branchPanelHidden; });
      branchPanel.hidden = getState().branchPanelHidden;
    };

    // B region: commit list (middle, takes the remaining width)
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
        onLocateBranch: () => { void runSidebarLocateBranch(); },
      },
    );
    disposables.push(commitListComp);

    /** Branch actions rendered in the branch-panel header. */
    const branchActions: BranchActions = {
      onNewBranch: () => {
        try {
          // A selected commit means "branch from here" (IDEA semantics), otherwise HEAD.
          const selected = getState().selectedCommit?.hash ?? null;
          void service.debugLog('new-branch-dialog-open', { selectedCommit: selected });
          showCreateBranchDialog({ service, directory: getDir(), startPoint: selected ?? undefined, entry: 'branchPanel' });
        } catch (e) {
          console.error(JSON.stringify({ prefix: '[branch-panel]', event: 'new_branch_error', error: String(e) }));
        }
      },
      onUpdateSelected: () => { void runSidebarUpdate(); },
      onFetch: () => { void runSidebarFetch(); },
      onDeleteBranch: () => {
        // 对齐 IDEA DeleteBranchAction：多选时批量删除所有选中分支，未多选时只删单选分支。
        // IDEA 在多选包含当前分支时整体置灰，这里改为明确提示并中止，避免删掉一半才失败
        const state = getState();
        const resolved = resolveDeleteTargets(state.branches, state.selectedBranch, state.selectedBranches);

        if (resolved.kind === 'none') {
          void host.toast({ kind: 'error', message: t('branch.selectBranch') }).catch((toastErr) => {
            console.error(JSON.stringify({ prefix: '[sidebar]', event: 'delete_branch_toast_error', error: String(toastErr) }));
          });
          return;
        }

        if (resolved.kind === 'current') {
          // 当前分支不可删除：多选场景下整体中止，与 IDEA 动作置灰语义一致
          void host.toast({ kind: 'error', message: t('branch.deleteCurrent') }).catch((toastErr) => {
            console.error(JSON.stringify({ prefix: '[sidebar]', event: 'delete_branch_toast_error', error: String(toastErr) }));
          });
          return;
        }

        void (async () => {
          await deleteBranches(service, host, getDir(), resolved.targets);
          // 删除后清空多选集合，避免下次操作仍指向已删除分支
          setState(s => { s.selectedBranches = new Set<string>(); });
          // 刷新分支列表，反映删除结果
          try {
            const next = await service.getBranches(getDir());
            setState(s => { s.branches = next; });
          } catch (err) {
            console.error(JSON.stringify({ prefix: '[sidebar]', event: 'reload_branches_error', error: String(err) }));
          }
        })();
      },
      onCompareBranch: () => {
        // 分支来源优先级：Cmd 多选的两个分支 > 单选分支 + 当前分支
        const state = getState();
        const multi = [...state.selectedBranches];
        const selectedName = state.selectedBranch?.name ?? null;
        const branch = selectedName
          ? state.branches.find(b => b.name === selectedName) ?? state.selectedBranch
          : null;
        console.debug(JSON.stringify({
          prefix: '[sidebar]',
          event: 'compare_branch_click',
          selectedName,
          multiSelected: multi,
          branchCount: state.branches.length,
          branchesWithIsCurrent: state.branches.filter(b => b.isCurrent).map(b => b.name),
          logBranch: state.logBranch,
        }));

        // 已多选两个分支：直接比较这两个，不再依赖当前分支
        if (multi.length === 2) {
          const [left, right] = multi;
          void service.debugLog('compare-branch-open', { left, right, via: 'multi' });
          showCompareBranchesView(service, getDir(), getState().branches, left, right);
          return;
        }
        if (multi.length > 2) {
          void host.toast({ kind: 'error', message: t('compare.tooMany') }).catch((toastErr) => {
            console.error(JSON.stringify({ prefix: '[sidebar]', event: 'compare_toast_error', error: String(toastErr) }));
          });
          return;
        }

        if (!branch) {
          void host.toast({ kind: 'error', message: t('compare.selectBranch') }).catch((toastErr) => {
            console.error(JSON.stringify({ prefix: '[sidebar]', event: 'compare_toast_error', error: String(toastErr) }));
          });
          return;
        }
        void (async () => {
          // 当前分支优先取 branches 里的 isCurrent；列表未带该标记时实时查 git status 兜底
          let current = getState().branches.find(b => b.isCurrent)?.name ?? '';
          if (!current) {
            try {
              const status = await service.getStatus(getDir());
              current = status.currentBranch ?? '';
            } catch (statusErr) {
              console.error(JSON.stringify({
                prefix: '[sidebar]',
                event: 'compare_get_status_error',
                error: String(statusErr),
              }));
            }
          }
          console.debug(JSON.stringify({
            prefix: '[sidebar]',
            event: 'compare_resolve_current',
            currentBranch: current || null,
          }));
          if (!current) {
            console.error(JSON.stringify({ prefix: '[sidebar]', event: 'compare_no_current_branch', branch: branch.name }));
            void host.toast({ kind: 'error', message: t('compare.noCurrentBranch') }).catch((toastErr) => {
              console.error(JSON.stringify({ prefix: '[sidebar]', event: 'compare_toast_error', error: String(toastErr) }));
            });
            return;
          }
          if (branch.name === current) {
            void host.toast({ kind: 'error', message: t('compare.currentBranch') }).catch((toastErr) => {
              console.error(JSON.stringify({ prefix: '[sidebar]', event: 'compare_toast_error', error: String(toastErr) }));
            });
            return;
          }
          void service.debugLog('compare-branch-open', { branch: branch.name, current });
          showCompareBranchesView(service, getDir(), getState().branches, branch.name, current);
        })();
      },
      onToggleMyBranches: () => { void toggleMyBranches(); },
      onFavorite: () => { void runSidebarFavorite(); },
    };

    const branchPanelComp = createBranchPanel(
      branchPanel,
      service,
      getDir(),
      (branch) => {
        console.debug(JSON.stringify({ prefix: '[main]', event: 'on_branch_select_cb', branchName: branch.name }));
        loadCommitsForBranch(branch.name);
      },
      // Empty space: clear the selection and the branch filter, restore all commits.
      () => { clearBranchFilter(); },
      branchActions,
    );
    disposables.push(branchPanelComp);

    // C 区域: 右侧详情面板 (固定宽度 300px)
    const detailPanel = html`
      <div class="gm-side"></div>
    `;
    contentArea.appendChild(detailPanel);

    // C1: 变更文件 (上半部分)
    const fileDiffPanel = html`
      <div class="gm-pane gm-pane--stacked"></div>
    `;
    detailPanel.appendChild(fileDiffPanel);

    const fileDiffComp = createFileDiffPanel(fileDiffPanel, service, getDir());
    disposables.push(fileDiffComp);

    // C2: 提交详情 (下半部分)
    const commitDetailPanel = html`
      <div class="gm-pane"></div>
    `;
    detailPanel.appendChild(commitDetailPanel);

    const commitDetailComp = createCommitDetailPanel(commitDetailPanel, service, getDir());
    disposables.push(commitDetailComp);

    root.appendChild(mainLayout);

    // 底部区域：可折叠的面板容器 + Tab 栏
    // 三个页签共用同一容器，切换时重建对应面板
    const bottomPanel = html`
      <div data-bottom-panel class="gm-bottom"></div>
    `;
    root.appendChild(bottomPanel);

    let bottomHandle: { dispose: () => void } | null = null;
    /** 当前激活的底部页签（模块级，跨重建保留） */
    let activeTab = activeBottomTab;

    /**
     * 切换到指定页签
     * @param tab 页签名
     */
    const switchTab = (tab: 'git' | 'console' | 'worktrees'): void => {
      if (activeTab === tab && tab !== 'git') {
        // 再次点击已激活的可折叠页签：收起
        activeTab = 'git';
      } else {
        activeTab = tab;
      }
      // 写回模块级，重建后仍停留在同一页签
      activeBottomTab = activeTab;
      bottomHandle?.dispose();
      bottomHandle = null;
      bottomPanel.innerHTML = '';

      if (activeTab === 'git') {
        bottomPanel.dataset.open = 'false';
      } else if (activeTab === 'console') {
        bottomPanel.dataset.open = 'true';
        bottomHandle = createConsolePanel(bottomPanel, service, getDir());
      } else {
        bottomPanel.dataset.open = 'true';
        bottomHandle = createWorktreesPanel(bottomPanel, service, getDir(), host);
      }
      updateTabStyles();
    };

    // Tab 栏
    const tabBar = createTabBar(switchTab);
    root.appendChild(tabBar);

    /**
     * 同步页签的激活样式
     */
    function updateTabStyles(): void {
      tabBar.querySelectorAll<HTMLElement>('[data-tab]').forEach((el) => {
        const isActive = el.dataset.tab === activeTab && activeTab !== 'git';
        el.setAttribute('aria-selected', String(isActive));
      });
    }

    disposables.push({
      dispose: () => { bottomHandle?.dispose(); },
    });

    // 重建后恢复上次激活的页签（目录事件会无条件触发重建）
    if (activeBottomTab !== 'git') {
      switchTab(activeBottomTab);
    }
  } finally {
    rendering = false;
  }
}

/** 进度条控制器 */
interface ProgressBar {
  /** 开始显示进度（引用计数：嵌套调用只在最外层结束后隐藏） */
  start: () => void;
  /** 结束一次进度 */
  done: () => void;
}

/**
 * 创建顶部细进度条控制器
 * 显示时高度展开为 2px 并播放往复动画；引用计数归零后收起
 * @param element 进度条容器（需包含 [data-progress-inner] 内部条）
 * @returns 控制器
 */
function createProgressBar(element: HTMLElement): ProgressBar {
  const inner = element.querySelector('[data-progress-inner]') as HTMLElement | null;
  let pending = 0;
  let animation: Animation | null = null;

  const start = (): void => {
    pending += 1;
    if (pending > 1) return;
    element.style.height = '2px';
    if (inner) {
      inner.style.opacity = '1';
      // 左右往复的流动效果：从左侧滑到右侧再返回
      animation = inner.animate(
        [
          { transform: 'translateX(-100%)' },
          { transform: 'translateX(340%)' },
        ],
        { duration: 1100, iterations: Infinity, easing: 'ease-in-out' },
      );
    }
  };

  const done = (): void => {
    if (pending === 0) return;
    pending -= 1;
    if (pending > 0) return;
    animation?.cancel();
    animation = null;
    if (inner) inner.style.opacity = '0';
    element.style.height = '0';
  };

  return { start, done };
}

/**
 * 底部 Tab 栏
 * 三个页签：Git（收起底部区域）、控制台、Worktrees
 * @param onSwitch 页签点击回调
 * @returns Tab 栏元素
 */
function createTabBar(onSwitch: (tab: 'git' | 'console' | 'worktrees') => void): HTMLElement {
  const bar = html`
    <div class="gm-tabbar">
      <div class="gm-tabbar__row" role="tablist">
        <div data-tab="git" class="gm-tab" role="tab" aria-selected="false">Git</div>
        <div data-tab="console" class="gm-tab" role="tab" aria-selected="false">${t('main.tabConsole')}</div>
        <div data-tab="worktrees" class="gm-tab" role="tab" aria-selected="false">Worktrees</div>
      </div>
    </div>
  `;

  bar.addEventListener('click', (e) => {
    const target = (e.target as HTMLElement).closest('[data-tab]') as HTMLElement | null;
    if (!target) return;
    const tab = target.dataset.tab as 'git' | 'console' | 'worktrees';
    onSwitch(tab);
  });

  return bar;
}

/**
 * 侧边栏收藏切换：作用于所有选中项（对齐 IDEA ToggleFavoriteAction）
 * 多选时先判断是否已全部收藏：全部已收藏则全部取消，否则全部收藏
 */
async function runSidebarFavorite(): Promise<void> {
  const state = getState();
  // 选中项来源：多选集合优先，其次单选分支
  const names = state.selectedBranches.size > 0
    ? [...state.selectedBranches]
    : (state.selectedBranch ? [state.selectedBranch.name] : []);
  if (names.length === 0) {
    console.error(JSON.stringify({ prefix: '[sidebar]', event: 'favorite_no_branch' }));
    void host.toast({ kind: 'error', message: t('branch.selectBranch') }).catch(() => {});
    return;
  }

  const next = new Set(state.favorites);
  // 全部已收藏 → 统一取消；否则统一收藏（与 IDEA 的批量切换语义一致）
  const allFavorited = names.every(n => next.has(n));
  for (const name of names) {
    if (allFavorited) next.delete(name);
    else next.add(name);
  }

  console.debug(JSON.stringify({
    prefix: '[sidebar]',
    event: 'favorite_toggle',
    branches: names,
    favorited: !allFavorited,
  }));
  const previous = state.favorites;
  setState(s => { s.favorites = next; });
  try {
    await service.saveFavorites(getDir(), [...next]);
  } catch (e) {
    // 保存失败需回滚本地状态，否则界面显示已收藏但实际未落盘
    setState(s => { s.favorites = previous; });
    showOperationError(e, 'branch.favoriteSaveFailed', '[sidebar]', 'save_favorites_error');
  }
}

/** 侧边栏更新所选：获取远程引用并刷新分支与提交 */
async function runSidebarUpdate(): Promise<void> {
  try {
    await service.fetch(getDir());
    await loadData();
  } catch (e) {
    // 回归：此前只写 console，点「更新」失败时界面毫无反应
    showOperationError(e, 'sidebar.fetchFailed', '[sidebar]', 'update_error');
  }
}

/** 侧边栏 Fetch：只获取远程引用并刷新分支列表，不重载提交历史 */

/** 顶部进度条控制器（界面初始化时赋值，未初始化时为空操作） */
let progress: ProgressBar = { start: () => {}, done: () => {} };

/**
 * 按 git 错误内容归类失败原因（导出以便单元测试覆盖分类规则）
 * @param message 原始错误信息
 * @returns 用于提示的文案键
 */
export function classifyFetchError(message: string): string {
  const text = message.toLowerCase();
  // 认证失败：凭据缺失或被拒绝
  if (
    text.includes('authentication failed')
    || text.includes('could not read username')
    || text.includes('permission denied')
    || text.includes('access denied')
    || text.includes('403')
  ) {
    return 'sidebar.fetchAuthFailed';
  }
  // 网络不可达 / DNS / 连接被拒
  if (
    text.includes('could not resolve host')
    || text.includes('connection refused')
    || text.includes('connection timed out')
    || text.includes('network is unreachable')
    || text.includes('failed to connect')
  ) {
    return 'sidebar.fetchUnreachable';
  }
  // 未配置远程
  if (text.includes('does not appear to be a git repository') || text.includes('no such remote')) {
    return 'sidebar.fetchNoRemote';
  }
  // 其余归为通用失败
  return 'sidebar.fetchFailed';
}

async function runSidebarFetch(): Promise<void> {
  // 防重入：进行中再次点击直接忽略
  if (getState().fetching) {
    console.debug(JSON.stringify({ prefix: '[sidebar]', event: 'fetch_skipped_running' }));
    return;
  }
  setState(s => { s.fetching = true; });
  progress.start();
  const startedAt = Date.now();
  console.debug(JSON.stringify({ prefix: '[sidebar]', event: 'fetch_start' }));

  try {
    await service.fetch(getDir());
    await loadBranches();

    // 统计 fetch 后存在待拉取提交的分支数量，用于成功提示
    const unpulledBranches = getState().branches
      .filter(b => b.hasUnpulled && (b.unpulledCount ?? 0) > 0)
      .map(b => b.name);
    console.debug(JSON.stringify({
      prefix: '[sidebar]',
      event: 'fetch_done',
      elapsedMs: Date.now() - startedAt,
      unpulledCount: unpulledBranches.length,
    }));

    // 成功提示：区分「有新提交待拉取」与「已是最新」
    void host.toast({
      kind: 'success',
      message: unpulledBranches.length > 0
        ? t('sidebar.fetchSuccessUpdates', { count: unpulledBranches.length })
        : t('sidebar.fetchSuccessNoUpdates'),
    }).catch((toastErr) => {
      console.error(JSON.stringify({ prefix: '[sidebar]', event: 'fetch_toast_error', error: String(toastErr) }));
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    const reasonKey = classifyFetchError(message);
    console.error(JSON.stringify({
      prefix: '[sidebar]',
      event: 'fetch_error',
      elapsedMs: Date.now() - startedAt,
      reasonKey,
      error: message,
    }));
    // 分类文案 + 原始错误，支持复制详情便于排查
    void host.toast({
      kind: 'error',
      message: `${t(reasonKey)}: ${message}`,
      copy: true,
      dismiss: true,
    }).catch((toastErr) => {
      console.error(JSON.stringify({ prefix: '[sidebar]', event: 'fetch_toast_error', error: String(toastErr) }));
    });
  } finally {
    setState(s => { s.fetching = false; });
    progress.done();
  }
}

/**
 * 在提交日志中定位所选分支：把提交列表切到该分支并选中其最新提交
 * 对齐 IDEA Navigate Log To Selected Branch
 */
async function runSidebarLocateBranch(): Promise<void> {
  const state = getState();
  const selected = state.selectedBranch
    ?? (state.selectedBranches.size === 1
      ? state.branches.find(b => b.name === [...state.selectedBranches][0]) ?? null
      : null);
  if (!selected) {
    console.debug(JSON.stringify({ prefix: '[sidebar]', event: 'locate_no_branch' }));
    return;
  }

  // 该分支最新提交即分支头；分支数据带有 commit 字段时直接用它
  const headHash = selected.commit
    ?? (await service.getLog(getDir(), selected.name)).at(0)?.hash;
  if (!headHash) {
    console.debug(JSON.stringify({ prefix: '[sidebar]', event: 'locate_no_commit', branchName: selected.name }));
    return;
  }

  // 只在当前列表中定位并选中该提交，不改变过滤条件（对齐 IDEA jumpToBranch）
  // 分支数据里的 commit 是短哈希，列表中为完整哈希：用前缀匹配兼容两种形式
  const found = getState().allCommits.find(
    c => c.hash === headHash || c.shortHash === headHash || c.hash.startsWith(headHash),
  );
  console.debug(JSON.stringify({
    prefix: '[sidebar]',
    event: 'locate_branch',
    branchName: selected.name,
    headHash,
    visible: Boolean(found),
  }));

  if (!found) {
    // 当前过滤条件下该提交不在列表中：保持列表不变，仅提示
    void host.toast({ kind: 'info', message: t('sidebar.locateNotInView', { branch: selected.name }) })
      .catch((toastErr) => {
        console.error(JSON.stringify({ prefix: '[sidebar]', event: 'locate_toast_error', error: String(toastErr) }));
      });
    return;
  }

  setState(s => {
    s.selectedCommit = found;
    s.selectedCommits = new Set([found.hash]);
  });
  await loadCommitDetail(found.hash);
}

async function loadCommitsForBranch(branchName: string): Promise<void> {
  console.debug(JSON.stringify({ prefix: '[main]', event: 'load_branch_start', branchName }));
  setState(s => {
    s.logBranch = branchName;
    s.selectedCommits = new Set<string>(); // 切换分支过滤时清空多选
  });
  console.debug(JSON.stringify({ prefix: '[main]', event: 'log_branch_set', branchName }));
  try {
    const commits = await service.getLog(getDir(), branchName, getState().filterPaths.length ? getState().filterPaths : undefined);
    console.debug(JSON.stringify({ prefix: '[main]', event: 'get_log_done', count: commits.length }));
    setState(s => {
      s.allCommits = commits;
      s.filteredCommits = commits;
    });
    console.debug(JSON.stringify({ prefix: '[main]', event: 'commits_set', count: commits.length }));
  } catch (e) {
    showOperationError(e, 'commit.loadListFailed', '[main]', 'load_branch_error');
  }
}

/**
 * 清除分支过滤：点击分支面板空白区域时触发（对齐 IntelliJ IDEA 取消选中行为）
 * 流程：
 * 1. 防抖：进行中重复触发直接跳过并打 skipped 日志
 * 2. 清空 selectedBranch/logBranch 与多选（与 loadCommitsForBranch 设过滤时的清理对称）
 * 3. 不带分支参数拉取全部提交
 * 4. 调 filterCommits 重应用搜索/作者/日期/路径过滤与排序，保留用户其他过滤条件
 * 5. selectedCommit/commitDetail 不动：选中提交仍在新列表中
 * @returns Promise
 */
async function clearBranchFilter(): Promise<void> {
  if (clearingBranchFilter) {
    console.debug(JSON.stringify({ prefix: '[main]', event: 'clear_branch_filter_skipped' }));
    return;
  }
  clearingBranchFilter = true;
  try {
    setState(s => {
      s.selectedBranch = null;
      s.logBranch = null;
      s.selectedCommits = new Set<string>(); // 与设置分支过滤时的多选清理对称
    });
    // 分支已清空（第 2 参 undefined），但保留用户已设置的路径过滤
    const commits = await service.getLog(getDir(), undefined, getState().filterPaths.length ? getState().filterPaths : undefined);
    setState(s => {
      s.allCommits = commits;
      s.filteredCommits = commits;
    });
    // 重应用活动过滤与排序，清除分支过滤不丢失用户的搜索/作者/日期/路径条件
    filterCommits();
    console.debug(JSON.stringify({ prefix: '[main]', event: 'branch_filter_cleared', count: commits.length }));
  } catch (e) {
    showOperationError(e, 'commit.loadListFailed', '[main]', 'clear_branch_filter_error');
  } finally {
    clearingBranchFilter = false;
  }
}

async function loadCommitDetail(hash: string): Promise<void> {
  try {
    const detail = await service.getCommitDetail(getDir(), hash);
    const diffs = await service.getCommitDiffs(getDir(), hash);
    setState(s => {
      s.commitDetail = detail;
      s.diffs = diffs;
    });
  } catch (e) {
    showOperationError(e, 'commit.loadDetailFailed', '[main]', 'load_commit_detail_error');
  }
}

async function loadBranches(): Promise<void> {
  try {
    const branches = await service.getBranches(getDir());
    setState(s => { s.branches = branches; });
  } catch (e) {
    showOperationError(e, 'branch.loadFailed', '[main]', 'load_branches_error');
  }
}

/**
 * 切换「只显示我的分支」筛选
 * 首次开启时向服务端查询我的分支集合（独有提交全部由当前作者创作的分支），
 * 之后复用缓存；关闭筛选只改标志位，不清缓存
 */
async function toggleMyBranches(): Promise<void> {
  const next = !getState().showOnlyMyBranches;
  console.debug(JSON.stringify({ prefix: '[sidebar]', event: 'toggle_my_branches', enabled: next }));

  if (!next) {
    setState(s => { s.showOnlyMyBranches = false; });
    return;
  }

  // 开启：先标记开启（空集合会短暂把所有分支过滤掉），再异步填充
  setState(s => { s.showOnlyMyBranches = true; });
  try {
    const mine = await service.getMyBranches(getDir());
    console.debug(JSON.stringify({ prefix: '[sidebar]', event: 'my_branches_loaded', count: mine.length, names: mine }));
    setState(s => {
      s.myBranches = new Set(mine);
      // 查询期间用户可能已再次点击关闭，此时不回填标志位
    });
  } catch (e) {
    console.error(JSON.stringify({ prefix: '[sidebar]', event: 'my_branches_error', error: String(e) }));
    setState(s => { s.showOnlyMyBranches = false; });
    void host.toast({ kind: 'error', message: t('sidebar.myBranchesFailed') }).catch((toastErr) => {
      console.error(JSON.stringify({ prefix: '[sidebar]', event: 'my_branches_toast_error', error: String(toastErr) }));
    });
  }
}

async function loadFavorites(): Promise<void> {
  try {
    const favorites = await service.getFavorites(getDir());
    setState(s => { s.favorites = new Set(favorites); });
  } catch (e) {
    console.error("[git-manager] 加载收藏失败:", e);
  }
}

async function checkGitRepository(): Promise<boolean> {
  try {
    return await service.isGitRepository(getDir());
  } catch {
    return false;
  }
}

async function init(): Promise<void> {
  // Host theme tokens live on <html>; applying them also reveals the document
  // (see the data-oc-theme gate in styles.css).
  const theme = installHostTheme(document.documentElement);
  // Menu language follows the host setting.
  host.onReady((context) => {
    theme.apply(context);
    setLocale(context.locale);
  });
  host.onDirectory((dir) => {
    console.debug(JSON.stringify({
      prefix: '[main]',
      event: 'on_directory',
      dir,
      prevDir: directory,
      same: dir === directory,
    }));
    const prevDir = directory;
    directory = dir;
    if (!dir) return;
    // 同一目录的重复事件不重建：宿主高频推送会把面板反复销毁重建，
    // 表现为「点了页签立刻被重置」
    if (prevDir === dir) {
      console.debug(JSON.stringify({ prefix: '[main]', event: 'on_directory_same_skip', dir }));
      return;
    }
    // 目录切换：清空旧仓库状态并整体重建布局
    loadData({ reset: true });
  });
}

/**
 * 加载面板数据
 * @param options reset=true 为目录切换场景：清空全部状态、校验仓库并整体重建布局（render）；
 *               默认 false 为刷新场景（刷新/签出/合并/拉取）：只替换数据并由订阅组件局部渲染，
 *               保留用户的过滤条件与选中项，不调用 render() 以免整个三栏布局被销毁重建产生闪烁
 * @returns Promise
 */
async function loadData(options: { reset?: boolean } = {}): Promise<void> {
  if (!directory) return;
  if (loadingData) {
    console.debug(JSON.stringify({ prefix: '[main]', event: 'load_data_skipped' }));
    return;
  }
  loadingData = true;
  try {
    const reset = options.reset === true;
    const mode = reset ? 'reset' : 'refresh';
    console.debug(JSON.stringify({ prefix: '[main]', event: 'load_data_start', directory, mode }));

    if (reset) {
      // 切换项目时重置旧状态，避免上一个仓库的提交/过滤条件残留
      setState(s => {
        s.branches = [];
        s.allCommits = [];
        s.filteredCommits = [];
        s.logBranch = null;
        s.selectedBranch = null;
        s.selectedCommit = null;
        s.selectedCommits = new Set<string>();
        s.commitDetail = null;
        s.diffs = [];
        s.branchFilter = '';
        s.commitSearch = '';
        s.filterAuthor = '';
        s.filterDateFrom = '';
        s.filterDateTo = '';
        s.filterPaths = [];
      });

      const isGit = await checkGitRepository();
      if (!isGit) {
        root.innerHTML = '';
        const empty = mountEmpty(root, {
          title: t('main.notGitTitle'),
          body: t('main.notGitBody'),
        });
        disposables.push(empty);
        return;
      }
    }
    // 刷新场景跳过 checkGitRepository：界面已存在，省一次往返

    await Promise.all([
      loadBranches(),
      loadFavorites(),
    ]);

    // 无条件加载提交历史（不依赖 currentBranch 是否找到）；
    // 刷新场景保留 logBranch，与 commit-list 的 refreshCommits 同模式以维持分支过滤一致
    try {
      const branch = getState().logBranch || undefined;
      // reset 分支已在上方清空 filterPaths，此处取值发生在清空之后（刷新场景保留路径过滤）
      const commits = await service.getLog(getDir(), branch, getState().filterPaths.length ? getState().filterPaths : undefined);
      console.debug(JSON.stringify({ prefix: '[main]', event: 'load_data_commits', count: commits.length }));
      setState(s => {
        s.allCommits = commits;
        s.filteredCommits = commits;
        // 清理悬空选择：新列表里已不存在的选中项一并移除，仍在的保留
        const hashes = new Set(commits.map(c => c.hash));
        if (s.selectedCommit && !hashes.has(s.selectedCommit.hash)) {
          s.selectedCommit = null;
          s.commitDetail = null;
          s.diffs = [];
        }
        if (s.selectedCommits.size > 0) {
          s.selectedCommits = new Set([...s.selectedCommits].filter(h => hashes.has(h)));
        }
      });
      // 重应用活动过滤与排序（reset 场景过滤条件已清空，等价于按当前排序模式输出）
      filterCommits();
    } catch (e) {
      showOperationError(e, 'commit.loadListFailed', '[main]', 'load_data_commits_error');
    }

    if (reset) {
      await render();
    }
    console.debug(JSON.stringify({ prefix: '[main]', event: 'load_data_done' }));
  } finally {
    loadingData = false;
  }
}

document.addEventListener("click", () => {
  hideContextMenu();
});

init();

// 调试日志：页面加载新 bundle 即上报（日志文件中出现此条 = 页面已刷新为新版 JS）
void service.debugLog('panel-loaded', { ts: new Date().toISOString() });
