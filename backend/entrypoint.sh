#!/bin/sh
# =============================================================================
# OmniSpace Backend — Docker Entrypoint Script
#
# Runs database migrations (safe for production: `migrate deploy` not `dev`),
# then starts the compiled NestJS application.
#
# Why `migrate deploy` instead of `migrate dev`?
#   - `migrate dev` is for development only (generates migration files).
#   - `migrate deploy` applies existing migrations without generating new ones.
#     It is idempotent and safe to run on every container start.
# =============================================================================

set -e  # Exit immediately if any command fails

echo "──────────────────────────────────────────────────"
echo "  OmniSpace Backend — Starting..."
echo "──────────────────────────────────────────────────"

# ── Wait for PostgreSQL to be ready ──────────────────────────────────────────
echo "[entrypoint] Waiting for PostgreSQL to be ready..."

MAX_RETRIES=30
RETRY_COUNT=0

until npx prisma db execute --stdin <<EOF 2>/dev/null
SELECT 1;
EOF
do
  RETRY_COUNT=$((RETRY_COUNT + 1))
  if [ "$RETRY_COUNT" -ge "$MAX_RETRIES" ]; then
    echo "[entrypoint] ERROR: PostgreSQL did not become ready in time. Exiting."
    exit 1
  fi
  echo "[entrypoint] PostgreSQL not ready yet (attempt $RETRY_COUNT/$MAX_RETRIES). Retrying in 2s..."
  sleep 2
done

echo "[entrypoint] PostgreSQL is ready ✓"

# ── Run Prisma Migrations ─────────────────────────────────────────────────────
echo "[entrypoint] Running database migrations..."
npx prisma migrate deploy
echo "[entrypoint] Migrations complete ✓"

# ── Start the Application ─────────────────────────────────────────────────────
echo "[entrypoint] Starting NestJS application..."
echo "──────────────────────────────────────────────────"

exec node dist/src/main