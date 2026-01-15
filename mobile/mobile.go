//go:build android || ios

package mobile

import (
	"fmt"

	"github.com/lunardoesdev/singerbox"
	"github.com/lunardoesdev/singergui/internal/tun"
	"github.com/sagernet/sing-box/experimental/libbox"
	sjson "github.com/sagernet/sing/common/json"
)

// Service wraps a sing-box libbox service for gomobile builds.
type Service struct {
	service *libbox.BoxService
}

// BuildTunConfig creates a sing-box config with a TUN inbound for mobile platforms.
// The platform interface will provide the TUN file descriptor.
func BuildTunConfig(link string) (string, error) {
	outbound, err := singerbox.Parse(link)
	if err != nil {
		return "", err
	}
	cfg, _, err := tun.BuildConfig(outbound, tun.DefaultOptions())
	if err != nil {
		return "", err
	}
	encoded, err := sjson.Marshal(cfg)
	if err != nil {
		return "", err
	}
	return string(encoded), nil
}

// NewService creates a mobile service using a platform interface implementation.
func NewService(configContent string, platform libbox.PlatformInterface) (*Service, error) {
	svc, err := libbox.NewService(configContent, platform)
	if err != nil {
		return nil, err
	}
	return &Service{service: svc}, nil
}

// Start starts the mobile sing-box service.
func (s *Service) Start() error {
	if s == nil || s.service == nil {
		return fmt.Errorf("service not initialized")
	}
	return s.service.Start()
}

// Stop stops the mobile sing-box service.
func (s *Service) Stop() error {
	if s == nil || s.service == nil {
		return nil
	}
	return s.service.Close()
}
