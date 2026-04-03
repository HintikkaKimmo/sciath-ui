#!/usr/bin/env bash
# Generate TypeScript types from Django OpenAPI schema.
#
# Usage:
#   npm run generate-types                     # uses local Django at localhost:8000
#   DJANGO_API_URL=https://api.sciath.io npm run generate-types

set -euo pipefail

DJANGO_API_URL="${DJANGO_API_URL:-http://localhost:8000}"
SCHEMA_URL="${DJANGO_API_URL}/api/openapi.json"
OUT_FILE="src/lib/api-types.ts"

echo "Fetching OpenAPI schema from ${SCHEMA_URL}..."
if ! curl -sf "${SCHEMA_URL}" -o /tmp/sciath-openapi.json; then
  echo "Could not reach ${SCHEMA_URL}. Falling back to local schema file..."
  if [ -f "openapi.json" ]; then
    cp openapi.json /tmp/sciath-openapi.json
  else
    echo "No schema available. Place openapi.json in project root or start Django."
    exit 1
  fi
fi

echo "Generating types..."
npx openapi-typescript /tmp/sciath-openapi.json -o "${OUT_FILE}"
echo "Types written to ${OUT_FILE}"
