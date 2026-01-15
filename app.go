package main

import (
	"context"
	"database/sql"
	"fmt"
	"strconv"
	"time"

	"github.com/wailsapp/wails/v2/pkg/runtime"

	"github.com/lunardoesdev/singergui/internal/config"
	"github.com/lunardoesdev/singergui/internal/database"
	"github.com/lunardoesdev/singergui/internal/database/queries"
	"github.com/lunardoesdev/singergui/internal/proxy"
	"github.com/lunardoesdev/singergui/internal/proxy/sysproxy"
	"github.com/lunardoesdev/singergui/internal/subscription"
)

// App struct holds all application state
type App struct {
	ctx          context.Context
	db           *database.DB
	config       *config.Config
	proxyManager *proxy.Manager
	sysProxy     sysproxy.SystemProxy
	scheduler    *subscription.Scheduler
	measurement  *proxy.MeasurementService
}

// NewApp creates a new App application struct
func NewApp() *App {
	return &App{}
}

// startup is called when the app starts
func (a *App) startup(ctx context.Context) {
	a.ctx = ctx

	// Get database path
	dbPath, err := config.GetDBPath()
	if err != nil {
		runtime.LogError(ctx, "Failed to get DB path: "+err.Error())
		return
	}

	// Open database
	a.db, err = database.Open(dbPath)
	if err != nil {
		runtime.LogError(ctx, "Failed to open database: "+err.Error())
		return
	}

	// Run migrations
	if err := a.db.Migrate(ctx); err != nil {
		runtime.LogError(ctx, "Failed to run migrations: "+err.Error())
		return
	}

	// Create config
	a.config = config.New(a.db.Queries)
	if err := a.config.Load(ctx); err != nil {
		runtime.LogWarning(ctx, "Failed to load config: "+err.Error())
	}

	// Initialize services
	a.proxyManager = proxy.NewManager(a.config.ProxyListenAddr())
	a.sysProxy = sysproxy.New()
	a.scheduler = subscription.NewScheduler(a.db.Queries, a.config)
	a.measurement = proxy.NewMeasurementService(a.db.Queries, a.proxyManager, a.config)

	// Set up scheduler callback
	a.scheduler.OnLinksImported = func(count int) {
		runtime.EventsEmit(ctx, "subscription:complete", map[string]interface{}{
			"count": count,
		})
	}

	// Start background tasks
	a.scheduler.Start(ctx)
}

// shutdown is called when the app is closing
func (a *App) shutdown(ctx context.Context) {
	if a.scheduler != nil {
		a.scheduler.Stop()
	}
	if a.proxyManager != nil {
		a.proxyManager.Deactivate()
	}
	if a.sysProxy != nil {
		a.sysProxy.Clear()
	}
	if a.db != nil {
		a.db.Close()
	}
}

// ============= Group Methods =============

// Group represents a proxy group
type Group struct {
	ID         int64  `json:"id"`
	Name       string `json:"name"`
	ProxyCount int64  `json:"proxyCount"`
}

// GetGroups returns all groups with proxy counts
func (a *App) GetGroups() []Group {
	if a.db == nil {
		runtime.LogError(a.ctx, "Database not initialized")
		return []Group{}
	}
	groups, err := a.db.Queries.GetAllGroups(a.ctx)
	if err != nil {
		runtime.LogError(a.ctx, "Failed to get groups: "+err.Error())
		return []Group{}
	}

	result := make([]Group, len(groups))
	for i, g := range groups {
		count, _ := a.db.Queries.GetLinksCountForGroup(a.ctx, g.ID)
		result[i] = Group{
			ID:         g.ID,
			Name:       g.Name,
			ProxyCount: count,
		}
	}
	return result
}

// GetGroupsPaginated returns groups with pagination
func (a *App) GetGroupsPaginated(offset, limit int) []Group {
	if a.db == nil {
		runtime.LogError(a.ctx, "Database not initialized")
		return []Group{}
	}
	groups, err := a.db.Queries.GetGroupsPaginated(a.ctx, queries.GetGroupsPaginatedParams{
		Limit:  int64(limit),
		Offset: int64(offset),
	})
	if err != nil {
		runtime.LogError(a.ctx, "Failed to get groups: "+err.Error())
		return []Group{}
	}

	result := make([]Group, len(groups))
	for i, g := range groups {
		count, _ := a.db.Queries.GetLinksCountForGroup(a.ctx, g.ID)
		result[i] = Group{
			ID:         g.ID,
			Name:       g.Name,
			ProxyCount: count,
		}
	}
	return result
}

