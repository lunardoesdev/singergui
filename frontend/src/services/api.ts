// This file provides the API layer to call Go backend methods via Wails bindings
// Import directly from generated Wails bindings

import * as App from '../../wailsjs/go/main/App';

import type {
  Group,
  ProxyInfo,
  ProxyDetails,
  ProxyStats,
  PingPoint,
  SpeedPoint,
  HealthStats,
  Subscription,
  Settings,
  ClipboardContent,
  MeasurementCounts,
  ActiveProxyInfo,
  TunStatus
} from '../types';

// API wrapper with error handling
class API {
  // Group methods
  async getGroups(): Promise<Group[]> {
    console.log('[API] getGroups called');
    try {
      const result = await App.GetGroups();
      console.log('[API] getGroups result:', result);
      return result || [];
    } catch (e) {
      console.error('[API] Failed to get groups:', e);
      return [];
    }
  }

  async createGroup(name: string): Promise<Group | null> {
    console.log('[API] createGroup called with:', name);
    try {
      const result = await App.CreateGroup(name);
      console.log('[API] createGroup result:', result);
      return result;
    } catch (e) {
      console.error('[API] Failed to create group:', e);
      return null;
    }
  }

  async getGroupsPaginated(offset: number, limit: number): Promise<Group[]> {
    try {
      const result = await App.GetGroupsPaginated(offset, limit);
      return result || [];
    } catch (e) {
      console.error('[API] Failed to get groups paginated:', e);
      return [];
    }
  }

  async getGroupCount(): Promise<number> {
    try {
      return await App.GetGroupCount();
    } catch (e) {
      console.error('[API] Failed to get group count:', e);
      return 0;
    }
  }

  async renameGroup(id: number, name: string): Promise<boolean> {
    try {
      await App.RenameGroup(id, name);
      return true;
    } catch (e) {
      console.error('Failed to rename group:', e);
      return false;
    }
  }

  async deleteGroup(id: number): Promise<boolean> {
    try {
      await App.DeleteGroup(id);
      return true;
    } catch (e) {
      console.error('Failed to delete group:', e);
      return false;
    }
  }

  async searchGroups(
    query: string,
    offset: number,
    limit: number
  ): Promise<{ groups: Group[]; totalCount: number }> {
    try {
      const result = await App.SearchGroups(query, offset, limit);
      return result || { groups: [], totalCount: 0 };
    } catch (e) {
      console.error('Failed to search groups:', e);
      return { groups: [], totalCount: 0 };
    }
  }

  // Proxy methods
  async getProxies(groupId: number | null, offset: number = 0, limit: number = 100): Promise<ProxyInfo[]> {
    try {
      const result = await App.GetProxies(groupId ?? 0, offset, limit);
      return result || [];
    } catch (e) {
      console.error('Failed to get proxies:', e);
      return [];
    }
  }

  async getProxyCount(groupId: number | null): Promise<number> {
    try {
      return await App.GetProxyCount(groupId ?? 0);
    } catch (e) {
      console.error('Failed to get proxy count:', e);
      return 0;
    }
  }

  async getProxyIDs(groupId: number | null, offset: number, limit: number): Promise<number[]> {
    try {
      const result = await App.GetProxyIDs(groupId ?? 0, offset, limit);
      return result || [];
    } catch (e) {
      console.error('Failed to get proxy IDs:', e);
      return [];
    }
  }

  async searchProxies(
    groupId: number | null,
    query: string,
    offset: number,
    limit: number
  ): Promise<{ proxies: ProxyInfo[]; totalCount: number }> {
    try {
      const result = await App.SearchProxies(groupId ?? 0, query, offset, limit);
      return result || { proxies: [], totalCount: 0 };
    } catch (e) {
      console.error('Failed to search proxies:', e);
      return { proxies: [], totalCount: 0 };
    }
  }

