package subscription

import (
	"testing"
)

func TestIsValidLink(t *testing.T) {
	tests := []struct {
		name  string
		link  string
		valid bool
	}{
		{"vless link", "vless://uuid@server:443?type=tcp#name", true},
		{"vmess link", "vmess://base64content", true},
		{"ss link", "ss://method:password@server:8388#name", true},
		{"trojan link", "trojan://password@server:443?sni=example.com#name", true},
		{"socks5 link", "socks5://user:pass@server:1080", true},
		// HTTP proxies with port are valid
		{"http proxy with port", "http://127.0.0.1:4444", true},
		{"http proxy with auth", "http://user:pass@server:8080", true},
		{"https proxy with port", "https://server:8443", true},
		{"http localhost proxy", "http://localhost:8080", true},
		// HTTP URLs with paths are subscription URLs, not proxy links
		{"subscription url with path", "https://example.com/sub.txt", false},
		{"subscription url with long path", "https://github.com/user/configs/raw/main/sub.txt", false},
		// HTTP URLs without port and without path on domains are ambiguous - treated as not proxy
		{"domain without port", "https://google.com", false},
		{"empty string", "", false},
		{"plain text", "hello world", false},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			result := IsValidLink(tt.link)
			if result != tt.valid {
				t.Errorf("IsValidLink(%q) = %v, want %v", tt.link, result, tt.valid)
			}
		})
	}
}

func TestIsSubscriptionURL(t *testing.T) {
	tests := []struct {
		name string
		url  string
		want bool
	}{
		{"http subscription", "http://example.com/sub.txt", true},
		{"https subscription", "https://github.com/user/configs/raw/main/sub.txt", true},
		{"vless link not subscription", "vless://uuid@server:443", false},
		{"vmess link not subscription", "vmess://base64", false},
		{"empty", "", false},
		{"plain text", "not a url", false},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			result := IsSubscriptionURL(tt.url)
			if result != tt.want {
				t.Errorf("IsSubscriptionURL(%q) = %v, want %v", tt.url, result, tt.want)
			}
		})
	}
}

func TestParseSubscriptionContent(t *testing.T) {
	tests := []struct {
		name     string
		content  string
		wantLen  int
	}{
		{
			name:    "plain text links",
			content: "vless://uuid@server:443#name1\nvmess://base64\nss://method:pass@server:8388",
			wantLen: 3,
		},
		{
			name:    "with empty lines and comments",
			content: "vless://uuid@server:443\n\n# comment\nvmess://base64\n",
			wantLen: 2,
		},
		{
			name:    "empty content",
			content: "",
			wantLen: 0,
		},
		{
			name:    "only comments",
			content: "# comment 1\n# comment 2",
			wantLen: 0,
		},
		{
			name:    "mixed valid and invalid",
			content: "vless://uuid@server:443\nhttps://google.com\nvmess://base64",
			wantLen: 2,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			links := ParseSubscriptionContent(tt.content)
			if len(links) != tt.wantLen {
				t.Errorf("ParseSubscriptionContent() returned %d links, want %d", len(links), tt.wantLen)
			}
		})
	}
}

func TestParseClipboardContent(t *testing.T) {
	tests := []struct {
		name      string
		content   string
		wantLinks int
		wantSub   bool
	}{
		{
			name:      "proxy links only",
			content:   "vless://uuid@server:443\nvmess://base64",
			wantLinks: 2,
			wantSub:   false,
		},
		{
			name:      "subscription url only",
			content:   "https://example.com/subscription.txt",
			wantLinks: 0,
			wantSub:   true,
		},
		{
			name:      "mixed",
			content:   "vless://uuid@server:443\nhttps://example.com/sub.txt\nvmess://base64",
			wantLinks: 2,
			wantSub:   true,
		},
		{
			name:      "empty",
			content:   "",
			wantLinks: 0,
			wantSub:   false,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			links, subURL := ParseClipboardContent(tt.content)
			if len(links) != tt.wantLinks {
				t.Errorf("ParseClipboardContent() links = %d, want %d", len(links), tt.wantLinks)
			}
			hasSub := subURL != ""
			if hasSub != tt.wantSub {
				t.Errorf("ParseClipboardContent() has sub = %v, want %v", hasSub, tt.wantSub)
			}
		})
	}
}
