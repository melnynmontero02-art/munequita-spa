#!/bin/bash
# Syncs all vars from .env.local to Vercel (production + development)
# Usage: ./sync-env.sh

ENV_FILE=".env.local"

if [ ! -f "$ENV_FILE" ]; then
  echo "Error: $ENV_FILE not found"
  exit 1
fi

echo "Syncing $ENV_FILE to Vercel..."

while IFS= read -r line || [ -n "$line" ]; do
  [[ -z "$line" || "$line" == \#* ]] && continue

  KEY="${line%%=*}"
  VALUE="${line#*=}"

  [[ -z "$KEY" || -z "$VALUE" ]] && continue

  echo "  → $KEY"
  echo "$VALUE" | npx vercel env add "$KEY" production   --force 2>/dev/null | grep -v "^{" | grep -v "^\s" || true
  echo "$VALUE" | npx vercel env add "$KEY" development  --force 2>/dev/null | grep -v "^{" | grep -v "^\s" || true
  echo "$VALUE" | npx vercel env add "$KEY" preview      --force 2>/dev/null | grep -v "^{" | grep -v "^\s" || true

done < "$ENV_FILE"

echo ""
echo "Done! Triggering redeploy..."
npx vercel --prod 2>/dev/null | grep -E "(Production|Aliased|Error)" || true
echo "All variables synced."
