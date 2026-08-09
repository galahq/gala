# R14 memory reduction, caching, and asset-serving plan

Plan behind the changes on `upgrade/ruby-4-node-24-bp6` (August 2026). Goal:
stop Heroku R14 (memory quota exceeded) errors and get the app back to
`WEB_CONCURRENCY=2` on its Standard-2X (1 GB) web dyno.

## Context

- `WEB_CONCURRENCY` had been dropped to 1 to cope with R14s. Target: two Puma
  workers + master fitting under ~1000 MB, i.e. steady-state per-worker RSS
  ≤ ~430–450 MB.
- Verified live before planning: **jemalloc and YJIT were already active** on
  the dyno (`LD_PRELOAD` → apt libjemalloc, `MALLOC_CONF narenas:2`,
  `RUBY_YJIT_ENABLE=1`, `RUBY_YJIT_MEM_SIZE=64`). Allocator tuning was done;
  the remaining levers were boot footprint, per-request allocation spikes,
  cache efficiency, and image/variant traffic transiting Puma.
- Redis is `heroku-redis:mini` (25 MB) **shared** by Rails.cache, Sidekiq,
  rack-attack, and Action Cable — cache key cardinality and entry size matter
  as much as hit rate.
- Decisions made up front: CloudFront + Active Storage proxy mode (bucket goes
  private); cache-first catalog (defer pagination); re-add puma_worker_killer
  as a backstop; slim the inline `window.caseData` payload rather than migrate
  to fetch.

## Phase 0 — config only (no deploy)

1. Remove the stale `LD_LIBRARY_PATH` config var (points at
   `/app/vendor/ruby-3.2.6/lib`; the app runs Ruby 4.0.3).
