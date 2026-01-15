//go:build !windows

package sysproxy

type windowsProxy struct{}

func (p *windowsProxy) Set(host string, port int) error {
	return nil
}

func (p *windowsProxy) Clear() error {
	return nil
}

func (p *windowsProxy) IsSet() (bool, error) {
	return false, nil
}
