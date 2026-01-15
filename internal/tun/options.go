package tun

import "net/netip"

// Options defines tun behavior for desktop platforms.
type Options struct {
	InterfaceName string
	MTU           uint32
	Address       []netip.Prefix
	AutoRoute     bool
	AutoRedirect  bool
	StrictRoute   bool
	Stack         string
}

func defaultAddress() []netip.Prefix {
	return []netip.Prefix{
		netip.MustParsePrefix("172.19.0.1/30"),
		netip.MustParsePrefix("fdfe:dcba:9876::1/126"),
	}
}

// DefaultOptions returns safe, cross-platform defaults.
func DefaultOptions() Options {
	return Options{
		InterfaceName: "singergui0",
		MTU:           1500,
		Address:       defaultAddress(),
		AutoRoute:     true,
		AutoRedirect:  false,
		StrictRoute:   true,
		Stack:         "system",
	}
}
