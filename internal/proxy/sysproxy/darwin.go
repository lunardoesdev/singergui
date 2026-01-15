//go:build darwin

package sysproxy

import (
	"os/exec"
	"strconv"
	"strings"
)

type darwinProxy struct{}

func (p *darwinProxy) getNetworkServices() ([]string, error) {
	cmd := exec.Command("networksetup", "-listallnetworkservices")
	output, err := cmd.Output()
	if err != nil {
		return nil, err
	}

	lines := strings.Split(string(output), "\n")
	var services []string
	for _, line := range lines {
		line = strings.TrimSpace(line)
		if line == "" || strings.HasPrefix(line, "An asterisk") {
			continue
		}
		services = append(services, line)
	}
	return services, nil
}

func (p *darwinProxy) Set(host string, port int) error {
	services, err := p.getNetworkServices()
	if err != nil {
		return err
	}

	portStr := strconv.Itoa(port)

	for _, service := range services {
		// Set HTTP proxy
		exec.Command("networksetup", "-setwebproxy", service, host, portStr).Run()
		exec.Command("networksetup", "-setwebproxystate", service, "on").Run()

		// Set HTTPS proxy
		exec.Command("networksetup", "-setsecurewebproxy", service, host, portStr).Run()
		exec.Command("networksetup", "-setsecurewebproxystate", service, "on").Run()

		// Set SOCKS proxy
		exec.Command("networksetup", "-setsocksfirewallproxy", service, host, portStr).Run()
		exec.Command("networksetup", "-setsocksfirewallproxystate", service, "on").Run()

		// Set bypass list
		exec.Command("networksetup", "-setproxybypassdomains", service, "localhost", "127.0.0.1", "*.local").Run()
	}

	return nil
}

func (p *darwinProxy) Clear() error {
	services, err := p.getNetworkServices()
	if err != nil {
		return err
	}

	for _, service := range services {
		exec.Command("networksetup", "-setwebproxystate", service, "off").Run()
		exec.Command("networksetup", "-setsecurewebproxystate", service, "off").Run()
		exec.Command("networksetup", "-setsocksfirewallproxystate", service, "off").Run()
	}

	return nil
}

func (p *darwinProxy) IsSet() (bool, error) {
	services, err := p.getNetworkServices()
	if err != nil {
		return false, err
	}

	if len(services) == 0 {
		return false, nil
	}

	// Check first service
	cmd := exec.Command("networksetup", "-getwebproxy", services[0])
	output, err := cmd.Output()
	if err != nil {
		return false, nil
	}

	return strings.Contains(string(output), "Enabled: Yes"), nil
}
