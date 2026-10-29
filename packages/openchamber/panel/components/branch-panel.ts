/**
 * Branch panel.
 *
 * A tree of HEAD / local / remote groups, with folder grouping inside "Local".
 * The header holds the branch actions that used to sit in the icon rail (see
 * issue #23): the rail is gone, so nothing about branch handling lives outside
 * this panel any more. The search row keeps the "my branches" toggle, which is
 * a filter rather than an action.
 */

import { mountSearchField } from '@openchamber/sdk/ui';
import type { SearchFieldHandle } from '@openchamber/sdk/ui';

import { html } from '../html';
import { getState, setState, subscribeFields, Branch, PanelState } from '../state';
import { ServiceClient } from '../service';
import { getIcon } from '../icons';
import { t } from '../i18n';
import { showContextMenu } from './context-menu';

/** Branch actions owned by main; the panel only renders and gates them. */
export interface BranchActions {
  onNewBranch: () => void;
  onUpdateSelected: () => void;
  onFetch: () => void;
  onDeleteBranch: () => void;
  onCompareBranch: () => void;
  onToggleMyBranches: () => void;
  onFavorite: () => void;
}

interface HeaderAction {
  key: string;
  icon: string;
  titleKey: string;
}

/** Header buttons in IDEA tool-window order; expand/collapse are handled locally. */
const HEADER_ACTIONS: readonly HeaderAction[] = [
  { key: 'newBranch', icon: 'newBranch', titleKey: 'sidebar.newBranch' },
  { key: 'refresh', icon: 'updateSelected', titleKey: 'sidebar.update' },
  { key: 'fetch', icon: 'fetch', titleKey: 'sidebar.fetch' },
  { key: 'delete', icon: 'deleteBranch', titleKey: 'sidebar.deleteBranch' },
  { key: 'compare', icon: 'compareBranch', titleKey: 'sidebar.compareBranch' },
  { key: 'favorite', icon: 'favoriteOutline', titleKey: 'sidebar.favorite' },
  { key: 'expandAll', icon: 'expandAll', titleKey: 'sidebar.expandAll' },
  { key: 'collapseAll', icon: 'collapseAll', titleKey: 'sidebar.collapseAll' },
];

/**
 * Why a branch action is unavailable, or null when it can run.
 * Mirrors the IDEA action update() rules the icon rail used to apply.
 */
function unavailableReason(key: string, state: PanelState): string | null {
  const localBranches = state.branches.filter(b => !b.isRemote);
  const hasRemote = state.branches.some(b => b.isRemote);
  const selected = state.selectedBranch;
  switch (key) {
    case 'newBranch':
      return localBranches.length === 0 ? t('sidebar.newBranchUnavailable') : null;
    case 'refresh':
      return hasRemote ? null : t('sidebar.updateUnavailable');
    case 'fetch':
      if (state.fetching) return t('sidebar.fetchInProgress');
      return hasRemote ? null : t('sidebar.updateUnavailable');
    case 'delete':
      if (!selected) return t('branch.selectBranch');
      if (selected.isCurrent) return t('branch.deleteCurrent');
      if (selected.isRemote) return t('sidebar.deleteRemoteUnavailable');
      return null;
    case 'compare':
      if (state.selectedBranches.size === 2) return null;
      if (!selected) return t('compare.selectBranch');
      if (selected.isCurrent) return t('compare.currentBranch');
      return null;
    case 'favorite':
      return selected || state.selectedBranches.size > 0 ? null : t('branch.selectBranch');
    case 'expandAll':
    case 'collapseAll':
      return state.branches.length === 0 ? t('sidebar.expandAllUnavailable') : null;
    default:
      return null;
  }
}

/**
 * Create the branch panel.
 * @param container Mount point (filled with header, search row and tree)
 * @param service Service client, used by the branch context menu
 * @param directory Current repository directory
 * @param onBranchSelect Click on a branch: main loads that branch's commits
 * @param onSelectionCleared Click on empty space: main clears selection and filter
 * @param actions Handlers for the header actions
 */