// GetGroupCount returns total number of groups
func (a *App) GetGroupCount() int64 {
	if a.db == nil {
		return 0
	}
	count, err := a.db.Queries.CountGroups(a.ctx)
	if err != nil {
		return 0
	}
	return count
}

// CreateGroup creates a new group
func (a *App) CreateGroup(name string) (*Group, error) {
	if a.db == nil {
		return nil, fmt.Errorf("database not initialized")
	}
	runtime.LogInfo(a.ctx, fmt.Sprintf("Creating group: %s", name))
	g, err := a.db.Queries.CreateGroup(a.ctx, name)
	if err != nil {
		runtime.LogError(a.ctx, "Failed to create group: "+err.Error())
		return nil, err
	}
	runtime.LogInfo(a.ctx, fmt.Sprintf("Created group: %d", g.ID))
	return &Group{ID: g.ID, Name: g.Name, ProxyCount: 0}, nil
}

// RenameGroup renames a group
func (a *App) RenameGroup(id int64, name string) error {
	return a.db.Queries.UpdateGroupName(a.ctx, queries.UpdateGroupNameParams{
		ID:   id,
		Name: name,
	})
}

// DeleteGroup deletes a group
func (a *App) DeleteGroup(id int64) error {
	return a.db.Queries.DeleteGroup(a.ctx, id)
}

// SearchGroupsResult holds group search results with count
type SearchGroupsResult struct {
	Groups     []Group `json:"groups"`
	TotalCount int64   `json:"totalCount"`
}

// SearchGroups searches groups by name using FTS5
func (a *App) SearchGroups(query string, offset, limit int) *SearchGroupsResult {
	if a.db == nil {
		return &SearchGroupsResult{Groups: []Group{}, TotalCount: 0}
	}

	// If no query, return all groups paginated
	if query == "" {
		return &SearchGroupsResult{
			Groups:     a.GetGroupsPaginated(offset, limit),
			TotalCount: a.GetGroupCount(),
		}
	}

	count, err := a.db.SearchGroupsFTSCount(a.ctx, query)
	if err != nil {
		runtime.LogError(a.ctx, "Failed to count group search results: "+err.Error())
		return &SearchGroupsResult{Groups: []Group{}, TotalCount: 0}
	}

	groups, err := a.db.SearchGroupsFTS(a.ctx, query, int64(limit), int64(offset))
	if err != nil {
		runtime.LogError(a.ctx, "Failed to search groups: "+err.Error())
		return &SearchGroupsResult{Groups: []Group{}, TotalCount: 0}
	}

	result := make([]Group, len(groups))
	for i, g := range groups {
		proxyCount, _ := a.db.Queries.GetLinksCountForGroup(a.ctx, g.ID)
		result[i] = Group{
			ID:         g.ID,
			Name:       g.Name,
			ProxyCount: proxyCount,
		}
	}

	return &SearchGroupsResult{
		Groups:     result,
		TotalCount: count,
	}
}

// ============= Proxy Methods =============

// ProxyInfo represents proxy information for the list
type ProxyInfo struct {
	ID          int64    `json:"id"`
	Name        string   `json:"name"`
	Protocol    string   `json:"protocol"`
	Server      string   `json:"server"`
	Port        int      `json:"port"`
	GroupID     *int64   `json:"groupId"`
	GroupName   *string  `json:"groupName"`
	Latency     *float64 `json:"latency"`
	Speed       *float64 `json:"speed"`
	SuccessRate *float64 `json:"successRate"`
	IsDead      bool     `json:"isDead"`
	IsActive    bool     `json:"isActive"`
}

// ProxyDetails represents detailed proxy information
type ProxyDetails struct {
	ProxyInfo
	Link               string  `json:"link"`
	CreatedAt          string  `json:"createdAt"`
	SubscriptionID     *int64  `json:"subscriptionId"`
	SubscriptionName   *string `json:"subscriptionName"`
	TotalRequests      int64   `json:"totalRequests"`
	SuccessfulRequests int64   `json:"successfulRequests"`
	FailedRequests     int64   `json:"failedRequests"`
	AvgLatency         float64 `json:"avgLatency"`
	AvgSpeed           float64 `json:"avgSpeed"`
	LastMeasured       *string `json:"lastMeasured"`
}

