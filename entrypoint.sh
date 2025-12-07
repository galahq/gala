#!/bin/bash
set -euo pipefail

export LD_PRELOAD="${LD_PRELOAD:-}"
export MALLOC_CONF="${MALLOC_CONF:-}"

APP_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SEED_SENTINEL="$APP_ROOT/tmp/.docker_dev_seeded"

log() {
  echo "[entrypoint] $*"
}

# enable jemalloc for reduced memory usage and latency.
if ls /usr/lib/*/libjemalloc.so.2 >/dev/null 2>&1; then
  export LD_PRELOAD="$(echo /usr/lib/*/libjemalloc.so.2) $LD_PRELOAD"
  export MALLOC_CONF="dirty_decay_ms:1000,narenas:2,background_thread:true,stats_print:false"
fi

if [ "${RAILS_ENV:-development}" = "development" ]; then
  mkdir -p "$(dirname "$SEED_SENTINEL")"

  if [ ! -f "$SEED_SENTINEL" ]; then
    log "Seed sentinel not found; checking whether the database needs seeds"
    if bundle exec rails runner 'exit(Case.exists? ? 0 : 1)'; then
      log "Database already contains Case records; skipping seeds"
      touch "$SEED_SENTINEL"
    else
      log "Database empty; running one-time seed setup"
      bundle exec rails db:environment:set
      bundle exec rails db:seed
      bundle exec rails db:test:prepare
      bundle exec rake indices:refresh
      touch "$SEED_SENTINEL"
      log "Seed data created (sentinel stored at $SEED_SENTINEL)"
    fi
  else
    log "Seed sentinel present; skipping seed tasks"
  fi
fi

rm -f tmp/pids/server.pid

exec "$@"