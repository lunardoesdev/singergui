import { api } from '../services/api';
import type { Group } from '../types';
import { SearchInput } from './SearchInput';
import { VirtualScroller } from '../utils/VirtualScroller';

const ROW_HEIGHT = 40;
const OVERSCAN = 3;

export interface SearchableGroupListConfig {
  container: HTMLElement;
  onSelect: (groupId: number | null) => void;
  showNoGroupOption?: boolean;
  selectedGroupId?: number | null;
  maxHeight?: string;
}

export class SearchableGroupList {
  private container: HTMLElement;
  private config: SearchableGroupListConfig;
  private searchInput: SearchInput | null = null;
  private virtualScroller: VirtualScroller<Group> | null = null;
  private selectedGroupId: number | null;
  private currentSearchQuery: string = '';
  private totalGroupCount: number = 0;

  constructor(config: SearchableGroupListConfig) {
    this.config = config;
    this.container = config.container;
    this.selectedGroupId = config.selectedGroupId ?? null;
  }

  async loadGroups(): Promise<void> {
    // Get total count
    const result = await api.searchGroups('', 0, 1);
    this.totalGroupCount = result.totalCount;
    this.currentSearchQuery = '';
    this.render();
  }

  private render(): void {
    const maxHeight = this.config.maxHeight ?? '256px';

    this.container.innerHTML = `
      <div class="flex flex-col h-full">
        <div class="p-2 border-b border-gray-200">
          <div id="group-search-input"></div>
        </div>
        ${this.config.showNoGroupOption ? `
          <div class="px-2 pt-2">
            ${this.renderNoGroupItem()}
          </div>
        ` : ''}
        <div id="group-list" class="flex-1 overflow-hidden" style="max-height: ${maxHeight}">
          ${this.totalGroupCount === 0 ? `
            <div class="px-3 py-4 text-center text-gray-500 text-sm">
              ${this.currentSearchQuery ? 'No groups match' : 'No groups yet'}
            </div>
          ` : ''}
        </div>
      </div>
    `;

    // Initialize search input
    const searchContainer = this.container.querySelector('#group-search-input') as HTMLElement;
    this.searchInput = new SearchInput({
      placeholder: 'Search groups...',
      debounceMs: 150,
      onSearch: (query) => this.handleSearch(query)
    });
    searchContainer.appendChild(this.searchInput.getElement());

    // Attach no-group listener
    this.attachNoGroupListener();

    // Initialize virtual scroller if we have groups
    if (this.totalGroupCount > 0) {
      this.initVirtualScroller();
    }
  }

  private renderNoGroupItem(): string {
    const isSelected = this.selectedGroupId === 0 || this.selectedGroupId === null;
    const bgClass = isSelected ? 'bg-primary-50 border-primary-200' : 'hover:bg-gray-50';
    const textClass = isSelected ? 'text-primary-700' : 'text-gray-700';

    return `
      <div class="group-item no-group-item ${bgClass} border border-transparent rounded-lg px-3 py-2 cursor-pointer transition-colors"
           data-group-id="0">
        <div class="flex items-center justify-between">
          <span class="font-medium ${textClass}">No Group</span>
        </div>
      </div>
    `;
  }

  private renderGroupItem(group: Group): string {
    const isSelected = this.selectedGroupId === group.id;
    const bgClass = isSelected ? 'bg-primary-50 border-primary-200' : 'hover:bg-gray-50';
    const textClass = isSelected ? 'text-primary-700' : 'text-gray-700';
    const countClass = isSelected ? 'text-primary-600' : 'text-gray-500';

    return `
      <div class="group-item ${bgClass} border border-transparent rounded-lg mx-2 my-1 px-3 py-2 cursor-pointer transition-colors h-full"
           data-group-id="${group.id}">
        <div class="flex items-center justify-between h-full">
          <span class="font-medium ${textClass} truncate">${this.escapeHtml(group.name)}</span>
          <span class="text-xs ${countClass} bg-gray-100 px-2 py-0.5 rounded-full ml-2">
            ${group.proxyCount}
          </span>
        </div>
      </div>
    `;
  }

