# Testing Patterns

**Analysis Date:** 2026-04-22

## Test Framework

**Runner:**
- RSpec for Rails tests, configured by `.rspec`, `spec/spec_helper.rb`, and `spec/rails_helper.rb`.
- Jest `^24.5.0` for JavaScript and React tests, configured by `jest.config.js`.
- Capybara with Selenium Chrome for feature specs, configured in `spec/rails_helper.rb`.
- Pundit RSpec helpers for policy specs, loaded from `spec/spec_helper.rb`.
- Shoulda Matchers are integrated with Rails/RSpec in `spec/rails_helper.rb`.

**Assertion Library:**
- Ruby uses RSpec expectations and matchers, including `have_http_status`, `redirect_to`, Pundit `permit`, and composable JSON matchers from `rspec-composable_json_matchers`.
- JavaScript uses Jest `expect`, `jest-dom`, and `react-testing-library` helpers from `spec/support/jest-setup.js`.

**Run Commands:**
```bash
bundle exec rspec --exclude-pattern "spec/features/**/*_spec.rb"  # CI-equivalent Ruby suite without feature specs
bundle exec rspec spec/services/case_stats_service_spec.rb         # Run one focused Ruby spec file
bundle exec rake factory_bot:lint                                  # Validate factories
yarn test                                                          # Run all Jest tests under app/javascript
yarn test -- app/javascript/stats/__tests__/StatsPage.test.jsx     # Run one focused Jest test file
bundle exec rails assets:precompile                                # Reproduce CI asset setup before Rails specs
```

## Test File Organization

**Location:**
- Rails specs live under `spec/` and are organized by Rails layer: `spec/models/`, `spec/controllers/`, `spec/requests/`, `spec/features/`, `spec/services/`, `spec/policies/`, `spec/mailboxes/`, `spec/jobs/`, `spec/decorators/`, `spec/cloners/`, `spec/forms/`, and `spec/serializers/`.
- Shared RSpec support lives in `spec/support/`, including `spec/support/factory_bot.rb`, `spec/support/integration/authentication.rb`, `spec/support/integration/lti_launch.rb`, and `spec/support/jest-setup.js`.
- Factories live in `spec/factories/` with one domain file per model or closely related model group, such as `spec/factories/cases.rb` and `spec/factories/pages.rb`.
- Jest tests live beside frontend feature code inside `__tests__` folders, such as `app/javascript/stats/__tests__/StatsPage.test.jsx`, `app/javascript/redux/reducers/__tests__/cards.test.js`, and `app/javascript/shared/__tests__/functions.test.js`.

**Naming:**
- Ruby specs end with `_spec.rb` and describe the class, request area, or feature behavior: `spec/models/case_spec.rb`, `spec/controllers/cases/stats_controller_spec.rb`, and `spec/features/viewing_a_case_spec.rb`.
- Jest specs end with `.test.js` or `.test.jsx`: `app/javascript/stats/__tests__/statsStore.test.js` and `app/javascript/conversation/__tests__/SelectedCommentThread.test.jsx`.
- Feature specs use user-story names in gerund form, such as `spec/features/viewing_a_case_spec.rb`, `spec/features/editing_a_case_spec.rb`, and `spec/features/signing_in_with_google_spec.rb`.

**Structure:**
```text
spec/
├── rails_helper.rb
├── spec_helper.rb
├── factories/
├── support/
├── models/
├── controllers/
├── requests/
├── services/
├── policies/
└── features/

app/javascript/<feature>/__tests__/
├── Component.test.jsx
└── helper.test.js
```

## Test Structure

**Suite Organization:**
```ruby
# Pattern from `spec/services/case_stats_service_spec.rb`
require 'rails_helper'

RSpec.describe CaseStatsService do
  let(:kase) { create(:case) }
  let(:reader) { create(:reader) }

  before do
    Rails.cache.clear
  end

  describe '#initialize' do
    context 'with no date parameters' do
      subject(:service) { described_class.new(kase) }

      it 'sets from_date to case created_at date' do
        expect(service.from_date).to eq(kase.created_at.to_date)
      end
    end
  end
end
```

```javascript
/* @noflow */

// Pattern from `app/javascript/stats/__tests__/StatsPage.test.jsx`
import React from 'react'
import { fireEvent, render, waitForElement } from 'react-testing-library'

const mockFetchStats = jest.fn()

jest.mock('../http/statsHttp', () => ({
  fetchStats: (...args) => mockFetchStats(...args),
}))

describe('StatsPage', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders successful content', async () => {
    mockFetchStats.mockResolvedValueOnce(sampleData)
    const view = renderPage()
    await waitForElement(() => view.getByTestId('stats-summary'))
    expect(view.getByTestId('stats-summary')).toBeTruthy()
  })
})
```

