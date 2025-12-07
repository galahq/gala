# Change Summary

## Monitoring & Alerting
- Migrated from `sentry-raven` to the modern `sentry-ruby` SDK suite (`sentry-ruby`,
  `sentry-rails`, `sentry-sidekiq`) to unlock structured logs (>=5.24.x).
- Added a real `Sentry.init` configuration (`config/initializers/sentry.rb`) that
  enables structured logs, emits environment/release metadata, and uses the Rails
  logger backend so log + error streams remain unified.
- Browser SDK bootstrap (`app/assets/javascripts/sentry.js.erb`) now sets the user
  via `Sentry.setUser`, exposes a `sentryLog` helper for “logs” parity, and keeps
  the sanitizing `beforeSend` guard. `ErrorBoundary.jsx` logs through the helper
  before capturing exceptions, and Flow has a typed definition (`flow-typed/sentry.js`).
- Rack::Attack emits a warning-level Sentry log for each blocked malformed
  `/cases/:slug/...` request, giving visibility into bot traffic before returning
  the 404 response.

## Memory Profiling
- Introduced `MemoryProfileLogger`, `MemorySnapshotJob`, and the optional
  `config/initializers/memory_profiling.rb` timer task. When
  `ENABLE_MEMORY_PROFILING` is set, a background `Concurrent::TimerTask`
  enqueues periodic RSS snapshots that get sent to Sentry with PID + RSS metadata.
- Added documentation describing the new runtime stats + memory logging flow
  (`docs/runtime_stats_summary.md`).

## Runtime Diagnostics
- `RuntimeController#stats` now wraps its payload in `RuntimeStatsSnapshot` and
  renders through `RuntimeStatsSerializer`, producing a stable JSON structure for
  environment/process/GC/object/cache/DB/Redis/Sidekiq/ActionCable metrics plus
  warning strings when thresholds are exceeded.
- `config/puma.rb` now centralizes timeout tuning (worker shutdown + persistent
  timeouts), disables keep-alives when supported, and defaults `WEB_CONCURRENCY`
  to two workers to match Standard-2X dynos—giving the runtime more predictable
  behavior in production.

## Bot Hardening
- `config/initializers/rack_attack.rb` now blocks only after counting contiguous
  numeric path segments (preventing false positives) and is covered by the new
  `spec/config/rack_attack_spec.rb` suite, which reloads the initializer per test
  to verify both the predicate logic and the middleware response codes.


