# Testing Patterns

**Analysis Date:** 2026-05-03

## Test Framework

**Runner:**
- RSpec for Rails backend tests.
- Config: `.rspec`, `spec/spec_helper.rb`, and `spec/rails_helper.rb`.
- Jest 24 for frontend JavaScript and React tests.
- Config: `jest.config.js`.

**Assertion Library:**
- RSpec expectations and rspec-mocks for Ruby tests, configured in `spec/spec_helper.rb`.
- Shoulda Matchers for Rails model/controller-style matchers, configured in `spec/rails_helper.rb`.
- `rspec-composable_json_matchers` for JSON response assertions, configured in `spec/rails_helper.rb`.
- Jest `expect`, `jest-dom`, and React Testing Library for frontend tests, configured in `spec/support/jest-setup.js`.

**Run Commands:**
```bash
bundle exec rspec                    # Run RSpec using .rspec defaults; feature specs are excluded by .rspec
./run-rspec.sh                       # Run non-feature RSpec through docker compose with RAILS_ENV=test
bundle exec rake test:unit           # Run non-feature RSpec via lib/tasks/tests.rake
yarn test                            # Run Jest against app/javascript
```

## Test File Organization

**Location:**
- Backend specs live under `spec/` grouped by Rails type: `spec/models`, `spec/controllers`, `spec/requests`, `spec/services`, `spec/policies`, `spec/features`, `spec/jobs`, `spec/mailboxes`, `spec/mailers`, `spec/decorators`, `spec/forms`, `spec/cloners`, and `spec/config`.
- Frontend tests are co-located under feature-level `__tests__/` directories in `app/javascript`, such as `app/javascript/stats/__tests__`, `app/javascript/shared/__tests__`, and `app/javascript/redux/reducers/__tests__`.
- Factories live in `spec/factories/`, with one file per domain model where practical: `spec/factories/readers.rb`, `spec/factories/cases.rb`, and `spec/factories/ahoy_events.rb`.
- Shared Ruby test helpers live in `spec/support/`, including `spec/support/factory_bot.rb` and `spec/support/integration/authentication.rb`.
- Static test files live under `spec/fixtures/files/`, such as `spec/fixtures/files/block-m.png`.

**Naming:**
- Ruby specs use `*_spec.rb`: `spec/services/case_stats_service/query_spec.rb`, `spec/models/case_spec.rb`, and `spec/requests/health_check_spec.rb`.
- JavaScript specs use `.test.js` or `.test.jsx`: `app/javascript/stats/__tests__/statsStore.test.js`, `app/javascript/stats/__tests__/StatsPage.test.jsx`, and `app/javascript/reading_list/__tests__/HiddenFormInputs.test.jsx`.
- Feature specs are named by user workflow in gerund form: `spec/features/creating_a_reading_list_spec.rb`, `spec/features/editing_a_case_spec.rb`, and `spec/features/viewing_a_case_spec.rb`.

**Structure:**
```
spec/
├── factories/                # FactoryBot factories and traits
├── support/                  # RSpec support helpers
├── models/                   # ActiveRecord/domain model specs
├── services/                 # Service object specs
├── requests/                 # Request specs
├── controllers/              # Controller specs
├── policies/                 # Pundit policy specs
└── features/                 # Capybara browser workflow specs

app/javascript/<feature>/__tests__/
├── <Component>.test.jsx      # React component tests
└── <helper>.test.js          # Pure JS helper/reducer tests
```

## Test Structure

**Suite Organization:**
```ruby
# Pattern from spec/services/case_stats_service/query_spec.rb
require 'rails_helper'

RSpec.describe CaseStatsService::Query do
  let(:kase) { create(:case) }
  let(:reader) { create(:reader) }
  let(:visit) { create(:visit, user: reader, country: 'US') }

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
/* @flow */

// Pattern from app/javascript/shared/__tests__/functions.test.js
import { reorder } from '../functions'

describe('reorder', () => {
  it('works', () => {
    const array = 'abcd'.split('')
    expect(reorder(1, 2, array)).toEqual('acbd'.split(''))
  })
})
```