// GetProxies returns proxies for a group (0 = all groups)
func (a *App) GetProxies(groupID int64, offset, limit int) []ProxyInfo {
	var links []queries.SharedLink
	var err error

	if groupID == 0 {
		links, err = a.db.Queries.GetAllLinks(a.ctx, queries.GetAllLinksParams{
			Limit:  int64(limit),
			Offset: int64(offset),
		})
	} else {
		links, err = a.db.Queries.GetLinksForGroup(a.ctx, queries.GetLinksForGroupParams{
			GroupID: groupID,
			Limit:   int64(limit),
			Offset:  int64(offset),
		})
	}

	if err != nil {
		runtime.LogError(a.ctx, "Failed to get proxies: "+err.Error())
		return []ProxyInfo{}
	}

	activeID := int64(0)
	if a.proxyManager.IsActive() {
		activeID = a.proxyManager.ActiveLinkID()
	}

	result := make([]ProxyInfo, len(links))
	for i, link := range links {
		protocol, server, port, name, _ := proxy.ParseLinkInfo(link.Link)

		info := ProxyInfo{
			ID:       link.ID,
			Name:     name,
			Protocol: protocol,
			Server:   server,
			Port:     port,
			IsDead:   link.IsDead.Valid && link.IsDead.Int64 == 1,
			IsActive: link.ID == activeID,
		}

		// Get group info
		groups, _ := a.db.Queries.GetLinkGroups(a.ctx, link.ID)
		if len(groups) > 0 {
			gid := groups[0].ID
			info.GroupID = &gid
			info.GroupName = &groups[0].Name
		}

		// Get latest ping
		if ping, err := a.db.Queries.GetLatestPing(a.ctx, link.ID); err == nil && ping.LatencyMs.Valid {
			lat := float64(ping.LatencyMs.Int64)
			info.Latency = &lat
		}

		// Get latest speed
		if speed, err := a.db.Queries.GetLatestSpeed(a.ctx, link.ID); err == nil && speed.DownloadSpeedBps.Valid {
			spd := float64(speed.DownloadSpeedBps.Int64)
			info.Speed = &spd
		}

		// Get healthcheck stats for success rate
		stats, err := a.db.Queries.GetHealthcheckStats(a.ctx, queries.GetHealthcheckStatsParams{
			LinkID:  link.ID,
			Column2: sql.NullString{String: "7", Valid: true},
		})
		if err == nil && stats.Total > 0 {
			successful := int64(0)
			if stats.Successful.Valid {
				successful = int64(stats.Successful.Float64)
			}
			rate := float64(successful) / float64(stats.Total)
			info.SuccessRate = &rate
		}

		result[i] = info
	}

	return result
}

// GetProxyIDs returns proxy IDs for a range (for selection operations)
func (a *App) GetProxyIDs(groupID int64, offset, limit int) []int64 {
	var ids []int64
	var err error

	if groupID == 0 {
		ids, err = a.db.Queries.GetAllLinkIDs(a.ctx, queries.GetAllLinkIDsParams{
			Limit:  int64(limit),
			Offset: int64(offset),
		})
	} else {
		ids, err = a.db.Queries.GetLinkIDsForGroup(a.ctx, queries.GetLinkIDsForGroupParams{
			GroupID: groupID,
			Limit:   int64(limit),
			Offset:  int64(offset),
		})
	}

	if err != nil {
		runtime.LogError(a.ctx, "Failed to get proxy IDs: "+err.Error())
		return []int64{}
	}

	return ids
}

// GetProxyCount returns total proxy count for a group
func (a *App) GetProxyCount(groupID int64) int64 {
	var count int64
	var err error

	if groupID == 0 {
		count, err = a.db.Queries.GetAllLinksCount(a.ctx)
	} else {
		count, err = a.db.Queries.GetLinksCountForGroup(a.ctx, groupID)
	}

	if err != nil {
		return 0
	}
	return count
}

// SearchProxiesResult holds search results with count
type SearchProxiesResult struct {
	Proxies    []ProxyInfo `json:"proxies"`
	TotalCount int64       `json:"totalCount"`
}

