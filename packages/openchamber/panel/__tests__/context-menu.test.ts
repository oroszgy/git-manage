/**
 * 右键菜单组件单元测试
 * 覆盖分支右键菜单、单提交/批量提交右键菜单与菜单隐藏逻辑
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { showContextMenu, showCommitContextMenu, hideContextMenu } from '../components/context-menu';
import { host } from '../host';
import { getState, setState, createInitialState, Branch, CommitInfo, FileDiff } from '../state';
import { setLocale, t } from '../i18n';
import { ServiceClient, DeleteBranchResult } from '../service';

// 宿主模块打桩：避免真实 connectHost 握手，并在用例中断言 toast 调用
vi.mock('../host', () => ({
  host: {
    toast: vi.fn().mockResolvedValue(undefined),
    writeClipboard: vi.fn().mockResolvedValue(undefined),
  },
}));

/** 宿主 toast 断言句柄 */
const toastMock = vi.fn().mockResolvedValue(undefined);
/** 宿主剪贴板通道断言句柄 */
const writeClipboardMock = vi.fn().mockResolvedValue(undefined);

/** 测试目录 */
const DIRECTORY = '/repo';

/** 测试分支 */
const branch: Branch = { name: 'dev', isCurrent: false, isRemote: false };

/**
 * 删除分支成功响应样例（本地分支、有 upstream、服务端允许删跟踪分支）
 * 满足 service.deleteBranch 上游契约 DeleteBranchResult
 */
const deleteOk: DeleteBranchResult = {
  success: true,
  kind: 'local',
  tip: 'abc123',
  upstream: { remote: 'origin', branch: 'dev' },
  canDeleteTracking: true,
};

/** 通知卡片 id（components/notify 自绘卡片） */
const NOTIFY_ID = 'git-branch-deleted-notify';

/** 剪贴板写入 mock */
let writeTextMock: ReturnType<typeof vi.fn>;

/** confirm mock */
let confirmMock: ReturnType<typeof vi.fn>;

/**
 * 构造 service mock（只提供菜单用到的方法）
 * @returns 可传给菜单的 ServiceClient 替身
 */
function createMockService(): ServiceClient {
  return {
    checkoutBranch: vi.fn().mockResolvedValue(undefined),
    getBranches: vi.fn().mockResolvedValue([{ name: 'feature', isCurrent: false, isRemote: false }]),
    mergeBranch: vi.fn().mockResolvedValue(undefined),
    rebaseBranch: vi.fn().mockResolvedValue(undefined),
    pull: vi.fn().mockResolvedValue(undefined),
    push: vi.fn().mockResolvedValue(undefined),
    saveFavorites: vi.fn().mockResolvedValue(undefined),
    deleteBranch: vi.fn().mockResolvedValue(deleteOk),
    restoreBranch: vi.fn().mockResolvedValue({ success: true }),
    deleteRemoteBranch: vi.fn().mockResolvedValue({ success: true }),
    cherryPick: vi.fn().mockResolvedValue(undefined),
    revert: vi.fn().mockResolvedValue(undefined),
    reset: vi.fn().mockResolvedValue(undefined),
    checkoutNewBranch: vi.fn().mockResolvedValue(undefined),
    createNewBranch: vi.fn().mockResolvedValue(undefined),
    renameBranch: vi.fn().mockResolvedValue(undefined),
    diffVsLocal: vi.fn().mockResolvedValue([]),
    // reloadCommits 依赖 getLog 刷新提交列表
    getLog: vi.fn().mockResolvedValue([]),
  } as unknown as ServiceClient;
}

/**
 * 构造测试用提交
 * @param overrides 覆盖字段
 * @returns 提交信息对象
 */
function createCommit(overrides: Partial<CommitInfo> = {}): CommitInfo {
  return {
    hash: 'abc123',
    shortHash: 'abc1234',
    message: '修复缺陷',
    authorName: '测试者',
    authorEmail: 'tester@example.com',
    date: '2026-09-27',
    parents: ['def456'],
    ...overrides,
  };
}

/**
 * 构造右键点击事件
 * @returns 带坐标的 contextmenu 事件
 */
function createContextMenuEvent(): MouseEvent {
  return new MouseEvent('contextmenu', { bubbles: true, clientX: 10, clientY: 10 });
}

/**
 * 按文案查找直接菜单项
 * @param menu 菜单容器
 * @param label 菜单项文案
 * @returns 菜单项元素，找不到返回 undefined
 */
function findMenuItem(menu: HTMLElement, label: string): HTMLElement | undefined {
  return Array.from(menu.children).find(el => el.textContent === label) as HTMLElement | undefined;
}

/**
 * 按文案查找通知卡片上的动作链接
 * @param label 链接文案
 * @returns 链接元素，找不到返回 undefined
 */
function findNotifyLink(label: string): HTMLElement | undefined {
  return Array.from(document.querySelectorAll(`#${NOTIFY_ID} a`))
    .find(el => el.textContent === label) as HTMLElement | undefined;
}

/**
 * 冲刷微任务队列，等待异步 action 完成
 * @param rounds 冲刷轮数
 */
async function flush(rounds = 10): Promise<void> {
  for (let i = 0; i < rounds; i++) {
    await Promise.resolve();
  }
}

/**
 * 取菜单的直接菜单项（不含分隔线）
 * @param menu 菜单容器
 * @returns 菜单项元素数组
 */
function getMenuItems(menu: HTMLElement): HTMLElement[] {
  return (Array.from(menu.children) as HTMLElement[])
    .filter(el => el.classList.contains('gm-menu-item'));
}

/**
 * 取菜单的直接分隔线（样式表 .gm-popup__sep）
 * @param menu 菜单容器
 * @returns 分隔线元素数组
 */
function getSeparators(menu: HTMLElement): HTMLElement[] {
  return (Array.from(menu.children) as HTMLElement[])
    .filter(el => el.classList.contains('gm-popup__sep'));
}

/**
 * 获取当前菜单元素
 * @returns 菜单元素
 */
function getMenu(): HTMLElement {
  const menu = document.getElementById('git-context-menu');
  expect(menu).toBeTruthy();
  return menu as HTMLElement;
}

