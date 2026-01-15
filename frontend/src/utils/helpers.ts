// Format latency in milliseconds
export function formatLatency(ms: number | null | undefined): string {
  if (ms === null || ms === undefined || ms < 0) return '-';
  if (ms < 1) return '<1ms';
  return `${Math.round(ms)}ms`;
}

// Format speed in bytes per second
export function formatSpeed(bytesPerSec: number | null | undefined): string {
  if (bytesPerSec === null || bytesPerSec === undefined || bytesPerSec < 0) return '-';

  if (bytesPerSec < 1024) {
    return `${bytesPerSec.toFixed(0)} B/s`;
  }
  if (bytesPerSec < 1024 * 1024) {
    return `${(bytesPerSec / 1024).toFixed(1)} KB/s`;
  }
  return `${(bytesPerSec / (1024 * 1024)).toFixed(2)} MB/s`;
}

// Format percentage
export function formatPercent(value: number | null | undefined): string {
  if (value === null || value === undefined || value < 0) return '-';
  return `${Math.round(value * 100)}%`;
}

// Format date
export function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return '-';
  const date = new Date(dateStr);
  return date.toLocaleString();
}

// Format relative time
export function formatRelativeTime(dateStr: string | null | undefined): string {
  if (!dateStr) return 'never';

  const date = new Date(dateStr);
  const now = new Date();
  const diff = now.getTime() - date.getTime();

  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  if (minutes > 0) return `${minutes}m ago`;
  return 'just now';
}

// Truncate string
export function truncate(str: string, maxLen: number): string {
  if (str.length <= maxLen) return str;
  return str.slice(0, maxLen - 3) + '...';
}

// Get protocol color class
export function getProtocolColor(protocol: string): string {
  const colors: Record<string, string> = {
    vless: 'text-blue-600 bg-blue-50',
    vmess: 'text-purple-600 bg-purple-50',
    ss: 'text-green-600 bg-green-50',
    trojan: 'text-red-600 bg-red-50',
    socks5: 'text-orange-600 bg-orange-50',
    http: 'text-gray-600 bg-gray-50',
    https: 'text-gray-600 bg-gray-50',
  };
  return colors[protocol.toLowerCase()] || 'text-gray-600 bg-gray-50';
}

// Get status color class
export function getStatusColor(isDead: boolean, isActive: boolean): string {
  if (isActive) return 'text-green-500';
  if (isDead) return 'text-red-400';
  return 'text-gray-400';
}

// Debounce function
export function debounce<T extends (...args: unknown[]) => unknown>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
}

// Generate unique ID
let idCounter = 0;
export function uniqueId(prefix: string = 'id'): string {
  return `${prefix}_${++idCounter}`;
}

// Escape HTML
export function escapeHtml(str: string): string {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

// Create element helper
export function createElement<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  className?: string,
  innerHTML?: string
): HTMLElementTagNameMap[K] {
  const el = document.createElement(tag);
  if (className) el.className = className;
  if (innerHTML) el.innerHTML = innerHTML;
  return el;
}