  private renderPlaceholderItem(): string {
    return `
      <div class="rounded-lg mx-2 my-1 px-3 py-2 h-full animate-pulse">
        <div class="flex items-center justify-between h-full">
          <div class="h-4 bg-gray-200 rounded w-24"></div>
          <div class="h-5 w-8 bg-gray-200 rounded-full"></div>
        </div>
      </div>
    `;
  }

  private initVirtualScroller(): void {
    const scrollContainer = this.container.querySelector('#group-list') as HTMLElement;
    if (!scrollContainer || this.totalGroupCount === 0) return;

    // Destroy old scroller
    if (this.virtualScroller) {
      this.virtualScroller.destroy();
      this.virtualScroller = null;
    }

    this.virtualScroller = new VirtualScroller<Group>({
      container: scrollContainer,
      rowHeight: ROW_HEIGHT,
      overscan: OVERSCAN,
      totalCount: this.totalGroupCount,
      fetchData: async (offset, limit) => {
        const result = await api.searchGroups(this.currentSearchQuery, offset, limit);
        return result.groups;
      },
      renderRow: (group) => this.renderGroupItem(group),
      renderPlaceholder: () => this.renderPlaceholderItem()
    });

    this.attachGroupListeners();
  }

  private async handleSearch(query: string): Promise<void> {
    this.currentSearchQuery = query;

    // Get count for search results
    const result = await api.searchGroups(query, 0, 1);
    this.totalGroupCount = result.totalCount;

    // Update the list container
    const scrollContainer = this.container.querySelector('#group-list') as HTMLElement;
    if (scrollContainer) {
      if (this.totalGroupCount === 0) {
        // Destroy scroller and show empty state
        if (this.virtualScroller) {
          this.virtualScroller.destroy();
          this.virtualScroller = null;
        }
        scrollContainer.innerHTML = `
          <div class="px-3 py-4 text-center text-gray-500 text-sm">
            ${query ? 'No groups match' : 'No groups yet'}
          </div>
        `;
      } else {
        // Recreate virtual scroller with new count
        scrollContainer.innerHTML = '';
        this.initVirtualScroller();
      }
    }
  }

  private attachNoGroupListener(): void {
    const noGroupItem = this.container.querySelector('.no-group-item');
    noGroupItem?.addEventListener('click', () => {
      this.selectGroup(null);
    });
  }

  private attachGroupListeners(): void {
    if (!this.virtualScroller) return;

    const contentContainer = this.virtualScroller.getContentContainer();
    if (!contentContainer) return;

    contentContainer.addEventListener('click', (e) => {
      const target = e.target as HTMLElement;
      const groupItem = target.closest('.group-item') as HTMLElement;
      if (!groupItem) return;

      const groupIdStr = groupItem.getAttribute('data-group-id');
      if (groupIdStr === null || groupIdStr === '0') return;

      const groupId = parseInt(groupIdStr, 10);
      this.selectGroup(groupId);
    });
  }

  private selectGroup(groupId: number | null): void {
    this.selectedGroupId = groupId === null ? 0 : groupId;
    this.updateSelectionUI();
    this.config.onSelect(groupId);
  }

  private updateSelectionUI(): void {
    // Update no-group item
    const noGroupItem = this.container.querySelector('.no-group-item');
    if (noGroupItem) {
      const isSelected = this.selectedGroupId === 0 || this.selectedGroupId === null;
      const nameSpan = noGroupItem.querySelector('span.font-medium');

      if (isSelected) {
        noGroupItem.classList.add('bg-primary-50', 'border-primary-200');
        noGroupItem.classList.remove('hover:bg-gray-50');
        nameSpan?.classList.add('text-primary-700');
        nameSpan?.classList.remove('text-gray-700');
      } else {
        noGroupItem.classList.remove('bg-primary-50', 'border-primary-200');
        noGroupItem.classList.add('hover:bg-gray-50');
        nameSpan?.classList.remove('text-primary-700');
        nameSpan?.classList.add('text-gray-700');
      }
    }

    // Update group items via virtual scroller re-render
    this.virtualScroller?.forceRender();
  }

  focusSearch(): void {
    this.searchInput?.focus();
  }

  getSelectedGroupId(): number | null {
    if (this.selectedGroupId === 0) return null;
    return this.selectedGroupId;
  }

  destroy(): void {
    this.searchInput?.destroy();
    this.virtualScroller?.destroy();
  }

  private escapeHtml(str: string): string {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }
}