  async getProxyDetails(id: number): Promise<ProxyDetails | null> {
    try {
      return await App.GetProxyDetails(id);
    } catch (e) {
      console.error('Failed to get proxy details:', e);
      return null;
    }
  }

  async addProxy(link: string, groupId: number | null): Promise<boolean> {
    try {
      await App.AddProxy(link, groupId);
      return true;
    } catch (e) {
      console.error('Failed to add proxy:', e);
      return false;
    }
  }

  async addProxies(links: string[], groupId: number | null): Promise<number> {
    try {
      return await App.AddProxies(links, groupId);
    } catch (e) {
      console.error('Failed to add proxies:', e);
      return 0;
    }
  }

  async deleteProxy(id: number): Promise<boolean> {
    try {
      await App.DeleteProxy(id);
      return true;
    } catch (e) {
      console.error('Failed to delete proxy:', e);
      return false;
    }
  }

  async deleteProxies(ids: number[]): Promise<boolean> {
    try {
      await App.DeleteProxies(ids);
      return true;
    } catch (e) {
      console.error('Failed to delete proxies:', e);
      return false;
    }
  }

  async moveToGroup(proxyId: number, groupId: number): Promise<boolean> {
    try {
      await App.MoveToGroup(proxyId, groupId);
      return true;
    } catch (e) {
      console.error('Failed to move proxy:', e);
      return false;
    }
  }

  async moveProxiesToGroup(ids: number[], groupId: number): Promise<boolean> {
    try {
      await App.MoveProxiesToGroup(ids, groupId);
      return true;
    } catch (e) {
      console.error('Failed to move proxies:', e);
      return false;
    }
  }

  // Activation methods
  async activateProxy(id: number): Promise<boolean> {
    try {
      await App.ActivateProxy(id);
      return true;
    } catch (e) {
      console.error('Failed to activate proxy:', e);
      return false;
    }
  }

  async deactivateProxy(): Promise<boolean> {
    try {
      await App.DeactivateProxy();
      return true;
    } catch (e) {
      console.error('Failed to deactivate proxy:', e);
      return false;
    }
  }

  async getActiveProxy(): Promise<ActiveProxyInfo | null> {
    try {
      return await App.GetActiveProxy();
    } catch (e) {
      console.error('Failed to get active proxy:', e);
      return null;
    }
  }

  async setSystemProxy(): Promise<boolean> {
    try {
      await App.SetSystemProxy();
      return true;
    } catch (e) {
      console.error('Failed to set system proxy:', e);
      return false;
    }
  }

  async clearSystemProxy(): Promise<boolean> {
    try {
      await App.ClearSystemProxy();
      return true;
    } catch (e) {
      console.error('Failed to clear system proxy:', e);
      return false;
    }
  }

  async isSystemProxySet(): Promise<boolean> {
    try {
      return await App.IsSystemProxySet();
    } catch (e) {
      console.error('Failed to check system proxy:', e);
      return false;
    }
  }

  async getTunStatus(): Promise<TunStatus | null> {
    try {
      return await App.GetTunStatus();
    } catch (e) {
      console.error('Failed to get TUN status:', e);
      return null;
    }
  }

  async enableTun(linkId: number): Promise<boolean> {
    try {
      await App.EnableTun(linkId);
      return true;
    } catch (e) {
      console.error('Failed to enable TUN:', e);
      return false;
    }
  }

  async disableTun(): Promise<boolean> {
    try {
      await App.DisableTun();
      return true;
    } catch (e) {
      console.error('Failed to disable TUN:', e);
      return false;
    }
  }

  // Subscription methods
  async getSubscriptions(): Promise<Subscription[]> {
    try {
      const result = await App.GetSubscriptions();
      return result || [];
    } catch (e) {
      console.error('Failed to get subscriptions:', e);
      return [];
    }
  }

  async addSubscription(url: string, name: string): Promise<boolean> {
    try {
      await App.AddSubscription(url, name);
      return true;
    } catch (e) {
      console.error('Failed to add subscription:', e);
      return false;
    }
  }

