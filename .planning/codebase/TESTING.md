# Testing Patterns

**Analysis Date:** 2026-04-22

## Test Framework

**Runner:**
- RSpec `3.13.0` with `rspec-core` `3.13.2` and `rspec-rails` `7.1.0`; configured by `.rspec`, `spec/spec_helper.rb`, and `spec/rails_helper.rb`.
- Jest `24.9.0` through the `yarn test` script in `package.json`; configured by `jest.config.js`.
- Capybara `3.40.0` with Selenium Chrome and `webdrivers` for feature specs; configured in `spec/rails_helper.rb`.
- Pundit RSpec helpers are loaded from `spec/spec_helper.rb` for policy specs such as `spec/policies/case_policy_spec.rb`.
- Shoulda Matchers `4.5.1` are integrated with Rails/RSpec in `spec/rails_helper.rb`.

**Assertion Library:**
- Ruby uses RSpec expectations and Rails matchers such as `have_http_status`, `redirect_to`, `be_valid`, `include`, `contain_exactly`, `have_received`, and Pundit `permit`.
- JSON assertions may use regular `JSON.parse(..., symbolize_names: true)` plus RSpec matchers, as in `spec/controllers/cases/stats_controller_spec.rb`.
- JavaScript uses Jest `expect`, `jest.fn`, `jest.mock`, `jest.spyOn`, and matchers from `jest-dom` loaded by `spec/support/jest-setup.js`.
- React tests use `react-testing-library` `render`, `fireEvent`, and `waitForElement`, as in `app/javascript/stats/__tests__/StatsPage.test.jsx` and `app/javascript/stats/__tests__/DatePicker.test.jsx`.

**Run Commands:**
```bash
bundle exec rspec --exclude-pattern "spec/features/**/*_spec.rb"  # CI-equivalent Ruby suite without feature specs
bundle exec rspec spec/services/case_stats_service/query_spec.rb   # Run one focused Ruby spec file
bundle exec rspec spec/features/viewing_a_case_spec.rb             # Run one feature spec explicitly
bundle exec rake factory_bot:lint                                  # Validate factories
yarn test                                                          # Run all Jest tests under app/javascript
yarn test -- app/javascript/stats/__tests__/StatsPage.test.jsx     # Run one focused Jest file
bundle exec rails assets:precompile                                # Reproduce CI asset setup before asset-sensitive specs
```

## Test File Organization

**Location:**
- Rails specs live under `spec/` and are grouped by Rails layer: `spec/models/`, `spec/controllers/`, `spec/requests/`, `spec/features/`, `spec/services/`, `spec/policies/`, `spec/jobs/`, `spec/mailboxes/`, `spec/mailers/`, `spec/decorators/`, `spec/cloners/`, `spec/forms/`, `spec/config/`, and `spec/serializers/`.
- Shared RSpec helpers live under `spec/support/`, including `spec/support/factory_bot.rb`, `spec/support/integration/authentication.rb`, and `spec/support/integration/lti_launch.rb`.
- JavaScript test setup lives at `spec/support/jest-setup.js` and is loaded by `jest.config.js`.
- Factories live under `spec/factories/`, with domain files such as `spec/factories/cases.rb`, `spec/factories/readers.rb`, `spec/factories/deployments.rb`, and `spec/factories/ahoy_events.rb`.
- Jest tests are colocated under feature `__tests__` folders, such as `app/javascript/stats/__tests__/StatsPage.test.jsx`, `app/javascript/stats/__tests__/statsStore.test.js`, `app/javascript/redux/reducers/__tests__/cards.test.js`, and `app/javascript/shared/spotlight/__tests__/SpotlightManager.test.js`.

**Naming:**
- Ruby specs end with `_spec.rb` and describe the class, request area, or workflow: `spec/models/case_spec.rb`, `spec/services/case_stats_service/query_spec.rb`, `spec/requests/reader_spec.rb`, and `spec/features/signing_in_with_google_spec.rb`.
- Jest specs end with `.test.js` or `.test.jsx`: `app/javascript/stats/__tests__/statsResponse.test.js`, `app/javascript/stats/__tests__/DatePicker.test.jsx`, and `app/javascript/reading_list/__tests__/HiddenFormInputs.test.jsx`.
- Feature specs use user-facing gerund names such as `spec/features/viewing_a_case_spec.rb`, `spec/features/editing_a_case_spec.rb`, and `spec/features/creating_a_reading_list_spec.rb`.

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
├── jobs/
└── features/

app/javascript/<feature>/__tests__/
├── Component.test.jsx
└── helper.test.js
```

## Test Structure

**Suite Organization:**
```ruby
# Pattern from `spec/services/case_stats_service/query_spec.rb`
require 'rails_helper'

