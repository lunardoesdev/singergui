//go:build !linux

package sysproxy

type linuxProxy struct{}

func (p *linuxProxy) Set(host string, port int) error {
	return nil
}

func (p *linuxProxy) Clear() error {
	return nil
}

func (p *linuxProxy) IsSet() (bool, error) {
	return false, nil
}
