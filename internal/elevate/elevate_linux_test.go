//go:build linux

package elevate

import "testing"

func TestElevationEnvKeysStable(t *testing.T) {
	keys := elevationEnvKeys()
	if len(keys) == 0 {
		t.Fatalf("expected env keys")
	}
	seen := map[string]bool{}
	for _, key := range keys {
		if key == "" {
			t.Fatalf("empty env key")
		}
		if seen[key] {
			t.Fatalf("duplicate env key: %s", key)
		}
		seen[key] = true
	}
}
