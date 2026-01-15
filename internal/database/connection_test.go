package database

import (
	"context"
	"os"
	"path/filepath"
	"testing"

	"github.com/lunardoesdev/singergui/internal/database/queries"
)

func TestOpenAndMigrate(t *testing.T) {
	// Create temp directory
	tmpDir, err := os.MkdirTemp("", "singergui-test-*")
	if err != nil {
		t.Fatalf("Failed to create temp dir: %v", err)
	}
	defer os.RemoveAll(tmpDir)

	dbPath := filepath.Join(tmpDir, "test.db")

	// Open database
	db, err := Open(dbPath)
	if err != nil {
		t.Fatalf("Open() error = %v", err)
	}
	defer db.Close()

	// Run migrations
	ctx := context.Background()
	if err := db.Migrate(ctx); err != nil {
		t.Fatalf("Migrate() error = %v", err)
	}

	// Verify tables exist by running queries
	groups, err := db.Queries.GetAllGroups(ctx)
	if err != nil {
		t.Errorf("GetAllGroups() error = %v", err)
	}
	if groups == nil {
		t.Error("GetAllGroups() returned nil")
	}

	// Check settings were inserted
	val, err := db.Queries.GetSetting(ctx, "measurement_history_limit")
	if err != nil {
		t.Errorf("GetSetting() error = %v", err)
	}
	if val != "5000" {
		t.Errorf("measurement_history_limit = %q, want %q", val, "5000")
	}
}

func TestWithTx(t *testing.T) {
	tmpDir, err := os.MkdirTemp("", "singergui-test-*")
	if err != nil {
		t.Fatalf("Failed to create temp dir: %v", err)
	}
	defer os.RemoveAll(tmpDir)

	dbPath := filepath.Join(tmpDir, "test.db")
	db, err := Open(dbPath)
	if err != nil {
		t.Fatalf("Open() error = %v", err)
	}
	defer db.Close()

	ctx := context.Background()
	if err := db.Migrate(ctx); err != nil {
		t.Fatalf("Migrate() error = %v", err)
	}

	// Test successful transaction
	err = db.WithTx(ctx, func(q *queries.Queries) error {
		_, err := q.CreateGroup(ctx, "TestGroup")
		return err
	})
	if err != nil {
		t.Errorf("WithTx() error = %v", err)
	}

	// Verify group was created
	groups, err := db.Queries.GetAllGroups(ctx)
	if err != nil {
		t.Fatalf("GetAllGroups() error = %v", err)
	}
	if len(groups) != 1 {
		t.Errorf("Expected 1 group, got %d", len(groups))
	}
}
