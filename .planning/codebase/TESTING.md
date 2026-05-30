# Testing Patterns

**Analysis Date:** 2026-05-30

## Test Framework

**Runner:**
- RSpec `3.13.2` with `rspec-rails` `7.1.0` for Rails tests.
  - Config: `.rspec`, `spec/spec_helper.rb`, `spec/rails_helper.rb`
  - Rake wrapper: `lib/tasks/tests.rake`
- Jest `24.9.0` with `babel-jest` `24.9.0` for frontend JavaScript and React tests.
  - Config: `jest.config.js`
  - Setup: `spec/support/jest-setup.js`
- Playwright Test `1.60.0` for visual route coverage.
  - Config: `playwright.config.mjs`
  - Specs: `tests/visual/visual-routes.spec.mjs`
- Vitest `4.1.6` exists only as a spike command in `package.json`; it is not the normal app test runner.

**Assertion Library:**
- RSpec expectations and mocks from `spec/spec_helper.rb`.
- Pundit permission matchers through `pundit/rspec` in `spec/spec_helper.rb`, used by specs such as `spec/policies/case_policy_spec.rb`.
- Shoulda Matchers configured in `spec/rails_helper.rb`.
- `rspec-composable_json_matchers` configured in `spec/rails_helper.rb`, used by request specs such as `spec/requests/wikidata_sparql_routes_spec.rb`.
- Jest `expect`, `jest-dom`, and `react-testing-library`, configured through `spec/support/jest-setup.js`.
- Playwright `test` and `expect` in `tests/visual/visual-routes.spec.mjs`.

**Run Commands:**
```bash
bundle exec rake test:unit
bundle exec rspec spec/requests/catalog_routes_spec.rb
docker compose run -e RAILS_ENV=test web bundle exec rspec spec/requests/catalog_routes_spec.rb --format progress --color
pnpm test -- --runInBand
pnpm exec jest app/javascript/stats/__tests__/StatsPage.test.jsx --runInBand
pnpm test:visual
pnpm test:visual:update
```

Use Docker Compose for Rails specs when the host Ruby, database, or browser-driver environment is not aligned with `.ruby-version`, `mise.toml`, and `docker-compose.yml`.

## Test File Organization

**Location:**
- Rails tests live under `spec/` by type: `spec/models/`, `spec/requests/`, `spec/controllers/`, `spec/features/`, `spec/policies/`, `spec/services/`, `spec/jobs/`, `spec/mailboxes/`, `spec/decorators/`, and `spec/serializers/`.
- Rails factories live under `spec/factories/`, with support helpers in `spec/support/`.
- Frontend tests are colocated under feature-level `__tests__` directories in `app/javascript/`: `app/javascript/stats/__tests__/`, `app/javascript/shared/__tests__/`, `app/javascript/reading_list/__tests__/`, and `app/javascript/redux/reducers/__tests__/`.
- Visual tests live outside `app/` in `tests/visual/`, with helper code in `tests/visual/visual-route-helpers.mjs` and noise rules in `tests/visual/noise-allowlist.json`.
- No Rails Minitest files are present under `test/`.

**Naming:**
- Rails spec files end in `_spec.rb`: `spec/services/case_stats_service_spec.rb`, `spec/requests/catalog_routes_spec.rb`, `spec/policies/case_policy_spec.rb`.
- JavaScript test files end in `.test.js` or `.test.jsx`: `app/javascript/shared/__tests__/orchard.test.js`, `app/javascript/stats/__tests__/DatePicker.test.jsx`.
- Visual specs end in `.spec.mjs`: `tests/visual/visual-routes.spec.mjs`.

**Structure:**
```text
spec/
├── factories/          # FactoryBot factories
├── support/            # RSpec and integration helpers
├── requests/           # Route and HTTP behavior specs
├── features/           # Capybara/Selenium browser specs
├── models/             # ActiveRecord/domain specs
├── policies/           # Pundit permission specs
└── services/           # Service object specs

app/javascript/<feature>/__tests__/
└── <Unit>.test.js[x]   # Jest tests colocated with frontend feature code

tests/visual/
├── visual-routes.spec.mjs
├── visual-route-helpers.mjs
└── noise-allowlist.json
```

