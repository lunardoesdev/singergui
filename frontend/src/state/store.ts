import type { Group, ProxyInfo, ActiveProxyInfo, TunStatus } from '../types';

type Listener = () => void;

// Range-based selection for efficient handling of millions of items
interface SelectionRange {
  start: number;  // Index start (inclusive)
  end: number;    // Index end (inclusive)
}

interface State {
  groups: Group[];
  proxies: ProxyInfo[];
  selectedGroupId: number | null;
  // Index-based selection ranges for virtual scrolling
  selectedIndexRanges: SelectionRange[];
  // Also keep track of individual IDs for operations that need them
  selectedProxyIds: Set<number>;
  activeProxy: ActiveProxyInfo | null;
  isSystemProxySet: boolean;
  tunStatus: TunStatus | null;
  listenAddress: string;
  lastSelectedIndex: number | null;  // For shift+click range selection
}

class Store {
  private state: State = {
    groups: [],
    proxies: [],
    selectedGroupId: null,
    selectedIndexRanges: [],
    selectedProxyIds: new Set(),
    activeProxy: null,
    isSystemProxySet: false,
    tunStatus: null,
    listenAddress: '127.0.0.1:1080',
    lastSelectedIndex: null
  };

  private listeners: Listener[] = [];

  subscribe(listener: Listener): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notify(): void {
    this.listeners.forEach(l => l());
  }

  // Groups
  setGroups(groups: Group[]): void {
    this.state.groups = groups;
    this.notify();
  }

  getGroups(): Group[] {
    return this.state.groups;
  }

  setSelectedGroup(groupId: number | null): void {
    this.state.selectedGroupId = groupId;
    this.clearSelection();
  }

  getSelectedGroup(): number | null {
    return this.state.selectedGroupId;
  }

  // Proxies
  setProxies(proxies: ProxyInfo[]): void {
    this.state.proxies = proxies;
    this.notify();
  }

  getProxies(): ProxyInfo[] {
    return this.state.proxies;
  }

  // Index-based selection (for virtual scrolling)
  selectIndex(index: number, append: boolean = false): void {
    if (!append) {
      this.state.selectedIndexRanges = [];
      this.state.selectedProxyIds.clear();
    }
    this.addIndexToSelection(index);
    this.state.lastSelectedIndex = index;
    this.notify();
  }

  selectIndexRange(startIndex: number, endIndex: number, append: boolean = false): void {
    if (!append) {
      this.state.selectedIndexRanges = [];
      this.state.selectedProxyIds.clear();
    }
    const start = Math.min(startIndex, endIndex);
    const end = Math.max(startIndex, endIndex);
    this.state.selectedIndexRanges.push({ start, end });
    this.mergeRanges();
    this.state.lastSelectedIndex = endIndex;
    this.notify();
  }

  toggleIndexSelection(index: number): void {
    if (this.isIndexSelected(index)) {
      this.removeIndexFromSelection(index);
    } else {
      this.addIndexToSelection(index);
    }
    this.state.lastSelectedIndex = index;
    this.notify();
  }

  private addIndexToSelection(index: number): void {
    // Add as a single-item range
    this.state.selectedIndexRanges.push({ start: index, end: index });
    this.mergeRanges();
  }

  private removeIndexFromSelection(index: number): void {
    const newRanges: SelectionRange[] = [];
    for (const range of this.state.selectedIndexRanges) {
      if (index < range.start || index > range.end) {
        // Index not in this range, keep it
        newRanges.push(range);
      } else if (index === range.start && index === range.end) {
        // Single item range, remove entirely
        continue;
      } else if (index === range.start) {
        // Remove from start
        newRanges.push({ start: range.start + 1, end: range.end });
      } else if (index === range.end) {
        // Remove from end
        newRanges.push({ start: range.start, end: range.end - 1 });
      } else {
        // Split range
        newRanges.push({ start: range.start, end: index - 1 });
        newRanges.push({ start: index + 1, end: range.end });
      }
    }
    this.state.selectedIndexRanges = newRanges;
  }

