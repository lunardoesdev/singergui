// Group types
export interface Group {
  id: number;
  name: string;
  proxyCount: number;
}

// Proxy types
export interface ProxyInfo {
  id: number;
  name: string;
  protocol: string;
  server: string;
  port: number;
  groupId?: number;
  groupName?: string;
  latency?: number;
  speed?: number;
  successRate?: number;
  isDead: boolean;
  isActive: boolean;
}

export interface ProxyDetails extends ProxyInfo {
  link: string;
  createdAt: string;
  subscriptionId?: number;
  subscriptionName?: string;
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  avgLatency: number;
  avgSpeed: number;
  lastMeasured?: string;
}

export interface ProxyStats {
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  avgLatency: number;
  avgSpeed: number;
}

export interface PingPoint {
  timestamp: string;
  latency: number;
}

export interface SpeedPoint {
  timestamp: string;
  speed: number;
}

export interface HealthStats {
  successCount: number;
  failCount: number;
  successRate: number;
}

// Active proxy
export interface ActiveProxyInfo {
  id: number;
  name: string;
  listenAddress: string;
}

// Subscription types
export interface Subscription {
  id: number;
  url: string;
  name?: string;
  enabled: boolean;
  lastUpdate?: string;
  proxyCount: number;
}

// Settings types
export interface Settings {
  proxyListenAddr: string;
  measurementHistoryLimit: number;
  deadProxyThresholdDays: number;
  requestsPerHour: number;
  subscriptionSpeedLimit: number;
}

// Clipboard types
export interface ClipboardContent {
  links: string[];
  subscriptionUrl: string;
}

// Measurement counts
export interface MeasurementCounts {
  total: number;
  last24h: number;
  last7d: number;
}

// Events
export interface ProxyActivatedEvent {
  id: number;
  address: string;
}

export interface SubscriptionProgressEvent {
  id: number;
  progress: number;
}

export interface SubscriptionCompleteEvent {
  id: number;
  count: number;
}

export interface StatusMessageEvent {
  text: string;
}