// SearchProxies searches proxies by query string with optional group filter
// Uses FTS5 for fast full-text search (~30-100ms for tens of millions of records)
func (a *App) SearchProxies(groupID int64, query string, offset, limit int) *SearchProxiesResult {
	// If no query, return regular paginated results
	if query == "" {
		return &SearchProxiesResult{
			Proxies:    a.GetProxies(groupID, offset, limit),
			TotalCount: a.GetProxyCount(groupID),
		}
	}

	var count int64
	var links []queries.SharedLink
	var err error

	if groupID == 0 {
		count, err = a.db.SearchLinksFTSCount(a.ctx, query)
		if err != nil {
			runtime.LogError(a.ctx, "Failed to count search results: "+err.Error())
			return &SearchProxiesResult{Proxies: []ProxyInfo{}, TotalCount: 0}
		}
		links, err = a.db.SearchLinksFTS(a.ctx, query, int64(limit), int64(offset))
	} else {
		count, err = a.db.SearchLinksInGroupFTSCount(a.ctx, groupID, query)
		if err != nil {
			runtime.LogError(a.ctx, "Failed to count search results: "+err.Error())
			return &SearchProxiesResult{Proxies: []ProxyInfo{}, TotalCount: 0}
		}
		links, err = a.db.SearchLinksInGroupFTS(a.ctx, groupID, query, int64(limit), int64(offset))
	}

	if err != nil {
		runtime.LogError(a.ctx, "Failed to search proxies: "+err.Error())
		return &SearchProxiesResult{Proxies: []ProxyInfo{}, TotalCount: 0}
	}

	activeID := int64(0)
	if a.proxyManager.IsActive() {
		activeID = a.proxyManager.ActiveLinkID()
	}

	result := make([]ProxyInfo, len(links))
	for i, link := range links {
		protocol, server, port, name, _ := proxy.ParseLinkInfo(link.Link)

		info := ProxyInfo{
			ID:       link.ID,
			Name:     name,
			Protocol: protocol,
			Server:   server,
			Port:     port,
			IsDead:   link.IsDead.Valid && link.IsDead.Int64 == 1,
			IsActive: link.ID == activeID,
		}

		// Get group info
		groups, _ := a.db.Queries.GetLinkGroups(a.ctx, link.ID)
		if len(groups) > 0 {
			gid := groups[0].ID
			info.GroupID = &gid
			info.GroupName = &groups[0].Name
		}

		// Get latest ping
		if ping, err := a.db.Queries.GetLatestPing(a.ctx, link.ID); err == nil && ping.LatencyMs.Valid {
			lat := float64(ping.LatencyMs.Int64)
			info.Latency = &lat
		}

		// Get latest speed
		if speed, err := a.db.Queries.GetLatestSpeed(a.ctx, link.ID); err == nil && speed.DownloadSpeedBps.Valid {
			spd := float64(speed.DownloadSpeedBps.Int64)
			info.Speed = &spd
		}

		// Get healthcheck stats for success rate
		stats, err := a.db.Queries.GetHealthcheckStats(a.ctx, queries.GetHealthcheckStatsParams{
			LinkID:  link.ID,
			Column2: sql.NullString{String: "7", Valid: true},
		})
		if err == nil && stats.Total > 0 {
			successful := int64(0)
			if stats.Successful.Valid {
				successful = int64(stats.Successful.Float64)
			}
			rate := float64(successful) / float64(stats.Total)
			info.SuccessRate = &rate
		}

		result[i] = info
	}

	return &SearchProxiesResult{
		Proxies:    result,
		TotalCount: count,
	}
}

// GetProxyDetails returns detailed proxy information
func (a *App) GetProxyDetails(id int64) (*ProxyDetails, error) {
	link, err := a.db.Queries.GetLinkByID(a.ctx, id)
	if err != nil {
		return nil, err
	}

	protocol, server, port, name, _ := proxy.ParseLinkInfo(link.Link)

	activeID := int64(0)
	if a.proxyManager.IsActive() {
		activeID = a.proxyManager.ActiveLinkID()
	}

	details := &ProxyDetails{
		ProxyInfo: ProxyInfo{
			ID:       link.ID,
			Name:     name,
			Protocol: protocol,
			Server:   server,
			Port:     port,
			IsDead:   link.IsDead.Valid && link.IsDead.Int64 == 1,
			IsActive: link.ID == activeID,
		},
		Link: link.Link,
	}

	if link.CreatedAt.Valid {
		details.CreatedAt = link.CreatedAt.Time.Format(time.RFC3339)
	}

	// Get group info
	groups, _ := a.db.Queries.GetLinkGroups(a.ctx, link.ID)
	if len(groups) > 0 {
		gid := groups[0].ID
		details.GroupID = &gid
		details.GroupName = &groups[0].Name
	}

	// Get healthcheck stats
	stats, err := a.db.Queries.GetHealthcheckStats(a.ctx, queries.GetHealthcheckStatsParams{
		LinkID:  id,
		Column2: sql.NullString{String: "7", Valid: true},
	})
	if err == nil {
		details.TotalRequests = stats.Total
		if stats.Successful.Valid {
			details.SuccessfulRequests = int64(stats.Successful.Float64)
		}
		if stats.Failed.Valid {
			details.FailedRequests = int64(stats.Failed.Float64)
		}
		if stats.Total > 0 {
			rate := float64(details.SuccessfulRequests) / float64(stats.Total)
			details.SuccessRate = &rate
		}
	}

	// Get ping stats
	pingStats, err := a.db.Queries.GetPingStats(a.ctx, queries.GetPingStatsParams{
		LinkID:  id,
		Column2: sql.NullString{String: "7", Valid: true},
	})
	if err == nil && pingStats.AvgLatency.Valid {
		details.AvgLatency = pingStats.AvgLatency.Float64
	}

	// Get speed stats
	speedStats, err := a.db.Queries.GetSpeedStats(a.ctx, queries.GetSpeedStatsParams{
		LinkID:  id,
		Column2: sql.NullString{String: "7", Valid: true},
	})
	if err == nil && speedStats.AvgDownload.Valid {
		details.AvgSpeed = speedStats.AvgDownload.Float64
	}

	// Get latest ping for latency
	if ping, err := a.db.Queries.GetLatestPing(a.ctx, id); err == nil {
		if ping.MeasuredAt.Valid {
			t := ping.MeasuredAt.Time.Format(time.RFC3339)
			details.LastMeasured = &t
		}
		if ping.LatencyMs.Valid {
			lat := float64(ping.LatencyMs.Int64)
			details.Latency = &lat
		}
	}

	// Get latest speed
	if speed, err := a.db.Queries.GetLatestSpeed(a.ctx, id); err == nil && speed.DownloadSpeedBps.Valid {
		spd := float64(speed.DownloadSpeedBps.Int64)
		details.Speed = &spd
	}

	return details, nil
}

