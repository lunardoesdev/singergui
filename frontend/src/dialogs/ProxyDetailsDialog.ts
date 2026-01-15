import { createModal } from '../components/Modal';
import { api } from '../services/api';
import { LineChart, BarChart } from '../components/Chart';
import { formatLatency, formatSpeed, formatPercent, formatRelativeTime, getProtocolColor } from '../utils/helpers';

export async function showProxyDetailsDialog(proxyId: number): Promise<void> {
  const details = await api.getProxyDetails(proxyId);
  if (!details) return;

  const pingHistory = await api.getPingHistory(proxyId, 50);
  const speedHistory = await api.getSpeedHistory(proxyId, 50);
  const healthStats = await api.getHealthStats(proxyId);

  const protocolColor = getProtocolColor(details.protocol);

  const modal = createModal(`
    <div class="p-6 max-h-[80vh] overflow-y-auto">
      <div class="flex items-start justify-between mb-4">
        <div>
          <h2 class="text-lg font-semibold text-gray-900">${escapeHtml(details.name || details.server)}</h2>
          <div class="flex items-center gap-2 mt-1">
            <span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${protocolColor}">
              ${details.protocol}
            </span>
            <span class="text-sm text-gray-500">${escapeHtml(details.server)}:${details.port}</span>
          </div>
        </div>
        <button id="close-btn" class="text-gray-400 hover:text-gray-600">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
          </svg>
        </button>
      </div>

      <!-- Stats summary -->
      <div class="grid grid-cols-4 gap-4 mb-6">
        <div class="bg-gray-50 rounded-lg p-3 text-center">
          <div class="text-2xl font-bold text-gray-900">${formatLatency(details.avgLatency)}</div>
          <div class="text-xs text-gray-500">Avg Latency</div>
        </div>
        <div class="bg-gray-50 rounded-lg p-3 text-center">
          <div class="text-2xl font-bold text-gray-900">${formatSpeed(details.avgSpeed)}</div>
          <div class="text-xs text-gray-500">Avg Speed</div>
        </div>
        <div class="bg-gray-50 rounded-lg p-3 text-center">
          <div class="text-2xl font-bold ${healthStats && healthStats.successRate > 0.8 ? 'text-green-600' : healthStats && healthStats.successRate > 0.5 ? 'text-yellow-600' : 'text-red-600'}">
            ${healthStats ? formatPercent(healthStats.successRate) : '-'}
          </div>
          <div class="text-xs text-gray-500">Success Rate</div>
        </div>
        <div class="bg-gray-50 rounded-lg p-3 text-center">
          <div class="text-2xl font-bold text-gray-900">${details.totalRequests}</div>
          <div class="text-xs text-gray-500">Total Requests</div>
        </div>
      </div>

      <!-- Charts -->
      <div class="space-y-6 mb-6">
        <div>
          <h3 class="text-sm font-medium text-gray-700 mb-2">Latency History</h3>
          <div id="latency-chart" class="bg-gray-50 rounded-lg p-2"></div>
        </div>
        <div>
          <h3 class="text-sm font-medium text-gray-700 mb-2">Speed History</h3>
          <div id="speed-chart" class="bg-gray-50 rounded-lg p-2"></div>
        </div>
        <div>
          <h3 class="text-sm font-medium text-gray-700 mb-2">Health (Success/Fail)</h3>
          <div id="health-chart" class="bg-gray-50 rounded-lg p-2"></div>
        </div>
      </div>

      <!-- Details -->
      <div class="border-t border-gray-200 pt-4">
        <h3 class="text-sm font-medium text-gray-700 mb-2">Details</h3>
        <div class="grid grid-cols-2 gap-2 text-sm">
          <div class="text-gray-500">Group:</div>
          <div class="text-gray-900">${details.groupName ? escapeHtml(details.groupName) : 'No Group'}</div>
          <div class="text-gray-500">Subscription:</div>
          <div class="text-gray-900">${details.subscriptionName ? escapeHtml(details.subscriptionName) : 'Manual'}</div>
          <div class="text-gray-500">Created:</div>
          <div class="text-gray-900">${formatRelativeTime(details.createdAt)}</div>
          <div class="text-gray-500">Last Measured:</div>
          <div class="text-gray-900">${formatRelativeTime(details.lastMeasured)}</div>
        </div>
      </div>

      <!-- Link -->
      <div class="border-t border-gray-200 pt-4 mt-4">
        <h3 class="text-sm font-medium text-gray-700 mb-2">Proxy Link</h3>
        <div class="flex gap-2">
          <input type="text" readonly value="${escapeHtml(details.link)}"
                 class="input flex-1 font-mono text-xs bg-gray-50">
          <button id="copy-btn" class="btn btn-secondary">Copy</button>
        </div>
      </div>

      <div class="flex justify-end mt-6">
        <button id="close-btn-2" class="btn btn-secondary">Close</button>
      </div>
    </div>
  `);

  const element = modal.getElement();

  // Initialize charts
  const latencyChartContainer = element.querySelector('#latency-chart') as HTMLElement;
  const speedChartContainer = element.querySelector('#speed-chart') as HTMLElement;
  const healthChartContainer = element.querySelector('#health-chart') as HTMLElement;

  if (pingHistory.length > 0) {
    const latencyChart = new LineChart(latencyChartContainer, {
      width: 450,
      height: 150,
      lineColor: '#0ea5e9',
      fillColor: 'rgba(14, 165, 233, 0.1)',
    });
    latencyChart.draw(pingHistory.map((p, i) => ({ x: i, y: p.latency })));
  } else {
    latencyChartContainer.innerHTML = '<div class="text-center text-gray-400 py-8">No latency data</div>';
  }

  if (speedHistory.length > 0) {
    const speedChart = new LineChart(speedChartContainer, {
      width: 450,
      height: 150,
      lineColor: '#22c55e',
      fillColor: 'rgba(34, 197, 94, 0.1)',
    });
    speedChart.draw(speedHistory.map((p, i) => ({ x: i, y: p.speed })));
  } else {
    speedChartContainer.innerHTML = '<div class="text-center text-gray-400 py-8">No speed data</div>';
  }

  if (healthStats) {
    const healthChart = new BarChart(healthChartContainer, {
      width: 450,
      height: 120,
    });
    healthChart.draw([
      { label: 'Success', value: healthStats.successCount, color: '#22c55e' },
      { label: 'Failed', value: healthStats.failCount, color: '#ef4444' },
    ]);
  } else {
    healthChartContainer.innerHTML = '<div class="text-center text-gray-400 py-8">No health data</div>';
  }

  // Event listeners
  element.querySelector('#close-btn')?.addEventListener('click', () => modal.close());
  element.querySelector('#close-btn-2')?.addEventListener('click', () => modal.close());
  element.querySelector('#copy-btn')?.addEventListener('click', async () => {
    await api.copyToClipboard(details.link);
    const btn = element.querySelector('#copy-btn') as HTMLButtonElement;
    btn.textContent = 'Copied!';
    setTimeout(() => { btn.textContent = 'Copy'; }, 2000);
  });
}

function escapeHtml(str: string): string {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}
