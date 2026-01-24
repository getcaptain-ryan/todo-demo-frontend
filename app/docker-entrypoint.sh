#!/bin/sh

# Replace environment variables in the built JavaScript files
# This allows runtime configuration instead of build-time
# Note: This script requires GNU sed (available in Alpine Linux base image)

echo "Injecting runtime environment variables..."

# Validate that VITE_API_BASE_URL is set
if [ -z "${VITE_API_BASE_URL}" ]; then
  echo "ERROR: VITE_API_BASE_URL environment variable is not set or is empty"
  echo "Please provide a valid API base URL (e.g., http://localhost:8000/api)"
  exit 1
fi

echo "Using VITE_API_BASE_URL=${VITE_API_BASE_URL}"

# Find all JS files in the assets directory and replace the placeholder
# Using -print to log which files are being modified for debugging
echo "Modifying JavaScript files:"
find /usr/share/nginx/html/assets -type f -name '*.js' -print -exec sed -i \
  "s|VITE_API_BASE_URL_PLACEHOLDER|${VITE_API_BASE_URL}|g" {} \;

echo "Environment variables injected successfully"

# Start nginx
exec nginx -g 'daemon off;'

