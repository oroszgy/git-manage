/**
 * 通用下拉菜单单元测试
 * 覆盖渲染、选择回调、group/separator/disabled 条目行为、checked 标记、
 * 各类关闭时机（外部点击/锚点 toggle/Escape/关闭函数幂等）、
 * 视口翻转、多实例互斥、悬停高亮、调试日志与 HTML 注入防护
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { showDropdownMenu } from '../components/dropdown-menu';
import type { DropdownMenuItem } from '../components/dropdown-menu';

/** 菜单容器元素 id（与组件实现保持一致） */
const MENU_ID = 'git-dropdown-menu';

/**
 * 创建锚点按钮（模拟工具栏过滤按钮）
 * @param id 按钮 id
 * @returns 已挂到 body 的按钮元素
 */
function createAnchor(id: string): HTMLElement {
  const btn = document.createElement('button');
  btn.id = id;
  btn.textContent = '过滤';
  document.body.appendChild(btn);
  return btn;
}

/**
 * 获取当前菜单元素（不存在则断言失败）
 * @returns 菜单元素
 */
function getMenu(): HTMLElement {
  const menu = document.getElementById(MENU_ID);
  expect(menu).toBeTruthy();
  return menu as HTMLElement;
}

/**
 * 构造默认测试条目：分组标题 + 两个可选项 + 分隔线 + 可选项
 * @returns 菜单条目列表
 */
function createItems(): DropdownMenuItem[] {
  return [
    { id: 'group-main', label: '主分支', kind: 'group' },
    { id: 'main', label: 'main' },
    { id: 'dev', label: 'dev' },
    { id: 'sep-1', label: '', kind: 'separator' },
    { id: 'all', label: '全部' },
  ];
}

/**
 * 为锚点打上固定位置的 getBoundingClientRect 桩
 * @param anchor 锚点元素
 * @param rect 期望返回的矩形（left/top/right/bottom/width/height）
 */
function stubRect(
  anchor: HTMLElement,
  rect: { left: number; top: number; right: number; bottom: number; width: number; height: number },
): void {
  vi.spyOn(anchor, 'getBoundingClientRect').mockReturnValue({
    ...rect,
    x: rect.left,
    y: rect.top,
    toJSON: () => ({}),
  } as DOMRect);
}

/**
 * 固定视口尺寸（jsdom 不做布局，innerWidth/innerHeight 需手动接管）
 * @param width 视口宽度
 * @param height 视口高度
 */
function stubViewport(width: number, height: number): void {
  Object.defineProperty(window, 'innerWidth', { value: width, configurable: true });
  Object.defineProperty(window, 'innerHeight', { value: height, configurable: true });
}

/**
 * 为菜单容器打上固定尺寸桩（jsdom 无布局，offsetWidth/offsetHeight 恒为 0）
 * @param width 菜单宽度
 * @param height 菜单高度
 */
function stubMenuSize(width: number, height: number): void {
  vi.spyOn(HTMLElement.prototype, 'offsetWidth', 'get').mockReturnValue(width);
  vi.spyOn(HTMLElement.prototype, 'offsetHeight', 'get').mockReturnValue(height);
}

/**
 * 按 id 查找菜单行元素
 * @param menu 菜单容器
 * @param id 条目标识
 * @returns 行元素
 */
function getRow(menu: HTMLElement, id: string): HTMLElement {
  const row = menu.querySelector<HTMLElement>(`[data-id="${id}"]`);
  expect(row).toBeTruthy();
  return row as HTMLElement;
}

