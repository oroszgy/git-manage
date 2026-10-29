/**
 * dialogs 弹窗组件单元测试
 * 覆盖：重命名/新建分支/日期过滤/重置/跳转到引用/日期范围/路径编辑（多行）/路径勾选树对话框的
 * 渲染、确认调用、取消与遮罩关闭行为，以及日期范围对话框的存活变异体补杀用例
 */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  showRenameDialog,
  showCreateBranchDialog,
  showDateFilterDialog,
  showResetDialog,
  showGotoDialog,
  showDateRangeDialog,
  showPathFilterDialog,
  showPathTreeDialog,
  showDeleteBranchDialog,
  showConfirmDialog,
  showPromptDialog,
} from '../components/dialogs';
import { setState, createInitialState, getState } from '../state';
import type { Branch } from '../state';
import type { ServiceClient } from '../service';
import { setLocale } from '../i18n';

/** 宿主 toast 断言句柄 */
const { toastMock } = vi.hoisted(() => ({ toastMock: vi.fn().mockResolvedValue(undefined) }));

// 宿主模块打桩：避免真实 connectHost 握手，并断言失败提示
vi.mock('../host', () => ({
  host: {
    toast: toastMock,
    writeClipboard: vi.fn().mockResolvedValue(undefined),
  },
}));

/** 仓库目录固定值 */
const DIRECTORY = '/repo';

/** 返回的分支列表样例（确认后会写入 state.branches） */
const freshBranches = [{ name: 'main', isCurrent: true, isRemote: false }];

/**
 * listFiles 返回的已跟踪文件样例（故意乱序，用于断言目录树"目录在前、字母序"排序）
 * 结构：docs/readme.md、src/{index.ts,util/{format.ts,time.ts}}、package.json
 */
const sampleFiles = [
  'package.json',
  'src/index.ts',
  'src/util/time.ts',
  'docs/readme.md',
  'src/util/format.ts',
];

/**
 * 构造对话框所需的 service mock
 * 方法名与 dialogs.ts 实际调用保持一致：renameBranch / createNewBranch / reset / getBranches / listFiles
 */
function createServiceMock() {
  return {
    renameBranch: vi.fn(async () => undefined),
    createNewBranch: vi.fn(async () => undefined),
    checkoutNewBranch: vi.fn(async () => undefined),
    reset: vi.fn(async () => undefined),
    getBranches: vi.fn(async () => freshBranches),
    listFiles: vi.fn(async () => sampleFiles),
  };
}

/** 获取当前打开的对话框遮罩层（body 中唯一的顶层元素） */
function getOverlay(): HTMLElement {
  const overlay = document.body.firstElementChild as HTMLElement | null;
  if (!overlay) throw new Error('未找到对话框遮罩层');
  return overlay;
}

/** 点击遮罩层本身（模拟点击背景关闭） */
function clickOverlay(overlay: HTMLElement): void {
  overlay.dispatchEvent(new MouseEvent('click', { bubbles: true }));
}

/** 按钮样式契约：中性 / 主操作 / 危险操作 */
type ButtonVariant = 'primary' | 'neutral' | 'destructive';

/** 断言按钮携带 styles.css 中作者定义的类（取代内联底色断言） */
function expectButtonVariant(id: string, variant: ButtonVariant): void {
  const button = document.getElementById(id) as HTMLElement | null;
  if (!button) throw new Error(`未找到按钮: ${id}`);
  expect(button.classList.contains('gm-btn')).toBe(true);
  expect(button.classList.contains('gm-btn--primary')).toBe(variant === 'primary');
  // A destructive confirm is filled red; the outlined variant only recolours text.
  expect(button.classList.contains('gm-btn--destructive-filled')).toBe(variant === 'destructive');
  expect(button.classList.contains('gm-btn--destructive')).toBe(false);
}

/**
 * 断言对话框外壳的样式类契约：遮罩层 + 卡片（可选宽版）+ 标题 + 按钮行
 * @param overlay 遮罩层元素
 * @param opts.wide 是否断言宽版卡片 gm-dialog--wide
 * @returns 卡片元素（供调用方继续断言内部结构）
 */
function expectDialogShell(overlay: HTMLElement, opts: { wide?: boolean } = {}): HTMLElement {
  expect(overlay.classList.contains('gm-dialog-backdrop')).toBe(true);
  const panel = overlay.firstElementChild as HTMLElement;
  expect(panel.classList.contains('gm-dialog')).toBe(true);
  expect(panel.classList.contains('gm-dialog--wide')).toBe(opts.wide === true);
  // Every card opens with a title or, for confirmations, a message body.
  expect(panel.querySelector('.gm-dialog__title, .gm-dialog__message')).toBeTruthy();
  expect(panel.querySelector('.gm-dialog__actions')).toBeTruthy();
  return panel;
}

/** 断言行内提示/错误区的可见性（hidden 属性是当前的显隐机制） */
function expectHidden(id: string, hidden: boolean): void {
  const el = document.getElementById(id);
  expect(el).toBeTruthy();
  expect((el as HTMLElement).hidden).toBe(hidden);
}

