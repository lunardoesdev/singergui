-- SingerGUI Database Schema
-- SQLite with foreign key support

-- Groups table
CREATE TABLE IF NOT EXISTS groups (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Shared links (proxy configurations)
CREATE TABLE IF NOT EXISTS shared_links (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    link TEXT NOT NULL UNIQUE,
    name TEXT,
    protocol TEXT NOT NULL,
    server TEXT,
    port INTEGER,
    is_dead INTEGER DEFAULT 0,
    last_success_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_shared_links_dead ON shared_links(is_dead);
CREATE INDEX IF NOT EXISTS idx_shared_links_last_success ON shared_links(last_success_at);
CREATE INDEX IF NOT EXISTS idx_shared_links_protocol ON shared_links(protocol);

-- Link-Group relationship (many-to-many)
CREATE TABLE IF NOT EXISTS link_groups (
    link_id INTEGER NOT NULL,
    group_id INTEGER NOT NULL,
    position INTEGER DEFAULT 0,
    PRIMARY KEY (link_id, group_id),
    FOREIGN KEY (link_id) REFERENCES shared_links(id) ON DELETE CASCADE,
    FOREIGN KEY (group_id) REFERENCES groups(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_link_groups_group ON link_groups(group_id);
CREATE INDEX IF NOT EXISTS idx_link_groups_link ON link_groups(link_id);

-- Subscriptions
CREATE TABLE IF NOT EXISTS subscriptions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    url TEXT NOT NULL UNIQUE,
    name TEXT,
    enabled INTEGER DEFAULT 1,
    last_updated_at TIMESTAMP,
    last_error TEXT,
    request_count INTEGER DEFAULT 0,
    request_count_reset_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Healthcheck measurements (separate table)
CREATE TABLE IF NOT EXISTS healthcheck_measurements (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    link_id INTEGER NOT NULL,
    success INTEGER NOT NULL,
    error_message TEXT,
    measured_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (link_id) REFERENCES shared_links(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_healthcheck_link_time ON healthcheck_measurements(link_id, measured_at DESC);
CREATE INDEX IF NOT EXISTS idx_healthcheck_measured ON healthcheck_measurements(measured_at DESC);

-- Speed measurements (separate table)
CREATE TABLE IF NOT EXISTS speed_measurements (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    link_id INTEGER NOT NULL,
    download_speed_bps INTEGER,
    upload_speed_bps INTEGER,
    success INTEGER NOT NULL,
    error_message TEXT,
    measured_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (link_id) REFERENCES shared_links(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_speed_link_time ON speed_measurements(link_id, measured_at DESC);
CREATE INDEX IF NOT EXISTS idx_speed_measured ON speed_measurements(measured_at DESC);

-- Ping measurements (separate table)
CREATE TABLE IF NOT EXISTS ping_measurements (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    link_id INTEGER NOT NULL,
    latency_ms INTEGER,
    success INTEGER NOT NULL,
    error_message TEXT,
    measured_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (link_id) REFERENCES shared_links(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_ping_link_time ON ping_measurements(link_id, measured_at DESC);
CREATE INDEX IF NOT EXISTS idx_ping_measured ON ping_measurements(measured_at DESC);

-- Settings (key-value)
CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL
);

-- Schema version tracking
CREATE TABLE IF NOT EXISTS schema_migrations (
    version INTEGER PRIMARY KEY,
    applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- FTS5 virtual table for fast proxy search
CREATE VIRTUAL TABLE IF NOT EXISTS links_fts USING fts5(
    name,
    server,
    link,
    content='shared_links',
    content_rowid='id'
);

-- Triggers to keep FTS in sync with shared_links
CREATE TRIGGER IF NOT EXISTS links_fts_insert AFTER INSERT ON shared_links BEGIN
    INSERT INTO links_fts(rowid, name, server, link) VALUES (NEW.id, NEW.name, NEW.server, NEW.link);
END;

CREATE TRIGGER IF NOT EXISTS links_fts_delete AFTER DELETE ON shared_links BEGIN
    INSERT INTO links_fts(links_fts, rowid, name, server, link) VALUES ('delete', OLD.id, OLD.name, OLD.server, OLD.link);
END;

CREATE TRIGGER IF NOT EXISTS links_fts_update AFTER UPDATE ON shared_links BEGIN
    INSERT INTO links_fts(links_fts, rowid, name, server, link) VALUES ('delete', OLD.id, OLD.name, OLD.server, OLD.link);
    INSERT INTO links_fts(rowid, name, server, link) VALUES (NEW.id, NEW.name, NEW.server, NEW.link);
END;

-- FTS5 virtual table for fast group search
CREATE VIRTUAL TABLE IF NOT EXISTS groups_fts USING fts5(
    name,
    content='groups',
    content_rowid='id'
);

-- Triggers to keep groups FTS in sync
CREATE TRIGGER IF NOT EXISTS groups_fts_insert AFTER INSERT ON groups BEGIN
    INSERT INTO groups_fts(rowid, name) VALUES (NEW.id, NEW.name);
END;

CREATE TRIGGER IF NOT EXISTS groups_fts_delete AFTER DELETE ON groups BEGIN
    INSERT INTO groups_fts(groups_fts, rowid, name) VALUES ('delete', OLD.id, OLD.name);
END;

CREATE TRIGGER IF NOT EXISTS groups_fts_update AFTER UPDATE ON groups BEGIN
    INSERT INTO groups_fts(groups_fts, rowid, name) VALUES ('delete', OLD.id, OLD.name);
    INSERT INTO groups_fts(rowid, name) VALUES (NEW.id, NEW.name);
END;
