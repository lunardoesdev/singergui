-- name: GetAllLinks :many
SELECT * FROM shared_links
ORDER BY created_at DESC
LIMIT ? OFFSET ?;

-- name: GetAllLinkIDs :many
SELECT id FROM shared_links
ORDER BY created_at DESC
LIMIT ? OFFSET ?;

-- name: GetLinkIDsForGroup :many
SELECT sl.id FROM shared_links sl
JOIN link_groups lg ON sl.id = lg.link_id
WHERE lg.group_id = ?
ORDER BY lg.position, sl.id
LIMIT ? OFFSET ?;

-- name: GetAllLinksCount :one
SELECT COUNT(*) FROM shared_links;

-- name: GetLinksForGroup :many
SELECT sl.* FROM shared_links sl
JOIN link_groups lg ON sl.id = lg.link_id
WHERE lg.group_id = ?
ORDER BY lg.position, sl.id
LIMIT ? OFFSET ?;

-- name: GetLinksCountForGroup :one
SELECT COUNT(*) FROM link_groups WHERE group_id = ?;

-- name: GetLinkByID :one
SELECT * FROM shared_links WHERE id = ?;

-- name: GetLinkByURL :one
SELECT * FROM shared_links WHERE link = ?;

-- name: LinkExists :one
SELECT EXISTS(SELECT 1 FROM shared_links WHERE link = ?) AS link_exists;

-- name: CreateLink :one
INSERT INTO shared_links (link, name, protocol, server, port)
VALUES (?, ?, ?, ?, ?)
RETURNING *;

-- name: UpdateLink :exec
UPDATE shared_links
SET name = ?, updated_at = CURRENT_TIMESTAMP
WHERE id = ?;

-- name: DeleteLink :exec
DELETE FROM shared_links WHERE id = ?;

-- name: DeleteLinks :exec
DELETE FROM shared_links WHERE id IN (sqlc.slice('ids'));

-- name: MarkLinkDead :exec
UPDATE shared_links
SET is_dead = 1, updated_at = CURRENT_TIMESTAMP
WHERE id = ?;

-- name: MarkLinkAlive :exec
UPDATE shared_links
SET is_dead = 0, last_success_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
WHERE id = ?;

-- name: UpdateLastSuccess :exec
UPDATE shared_links
SET last_success_at = CURRENT_TIMESTAMP, is_dead = 0, updated_at = CURRENT_TIMESTAMP
WHERE id = ?;

-- name: GetDeadCandidates :many
SELECT id, link FROM shared_links
WHERE is_dead = 0
AND (last_success_at IS NULL OR last_success_at < datetime('now', '-' || CAST(? AS TEXT) || ' days'));

-- name: GetDeadLinks :many
SELECT * FROM shared_links WHERE is_dead = 1;

-- name: DeleteDeadLinks :execrows
DELETE FROM shared_links WHERE is_dead = 1;

-- name: CountDeadLinks :one
SELECT COUNT(*) FROM shared_links WHERE is_dead = 1;

-- name: AddLinkToGroup :exec
INSERT OR IGNORE INTO link_groups (link_id, group_id, position) VALUES (?, ?, ?);

-- name: RemoveLinkFromGroup :exec
DELETE FROM link_groups WHERE link_id = ? AND group_id = ?;

-- name: RemoveLinksFromGroup :exec
DELETE FROM link_groups WHERE link_id IN (sqlc.slice('link_ids')) AND group_id = ?;

-- name: MoveLinkToGroup :exec
INSERT OR REPLACE INTO link_groups (link_id, group_id, position) VALUES (?, ?, ?);

-- name: GetLinkGroups :many
SELECT g.* FROM groups g
JOIN link_groups lg ON g.id = lg.group_id
WHERE lg.link_id = ?;

-- name: IsLinkInAnyGroup :one
SELECT EXISTS(SELECT 1 FROM link_groups WHERE link_id = ?) AS in_group;

-- name: GetMaxPositionInGroup :one
SELECT CAST(COALESCE(MAX(position), 0) AS INTEGER) AS max_pos FROM link_groups WHERE group_id = ?;

-- name: SearchLinks :many
SELECT * FROM shared_links
WHERE name LIKE ? OR link LIKE ? OR server LIKE ?
ORDER BY created_at DESC
LIMIT ?;

-- FTS5 queries are implemented directly in Go (internal/database/search.go)
-- because sqlc doesn't support FTS5 virtual tables
