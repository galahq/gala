# Plan 08-01 Summary - Admin Route Checklist, Data Setup, and Auth Boundary Coverage

Status: COMPLETE

Implemented:

- Derived the Phase 8 checklist from `config/routes.rb`, documented route-backed substitutions for `admin/libraries` -> `admin/reading_lists`, and recorded representative browser/sample/data/auth evidence in `08-QA.md`.
- Added and documented a factory-backed editor dataset for admins, cases, readers, deployments, reading lists, and ordered Ahoy events.
- Added focused request/controller coverage for admin access boundaries, `POST /admin/cases/:id/copy`, Ahoy event ordering visibility, and Sidekiq editor gating in `spec/requests/admin_operations_routes_spec.rb` and `spec/controllers/admin/cases_controller_spec.rb`.

Verification:

- `docker compose run -e RAILS_ENV=test web bundle exec rspec spec/requests/admin_operations_routes_spec.rb spec/controllers/admin/cases_controller_spec.rb --format progress --color`
- Result: `11 examples, 0 failures`.

Residual notes:

- Admin shared `belongs_to` rendering compatibility work landed in Phase 8 follow-up (`app/views/fields/belongs_to/_index.html.erb`, `app/views/fields/belongs_to/_show.html.erb`) and is reflected in QA and final evidence.
