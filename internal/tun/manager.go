package tun

import (
	"context"
	"runtime"
	"sync"

	"github.com/lunardoesdev/singerbox"
	"github.com/sagernet/sing-box"
	C "github.com/sagernet/sing-box/constant"
	"github.com/sagernet/sing-box/include"
	"github.com/sagernet/sing-box/option"
	E "github.com/sagernet/sing/common/exceptions"
)

// Manager controls a sing-box instance running in TUN mode.
type Manager struct {
	mu         sync.RWMutex
	instance   *box.Box
	ctx        context.Context
	cancel     context.CancelFunc
	activeLink string
	activeID   int64
	ifaceName  string
	options    Options
}

// NewManager creates a TUN manager with platform defaults.
func NewManager() *Manager {
	opts := DefaultOptions()
	if runtime.GOOS == "linux" {
		opts.AutoRedirect = true
	}
	return &Manager{
		options: opts,
	}
}

// SetOptions updates tun options for the next start.
func (m *Manager) SetOptions(opts Options) {
	m.mu.Lock()
	defer m.mu.Unlock()
	m.options = opts
}

// IsActive reports whether TUN is currently running.
func (m *Manager) IsActive() bool {
	m.mu.RLock()
	defer m.mu.RUnlock()
	return m.instance != nil
}

// ActiveLinkID returns the link ID currently used by TUN.
func (m *Manager) ActiveLinkID() int64 {
	m.mu.RLock()
	defer m.mu.RUnlock()
	return m.activeID
}

// InterfaceName returns the configured interface name, if any.
func (m *Manager) InterfaceName() string {
	m.mu.RLock()
	defer m.mu.RUnlock()
	return m.ifaceName
}

// Start launches sing-box with a TUN inbound using the provided share link.
func (m *Manager) Start(ctx context.Context, linkID int64, link string) error {
	m.mu.Lock()
	defer m.mu.Unlock()

	if m.instance != nil {
		return E.New("tun already running")
	}

	outbound, err := singerbox.Parse(link)
	if err != nil {
		return E.Cause(err, "parse share link")
	}

	cfg, ifaceName, err := createTunConfig(outbound, m.options)
	if err != nil {
		return err
	}

	baseCtx := include.Context(context.Background())
	baseCtx, cancel := context.WithCancel(baseCtx)

	instance, err := box.New(box.Options{
		Context: baseCtx,
		Options: cfg,
	})
	if err != nil {
		cancel()
		return E.Cause(err, "create sing-box instance")
	}

	if err := startWithContext(ctx, instance); err != nil {
		instance.Close()
		cancel()
		return E.Cause(err, "start sing-box")
	}

	m.instance = instance
	m.ctx = baseCtx
	m.cancel = cancel
	m.activeLink = link
	m.activeID = linkID
	m.ifaceName = ifaceName

	return nil
}

// Stop terminates the TUN instance.
func (m *Manager) Stop(ctx context.Context) error {
	m.mu.Lock()
	defer m.mu.Unlock()

	if m.instance == nil {
		return nil
	}

	instance := m.instance
	m.instance = nil
	m.activeLink = ""
	m.activeID = 0
	m.ifaceName = ""

	err := stopWithContext(ctx, instance)
	if m.cancel != nil {
		m.cancel()
	}
	m.cancel = nil
	m.ctx = nil
	return err
}

func createTunConfig(outbound option.Outbound, opts Options) (option.Options, string, error) {
	addresses := opts.Address
	if len(addresses) == 0 {
		addresses = defaultAddress()
	}

	inboundOpts := &option.TunInboundOptions{
		InterfaceName: opts.InterfaceName,
		MTU:           opts.MTU,
		Address:       addresses,
		AutoRoute:     opts.AutoRoute,
		AutoRedirect:  opts.AutoRedirect,
		StrictRoute:   opts.StrictRoute,
		Stack:         opts.Stack,
	}

	if opts.InterfaceName == "" {
		inboundOpts.InterfaceName = "singergui0"
	}
	if opts.MTU == 0 {
		inboundOpts.MTU = 1500
	}
	if inboundOpts.Address == nil {
		inboundOpts.Address = defaultAddress()
	}
	if inboundOpts.Stack == "" {
		inboundOpts.Stack = "system"
	}

	return option.Options{
		Log: &option.LogOptions{
			Level:  "warn",
			Output: "stderr",
		},
		Inbounds: []option.Inbound{
			{
				Type:    "tun",
				Tag:     "tun-in",
				Options: inboundOpts,
			},
		},
		Outbounds: []option.Outbound{
			outbound,
			{
				Type:    "direct",
				Tag:     "direct",
				Options: &option.DirectOutboundOptions{},
			},
			{
				Type:    "block",
				Tag:     "block",
				Options: &option.StubOptions{},
			},
		},
		Route: &option.RouteOptions{
			Rules: []option.Rule{
				{
					Type: C.RuleTypeDefault,
					DefaultOptions: option.DefaultRule{
						RuleAction: option.RuleAction{
							Action: C.RuleActionTypeRoute,
							RouteOptions: option.RouteActionOptions{
								Outbound: outbound.Tag,
							},
						},
					},
				},
			},
			AutoDetectInterface: true,
		},
	}, inboundOpts.InterfaceName, nil
}

func startWithContext(ctx context.Context, instance *box.Box) error {
	if ctx == nil {
		return instance.Start()
	}

	done := make(chan error, 1)
	go func() {
		done <- instance.Start()
	}()

	select {
	case <-ctx.Done():
		instance.Close()
		return ctx.Err()
	case err := <-done:
		return err
	}
}

func stopWithContext(ctx context.Context, instance *box.Box) error {
	if ctx == nil {
		return instance.Close()
	}

	done := make(chan error, 1)
	go func() {
		done <- instance.Close()
	}()

	select {
	case <-ctx.Done():
		return ctx.Err()
	case err := <-done:
		return err
	}
}
