/**
 * 分支删除通知卡片单元测试
 * 覆盖渲染与动作链接、成功/失败交互、10 秒过期与悬停暂停、同刻单条、幂等关闭
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { showBranchDeletedNotify } from '../components/notify';
import { host } from '../host';
import { setLocale } from '../i18n';

// 宿主模块打桩：避免真实 connectHost 握手，并在用例中断言 toast 调用
vi.mock('../host', () => ({
  host: { toast: vi.fn().mockResolvedValue(undefined) },
}));

/** 通知卡片 id */
const NOTIFY_ID = 'git-branch-deleted-notify';

/** 取当前通知卡片（不存在则断言失败） */
function getCard(): HTMLElement {
  const card = document.getElementById(NOTIFY_ID);
  expect(card).toBeTruthy();
  return card as HTMLElement;
}

/**
 * 按文案取动作链接
 * @param label 链接文案
 * @returns 链接元素，找不到返回 undefined
 */
function findLink(label: string): HTMLElement | undefined {
  return Array.from(document.querySelectorAll(`#${NOTIFY_ID} a`))
    .find(el => el.textContent === label) as HTMLElement | undefined;
}

/**
 * 冲刷微任务队列，等待动作回调完成
 * @param rounds 冲刷轮数
 */
async function flush(rounds = 10): Promise<void> {
  for (let i = 0; i < rounds; i++) {
    await Promise.resolve();
  }
}