describe('context-menu', () => {
  beforeEach(async () => {
    // 使用假计时器接管 show* 结束时注册的 setTimeout(0)
    vi.useFakeTimers();
    setLocale('zh-CN');
    setState(s => Object.assign(s, createInitialState()));
    document.body.innerHTML = '';
    writeTextMock = vi.fn().mockResolvedValue(undefined);
    // 宿主 mock 每次重置，避免跨用例污染
    toastMock.mockClear().mockResolvedValue(undefined);
    writeClipboardMock.mockClear().mockResolvedValue(undefined);
    // 直接把断言句柄挂到 host 上，保证组件调用与断言是同一个 spy
    const hostModule = await import('../host');
    const h = hostModule.host as unknown as {
      toast: typeof toastMock;
      writeClipboard: typeof writeClipboardMock;
    };
    h.toast = toastMock;
    h.writeClipboard = writeClipboardMock;
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText: writeTextMock },
      configurable: true,
    });
    confirmMock = vi.fn().mockReturnValue(true);
    vi.stubGlobal('confirm', confirmMock);
    // 每例重置 toast mock 实现：防止 afterEach 的 restoreAllMocks 清空后返回值不再是 Promise 而断链
    vi.mocked(host.toast).mockReset();
    vi.mocked(host.toast).mockResolvedValue(undefined);
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'debug').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  /**
   * 点击扩展自身确认对话框的「确定」按钮
   * 原生 confirm 在沙箱中不可用，组件改用 showConfirmDialog
   */
  function clickConfirmOk(): void {
    const ok = [...document.querySelectorAll('button')].find(b => b.id === 'confirm-ok') as HTMLElement | undefined;
    if (ok) ok.click();
  }

  /**
   * 打开批量提交右键菜单
   * @param hashes 选中的提交哈希
   * @param service 服务桩
   */
  function showContextMenuWithBatch(hashes: string[], service: ServiceClient): void {
    showCommitContextMenu(createContextMenuEvent(), createCommit(), service, DIRECTORY, hashes);
  }

  afterEach(() => {
    hideContextMenu();
    // 执行排队的 setTimeout(0)，让全局 click 关闭监听注册后自清理
    vi.runAllTimers();
    document.body.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    vi.useRealTimers();
    document.body.innerHTML = '';
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  describe('showContextMenu 分支右键菜单', () => {
    it('派发 contextmenu 事件后应在指针位置渲染菜单与全部中文菜单项', () => {
      const service = createMockService();
      const trigger = document.createElement('div');
      document.body.appendChild(trigger);
      trigger.addEventListener('contextmenu', (e) => {
        showContextMenu(e as MouseEvent, branch, service, DIRECTORY);
      });

      trigger.dispatchEvent(createContextMenuEvent());

      const menu = getMenu();
      // 容器外观来自样式表类；只有坐标在打开时内联写入
      expect(menu.classList.contains('gm-popup')).toBe(true);
      expect(menu.style.position).toBe('');
      expect(menu.style.left).toBe('10px');
      expect(menu.style.top).toBe('10px');

      const labels = getMenuItems(menu).map(el => el.textContent);
      expect(labels).toEqual([
        '签出分支',
        '重命名分支',
        '合并到当前分支',
        '变基到此分支',
        '拉取',
        '推送',
        '添加收藏',
        '删除分支',
      ]);
      // 3 条分隔线：纯 div，无文案、无内联修饰
      const separators = getSeparators(menu);
      expect(separators).toHaveLength(3);
      expect(separators[0].tagName).toBe('DIV');
      expect(separators[0].textContent).toBe('');
      expect(separators[0].getAttribute('style')).toBeNull();
    });

    it('删除分支项应带破坏性样式类，普通项只带基础类', () => {
      const service = createMockService();
      showContextMenu(createContextMenuEvent(), branch, service, DIRECTORY);

      const menu = getMenu();
      const dangerItem = findMenuItem(menu, '删除分支');
      const normalItem = findMenuItem(menu, '签出分支');

      expect(dangerItem).toBeTruthy();
      expect(dangerItem!.classList.contains('gm-menu-item')).toBe(true);
      expect(dangerItem!.classList.contains('gm-menu-item--destructive')).toBe(true);
      expect(normalItem).toBeTruthy();
      expect(normalItem!.classList.contains('gm-menu-item')).toBe(true);
      expect(normalItem!.classList.contains('gm-menu-item--destructive')).toBe(false);
      // 颜色与光标由样式表提供，组件不再写内联
      expect(dangerItem!.style.color).toBe('');
      expect(normalItem!.style.color).toBe('');
      expect(normalItem!.style.cursor).toBe('');
    });

    it('悬停与移出菜单项不应写内联背景（高亮由样式表 :hover 提供）', () => {
      const service = createMockService();
      showContextMenu(createContextMenuEvent(), branch, service, DIRECTORY);

      const item = findMenuItem(getMenu(), '签出分支')!;
      expect(() => {
        item.dispatchEvent(new MouseEvent('mouseenter'));
        item.dispatchEvent(new MouseEvent('mouseleave'));
      }).not.toThrow();
      expect(item.style.background).toBe('');
      // 事件未被拦截：菜单仍然打开
      expect(document.getElementById('git-context-menu')).toBeTruthy();
    });

    it('点击签出分支应调用 checkoutBranch 并刷新分支列表后关闭菜单', async () => {
      const service = createMockService();
      showContextMenu(createContextMenuEvent(), branch, service, DIRECTORY);

      findMenuItem(getMenu(), '签出分支')!.click();
      await flush();

      expect(service.checkoutBranch).toHaveBeenCalledWith(DIRECTORY, 'dev');
      expect(service.getBranches).toHaveBeenCalledWith(DIRECTORY);
      expect(getState().branches).toEqual([
        { name: 'feature', isCurrent: false, isRemote: false },
      ]);
      expect(document.getElementById('git-context-menu')).toBeNull();
    });

    it('点击合并到当前分支应调用 mergeBranch', async () => {
      const service = createMockService();
      showContextMenu(createContextMenuEvent(), branch, service, DIRECTORY);

      findMenuItem(getMenu(), '合并到当前分支')!.click();
      await flush();

      expect(service.mergeBranch).toHaveBeenCalledWith(DIRECTORY, 'dev');
      expect(document.getElementById('git-context-menu')).toBeNull();
    });

    it('点击变基到此分支应调用 rebaseBranch', async () => {
      const service = createMockService();
      showContextMenu(createContextMenuEvent(), branch, service, DIRECTORY);

      findMenuItem(getMenu(), '变基到此分支')!.click();
      await flush();

      expect(service.rebaseBranch).toHaveBeenCalledWith(DIRECTORY, 'dev');
    });

    it('点击拉取与推送应分别调用 pull 与 push', async () => {
      const service = createMockService();
      showContextMenu(createContextMenuEvent(), branch, service, DIRECTORY);
      findMenuItem(getMenu(), '拉取')!.click();
      await flush();

      showContextMenu(createContextMenuEvent(), branch, service, DIRECTORY);
      findMenuItem(getMenu(), '推送')!.click();
      await flush();

      expect(service.pull).toHaveBeenCalledWith(DIRECTORY);
      expect(service.push).toHaveBeenCalledWith(DIRECTORY);
    });

    it('点击添加收藏应切换 favorites 并保存到远端', async () => {
      const service = createMockService();
      showContextMenu(createContextMenuEvent(), branch, service, DIRECTORY);

      findMenuItem(getMenu(), '添加收藏')!.click();
      await flush();

      expect(getState().favorites.has('dev')).toBe(true);
      expect(service.saveFavorites).toHaveBeenCalledWith(DIRECTORY, ['dev']);
    });

    it('已收藏分支应显示取消收藏并可取消', async () => {
      const service = createMockService();
      setState(s => {
        s.favorites = new Set(['dev']);
      });

      showContextMenu(createContextMenuEvent(), branch, service, DIRECTORY);
      const item = findMenuItem(getMenu(), '取消收藏');
      expect(item).toBeTruthy();

      item!.click();
      await flush();

      expect(getState().favorites.has('dev')).toBe(false);
      expect(service.saveFavorites).toHaveBeenCalledWith(DIRECTORY, []);
    });

    it('点击删除分支应直接调用 deleteBranch，不调用 confirm、不打开对话框', async () => {
      const service = createMockService();
      showContextMenu(createContextMenuEvent(), branch, service, DIRECTORY);

      findMenuItem(getMenu(), '删除分支')!.click();
      await flush();

      // 对齐 IDEA：无原生 confirm、无自定义确认对话框，点菜单即直接删除
      expect(confirmMock).not.toHaveBeenCalled();
      expect(service.deleteBranch).toHaveBeenCalledWith(DIRECTORY, 'dev');
      expect(document.getElementById('delete-branch-ok')).toBeNull();
      expect(document.getElementById('delete-branch-message')).toBeNull();
      expect(document.getElementById('git-context-menu')).toBeNull();
    });

    it('多选分支后右键删除应删除全部选中分支（回归：此前只删右键的那一个）', async () => {
      const service = createMockService();
      // 模拟 Cmd 多选：selectedBranches 里有两个分支，右键落在其中一个上
      setState(s => {
        s.branches = [
          { name: 'dev', isCurrent: false, isRemote: false },
          { name: 'feat-a', isCurrent: false, isRemote: false },
          { name: 'feat-b', isCurrent: false, isRemote: false },
        ];
        s.selectedBranches = new Set(['feat-a', 'feat-b']);
        s.selectedBranch = null;
      });

      showContextMenu(createContextMenuEvent(), branch, service, DIRECTORY);
      findMenuItem(getMenu(), '删除分支')!.click();
      await flush();

      // 关键断言：两个分支都要被删，而不只是右键的 dev
      const deleted = vi.mocked(service.deleteBranch).mock.calls.map(c => c[1]);
      expect(deleted).toContain('feat-a');
      expect(deleted).toContain('feat-b');
      expect(deleted).not.toContain('dev');
      // 删除后清空多选集合
      expect(getState().selectedBranches.size).toBe(0);
    });

    it('多选包含当前分支时删除项应禁用', async () => {
      const service = createMockService();
      setState(s => {
        s.branches = [
          { name: 'dev', isCurrent: true, isRemote: false },
          { name: 'feat-a', isCurrent: false, isRemote: false },
        ];
        s.selectedBranches = new Set(['dev', 'feat-a']);
        s.selectedBranch = null;
      });

      showContextMenu(createContextMenuEvent(), branch, service, DIRECTORY);
      const item = findMenuItem(getMenu(), '删除分支');
      expect(item).toBeTruthy();
      // 对齐 IDEA：含当前分支时动作置灰，点击不执行
      expect(item!.dataset.disabled).toBe('true');
      item!.click();
      await flush();
      expect(service.deleteBranch).not.toHaveBeenCalled();
    });

    it('删除成功应出现 IDEA 式通知卡片（正文 + 还原/删除跟踪两条动作链接）并刷新分支列表', async () => {
      const service = createMockService();
      showContextMenu(createContextMenuEvent(), branch, service, DIRECTORY);

      findMenuItem(getMenu(), '删除分支')!.click();
      await flush();

      const card = document.getElementById(NOTIFY_ID);
      expect(card).toBeTruthy();
      expect(card!.textContent).toContain('已删除的分支: dev');
      expect(Array.from(card!.querySelectorAll('a')).map(a => a.textContent))
        .toEqual(['还原', '删除跟踪的分支']);

      expect(service.getBranches).toHaveBeenCalledWith(DIRECTORY);
      expect(getState().branches).toEqual([
        { name: 'feature', isCurrent: false, isRemote: false },
      ]);
      // 成功提示已由通知卡片取代：不发任何 toast
      expect(host.toast).not.toHaveBeenCalled();
    });

    it('当前分支的删除项应禁用（data-disabled），点击与悬停都无响应', async () => {
      const currentBranch: Branch = { name: 'main', isCurrent: true, isRemote: false };
      const service = createMockService();
      showContextMenu(createContextMenuEvent(), currentBranch, service, DIRECTORY);

      const item = findMenuItem(getMenu(), '删除分支')!;
      expect(item.dataset.disabled).toBe('true');
      // 置灰的外观由样式表 [data-disabled="true"] 提供，不写内联颜色/光标
      expect(item.style.color).toBe('');
      expect(item.style.cursor).toBe('');

      // 悬停不写内联高亮（禁用项由样式表 :hover 兜底）
      expect(() => item.dispatchEvent(new MouseEvent('mouseenter'))).not.toThrow();
      expect(item.style.background).toBe('');

      // 点击不执行动作、不打开对话框、不关闭菜单（回归：委托处理曾漏检 disabled）
      item.click();
      await flush();
      expect(service.deleteBranch).not.toHaveBeenCalled();
      expect(document.getElementById('delete-branch-ok')).toBeNull();
      expect(document.getElementById('git-context-menu')).toBeTruthy();
    });

    it('deleteBranch reject NOT_MERGED 时应打开强制删除对话框（打开即 force 模式，不弹两次、不自动重发）', async () => {
      const service = createMockService();
      vi.mocked(service.deleteBranch).mockRejectedValueOnce(
        new Error(JSON.stringify({ code: 'NOT_MERGED', message: 'not merged' }))
      );
      showContextMenu(createContextMenuEvent(), branch, service, DIRECTORY);

      findMenuItem(getMenu(), '删除分支')!.click();
      await flush();

      // 打开即强制模式：正文与按钮直接是 force 文案，且仅弹一次
      expect(document.getElementById('delete-branch-message')!.textContent)
        .toBe('分支 dev 尚未合并到当前分支，强制删除将丢失其上的提交。');
      expect(document.getElementById('delete-branch-ok')!.textContent).toBe('强制删除');
      expect(document.querySelectorAll('#delete-branch-ok')).toHaveLength(1);
      expect((document.getElementById('delete-branch-ok') as HTMLButtonElement).disabled).toBe(false);
      // 直接删除只发起了 1 次，未自动重发；尚未成功也未发通知
      expect(service.deleteBranch).toHaveBeenCalledTimes(1);
      expect(document.getElementById(NOTIFY_ID)).toBeNull();
    });

    it('强制对话框确认应以 force=true 删除并发出通知卡片', async () => {
      const service = createMockService();
      vi.mocked(service.deleteBranch).mockRejectedValueOnce(
        new Error(JSON.stringify({ code: 'NOT_MERGED', message: 'not merged' }))
      );
      showContextMenu(createContextMenuEvent(), branch, service, DIRECTORY);

      findMenuItem(getMenu(), '删除分支')!.click();
      await flush();
      document.getElementById('delete-branch-ok')!.click();
      await flush();

      expect(service.deleteBranch).toHaveBeenNthCalledWith(1, DIRECTORY, 'dev');
      expect(service.deleteBranch).toHaveBeenNthCalledWith(2, DIRECTORY, 'dev', true);
      // 对话框关闭，通知照发（与直接删除成功同一条链路）
      expect(document.getElementById('delete-branch-ok')).toBeNull();
      expect(document.getElementById(NOTIFY_ID)!.textContent).toContain('已删除的分支: dev');
      expect(getState().branches).toEqual([
        { name: 'feature', isCurrent: false, isRemote: false },
      ]);
    });

    it('强制对话框点取消应关闭且不再调用 service.deleteBranch', async () => {
      const service = createMockService();
      vi.mocked(service.deleteBranch).mockRejectedValueOnce(
        new Error(JSON.stringify({ code: 'NOT_MERGED', message: 'not merged' }))
      );
      showContextMenu(createContextMenuEvent(), branch, service, DIRECTORY);

      findMenuItem(getMenu(), '删除分支')!.click();
      await flush();
      document.getElementById('delete-branch-cancel')!.click();
      await flush();

      // 取消后不再删除：仅剩最初的直接删除调用，且不发通知
      expect(service.deleteBranch).toHaveBeenCalledTimes(1);
      expect(document.getElementById('delete-branch-ok')).toBeNull();
      expect(document.getElementById(NOTIFY_ID)).toBeNull();
    });

    it('点击通知「还原」应调用 restoreBranch、刷新分支列表并显示还原成功提示', async () => {
      const service = createMockService();
      vi.mocked(service.getBranches).mockResolvedValue([
        { name: 'dev', isCurrent: true, isRemote: false },
      ]);
      showContextMenu(createContextMenuEvent(), branch, service, DIRECTORY);

      findMenuItem(getMenu(), '删除分支')!.click();
      await flush();
      findNotifyLink('还原')!.click();
      await flush();

      expect(service.restoreBranch).toHaveBeenCalledWith(DIRECTORY, 'dev', 'abc123', {
        remote: 'origin',
        branch: 'dev',
      });
      // 删除刷新 + 还原刷新共两次
      expect(service.getBranches).toHaveBeenCalledTimes(2);
      expect(getState().branches).toEqual([
        { name: 'dev', isCurrent: true, isRemote: false },
      ]);
      expect(host.toast).toHaveBeenCalledTimes(1);
      const request = vi.mocked(host.toast).mock.calls[0][0];
      expect(request.kind).toBe('success');
      expect(String(request.message)).toContain('dev');
      // 还原成功后卡片关闭
      expect(document.getElementById(NOTIFY_ID)).toBeNull();
    });

    it('点击通知「删除跟踪的分支」应调用 deleteRemoteBranch', async () => {
      const service = createMockService();
      showContextMenu(createContextMenuEvent(), branch, service, DIRECTORY);

      findMenuItem(getMenu(), '删除分支')!.click();
      await flush();
      findNotifyLink('删除跟踪的分支')!.click();
      await flush();

      expect(service.deleteRemoteBranch).toHaveBeenCalledWith(DIRECTORY, 'origin', 'dev');
      expect(document.getElementById(NOTIFY_ID)).toBeNull();
    });

    it('删除远程分支（kind=remote）时通知卡片应无动作链接', async () => {
      const service = createMockService();
      vi.mocked(service.deleteBranch).mockResolvedValue({
        success: true,
        kind: 'remote',
        tip: 'abc123',
        upstream: null,
        canDeleteTracking: false,
      });
      showContextMenu(createContextMenuEvent(), branch, service, DIRECTORY);

      findMenuItem(getMenu(), '删除分支')!.click();
      await flush();

      const card = document.getElementById(NOTIFY_ID);
      expect(card).toBeTruthy();
      expect(card!.textContent).toContain('已删除的分支: dev');
      expect(card!.querySelectorAll('a')).toHaveLength(0);
      expect(findNotifyLink('还原')).toBeUndefined();
      expect(findNotifyLink('删除跟踪的分支')).toBeUndefined();
    });

    it('deleteBranch reject NOT_FOUND 时应弹错误 toast（branch.notFound）且不打开对话框', async () => {
      const service = createMockService();
      vi.mocked(service.deleteBranch).mockRejectedValueOnce(
        new Error(JSON.stringify({ code: 'NOT_FOUND', message: 'no such branch' }))
      );
      showContextMenu(createContextMenuEvent(), branch, service, DIRECTORY);

      findMenuItem(getMenu(), '删除分支')!.click();
      await flush();

      expect(host.toast).toHaveBeenCalledTimes(1);
      const request = vi.mocked(host.toast).mock.calls[0][0];
      expect(request.kind).toBe('error');
      expect(String(request.message)).toBe('分支 dev 不存在');
      expect(document.getElementById('delete-branch-ok')).toBeNull();
      expect(document.getElementById(NOTIFY_ID)).toBeNull();

      // 失败输出 [context-menu] JSON 日志
      const debugCall = vi.mocked(console.debug).mock.calls.find(
        c => typeof c[0] === 'string' && c[0].includes('branch_delete_failed')
      );
      expect(debugCall).toBeTruthy();
      expect(JSON.parse(String(debugCall![0])))
        .toMatchObject({ prefix: '[context-menu]', branch: 'dev', code: 'NOT_FOUND' });
    });

    it('deleteBranch reject GIT_ERROR 时应弹错误 toast（deleteFailed 前缀 + 原始 message）', async () => {
      const service = createMockService();
      vi.mocked(service.deleteBranch).mockRejectedValueOnce(
        new Error(JSON.stringify({ code: 'GIT_ERROR', message: "error: cannot delete branch 'dev'" }))
      );
      showContextMenu(createContextMenuEvent(), branch, service, DIRECTORY);

      findMenuItem(getMenu(), '删除分支')!.click();
      await flush();

      expect(host.toast).toHaveBeenCalledTimes(1);
      const request = vi.mocked(host.toast).mock.calls[0][0];
      expect(request.kind).toBe('error');
      expect(String(request.message)).toBe("删除分支失败: error: cannot delete branch 'dev'");
      expect(document.getElementById('delete-branch-ok')).toBeNull();
    });

    it('deleteBranch reject 非 JSON（网络层等）时应按 deleteFailed 前缀原样透出', async () => {
      const service = createMockService();
      vi.mocked(service.deleteBranch).mockRejectedValueOnce(new Error('网络连接中断'));
      showContextMenu(createContextMenuEvent(), branch, service, DIRECTORY);

      findMenuItem(getMenu(), '删除分支')!.click();
      await flush();

      expect(host.toast).toHaveBeenCalledTimes(1);
      const request = vi.mocked(host.toast).mock.calls[0][0];
      expect(request.kind).toBe('error');
      expect(String(request.message)).toBe('删除分支失败: 网络连接中断');
      expect(document.getElementById('delete-branch-ok')).toBeNull();
    });

    it('删除成功但刷新分支列表失败时通知照发，仅记日志且不显示错误', async () => {
      const service = createMockService();
      vi.mocked(service.getBranches).mockRejectedValueOnce(new Error('刷新失败'));
      showContextMenu(createContextMenuEvent(), branch, service, DIRECTORY);

      findMenuItem(getMenu(), '删除分支')!.click();
      await flush();

      // 删除成功事实优先：通知照发、不弹任何错误 toast
      expect(document.getElementById(NOTIFY_ID)).toBeTruthy();
      expect(host.toast).not.toHaveBeenCalled();
      const errorCall = vi.mocked(console.error).mock.calls.find(
        c => typeof c[0] === 'string' && c[0].includes('branch_delete_refresh_error')
      );
      expect(errorCall).toBeTruthy();
      const payload = JSON.parse(String(errorCall![0]));
      expect(payload.prefix).toBe('[context-menu]');
      expect(payload.branch).toBe('dev');
    });

    it('删除的是选中分支时应清空 selectedBranch，还原回调后恢复', async () => {
      const service = createMockService();
      setState(s => { s.selectedBranch = branch; });
      vi.mocked(service.getBranches).mockResolvedValue([
        { name: 'dev', isCurrent: true, isRemote: false },
      ]);
      showContextMenu(createContextMenuEvent(), branch, service, DIRECTORY);

      findMenuItem(getMenu(), '删除分支')!.click();
      await flush();
      expect(getState().selectedBranch).toBeNull();

      findNotifyLink('还原')!.click();
      await flush();

      expect(service.restoreBranch).toHaveBeenCalledWith(DIRECTORY, 'dev', 'abc123', {
        remote: 'origin',
        branch: 'dev',
      });
      expect(getState().selectedBranch?.name).toBe('dev');
    });

    it('点击重命名分支应打开重命名对话框', async () => {
      const service = createMockService();
      showContextMenu(createContextMenuEvent(), branch, service, DIRECTORY);

      findMenuItem(getMenu(), '重命名分支')!.click();
      await flush();

      const input = document.getElementById('rename-input') as HTMLInputElement;
      expect(input).toBeTruthy();
      expect(input.value).toBe('dev');
      // 菜单已关闭
      expect(document.getElementById('git-context-menu')).toBeNull();
    });

    it('点击分隔线不应关闭菜单', () => {
      const service = createMockService();
      showContextMenu(createContextMenuEvent(), branch, service, DIRECTORY);
      vi.runAllTimers();

      const menu = getMenu();
      const separator = getSeparators(menu)[0];
      separator.dispatchEvent(new MouseEvent('click', { bubbles: true }));

      expect(document.getElementById('git-context-menu')).toBeTruthy();
    });

    it('点击菜单外部应关闭菜单', () => {
      const service = createMockService();
      showContextMenu(createContextMenuEvent(), branch, service, DIRECTORY);
      // 触发 setTimeout(0) 注册全局 click 关闭监听
      vi.runAllTimers();
      expect(document.getElementById('git-context-menu')).toBeTruthy();

      document.body.dispatchEvent(new MouseEvent('click', { bubbles: true }));

      expect(document.getElementById('git-context-menu')).toBeNull();
    });

    it('重复打开菜单应只保留一个菜单', () => {
      const service = createMockService();
      showContextMenu(createContextMenuEvent(), branch, service, DIRECTORY);
      showContextMenu(createContextMenuEvent(), branch, service, DIRECTORY);

      expect(document.querySelectorAll('#git-context-menu')).toHaveLength(1);
    });

    it('hideContextMenu 应移除菜单且无菜单时安全', () => {
      const service = createMockService();
      expect(() => hideContextMenu()).not.toThrow();

      showContextMenu(createContextMenuEvent(), branch, service, DIRECTORY);
      hideContextMenu();

      expect(document.getElementById('git-context-menu')).toBeNull();
    });
  });

  describe('showCommitContextMenu 单提交菜单', () => {
    it('应在指针位置渲染单提交菜单项与分隔线', () => {
      const service = createMockService();
      showCommitContextMenu(createContextMenuEvent(), createCommit(), service, DIRECTORY);

      const menu = getMenu();
      expect(menu.classList.contains('gm-popup')).toBe(true);
      expect(menu.style.left).toBe('10px');
      expect(menu.style.top).toBe('10px');

      const labels = getMenuItems(menu).map(el => el.textContent);
      // 顺序对齐 IDEA 提交右键菜单：复制 → Cherry-pick/比较 → Reset/Revert
      // → 撤销/编辑/删除 → 推送至此 → 分支/标签
      expect(labels).toEqual([
        '复制提交哈希',
        'Cherry-pick',
        '与本地比较',
        '将当前分支重置到此处',
        '回滚提交',
        '撤销提交',
        '编辑提交信息',
        '删除提交',
        '推送此前所有提交',
        '新建分支',
        '新建标签',
      ]);
      const separators = getSeparators(menu);
      expect(separators).toHaveLength(5);
    });

    it('点击复制提交哈希应写入剪贴板', async () => {
      const service = createMockService();
      showCommitContextMenu(createContextMenuEvent(), createCommit(), service, DIRECTORY);

      findMenuItem(getMenu(), '复制提交哈希')!.click();
      await flush();

      expect(writeClipboardMock).toHaveBeenCalledWith('abc123');
      expect(document.getElementById('git-context-menu')).toBeNull();
    });

    it('点击 Cherry-pick 应调用 service.cherryPick', async () => {
      const service = createMockService();
      showCommitContextMenu(createContextMenuEvent(), createCommit(), service, DIRECTORY);

      findMenuItem(getMenu(), 'Cherry-pick')!.click();
      await flush();

      expect(service.cherryPick).toHaveBeenCalledWith(DIRECTORY, 'abc123');
      expect(document.getElementById('git-context-menu')).toBeNull();
    });

    it('点击回滚提交应调用 service.revert', async () => {
      const service = createMockService();
      showCommitContextMenu(createContextMenuEvent(), createCommit(), service, DIRECTORY);

      findMenuItem(getMenu(), '回滚提交')!.click();
      await flush();

      expect(service.revert).toHaveBeenCalledWith(DIRECTORY, 'abc123');
    });

    it('点击与本地比较应调用 diffVsLocal 并更新 diffs 后关闭菜单', async () => {
      const service = createMockService();
      const sampleDiff: FileDiff = { path: 'src/app.ts', additions: 2, deletions: 1, lines: [] };
      vi.mocked(service.diffVsLocal).mockResolvedValue([sampleDiff]);

      showCommitContextMenu(createContextMenuEvent(), createCommit(), service, DIRECTORY);

      findMenuItem(getMenu(), '与本地比较')!.click();
      await flush();

      expect(service.diffVsLocal).toHaveBeenCalledWith(DIRECTORY, 'abc123');
      expect(getState().diffs).toEqual([sampleDiff]);
      expect(document.getElementById('git-context-menu')).toBeNull();
    });

    it('点击新建标签应记录日志并关闭菜单', async () => {
      const service = createMockService();
      showCommitContextMenu(createContextMenuEvent(), createCommit(), service, DIRECTORY);

      findMenuItem(getMenu(), '新建标签')!.click();
      await flush();

      expect(console.log).toHaveBeenCalledWith('[git-manager] New Tag from commit:', 'abc123');
      expect(document.getElementById('git-context-menu')).toBeNull();
    });

    it('点击重置应打开对话框并按默认 soft 模式执行', async () => {
      const service = createMockService();
      showCommitContextMenu(createContextMenuEvent(), createCommit(), service, DIRECTORY);

      findMenuItem(getMenu(), '将当前分支重置到此处')!.click();
      await flush();

      const okButton = document.getElementById('reset-ok');
      expect(okButton).toBeTruthy();

      okButton!.click();
      await flush();

      expect(service.reset).toHaveBeenCalledWith(DIRECTORY, 'abc123', 'soft');
      // 对话框已关闭
      expect(document.getElementById('reset-ok')).toBeNull();
    });

    it('点击新建分支应打开对话框并创建分支后刷新列表', async () => {
      const service = createMockService();
      showCommitContextMenu(createContextMenuEvent(), createCommit(), service, DIRECTORY);

      findMenuItem(getMenu(), '新建分支')!.click();
      await flush();

      const input = document.getElementById('new-branch-input') as HTMLInputElement;
      expect(input).toBeTruthy();

      input.value = 'feature/x';
      document.getElementById('create-ok')!.click();
      await flush();

      expect(service.checkoutNewBranch).toHaveBeenCalledWith(DIRECTORY, 'feature/x', 'abc123');
      expect(getState().branches).toEqual([
        { name: 'feature', isCurrent: false, isRemote: false },
      ]);
      expect(document.getElementById('new-branch-input')).toBeNull();
    });

    it('点击分隔线不应关闭单提交菜单', () => {
      const service = createMockService();
      showCommitContextMenu(createContextMenuEvent(), createCommit(), service, DIRECTORY);
      vi.runAllTimers();

      const menu = getMenu();
      const separator = getSeparators(menu)[0];
      separator.dispatchEvent(new MouseEvent('click', { bubbles: true }));

      expect(document.getElementById('git-context-menu')).toBeTruthy();
    });

    it('点击菜单外部应关闭单提交菜单', () => {
      const service = createMockService();
      showCommitContextMenu(createContextMenuEvent(), createCommit(), service, DIRECTORY);
      vi.runAllTimers();

      document.body.dispatchEvent(new MouseEvent('click', { bubbles: true }));

      expect(document.getElementById('git-context-menu')).toBeNull();
    });
  });

  describe('showCommitContextMenu 批量菜单', () => {
    /** 批量选中的提交哈希（旧→新） */
    const batchHashes = ['h1', 'h2', 'h3'];

    it('batchHashes 多于 1 个时应渲染批量菜单与禁用首项', () => {
      const service = createMockService();
      showCommitContextMenu(createContextMenuEvent(), createCommit(), service, DIRECTORY, batchHashes);

      const menu = getMenu();
      const labels = getMenuItems(menu).map(el => el.textContent);
      expect(labels).toEqual([
        '已选中 3 个提交',
        '复制哈希列表',
        'Cherry-pick 全部 (3)',
        'Revert 全部 (3)',
      ]);
      // 仅 1 条分隔线
      expect(getSeparators(menu)).toHaveLength(1);

      // 首项为禁用态
      const disabledItem = findMenuItem(menu, '已选中 3 个提交')!;
      expect(disabledItem.dataset.disabled).toBe('true');
      // 置灰外观来自样式表，不写内联颜色/光标
      expect(disabledItem.style.color).toBe('');
      expect(disabledItem.style.cursor).toBe('');
    });

    it('点击复制哈希列表应按换行拼接写入剪贴板', async () => {
      const service = createMockService();
      showCommitContextMenu(createContextMenuEvent(), createCommit(), service, DIRECTORY, batchHashes);

      findMenuItem(getMenu(), '复制哈希列表')!.click();
      await flush();

      expect(writeClipboardMock).toHaveBeenCalledWith('h1\nh2\nh3');
    });

    it('确认后点击 Cherry-pick 全部应逐个调用 service.cherryPick', async () => {
      const service = createMockService();
      showCommitContextMenu(createContextMenuEvent(), createCommit(), service, DIRECTORY, batchHashes);

      findMenuItem(getMenu(), 'Cherry-pick 全部 (3)')!.click();
      await flush();
      // 确认对话框应已渲染
      expect(document.getElementById('confirm-ok')).toBeTruthy();
      clickConfirmOk();
      await flush();

      expect(service.cherryPick).toHaveBeenCalledTimes(3);
      expect(service.cherryPick).toHaveBeenNthCalledWith(1, DIRECTORY, 'h1');
      expect(service.cherryPick).toHaveBeenNthCalledWith(2, DIRECTORY, 'h2');
      expect(service.cherryPick).toHaveBeenNthCalledWith(3, DIRECTORY, 'h3');
      expect(document.getElementById('git-context-menu')).toBeNull();
    });

    it('取消确认时不应执行批量 Cherry-pick', async () => {
      const service = createMockService();
      showCommitContextMenu(createContextMenuEvent(), createCommit(), service, DIRECTORY, batchHashes);

      findMenuItem(getMenu(), 'Cherry-pick 全部 (3)')!.click();
      await flush();
      // 点击取消
      const cancel = [...document.querySelectorAll('button')].find(b => b.id === 'confirm-cancel') as HTMLElement | undefined;
      expect(cancel).toBeTruthy();
      cancel?.click();
      await flush();

      expect(service.cherryPick).not.toHaveBeenCalled();
    });

    it('确认后点击 Revert 全部应逐个调用 service.revert', async () => {
      const service = createMockService();
      showCommitContextMenu(createContextMenuEvent(), createCommit(), service, DIRECTORY, batchHashes);

      findMenuItem(getMenu(), 'Revert 全部 (3)')!.click();
      await flush();
      expect(document.getElementById('confirm-message')?.textContent).toContain('确定对 3 个提交执行 Revert 吗？');
      clickConfirmOk();
      await flush();

      expect(service.revert).toHaveBeenCalledTimes(3);
      expect(service.revert).toHaveBeenNthCalledWith(1, DIRECTORY, 'h1');
      expect(service.revert).toHaveBeenNthCalledWith(3, DIRECTORY, 'h3');
    });

    it('点击菜单外部应关闭批量菜单', () => {
      const service = createMockService();
      showCommitContextMenu(createContextMenuEvent(), createCommit(), service, DIRECTORY, batchHashes);
      vi.runAllTimers();

      document.body.dispatchEvent(new MouseEvent('click', { bubbles: true }));

      expect(document.getElementById('git-context-menu')).toBeNull();
    });

    it('batchHashes 只有 1 个时应回退为单提交菜单', () => {
      const service = createMockService();
      showCommitContextMenu(createContextMenuEvent(), createCommit(), service, DIRECTORY, ['h1']);

      const labels = getMenuItems(getMenu()).map(el => el.textContent);
      expect(labels).toContain('复制提交哈希');
      expect(labels).not.toContain('已选中 1 个提交');
    });
  });

  describe('样式类契约', () => {
    it('分支菜单容器、菜单项与分隔线只使用样式表类，内联仅保留坐标', () => {
      const service = createMockService();
      showContextMenu(createContextMenuEvent(), branch, service, DIRECTORY);

      const menu = getMenu();
      expect(menu.classList.contains('gm-popup')).toBe(true);
      // 坐标在打开时计算，属运行时值
      expect(menu.style.left).toBe('10px');
      expect(menu.style.top).toBe('10px');
      // 其余外观不得内联
      expect(menu.style.position).toBe('');
      expect(menu.style.background).toBe('');
      expect(menu.style.border).toBe('');
      expect(menu.style.borderRadius).toBe('');
      expect(menu.style.padding).toBe('');
      expect(menu.style.zIndex).toBe('');
      expect(menu.style.minWidth).toBe('');
      expect(menu.style.boxShadow).toBe('');

      const item = findMenuItem(menu, '签出分支')!;
      expect(item.classList.contains('gm-menu-item')).toBe(true);
      expect(item.dataset.disabled).toBe('false');
      expect(item.style.padding).toBe('');
      expect(item.style.fontSize).toBe('');

      const sep = getSeparators(menu)[0];
      expect(sep.classList.contains('gm-popup__sep')).toBe(true);
      expect(sep.getAttribute('style')).toBeNull();
    });

    it('单提交菜单的菜单项与分隔线只使用样式表类', () => {
      const service = createMockService();
      showCommitContextMenu(createContextMenuEvent(), createCommit(), service, DIRECTORY);

      const menu = getMenu();
      const item = findMenuItem(menu, '复制提交哈希')!;
      expect(item.classList.contains('gm-menu-item')).toBe(true);
      expect(item.style.padding).toBe('');
      expect(item.style.fontSize).toBe('');
      expect(item.style.cursor).toBe('');
      expect(item.style.color).toBe('');

      const sep = getSeparators(menu)[0];
      expect(sep.classList.contains('gm-popup__sep')).toBe(true);
      expect(sep.getAttribute('style')).toBeNull();
    });
  });

  describe('失败路径日志', () => {
    it('分支菜单各项操作失败时应输出结构化日志并弹出错误提示', async () => {
      const err = new Error('模拟服务失败');
      const cases: Array<{ label: string; method: string; action: string }> = [
        { label: '签出分支', method: 'checkoutBranch', action: 'checkout' },
        { label: '合并到当前分支', method: 'mergeBranch', action: 'merge' },
        { label: '变基到此分支', method: 'rebaseBranch', action: 'rebase' },
        { label: '拉取', method: 'pull', action: 'pull' },
        { label: '推送', method: 'push', action: 'push' },
      ];

      for (const c of cases) {
        const service = createMockService();
        const failing = vi.fn().mockRejectedValue(err);
        (service as unknown as Record<string, typeof failing>)[c.method] = failing;
        toastMock.mockClear();

        showContextMenu(createContextMenuEvent(), branch, service, DIRECTORY);
        findMenuItem(getMenu(), c.label)!.click();
        await flush();

        // 失败必须让用户可见：结构化日志 + error toast（原先仅 console.error 导致「点击无反应」）
        const log = vi.mocked(console.error).mock.calls
          .map(call => String(call[0]))
          .find(m => m.includes(`${c.action}_error`));
        expect(log, `${c.label} 应输出 ${c.action}_error 日志`).toBeTruthy();
        expect(toastMock, `${c.label} 应弹出错误提示`).toHaveBeenCalledWith(
          expect.objectContaining({ kind: 'error' }),
        );
      }
    });

    it('分支操作成功时应刷新并提示成功', async () => {
      const service = createMockService();
      showContextMenu(createContextMenuEvent(), branch, service, DIRECTORY);
      findMenuItem(getMenu(), '签出分支')!.click();
      await flush();

      expect(service.checkoutBranch).toHaveBeenCalledWith(DIRECTORY, 'dev');
      // 签出后应刷新分支列表
      expect(service.getBranches).toHaveBeenCalled();
      expect(toastMock).toHaveBeenCalledWith(
        expect.objectContaining({ kind: 'success' }),
      );
    });

    it('单提交 Cherry-pick 失败时应输出结构化日志并弹出错误提示', async () => {
      const err = new Error('模拟操作失败');
      const service = createMockService();
      vi.mocked(service.cherryPick).mockRejectedValue(err);

      showCommitContextMenu(createContextMenuEvent(), createCommit(), service, DIRECTORY);
      findMenuItem(getMenu(), 'Cherry-pick')!.click();
      await flush();

      // 失败必须让用户可见：结构化日志 + error toast（原先仅打 console 导致「没反应」）
      const log = vi.mocked(console.error).mock.calls
        .map(c => String(c[0]))
        .find(m => m.includes('cherry_pick_error'));
      expect(log).toBeTruthy();
      expect(toastMock).toHaveBeenCalledWith(expect.objectContaining({ kind: 'error' }));
    });

    it('Cherry-pick 冲突时应提示冲突而非通用失败', async () => {
      const err = new Error('error: could not apply abc123... conflict in file.ts');
      const service = createMockService();
      vi.mocked(service.cherryPick).mockRejectedValue(err);

      showCommitContextMenu(createContextMenuEvent(), createCommit(), service, DIRECTORY);
      findMenuItem(getMenu(), 'Cherry-pick')!.click();
      await flush();

      const toastArg = toastMock.mock.calls.at(-1)?.[0] as { message: string } | undefined;
      expect(toastArg?.message).toContain('冲突');
    });

    it('单提交 Cherry-pick 成功时应刷新列表并提示成功', async () => {
      const service = createMockService();
      vi.mocked(service.cherryPick).mockResolvedValue(undefined);

      showCommitContextMenu(createContextMenuEvent(), createCommit(), service, DIRECTORY);
      findMenuItem(getMenu(), 'Cherry-pick')!.click();
      await flush();

      expect(service.cherryPick).toHaveBeenCalledWith(DIRECTORY, 'abc123');
      expect(toastMock).toHaveBeenCalledWith(expect.objectContaining({ kind: 'success' }));
    });

    it('单提交 Revert 失败时应输出结构化日志并弹出错误提示', async () => {
      const err = new Error('模拟操作失败');
      const service = createMockService();

      vi.mocked(service.revert).mockRejectedValue(err);
      showCommitContextMenu(createContextMenuEvent(), createCommit(), service, DIRECTORY);
      findMenuItem(getMenu(), '回滚提交')!.click();
      await flush();

      // 原先仅 console.error，用户看不到任何反馈
      const log = vi.mocked(console.error).mock.calls
        .map(c => String(c[0]))
        .find(m => m.includes('revert_error'));
      expect(log).toBeTruthy();
      expect(toastMock).toHaveBeenCalledWith(expect.objectContaining({ kind: 'error' }));
    });

    it('单提交 Revert 成功时应刷新列表并提示成功', async () => {
      const service = createMockService();
      vi.mocked(service.revert).mockResolvedValue(undefined);

      showCommitContextMenu(createContextMenuEvent(), createCommit(), service, DIRECTORY);
      findMenuItem(getMenu(), '回滚提交')!.click();
      await flush();

      expect(service.revert).toHaveBeenCalledWith(DIRECTORY, 'abc123');
      // revert 会新增反向提交，必须刷新才能看到
      expect(service.getLog).toHaveBeenCalled();
      expect(toastMock).toHaveBeenCalledWith(expect.objectContaining({ kind: 'success' }));
    });

    it('与本地比较失败时应提示用户且不覆盖 diffs', async () => {
      const err = new Error('diff 服务不可用');
      const service = createMockService();
      vi.mocked(service.diffVsLocal).mockRejectedValue(err);
      toastMock.mockClear();

      showCommitContextMenu(createContextMenuEvent(), createCommit(), service, DIRECTORY);
      findMenuItem(getMenu(), '与本地比较')!.click();
      await flush();

      // 回归：此前只写 console，用户点菜单后界面毫无变化
      expect(toastMock).toHaveBeenCalledWith(expect.objectContaining({
        kind: 'error',
        message: expect.stringContaining('diff 服务不可用'),
      }));
      // 仍写结构化日志便于排查
      const errorSpy = vi.mocked(console.error);
      const jsonCall = errorSpy.mock.calls.find(
        c => typeof c[0] === 'string' && c[0].includes('compare_local_error')
      );
      expect(jsonCall).toBeTruthy();
      // 失败时 diffs 保持初始值
      expect(getState().diffs).toEqual([]);
    });

    it('批量复制应优先走宿主剪贴板通道并提示成功', async () => {
      const service = createMockService();

      showCommitContextMenu(createContextMenuEvent(), createCommit(), service, DIRECTORY, ['h1', 'h2', 'h3']);
      findMenuItem(getMenu(), '复制哈希列表')!.click();
      await flush();

      // 沙箱内 navigator.clipboard 不可靠，必须优先使用宿主通道
      expect(writeClipboardMock).toHaveBeenCalledWith('h1\nh2\nh3');
      expect(toastMock).toHaveBeenCalledWith(expect.objectContaining({ kind: 'success' }));
    });

    it('宿主剪贴板通道失败时应回退到浏览器 API', async () => {
      writeClipboardMock.mockRejectedValueOnce(new Error('宿主不可用'));
      writeTextMock.mockResolvedValue(undefined);
      const service = createMockService();

      showCommitContextMenu(createContextMenuEvent(), createCommit(), service, DIRECTORY, ['h1', 'h2']);
      findMenuItem(getMenu(), '复制哈希列表')!.click();
      await flush();

      expect(writeClipboardMock).toHaveBeenCalled();
      expect(writeTextMock).toHaveBeenCalledWith('h1\nh2');
    });

    it('所有复制通道都失败时应提示复制失败', async () => {
      writeClipboardMock.mockRejectedValue(new Error('宿主不可用'));
      writeTextMock.mockRejectedValue(new Error('浏览器不可用'));
      const service = createMockService();

      showCommitContextMenu(createContextMenuEvent(), createCommit(), service, DIRECTORY, ['h1', 'h2']);
      findMenuItem(getMenu(), '复制哈希列表')!.click();
      await flush();

      expect(toastMock).toHaveBeenCalledWith(expect.objectContaining({ kind: 'error' }));
    });

    it('批量 Cherry-pick 中断时应输出结构化日志、提示错误并停止后续提交', async () => {
      const err = new Error('cherry-pick 失败');
      const service = createMockService();
      vi.mocked(service.cherryPick)
        .mockResolvedValueOnce(undefined)
        .mockRejectedValueOnce(err);

      showContextMenuWithBatch(['h1', 'h2', 'h3'], service);
      findMenuItem(getMenu(), 'Cherry-pick 全部 (3)')!.click();
      await flush();
      clickConfirmOk();
      await flush();

      // 中断后不应继续处理 h3
      expect(service.cherryPick).toHaveBeenCalledTimes(2);
      // 失败需对用户可见，并记录已完成数量
      const log = vi.mocked(console.error).mock.calls
        .map(c => String(c[0]))
        .find(m => m.includes('batch_cherry_pick_error'));
      expect(log).toBeTruthy();
      expect(log).toContain('"done":1');
      expect(toastMock).toHaveBeenCalledWith(expect.objectContaining({ kind: 'error' }));
    });

    it('批量 Cherry-pick 全部成功时应刷新并提示成功数量', async () => {
      const service = createMockService();
      vi.mocked(service.cherryPick).mockResolvedValue(undefined);

      showContextMenuWithBatch(['h1', 'h2'], service);
      findMenuItem(getMenu(), 'Cherry-pick 全部 (2)')!.click();
      await flush();
      clickConfirmOk();
      await flush();

      expect(service.cherryPick).toHaveBeenCalledTimes(2);
      const toastArg = toastMock.mock.calls.at(-1)?.[0] as { message: string } | undefined;
      expect(toastArg?.message).toContain('2');
    });

    it('批量 Revert 中断时应打印错误并停止后续提交', async () => {
      const err = new Error('revert 失败');
      const service = createMockService();
      vi.mocked(service.revert)
        .mockResolvedValueOnce(undefined)
        .mockRejectedValueOnce(err);

      showCommitContextMenu(createContextMenuEvent(), createCommit(), service, DIRECTORY, ['h1', 'h2', 'h3']);
      findMenuItem(getMenu(), 'Revert 全部 (3)')!.click();
      await flush();
      clickConfirmOk();
      await flush();

      // 中断后不应继续处理 h3
      expect(service.revert).toHaveBeenCalledTimes(2);
      // 失败需对用户可见：结构化日志 + error toast
      const log = vi.mocked(console.error).mock.calls
        .map(c => String(c[0]))
        .find(m => m.includes('batch_revert_error'));
      expect(log).toBeTruthy();
      expect(log).toContain('"done":1');
      expect(toastMock).toHaveBeenCalledWith(expect.objectContaining({ kind: 'error' }));
    });
  });

  describe('悬停与点击委托细节', () => {
    it('分支菜单容器自身不响应悬停高亮与恢复', () => {
      const service = createMockService();
      showContextMenu(createContextMenuEvent(), branch, service, DIRECTORY);

      const menu = getMenu();
      expect(() => {
        menu.dispatchEvent(new MouseEvent('mouseenter'));
        menu.dispatchEvent(new MouseEvent('mouseleave'));
      }).not.toThrow();
      // 高亮完全由样式表决定，容器没有内联背景
      expect(menu.style.background).toBe('');
      expect(menu.classList.contains('gm-popup')).toBe(true);
    });

    it('单提交菜单悬停与移出仅作用于菜单项，容器自身无响应', () => {
      const service = createMockService();
      showCommitContextMenu(createContextMenuEvent(), createCommit(), service, DIRECTORY);

      const menu = getMenu();
      // 容器自身：不写内联背景
      menu.dispatchEvent(new MouseEvent('mouseenter'));
      expect(menu.style.background).toBe('');
      menu.dispatchEvent(new MouseEvent('mouseleave'));
      expect(menu.style.background).toBe('');

      // 菜单项：同样不写内联背景，样式表 :hover 负责高亮
      const item = findMenuItem(menu, '复制提交哈希')!;
      expect(() => {
        item.dispatchEvent(new MouseEvent('mouseenter'));
        item.dispatchEvent(new MouseEvent('mouseleave'));
      }).not.toThrow();
      expect(item.style.background).toBe('');
      expect(item.classList.contains('gm-menu-item')).toBe(true);
    });

    it('点击分支菜单项内的嵌套元素不应执行动作或关闭菜单', async () => {
      const service = createMockService();
      showContextMenu(createContextMenuEvent(), branch, service, DIRECTORY);

      const menu = getMenu();
      const item = findMenuItem(menu, '合并到当前分支')!;
      const nested = document.createElement('div');
      nested.textContent = '合并到当前分支';
      item.appendChild(nested);

      nested.click();
      await flush();

      expect(service.mergeBranch).not.toHaveBeenCalled();
      expect(document.getElementById('git-context-menu')).toBeTruthy();
    });

    it('点击单提交菜单项内的嵌套元素不应执行动作或关闭菜单', async () => {
      const service = createMockService();
      showCommitContextMenu(createContextMenuEvent(), createCommit(), service, DIRECTORY);

      const menu = getMenu();
      const item = findMenuItem(menu, 'Cherry-pick')!;
      const nested = document.createElement('div');
      nested.textContent = 'Cherry-pick';
      item.appendChild(nested);

      nested.click();
      await flush();

      expect(service.cherryPick).not.toHaveBeenCalled();
      expect(document.getElementById('git-context-menu')).toBeTruthy();
    });

    it('已有菜单时打开单提交菜单应先移除旧菜单', () => {
      const service = createMockService();
      showContextMenu(createContextMenuEvent(), branch, service, DIRECTORY);
      showCommitContextMenu(createContextMenuEvent(), createCommit(), service, DIRECTORY);
      expect(document.querySelectorAll('#git-context-menu')).toHaveLength(1);

      showCommitContextMenu(createContextMenuEvent(), createCommit(), service, DIRECTORY);
      expect(document.querySelectorAll('#git-context-menu')).toHaveLength(1);
    });
  });

  describe('提交对话框细节', () => {
    /**
     * 打开重置对话框
     * @param service 菜单与对话框共用的服务客户端
     * @returns 对话框遮罩层元素
     */
    async function openResetDialog(service: ServiceClient): Promise<HTMLElement> {
      showCommitContextMenu(createContextMenuEvent(), createCommit(), service, DIRECTORY);
      findMenuItem(getMenu(), '将当前分支重置到此处')!.click();
      await flush();
      const overlay = document.body.lastElementChild as HTMLElement;
      expect(overlay).toBeTruthy();
      return overlay;
    }

    /**
     * 打开从提交创建分支对话框
     * @param service 菜单与对话框共用的服务客户端
     * @returns 对话框遮罩层元素
     */
    async function openCreateDialog(service: ServiceClient): Promise<HTMLElement> {
      showCommitContextMenu(createContextMenuEvent(), createCommit(), service, DIRECTORY);
      findMenuItem(getMenu(), '新建分支')!.click();
      await flush();
      const overlay = document.body.lastElementChild as HTMLElement;
      expect(overlay).toBeTruthy();
      return overlay;
    }

    it('点击取消按钮应关闭重置对话框', async () => {
      const overlay = await openResetDialog(createMockService());
      expect(document.getElementById('reset-cancel')).toBeTruthy();

      document.getElementById('reset-cancel')!.click();

      expect(overlay.isConnected).toBe(false);
    });

    it('重置对话框点遮罩层应关闭，点内容区不关闭', async () => {
      const overlay = await openResetDialog(createMockService());

      const title = Array.from(overlay.querySelectorAll('div'))
        .find(el => el.textContent === t('reset.title'));
      expect(title).toBeTruthy();
      title!.click();
      expect(document.getElementById('reset-ok')).toBeTruthy();

      overlay.click();
      expect(document.getElementById('reset-ok')).toBeNull();
    });

    it('执行重置失败时应提示用户并保持对话框打开', async () => {
      const err = new Error('reset 失败');
      const service = createMockService();
      vi.mocked(service.reset).mockRejectedValue(err);
      toastMock.mockClear();

      showCommitContextMenu(createContextMenuEvent(), createCommit(), service, DIRECTORY);
      findMenuItem(getMenu(), '将当前分支重置到此处')!.click();
      await flush();

      document.getElementById('reset-ok')!.click();
      await flush();

      // 回归：此前只写 console 并关闭对话框，用户点确定后看不到任何失败提示
      expect(toastMock).toHaveBeenCalledWith(expect.objectContaining({
        kind: 'error',
        message: expect.stringContaining('重置失败'),
      }));
      expect(document.getElementById('reset-ok')).not.toBeNull();
    });

    it('打开创建分支对话框应自动聚焦名称输入框', async () => {
      await openCreateDialog(createMockService());
      const input = document.getElementById('new-branch-input') as HTMLInputElement;
      expect(input).toBeTruthy();
      expect(document.activeElement).toBe(input);
    });

    it('创建分支对话框应提供默认勾选的「创建后检出」复选框', async () => {
      await openCreateDialog(createMockService());
      const checkbox = document.getElementById('new-branch-checkout') as HTMLInputElement;
      // 回归：右键入口是独立对话框，此前漏加该复选框
      expect(checkbox).toBeTruthy();
      expect(checkbox.type).toBe('checkbox');
      expect(checkbox.checked).toBe(true);
    });

    it('右键创建分支取消勾选检出时只创建分支不切换', async () => {
      const service = createMockService();
      await openCreateDialog(service);

      const input = document.getElementById('new-branch-input') as HTMLInputElement;
      input.value = 'from-commit-nocheckout';
      (document.getElementById('new-branch-checkout') as HTMLInputElement).checked = false;
      (document.getElementById('create-ok') as HTMLElement).click();
      await flush();

      // 不勾选走 git branch，不切走当前工作区
      expect(service.createNewBranch).toHaveBeenCalledWith(DIRECTORY, 'from-commit-nocheckout', expect.anything());
      expect(service.checkoutNewBranch).not.toHaveBeenCalled();
    });

    it('点击取消按钮应关闭创建分支对话框', async () => {
      const overlay = await openCreateDialog(createMockService());
      expect(document.getElementById('create-cancel')).toBeTruthy();

      document.getElementById('create-cancel')!.click();

      expect(overlay.isConnected).toBe(false);
    });

    it('创建分支对话框点遮罩层应关闭，点内容区不关闭', async () => {
      const overlay = await openCreateDialog(createMockService());

      const title = Array.from(overlay.querySelectorAll('div'))
        .find(el => el.textContent === '从提交创建分支');
      expect(title).toBeTruthy();
      title!.click();
      expect(document.getElementById('new-branch-input')).toBeTruthy();

      overlay.click();
      expect(document.getElementById('new-branch-input')).toBeNull();
    });

    it('分支名为空或纯空白时点创建不应调用服务', async () => {
      const service = createMockService();
      await openCreateDialog(service);

      const input = document.getElementById('new-branch-input') as HTMLInputElement;
      const okButton = document.getElementById('create-ok')!;

      input.value = '   ';
      okButton.click();
      await flush();
      expect(service.checkoutNewBranch).not.toHaveBeenCalled();
      expect(document.getElementById('new-branch-input')).toBeTruthy();

      input.value = '';
      okButton.click();
      await flush();
      expect(service.checkoutNewBranch).not.toHaveBeenCalled();
      expect(document.getElementById('new-branch-input')).toBeTruthy();
    });

    it('创建分支失败时应打印错误日志', async () => {
      const err = new Error('创建分支失败');
      const service = createMockService();
      vi.mocked(service.checkoutNewBranch).mockRejectedValue(err);

      showCommitContextMenu(createContextMenuEvent(), createCommit(), service, DIRECTORY);
      findMenuItem(getMenu(), '新建分支')!.click();
      await flush();

      const input = document.getElementById('new-branch-input') as HTMLInputElement;
      input.value = 'feature/fail';
      document.getElementById('create-ok')!.click();
      await flush();

      // 失败必须让用户可见：结构化日志 + error toast
      const log = vi.mocked(console.error).mock.calls
        .map(c => String(c[0]))
        .find(m => m.includes('create_branch_error'));
      expect(log).toBeTruthy();
      expect(toastMock).toHaveBeenCalledWith(expect.objectContaining({ kind: 'error' }));
      // 失败时保持对话框打开，便于改名重试（与侧栏入口共用同一实现）
      expect(document.getElementById('new-branch-input')).not.toBeNull();
    });

    it('回车键可创建分支，其它按键不触发', async () => {
      const service = createMockService();
      await openCreateDialog(service);

      const input = document.getElementById('new-branch-input') as HTMLInputElement;
      input.value = 'feature/enter';

      // 非 Enter 按键：不创建、对话框保持打开
      input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
      await flush();
      expect(service.checkoutNewBranch).not.toHaveBeenCalled();
      expect(document.getElementById('new-branch-input')).toBeTruthy();

      // Enter 按键：创建分支并关闭对话框
      input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
      await flush();
      expect(service.checkoutNewBranch).toHaveBeenCalledWith(DIRECTORY, 'feature/enter', 'abc123');
      expect(document.getElementById('new-branch-input')).toBeNull();
    });
  });

  it('工作区有改动导致建分支被拒时应提示先提交或暂存', async () => {
    const service = createMockService();
    vi.mocked(service.checkoutNewBranch).mockRejectedValue(
      new Error('error: Your local changes to the following files would be overwritten by checkout:\n\ta.ts\nPlease commit your changes or stash them before you switch branches.'),
    );

    showCommitContextMenu(createContextMenuEvent(), createCommit(), service, DIRECTORY);
    findMenuItem(getMenu(), '新建分支')!.click();
    await flush();

    const input = document.getElementById('new-branch-input') as HTMLInputElement;
    input.value = 'dr';
    (document.getElementById('create-ok') as HTMLElement).click();
    await flush();

    // 错误信息含多行文件清单，toast 应给出可读原因而非原文堆叠
    const toastArg = toastMock.mock.calls.at(-1)?.[0] as { message: string } | undefined;
    expect(toastArg?.message).toContain('请先提交或暂存改动');
  });

  it('分支已存在时应提示分支已存在', async () => {
    const service = createMockService();
    vi.mocked(service.checkoutNewBranch).mockRejectedValue(
      new Error("fatal: a branch named 'dr' already exists"),
    );

    showCommitContextMenu(createContextMenuEvent(), createCommit(), service, DIRECTORY);
    findMenuItem(getMenu(), '新建分支')!.click();
    await flush();

    const input = document.getElementById('new-branch-input') as HTMLInputElement;
    input.value = 'dr';
    (document.getElementById('create-ok') as HTMLElement).click();
    await flush();

    const toastArg = toastMock.mock.calls.at(-1)?.[0] as { message: string } | undefined;
    expect(toastArg?.message).toContain('分支已存在');
  });
});
