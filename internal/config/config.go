package config

import (
	"context"
	"os"
	"path/filepath"
	"strconv"
	"sync"

	"github.com/lunardoesdev/singergui/internal/database/queries"
)

// Config holds application configuration loaded from database settings.
type Config struct {
	mu      sync.RWMutex
	queries *queries.Queries

	// Cached values
	measurementHistoryLimit int
	deadProxyThresholdDays  int
	requestsPerHour         int
	proxyListenAddr         string
	subscriptionSpeedLimit  int // KB/s
}

// New creates a new Config instance.
func New(q *queries.Queries) *Config {
	return &Config{
		queries: q,
		// Defaults
		measurementHistoryLimit: 5000,
		deadProxyThresholdDays:  14,
		requestsPerHour:         5,
		proxyListenAddr:         "127.0.0.1",
		subscriptionSpeedLimit:  1024,
	}
}

// Load loads configuration from the database.
func (c *Config) Load(ctx context.Context) error {
	c.mu.Lock()
	defer c.mu.Unlock()

	if val, err := c.queries.GetSetting(ctx, "measurement_history_limit"); err == nil {
		if v, err := strconv.Atoi(val); err == nil {
			c.measurementHistoryLimit = v
		}
	}

	if val, err := c.queries.GetSetting(ctx, "dead_proxy_threshold_days"); err == nil {
		if v, err := strconv.Atoi(val); err == nil {
			c.deadProxyThresholdDays = v
		}
	}

	if val, err := c.queries.GetSetting(ctx, "requests_per_hour"); err == nil {
		if v, err := strconv.Atoi(val); err == nil {
			c.requestsPerHour = v
		}
	}

	if val, err := c.queries.GetSetting(ctx, "proxy_listen_addr"); err == nil {
		c.proxyListenAddr = val
	}

	if val, err := c.queries.GetSetting(ctx, "subscription_speed_limit_kbps"); err == nil {
		if v, err := strconv.Atoi(val); err == nil {
			c.subscriptionSpeedLimit = v
		}
	}

	return nil
}

// MeasurementHistoryLimit returns the maximum number of measurements to keep.
func (c *Config) MeasurementHistoryLimit() int {
	c.mu.RLock()
	defer c.mu.RUnlock()
	return c.measurementHistoryLimit
}

// SetMeasurementHistoryLimit sets the measurement history limit.
func (c *Config) SetMeasurementHistoryLimit(ctx context.Context, limit int) error {
	if err := c.queries.SetSetting(ctx, queries.SetSettingParams{
		Key:   "measurement_history_limit",
		Value: strconv.Itoa(limit),
	}); err != nil {
		return err
	}
	c.mu.Lock()
	c.measurementHistoryLimit = limit
	c.mu.Unlock()
	return nil
}

// DeadProxyThresholdDays returns days after which proxy is considered dead.
func (c *Config) DeadProxyThresholdDays() int {
	c.mu.RLock()
	defer c.mu.RUnlock()
	return c.deadProxyThresholdDays
}

// SetDeadProxyThresholdDays sets the dead proxy threshold.
func (c *Config) SetDeadProxyThresholdDays(ctx context.Context, days int) error {
	if err := c.queries.SetSetting(ctx, queries.SetSettingParams{
		Key:   "dead_proxy_threshold_days",
		Value: strconv.Itoa(days),
	}); err != nil {
		return err
	}
	c.mu.Lock()
	c.deadProxyThresholdDays = days
	c.mu.Unlock()
	return nil
}

// RequestsPerHour returns the rate limit for requests per hour.
func (c *Config) RequestsPerHour() int {
	c.mu.RLock()
	defer c.mu.RUnlock()
	return c.requestsPerHour
}

// SetRequestsPerHour sets the requests per hour limit.
func (c *Config) SetRequestsPerHour(ctx context.Context, limit int) error {
	if err := c.queries.SetSetting(ctx, queries.SetSettingParams{
		Key:   "requests_per_hour",
		Value: strconv.Itoa(limit),
	}); err != nil {
		return err
	}
	c.mu.Lock()
	c.requestsPerHour = limit
	c.mu.Unlock()
	return nil
}

// ProxyListenAddr returns the proxy listen address.
func (c *Config) ProxyListenAddr() string {
	c.mu.RLock()
	defer c.mu.RUnlock()
	return c.proxyListenAddr
}

// SetProxyListenAddr sets the proxy listen address.
func (c *Config) SetProxyListenAddr(ctx context.Context, addr string) error {
	if err := c.queries.SetSetting(ctx, queries.SetSettingParams{
		Key:   "proxy_listen_addr",
		Value: addr,
	}); err != nil {
		return err
	}
	c.mu.Lock()
	c.proxyListenAddr = addr
	c.mu.Unlock()
	return nil
}

// SubscriptionSpeedLimitKBps returns the subscription download speed limit in KB/s.
func (c *Config) SubscriptionSpeedLimitKBps() int {
	c.mu.RLock()
	defer c.mu.RUnlock()
	return c.subscriptionSpeedLimit
}

// SetSubscriptionSpeedLimitKBps sets the subscription speed limit.
func (c *Config) SetSubscriptionSpeedLimitKBps(ctx context.Context, kbps int) error {
	if err := c.queries.SetSetting(ctx, queries.SetSettingParams{
		Key:   "subscription_speed_limit_kbps",
		Value: strconv.Itoa(kbps),
	}); err != nil {
		return err
	}
	c.mu.Lock()
	c.subscriptionSpeedLimit = kbps
	c.mu.Unlock()
	return nil
}

// GetDataDir returns the application data directory.
func GetDataDir() (string, error) {
	if dataDir := os.Getenv("SINGERGUI_DATA_DIR"); dataDir != "" {
		return dataDir, nil
	}

	// Use XDG_DATA_HOME on Linux, or appropriate paths on other platforms
	dataDir := os.Getenv("XDG_DATA_HOME")
	if dataDir == "" {
		home, err := os.UserHomeDir()
		if err != nil {
			return "", err
		}
		dataDir = filepath.Join(home, ".local", "share")
	}

	return filepath.Join(dataDir, "singergui"), nil
}

// GetDBPath returns the database file path.
func GetDBPath() (string, error) {
	dataDir, err := GetDataDir()
	if err != nil {
		return "", err
	}
	return filepath.Join(dataDir, "singergui.db"), nil
}
