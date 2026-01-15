export namespace main {
	
	export class ActiveProxyInfo {
	    id: number;
	    name: string;
	    listenAddress: string;
	
	    static createFrom(source: any = {}) {
	        return new ActiveProxyInfo(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.name = source["name"];
	        this.listenAddress = source["listenAddress"];
	    }
	}
	export class ClipboardContent {
	    links: string[];
	    subscriptionUrl: string;
	
	    static createFrom(source: any = {}) {
	        return new ClipboardContent(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.links = source["links"];
	        this.subscriptionUrl = source["subscriptionUrl"];
	    }
	}
	export class Group {
	    id: number;
	    name: string;
	    proxyCount: number;
	
	    static createFrom(source: any = {}) {
	        return new Group(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.name = source["name"];
	        this.proxyCount = source["proxyCount"];
	    }
	}
	export class HealthStats {
	    successCount: number;
	    failCount: number;
	    successRate: number;
	
	    static createFrom(source: any = {}) {
	        return new HealthStats(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.successCount = source["successCount"];
	        this.failCount = source["failCount"];
	        this.successRate = source["successRate"];
	    }
	}
	export class MeasurementCounts {
	    total: number;
	    last24h: number;
	    last7d: number;
	
	    static createFrom(source: any = {}) {
	        return new MeasurementCounts(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.total = source["total"];
	        this.last24h = source["last24h"];
	        this.last7d = source["last7d"];
	    }
	}
	export class PingPoint {
	    timestamp: string;
	    latency: number;
	
	    static createFrom(source: any = {}) {
	        return new PingPoint(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.timestamp = source["timestamp"];
	        this.latency = source["latency"];
	    }
	}
	export class ProxyDetails {
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
	
	    static createFrom(source: any = {}) {
	        return new ProxyDetails(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.name = source["name"];
	        this.protocol = source["protocol"];
	        this.server = source["server"];
	        this.port = source["port"];
	        this.groupId = source["groupId"];
	        this.groupName = source["groupName"];
	        this.latency = source["latency"];
	        this.speed = source["speed"];
	        this.successRate = source["successRate"];
	        this.isDead = source["isDead"];
	        this.isActive = source["isActive"];
	        this.link = source["link"];
	        this.createdAt = source["createdAt"];
	        this.subscriptionId = source["subscriptionId"];
	        this.subscriptionName = source["subscriptionName"];
	        this.totalRequests = source["totalRequests"];
	        this.successfulRequests = source["successfulRequests"];
	        this.failedRequests = source["failedRequests"];
	        this.avgLatency = source["avgLatency"];
	        this.avgSpeed = source["avgSpeed"];
	        this.lastMeasured = source["lastMeasured"];
	    }
	}
	export class ProxyInfo {
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
	
	    static createFrom(source: any = {}) {
	        return new ProxyInfo(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.name = source["name"];
	        this.protocol = source["protocol"];
	        this.server = source["server"];
	        this.port = source["port"];
	        this.groupId = source["groupId"];
	        this.groupName = source["groupName"];
	        this.latency = source["latency"];
	        this.speed = source["speed"];
	        this.successRate = source["successRate"];
	        this.isDead = source["isDead"];
	        this.isActive = source["isActive"];
	    }
	}
	export class ProxyStats {
	    totalRequests: number;
	    successfulRequests: number;
	    failedRequests: number;
	    avgLatency: number;
	    avgSpeed: number;
	
	    static createFrom(source: any = {}) {
	        return new ProxyStats(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.totalRequests = source["totalRequests"];
	        this.successfulRequests = source["successfulRequests"];
	        this.failedRequests = source["failedRequests"];
	        this.avgLatency = source["avgLatency"];
	        this.avgSpeed = source["avgSpeed"];
	    }
	}
	export class SearchGroupsResult {
	    groups: Group[];
	    totalCount: number;
	
	    static createFrom(source: any = {}) {
	        return new SearchGroupsResult(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.groups = this.convertValues(source["groups"], Group);
	        this.totalCount = source["totalCount"];
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	export class SearchProxiesResult {
	    proxies: ProxyInfo[];
	    totalCount: number;
	
	    static createFrom(source: any = {}) {
	        return new SearchProxiesResult(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.proxies = this.convertValues(source["proxies"], ProxyInfo);
	        this.totalCount = source["totalCount"];
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	export class Settings {
	    proxyListenAddr: string;
	    measurementHistoryLimit: number;
	    deadProxyThresholdDays: number;
	    requestsPerHour: number;
	    subscriptionSpeedLimit: number;
	
	    static createFrom(source: any = {}) {
	        return new Settings(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.proxyListenAddr = source["proxyListenAddr"];
	        this.measurementHistoryLimit = source["measurementHistoryLimit"];
	        this.deadProxyThresholdDays = source["deadProxyThresholdDays"];
	        this.requestsPerHour = source["requestsPerHour"];
	        this.subscriptionSpeedLimit = source["subscriptionSpeedLimit"];
	    }
	}
	export class SpeedPoint {
	    timestamp: string;
	    speed: number;
	
	    static createFrom(source: any = {}) {
	        return new SpeedPoint(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.timestamp = source["timestamp"];
	        this.speed = source["speed"];
	    }
	}
	export class Subscription {
	    id: number;
	    url: string;
	    name?: string;
	    enabled: boolean;
	    lastUpdate?: string;
	    proxyCount: number;
	
	    static createFrom(source: any = {}) {
	        return new Subscription(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.url = source["url"];
	        this.name = source["name"];
	        this.enabled = source["enabled"];
	        this.lastUpdate = source["lastUpdate"];
	        this.proxyCount = source["proxyCount"];
	    }
	}
	export class TunStatus {
	    active: boolean;
	    interfaceName: string;
	    linkId: number;
	
	    static createFrom(source: any = {}) {
	        return new TunStatus(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.active = source["active"];
	        this.interfaceName = source["interfaceName"];
	        this.linkId = source["linkId"];
	    }
	}

}

