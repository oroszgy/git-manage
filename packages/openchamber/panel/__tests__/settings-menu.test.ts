/**
 * 显示设置菜单单元测试
 * 覆盖菜单渲染、开关切换与勾号同步、外部点击关闭、重复打开唯一性
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { showSettingsMenu, hideSettingsMenu } from '../components/settings-menu';
import { setState, createInitialState, getState } from '../state';
import { setLocale } from '../i18n';

/**
 * 构造打开菜单用的鼠标事件
 * @returns 带坐标的 click 事件
 */
function createClickEvent(): MouseEvent {
  return new MouseEvent('click', { bubbles: true, clientX: 20, clientY: 30 });
}

/**
 * 获取设置菜单元素
 * @returns 菜单元素
 */
function getMenu(): HTMLElement {
  const menu = document.getElementById('git-settings-menu');
  expect(menu).toBeTruthy();
  return menu as HTMLElement;
}

/**
 * 按 data-key 查找开关项
 * @param key displaySettings 字段键
 * @returns 开关项元素
 */
function getItem(key: string): HTMLElement {
  const item = getMenu().querySelector<HTMLElement>(`[data-key="${key}"]`);
  expect(item).toBeTruthy();
  return item as HTMLElement;
}

/**
 * 读取开关项的勾号文本
 * @param key displaySettings 字段键
 * @returns 勾号文本（选中为 ✓，未选中为空串）
 */
function getCheck(key: string): string {
  const check = getItem(key).querySelector<HTMLElement>('.git-settings-check');
  expect(check).toBeTruthy();
  return check!.textContent ?? '';
}