**Patterns:**
- Require `rails_helper` in Rails specs, not `spec_helper`, as shown across `spec/services/case_stats_service/query_spec.rb`, `spec/models/case_spec.rb`, and `spec/requests/health_check_spec.rb`.
- Use `RSpec.describe <ClassOrFeature>` with nested `describe '#instance_method'`, `describe '.class_method'`, and `context 'with condition'` blocks.
- Prefer `let` and named `subject` for reusable setup: `subject(:query)` in `spec/services/case_stats_service/query_spec.rb` and `subject(:service)` in `spec/services/case_stats_service_spec.rb`.
- Use `before` blocks for persisted records or repeated setup that is required by multiple examples in the same context.
- In frontend tests, define render helpers near the top of the file when providers are required, as in `renderPage` in `app/javascript/stats/__tests__/StatsPage.test.jsx`.
- Use `data-testid` for React Testing Library queries when component text or structure is not the behavior under test, as in `app/javascript/stats/__tests__/StatsPage.test.jsx`.

## Mocking

**Framework:** RSpec mocks for Ruby; Jest mocks and spies for JavaScript.

**Patterns:**
```ruby
# Pattern from spec/policies/comment_policy_spec.rb and spec/jobs/cleanup_locks_job_spec.rb
forum_policy = instance_double ForumPolicy
allow(forum_policy).to receive(:show?).and_return(true)
expect(BroadcastEdit).to receive(:to)
```

```javascript
// Pattern from app/javascript/stats/__tests__/StatsPage.test.jsx
const mockFetchStats = jest.fn()

jest.mock('../http/statsHttp', () => ({
  fetchStats: (...args) => mockFetchStats(...args),
}))

beforeEach(() => {
  jest.clearAllMocks()
})
```

**What to Mock:**
- Mock external services, browser APIs, network calls, maps, heavyweight UI widgets, and background broadcast boundaries.
- Use `instance_double` for Ruby collaborator contracts where available, as in `spec/policies/comment_policy_spec.rb` and `spec/decorators/card_decorator_spec.rb`.
- Mock frontend HTTP modules and large child components when testing container behavior, as in `app/javascript/stats/__tests__/StatsPage.test.jsx`.
- Mock third-party UI components when their behavior is not the test target, as in `app/javascript/stats/__tests__/DatePicker.test.jsx`.

**What NOT to Mock:**
- Do not mock the object under test.
- Do not mock ActiveRecord persistence when validating query behavior or model integration; `spec/services/case_stats_service/query_spec.rb` creates real `Ahoy::Event`, `Visit`, `Reader`, and `Case` records.
- Do not mock pure reducers/selectors/helpers; test them directly, as in `app/javascript/stats/__tests__/statsStore.test.js`, `app/javascript/stats/__tests__/statsResponse.test.js`, and `app/javascript/shared/__tests__/functions.test.js`.
- Avoid stubbing methods that do not exist; `spec/spec_helper.rb` enables `mocks.verify_partial_doubles = true`.

## Fixtures and Factories

**Test Data:**
```ruby
# Pattern from spec/factories/readers.rb
FactoryBot.define do
  factory :reader do
    name { Faker::Name.name }
    initials { name.split(' ').map { |x| x[0] }.join }
    email { Faker::Internet.email }
    password { 'secret' }
    locale { 'en' }
    confirmed_at { Time.zone.now }
    terms_of_service { 1 }

    trait :invisible do
      after :create do |this|
        this.add_role :invisible
      end
    end
  end
end
```

```javascript
// Pattern from app/javascript/stats/__tests__/StatsPage.test.jsx
const sampleData = {
  formatted: [
    {
      iso2: 'US',
      iso3: 'USA',
      name: 'United States',
      unique_visits: 10,
      unique_users: 8,
      events_count: 15,
    },
  ],
  summary: {
    total_visits: 10,
    country_count: 1,
  },
}
```

**Location:**
- FactoryBot factories live in `spec/factories/` and are auto-loaded by `factory_bot_rails`.
- Factory syntax is included globally through `spec/rails_helper.rb` and `spec/support/factory_bot.rb`; use `create(:reader)`, `build_stubbed(:case)`, and traits such as `create(:reader, :invisible)`.
- JavaScript fixtures are usually file-local constants inside the relevant `.test.js` or `.test.jsx`, as in `app/javascript/stats/__tests__/StatsPage.test.jsx`.
- Binary/file fixtures belong in `spec/fixtures/files/`.

