package subscription

import (
	"bufio"
	"context"
	"fmt"
	"io"
	"net/http"
	"time"

	"golang.org/x/time/rate"
)

// Fetcher handles streaming subscription downloads.
type Fetcher struct {
	client     *http.Client
	speedLimit int // KB/s
}

// NewFetcher creates a new subscription fetcher.
func NewFetcher(speedLimitKBps int) *Fetcher {
	return &Fetcher{
		client: &http.Client{
			Timeout: 5 * time.Minute,
		},
		speedLimit: speedLimitKBps,
	}
}

// SetSpeedLimit updates the speed limit in KB/s.
func (f *Fetcher) SetSpeedLimit(kbps int) {
	f.speedLimit = kbps
}

// rateLimitedReader wraps a reader with rate limiting.
type rateLimitedReader struct {
	reader  io.Reader
	limiter *rate.Limiter
	ctx     context.Context
}

func (r *rateLimitedReader) Read(p []byte) (n int, err error) {
	n, err = r.reader.Read(p)
	if n <= 0 || r.limiter == nil {
		return n, err
	}

	remaining := n
	for remaining > 0 {
		burst := r.limiter.Burst()
		if burst <= 0 {
			burst = 1
		}
		toWait := remaining
		if toWait > burst {
			toWait = burst
		}
		if waitErr := r.limiter.WaitN(r.ctx, toWait); waitErr != nil {
			return n, waitErr
		}
		remaining -= toWait
	}

	return n, err
}

// FetchStreaming downloads a subscription URL and calls handler for each line.
// This minimizes memory usage by not storing the full response.
func (f *Fetcher) FetchStreaming(ctx context.Context, url string, handler func(line string) error) error {
	req, err := http.NewRequestWithContext(ctx, "GET", url, nil)
	if err != nil {
		return fmt.Errorf("failed to create request: %w", err)
	}

	// Set user agent to avoid blocks
	req.Header.Set("User-Agent", "SingerGUI/1.0")

	resp, err := f.client.Do(req)
	if err != nil {
		return fmt.Errorf("failed to fetch subscription: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return fmt.Errorf("unexpected status code: %d", resp.StatusCode)
	}

	// Create rate-limited reader
	var reader io.Reader = resp.Body
	if f.speedLimit > 0 {
		// Convert KB/s to bytes/s
		bytesPerSecond := f.speedLimit * 1024
		limiter := rate.NewLimiter(rate.Limit(bytesPerSecond), bytesPerSecond)
		reader = &rateLimitedReader{
			reader:  resp.Body,
			limiter: limiter,
			ctx:     ctx,
		}
	}

	// Stream line by line
	scanner := bufio.NewScanner(reader)
	// Increase max line size for very long links
	scanner.Buffer(make([]byte, 64*1024), 1024*1024)

	for scanner.Scan() {
		select {
		case <-ctx.Done():
			return ctx.Err()
		default:
		}

		line := scanner.Text()
		if err := handler(line); err != nil {
			return err
		}
	}

	if err := scanner.Err(); err != nil {
		return fmt.Errorf("failed to read subscription: %w", err)
	}

	return nil
}

// FetchWithProxy downloads a subscription URL through a proxy.
func (f *Fetcher) FetchWithProxy(ctx context.Context, url, proxyAddr string, handler func(line string) error) error {
	// Create a client with the proxy
	// This is useful for testing or fetching through the active proxy
	// For now, we use direct connection
	return f.FetchStreaming(ctx, url, handler)
}
