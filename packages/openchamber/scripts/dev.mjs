#!/usr/bin/env node
/**
 * 开发模式构建脚本
 * 首次完整构建后进入监听，源码变化时自动重建到 dist/。
 * 宿主通过「路径安装」指向本包目录（packages/openchamber）即可读取 dist/ 下的产物。
 *
 * 用法：node scripts/dev.mjs
 * 停止：Ctrl+C
 */

import { spawn } from 'node:child_process';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const PKG_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DIST = path.join(PKG_ROOT, 'dist');

/**
 * 打印带时间戳的日志
 * @param {string} msg 消息
 */
function log(msg) {
  const time = new Date().toTimeString().slice(0, 8);
  console.log(`[${time}] [dev] ${msg}`);
}

/** Static panel assets that esbuild does not bundle: the HTML shell and its stylesheet. */
const PANEL_ASSETS = ['panel/index.html', 'panel/styles.css'];

/**
 * Copy the panel's static assets into dist/ (they are not bundled).
 */
async function copyPanelAssets() {
  await fs.mkdir(path.join(DIST, 'panel'), { recursive: true });
  for (const asset of PANEL_ASSETS) {
    await fs.copyFile(path.join(PKG_ROOT, asset), path.join(DIST, 'panel', path.basename(asset)));
  }
}

/** mtime of every static asset, keyed by source path. */
async function assetMtimes() {
  const times = new Map();
  for (const asset of PANEL_ASSETS) {
    try {
      times.set(asset, (await fs.stat(path.join(PKG_ROOT, asset))).mtimeMs);
    } catch { /* unreadable now, picked up on a later poll */ }
  }
  return times;
}

/**
 * 启动 esbuild 监听进程
 * @param {string} entry 入口文件（相对包根目录）
 * @param {string} outfile 输出文件（相对包根目录）
 * @param {string[]} extraArgs 额外参数
 * @returns {import('node:child_process').ChildProcess} 子进程
 */
function watch(entry, outfile, extraArgs) {
  const args = [
    entry,
    '--bundle',
    `--outfile=${outfile}`,
    // forever：后台运行时 stdin 关闭也不会退出监听
    '--watch=forever',
    '--log-level=warning',
    ...extraArgs,
  ];
  // 直接调用本地 esbuild 可执行文件：shell:false 下 npx 无法解析命令
  const esbuildBin = path.join(PKG_ROOT, 'node_modules/.bin/esbuild');
  const child = spawn(esbuildBin, args, { cwd: PKG_ROOT, stdio: 'inherit' });
  child.on('error', (e) => {
    log(`启动 ${entry} 监听失败：${e.message}`);
  });
  child.on('exit', (code) => {
    if (code !== 0) log(`${entry} 监听进程退出，code=${code}`);
  });
  return child;
}

async function main() {
  log('准备开发构建目录 dist/');
  await fs.mkdir(DIST, { recursive: true });
  await copyPanelAssets();

  log('启动面板监听（panel/main.ts → dist/panel/main.js）');
  const panel = watch('panel/main.ts', 'dist/panel/main.js', ['--format=iife', '--platform=browser']);

  log('启动服务监听（service/main.ts → dist/service/main.js）');
  const service = watch('service/main.ts', 'dist/service/main.js', ['--format=cjs', '--platform=node', '--target=node20']);

  // HTML and CSS change rarely; poll for them instead of adding a watcher dependency.
  let mtimes = await assetMtimes();
  const timer = setInterval(async () => {
    try {
      const next = await assetMtimes();
      let changed = false;
      for (const [asset, mtime] of next) {
        if (mtimes.get(asset) !== mtime) changed = true;
      }
      if (changed) {
        mtimes = next;
        await copyPanelAssets();
        log(`已同步面板静态资源（${PANEL_ASSETS.map(a => path.basename(a)).join('、')}）`);
      }
    } catch { /* ignore a transient read failure and retry on the next tick */ }
  }, 1000);

  log('监听中，修改源码会自动重建。宿主按路径安装时请选择：');
  log(`  ${PKG_ROOT}`);
  log('停止监听：Ctrl+C');

  const stop = () => {
    clearInterval(timer);
    panel.kill('SIGTERM');
    service.kill('SIGTERM');
    log('已停止');
    process.exit(0);
  };
  process.on('SIGINT', stop);
  process.on('SIGTERM', stop);
}

main().catch((e) => {
  console.error('[dev] 启动失败:', e);
  process.exit(1);
});