// AddProxy adds a single proxy
func (a *App) AddProxy(link string, groupID *int64) error {
	_, err := a.scheduler.ImportLinks(a.ctx, []string{link}, groupID)
	return err
}

// AddProxies adds multiple proxies
func (a *App) AddProxies(links []string, groupID *int64) (int, error) {
	return a.scheduler.ImportLinks(a.ctx, links, groupID)
}

// DeleteProxy deletes a single proxy
func (a *App) DeleteProxy(id int64) error {
	return a.db.Queries.DeleteLink(a.ctx, id)
}

// DeleteProxies deletes multiple proxies
func (a *App) DeleteProxies(ids []int64) error {
	return a.db.Queries.DeleteLinks(a.ctx, ids)
}

// MoveToGroup moves a proxy to a group
func (a *App) MoveToGroup(proxyID, groupID int64) error {
	// First remove from all groups
	groups, _ := a.db.Queries.GetLinkGroups(a.ctx, proxyID)
	for _, g := range groups {
		a.db.Queries.RemoveLinkFromGroup(a.ctx, queries.RemoveLinkFromGroupParams{
			LinkID:  proxyID,
			GroupID: g.ID,
		})
	}

	// Then add to new group if specified
	if groupID > 0 {
		maxPos, _ := a.db.Queries.GetMaxPositionInGroup(a.ctx, groupID)
		return a.db.Queries.AddLinkToGroup(a.ctx, queries.AddLinkToGroupParams{
			LinkID:   proxyID,
			GroupID:  groupID,
			Position: sql.NullInt64{Int64: maxPos + 1, Valid: true},
		})
	}
	return nil
}

// MoveProxiesToGroup moves multiple proxies to a group
func (a *App) MoveProxiesToGroup(ids []int64, groupID int64) error {
	for _, id := range ids {
		if err := a.MoveToGroup(id, groupID); err != nil {
			return err
		}
	}
	return nil
}

// ============= Proxy Activation Methods =============

// ActiveProxyInfo represents active proxy information
type ActiveProxyInfo struct {
	ID            int64  `json:"id"`
	Name          string `json:"name"`
	ListenAddress string `json:"listenAddress"`
}

// ActivateProxy activates a proxy
func (a *App) ActivateProxy(id int64) error {
	link, err := a.db.Queries.GetLinkByID(a.ctx, id)
	if err != nil {
		return err
	}

	if err := a.proxyManager.Activate(a.ctx, id, link.Link); err != nil {
		return err
	}

	_, _, _, name, _ := proxy.ParseLinkInfo(link.Link)

	runtime.EventsEmit(a.ctx, "proxy:activated", map[string]interface{}{
		"id":      id,
		"address": a.proxyManager.ListenAddr(),
	})

	runtime.EventsEmit(a.ctx, "status:message", map[string]interface{}{
		"text": fmt.Sprintf("Proxy '%s' active on %s", name, a.proxyManager.ListenAddr()),
	})

	return nil
}

// DeactivateProxy deactivates the current proxy
func (a *App) DeactivateProxy() error {
	a.proxyManager.Deactivate()
	runtime.EventsEmit(a.ctx, "proxy:deactivated", nil)
	runtime.EventsEmit(a.ctx, "status:message", map[string]interface{}{
		"text": "Proxy deactivated",
	})
	return nil
}

