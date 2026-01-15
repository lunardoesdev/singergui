package proxy

import (
	"context"
	"fmt"
	"net"
	"net/url"
	"strings"
	"sync"

	"github.com/lunardoesdev/singerbox"
)

// Manager handles proxy lifecycle.
type Manager struct {
	mu             sync.RWMutex
	activeProxy    *singerbox.ProxyBox
	activeLinkID   int64
	activeLink     string
	listenAddr     string
	configuredAddr string // Full address like "127.0.0.1:1080"
}

// NewManager creates a new proxy manager.
func NewManager(listenAddr string) *Manager {
	if listenAddr == "" {
		listenAddr = "127.0.0.1:1080"
	}
	return &Manager{
		configuredAddr: listenAddr,
	}
}

// SetListenAddr updates the configured listen address.
func (m *Manager) SetListenAddr(addr string) {
	m.mu.Lock()
	defer m.mu.Unlock()
	m.configuredAddr = addr
}

// GetConfiguredAddr returns the configured listen address.
func (m *Manager) GetConfiguredAddr() string {
	m.mu.RLock()
	defer m.mu.RUnlock()
	return m.configuredAddr
}

// GetFreePort finds an available port on the system.
func GetFreePort() (int, error) {
	listener, err := net.Listen("tcp", "127.0.0.1:0")
	if err != nil {
		return 0, err
	}
	defer listener.Close()
	return listener.Addr().(*net.TCPAddr).Port, nil
}

// Activate starts a proxy for the given link.
func (m *Manager) Activate(ctx context.Context, linkID int64, link string) error {
	m.mu.Lock()
	defer m.mu.Unlock()

	// Stop existing proxy if any
	if m.activeProxy != nil {
		if err := m.activeProxy.Stop(); err != nil {
			// Log but continue
		}
		m.activeProxy = nil
		m.activeLinkID = 0
		m.activeLink = ""
		m.listenAddr = ""
	}

	// Use the configured listen address
	listenAddr := m.configuredAddr
	if listenAddr == "" {
		listenAddr = "127.0.0.1:1080"
	}

	// Create proxy
	proxy, err := singerbox.FromSharedLink(link, singerbox.ProxyConfig{
		ListenAddr: listenAddr,
		LogLevel:   "warn",
	})
	if err != nil {
		return fmt.Errorf("failed to create proxy: %w", err)
	}

	m.activeProxy = proxy
	m.activeLinkID = linkID
	m.activeLink = link
	m.listenAddr = listenAddr

	return nil
}

// Deactivate stops the active proxy.
func (m *Manager) Deactivate() error {
	m.mu.Lock()
	defer m.mu.Unlock()

	if m.activeProxy == nil {
		return nil
	}

	err := m.activeProxy.Stop()
	m.activeProxy = nil
	m.activeLinkID = 0
	m.activeLink = ""
	m.listenAddr = ""

	return err
}

// IsActive returns whether a proxy is currently active.
func (m *Manager) IsActive() bool {
	m.mu.RLock()
	defer m.mu.RUnlock()
	return m.activeProxy != nil && m.activeProxy.IsRunning()
}

// ActiveLinkID returns the ID of the currently active link.
func (m *Manager) ActiveLinkID() int64 {
	m.mu.RLock()
	defer m.mu.RUnlock()
	return m.activeLinkID
}

// ListenAddr returns the listen address of the active proxy.
func (m *Manager) ListenAddr() string {
	m.mu.RLock()
	defer m.mu.RUnlock()
	return m.listenAddr
}

// TempProxy creates a temporary proxy for testing purposes.
// The caller is responsible for stopping the returned proxy.
type TempProxy struct {
	*singerbox.ProxyBox
	ListenAddr string
}

// CreateTempProxy creates a temporary proxy for measurements.
// It uses a random free port on the same host as the configured address.
func (m *Manager) CreateTempProxy(ctx context.Context, link string) (*TempProxy, error) {
	// Extract host from configured address for temp proxies
	host := "127.0.0.1"
	if m.configuredAddr != "" {
		if h, _, err := net.SplitHostPort(m.configuredAddr); err == nil {
			host = h
		}
	}

	port, err := GetFreePort()
	if err != nil {
		return nil, fmt.Errorf("failed to find free port: %w", err)
	}

	listenAddr := fmt.Sprintf("%s:%d", host, port)

	proxy, err := singerbox.FromSharedLink(link, singerbox.ProxyConfig{
		ListenAddr: listenAddr,
		LogLevel:   "panic", // Silent for measurements
	})
	if err != nil {
		return nil, fmt.Errorf("failed to create temp proxy: %w", err)
	}

	return &TempProxy{
		ProxyBox:   proxy,
		ListenAddr: listenAddr,
	}, nil
}

// ParseLinkInfo extracts protocol, server, and port from a share link.
func ParseLinkInfo(link string) (protocol, server string, port int, name string, err error) {
	// Validate link can be parsed by singerbox
	_, err = singerbox.Parse(link)
	if err != nil {
		return "", "", 0, "", err
	}

	// Parse the link URL-style to extract basic info
	return parseLinkURL(link)
}

// parseLinkURL parses a proxy link to extract protocol, server, port, and name.
func parseLinkURL(link string) (protocol, server string, port int, name string, err error) {
	// Get protocol from scheme
	colonIdx := strings.Index(link, "://")
	if colonIdx == -1 {
		return "", "", 0, "", fmt.Errorf("invalid link format")
	}
	protocol = strings.ToLower(link[:colonIdx])

	// Normalize protocol names
	switch protocol {
	case "ss":
		protocol = "shadowsocks"
	case "socks5":
		protocol = "socks"
	}

	// Extract name from fragment
	fragmentIdx := strings.LastIndex(link, "#")
	if fragmentIdx != -1 {
		name = link[fragmentIdx+1:]
		// URL decode the name
		if decoded, err := url.QueryUnescape(name); err == nil {
			name = decoded
		}
		link = link[:fragmentIdx]
	}

	// For vmess, the content after :// is base64 encoded JSON
	if protocol == "vmess" {
		// Just return what we have, vmess is complex
		return protocol, "", 0, name, nil
	}

	// Parse the rest as URL
	rest := link[colonIdx+3:]

	// Remove query parameters
	queryIdx := strings.Index(rest, "?")
	if queryIdx != -1 {
		rest = rest[:queryIdx]
	}

	// Find @ separator (user info separator)
	atIdx := strings.LastIndex(rest, "@")
	if atIdx != -1 {
		rest = rest[atIdx+1:]
	}

	// Parse host:port
	// Handle IPv6 addresses
	if strings.HasPrefix(rest, "[") {
		// IPv6
		closeBracket := strings.Index(rest, "]")
		if closeBracket != -1 {
			server = rest[1:closeBracket]
			if len(rest) > closeBracket+2 && rest[closeBracket+1] == ':' {
				portStr := rest[closeBracket+2:]
				fmt.Sscanf(portStr, "%d", &port)
			}
		}
	} else {
		// IPv4 or hostname
		colonIdx := strings.LastIndex(rest, ":")
		if colonIdx != -1 {
			server = rest[:colonIdx]
			fmt.Sscanf(rest[colonIdx+1:], "%d", &port)
		} else {
			server = rest
		}
	}

	return protocol, server, port, name, nil
}
