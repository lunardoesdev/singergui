package subscription

import (
	"context"
	"strings"
	"testing"
	"time"

	"golang.org/x/time/rate"
)

func TestRateLimitedReaderSmallBurst(t *testing.T) {
	reader := strings.NewReader("abcdefghij")
	limiter := rate.NewLimiter(rate.Limit(1_000_000), 1)
	ctx, cancel := context.WithTimeout(context.Background(), time.Second)
	defer cancel()

	r := &rateLimitedReader{
		reader:  reader,
		limiter: limiter,
		ctx:     ctx,
	}

	buf := make([]byte, 10)
	n, err := r.Read(buf)
	if err != nil {
		t.Fatalf("Read() error = %v", err)
	}
	if n != 10 {
		t.Fatalf("Read() n = %d, want %d", n, 10)
	}
}

