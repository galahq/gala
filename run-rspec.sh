#!/bin/bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

RESTORE_DB_SNAPSHOTS=false docker compose run -e RAILS_ENV=test web bundle exec rspec --exclude-pattern "spec/features/**/*_spec.rb" --format progress --color
