package proxy

import (
	"context"
	"database/sql"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"time"

	"golang.org/x/time/rate"

	"github.com/lunardoesdev/singergui/internal/config"
	"github.com/lunardoesdev/singergui/internal/database/queries"
)

// MeasurementService handles proxy measurements.
type MeasurementService struct {
	db      *queries.Queries
	manager *Manager
	config  *config.Config
	limiter *rate.Limiter
}

// NewMeasurementService creates a new measurement service.
func NewMeasurementService(db *queries.Queries, manager *Manager, cfg *config.Config) *MeasurementService {
	// 5 requests per hour = 1 request per 12 minutes
	limiter := rate.NewLimiter(rate.Every(12*time.Minute), 1)

	return &MeasurementService{
		db:      db,
		manager: manager,
		config:  cfg,
		limiter: limiter,
	}
}

// UpdateRateLimit updates the rate limiter based on config.
func (s *MeasurementService) UpdateRateLimit() {
	rph := s.config.RequestsPerHour()
	if rph <= 0 {
		rph = 5
	}
	interval := time.Hour / time.Duration(rph)
	s.limiter.SetLimit(rate.Every(interval))
}

// CanMeasure checks if we can make a measurement (rate limited).
func (s *MeasurementService) CanMeasure() bool {
	return s.limiter.Allow()
}

// WaitForMeasurement waits until a measurement can be made.
func (s *MeasurementService) WaitForMeasurement(ctx context.Context) error {
	return s.limiter.Wait(ctx)
}

// RunHealthcheck tests if a proxy is working.
func (s *MeasurementService) RunHealthcheck(ctx context.Context, linkID int64, link string) error {
	// Create temporary proxy
	tempProxy, err := s.manager.CreateTempProxy(ctx, link)
	if err != nil {
		// Fast failure - don't count against rate limit
		s.recordHealthcheck(ctx, linkID, false, fmt.Sprintf("proxy creation failed: %v", err))
		return err
	}
	defer tempProxy.Stop()

	// Create HTTP client using the proxy
	proxyURL, _ := url.Parse("socks5://" + tempProxy.ListenAddr)
	client := &http.Client{
		Transport: &http.Transport{
			Proxy: http.ProxyURL(proxyURL),
		},
		Timeout: 30 * time.Second,
	}

	// Test connectivity
	req, err := http.NewRequestWithContext(ctx, "GET", "https://www.google.com/generate_204", nil)
	if err != nil {
		s.recordHealthcheck(ctx, linkID, false, fmt.Sprintf("request creation failed: %v", err))
		return err
	}

	resp, err := client.Do(req)
	if err != nil {
		s.recordHealthcheck(ctx, linkID, false, fmt.Sprintf("request failed: %v", err))
		return err
	}
	defer resp.Body.Close()

	// Successful if we got a response (even non-200)
	s.recordHealthcheck(ctx, linkID, true, "")

	// Update last success time
	s.db.UpdateLastSuccess(ctx, linkID)

	return nil
}

func (s *MeasurementService) recordHealthcheck(ctx context.Context, linkID int64, success bool, errMsg string) {
	var successInt int64
	if success {
		successInt = 1
	}

	var errMsgNullable sql.NullString
	if errMsg != "" {
		errMsgNullable = sql.NullString{String: errMsg, Valid: true}
	}

	s.db.InsertHealthcheck(ctx, queries.InsertHealthcheckParams{
		LinkID:       linkID,
		Success:      successInt,
		ErrorMessage: errMsgNullable,
	})
}

// RunPingTest measures latency to the proxy server.
func (s *MeasurementService) RunPingTest(ctx context.Context, linkID int64, link string) error {
	start := time.Now()

	// Create temporary proxy
	tempProxy, err := s.manager.CreateTempProxy(ctx, link)
	if err != nil {
		s.recordPing(ctx, linkID, 0, false, fmt.Sprintf("proxy creation failed: %v", err))
		return err
	}
	defer tempProxy.Stop()

	// Create HTTP client using the proxy
	proxyURL, _ := url.Parse("socks5://" + tempProxy.ListenAddr)
	client := &http.Client{
		Transport: &http.Transport{
			Proxy: http.ProxyURL(proxyURL),
		},
		Timeout: 30 * time.Second,
	}

	// Measure time to complete request
	req, err := http.NewRequestWithContext(ctx, "HEAD", "https://www.google.com", nil)
	if err != nil {
		s.recordPing(ctx, linkID, 0, false, fmt.Sprintf("request creation failed: %v", err))
		return err
	}

	resp, err := client.Do(req)
	if err != nil {
		s.recordPing(ctx, linkID, 0, false, fmt.Sprintf("request failed: %v", err))
		return err
	}
	defer resp.Body.Close()

	latency := time.Since(start).Milliseconds()
	s.recordPing(ctx, linkID, int(latency), true, "")

	// Update last success
	s.db.UpdateLastSuccess(ctx, linkID)

	return nil
}

