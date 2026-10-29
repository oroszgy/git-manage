/**
 * commit-detail 组件单元测试
 * 覆盖：commitDetail 为空的空态、字段渲染（hash/作者/日期/信息）、状态更新与 dispose 行为
 */
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { createCommitDetailPanel } from '../components/commit-detail';
import { setState, createInitialState, stateManager } from '../state';
import type { CommitInfo } from '../state';
import type { ServiceClient } from '../service';

/** 已创建组件的清理列表（afterEach 依次 dispose） */
let disposers: Array<() => void> = [];

/**
 * 构造 service 占位 mock
 * commit-detail 源码中 service 参数未被实际调用
 */
function createServiceMock(): ServiceClient {
  return {} as unknown as ServiceClient;
}

/** 创建面板并登记清理 */
function createPanel(): { container: HTMLElement; dispose: () => void } {
  const container = document.createElement('div');
  document.body.appendChild(container);
  const panel = createCommitDetailPanel(container, createServiceMock(), '/repo');
  disposers.push(panel.dispose);
  return { container, dispose: panel.dispose };
}

/** 获取内容区（container 第二个子元素，第一个是标题） */
function getContent(container: HTMLElement): HTMLElement {
  return container.children[1] as HTMLElement;
}

/** 获取状态管理器内部的监听器集合（用于断言订阅是否被解除） */
function getListenerSet(): Set<unknown> {
  return (stateManager as unknown as { listeners: Set<unknown> }).listeners;
}

/** 提交详情固定样例 */
const sampleCommit: CommitInfo = {
  hash: 'abc123def456',
  shortHash: 'abc1234',
  message: 'feat: 新增分支重命名功能',
  authorName: '张三',
  authorEmail: 'zhangsan@example.com',
  date: '2026-05-20T08:30:00.000Z',
  parents: ['parent1'],
};

/** 另一条提交样例（用于验证重新渲染） */
const otherCommit: CommitInfo = {
  hash: 'fff789012345',
  shortHash: 'fff7890',
  message: 'fix: 修复日期过滤问题',
  authorName: '李四',
  authorEmail: 'lisi@example.com',
  date: '2026-06-01T12:00:00.000Z',
  parents: [],
};