describe('notify', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    setLocale('zh-CN');
    document.body.innerHTML = '';
    // 每例重置 toast mock 实现：防止 restoreAllMocks 清空后返回值不再是 Promise 而断链
    vi.mocked(host.toast).mockReset();
    vi.mocked(host.toast).mockResolvedValue(undefined);
    vi.spyOn(console, 'debug').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    // 触发残留通知的过期关闭，清理计时器
    vi.runAllTimers();
    vi.useRealTimers();
    document.body.innerHTML = '';
    vi.restoreAllMocks();
  });

  describe('渲染', () => {
    it('应渲染通知正文（含分支名），两条动作都提供时显示还原与删除跟踪链接', () => {
      showBranchDeletedNotify({
        branchName: 'dev',
        onRestore: vi.fn(async () => {}),
        onDeleteTracking: vi.fn(async () => {}),
      });

      const card = getCard();
      expect(card.textContent).toContain('已删除的分支: dev');
      expect(findLink('还原')).toBeTruthy();
      expect(findLink('删除跟踪的分支')).toBeTruthy();
      // Positioning and colours come from .gm-notify in styles.css.
      expect(card.classList.contains('gm-notify')).toBe(true);
      expect(card.getAttribute('style')).toBeNull();
    });

    it('仅提供 onRestore 时只显示还原链接，不显示删除跟踪链接', () => {
      showBranchDeletedNotify({ branchName: 'dev', onRestore: vi.fn(async () => {}) });

      expect(findLink('还原')).toBeTruthy();
      expect(findLink('删除跟踪的分支')).toBeUndefined();
    });

    it('不提供任何动作时应仅渲染正文且无动作链接', () => {
      showBranchDeletedNotify({ branchName: 'dev' });

      const card = getCard();
      expect(card.textContent).toContain('已删除的分支: dev');
      expect(card.querySelectorAll('a')).toHaveLength(0);
    });
  });

  describe('还原动作', () => {
    it('点击还原应调用 onRestore 一次，resolve 后卡片移除', async () => {
      const onRestore = vi.fn(async () => {});
      showBranchDeletedNotify({ branchName: 'dev', onRestore });

      findLink('还原')!.click();
      await flush();

      expect(onRestore).toHaveBeenCalledTimes(1);
      expect(document.getElementById(NOTIFY_ID)).toBeNull();
    });

    it('onRestore reject 时卡片应保留、toast error（restoreFailed 前缀）且链接恢复可点可重试', async () => {
      const onRestore = vi.fn()
        .mockRejectedValueOnce(new Error('还原服务不可用'))
        .mockResolvedValueOnce(undefined);
      showBranchDeletedNotify({ branchName: 'dev', onRestore });

      const link = findLink('还原')!;
      link.click();
      await flush();

      expect(onRestore).toHaveBeenCalledTimes(1);
      expect(host.toast).toHaveBeenCalledTimes(1);
      const request = vi.mocked(host.toast).mock.calls[0][0];
      expect(request.kind).toBe('error');
      expect(String(request.message)).toContain('还原分支失败');
      expect(String(request.message)).toContain('还原服务不可用');
      // 失败不 expire（对齐 IDEA）：卡片保留
      expect(document.getElementById(NOTIFY_ID)).toBeTruthy();

      // 链接恢复可点：再次点击可重试，resolve 后正常关闭
      link.click();
      await flush();
      expect(onRestore).toHaveBeenCalledTimes(2);
      expect(document.getElementById(NOTIFY_ID)).toBeNull();
    });
  });

  describe('删除跟踪动作', () => {
    it('点击删除跟踪的分支应调用 onDeleteTracking，resolve 后卡片移除', async () => {
      const onDeleteTracking = vi.fn(async () => {});
      showBranchDeletedNotify({ branchName: 'dev', onDeleteTracking });

      findLink('删除跟踪的分支')!.click();
      await flush();

      expect(onDeleteTracking).toHaveBeenCalledTimes(1);
      expect(document.getElementById(NOTIFY_ID)).toBeNull();
    });

    it('onDeleteTracking reject 时应 toast error（deleteTrackingFailed 前缀）且卡片保留', async () => {
      const onDeleteTracking = vi.fn().mockRejectedValueOnce(new Error('远程删除失败'));
      showBranchDeletedNotify({ branchName: 'dev', onDeleteTracking });

      findLink('删除跟踪的分支')!.click();
      await flush();

      expect(host.toast).toHaveBeenCalledTimes(1);
      const request = vi.mocked(host.toast).mock.calls[0][0];
      expect(request.kind).toBe('error');
      expect(String(request.message)).toContain('删除跟踪的分支失败');
      expect(document.getElementById(NOTIFY_ID)).toBeTruthy();
    });
  });

  describe('自动过期与悬停暂停', () => {
    it('10 秒无操作应自动过期关闭', () => {
      showBranchDeletedNotify({ branchName: 'dev' });
      expect(document.getElementById(NOTIFY_ID)).toBeTruthy();

      vi.advanceTimersByTime(9999);
      expect(document.getElementById(NOTIFY_ID)).toBeTruthy();

      vi.advanceTimersByTime(1);
      expect(document.getElementById(NOTIFY_ID)).toBeNull();
    });

    it('悬停暂停过期计时，移出后恢复计时', () => {
      showBranchDeletedNotify({ branchName: 'dev' });
      const card = getCard();

      vi.advanceTimersByTime(5000);
      card.dispatchEvent(new MouseEvent('mouseenter')); // 悬停暂停
      vi.advanceTimersByTime(20000);
      // 暂停期间推进计时不移除
      expect(document.getElementById(NOTIFY_ID)).toBeTruthy();

      card.dispatchEvent(new MouseEvent('mouseleave')); // 移出恢复
      vi.advanceTimersByTime(10000);
      expect(document.getElementById(NOTIFY_ID)).toBeNull();
    });
  });

  describe('同刻单条与幂等关闭', () => {
    it('连续 show 两次应仅保留最新卡片（旧卡片先关闭）', () => {
      showBranchDeletedNotify({ branchName: 'first', onRestore: vi.fn(async () => {}) });
      showBranchDeletedNotify({ branchName: 'second' });

      const cards = document.querySelectorAll(`#${NOTIFY_ID}`);
      expect(cards).toHaveLength(1);
      expect(cards[0].textContent).toContain('已删除的分支: second');
      expect(cards[0].textContent).not.toContain('first');
    });

    it('关闭应幂等：过期后再推进计时与重复派发悬停事件都不报错', () => {
      showBranchDeletedNotify({ branchName: 'dev' });
      const card = getCard();

      vi.advanceTimersByTime(10000); // 过期关闭
      expect(document.getElementById(NOTIFY_ID)).toBeNull();

      expect(() => {
        vi.advanceTimersByTime(10000); // 计时器已清理，不应再次触发
        card.dispatchEvent(new MouseEvent('mouseenter'));
        card.dispatchEvent(new MouseEvent('mouseleave'));
      }).not.toThrow();
      expect(document.getElementById(NOTIFY_ID)).toBeNull();
    });
  });

  describe('结构化日志', () => {
    it('展示与过期应输出 [notify] JSON 日志', () => {
      const debugSpy = vi.mocked(console.debug);

      showBranchDeletedNotify({ branchName: 'dev', onRestore: vi.fn(async () => {}) });
      vi.advanceTimersByTime(10000);

      const payloads = debugSpy.mock.calls
        .map(c => String(c[0]))
        .filter(l => l.startsWith('{'))
        .map(l => JSON.parse(l) as Record<string, unknown>);
      expect(payloads.find(p => p.event === 'branch_notify_show'))
        .toMatchObject({ prefix: '[notify]', branch: 'dev' });
      expect(payloads.find(p => p.event === 'branch_notify_expire'))
        .toMatchObject({ prefix: '[notify]', branch: 'dev' });
    });

    it('动作失败应输出 [notify] JSON 错误日志', async () => {
      const errorSpy = vi.mocked(console.error);
      const onRestore = vi.fn().mockRejectedValueOnce(new Error('还原失败'));

      showBranchDeletedNotify({ branchName: 'dev', onRestore });
      findLink('还原')!.click();
      await flush();

      const payload = errorSpy.mock.calls
        .map(c => String(c[0]))
        .filter(l => l.startsWith('{'))
        .map(l => JSON.parse(l) as Record<string, unknown>)
        .find(p => p.event === 'branch_notify_action_error');
      expect(payload).toMatchObject({ prefix: '[notify]', action: 'restore', branch: 'dev' });
      expect(String(payload!.error)).toContain('还原失败');
    });
  });
});