describe('dropdown-menu', () => {
  /** 用例开始前的原始视口尺寸（部分用例会接管，结束后统一还原） */
  let savedInnerWidth = 0;
  let savedInnerHeight = 0;

  beforeEach(() => {
    // 接管 showDropdownMenu 内部注册的 setTimeout(0)
    vi.useFakeTimers();
    savedInnerWidth = window.innerWidth;
    savedInnerHeight = window.innerHeight;
    document.body.innerHTML = '';
  });

  afterEach(() => {
    // 兜底清理：冲刷延迟注册的外部关闭监听，再通过外部点击与 Escape 关闭残留菜单
    vi.runAllTimers();
    document.body.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    vi.useRealTimers();
    // 还原被用例接管的视口尺寸，避免影响后续用例的定位断言
    stubViewport(savedInnerWidth, savedInnerHeight);
    document.body.innerHTML = '';
    vi.restoreAllMocks();
  });

  describe('渲染', () => {
    it('调用后应在锚点下方左对齐渲染菜单，条目文案与顺序正确', () => {
      const anchor = createAnchor('anchor-render');
      stubRect(anchor, { left: 100, top: 50, right: 180, bottom: 74, width: 80, height: 24 });

      showDropdownMenu(anchor, createItems(), vi.fn());

      const menu = getMenu();
      expect(menu.classList.contains('gm-popup')).toBe(true);
      // Coordinates are the only runtime values left inline.
      expect(menu.style.left).toBe('100px');
      expect(menu.style.top).toBe('76px');
      expect(Array.from(menu.children).map(el => el.textContent)).toEqual([
        '主分支',
        'main',
        'dev',
        '',
        '全部',
      ]);
    });

    it('菜单容器与行只用样式表类，不再携带内联外观', () => {
      const anchor = createAnchor('anchor-style');
      showDropdownMenu(anchor, createItems(), vi.fn());

      const menu = getMenu();
      expect(menu.className).toContain('gm-popup');
      // Everything except the computed position lives in styles.css.
      const inline = menu.getAttribute('style') ?? '';
      expect(inline).toContain('left:');
      expect(inline).toContain('top:');
      expect(inline).not.toContain('background');

      const row = getRow(menu, 'main');
      expect(row.classList.contains('gm-menu-item')).toBe(true);
      expect(row.getAttribute('style')).toBeNull();
    });

    it('分组标题与分隔线由各自的类承担外观', () => {
      const anchor = createAnchor('anchor-kinds');
      showDropdownMenu(anchor, createItems(), vi.fn());

      const menu = getMenu();
      const group = getRow(menu, 'group-main');
      expect(group.dataset.kind).toBe('group');
      expect(group.classList.contains('gm-popup__group')).toBe(true);
      expect(group.getAttribute('style')).toBeNull();

      const sep = getRow(menu, 'sep-1');
      expect(sep.dataset.kind).toBe('separator');
      expect(sep.classList.contains('gm-popup__sep')).toBe(true);
      expect(sep.textContent).toBe('');
    });

    it('可选项渲染勾号槽，且未禁用项不受禁用状态影响', () => {
      const anchor = createAnchor('anchor-row-styles');
      showDropdownMenu(anchor, createItems(), vi.fn());

      const menu = getMenu();
      const item = getRow(menu, 'main');
      expect(item.dataset.disabled).toBe('false');

      const check = item.querySelector<HTMLElement>('.git-dropdown-check');
      expect(check).toBeTruthy();
      expect(check!.classList.contains('gm-menu-item__check')).toBe(true);
      expect(check!.getAttribute('style')).toBeNull();
    });

    it('禁用状态由 data-disabled 表达，样式不再内联', () => {
      const anchor = createAnchor('anchor-cursor');
      showDropdownMenu(
        anchor,
        [
          { id: 'ok', label: '可选' },
          { id: 'off', label: '禁用', disabled: true },
        ],
        vi.fn(),
      );

      const menu = getMenu();
      expect(getRow(menu, 'ok').dataset.disabled).toBe('false');
      expect(getRow(menu, 'off').dataset.disabled).toBe('true');
      expect(getRow(menu, 'off').getAttribute('style')).toBeNull();
    });
  });

  describe('选择回调', () => {
    it('点击可选项应以对应 id 触发 onSelect 并关闭菜单', () => {
      const anchor = createAnchor('anchor-select');
      const onSelect = vi.fn();
      showDropdownMenu(anchor, createItems(), onSelect);
      vi.runAllTimers();

      getRow(getMenu(), 'dev').click();

      expect(onSelect).toHaveBeenCalledTimes(1);
      expect(onSelect).toHaveBeenCalledWith('dev');
      expect(document.getElementById(MENU_ID)).toBeNull();
    });

    it('点击分组标题与分隔线不应触发 onSelect，菜单保持打开', () => {
      const anchor = createAnchor('anchor-group');
      const onSelect = vi.fn();
      showDropdownMenu(anchor, createItems(), onSelect);
      vi.runAllTimers();

      getRow(getMenu(), 'group-main').click();
      getRow(getMenu(), 'sep-1').click();

      expect(onSelect).not.toHaveBeenCalled();
      expect(document.getElementById(MENU_ID)).toBeTruthy();
    });

    it('点击 disabled 条目不应触发 onSelect，菜单保持打开且条目置灰', () => {
      const anchor = createAnchor('anchor-disabled');
      const onSelect = vi.fn();
      showDropdownMenu(
        anchor,
        [
          { id: 'free', label: '可选' },
          { id: 'locked', label: '锁定', disabled: true },
        ],
        onSelect,
      );
      vi.runAllTimers();

      getRow(getMenu(), 'locked').click();

      expect(onSelect).not.toHaveBeenCalled();
      expect(document.getElementById(MENU_ID)).toBeTruthy();
      const row = getRow(getMenu(), 'locked');
      expect(row.dataset.disabled).toBe('true');
    });

    it('checked 条目应渲染 ✓ 标记，未选中条目无标记', () => {
      const anchor = createAnchor('anchor-checked');
      showDropdownMenu(
        anchor,
        [
          { id: 'a', label: '甲', checked: true },
          { id: 'b', label: '乙' },
        ],
        vi.fn(),
      );

      const menu = getMenu();
      const checked = getRow(menu, 'a').querySelector<HTMLElement>('.git-dropdown-check');
      expect(checked).toBeTruthy();
      expect(checked!.textContent).toBe('✓');

      const unchecked = getRow(menu, 'b').querySelector<HTMLElement>('.git-dropdown-check');
      expect(unchecked).toBeTruthy();
      expect(unchecked!.textContent).toBe('');
    });

    it('缺少 data-id 的可选项被点击时应回调空字符串 id（防御性回退）', () => {
      const anchor = createAnchor('anchor-missing-id');
      const onSelect = vi.fn();
      showDropdownMenu(anchor, [{ id: 'main', label: 'main' }], onSelect);
      vi.runAllTimers();

      // 手工插入无 data-id 的可选行，走 id 缺失的回退路径
      const orphan = document.createElement('div');
      orphan.dataset.kind = 'item';
      orphan.textContent = '孤儿行';
      getMenu().appendChild(orphan);
      orphan.click();

      expect(onSelect).toHaveBeenCalledTimes(1);
      expect(onSelect).toHaveBeenCalledWith('');
      // 选择后菜单照常关闭
      expect(document.getElementById(MENU_ID)).toBeNull();
    });
  });

  describe('关闭时机', () => {
    it('点击菜单外部应关闭菜单', () => {
      const anchor = createAnchor('anchor-outside');
      showDropdownMenu(anchor, createItems(), vi.fn());
      // 冲刷 setTimeout(0)，让外部点击关闭监听真正挂到 document 上
      vi.runAllTimers();
      expect(document.getElementById(MENU_ID)).toBeTruthy();

      document.body.dispatchEvent(new MouseEvent('click', { bubbles: true }));

      expect(document.getElementById(MENU_ID)).toBeNull();
    });

    it('再次点击同一锚点应关闭菜单（toggle），第三次点击重新打开', () => {
      const anchor = createAnchor('anchor-toggle');
      const onSelect = vi.fn();
      // 模拟接线：每次点击锚点都调用 showDropdownMenu，由组件内部做 toggle 判定
      anchor.addEventListener('click', () => {
        showDropdownMenu(anchor, createItems(), onSelect);
      });

      anchor.click();
      expect(document.getElementById(MENU_ID)).toBeTruthy();
      vi.runAllTimers();

      anchor.click();
      expect(document.getElementById(MENU_ID)).toBeNull();

      anchor.click();
      expect(document.getElementById(MENU_ID)).toBeTruthy();
      expect(onSelect).not.toHaveBeenCalled();
    });

    it('按下 Escape 键应关闭菜单，其他按键不关闭', () => {
      const anchor = createAnchor('anchor-escape');
      showDropdownMenu(anchor, createItems(), vi.fn());

      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
      expect(document.getElementById(MENU_ID)).toBeTruthy();

      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
      expect(document.getElementById(MENU_ID)).toBeNull();
    });

    it('返回的关闭函数应幂等：重复调用不抛错且不重复移除元素', () => {
      const anchor = createAnchor('anchor-close');
      const close = showDropdownMenu(anchor, createItems(), vi.fn());
      const removeSpy = vi.spyOn(Element.prototype, 'remove');

      expect(() => close()).not.toThrow();
      expect(() => close()).not.toThrow();

      expect(document.getElementById(MENU_ID)).toBeNull();
      expect(removeSpy).toHaveBeenCalledTimes(1);
    });

    it('弹出新菜单时应先关闭已有菜单（多实例互斥）', () => {
      const anchorA = createAnchor('anchor-a');
      const anchorB = createAnchor('anchor-b');
      showDropdownMenu(anchorA, [{ id: 'item-a', label: '条目甲' }], vi.fn());
      vi.runAllTimers();

      showDropdownMenu(anchorB, [{ id: 'item-b', label: '条目乙' }], vi.fn());

      expect(document.querySelectorAll(`#${MENU_ID}`)).toHaveLength(1);
      const menu = getMenu();
      expect(menu.textContent).toContain('条目乙');
      expect(menu.textContent).not.toContain('条目甲');
    });

    it('关闭菜单应清除尚未触发的外部点击延迟注册计时器', () => {
      const anchor = createAnchor('anchor-timer-cleanup');
      const close = showDropdownMenu(anchor, createItems(), vi.fn());
      // 打开后应挂着一个待触发的延迟注册计时器
      expect(vi.getTimerCount()).toBeGreaterThan(0);

      // 未冲刷计时器就关闭：必须把它清掉，否则监听会在关闭后仍挂上
      close();
      expect(vi.getTimerCount()).toBe(0);
    });

    it('延迟注册计时器已触发后关闭菜单不应再调用 clearTimeout', () => {
      const anchor = createAnchor('anchor-timer-fired');
      const close = showDropdownMenu(anchor, createItems(), vi.fn());
      // 冲刷延迟注册：计时器触发后 outsideTimer 已置回 null
      vi.runAllTimers();

      const clearSpy = vi.spyOn(globalThis, 'clearTimeout');
      close();

      // 句柄为空时不应再发起 clearTimeout
      expect(clearSpy).not.toHaveBeenCalled();
      clearSpy.mockRestore();
    });

    it('toggle 关闭后返回的关闭函数应为幂等空操作', () => {
      const anchor = createAnchor('anchor-toggle-return');
      showDropdownMenu(anchor, createItems(), vi.fn());
      vi.runAllTimers();

      // 同一锚点重复调用触发 toggle 关闭，并返回一个关闭函数
      const closeAgain = showDropdownMenu(anchor, createItems(), vi.fn());
      expect(document.getElementById(MENU_ID)).toBeNull();

      const removeSpy = vi.spyOn(Element.prototype, 'remove');
      expect(() => closeAgain()).not.toThrow();
      // 实例已关闭，重复关闭不产生任何副作用
      expect(removeSpy).not.toHaveBeenCalled();
      removeSpy.mockRestore();
    });

    it('关闭菜单应注销 document 上的外部点击与 Escape 监听（防监听泄漏）', () => {
      const anchor = createAnchor('anchor-listener-cleanup');
      const close = showDropdownMenu(anchor, createItems(), vi.fn());
      vi.runAllTimers(); // 冲刷延迟注册，让两个监听真正挂到 document 上

      const removeSpy = vi.spyOn(document, 'removeEventListener');
      close();

      expect(removeSpy).toHaveBeenCalledWith('click', expect.any(Function));
      expect(removeSpy).toHaveBeenCalledWith('keydown', expect.any(Function));
    });

    it('关闭原因日志应区分锚点 toggle 与互斥替换', () => {
      const spy = vi.spyOn(console, 'debug');
      const anchorA = createAnchor('anchor-reason-a');
      const anchorB = createAnchor('anchor-reason-b');

      // 同一锚点再次调用 → toggle 关闭
      showDropdownMenu(anchorA, createItems(), vi.fn());
      vi.runAllTimers();
      showDropdownMenu(anchorA, createItems(), vi.fn());
      expect(spy).toHaveBeenCalledWith(
        '[dropdown]',
        expect.stringContaining('"reason":"toggle"'),
      );

      // 换锚点打开 → 旧菜单被替换关闭
      showDropdownMenu(anchorA, createItems(), vi.fn());
      vi.runAllTimers();
      showDropdownMenu(anchorB, createItems(), vi.fn());
      expect(spy).toHaveBeenCalledWith(
        '[dropdown]',
        expect.stringContaining('"reason":"replace"'),
      );
    });

    it('关闭原因日志应区分外部点击、Escape、选择与关闭函数', () => {
      const spy = vi.spyOn(console, 'debug');
      const anchor = createAnchor('anchor-reason-all');

      // 外部点击关闭
      showDropdownMenu(anchor, createItems(), vi.fn());
      vi.runAllTimers();
      document.body.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      expect(spy).toHaveBeenCalledWith(
        '[dropdown]',
        expect.stringContaining('"reason":"outside"'),
      );

      // Escape 关闭
      showDropdownMenu(anchor, createItems(), vi.fn());
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
      expect(spy).toHaveBeenCalledWith(
        '[dropdown]',
        expect.stringContaining('"reason":"escape"'),
      );

      // 选中条目关闭
      showDropdownMenu(anchor, createItems(), vi.fn());
      vi.runAllTimers();
      getRow(getMenu(), 'main').click();
      expect(spy).toHaveBeenCalledWith(
        '[dropdown]',
        expect.stringContaining('"reason":"select"'),
      );

      // 返回的关闭函数关闭
      const close = showDropdownMenu(anchor, createItems(), vi.fn());
      close();
      expect(spy).toHaveBeenCalledWith(
        '[dropdown]',
        expect.stringContaining('"reason":"api"'),
      );
    });

    it('菜单被外部直接移除后到达的点击应仅自清理而不重复关闭', () => {
      const anchor = createAnchor('anchor-detached');
      showDropdownMenu(anchor, createItems(), vi.fn());
      vi.runAllTimers(); // 让外部点击监听真正挂到 document 上

      const logSpy = vi.spyOn(console, 'debug');
      const removeSpy = vi.spyOn(document, 'removeEventListener');
      getMenu().remove(); // 模拟菜单被其他逻辑直接移除（实例未走关闭流程）

      document.body.dispatchEvent(new MouseEvent('click', { bubbles: true }));

      // 不应再走关闭流程输出 close 日志（避免误伤后续打开的新菜单）
      expect(logSpy).not.toHaveBeenCalledWith(
        '[dropdown]',
        expect.stringContaining('"event":"close"'),
      );
      // 应以 click 名注销自身监听，防止监听泄漏
      expect(removeSpy).toHaveBeenCalledWith('click', expect.any(Function));
    });
  });

  describe('定位与交互细节', () => {
    it('视口底部空间不足时应向上翻转到锚点上方', () => {
      // 固定视口高度为 768；jsdom 无布局（offsetHeight 为 0），翻转仅取决于锚点位置
      Object.defineProperty(window, 'innerHeight', { value: 768, configurable: true });
      const anchor = createAnchor('anchor-flip');
      stubRect(anchor, { left: 100, top: 743, right: 180, bottom: 767, width: 80, height: 24 });

      showDropdownMenu(anchor, createItems(), vi.fn());

      // 767 + 2 已超出 768 视口 → 翻转：743 - 2 = 741
      expect(getMenu().style.top).toBe('741px');
    });

    it('悬停不再由脚本改写内联背景（样式表 :hover 负责高亮）', () => {
      const anchor = createAnchor('anchor-hover');
      showDropdownMenu(
        anchor,
        [
          { id: 'g', label: '分组', kind: 'group' },
          { id: 'ok', label: '可选' },
          { id: 'off', label: '禁用', disabled: true },
        ],
        vi.fn(),
      );
      const menu = getMenu();

      for (const id of ['ok', 'g', 'off']) {
        const row = getRow(menu, id);
        row.dispatchEvent(new MouseEvent('mouseenter', { bubbles: false }));
        row.dispatchEvent(new MouseEvent('mouseleave', { bubbles: false }));
        expect(row.getAttribute('style')).toBeNull();
      }
    });

    it('行内嵌套的可选项不应响应点击与悬停（仅菜单直属行生效）', () => {
      const anchor = createAnchor('anchor-nested');
      const onSelect = vi.fn();
      showDropdownMenu(anchor, createItems(), onSelect);
      vi.runAllTimers();

      const menu = getMenu();
      const row = getRow(menu, 'main');
      // 在可选行内插入嵌套可选 div：closest('div') 命中它自身，父级不是菜单
      const nested = document.createElement('div');
      nested.dataset.kind = 'item';
      nested.dataset.id = 'deep';
      nested.textContent = '深层';
      row.appendChild(nested);

      // 点击：父级非菜单直属 → 不应触发选择，菜单保持打开
      nested.click();
      expect(onSelect).not.toHaveBeenCalled();
      expect(document.getElementById(MENU_ID)).toBeTruthy();

      // Nested rows never carry their own inline styling either.
      nested.dispatchEvent(new MouseEvent('mouseenter', { bubbles: false }));
      expect(nested.getAttribute('style')).toBeNull();

      nested.dispatchEvent(new MouseEvent('mouseleave', { bubbles: false }));
      expect(nested.getAttribute('style')).toBeNull();
    });

    it('打开与选择应输出 [dropdown] 前缀的 JSON 调试日志', () => {
      const spy = vi.spyOn(console, 'debug');
      const anchor = createAnchor('anchor-log');
      showDropdownMenu(anchor, createItems(), vi.fn());

      expect(spy).toHaveBeenCalledWith(
        '[dropdown]',
        expect.stringContaining('"event":"open"'),
      );

      getRow(getMenu(), 'main').click();

      expect(spy).toHaveBeenCalledWith(
        '[dropdown]',
        expect.stringContaining('"event":"select","id":"main"'),
      );
      expect(spy).toHaveBeenCalledWith(
        '[dropdown]',
        expect.stringContaining('"event":"close"'),
      );
    });

    it('open 日志应记录锚点 id（无 id 时回退标签名）与条目数量', () => {
      const spy = vi.spyOn(console, 'debug');
      const anchor = createAnchor('anchor-open-log');
      showDropdownMenu(anchor, createItems(), vi.fn()); // 5 个条目

      expect(spy).toHaveBeenCalledWith(
        '[dropdown]',
        expect.stringContaining('"anchor":"anchor-open-log"'),
      );
      expect(spy).toHaveBeenCalledWith(
        '[dropdown]',
        expect.stringContaining('"count":5'),
      );

      // 换无 id 的锚点：anchor 回退为标签名，count 跟随条目数
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
      const bare = document.createElement('button');
      document.body.appendChild(bare);
      showDropdownMenu(bare, [{ id: 'x', label: '甲' }], vi.fn());

      expect(spy).toHaveBeenCalledWith(
        '[dropdown]',
        expect.stringContaining('"anchor":"BUTTON"'),
      );
      expect(spy).toHaveBeenCalledWith(
        '[dropdown]',
        expect.stringContaining('"count":1'),
      );
    });

    it('锚点右侧越界时菜单左缘应收进视口并保留最小边距', () => {
      stubViewport(500, 800);
      stubMenuSize(200, 100);
      const anchor = createAnchor('anchor-clamp-left');
      stubRect(anchor, { left: 600, top: 50, right: 680, bottom: 74, width: 80, height: 24 });

      showDropdownMenu(anchor, createItems(), vi.fn());

      // 正常：min(600, 500 - 200 - 4) = 296（左对齐越界时收进视口并留 4px 边距）
      expect(getMenu().style.left).toBe('296px');
    });

    it('底部空间恰好等于菜单高度加间隙时不应向上翻转', () => {
      stubViewport(800, 430);
      stubMenuSize(160, 200);
      const anchor = createAnchor('anchor-flip-boundary');
      stubRect(anchor, { left: 100, top: 204, right: 180, bottom: 228, width: 80, height: 24 });

      showDropdownMenu(anchor, createItems(), vi.fn());

      // spaceBelow = 430 - 228 = 202 = 200 + 2，严格小于才翻转 → 不翻：228 + 2 = 230
      expect(getMenu().style.top).toBe('230px');
    });

    it('锚点上沿恰好等于菜单高度加间隙时仍应向上翻转', () => {
      stubViewport(800, 400);
      stubMenuSize(160, 200);
      const anchor = createAnchor('anchor-flip-exact');
      stubRect(anchor, { left: 100, top: 202, right: 180, bottom: 226, width: 80, height: 24 });

      showDropdownMenu(anchor, createItems(), vi.fn());

      // spaceBelow = 174 < 202 且 top = 202 恰好等于 200 + 2 → 翻转：202 - 2 - 200 = 0
      expect(getMenu().style.top).toBe('0px');
    });

    it('锚点上沿不足以容纳菜单高度时不向上翻转', () => {
      stubViewport(800, 400);
      stubMenuSize(160, 200);
      const anchor = createAnchor('anchor-no-flip-tight-top');
      stubRect(anchor, { left: 100, top: 200, right: 180, bottom: 224, width: 80, height: 24 });

      showDropdownMenu(anchor, createItems(), vi.fn());

      // spaceBelow = 176 < 202（底部不足），但 top = 200 < 200 + 2（顶部也不足）→ 不翻：224 + 2 = 226
      expect(getMenu().style.top).toBe('226px');
    });

    it('底部与顶部空间都不足时不向上翻转（顶部空间优先兜底）', () => {
      stubViewport(800, 400);
      stubMenuSize(160, 200);
      const anchor = createAnchor('anchor-no-flip-both-tight');
      stubRect(anchor, { left: 100, top: 190, right: 180, bottom: 214, width: 80, height: 24 });

      showDropdownMenu(anchor, createItems(), vi.fn());

      // spaceBelow = 186 < 202（底部不足），top = 190 < 202（顶部不足）→ 不翻：214 + 2 = 216
      expect(getMenu().style.top).toBe('216px');
    });

    it('向上翻转时菜单顶部应为锚点上沿减间隙再减菜单高度', () => {
      stubViewport(800, 300);
      stubMenuSize(160, 100);
      const anchor = createAnchor('anchor-flip-above');
      stubRect(anchor, { left: 100, top: 250, right: 180, bottom: 274, width: 80, height: 24 });

      showDropdownMenu(anchor, createItems(), vi.fn());

      // spaceBelow = 26 < 102 且 top = 250 >= 102 → 翻转：250 - 2 - 100 = 148
      expect(getMenu().style.top).toBe('148px');
    });

    it('鼠标事件不再改写任何内联背景（外观完全由样式表承担）', () => {
      const anchor = createAnchor('anchor-hover-edge');
      showDropdownMenu(
        anchor,
        [
          { id: 'g', label: '分组', kind: 'group' },
          { id: 'off', label: '禁用', disabled: true },
          { id: 'ok', label: '可选' },
        ],
        vi.fn(),
      );
      const menu = getMenu();

      menu.dispatchEvent(new MouseEvent('mouseenter', { bubbles: false }));
      menu.dispatchEvent(new MouseEvent('mouseleave', { bubbles: false }));
      expect(menu.style.background).toBe('');

      for (const id of ['g', 'off', 'ok']) {
        const row = getRow(menu, id);
        row.dispatchEvent(new MouseEvent('mouseenter', { bubbles: false }));
        row.dispatchEvent(new MouseEvent('mouseleave', { bubbles: false }));
        expect(row.getAttribute('style')).toBeNull();
      }
    });
  });

  describe('防注入', () => {
    it('label 含 HTML 特殊字符时应按纯文本渲染，不产生真实元素', () => {
      const anchor = createAnchor('anchor-xss');
      const evil = '<img src=x onerror="alert(1)">';
      showDropdownMenu(anchor, [{ id: 'evil', label: evil }], vi.fn());

      const menu = getMenu();
      // 不产生真实 img 元素，也不把字符串写进 innerHTML
      expect(menu.querySelector('img')).toBeNull();
      expect(menu.querySelector('[onerror]')).toBeNull();
      expect(menu.innerHTML).not.toContain('<img');
      // 文本按原样呈现
      expect(menu.textContent).toContain(evil);
    });
  });
});
