package tun

import "github.com/sagernet/sing-box/option"

import "testing"

func TestBuildConfigDefaults(t *testing.T) {
	outbound := option.Outbound{
		Type:    "direct",
		Tag:     "proxy",
		Options: &option.DirectOutboundOptions{},
	}

	cfg, iface, err := BuildConfig(outbound, DefaultOptions())
	if err != nil {
		t.Fatalf("BuildConfig error: %v", err)
	}
	if iface == "" {
		t.Fatalf("expected interface name")
	}
	if len(cfg.Inbounds) != 1 {
		t.Fatalf("expected 1 inbound, got %d", len(cfg.Inbounds))
	}

	inboundOpts, ok := cfg.Inbounds[0].Options.(*option.TunInboundOptions)
	if !ok {
		t.Fatalf("expected tun inbound options")
	}
	if inboundOpts.InterfaceName == "" {
		t.Fatalf("expected tun interface name to be set")
	}
	if len(inboundOpts.Address) == 0 {
		t.Fatalf("expected tun address to be set")
	}
}
