import { api } from '../services/api';
import { store } from '../state/store';
import type { Group } from '../types';
import { VirtualScroller } from '../utils/VirtualScroller';
import { SearchInput } from './SearchInput';
import { showAddGroupDialog } from '../dialogs/AddGroupDialog';
import { showConfirmDialog } from '../dialogs/ConfirmDialog';

const ROW_HEIGHT = 40;
const OVERSCAN = 3;

export class Sidebar {
  private container: HTMLElement;
  private totalProxyCount: number = 0;
  private totalGroupCount: number = 0;
  private virtualScroller: VirtualScroller<Group> | null = null;
  private searchInput: SearchInput | null = null;
  private currentSearchQuery: string = '';
  public onGroupSelected?: (groupId: number | null) => void;

  constructor(container: HTMLElement) {
    this.container = container;
    this.render();
  }

  async loadGroups(): Promise<void> {
    this.totalProxyCount = await api.getProxyCount(null);
    this.totalGroupCount = await api.getGroupCount();
    this.currentSearchQuery = '';

    // Load initial groups for store
    const groups = await api.getGroups();
    store.setGroups(groups);

    // Destroy old scroller
    if (this.virtualScroller) {
      this.virtualScroller.destroy();
      this.virtualScroller = null;
    }

    this.render();
  }

  private render(): void {
    const selectedId = store.getSelectedGroup();
    const scrollPos = this.virtualScroller?.getScrollContainer()?.scrollTop ?? 0;

    this.container.innerHTML = `
      <div class="flex flex-col h-full">
        <div class="p-3 border-b border-gray-200">
          <h2 class="text-sm font-semibold text-gray-600 uppercase tracking-wider mb-2">Groups</h2>
          <div id="group-search-container"></div>
        </div>

        <!-- All Proxies item (always visible) -->
        <div class="p-2 pb-0">
          <div class="group-item ${selectedId === null ? 'bg-primary-50 border-primary-200' : 'hover:bg-gray-50'}
                      rounded-lg border border-transparent px-3 py-2 cursor-pointer"
               data-group-id="all">
            <div class="flex items-center justify-between">
              <span class="font-medium ${selectedId === null ? 'text-primary-700' : 'text-gray-700'}">All Proxies</span>
              <span class="text-xs ${selectedId === null ? 'text-primary-600' : 'text-gray-500'} bg-gray-100 px-2 py-0.5 rounded-full">
                ${this.totalProxyCount.toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        <!-- Virtual scrolling group list -->
        <div id="group-scroll" class="flex-1 overflow-hidden px-2">
          ${this.totalGroupCount === 0 ? `
            <div class="text-center text-gray-400 text-sm py-4">${this.currentSearchQuery ? 'No groups match' : 'No groups yet'}</div>
          ` : ''}
        </div>

        <div class="p-3 border-t border-gray-200">
          <button id="add-group-btn" class="w-full btn btn-secondary flex items-center justify-center gap-2">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
            </svg>
            Add Group
          </button>
        </div>
      </div>
    `;

    this.initSearch();
    this.attachHeaderListeners();

    if (this.totalGroupCount > 0) {
      this.initVirtualScroller();

      if (scrollPos > 0) {
        requestAnimationFrame(() => {
          const scrollContainer = this.virtualScroller?.getScrollContainer();
          if (scrollContainer) {
            scrollContainer.scrollTop = scrollPos;
          }
        });
      }
    }
  }

  private initSearch(): void {
    const container = this.container.querySelector('#group-search-container') as HTMLElement;
    if (!container) return;

    this.searchInput = new SearchInput({
      placeholder: 'Search groups...',
      debounceMs: 150,
      onSearch: (query) => this.handleSearch(query)
    });

    container.appendChild(this.searchInput.getElement());
  }

  private async handleSearch(query: string): Promise<void> {
    this.currentSearchQuery = query;

    // Destroy and recreate virtual scroller with search results
    if (this.virtualScroller) {
      this.virtualScroller.destroy();
      this.virtualScroller = null;
    }

    // Get count from search
    if (query) {
      const result = await api.searchGroups(query, 0, 1);
      this.totalGroupCount = result.totalCount;
    } else {
      this.totalGroupCount = await api.getGroupCount();
    }

    // Update empty state message
    const scrollContainer = this.container.querySelector('#group-scroll') as HTMLElement;
    if (scrollContainer) {
      if (this.totalGroupCount === 0) {
        scrollContainer.innerHTML = `
          <div class="text-center text-gray-400 text-sm py-4">${query ? 'No groups match' : 'No groups yet'}</div>
        `;
      } else {
        scrollContainer.innerHTML = '';
        this.initVirtualScroller();
      }
    }
  }

