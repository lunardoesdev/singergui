import { api } from '../services/api';
import { store } from '../state/store';
import type { ActiveProxyInfo } from '../types';
import { showSettingsDialog } from '../dialogs/SettingsDialog';

export class Toolbar {
  private container: HTMLElement;
  private listenAddress: string = '127.0.0.1:1080';
  private isSystemProxySet: boolean = false;

  constructor(container: HTMLElement) {
    this.container = container;
    this.render();
  }

  async initialize(): Promise<void> {
    this.listenAddress = await api.getListenAddress();
    this.isSystemProxySet = await api.isSystemProxySet();
    store.setListenAddress(this.listenAddress);
    store.setSystemProxySet(this.isSystemProxySet);
    this.render();
  }

  updateActiveProxy(_proxy: ActiveProxyInfo | null): void {
    this.render();
  }

  private render(): void {
    const activeProxy = store.getActiveProxy();

    this.container.innerHTML = `
      <div class="flex items-center justify-between px-4 py-2 bg-white border-b border-gray-200">
        <!-- Left side - App info -->
        <div class="flex items-center gap-4">
          <h1 class="text-lg font-semibold text-gray-800">SingerGUI</h1>
          <div class="h-6 w-px bg-gray-200"></div>
          <button id="settings-btn" class="p-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100" title="Settings">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/>
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
            </svg>
          </button>
        </div>

        <!-- Right side - Proxy controls -->
        <div class="flex items-center gap-4">
          <!-- Listen address -->
          <div class="flex items-center gap-2 text-sm">
            <span class="text-gray-500">Listen:</span>
            <code class="px-2 py-1 bg-gray-100 rounded text-gray-700 font-mono">${this.escapeHtml(this.listenAddress)}</code>
            <button id="change-addr-btn" class="text-primary-600 hover:text-primary-800 font-medium">Change</button>
          </div>

          <div class="h-6 w-px bg-gray-200"></div>

          <!-- System proxy toggle -->
          <button id="sysproxy-btn" class="btn ${this.isSystemProxySet ? 'btn-primary' : 'btn-secondary'} btn-sm">
            ${this.isSystemProxySet ? 'Clear System Proxy' : 'Set System Proxy'}
          </button>

          <!-- Active proxy indicator -->
          <div class="flex items-center gap-2 px-3 py-1.5 rounded-lg ${activeProxy ? 'bg-green-50 border border-green-200' : 'bg-gray-50 border border-gray-200'}">
            <span class="w-2 h-2 rounded-full ${activeProxy ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}"></span>
            <span class="text-sm ${activeProxy ? 'text-green-700' : 'text-gray-500'}">
              ${activeProxy ? `Active: ${this.escapeHtml(activeProxy.listenAddress)}` : 'No Active Proxy'}
            </span>
          </div>
        </div>
      </div>
    `;

    this.attachEventListeners();
  }

  private attachEventListeners(): void {
    // Settings button
    this.container.querySelector('#settings-btn')?.addEventListener('click', () => {
      showSettingsDialog();
    });

    // Change address button
    this.container.querySelector('#change-addr-btn')?.addEventListener('click', async () => {
      const newAddr = prompt('Enter listen address (host:port):', this.listenAddress);
      if (newAddr && newAddr !== this.listenAddress) {
        if (await api.setListenAddress(newAddr)) {
          this.listenAddress = newAddr;
          store.setListenAddress(newAddr);
          this.render();
        }
      }
    });

    // System proxy button
    this.container.querySelector('#sysproxy-btn')?.addEventListener('click', async () => {
      if (this.isSystemProxySet) {
        if (await api.clearSystemProxy()) {
          this.isSystemProxySet = false;
          store.setSystemProxySet(false);
          this.render();
        }
      } else {
        const activeProxy = store.getActiveProxy();
        if (!activeProxy) {
          alert('Please activate a proxy first');
          return;
        }
        if (await api.setSystemProxy()) {
          this.isSystemProxySet = true;
          store.setSystemProxySet(true);
          this.render();
        }
      }
    });
  }

  private escapeHtml(str: string): string {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }
}