2. Inspect the shared Redis (`heroku redis:info`); on a shared instance the
   eviction policy should be `volatile-lru` (cache keys have TTLs, Sidekiq
   keys don't — `allkeys-lru` would evict jobs).
3. Do **not** flip `WEB_CONCURRENCY=2` until after measuring the deployed
   changes.

## Phase 1 — small code edits, big wins (implemented)

### Memory / boot footprint

1. **Log level** `debug` → ENV-driven `info` (`production.rb`). Debug formats
   every SQL statement into strings per request (lograge + Sentry breadcrumbs
   + Papertrail volume).
2. **Sentry trimming**: dropped `params.to_unsafe_h` from the per-request
   scope extras; removed `:active_support_logger` from `breadcrumbs_logger`
   (it hooks all AS notifications regardless of log level).
3. **DB pool formula** (`database.yml`): was `(threads × workers) + 1` = 11
   connections *per process*; pools are per-process, so it's now
   `max(RAILS_MAX_THREADS, SIDEKIQ_CONCURRENCY) + 1`.
4. **Gem groups**: `factory_bot_rails` + `faker` out of production (their
   railtie loaded all 31 factory files in every dyno at boot; review apps get
   `BUNDLE_WITHOUT=""` in `app.json` so seeding still works). `awesome_print`
   (lograge formatter now uses `data.inspect`), `table_print`,
   `i18n_generators` → development only.
5. **Puma** (`puma.rb`): `GC.compact` before fork so the preloaded master heap
   stays copy-on-write-shared across workers; re-added `puma_worker_killer`
   (production, >1 worker only: ram 920 MB / 93%, 24 h rolling restart with
   splay) as a backstop while the real fixes prove out; dropped the
   Rails-8-redundant `on_worker_boot` reconnect.

### Per-request allocation spikes (the actual R14 drivers)

6. **Case eager-load deferral** (`cases_controller.rb`) — the top fix.
   `set_case` loaded every card, page, podcast, edgenote, and attachment blob
   on *every* request, including 304 revalidations and Rails.cache hits. The
   graph is now preloaded only inside the cache-miss render blocks (and
   `update`).
7. **Catalog fingerprint in SQL** (`catalog_controller.rb`): the visible-case
   set fingerprint was `pluck` of every visible case id into Ruby + SHA256 on
   every home request; now `md5(string_agg(...))` inside the existing
   aggregate query — one round trip, no id transfer.
8. **Dead cache invalidation removed**: `CatalogCacheInvalidation` ran 7
   `delete_matched` patterns per authoring edit — each a full keyspace SCAN of
   the Redis shared with Sidekiq — and 5–6 patterns could never match the real
   key layout. Keys are content-addressed (timestamps/counts/fingerprints), so
   edits rotate keys on their own; the service is deleted.
9. **Cache-size hygiene** for the 25 MB store: redis_cache_store now has
   `compress: true` (1 KB threshold), a connection pool, 1 s timeouts,
   `reconnect_attempts: 1`, and an error handler reporting to Sentry instead
   of raising; 30-day TTLs cut to 1 day (they never survived eviction anyway);
   the case-show **JSON** cache key/ETag no longer includes the session id
   (the JSON has no session-bound state — per-session keys wrote a fresh,
   never-reused entry to Redis on every sign-in). HTML keeps session scoping
   (it embeds `csrf_meta_tags` / `window.reader`).
10. **Freshness graph completed** so content-addressed keys are trustworthy:
    `Case#max_updated_at` now unions `pages` and `podcasts`; `touch: true`
    added on `Tagging→case` and toward `Reader` on `Enrollment`,
    `SpotlightAcknowledgement`, `Editorship`, `Managership` — so
    `reader.cache_key` is a real personalization version (enrolling, or
    dismissing a spotlight, rotates reader-scoped caches immediately).
11. **Auth micro-fixes**: `CasePolicy` `my_cases.include?(record)` →
    `exists?` for persisted records (in-memory `include?` kept for unsaved
    ones); `Reader#enrollment_for_case` no longer loads every enrollment (+
    cases) to find one row; `ReaderSerializer`/`readers/_reader.json.jbuilder`
    stop re-querying roles per role.
    *Deviation from the original plan:* `CaseDecorator#other_available_locales`
    keeps its per-translation Pundit loop — translations are few and the
    underlying policy calls became cheap; a scope-union rewrite would have
    subtly changed visibility for library-request/manager edge cases.
12. **Anonymous `cases#show`** no longer sets a session cookie (publicly
    cacheable responses must not `Set-Cookie`).

### Logout/auth-transition correctness (added during implementation)

Anonymous cacheable responses (catalog home, catalog JSON, case show) now send
`public, max-age=0, s-maxage=<ttl>` instead of long browser `max-age` +
`stale-while-revalidate`: browsers revalidate on every use (cheap 304 via
ETag), so signing in or out can never surface a page cached under the previous
auth state; long-lived caching moves entirely to `s-maxage` (the CDN, which
observes `no-store` on signed-in responses). Sign-out
(`shared/MainMenu.jsx`) already does a full navigation after the DELETE, so
the next `/` load always revalidates. See `docs/http_caching.md`.

## Phase 2 — Active Storage off Puma (CloudFront)

Currently redirect mode: every image request 302s through Puma to a 5-minute
signed S3 URL, and variants are generated inside Puma (vips spikes). The code
side is in place and **gated**:

- `production.rb` sets `resolve_model_to_route` to `:rails_storage_proxy` only
  when `CDN_ENABLED=true` (proxy without a CDN would stream every byte through
  Puma — strictly worse).
- Infra to create: one CloudFront distribution, origin = the Heroku app,
  behavior `/rails/active_storage/*` (cache by path, honor origin
  Cache-Control, Compress on). Optional second behavior for `/packs/*` +
  `/assets/*` via `ASSET_HOST`. Then lock the S3 bucket to private.
- Why not alternatives: `public: true`/public bucket keeps content
  world-readable and needs URL-host hacks; CloudFront+OAC direct-to-bucket
  can't generate variants on demand. Proxy-behind-CDN: each variant transits
  Puma once per edge, then never again.

## Phase 3 — deferred (only if still needed)

- Paginate `/cases.json` (+ React catalog changes).
- Case page fetches `/cases/:slug.json` with `preloadedState` instead of
  inline `window.caseData` (14 reducers read it at module scope); move
  `sign_in_form`/CSRF out of the serializer to a tiny uncached endpoint.
- Remove `Rack::Deflater` once CloudFront compresses (it buffers whole
  compressed bodies in Ruby).
- Administrate/Sidekiq::Web extraction, `virtus` removal, Redis plan upgrade
  or dedicated cache instance if pressure persists.

## Expected impact

| Change | Effect |
|---|---|
| Log level + Sentry trim | High — per-request allocation + I/O on every request |
| Gem group cleanup | ~20–40 MB boot RSS per process |
| GC.compact before fork | High — CoW sharing is what makes 2 workers fit |
| Eager-load deferral | Highest single spike fix |
| Fingerprint SQL + SCAN removal | Medium spikes + Redis/Sidekiq health |
| Cache compress/TTL/session-key | Hit rate on the 25 MB shared store |
| CloudFront + proxy mode | High — image/vips traffic off Puma permanently |
