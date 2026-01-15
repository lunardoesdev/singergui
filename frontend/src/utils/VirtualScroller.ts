/**
 * VirtualScroller - Using TanStack Virtual for efficient virtual scrolling
 */

import { elementScroll, observeElementRect, observeElementOffset, Virtualizer } from '@tanstack/virtual-core';

export interface VirtualScrollerConfig<T> {
  container: HTMLElement;
  rowHeight: number;
  totalCount: number;
  overscan: number;  // Items to render outside visible area
  fetchData: (offset: number, limit: number) => Promise<T[]>;
  renderRow: (item: T, index: number) => string;
  renderPlaceholder: (index: number) => string;
}

export class VirtualScroller<T extends { id: number }> {
  private config: VirtualScrollerConfig<T>;
  private items: Map<number, T> = new Map();
  private scrollContainer: HTMLElement | null = null;
  private contentContainer: HTMLElement | null = null;
  private virtualizer: Virtualizer<HTMLElement, HTMLElement> | null = null;
  private pendingFetches: Set<number> = new Set();
  private isDestroyed: boolean = false;

  constructor(config: VirtualScrollerConfig<T>) {
    this.config = config;
    this.init();
  }

  private init(): void {
    const { container, rowHeight, totalCount } = this.config;

    // Create scroll structure
    container.innerHTML = `
      <div class="virtual-scroll-container" style="height: 100%; overflow-y: auto;">
        <div class="virtual-scroll-content" style="position: relative; width: 100%;"></div>
      </div>
    `;

    this.scrollContainer = container.querySelector('.virtual-scroll-container');
    this.contentContainer = container.querySelector('.virtual-scroll-content');

    if (!this.scrollContainer || !this.contentContainer) return;

    // Create TanStack virtualizer
    this.virtualizer = new Virtualizer({
      count: totalCount,
      getScrollElement: () => this.scrollContainer,
      estimateSize: () => rowHeight,
      overscan: this.config.overscan,
      observeElementRect: observeElementRect,
      observeElementOffset: observeElementOffset,
      scrollToFn: elementScroll,
      onChange: () => this.render(),
    });

    // Initialize the virtualizer (required for vanilla JS usage)
    this.virtualizer._didMount();

    // Initial render after a frame to ensure DOM is ready
    requestAnimationFrame(() => {
      this.virtualizer?._willUpdate();
      this.render();
    });
  }

  private render(): void {
    if (this.isDestroyed || !this.virtualizer || !this.contentContainer) return;

    const virtualItems = this.virtualizer.getVirtualItems();
    const totalSize = this.virtualizer.getTotalSize();

    // Update content height
    this.contentContainer.style.height = `${totalSize}px`;

    // Find items that need fetching
    const missingIndices: number[] = [];
    for (const vItem of virtualItems) {
      if (!this.items.has(vItem.index) && !this.pendingFetches.has(vItem.index)) {
        missingIndices.push(vItem.index);
      }
    }

    // Fetch missing items
    if (missingIndices.length > 0) {
      this.fetchItems(missingIndices);
    }

    // Render visible items
    const rows = virtualItems.map(vItem => {
      const item = this.items.get(vItem.index);
      const content = item
        ? this.config.renderRow(item, vItem.index)
        : this.config.renderPlaceholder(vItem.index);

      return `
        <div class="virtual-row"
             style="position: absolute; top: 0; left: 0; right: 0; height: ${vItem.size}px; transform: translateY(${vItem.start}px);"
             data-index="${vItem.index}">
          ${content}
        </div>
      `;
    });

    this.contentContainer.innerHTML = rows.join('');

    // Evict items far from viewport
    this.evictDistantItems(virtualItems);
  }

  private async fetchItems(indices: number[]): Promise<void> {
    if (indices.length === 0 || this.isDestroyed) return;

    // Group consecutive indices
    indices.sort((a, b) => a - b);
    const ranges: { start: number; count: number }[] = [];
    let rangeStart = indices[0];
    let rangeCount = 1;

    for (let i = 1; i < indices.length; i++) {
      if (indices[i] === indices[i - 1] + 1) {
        rangeCount++;
      } else {
        ranges.push({ start: rangeStart, count: rangeCount });
        rangeStart = indices[i];
        rangeCount = 1;
      }
    }
    ranges.push({ start: rangeStart, count: rangeCount });

    // Fetch each range
    for (const range of ranges) {
      // Mark as pending
      for (let i = range.start; i < range.start + range.count; i++) {
        this.pendingFetches.add(i);
      }

      try {
        const data = await this.config.fetchData(range.start, range.count);

        if (this.isDestroyed) return;

        // Store items
        data.forEach((item, idx) => {
          this.items.set(range.start + idx, item);
        });

        // Re-render
        this.render();
      } catch (error) {
        console.error(`Failed to fetch items ${range.start}-${range.start + range.count}:`, error);
      } finally {
        for (let i = range.start; i < range.start + range.count; i++) {
          this.pendingFetches.delete(i);
        }
      }
    }
  }

  private evictDistantItems(virtualItems: { index: number }[]): void {
    // Keep max 3x the visible items
    const maxItems = virtualItems.length * 3;
    if (this.items.size <= maxItems) return;

    const visibleIndices = new Set(virtualItems.map(v => v.index));
    const minVisible = Math.min(...visibleIndices);
    const maxVisible = Math.max(...visibleIndices);

    // Find items to evict (outside visible range)
    const toEvict: { index: number; distance: number }[] = [];
    for (const index of this.items.keys()) {
      if (!visibleIndices.has(index)) {
        const distance = index < minVisible ? minVisible - index : index - maxVisible;
        toEvict.push({ index, distance });
      }
    }

    // Sort by distance (farthest first)
    toEvict.sort((a, b) => b.distance - a.distance);

    // Evict excess
    const evictCount = this.items.size - maxItems;
    for (let i = 0; i < evictCount && i < toEvict.length; i++) {
      this.items.delete(toEvict[i].index);
    }
  }

  // Public API
  getItem(index: number): T | undefined {
    return this.items.get(index);
  }

  getItemById(id: number): T | undefined {
    for (const item of this.items.values()) {
      if (item.id === id) return item;
    }
    return undefined;
  }

  getCachedItems(): T[] {
    return Array.from(this.items.values());
  }

  updateTotalCount(newCount: number): void {
    this.config.totalCount = newCount;
    if (this.virtualizer && this.scrollContainer) {
      this.virtualizer.setOptions({
        count: newCount,
        getScrollElement: () => this.scrollContainer,
        estimateSize: () => this.config.rowHeight,
        overscan: this.config.overscan,
        observeElementRect: observeElementRect,
        observeElementOffset: observeElementOffset,
        scrollToFn: elementScroll,
      });
    }
  }

  async invalidate(): Promise<void> {
    this.items.clear();
    this.pendingFetches.clear();
    this.render();
  }

  // Force re-render of visible items (e.g., after selection change)
  forceRender(): void {
    this.render();
  }

  scrollToIndex(index: number): void {
    this.virtualizer?.scrollToIndex(index);
  }

  getScrollContainer(): HTMLElement | null {
    return this.scrollContainer;
  }

  getContentContainer(): HTMLElement | null {
    return this.contentContainer;
  }

  getMemoryStats(): { itemsInMemory: number } {
    return { itemsInMemory: this.items.size };
  }

  destroy(): void {
    this.isDestroyed = true;
    this.items.clear();
    this.pendingFetches.clear();
    this.virtualizer = null;
  }
}
