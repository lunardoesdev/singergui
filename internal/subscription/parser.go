package subscription

import (
	"encoding/base64"
	"net/url"
	"strings"

	"github.com/lunardoesdev/singergui/internal/proxy"
)

// ProxyProtocols lists the primary proxy protocols we support.
var ProxyProtocols = []string{
	"vless://",
	"vmess://",
	"ss://",
	"trojan://",
	"socks://",
	"socks5://",
	"http://",
	"https://",
}

// ParsedLink holds parsed link information.
type ParsedLink struct {
	Link     string
	Name     string
	Protocol string
	Server   string
	Port     int
}

// IsValidLink checks if a string is a valid proxy link.
// For http:// and https://, it distinguishes proxy links from subscription URLs
// by checking if there's a path (subscription URLs have paths like /sub.txt).
func IsValidLink(link string) bool {
	link = strings.TrimSpace(link)
	if link == "" {
		return false
	}

	lowered := strings.ToLower(link)

	// Check non-HTTP protocols first
	for _, prefix := range ProxyProtocols[:6] { // vless, vmess, ss, trojan, socks, socks5
		if strings.HasPrefix(lowered, prefix) {
			return true
		}
	}

	// For HTTP/HTTPS, check if it looks like a proxy (no path) vs subscription URL (has path)
	if strings.HasPrefix(lowered, "http://") || strings.HasPrefix(lowered, "https://") {
		return isHTTPProxy(link)
	}

	return false
}

// isHTTPProxy checks if an HTTP/HTTPS URL is a proxy link rather than a subscription URL.
// Proxy links: http://host:port, http://user:pass@host:port
// Subscription URLs: http://example.com/path/to/sub.txt
func isHTTPProxy(link string) bool {
	u, err := url.Parse(link)
	if err != nil {
		return false
	}

	// Proxy links typically have no path or just "/"
	// and usually have an explicit port
	path := u.Path
	if path != "" && path != "/" {
		return false // Has a path, likely a subscription URL
	}

	// Check if port is specified (common for proxy)
	if u.Port() != "" {
		return true
	}

	// No port and no path - ambiguous, but lean towards proxy
	// if it looks like an IP address
	host := u.Hostname()
	if isIPAddress(host) {
		return true
	}

	// Domain without port and without path - likely not a proxy
	return false
}

// isIPAddress checks if a string looks like an IP address.
func isIPAddress(host string) bool {
	// Simple check for IPv4
	parts := strings.Split(host, ".")
	if len(parts) == 4 {
		for _, p := range parts {
			if len(p) == 0 || len(p) > 3 {
				return false
			}
			for _, c := range p {
				if c < '0' || c > '9' {
					return false
				}
			}
		}
		return true
	}

	// Check for IPv6 (contains colons)
	if strings.Contains(host, ":") {
		return true
	}

	// Check for localhost
	if host == "localhost" {
		return true
	}

	return false
}

// IsSubscriptionURL checks if a string looks like a subscription URL.
func IsSubscriptionURL(s string) bool {
	s = strings.TrimSpace(strings.ToLower(s))
	if !strings.HasPrefix(s, "http://") && !strings.HasPrefix(s, "https://") {
		return false
	}
	// Not a proxy link
	return !IsValidLink(s)
}

// ParseLink parses a proxy link and extracts metadata.
func ParseLink(link string) (*ParsedLink, error) {
	link = strings.TrimSpace(link)

	protocol, server, port, name, err := proxy.ParseLinkInfo(link)
	if err != nil {
		return nil, err
	}

	return &ParsedLink{
		Link:     link,
		Name:     name,
		Protocol: protocol,
		Server:   server,
		Port:     port,
	}, nil
}

// ParseSubscriptionContent parses subscription content which may be base64 encoded.
// Returns a slice of valid proxy links.
func ParseSubscriptionContent(content string) []string {
	content = strings.TrimSpace(content)
	if content == "" {
		return nil
	}

	var lines []string

	// Try base64 decode first
	decoded, err := base64.StdEncoding.DecodeString(content)
	if err == nil && len(decoded) > 0 && isPrintable(decoded) {
		lines = strings.Split(string(decoded), "\n")
	} else {
		// Try URL-safe base64
		decoded, err = base64.URLEncoding.DecodeString(content)
		if err == nil && len(decoded) > 0 && isPrintable(decoded) {
			lines = strings.Split(string(decoded), "\n")
		} else {
			// Assume plain text
			lines = strings.Split(content, "\n")
		}
	}

	var validLinks []string
	for _, line := range lines {
		line = strings.TrimSpace(line)
		if line == "" || strings.HasPrefix(line, "#") {
			continue
		}

		if IsValidLink(line) {
			validLinks = append(validLinks, line)
		}
	}

	return validLinks
}

// isPrintable checks if decoded content looks like text.
func isPrintable(data []byte) bool {
	if len(data) == 0 {
		return false
	}

	printable := 0
	for _, b := range data {
		if b >= 32 && b <= 126 || b == '\n' || b == '\r' || b == '\t' {
			printable++
		}
	}

	return float64(printable)/float64(len(data)) > 0.9
}

// ParseClipboardContent parses clipboard content which may contain:
// - Multiple proxy links (one per line)
// - A single subscription URL
// - Mixed content
func ParseClipboardContent(content string) (links []string, subscriptionURL string) {
	content = strings.TrimSpace(content)
	if content == "" {
		return nil, ""
	}

	lines := strings.Split(content, "\n")
	for _, line := range lines {
		line = strings.TrimSpace(line)
		if line == "" {
			continue
		}

		if IsValidLink(line) {
			links = append(links, line)
		} else if IsSubscriptionURL(line) && subscriptionURL == "" {
			subscriptionURL = line
		}
	}

	return links, subscriptionURL
}
