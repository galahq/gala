---
phase: 14
plan: 2
title: Development and test Ruby dependency update summary
status: complete
completed: 2026-05-12
commit: 278c2acf
---

# Summary

Updated compatible development and test gems in a separate lockfile-only batch after the runtime group passed.

## Changes

- Updated RSpec 3.13 patch gems:
  - `rspec` 3.13.0 -> 3.13.2
  - `rspec-core` 3.13.2 -> 3.13.6
  - `rspec-expectations` 3.13.3 -> 3.13.5
  - `rspec-mocks` 3.13.2 -> 3.13.8
  - `rspec-support` 3.13.2 -> 3.13.7
- Updated test/development helpers:
  - `factory_bot` 6.5.0 -> 6.6.0
  - `factory_bot_rails` 6.4.4 -> 6.5.1
  - `faker` 3.5.1 -> 3.8.0
  - `database_cleaner-active_record` 2.2.0 -> 2.2.2
  - `capybara-screenshot` 1.0.26 -> 1.0.27
- Updated RuboCop tooling:
  - `rubocop` 1.69.2 -> 1.86.1
  - `rubocop-ast` 1.37.0 -> 1.49.1
  - `rubocop-faker` 1.2.0 -> 1.3.0
- Accepted compatible transitive updates including `nokogiri`, `parser`, `public_suffix`, `parallel`, `diff-lcs`, and `json`.

## Holdbacks

- `rspec-rails` held at 7.1.0 because 8.x is a major compatibility step.
- Selenium held because `webdrivers` constrains `selenium-webdriver` below newer 4.x releases.

## Verification

- `docker compose exec web bundle check` passed.
- `docker compose exec web bundle exec rspec` passed: 465 examples, 0 failures.
- `docker compose exec web bundle exec rake test:unit` passed: 465 examples, 0 failures.

Known warnings: Bundler/RubyGems platform constant warnings and existing Rails 8.2 deprecation warnings remain.