describe('settings-menu', () => {
  beforeEach(() => {
    // 使用假计时器接管 show 结束时注册的 setTimeout(0)
    vi.useFakeTimers();
    setLocale('zh-CN');
    setState(s => Object.assign(s, createInitialState()));
    document.body.innerHTML = '';
  });

  afterEach(() => {
    hideSettingsMenu();
    // 执行排队的 setTimeout(0)，让全局 click 关闭监听注册后自清理
    vi.runAllTimers();
    document.body.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    vi.useRealTimers();
    document.body.innerHTML = '';
    vi.restoreAllMocks();
  });

  describe('showSettingsMenu 渲染', () => {
    it('打开后应在指针位置渲染菜单、中文标题与平铺开关项', () => {
      showSettingsMenu(createClickEvent());

      const menu = getMenu();
      expect(menu.classList.contains('gm-popup')).toBe(true);
      // The menu opens at the pointer: coordinates stay inline, appearance does not.
      expect(menu.style.left).toBe('20px');
      expect(menu.style.top).toBe('30px');
      expect(menu.textContent).toContain('显示设置');

      // 平铺列表：前 3 项为列开关，其后为显示项；顺序对齐 IDEA
      const items = Array.from(menu.querySelectorAll('[data-key]'));
      expect(items.map(el => el.textContent)).toEqual([
        '✓显示作者列',
        '✓显示日期列',
        '✓显示哈希列',
        '✓标签名称',
        '紧凑引用视图',
        '✓长边',
        '提交时间戳',
        '引用显示在左侧',
      ]);
    });

    it('重复打开应只保留一个菜单', () => {
      showSettingsMenu(createClickEvent());
      showSettingsMenu(createClickEvent());

      expect(document.querySelectorAll('#git-settings-menu')).toHaveLength(1);
    });

    it('hideSettingsMenu 应移除菜单且无菜单时不报错', () => {
      expect(() => hideSettingsMenu()).not.toThrow();

      showSettingsMenu(createClickEvent());
      hideSettingsMenu();

      expect(document.getElementById('git-settings-menu')).toBeNull();
    });

    it('菜单容器只用样式表类，内联仅保留指针坐标', () => {
      showSettingsMenu(createClickEvent());

      const menu = getMenu();
      expect(menu.className).toContain('gm-popup');
      expect(menu.style.left).toBe('20px');
      expect(menu.style.top).toBe('30px');
      expect(menu.style.background).toBe('');
      expect(menu.style.border).toBe('');
      expect(menu.style.padding).toBe('');
    });

    it('标题与分隔线由 gm-popup__group 与 gm-popup__sep 承担外观', () => {
      showSettingsMenu(createClickEvent());

      const menu = getMenu();
      const title = menu.firstElementChild as HTMLElement;
      expect(title.classList.contains('gm-popup__group')).toBe(true);
      expect(title.getAttribute('style')).toBeNull();

      const separator = title.nextElementSibling as HTMLElement;
      expect(separator.classList.contains('gm-popup__sep')).toBe(true);
      expect(separator.getAttribute('style')).toBeNull();
    });

    it('开关项与勾号只用类表达布局与颜色', () => {
      showSettingsMenu(createClickEvent());

      const item = getItem('showAuthor');
      expect(item.classList.contains('gm-menu-item')).toBe(true);
      expect(item.getAttribute('style')).toBeNull();

      const check = item.querySelector<HTMLElement>('.git-settings-check');
      expect(check).toBeTruthy();
      expect(check!.classList.contains('gm-menu-item__check')).toBe(true);
      expect(check!.getAttribute('style')).toBeNull();
    });
  });

  describe('开关切换', () => {
    it('点击开关项应切换对应 displaySettings 并刷新勾号，菜单保持打开', () => {
      showSettingsMenu(createClickEvent());
      // 注册外部关闭监听，确保菜单内点击不会被误判为外部点击
      vi.runAllTimers();

      // 关闭 showAuthor
      getItem('showAuthor').click();
      expect(getState().displaySettings.showAuthor).toBe(false);
      expect(getCheck('showAuthor')).toBe('');
      expect(document.getElementById('git-settings-menu')).toBeTruthy();

      // 菜单保持打开，可再次切换回来
      getItem('showAuthor').click();
      expect(getState().displaySettings.showAuthor).toBe(true);
      expect(getCheck('showAuthor')).toBe('✓');

      // 切换另一项不影响其余项
      getItem('showHash').click();
      expect(getState().displaySettings.showHash).toBe(false);
      expect(getState().displaySettings.showDate).toBe(true);
      expect(getCheck('showHash')).toBe('');
      expect(document.getElementById('git-settings-menu')).toBeTruthy();
    });

    it('点击标题或分隔线不应改变任何开关状态', () => {
      showSettingsMenu(createClickEvent());
      const menu = getMenu();

      const title = menu.firstElementChild as HTMLElement;
      expect(title.textContent).toBe('显示设置');
      title.click();

      const separator = title.nextElementSibling as HTMLElement;
      expect(separator.classList.contains('gm-popup__sep')).toBe(true);
      separator.click();

      expect(getState().displaySettings).toEqual({
        showAuthor: true,
        showDate: true,
        showHash: true,
        showLongEdges: true,
        showTagNames: true,
        compactReferences: false,
        preferCommitDate: false,
        referencesOnLeft: false,
      });
    });

    it('菜单缺少开关项时同步勾号不应抛错', () => {
      // 让 querySelector 对 showDate 项返回 null，模拟菜单缺项
      const original = Element.prototype.querySelector;
      const spy = vi.spyOn(Element.prototype, 'querySelector').mockImplementation(function (
        this: Element,
        sel: string,
      ): Element | null {
        if (sel === '[data-key="showDate"]') return null;
        return original.call(this, sel) as Element | null;
      });

      try {
        expect(() => showSettingsMenu(createClickEvent())).not.toThrow();
        // 自验证 mock 生效：缺项查询确实返回 null
        expect(
          Element.prototype.querySelector.call(getMenu(), '[data-key="showDate"]'),
        ).toBeNull();
      } finally {
        spy.mockRestore();
      }

      expect(document.getElementById('git-settings-menu')).toBeTruthy();
    });
  });

  describe('悬停高亮', () => {
    it('鼠标事件不再改写内联背景（:hover 由样式表承担）', () => {
      showSettingsMenu(createClickEvent());

      const item = getItem('showAuthor');
      item.dispatchEvent(new MouseEvent('mouseenter', { bubbles: false }));
      expect(item.getAttribute('style')).toBeNull();
      item.dispatchEvent(new MouseEvent('mouseleave', { bubbles: false }));
      expect(item.getAttribute('style')).toBeNull();

      const title = getMenu().firstElementChild as HTMLElement;
      title.dispatchEvent(new MouseEvent('mouseenter', { bubbles: false }));
      title.dispatchEvent(new MouseEvent('mouseleave', { bubbles: false }));
      expect(title.getAttribute('style')).toBeNull();
    });
  });

  describe('嵌套子元素事件委托守卫', () => {
    /**
     * 向指定开关项内插入一个带 data-key 的嵌套 div
     * 用于验证委托处理器的 parentElement === menu 守卫：
     * 嵌套元素自身带 key，但不是菜单的直接子项
     * @param key 所属开关项的 data-key
     * @returns 嵌套 div 元素
     */
    function insertNestedChild(key: string): HTMLElement {
      const nested = document.createElement('div');
      nested.dataset.key = key;
      nested.textContent = '嵌套子元素';
      getItem(key).appendChild(nested);
      return nested;
    }

    it('鼠标移入或移出带 data-key 的嵌套子元素均不应触发高亮', () => {
      showSettingsMenu(createClickEvent());
      const nested = insertNestedChild('showAuthor');
      const item = getItem('showAuthor');

      nested.dispatchEvent(new MouseEvent('mouseenter', { bubbles: false }));
      expect(nested.getAttribute('style')).toBeNull();
      expect(item.getAttribute('style')).toBeNull();

      nested.dispatchEvent(new MouseEvent('mouseleave', { bubbles: false }));
      expect(nested.getAttribute('style')).toBeNull();
      expect(item.getAttribute('style')).toBeNull();
    });

    it('点击带 data-key 的嵌套子元素不应切换开关状态', () => {
      showSettingsMenu(createClickEvent());
      const nested = insertNestedChild('showAuthor');

      nested.click();

      // 状态保持不变、勾号仍为选中、菜单不因该点击关闭
      expect(getState().displaySettings.showAuthor).toBe(true);
      expect(getCheck('showAuthor')).toBe('✓');
      expect(document.getElementById('git-settings-menu')).toBeTruthy();
    });
  });

  describe('关闭行为', () => {
    it('点击菜单外部应关闭菜单', () => {
      showSettingsMenu(createClickEvent());
      // 触发 setTimeout(0) 注册全局 click 关闭监听
      vi.runAllTimers();
      expect(document.getElementById('git-settings-menu')).toBeTruthy();

      document.body.dispatchEvent(new MouseEvent('click', { bubbles: true }));

      expect(document.getElementById('git-settings-menu')).toBeNull();
    });

    it('旧菜单关闭监听残留时，点击新菜单内部不应被误关', () => {
      // 第一次打开后不冲刷计时器，其延迟注册的监听在第二次打开后仍会触发
      showSettingsMenu(createClickEvent());
      showSettingsMenu(createClickEvent());
      vi.runAllTimers();

      getItem('showDate').click();

      expect(document.getElementById('git-settings-menu')).toBeTruthy();
      expect(getState().displaySettings.showDate).toBe(false);

      // 外部点击仍能关闭新菜单
      document.body.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      expect(document.getElementById('git-settings-menu')).toBeNull();
    });

    it('hideSettingsMenu 应以 click 事件名移除外部点击监听', () => {
      showSettingsMenu(createClickEvent());
      // 冲刷延迟注册，让全局 click 监听真正挂到 document 上
      vi.runAllTimers();

      const spy = vi.spyOn(document, 'removeEventListener');
      hideSettingsMenu();

      expect(spy).toHaveBeenCalledWith('click', expect.any(Function));
    });

    it('无外部监听时 hideSettingsMenu 不应调用 removeEventListener', () => {
      // 先确保 closeHandler 为空
      hideSettingsMenu();

      const spy = vi.spyOn(document, 'removeEventListener');
      hideSettingsMenu();

      expect(spy).not.toHaveBeenCalled();
    });

    it('旧菜单残留监听自清理时应移除 click 监听', () => {
      // 打开后先隐藏菜单，再冲刷计时器：监听被注册但菜单已断开
      showSettingsMenu(createClickEvent());
      hideSettingsMenu();
      vi.runAllTimers();

      const spy = vi.spyOn(document, 'removeEventListener');
      document.body.dispatchEvent(new MouseEvent('click', { bubbles: true }));

      expect(spy).toHaveBeenCalledWith('click', expect.any(Function));
    });
  });
});
