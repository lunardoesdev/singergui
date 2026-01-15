//go:build windows

package sysproxy

import (
	"fmt"
	"syscall"
	"unsafe"
)

const (
	registryPath = `Software\Microsoft\Windows\CurrentVersion\Internet Settings`
)

var (
	advapi32                  = syscall.NewLazyDLL("advapi32.dll")
	wininet                   = syscall.NewLazyDLL("wininet.dll")
	procRegOpenKeyExW         = advapi32.NewProc("RegOpenKeyExW")
	procRegSetValueExW        = advapi32.NewProc("RegSetValueExW")
	procRegQueryValueExW      = advapi32.NewProc("RegQueryValueExW")
	procRegCloseKey           = advapi32.NewProc("RegCloseKey")
	procInternetSetOptionW    = wininet.NewProc("InternetSetOptionW")
)

const (
	HKEY_CURRENT_USER        = 0x80000001
	KEY_READ                 = 0x20019
	KEY_WRITE                = 0x20006
	KEY_ALL_ACCESS           = 0xF003F
	REG_SZ                   = 1
	REG_DWORD                = 4
	INTERNET_OPTION_REFRESH  = 37
	INTERNET_OPTION_SETTINGS_CHANGED = 39
)

type windowsProxy struct{}

func (p *windowsProxy) Set(host string, port int) error {
	proxyServer := fmt.Sprintf("%s:%d", host, port)

	// Open registry key
	var hKey syscall.Handle
	keyPath, _ := syscall.UTF16PtrFromString(registryPath)
	ret, _, _ := procRegOpenKeyExW.Call(
		uintptr(HKEY_CURRENT_USER),
		uintptr(unsafe.Pointer(keyPath)),
		0,
		uintptr(KEY_ALL_ACCESS),
		uintptr(unsafe.Pointer(&hKey)),
	)
	if ret != 0 {
		return fmt.Errorf("failed to open registry key: %d", ret)
	}
	defer procRegCloseKey.Call(uintptr(hKey))

	// Set ProxyEnable = 1
	enableValue := uint32(1)
	enableName, _ := syscall.UTF16PtrFromString("ProxyEnable")
	ret, _, _ = procRegSetValueExW.Call(
		uintptr(hKey),
		uintptr(unsafe.Pointer(enableName)),
		0,
		uintptr(REG_DWORD),
		uintptr(unsafe.Pointer(&enableValue)),
		uintptr(4),
	)
	if ret != 0 {
		return fmt.Errorf("failed to set ProxyEnable: %d", ret)
	}

	// Set ProxyServer
	serverName, _ := syscall.UTF16PtrFromString("ProxyServer")
	serverValue, _ := syscall.UTF16FromString(proxyServer)
	ret, _, _ = procRegSetValueExW.Call(
		uintptr(hKey),
		uintptr(unsafe.Pointer(serverName)),
		0,
		uintptr(REG_SZ),
		uintptr(unsafe.Pointer(&serverValue[0])),
		uintptr(len(serverValue)*2),
	)
	if ret != 0 {
		return fmt.Errorf("failed to set ProxyServer: %d", ret)
	}

	// Set ProxyOverride for localhost
	overrideName, _ := syscall.UTF16PtrFromString("ProxyOverride")
	overrideValue, _ := syscall.UTF16FromString("localhost;127.*;10.*;192.168.*;<local>")
	ret, _, _ = procRegSetValueExW.Call(
		uintptr(hKey),
		uintptr(unsafe.Pointer(overrideName)),
		0,
		uintptr(REG_SZ),
		uintptr(unsafe.Pointer(&overrideValue[0])),
		uintptr(len(overrideValue)*2),
	)
	if ret != 0 {
		return fmt.Errorf("failed to set ProxyOverride: %d", ret)
	}

	// Notify system of settings change
	procInternetSetOptionW.Call(0, uintptr(INTERNET_OPTION_SETTINGS_CHANGED), 0, 0)
	procInternetSetOptionW.Call(0, uintptr(INTERNET_OPTION_REFRESH), 0, 0)

	return nil
}

func (p *windowsProxy) Clear() error {
	// Open registry key
	var hKey syscall.Handle
	keyPath, _ := syscall.UTF16PtrFromString(registryPath)
	ret, _, _ := procRegOpenKeyExW.Call(
		uintptr(HKEY_CURRENT_USER),
		uintptr(unsafe.Pointer(keyPath)),
		0,
		uintptr(KEY_ALL_ACCESS),
		uintptr(unsafe.Pointer(&hKey)),
	)
	if ret != 0 {
		return fmt.Errorf("failed to open registry key: %d", ret)
	}
	defer procRegCloseKey.Call(uintptr(hKey))

	// Set ProxyEnable = 0
	enableValue := uint32(0)
	enableName, _ := syscall.UTF16PtrFromString("ProxyEnable")
	ret, _, _ = procRegSetValueExW.Call(
		uintptr(hKey),
		uintptr(unsafe.Pointer(enableName)),
		0,
		uintptr(REG_DWORD),
		uintptr(unsafe.Pointer(&enableValue)),
		uintptr(4),
	)
	if ret != 0 {
		return fmt.Errorf("failed to clear ProxyEnable: %d", ret)
	}

	// Notify system of settings change
	procInternetSetOptionW.Call(0, uintptr(INTERNET_OPTION_SETTINGS_CHANGED), 0, 0)
	procInternetSetOptionW.Call(0, uintptr(INTERNET_OPTION_REFRESH), 0, 0)

	return nil
}

func (p *windowsProxy) IsSet() (bool, error) {
	// Open registry key
	var hKey syscall.Handle
	keyPath, _ := syscall.UTF16PtrFromString(registryPath)
	ret, _, _ := procRegOpenKeyExW.Call(
		uintptr(HKEY_CURRENT_USER),
		uintptr(unsafe.Pointer(keyPath)),
		0,
		uintptr(KEY_READ),
		uintptr(unsafe.Pointer(&hKey)),
	)
	if ret != 0 {
		return false, fmt.Errorf("failed to open registry key: %d", ret)
	}
	defer procRegCloseKey.Call(uintptr(hKey))

	// Read ProxyEnable
	var enableValue uint32
	var dataType uint32
	var dataSize uint32 = 4
	enableName, _ := syscall.UTF16PtrFromString("ProxyEnable")
	ret, _, _ = procRegQueryValueExW.Call(
		uintptr(hKey),
		uintptr(unsafe.Pointer(enableName)),
		0,
		uintptr(unsafe.Pointer(&dataType)),
		uintptr(unsafe.Pointer(&enableValue)),
		uintptr(unsafe.Pointer(&dataSize)),
	)
	if ret != 0 {
		return false, nil
	}

	return enableValue == 1, nil
}