  async deleteSubscription(id: number): Promise<boolean> {
    try {
      await App.DeleteSubscription(id);
      return true;
    } catch (e) {
      console.error('Failed to delete subscription:', e);
      return false;
    }
  }

  async updateSubscription(id: number): Promise<boolean> {
    try {
      await App.UpdateSubscription(id);
      return true;
    } catch (e) {
      console.error('Failed to update subscription:', e);
      return false;
    }
  }

  async toggleSubscription(id: number, enabled: boolean): Promise<boolean> {
    try {
      await App.ToggleSubscription(id, enabled);
      return true;
    } catch (e) {
      console.error('Failed to toggle subscription:', e);
      return false;
    }
  }

  // Settings methods
  async getSettings(): Promise<Settings | null> {
    try {
      return await App.GetSettings();
    } catch (e) {
      console.error('Failed to get settings:', e);
      return null;
    }
  }

  async updateSettings(settings: Settings): Promise<boolean> {
    try {
      await App.UpdateSettings(settings as any);
      return true;
    } catch (e) {
      console.error('Failed to update settings:', e);
      return false;
    }
  }

  async getListenAddress(): Promise<string> {
    try {
      return await App.GetListenAddress();
    } catch (e) {
      console.error('Failed to get listen address:', e);
      return '127.0.0.1:1080';
    }
  }

  async setListenAddress(addr: string): Promise<boolean> {
    try {
      await App.SetListenAddress(addr);
      return true;
    } catch (e) {
      console.error('Failed to set listen address:', e);
      return false;
    }
  }

  // Measurement methods
  async getProxyStats(id: number): Promise<ProxyStats | null> {
    try {
      return await App.GetProxyStats(id);
    } catch (e) {
      console.error('Failed to get proxy stats:', e);
      return null;
    }
  }

  async getPingHistory(id: number, limit: number = 50): Promise<PingPoint[]> {
    try {
      const result = await App.GetPingHistory(id, limit);
      return result || [];
    } catch (e) {
      console.error('Failed to get ping history:', e);
      return [];
    }
  }

  async getSpeedHistory(id: number, limit: number = 50): Promise<SpeedPoint[]> {
    try {
      const result = await App.GetSpeedHistory(id, limit);
      return result || [];
    } catch (e) {
      console.error('Failed to get speed history:', e);
      return [];
    }
  }

  async getHealthStats(id: number): Promise<HealthStats | null> {
    try {
      return await App.GetHealthStats(id);
    } catch (e) {
      console.error('Failed to get health stats:', e);
      return null;
    }
  }

  // Maintenance methods
  async getDeadProxyCount(): Promise<number> {
    try {
      return await App.GetDeadProxyCount();
    } catch (e) {
      console.error('Failed to get dead proxy count:', e);
      return 0;
    }
  }

  async deleteDeadProxies(): Promise<number> {
    try {
      return await App.DeleteDeadProxies();
    } catch (e) {
      console.error('Failed to delete dead proxies:', e);
      return 0;
    }
  }

  async getMeasurementCounts(): Promise<MeasurementCounts | null> {
    try {
      return await App.GetMeasurementCounts();
    } catch (e) {
      console.error('Failed to get measurement counts:', e);
      return null;
    }
  }

  // Clipboard methods
  async copyToClipboard(text: string): Promise<boolean> {
    try {
      await App.CopyToClipboard(text);
      return true;
    } catch (e) {
      console.error('Failed to copy to clipboard:', e);
      return false;
    }
  }

  async getClipboard(): Promise<string> {
    try {
      return await App.GetClipboard();
    } catch (e) {
      console.error('Failed to get clipboard:', e);
      return '';
    }
  }

  async parseClipboard(): Promise<ClipboardContent> {
    try {
      return await App.ParseClipboard();
    } catch (e) {
      console.error('Failed to parse clipboard:', e);
      return { links: [], subscriptionUrl: '' };
    }
  }
}

export const api = new API();
