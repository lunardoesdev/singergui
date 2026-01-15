//go:build linux

package sysproxy

import (
	"fmt"
	"os/exec"
	"strconv"
	"strings"
)

type linuxProxy struct{}

func (p *linuxProxy) Set(host string, port int) error {
	portStr := strconv.Itoa(port)

	// Set GNOME proxy settings using gsettings
	commands := [][]string{
		{"gsettings", "set", "org.gnome.system.proxy", "mode", "manual"},
		{"gsettings", "set", "org.gnome.system.proxy.http", "host", host},
		{"gsettings", "set", "org.gnome.system.proxy.http", "port", portStr},
		{"gsettings", "set", "org.gnome.system.proxy.https", "host", host},
		{"gsettings", "set", "org.gnome.system.proxy.https", "port", portStr},
		{"gsettings", "set", "org.gnome.system.proxy.socks", "host", host},
		{"gsettings", "set", "org.gnome.system.proxy.socks", "port", portStr},
		{"gsettings", "set", "org.gnome.system.proxy", "ignore-hosts", "['localhost', '127.0.0.0/8', '::1']"},
	}

	for _, args := range commands {
		cmd := exec.Command(args[0], args[1:]...)
		if err := cmd.Run(); err != nil {
			// gsettings might not be available, continue
			continue
		}
	}

	// Also try KDE settings with kwriteconfig5
	kdeCommands := [][]string{
		{"kwriteconfig5", "--file", "kioslaverc", "--group", "Proxy Settings", "--key", "ProxyType", "1"},
		{"kwriteconfig5", "--file", "kioslaverc", "--group", "Proxy Settings", "--key", "httpProxy", fmt.Sprintf("http://%s:%d", host, port)},
		{"kwriteconfig5", "--file", "kioslaverc", "--group", "Proxy Settings", "--key", "httpsProxy", fmt.Sprintf("http://%s:%d", host, port)},
		{"kwriteconfig5", "--file", "kioslaverc", "--group", "Proxy Settings", "--key", "socksProxy", fmt.Sprintf("socks://%s:%d", host, port)},
	}

	for _, args := range kdeCommands {
		cmd := exec.Command(args[0], args[1:]...)
		cmd.Run() // Ignore errors - KDE might not be available
	}

	return nil
}

func (p *linuxProxy) Clear() error {
	// Clear GNOME proxy settings
	commands := [][]string{
		{"gsettings", "set", "org.gnome.system.proxy", "mode", "none"},
	}

	for _, args := range commands {
		cmd := exec.Command(args[0], args[1:]...)
		cmd.Run()
	}

	// Clear KDE settings
	kdeCommands := [][]string{
		{"kwriteconfig5", "--file", "kioslaverc", "--group", "Proxy Settings", "--key", "ProxyType", "0"},
	}

	for _, args := range kdeCommands {
		cmd := exec.Command(args[0], args[1:]...)
		cmd.Run()
	}

	return nil
}

func (p *linuxProxy) IsSet() (bool, error) {
	// Check GNOME setting
	cmd := exec.Command("gsettings", "get", "org.gnome.system.proxy", "mode")
	output, err := cmd.Output()
	if err == nil {
		mode := strings.TrimSpace(string(output))
		if mode == "'manual'" {
			return true, nil
		}
	}

	// Check KDE setting
	cmd = exec.Command("kreadconfig5", "--file", "kioslaverc", "--group", "Proxy Settings", "--key", "ProxyType")
	output, err = cmd.Output()
	if err == nil {
		proxyType := strings.TrimSpace(string(output))
		if proxyType == "1" {
			return true, nil
		}
	}

	return false, nil
}
