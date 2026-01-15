package database

import (
	"context"
	"strings"

	"github.com/lunardoesdev/singergui/internal/database/queries"
)

// SearchLinksFTS searches links using FTS5 for fast full-text search
func (db *DB) SearchLinksFTS(ctx context.Context, query string, limit, offset int64) ([]queries.SharedLink, error) {
	// Escape and format query for FTS5
	ftsQuery := formatFTSQuery(query)

	rows, err := db.QueryContext(ctx, `
		SELECT sl.id, sl.link, sl.name, sl.protocol, sl.server, sl.port,
		       sl.is_dead, sl.last_success_at, sl.created_at, sl.updated_at
		FROM shared_links sl
		WHERE sl.id IN (SELECT rowid FROM links_fts WHERE links_fts MATCH ?)
		ORDER BY sl.created_at DESC
		LIMIT ? OFFSET ?
	`, ftsQuery, limit, offset)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var items []queries.SharedLink
	for rows.Next() {
		var i queries.SharedLink
		if err := rows.Scan(
			&i.ID, &i.Link, &i.Name, &i.Protocol, &i.Server, &i.Port,
			&i.IsDead, &i.LastSuccessAt, &i.CreatedAt, &i.UpdatedAt,
		); err != nil {
			return nil, err
		}
		items = append(items, i)
	}
	return items, rows.Err()
}

// SearchLinksFTSCount counts search results using FTS5
func (db *DB) SearchLinksFTSCount(ctx context.Context, query string) (int64, error) {
	ftsQuery := formatFTSQuery(query)

	var count int64
	err := db.QueryRowContext(ctx, `
		SELECT COUNT(*) FROM links_fts WHERE links_fts MATCH ?
	`, ftsQuery).Scan(&count)
	return count, err
}

// SearchLinksInGroupFTS searches links within a group using FTS5
func (db *DB) SearchLinksInGroupFTS(ctx context.Context, groupID int64, query string, limit, offset int64) ([]queries.SharedLink, error) {
	ftsQuery := formatFTSQuery(query)

	rows, err := db.QueryContext(ctx, `
		SELECT sl.id, sl.link, sl.name, sl.protocol, sl.server, sl.port,
		       sl.is_dead, sl.last_success_at, sl.created_at, sl.updated_at
		FROM shared_links sl
		JOIN link_groups lg ON sl.id = lg.link_id
		WHERE lg.group_id = ?
		AND sl.id IN (SELECT rowid FROM links_fts WHERE links_fts MATCH ?)
		ORDER BY lg.position, sl.id
		LIMIT ? OFFSET ?
	`, groupID, ftsQuery, limit, offset)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var items []queries.SharedLink
	for rows.Next() {
		var i queries.SharedLink
		if err := rows.Scan(
			&i.ID, &i.Link, &i.Name, &i.Protocol, &i.Server, &i.Port,
			&i.IsDead, &i.LastSuccessAt, &i.CreatedAt, &i.UpdatedAt,
		); err != nil {
			return nil, err
		}
		items = append(items, i)
	}
	return items, rows.Err()
}

// SearchLinksInGroupFTSCount counts search results within a group using FTS5
func (db *DB) SearchLinksInGroupFTSCount(ctx context.Context, groupID int64, query string) (int64, error) {
	ftsQuery := formatFTSQuery(query)

	var count int64
	err := db.QueryRowContext(ctx, `
		SELECT COUNT(*) FROM link_groups lg
		WHERE lg.group_id = ?
		AND lg.link_id IN (SELECT rowid FROM links_fts WHERE links_fts MATCH ?)
	`, groupID, ftsQuery).Scan(&count)
	return count, err
}

// SearchGroupsFTS searches groups using FTS5
func (db *DB) SearchGroupsFTS(ctx context.Context, query string, limit, offset int64) ([]queries.Group, error) {
	ftsQuery := formatFTSQuery(query)

	rows, err := db.QueryContext(ctx, `
		SELECT g.id, g.name, g.created_at
		FROM groups g
		WHERE g.id IN (SELECT rowid FROM groups_fts WHERE groups_fts MATCH ?)
		ORDER BY g.name
		LIMIT ? OFFSET ?
	`, ftsQuery, limit, offset)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var items []queries.Group
	for rows.Next() {
		var i queries.Group
		if err := rows.Scan(&i.ID, &i.Name, &i.CreatedAt); err != nil {
			return nil, err
		}
		items = append(items, i)
	}
	return items, rows.Err()
}

// SearchGroupsFTSCount counts group search results using FTS5
func (db *DB) SearchGroupsFTSCount(ctx context.Context, query string) (int64, error) {
	ftsQuery := formatFTSQuery(query)

	var count int64
	err := db.QueryRowContext(ctx, `
		SELECT COUNT(*) FROM groups_fts WHERE groups_fts MATCH ?
	`, ftsQuery).Scan(&count)
	return count, err
}

// formatFTSQuery converts a user query into FTS5 query syntax
// Supports prefix matching (e.g., "tok*") for partial word matches
func formatFTSQuery(query string) string {
	query = strings.TrimSpace(query)
	if query == "" {
		return ""
	}

	// Split into terms and add prefix matching for each
	terms := strings.Fields(query)
	for i, term := range terms {
		// Escape special FTS5 characters
		term = strings.ReplaceAll(term, `"`, `""`)
		// Add prefix matching with * for partial matches
		terms[i] = `"` + term + `"*`
	}

	// Join with AND for all terms must match
	return strings.Join(terms, " ")
}
