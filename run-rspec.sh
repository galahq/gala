#!/bin/bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$ROOT_DIR"

TEST_DATABASE_URL="${TEST_DATABASE_URL:-postgres://gala:alpine@db:5432/gala_test}"
RSPEC_ARGS=("--exclude-pattern" "spec/features/**/*_spec.rb" "--format" "progress" "--color")

if [[ "$#" -gt 0 ]]; then
  RSPEC_ARGS=("${RSPEC_ARGS[@]}" "$@")
fi

if [[ "${SKIP_DB_PREPARE:-0}" != "1" ]]; then
  RESTORE_DB_SNAPSHOTS=false docker compose run --rm -e RAILS_ENV=test -e DATABASE_URL="$TEST_DATABASE_URL" web bundle exec rails db:prepare
fi

RESTORE_DB_SNAPSHOTS=false docker compose run --rm -e RAILS_ENV=test -e DATABASE_URL="$TEST_DATABASE_URL" web bundle exec rspec "${RSPEC_ARGS[@]}"
