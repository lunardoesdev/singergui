-- name: GetAllSubscriptions :many
SELECT * FROM subscriptions ORDER BY created_at DESC;

-- name: GetEnabledSubscriptions :many
SELECT * FROM subscriptions WHERE enabled = 1 ORDER BY created_at DESC;

-- name: GetSubscriptionByID :one
SELECT * FROM subscriptions WHERE id = ?;

-- name: GetSubscriptionByURL :one
SELECT * FROM subscriptions WHERE url = ?;

-- name: SubscriptionExists :one
SELECT EXISTS(SELECT 1 FROM subscriptions WHERE url = ?) AS sub_exists;

-- name: CreateSubscription :one
INSERT INTO subscriptions (url, name, enabled)
VALUES (?, ?, ?)
RETURNING *;

-- name: UpdateSubscription :exec
UPDATE subscriptions
SET name = ?, enabled = ?
WHERE id = ?;

-- name: UpdateSubscriptionLastUpdated :exec
UPDATE subscriptions
SET last_updated_at = CURRENT_TIMESTAMP, last_error = NULL
WHERE id = ?;

-- name: UpdateSubscriptionError :exec
UPDATE subscriptions
SET last_error = ?
WHERE id = ?;

-- name: DeleteSubscription :exec
DELETE FROM subscriptions WHERE id = ?;

-- name: IncrementRequestCount :exec
UPDATE subscriptions
SET request_count = request_count + 1
WHERE id = ?;

-- name: ResetRequestCount :exec
UPDATE subscriptions
SET request_count = 0, request_count_reset_at = CURRENT_TIMESTAMP
WHERE id = ?;

-- name: GetSubscriptionsNeedingReset :many
SELECT * FROM subscriptions
WHERE request_count_reset_at < datetime('now', '-1 hour');

-- name: CanMakeRequest :one
SELECT request_count < ? AS can_request FROM subscriptions WHERE id = ?;
