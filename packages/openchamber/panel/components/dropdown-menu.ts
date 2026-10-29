/**
 * 工具栏通用下拉菜单组件
 * 供提交列表工具栏的 4 个过滤按钮（分支/用户/日期/路径）复用
 *
 * 定位、样式与关闭机制沿用 settings-menu：
 * - fixed 定位挂 body、深色主题（#2d2d2d）、小字号、圆角
 * - 点击外部关闭（延迟注册，避免打开菜单的那次点击立即关闭）
 * - 模块级单例引用，保证多实例互斥（新弹出时关闭已有菜单）
 * 在此之上补充：锚点 toggle（再次点击同一按钮关闭）、Escape 关闭、
 * 视口底部空间不足时向上翻转。
 */

/** 下拉菜单条目 */
export interface DropdownMenuItem {
  /** 选择回调携带的标识（分组标题/分隔线可为占位值） */
  id: string;
  /** 显示文案（渲染必须用 textContent，用户数据可能含 < 等字符，防注入） */
  label: string;
  /** item=可选项（默认）；group=分组标题（不可点）；separator=分隔线 */
  kind?: 'item' | 'group' | 'separator';
  /** 显示选中标记 ✓（当前生效值） */
  checked?: boolean;
  /** 置灰不可点 */
  disabled?: boolean;
}

/** 已打开的下拉菜单实例（携带清理所需的全部引用） */
interface DropdownMenuInstance {
  /** 菜单容器 */
  menu: HTMLElement;
  /** 触发菜单的锚点元素 */
  anchor: HTMLElement;
  /** 关闭状态标记（保证关闭函数幂等） */
  closed: boolean;
  /** 外部点击关闭监听延迟注册的计时器句柄 */
  outsideTimer: ReturnType<typeof setTimeout> | null;
  /** 点击菜单外部关闭的监听 */
  onOutsideClick: (ev: MouseEvent) => void;
  /** Escape 键关闭的监听 */
  onKeydown: (ev: KeyboardEvent) => void;
}

/** 菜单与锚点之间的垂直间隙（px） */
const ANCHOR_GAP = 2;

/** 视口边缘保留的最小边距（px） */
const VIEWPORT_MARGIN = 4;

/** 当前打开的下拉菜单（模块级单例：同一时刻只允许一个，保证互斥） */
let current: DropdownMenuInstance | null = null;

/**
 * 输出 [dropdown] 前缀的 JSON 调试日志
 * @param event 事件名（open/close/select）
 * @param detail 附加字段
 */
function logDropdown(event: string, detail: Record<string, unknown> = {}): void {
  console.debug('[dropdown]', JSON.stringify({ event, ...detail }));
}

/**
 * 关闭指定下拉菜单实例（幂等：重复调用无副作用）
 * @param instance 菜单实例
 * @param reason 关闭原因（写入调试日志：toggle/outside/escape/select/replace/api）
 */
function closeMenu(instance: DropdownMenuInstance, reason: string): void {
  if (instance.closed) return;
  instance.closed = true;

  if (instance.outsideTimer !== null) {
    clearTimeout(instance.outsideTimer);
    instance.outsideTimer = null;
  }
  document.removeEventListener('click', instance.onOutsideClick);
  document.removeEventListener('keydown', instance.onKeydown);
  instance.menu.remove();

  if (current === instance) current = null;
  logDropdown('close', { reason });
}

/**
 * 创建单个菜单行
 * @param item 菜单条目
 * @returns 行元素（separator 为横线、group 为弱化标题、item 为勾号槽+文案）
 */
function createRow(item: DropdownMenuItem): HTMLElement {
  const kind = item.kind ?? 'item';
  const row = document.createElement('div');
  row.dataset.kind = kind;
  row.dataset.id = item.id;

  // Separator: a hairline, unpadded row.
  if (kind === 'separator') {
    row.classList.add('gm-popup__sep');
    return row;
  }

  // Group label: muted, no cursor, no hover.
  if (kind === 'group') {
    row.classList.add('gm-popup__group');
    row.textContent = item.label;
    return row;
  }

  // Selectable row: check slot + label.
  row.classList.add('gm-menu-item');
  if (item.disabled) {
    row.dataset.disabled = 'true';
  } else {
    row.dataset.disabled = 'false';
  }

  const check = document.createElement('span');
  check.className = 'git-dropdown-check gm-menu-item__check';
  check.textContent = item.checked ? '✓' : '';

  // textContent 赋值保证 label 中的 HTML 字符不被解析（防注入）
  const label = document.createElement('span');
  label.textContent = item.label;

  row.appendChild(check);
  row.appendChild(label);
  return row;
}