## Coverage

**Requirements:** No enforced coverage threshold detected. No SimpleCov setup is present in `spec/spec_helper.rb` or `spec/rails_helper.rb`, and `jest.config.js` does not set `collectCoverage` or coverage thresholds.

**View Coverage:**
```bash
yarn jest app/javascript --coverage      # Ad hoc frontend coverage if needed
```

## Test Types

**Unit Tests:**
- Ruby unit/service/model tests cover domain logic with FactoryBot records and direct assertions. Examples: `spec/services/case_stats_service/query_spec.rb`, `spec/services/case_stats_service/formatter_spec.rb`, `spec/models/content_state_spec.rb`, and `spec/policies/comment_policy_spec.rb`.
- JavaScript unit tests cover pure helpers, reducers, state selectors, and component containers. Examples: `app/javascript/stats/__tests__/statsStore.test.js`, `app/javascript/stats/__tests__/statsResponse.test.js`, `app/javascript/redux/reducers/__tests__/cards.test.js`, and `app/javascript/shared/spotlight/__tests__/SpotlightManager.test.js`.

**Integration Tests:**
- Request specs live in `spec/requests/` and exercise HTTP behavior through Rails: `spec/requests/health_check_spec.rb`, `spec/requests/announcements_index_spec.rb`, and `spec/requests/persona_update_spec.rb`.
- Controller specs live in `spec/controllers/`, including nested controller namespaces such as `spec/controllers/cases/stats_controller_spec.rb` and `spec/controllers/edgenotes/attachments_controller_spec.rb`.
- Mailbox, mailer, job, serializer, decorator, cloner, and config specs cover Rails integration boundaries in `spec/mailboxes/replies_mailbox_spec.rb`, `spec/mailers/reply_notification_mailer_spec.rb`, `spec/jobs/cleanup_locks_job_spec.rb`, `spec/serializers/cases/stats_serializer_spec.rb`, `spec/decorators/card_decorator_spec.rb`, `spec/cloners/case_cloner_spec.rb`, and `spec/config/rack_attack_spec.rb`.

**E2E Tests:**
- Capybara feature specs live in `spec/features/`, use Selenium Chrome headless by default, and cover full user workflows such as `spec/features/signing_up_spec.rb`, `spec/features/creating_a_new_deployment_spec.rb`, and `spec/features/leaving_a_comment_spec.rb`.
- `.rspec` excludes `spec/features/**/*_spec.rb` by default, so feature specs require an explicit include/run command when needed.
- Capybara browser configuration is in `spec/rails_helper.rb`, including the Selenium driver, server host/port, app host, and default 1600x1200 browser size.
- Feature authentication helpers live in `spec/support/integration/authentication.rb` and are included for `type: :feature`.

## Common Patterns

**Async Testing:**
```javascript
// Pattern from app/javascript/stats/__tests__/StatsPage.test.jsx
mockFetchStats.mockResolvedValueOnce(sampleData)

const view = renderPage()

expect(view.getByTestId('page-loading')).toBeTruthy()
await waitForElement(() => view.getByTestId('stats-summary'))
expect(view.queryByTestId('page-loading')).toBeNull()
```

**Error Testing:**
```ruby
# Pattern from spec/services/case_stats_service_spec.rb
context 'with invalid date strings' do
  subject(:service) { described_class.new(kase, from: 'invalid', to: 'also-invalid') }

  it 'falls back to case created_at for from_date' do
    expect(service.from_date).to eq(kase.created_at.to_date)
  end
end
```

```javascript
// Pattern from app/javascript/stats/__tests__/StatsPage.test.jsx
mockFetchStats
  .mockRejectedValueOnce(new Error('network down'))
  .mockResolvedValueOnce(sampleData)

const view = renderPage()

await waitForElement(() => view.getByTestId('stats-error'))
expect(view.getByTestId('stats-error-message')).toHaveTextContent('network down')
```

---

*Testing analysis: 2026-05-03*
