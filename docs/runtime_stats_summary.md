# Runtime Stats API Update

- `RuntimeController#stats` now emits JSON backed by
  `RuntimeStatsSerializer`.
- Introduced `RuntimeStatsSnapshot`, an ActiveModel wrapper that exposes the
  collected runtime metrics via attribute readers so serializers can operate
  on a stable interface.
- Added `RuntimeStatsSerializer` to list each metric section
  (`environment`, `process`, `gc`, `heap`, `objects`, `caches`, `redis`,
  `postgres`, `sidekiq`, `action_cable`, `warnings`) and ensure the response
  stays consistent as new data points are added inside the controller.

