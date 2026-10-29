/**
 * 文件右键菜单组件单元测试
 * 覆盖 showFileContextMenu 渲染、菜单项动作与 hideFileContextMenu 隐藏逻辑
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { showFileContextMenu, hideFileContextMenu } from '../components/file-context-menu';
import { setState, createInitialState, FileDiff } from '../state';
import { setLocale } from '../i18n';
import { ServiceClient } from '../service';

/** 测试目录 */
const DIRECTORY = '/repo';

/** 测试文件差异 */
const fileDiff: FileDiff = {
  path: 'src/app.ts',
  additions: 3,
  deletions: 1,
  lines: [],
};

/** 全部中文菜单项文案（按渲染顺序） */
const ALL_LABELS = [
  '显示差异',
  '新窗口显示差异',
  '与本地比较',
  '比较改动前与本地',
  '编辑源文件',
  '打开仓库版本',
  '回滚选中更改',
  '摘取选中更改',
  '创建补丁',
  '从版本获取',
  '此处为止的历史',
];

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
 * 获取当前文件菜单元素
 * @returns 菜单元素
 */
function getMenu(): HTMLElement {
  const menu = document.getElementById('git-file-context-menu');
  expect(menu).toBeTruthy();
  return menu as HTMLElement;
}

describe('file-context-menu', () => {
  beforeEach(() => {
    // 使用假计时器接管 show 结束时注册的 setTimeout(0)
    vi.useFakeTimers();
    setLocale('zh-CN');
    setState(s => Object.assign(s, createInitialState()));
    document.body.innerHTML = '';
    vi.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    hideFileContextMenu();
    // 执行排队的 setTimeout(0)，让全局 click 关闭监听注册后自清理
    vi.runAllTimers();
    document.body.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    vi.useRealTimers();
    document.body.innerHTML = '';
    vi.restoreAllMocks();
  });

  describe('showFileContextMenu', () => {
    it('派发 contextmenu 事件后应在指针位置渲染菜单与全部中文菜单项', () => {
      const trigger = document.createElement('div');
      document.body.appendChild(trigger);
      trigger.addEventListener('contextmenu', (e) => {
        showFileContextMenu(e as MouseEvent, fileDiff, {} as ServiceClient, DIRECTORY);
      });

      trigger.dispatchEvent(createContextMenuEvent());

      const menu = getMenu();
      // 容器外观来自样式表类；只有坐标在打开时内联写入
      expect(menu.classList.contains('gm-popup')).toBe(true);
      expect(menu.style.position).toBe('');
      expect(menu.style.left).toBe('10px');
      expect(menu.style.top).toBe('10px');

      const labels = getMenuItems(menu).map(el => el.textContent);
      expect(labels).toEqual(ALL_LABELS);

      // 4 条分隔线：纯 div，无文案、无内联修饰
      const separators = getSeparators(menu);
      expect(separators).toHaveLength(4);
      expect(separators[0].tagName).toBe('DIV');
      expect(separators[0].textContent).toBe('');
      expect(separators[0].getAttribute('style')).toBeNull();
    });

    it('回滚选中更改应带破坏性样式类，普通项只带基础类', () => {
      showFileContextMenu(createContextMenuEvent(), fileDiff, {} as ServiceClient, DIRECTORY);

      const menu = getMenu();
      const dangerItem = findMenuItem(menu, '回滚选中更改');
      const normalItem = findMenuItem(menu, '显示差异');

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
      showFileContextMenu(createContextMenuEvent(), fileDiff, {} as ServiceClient, DIRECTORY);

      const item = findMenuItem(getMenu(), '显示差异')!;
      expect(() => {
        item.dispatchEvent(new MouseEvent('mouseenter'));
        item.dispatchEvent(new MouseEvent('mouseleave'));
      }).not.toThrow();
      expect(item.style.background).toBe('');
      // 事件未被拦截：菜单仍然打开
      expect(document.getElementById('git-file-context-menu')).toBeTruthy();
    });

    it('点击显示差异应记录日志并关闭菜单', async () => {
      showFileContextMenu(createContextMenuEvent(), fileDiff, {} as ServiceClient, DIRECTORY);

      findMenuItem(getMenu(), '显示差异')!.click();
      await Promise.resolve();

      expect(console.log).toHaveBeenCalledWith('[git-manager] Show Diff:', 'src/app.ts');
      expect(document.getElementById('git-file-context-menu')).toBeNull();
    });

    it('点击回滚选中更改应记录对应日志并关闭菜单', async () => {
      showFileContextMenu(createContextMenuEvent(), fileDiff, {} as ServiceClient, DIRECTORY);

      findMenuItem(getMenu(), '回滚选中更改')!.click();
      await Promise.resolve();

      expect(console.log).toHaveBeenCalledWith('[git-manager] Revert Selected Changes:', 'src/app.ts');
      expect(document.getElementById('git-file-context-menu')).toBeNull();
    });

    it('点击每个菜单项都应执行动作并关闭菜单', async () => {
      for (const label of ALL_LABELS) {
        showFileContextMenu(createContextMenuEvent(), fileDiff, {} as ServiceClient, DIRECTORY);
        findMenuItem(getMenu(), label)!.click();
        await Promise.resolve();
        expect(document.getElementById('git-file-context-menu')).toBeNull();
      }
      // 每个动作都至少记录了一条日志
      expect(console.log).toHaveBeenCalledTimes(ALL_LABELS.length);
    });

    it('点击分隔线不应关闭菜单', () => {
      showFileContextMenu(createContextMenuEvent(), fileDiff, {} as ServiceClient, DIRECTORY);
      vi.runAllTimers();

      const menu = getMenu();
      const separator = getSeparators(menu)[0];
      separator.dispatchEvent(new MouseEvent('click', { bubbles: true }));

      expect(document.getElementById('git-file-context-menu')).toBeTruthy();
    });

    it('点击菜单外部应关闭菜单', () => {
      showFileContextMenu(createContextMenuEvent(), fileDiff, {} as ServiceClient, DIRECTORY);
      // 触发 setTimeout(0) 注册全局 click 关闭监听
      vi.runAllTimers();
      expect(document.getElementById('git-file-context-menu')).toBeTruthy();

      document.body.dispatchEvent(new MouseEvent('click', { bubbles: true }));

      expect(document.getElementById('git-file-context-menu')).toBeNull();
    });

    it('重复打开菜单应只保留一个菜单', () => {
      showFileContextMenu(createContextMenuEvent(), fileDiff, {} as ServiceClient, DIRECTORY);
      showFileContextMenu(createContextMenuEvent(), fileDiff, {} as ServiceClient, DIRECTORY);

      expect(document.querySelectorAll('#git-file-context-menu')).toHaveLength(1);
    });
  });

  describe('hideFileContextMenu', () => {
    it('应移除已存在的菜单', () => {
      showFileContextMenu(createContextMenuEvent(), fileDiff, {} as ServiceClient, DIRECTORY);
      expect(document.getElementById('git-file-context-menu')).toBeTruthy();

      hideFileContextMenu();

      expect(document.getElementById('git-file-context-menu')).toBeNull();
    });

    it('无菜单时调用不应报错', () => {
      expect(() => hideFileContextMenu()).not.toThrow();
    });
  });

  describe('菜单细节（补充变异覆盖）', () => {
    /** 各菜单项动作对应的日志文案（已由既有用例覆盖的项不在此列） */
    const LOG_CASES: Array<[label: string, message: string]> = [
      ['新窗口显示差异', '[git-manager] Show Diff in New Window:'],
      ['与本地比较', '[git-manager] Compare with Local:'],
      ['比较改动前与本地', '[git-manager] Compare Before with Local:'],
      ['编辑源文件', '[git-manager] Edit Source:'],
      ['打开仓库版本', '[git-manager] Open Repository Version:'],
      ['摘取选中更改', '[git-manager] Cherry-Pick Selected Changes:'],
      ['创建补丁', '[git-manager] Create Patch:'],
      ['从版本获取', '[git-manager] Get from Revision:'],
      ['此处为止的历史', '[git-manager] History Up to Here:'],
    ];

    it('点击各菜单项应输出对应文案的日志', async () => {
      for (const [label, message] of LOG_CASES) {
        showFileContextMenu(createContextMenuEvent(), fileDiff, {} as ServiceClient, DIRECTORY);
        findMenuItem(getMenu(), label)!.click();
        await Promise.resolve();

        expect(console.log).toHaveBeenCalledWith(message, 'src/app.ts');
      }
    });

    it('菜单项与分隔线只使用样式表类，内联仅保留坐标', () => {
      showFileContextMenu(createContextMenuEvent(), fileDiff, {} as ServiceClient, DIRECTORY);

      const menu = getMenu();
      expect(menu.classList.contains('gm-popup')).toBe(true);
      expect(menu.style.left).toBe('10px');
      expect(menu.style.top).toBe('10px');
      expect(menu.style.minWidth).toBe('');

      const item = findMenuItem(menu, '显示差异')!;
      expect(item.classList.contains('gm-menu-item')).toBe(true);
      expect(item.dataset.disabled).toBe('false');
      expect(item.style.padding).toBe('');
      expect(item.style.fontSize).toBe('');

      const sep = getSeparators(menu)[0];
      expect(sep.classList.contains('gm-popup__sep')).toBe(true);
      expect(sep.getAttribute('style')).toBeNull();
    });

    it('鼠标位于菜单容器自身时不写内联高亮或恢复', () => {
      showFileContextMenu(createContextMenuEvent(), fileDiff, {} as ServiceClient, DIRECTORY);

      const menu = getMenu();
      expect(() => {
        menu.dispatchEvent(new MouseEvent('mouseenter'));
        menu.dispatchEvent(new MouseEvent('mouseleave'));
      }).not.toThrow();
      // 高亮完全由样式表决定，容器没有内联背景
      expect(menu.style.background).toBe('');
      expect(menu.classList.contains('gm-popup')).toBe(true);
    });

    it('点击菜单项内的嵌套元素不应执行动作或关闭菜单', async () => {
      showFileContextMenu(createContextMenuEvent(), fileDiff, {} as ServiceClient, DIRECTORY);

      const menu = getMenu();
      const item = findMenuItem(menu, '与本地比较')!;
      const nested = document.createElement('div');
      nested.textContent = '与本地比较';
      item.appendChild(nested);

      nested.click();
      await Promise.resolve();

      expect(console.log).not.toHaveBeenCalledWith('[git-manager] Compare with Local:', 'src/app.ts');
      expect(document.getElementById('git-file-context-menu')).toBeTruthy();
    });
  });
});
