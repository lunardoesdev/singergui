import { Sidebar } from './components/Sidebar';
import { ProxyList } from './components/ProxyList';
import { Toolbar } from './components/Toolbar';
import { StatusBar } from './components/StatusBar';
import { store } from './state/store';
import { setupEventListeners } from './services/events';

export function createApp(container: HTMLElement): void {
  // Create main layout
  container.innerHTML = `
    <div id="toolbar" class="flex-shrink-0"></div>
    <div class="flex flex-1 overflow-hidden">
      <div id="sidebar" class="w-64 flex-shrink-0 border-r border-gray-200 bg-white"></div>
      <div id="proxy-list" class="flex-1 bg-gray-50 overflow-hidden"></div>
    </div>
    <div id="status-bar" class="flex-shrink-0"></div>
  `;

  // Initialize components
  const toolbarContainer = document.getElementById('toolbar')!;
  const sidebarContainer = document.getElementById('sidebar')!;
  const proxyListContainer = document.getElementById('proxy-list')!;
  const statusBarContainer = document.getElementById('status-bar')!;

  // Create component instances
  const toolbar = new Toolbar(toolbarContainer);
  const sidebar = new Sidebar(sidebarContainer);
  const proxyList = new ProxyList(proxyListContainer);
  const statusBar = new StatusBar(statusBarContainer);

  // Wire up interactions
  sidebar.onGroupSelected = (groupId: number | null) => {
    store.setSelectedGroup(groupId);
    proxyList.loadProxies(groupId);
  };

  // Refresh sidebar when proxy data changes (add/delete/move)
  proxyList.onDataChanged = () => {
    sidebar.loadGroups();
  };

  // Setup Wails event listeners
  setupEventListeners({
    onProxyActivated: (data) => {
      const activeProxy = { id: data.id, name: '', listenAddress: data.address };
      store.setActiveProxy(activeProxy);
      toolbar.updateActiveProxy(activeProxy);
      statusBar.setMessage(`Proxy active on ${data.address}`);
    },
    onProxyDeactivated: () => {
      store.setActiveProxy(null);
      toolbar.updateActiveProxy(null);
      statusBar.setMessage('Proxy deactivated');
    },
    onSubscriptionComplete: (data) => {
      statusBar.setMessage(`Imported ${data.count} proxies`);
      proxyList.refresh();
      sidebar.loadGroups(); // Refresh counts
    },
    onStatusMessage: (data) => {
      statusBar.setMessage(data.text);
    }
  });

  // Initial load
  sidebar.loadGroups();
  proxyList.loadProxies(null);
  toolbar.initialize();
  statusBar.setMessage('Ready');

  // Setup keyboard shortcuts
  setupKeyboardShortcuts(proxyList);
}

function setupKeyboardShortcuts(proxyList: ProxyList): void {
  document.addEventListener('keydown', (e) => {
    // Check if we're in an input field
    const target = e.target as HTMLElement;
    if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
      return;
    }

    // Ctrl+C - Copy
    if (e.ctrlKey && e.key === 'c') {
      proxyList.copySelected();
      e.preventDefault();
    }

    // Ctrl+V - Paste
    if (e.ctrlKey && e.key === 'v') {
      proxyList.handlePaste();
      e.preventDefault();
    }

    // Ctrl+A - Select All
    if (e.ctrlKey && e.key === 'a') {
      proxyList.selectAll();
      e.preventDefault();
    }

    // Delete - Delete selected
    if (e.key === 'Delete') {
      proxyList.deleteSelected();
      e.preventDefault();
    }

    // Escape - Clear selection or close modal
    if (e.key === 'Escape') {
      proxyList.clearSelection();
    }
  });
}
