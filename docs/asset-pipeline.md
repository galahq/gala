# Asset Pipeline

This document describes how Gala's web bundle is built locally, how it is built for production, and how production deployment should be shaped to maximize CDN cache hits for common pages like `/`.

Repo references:
- `docker-compose.yml`
- `vite.config.mjs`
- `config/initializers/assets.rb`
- `Dockerfile`
- `package.json`
- `config/environments/production.rb`
- `config/routes.rb`
- `app/javascript/application.js`
- `app/assets/stylesheets/application.sass`
- `app/views/layouts/application.html.erb`

Related docs:
- `docs/major-dependency-upgrade-analysis.md`

## 1. Local build flow

```mermaid
sequenceDiagram
    autonumber
    participant Dev as Developer
    participant DC as docker compose
    participant Web as web container
    participant JS as js service
    participant CSS as css service
    participant Rails as Rails server
    participant Propshaft as Propshaft
    participant FS as Source files
    participant Browser as Browser

    Dev->>DC: docker compose up
    DC->>Web: start web on app network
    DC->>JS: start Vite/Rollup watch
    DC->>CSS: start Sass watch
    Web->>Web: install gems + pnpm deps
    Web->>Rails: start Thruster + Rails on :3000/:3001
    Dev->>FS: edit Ruby / JS / SCSS / assets
    JS->>FS: write JS bundles to app/assets/builds
    CSS->>FS: write CSS bundles to app/assets/builds
    Browser->>Rails: GET /
    Rails->>Browser: HTML layout + Propshaft asset tags
    Browser->>Propshaft: request /assets/application.js and CSS
    Propshaft->>FS: read app/assets/builds outputs
    Propshaft->>Browser: browser-ready assets
    Browser->>Rails: XHR/fetch for JSON endpoints
    Rails->>Browser: app data
```

Notes:
- Local development runs directly through Docker Compose services:
  `web`, `worker`, `js`, `css`, `db`, and `redis`.
- Rails renders the HTML response and Propshaft serves browser-ready assets from
  `app/assets/builds`.
- The single JavaScript source entry is `app/javascript/application.js`; route
  behavior is loaded through the Rails-aware directory router under
  `app/javascript/routes`.
- The root route `/` is Rails `CatalogController#home`, not a static page.

## 2. Current production build flow

```mermaid
sequenceDiagram
    autonumber
    participant CI as CI / image builder
    participant Docker as Docker build
    participant Gems as Bundler
    participant Pnpm as pnpm
    participant RailsTask as rails assets:precompile
    participant Webpack as Shakapacker/Webpack
    participant Public as public/packs + manifest
    participant Image as Runtime image
    participant Heroku as Heroku dyno
    participant User as Browser

    CI->>Docker: build production image
    Docker->>Gems: bundle install
    Docker->>Pnpm: pnpm install
    Docker->>RailsTask: SECRET_KEY_BASE=build-placeholder rails assets:precompile
    RailsTask->>Webpack: compile JS/CSS entrypoints
    Webpack->>Public: emit hashed assets + manifest.json
    Docker->>Image: copy built app into production stage
    Image->>Heroku: release/run web dyno
    User->>Heroku: GET /
    Heroku->>User: HTML from Rails
    User->>Heroku: GET /packs/* fingerprinted assets
    Heroku->>User: static files with long cache headers
```

Notes:
- Production assets are precompiled during the Docker build, not on first request.
- `config.assets.compile = false`, so runtime fallback compilation is disabled.
- `public_file_server` serves static files with long-lived cache headers.
- Webpack splits vendor code and runtime chunks so stable shared bundles can stay cacheable across deploys when their content hash does not change.

## 3. Recommended production deploy flow for best CDN hit rate

```mermaid
sequenceDiagram
    autonumber
    participant Git as Git push / release
    participant CI as CI
    participant Build as Image build
    participant Assets as Fingerprinted /packs assets
    participant App as Rails origin
    participant CDN as CDN / edge cache
    participant User as Browser

    Git->>CI: trigger deploy
    CI->>Build: build production image and precompile assets
    Build->>Assets: emit hashed JS/CSS/fonts/images + manifest
    CI->>App: deploy new app version
    App->>CDN: serve /packs/* as immutable assets
    Note over CDN,Assets: Cache key = full asset URL with fingerprint
    User->>CDN: GET /packs/app-[hash].js
    CDN-->>User: HIT for common assets across many pages

    User->>CDN: GET /
    alt Anonymous request without session cookie
        CDN->>App: first miss for /
        App-->>CDN: cacheable HTML shell for anonymous users
        CDN-->>User: cache HIT on later anonymous requests
    else Signed-in or personalized request
        CDN->>App: bypass or very short TTL
        App-->>User: user-specific HTML
    end

    User->>CDN: GET /cases.json, /features.json, /libraries.json
    alt Public/shared API response
        CDN-->>User: cache HIT if response is marked public
    else Personalized API response like /profile.json
        CDN->>App: bypass cache
        App-->>User: private response
    end
```

## 4. What limits CDN hits on `/` today

The main limit is not JS/CSS caching. It is HTML caching for `/`.

Why:
- `/` is rendered by Rails via `CatalogController#home`.
- The home page preloads both public JSON and user-specific JSON like `profile.json`.
- The application layout and header can vary by signed-in state, locale, flash state, and terms-of-service redirect behavior.

That means the safest high-hit CDN strategy is:

1. Keep asset URLs fingerprinted and immutable.
2. Split anonymous HTML from personalized HTML.
3. Cache only the public APIs used by `/`.
4. Normalize the cache key for `/` so anonymous traffic does not vary on full cookie/header sets.
5. Use a short HTML TTL plus stale serving for `/`.
6. Purge `/` and public list endpoints when catalog-visible content changes.

## 5. Practical target architecture

```mermaid
sequenceDiagram
    autonumber
    participant Author as Admin/editor
    participant App as Rails app
    participant Cache as App cache / background jobs
    participant CDN as CDN
    participant Visitor as Anonymous visitor

    Author->>App: publish/update catalog-visible content
    App->>Cache: refresh cached homepage payload
    App->>CDN: purge / and public list endpoints

    Visitor->>CDN: GET /
    CDN->>App: MISS only when TTL expired or purged
    App->>App: render anonymous HTML shell
    App-->>CDN: HTML with short edge TTL
    CDN-->>Visitor: cached shell

    Visitor->>CDN: GET fingerprinted packs
    CDN-->>Visitor: long-lived HIT

    Visitor->>CDN: GET public JSON payloads
    CDN-->>Visitor: HIT when warm
```

## 6. Deployment recommendations

- Serve fingerprinted assets in `public/packs` with `Cache-Control: public, max-age=31536000, immutable`.
- Keep HTML for anonymous `/` cacheable at the CDN with a short edge TTL such as `s-maxage=300`.
- Use `stale-while-revalidate` and `stale-if-error` on anonymous HTML to improve hit rate without making content too stale.
- Treat authenticated HTML and `profile.json` as private and bypass CDN caching for those responses.
- Mark public catalog APIs as cacheable if they do not depend on session state.
- Purge only route-level HTML and public JSON endpoints on catalog changes; do not purge fingerprinted assets.
