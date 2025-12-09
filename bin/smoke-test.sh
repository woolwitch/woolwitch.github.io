#!/bin/bash

# Simple smoke test runner for Wool Witch
# Usage: ./bin/smoke-test.sh [url]
# Examples:
#   ./bin/smoke-test.sh                              # Test localhost (auto-starts server)
#   ./bin/smoke-test.sh https://woolwitch.github.io  # Test production

if [ $# -eq 0 ]; then
  echo "🔍 Running smoke test against localhost (will auto-start dev server)..."
  npm run test:smoke
elif [ "$1" = "prod" ] || [ "$1" = "production" ]; then
  echo "🔍 Running smoke test against production (woolwitch.github.io)..."
  npm run test:smoke:prod
else
  echo "🔍 Running smoke test against $1..."
  BASE_URL="$1" npm run test:smoke
fi