RSpec.describe CaseStatsService::Query do
  let(:kase) { create(:case) }
  let(:reader) { create(:reader) }
  let(:visit) { create(:visit, user: reader, country: 'US') }
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
    window.history.replaceState({}, '', '/cases/demo/stats')
  })

  it('renders initial loading then successful map/table/summary content', async () => {
    mockFetchStats.mockResolvedValueOnce(sampleData)

    const view = renderPage()

    expect(view.getByTestId('page-loading')).toBeTruthy()
    await waitForElement(() => view.getByTestId('stats-summary'))
    expect(view.getByTestId('stats-summary')).toBeTruthy()
  })
})
```

**Patterns:**
- Require `rails_helper` for Rails-aware specs that need models, controllers, routing, Capybara, Devise, ActiveJob, FactoryBot, or database access. Most specs in `spec/` follow this pattern, including `spec/models/case_spec.rb` and `spec/controllers/cases/stats_controller_spec.rb`.
- Use `spec_helper` for RSpec-only configuration. `spec/spec_helper.rb` configures RSpec mocks, focus filtering, random ordering, retry behavior, and Pundit helpers.
- Use `let`, `let!`, `subject`, `before`, `after`, `around`, `describe`, and `context` to scope setup. Good examples are `spec/controllers/cases/stats_controller_spec.rb`, `spec/services/case_stats_service/query_spec.rb`, and `spec/policies/case_policy_spec.rb`.
- Prefer direct FactoryBot helpers because `FactoryBot::Syntax::Methods` is included by `spec/rails_helper.rb` and `spec/support/factory_bot.rb`.
- Use `build_stubbed` for validation and policy tests that do not require persistence, as in `spec/models/case_spec.rb` and `spec/forms/confirm_deletiong_form_spec.rb`.
- Use `create` when associations, SQL, scopes, callbacks, or controller lookup require persisted records, as in `spec/services/case_stats_service/query_spec.rb` and `spec/controllers/cases/stats_controller_spec.rb`.
- Use controller specs for controller-level status, response format, headers, and authentication helpers, as in `spec/controllers/cases/stats_controller_spec.rb`.
- Use request specs for route/session behavior through the Rails integration stack, as in `spec/requests/reader_spec.rb`.
- Use feature specs for browser-visible workflows with Capybara methods such as `visit`, `find`, `click_button`, `click_link`, `fill_in`, `check`, and `have_content`, as in `spec/features/signing_in_with_google_spec.rb`.
- Use Pundit `permissions` blocks and `expect(subject).to permit user, record` in policy specs, as in `spec/policies/case_policy_spec.rb`.
- Use `describe('#method')`, `describe('::class_method')`, and user-facing `context` names to communicate behavior boundaries, matching `spec/models/case_spec.rb` and `spec/services/case_stats_service/query_spec.rb`.

## Mocking

**Framework:** RSpec mocks for Ruby, Jest mocks for JavaScript

**Patterns:**
```ruby
# Pattern from `spec/forms/confirm_deletiong_form_spec.rb`
allow(kase).to receive :destroy

form = described_class.new case: kase, kicker_confirmation: 'Kicker'
form.save

expect(kase).to have_received :destroy
```

```ruby
# Pattern from `spec/jobs/cleanup_locks_job_spec.rb`
allow(Lock).to receive(:where).with(reader_id: reader_id)
                              .and_return([reader_lock])

expect(BroadcastEdit).to receive(:to)
  .with(reader_lock, type: :destroy, session_id: nil)
```

```javascript
// Pattern from `app/javascript/stats/__tests__/DatePicker.test.jsx`
jest.mock('@blueprintjs/datetime', () => {
  const React = require('react')

  return {
    DateRangePicker: jest.fn((props) => (
      <div className="pt-daterangepicker" />
    )),
  }
})
```

```javascript
// Pattern from `app/javascript/stats/__tests__/StatsPage.test.jsx`
const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {})