// GetActiveProxy returns the currently active proxy
func (a *App) GetActiveProxy() *ActiveProxyInfo {
	if !a.proxyManager.IsActive() {
		return nil
	}

	id := a.proxyManager.ActiveLinkID()
	link, err := a.db.Queries.GetLinkByID(a.ctx, id)
	if err != nil {
		return nil
	}

	_, _, _, name, _ := proxy.ParseLinkInfo(link.Link)

	return &ActiveProxyInfo{
		ID:            id,
		Name:          name,
		ListenAddress: a.proxyManager.ListenAddr(),
	}
}

// SetSystemProxy sets the OS system proxy
func (a *App) SetSystemProxy() error {
	if !a.proxyManager.IsActive() {
		return fmt.Errorf("no active proxy")
	}

	addr := a.proxyManager.ListenAddr()
	host, portStr := splitHostPort(addr)
	port, _ := strconv.Atoi(portStr)

	if err := a.sysProxy.Set(host, port); err != nil {
		return err
	}

	runtime.EventsEmit(a.ctx, "sysproxy:changed", map[string]interface{}{
		"enabled": true,
	})
	runtime.EventsEmit(a.ctx, "status:message", map[string]interface{}{
		"text": fmt.Sprintf("System proxy set to %s", addr),
	})

	return nil
}

// ClearSystemProxy clears the OS system proxy
func (a *App) ClearSystemProxy() error {
	if err := a.sysProxy.Clear(); err != nil {
		return err
	}

	runtime.EventsEmit(a.ctx, "sysproxy:changed", map[string]interface{}{
		"enabled": false,
	})
	runtime.EventsEmit(a.ctx, "status:message", map[string]interface{}{
		"text": "System proxy cleared",
	})

	return nil
}

// IsSystemProxySet checks if system proxy is enabled
func (a *App) IsSystemProxySet() bool {
	isSet, _ := a.sysProxy.IsSet()
	return isSet
}

// ============= Subscription Methods =============

// Subscription represents a subscription
type Subscription struct {
	ID         int64   `json:"id"`
	URL        string  `json:"url"`
	Name       *string `json:"name"`
	Enabled    bool    `json:"enabled"`
	LastUpdate *string `json:"lastUpdate"`
	ProxyCount int64   `json:"proxyCount"`
}

// GetSubscriptions returns all subscriptions
func (a *App) GetSubscriptions() []Subscription {
	subs, err := a.db.Queries.GetAllSubscriptions(a.ctx)
	if err != nil {
		return []Subscription{}
	}

	result := make([]Subscription, len(subs))
	for i, s := range subs {
		sub := Subscription{
			ID:      s.ID,
			URL:     s.Url,
			Enabled: s.Enabled.Valid && s.Enabled.Int64 == 1,
		}
		if s.Name.Valid {
			sub.Name = &s.Name.String
		}
		if s.LastUpdatedAt.Valid {
			t := s.LastUpdatedAt.Time.Format(time.RFC3339)
			sub.LastUpdate = &t
		}
		// Subscription proxy count would require a custom query - leaving as 0 for now
		sub.ProxyCount = 0
		result[i] = sub
	}

	return result
}

// AddSubscription adds a new subscription
func (a *App) AddSubscription(url, name string) error {
	var nameVal sql.NullString
	if name != "" {
		nameVal = sql.NullString{String: name, Valid: true}
	}

	sub, err := a.db.Queries.CreateSubscription(a.ctx, queries.CreateSubscriptionParams{
		Url:     url,
		Name:    nameVal,
		Enabled: sql.NullInt64{Int64: 1, Valid: true},
	})
	if err != nil {
		return err
	}

	// Trigger immediate update
	a.scheduler.TriggerUpdate(sub.ID)
	return nil
}

// DeleteSubscription deletes a subscription
func (a *App) DeleteSubscription(id int64) error {
	return a.db.Queries.DeleteSubscription(a.ctx, id)
}

// UpdateSubscription triggers an immediate update
func (a *App) UpdateSubscription(id int64) error {
	a.scheduler.TriggerUpdate(id)
	return nil
}

// ToggleSubscription enables or disables a subscription
func (a *App) ToggleSubscription(id int64, enabled bool) error {
	sub, err := a.db.Queries.GetSubscriptionByID(a.ctx, id)
	if err != nil {
		return err
	}

	var val int64
	if enabled {
		val = 1
	}
	return a.db.Queries.UpdateSubscription(a.ctx, queries.UpdateSubscriptionParams{
		ID:      id,
		Name:    sub.Name,
		Enabled: sql.NullInt64{Int64: val, Valid: true},
	})
}

// ============= Settings Methods =============

