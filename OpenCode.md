# OpenCode Agent Guidelines for This Repository

## Build & Test Commands
- **Setup**: `bundle install && yarn install`
- **Run all tests**: `--exclude-pattern "spec/features/**/*_spec.rb" --format progress --color`
- **Run single test file**: `bundle exec rspec path/to/spec/my_spec.rb`
- **Run single test (by line)**: `bundle exec rspec path/to/spec/my_spec.rb:NN`
- **Lint Ruby**: `bundle exec rubocop`
- **Lint CSS**: `npx stylelint '**/*.{css,scss,sass}'`

## Code Style Guidelines
- **Imports**: Use idiomatic `require` for Ruby, ES6 `import`/`export` for JS.
- **Formatting**: Ruby - 2-space indent, single quotes unless interpolation; JS/JSX - follow Prettier (2 space, trailing commas, single quotes where valid).
- **Types**: Prefer built-in Ruby/JS types; use clear migration annotations in models and strong params in controllers.
- **Naming**: snake_case for Ruby methods/vars, CamelCase for classes, camelCase for JS variables/functions.
- **Error Handling**: Use idiomatic `begin/rescue` in Ruby, try/catch in JS. Surface user-facing errors, log unexpected server/infra errors.
- **Specs**: Use RSpec for all new Ruby tests. Organize in `spec/`, use `describe/context/it` blocks.
- **Other**: Avoid putting business logic in controllers; prefer service or model classes. Write comments for non-obvious code sections.
- **Frontend**: Use functional React components, hooks preferred over classes; organize by feature when practical.

Additions or changes? Update this file. 🤖