describe('dialogs', () => {
  let mock: ReturnType<typeof createServiceMock>;
  let service: ServiceClient;

  beforeEach(() => {
    // 重置全局状态与残留 DOM
    setLocale('zh-CN');
    setState(s => Object.assign(s, createInitialState()));
    document.body.innerHTML = '';
    mock = createServiceMock();
    service = mock as unknown as ServiceClient;
    // 恢复 toast 默认实现：clearAllMocks 只清记录，mockResolvedValueOnce 用尽后会返回 undefined
    toastMock.mockReset();
    toastMock.mockResolvedValue(undefined);
  });

  afterEach(() => {
    document.body.innerHTML = '';
    // 还原 console 等 spy，避免跨用例残留
    vi.restoreAllMocks();
    vi.clearAllMocks();
  });

  describe('showRenameDialog', () => {
    /** 重命名对话框的分支样例 */
    const branch: Branch = { name: 'old-name', isCurrent: true, isRemote: false };

    it('打开后应该渲染输入框与按钮且预填旧分支名', () => {
      showRenameDialog(branch, service, DIRECTORY);

      const overlay = getOverlay();
      expect(overlay.textContent).toContain(`重命名分支: ${branch.name}`);

      const panel = expectDialogShell(overlay);
      const input = overlay.querySelector('#rename-input') as HTMLInputElement;
      expect(input).toBeTruthy();
      expect(input.value).toBe('old-name');
      expect(input.classList.contains('gm-input')).toBe(true);
      expect(panel.querySelector('.gm-dialog__title')?.textContent)
        .toBe(`重命名分支: ${branch.name}`);
      expect(overlay.querySelector('#rename-ok')).toBeTruthy();
      expect(overlay.querySelector('#rename-cancel')).toBeTruthy();
      expectButtonVariant('rename-ok', 'primary');
      expectButtonVariant('rename-cancel', 'neutral');
    });

    it('输入新名称点确定应该调用 renameBranch/getBranches 并更新分支列表后关闭', async () => {
      showRenameDialog(branch, service, DIRECTORY);

      const input = document.getElementById('rename-input') as HTMLInputElement;
      input.value = 'renamed-branch';
      (document.getElementById('rename-ok') as HTMLElement).click();

      // service 调用为异步，等待对话框关闭（关闭发生在全部 await 之后）
      await vi.waitFor(() => {
        expect(document.getElementById('rename-input')).toBeNull();
      });

      expect(mock.renameBranch).toHaveBeenCalledWith(DIRECTORY, 'old-name', 'renamed-branch');
      expect(mock.getBranches).toHaveBeenCalledWith(DIRECTORY);
      expect(getState().branches).toEqual(freshBranches);
    });

    it('名称未修改时点确定应该不调用 service 且直接关闭', async () => {
      showRenameDialog(branch, service, DIRECTORY);

      // 输入框预填值即旧名，不做修改直接确定
      (document.getElementById('rename-ok') as HTMLElement).click();
      await vi.waitFor(() => {
        expect(document.getElementById('rename-input')).toBeNull();
      });

      expect(mock.renameBranch).not.toHaveBeenCalled();
      expect(mock.getBranches).not.toHaveBeenCalled();
    });

    it('名称为空时点确定应该不调用 service 且直接关闭', async () => {
      showRenameDialog(branch, service, DIRECTORY);

      const input = document.getElementById('rename-input') as HTMLInputElement;
      input.value = '   ';
      (document.getElementById('rename-ok') as HTMLElement).click();
      await vi.waitFor(() => {
        expect(document.getElementById('rename-input')).toBeNull();
      });

      expect(mock.renameBranch).not.toHaveBeenCalled();
    });

    it('点取消应该关闭对话框且不调用 service', () => {
      showRenameDialog(branch, service, DIRECTORY);

      (document.getElementById('rename-cancel') as HTMLElement).click();

      expect(document.getElementById('rename-input')).toBeNull();
      expect(mock.renameBranch).not.toHaveBeenCalled();
    });

    it('点对话框内部不关闭，点遮罩层才关闭', () => {
      showRenameDialog(branch, service, DIRECTORY);
      const overlay = getOverlay();

      // 点击内层面板：不关闭
      clickOverlay(overlay.firstElementChild as HTMLElement);
      expect(document.getElementById('rename-input')).toBeTruthy();

      // 点击遮罩层：关闭
      clickOverlay(overlay);
      expect(document.getElementById('rename-input')).toBeNull();
      expect(mock.renameBranch).not.toHaveBeenCalled();
    });

    it('打开后输入框应该获得焦点且文本被全选', () => {
      showRenameDialog(branch, service, DIRECTORY);

      const input = document.getElementById('rename-input') as HTMLInputElement;
      expect(document.activeElement).toBe(input);
      expect(input.selectionStart).toBe(0);
      expect(input.selectionEnd).toBe(branch.name.length);
    });

    it('重命名失败时应提示用户并保持对话框打开', async () => {
      mock.renameBranch.mockRejectedValueOnce(new Error('改名失败'));
      const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      toastMock.mockClear();

      showRenameDialog(branch, service, DIRECTORY);
      const input = document.getElementById('rename-input') as HTMLInputElement;
      input.value = 'renamed-branch';
      (document.getElementById('rename-ok') as HTMLElement).click();

      // 回归：此前只写 console 并关闭对话框，用户看不到任何失败提示
      await vi.waitFor(() => {
        expect(toastMock).toHaveBeenCalledWith(expect.objectContaining({
          kind: 'error',
          message: expect.stringContaining('重命名分支失败'),
        }));
      });
      // 对话框保持打开，便于改名重试
      expect(document.getElementById('rename-input')).not.toBeNull();
      expect(errorSpy).toHaveBeenCalledWith(expect.stringContaining('rename_branch_error'));
      // 失败时不刷新分支列表
      expect(mock.getBranches).not.toHaveBeenCalled();
      expect(getState().branches).toEqual([]);
    });
  });

  describe('showCreateBranchDialog', () => {
    it('打开后应该渲染输入框与按钮', () => {
      showCreateBranchDialog({ service, directory: DIRECTORY, entry: 'test' });

      const overlay = getOverlay();
      expect(overlay.textContent).toContain('新建分支');
      const panel = expectDialogShell(overlay);
      expect(overlay.querySelector('#new-branch-input')).toBeTruthy();
      expect(overlay.querySelector('#create-ok')).toBeTruthy();
      expect(overlay.querySelector('#create-cancel')).toBeTruthy();

      // 起点说明是次要说明行；输入框与勾选行各有作者类
      const hint = panel.querySelector('.gm-dialog__hint') as HTMLElement;
      expect(hint.textContent).toContain('起点：');
      expect((overlay.querySelector('#new-branch-input') as HTMLElement).classList.contains('gm-input'))
        .toBe(true);
      const checkout = overlay.querySelector('#new-branch-checkout') as HTMLInputElement;
      expect(checkout.closest('label')?.classList.contains('gm-check')).toBe(true);
      expectButtonVariant('create-ok', 'primary');
      expectButtonVariant('create-cancel', 'neutral');
    });

    it('输入名称点创建应该调用 createNewBranch/getBranches 并更新分支列表后关闭', async () => {
      showCreateBranchDialog({ service, directory: DIRECTORY, entry: 'test' });

      const input = document.getElementById('new-branch-input') as HTMLInputElement;
      input.value = 'feature-x';
      (document.getElementById('create-ok') as HTMLElement).click();

      await vi.waitFor(() => {
        expect(document.getElementById('new-branch-input')).toBeNull();
      });

      // 默认勾选「创建后检出」
      expect(mock.checkoutNewBranch).toHaveBeenCalledWith(DIRECTORY, 'feature-x', undefined);
      expect(mock.createNewBranch).not.toHaveBeenCalled();
      expect(mock.getBranches).toHaveBeenCalledWith(DIRECTORY);
      expect(getState().branches).toEqual(freshBranches);
    });

    it('取消勾选检出时点创建应只创建分支不切换', async () => {
      showCreateBranchDialog({ service, directory: DIRECTORY, entry: 'test' });

      const input = document.getElementById('new-branch-input') as HTMLInputElement;
      input.value = 'feature-nocheckout';
      (document.getElementById('new-branch-checkout') as HTMLInputElement).checked = false;
      (document.getElementById('create-ok') as HTMLElement).click();

      await vi.waitFor(() => {
        expect(document.getElementById('new-branch-input')).toBeNull();
      });

      // 不勾选走 git branch，不改变当前工作区
      expect(mock.createNewBranch).toHaveBeenCalledWith(DIRECTORY, 'feature-nocheckout', undefined);
      expect(mock.checkoutNewBranch).not.toHaveBeenCalled();
    });

    it('在输入框按回车应该触发创建', async () => {
      showCreateBranchDialog({ service, directory: DIRECTORY, entry: 'test' });

      const input = document.getElementById('new-branch-input') as HTMLInputElement;
      input.value = 'feature-enter';
      input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));

      await vi.waitFor(() => {
        expect(document.getElementById('new-branch-input')).toBeNull();
      });

      expect(mock.checkoutNewBranch).toHaveBeenCalledWith(DIRECTORY, 'feature-enter', undefined);
    });

    it('未选中提交时应该显示起点为当前 HEAD', () => {
      showCreateBranchDialog({ service, directory: DIRECTORY, entry: 'test' });

      expect(getOverlay().textContent).toContain('起点：当前 HEAD');
    });

    it('带起点提交时应该显示起点并创建时透传 startPoint', async () => {
      showCreateBranchDialog({ service, directory: DIRECTORY, startPoint: 'a004346789abcdef', entry: 'test' });

      expect(getOverlay().textContent).toContain('起点：a0043467');

      const input = document.getElementById('new-branch-input') as HTMLInputElement;
      input.value = 'from-commit';
      (document.getElementById('create-ok') as HTMLElement).click();

      await vi.waitFor(() => {
        expect(document.getElementById('new-branch-input')).toBeNull();
      });

      expect(mock.checkoutNewBranch).toHaveBeenCalledWith(DIRECTORY, 'from-commit', 'a004346789abcdef');
    });

    it('名称为空时点创建不调用 service（源码行为：对话框保持打开）', () => {
      showCreateBranchDialog({ service, directory: DIRECTORY, entry: 'test' });

      const input = document.getElementById('new-branch-input') as HTMLInputElement;
      input.value = '   ';
      (document.getElementById('create-ok') as HTMLElement).click();

      expect(mock.createNewBranch).not.toHaveBeenCalled();
      expect(mock.getBranches).not.toHaveBeenCalled();
      // 源码中空名直接 return，未调用 close()，对话框仍留在 DOM
      expect(document.getElementById('new-branch-input')).toBeTruthy();
    });

    it('点取消应该关闭对话框且不调用 service', () => {
      showCreateBranchDialog({ service, directory: DIRECTORY, entry: 'test' });

      (document.getElementById('create-cancel') as HTMLElement).click();

      expect(document.getElementById('new-branch-input')).toBeNull();
      expect(mock.createNewBranch).not.toHaveBeenCalled();
    });

    it('打开后输入框应该获得焦点', () => {
      showCreateBranchDialog({ service, directory: DIRECTORY, entry: 'test' });

      const input = document.getElementById('new-branch-input') as HTMLInputElement;
      expect(document.activeElement).toBe(input);
    });

    it('点对话框内部不关闭，点遮罩层才关闭', () => {
      showCreateBranchDialog({ service, directory: DIRECTORY, entry: 'test' });
      const overlay = getOverlay();

      // 点击内层面板：不关闭
      clickOverlay(overlay.firstElementChild as HTMLElement);
      expect(document.getElementById('new-branch-input')).toBeTruthy();

      // 点击遮罩层：关闭
      clickOverlay(overlay);
      expect(document.getElementById('new-branch-input')).toBeNull();
      expect(mock.createNewBranch).not.toHaveBeenCalled();
    });

    it('非回车键的按键输入不应该触发创建', () => {
      showCreateBranchDialog({ service, directory: DIRECTORY, entry: 'test' });

      const input = document.getElementById('new-branch-input') as HTMLInputElement;
      input.value = 'feature-x';
      input.dispatchEvent(new KeyboardEvent('keydown', { key: 'a', bubbles: true }));

      expect(mock.createNewBranch).not.toHaveBeenCalled();
      expect(document.getElementById('new-branch-input')).toBeTruthy();
    });

    it('创建失败时应提示用户并保持对话框打开', async () => {
      // 默认勾选检出，失败路径走 checkoutNewBranch
      mock.checkoutNewBranch.mockRejectedValueOnce(new Error('创建失败'));
      const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      toastMock.mockClear();

      showCreateBranchDialog({ service, directory: DIRECTORY, entry: 'test' });
      const input = document.getElementById('new-branch-input') as HTMLInputElement;
      input.value = 'feature-x';
      (document.getElementById('create-ok') as HTMLElement).click();

      // 回归：此前只写 console 并关闭对话框，用户看不到任何失败提示
      await vi.waitFor(() => {
        // 建分支失败按原因归类给出可读文案（无法归类时回退到通用文案）
        expect(toastMock).toHaveBeenCalledWith(expect.objectContaining({
          kind: 'error',
          message: expect.stringContaining('创建失败'),
        }));
      });
      expect(document.getElementById('new-branch-input')).not.toBeNull();
      expect(errorSpy).toHaveBeenCalledWith(expect.stringContaining('create_branch_error'));
      expect(mock.getBranches).not.toHaveBeenCalled();
      expect(getState().branches).toEqual([]);
    });
  });

  describe('showDateFilterDialog', () => {
    it('打开后应该渲染日期输入框与按钮且预填当前过滤值', () => {
      setState(s => {
        s.filterDateFrom = '2026-01-01';
        s.filterDateTo = '2026-01-31';
      });

      showDateFilterDialog();

      const overlay = getOverlay();
      expect(overlay.textContent).toContain('按日期过滤');

      const panel = expectDialogShell(overlay);
      const from = overlay.querySelector('#date-from') as HTMLInputElement;
      const to = overlay.querySelector('#date-to') as HTMLInputElement;
      expect(from).toBeTruthy();
      expect(to).toBeTruthy();
      expect(from.value).toBe('2026-01-01');
      expect(to.value).toBe('2026-01-31');
      expect(from.classList.contains('gm-input')).toBe(true);
      expect(to.classList.contains('gm-input')).toBe(true);

      // 两个日期字段各有一个带标签的字段包装
      const fields = panel.querySelectorAll('.gm-dialog__field');
      expect(fields.length).toBe(2);
      expect(fields[0].querySelector('.gm-dialog__label')?.textContent).toBe('开始日期');
      expect(fields[1].querySelector('.gm-dialog__label')?.textContent).toBe('结束日期');

      expect(overlay.querySelector('#date-ok')).toBeTruthy();
      expect(overlay.querySelector('#date-clear')).toBeTruthy();
      expect(overlay.querySelector('#date-cancel')).toBeTruthy();
      expectButtonVariant('date-ok', 'primary');
      expectButtonVariant('date-clear', 'neutral');
      expectButtonVariant('date-cancel', 'neutral');
    });

    it('设置日期点确定应该写入 filterDateFrom/filterDateTo 并关闭', () => {
      showDateFilterDialog();

      const from = document.getElementById('date-from') as HTMLInputElement;
      const to = document.getElementById('date-to') as HTMLInputElement;
      from.value = '2026-02-01';
      to.value = '2026-02-28';
      (document.getElementById('date-ok') as HTMLElement).click();

      expect(getState().filterDateFrom).toBe('2026-02-01');
      expect(getState().filterDateTo).toBe('2026-02-28');
      expect(document.getElementById('date-from')).toBeNull();
    });

    it('点清除应该把日期过滤重置为空并关闭', () => {
      setState(s => {
        s.filterDateFrom = '2026-01-01';
        s.filterDateTo = '2026-01-31';
      });

      showDateFilterDialog();
      (document.getElementById('date-clear') as HTMLElement).click();

      expect(getState().filterDateFrom).toBe('');
      expect(getState().filterDateTo).toBe('');
      expect(document.getElementById('date-from')).toBeNull();
    });

    it('点取消应该关闭对话框且不改变过滤状态', () => {
      setState(s => {
        s.filterDateFrom = '2026-01-01';
        s.filterDateTo = '2026-01-31';
      });

      showDateFilterDialog();
      (document.getElementById('date-cancel') as HTMLElement).click();

      expect(getState().filterDateFrom).toBe('2026-01-01');
      expect(getState().filterDateTo).toBe('2026-01-31');
      expect(document.getElementById('date-from')).toBeNull();
    });

    it('点对话框内部不关闭，点遮罩层才关闭', () => {
      showDateFilterDialog();
      const overlay = getOverlay();

      // 点击内层面板：不关闭
      clickOverlay(overlay.firstElementChild as HTMLElement);
      expect(document.getElementById('date-from')).toBeTruthy();

      // 点击遮罩层：关闭
      clickOverlay(overlay);
      expect(document.getElementById('date-from')).toBeNull();
    });
  });

  describe('showResetDialog', () => {
    const hash = 'abc123def456';

    it('打开后应该渲染标题 hash、三种重置模式与按钮且默认选中 mixed', () => {
      showResetDialog(hash, service, DIRECTORY);

      const overlay = getOverlay();
      expect(overlay.textContent).toContain(`重置分支到 ${hash}`);
      expect(overlay.querySelector('#reset-modes')).toBeTruthy();

      const panel = expectDialogShell(overlay, { wide: true });
      expect(panel.querySelector('.gm-dialog__hint')?.textContent).toContain('选择重置模式');

      const radios = overlay.querySelectorAll('input[name="reset-mode"]');
      expect(radios.length).toBe(3);

      const soft = overlay.querySelector('input[value="soft"]') as HTMLInputElement;
      const mixed = overlay.querySelector('input[value="mixed"]') as HTMLInputElement;
      const hard = overlay.querySelector('input[value="hard"]') as HTMLInputElement;
      expect(mixed.checked).toBe(true);
      expect(soft.checked).toBe(false);
      expect(hard.checked).toBe(false);

      // 每个模式是一行 gm-check（label 包裹 radio）
      expect(overlay.querySelectorAll('#reset-modes > label.gm-check').length).toBe(3);

      expect(overlay.querySelector('#reset-ok')).toBeTruthy();
      expect(overlay.querySelector('#reset-cancel')).toBeTruthy();
      expectButtonVariant('reset-ok', 'primary');
      expectButtonVariant('reset-cancel', 'neutral');
    });

    it('保持默认 mixed 点重置应该调用 reset(dir, hash, mixed) 并更新分支列表后关闭', async () => {
      showResetDialog(hash, service, DIRECTORY);

      (document.getElementById('reset-ok') as HTMLElement).click();

      await vi.waitFor(() => {
        expect(document.getElementById('reset-ok')).toBeNull();
      });

      expect(mock.reset).toHaveBeenCalledWith(DIRECTORY, hash, 'mixed');
      expect(mock.getBranches).toHaveBeenCalledWith(DIRECTORY);
      expect(getState().branches).toEqual(freshBranches);
    });

    it('选中 hard 模式点重置应该调用 reset(dir, hash, hard)', async () => {
      showResetDialog(hash, service, DIRECTORY);

      const hard = document.querySelector('input[value="hard"]') as HTMLInputElement;
      hard.click();
      expect(hard.checked).toBe(true);

      (document.getElementById('reset-ok') as HTMLElement).click();

      await vi.waitFor(() => {
        expect(document.getElementById('reset-ok')).toBeNull();
      });

      expect(mock.reset).toHaveBeenCalledWith(DIRECTORY, hash, 'hard');
    });

    it('点取消应该关闭对话框且不调用 service', () => {
      showResetDialog(hash, service, DIRECTORY);

      (document.getElementById('reset-cancel') as HTMLElement).click();

      expect(document.getElementById('reset-ok')).toBeNull();
      expect(mock.reset).not.toHaveBeenCalled();
      expect(mock.getBranches).not.toHaveBeenCalled();
    });

    it('点对话框内部不关闭，点遮罩层才关闭', () => {
      showResetDialog(hash, service, DIRECTORY);
      const overlay = getOverlay();

      // 点击内层面板：不关闭
      clickOverlay(overlay.firstElementChild as HTMLElement);
      expect(document.getElementById('reset-ok')).toBeTruthy();

      // 点击遮罩层：关闭
      clickOverlay(overlay);
      expect(document.getElementById('reset-ok')).toBeNull();
      expect(mock.reset).not.toHaveBeenCalled();
    });

    it('点击模式容器本身不应该改变已选重置模式', async () => {
      showResetDialog(hash, service, DIRECTORY);

      // 源码只在 target.name === 'reset-mode' 时更新模式，点容器应忽略
      (document.getElementById('reset-modes') as HTMLElement).click();
      (document.getElementById('reset-ok') as HTMLElement).click();

      await vi.waitFor(() => {
        expect(document.getElementById('reset-ok')).toBeNull();
      });

      expect(mock.reset).toHaveBeenCalledWith(DIRECTORY, hash, 'mixed');
    });

    it('重置失败时应提示用户并保持对话框打开', async () => {
      mock.reset.mockRejectedValueOnce(new Error('重置失败'));
      const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      toastMock.mockClear();

      showResetDialog(hash, service, DIRECTORY);
      (document.getElementById('reset-ok') as HTMLElement).click();

      // 回归：此前只写 console 并关闭对话框，用户看不到任何失败提示
      await vi.waitFor(() => {
        expect(toastMock).toHaveBeenCalledWith(expect.objectContaining({
          kind: 'error',
          message: expect.stringContaining('重置失败'),
        }));
      });
      expect(document.getElementById('reset-ok')).not.toBeNull();
      expect(errorSpy).toHaveBeenCalledWith(expect.stringContaining('reset_branch_error'));
      // 失败时不刷新分支列表
      expect(mock.getBranches).not.toHaveBeenCalled();
      expect(getState().branches).toEqual([]);
    });
  });

  describe('showGotoDialog', () => {
    it('打开后应渲染中文标题、输入框与按钮且输入框获得焦点', () => {
      showGotoDialog(() => true);

      const overlay = getOverlay();
      expect(overlay.textContent).toContain('跳转到引用');

      const panel = expectDialogShell(overlay);
      const input = overlay.querySelector('#goto-input') as HTMLInputElement;
      expect(input).toBeTruthy();
      expect(input.placeholder).toBe('输入哈希或分支名');
      expect(input.classList.contains('gm-input')).toBe(true);
      expect(overlay.querySelector('#goto-ok')?.textContent).toBe('跳转');
      expect(overlay.querySelector('#goto-cancel')).toBeTruthy();
      expect(document.activeElement).toBe(input);

      // 错误区是作者类错误提示，初始隐藏
      const error = panel.querySelector('#goto-error') as HTMLElement;
      expect(error.classList.contains('gm-dialog__error')).toBe(true);
      expectHidden('goto-error', true);
      expectButtonVariant('goto-ok', 'primary');
      expectButtonVariant('goto-cancel', 'neutral');
    });

    it('onSubmit 返回 true 时应以裁剪后的查询值提交并关闭对话框', () => {
      const onSubmit = vi.fn().mockReturnValue(true);
      showGotoDialog(onSubmit);

      const input = document.getElementById('goto-input') as HTMLInputElement;
      input.value = '  abc123  ';
      (document.getElementById('goto-ok') as HTMLElement).click();

      expect(onSubmit).toHaveBeenCalledWith('abc123');
      expect(document.getElementById('goto-input')).toBeNull();
    });

    it('在输入框按回车应等价于点击跳转按钮', () => {
      const onSubmit = vi.fn().mockReturnValue(true);
      showGotoDialog(onSubmit);

      const input = document.getElementById('goto-input') as HTMLInputElement;
      input.value = 'main';
      input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));

      expect(onSubmit).toHaveBeenCalledWith('main');
      expect(document.getElementById('goto-input')).toBeNull();
    });

    it('onSubmit 返回 false 时应显示未找到提示且不关闭、输入值保持', () => {
      const onSubmit = vi.fn().mockReturnValue(false);
      showGotoDialog(onSubmit);

      const input = document.getElementById('goto-input') as HTMLInputElement;
      input.value = 'not-exist';
      (document.getElementById('goto-ok') as HTMLElement).click();

      const error = document.getElementById('goto-error') as HTMLElement;
      expect(error.hidden).toBe(false);
      expect(error.textContent).toBe('未找到匹配项');
      // 对话框不关闭且输入保持
      expect(document.getElementById('goto-input')).toBeTruthy();
      expect((document.getElementById('goto-input') as HTMLInputElement).value).toBe('not-exist');
    });

    it('空输入点跳转不应调用 onSubmit 且对话框保持打开', () => {
      const onSubmit = vi.fn();
      showGotoDialog(onSubmit);

      const input = document.getElementById('goto-input') as HTMLInputElement;
      const okButton = document.getElementById('goto-ok') as HTMLElement;

      input.value = '';
      okButton.click();
      input.value = '   ';
      okButton.click();

      expect(onSubmit).not.toHaveBeenCalled();
      expect(document.getElementById('goto-input')).toBeTruthy();
    });

    it('点取消或遮罩应关闭对话框且不调用 onSubmit', () => {
      const onSubmit = vi.fn();
      showGotoDialog(onSubmit);

      (document.getElementById('goto-cancel') as HTMLElement).click();
      expect(document.getElementById('goto-input')).toBeNull();

      showGotoDialog(onSubmit);
      clickOverlay(getOverlay());
      expect(document.getElementById('goto-input')).toBeNull();
      expect(onSubmit).not.toHaveBeenCalled();
    });

    it('提交失败后再次输入应清除未找到提示', () => {
      const onSubmit = vi.fn().mockReturnValue(false);
      showGotoDialog(onSubmit);

      const input = document.getElementById('goto-input') as HTMLInputElement;
      input.value = 'missing';
      (document.getElementById('goto-ok') as HTMLElement).click();
      expect((document.getElementById('goto-error') as HTMLElement).hidden).toBe(false);

      input.value = 'other';
      input.dispatchEvent(new Event('input', { bubbles: true }));
      expect((document.getElementById('goto-error') as HTMLElement).hidden).toBe(true);
    });

    it('英文 locale 下应渲染英文标题、占位符、按钮与未找到提示文案', () => {
      setLocale('en');
      const onSubmit = vi.fn().mockReturnValue(false);
      showGotoDialog(onSubmit);

      const overlay = getOverlay();
      expect(overlay.textContent).toContain('Go to Reference');

      const input = overlay.querySelector('#goto-input') as HTMLInputElement;
      expect(input.placeholder).toBe('Enter hash or branch name');
      expect(overlay.querySelector('#goto-ok')?.textContent).toBe('Go');

      input.value = 'missing';
      (overlay.querySelector('#goto-ok') as HTMLElement).click();
      expect((overlay.querySelector('#goto-error') as HTMLElement).textContent)
        .toBe('No matches found');
    });

    it('提交失败后输入变化应把未找到提示的文案一并清空（不只隐藏）', () => {
      const onSubmit = vi.fn().mockReturnValue(false);
      showGotoDialog(onSubmit);

      const input = document.getElementById('goto-input') as HTMLInputElement;
      input.value = 'missing';
      (document.getElementById('goto-ok') as HTMLElement).click();

      const error = document.getElementById('goto-error') as HTMLElement;
      expect(error.hidden).toBe(false);
      expect(error.textContent).toBe('未找到匹配项');

      input.value = 'other';
      input.dispatchEvent(new Event('input', { bubbles: true }));

      // clearError 必须同时清空文案与隐藏，残留文案属于缺陷
      expect(error.hidden).toBe(true);
      expect(error.textContent).toBe('');
    });

    it('失败提示存在时修改输入按回车应再次提交，成功后关闭', () => {
      const onSubmit = vi.fn().mockReturnValueOnce(false).mockReturnValueOnce(true);
      showGotoDialog(onSubmit);

      const input = document.getElementById('goto-input') as HTMLInputElement;
      input.value = 'missing';
      (document.getElementById('goto-ok') as HTMLElement).click();
      expect((document.getElementById('goto-error') as HTMLElement).hidden).toBe(false);
      expect(onSubmit).toHaveBeenCalledTimes(1);

      input.value = '  v1.2.3  ';
      input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));

      expect(onSubmit).toHaveBeenCalledTimes(2);
      expect(onSubmit).toHaveBeenLastCalledWith('v1.2.3');
      expect(document.getElementById('goto-input')).toBeNull();
    });

    it('非回车按键不应触发提交且不显示未找到提示', () => {
      const onSubmit = vi.fn();
      showGotoDialog(onSubmit);

      const input = document.getElementById('goto-input') as HTMLInputElement;
      input.value = 'main';
      for (const key of ['a', 'Escape', 'Enter ']) {
        input.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true }));
      }

      expect(onSubmit).not.toHaveBeenCalled();
      expect(document.getElementById('goto-input')).toBeTruthy();
      expect((document.getElementById('goto-error') as HTMLElement).hidden).toBe(true);
    });

    it('空输入时按回车不应调用 onSubmit 且对话框保持打开', () => {
      const onSubmit = vi.fn();
      showGotoDialog(onSubmit);

      const input = document.getElementById('goto-input') as HTMLInputElement;
      input.value = '   ';
      input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));

      expect(onSubmit).not.toHaveBeenCalled();
      expect(document.getElementById('goto-input')).toBeTruthy();
      expect((document.getElementById('goto-error') as HTMLElement).hidden).toBe(true);
    });

    it('点击对话框内容区或输入框不关闭，只有点击遮罩层才关闭', () => {
      const onSubmit = vi.fn();
      showGotoDialog(onSubmit);

      // 内容区面板本体：事件冒泡到遮罩层但 target 不是遮罩层 → 不关闭
      clickOverlay(getOverlay().firstElementChild as HTMLElement);
      expect(document.getElementById('goto-input')).toBeTruthy();

      // 输入框点击同样不关闭
      (document.getElementById('goto-input') as HTMLElement).click();
      expect(document.getElementById('goto-input')).toBeTruthy();

      // 点击遮罩层：关闭
      clickOverlay(getOverlay());
      expect(document.getElementById('goto-input')).toBeNull();
      expect(onSubmit).not.toHaveBeenCalled();
    });
  });

  describe('showDateRangeDialog', () => {
    it('打开后应该渲染两个 date 输入框与确定/清除/取消按钮及日期标签', () => {
      showDateRangeDialog(vi.fn());

      const overlay = getOverlay();
      const panel = expectDialogShell(overlay);
      const from = overlay.querySelector('#daterange-from') as HTMLInputElement;
      const to = overlay.querySelector('#daterange-to') as HTMLInputElement;
      expect(from).toBeTruthy();
      expect(from.type).toBe('date');
      expect(to).toBeTruthy();
      expect(to.type).toBe('date');
      expect(from.classList.contains('gm-input')).toBe(true);
      expect(to.classList.contains('gm-input')).toBe(true);
      expect(overlay.textContent).toContain('开始日期'); // filter.dateFrom（zh-CN）
      expect(overlay.textContent).toContain('结束日期'); // filter.dateTo（zh-CN）
      expect(overlay.querySelector('#daterange-ok')!.textContent).toBe('确定');
      expect(overlay.querySelector('#daterange-clear')!.textContent).toBe('清除');
      expect(overlay.querySelector('#daterange-cancel')!.textContent).toBe('取消');
      expectButtonVariant('daterange-ok', 'primary');
      expectButtonVariant('daterange-clear', 'neutral');
      expectButtonVariant('daterange-cancel', 'neutral');

      // 标题渲染 filter.date（zh-CN），与下方"开始日期/结束日期"标签区分
      expect((panel.children[0] as HTMLElement).textContent).toBe('日期');
      expect(panel.querySelectorAll('.gm-dialog__field').length).toBe(2);
    });

    it('填写起止日期点确定应以原顺序回调并关闭', () => {
      const onApply = vi.fn();
      showDateRangeDialog(onApply);

      (document.getElementById('daterange-from') as HTMLInputElement).value = '2026-01-10';
      (document.getElementById('daterange-to') as HTMLInputElement).value = '2026-01-20';
      (document.getElementById('daterange-ok') as HTMLElement).click();

      expect(onApply).toHaveBeenCalledTimes(1);
      expect(onApply).toHaveBeenCalledWith({ from: '2026-01-10', to: '2026-01-20' });
      expect(document.getElementById('daterange-from')).toBeNull(); // 回调后关闭
    });

    it('起止倒置时点确定应自动交换后回调并输出结构化日志', () => {
      const onApply = vi.fn();
      const debugSpy = vi.spyOn(console, 'debug');
      showDateRangeDialog(onApply);

      (document.getElementById('daterange-from') as HTMLInputElement).value = '2026-02-01';
      (document.getElementById('daterange-to') as HTMLInputElement).value = '2026-01-01';
      (document.getElementById('daterange-ok') as HTMLElement).click();

      expect(onApply).toHaveBeenCalledWith({ from: '2026-01-01', to: '2026-02-01' });
      const swapLog = debugSpy.mock.calls
        .map(c => String(c[0]))
        .filter(l => l.startsWith('{'))
        .map(l => JSON.parse(l) as Record<string, unknown>)
        .find(p => p.event === 'date_range_swap');
      expect(swapLog).toMatchObject({ prefix: '[dialog]', event: 'date_range_swap' });
      expect(document.getElementById('daterange-from')).toBeNull();
    });

    it('点清除应以空串区间回调并关闭', () => {
      const onApply = vi.fn();
      showDateRangeDialog(onApply);

      (document.getElementById('daterange-clear') as HTMLElement).click();

      expect(onApply).toHaveBeenCalledTimes(1);
      expect(onApply).toHaveBeenCalledWith({ from: '', to: '' });
      expect(document.getElementById('daterange-from')).toBeNull();
    });

    it('点取消、Escape 或遮罩层应关闭且不回调', () => {
      const onApply = vi.fn();

      // 取消按钮
      showDateRangeDialog(onApply);
      (document.getElementById('daterange-cancel') as HTMLElement).click();
      expect(document.getElementById('daterange-from')).toBeNull();

      // Escape 键
      showDateRangeDialog(onApply);
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
      expect(document.getElementById('daterange-from')).toBeNull();

      // 点击遮罩层
      showDateRangeDialog(onApply);
      clickOverlay(getOverlay());
      expect(document.getElementById('daterange-from')).toBeNull();

      expect(onApply).not.toHaveBeenCalled();
    });

    /** 从 console.debug 调用中解析出 date_range_swap 结构化日志 */
    function swapLogs(calls: unknown[][]): Record<string, unknown>[] {
      return calls
        .map(c => String(c[0]))
        .filter(l => l.startsWith('{'))
        .map(l => JSON.parse(l) as Record<string, unknown>)
        .filter(p => p.event === 'date_range_swap');
    }

    it('按非 Escape 键不应关闭对话框', () => {
      showDateRangeDialog(vi.fn());
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'a', bubbles: true }));
      expect(document.getElementById('daterange-from')).toBeTruthy();
    });

    it('点对话框内部面板不应关闭，只有遮罩层才关闭', () => {
      showDateRangeDialog(vi.fn());

      // 内容区面板本体：target 不是遮罩层 → 不关闭
      clickOverlay(getOverlay().firstElementChild as HTMLElement);
      expect(document.getElementById('daterange-from')).toBeTruthy();

      clickOverlay(getOverlay());
      expect(document.getElementById('daterange-from')).toBeNull();
    });

    it('仅填起始日期点确定应保持原顺序回调且不输出交换日志', () => {
      const onApply = vi.fn();
      const debugSpy = vi.spyOn(console, 'debug');
      showDateRangeDialog(onApply);

      (document.getElementById('daterange-from') as HTMLInputElement).value = '2026-04-01';
      (document.getElementById('daterange-ok') as HTMLElement).click();

      // 单侧日期无从比较，不应触发交换
      expect(onApply).toHaveBeenCalledWith({ from: '2026-04-01', to: '' });
      expect(swapLogs(debugSpy.mock.calls)).toEqual([]);
    });

    it('起止日期相同时点确定应原样回调且不输出交换日志', () => {
      const onApply = vi.fn();
      const debugSpy = vi.spyOn(console, 'debug');
      showDateRangeDialog(onApply);

      (document.getElementById('daterange-from') as HTMLInputElement).value = '2026-05-05';
      (document.getElementById('daterange-to') as HTMLInputElement).value = '2026-05-05';
      (document.getElementById('daterange-ok') as HTMLElement).click();

      expect(onApply).toHaveBeenCalledWith({ from: '2026-05-05', to: '2026-05-05' });
      expect(swapLogs(debugSpy.mock.calls)).toEqual([]);
    });

    it('close 应幂等：重复调用只注销一次 keydown 监听', () => {
      const removeSpy = vi.spyOn(document, 'removeEventListener');
      const close = showDateRangeDialog(vi.fn());

      close();
      close();

      expect(removeSpy).toHaveBeenCalledTimes(1);
      expect(removeSpy).toHaveBeenCalledWith('keydown', expect.any(Function));
      expect(document.getElementById('daterange-from')).toBeNull();
    });
  });

  describe('showPathFilterDialog', () => {
    it('打开后应渲染路径标签、多行文本域与确定/清除/取消按钮', () => {
      showPathFilterDialog([], vi.fn());

      const overlay = getOverlay();
      const input = overlay.querySelector('#pathfilter-input') as HTMLTextAreaElement;
      expect(input.tagName).toBe('TEXTAREA');
      expect(input.placeholder).toBe('src/ 或 packages/core');
      expect(input.classList.contains('gm-textarea')).toBe(true);
      expect(overlay.textContent).toContain('路径'); // filter.path（zh-CN）
      expect(overlay.querySelector('#pathfilter-ok')!.textContent).toBe('确定');
      expect(overlay.querySelector('#pathfilter-clear')!.textContent).toBe('清除');
      expect(overlay.querySelector('#pathfilter-cancel')!.textContent).toBe('取消');
      expectButtonVariant('pathfilter-ok', 'primary');
      expectButtonVariant('pathfilter-clear', 'neutral');
      expectButtonVariant('pathfilter-cancel', 'neutral');

      // 标题与编辑标签分别渲染 filter.path / filter.editPaths（zh-CN）
      const panel = expectDialogShell(overlay, { wide: true });
      expect((panel.children[0] as HTMLElement).textContent).toBe('路径');
      expect((panel.children[1] as HTMLElement).textContent).toBe('编辑路径…');
      expect((panel.children[1] as HTMLElement).classList.contains('gm-dialog__label')).toBe(true);
      // 超限提示是作者类错误提示，初始隐藏
      const hint = panel.querySelector('#pathfilter-hint') as HTMLElement;
      expect(hint.classList.contains('gm-dialog__error')).toBe(true);
      expectHidden('pathfilter-hint', true);
    });

    it('应以 selected 预填多行内容（每行一个路径）', () => {
      showPathFilterDialog(['src/', 'packages/core'], vi.fn());

      const input = document.getElementById('pathfilter-input') as HTMLTextAreaElement;
      expect(input.value).toBe('src/\npackages/core');
    });

    it('点确定应按行解析：trim、忽略空行、保序去重后回调数组并关闭', () => {
      const onApply = vi.fn();
      const debugSpy = vi.spyOn(console, 'debug');
      showPathFilterDialog([], onApply);

      const input = document.getElementById('pathfilter-input') as HTMLTextAreaElement;
      input.value = '  src/  \n\n\tpackages/core\t\nsrc/\n   ';
      (document.getElementById('pathfilter-ok') as HTMLElement).click();

      expect(onApply).toHaveBeenCalledTimes(1);
      expect(onApply).toHaveBeenCalledWith(['src/', 'packages/core']);
      expect(document.getElementById('pathfilter-input')).toBeNull(); // 回调后关闭

      // 确定应输出 [dialog] 结构化日志
      const applyLog = debugSpy.mock.calls
        .map(c => String(c[0]))
        .filter(l => l.startsWith('{'))
        .map(l => JSON.parse(l) as Record<string, unknown>)
        .find(p => p.event === 'path_filter_apply');
      expect(applyLog).toMatchObject({ prefix: '[dialog]', event: 'path_filter_apply' });
    });

    it('全部为空行时点确定应以空数组回调（等价清除）', () => {
      const onApply = vi.fn();
      showPathFilterDialog(['src/'], onApply);

      const input = document.getElementById('pathfilter-input') as HTMLTextAreaElement;
      input.value = ' \n\n   ';
      (document.getElementById('pathfilter-ok') as HTMLElement).click();

      expect(onApply).toHaveBeenCalledWith([]);
      expect(document.getElementById('pathfilter-input')).toBeNull();
    });

    it('解析结果超过 100 项应显示行内提示且不回调、对话框保持打开', () => {
      const onApply = vi.fn();
      const debugSpy = vi.spyOn(console, 'debug');
      showPathFilterDialog([], onApply);

      const input = document.getElementById('pathfilter-input') as HTMLTextAreaElement;
      input.value = Array.from({ length: 101 }, (_, i) => `path/${i}`).join('\n');
      (document.getElementById('pathfilter-ok') as HTMLElement).click();

      const hint = document.getElementById('pathfilter-hint') as HTMLElement;
      expect(hint.hidden).toBe(false);
      expect(hint.textContent).toBe('最多可选 100 项'); // filter.maxPaths（zh-CN）
      expect(onApply).not.toHaveBeenCalled();
      expect(document.getElementById('pathfilter-input')).toBeTruthy(); // 保持打开

      // 超限应输出 [dialog] 结构化日志
      const overflowLog = debugSpy.mock.calls
        .map(c => String(c[0]))
        .filter(l => l.startsWith('{'))
        .map(l => JSON.parse(l) as Record<string, unknown>)
        .find(p => p.event === 'path_filter_overflow');
      expect(overflowLog).toMatchObject({ prefix: '[dialog]', event: 'path_filter_overflow' });

      // 修改输入后提示应清除（文案一并清空，不只隐藏），缩减到 100 项内可正常确定
      input.value = 'src/';
      input.dispatchEvent(new Event('input', { bubbles: true }));
      expect(hint.hidden).toBe(true);
      expect(hint.textContent).toBe('');
      (document.getElementById('pathfilter-ok') as HTMLElement).click();
      expect(onApply).toHaveBeenCalledWith(['src/']);
    });

    it('点清除应以空数组回调并关闭', () => {
      const onApply = vi.fn();
      const debugSpy = vi.spyOn(console, 'debug');
      showPathFilterDialog(['src/'], onApply);

      (document.getElementById('pathfilter-clear') as HTMLElement).click();

      expect(onApply).toHaveBeenCalledTimes(1);
      expect(onApply).toHaveBeenCalledWith([]);
      expect(document.getElementById('pathfilter-input')).toBeNull();

      // 清除应输出 [dialog] 结构化日志
      const clearLog = debugSpy.mock.calls
        .map(c => String(c[0]))
        .filter(l => l.startsWith('{'))
        .map(l => JSON.parse(l) as Record<string, unknown>)
        .find(p => p.event === 'path_filter_clear');
      expect(clearLog).toMatchObject({ prefix: '[dialog]', event: 'path_filter_clear' });
    });

    it('点取消、Escape 或遮罩层应关闭且不回调', () => {
      const onApply = vi.fn();

      // 取消按钮
      showPathFilterDialog(['src/'], onApply);
      (document.getElementById('pathfilter-cancel') as HTMLElement).click();
      expect(document.getElementById('pathfilter-input')).toBeNull();

      // Escape 键
      showPathFilterDialog(['src/'], onApply);
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
      expect(document.getElementById('pathfilter-input')).toBeNull();

      // 点击遮罩层
      showPathFilterDialog(['src/'], onApply);
      clickOverlay(getOverlay());
      expect(document.getElementById('pathfilter-input')).toBeNull();

      expect(onApply).not.toHaveBeenCalled();
    });

    it('恰好 100 项时点确定应正常回调（上限判断为 > 100 而非 >=）', () => {
      const onApply = vi.fn();
      showPathFilterDialog([], onApply);

      const hundred = Array.from({ length: 100 }, (_, i) => `path/${i}`);
      const input = document.getElementById('pathfilter-input') as HTMLTextAreaElement;
      input.value = hundred.join('\n');
      // 恰好 100 项（未超上限）：点确定前不应出现超限提示
      expect((document.getElementById('pathfilter-hint') as HTMLElement).hidden).toBe(true);
      (document.getElementById('pathfilter-ok') as HTMLElement).click();

      expect(onApply).toHaveBeenCalledTimes(1);
      expect(onApply).toHaveBeenCalledWith(hundred);
      expect(document.getElementById('pathfilter-input')).toBeNull(); // 正常回调后对话框关闭
    });

    it('非 Escape 键不关闭，close 幂等且注销的事件名为 keydown', () => {
      const removeSpy = vi.spyOn(document, 'removeEventListener');
      showPathFilterDialog([], vi.fn());

      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'a', bubbles: true }));
      expect(document.getElementById('pathfilter-input')).toBeTruthy(); // 非 Escape 不关闭

      const cancel = document.getElementById('pathfilter-cancel') as HTMLElement;
      cancel.click();
      cancel.click(); // 幂等：关闭后残留按钮再次触发 close 不应重复注销

      expect(document.getElementById('pathfilter-input')).toBeNull();
      expect(removeSpy.mock.calls.filter(c => c[0] === 'keydown')).toHaveLength(1);
      expect(removeSpy).toHaveBeenCalledWith('keydown', expect.any(Function));
    });
  });

  describe('showPathTreeDialog', () => {
    /** 按渲染顺序取所有可见树行 */
    function rows(): HTMLElement[] {
      return [...document.querySelectorAll<HTMLElement>('.pathtree-row')];
    }

    /** 取可见行的 path 列表（按渲染顺序，用于断言排序与层级） */
    function rowPaths(): (string | undefined)[] {
      return rows().map(r => r.dataset.path);
    }

    /** 按路径取行（不可见则直接断言失败） */
    function rowByPath(path: string): HTMLElement {
      const row = rows().find(r => r.dataset.path === path);
      if (!row) throw new Error(`未找到树行: ${path}`);
      return row;
    }

    /** 取行复选框（每次重新查询，适配点击后整表重建） */
    function checkboxOf(path: string): HTMLInputElement {
      return rowByPath(path).querySelector('input[type="checkbox"]') as HTMLInputElement;
    }

    /** 节点是否显示为全勾 */
    function isChecked(path: string): boolean {
      return checkboxOf(path).checked;
    }

    /** 节点是否显示为半选 */
    function isHalf(path: string): boolean {
      return checkboxOf(path).indeterminate;
    }

    /** 点击行勾选区（等价用户点击复选框所在行） */
    function clickNode(path: string): void {
      rowByPath(path).click();
    }

    /** 点击展开/折叠箭头 */
    function toggleExpand(path: string): void {
      (rowByPath(path).querySelector('.pathtree-toggle') as HTMLElement).click();
    }

    /** 等待树渲染出根层行 */
    async function waitForTree(): Promise<void> {
      await vi.waitFor(() => {
        expect(rows().length).toBeGreaterThan(0);
      });
    }

    /** 打开对话框并等待渲染完成 */
    async function openTree(
      onApply: ReturnType<typeof vi.fn>,
      selected: string[] = [],
    ): Promise<void> {
      showPathTreeDialog(service, DIRECTORY, selected, onApply);
      await waitForTree();
    }

    it('打开后应立即请求 listFiles 并渲染目录树（目录在前、字母序、层级缩进）', async () => {
      showPathTreeDialog(service, DIRECTORY, [], vi.fn());

      expect(mock.listFiles).toHaveBeenCalledTimes(1);
      expect(mock.listFiles).toHaveBeenCalledWith(DIRECTORY);

      const overlay = getOverlay();
      const panel = expectDialogShell(overlay, { wide: true });
      expect((overlay.querySelector('#pathtree-list') as HTMLElement).classList.contains('gm-tree'))
        .toBe(true);
      expectButtonVariant('pathtree-ok', 'primary');
      expectButtonVariant('pathtree-clear', 'neutral');
      expectButtonVariant('pathtree-cancel', 'neutral');
      expect(panel.querySelector('#pathtree-hint')).toBeTruthy();

      await waitForTree();

      // 顶层目录默认展开：docs/readme.md 与 src/util 可见，深层 util 子项折叠
      expect(rowPaths()).toEqual([
        'docs', 'docs/readme.md',
        'src', 'src/util', 'src/index.ts',
        'package.json',
      ]);

      // 层级缩进：根层 depth 0，子层 depth 1
      expect(rowByPath('docs').dataset.depth).toBe('0');
      expect(rowByPath('docs/readme.md').dataset.depth).toBe('1');
      expect(rowByPath('src/util').dataset.depth).toBe('1');

      // 展开箭头：有子项的目录按展开态显示 ▾/▸，文件无箭头
      expect(rowByPath('docs').querySelector('.pathtree-toggle')!.textContent).toBe('▾');
      expect(rowByPath('src/util').querySelector('.pathtree-toggle')!.textContent).toBe('▸');
      expect(rowByPath('package.json').querySelector('.pathtree-toggle')!.textContent).toBe('');

      // 按钮文案渲染 filter.ok / filter.clear / filter.cancel（zh-CN）
      expect(document.getElementById('pathtree-ok')!.textContent).toBe('确定');
      expect(document.getElementById('pathtree-clear')!.textContent).toBe('清除');
      expect(document.getElementById('pathtree-cancel')!.textContent).toBe('取消');

      // 层级缩进与箭头列宽属于作者样式契约：行带 gm-tree-row，箭头带 gm-tree-toggle
      expect(rowByPath('docs').classList.contains('gm-tree-row')).toBe(true);
      const toggle = rowByPath('docs').querySelector<HTMLElement>('.pathtree-toggle')!;
      expect(toggle.classList.contains('gm-tree-toggle')).toBe(true);
      expect(toggle.classList.contains('pathtree-toggle')).toBe(true); // 旧类名保留给既有查询

      // 缩进由 depth 计算（数据值，保留内联）：根 6px、子层 6+14=20px
      expect(rowByPath('docs').style.paddingLeft).toBe('6px');
      expect(rowByPath('docs/readme.md').style.paddingLeft).toBe('20px');

      // 行必须渲染路径名标签
      expect(rowByPath('package.json').querySelector('.gm-tree-label__text')?.textContent)
        .toBe('package.json');
      expect(rowByPath('package.json').textContent).toContain('package.json');
    });

    it('目录可展开与折叠，且只渲染展开分支', async () => {
      await openTree(vi.fn());

      // util 初始折叠：子文件不进 DOM
      expect(rowPaths()).not.toContain('src/util/format.ts');
      expect(rowPaths()).not.toContain('src/util/time.ts');

      toggleExpand('src/util');
      expect(rowPaths()).toContain('src/util/format.ts');
      expect(rowPaths()).toContain('src/util/time.ts');
      expect(rowByPath('src/util').querySelector('.pathtree-toggle')!.textContent).toBe('▾');

      // 折叠 src → 其子树不渲染，src 行与根层文件仍在
      toggleExpand('src');
      expect(rowPaths()).toEqual(['docs', 'docs/readme.md', 'src', 'package.json']);

      // 再次展开恢复（util 此前已展开，箭头保持 ▾）
      toggleExpand('src');
      expect(rowPaths()).toContain('src/util');
      expect(rowByPath('src/util').querySelector('.pathtree-toggle')!.textContent).toBe('▾');
    });

    it('点文件应勾选并随确定回调；再次点击取消勾选', async () => {
      const onApply = vi.fn();
      await openTree(onApply);

      clickNode('package.json');
      expect(isChecked('package.json')).toBe(true);

      (document.getElementById('pathtree-ok') as HTMLElement).click();
      expect(onApply).toHaveBeenCalledTimes(1);
      expect(onApply).toHaveBeenCalledWith(['package.json']);
      expect(document.getElementById('pathtree-ok')).toBeNull(); // 回调后关闭

      // 重新打开并预勾选同文件，再次点击 → 取消勾选
      const onApply2 = vi.fn();
      await openTree(onApply2, ['package.json']);
      expect(isChecked('package.json')).toBe(true);
      clickNode('package.json');
      expect(isChecked('package.json')).toBe(false);

      (document.getElementById('pathtree-ok') as HTMLElement).click();
      expect(onApply2).toHaveBeenCalledWith([]);
    });

    it('点目录应整目录入集合：子项显示勾选但不入集合，确定仅含目录', async () => {
      const onApply = vi.fn();
      await openTree(onApply);

      clickNode('src');

      // 目录本身与子项都显示为勾（派生），但集合只存目录 pathspec
      expect(isChecked('src')).toBe(true);
      expect(isChecked('src/util')).toBe(true);
      expect(isChecked('src/index.ts')).toBe(true);
      expect(isHalf('src')).toBe(false);

      // 展开深层后其子项同样显示为勾
      toggleExpand('src/util');
      expect(isChecked('src/util/format.ts')).toBe(true);

      (document.getElementById('pathtree-ok') as HTMLElement).click();
      expect(onApply).toHaveBeenCalledWith(['src']);
    });

    it('点击被祖先覆盖的子项应移除最近祖先并沿路径补齐兄弟（仅该子项取消）', async () => {
      const onApply = vi.fn();
      await openTree(onApply);

      clickNode('src'); // 集合 = {src}，其下全部派生为勾
      toggleExpand('src/util');
      expect(isChecked('src/util/time.ts')).toBe(true); // 自身不在集合、被祖先覆盖

      clickNode('src/util/time.ts');

      // 最近祖先 src 移除；路径逐层补齐兄弟：src/index.ts、src/util/format.ts 入集合
      expect(isChecked('src/util/time.ts')).toBe(false);
      expect(isChecked('src/index.ts')).toBe(true);
      expect(isChecked('src/util/format.ts')).toBe(true);
      expect(isHalf('src/util')).toBe(true); // 仅剩一个子项勾中 → 半选
      expect(isChecked('src')).toBe(false); // src 已从集合移除

      (document.getElementById('pathtree-ok') as HTMLElement).click();
      expect(onApply).toHaveBeenCalledWith(['src/index.ts', 'src/util/format.ts']);
    });

    it('点击后集合超过 100 项应显示行内提示并回滚本次点击', async () => {
      const hundred = Array.from({ length: 100 }, (_, i) => `src/f${String(i).padStart(3, '0')}.ts`);
      mock.listFiles.mockResolvedValueOnce([...hundred, 'src/extra.ts']);

      const onApply = vi.fn();
      const debugSpy = vi.spyOn(console, 'debug');
      showPathTreeDialog(service, DIRECTORY, hundred, onApply);
      await waitForTree();

      const okBtn = document.getElementById('pathtree-ok') as HTMLButtonElement;
      expect(okBtn.disabled).toBe(false);

      clickNode('src/extra.ts'); // 100 + 1 → 超限

      const hint = document.getElementById('pathtree-hint') as HTMLElement;
      expect(hint.hidden).toBe(false);
      expect(hint.textContent).toBe('最多可选 100 项'); // filter.maxPaths（zh-CN）
      expect(isChecked('src/extra.ts')).toBe(false); // 本次点击已回滚

      // 超限回滚应输出 [dialog] 结构化日志
      const overflowLog = debugSpy.mock.calls
        .map(c => String(c[0]))
        .filter(l => l.startsWith('{'))
        .map(l => JSON.parse(l) as Record<string, unknown>)
        .find(p => p.event === 'path_tree_overflow');
      expect(overflowLog).toMatchObject({ prefix: '[dialog]', event: 'path_tree_overflow' });

      okBtn.click();
      expect(onApply).toHaveBeenCalledWith(hundred); // 集合仍为原 100 项
    });

    it('selected 预勾选应显示勾选（含派生祖先场景）且确定原样回调', async () => {
      const onApply = vi.fn();
      showPathTreeDialog(service, DIRECTORY, ['src'], onApply);
      await waitForTree();

      expect(isChecked('src')).toBe(true);
      expect(isChecked('src/util')).toBe(true); // 派生勾选
      expect(isChecked('src/index.ts')).toBe(true); // 派生勾选
      expect(isChecked('docs')).toBe(false);

      (document.getElementById('pathtree-ok') as HTMLElement).click();
      expect(onApply).toHaveBeenCalledWith(['src']);
    });

    it('selected 中不在列表的路径应作为根层行渲染且不丢值', async () => {
      const onApply = vi.fn();
      showPathTreeDialog(service, DIRECTORY, ['src', 'untracked/new.txt'], onApply);
      await waitForTree();

      expect(rowPaths()).toContain('untracked/new.txt'); // 找不到节点 → 渲染到根层
      expect(isChecked('untracked/new.txt')).toBe(true);

      (document.getElementById('pathtree-ok') as HTMLElement).click();
      expect(onApply).toHaveBeenCalledWith(['src', 'untracked/new.txt']);
    });

    it('点清除应清空集合回调空数组并关闭', async () => {
      const onApply = vi.fn();
      await openTree(onApply, ['src']);

      const okBtn = document.getElementById('pathtree-ok') as HTMLElement; // 关闭前持有引用
      (document.getElementById('pathtree-clear') as HTMLElement).click();

      expect(onApply).toHaveBeenCalledTimes(1);
      expect(onApply).toHaveBeenCalledWith([]);
      expect(document.getElementById('pathtree-list')).toBeNull();
      expect(document.body.firstElementChild).toBeNull();

      // 关闭前挂载的确定监听仍在：集合已清空，再触发应回调空数组而非旧值
      okBtn.click();
      expect(onApply).toHaveBeenCalledTimes(2);
      expect(onApply).toHaveBeenLastCalledWith([]);
    });

    it('点取消、Escape 或遮罩层应关闭且不回调', () => {
      const onApply = vi.fn();

      // 取消按钮
      showPathTreeDialog(service, DIRECTORY, [], onApply);
      (document.getElementById('pathtree-cancel') as HTMLElement).click();
      expect(document.getElementById('pathtree-cancel')).toBeNull();

      // Escape 键
      showPathTreeDialog(service, DIRECTORY, [], onApply);
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
      expect(document.getElementById('pathtree-cancel')).toBeNull();

      // 点击遮罩层
      showPathTreeDialog(service, DIRECTORY, [], onApply);
      clickOverlay(getOverlay());
      expect(document.getElementById('pathtree-cancel')).toBeNull();

      expect(onApply).not.toHaveBeenCalled();
    });

    it('列表为空应显示占位文案并禁用确定', async () => {
      mock.listFiles.mockResolvedValueOnce([]);
      showPathTreeDialog(service, DIRECTORY, [], vi.fn());

      await vi.waitFor(() => {
        expect(document.getElementById('pathtree-empty')?.textContent).toBe('无可选路径');
      });
      expect(rows().length).toBe(0);
      expect((document.getElementById('pathtree-ok') as HTMLButtonElement).disabled).toBe(true);
      // 占位文案用作者类渲染（字号/颜色来自 styles.css）
      expect((document.getElementById('pathtree-empty') as HTMLElement).classList.contains('gm-dialog__hint'))
        .toBe(true);
    });

    it('拉取失败应在容器内显示错误文案并输出 [dialog] 结构化错误日志', async () => {
      mock.listFiles.mockRejectedValueOnce(new Error('拉取失败'));
      const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      showPathTreeDialog(service, DIRECTORY, [], vi.fn());

      await vi.waitFor(() => {
        expect(document.getElementById('pathtree-error')?.textContent).toBe('加载路径失败');
      });

      const log = errorSpy.mock.calls
        .map(c => String(c[0]))
        .filter(l => l.startsWith('{'))
        .map(l => JSON.parse(l) as Record<string, unknown>)
        .find(p => p.event === 'list_files_error');
      expect(log).toMatchObject({ prefix: '[dialog]', event: 'list_files_error' });
      expect((document.getElementById('pathtree-ok') as HTMLButtonElement).disabled).toBe(true);
      // 错误文案用作者类渲染（颜色/字号来自 styles.css）
      expect((document.getElementById('pathtree-error') as HTMLElement).classList.contains('gm-dialog__error'))
        .toBe(true);
    });

    it('确定与清除后对话框都应关闭', async () => {
      await openTree(vi.fn());
      (document.getElementById('pathtree-ok') as HTMLElement).click();
      expect(document.getElementById('pathtree-list')).toBeNull();
      expect(document.body.firstElementChild).toBeNull();

      await openTree(vi.fn());
      (document.getElementById('pathtree-clear') as HTMLElement).click();
      expect(document.getElementById('pathtree-list')).toBeNull();
      expect(document.body.firstElementChild).toBeNull();
    });

    it('数据到达前列表容器应留空（加载中不显示空占位）', async () => {
      showPathTreeDialog(service, DIRECTORY, [], vi.fn());

      // 初始 render 在 loaded=false 时应早退：容器既无占位也无行
      const list = document.getElementById('pathtree-list') as HTMLElement;
      expect(list.textContent).toBe('');
      expect(document.getElementById('pathtree-empty')).toBeNull();
      expect(rows().length).toBe(0);

      await waitForTree(); // 数据到达后正常渲染
      expect(rowPaths().length).toBeGreaterThan(0);
    });

    it('未勾选任何路径时所有节点应为未选，不应出现半选或误勾', async () => {
      await openTree(vi.fn());

      expect(isChecked('package.json')).toBe(false);
      expect(isChecked('docs')).toBe(false);
      expect(isHalf('docs')).toBe(false);
      expect(isChecked('src')).toBe(false);
      expect(isHalf('src')).toBe(false);
      expect(isHalf('src/util')).toBe(false);
    });

    it('子项单独全勾时父目录显示全勾，仅部分勾选时显示半选', async () => {
      await openTree(vi.fn());

      clickNode('docs/readme.md'); // docs 唯一子项全勾 → docs 全勾
      expect(isChecked('docs/readme.md')).toBe(true);
      expect(isChecked('docs')).toBe(true);
      expect(isHalf('docs')).toBe(false);

      clickNode('src/index.ts'); // src 仅 index.ts 勾中、util 未勾 → 半选
      expect(isHalf('src')).toBe(true);
      expect(isChecked('src')).toBe(false);
    });

    it('路径先作文件后作目录前缀时应升级为目录并默认展开', async () => {
      mock.listFiles.mockResolvedValueOnce(['src', 'src/index.ts']);
      showPathTreeDialog(service, DIRECTORY, [], vi.fn());
      await waitForTree();

      expect(rowPaths()).toEqual(['src', 'src/index.ts']);
      expect(rowByPath('src').querySelector('.pathtree-toggle')!.textContent).toBe('▾');
      expect(rowByPath('src').dataset.depth).toBe('0');
      expect(rowByPath('src/index.ts').dataset.depth).toBe('1');
    });

    it('同一路径重复出现时不应破坏"目录在前、字母序"排序', async () => {
      mock.listFiles.mockResolvedValueOnce(['b.txt', 'b.txt', 'a.txt']);
      showPathTreeDialog(service, DIRECTORY, [], vi.fn());
      await waitForTree();

      expect(rowPaths()).toEqual(['a.txt', 'b.txt']);
    });

    it('路径含连续斜杠时应跳过空段，渲染为规范路径', async () => {
      mock.listFiles.mockResolvedValueOnce(['src//index.ts']);
      showPathTreeDialog(service, DIRECTORY, [], vi.fn());
      await waitForTree();

      expect(rowPaths()).toEqual(['src', 'src/index.ts']);
    });

    it('预勾选深层目录时其后代应派生为勾选', async () => {
      showPathTreeDialog(service, DIRECTORY, ['src/util'], vi.fn());
      await waitForTree();

      expect(isChecked('src/util')).toBe(true);
      toggleExpand('src/util');
      expect(isChecked('src/util/format.ts')).toBe(true);
      expect(isChecked('src/util/time.ts')).toBe(true);
    });

    it('孤儿路径中间层缺失时补齐兄弟应安全终止且不残留勾选', async () => {
      const onApply = vi.fn();
      showPathTreeDialog(service, DIRECTORY, ['ghost', 'ghost/a'], onApply);
      await waitForTree();

      expect(isChecked('ghost/a')).toBe(true);
      clickNode('ghost/a'); // 出集合 → 被祖先 ghost 覆盖 → 仍显示勾
      expect(isChecked('ghost/a')).toBe(true);

      // 再次点击：移除祖先 ghost 并沿路径补兄弟，但 ghost 不在树中（中间层缺失）
      clickNode('ghost/a');
      expect(isChecked('ghost/a')).toBe(false);
      expect(isChecked('ghost')).toBe(false);

      (document.getElementById('pathtree-ok') as HTMLElement).click();
      expect(onApply).toHaveBeenCalledWith([]);
    });

    it('孤儿路径含连续斜杠时补齐兄弟应跳过空段（不误勾下一跳）', async () => {
      mock.listFiles.mockResolvedValueOnce(['ghost/keep.txt', 'ghost/x']);
      const onApply = vi.fn();
      showPathTreeDialog(service, DIRECTORY, ['ghost', 'ghost//x'], onApply);
      await waitForTree();

      expect(isChecked('ghost//x')).toBe(true);
      clickNode('ghost//x'); // 出集合 → 被真实目录 ghost 覆盖
      expect(isChecked('ghost//x')).toBe(true);

      // 再次点击：移除 ghost，空段被过滤后下一跳为 ghost/x →
      // 真实兄弟 keep.txt 补齐入集合，下一跳 ghost/x 本身不被误加
      clickNode('ghost//x');
      expect(isChecked('ghost//x')).toBe(false);
      expect(isChecked('ghost/keep.txt')).toBe(true);
      expect(isChecked('ghost/x')).toBe(false);
      expect(isHalf('ghost')).toBe(true); // 子项一勾一未勾 → 半选

      (document.getElementById('pathtree-ok') as HTMLElement).click();
      expect(onApply).toHaveBeenCalledWith(['ghost/keep.txt']);
    });

    it('空段祖先应被忽略："ghost/" 不构成 "ghost//x" 的派生勾选', async () => {
      const onApply = vi.fn();
      showPathTreeDialog(service, DIRECTORY, ['ghost/', 'ghost//x'], onApply);
      await waitForTree();

      expect(isChecked('ghost//x')).toBe(true); // 自身在集合
      clickNode('ghost//x'); // 出集合后祖先列表只含 'ghost'（跳过空段）→ 不被 'ghost/' 派生覆盖
      expect(isChecked('ghost//x')).toBe(false);

      (document.getElementById('pathtree-ok') as HTMLElement).click();
      expect(onApply).toHaveBeenCalledWith(['ghost/']);
    });

    it('非 Escape 键不关闭，close 幂等且注销的事件名为 keydown', () => {
      const removeSpy = vi.spyOn(document, 'removeEventListener');
      showPathTreeDialog(service, DIRECTORY, [], vi.fn());

      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'a', bubbles: true }));
      expect(document.getElementById('pathtree-list')).toBeTruthy(); // 非 Escape 不关闭

      const cancel = document.getElementById('pathtree-cancel') as HTMLElement;
      cancel.click();
      cancel.click(); // 幂等：关闭后残留按钮再次触发 close 不应重复注销

      expect(document.getElementById('pathtree-list')).toBeNull();
      expect(removeSpy.mock.calls.filter(c => c[0] === 'keydown')).toHaveLength(1);
      expect(removeSpy).toHaveBeenCalledWith('keydown', expect.any(Function));
    });

    it('集合恰为 100 项时点击新增不应误判超限', async () => {
      const files99 = Array.from({ length: 99 }, (_, i) => `src/f${String(i).padStart(3, '0')}.ts`);
      mock.listFiles.mockResolvedValueOnce([...files99, 'src/extra.ts']);
      const onApply = vi.fn();
      showPathTreeDialog(service, DIRECTORY, files99, onApply);
      await waitForTree();

      clickNode('src/extra.ts'); // 99 + 1 = 100，未超限
      const hint = document.getElementById('pathtree-hint') as HTMLElement;
      expect(isChecked('src/extra.ts')).toBe(true);
      expect(hint.hidden).toBe(true);

      (document.getElementById('pathtree-ok') as HTMLElement).click();
      expect(onApply).toHaveBeenCalledWith([...files99, 'src/extra.ts']);
    });

    it('超限回滚后再次正常点击应隐藏行内提示并清空文案', async () => {
      const hundred = Array.from({ length: 100 }, (_, i) => `src/f${String(i).padStart(3, '0')}.ts`);
      mock.listFiles.mockResolvedValueOnce([...hundred, 'src/extra.ts']);
      showPathTreeDialog(service, DIRECTORY, hundred, vi.fn());
      await waitForTree();

      clickNode('src/extra.ts'); // 超限 → 显示提示并回滚
      const hint = document.getElementById('pathtree-hint') as HTMLElement;
      expect(hint.hidden).toBe(false);

      clickNode('src/f000.ts'); // 取消一个已勾项（99 ≤ 100）→ 提示应隐藏且文案清空
      expect(hint.hidden).toBe(true);
      expect(hint.textContent).toBe('');
    });

    it('列表含空值元素时应容错跳过而非进入错误态', async () => {
      mock.listFiles.mockResolvedValueOnce([null, 'package.json'] as unknown as string[]);
      const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      showPathTreeDialog(service, DIRECTORY, [], vi.fn());
      await waitForTree();

      expect(rowPaths()).toContain('package.json');
      expect(document.getElementById('pathtree-error')).toBeNull();
      expect(errorSpy).not.toHaveBeenCalled();
    });

    it('listFiles 返回 null 时应按空列表渲染占位', async () => {
      mock.listFiles.mockResolvedValueOnce(null as unknown as string[]);
      showPathTreeDialog(service, DIRECTORY, [], vi.fn());

      await vi.waitFor(() => {
        expect(document.getElementById('pathtree-empty')?.textContent).toBe('无可选路径');
      });
      expect(rows().length).toBe(0);
    });

    it('关闭后再点击残留树行不应重建列表 DOM', async () => {
      await openTree(vi.fn());
      const listEl = document.getElementById('pathtree-list') as HTMLElement;
      const docsRow = rowByPath('docs');

      (document.getElementById('pathtree-cancel') as HTMLElement).click();
      docsRow.click(); // 关闭后残留行仍绑监听，但不应再触发重渲染

      expect(listEl.contains(docsRow)).toBe(true);
    });

    it('关闭后晚到的 listFiles 失败不应输出错误日志', async () => {
      let rejectFiles!: (reason?: unknown) => void;
      mock.listFiles.mockReturnValueOnce(new Promise<string[]>((_, rej) => { rejectFiles = rej; }));
      const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      showPathTreeDialog(service, DIRECTORY, [], vi.fn());
      (document.getElementById('pathtree-cancel') as HTMLElement).click(); // 先关闭

      rejectFiles(new Error('关闭后才失败'));
      await new Promise(resolve => setTimeout(resolve, 0));

      expect(errorSpy).not.toHaveBeenCalled();
      expect(document.body.firstElementChild).toBeNull();
    });

    it('确定与清除应输出 [dialog] 结构化日志', async () => {
      const debugSpy = vi.spyOn(console, 'debug');

      await openTree(vi.fn(), ['src']);
      (document.getElementById('pathtree-ok') as HTMLElement).click();

      await openTree(vi.fn());
      (document.getElementById('pathtree-clear') as HTMLElement).click();

      const events = debugSpy.mock.calls
        .map(c => String(c[0]))
        .filter(l => l.startsWith('{'))
        .map(l => JSON.parse(l) as Record<string, unknown>);
      expect(events.find(p => p.event === 'path_tree_apply'))
        .toMatchObject({ prefix: '[dialog]', event: 'path_tree_apply', count: 1 });
      expect(events.find(p => p.event === 'path_tree_clear'))
        .toMatchObject({ prefix: '[dialog]', event: 'path_tree_clear' });
    });

    it('列表内预选路径不应重复渲染为孤儿行（孤儿按同规则排序）', async () => {
      showPathTreeDialog(service, DIRECTORY, ['src', 'aaa/orphan.txt'], vi.fn());
      await waitForTree();

      expect(rowPaths()).toEqual([
        'docs', 'docs/readme.md',
        'src', 'src/util', 'src/index.ts',
        'aaa/orphan.txt', 'package.json',
      ]);
    });

    it('点击不可展开行的箭头不应触发重渲染', async () => {
      await openTree(vi.fn());
      const docsRow = rowByPath('docs');

      (rowByPath('package.json').querySelector('.pathtree-toggle') as HTMLElement).click();

      expect(rowByPath('docs')).toBe(docsRow); // 行元素未被重建 → 未重渲染
    });
  });

  describe('showDeleteBranchDialog', () => {
    /** 获取强制删除按钮 */
    function okButton(): HTMLButtonElement {
      return document.getElementById('delete-branch-ok') as HTMLButtonElement;
    }

    /** 获取对话框正文元素 */
    function messageEl(): HTMLElement {
      return document.getElementById('delete-branch-message') as HTMLElement;
    }

    /** 获取错误提示元素 */
    function errorEl(): HTMLElement {
      return document.getElementById('delete-branch-error') as HTMLElement;
    }

    /**
     * 构造 serviceCall 风格错误：e.message 为 JSON 字符串
     * @param code 错误码（NOT_MERGED / NOT_FOUND / GIT_ERROR）
     * @param message 原始错误信息
     * @returns Error 实例
     */
    function serviceError(code: string, message: string): Error {
      return new Error(JSON.stringify({ code, message }));
    }

    it('打开即强制模式：正文为 forceDelete 插值、按钮为强制删除，点内容区不关闭点遮罩关闭', () => {
      showDeleteBranchDialog('dev', vi.fn(async () => {}));

      const overlay = getOverlay();
      const panel = expectDialogShell(overlay, { wide: true });
      expect(messageEl().textContent).toBe('分支 dev 尚未合并到当前分支，强制删除将丢失其上的提交。');
      expect(messageEl().classList.contains('gm-dialog__message')).toBe(true);
      expect(okButton().textContent).toBe('强制删除');
      expectButtonVariant('delete-branch-ok', 'primary');
      expectButtonVariant('delete-branch-cancel', 'neutral');
      expect(overlay.querySelector('#delete-branch-cancel')).toBeTruthy();
      // 错误区初始隐藏（author class + hidden 属性）
      expect(errorEl().classList.contains('gm-dialog__error')).toBe(true);
      expect(errorEl().hidden).toBe(true);

      // 点击内容区不关闭，点击遮罩层才关闭
      clickOverlay(panel);
      expect(document.getElementById('delete-branch-ok')).toBeTruthy();
      clickOverlay(overlay);
      expect(document.getElementById('delete-branch-ok')).toBeNull();
    });

    it('点强制删除应调用 onConfirm(true) 一次，等待期间按钮禁用防重复提交', async () => {
      let resolveConfirm!: () => void;
      const onConfirm = vi.fn(() => new Promise<void>((resolve) => { resolveConfirm = resolve; }));
      showDeleteBranchDialog('dev', onConfirm);

      const btn = okButton();
      btn.click();
      btn.click(); // 未 settle 前重复点击应被忽略

      expect(onConfirm).toHaveBeenCalledTimes(1);
      expect(onConfirm).toHaveBeenCalledWith(true);
      expect(btn.disabled).toBe(true);

      resolveConfirm();
      await vi.waitFor(() => {
        expect(document.getElementById('delete-branch-ok')).toBeNull();
      });
    });

    it('onConfirm resolve 时对话框应关闭', async () => {
      const onConfirm = vi.fn(async () => {});
      showDeleteBranchDialog('dev', onConfirm);

      okButton().click();
      await vi.waitFor(() => {
        expect(document.getElementById('delete-branch-ok')).toBeNull();
      });

      expect(onConfirm).toHaveBeenCalledWith(true);
      expect(document.body.firstElementChild).toBeNull();
    });

    it('reject GIT_ERROR 时应就地显示失败前缀与原始 message，按钮恢复可点可重试', async () => {
      const onConfirm = vi.fn()
        .mockRejectedValueOnce(serviceError('GIT_ERROR', "error: cannot delete branch 'dev'"))
        .mockResolvedValueOnce(undefined);
      showDeleteBranchDialog('dev', onConfirm);

      okButton().click();
      await vi.waitFor(() => expect(errorEl().hidden).toBe(false));

      expect(errorEl().textContent).toBe("删除分支失败: error: cannot delete branch 'dev'");
      expect(document.getElementById('delete-branch-ok')).toBeTruthy(); // 保持打开
      expect(okButton().disabled).toBe(false); // 可重试

      // 再次点击可重新执行，成功后关闭
      okButton().click();
      await vi.waitFor(() => expect(document.getElementById('delete-branch-ok')).toBeNull());
      expect(onConfirm).toHaveBeenCalledTimes(2);
    });

    it('reject NOT_FOUND 时应就地显示分支不存在文案且对话框保持打开', async () => {
      const onConfirm = vi.fn(async () => {
        throw serviceError('NOT_FOUND', 'no such branch');
      });
      showDeleteBranchDialog('dev', onConfirm);

      okButton().click();
      await vi.waitFor(() => {
        expect(errorEl().hidden).toBe(false);
      });

      expect(errorEl().textContent).toBe('分支 dev 不存在');
      expect(document.getElementById('delete-branch-ok')).toBeTruthy();
      expect(okButton().disabled).toBe(false);
      expect(onConfirm).toHaveBeenCalledTimes(1);
    });

    it('e.message 非 JSON 时应原样显示', async () => {
      const onConfirm = vi.fn(async () => {
        throw new Error('网络连接中断');
      });
      showDeleteBranchDialog('dev', onConfirm);

      okButton().click();
      await vi.waitFor(() => expect(errorEl().hidden).toBe(false));

      expect(errorEl().textContent).toBe('网络连接中断');
      expect(document.getElementById('delete-branch-ok')).toBeTruthy();
    });

    it('失败路径应输出 [dialog] JSON 日志（branch_delete_confirm 与 branch_delete_failed）', async () => {
      const debugSpy = vi.spyOn(console, 'debug');
      const onConfirm = vi.fn(async () => {
        throw serviceError('GIT_ERROR', 'git 出错');
      });
      showDeleteBranchDialog('dev', onConfirm);

      okButton().click();
      await vi.waitFor(() => expect(errorEl().hidden).toBe(false));

      const payloads = debugSpy.mock.calls
        .map(c => String(c[0]))
        .filter(l => l.startsWith('{'))
        .map(l => JSON.parse(l) as Record<string, unknown>);
      expect(payloads.find(p => p.event === 'branch_delete_confirm'))
        .toMatchObject({ prefix: '[dialog]', branch: 'dev', force: true });
      expect(payloads.find(p => p.event === 'branch_delete_failed'))
        .toMatchObject({ prefix: '[dialog]', branch: 'dev', code: 'GIT_ERROR' });
    });

    it('点取消、Escape 或遮罩层应关闭且不调用 onConfirm', () => {
      const onConfirm = vi.fn(async () => {});

      // 取消按钮
      showDeleteBranchDialog('dev', onConfirm);
      (document.getElementById('delete-branch-cancel') as HTMLElement).click();
      expect(document.getElementById('delete-branch-ok')).toBeNull();

      // Escape 键
      showDeleteBranchDialog('dev', onConfirm);
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
      expect(document.getElementById('delete-branch-ok')).toBeNull();

      // 点击遮罩层
      showDeleteBranchDialog('dev', onConfirm);
      clickOverlay(getOverlay());
      expect(document.getElementById('delete-branch-ok')).toBeNull();

      expect(onConfirm).not.toHaveBeenCalled();
    });

    it('非 Escape 键不关闭，close 幂等且注销的事件名为 keydown', () => {
      const removeSpy = vi.spyOn(document, 'removeEventListener');
      showDeleteBranchDialog('dev', vi.fn(async () => {}));

      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'a', bubbles: true }));
      expect(document.getElementById('delete-branch-ok')).toBeTruthy(); // 非 Escape 不关闭

      const cancel = document.getElementById('delete-branch-cancel') as HTMLElement;
      cancel.click();
      cancel.click(); // 幂等：关闭后残留按钮再次触发 close 不应重复注销

      expect(document.getElementById('delete-branch-ok')).toBeNull();
      expect(removeSpy.mock.calls.filter(c => c[0] === 'keydown')).toHaveLength(1);
      expect(removeSpy).toHaveBeenCalledWith('keydown', expect.any(Function));
    });
  });

  describe('showConfirmDialog', () => {
    it('应渲染文案与按钮：确定是主操作、取消是中性按钮', () => {
      showConfirmDialog('确定要丢弃改动吗？', vi.fn());

      const overlay = getOverlay();
      const panel = expectDialogShell(overlay, { wide: true });
      expect((panel.querySelector('#confirm-message') as HTMLElement).textContent)
        .toBe('确定要丢弃改动吗？');
      expectButtonVariant('confirm-ok', 'primary');
      expectButtonVariant('confirm-cancel', 'neutral');
    });

    it('危险操作时确定按钮改用危险样式类', () => {
      showConfirmDialog('确定要删除吗？', vi.fn(), true);

      expectButtonVariant('confirm-ok', 'destructive');
      expectButtonVariant('confirm-cancel', 'neutral');
    });

    it('点确定应先关闭对话框再回调，点取消只关闭', () => {
      const onConfirm = vi.fn();
      showConfirmDialog('继续？', onConfirm);

      (document.getElementById('confirm-cancel') as HTMLElement).click();
      expect(document.getElementById('confirm-ok')).toBeNull();
      expect(onConfirm).not.toHaveBeenCalled();

      showConfirmDialog('继续？', onConfirm);
      (document.getElementById('confirm-ok') as HTMLElement).click();
      expect(document.getElementById('confirm-ok')).toBeNull();
      expect(onConfirm).toHaveBeenCalledTimes(1);
    });
  });

  describe('showPromptDialog', () => {
    it('每个字段应渲染标签与输入框，确定时按字段顺序回调去除首尾空白后的值', () => {
      const onConfirm = vi.fn();
      showPromptDialog('添加工作树', [
        { label: '路径', value: ' /repo/wt ' },
        { label: '分支', placeholder: 'feature-x' },
      ], onConfirm);

      const overlay = getOverlay();
      const panel = expectDialogShell(overlay, { wide: true });
      expect((panel.querySelector('#prompt-title') as HTMLElement).textContent).toBe('添加工作树');

      const labels = [...panel.querySelectorAll('#prompt-fields .gm-dialog__label')];
      expect(labels.map(l => l.textContent)).toEqual(['路径', '分支']);
      const inputs = [...panel.querySelectorAll<HTMLInputElement>('#prompt-fields input')];
      expect(inputs.length).toBe(2);
      expect(inputs.every(i => i.classList.contains('gm-input'))).toBe(true);
      expect(inputs[1].placeholder).toBe('feature-x');
      // 字段各自包在 gm-dialog__field 里
      expect(panel.querySelectorAll('#prompt-fields .gm-dialog__field').length).toBe(2);
      expectButtonVariant('prompt-ok', 'primary');
      expectButtonVariant('prompt-cancel', 'neutral');

      inputs[1].value = 'feature-x';
      (document.getElementById('prompt-ok') as HTMLElement).click();

      expect(onConfirm).toHaveBeenCalledWith(['/repo/wt', 'feature-x']);
      expect(document.getElementById('prompt-ok')).toBeNull();
    });

    it('按回车应提交，点取消应关闭且不回调', () => {
      const onConfirm = vi.fn();
      showPromptDialog('重命名', [{ label: '名称', value: 'a' }], onConfirm);

      // 输入框的 keydown 冒泡到遮罩层，由遮罩层统一处理 Enter
      (document.querySelector('#prompt-fields input') as HTMLInputElement)
        .dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
      expect(onConfirm).toHaveBeenCalledWith(['a']);
      expect(document.getElementById('prompt-ok')).toBeNull();

      showPromptDialog('重命名', [{ label: '名称', value: 'b' }], onConfirm);
      (document.getElementById('prompt-cancel') as HTMLElement).click();
      expect(document.getElementById('prompt-ok')).toBeNull();
      expect(onConfirm).toHaveBeenCalledTimes(1);
    });
  });
});
