# HTTP caching policy

Gala serves some high-traffic pages and JSON endpoints with HTTP cache headers
so browsers and the CDN can reuse them. This document records the rules those
responses must follow, why, and how to check them.

## The invariant: signed-in responses are never cacheable

Any response rendered for a signed-in reader must be sent with
`Cache-Control: no-store`. Signed-in responses embed per-session and per-reader
state:

- `window.reader` (serialized profile, `unacknowledgedSpotlights`) and
  `csrf_meta_tags`, inlined into every HTML document by
  `layouts/application.html.erb`
- policy-scoped JSON (`cases#index` visibility, `features#index` enrollments)

If such a response lands in the browser cache, navigating back to the page
replays stale auth state: the sign-in button shows the wrong state after
sign-out, dismissed onboarding spotlights reappear, and the stale CSRF token
makes subsequent non-GET requests fail with 422s. If it lands in a shared
cache (CloudFront), one reader's page — CSRF token and profile included — can
be served to *other* visitors, which is a security incident, not just a bug.

Both failure modes happened on staging in August 2026, caused by the
Ruby 4 / Node 24 / Blueprint 6 upgrade branch introducing `public, s-maxage`
headers on signed-in catalog and case pages.

### Where the invariant is enforced

- `CatalogController#set_catalog_home_cache_headers` — the home page.
  Signed-in requests also skip the `stale?` conditional GET entirely, because
  acknowledging a spotlight doesn't touch `reader.updated_at`, so any
  reader-level ETag would still revalidate a stale spotlight queue to a 304.
- `CasesController#set_case_show_cache_headers` — case pages (HTML and JSON).
- `PublicCatalogCache#set_public_catalog_cache_headers` — the catalog JSON
  endpoints (`/cases.json`, `/cases/features.json`, `/tags.json`,
  `/catalog/libraries.json`, `/catalog/languages.json`).

Anonymous responses are sent with `public, max-age=0, s-maxage=<ttl>`: shared
caches (CloudFront) may hold them for the TTL, but browsers must revalidate on
every use. Revalidation is a cheap conditional GET (304 via the ETag), and it
guarantees an auth transition — signing in or out — is picked up on the very
next navigation instead of whenever a long browser `max-age` happens to
expire. The long-lived caching lives in `s-maxage`, where the CDN observes
`no-store` on signed-in responses and can be invalidated centrally.

### ETag rules

- The catalog home ETag includes a reader component (`anonymous` for signed-out
  requests). This guarantees an anonymous request can never 304-revalidate a
  signed-in body a browser cached before this policy existed.
- The case show **HTML** ETag and `Rails.cache` key include a hashed session
  id (`CasesController#case_show_session_key`). The cached case HTML fragment
  contains the full `with_header` layout — `csrf_meta_tags` included — so
  neither the ETag nor the server-side fragment may outlive the session that
  rendered it. Without this, a reader signing out and back in within the cache
  TTL would receive HTML carrying the dead session's CSRF token.
- The case show **JSON** ETag and `Rails.cache` key deliberately omit the
  session id: the JSON payload contains no session-bound state, and a
  session-scoped key would write a fresh, never-reused fragment to Redis on
  every sign-in.

Server-side `Rails.cache` fragments remain in use for signed-in requests
(keyed by reader and, for case pages, session) — `no-store` governs only what
browsers and shared caches may keep.

### How to verify

```sh
# Anonymous: public caching
curl -sI localhost:3000/ | grep -i cache-control       # public, max-age=…
# Signed in (any authenticated session cookie): no caching
curl -sI -H "Cookie: _gala_session=…" localhost:3000/  # no-store
```

Request specs asserting the policy live in
`spec/requests/catalog_routes_spec.rb` and `spec/requests/case_routes_spec.rb`
(look for the `no-store` examples). In development, note that rack-mini-profiler
overwrites `Cache-Control` and preserves the original value in the
`X-MiniProfiler-Original-Cache-Control` header.

## Client-side hardening (same incident)

The staging incident was noisy because several client paths failed silently or
loudly in the wrong way. These are now fixed in `shared/orchard.js` and the
spotlight stack:

- `Orchard` raises `OrchardError('Malformed response')` instead of an uncaught
  `SyntaxError` when a 422 arrives as an HTML page (e.g. a CSRF failure), and
  `OrchardError('Unexpected redirect')` when a JSON request is redirected to a
  non-JSON page (e.g. by a `before_action` like `confirm_tos`) — previously
  that HTML body was returned to the caller as a *success*.
- The sign-out click in `shared/MainMenu.jsx` catches request failures and
  still navigates home. `MainMenu` renders entirely from a one-shot read of
  `window.reader`, which is why signed-in documents must never be HTTP-cached.
- `SpotlightManager` logs failed acknowledgement POSTs (via
  `ignoreClientError`) instead of leaving unhandled rejections, evaluates its
  `_visible` getter once per notify pass, and its document-position comparator
  tolerates detached refs.
- `MaybeSpotlight` always renders the same component tree whether or not it
  has a `spotlightKey`, so toggling the key (as `overview/StatusBar.jsx` does
  while editing) no longer remounts its children; only the first catalog
  category section subscribes the `catalog_categories` spotlight.
- `packs/onboarding.js` enables the spotlight manager once (`setTimeout`),
  not every second (`setInterval`).

## Preload notes

The `<link rel="preload" as="fetch" crossorigin="anonymous">` tags in
`catalog/home.html.erb` are correct as written and should keep the
`crossorigin` attribute: for a *same-origin* URL, `crossorigin="anonymous"`
produces mode `cors` + credentials `same-origin`, which both sends cookies and
exactly matches the `fetch` requests `Orchard.harvest` makes — removing the
attribute would change the preload's credentials mode to `include` and stop it
matching. If preloads appear unused in devtools, suspect stale cached HTML
(see above) before suspecting the markup.