## Test Structure

**Suite Organization:**
```ruby
# spec/services/case_stats_service/query_spec.rb
require 'rails_helper'

RSpec.describe CaseStatsService::Query do
  let(:kase) { create(:case) }
  let(:reader) { create(:reader) }
  let(:time_range) do
    {
      from_time: 1.week.ago.beginning_of_day,
      to_time: Time.current.end_of_day
    }
  end

  subject(:query) { described_class.new(kase, time_range) }

  describe '#execute' do
    context 'with no events' do
      it 'returns empty array' do
        expect(query.execute).to eq([])
      end
    end
  end
end
```

```javascript
// app/javascript/reading_list/__tests__/HiddenFormInputs.test.jsx
import HiddenFormInputs from '../HiddenFormInputs'
import * as React from 'react'
import { render } from 'react-testing-library'

describe('HiddenFormInputs', () => {
  it('has the right form values for nested reading list item attributes', () => {
    const items = [{ caseSlug: 'mi-wolves', notes: 'Cool!', param: '' }]
    const form = renderForm(
      <HiddenFormInputs initialItems={[]} items={items} />
    )

    expect(form).toHaveFormValues({
      'reading_list[reading_list_items_attributes][0][case_slug]': 'mi-wolves',
    })
  })
})
```

**Patterns:**
- Require `rails_helper` for Rails specs that need the app, database, factories, Devise helpers, Pundit, Capybara, or ActiveJob helpers. Examples: `spec/requests/catalog_routes_spec.rb`, `spec/services/case_stats_service_spec.rb`.
- Use `spec_helper` only indirectly through `.rspec`; `spec/rails_helper.rb` requires it for Rails specs.
- Use `let`, `subject`, `before`, `describe`, and `context` for RSpec organization. Keep behavior descriptions user/domain-facing.
- Prefer request specs for route coverage and response semantics. Route-group examples include `spec/requests/catalog_routes_spec.rb`, `spec/requests/admin_operations_routes_spec.rb`, and `spec/requests/wikidata_sparql_routes_spec.rb`.
- Use feature specs for full browser workflows with Capybara helpers from `spec/support/integration/authentication.rb`, such as `spec/features/creating_a_reading_list_spec.rb`.
- Use pure Jest tests for reducers, selectors, helpers, DOM side-effect bridges, and React rendering. Examples: `app/javascript/stats/__tests__/statsStore.test.js`, `app/javascript/shared/__tests__/blueprintLegacyNamespace.test.js`, and `app/javascript/redux/reducers/__tests__/cards.test.js`.
- Playwright visual tests build route coverage from `config/routes.rb` through `tests/visual/visual-route-helpers.mjs`.

## Mocking

**Framework:** RSpec mocks, Jest mocks, and Playwright browser instrumentation.

**Patterns:**
```ruby
# spec/requests/wikidata_sparql_routes_spec.rb
wikidata = instance_double(Wikidata)
allow(Wikidata).to receive(:new).and_return(wikidata)
allow(wikidata).to receive(:search)
  .with('python', 'software')
  .and_return([{ qid: 'Q28865', label: 'Python' }])
```

```javascript
// app/javascript/stats/__tests__/StatsPage.test.jsx
const mockFetchStats = jest.fn()

jest.mock('../http/statsHttp', () => ({
  fetchStats: (...args) => mockFetchStats(...args),
  fetchWithTimeout: (promise) => promise,
}))
```

