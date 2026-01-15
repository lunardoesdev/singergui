-- Healthcheck measurements

-- name: InsertHealthcheck :exec
INSERT INTO healthcheck_measurements (link_id, success, error_message)
VALUES (?, ?, ?);

-- name: GetHealthcheckHistory :many
SELECT * FROM healthcheck_measurements
WHERE link_id = ?
ORDER BY measured_at DESC
LIMIT ?;

-- name: GetLatestHealthcheck :one
SELECT * FROM healthcheck_measurements
WHERE link_id = ?
ORDER BY measured_at DESC
LIMIT 1;

-- name: GetHealthcheckStats :one
SELECT
    COUNT(*) AS total,
    SUM(CASE WHEN success = 1 THEN 1 ELSE 0 END) AS successful,
    SUM(CASE WHEN success = 0 THEN 1 ELSE 0 END) AS failed
FROM healthcheck_measurements
WHERE link_id = ?
AND measured_at > datetime('now', '-' || ? || ' days');

-- name: CountHealthchecks :one
SELECT COUNT(*) FROM healthcheck_measurements;

-- name: PurgeOldHealthchecks :execrows
DELETE FROM healthcheck_measurements
WHERE id IN (
    SELECT id FROM healthcheck_measurements
    ORDER BY measured_at DESC
    LIMIT -1 OFFSET ?
);

-- Speed measurements

-- name: InsertSpeedMeasurement :exec
INSERT INTO speed_measurements (link_id, download_speed_bps, upload_speed_bps, success, error_message)
VALUES (?, ?, ?, ?, ?);

-- name: GetSpeedHistory :many
SELECT * FROM speed_measurements
WHERE link_id = ?
ORDER BY measured_at DESC
LIMIT ?;

-- name: GetLatestSpeed :one
SELECT * FROM speed_measurements
WHERE link_id = ?
ORDER BY measured_at DESC
LIMIT 1;

-- name: GetSpeedStats :one
SELECT
    COUNT(*) AS total,
    AVG(CASE WHEN success = 1 THEN download_speed_bps END) AS avg_download,
    MAX(CASE WHEN success = 1 THEN download_speed_bps END) AS max_download,
    AVG(CASE WHEN success = 1 THEN upload_speed_bps END) AS avg_upload
FROM speed_measurements
WHERE link_id = ?
AND measured_at > datetime('now', '-' || ? || ' days');

-- name: CountSpeedMeasurements :one
SELECT COUNT(*) FROM speed_measurements;

-- name: PurgeOldSpeedMeasurements :execrows
DELETE FROM speed_measurements
WHERE id IN (
    SELECT id FROM speed_measurements
    ORDER BY measured_at DESC
    LIMIT -1 OFFSET ?
);

-- Ping measurements

-- name: InsertPingMeasurement :exec
INSERT INTO ping_measurements (link_id, latency_ms, success, error_message)
VALUES (?, ?, ?, ?);

-- name: GetPingHistory :many
SELECT * FROM ping_measurements
WHERE link_id = ?
ORDER BY measured_at DESC
LIMIT ?;

-- name: GetLatestPing :one
SELECT * FROM ping_measurements
WHERE link_id = ?
ORDER BY measured_at DESC
LIMIT 1;

-- name: GetPingStats :one
SELECT
    COUNT(*) AS total,
    AVG(CASE WHEN success = 1 THEN latency_ms END) AS avg_latency,
    MIN(CASE WHEN success = 1 THEN latency_ms END) AS min_latency,
    MAX(CASE WHEN success = 1 THEN latency_ms END) AS max_latency
FROM ping_measurements
WHERE link_id = ?
AND measured_at > datetime('now', '-' || ? || ' days');

-- name: CountPingMeasurements :one
SELECT COUNT(*) FROM ping_measurements;

-- name: PurgeOldPingMeasurements :execrows
DELETE FROM ping_measurements
WHERE id IN (
    SELECT id FROM ping_measurements
    ORDER BY measured_at DESC
    LIMIT -1 OFFSET ?
);
