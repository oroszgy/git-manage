"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// service/main.ts
var main_exports = {};
__export(main_exports, {
  handleRequest: () => handleRequest
});
module.exports = __toCommonJS(main_exports);

// ../core/dist/index.js
var import_child_process = require("child_process");
var import_util = require("util");
var import_promises = require("fs/promises");
var import_os = require("os");
var import_path = require("path");
var GitError = class extends Error {
  constructor(message, result) {
    super(message);
    this.result = result;
    this.name = "GitError";
  }
  result;
};
var execFileAsync = (0, import_util.promisify)(import_child_process.execFile);
var GIT_LOG_LIMIT = 200;
var GIT_LOG_OUTPUT_LIMIT = 8192;
var commandLogs = [];
var logSeq = 0;
function getGitCommandLogs(since = 0, limit = GIT_LOG_LIMIT) {
  return commandLogs.filter((l) => l.id > since).slice(-limit);
}
function clearGitCommandLogs() {
  commandLogs.length = 0;
}
function truncateOutput(text) {
  if (text.length <= GIT_LOG_OUTPUT_LIMIT) return text;
  return `${text.slice(0, GIT_LOG_OUTPUT_LIMIT)}
\u2026\uFF08\u5DF2\u622A\u65AD\uFF0C\u5171 ${text.length} \u5B57\u7B26\uFF09`;
}
function recordCommand(entry) {
  logSeq += 1;
  commandLogs.push({ id: logSeq, ...entry });
  if (commandLogs.length > GIT_LOG_LIMIT) {
    commandLogs.splice(0, commandLogs.length - GIT_LOG_LIMIT);
  }
}
async function gitExec(command, options) {
  const { cwd, timeout = 3e4, env } = options;
  const args = typeof command === "string" ? command.split(/\s+/).filter(Boolean) : command;
  const commandText = Array.isArray(command) ? command.join(" ") : command;
  const startedAt = Date.now();
  try {
    const result = await execFileAsync("git", args, {
      cwd,
      timeout,
      env: {
        ...process.env,
        ...env,
        // 禁用 Git 提示
        GIT_TERMINAL_PROMPT: "0",
        GIT_ASKPASS: "echo"
      },
      maxBuffer: 10 * 1024 * 1024
      // 10MB
    });
    const stdout = result.stdout.trimEnd();
    const stderr = result.stderr.trim();
    recordCommand({
      startedAt,
      durationMs: Date.now() - startedAt,
      command: `git ${commandText}`,
      cwd,
      exitCode: 0,
      ok: true,
      stdout: truncateOutput(stdout),
      stderr: truncateOutput(stderr)
    });
    return {
      // 只清理尾部空白：git status --porcelain 行首空格承载暂存状态语义，不能吃掉
      stdout,
      stderr,
      exitCode: 0
    };
  } catch (error) {
    const execError = error;
    const failStdout = execError.stdout ?? "";
    const failStderr = execError.killed ? "\u547D\u4EE4\u6267\u884C\u8D85\u65F6" : execError.stderr ?? "";
    const failCode = execError.killed ? -1 : execError.code ?? 1;
    recordCommand({
      startedAt,
      durationMs: Date.now() - startedAt,
      command: `git ${commandText}`,
      cwd,
      exitCode: failCode,
      ok: false,
      stdout: truncateOutput(failStdout),
      stderr: truncateOutput(failStderr)
    });
    if (execError.killed) {
      throw new GitError(`Git \u547D\u4EE4\u6267\u884C\u8D85\u65F6: ${commandText}`, {
        stdout: failStdout,
        stderr: "\u547D\u4EE4\u6267\u884C\u8D85\u65F6",
        exitCode: -1
      });
    }
    return {
      stdout: failStdout,
      stderr: failStderr,
      exitCode: failCode
    };
  }
}
async function gitExecStrict(command, options) {
  const result = await gitExec(command, options);
  if (result.exitCode !== 0) {
    const commandText = Array.isArray(command) ? command.join(" ") : command;
    throw new GitError(
      `Git \u547D\u4EE4\u6267\u884C\u5931\u8D25: ${commandText}
${result.stderr}`,
      result
    );
  }
  return result;
}
function isRemoteHeadAlias(name, headAliases) {
  return headAliases.has(name);
}
async function listBranches(options) {
  const result = await gitExecStrict("branch -a --format=%(refname:short)|%(objectname:short)|%(subject)", options);
  const currentBranch = await getCurrentBranch(options);
  const branches = [];
  const seen = /* @__PURE__ */ new Set();
  const headAliases = /* @__PURE__ */ new Set();
  const remotesResult = await gitExec(
    ["for-each-ref", "--format=%(refname:short)", "refs/remotes"],
    options
  ).catch(() => null);
  for (const ref of (remotesResult?.stdout ?? "").split("\n")) {
    const trimmed = ref.trim();
    if (trimmed && !trimmed.includes("/")) headAliases.add(trimmed);
  }
  if (result.stdout) {
    const unpushedMap = await getUnpushedBranches(options);
    const unpulledMap = await getUnpulledBranches(options);
    for (const line of result.stdout.split("\n")) {
      if (!line.trim()) continue;
      const [name, commit2, message] = line.split("|");
      if (!name) continue;
      if (isRemoteHeadAlias(name, headAliases)) continue;
      const isCurrent = name === currentBranch;
      const isRemote = name.startsWith("origin/");
      const remote = isRemote ? name.split("/")[0] : void 0;
      const unpushedInfo = unpushedMap.get(name);
      const unpulledInfo = unpulledMap.get(name);
      branches.push({
        name,
        isCurrent,
        isRemote,
        remote,
        commit: commit2,
        message,
        hasUnpushed: unpushedInfo?.hasUnpushed ?? false,
        unpushedCount: unpushedInfo?.unpushedCount ?? 0,
        hasUnpulled: unpulledInfo?.hasUnpulled ?? false,
        unpulledCount: unpulledInfo?.unpulledCount ?? 0
      });
      seen.add(name);
    }
  }
  if (currentBranch && !seen.has(currentBranch) && !currentBranch.startsWith("HEAD")) {
    const headContent = await gitExec("symbolic-ref HEAD", options);
    if (headContent.stdout) {
      branches.unshift({
        name: currentBranch,
        isCurrent: true,
        isRemote: false,
        commit: void 0,
        message: void 0,
        hasUnpushed: false,
        unpushedCount: 0
      });
    }
  }
  return branches;
}
async function getUnpushedBranches(options) {
  const map = /* @__PURE__ */ new Map();
  try {
    const result = await gitExec("branch --format=%(refname:short)", options);
    if (!result.stdout) return map;
    const localBranches = result.stdout.split("\n").filter((b) => b && !b.startsWith("origin/"));
    for (const branch of localBranches) {
      try {
        const unpushedResult = await gitExec(
          `log --oneline origin/${branch}..${branch} 2>/dev/null | wc -l | tr -d ' '`,
          options
        );
        const count = parseInt(unpushedResult.stdout || "0", 10);
        if (count > 0) {
          map.set(branch, { hasUnpushed: true, unpushedCount: count });
        }
      } catch {
      }
    }
  } catch {
  }
  return map;
}
async function getUnpulledBranches(options) {
  const map = /* @__PURE__ */ new Map();
  try {
    const result = await gitExec("branch --format=%(refname:short)", options);
    if (!result.stdout) return map;
    const localBranches = result.stdout.split("\n").filter((b) => b && !b.startsWith("origin/"));
    for (const branch of localBranches) {
      try {
        const unpulledResult = await gitExec(
          `log --oneline ${branch}..origin/${branch} 2>/dev/null | wc -l | tr -d ' '`,
          options
        );
        const count = parseInt(unpulledResult.stdout || "0", 10);
        if (count > 0) {
          map.set(branch, { hasUnpulled: true, unpulledCount: count });
        }
      } catch {
      }
    }
  } catch {
  }
  return map;
}
async function getCurrentBranch(options) {
  const result = await gitExecStrict("branch --show-current", options);
  return result.stdout || "HEAD";
}
async function createBranch(name, options, startPoint) {
  const args = startPoint ? ["branch", name, startPoint] : ["branch", name];
  await gitExecStrict(args, options);
}
async function deleteBranch(name, options, force = false) {
  const flag = force ? "-D" : "-d";
  await gitExecStrict(`branch ${flag} ${name}`, options);
}
async function localBranchExists(name, options) {
  const result = await gitExecStrict(["branch", "--list", "--format=%(refname:short)"], options);
  return result.stdout.split("\n").some((line) => line === name);
}
async function isBranchMerged(branch, options) {
  const result = await gitExec(["merge-base", "--is-ancestor", branch, "HEAD"], options);
  if (result.exitCode === 0) {
    return true;
  }
  if (result.exitCode === 1) {
    return false;
  }
  throw new GitError(
    `Git \u547D\u4EE4\u6267\u884C\u5931\u8D25: merge-base --is-ancestor ${branch} HEAD
${result.stderr}`,
    result
  );
}
async function deleteRemoteBranch(remote, name, options) {
  await gitExecStrict(["push", remote, "--delete", name], options);
}
async function getBranchTip(ref, options) {
  const result = await gitExecStrict(["rev-parse", ref], options);
  return result.stdout;
}
async function getBranchUpstream(branch, options) {
  const result = await gitExec(["rev-parse", "--abbrev-ref", `${branch}@{upstream}`], options);
  if (result.exitCode !== 0) {
    const missingUpstream = result.stderr.includes("no upstream") || result.stderr.includes("\u5C1A\u672A\u7ED9\u5206\u652F");
    if (missingUpstream) {
      return null;
    }
    throw new GitError(
      `Git \u547D\u4EE4\u6267\u884C\u5931\u8D25: rev-parse --abbrev-ref ${branch}@{upstream}
${result.stderr}`,
      result
    );
  }
  const upstream = result.stdout;
  const sepIndex = upstream.indexOf("/");
  if (sepIndex <= 0 || sepIndex === upstream.length - 1) {
    return null;
  }
  return { remote: upstream.slice(0, sepIndex), branch: upstream.slice(sepIndex + 1) };
}
async function hasOtherLocalBranchTracking(branch, upstream, options) {
  const result = await gitExecStrict(
    ["for-each-ref", "refs/heads", "--format=%(refname:short)%09%(upstream:short)"],
    options
  );
  for (const line of result.stdout.split("\n")) {
    if (!line.trim()) continue;
    const [name, trackedUpstream] = line.split("	");
    if (name && name !== branch && trackedUpstream === upstream) {
      return true;
    }
  }
  return false;
}
async function setBranchUpstream(branch, upstream, options) {
  await gitExecStrict(["branch", `--set-upstream-to=${upstream}`, branch], options);
}
async function renameBranch(oldName, newName, options) {
  await gitExecStrict(`branch -m ${oldName} ${newName}`, options);
}
async function checkout(branch, options) {
  await gitExecStrict(`checkout ${branch}`, options);
}
async function checkoutNew(branch, options, startPoint) {
  const args = startPoint ? ["checkout", "-b", branch, startPoint] : ["checkout", "-b", branch];
  await gitExecStrict(args, options);
}
async function merge(branch, options) {
  await gitExecStrict(`merge ${branch}`, options);
}
async function rebase(branch, options) {
  await gitExecStrict(`rebase ${branch}`, options);
}
async function rebaseAbort(options) {
  await gitExecStrict("rebase --abort", options);
}
async function rebaseContinue(options) {
  await gitExecStrict("rebase --continue", options);
}
async function getCurrentAuthor(options) {
  const name = await gitExec("config user.name", options).catch(() => null);
  const email = await gitExec("config user.email", options).catch(() => null);
  return {
    name: (name?.stdout ?? "").trim(),
    email: (email?.stdout ?? "").trim()
  };
}
var NAME_PATTERN = /^(\w+)[!-/:-@[-`{-~\s](\w+)$/;
var PRINTABLE_ASCII = /^[ -~]*$/;
function getFirstAndLastName(name) {
  const m = NAME_PATTERN.exec(name);
  return m ? [m[1], m[2]] : null;
}
function nameToLowerCase(name) {
  return PRINTABLE_ASCII.test(name) ? name.toLowerCase() : name;
}
function getNameInStandardForm(name) {
  const pair = getFirstAndLastName(name);
  if (pair) return `${pair[0].toLowerCase()} ${pair[1].toLowerCase()}`;
  return nameToLowerCase(name);
}
function getNameFromEmail(email) {
  const at = email.indexOf("@");
  return at > 0 ? email.slice(0, at) : null;
}
function buildAuthorIndex(commits) {
  const byName = /* @__PURE__ */ new Map();
  const byEmailName = /* @__PURE__ */ new Map();
  const push2 = (map, key, value) => {
    const list = map.get(key);
    if (list) list.push(value);
    else map.set(key, [value]);
  };
  for (const commit2 of commits) {
    if (commit2.name) push2(byName, getNameInStandardForm(commit2.name), commit2);
    const emailName = getNameFromEmail(commit2.email);
    if (emailName) push2(byEmailName, getNameInStandardForm(emailName), commit2);
  }
  return { byName, byEmailName };
}
function resolveUsersByName(name, index) {
  const key = getNameInStandardForm(name);
  return [...index.byName.get(key) ?? [], ...index.byEmailName.get(key) ?? []];
}
function resolveCurrentUsers(current, index) {
  const result = /* @__PURE__ */ new Set();
  const usersByName = current.name ? resolveUsersByName(current.name, index) : [];
  for (const user of usersByName) result.add(`${user.name}\0${user.email.toLowerCase()}`);
  const emailName = getNameFromEmail(current.email);
  if (emailName) {
    const knownEmails = new Set(usersByName.map((u) => u.email.toLowerCase()));
    for (const candidate of resolveUsersByName(emailName, index)) {
      if (knownEmails.has(candidate.email.toLowerCase())) {
        result.add(`${candidate.name}\0${candidate.email.toLowerCase()}`);
      }
    }
  }
  return result;
}
async function findMyBranches(options) {
  const current = await getCurrentAuthor(options);
  if (!current.email && !current.name) return [];
  const branchResult = await gitExec(
    ["for-each-ref", "--format=%(refname:short)|%(refname)", "refs/heads", "refs/remotes"],
    options
  );
  const local = [];
  const remote = [];
  for (const line of (branchResult.stdout ?? "").split("\n")) {
    const [shortName, fullRef] = line.split("|");
    if (!shortName || !fullRef) continue;
    if (fullRef.startsWith("refs/heads/")) local.push(shortName);
    else if (fullRef.startsWith("refs/remotes/") && !fullRef.endsWith("/HEAD")) remote.push(shortName);
  }
  if (local.length === 0 && remote.length === 0) return [];
  const allAuthorsResult = await gitExec(
    ["log", "--all", "--format=%ae%n%an"],
    options
  ).catch(() => null);
  const authorLines = (allAuthorsResult?.stdout ?? "").split("\n").map((l) => l.trim()).filter(Boolean);
  const allAuthors = [];
  for (let i = 0; i < authorLines.length; i += 2) {
    allAuthors.push({ email: authorLines[i] ?? "", name: authorLines[i + 1] ?? "" });
  }
  const index = buildAuthorIndex(allAuthors);
  const meKeySet = resolveCurrentUsers(current, index);
  const checkRef = async (ref, excludeRefs) => {
    const logArgs = ["log", "--format=%ae%n%an", ref];
    if (excludeRefs.length > 0) logArgs.push("--not", ...excludeRefs);
    const logResult = await gitExec(logArgs, options).catch(() => null);
    if (!logResult) return false;
    const lines = (logResult.stdout ?? "").split("\n").map((l) => l.trim()).filter(Boolean);
    if (lines.length === 0) return false;
    for (let i = 0; i < lines.length; i += 2) {
      const author = { email: lines[i] ?? "", name: lines[i + 1] ?? "" };
      if (!meKeySet.has(`${author.name}\0${author.email.toLowerCase()}`)) return false;
    }
    return true;
  };
  const result = [];
  for (const branch of local) {
    const others = [...local.filter((b) => b !== branch), ...remote];
    if (await checkRef(branch, others)) result.push(branch);
  }
  for (const branch of remote) {
    const others = remote.filter((b) => b !== branch);
    if (await checkRef(branch, others)) result.push(branch);
  }
  return result;
}
async function listWorktrees(options) {
  const result = await gitExec(["worktree", "list", "--porcelain"], options);
  const blocks = result.stdout.split("\n\n").map((b) => b.trim()).filter(Boolean);
  const list = [];
  for (const [index, block] of blocks.entries()) {
    const info = {
      path: "",
      head: "",
      branch: null,
      bare: false,
      detached: false,
      locked: null,
      isMain: index === 0
    };
    for (const line of block.split("\n")) {
      if (line.startsWith("worktree ")) info.path = line.slice("worktree ".length);
      else if (line.startsWith("HEAD ")) info.head = line.slice("HEAD ".length);
      else if (line.startsWith("branch ")) info.branch = line.slice("branch ".length);
      else if (line === "bare") info.bare = true;
      else if (line === "detached") info.detached = true;
      else if (line.startsWith("locked")) info.locked = line.slice("locked".length).trim() || "locked";
    }
    if (info.path) list.push(info);
  }
  return list;
}
async function addWorktree(targetPath, branch, createBranch2, startPoint, options) {
  const args = ["worktree", "add"];
  if (createBranch2) args.push("-b", branch);
  args.push(targetPath);
  if (createBranch2) {
    if (startPoint) args.push(startPoint);
  } else {
    args.push(branch);
  }
  await gitExecStrict(args, options);
}
async function removeWorktree(targetPath, force, options) {
  const args = ["worktree", "remove"];
  if (force) args.push("--force");
  args.push(targetPath);
  await gitExecStrict(args, options);
}
async function pruneWorktrees(options) {
  await gitExecStrict(["worktree", "prune"], options);
}
async function isWorkingTreeClean(options) {
  const result = await gitExec("status --porcelain=v1", options);
  return result.stdout.trim() === "";
}
async function assertWorkingTreeClean(options) {
  if (await isWorkingTreeClean(options)) return;
  throw new Error("\u5DE5\u4F5C\u533A\u6709\u672A\u63D0\u4EA4\u7684\u6539\u52A8\uFF0C\u8BF7\u5148\u63D0\u4EA4\u6216\u6682\u5B58\u540E\u518D\u7F16\u8F91/\u5220\u9664\u63D0\u4EA4");
}
async function isHeadCommit(hash, options) {
  const result = await gitExec("rev-parse HEAD", options);
  return result.stdout.trim() === hash;
}
async function isMergeCommit(hash, options) {
  const result = await gitExec(["rev-list", "--parents", "-n", "1", hash], options);
  return result.stdout.trim().split(/\s+/).length > 2;
}
async function withTempDir(fn) {
  const dir = await (0, import_promises.mkdtemp)((0, import_path.join)((0, import_os.tmpdir)(), "git-manage-rebase-"));
  try {
    return await fn(dir);
  } finally {
    await (0, import_promises.rm)(dir, { recursive: true, force: true }).catch(() => {
    });
  }
}
async function uncommitHead(hash, options) {
  await assertWorkingTreeClean(options);
  if (!await isHeadCommit(hash, options)) {
    throw new Error("\u53EA\u80FD\u64A4\u9500\u5F53\u524D\u5206\u652F\u7684\u6700\u65B0\u63D0\u4EA4\uFF1B\u8BF7\u5148\u5207\u6362\u5230\u5305\u542B\u8BE5\u63D0\u4EA4\u7684\u5206\u652F");
  }
  if (await isMergeCommit(hash, options)) {
    throw new Error("\u65E0\u6CD5\u64A4\u9500\u5408\u5E76\u63D0\u4EA4\uFF0C\u8BF7\u4F7F\u7528 Reset \u6307\u5B9A\u7236\u63D0\u4EA4");
  }
  await gitExecStrict(["reset", "--soft", `${hash}^`], options);
}
async function rewordCommit(hash, message, options) {
  await assertWorkingTreeClean(options);
  if (await isHeadCommit(hash, options)) {
    await gitExecStrict(["commit", "--amend", "-m", message], options);
    return;
  }
  await withTempDir(async (dir) => {
    const short = hash.slice(0, 7);
    const sequenceScript = (0, import_path.join)(dir, "sequence-editor.mjs");
    await (0, import_promises.writeFile)(
      sequenceScript,
      `#!/usr/bin/env node
import { readFileSync, writeFileSync } from 'node:fs';
const file = process.argv[2];
const short = ${JSON.stringify(short)};
const lines = readFileSync(file, 'utf8').split('\\n');
let done = false;
for (let i = 0; i < lines.length; i++) {
  if (!done && lines[i].startsWith('pick ' + short)) {
    lines[i] = lines[i].replace(/^pick /, 'reword ');
    done = true;
  }
}
writeFileSync(file, lines.join('\\n'));
`,
      { mode: 493 }
    );
    const messageFile = (0, import_path.join)(dir, "message.txt");
    await (0, import_promises.writeFile)(messageFile, message, "utf8");
    const editorScript = (0, import_path.join)(dir, "editor.mjs");
    await (0, import_promises.writeFile)(
      editorScript,
      `#!/usr/bin/env node
import { readFileSync, writeFileSync } from 'node:fs';
writeFileSync(process.argv[2], readFileSync(${JSON.stringify(messageFile)}, 'utf8'));
`,
      { mode: 493 }
    );
    await gitExecStrict(["rebase", "-i", `${hash}^`], {
      ...options,
      env: {
        ...options.env,
        GIT_SEQUENCE_EDITOR: sequenceScript,
        GIT_EDITOR: editorScript
      }
    });
  });
}
async function dropCommit(hash, options) {
  await assertWorkingTreeClean(options);
  if (await isHeadCommit(hash, options)) {
    await gitExecStrict(["reset", "--soft", "HEAD~1"], options);
    return;
  }
  await withTempDir(async (dir) => {
    const short = hash.slice(0, 7);
    const sequenceScript = (0, import_path.join)(dir, "sequence-editor.mjs");
    await (0, import_promises.writeFile)(
      sequenceScript,
      `#!/usr/bin/env node
import { readFileSync, writeFileSync } from 'node:fs';
const file = process.argv[2];
const short = ${JSON.stringify(short)};
const lines = readFileSync(file, 'utf8').split('\\n');
let done = false;
for (let i = 0; i < lines.length; i++) {
  if (!done && lines[i].startsWith('pick ' + short)) {
    lines[i] = lines[i].replace(/^pick /, 'drop ');
    done = true;
  }
}
writeFileSync(file, lines.join('\\n'));
`,
      { mode: 493 }
    );
    await gitExecStrict(["rebase", "-i", `${hash}^`], {
      ...options,
      env: {
        ...options.env,
        GIT_SEQUENCE_EDITOR: sequenceScript
      }
    });
  });
}
async function pushUpToCommit(hash, branch, options) {
  const ancestorCheck = await gitExec(
    ["merge-base", "--is-ancestor", hash, branch],
    options
  ).catch(() => null);
  if (!ancestorCheck || ancestorCheck.exitCode !== 0) {
    throw new Error(`\u63D0\u4EA4 ${hash.slice(0, 7)} \u4E0D\u5728\u5206\u652F ${branch} \u7684\u5386\u53F2\u4E2D`);
  }
  await gitExecStrict(["push", "origin", branch], options);
  return `${branch} -> origin/${branch}`;
}
function parseFileStatus(indexStatus, worktreeStatus) {
  if (indexStatus === "R" || indexStatus === "C") return "renamed";
  if (indexStatus === "D" || worktreeStatus === "D") return "deleted";
  if (indexStatus === "A" || worktreeStatus === "?") return "added";
  if (indexStatus === "M" || worktreeStatus === "M") return "modified";
  if (indexStatus === "U" || worktreeStatus === "U") return "conflicted";
  return "modified";
}
async function getStatus(options) {
  const currentBranch = await getCurrentBranchName(options);
  const result = await gitExec("status --porcelain=v1", options);
  if (result.exitCode !== 0) {
    return {
      currentBranch,
      changes: [],
      hasChanges: false,
      hasUnstagedChanges: false,
      hasStagedChanges: false
    };
  }
  const changes = [];
  let hasUnstagedChanges = false;
  let hasStagedChanges = false;
  for (const line of result.stdout.split("\n")) {
    if (!line.trim()) continue;
    const indexStatus = line[0];
    const worktreeStatus = line[1];
    const path = line.substring(3).trim();
    if (!path) continue;
    const staged = indexStatus !== " " && indexStatus !== "?";
    const status = parseFileStatus(indexStatus, worktreeStatus);
    if (staged) hasStagedChanges = true;
    if (worktreeStatus !== " " && worktreeStatus !== "?") hasUnstagedChanges = true;
    changes.push({
      path,
      status,
      staged
    });
  }
  return {
    currentBranch,
    changes,
    hasChanges: changes.length > 0,
    hasUnstagedChanges,
    hasStagedChanges
  };
}
async function getCurrentBranchName(options) {
  const result = await gitExec("branch --show-current", options);
  return result.stdout || "HEAD";
}
async function stash(options, message) {
  await gitExecStrict(message ? ["stash", "push", "-m", message] : ["stash", "push"], options);
}
function parseDiffLine(line, lineType, newLineNum, oldLineNum) {
  return {
    type: lineType,
    content: line.substring(1),
    newLine: lineType !== "delete" ? newLineNum : void 0,
    oldLine: lineType !== "add" ? oldLineNum : void 0
  };
}
function parseUnifiedDiff(diffOutput) {
  const lines = [];
  let newLineNum = 0;
  let oldLineNum = 0;
  for (const line of diffOutput.split("\n")) {
    if (line.startsWith("@@")) {
      const match = line.match(/@@ -(\d+)(?:,\d+)? \+(\d+)(?:,\d+)? @@/);
      if (match) {
        oldLineNum = parseInt(match[1], 10) - 1;
        newLineNum = parseInt(match[2], 10) - 1;
      }
      continue;
    }
    if (line.startsWith("diff --git") || line.startsWith("index ") || line.startsWith("---") || line.startsWith("+++")) {
      continue;
    }
    if (line.startsWith("+")) {
      newLineNum++;
      lines.push(parseDiffLine(line, "add", newLineNum, oldLineNum));
    } else if (line.startsWith("-")) {
      oldLineNum++;
      lines.push(parseDiffLine(line, "delete", newLineNum, oldLineNum));
    } else if (line.startsWith(" ") || line === "") {
      newLineNum++;
      oldLineNum++;
      lines.push(parseDiffLine(line, "context", newLineNum, oldLineNum));
    }
  }
  return lines;
}
async function getCommitDiff(from, to, options) {
  const result = await gitExec(`diff ${from} ${to}`, options);
  if (!result.stdout) {
    return [];
  }
  const fileDiffs = [];
  const fileSections = result.stdout.split("diff --git ");
  for (const section of fileSections) {
    if (!section.trim()) continue;
    const pathMatch = section.match(/b\/(.+)$/m);
    if (!pathMatch) continue;
    const path = pathMatch[1];
    const lines = parseUnifiedDiff("diff --git " + section);
    const additions = lines.filter((l) => l.type === "add").length;
    const deletions = lines.filter((l) => l.type === "delete").length;
    fileDiffs.push({
      path,
      additions,
      deletions,
      lines
    });
  }
  return fileDiffs;
}
async function getBranchDiffFiles(from, to, options) {
  const result = await gitExec(`diff ${from}...${to}`, options);
  if (!result.stdout) {
    return [];
  }
  const fileDiffs = [];
  const fileSections = result.stdout.split("diff --git ");
  for (const section of fileSections) {
    if (!section.trim()) continue;
    const pathMatch = section.match(/b\/(.+)$/m);
    if (!pathMatch) continue;
    const path = pathMatch[1];
    const lines = parseUnifiedDiff("diff --git " + section);
    const additions = lines.filter((l) => l.type === "add").length;
    const deletions = lines.filter((l) => l.type === "delete").length;
    fileDiffs.push({
      path,
      additions,
      deletions,
      lines
    });
  }
  return fileDiffs;
}
function parseCommit(raw) {
  const lines = raw.split("\n");
  if (lines.length < 4) return null;
  const hash = lines[0];
  const shortHash = hash.substring(0, 7);
  const message = lines[1];
  const authorName = lines[2];
  const authorEmail = lines[3].replace(/[<>]/g, "");
  const date = lines[4] || "";
  const commitDate = lines[5] || "";
  const parents = lines[6] ? lines[6].split(" ").filter(Boolean) : [];
  return {
    hash,
    shortHash,
    message,
    authorName,
    authorEmail,
    date,
    commitDate,
    parents
  };
}
async function getLog(options = {}, gitOptions) {
  const format = "%H%n%s%n%an%n%ae%n%ai%n%cI%n%P";
  const args = ["log", `--format=${format}`];
  if (options.maxCount) {
    args.push(`--max-count=${options.maxCount}`);
  }
  if (options.since) {
    args.push(`--since="${options.since}"`);
  }
  if (options.until) {
    args.push(`--until="${options.until}"`);
  }
  if (options.branch) {
    args.push(options.branch);
  }
  if (typeof options.path === "string") {
    if (options.path) {
      args.push("--", options.path);
    }
  } else if (Array.isArray(options.path)) {
    const paths = options.path.filter((p) => p !== "");
    if (paths.length > 0) {
      args.push("--", ...paths);
    }
  }
  const result = await gitExec(args, gitOptions);
  if (result.exitCode !== 0) {
    throw new GitError(`Git \u547D\u4EE4\u6267\u884C\u5931\u8D25: ${args.join(" ")}
${result.stderr}`, result);
  }
  if (!result.stdout) {
    return [];
  }
  const commits = [];
  const lines = result.stdout.split("\n");
  const COMMIT_FIELDS = 7;
  for (let i = 0; i < lines.length; i += COMMIT_FIELDS) {
    const block = lines.slice(i, i + COMMIT_FIELDS).join("\n");
    const commit2 = parseCommit(block.trim());
    if (commit2) {
      commits.push(commit2);
    }
  }
  return commits;
}
async function showCommit(hash, options) {
  const format = "%H%n%s%n%an%n%ae%n%ai%n%cI%n%P";
  const result = await gitExec(`show --format=${format} --stat ${hash}`, options);
  if (!result.stdout) {
    return null;
  }
  const lines = result.stdout.split("\n");
  if (lines.length < 7) return null;
  const commit2 = {
    hash: lines[0],
    shortHash: lines[0].substring(0, 7),
    message: lines[1],
    authorName: lines[2],
    authorEmail: lines[3].replace(/[<>]/g, ""),
    date: lines[4],
    commitDate: lines[5] || void 0,
    parents: lines[6] ? lines[6].split(" ").filter(Boolean) : []
  };
  const diffs = await getCommitDiff(commit2.parents[0] || "", hash, options);
  return {
    ...commit2,
    diffs
  };
}
async function listTrackedFiles(cwd) {
  const result = await gitExec(["ls-files", "-z"], { cwd });
  if (!result.stdout) {
    return [];
  }
  const files = result.stdout.split("\0").filter((file) => file !== "");
  return files;
}
async function listRemotes(options) {
  const result = await gitExec("remote -v", options);
  if (!result.stdout) {
    return [];
  }
  const remoteMap = /* @__PURE__ */ new Map();
  for (const line of result.stdout.split("\n")) {
    if (!line.trim()) continue;
    const parts = line.split(/\s+/);
    if (parts.length < 2) continue;
    const name = parts[0];
    const url = parts[1];
    const isPush = parts[2] === "(push)";
    if (!remoteMap.has(name)) {
      remoteMap.set(name, { name, url });
    }
    if (isPush) {
      remoteMap.get(name).pushUrl = url;
    }
  }
  return Array.from(remoteMap.values());
}
async function pull(options, remote = "origin", branch) {
  const args = branch ? `pull ${remote} ${branch}` : `pull ${remote}`;
  await gitExecStrict(args, options);
}
async function push(options, remote = "origin", branch) {
  const args = branch ? `push ${remote} ${branch}` : `push ${remote}`;
  await gitExecStrict(args, options);
}
async function forcePush(options, remote = "origin", branch) {
  const args = branch ? `push --force ${remote} ${branch}` : `push --force ${remote}`;
  await gitExecStrict(args, options);
}
async function abortMerge(options) {
  await gitExecStrict("merge --abort", options);
}
async function continueMerge(options) {
  await gitExecStrict("merge --continue", options);
}
async function getBranches(cwd) {
  return listBranches({ cwd });
}
async function getCommitLog(cwd, limit = 50, branch, path) {
  return getLog({ maxCount: limit, branch, path }, { cwd });
}
async function getCommitDetail(cwd, commitHash) {
  return showCommit(commitHash, { cwd });
}
async function getCommitFileDiffs(cwd, commitHash) {
  const commit2 = await showCommit(commitHash, { cwd });
  if (!commit2 || !commit2.parents[0]) {
    return [];
  }
  return getCommitDiff(commit2.parents[0], commitHash, { cwd });
}

// service/main.ts
var import_meta = {};
var PORT = parseInt(process.env.OPENCHAMBER_SERVICE_PORT || "0", 10);
var TOKEN = process.env.OPENCHAMBER_SERVICE_TOKEN || "";
var DEBUG_LOG_MAX_BYTES = 1024 * 1024;
function isDebugLogEnabled() {
  const flag = process.env.GIT_MANAGE_DEBUG || "";
  return flag === "1" || flag.toLowerCase() === "true";
}
async function appendDebugLog(line) {
  const { appendFile, mkdir, stat, writeFile: writeFile2 } = await import("fs/promises");
  const { dirname, join: join2 } = await import("path");
  const { homedir } = await import("os");
  const platform = process.platform;
  let baseDir;
  if (platform === "win32") {
    baseDir = process.env.APPDATA || join2(homedir(), "AppData", "Roaming");
  } else if (platform === "darwin") {
    baseDir = join2(homedir(), "Library", "Logs");
  } else {
    baseDir = process.env.XDG_CONFIG_HOME || join2(homedir(), ".config");
  }
  const path = join2(baseDir, "git-manage", "gitpanel-debug.log");
  await mkdir(dirname(path), { recursive: true });
  let overflow = false;
  try {
    overflow = (await stat(path)).size + Buffer.byteLength(line) > DEBUG_LOG_MAX_BYTES;
  } catch {
  }
  if (overflow) {
    await writeFile2(path, line, "utf8");
  } else {
    await appendFile(path, line, "utf8");
  }
}
function verifyToken(request) {
  const auth = request.headers.get("Authorization");
  return auth === `Bearer ${TOKEN}`;
}
async function captureLocalRestoreData(branch, options) {
  const tip = await getBranchTip(`refs/heads/${branch}`, options);
  const upstream = await getBranchUpstream(branch, options);
  const canDeleteTracking = upstream ? await hasOtherLocalBranchTracking(branch, `${upstream.remote}/${upstream.branch}`, options) : false;
  return { tip, upstream, canDeleteTracking };
}
async function handleRequest(request) {
  if (!verifyToken(request)) {
    return new Response("Unauthorized", { status: 401 });
  }
  const url = new URL(request.url);
  const path = url.pathname;
  if (path === "/health") {
    return new Response("ok", { status: 200 });
  }
  try {
    const body = await request.json();
    const directory = body.directory;
    switch (path) {
      case "/git-status": {
        const status = await getStatus({ cwd: directory });
        return Response.json(status);
      }
      case "/git-branches": {
        const branches = await getBranches(directory);
        return Response.json(branches);
      }
      case "/git-my-branches": {
        const mine = await findMyBranches({ cwd: directory });
        console.log(`[git-manager-service] ${JSON.stringify({ event: "my-branches", count: mine.length })}`);
        return Response.json(mine);
      }
      case "/git-checkout": {
        await checkout(body.branch, { cwd: directory });
        return Response.json({ success: true });
      }
      case "/git-stash": {
        await stash({ cwd: directory });
        return Response.json({ success: true });
      }
      case "/git-merge": {
        await merge(body.branch, { cwd: directory });
        return Response.json({ success: true });
      }
      case "/git-delete-branch": {
        const branch = body.branch;
        const force = body.force === true;
        const options = { cwd: directory };
        console.log(`[git-manager-service] ${JSON.stringify({ event: "delete-branch", directory, branch, force })}`);
        try {
          if (force && await localBranchExists(branch, options)) {
            const restore2 = await captureLocalRestoreData(branch, options);
            await deleteBranch(branch, options, true);
            return Response.json({ success: true, kind: "local", ...restore2 });
          }
          if (!await localBranchExists(branch, options)) {
            const segments = branch.split("/");
            const remoteName = segments[0];
            const remotePath = segments.slice(1).join("/");
            const remoteNames = (await listRemotes(options)).map((r) => r.name);
            if (remotePath && remoteNames.includes(remoteName)) {
              const tip = await getBranchTip(`${remoteName}/${remotePath}`, options);
              await deleteRemoteBranch(remoteName, remotePath, options);
              return Response.json({
                success: true,
                kind: "remote",
                tip,
                upstream: null,
                canDeleteTracking: false
              });
            }
            console.log(`[git-manager-service] ${JSON.stringify({ event: "delete-branch", code: "NOT_FOUND", branch })}`);
            return Response.json(
              { code: "NOT_FOUND", message: `Branch not found: ${branch}` },
              { status: 404 }
            );
          }
          if (!await isBranchMerged(branch, options)) {
            console.log(`[git-manager-service] ${JSON.stringify({ event: "delete-branch", code: "NOT_MERGED", branch })}`);
            return Response.json(
              { code: "NOT_MERGED", message: `Branch not merged into HEAD: ${branch}` },
              { status: 409 }
            );
          }
          const restore = await captureLocalRestoreData(branch, options);
          await deleteBranch(branch, options);
          return Response.json({ success: true, kind: "local", ...restore });
        } catch (error) {
          const stderr = error instanceof GitError && error.result.stderr ? error.result.stderr : error instanceof Error ? error.message : String(error);
          console.error(`[git-manager-service] ${JSON.stringify({ event: "delete-branch", code: "GIT_ERROR", message: stderr })}`);
          return Response.json({ code: "GIT_ERROR", message: stderr }, { status: 500 });
        }
      }
      case "/git-debug-log": {
        if (!isDebugLogEnabled()) {
          return Response.json({ success: true });
        }
        const line = JSON.stringify({ ts: (/* @__PURE__ */ new Date()).toISOString(), event: body.event, data: body.data }) + "\n";
        try {
          await appendDebugLog(line);
        } catch (e) {
          console.error(`[git-manager-service] ${JSON.stringify({ event: "debug-log-write-error", message: String(e) })}`);
        }
        return Response.json({ success: true });
      }
      case "/git-create-branch": {
        const startPoint = body.startPoint;
        await createBranch(body.name, { cwd: directory }, startPoint);
        return Response.json({ success: true });
      }
      case "/git-restore-branch": {
        const branch = body.branch;
        const tip = body.tip;
        const upstream = body.upstream;
        const options = { cwd: directory };
        console.log(`[git-manager-service] ${JSON.stringify({ event: "restore-branch", directory, branch, tip, upstream })}`);
        try {
          await createBranch(branch, options, tip);
          if (upstream) {
            try {
              await setBranchUpstream(branch, `${upstream.remote}/${upstream.branch}`, options);
            } catch (upstreamError) {
              const message = upstreamError instanceof Error ? upstreamError.message : String(upstreamError);
              console.warn(`[git-manager-service] ${JSON.stringify({ event: "restore-branch", code: "UPSTREAM_RESTORE_FAILED", branch, message })}`);
            }
          }
          return Response.json({ success: true });
        } catch (error) {
          const stderr = error instanceof GitError && error.result.stderr ? error.result.stderr : error instanceof Error ? error.message : String(error);
          console.error(`[git-manager-service] ${JSON.stringify({ event: "restore-branch", code: "GIT_ERROR", message: stderr })}`);
          return Response.json({ code: "GIT_ERROR", message: stderr }, { status: 500 });
        }
      }
      case "/git-delete-remote-branch": {
        const remote = body.remote;
        const branch = body.branch;
        const options = { cwd: directory };
        console.log(`[git-manager-service] ${JSON.stringify({ event: "delete-remote-branch", directory, remote, branch })}`);
        try {
          await deleteRemoteBranch(remote, branch, options);
          return Response.json({ success: true });
        } catch (error) {
          const stderr = error instanceof GitError && error.result.stderr ? error.result.stderr : error instanceof Error ? error.message : String(error);
          console.error(`[git-manager-service] ${JSON.stringify({ event: "delete-remote-branch", code: "GIT_ERROR", message: stderr })}`);
          return Response.json({ code: "GIT_ERROR", message: stderr }, { status: 500 });
        }
      }
      case "/git-checkout-new": {
        const startPoint = body.startPoint;
        await checkoutNew(body.name, { cwd: directory }, startPoint);
        return Response.json({ success: true });
      }
      case "/git-rename-branch": {
        await renameBranch(body.oldName, body.newName, { cwd: directory });
        return Response.json({ success: true });
      }
      case "/git-rebase": {
        await rebase(body.branch, { cwd: directory });
        return Response.json({ success: true });
      }
      case "/git-rebase-abort": {
        await rebaseAbort({ cwd: directory });
        return Response.json({ success: true });
      }
      case "/git-rebase-continue": {
        await rebaseContinue({ cwd: directory });
        return Response.json({ success: true });
      }
      case "/git-merge-abort": {
        await abortMerge({ cwd: directory });
        return Response.json({ success: true });
      }
      case "/git-merge-continue": {
        await continueMerge({ cwd: directory });
        return Response.json({ success: true });
      }
      case "/git-cherry-pick": {
        const { execFile: execFile2 } = await import("child_process");
        const { promisify: promisify2 } = await import("util");
        const execFileAsync2 = promisify2(execFile2);
        await execFileAsync2("git", ["cherry-pick", body.hash], { cwd: directory });
        return Response.json({ success: true });
      }
      case "/git-branch-diff": {
        const diffs = await getBranchDiffFiles(body.from, body.to, { cwd: directory });
        return Response.json(diffs);
      }
      case "/git-log": {
        const branch = body.branch;
        const path2 = body.path;
        console.log("[git-manager-service] git-log, directory:", directory, "branch:", branch, "path:", path2, "limit:", body.limit);
        const commits = await getCommitLog(directory, body.limit, branch, path2);
        console.log("[git-manager-service] git-log \u7ED3\u679C, \u6570\u91CF:", commits.length);
        return Response.json(commits);
      }
      case "/git-files": {
        const files = await listTrackedFiles(directory);
        console.log("[git-manager-service] git-files, directory:", directory, "\u6570\u91CF:", files.length);
        return Response.json(files);
      }
      case "/git-show":
      case "/git-commit-detail": {
        const detail = await getCommitDetail(directory, body.hash);
        return Response.json(detail);
      }
      case "/git-diff":
      case "/git-commit-diffs": {
        const diffs = await getCommitFileDiffs(directory, body.hash);
        return Response.json(diffs);
      }
      case "/git-diff-vs-local": {
        const diffs = await getCommitDiff(body.hash, "", { cwd: directory });
        return Response.json(diffs);
      }
      case "/git-pull": {
        await pull({ cwd: directory });
        return Response.json({ success: true });
      }
      case "/git-push": {
        await push({ cwd: directory });
        return Response.json({ success: true });
      }
      case "/git-force-push": {
        await forcePush({ cwd: directory });
        return Response.json({ success: true });
      }
      case "/git-favorites-get": {
        const { readFileSync, existsSync } = await import("fs");
        const { join: join2 } = await import("path");
        const favPath = join2(directory, ".git", "git-manager-favorites.json");
        if (existsSync(favPath)) {
          const content = readFileSync(favPath, "utf-8");
          return Response.json(JSON.parse(content));
        }
        return Response.json([]);
      }
      case "/git-favorites-set": {
        const { writeFileSync } = await import("fs");
        const { join: join2 } = await import("path");
        const favPath = join2(directory, ".git", "git-manager-favorites.json");
        writeFileSync(favPath, JSON.stringify(body.favorites, null, 2));
        return Response.json({ success: true });
      }
      case "/git-stash-now": {
        const { execFile: execFile2 } = await import("child_process");
        const { promisify: promisify2 } = await import("util");
        const execFileAsync2 = promisify2(execFile2);
        await execFileAsync2("git", ["stash"], { cwd: directory });
        return Response.json({ success: true });
      }
      case "/git-fetch": {
        const { execFile: execFile2 } = await import("child_process");
        const { promisify: promisify2 } = await import("util");
        const execFileAsync2 = promisify2(execFile2);
        await execFileAsync2("git", ["fetch", "origin", "--prune"], { cwd: directory });
        return Response.json({ success: true });
      }
      case "/git-reset": {
        const { execFile: execFile2 } = await import("child_process");
        const { promisify: promisify2 } = await import("util");
        const execFileAsync2 = promisify2(execFile2);
        const mode = body.mode;
        const hash = body.hash;
        await execFileAsync2("git", ["reset", `--${mode}`, hash], { cwd: directory });
        return Response.json({ success: true });
      }
      case "/git-commit-edit-info": {
        const hash = body.hash;
        const head = await isHeadCommit(hash, { cwd: directory });
        const merge2 = await isMergeCommit(hash, { cwd: directory });
        return Response.json({ isHead: head, isMerge: merge2 });
      }
      case "/git-working-tree-clean": {
        const clean = await isWorkingTreeClean({ cwd: directory });
        return Response.json(clean);
      }
      case "/git-reword-commit": {
        await rewordCommit(body.hash, body.message, { cwd: directory });
        return Response.json({ success: true });
      }
      case "/git-drop-commit": {
        await dropCommit(body.hash, { cwd: directory });
        return Response.json({ success: true });
      }
      case "/git-push-up-to": {
        const ref = await pushUpToCommit(body.hash, body.branch, { cwd: directory });
        return Response.json({ success: true, ref });
      }
      case "/git-worktree-list": {
        const worktrees = await listWorktrees({ cwd: directory });
        return Response.json(worktrees);
      }
      case "/git-worktree-add": {
        await addWorktree(
          body.path,
          body.branch,
          body.createBranch === true,
          body.startPoint,
          { cwd: directory }
        );
        return Response.json({ success: true });
      }
      case "/git-worktree-remove": {
        await removeWorktree(body.path, body.force === true, { cwd: directory });
        return Response.json({ success: true });
      }
      case "/git-worktree-prune": {
        await pruneWorktrees({ cwd: directory });
        return Response.json({ success: true });
      }
      case "/git-command-logs": {
        const since = typeof body.since === "number" ? body.since : 0;
        const logs = getGitCommandLogs(since);
        const filtered = directory ? logs.filter((l) => l.cwd === directory) : logs;
        return Response.json(filtered);
      }
      case "/git-command-logs-clear": {
        clearGitCommandLogs();
        return Response.json({ success: true });
      }
      case "/git-revert": {
        const { execFile: execFile2 } = await import("child_process");
        const { promisify: promisify2 } = await import("util");
        const execFileAsync2 = promisify2(execFile2);
        await execFileAsync2("git", ["revert", "--no-edit", body.hash], { cwd: directory });
        return Response.json({ success: true });
      }
      case "/git-undo-commit": {
        await uncommitHead(body.hash, { cwd: directory });
        return Response.json({ success: true });
      }
      case "/git-is-repo": {
        const { execFile: execFile2 } = await import("child_process");
        const { promisify: promisify2 } = await import("util");
        const execFileAsync2 = promisify2(execFile2);
        try {
          await execFileAsync2("git", ["rev-parse", "--git-dir"], { cwd: directory });
          return Response.json(true);
        } catch {
          return Response.json(false);
        }
      }
      default:
        return new Response("Not Found", { status: 404 });
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return new Response(message, { status: 500 });
  }
}
var isMainModule = import_meta.main === true || typeof require !== "undefined" && typeof module !== "undefined" && require.main === module;
if (isMainModule) {
  if (typeof Bun !== "undefined") {
    Bun.serve({ port: PORT, fetch: handleRequest });
    console.log(`Service running on port ${PORT}`);
  } else {
    void import("node:http").then(({ createServer }) => {
      createServer((req, res) => {
        const chunks = [];
        req.on("data", (c) => chunks.push(c));
        req.on("end", () => {
          const body = Buffer.concat(chunks);
          const url = `http://127.0.0.1:${PORT}${req.url ?? "/"}`;
          const request = new Request(url, {
            method: req.method,
            headers: req.headers,
            body: body.length > 0 ? body : void 0
          });
          void handleRequest(request).then(async (response) => {
            res.writeHead(response.status, Object.fromEntries(response.headers));
            res.end(await response.text());
          }).catch(() => {
            res.writeHead(500);
            res.end("internal error");
          });
        });
      }).listen(PORT);
      console.log(`Service running on port ${PORT} (node)`);
    });
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  handleRequest
});
