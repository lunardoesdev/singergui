import { api } from '../services/api';
import { store } from '../state/store';
import type { ProxyInfo } from '../types';
import { formatLatency, formatSpeed, formatPercent, getProtocolColor, getStatusColor, truncate } from '../utils/helpers';
import { VirtualScroller } from '../utils/VirtualScroller';
import { SearchInput } from './SearchInput';
import { showAddProxyDialog } from '../dialogs/AddProxyDialog';
import { showAddSubscriptionDialog } from '../dialogs/AddSubscriptionDialog';
import { showProxyDetailsDialog } from '../dialogs/ProxyDetailsDialog';
import { showMoveToGroupDialog } from '../dialogs/MoveToGroupDialog';
import { showConfirmDialog } from '../dialogs/ConfirmDialog';

const ROW_HEIGHT = 72;
const OVERSCAN = 3;

export class ProxyList {
  private container: HTMLElement;
  private currentGroupId: number | null = null;
  private totalCount: number = 0;
  private virtualScroller: VirtualScroller<ProxyInfo> | null = null;
  private searchInput: SearchInput | null = null;
  private currentSearchQuery: string = '';
  public onDataChanged?: () => void;

  constructor(container: HTMLElement) {
    this.container = container;
    this.render();
  }

  async loadProxies(groupId: number | null): Promise<void> {
    this.currentGroupId = groupId;
    this.currentSearchQuery = '';

    // Get total count for virtual scroller
    this.totalCount = await api.getProxyCount(groupId);

    // Destroy old scroller
    if (this.virtualScroller) {
      this.virtualScroller.destroy();
      this.virtualScroller = null;
    }

    this.render();
  }

  refresh(): void {
    if (this.currentSearchQuery) {
      this.handleSearch(this.currentSearchQuery);
    } else {
      this.loadProxies(this.currentGroupId);
    }
  }

  private notifyDataChanged(): void {
    this.onDataChanged?.();
  }

  private render(): void {
    const selectedCount = store.getSelectedIndexCount();

    this.container.innerHTML = `
      <div class="flex flex-col h-full">
        <!-- Header -->
        <div class="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-white">
          <div class="flex items-center gap-2">
            <h2 class="text-sm font-semibold text-gray-600 uppercase tracking-wider">Proxies</h2>
            <span id="proxy-count" class="text-xs text-gray-500">(${this.totalCount.toLocaleString()})</span>
          </div>
          <div class="flex items-center gap-2">
            <div id="proxy-search-container" class="w-48"></div>
            <button id="add-proxy-btn" class="btn btn-primary btn-sm flex items-center gap-1">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
              </svg>
              Proxy
            </button>
            <button id="add-sub-btn" class="btn btn-secondary btn-sm flex items-center gap-1">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"/>
              </svg>
              Subscription
            </button>
          </div>
        </div>

        <!-- Proxy list wrapper with selection toolbar overlay -->
        <div class="flex-1 overflow-hidden relative">
          <!-- Selection toolbar (floating overlay at top) -->
          <div id="selection-toolbar" class="${selectedCount > 0 ? '' : 'hidden'} absolute top-0 left-0 right-0 z-10 flex items-center justify-between px-4 py-2 bg-primary-50/95 backdrop-blur-sm border-b border-primary-100 shadow-sm">
            <span class="text-sm text-primary-700"><span id="selected-count">${selectedCount.toLocaleString()}</span> selected</span>
            <div class="flex items-center gap-2">
              <button id="move-selected-btn" class="btn btn-secondary btn-sm">Move to Group</button>
              <button id="delete-selected-btn" class="btn btn-danger btn-sm">Delete</button>
              <button id="clear-selection-btn" class="text-sm text-primary-600 hover:text-primary-800">Clear</button>
            </div>
          </div>
          <!-- Actual scroll container -->
          <div id="proxy-scroll" class="h-full overflow-hidden">
          ${this.totalCount === 0 ? `
            <div class="flex flex-col items-center justify-center h-full text-gray-500">
              <svg class="w-16 h-16 mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                      d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01"/>
              </svg>
              <p class="text-lg font-medium">${this.currentSearchQuery ? 'No proxies match' : 'No proxies yet'}</p>
              <p class="text-sm">${this.currentSearchQuery ? 'Try a different search' : 'Add a proxy or subscription to get started'}</p>
            </div>
          ` : ''}
          </div>
        </div>
      </div>
    `;

    this.initSearch();
    this.attachHeaderListeners();

    // Initialize virtual scroller if we have proxies
    if (this.totalCount > 0) {
      this.initVirtualScroller();
    }
  }

