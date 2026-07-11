#!/bin/sh
set -e

echo "=== ATS Resume Optimizer ==="

# Ensure persistent volume directories exist
mkdir -p /data/storage

# Symlink storage directory to the Fly volume
if [ ! -L /app/.storage ] && [ ! -d /app/.storage ]; then
  ln -sf /data/storage /app/.storage
  echo "Storage linked to volume"
fi

# Run Prisma database push — creates tables if they don't exist
echo "Running database setup (prisma db push)..."
cd /app
npx prisma db push --skip-generate --accept-data-loss 2>&1
echo "Database ready"

echo "Starting server on port ${PORT:-3000}..."
exec node server.js
