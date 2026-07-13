---
phase: 14
plan: 1
title: Runtime Ruby dependency update summary
status: complete
completed: 2026-05-12
commit: 1b807818
---

# Summary

Updated compatible runtime gems in Docker under Ruby 4.0.3 without crossing the planned major-version boundaries.

## Changes

- Relaxed `pg` from `~> 1.5.4` to `~> 1.6`.
- Updated runtime/support gems:
  - `pg` 1.5.9 -> 1.6.3
  - `puma` 7.1.0 -> 7.2.0
  - `sidekiq` 7.3.6 -> 7.3.10
  - `redis` 5.3.0 -> 5.4.1
  - `redis-client` 0.23.0 -> 0.29.0
  - `rack-attack` 6.7.0 -> 6.8.0
  - `bootsnap` 1.18.4 -> 1.24.3
  - `oj` 3.16.8 -> 3.17.0
  - AWS SDK support gems to current compatible releases
  - `rexml`, `msgpack`, and `ostruct` compatible support updates
- Forced `spec/rails_helper.rb` to set `RAILS_ENV=test` because the Docker web container exports `RAILS_ENV=development`; without this, request specs ran against development CSRF settings.

## Holdbacks

- Ruby runtime held at 4.0.3; 4.0.4 is a separate image/runtime upgrade.
- Rails held at 8.1.3.
- Puma 8, Sidekiq 8, Devise 5, Sentry 6, RSpec Rails 8, Administrate 1, Selenium 4.43, and sqlite3 2.x were held for separate compatibility verification.

## Verification

- `docker compose exec web bundle check` passed.
- `docker compose exec web bundle exec rails runner 'puts Rails.version'` passed and printed `8.1.3`.
- `docker compose exec web bundle exec rspec` passed: 465 examples, 0 failures.
- `docker compose exec web sh -lc 'SECRET_KEY_BASE=build-placeholder DATABASE_URL=postgresql://placeholder/placeholder bundle exec rails assets:precompile'` passed.

Known warnings: Bundler/RubyGems platform constant warnings and existing Rails 8.2 deprecation warnings remain.
