/**
 * 提交图线组件
 * 可视化分支合并图
 */

import { CommitInfo } from '../state';

/**
 * Lane colours.
 * Theme tokens rather than literals: SVG presentation attributes cannot take
 * `var()`, so the emitters below use a `style` attribute instead.
 */
const BRANCH_COLORS = [
  'var(--oc-primary)',
  'var(--oc-muted)',
  'var(--oc-info)',
  'var(--oc-warning)',
  'var(--oc-success)',
  'var(--oc-info)',
];

/** 图线列信息 */
export interface GraphColumn {
  hash: string;
  column: number;
  color: string;
}

/** 计算图线布局，返回每行的列信息 */
export function calculateGraphRows(commits: CommitInfo[]): GraphColumn[][] {
  const rows: GraphColumn[][] = [];
  const columnMap = new Map<string, number>(); // hash -> column
  let nextColumn = 0;

  // 建立 hash 到 commit 的映射
  const commitMap = new Map<string, CommitInfo>();
  for (const commit of commits) {
    commitMap.set(commit.hash, commit);
  }

  for (const commit of commits) {
    let column: number;

    // 如果已经有列分配，使用它
    if (columnMap.has(commit.hash)) {
      column = columnMap.get(commit.hash)!;
    } else {
      column = nextColumn++;
      columnMap.set(commit.hash, column);
    }

    // 当前行的列信息
    const rowColumns: GraphColumn[] = [];

    // 为父提交分配列
    for (let i = 0; i < commit.parents.length; i++) {
      const parentHash = commit.parents[i];
      if (!columnMap.has(parentHash)) {
        if (i === 0) {
          columnMap.set(parentHash, column);
        } else {
          columnMap.set(parentHash, nextColumn++);
        }
      }
    }

    // 收集当前活跃的列
    const activeColumns = new Set<number>();
    for (const c of columnMap.values()) {
      activeColumns.add(c);
    }

    // 为每个活跃列创建信息
    for (const col of activeColumns) {
      // 找到这个列对应的 hash
      let hash = '';
      for (const [h, c] of columnMap.entries()) {
        if (c === col) {
          hash = h;
          break;
        }
      }
      const color = BRANCH_COLORS[col % BRANCH_COLORS.length];
      rowColumns.push({ hash, column: col, color });
    }

    rows.push(rowColumns);
  }

  return rows;
}

/** 生成单行的图线 SVG */
export function generateRowGraphSVG(
  commit: CommitInfo,
  rowColumns: GraphColumn[],
  nextRowColumns: GraphColumn[] | undefined,
  // columnIndex 属于调用契约占位参数（当前按 rowColumns 定位节点，未消费该列号）
  _columnIndex: number
): string {
  const WIDTH = 80;
  const HEIGHT = 24;
  const COL_WIDTH = 16;
  const PADDING = 8;

  // 找到当前提交的列
  const nodeCol = rowColumns.find(c => c.hash === commit.hash);
  const nodeX = PADDING + (nodeCol ? nodeCol.column : 0) * COL_WIDTH;
  const nodeColor = nodeCol ? nodeCol.color : BRANCH_COLORS[0];

  let svg = `<svg width="${WIDTH}" height="${HEIGHT}" xmlns="http://www.w3.org/2000/svg">`;

  // 绘制垂直线（从当前行到下一行）
  if (nextRowColumns) {
    for (const col of rowColumns) {
      const x = PADDING + col.column * COL_WIDTH;
      // 找到下一行中对应的列
      const nextCol = nextRowColumns.find(c => c.column === col.column);
      if (nextCol) {
        svg += `<line x1="${x}" y1="0" x2="${x}" y2="${HEIGHT}" style="stroke: ${col.color}" stroke-width="2"/>`;
      } else {
        // 列在下一行结束
        svg += `<line x1="${x}" y1="0" x2="${x}" y2="${HEIGHT / 2}" style="stroke: ${col.color}" stroke-width="2"/>`;
      }
    }

    // 绘制新开始的列
    for (const col of nextRowColumns) {
      if (!rowColumns.find(c => c.column === col.column)) {
        const x = PADDING + col.column * COL_WIDTH;
        svg += `<line x1="${x}" y1="${HEIGHT / 2}" x2="${x}" y2="${HEIGHT}" style="stroke: ${col.color}" stroke-width="2"/>`;
      }
    }

    // 绘制合并线（如果有多条线需要水平连接）
    const node = rowColumns.find(c => c.hash === commit.hash);
    if (node && commit.parents.length > 1) {
      const parent1Col = rowColumns.find(c => c.hash === commit.parents[0]);
      const parent2Col = rowColumns.find(c => c.hash === commit.parents[1]);
      if (parent1Col && parent2Col) {
        const x1 = PADDING + parent1Col.column * COL_WIDTH;
        const x2 = PADDING + parent2Col.column * COL_WIDTH;
        svg += `<line x1="${x1}" y1="${HEIGHT / 2}" x2="${x2}" y2="${HEIGHT / 2}" style="stroke: ${nodeColor}" stroke-width="2"/>`;
      }
    }
  } else {
    // 最后一行，只绘制到中间的垂直线
    for (const col of rowColumns) {
      const x = PADDING + col.column * COL_WIDTH;
      svg += `<line x1="${x}" y1="0" x2="${x}" y2="${HEIGHT / 2}" style="stroke: ${col.color}" stroke-width="2"/>`;
    }
  }

  // 绘制节点
  svg += `<circle cx="${nodeX}" cy="${HEIGHT / 2}" r="4" style="fill: ${nodeColor}"/>`;

  svg += '</svg>';
  return svg;
}