export function createBranchPanel(
  container: HTMLElement,
  service: ServiceClient,
  directory: string,
  onBranchSelect: (branch: Branch) => void,
  onSelectionCleared: () => void,
  actions: BranchActions,
): { dispose: () => void; expandAll: () => void; collapseAll: () => void } {
  let disposed = false;
  let listContainer: HTMLElement | null = null;
  let search: SearchFieldHandle | null = null;
  let myBranchesBtn: HTMLElement | null = null;
  const headerButtons = new Map<string, HTMLElement>();
  const expandedGroups = new Set<string>([t('branch.groupHead'), t('branch.groupLocal')]);
  let unsubscribe: (() => void) | null = null;

  const findBranchFromEvent = (e: Event): Branch | null => {
    const target = e.target as HTMLElement;
    const item = target.closest('[data-branch]');
    if (!item) return null;
    const branchName = item.getAttribute('data-branch');
    if (!branchName) return null;
    const state = getState();
    const branch = state.branches.find(b => b.name === branchName) || null;
    if (!branch) {
      console.error(JSON.stringify({
        prefix: '[branch-panel]',
        event: 'branch_not_found',
        branchName,
        availableCount: state.branches.length,
        targetTag: target.tagName,
      }));
    }
    return branch;
  };

  const findGroupFromEvent = (e: Event): string | null => {
    const target = e.target as HTMLElement;
    const item = target.closest('[data-group]');
    if (!item) return null;
    return item.getAttribute('data-group');
  };

  const buildHeader = (): HTMLElement => {
    const header = html`
      <div class="gm-branches__header">
        <span class="gm-branches__title">${t('branch.title')}</span>
      </div>
    `;

    for (const action of HEADER_ACTIONS) {
      const title = t(action.titleKey);
      const btn = html`
        <button type="button" class="gm-icon-btn" data-branch-action="${action.key}" title="${title}" aria-label="${title}">
          ${getIcon(action.icon)}
        </button>
      `;
      header.appendChild(btn);
      headerButtons.set(action.key, btn);
    }

    header.addEventListener('click', (e) => {
      if (disposed) return;
      const btn = (e.target as HTMLElement).closest<HTMLElement>('[data-branch-action]');
      if (!btn) return;
      const key = btn.dataset.branchAction ?? '';
      if (key === 'newBranch') actions.onNewBranch();
      else if (key === 'refresh') actions.onUpdateSelected();
      else if (key === 'fetch') actions.onFetch();
      else if (key === 'delete') actions.onDeleteBranch();
      else if (key === 'compare') actions.onCompareBranch();
      else if (key === 'favorite') actions.onFavorite();
      else if (key === 'expandAll') expandAll();
      else if (key === 'collapseAll') collapseAll();
    });

    return header;
  };

  const buildSearchRow = (): HTMLElement => {
    const row = html`<div class="gm-branches__search"></div>`;
    search = mountSearchField(row, {
      value: getState().branchFilter,
      placeholder: t('branch.searchPlaceholder'),
      label: t('branch.searchPlaceholder'),
      onChange: (value) => {
        setState(s => { s.branchFilter = value; });
      },
    });

    const title = t('sidebar.showMyBranches');
    myBranchesBtn = html`
      <button type="button" class="gm-icon-btn" data-branch-action="myBranches" title="${title}" aria-label="${title}" aria-pressed="false">
        ${getIcon('myBranches')}
      </button>
    `;
    myBranchesBtn.addEventListener('click', () => {
      if (disposed) return;
      const state = getState();
      if (!state.branches.some(b => !b.isRemote)) return;
      actions.onToggleMyBranches();
    });
    row.appendChild(myBranchesBtn);
    return row;
  };

  /** Sync header availability, favourite icon and the "my branches" toggle. */
  const syncActions = (): void => {
    const state = getState();
    for (const action of HEADER_ACTIONS) {
      const btn = headerButtons.get(action.key);
      if (!btn) continue;
      const reason = unavailableReason(action.key, state);
      btn.setAttribute('aria-disabled', String(reason !== null));
      if (reason === null) {
        btn.removeAttribute('disabled');
        btn.setAttribute('title', t(action.titleKey));
        btn.setAttribute('aria-label', t(action.titleKey));
      } else {
        btn.setAttribute('disabled', '');
        btn.setAttribute('title', reason);
        btn.setAttribute('aria-label', reason);
      }
    }

    // Filled star only when every selected branch is already a favourite.
    const favourite = headerButtons.get('favorite');
    if (favourite) {
      const names = state.selectedBranches.size > 0
        ? [...state.selectedBranches]
        : (state.selectedBranch ? [state.selectedBranch.name] : []);
      const allFavorited = names.length > 0 && names.every(name => state.favorites.has(name));
      favourite.innerHTML = allFavorited ? getIcon('favorite') : getIcon('favoriteOutline');
    }

    if (myBranchesBtn) {
      const hasLocal = state.branches.some(b => !b.isRemote);
      myBranchesBtn.setAttribute('aria-pressed', String(state.showOnlyMyBranches));
      myBranchesBtn.setAttribute('aria-disabled', String(!hasLocal));
      const title = !hasLocal
        ? t('sidebar.myBranchesUnavailable')
        : state.showOnlyMyBranches ? t('sidebar.showMyBranchesOn') : t('sidebar.showMyBranches');
      myBranchesBtn.setAttribute('title', title);
      myBranchesBtn.setAttribute('aria-label', title);
    }

    search?.update({ value: state.branchFilter });
  };

  const renderList = () => {
    if (disposed || !listContainer) return;
    const state = getState();
    listContainer.innerHTML = '';

    const filteredBranches = state.branches.filter(branch => {
      // "Only my branches" applies to local and remote branches alike.
      if (state.showOnlyMyBranches && !state.myBranches.has(branch.name)) {
        return false;
      }
      if (!state.branchFilter) return true;
      return branch.name.toLowerCase().includes(state.branchFilter.toLowerCase());
    });

    const current = filteredBranches.filter(b => b.isCurrent);
    const local = filteredBranches.filter(b => !b.isRemote);
    const remote = filteredBranches.filter(b => b.isRemote);

    // HEAD (current branch) as its own group: clicking it filters the log to it.
    if (current.length > 0) {
      listContainer.appendChild(
        createGroup(t('branch.groupHead'), current, expandedGroups.has(t('branch.groupHead')))
      );
    }

    if (local.length > 0) {
      const groups = groupBranches(local);
      listContainer.appendChild(createCollapsibleGroup(t('branch.groupLocal'), groups));
    }

    if (remote.length > 0) {
      listContainer.appendChild(
        createGroup(t('branch.groupRemote'), remote, expandedGroups.has(t('branch.groupRemote')))
      );
    }
  };

  /** Expand every collapsible group, including folder groups. */
  const expandAll = () => {
    if (disposed) return;
    expandedGroups.add(t('branch.groupHead'));
    expandedGroups.add(t('branch.groupLocal'));
    expandedGroups.add(t('branch.groupRemote'));
    for (const branch of getState().branches) {
      const parts = branch.name.split('/');
      if (parts.length > 1) {
        expandedGroups.add(parts[0]);
      }
    }
    console.debug(JSON.stringify({
      prefix: '[branch-panel]',
      event: 'expand_all',
      groupCount: expandedGroups.size,
    }));
    renderList();
  };

  /** Collapse every group (HEAD / local / remote / folders). */
  const collapseAll = () => {
    if (disposed) return;
    expandedGroups.clear();
    console.debug(JSON.stringify({
      prefix: '[branch-panel]',
      event: 'collapse_all',
    }));
    renderList();
  };

  /** Group branches by their first path segment. */
  function groupBranches(branches: Branch[]): Map<string, Branch[]> {
    const groups = new Map<string, Branch[]>();
    const rootBranches: Branch[] = [];

    for (const branch of branches) {
      const parts = branch.name.split('/');
      if (parts.length > 1) {
        const folderName = parts[0];
        if (!groups.has(folderName)) {
          groups.set(folderName, []);
        }
        groups.get(folderName)!.push(branch);
      } else {
        rootBranches.push(branch);
      }
    }

    // Root branches first, then folder groups.
    const result = new Map<string, Branch[]>();
    for (const branch of rootBranches) {
      result.set(branch.name, [branch]);
    }
    for (const [folder, branchList] of groups) {
      result.set(folder, branchList);
    }

    return result;
  }

  function groupHeader(title: string, key: string, expanded: boolean): HTMLElement {
    return html`
      <div data-group="${key}" class="gm-branch-group__header" role="button" tabindex="0">
        <span class="gm-branch-group__caret">${expanded ? '▼' : '▶'}</span>
        ${title}
      </div>
    `;
  }

  function createCollapsibleGroup(title: string, groups: Map<string, Branch[]>): HTMLElement {
    const isExpanded = expandedGroups.has(title);
    const groupEl = html`<div class="gm-branch-group"></div>`;
    groupEl.appendChild(groupHeader(title, title, isExpanded));

    if (!isExpanded) return groupEl;

    for (const [key, branches] of groups) {
      if (branches.length === 1 && key === branches[0].name) {
        groupEl.appendChild(createBranchItem(branches[0]));
        continue;
      }

      // Folder group inside "Local".
      const folderExpanded = expandedGroups.has(key);
      const folderEl = html`<div class="gm-branch-group gm-branch-group--nested"></div>`;
      folderEl.appendChild(groupHeader(key, key, folderExpanded));
      if (folderExpanded) {
        for (const branch of branches) {
          const branchItem = createBranchItem(branch);
          branchItem.classList.add('gm-branch-item--nested');
          folderEl.appendChild(branchItem);
        }
      }
      groupEl.appendChild(folderEl);
    }

    return groupEl;
  }

  function createGroup(title: string, branches: Branch[], expanded: boolean): HTMLElement {
    const group = html`<div class="gm-branch-group"></div>`;
    group.appendChild(groupHeader(title, title, expanded));
    if (expanded) {
      for (const branch of branches) {
        group.appendChild(createBranchItem(branch));
      }
    }
    return group;
  }

  function createBranchItem(branch: Branch): HTMLElement {
    const state = getState();
    const isFavorite = state.favorites.has(branch.name);
    // Selection is the clicked branch (multi-select wins over single select) and
    // stays distinct from the current branch, which is only emphasised.
    const isSelected = state.selectedBranches.has(branch.name)
      || (state.selectedBranches.size === 0 && state.selectedBranch?.name === branch.name);

    const item = html`
      <div
        class="gm-branch-item"
        data-branch="${branch.name}"
        data-current="${branch.isCurrent ? 'true' : 'false'}"
        aria-selected="${isSelected ? 'true' : 'false'}"
      >
        <span class="gm-branch-item__icon">${getIcon('branchIcon')}</span>
        ${isFavorite
          ? html`<span class="gm-branch-item__favorite" title="${t('branch.unfavorite')}">${getIcon('favorite')}</span>`
          : ''}
        <span class="gm-branch-item__name">${branch.name}</span>
        ${branch.hasUnpushed && branch.unpushedCount
          ? html`<span class="gm-branch-item__count gm-branch-item__count--unpushed">↑${branch.unpushedCount}</span>`
          : ''}
        ${branch.hasUnpulled && branch.unpulledCount
          ? html`<span class="gm-branch-item__count gm-branch-item__count--unpulled">↓${branch.unpulledCount}</span>`
          : ''}
      </div>
    `;
    return item;
  }

  const render = (): void => {
    if (disposed) return;
    container.innerHTML = '';
    container.appendChild(buildHeader());
    container.appendChild(buildSearchRow());

    listContainer = html`
      <div class="gm-branches__list" data-branch-list></div>
    `;

    listContainer.addEventListener('click', (e) => {
      // Branch selection wins over group toggling: a branch can sit inside a group.
      const branch = findBranchFromEvent(e);
      if (branch) {
        const multi = e.metaKey || e.ctrlKey;
        console.debug(JSON.stringify({
          prefix: '[branch-panel]',
          event: 'branch_click',
          branchName: branch.name,
          multi,
        }));

        if (multi) {
          // Multi-select only maintains the set; it does not switch the log.
          setState(s => {
            const next = new Set(s.selectedBranches);
            if (next.has(branch.name)) next.delete(branch.name);
            else next.add(branch.name);
            s.selectedBranches = next;
            const names = [...next];
            s.selectedBranch = names.length === 1
              ? s.branches.find(b => b.name === names[0]) ?? branch
              : null;
          });
          renderList();
          return;
        }

        try {
          console.debug(JSON.stringify({ prefix: '[branch-panel]', event: 'before_on_branch_select', branchName: branch.name }));
          onBranchSelect(branch);
          console.debug(JSON.stringify({ prefix: '[branch-panel]', event: 'after_on_branch_select', branchName: branch.name }));
        } catch (err) {
          console.error(JSON.stringify({ prefix: '[branch-panel]', event: 'on_branch_select_error', error: String(err) }));
        }
        setState(s => {
          s.selectedBranch = s.branches.find(b => b.name === branch.name) ?? branch;
          s.selectedBranches = new Set<string>();
        });
        renderList();
        return;
      }

      const groupEl = findGroupFromEvent(e);
      if (groupEl) {
        console.debug(JSON.stringify({
          prefix: '[branch-panel]',
          event: 'group_click',
          groupName: groupEl,
        }));
        if (expandedGroups.has(groupEl)) {
          expandedGroups.delete(groupEl);
        } else {
          expandedGroups.add(groupEl);
        }
        renderList();
        return;
      }

      // Empty space: IDEA clears the selection and the branch filter.
      const state = getState();
      if (state.selectedBranch || state.logBranch) {
        console.debug(JSON.stringify({ prefix: '[branch-panel]', event: 'blank_clear' }));
        onSelectionCleared();
      } else {
        console.debug(JSON.stringify({ prefix: '[branch-panel]', event: 'blank_clear_noop' }));
      }
    });

    listContainer.addEventListener('contextmenu', (e) => {
      const branch = findBranchFromEvent(e);
      if (branch) {
        e.preventDefault();
        showContextMenu(e, branch, service, directory);
      }
    });

    container.appendChild(listContainer);
    syncActions();
    renderList();

    if (unsubscribe) unsubscribe();
    unsubscribe = subscribeFields(
      ['branches', 'branchFilter', 'favorites', 'selectedBranch', 'selectedBranches', 'showOnlyMyBranches', 'myBranches', 'fetching'],
      () => {
        if (disposed) return;
        syncActions();
        renderList();
      }
    );
  };

  const dispose = () => {
    disposed = true;
    if (unsubscribe) {
      unsubscribe();
      unsubscribe = null;
    }
    search?.dispose();
    search = null;
    myBranchesBtn = null;
    headerButtons.clear();
  };

  render();

  return { dispose, expandAll, collapseAll };
}
