# Staging test plan: memory + caching changes

Companion to `MEMORY_REDUCTION_PLAN.md`. Everything below is for
`msc-gala-staging` first; promote to `msc-gala` only after the staging checks
pass. Staging runs `RAILS_ENV=production`, so it exercises the real code
paths.

## 1. Before deploying

```sh
# Config hygiene (run against staging first, then production later):
heroku config:unset LD_LIBRARY_PATH -a msc-gala-staging   # stale Ruby 3.2.6 path (verify it exists there first: heroku config -a msc-gala-staging | grep LD_)
heroku config:set RAILS_LOG_LEVEL=info -a msc-gala-staging

# Redis: check the eviction policy on the shared instance.
heroku redis:info -a msc-gala-staging
# If maxmemory-policy is noeviction, switch (volatile-lru only evicts TTL'd
# cache keys, never Sidekiq's):
heroku redis:maxmemory -a msc-gala-staging --policy volatile-lru
```

Keep `WEB_CONCURRENCY` at its current value for the first deploy — the 2-worker
flip is step 5.

## 2. Deploy and smoke-test

Deploy the branch to staging, then:

```sh
BASE=https://msc-gala-staging.herokuapp.com

# Anonymous home: public with browser revalidation, no cookie
curl -sI $BASE/ | grep -iE 'cache-control|etag|set-cookie'
#   expect: Cache-Control: public, max-age=0, s-maxage=86400  — and NO Set-Cookie

# 304 revalidation works (substitute the ETag from the previous response)
curl -sI -H 'If-None-Match: <etag>' $BASE/ | head -1        # HTTP/1.1 304

# Anonymous case page (pick a published slug): same shape, no Set-Cookie
curl -sI $BASE/cases/<slug> | grep -iE 'cache-control|etag|set-cookie'

# Catalog JSON endpoints
curl -sI $BASE/cases.json | grep -iE 'cache-control|set-cookie'
```

In a browser:

- Sign in → home and case pages respond `Cache-Control: no-store` (devtools
  Network tab).
- **Log out → land on `/` → the page must show the logged-out state** (no
  avatar/menu). Press Back — the signed-in page must not be restored from
  cache. This is the regression the header change guards against
  (`spec/requests/catalog_routes_spec.rb` "serves the logged-out home page
  after sign out").
- Sign back in → your enrolled/unpublished cases appear in the catalog
  immediately (no 5-minute staleness — the new `touch: true` chain).
- Enroll in a case → it shows up in "My cases" on the next catalog load.
- Dismiss an onboarding spotlight → reload → it stays dismissed.
- As an editor, edit a card in a case → reload the case page → the edit is
  visible within the cache TTL (~2 min anon / ~30 s signed in), and Sidekiq
  (`/sidekiq`) shows no `delete_matched`-related slowness on the high queue.

## 3. Watch memory and logs (24 h)

- `GET /runtime/stats` (editor login) — record worker RSS after warm-up and
  again hours later. Target: steady-state ≤ ~430–450 MB per worker.
- Heroku dashboard → Metrics → Memory for the web dyno.
- Papertrail: search `R14` (should be absent) and `PumaWorkerKiller` (rolling
  restarts log; a *threshold* kill firing repeatedly means RSS is still too
  high — investigate before flipping concurrency).
- Sentry: cache-store errors now arrive as warnings (`error_handler`) instead
  of 500s; check nothing is spamming.
- Log volume should drop sharply with `RAILS_LOG_LEVEL=info`. To debug an
  incident: `heroku config:set RAILS_LOG_LEVEL=debug -a <app>` (no deploy
  needed), then set it back.

## 4. Review app check

`factory_bot_rails`/`faker` moved out of the production gem group; review apps
now rely on `BUNDLE_WITHOUT=""` in `app.json`. Open a PR, let the review app
build, and confirm `postdeploy` (`db:structure:load db:seed`) succeeds.

## 5. Flip to two workers

Once staging RSS looks right:

```sh
heroku config:set WEB_CONCURRENCY=2 -a msc-gala-staging
```

- Note: at 2 workers `preload_app!` activates for the first time in a while —
  watch boot logs for fork/connection errors.
- Watch memory for another day. Fallback levers, in order:
  `RAILS_MAX_THREADS=3` (also shrinks the DB pool), then rely on the
  puma_worker_killer backstop (tunable via `PUMA_WORKER_KILLER_RAM`, default
  920 MB).

## 6. Promote to production

Repeat steps 1, 2 (spot checks), 3, and 5 against `msc-gala`. Suggested order:
config vars → deploy → 24 h watch at `WEB_CONCURRENCY=1` → flip to 2.

## 7. Phase 2 when ready: CloudFront for Active Storage

1. Create a CloudFront distribution: origin `msc-gala-staging.herokuapp.com`
   (later a second one for production), behavior `/rails/active_storage/*`:
   cache policy keyed on path only, honor origin `Cache-Control`, Compress on.
2. `heroku config:set CDN_ENABLED=true -a msc-gala-staging` — this flips
   Active Storage to proxy mode (the code is already gated on this var). Do
   **not** set it before the distribution is live: proxy mode without a CDN
   streams every image byte through Puma.
3. Verify: case cover images and edgenote media load via the CDN URL path,
   second load is a CDN hit (`X-Cache: Hit from cloudfront`), and Puma stops
   serving a 302 per image.
4. Optionally add a `/packs/*` + `/assets/*` behavior and set
   `ASSET_HOST=https://<dist>.cloudfront.net`.
5. Lock the S3 bucket to private (remove the public-read policy; the app
   accesses it with SDK credentials). Staging note: staging shares the
   production bucket unless `S3_BUCKET` is overridden — lock it down only
   after **both** apps are on proxy mode.

## Local measurement (optional, before/after comparisons)

```sh
bundle exec derailed bundle:mem                       # gem boot footprint
RAILS_ENV=production SECRET_KEY_BASE=x bundle exec derailed exec perf:mem_over_time
# TEST_PATH=/cases/<slug> to exercise the eager-load deferral
```

## What changed where (quick reference for review)

- `config/environments/production.rb` — log level, redis cache options, gated
  proxy mode
- `config/puma.rb` — GC.compact before fork, puma_worker_killer
- `config/database.yml` — per-process pool formula
- `Gemfile` / `app.json` — gem groups, review-app `BUNDLE_WITHOUT`
- `app/controllers/cases_controller.rb` — eager-load deferral, JSON cache key
  without session, anonymous session skip, `max-age=0` headers
- `app/controllers/catalog_controller.rb` — SQL fingerprint, headers, TTL
- `app/controllers/concerns/public_catalog_cache.rb` — headers, TTL
- `app/jobs/edit_broadcast_job.rb` (+ deleted
  `app/services/catalog_cache_invalidation.rb`) — no more Redis SCANs
- `app/models/{case,tagging,enrollment,spotlight_acknowledgement,editorship,managership,reader}.rb`
  — freshness/touch chain, enrollment lookup
- `app/policies/case_policy.rb`, `app/serializers/reader_serializer.rb`,
  `app/views/readers/_reader.json.jbuilder` — query micro-fixes
- `spec/requests/{catalog,case}_routes_spec.rb` — updated + new regression
  specs (logout, cross-session JSON ETag, no Set-Cookie)
- `docs/http_caching.md` — policy doc updated to match
