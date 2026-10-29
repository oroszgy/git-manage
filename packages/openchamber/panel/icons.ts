/**
 * SVG 图标定义
 * 基于 IntelliJ 风格的图标
 */

/** 图标类型定义 */
export interface Icon {
  svg: string;
  width?: number;
  height?: number;
}

/** 图标集合 */
export const ICONS: Record<string, Icon> = {
  // 隐藏分支面板 (←)：分支面板展开时显示，点击可收起
  hideBranches: {
    svg: `<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M10 13L5 8L10 3" stroke="currentColor" stroke-width="2"/></svg>`,
  },
  // 显示分支面板 (>)：分支面板隐藏时显示，点击可展开
  showBranches: {
    svg: `<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M6 13L11 8L6 3" stroke="currentColor" stroke-width="2"/></svg>`,
  },
  // 删除所选分支（IDEA AllIcons.Actions.GC 垃圾桶字形，新 UI 灰色）
  deleteBranch: {
    svg: `<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill="currentColor" d="M6,2 L6,1 L10,1 L10,2 L13,2 L13,4 L3,4 L3,2 L6,2 Z M4,12.7142858 L4,5 L12,5 L12,12.7142858 C12,13.4214286 11.4,14 10.6666667,14 L5.33333333,14 C4.6,14 4,13.4214286 4,12.7142858 Z"/></svg>`,
  },
  // 与当前分支比较（IDEA AllIcons.Vcs.Diff 字形，新 UI 灰色双向箭头）
  compareBranch: {
    svg: `<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M5.85355 8.14645C5.65829 7.95118 5.34171 7.95118 5.14645 8.14645C4.95118 8.34171 4.95118 8.65829 5.14645 8.85355L7.29289 11H0.5C0.223858 11 0 11.2239 0 11.5C0 11.7761 0.223858 12 0.5 12H7.29289L5.14645 14.1464C4.95118 14.3417 4.95118 14.6583 5.14645 14.8536C5.34171 15.0488 5.65829 15.0488 5.85355 14.8536L8.85355 11.8536L9.20711 11.5L8.85355 11.1464L5.85355 8.14645Z" fill="currentColor"/><path fill-rule="evenodd" clip-rule="evenodd" d="M10.1464 1.14645C10.3417 0.951185 10.6583 0.951185 10.8536 1.14645C11.0488 1.34171 11.0488 1.65829 10.8536 1.85355L8.70711 4H15.5C15.7761 4 16 4.22386 16 4.5C16 4.77614 15.7761 5 15.5 5H8.70711L10.8536 7.14645C11.0488 7.34171 11.0488 7.65829 10.8536 7.85355C10.6583 8.04882 10.3417 8.04882 10.1464 7.85355L7.14645 4.85355L6.79289 4.5L7.14645 4.14645L10.1464 1.14645Z" fill="currentColor"/></svg>`,
  },
  // 只显示我的分支（人形图标，与搜索框的放大镜区分）
  myBranches: {
    svg: `<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="8" cy="5.4" r="2.6" stroke="currentColor" stroke-width="1.4"/><path d="M3.4 13.4c.7-2.5 2.5-3.7 4.6-3.7s3.9 1.2 4.6 3.7" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg>`,
  },
  // 新建分支 (+)
  newBranch: {
    svg: `<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M8 2V14M2 8H14" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>`,
  },
  // 签出分支 (checkout)
  checkout: {
    svg: `<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><g fill="none" fill-rule="evenodd"><rect width="2" height="12.332" x="7.927" y=".901" style="fill: var(--oc-primary)" transform="rotate(45 8.927 7.067)"/><polygon style="fill: var(--oc-primary)" points="3 6 10 13 3 13"/></g></svg>`,
  },
  // 删除分支 (trash)
  delete: {
    svg: `<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3 4H13M5 4V3C5 2.45 5.45 2 6 2H10C10.55 2 11 2.45 11 3V4M4 4L5 14H11L12 4M6.5 7V11M9.5 7V11" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  },
  // 更新所选（IDEA AllIcons.Actions.CheckOut 字形，Update Selected 动作图标；新 UI 下渲染为灰色）
  updateSelected: {
    svg: `<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><g fill="none" fill-rule="evenodd"><rect width="2" height="12.332" x="7.927" y=".901" fill="currentColor" transform="rotate(45 8.927 7.067)"/><polygon fill="currentColor" points="3 6 10 13 3 13"/></g></svg>`,
  },
  // 刷新 (refresh)
  refresh: {
    svg: `<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M12.5747152,11.8852806 C11.4741474,13.1817355 9.83247882,14.0044386 7.99865879,14.0044386 C5.03907292,14.0044386 2.57997332,11.8615894 2.08820756,9.0427473 L3.94774327,9.10768372 C4.43372186,10.8898575 6.06393114,12.2000519 8.00015362,12.2000519 C9.30149237,12.2000519 10.4645985,11.6082097 11.2349873,10.6790094 L9.05000019,8.71167959 L14.0431479,8.44999981 L14.3048222,13.4430431 L12.5747152,11.8852806 Z M3.42785637,4.11741586 C4.52839138,2.82452748 6.16775464,2.00443857 7.99865879,2.00443857 C10.918604,2.00443857 13.3513802,4.09026967 13.8882946,6.8532307 L12.0226389,6.78808057 C11.5024872,5.05935553 9.89838095,3.8000774 8.00015362,3.8000774 C6.69867367,3.8000774 5.53545628,4.39204806 4.76506921,5.32142241 L6.95482203,7.29304326 L1.96167436,7.55472304 L1.70000005,2.56167973 L3.42785637,4.11741586 Z" fill="currentColor"/></svg>`,
  },
  // 收藏 (star)
  favorite: {
    svg: `<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M8.46197 2.38123C8.38441 2.19475 8.20227 2.07324 8.00031 2.07324C7.79834 2.07324 7.61621 2.19475 7.53865 2.38123L6.06891 5.9149L2.25401 6.22074C2.05269 6.23688 1.88085 6.37255 1.81844 6.56463C1.75603 6.75671 1.8153 6.96748 1.96869 7.09887L4.87524 9.58864L3.98724 13.3113C3.94038 13.5078 4.01631 13.7131 4.1797 13.8319C4.3431 13.9506 4.56186 13.9593 4.73422 13.854L8.00031 11.8591L11.2664 13.854C11.4387 13.9593 11.6575 13.9506 11.8209 13.8319C11.9843 13.7131 12.0602 13.5078 12.0134 13.3113L11.1254 9.58864L14.0319 7.09887C14.1853 6.96748 14.2446 6.75671 14.1822 6.56463C14.1198 6.37255 13.9479 6.23688 13.7466 6.22074L9.9317 5.9149L8.46197 2.38123Z" style="fill: var(--oc-warning)"/></svg>`,
  },
  // 未收藏 (star outline)
  favoriteOutline: {
    svg: `<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M7.99982 2.073C8.20178 2.073 8.38392 2.1945 8.46148 2.38098L9.93122 5.91466L13.7461 6.2205C13.9474 6.23664 14.1193 6.37231 14.1817 6.56439C14.2441 6.75647 14.1848 6.96723 14.0314 7.09862L11.1249 9.58839L12.0129 13.3111C12.0597 13.5075 11.9838 13.7129 11.8204 13.8316C11.657 13.9503 11.4383 13.9591 11.2659 13.8538L7.99982 11.8589L4.73373 13.8538C4.56138 13.9591 4.34261 13.9503 4.17921 13.8316C4.01582 13.7129 3.93989 13.5075 3.98675 13.3111L4.87475 9.58839L1.9682 7.09862C1.81482 6.96723 1.75554 6.75647 1.81795 6.56439C1.88036 6.37231 2.0522 6.23664 2.25352 6.2205L6.06842 5.91466L7.53816 2.38098C7.61572 2.1945 7.79785 2.073 7.99982 2.073ZM7.99982 3.87498L6.87446 6.58067C6.80245 6.75379 6.63965 6.87207 6.45275 6.88705L3.53173 7.12123L5.75724 9.02762C5.89964 9.14959 5.96182 9.34098 5.91832 9.52336L5.23839 12.3738L7.73919 10.8463C7.8992 10.7486 8.10044 10.7486 8.26045 10.8463L10.7612 12.3738L10.0813 9.52336C10.0378 9.34098 10.1 9.14959 10.2424 9.02762L12.4679 7.12123L9.54688 6.88705C9.35999 6.87207 9.19718 6.75379 9.12518 6.58067L7.99982 3.87498Z" style="fill: var(--oc-warning)"/></svg>`,
  },
  // 设置 (gear)
  settings: {
    svg: `<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill="currentColor" fill-rule="evenodd" d="M12.7078144,8.94092644 L14.1860171,10.0014962 C13.9015285,10.8814083 13.4345167,11.6792367 12.8296171,12.3503459 L11.1720587,11.6025852 C10.7002906,12.0182974 10.1462196,12.3427961 9.53742767,12.5484995 L9.35682478,14.3581758 C8.91920787,14.4511061 8.46531382,14.5 8,14.5 C7.53468618,14.5 7.08079213,14.4511061 6.64317522,14.3581758 L6.46257231,12.5484994 C5.85378047,12.3427959 5.29970962,12.0182972 4.82794166,11.6025851 L3.1703829,12.3503459 C2.5654833,11.6792367 2.0984715,10.8814083 1.8139829,10.0014962 L3.29218604,8.94092614 C3.23171292,8.63665953 3.20000005,8.32203335 3.20000005,8.00000024 C3.20000005,7.67796698 3.23171295,7.36334066 3.29218612,7.05907392 L1.8139829,5.99850385 C2.0984715,5.11859166 2.5654833,4.32076327 3.1703829,3.64965409 L4.82794202,4.39741509 C5.29970989,3.98170311 5.85378059,3.65720451 6.46257226,3.45150114 L6.64317522,1.64182422 C7.08079213,1.54889386 7.53468618,1.5 8,1.5 C8.46531382,1.5 8.91920787,1.54889386 9.35682478,1.64182422 L9.53742772,3.45150097 C10.1462195,3.65720431 10.7002903,3.98170292 11.1720583,4.39741495 L12.8296171,3.64965409 C13.4345167,4.32076327 13.9015285,5.11859166 14.1860171,5.99850385 L12.7078143,7.05907362 C12.7682875,7.36334046 12.8000004,7.67796687 12.8000004,8.00000024 C12.8000004,8.32203346 12.7682875,8.63665973 12.7078144,8.94092644 Z M7.99999976,10.3003956 C9.27025466,10.3003956 10.2999997,9.27056196 10.2999997,8.00019773 C10.2999997,6.72983349 9.27025466,5.69999981 7.99999976,5.69999981 C6.72974486,5.69999981 5.69999981,6.72983349 5.69999981,8.00019773 C5.69999981,9.27056196 6.72974486,10.3003956 7.99999976,10.3003956 Z"/></svg>`,
  },
  // 全部展开 (expand)
  expandAll: {
    svg: `<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M4.5 5.5L8 2L11.5 5.5" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"/><path d="M4.5 10.5L8 14L11.5 10.5" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  },
  // Cherry-pick（两个分支节点 + 挑拣箭头）
  cherryPick: {
    svg: `<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M6.5 11C6.5 12.1046 5.60457 13 4.5 13C3.39543 13 2.5 12.1046 2.5 11C2.5 9.89543 3.39543 9 4.5 9C5.60457 9 6.5 9.89543 6.5 11ZM4.5 14C6.15685 14 7.5 12.6569 7.5 11C7.5 9.34315 6.15685 8 4.5 8C2.84315 8 1.5 9.34315 1.5 11C1.5 12.6569 2.84315 14 4.5 14ZM13.5 11C13.5 12.1046 12.6046 13 11.5 13C10.3954 13 9.5 12.1046 9.5 11C9.5 9.89543 10.3954 9 11.5 9C12.6046 9 13.5 9.89543 13.5 11ZM11.5 14C13.1569 14 14.5 12.6569 14.5 11C14.5 9.34315 13.1569 8 11.5 8C9.84315 8 8.5 9.34315 8.5 11C8.5 12.6569 9.84315 14 11.5 14Z" fill="currentColor"/><path fill-rule="evenodd" clip-rule="evenodd" d="M11.8537 1.14647C11.7934 1.08617 11.7216 1.04449 11.6453 1.02143C11.5869 1.00372 11.5244 0.996452 11.46 1.00164L11.4585 1.00175L11.4577 1.00183C8.89299 1.21581 7.10682 2.51359 5.92996 4.03112C4.76214 5.53699 4.18349 7.26955 4.00588 8.424C3.9639 8.69693 4.15111 8.95222 4.42404 8.99421C4.69697 9.0362 4.95227 8.84899 4.99426 8.57606C5.14998 7.56384 5.67133 5.9964 6.72018 4.64394C7.43375 3.72381 8.38624 2.9082 9.6361 2.42686L10.8329 1.87283L10.1507 2.48553C9.63716 3.45813 9.48624 4.482 9.53842 5.42758C9.61459 6.8079 10.1221 8.0385 10.5761 8.76503C10.7225 8.9992 11.031 9.07038 11.2651 8.92403C11.4993 8.77767 11.5705 8.4692 11.4241 8.23503C11.0449 7.62822 10.6024 6.55883 10.5369 5.37248C10.4723 4.20114 10.7737 2.93361 11.8537 1.85358C12.049 1.65832 12.049 1.34174 11.8537 1.14647Z" fill="currentColor"/></svg>`,
  },
  // 折叠全部
  collapseAll: {
    svg: `<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M4.5 2.5L8 6L11.5 2.5" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"/><path d="M4.5 13.5L8 10L11.5 13.5" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  },
  // 获取远程更新（fetch）
  fetch: {
    svg: `<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12.8536 3.14645C13.0488 3.34171 13.0488 3.65829 12.8536 3.85355L11.4393 5.26777C11.2441 5.46303 10.9275 5.46303 10.7322 5.26777C10.537 5.0725 10.537 4.75592 10.7322 4.56066L12.1464 3.14645C12.3417 2.95118 12.6583 2.95118 12.8536 3.14645Z" fill="currentColor"/><path d="M10.0251 5.97487C10.2204 6.17014 10.2204 6.48672 10.0251 6.68198L8.61091 8.09619C8.41565 8.29146 8.09907 8.29146 7.90381 8.09619C7.70854 7.90093 7.70854 7.58435 7.90381 7.38909L9.31802 5.97487C9.51328 5.77961 9.82986 5.77961 10.0251 5.97487Z" fill="currentColor"/><path d="M7.1967 8.8033C7.39196 8.99856 7.39196 9.31515 7.1967 9.51041L5.78249 10.9246C5.58722 11.1199 5.27064 11.1199 5.07538 10.9246C4.88012 10.7294 4.88012 10.4128 5.07538 10.2175L6.48959 8.8033C6.68485 8.60804 7.00144 8.60804 7.1967 8.8033Z" fill="currentColor"/><path d="M3.5 5C3.77614 5 4 5.22386 4 5.5V7.5C4 7.77614 3.77614 8 3.5 8C3.22386 8 3 7.77614 3 7.5V5.5C3 5.22386 3.22386 5 3.5 5Z" fill="currentColor"/><path d="M3.5 9C3.77614 9 4 9.22386 4 9.5V12H6.5C6.77614 12 7 12.2239 7 12.5C7 12.7761 6.77614 13 6.5 13H3.5C3.22386 13 3 12.7761 3 12.5V9.5C3 9.22386 3.22386 9 3.5 9Z" fill="currentColor"/><path d="M8 12.5C8 12.2239 8.22386 12 8.5 12H10.5C10.7761 12 11 12.2239 11 12.5C11 12.7761 10.7761 13 10.5 13H8.5C8.22386 13 8 12.7761 8 12.5Z" fill="currentColor"/></svg>`,
  },
  // 在日志中定位所选分支（Locate）
  locate: {
    svg: `<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M8.5 5V2.02054C11.4149 2.26101 13.739 4.5851 13.9795 7.5H11C10.7239 7.5 10.5 7.72386 10.5 8C10.5 8.27614 10.7239 8.5 11 8.5H13.9795C13.739 11.4149 11.4149 13.739 8.5 13.9795V11C8.5 10.7239 8.27614 10.5 8 10.5C7.72386 10.5 7.5 10.7239 7.5 11V13.9795C4.5851 13.739 2.26101 11.4149 2.02054 8.5H5C5.27614 8.5 5.5 8.27614 5.5 8C5.5 7.72386 5.27614 7.5 5 7.5H2.02054C2.26101 4.5851 4.5851 2.26101 7.5 2.02054V5C7.5 5.27614 7.72386 5.5 8 5.5C8.27614 5.5 8.5 5.27614 8.5 5ZM1 8C1 4.13401 4.13401 1 8 1C11.866 1 15 4.13401 15 8C15 11.866 11.866 15 8 15C4.13401 15 1 11.866 1 8Z" fill="currentColor"/></svg>`,
  },
  // 排序 (sort)
  sort: {
    svg: `<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M4 3V13M4 13L2 11M4 13L6 11M12 13V3M12 3L10 5M12 3L14 5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  },
  // 远程 (globe)
  remote: {
    svg: `<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="8" cy="8" r="6" stroke="currentColor" stroke-width="1.5"/><path d="M2 8H14M8 2C10 4 10 12 8 14M6 2C4 4 4 12 6 14M10 2C12 4 12 12 10 14" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>`,
  },
  // Pull (下载)
  pull: {
    svg: `<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M8 2V10M8 10L5 7M8 10L11 7M2 12V14H14V12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  },
  // Push (上传)
  push: {
    svg: `<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M8 10V2M8 2L5 5M8 2L11 5M2 12V14H14V12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  },
  // 关闭 (x)
  close: {
    svg: `<svg width="10" height="10" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M2 2L8 8M8 2L2 8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>`,
  },
  // 更多选项 (more)
  more: {
    svg: `<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="8" cy="3" r="1.5" fill="currentColor"/><circle cx="8" cy="8" r="1.5" fill="currentColor"/><circle cx="8" cy="13" r="1.5" fill="currentColor"/></svg>`,
  },
  // 正则 (regex)
  regex: {
    svg: `<svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3 7C3 5 5 3 7 3C9 3 11 5 11 7C11 9 9 11 7 11" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/><path d="M4 4L2 2M10 4L12 2" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/></svg>`,
  },
  // 搜索 (magnifier)
  search: {
    svg: `<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="7" cy="7" r="4.5" stroke="currentColor" stroke-width="1.5"/><path d="M10.5 10.5L14 14" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>`,
  },
  // 当前分支 (checkmark)
  currentBranch: {
    svg: `<svg width="12" height="12" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M4 8L7 11L12 5" style="stroke: var(--oc-primary)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  },
  // 未推送 (上传箭头)
  unpushed: {
    svg: `<svg width="10" height="10" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M8 10V2M8 2L5 5M8 2L11 5" style="stroke: var(--oc-success)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  },
  // 未拉取 (下载箭头)
  unpulled: {
    svg: `<svg width="10" height="10" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M8 2V10M8 10L5 7M8 10L11 7" style="stroke: var(--oc-primary)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  },
  // 本地分支 (分支图标)
  localBranch: {
    svg: `<svg width="14" height="14" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M4 2V14M12 2V14M4 8H12M4 5H12M4 11H12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>`,
  },
  // 远程分支 (分支图标)
  remoteBranch: {
    svg: `<svg width="14" height="14" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M4 2V14M12 2V14M4 8H12M4 5H12M4 11H12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><circle cx="4" cy="5" r="1.5" fill="currentColor"/><circle cx="12" cy="5" r="1.5" fill="currentColor"/></svg>`,
  },
  // 标签 (tag)
  tag: {
    svg: `<svg width="14" height="14" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M2 2H7L14 9L9 14L2 7V2Z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/></svg>`,
  },
  // 加载中 (spinner)
  loading: {
    svg: `<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M8 1V3M8 13V15M1 8H3M13 8H15M2.9 2.9L4.3 4.3M11.7 11.7L13.1 13.1M13.1 2.9L11.7 4.3M4.3 11.7L2.9 13.1" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><animateTransform attributeName="transform" type="rotate" from="0 8 8" to="360 8 8" dur="1s" repeatCount="indefinite"/></path></svg>`,
  },
  // 下载 (download)
  download: {
    svg: `<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M8 2V10M8 10L5 7M8 10L11 7M2 12V14H14V12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  },
  // 对比 (compare)
  compare: {
    svg: `<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M4 3V13M12 3V13M4 8H12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><path d="M6 5L3 8L6 11" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M10 5L13 8L10 11" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  },
  // 分支图标 (branch)
  branchIcon: {
    svg: `<svg width="14" height="14" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M5 2V14M11 2V14M5 8H11" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><circle cx="5" cy="5" r="2" fill="currentColor"/><circle cx="11" cy="11" r="2" fill="currentColor"/></svg>`,
  },
  // 图形 (graph)
  graph: {
    svg: `<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="4" cy="4" r="2" stroke="currentColor" stroke-width="1.5"/><circle cx="4" cy="12" r="2" stroke="currentColor" stroke-width="1.5"/><circle cx="12" cy="8" r="2" stroke="currentColor" stroke-width="1.5"/><path d="M4 6V10M6 4H8L10 8M6 12H8L10 8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>`,
  },
  // 设置齿轮 (gearSettings)
  gearSettings: {
    svg: `<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill="currentColor" fill-rule="evenodd" d="M12.7078144,8.94092644 L14.1860171,10.0014962 C13.9015285,10.8814083 13.4345167,11.6792367 12.8296171,12.3503459 L11.1720587,11.6025852 C10.7002906,12.0182974 10.1462196,12.3427961 9.53742767,12.5484995 L9.35682478,14.3581758 C8.91920787,14.4511061 8.46531382,14.5 8,14.5 C7.53468618,14.5 7.08079213,14.4511061 6.64317522,14.3581758 L6.46257231,12.5484994 C5.85378047,12.3427959 5.29970962,12.0182972 4.82794166,11.6025851 L3.1703829,12.3503459 C2.5654833,11.6792367 2.0984715,10.8814083 1.8139829,10.0014962 L3.29218604,8.94092614 C3.23171292,8.63665953 3.20000005,8.32203335 3.20000005,8.00000024 C3.20000005,7.67796698 3.23171295,7.36334066 3.29218612,7.05907392 L1.8139829,5.99850385 C2.0984715,5.11859166 2.5654833,4.32076327 3.1703829,3.64965409 L4.82794202,4.39741509 C5.29970989,3.98170311 5.85378059,3.65720451 6.46257226,3.45150114 L6.64317522,1.64182422 C7.08079213,1.54889386 7.53468618,1.5 8,1.5 C8.46531382,1.5 8.91920787,1.54889386 9.35682478,1.64182422 L9.53742772,3.45150097 C10.1462195,3.65720431 10.7002903,3.98170292 11.1720583,4.39741495 L12.8296171,3.64965409 C13.4345167,4.32076327 13.9015285,5.11859166 14.1860171,5.99850385 L12.7078143,7.05907362 C12.7682875,7.36334046 12.8000004,7.67796687 12.8000004,8.00000024 C12.8000004,8.32203346 12.7682875,8.63665973 12.7078144,8.94092644 Z M7.99999976,10.3003956 C9.27025466,10.3003956 10.2999997,9.27056196 10.2999997,8.00019773 C10.2999997,6.72983349 9.27025466,5.69999981 7.99999976,5.69999981 C6.72974486,5.69999981 5.69999981,6.72983349 5.69999981,8.00019773 C5.69999981,9.27056196 6.72974486,10.3003956 7.99999976,10.3003956 Z"/></svg>`,
  },
  // 跳转到引用 (goToRef)
  goToRef: {
    svg: `<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3 8H13M13 8L9 4M13 8L9 12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  },
};

/**
 * 获取图标 HTML 字符串
 */
export function getIcon(name: string): string {
  return ICONS[name]?.svg ?? '';
}

/**
 * 创建图标元素
 */
export function createIconElement(name: string): HTMLElement {
  const icon = ICONS[name];
  if (!icon) {
    const span = document.createElement('span');
    span.textContent = '?';
    return span;
  }
  
  const div = document.createElement('div');
  div.innerHTML = icon.svg;
  div.style.display = 'inline-flex';
  div.style.alignItems = 'center';
  div.style.justifyContent = 'center';
  
  const svg = div.firstElementChild as SVGElement;
  if (svg) {
    svg.style.width = `${icon.width ?? 16}px`;
    svg.style.height = `${icon.height ?? 16}px`;
  }
  
  return div;
}
