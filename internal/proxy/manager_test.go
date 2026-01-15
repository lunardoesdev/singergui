package proxy

import (
	"testing"
)

func TestGetFreePort(t *testing.T) {
	port, err := GetFreePort()
	if err != nil {
		t.Fatalf("GetFreePort() error = %v", err)
	}

	if port < 1024 || port > 65535 {
		t.Errorf("GetFreePort() returned invalid port %d", port)
	}

	// Get another port to ensure they're different
	port2, err := GetFreePort()
	if err != nil {
		t.Fatalf("GetFreePort() second call error = %v", err)
	}

	// They could be the same in theory, but unlikely
	t.Logf("Got ports: %d and %d", port, port2)
}

func TestParseLinkURL(t *testing.T) {
	tests := []struct {
		name         string
		link         string
		wantProtocol string
		wantServer   string
		wantPort     int
		wantName     string
		wantErr      bool
	}{
		{
			name:         "vless basic",
			link:         "vless://uuid@example.com:443#MyProxy",
			wantProtocol: "vless",
			wantServer:   "example.com",
			wantPort:     443,
			wantName:     "MyProxy",
		},
		{
			name:         "trojan with query params",
			link:         "trojan://password@server.net:443?sni=sni.example.com#TrojanProxy",
			wantProtocol: "trojan",
			wantServer:   "server.net",
			wantPort:     443,
			wantName:     "TrojanProxy",
		},
		{
			name:         "ss normalized",
			link:         "ss://method:password@1.2.3.4:8388#SSProxy",
			wantProtocol: "shadowsocks",
			wantServer:   "1.2.3.4",
			wantPort:     8388,
			wantName:     "SSProxy",
		},
		{
			name:         "socks5 normalized",
			link:         "socks5://user:pass@proxy.example.com:1080#SOCKS",
			wantProtocol: "socks",
			wantServer:   "proxy.example.com",
			wantPort:     1080,
			wantName:     "SOCKS",
		},
		{
			name:         "no name",
			link:         "vless://uuid@server:443",
			wantProtocol: "vless",
			wantServer:   "server",
			wantPort:     443,
			wantName:     "",
		},
		{
			name:         "vmess special",
			link:         "vmess://base64encodedcontent#VMess",
			wantProtocol: "vmess",
			wantServer:   "",
			wantPort:     0,
			wantName:     "VMess",
		},
		{
			name:    "invalid - no scheme",
			link:    "not-a-valid-link",
			wantErr: true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			protocol, server, port, name, err := parseLinkURL(tt.link)

			if tt.wantErr {
				if err == nil {
					t.Errorf("parseLinkURL() expected error, got nil")
				}
				return
			}

			if err != nil {
				t.Errorf("parseLinkURL() unexpected error = %v", err)
				return
			}

			if protocol != tt.wantProtocol {
				t.Errorf("protocol = %q, want %q", protocol, tt.wantProtocol)
			}
			if server != tt.wantServer {
				t.Errorf("server = %q, want %q", server, tt.wantServer)
			}
			if port != tt.wantPort {
				t.Errorf("port = %d, want %d", port, tt.wantPort)
			}
			if name != tt.wantName {
				t.Errorf("name = %q, want %q", name, tt.wantName)
			}
		})
	}
}

func TestNewManager(t *testing.T) {
	m := NewManager("127.0.0.1")
	if m == nil {
		t.Fatal("NewManager() returned nil")
	}

	if m.GetConfiguredAddr() != "127.0.0.1" {
		t.Errorf("configuredAddr = %q, want %q", m.GetConfiguredAddr(), "127.0.0.1")
	}

	if m.IsActive() {
		t.Error("New manager should not be active")
	}

	if m.ActiveLinkID() != 0 {
		t.Error("New manager should have 0 active link ID")
	}
}

func TestNewManagerDefaultAddr(t *testing.T) {
	m := NewManager("")
	if m.GetConfiguredAddr() != "127.0.0.1:1080" {
		t.Errorf("configuredAddr should default to 127.0.0.1:1080, got %q", m.GetConfiguredAddr())
	}
}