afterEach(() => {
  consoleErrorSpy.mockRestore()
})
```

**What to Mock:**
- Mock external services, expensive framework objects, PDF generation, network calls, browser-only APIs, and broadcast side effects when the test target is local behavior. Examples include `spec/jobs/cleanup_locks_job_spec.rb`, `spec/models/case/pdf_spec.rb`, and `app/javascript/stats/__tests__/StatsPage.test.jsx`.
- Mock frontend HTTP boundaries and child components when testing orchestration or state flow. `app/javascript/stats/__tests__/StatsPage.test.jsx` mocks `../http/statsHttp`, `../DatePicker`, `../map/MapContainer`, `../StatsTable`, `../StatsSummary`, `../StatsLoading`, and `../StatsError`.
- Use Jest module mocks for UI libraries that are difficult to render in jsdom, such as `@blueprintjs/datetime` in `app/javascript/stats/__tests__/DatePicker.test.jsx` and `react-popper` in `app/javascript/shared/spotlight/__tests__/index.test.js`.
- Use RSpec verified partial doubles where possible; `spec/spec_helper.rb` sets `mocks.verify_partial_doubles = true`.

**What NOT to Mock:**
- Do not mock ActiveRecord queries when the behavior under test is SQL, scopes, associations, callbacks, or cache-key behavior. `spec/services/case_stats_service/query_spec.rb` creates `Ahoy::Event` and `Visit` records to exercise real aggregation.
- Do not mock Pundit policies inside policy specs. Use real policy instances through `permissions` and `permit`, as in `spec/policies/case_policy_spec.rb`.
- Do not mock pure reducers, selectors, or helpers; test them directly. Examples include `app/javascript/stats/__tests__/statsStore.test.js`, `app/javascript/stats/__tests__/statsResponse.test.js`, and `app/javascript/redux/reducers/__tests__/cards.test.js`.
- Do not mock Devise or routing in controller/request specs when the test target is authentication, redirects, or route behavior. Use `sign_in`, `sign_out`, and Rails path helpers as in `spec/controllers/cases/stats_controller_spec.rb` and `spec/requests/reader_spec.rb`.

## Fixtures and Factories

**Test Data:**
```ruby
# Pattern from `spec/factories/cases.rb`
FactoryBot.define do
  factory :case do
    kicker { Faker::Hipster.words(number: 2).join(' ').titlecase }
    title { Faker::Hipster.sentence }
    dek { Faker::Hipster.sentence }
    commentable { true }

    trait :published do
      library
      published_at { rand(30).minutes.ago }
      latitude { rand(-70..69) }
      longitude { rand(-180..179) }
      zoom { rand 10 }
    end

    factory :case_with_elements do
      transient do
        page_count { 3 }
        podcast_count { 1 }
      end

      after :create do |this, ev|
        create_list(:page_element, ev.page_count, case: this)
        create_list(:podcast_element, ev.podcast_count, case: this)
      end
    end
  end
end
```

```javascript
// Pattern from `app/javascript/stats/__tests__/statsStore.test.js`
const sampleData = {
  formatted: [
    {
      iso2: 'US',
      iso3: 'USA',
      name: 'United States',
      unique_visits: 5,
    },
  ],
  summary: {
    total_visits: 5,
    country_count: 1,
    total_podcast_listens: 2,
  },
}
```

**Location:**
- Put reusable Rails domain data in `spec/factories/`; use traits for meaningful states such as `:published`, `:in_catalog`, `:editor`, `:invisible`, `:with_quiz`, `:one_hour_old`, and `:eight_hours_old`.
- Use factory callbacks for derived associations and domain setup, as in `spec/factories/cases.rb`, `spec/factories/readers.rb`, and `spec/factories/quizzes.rb`.
- Put file uploads and binary fixtures under `spec/fixtures/` and `spec/fixtures/files/`.
- Keep JavaScript fixtures inline in the test file when they are small and local to that behavior, such as `sampleData` in `app/javascript/stats/__tests__/StatsPage.test.jsx` and `app/javascript/stats/__tests__/statsStore.test.js`.

## Coverage

**Requirements:** Not detected

**View Coverage:**
```bash
# Not detected: no SimpleCov, nyc, Jest collectCoverage, or coverage script is configured.
```

## Test Types

**Unit Tests:**
- Model specs under `spec/models/` test validations, defaults, translations, scopes, and domain methods. Example: `spec/models/case_spec.rb`.
- Form specs under `spec/forms/` test ActiveModel validations and side effects. Example: `spec/forms/confirm_deletiong_form_spec.rb`.
- Service specs under `spec/services/` test parsing, formatting, SQL query behavior, caching, and orchestration. Examples: `spec/services/case_stats_service_spec.rb`, `spec/services/case_stats_service/query_spec.rb`, and `spec/services/case_stats_service/formatter_spec.rb`.
- Policy specs under `spec/policies/` use Pundit permission helpers. Example: `spec/policies/case_policy_spec.rb`.
- JavaScript helper, reducer, selector, and state tests live under frontend `__tests__` folders. Examples: `app/javascript/shared/__tests__/functions.test.js`, `app/javascript/stats/__tests__/statsStore.test.js`, `app/javascript/stats/__tests__/statsResponse.test.js`, and `app/javascript/redux/reducers/__tests__/cards.test.js`.

**Integration Tests:**
- Controller specs under `spec/controllers/` exercise Rails controller behavior with Devise helpers, response formats, headers, caching, and authorization. Example: `spec/controllers/cases/stats_controller_spec.rb`.
- Request specs under `spec/requests/` exercise app routes and session behavior. Example: `spec/requests/reader_spec.rb`.
- Mailbox specs under `spec/mailboxes/` use `ActionMailbox::TestHelper`, included for `type: :mailbox` in `spec/rails_helper.rb`.
- Frontend component tests with `react-testing-library` exercise rendering, events, async fetch flow, jsdom DOM behavior, and form values. Examples: `app/javascript/stats/__tests__/StatsPage.test.jsx`, `app/javascript/stats/__tests__/DatePicker.test.jsx`, and `app/javascript/reading_list/__tests__/HiddenFormInputs.test.jsx`.

**E2E Tests:**
- Capybara feature specs live under `spec/features/` and use Selenium Chrome through the driver registered in `spec/rails_helper.rb`.
- `.rspec` excludes `spec/features/**/*_spec.rb` by default; run browser specs explicitly when validating feature workflows.
- Feature specs use `feature`, `scenario`, `context`, and user-facing Capybara steps, as in `spec/features/signing_in_with_google_spec.rb`, `spec/features/viewing_a_case_spec.rb`, and `spec/features/editing_a_case_spec.rb`.
- Feature spec setup uses a fixed Capybara server port `4000`, a `1600x1200` browser window, and a Selenium URL of `http://selenium:4444/wd/hub` inside Docker, all configured in `spec/rails_helper.rb`.
- `rspec-retry` retries feature specs up to three times only for multi-file non-`NOT_HEADLESS` runs, configured in `spec/spec_helper.rb`.

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

