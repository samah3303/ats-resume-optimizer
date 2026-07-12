#!/bin/sh
set -e

echo "=== ATS Resume Optimizer ==="
echo "Starting server on port ${PORT:-3000}..."
exec node server.js
