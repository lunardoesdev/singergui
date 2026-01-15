package subscription

import (
	"context"
	"database/sql"
	"log"
	"strings"
	"sync"
	"time"

	"github.com/lunardoesdev/singergui/internal/config"
	"github.com/lunardoesdev/singergui/internal/database/queries"
)

// Scheduler handles periodic subscription updates.
type Scheduler struct {
	db      *queries.Queries
	config  *config.Config
	fetcher *Fetcher

	mu       sync.Mutex
	running  bool
	stopCh   chan struct{}
	updateCh chan int64 // channel for on-demand updates

	// Callback for when links are imported
	OnLinksImported func(count int)
}

// NewScheduler creates a new subscription scheduler.
func NewScheduler(db *queries.Queries, cfg *config.Config) *Scheduler {
	return &Scheduler{
		db:       db,
		config:   cfg,
		fetcher:  NewFetcher(cfg.SubscriptionSpeedLimitKBps()),
		updateCh: make(chan int64, 10),
	}
}

// Start begins the scheduler.
func (s *Scheduler) Start(ctx context.Context) {
	s.mu.Lock()
	if s.running {
		s.mu.Unlock()
		return
	}
	s.running = true
	s.stopCh = make(chan struct{})
	s.mu.Unlock()

	go s.run(ctx)
}

// Stop stops the scheduler.
func (s *Scheduler) Stop() {
	s.mu.Lock()
	if !s.running {
		s.mu.Unlock()
		return
	}
	s.running = false
	close(s.stopCh)
	s.mu.Unlock()
}

// TriggerUpdate requests an immediate update of a subscription.
func (s *Scheduler) TriggerUpdate(subscriptionID int64) {
	select {
	case s.updateCh <- subscriptionID:
	default:
		// Channel full, skip
	}
}

func (s *Scheduler) run(ctx context.Context) {
	// Update hourly
	ticker := time.NewTicker(time.Hour)
	defer ticker.Stop()

	// Also reset request counts hourly
	resetTicker := time.NewTicker(time.Hour)
	defer resetTicker.Stop()

	for {
		select {
		case <-ctx.Done():
			return
		case <-s.stopCh:
			return
		case <-ticker.C:
			s.updateAllSubscriptions(ctx)
		case <-resetTicker.C:
			s.resetRequestCounts(ctx)
		case subID := <-s.updateCh:
			s.updateSubscription(ctx, subID)
		}
	}
}

func (s *Scheduler) resetRequestCounts(ctx context.Context) {
	subs, err := s.db.GetSubscriptionsNeedingReset(ctx)
	if err != nil {
		return
	}

	for _, sub := range subs {
		s.db.ResetRequestCount(ctx, sub.ID)
	}
}

func (s *Scheduler) updateAllSubscriptions(ctx context.Context) {
	subs, err := s.db.GetEnabledSubscriptions(ctx)
	if err != nil {
		log.Printf("failed to get enabled subscriptions: %v", err)
		return
	}

	for _, sub := range subs {
		select {
		case <-ctx.Done():
			return
		case <-s.stopCh:
			return
		default:
		}

		s.updateSubscription(ctx, sub.ID)
	}
}

func (s *Scheduler) updateSubscription(ctx context.Context, subID int64) {
	sub, err := s.db.GetSubscriptionByID(ctx, subID)
	if err != nil {
		return
	}

	if !sub.Enabled.Valid || sub.Enabled.Int64 == 0 {
		return
	}

	// Check rate limit
	maxRequests := int64(s.config.RequestsPerHour())
	canRequest, err := s.db.CanMakeRequest(ctx, queries.CanMakeRequestParams{
		RequestCount: sql.NullInt64{Int64: maxRequests, Valid: true},
		ID:           subID,
	})
	if err != nil || !canRequest {
		return
	}

	// Update speed limit from config
	s.fetcher.SetSpeedLimit(s.config.SubscriptionSpeedLimitKBps())

	var importedCount int
	err = s.fetcher.FetchStreaming(ctx, sub.Url, func(line string) error {
		links := ParseSubscriptionContent(line)
		for _, link := range links {
			if err := s.importLinkIfNew(ctx, link); err == nil {
				importedCount++
			}
		}
		return nil
	})

	if err != nil {
		// Don't count fast failures against rate limit
		s.db.UpdateSubscriptionError(ctx, queries.UpdateSubscriptionErrorParams{
			LastError: sql.NullString{String: err.Error(), Valid: true},
			ID:        subID,
		})
		return
	}

	// Successful request - increment counter
	s.db.IncrementRequestCount(ctx, subID)
	s.db.UpdateSubscriptionLastUpdated(ctx, subID)

	if s.OnLinksImported != nil && importedCount > 0 {
		s.OnLinksImported(importedCount)
	}
}

func (s *Scheduler) importLinkIfNew(ctx context.Context, link string) error {
	// Check if link already exists
	exists, err := s.db.LinkExists(ctx, link)
	if err != nil {
		return err
	}
	if exists != 0 {
		return nil // Already exists
	}

	// Parse link info
	parsed, err := ParseLink(link)
	if err != nil {
		return err
	}

	// Insert link
	_, err = s.db.CreateLink(ctx, queries.CreateLinkParams{
		Link:     link,
		Name:     sql.NullString{String: parsed.Name, Valid: parsed.Name != ""},
		Protocol: parsed.Protocol,
		Server:   sql.NullString{String: parsed.Server, Valid: parsed.Server != ""},
		Port:     sql.NullInt64{Int64: int64(parsed.Port), Valid: parsed.Port > 0},
	})

	return err
}

// ImportLinks imports multiple links, skipping duplicates.
// Returns the number of links actually imported.
func (s *Scheduler) ImportLinks(ctx context.Context, links []string, groupID *int64) (int, error) {
	var imported int

	for _, link := range links {
		link = trimLink(link)
		if !IsValidLink(link) {
			continue
		}

		// Check if link already exists
		exists, err := s.db.LinkExists(ctx, link)
		if err != nil {
			continue
		}
		if exists != 0 {
			continue
		}

		// Parse link info
		parsed, err := ParseLink(link)
		if err != nil {
			continue
		}

		// Insert link
		createdLink, err := s.db.CreateLink(ctx, queries.CreateLinkParams{
			Link:     link,
			Name:     sql.NullString{String: parsed.Name, Valid: parsed.Name != ""},
			Protocol: parsed.Protocol,
			Server:   sql.NullString{String: parsed.Server, Valid: parsed.Server != ""},
			Port:     sql.NullInt64{Int64: int64(parsed.Port), Valid: parsed.Port > 0},
		})
		if err != nil {
			continue
		}

		// Add to group if specified
		if groupID != nil && *groupID > 0 {
			maxPos, _ := s.db.GetMaxPositionInGroup(ctx, *groupID)
			s.db.AddLinkToGroup(ctx, queries.AddLinkToGroupParams{
				LinkID:   createdLink.ID,
				GroupID:  *groupID,
				Position: sql.NullInt64{Int64: maxPos + 1, Valid: true},
			})
		}

		imported++
	}

	return imported, nil
}

func trimLink(s string) string {
	// Trim whitespace and common URL artifacts
	s = strings.TrimSpace(s)
	s = strings.TrimSuffix(s, "/")
	return s
}
