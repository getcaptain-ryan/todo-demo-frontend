#!/bin/sh

# Replace environment variables in the built JavaScript files
# This allows runtime configuration instead of build-time

echo "Injecting runtime environment variables..."

# Find all JS files in the assets directory and replace the placeholder
find /usr/share/nginx/html/assets -type f -name '*.js' -exec sed -i \
  "s|VITE_API_BASE_URL_PLACEHOLDER|${VITE_API_BASE_URL}|g" {} \;

echo "Environment variables injected successfully"
echo "VITE_API_BASE_URL=${VITE_API_BASE_URL}"

# Start nginx
exec nginx -g 'daemon off;'