  private initSearch(): void {
    const container = this.container.querySelector('#proxy-search-container') as HTMLElement;
    if (!container) return;

    this.searchInput = new SearchInput({
      placeholder: 'Search proxies...',
      debounceMs: 300,
      onSearch: (query) => this.handleSearch(query)
    });

    container.appendChild(this.searchInput.getElement());
  }

  private async handleSearch(query: string): Promise<void> {
    this.currentSearchQuery = query;

    // Clear selection when search changes
    store.clearSelection();
    this.updateSelectionUI();

    // Destroy old scroller
    if (this.virtualScroller) {
      this.virtualScroller.destroy();
      this.virtualScroller = null;
    }

    // Get count (and potentially first page of results)
    if (query) {
      const result = await api.searchProxies(this.currentGroupId, query, 0, 1);
      this.totalCount = result.totalCount;
    } else {
      this.totalCount = await api.getProxyCount(this.currentGroupId);
    }

    // Update count display
    this.updateCountDisplay();

    // Update empty state
    const scrollContainer = this.container.querySelector('#proxy-scroll') as HTMLElement;
    if (scrollContainer) {
      if (this.totalCount === 0) {
        scrollContainer.innerHTML = `
          <div class="flex flex-col items-center justify-center h-full text-gray-500">
            <svg class="w-16 h-16 mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                    d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01"/>
            </svg>
            <p class="text-lg font-medium">${query ? 'No proxies match' : 'No proxies yet'}</p>
            <p class="text-sm">${query ? 'Try a different search' : 'Add a proxy or subscription to get started'}</p>
          </div>
        `;
      } else {
        scrollContainer.innerHTML = '';
        this.initVirtualScroller();
      }
    }
  }

  private updateCountDisplay(): void {
    const countEl = this.container.querySelector('#proxy-count');
    if (countEl) {
      countEl.textContent = `(${this.totalCount.toLocaleString()})`;
    }
  }

  private initVirtualScroller(): void {
    const scrollContainer = this.container.querySelector('#proxy-scroll') as HTMLElement;
    if (!scrollContainer) return;

    this.virtualScroller = new VirtualScroller<ProxyInfo>({
      container: scrollContainer,
      rowHeight: ROW_HEIGHT,
      overscan: OVERSCAN,
      totalCount: this.totalCount,
      fetchData: async (offset, limit) => {
        if (this.currentSearchQuery) {
          const result = await api.searchProxies(this.currentGroupId, this.currentSearchQuery, offset, limit);
          return result.proxies;
        } else {
          return await api.getProxies(this.currentGroupId, offset, limit);
        }
      },
      renderRow: (proxy, index) => this.renderProxyItem(proxy, index),
      renderPlaceholder: () => this.renderPlaceholderItem()
    });

    // Attach event listeners via delegation
    this.attachProxyListeners();
  }

  private renderProxyItem(proxy: ProxyInfo, index: number): string {
    const isSelected = store.isIndexSelected(index);
    const statusColor = getStatusColor(proxy.isDead, proxy.isActive);
    const protocolColor = getProtocolColor(proxy.protocol);

    return `
      <div class="proxy-item ${isSelected ? 'bg-primary-50' : 'hover:bg-gray-50'} px-4 py-3 cursor-pointer transition-colors h-full border-b border-gray-100"
           data-proxy-id="${proxy.id}" data-index="${index}">
        <div class="flex items-center gap-3 h-full">
          <!-- Checkbox -->
          <input type="checkbox"
                 class="proxy-checkbox w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                 ${isSelected ? 'checked' : ''}>

          <!-- Status indicator -->
          <div class="flex-shrink-0">
            <span class="inline-block w-2.5 h-2.5 rounded-full ${statusColor} ${proxy.isActive ? 'animate-pulse bg-green-500' : proxy.isDead ? 'bg-red-400' : 'bg-gray-400'}"></span>
          </div>

          <!-- Main content -->
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2">
              <span class="font-medium text-gray-900 truncate">${this.escapeHtml(truncate(proxy.name || proxy.server, 40))}</span>
              <span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${protocolColor}">
                ${proxy.protocol}
              </span>
            </div>
            <div class="flex items-center gap-3 mt-1 text-sm text-gray-500">
              <span class="truncate">${this.escapeHtml(proxy.server)}:${proxy.port}</span>
              ${proxy.latency != null ? `<span class="text-gray-400">|</span><span>${formatLatency(proxy.latency)}</span>` : ''}
              ${proxy.speed != null ? `<span class="text-gray-400">|</span><span>${formatSpeed(proxy.speed)}</span>` : ''}
              ${proxy.successRate != null ? `<span class="text-gray-400">|</span><span class="${(proxy.successRate ?? 0) > 0.8 ? 'text-green-600' : (proxy.successRate ?? 0) > 0.5 ? 'text-yellow-600' : 'text-red-600'}">${formatPercent(proxy.successRate)}</span>` : ''}
              ${proxy.isDead ? '<span class="text-red-500 font-medium">DEAD</span>' : ''}
            </div>
          </div>

          <!-- Actions -->
          <div class="flex items-center gap-1">
            <button class="move-btn p-2 text-gray-400 hover:text-primary-600 rounded hover:bg-gray-100" title="Move to group">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"/>
              </svg>
            </button>
            <button class="info-btn p-2 text-gray-400 hover:text-primary-600 rounded hover:bg-gray-100" title="Details">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
            </button>
            <button class="activate-btn p-2 ${proxy.isActive ? 'text-green-600' : 'text-gray-400 hover:text-green-600'} rounded hover:bg-gray-100"
                    title="${proxy.isActive ? 'Deactivate' : 'Activate'}">
              ${proxy.isActive ? `
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z"/>
                </svg>
              ` : `
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"/>
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
              `}
            </button>
          </div>
        </div>
      </div>
    `;
  }

