import { createModal } from '../components/Modal';
import { api } from '../services/api';
import type { Settings, Subscription } from '../types';

export async function showSettingsDialog(): Promise<void> {
  const settings = await api.getSettings();
  const subscriptions = await api.getSubscriptions();
  const deadCount = await api.getDeadProxyCount();
  const measurementCounts = await api.getMeasurementCounts();

  if (!settings) return;

  const modal = createModal(`
    <div class="max-h-[80vh] overflow-hidden flex flex-col">
      <div class="p-4 border-b border-gray-200 flex items-center justify-between">
        <h2 class="text-lg font-semibold text-gray-900">Settings</h2>
        <button id="close-btn" class="text-gray-400 hover:text-gray-600">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
          </svg>
        </button>
      </div>

      <!-- Tabs -->
      <div class="flex border-b border-gray-200">
        <button class="tab-btn active px-4 py-2 text-sm font-medium text-primary-600 border-b-2 border-primary-600" data-tab="general">General</button>
        <button class="tab-btn px-4 py-2 text-sm font-medium text-gray-500 hover:text-gray-700" data-tab="subscriptions">Subscriptions</button>
        <button class="tab-btn px-4 py-2 text-sm font-medium text-gray-500 hover:text-gray-700" data-tab="maintenance">Maintenance</button>
      </div>

      <!-- Tab content -->
      <div class="flex-1 overflow-y-auto p-4">
        <!-- General tab -->
        <div id="tab-general" class="tab-content">
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Measurement History Limit</label>
              <input type="number" id="history-limit" class="input" value="${settings.measurementHistoryLimit}" min="10" max="1000">
              <p class="text-xs text-gray-500 mt-1">Maximum number of measurements to keep per proxy</p>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Dead Proxy Threshold (days)</label>
              <input type="number" id="dead-threshold" class="input" value="${settings.deadProxyThresholdDays}" min="1" max="30">
              <p class="text-xs text-gray-500 mt-1">Mark proxy as dead after this many days of failures</p>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Requests Per Hour</label>
              <input type="number" id="requests-limit" class="input" value="${settings.requestsPerHour}" min="1" max="100">
              <p class="text-xs text-gray-500 mt-1">Maximum measurement requests per hour</p>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Subscription Speed Limit (KB/s)</label>
              <input type="number" id="speed-limit" class="input" value="${settings.subscriptionSpeedLimit}" min="0" max="10000">
              <p class="text-xs text-gray-500 mt-1">Speed limit for subscription downloads (0 = unlimited)</p>
            </div>
          </div>
        </div>

        <!-- Subscriptions tab -->
        <div id="tab-subscriptions" class="tab-content hidden">
          ${subscriptions.length === 0 ? `
            <div class="text-center text-gray-500 py-8">No subscriptions</div>
          ` : `
            <div class="space-y-2">
              ${subscriptions.map(sub => renderSubscriptionItem(sub)).join('')}
            </div>
          `}
        </div>

        <!-- Maintenance tab -->
        <div id="tab-maintenance" class="tab-content hidden">
          <div class="space-y-6">
            <div class="bg-gray-50 rounded-lg p-4">
              <h3 class="font-medium text-gray-900 mb-2">Dead Proxies</h3>
              <p class="text-sm text-gray-600 mb-3">Found <span class="font-bold text-red-600">${deadCount}</span> dead proxies</p>
              <button id="delete-dead-btn" class="btn btn-danger btn-sm" ${deadCount === 0 ? 'disabled' : ''}>
                Delete Dead Proxies
              </button>
            </div>

            <div class="bg-gray-50 rounded-lg p-4">
              <h3 class="font-medium text-gray-900 mb-2">Measurement Statistics</h3>
              ${measurementCounts ? `
                <div class="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div class="text-2xl font-bold text-gray-900">${measurementCounts.total}</div>
                    <div class="text-xs text-gray-500">Total</div>
                  </div>
                  <div>
                    <div class="text-2xl font-bold text-gray-900">${measurementCounts.last24h}</div>
                    <div class="text-xs text-gray-500">Last 24h</div>
                  </div>
                  <div>
                    <div class="text-2xl font-bold text-gray-900">${measurementCounts.last7d}</div>
                    <div class="text-xs text-gray-500">Last 7 days</div>
                  </div>
                </div>
              ` : '<p class="text-sm text-gray-500">No data</p>'}
            </div>
          </div>
        </div>
      </div>

      <div class="p-4 border-t border-gray-200 flex justify-end gap-2">
        <button id="cancel-btn" class="btn btn-secondary">Cancel</button>
        <button id="save-btn" class="btn btn-primary">Save</button>
      </div>
    </div>
  `);

  const element = modal.getElement();

  // Tab switching
  element.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const tab = btn.getAttribute('data-tab');

      // Update tab buttons
      element.querySelectorAll('.tab-btn').forEach(b => {
        b.classList.remove('active', 'text-primary-600', 'border-primary-600', 'border-b-2');
        b.classList.add('text-gray-500');
      });
      btn.classList.add('active', 'text-primary-600', 'border-primary-600', 'border-b-2');
      btn.classList.remove('text-gray-500');

      // Show/hide content
      element.querySelectorAll('.tab-content').forEach(content => {
        content.classList.add('hidden');
      });
      element.querySelector(`#tab-${tab}`)?.classList.remove('hidden');
    });
  });

  // Subscription actions
  element.querySelectorAll('.update-sub-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      const subId = parseInt(btn.getAttribute('data-id') || '0', 10);
      btn.textContent = 'Updating...';
      (btn as HTMLButtonElement).disabled = true;
      await api.updateSubscription(subId);
      btn.textContent = 'Update';
      (btn as HTMLButtonElement).disabled = false;
    });
  });

  element.querySelectorAll('.delete-sub-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      const subId = parseInt(btn.getAttribute('data-id') || '0', 10);
      if (confirm('Delete this subscription?')) {
        await api.deleteSubscription(subId);
        btn.closest('.sub-item')?.remove();
      }
    });
  });

  element.querySelectorAll('.toggle-sub-checkbox').forEach(checkbox => {
    checkbox.addEventListener('change', async (e) => {
      const subId = parseInt(checkbox.getAttribute('data-id') || '0', 10);
      const enabled = (e.target as HTMLInputElement).checked;
      await api.toggleSubscription(subId, enabled);
    });
  });

  // Delete dead proxies
  element.querySelector('#delete-dead-btn')?.addEventListener('click', async () => {
    const btn = element.querySelector('#delete-dead-btn') as HTMLButtonElement;
    btn.textContent = 'Deleting...';
    btn.disabled = true;
    const count = await api.deleteDeadProxies();
    btn.textContent = `Deleted ${count}`;
    setTimeout(() => {
      btn.textContent = 'Delete Dead Proxies';
      btn.disabled = true;
    }, 2000);
  });

  // Close button
  element.querySelector('#close-btn')?.addEventListener('click', () => modal.close(false));
  element.querySelector('#cancel-btn')?.addEventListener('click', () => modal.close(false));

  // Save button
  element.querySelector('#save-btn')?.addEventListener('click', async () => {
    const newSettings: Settings = {
      proxyListenAddr: settings.proxyListenAddr, // Keep existing value (managed by Toolbar)
      measurementHistoryLimit: parseInt((element.querySelector('#history-limit') as HTMLInputElement).value, 10),
      deadProxyThresholdDays: parseInt((element.querySelector('#dead-threshold') as HTMLInputElement).value, 10),
      requestsPerHour: parseInt((element.querySelector('#requests-limit') as HTMLInputElement).value, 10),
      subscriptionSpeedLimit: parseInt((element.querySelector('#speed-limit') as HTMLInputElement).value, 10),
    };

    if (await api.updateSettings(newSettings)) {
      modal.close(false);
    }
  });
}

function renderSubscriptionItem(sub: Subscription): string {
  return `
    <div class="sub-item flex items-center justify-between p-3 bg-gray-50 rounded-lg">
      <div class="flex items-center gap-3">
        <input type="checkbox" class="toggle-sub-checkbox" data-id="${sub.id}" ${sub.enabled ? 'checked' : ''}>
        <div>
          <div class="font-medium text-gray-900">${escapeHtml(sub.name || sub.url)}</div>
          <div class="text-xs text-gray-500">${sub.proxyCount} proxies | Updated: ${sub.lastUpdate || 'never'}</div>
        </div>
      </div>
      <div class="flex gap-2">
        <button class="update-sub-btn btn btn-secondary btn-sm" data-id="${sub.id}">Update</button>
        <button class="delete-sub-btn btn btn-danger btn-sm" data-id="${sub.id}">Delete</button>
      </div>
    </div>
  `;
}

function escapeHtml(str: string): string {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}
