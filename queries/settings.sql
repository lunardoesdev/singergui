-- name: GetSetting :one
SELECT value FROM settings WHERE key = ?;

-- name: GetSettingWithDefault :one
SELECT COALESCE(
    (SELECT value FROM settings WHERE key = ?),
    ?
) AS value;

-- name: SetSetting :exec
INSERT INTO settings (key, value)
VALUES (?, ?)
ON CONFLICT(key) DO UPDATE SET value = excluded.value;

-- name: DeleteSetting :exec
DELETE FROM settings WHERE key = ?;

-- name: GetAllSettings :many
SELECT * FROM settings ORDER BY key;
