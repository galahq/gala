# Phase 08 Summary - Admin and Operations

## Goal

Stabilize the routed admin and operations surfaces from `config/routes.rb` by validating the shared admin shell, the custom case copy flow, `admin/ahoy/events`, and editor-gated `/sidekiq` access without broad redesign or auth-model changes.

## Plans Completed

- Plan 01: route checklist, dataset recipe, and targeted request/controller coverage
- Plan 02: representative browser QA, copy-flow validation, Ahoy ordering validation, and Sidekiq landing-page smoke test

## Requirements Coverage

- `ADM-01`: representative routed admin resources render for editors with the existing admin shell
- `ADM-02`: `admin/cases/:id/copy` remains functional and editor-only
- `ADM-03`: `admin/ahoy/events` and editor-gated `/sidekiq` stabilize with route-backed verification
- `QA-01` to `QA-04`: covered by targeted specs plus browser evidence in `08-QA.md`

## Changed Areas

- Added Phase 8 QA evidence and final status in `08-QA.md`
- Added Phase 8 request/controller coverage in:
  - `spec/requests/admin_operations_routes_spec.rb`
  - `spec/controllers/admin/cases_controller_spec.rb`
- Narrow admin rendering fixes:
  - `app/views/fields/belongs_to/_index.html.erb`
  - `app/views/fields/belongs_to/_show.html.erb`
  - `app/dashboards/ahoy/event_dashboard.rb`
  - `app/models/ahoy/event.rb`

## Tests Run

- `docker compose run -e RAILS_ENV=test web bundle exec rspec spec/requests/admin_operations_routes_spec.rb spec/controllers/admin/cases_controller_spec.rb --format progress --color`
- Result: `11 examples, 0 failures`

## QA Evidence

- Route checklist, auth/access evidence, browser findings, copy redirect destination, Ahoy newest-first validation, and `/sidekiq` landing-page smoke notes are recorded in `08-QA.md`.

## Route Substitution

- `config/routes.rb` does not expose `admin/libraries`, so Phase 8 used `admin/reading_lists` as the route-backed substitute representative resource.

## Remaining Non-Blocking Risk

- Public app-shell console noise still exists outside the sampled admin routes after the mock sign-in redirect, including legacy React/styled-components warnings and an unrelated Mapbox `404`. These did not block Phase 8 because the routed admin and Sidekiq surfaces themselves rendered and behaved correctly.
