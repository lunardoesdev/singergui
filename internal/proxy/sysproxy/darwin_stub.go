//go:build !darwin

package sysproxy

type darwinProxy struct{}

func (p *darwinProxy) Set(host string, port int) error {
	return nil
}

func (p *darwinProxy) Clear() error {
	return nil
}

func (p *darwinProxy) IsSet() (bool, error) {
	return false, nil
}
