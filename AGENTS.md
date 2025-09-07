# AGENTS playbook for this repo

## Init
- Copy and load env: `cp .env.dev .env && direnv allow`【F:.envrc†L1-L5】
- Use Procfile.dev via Foreman: `bundle exec foreman start -f Procfile.dev`【F:.foreman†L1】【F:Procfile.dev†L1-L3】
- Install system deps: `libjemalloc2` from Aptfile【F:Aptfile†L1】
- (Optional) Enable jemalloc tuning in .profile【F:.profile†L1-L6】

## Build & Run
- Dev: `docker compose up --build`【F:Dockerfile†L1-L66】【F:docker-compose.yml†L1-L33】
- Stop: `docker compose down`
- Container commands: `docker compose run web [command]`

## Database
- Schema init via mounting db/structure.sql on new volume【F:docker-compose.yml†L47-L49】
- Seed from Heroku dump: see docs/seeds.md

## Tests & Lint
- Ruby tests: `bundle exec rspec --exclude-pattern "spec/features/**/*_spec.rb" --format progress --color`
- JS tests: `yarn test`
- Lint Ruby: `bundle exec rubocop`
- Lint JS: `eslint`
- Format: `prettier`

## Code style
- Ruby: RuboCop (.rubocop.yml). Rails 7, Ruby 3.2. Prefer literal lambdas (->), follow Layout/ClassStructure ordering; long blocks allowed in spec/. Each new Rails app file starts with `# frozen_string_literal: true`
- JS: ESLint (.eslintrc.json) with standard + react + flowtype + jsx-a11y. No semicolons; single quotes; trailing commas where allowed; props sorted (callbacks last, shorthand first); prefer stateless/ES6 classes; Flow annotations required per file (`/* @flow */`).
- Formatting: Prettier (.prettierrc.json) printWidth 80, semi: false, singleQuote: true, trailingComma: es5.
- Types: Flow for frontend; PropTypes disabled. Ruby types by convention; keep POROs small and explicit.
- Imports: One per module; avoid duplicate imports; prefer absolute app/javascript paths consistent with webpacker config.
- Naming: snake_case in Ruby; camelCase in JS; PascalCase for React components; predicates end with ? in Ruby; bang methods when mutating.
- Errors: Prefer service objects and early returns. Rescue narrowly; avoid rescue modifier. Use Sentry (sentry-raven) for reporting; do not swallow exceptions.
- Tests: RSpec/Capybara for Rails; Jest/RTL for JS. Make specs deterministic and idempotent; use rspec-retry sparingly. Feature and system tests are disabled for now.

## Ignored files
- See [.dockerignore], [.gitignore], [.cursorignore]

## Docs
- Project docs: docs/

No Cursor or Copilot instruction files are present at this time.