  private attachHeaderListeners(): void {
    // Add proxy button
    this.container.querySelector('#add-proxy-btn')?.addEventListener('click', async () => {
      const links = await showAddProxyDialog();
      if (links && links.length > 0) {
        const count = await api.addProxies(links, this.currentGroupId);
        if (count > 0) {
          this.refresh();
          this.notifyDataChanged();
        }
      }
    });

    // Add subscription button
    this.container.querySelector('#add-sub-btn')?.addEventListener('click', async () => {
      const result = await showAddSubscriptionDialog();
      if (result) {
        await api.addSubscription(result.url, result.name);
        // The subscription import will trigger a refresh via events
      }
    });

    // Selection toolbar buttons
    this.container.querySelector('#move-selected-btn')?.addEventListener('click', () => this.moveSelected());
    this.container.querySelector('#delete-selected-btn')?.addEventListener('click', () => this.deleteSelected());
    this.container.querySelector('#clear-selection-btn')?.addEventListener('click', () => this.clearSelection());
  }

  private attachProxyListeners(): void {
    if (!this.virtualScroller) return;

    const contentContainer = this.virtualScroller.getContentContainer();
    if (!contentContainer) return;

    // Use event delegation for dynamic rows
    contentContainer.addEventListener('click', async (e) => {
      const target = e.target as HTMLElement;
      const proxyItem = target.closest('.proxy-item') as HTMLElement;
      if (!proxyItem) return;

      const proxyId = parseInt(proxyItem.getAttribute('data-proxy-id') || '0', 10);
      const index = parseInt(proxyItem.getAttribute('data-index') || '0', 10);

      // Checkbox click
      if (target.classList.contains('proxy-checkbox') || target.closest('.proxy-checkbox')) {
        e.stopPropagation();
        e.preventDefault();
        store.toggleIndexSelection(index);
        this.updateSelectionUI();
        this.rerenderVisibleRows();
        return;
      }

      // Move button
      if (target.closest('.move-btn')) {
        e.stopPropagation();
        const groupId = await showMoveToGroupDialog();
        if (groupId !== undefined) {
          await api.moveToGroup(proxyId, groupId);
          this.refresh();
          this.notifyDataChanged();
        }
        return;
      }

      // Info button
      if (target.closest('.info-btn')) {
        e.stopPropagation();
        await showProxyDetailsDialog(proxyId);
        return;
      }

      // Activate button
      if (target.closest('.activate-btn')) {
        e.stopPropagation();
        const proxy = this.virtualScroller?.getItemById(proxyId);
        if (proxy?.isActive) {
          await api.deactivateProxy();
        } else {
          await api.activateProxy(proxyId);
        }
        this.refresh();
        return;
      }

      // Row click (selection with shift/ctrl)
      if (!target.closest('button') && !target.closest('input')) {
        const mouseEvent = e as MouseEvent;
        const shiftKey = mouseEvent.shiftKey;

        if (shiftKey) {
          // Shift+click: select range from last selected to current
          const lastIndex = store.getLastSelectedIndex();
          if (lastIndex !== null) {
            store.selectIndexRange(lastIndex, index, true);
          } else {
            store.toggleIndexSelection(index);
          }
        } else {
          // Normal click: toggle selection (same as checkbox)
          store.toggleIndexSelection(index);
        }
        this.updateSelectionUI();
        this.rerenderVisibleRows();
      }
    });
  }