```javascript
// Pattern from `app/javascript/stats/__tests__/StatsPage.test.jsx`
await act(async () => {
  await new Promise(resolve => setTimeout(resolve, 220))
})
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

```javascript
// Pattern from `app/javascript/stats/__tests__/statsResponse.test.js`
expect(() => parseApiStatsPayload(null)).toThrow('Invalid response')
expect(() => normalizeStatsPayload({ data: [], error: 'Nope' })).toThrow('Nope')
```

```ruby
# Pattern from `spec/controllers/cases/stats_controller_spec.rb`
sign_out reader
sign_in unauthorized_reader

get :show, params: { case_slug: kase.slug }

expect(response).to have_http_status(:forbidden).or have_http_status(:redirect)
```

**Authentication and Authorization:**
- Controller specs use Devise controller helpers such as `sign_in reader` and `sign_out reader`, included for `type: :controller` in `spec/rails_helper.rb`.
- Request specs use Devise integration helpers such as `sign_in reader`, included for `type: :request` in `spec/rails_helper.rb`.
- Feature specs use `Orchard::Integration::TestHelpers::Authentication` from `spec/support/integration/authentication.rb`, included for `type: :feature` in `spec/rails_helper.rb`.
- OmniAuth Google is placed in test mode globally in `spec/rails_helper.rb`; feature specs can exercise Google sign-in through UI flows such as `spec/features/signing_in_with_google_spec.rb`.

**Caching and Time-Sensitive Tests:**
- Clear Rails cache in specs that inspect cache behavior, as in `spec/controllers/cases/stats_controller_spec.rb` and `spec/services/case_stats_service_spec.rb`.
- Swap `Rails.cache` with `ActiveSupport::Cache::MemoryStore` inside `around` blocks when cache existence is part of the assertion, as in `spec/controllers/cases/stats_controller_spec.rb`.
- `ActiveSupport::Testing::TimeHelpers` is included globally in `spec/rails_helper.rb`; use helpers such as `travel_to` for deterministic time behavior, as in `spec/models/announcement_spec.rb`.

**Frontend DOM and Form Tests:**
- Wrap components that require translations in `IntlProvider`, as in `app/javascript/stats/__tests__/StatsPage.test.jsx` and `app/javascript/stats/__tests__/DatePicker.test.jsx`.
- Use `toHaveFormValues`, `toHaveTextContent`, and visibility matchers from `jest-dom` for DOM assertions, as in `app/javascript/reading_list/__tests__/HiddenFormInputs.test.jsx`.
- Reset jsdom state explicitly when tests mutate global DOM or URL state, as in `app/javascript/shared/spotlight/__tests__/SpotlightManager.test.js` and `app/javascript/stats/__tests__/statsStore.test.js`.

---

*Testing analysis: 2026-04-22*
