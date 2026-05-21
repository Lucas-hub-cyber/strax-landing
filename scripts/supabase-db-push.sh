#!/usr/bin/env sh
set -eu

if [ -f .env ]; then
  set -a
  . ./.env
  set +a
fi

dry_run_flag=""
if [ "${1:-}" = "--dry-run" ]; then
  dry_run_flag="--dry-run"
fi

if [ -z "${NEXT_SUPABASE_ACCESS_TOKEN:-}" ]; then
  echo "Missing NEXT_SUPABASE_ACCESS_TOKEN in .env" >&2
  exit 1
fi

if [ -n "${NEXT_SUPABASE_DB_URL:-}" ]; then
  SUPABASE_ACCESS_TOKEN="$NEXT_SUPABASE_ACCESS_TOKEN" \
    npm exec --yes --package supabase -- \
    supabase db push --db-url "$NEXT_SUPABASE_DB_URL" $dry_run_flag
  exit 0
fi

if [ -z "${NEXT_SUPABASE_DB_PASSWORD:-}" ]; then
  echo "Missing NEXT_SUPABASE_DB_PASSWORD or NEXT_SUPABASE_DB_URL in .env" >&2
  exit 1
fi

SUPABASE_ACCESS_TOKEN="$NEXT_SUPABASE_ACCESS_TOKEN" \
  npm exec --yes --package supabase -- \
  supabase db push --linked --password "$NEXT_SUPABASE_DB_PASSWORD" $dry_run_flag
