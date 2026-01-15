package database

import (
	"context"
	"database/sql"
	_ "embed"
	"fmt"
	"os"
	"path/filepath"
	"time"

	_ "github.com/mattn/go-sqlite3"

	"github.com/lunardoesdev/singergui/internal/database/queries"
)

//go:embed schema.sql
var schemaSQL string

type DB struct {
	*sql.DB
	Queries *queries.Queries
}

// Open opens a SQLite database with optimized settings.
func Open(dbPath string) (*DB, error) {
	// Ensure directory exists
	dir := filepath.Dir(dbPath)
	if err := os.MkdirAll(dir, 0755); err != nil {
		return nil, fmt.Errorf("failed to create database directory: %w", err)
	}

	// Open with optimized connection string
	connStr := fmt.Sprintf("file:%s?cache=shared&mode=rwc&_journal_mode=WAL&_busy_timeout=5000&_foreign_keys=ON", dbPath)
	db, err := sql.Open("sqlite3", connStr)
	if err != nil {
		return nil, fmt.Errorf("failed to open database: %w", err)
	}

	// Configure connection pool for SQLite
	db.SetMaxOpenConns(1) // SQLite only supports one writer
	db.SetMaxIdleConns(1)
	db.SetConnMaxLifetime(time.Hour)

	// Apply pragmas for performance
	pragmas := []string{
		"PRAGMA synchronous = NORMAL",
		"PRAGMA cache_size = -64000", // 64MB cache
		"PRAGMA temp_store = MEMORY",
		"PRAGMA mmap_size = 268435456", // 256MB memory-mapped I/O
	}

	for _, pragma := range pragmas {
		if _, err := db.Exec(pragma); err != nil {
			db.Close()
			return nil, fmt.Errorf("failed to set pragma %q: %w", pragma, err)
		}
	}

	// Test connection
	if err := db.Ping(); err != nil {
		db.Close()
		return nil, fmt.Errorf("failed to ping database: %w", err)
	}

	return &DB{
		DB:      db,
		Queries: queries.New(db),
	}, nil
}

// Migrate runs database migrations.
func (db *DB) Migrate(ctx context.Context) error {
	// Check if we need to migrate
	var version int64
	err := db.QueryRowContext(ctx, "SELECT COALESCE(MAX(version), 0) FROM schema_migrations").Scan(&version)
	if err != nil {
		// Table doesn't exist, apply full schema
		if _, err := db.ExecContext(ctx, schemaSQL); err != nil {
			return fmt.Errorf("failed to apply schema: %w", err)
		}

		// Mark as version 1
		if _, err := db.ExecContext(ctx, "INSERT INTO schema_migrations (version) VALUES (1)"); err != nil {
			return fmt.Errorf("failed to record migration: %w", err)
		}

		// Insert default settings
		if err := db.insertDefaultSettings(ctx); err != nil {
			return fmt.Errorf("failed to insert default settings: %w", err)
		}

		return nil
	}

	// Migration 2: Add FTS5 for fast search
	if version < 2 {
		if err := db.migrateFTS5(ctx); err != nil {
			return fmt.Errorf("failed to migrate FTS5: %w", err)
		}
		if _, err := db.ExecContext(ctx, "INSERT INTO schema_migrations (version) VALUES (2)"); err != nil {
			return fmt.Errorf("failed to record migration 2: %w", err)
		}
	}

	return nil
}

