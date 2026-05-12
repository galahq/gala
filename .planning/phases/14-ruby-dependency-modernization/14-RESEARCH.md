---
phase: 14
title: Ruby Dependency Modernization Research
status: complete
created: 2026-05-12
---

# Research

## Registry Checks

Rechecked against official sources on 2026-05-12:

| Package | Installed | Latest Registry | Phase 14 Target |
| --- | ---: | ---: | --- |
| Ruby | 4.0.3 | 4.0.4 | Hold runtime; document candidate |
| Rails | 8.1.3 | 8.1.3 | Hold current |
| Puma | 7.1.0 | 8.0.1 on RubyGems, 7.2.0 under current constraints | Update to 7.2.x, hold 8.x |
| Sidekiq | 7.3.6 | 8.1.4 on RubyGems, 7.3.9 under current constraints | Update to 7.3.9, hold 8.x |
| pg | 1.5.9 | 1.6.3 | Relax to `~> 1.6` and update |
| redis | 5.3.0 | 5.4.1 | Update within 5.x |
| Sentry gems | 5.28.1 | 6.5.0 | Hold 5.x |
| Devise | 4.9.4 | 5.0.4 | Hold 4.x |
| RSpec Rails | 7.1.0 | 8.0.4 | Hold 7.x |
| Capybara | 3.40.0 | 3.40.0 | Hold current |
| Selenium WebDriver | 4.10.0 | 4.43.0 | Candidate if compatible with `webdrivers` |
| rack-attack | 6.7.0 | 6.8.0 | Update |
| rack-timeout | 0.7.0 | 0.7.0 | Hold current |
| sprockets-rails | 3.5.2 | 3.5.2 | Hold current |
| sqlite3 | 1.6.9 | 2.9.4 | Hold 1.6.x due Gemfile constraint |
| Administrate | 0.17.0 | 1.0.0 | Hold major |

Sources:

- Ruby downloads page: `https://www.ruby-lang.org/en/downloads/`
- RubyGems API: `https://rubygems.org/api/v1/gems/<gem>.json`
- Docker Bundler audit: `docker compose exec web sh -lc 'bundle outdated --strict --parseable'`

## Local Constraints

- App commands must run in Docker because host Ruby is 2.6.10.
- `webdrivers` currently constrains Selenium to `< 4.11`, so Selenium 4.43 may require either holding `webdrivers` or removing/updating that integration in a later browser tooling phase.
- `sqlite3` is constrained to `~> 1.6.0`; the 2.x major should not be mixed into this phase.
- Major updates for server, jobs, auth, monitoring, and RSpec Rails have wider behavioral blast radius and should not be combined with broad patch/minor updates.

## Proposed Execution

1. Runtime patch/minor update:
   - `bundle update pg puma sidekiq redis rack-attack rack-session redis-client bootsnap rexml oj aws-sdk-s3 aws-sdk-core aws-sdk-kms aws-eventstream aws-partitions aws-sigv4`
   - Adjust `pg` constraint to `~> 1.6`.
   - Keep Puma and Sidekiq Gemfile constraints on current major.

2. Development/test patch/minor update:
   - `bundle update rspec rspec-core rspec-expectations rspec-mocks rspec-support rubocop rubocop-ast rubocop-faker capybara-screenshot database_cleaner-active_record factory_bot factory_bot_rails faker`
   - Try Selenium only if `webdrivers` compatibility permits; otherwise document hold.

3. Verify each group before proceeding.