  private updateSelectionUI(): void {
    const selectedCount = store.getSelectedIndexCount();
    const toolbar = this.container.querySelector('#selection-toolbar');
    const countSpan = this.container.querySelector('#selected-count');

    if (toolbar) {
      if (selectedCount > 0) {
        toolbar.classList.remove('hidden');
      } else {
        toolbar.classList.add('hidden');
      }
    }

    if (countSpan) {
      countSpan.textContent = selectedCount.toLocaleString();
    }
  }

  private rerenderVisibleRows(): void {
    // Use forceRender to re-render all visible rows with correct selection state
    this.virtualScroller?.forceRender();
  }

  // Public methods for keyboard shortcuts
  selectAll(): void {
    // Select all items using a single range (efficient for millions)
    store.selectAllIndices(this.totalCount);
    this.updateSelectionUI();
    this.rerenderVisibleRows();
  }

  clearSelection(): void {
    store.clearSelection();
    this.updateSelectionUI();
    this.rerenderVisibleRows();
  }

  async copySelected(): Promise<void> {
    const selectedCount = store.getSelectedIndexCount();
    if (selectedCount === 0) return;

    // Get IDs for selected ranges
    const ids = await this.getSelectedProxyIds();
    if (ids.length === 0) return;

    // Get links from backend for selected IDs
    const links: string[] = [];
    for (const id of ids) {
      const details = await api.getProxyDetails(id);
      if (details?.link) {
        links.push(details.link);
      }
    }

    if (links.length > 0) {
      await api.copyToClipboard(links.join('\n'));
    }
  }

  // Helper to get proxy IDs for selected index ranges
  private async getSelectedProxyIds(): Promise<number[]> {
    const ranges = store.getSelectedIndexRanges();
    if (ranges.length === 0) return [];

    const allIds: number[] = [];
    for (const range of ranges) {
      const count = range.end - range.start + 1;
      const ids = await api.getProxyIDs(this.currentGroupId, range.start, count);
      allIds.push(...ids);
    }
    return allIds;
  }

  async handlePaste(): Promise<void> {
    const content = await api.parseClipboard();
    if (content.links.length > 0) {
      const count = await api.addProxies(content.links, this.currentGroupId);
      if (count > 0) {
        this.refresh();
        this.notifyDataChanged();
      }
    } else if (content.subscriptionUrl) {
      const confirmed = await showConfirmDialog(
        'Add Subscription?',
        `Do you want to add this subscription?\n${content.subscriptionUrl}`
      );
      if (confirmed) {
        await api.addSubscription(content.subscriptionUrl, '');
      }
    }
  }

  async deleteSelected(): Promise<void> {
    const selectedCount = store.getSelectedIndexCount();
    if (selectedCount === 0) return;

    const confirmed = await showConfirmDialog(
      'Delete Proxies',
      `Are you sure you want to delete ${selectedCount.toLocaleString()} selected proxies?`
    );

    if (confirmed) {
      const ids = await this.getSelectedProxyIds();
      if (ids.length > 0) {
        await api.deleteProxies(ids);
      }
      store.clearSelection();
      this.refresh();
      this.notifyDataChanged();
    }
  }

  private async moveSelected(): Promise<void> {
    const selectedCount = store.getSelectedIndexCount();
    if (selectedCount === 0) return;

    const groupId = await showMoveToGroupDialog();
    if (groupId !== undefined) {
      const ids = await this.getSelectedProxyIds();
      if (ids.length > 0) {
        await api.moveProxiesToGroup(ids, groupId);
      }
      this.refresh();
      this.notifyDataChanged();
    }
  }

  private renderPlaceholderItem(): string {
    return `
      <div class="proxy-item px-4 py-3 h-full border-b border-gray-100 animate-pulse">
        <div class="flex items-center gap-3 h-full">
          <div class="w-4 h-4 bg-gray-200 rounded"></div>
          <div class="w-2.5 h-2.5 bg-gray-200 rounded-full"></div>
          <div class="flex-1">
            <div class="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
            <div class="h-3 bg-gray-200 rounded w-1/2"></div>
          </div>
          <div class="flex gap-1">
            <div class="w-9 h-9 bg-gray-200 rounded"></div>
            <div class="w-9 h-9 bg-gray-200 rounded"></div>
            <div class="w-9 h-9 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    `;
  }

  private escapeHtml(str: string): string {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }
}