// migrateFTS5 creates FTS5 virtual tables and populates them from existing data
func (db *DB) migrateFTS5(ctx context.Context) error {
	// Create links FTS5 virtual table
	_, err := db.ExecContext(ctx, `
		CREATE VIRTUAL TABLE IF NOT EXISTS links_fts USING fts5(
			name,
			server,
			link,
			content='shared_links',
			content_rowid='id'
		)
	`)
	if err != nil {
		return fmt.Errorf("failed to create links FTS5 table: %w", err)
	}

	// Create groups FTS5 virtual table
	_, err = db.ExecContext(ctx, `
		CREATE VIRTUAL TABLE IF NOT EXISTS groups_fts USING fts5(
			name,
			content='groups',
			content_rowid='id'
		)
	`)
	if err != nil {
		return fmt.Errorf("failed to create groups FTS5 table: %w", err)
	}

	// Create triggers for links
	linksTriggers := []string{
		`CREATE TRIGGER IF NOT EXISTS links_fts_insert AFTER INSERT ON shared_links BEGIN
			INSERT INTO links_fts(rowid, name, server, link) VALUES (NEW.id, NEW.name, NEW.server, NEW.link);
		END`,
		`CREATE TRIGGER IF NOT EXISTS links_fts_delete AFTER DELETE ON shared_links BEGIN
			INSERT INTO links_fts(links_fts, rowid, name, server, link) VALUES ('delete', OLD.id, OLD.name, OLD.server, OLD.link);
		END`,
		`CREATE TRIGGER IF NOT EXISTS links_fts_update AFTER UPDATE ON shared_links BEGIN
			INSERT INTO links_fts(links_fts, rowid, name, server, link) VALUES ('delete', OLD.id, OLD.name, OLD.server, OLD.link);
			INSERT INTO links_fts(rowid, name, server, link) VALUES (NEW.id, NEW.name, NEW.server, NEW.link);
		END`,
	}

	for _, trigger := range linksTriggers {
		if _, err := db.ExecContext(ctx, trigger); err != nil {
			return fmt.Errorf("failed to create links trigger: %w", err)
		}
	}

	// Create triggers for groups
	groupsTriggers := []string{
		`CREATE TRIGGER IF NOT EXISTS groups_fts_insert AFTER INSERT ON groups BEGIN
			INSERT INTO groups_fts(rowid, name) VALUES (NEW.id, NEW.name);
		END`,
		`CREATE TRIGGER IF NOT EXISTS groups_fts_delete AFTER DELETE ON groups BEGIN
			INSERT INTO groups_fts(groups_fts, rowid, name) VALUES ('delete', OLD.id, OLD.name);
		END`,
		`CREATE TRIGGER IF NOT EXISTS groups_fts_update AFTER UPDATE ON groups BEGIN
			INSERT INTO groups_fts(groups_fts, rowid, name) VALUES ('delete', OLD.id, OLD.name);
			INSERT INTO groups_fts(rowid, name) VALUES (NEW.id, NEW.name);
		END`,
	}

	for _, trigger := range groupsTriggers {
		if _, err := db.ExecContext(ctx, trigger); err != nil {
			return fmt.Errorf("failed to create groups trigger: %w", err)
		}
	}

	// Rebuild FTS indexes from existing data
	_, err = db.ExecContext(ctx, "INSERT INTO links_fts(links_fts) VALUES ('rebuild')")
	if err != nil {
		return fmt.Errorf("failed to rebuild links FTS index: %w", err)
	}

	_, err = db.ExecContext(ctx, "INSERT INTO groups_fts(groups_fts) VALUES ('rebuild')")
	if err != nil {
		return fmt.Errorf("failed to rebuild groups FTS index: %w", err)
	}

	return nil
}

func (db *DB) insertDefaultSettings(ctx context.Context) error {
	defaults := map[string]string{
		"measurement_history_limit":     "5000",
		"dead_proxy_threshold_days":     "14",
		"requests_per_hour":             "5",
		"proxy_listen_addr":             "127.0.0.1",
		"subscription_speed_limit_kbps": "1024",
	}

	for key, value := range defaults {
		if err := db.Queries.SetSetting(ctx, queries.SetSettingParams{
			Key:   key,
			Value: value,
		}); err != nil {
			return err
		}
	}

	return nil
}

// Close closes the database connection with optimization.
func (db *DB) Close() error {
	// Run optimize before closing
	db.Exec("PRAGMA optimize")
	return db.DB.Close()
}

// WithTx executes a function within a transaction.
func (db *DB) WithTx(ctx context.Context, fn func(*queries.Queries) error) error {
	tx, err := db.BeginTx(ctx, nil)
	if err != nil {
		return err
	}
	defer tx.Rollback()

	if err := fn(db.Queries.WithTx(tx)); err != nil {
		return err
	}

	return tx.Commit()
}
