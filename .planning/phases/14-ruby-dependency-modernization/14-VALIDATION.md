---
phase: 14
title: Ruby Dependency Modernization Validation
status: complete
created: 2026-05-12
---

# Validation Strategy

## Gates

- `docker compose exec web bundle check`
- `docker compose exec web bundle exec rails runner 'puts Rails.version'`
- `docker compose exec web bundle exec rspec`
- `docker compose exec web bundle exec rake test:unit`
- `docker compose exec web sh -lc 'SECRET_KEY_BASE=build-placeholder DATABASE_URL=postgresql://placeholder/placeholder bundle exec rails assets:precompile'`

## Acceptance

- `Gemfile.lock` resolves under Ruby 4.0.3 in Docker.
- Runtime update group does not break Rails boot.
- Test/development update group does not break RSpec execution.
- Major holdbacks are documented with compatibility reasons.
- No route browser QA is required unless boot/test/precompile failures indicate route-facing behavior changed.
