package sysproxy

import "runtime"

// SystemProxy interface for setting system-wide proxy.
type SystemProxy interface {
	// Set configures the system proxy.
	Set(host string, port int) error
	// Clear removes the system proxy configuration.
	Clear() error
	// IsSet returns whether a system proxy is currently configured.
	IsSet() (bool, error)
}

// New returns the appropriate SystemProxy implementation for the current platform.
func New() SystemProxy {
	switch runtime.GOOS {
	case "windows":
		return &windowsProxy{}
	case "linux":
		return &linuxProxy{}
	case "darwin":
		return &darwinProxy{}
	default:
		return &noopProxy{}
	}
}

// noopProxy is a no-op implementation for unsupported platforms.
type noopProxy struct{}

func (p *noopProxy) Set(host string, port int) error {
	return nil
}

func (p *noopProxy) Clear() error {
	return nil
}

func (p *noopProxy) IsSet() (bool, error) {
	return false, nil
}
