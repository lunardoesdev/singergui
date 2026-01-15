-- name: GetAllGroups :many
SELECT * FROM groups ORDER BY name;

-- name: GetGroupsPaginated :many
SELECT * FROM groups ORDER BY name LIMIT ? OFFSET ?;

-- name: GetGroupByID :one
SELECT * FROM groups WHERE id = ?;

-- name: GetGroupByName :one
SELECT * FROM groups WHERE name = ?;

-- name: CreateGroup :one
INSERT INTO groups (name) VALUES (?) RETURNING *;

-- name: UpdateGroupName :exec
UPDATE groups SET name = ? WHERE id = ?;

-- name: DeleteGroup :exec
DELETE FROM groups WHERE id = ?;

-- name: CountGroups :one
SELECT COUNT(*) FROM groups;

-- name: GetGroupLinkCount :one
SELECT COUNT(*) FROM link_groups WHERE group_id = ?;