**Patterns:**
- Require `rails_helper` for Rails-aware specs that need models, controllers, routing, Capybara, factories, Devise, or ActiveJob helpers. Use `spec_helper` only for tests that do not need Rails.
- Use `let`, `let!`, `subject`, `before`, `around`, `describe`, and `context` for setup boundaries. See `spec/controllers/cases/stats_controller_spec.rb` and `spec/policies/case_policy_spec.rb`.
- Prefer FactoryBot helpers directly (`create(:reader)`, `build(:case)`, `build_stubbed(:case)`) because `FactoryBot::Syntax::Methods` is included in `spec/rails_helper.rb` and `spec/support/factory_bot.rb`.
- Use `build_stubbed` for validation or policy tests that do not need persistence, as in `spec/models/case_spec.rb`; use `create` when associations, scopes, SQL queries, or controller lookup require database records.
- Use request/controller specs for HTTP status, redirects, content type, response body structure, and caching headers, as in `spec/controllers/cases/stats_controller_spec.rb` and `spec/requests/reader_spec.rb`.
- Use feature specs for browser-visible workflows with Capybara methods such as `visit`, `click_link`, `click_button`, `find`, `hover`, and `have_selector`, as in `spec/features/viewing_a_case_spec.rb`.
- Use `subject(:name)` for service objects under test and plain `subject { described_class }` for Pundit policy permission specs, as in `spec/services/case_stats_service_spec.rb` and `spec/policies/case_policy_spec.rb`.

## Mocking

**Framework:** RSpec mocks for Ruby, Jest mocks for JavaScript

**Patterns:**
```ruby
# Pattern from `spec/models/case/pdf_spec.rb`
kit = instance_double(PDFKit)
allow(kit).to receive(:to_pdf).and_raise(error)

# Pattern from `spec/jobs/cleanup_locks_job_spec.rb`
allow(Lock).to receive(:where).with(reader_id: reader_id)
expect(BroadcastEdit).to receive(:to)
```

```javascript
// Pattern from `app/javascript/stats/__tests__/StatsPage.test.jsx`
const mockFetchStats = jest.fn()

jest.mock('../http/statsHttp', () => ({
  fetchStats: (...args) => mockFetchStats(...args),
  fetchWithTimeout: (...args) => mockFetchWithTimeout(...args),
}))

const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {})
```

**What to Mock:**
- Mock external services, expensive framework objects, PDF generation, browser-only APIs, network fetches, child components whose internal behavior belongs to separate tests, and console noise during expected failures.
- Mock frontend HTTP boundaries and child components when the test target is state flow or rendering orchestration. `app/javascript/stats/__tests__/StatsPage.test.jsx` mocks `../http/statsHttp`, `../DatePicker`, `../map/MapContainer`, `../StatsTable`, `../StatsSummary`, `../StatsLoading`, and `../StatsError`.
- Use `instance_double` for Ruby collaborators where interface verification matters. RSpec has `verify_partial_doubles = true` in `spec/spec_helper.rb`.

**What NOT to Mock:**
- Do not mock ActiveRecord queries when the behavior is SQL, scopes, associations, or cache-key generation; use factories and assert real results. `spec/services/case_stats_service_spec.rb` creates `Ahoy::Event` and `Visit` records to test aggregation.
- Do not mock Pundit policies in policy specs; use `permissions` and `permit` against real policy instances as in `spec/policies/case_policy_spec.rb`.
- Do not mock routing, Devise integration, or rendered response status in request/controller specs unless the test target is isolated from Rails behavior.
- Do not mock pure helpers or reducers; test them directly, as in `app/javascript/shared/__tests__/functions.test.js` and `app/javascript/stats/__tests__/statsStore.test.js`.

## Fixtures and Factories

**Test Data:**
```ruby
# Pattern from `spec/factories/cases.rb`
FactoryBot.define do
  factory :case do
    kicker { Faker::Hipster.words(number: 2).join(' ').titlecase }
    title { Faker::Hipster.sentence }

    trait :published do
      library
      published_at { rand(30).minutes.ago }
    end

    factory :case_with_elements do
      transient do
        page_count { 3 }
      end

      after :create do |this, ev|
        create_list(:page_element, ev.page_count, case: this)
      end
    end
  end
end
```

**Location:**
- Factories live in `spec/factories/`, with traits for meaningful domain state such as `:published`, `:in_catalog`, `:with_quiz`, `:editor`, `:francophone`, and `:eight_hours_old`.
- File fixtures live under `spec/fixtures/` and `spec/fixtures/files/`.
- Mailbox helper methods may live inside the spec when tightly scoped, such as `receive_response` in `spec/mailboxes/replies_mailbox_spec.rb`.
- JavaScript tests define small inline fixtures in the test file when the fixture is local to that behavior, such as `sampleData` and `messages` in `app/javascript/stats/__tests__/StatsPage.test.jsx`.

