#!/bin/bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

docker compose run -e web RAILS_ENV=test bundle exec rspec --exclude-pattern "spec/features/**/*_spec.rb" --format progress --color