#!/bin/sh
# =============================================================================
# PostgreSQL Database Initialization Script
#
# This script is mounted into the postgres container as an init script.
# It runs ONCE when the container is created for the first time.
# Subsequent starts skip this script (the data volume persists).
#
# Usage: Mount this file into /docker-entrypoint-initdb.d/
# =============================================================================

set -e

echo "──────────────────────────────────────────────────"
echo "  OmniSpace — Initializing PostgreSQL Database..."
echo "──────────────────────────────────────────────────"

# Create the application database if it doesn't exist
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
    -- Create the omnispace database (if using a separate DB)
    -- This is usually handled by POSTGRES_DB env var, but kept here
    -- for explicitness in multi-database setups.

    -- Enable useful extensions
    CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
    CREATE EXTENSION IF NOT EXISTS "pg_stat_statements";

    -- Set timezone
    SET timezone = 'UTC';

    GRANT ALL PRIVILEGES ON DATABASE "$POSTGRES_DB" TO "$POSTGRES_USER";
EOSQL

echo "[init-db] Database initialized successfully ✓"
echo "──────────────────────────────────────────────────"
