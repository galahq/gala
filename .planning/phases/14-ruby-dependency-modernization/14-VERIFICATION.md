---
phase: 14
title: Ruby Dependency Modernization Verification
status: complete
completed: 2026-05-12
---

# Verification

## Runtime Batch

- Commit: `1b807818`
- `docker compose exec web bundle check` passed.
- `docker compose exec web bundle exec rails runner 'puts Rails.version'` passed and printed `8.1.3`.
- `docker compose exec web bundle exec rspec` passed: 465 examples, 0 failures.
- `docker compose exec web sh -lc 'SECRET_KEY_BASE=build-placeholder DATABASE_URL=postgresql://placeholder/placeholder bundle exec rails assets:precompile'` passed.

## Development/Test Batch

- Commit: `278c2acf`
- `docker compose exec web bundle check` passed.
- `docker compose exec web bundle exec rspec` passed: 465 examples, 0 failures.
- `docker compose exec web bundle exec rake test:unit` passed: 465 examples, 0 failures.

## Notes

- Browser route QA was not required for this phase because the changes were dependency/test bootstrap changes and automated boot/test/precompile gates passed.
- The RSpec bootstrap now forces `RAILS_ENV=test`; Docker exports `RAILS_ENV=development`, and the previous `||=` bootstrap allowed request specs to run with development CSRF behavior.
- Major holdbacks remain documented in `14-RESEARCH.md` and the plan summaries.
- Known warnings remain: Bundler/RubyGems platform constant redefinition warnings and Rails 8.2 deprecation warnings for `to_time_preserves_timezone`, open redirect config, and legacy route hash arguments.
