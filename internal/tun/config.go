package tun

import "github.com/sagernet/sing-box/option"

// BuildConfig creates a sing-box config with a TUN inbound.
// Returns the config and the interface name.
func BuildConfig(outbound option.Outbound, opts Options) (option.Options, string, error) {
	return createTunConfig(outbound, opts)
}