**What to Mock:**
- Mock external network/service boundaries. `spec/requests/wikidata_sparql_routes_spec.rb` stubs `Wikidata` instead of calling Wikidata/SPARQL services.
- Mock authentication/OAuth providers at the test boundary. `spec/rails_helper.rb` enables OmniAuth test mode and configures a Google auth hash.
- Mock isolated collaborators when verifying job or service interactions. `spec/jobs/cleanup_locks_job_spec.rb` stubs `Lock.where` and expects `BroadcastEdit.to`.
- Mock heavy React children or browser-only dependencies when the component under test owns orchestration. `app/javascript/stats/__tests__/StatsPage.test.jsx` mocks `DatePicker`, `MapContainer`, `StatsTable`, loading components, and error components.
- Mock DOM observers when testing side-effect modules. `app/javascript/shared/__tests__/blueprintLegacyNamespace.test.js` installs a `MutationObserver` mock and reloads the module with `jest.resetModules()`.
- Mock fetch through `global.fetch = require('jest-fetch-mock')` from `spec/support/jest-setup.js`.

**What NOT to Mock:**
- Do not mock Rails request routing or controller rendering in request specs; assert `response`, `response.headers`, `response.media_type`, `response.parsed_body`, and parsed HTML directly as in `spec/requests/catalog_routes_spec.rb`.
- Do not mock ActiveRecord persistence when the behavior depends on associations, validations, scopes, or SQL. `spec/services/case_stats_service/query_spec.rb` creates real `Ahoy::Event` and `Visit` rows to exercise SQL.
- Do not mock Redux reducers or pure selectors. Test them as pure functions, as in `app/javascript/stats/__tests__/statsStore.test.js` and `app/javascript/redux/reducers/__tests__/pagesById.test.js`.
- Do not silence unknown browser console/network errors in Playwright. Add intentional route noise to `tests/visual/noise-allowlist.json`; `tests/visual/visual-routes.spec.mjs` fails on unclassified noise.

## Fixtures and Factories

**Test Data:**
```ruby
# spec/factories/readers.rb
FactoryBot.define do
  factory :reader do
    name { Faker::Name.name }
    email { Faker::Internet.email }
    locale { 'en' }
    confirmed_at { Time.zone.now }

    trait :editor do
      after :build do |this|
        this.add_role :editor
      end
    end
  end
end
```

```ruby
# spec/factories/cases.rb
FactoryBot.define do
  factory :case do
    kicker { Faker::Hipster.words(number: 2).join(' ').titlecase }
    title { Faker::Hipster.sentence }

    trait :published do
      library
      published_at { rand(30).minutes.ago }
    end
  end
end
```

**Location:**
- FactoryBot factories: `spec/factories/`
- File fixtures: `spec/fixtures/files/`, including `spec/fixtures/files/block-m.png`
- RSpec support helpers: `spec/support/factory_bot.rb`, `spec/support/integration/authentication.rb`, `spec/support/integration/lti_launch.rb`
- Jest setup: `spec/support/jest-setup.js`
- Playwright route noise fixtures: `tests/visual/noise-allowlist.json`

Use factories for domain records. Prefer `build_stubbed` for policy/model specs that do not need database writes, as in `spec/models/case_spec.rb` and `spec/policies/enrollment_policy_spec.rb`. Use `create` when scopes, SQL, callbacks, associations, or request behavior need persisted records.

## Coverage

**Requirements:** None enforced.

- No SimpleCov configuration is detected in `spec/spec_helper.rb`, `spec/rails_helper.rb`, `Gemfile`, or `Gemfile.lock`.
- Jest coverage collection is not configured in `jest.config.js` or `package.json`.
- Playwright visual coverage is route-matrix based rather than percentage based. It captures snapshots for route definitions in `tests/visual/visual-route-helpers.mjs` and compares them through `tests/visual/visual-routes.spec.mjs`.

**View Coverage:**
```bash
# No canonical coverage command is configured.
pnpm exec jest app/javascript --coverage
```

Treat the coverage command above as ad hoc only; it is not a documented project gate.

## Test Types