/**
 * 计算菜单定位（锚点下方左对齐；视口底部空间不足时向上翻转）
 * 需先把菜单挂到文档中再调用，以便测量宽高
 * @param anchor 锚点元素
 * @param menu 菜单容器
 * @returns left/top 坐标与是否向上翻转
 */
function computePosition(
  anchor: HTMLElement,
  menu: HTMLElement,
): { left: number; top: number; flipped: boolean } {
  const rect = anchor.getBoundingClientRect();
  const width = menu.offsetWidth;
  const height = menu.offsetHeight;

  // 左对齐锚点；右侧越界时向左收进视口
  const left = Math.max(0, Math.min(rect.left, window.innerWidth - width - VIEWPORT_MARGIN));

  const spaceBelow = window.innerHeight - rect.bottom;
  const flipped = spaceBelow < height + ANCHOR_GAP && rect.top >= height + ANCHOR_GAP;
  const top = flipped
    ? rect.top - ANCHOR_GAP - height // 翻转到锚点上方
    : rect.bottom + ANCHOR_GAP; // 默认锚点下方

  return { left, top, flipped };
}

/**
 * 在锚点元素下方弹出下拉菜单
 * 关闭时机：选中 item 后、点击菜单外部、再次点击同一锚点（toggle）、
 * Escape 键、调用返回的关闭函数；新弹出菜单会先关闭已有菜单（互斥）
 * @param anchor 触发按钮（再次点击同一按钮 = 关闭，toggle 语义）
 * @param items 菜单条目列表
 * @param onSelect 选中 item 时回调（仅 kind='item' 且非 disabled 时触发，携带其 id）
 * @returns 关闭函数（幂等，重复调用无副作用）
 */
export function showDropdownMenu(
  anchor: HTMLElement,
  items: DropdownMenuItem[],
  onSelect: (id: string) => void,
): () => void {
  // toggle 语义：同一锚点重复调用 = 关闭当前菜单
  if (current && current.anchor === anchor) {
    const instance = current;
    closeMenu(instance, 'toggle');
    return () => closeMenu(instance, 'api');
  }

  // 多实例互斥：弹出新菜单前先关闭已有菜单
  if (current) closeMenu(current, 'replace');

  const menu = document.createElement('div');
  menu.id = 'git-dropdown-menu';
  menu.className = 'gm-popup';

  for (const item of items) {
    menu.appendChild(createRow(item));
  }

  document.body.appendChild(menu);

  // 先挂载再测量，计算锚点下方定位与向上翻转
  const pos = computePosition(anchor, menu);
  menu.style.left = `${pos.left}px`;
  menu.style.top = `${pos.top}px`;

  const instance: DropdownMenuInstance = {
    menu,
    anchor,
    closed: false,
    outsideTimer: null,
    onOutsideClick: () => {},
    onKeydown: () => {},
  };

  instance.onOutsideClick = (ev: MouseEvent): void => {
    if (!menu.isConnected) {
      // 菜单已被移除：仅自清理，避免残留监听误关新菜单
      document.removeEventListener('click', instance.onOutsideClick);
      return;
    }
    if (!menu.contains(ev.target as Node)) {
      closeMenu(instance, 'outside');
    }
  };

  instance.onKeydown = (ev: KeyboardEvent): void => {
    if (ev.key === 'Escape') closeMenu(instance, 'escape');
  };

  // 点击条目：事件委托（与 settings-menu 一致）
  menu.addEventListener('click', (ev) => {
    const target = (ev.target as HTMLElement).closest('div');
    if (!target || target.parentElement !== menu) return;
    if (target.dataset.kind !== 'item') return; // group/separator 不可点
    if (target.dataset.disabled === 'true') return; // 置灰项不可点

    const id = target.dataset.id ?? '';
    logDropdown('select', { id });
    onSelect(id);
    closeMenu(instance, 'select');
  });

  // Hover is a stylesheet state on .gm-menu-item; nothing to patch per row.

  // 点击菜单外部关闭；延迟注册避免打开菜单的那次点击立即关闭
  instance.outsideTimer = setTimeout(() => {
    instance.outsideTimer = null;
    document.addEventListener('click', instance.onOutsideClick);
  }, 0);

  // Escape 关闭（keydown 不会被打开菜单的 click 触发，可同步注册）
  document.addEventListener('keydown', instance.onKeydown);

  current = instance;
  logDropdown('open', { anchor: anchor.id || anchor.tagName, count: items.length });

  return () => closeMenu(instance, 'api');
}
