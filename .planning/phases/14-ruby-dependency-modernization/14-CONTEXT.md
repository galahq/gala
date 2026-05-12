---
phase: 14
title: Ruby Dependency Modernization
status: complete
created: 2026-05-12
requirements:
  - RUBY-01
  - RUBY-02
  - RUBY-03
  - RUBY-04
  - QA-03
---

# Phase 14 Context

## Objective

Modernize compatible Ruby gems in small, verified groups while preserving Rails 8.1, Ruby 4.0.3 container execution, Shakapacker/Webpack behavior, authentication, background jobs, and route behavior.

## Current State

- Host Ruby is 2.6.10 and is not suitable for app Bundler commands.
- Project/container Ruby is 4.0.3.
- Rails is already current at 8.1.3 on RubyGems.
- Shakapacker gem/npm are already aligned at 10.0.0 and should remain aligned.
- Sentry gems are on 5.28.1 under the current `~> 5.24` constraint.
- Docker `bundle outdated --strict --parseable` shows many compatible patch/minor updates and several major candidates.

## Decisions

- Use Docker for all app Ruby commands.
- Keep Ruby runtime at 4.0.3 in this phase. Ruby 4.0.4 is available from ruby-lang.org, but changing the runtime image is a separate image rebuild/deployment concern and is not required by RUBY-01 through RUBY-04.
- Keep major runtime/auth/test jumps out of the update batch:
  - Puma 8
  - Sidekiq 8
  - Devise 5
  - Sentry 6
  - RSpec Rails 8
  - Administrate 1
- Update compatible runtime gems first and verify boot/database/request-sensitive surfaces.
- Update compatible development/test gems second and verify the test suite path.

## Candidate Groups

### Runtime Group

- `pg` from 1.5.9 toward 1.6.3, relaxing the Gemfile constraint from `~> 1.5.4` to `~> 1.6`.
- `puma` from 7.1.0 to 7.2.0 within current major.
- `sidekiq` from 7.3.6 to 7.3.9 within current major.
- `redis` from 5.3.0 to 5.4.1 within current major.
- `rack-attack` from 6.7.0 to 6.8.0.
- Low-risk supporting runtime patches from Bundler resolution, such as `rack-session`, `redis-client`, `rexml`, `oj`, `bootsnap`, and AWS SDK patch/minor updates, are acceptable if pulled by targeted bundle update groups.

### Development/Test Group

- RSpec 3.13 patch gems, while holding `rspec-rails` on 7.x unless Bundler proves a compatible patch.
- `rubocop`/`rubocop-ast`/`rubocop-faker` patch/minor updates.
- `selenium-webdriver` to current 4.x if compatible with the existing `webdrivers` constraint.
- `capybara-screenshot`, `database_cleaner-active_record`, `factory_bot_rails`, and similar test helpers can move in a test-only batch.

## Verification

- `docker compose exec web bundle check`
- `docker compose exec web bundle exec rails runner 'puts Rails.version'`
- `docker compose exec web bundle exec rspec`
- `docker compose exec web bundle exec rake test:unit`
- `docker compose exec web sh -lc 'SECRET_KEY_BASE=build-placeholder DATABASE_URL=postgresql://placeholder/placeholder bundle exec rails assets:precompile'`

## Route QA

Browser route QA is not required unless a gem update changes route-facing behavior or introduces boot/runtime errors. Rails boot, request specs, and asset precompile are the primary gates.