## Coverage

**Requirements:** Not detected

**View Coverage:**
```bash
# Not detected: no SimpleCov, Jest collectCoverage, nyc, or coverage command is configured.
```

## Test Types

**Unit Tests:**
- Model specs under `spec/models/` test validations, default values, translations, scopes, and domain methods. Example: `spec/models/case_spec.rb`.
- Service specs under `spec/services/` test initialization, parsing, query aggregation, formatting, and cache behavior. Example: `spec/services/case_stats_service_spec.rb`.
- Policy specs under `spec/policies/` use Pundit `permissions` blocks. Example: `spec/policies/case_policy_spec.rb`.
- JavaScript helper, reducer, and state tests live under feature `__tests__` folders. Examples: `app/javascript/shared/__tests__/functions.test.js`, `app/javascript/stats/__tests__/statsStore.test.js`, and `app/javascript/redux/reducers/__tests__/cards.test.js`.

**Integration Tests:**
- Controller specs under `spec/controllers/` exercise Rails controller behavior with Devise helpers, response formats, caching, and authorization. Example: `spec/controllers/cases/stats_controller_spec.rb`.
- Request specs under `spec/requests/` exercise application routes and session behavior. Example: `spec/requests/reader_spec.rb`.
- Mailbox specs under `spec/mailboxes/` use `ActionMailbox::TestHelper`. Example: `spec/mailboxes/replies_mailbox_spec.rb`.
- Frontend component tests with `react-testing-library` exercise React rendering, events, async fetch flow, and URL updates. Example: `app/javascript/stats/__tests__/StatsPage.test.jsx`.

**E2E Tests:**
- Capybara feature specs under `spec/features/` run with Selenium Chrome through `spec/rails_helper.rb`. Example: `spec/features/viewing_a_case_spec.rb`.
- `.rspec` excludes `spec/features/**/*_spec.rb` by default; run feature specs explicitly when validating browser workflows.
- Feature specs use a fixed Capybara server port `4000`, a headless Chrome Selenium driver, a `1600x1200` browser window, and retry only for feature specs outside single-file runs as configured in `spec/rails_helper.rb` and `spec/spec_helper.rb`.

## Common Patterns

**Async Testing:**
```javascript
// Pattern from `app/javascript/stats/__tests__/StatsPage.test.jsx`
mockFetchStats.mockResolvedValueOnce(sampleData)

const view = renderPage()
expect(view.getByTestId('page-loading')).toBeTruthy()

await waitForElement(() => view.getByTestId('stats-summary'))
expect(view.queryByTestId('page-loading')).toBeNull()
```

```ruby
# Pattern from `spec/rails_helper.rb`
config.around(:each, type: :mailbox) do |example|
  old_adapter = ActiveJob::Base.queue_adapter
  ActiveJob::Base.queue_adapter = :test
  example.run
ensure
  ActiveJob::Base.queue_adapter = old_adapter
end
```

**Error Testing:**
```javascript
// Pattern from `app/javascript/stats/__tests__/StatsPage.test.jsx`
mockFetchStats
  .mockRejectedValueOnce(new Error('network down'))
  .mockResolvedValueOnce(sampleData)

const view = renderPage()
await waitForElement(() => view.getByTestId('stats-error'))
expect(view.getByTestId('stats-error-message')).toHaveTextContent('network down')
```

```ruby
# Pattern from `spec/controllers/cases/stats_controller_spec.rb`
sign_out reader
sign_in unauthorized_reader

get :show, params: { case_slug: kase.slug }

expect(response).to have_http_status(:forbidden).or have_http_status(:redirect)
```

**Authentication and authorization:**
- Controller specs use Devise controller helpers such as `sign_in reader` and `sign_out reader`, included for `type: :controller` in `spec/rails_helper.rb`.
- Request specs use Devise integration helpers such as `sign_in reader`, included for `type: :request` in `spec/rails_helper.rb`.
- Feature specs use `login_as` from `spec/support/integration/authentication.rb`, included for `type: :feature` in `spec/rails_helper.rb`.
- Pundit policy specs should use `permissions :action?` and `expect(subject).to permit user, record`, as in `spec/policies/case_policy_spec.rb`.

**Caching and time-sensitive tests:**
- Clear Rails cache in specs that inspect cache behavior, as in `spec/controllers/cases/stats_controller_spec.rb` and `spec/services/case_stats_service_spec.rb`.
- Swap `Rails.cache` with `ActiveSupport::Cache::MemoryStore` inside `around` blocks when test environment cache storage is `null_store`, as in `spec/controllers/cases/stats_controller_spec.rb`.
- `ActiveSupport::Testing::TimeHelpers` is included globally in `spec/rails_helper.rb`; use Rails time helpers for deterministic time behavior when adding time-sensitive tests.

---

*Testing analysis: 2026-04-22*