func (s *MeasurementService) recordPing(ctx context.Context, linkID int64, latencyMs int, success bool, errMsg string) {
	var successInt int64
	if success {
		successInt = 1
	}

	var latencyNullable sql.NullInt64
	if success {
		latencyNullable = sql.NullInt64{Int64: int64(latencyMs), Valid: true}
	}

	var errMsgNullable sql.NullString
	if errMsg != "" {
		errMsgNullable = sql.NullString{String: errMsg, Valid: true}
	}

	s.db.InsertPingMeasurement(ctx, queries.InsertPingMeasurementParams{
		LinkID:       linkID,
		LatencyMs:    latencyNullable,
		Success:      successInt,
		ErrorMessage: errMsgNullable,
	})
}

// RunSpeedTest measures download speed through the proxy.
func (s *MeasurementService) RunSpeedTest(ctx context.Context, linkID int64, link string) error {
	// Create temporary proxy
	tempProxy, err := s.manager.CreateTempProxy(ctx, link)
	if err != nil {
		s.recordSpeed(ctx, linkID, 0, 0, false, fmt.Sprintf("proxy creation failed: %v", err))
		return err
	}
	defer tempProxy.Stop()

	// Create HTTP client using the proxy
	proxyURL, _ := url.Parse("socks5://" + tempProxy.ListenAddr)
	client := &http.Client{
		Transport: &http.Transport{
			Proxy: http.ProxyURL(proxyURL),
		},
		Timeout: 60 * time.Second,
	}

	// Download a test file (1MB)
	testURL := "https://speed.cloudflare.com/__down?bytes=1048576"
	req, err := http.NewRequestWithContext(ctx, "GET", testURL, nil)
	if err != nil {
		s.recordSpeed(ctx, linkID, 0, 0, false, fmt.Sprintf("request creation failed: %v", err))
		return err
	}

	start := time.Now()
	resp, err := client.Do(req)
	if err != nil {
		s.recordSpeed(ctx, linkID, 0, 0, false, fmt.Sprintf("request failed: %v", err))
		return err
	}
	defer resp.Body.Close()

	// Read and discard the body
	bytesRead, err := io.Copy(io.Discard, resp.Body)
	if err != nil {
		s.recordSpeed(ctx, linkID, 0, 0, false, fmt.Sprintf("read failed: %v", err))
		return err
	}

	duration := time.Since(start).Seconds()
	if duration < 0.001 {
		duration = 0.001
	}

	// Calculate speed in bytes per second
	downloadSpeed := int64(float64(bytesRead) / duration)

	s.recordSpeed(ctx, linkID, downloadSpeed, 0, true, "")

	// Update last success
	s.db.UpdateLastSuccess(ctx, linkID)

	return nil
}

func (s *MeasurementService) recordSpeed(ctx context.Context, linkID int64, downloadBps, uploadBps int64, success bool, errMsg string) {
	var successInt int64
	if success {
		successInt = 1
	}

	var downloadNullable, uploadNullable sql.NullInt64
	if success {
		downloadNullable = sql.NullInt64{Int64: downloadBps, Valid: true}
		uploadNullable = sql.NullInt64{Int64: uploadBps, Valid: true}
	}

	var errMsgNullable sql.NullString
	if errMsg != "" {
		errMsgNullable = sql.NullString{String: errMsg, Valid: true}
	}

	s.db.InsertSpeedMeasurement(ctx, queries.InsertSpeedMeasurementParams{
		LinkID:          linkID,
		DownloadSpeedBps: downloadNullable,
		UploadSpeedBps:   uploadNullable,
		Success:         successInt,
		ErrorMessage:    errMsgNullable,
	})
}

// PurgeOldMeasurements removes measurements beyond the configured limit.
func (s *MeasurementService) PurgeOldMeasurements(ctx context.Context) error {
	limit := int64(s.config.MeasurementHistoryLimit())

	if _, err := s.db.PurgeOldHealthchecks(ctx, limit); err != nil {
		return fmt.Errorf("failed to purge healthchecks: %w", err)
	}

	if _, err := s.db.PurgeOldPingMeasurements(ctx, limit); err != nil {
		return fmt.Errorf("failed to purge ping measurements: %w", err)
	}

	if _, err := s.db.PurgeOldSpeedMeasurements(ctx, limit); err != nil {
		return fmt.Errorf("failed to purge speed measurements: %w", err)
	}

	return nil
}

// MarkDeadProxies marks proxies as dead if they haven't had a successful measurement
// for the configured threshold period and the current measurement fails.
func (s *MeasurementService) MarkDeadProxies(ctx context.Context) error {
	thresholdDays := s.config.DeadProxyThresholdDays()

	candidates, err := s.db.GetDeadCandidates(ctx, fmt.Sprintf("%d", thresholdDays))
	if err != nil {
		return fmt.Errorf("failed to get dead candidates: %w", err)
	}

	for _, candidate := range candidates {
		// Check if latest healthcheck failed
		latest, err := s.db.GetLatestHealthcheck(ctx, candidate.ID)
		if err != nil {
			continue
		}

		if latest.Success == 0 {
			// Mark as dead
			if err := s.db.MarkLinkDead(ctx, candidate.ID); err != nil {
				continue
			}
		}
	}

	return nil
}
