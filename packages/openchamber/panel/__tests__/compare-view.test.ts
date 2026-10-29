/**
 * 分支比较视图单元测试
 * 覆盖：双栏 range 查询、提交渲染、空态、加载失败、
 * 提交详情与变更文件展示、分支选择器切换、Escape 关闭、单例
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { showCompareBranchesView } from '../components/compare-view';
import { setLocale } from '../i18n';
import type { CommitInfo, Branch, FileDiff } from '../state';
import type { ServiceClient } from '../service';

/** 等待异步链路完成 */
const flush = () => new Promise(resolve => setTimeout(resolve, 0));

/** 构造提交数据 */
function commit(hash: string, message: string): CommitInfo {
  return {
    hash,
    shortHash: hash.slice(0, 7),
    message,
    authorName: '测试作者',
    authorEmail: 'test@example.com',
    date: new Date().toISOString(),
    parents: [],
  } as unknown as CommitInfo;
}

/** 构造分支数据 */
function branch(name: string, isCurrent = false): Branch {
  return { name, isCurrent, isRemote: false } as unknown as Branch;
}

/** 构造变更文件数据 */
function fileDiff(path: string): FileDiff {
  return { path, additions: 3, deletions: 1, lines: [] };
}

describe('compare-view', () => {
  let disposed: (() => void) | null = null;

  beforeEach(() => {
    setLocale('zh-CN');
  });

  afterEach(() => {
    disposed?.();
    disposed = null;
    document.body.innerHTML = '';
    vi.restoreAllMocks();
  });

  it('应该按 right..left / left..right 两个 range 查询并渲染各自独有的提交', async () => {
    const getLog = vi.fn(async (_dir: string, range?: string) => {
      if (range === 'main..feature') return [commit('aaaaaaa1', 'feat: 分支独有')];
      if (range === 'feature..main') return [commit('bbbbbbb2', 'fix: 当前独有')];
      return [];
    });
    const service = { getLog } as unknown as ServiceClient;

    const handle = showCompareBranchesView(
      service, '/repo', [branch('feature'), branch('main', true)], 'feature', 'main');
    disposed = handle.dispose;
    await flush();

    expect(getLog.mock.calls.map(c => c[1])).toEqual(['main..feature', 'feature..main']);

    const root = document.getElementById('git-compare-branches')!;
    expect(root.querySelector('#compare-left-list')!.textContent).toContain('feat: 分支独有');
    expect(root.querySelector('#compare-right-list')!.textContent).toContain('fix: 当前独有');
    expect(root.querySelector('#compare-left-count')!.textContent).toBe('(1)');
    expect(root.querySelector('#compare-right-count')!.textContent).toBe('(1)');
  });

  it('点击提交应该在右侧展示详情与变更文件', async () => {
    const target = commit('aaaaaaa1', 'feat: 分支独有');
    const getCommitDetail = vi.fn(async () => target);
    const getCommitDiffs = vi.fn(async () => [fileDiff('src/a.ts'), fileDiff('README.md')]);
    const service = {
      getLog: vi.fn(async (_dir: string, range?: string) => (range === 'main..feature' ? [target] : [])),
      getCommitDetail,
      getCommitDiffs,
    } as unknown as ServiceClient;

    const handle = showCompareBranchesView(
      service, '/repo', [branch('feature'), branch('main', true)], 'feature', 'main');
    disposed = handle.dispose;
    await flush();

    (document.querySelector('#compare-left-list [data-hash]') as HTMLElement).click();
    await flush();

    expect(getCommitDetail).toHaveBeenCalledWith('/repo', 'aaaaaaa1');
    expect(getCommitDiffs).toHaveBeenCalledWith('/repo', 'aaaaaaa1');

    const detail = document.querySelector('#compare-detail')!;
    expect(detail.textContent).toContain('feat: 分支独有');
    expect(detail.textContent).toContain('aaaaaaa1');
    expect(detail.textContent).toContain('测试作者');
    // 变更文件与增删行数
    expect(detail.textContent).toContain('src/a.ts');
    expect(detail.textContent).toContain('README.md');
    expect(detail.textContent).toContain('+3');
    expect(detail.textContent).toContain('-1');
  });

  it('点击变更文件应该展开该文件的具体 diff 行', async () => {
    const target = commit('aaaaaaa1', 'feat: 带 diff');
    const withLines: FileDiff = {
      path: 'src/a.ts',
      additions: 1,
      deletions: 1,
      lines: [
        { type: 'context', content: 'const a = 1;', oldLine: 1, newLine: 1 },
        { type: 'delete', content: 'const b = 2;', oldLine: 2 },
        { type: 'add', content: 'const b = 3;', newLine: 2 },
      ],
    };
    const service = {
      getLog: vi.fn(async (_dir: string, range?: string) => (range === 'main..feature' ? [target] : [])),
      getCommitDetail: vi.fn(async () => target),
      getCommitDiffs: vi.fn(async () => [withLines]),
    } as unknown as ServiceClient;

    const handle = showCompareBranchesView(
      service, '/repo', [branch('feature'), branch('main', true)], 'feature', 'main');
    disposed = handle.dispose;
    await flush();

    (document.querySelector('#compare-left-list [data-hash]') as HTMLElement).click();
    await flush();

    // The diff area stays hidden (hidden attribute) until the file is clicked.
    const content = document.querySelector('#compare-detail [data-compare-diff="src/a.ts"]') as HTMLElement;
    expect(content.hidden).toBe(true);

    (document.querySelector('#compare-detail [data-compare-path="src/a.ts"]') as HTMLElement).click();

    expect(content.hidden).toBe(false);
    expect(content.textContent).toContain('const a = 1;');
    expect(content.textContent).toContain('const b = 2;');
    expect(content.textContent).toContain('const b = 3;');

    // 再次点击收起
    (document.querySelector('#compare-detail [data-compare-path="src/a.ts"]') as HTMLElement).click();
    expect(content.hidden).toBe(true);
  });

  it('提交详情加载失败时应该在右侧显示错误', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    const target = commit('aaaaaaa1', 'boom');
    const service = {
      getLog: vi.fn(async (_dir: string, range?: string) => (range === 'main..feature' ? [target] : [])),
      getCommitDetail: vi.fn(async () => { throw new Error('detail-fail'); }),
      getCommitDiffs: vi.fn(async () => []),
    } as unknown as ServiceClient;

    const handle = showCompareBranchesView(
      service, '/repo', [branch('feature'), branch('main', true)], 'feature', 'main');
    disposed = handle.dispose;
    await flush();

    (document.querySelector('#compare-left-list [data-hash]') as HTMLElement).click();
    await flush();

    expect(document.querySelector('#compare-detail')!.textContent).toContain('detail-fail');
  });

  it('侧边无提交时应该显示空态，两个分支相同时提示无差异', async () => {
    const service = { getLog: vi.fn(async () => []) } as unknown as ServiceClient;
    const handle = showCompareBranchesView(
      service, '/repo', [branch('a'), branch('b')], 'a', 'b');
    disposed = handle.dispose;
    await flush();

    const root = document.getElementById('git-compare-branches')!;
    expect(root.querySelector('#compare-left-list')!.textContent).toContain('无提交');
    expect(root.querySelector('#compare-right-count')!.textContent).toBe('(0)');
    expect(root.querySelector('#compare-summary')!.textContent).toContain('没有差异');
  });

  it('查询失败时应该就地显示错误且视图保持打开', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    const service = { getLog: vi.fn(async () => { throw new Error('boom'); }) } as unknown as ServiceClient;

    const handle = showCompareBranchesView(
      service, '/repo', [branch('a'), branch('b')], 'a', 'b');
    disposed = handle.dispose;
    await flush();

    const root = document.getElementById('git-compare-branches');
    expect(root).toBeTruthy();
    expect(root!.textContent).toContain('分支比较失败');
    expect(root!.textContent).toContain('boom');
  });

  it('切换分支选择器应该用新的分支重新比较', async () => {
    const getLog = vi.fn(async (_dir: string, _range?: string): Promise<CommitInfo[]> => []);
    const service = { getLog } as unknown as ServiceClient;
    const handle = showCompareBranchesView(
      service, '/repo', [branch('a'), branch('b'), branch('c')], 'a', 'b');
    disposed = handle.dispose;
    await flush();
    getLog.mockClear();

    // 打开左侧选择器并选中 c
    (document.querySelector('#compare-left-btn') as HTMLElement).click();
    const menuItem = Array.from(document.querySelectorAll('#git-dropdown-menu [data-kind="item"], #git-dropdown-menu div'))
      .find(el => el.textContent?.trim() === 'c') as HTMLElement;
    expect(menuItem, '下拉菜单中应能找到分支 c').toBeTruthy();
    menuItem.click();
    await flush();

    expect(getLog.mock.calls.map(c => c[1])).toEqual(['b..c', 'c..b']);
  });

  it('Escape 应该关闭视图', async () => {
    const service = { getLog: vi.fn(async () => []) } as unknown as ServiceClient;
    const handle = showCompareBranchesView(
      service, '/repo', [branch('a'), branch('b')], 'a', 'b');
    disposed = handle.dispose;
    await flush();

    expect(document.getElementById('git-compare-branches')).toBeTruthy();
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    expect(document.getElementById('git-compare-branches')).toBeNull();
  });

  it('重复打开应该只保留一个视图实例，dispose 幂等', async () => {
    const service = { getLog: vi.fn(async () => []) } as unknown as ServiceClient;

    const first = showCompareBranchesView(service, '/repo', [branch('a'), branch('b')], 'a', 'b');
    const second = showCompareBranchesView(service, '/repo', [branch('a'), branch('b')], 'b', 'a');
    disposed = second.dispose;
    first.dispose();
    await flush();

    expect(document.querySelectorAll('#git-compare-branches').length).toBe(1);
    expect(() => {
      second.dispose();
      second.dispose();
    }).not.toThrow();
  });
});