// Settings represents application settings
type Settings struct {
	ProxyListenAddr         string `json:"proxyListenAddr"`
	MeasurementHistoryLimit int64  `json:"measurementHistoryLimit"`
	DeadProxyThresholdDays  int64  `json:"deadProxyThresholdDays"`
	RequestsPerHour         int64  `json:"requestsPerHour"`
	SubscriptionSpeedLimit  int64  `json:"subscriptionSpeedLimit"`
}

// GetSettings returns all settings
func (a *App) GetSettings() *Settings {
	return &Settings{
		ProxyListenAddr:         a.config.ProxyListenAddr(),
		MeasurementHistoryLimit: int64(a.config.MeasurementHistoryLimit()),
		DeadProxyThresholdDays:  int64(a.config.DeadProxyThresholdDays()),
		RequestsPerHour:         int64(a.config.RequestsPerHour()),
		SubscriptionSpeedLimit:  int64(a.config.SubscriptionSpeedLimitKBps()),
	}
}

// UpdateSettings updates all settings
func (a *App) UpdateSettings(settings Settings) error {
	ctx := a.ctx
	a.config.SetProxyListenAddr(ctx, settings.ProxyListenAddr)
	a.config.SetMeasurementHistoryLimit(ctx, int(settings.MeasurementHistoryLimit))
	a.config.SetDeadProxyThresholdDays(ctx, int(settings.DeadProxyThresholdDays))
	a.config.SetRequestsPerHour(ctx, int(settings.RequestsPerHour))
	a.config.SetSubscriptionSpeedLimitKBps(ctx, int(settings.SubscriptionSpeedLimit))
	return nil
}

// GetListenAddress returns the proxy listen address
func (a *App) GetListenAddress() string {
	return a.config.ProxyListenAddr()
}

// SetListenAddress sets the proxy listen address
func (a *App) SetListenAddress(addr string) error {
	a.config.SetProxyListenAddr(a.ctx, addr)
	// Also update the proxy manager's configured address
	if a.proxyManager != nil {
		a.proxyManager.SetListenAddr(addr)
	}
	return nil
}

// ============= Measurement Methods =============

// ProxyStats represents proxy statistics
type ProxyStats struct {
	TotalRequests      int64   `json:"totalRequests"`
	SuccessfulRequests int64   `json:"successfulRequests"`
	FailedRequests     int64   `json:"failedRequests"`
	AvgLatency         float64 `json:"avgLatency"`
	AvgSpeed           float64 `json:"avgSpeed"`
}

// PingPoint represents a latency data point
type PingPoint struct {
	Timestamp string `json:"timestamp"`
	Latency   int64  `json:"latency"`
}

// SpeedPoint represents a speed data point
type SpeedPoint struct {
	Timestamp string `json:"timestamp"`
	Speed     int64  `json:"speed"`
}

// HealthStats represents health statistics
type HealthStats struct {
	SuccessCount int64   `json:"successCount"`
	FailCount    int64   `json:"failCount"`
	SuccessRate  float64 `json:"successRate"`
}

// GetProxyStats returns stats for a proxy
func (a *App) GetProxyStats(id int64) *ProxyStats {
	stats, err := a.db.Queries.GetHealthcheckStats(a.ctx, queries.GetHealthcheckStatsParams{
		LinkID:  id,
		Column2: sql.NullString{String: "7", Valid: true},
	})
	if err != nil {
		return nil
	}

	result := &ProxyStats{
		TotalRequests: stats.Total,
	}
	if stats.Successful.Valid {
		result.SuccessfulRequests = int64(stats.Successful.Float64)
	}
	if stats.Failed.Valid {
		result.FailedRequests = int64(stats.Failed.Float64)
	}

	// Get ping stats
	pingStats, err := a.db.Queries.GetPingStats(a.ctx, queries.GetPingStatsParams{
		LinkID:  id,
		Column2: sql.NullString{String: "7", Valid: true},
	})
	if err == nil && pingStats.AvgLatency.Valid {
		result.AvgLatency = pingStats.AvgLatency.Float64
	}

	// Get speed stats
	speedStats, err := a.db.Queries.GetSpeedStats(a.ctx, queries.GetSpeedStatsParams{
		LinkID:  id,
		Column2: sql.NullString{String: "7", Valid: true},
	})
	if err == nil && speedStats.AvgDownload.Valid {
		result.AvgSpeed = speedStats.AvgDownload.Float64
	}

	return result
}