**Unit Tests:**
- Model specs under `spec/models/` exercise validations, methods, and concerns. Example: `spec/models/case_spec.rb`.
- Policy specs under `spec/policies/` use Pundit `permissions` blocks. Example: `spec/policies/case_policy_spec.rb`.
- Service specs under `spec/services/` test service public APIs and SQL behavior. Examples: `spec/services/case_stats_service_spec.rb`, `spec/services/case_stats_service/query_spec.rb`.
- Jest unit tests cover helper functions, reducers, selectors, and component output. Examples: `app/javascript/shared/__tests__/functions.test.js`, `app/javascript/stats/__tests__/statsStore.test.js`, `app/javascript/reading_list/__tests__/HiddenFormInputs.test.jsx`.

**Integration Tests:**
- Request specs under `spec/requests/` cover route behavior, authentication, response formats, cache headers, redirects, and JSON bodies. Examples: `spec/requests/catalog_routes_spec.rb`, `spec/requests/admin_operations_routes_spec.rb`, `spec/requests/reading_lists_spec.rb`.
- Controller specs still exist under `spec/controllers/` for controller-specific behavior. Examples: `spec/controllers/cases_controller_spec.rb`, `spec/controllers/admin/cases_controller_spec.rb`.
- Mailbox/mail specs live under `spec/mailboxes/` and `spec/mailers/`, such as `spec/mailboxes/replies_mailbox_spec.rb`.
- Feature specs under `spec/features/` use Capybara/Selenium for browser-level workflows. `.rspec` excludes `spec/features/**/*_spec.rb` from default RSpec runs.

**E2E Tests:**
- Capybara/Selenium feature specs are the Rails browser workflow tests. `spec/rails_helper.rb` registers a headless Chrome Selenium driver and sets Capybara server host/port.
- Playwright visual regression is configured in `playwright.config.mjs` and uses `http://localhost:3000` as `baseURL`.
- Playwright route tests use credentials from environment variable names such as `VISUAL_READER_EMAIL`, `VISUAL_READER_PASSWORD`, `VISUAL_EDITOR_EMAIL`, and `VISUAL_EDITOR_PASSWORD` when protected routes need auth.

## Common Patterns

**Async Testing:**
```javascript
// app/javascript/stats/__tests__/StatsPage.test.jsx
mockFetchStats.mockResolvedValueOnce(sampleData)

const view = renderPage()

expect(view.getByTestId('page-loading')).toBeTruthy()
await waitForElement(() => view.getByTestId('stats-summary'))

expect(mockFetchStats).toHaveBeenCalledTimes(1)
```

```javascript
// app/javascript/stats/__tests__/StatsPage.test.jsx
await act(async () => {
  await new Promise(resolve => setTimeout(resolve, 220))
})
```

Use `waitForElement` from `react-testing-library` for UI that appears after promises or effects. Use `act` around manual timers and promise flushing.

**Error Testing:**
```javascript
// app/javascript/shared/__tests__/orchard.test.js
const res = new Response(null, { status: 404, statusText: 'Not Found' })

const error = await handleResponse(res).catch(x => x)

expect(error).toBeInstanceOf(OrchardError)
expect(error.message).toEqual('404 Not Found')
```

```ruby
# spec/requests/wikidata_sparql_routes_spec.rb
get '/sparql', params: { query: '', schema: 'software' }

expect(response).to have_http_status(:not_found)
```

Use HTTP status assertions for route errors, typed error assertions for frontend API helpers, and `change(Model, :count)` matchers for create/destroy side effects.

**State and Database Setup:**
- Clear shared caches when a service caches values. `spec/services/case_stats_service_spec.rb` calls `Rails.cache.clear` in a `before` block.
- Use Devise request helpers from `spec/rails_helper.rb`: `sign_in create(:reader)` in request specs such as `spec/requests/catalog_routes_spec.rb`.
- Use feature helper `login_as reader` from `spec/support/integration/authentication.rb` in Capybara specs such as `spec/features/creating_a_reading_list_spec.rb`.
- Keep route smoke specs route-group focused. `spec/requests/admin_operations_routes_spec.rb` checks representative admin index/show routes and Sidekiq access without asserting every HTML detail.

---

*Testing analysis: 2026-05-30*