  private mergeRanges(): void {
    if (this.state.selectedIndexRanges.length <= 1) return;

    // Sort by start
    this.state.selectedIndexRanges.sort((a, b) => a.start - b.start);

    const merged: SelectionRange[] = [];
    let current = this.state.selectedIndexRanges[0];

    for (let i = 1; i < this.state.selectedIndexRanges.length; i++) {
      const next = this.state.selectedIndexRanges[i];
      if (next.start <= current.end + 1) {
        // Overlapping or adjacent, merge
        current = { start: current.start, end: Math.max(current.end, next.end) };
      } else {
        merged.push(current);
        current = next;
      }
    }
    merged.push(current);
    this.state.selectedIndexRanges = merged;
  }

  isIndexSelected(index: number): boolean {
    return this.state.selectedIndexRanges.some(
      range => index >= range.start && index <= range.end
    );
  }

  getSelectedIndexCount(): number {
    return this.state.selectedIndexRanges.reduce(
      (sum, range) => sum + (range.end - range.start + 1),
      0
    );
  }

  getSelectedIndexRanges(): SelectionRange[] {
    return [...this.state.selectedIndexRanges];
  }

  getLastSelectedIndex(): number | null {
    return this.state.lastSelectedIndex;
  }

  // Select all (as a single range covering 0 to totalCount-1)
  selectAllIndices(totalCount: number): void {
    if (totalCount > 0) {
      this.state.selectedIndexRanges = [{ start: 0, end: totalCount - 1 }];
    }
    this.notify();
  }

  clearSelection(): void {
    this.state.selectedIndexRanges = [];
    this.state.selectedProxyIds.clear();
    this.state.lastSelectedIndex = null;
    this.notify();
  }

  // Legacy ID-based methods (for compatibility with operations that need actual IDs)
  addProxyIdToSelection(id: number): void {
    this.state.selectedProxyIds.add(id);
  }

  getSelectedProxyIds(): number[] {
    return Array.from(this.state.selectedProxyIds);
  }

  setSelectedProxyIds(ids: number[]): void {
    this.state.selectedProxyIds = new Set(ids);
    this.notify();
  }

  // Deprecated - use index-based methods instead
  selectProxy(id: number, append: boolean = false): void {
    if (!append) {
      this.state.selectedProxyIds.clear();
    }
    this.state.selectedProxyIds.add(id);
    this.notify();
  }

  toggleProxySelection(id: number): void {
    if (this.state.selectedProxyIds.has(id)) {
      this.state.selectedProxyIds.delete(id);
    } else {
      this.state.selectedProxyIds.add(id);
    }
    this.notify();
  }

  isProxySelected(id: number): boolean {
    return this.state.selectedProxyIds.has(id);
  }

  selectAllProxies(): void {
    this.state.selectedProxyIds = new Set(this.state.proxies.map(p => p.id));
    this.notify();
  }

  deselectProxy(id: number): void {
    this.state.selectedProxyIds.delete(id);
    this.notify();
  }

  // Active proxy
  setActiveProxy(proxy: ActiveProxyInfo | null): void {
    this.state.activeProxy = proxy;
    this.notify();
  }

  getActiveProxy(): ActiveProxyInfo | null {
    return this.state.activeProxy;
  }

  // TUN
  setTunStatus(status: TunStatus | null): void {
    this.state.tunStatus = status;
    this.notify();
  }

  getTunStatus(): TunStatus | null {
    return this.state.tunStatus;
  }

  // System proxy
  setSystemProxySet(isSet: boolean): void {
    this.state.isSystemProxySet = isSet;
    this.notify();
  }

  isSystemProxySet(): boolean {
    return this.state.isSystemProxySet;
  }

  // Listen address
  setListenAddress(addr: string): void {
    this.state.listenAddress = addr;
    this.notify();
  }

  getListenAddress(): string {
    return this.state.listenAddress;
  }
}

export const store = new Store();
