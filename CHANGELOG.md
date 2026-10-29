# 更新日志

本项目遵循 [Keep a Changelog](https://keepachangelog.com/zh-CN/1.1.0/) 的格式约定，版本号遵循[语义化版本](https://semver.org/lang/zh-CN/)。本文件基于本仓库提交历史整理。

## [0.0.9] - 2026-10-29

### Changed

- The branch sidebar can now shrink to 160px, giving more room to the commit list; its header actions wrap when the column is too narrow for one row

## [0.0.8] - 2026-10-29

### Fixed

- The panel renders again after 0.0.7: a divider read the details column before that pane existed, so the shell threw during startup and stayed blank

## [0.0.7] - 2026-10-29

### Added

- Every pane boundary is now a draggable divider: branch column, details column, changed files vs diff preview, changed files vs commit details, and the bottom panel
- Divider sizes are clamped to the open panel, adjustable from the keyboard and remembered across reloads through host extension storage

### Fixed

- The bottom Console/Worktrees panel keeps its configured height instead of being squeezed by the main shell when it opens

## [0.0.6] - 2026-10-29

### Changed

- Panel appearance now follows the host theme: colours, fonts and radii come from the `--oc-*` tokens the host writes on `ready`, so light and dark both work without a rebuild
- Controls, dialogs, menus and the bottom panels draw from the SDK UI kit and one authored stylesheet; the 40px icon rail is gone and its actions moved into the branch header and the commit toolbar
- Diff lines are syntax highlighted from the host's `--syntax-*` tokens

### Fixed

- The panel no longer paints a dark surface inside a light theme, and no longer overrides the host's overlay scrollbars

## [0.0.5] - 2026-10-28

### 工程化

- 发布流程新增 VS Code 扩展打包：Release 与构建制品附带 git-manager-vscode-0.0.2.vsix 安装包

## [0.0.4] - 2026-10-28

### 新增

- 新增 VS Code 扩展（packages/vscode）：分支树、提交历史与提交图、差异对比、过滤与常用 git 操作，含单元测试与发布配置

### 修复

- 提交历史查询失败时不再静默返回空列表，改为向上抛出错误并提示

### 文档

- 各语言 README 补充商标声明，说明 IntelliJ IDEA 归属与本项目无隶属关系

## [0.0.3] - 2026-10-27

### 修复

- 调试日志路径硬编码为开发机路径导致其他机器写入失败：改为按平台写到用户目录（Windows %APPDATA%、macOS ~/Library/Logs、Linux XDG_CONFIG_HOME）
- 调试日志默认不再落盘：仅在环境变量 GIT_MANAGE_DEBUG=1（或 true）开启时写入，写入前自动创建目录，超过 1MiB 截断重写防止无限增长

## [0.0.2] - 2026-10-25

### 新增

- 新增 Worktrees 页签：支持列出、新建、移除与清理 worktree，操作结果均有明确提示
- 新增控制台页签：展示扩展执行的 git 命令日志，含命令、工作目录、耗时、退出码与输出，支持增量刷新与清空
- 提交右键菜单补齐常用操作：撤销提交、编辑提交信息、删除提交、推送此前所有提交
- 侧栏补齐分支操作：分支比较（支持多选两个分支与查看文件改动）、删除所选分支、更新所选（fetch --prune）、只显示我的分支
- 支持 zip、文件夹与 Git URL 三种安装方式，本地开发自动构建

### 修复

- 多选分支后删除只删掉一个分支：改为多选优先于单选，包含当前分支时整体中止，逐个删除并汇总失败项
- 操作失败普遍缺少提示：新增统一错误提示，按冲突、认证失败、网络不可达、推送被拒等原因归类，并保留原始错误供复制
- 获取远程更新增加进度提示与分类错误处理，失败时不再只有一个无说明的错误框
- 新建分支失败时按原因给出简短提示，不再直接展示多行文件清单
- 升级 @openchamber/sdk 至 2.5.1，修复 service 脱离 Bun 无法启动、非 HEAD 提交改写提交信息在 macOS 失效等问题

### 工程化

- 构建产物统一输出到 dist/ 并移出版本库，新增打包脚本与 GitHub Release 流程
- 单元测试扩充至 826 例，新增 service 路由白盒测试与黑盒业务流程测试，并接入持续集成

## [0.0.1] - 2026-10-23

首个公开版本。

### 新增

- 提供 IntelliJ IDEA 风格的 Git 工具窗面板：本地与远程分支分组浏览、收藏常用分支，支持新建、重命名、切换与删除
- 支持提交历史列表与提交图、提交详情查看，以及 cherry-pick、revert、stash 等常用提交操作
- 支持文件级与提交级差异对比，以及直观的暂存区管理
- 支持大小写、正则、分支、作者、日期、路径等多条件组合过滤，路径提供 IDEA 风格树形多选
- 内置 12 种语言界面，覆盖中文、英语、日语、韩语、德语、法语等主流语种
- 删除分支打通完整链路：已合并分支去掉确认直接删除；未合并分支弹出强制确认对话框；删除后展示还原通知卡片，可一键还原或删除远程跟踪分支
- 新增 IntelliJ IDEA Git 工具窗功能规格文档（docs/git-ide-feature-spec.md）与规格覆盖盘点文档（docs/spec-coverage.md）

### 工程化

- 添加 GitHub Actions 持续集成：构建 → 类型检查 → 全量单元测试（667 例）
- 补齐 openchamber 包全量类型检查基线，修复 34 处类型问题
- 统一三包版本号为 0.0.1，采用 pnpm workspace 管理 core 与 openchamber 两个包
- 以 Apache-2.0 协议开源，完善 README（项目说明、功能介绍、面板截图与致谢）

[0.0.1]: https://github.com/GuoChen-thlg/git-manage/releases/tag/v0.0.1
[0.0.2]: https://github.com/GuoChen-thlg/git-manage/releases/tag/v0.0.2