describe('commit-detail', () => {
  beforeEach(() => {
    // 重置全局状态
    setState(s => Object.assign(s, createInitialState()));
  });

  afterEach(() => {
    // 清理组件订阅与残留 DOM
    for (const dispose of disposers) dispose();
    disposers = [];
    document.body.innerHTML = '';
  });

  describe('空态', () => {
    it('commitDetail 为 null 时应该显示标题与空态提示', () => {
      const { container } = createPanel();
      const text = container.textContent ?? '';

      expect(text).toContain('提交详情');
      expect(text).toContain('选择要查看更改的提交');
      expect(text).not.toContain(sampleCommit.hash);
    });
  });

  describe('字段渲染', () => {
    it('setState 写入 commitDetail 后应该渲染 hash、作者、日期与提交信息', () => {
      const { container } = createPanel();

      setState(s => {
        s.commitDetail = sampleCommit;
      });

      const text = container.textContent ?? '';

      // 标题保留
      expect(text).toContain('提交详情');
      // 字段标签
      expect(text).toContain('提交');
      expect(text).toContain('作者');
      expect(text).toContain('日期');
      // 字段值
      expect(text).toContain(sampleCommit.hash);
      // 已修复：html() 仅将 < 开头的字符串当原始 HTML，
      // `张三 <zhangsan@example.com>` 整体被转义，完整显示（含邮箱）
      expect(text).toContain(`${sampleCommit.authorName} <${sampleCommit.authorEmail}>`);
      expect(text).toContain(new Date(sampleCommit.date).toLocaleString('zh-CN'));
      expect(text).toContain(sampleCommit.message);
      // 空态提示消失
      expect(text).not.toContain('选择要查看更改的提交');
    });

    it('commitDetail 更新后应该渲染新的提交内容', () => {
      const { container } = createPanel();

      setState(s => {
        s.commitDetail = sampleCommit;
      });
      expect(container.textContent).toContain(sampleCommit.hash);

      setState(s => {
        s.commitDetail = otherCommit;
      });

      const text = container.textContent ?? '';
      expect(text).toContain(otherCommit.hash);
      expect(text).toContain(otherCommit.message);
      // 已修复：作者字段完整渲染为 `李四 <lisi@example.com>`
      expect(text).toContain(`${otherCommit.authorName} <${otherCommit.authorEmail}>`);
      expect(text).not.toContain(sampleCommit.hash);
    });

    it('commitDetail 置回 null 后应该恢复空态', () => {
      const { container } = createPanel();

      setState(s => {
        s.commitDetail = sampleCommit;
      });
      expect(container.textContent).not.toContain('选择要查看更改的提交');

      setState(s => {
        s.commitDetail = null;
      });

      const text = container.textContent ?? '';
      expect(text).toContain('选择要查看更改的提交');
      expect(text).not.toContain(sampleCommit.hash);
    });
  });

  describe('dispose', () => {
    it('dispose 后应该不再响应 commitDetail 变化', () => {
      const { container, dispose } = createPanel();
      setState(s => {
        s.commitDetail = sampleCommit;
      });
      expect(container.textContent).toContain(sampleCommit.hash);

      dispose();
      setState(s => {
        s.commitDetail = otherCommit;
      });

      // 订阅已取消：DOM 保持 dispose 前的内容
      expect(container.textContent).toContain(sampleCommit.hash);
      expect(container.textContent).not.toContain(otherCommit.hash);
    });

    it('dispose 后应解除状态订阅，避免监听器泄漏', () => {
      const listeners = getListenerSet();
      const base = listeners.size;

      const { dispose } = createPanel();
      expect(listeners.size).toBe(base + 1);

      dispose();
      expect(listeners.size).toBe(base);
    });
  });

  describe('订阅重建', () => {
    it('commitDetail 更新触发重渲染后应只保留一个状态订阅', () => {
      const listeners = getListenerSet();
      const base = listeners.size;

      const { container } = createPanel();
      expect(listeners.size).toBe(base + 1);

      setState(s => {
        s.commitDetail = sampleCommit;
      });

      expect(container.textContent).toContain(sampleCommit.hash);
      // 重渲染时应先退订旧订阅再订阅新的，监听器数量不叠加
      expect(listeners.size).toBe(base + 1);
    });
  });

  describe('渲染结构清理', () => {
    it('渲染面板时应先清空容器再插入标题与内容区', () => {
      const { container } = createPanel();

      // 清空后再插入：只应有标题、内容区两个节点，不应残留占位文本节点
      expect(container.childNodes.length).toBe(2);
      expect(container.firstChild).toBe(container.children[0]);
    });

    it('渲染提交详情时应先清空内容区再插入字段与提交信息', () => {
      const { container } = createPanel();
      setState(s => {
        s.commitDetail = sampleCommit;
      });

      const content = getContent(container);
      // 三个字段块 + 一个提交信息块
      expect(content.childNodes.length).toBe(4);
      expect(content.firstChild).toBe(content.children[0]);
    });
  });

  describe('字段标签与样式', () => {
    it('字段标签应精确渲染且仅提交 hash 使用等宽字体', () => {
      const { container } = createPanel();
      setState(s => {
        s.commitDetail = sampleCommit;
      });

      const content = getContent(container);
      const [hashField, authorField, dateField] = Array.from(content.children) as HTMLElement[];

      // 标题里也含“提交”字样，必须按字段块精确断言
      expect(hashField.children[0].textContent).toBe('哈希');
      expect(authorField.children[0].textContent).toBe('作者');
      expect(dateField.children[0].textContent).toBe('日期');

      // Only the hash field is monospace; styling comes from classes now.
      expect(hashField.children[1].classList.contains('gm-mono')).toBe(true);
      expect(hashField.children[1].textContent).toContain(sampleCommit.hash);

      expect(authorField.children[1].classList.contains('gm-mono')).toBe(false);
      expect(dateField.children[1].classList.contains('gm-mono')).toBe(false);
      expect(authorField.children[1].getAttribute('style')).toBeNull();
      expect(dateField.children[1].getAttribute('style')).toBeNull();
    });
  });
});