// GetPingHistory returns latency history for a proxy
func (a *App) GetPingHistory(id int64, limit int) []PingPoint {
	measurements, err := a.db.Queries.GetPingHistory(a.ctx, queries.GetPingHistoryParams{
		LinkID: id,
		Limit:  int64(limit),
	})
	if err != nil {
		return []PingPoint{}
	}

	result := make([]PingPoint, 0, len(measurements))
	for _, m := range measurements {
		if m.LatencyMs.Valid && m.MeasuredAt.Valid {
			result = append(result, PingPoint{
				Timestamp: m.MeasuredAt.Time.Format(time.RFC3339),
				Latency:   m.LatencyMs.Int64,
			})
		}
	}
	return result
}

// GetSpeedHistory returns speed history for a proxy
func (a *App) GetSpeedHistory(id int64, limit int) []SpeedPoint {
	measurements, err := a.db.Queries.GetSpeedHistory(a.ctx, queries.GetSpeedHistoryParams{
		LinkID: id,
		Limit:  int64(limit),
	})
	if err != nil {
		return []SpeedPoint{}
	}

	result := make([]SpeedPoint, 0, len(measurements))
	for _, m := range measurements {
		if m.DownloadSpeedBps.Valid && m.MeasuredAt.Valid {
			result = append(result, SpeedPoint{
				Timestamp: m.MeasuredAt.Time.Format(time.RFC3339),
				Speed:     m.DownloadSpeedBps.Int64,
			})
		}
	}
	return result
}

// GetHealthStats returns health stats for a proxy
func (a *App) GetHealthStats(id int64) *HealthStats {
	stats, err := a.db.Queries.GetHealthcheckStats(a.ctx, queries.GetHealthcheckStatsParams{
		LinkID:  id,
		Column2: sql.NullString{String: "7", Valid: true},
	})
	if err != nil {
		return nil
	}

	result := &HealthStats{}
	if stats.Successful.Valid {
		result.SuccessCount = int64(stats.Successful.Float64)
	}
	if stats.Failed.Valid {
		result.FailCount = int64(stats.Failed.Float64)
	}
	if stats.Total > 0 {
		result.SuccessRate = float64(result.SuccessCount) / float64(stats.Total)
	}

	return result
}

// ============= Maintenance Methods =============

// MeasurementCounts represents measurement count statistics
type MeasurementCounts struct {
	Total   int64 `json:"total"`
	Last24h int64 `json:"last24h"`
	Last7d  int64 `json:"last7d"`
}

// GetDeadProxyCount returns the count of dead proxies
func (a *App) GetDeadProxyCount() int64 {
	count, _ := a.db.Queries.CountDeadLinks(a.ctx)
	return count
}

// DeleteDeadProxies deletes all dead proxies
func (a *App) DeleteDeadProxies() (int64, error) {
	count, err := a.db.Queries.DeleteDeadLinks(a.ctx)
	if err != nil {
		return 0, err
	}

	runtime.EventsEmit(a.ctx, "status:message", map[string]interface{}{
		"text": fmt.Sprintf("Deleted %d dead proxies", count),
	})

	return count, nil
}

// GetMeasurementCounts returns measurement count statistics
func (a *App) GetMeasurementCounts() *MeasurementCounts {
	pingCount, _ := a.db.Queries.CountPingMeasurements(a.ctx)
	speedCount, _ := a.db.Queries.CountSpeedMeasurements(a.ctx)
	healthCount, _ := a.db.Queries.CountHealthchecks(a.ctx)

	return &MeasurementCounts{
		Total:   pingCount + speedCount + healthCount,
		Last24h: 0, // Would need custom query
		Last7d:  0, // Would need custom query
	}
}

// ============= Clipboard Methods =============

// ClipboardContent represents parsed clipboard content
type ClipboardContent struct {
	Links           []string `json:"links"`
	SubscriptionURL string   `json:"subscriptionUrl"`
}

// CopyToClipboard copies text to clipboard
func (a *App) CopyToClipboard(text string) error {
	runtime.ClipboardSetText(a.ctx, text)
	return nil
}

// GetClipboard gets clipboard content
func (a *App) GetClipboard() string {
	text, _ := runtime.ClipboardGetText(a.ctx)
	return text
}

// ParseClipboard parses clipboard content
func (a *App) ParseClipboard() *ClipboardContent {
	text, err := runtime.ClipboardGetText(a.ctx)
	if err != nil {
		return &ClipboardContent{}
	}

	links, subURL := subscription.ParseClipboardContent(text)
	return &ClipboardContent{
		Links:           links,
		SubscriptionURL: subURL,
	}
}

// Helper function
func splitHostPort(addr string) (string, string) {
	for i := len(addr) - 1; i >= 0; i-- {
		if addr[i] == ':' {
			return addr[:i], addr[i+1:]
		}
	}
	return addr, ""
}
