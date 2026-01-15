import type {
  ProxyActivatedEvent,
  SubscriptionCompleteEvent,
  StatusMessageEvent,
  TunActivatedEvent
} from '../types';

// Wails runtime event types
declare global {
  interface Window {
    runtime: {
      EventsOn(eventName: string, callback: (...data: unknown[]) => void): () => void;
      EventsOff(eventName: string): void;
    };
  }
}

interface EventCallbacks {
  onProxyActivated?: (data: ProxyActivatedEvent) => void;
  onProxyDeactivated?: () => void;
  onProxyUpdated?: (id: number) => void;
  onSubscriptionImporting?: (data: { id: number; progress: number }) => void;
  onSubscriptionComplete?: (data: SubscriptionCompleteEvent) => void;
  onSysProxyChanged?: (enabled: boolean) => void;
  onTunActivated?: (data: TunActivatedEvent) => void;
  onTunDeactivated?: () => void;
  onStatusMessage?: (data: StatusMessageEvent) => void;
}

export function setupEventListeners(callbacks: EventCallbacks): void {
  const runtime = window.runtime;
  if (!runtime) {
    console.warn('Wails runtime not available');
    return;
  }

  // Proxy events
  if (callbacks.onProxyActivated) {
    runtime.EventsOn('proxy:activated', (data: unknown) => {
      callbacks.onProxyActivated!(data as ProxyActivatedEvent);
    });
  }

  if (callbacks.onProxyDeactivated) {
    runtime.EventsOn('proxy:deactivated', () => {
      callbacks.onProxyDeactivated!();
    });
  }

  if (callbacks.onProxyUpdated) {
    runtime.EventsOn('proxy:updated', (data: unknown) => {
      const { id } = data as { id: number };
      callbacks.onProxyUpdated!(id);
    });
  }

  // Subscription events
  if (callbacks.onSubscriptionImporting) {
    runtime.EventsOn('subscription:importing', (data: unknown) => {
      callbacks.onSubscriptionImporting!(data as { id: number; progress: number });
    });
  }

  if (callbacks.onSubscriptionComplete) {
    runtime.EventsOn('subscription:complete', (data: unknown) => {
      callbacks.onSubscriptionComplete!(data as SubscriptionCompleteEvent);
    });
  }

  // System proxy events
  if (callbacks.onSysProxyChanged) {
    runtime.EventsOn('sysproxy:changed', (data: unknown) => {
      const { enabled } = data as { enabled: boolean };
      callbacks.onSysProxyChanged!(enabled);
    });
  }

  // TUN events
  if (callbacks.onTunActivated) {
    runtime.EventsOn('tun:activated', (data: unknown) => {
      callbacks.onTunActivated!(data as TunActivatedEvent);
    });
  }

  if (callbacks.onTunDeactivated) {
    runtime.EventsOn('tun:deactivated', () => {
      callbacks.onTunDeactivated!();
    });
  }

  // Status events
  if (callbacks.onStatusMessage) {
    runtime.EventsOn('status:message', (data: unknown) => {
      callbacks.onStatusMessage!(data as StatusMessageEvent);
    });
  }
}