  private initVirtualScroller(): void {
    const scrollContainer = this.container.querySelector('#group-scroll') as HTMLElement;
    if (!scrollContainer || this.totalGroupCount === 0) return;

    this.virtualScroller = new VirtualScroller<Group>({
      container: scrollContainer,
      rowHeight: ROW_HEIGHT,
      overscan: OVERSCAN,
      totalCount: this.totalGroupCount,
      fetchData: async (offset, limit) => {
        if (this.currentSearchQuery) {
          const result = await api.searchGroups(this.currentSearchQuery, offset, limit);
          return result.groups;
        } else {
          return await api.getGroupsPaginated(offset, limit);
        }
      },
      renderRow: (group) => this.renderGroupItem(group),
      renderPlaceholder: () => this.renderPlaceholderItem()
    });

    this.attachGroupListeners();
  }

  private renderGroupItem(group: Group): string {
    const selectedId = store.getSelectedGroup();
    const isSelected = selectedId === group.id;

    return `
      <div class="group-item ${isSelected ? 'bg-primary-50 border-primary-200' : 'hover:bg-gray-50'}
                  rounded-lg border border-transparent px-3 py-2 cursor-pointer group relative h-full"
           data-group-id="${group.id}">
        <div class="flex items-center justify-between h-full">
          <span class="font-medium ${isSelected ? 'text-primary-700' : 'text-gray-700'} truncate pr-2">
            ${this.escapeHtml(group.name)}
          </span>
          <div class="flex items-center gap-1">
            <span class="text-xs ${isSelected ? 'text-primary-600' : 'text-gray-500'} bg-gray-100 px-2 py-0.5 rounded-full">
              ${group.proxyCount}
            </span>
            <div class="hidden group-hover:flex items-center gap-1">
              <button class="edit-group p-1 text-gray-400 hover:text-primary-600 rounded" title="Rename">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                </svg>
              </button>
              <button class="delete-group p-1 text-gray-400 hover:text-red-600 rounded" title="Delete">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  private renderPlaceholderItem(): string {
    return `
      <div class="rounded-lg px-3 py-2 h-full animate-pulse">
        <div class="flex items-center justify-between h-full">
          <div class="h-4 bg-gray-200 rounded w-24"></div>
          <div class="h-5 w-8 bg-gray-200 rounded-full"></div>
        </div>
      </div>
    `;
  }

  private attachHeaderListeners(): void {
    this.container.querySelector('[data-group-id="all"]')?.addEventListener('click', () => {
      this.onGroupSelected?.(null);
      this.updateAllProxiesSelectionUI();
    });

    this.container.querySelector('#add-group-btn')?.addEventListener('click', async () => {
      const result = await showAddGroupDialog();
      if (result) {
        await api.createGroup(result);
        await this.loadGroups();
      }
    });
  }

  private attachGroupListeners(): void {
    if (!this.virtualScroller) return;

    const contentContainer = this.virtualScroller.getContentContainer();
    if (!contentContainer) return;

    contentContainer.addEventListener('click', async (e) => {
      const target = e.target as HTMLElement;
      const groupItem = target.closest('.group-item') as HTMLElement;
      if (!groupItem) return;

      const groupIdStr = groupItem.getAttribute('data-group-id');
      if (!groupIdStr || groupIdStr === 'all') return;

      const groupId = parseInt(groupIdStr, 10);

      if (target.closest('.edit-group')) {
        e.stopPropagation();
        await this.handleRename(groupId, groupItem);
        return;
      }

      if (target.closest('.delete-group')) {
        e.stopPropagation();
        await this.handleDelete(groupId, groupItem);
        return;
      }

      if (!target.closest('button')) {
        this.onGroupSelected?.(groupId);
        this.updateGroupSelectionUI(groupId);
      }
    });
  }

  private updateGroupSelectionUI(selectedGroupId: number): void {
    const allItem = this.container.querySelector('[data-group-id="all"]');
    if (allItem) {
      allItem.classList.remove('bg-primary-50', 'border-primary-200');
      allItem.classList.add('hover:bg-gray-50');
      const nameSpan = allItem.querySelector('span.font-medium');
      const countSpan = allItem.querySelector('span.text-xs');
      if (nameSpan) {
        nameSpan.classList.remove('text-primary-700');
        nameSpan.classList.add('text-gray-700');
      }
      if (countSpan) {
        countSpan.classList.remove('text-primary-600');
        countSpan.classList.add('text-gray-500');
      }
    }

    const contentContainer = this.virtualScroller?.getContentContainer();
    if (contentContainer) {
      contentContainer.querySelectorAll('.group-item').forEach(item => {
        const itemId = parseInt(item.getAttribute('data-group-id') || '0', 10);
        const isSelected = itemId === selectedGroupId;
        const nameSpan = item.querySelector('span.font-medium');
        const countSpan = item.querySelector('span.text-xs');

        if (isSelected) {
          item.classList.add('bg-primary-50', 'border-primary-200');
          item.classList.remove('hover:bg-gray-50');
          if (nameSpan) {
            nameSpan.classList.add('text-primary-700');
            nameSpan.classList.remove('text-gray-700');
          }
          if (countSpan) {
            countSpan.classList.add('text-primary-600');
            countSpan.classList.remove('text-gray-500');
          }
        } else {
          item.classList.remove('bg-primary-50', 'border-primary-200');
          item.classList.add('hover:bg-gray-50');
          if (nameSpan) {
            nameSpan.classList.remove('text-primary-700');
            nameSpan.classList.add('text-gray-700');
          }
          if (countSpan) {
            countSpan.classList.remove('text-primary-600');
            countSpan.classList.add('text-gray-500');
          }
        }
      });
    }
  }

  private updateAllProxiesSelectionUI(): void {
    const allItem = this.container.querySelector('[data-group-id="all"]');
    if (allItem) {
      allItem.classList.add('bg-primary-50', 'border-primary-200');
      allItem.classList.remove('hover:bg-gray-50');
      const nameSpan = allItem.querySelector('span.font-medium');
      const countSpan = allItem.querySelector('span.text-xs');
      if (nameSpan) {
        nameSpan.classList.add('text-primary-700');
        nameSpan.classList.remove('text-gray-700');
      }
      if (countSpan) {
        countSpan.classList.add('text-primary-600');
        countSpan.classList.remove('text-gray-500');
      }
    }

    const contentContainer = this.virtualScroller?.getContentContainer();
    if (contentContainer) {
      contentContainer.querySelectorAll('.group-item').forEach(item => {
        const nameSpan = item.querySelector('span.font-medium');
        const countSpan = item.querySelector('span.text-xs');

        item.classList.remove('bg-primary-50', 'border-primary-200');
        item.classList.add('hover:bg-gray-50');
        if (nameSpan) {
          nameSpan.classList.remove('text-primary-700');
          nameSpan.classList.add('text-gray-700');
        }
        if (countSpan) {
          countSpan.classList.remove('text-primary-600');
          countSpan.classList.add('text-gray-500');
        }
      });
    }
  }

  private async handleRename(groupId: number, groupItem: HTMLElement): Promise<void> {
    const nameSpan = groupItem.querySelector('span.font-medium');
    const currentName = nameSpan?.textContent?.trim() || '';
    const newName = prompt('Enter new group name:', currentName);
    if (newName && newName !== currentName) {
      await api.renameGroup(groupId, newName);
      await this.loadGroups();
    }
  }

  private async handleDelete(groupId: number, groupItem: HTMLElement): Promise<void> {
    const nameSpan = groupItem.querySelector('span.font-medium');
    const groupName = nameSpan?.textContent?.trim() || 'this group';
    const confirmed = await showConfirmDialog(
      'Delete Group',
      `Are you sure you want to delete "${groupName}"? Proxies in this group will be moved to "No Group".`
    );
    if (confirmed) {
      await api.deleteGroup(groupId);
      if (store.getSelectedGroup() === groupId) {
        this.onGroupSelected?.(null);
      }
      await this.loadGroups();
    }
  }

  private escapeHtml(str: string): string {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  refresh(): void {
    this.loadGroups();
  }
}
