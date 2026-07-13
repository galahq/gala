---
phase: 22
plan: 1
type: summary
status: complete
completed_at: "2026-05-30T10:44:07Z"
commit: 3f2a0394b42b954a9bd27c44f1269fd69885b6a3
deploy_run: 26681591794
---

# Summary: App Edge Cache Validation And Catalog Load Optimization

## Completed

- Deployed Phase 21 app CloudFront through `.github/workflows/deploy.yml` and confirmed `GalaAppDistribution` exists as `EF4NIYHMN17KT` / `https://d3sn0yc7ms2w6o.cloudfront.net`.
- Validated the app edge path before follow-up changes: repeat anonymous `/cases.json` became a CloudFront hit at about `0.18s`, faster than Heroku `/cases.json` samples around `1.05s-1.26s`.
- Raised anonymous public catalog JSON cache headers and CloudFront behavior TTLs from 60 seconds to 300 seconds.
- Kept cookie-bearing catalog JSON requests private by excluding requests with cookies from the public catalog cache guard.
- Removed anonymous-only private catalog preloads and client fetches for `/profile.json`, `/enrollments.json`, `/saved_reading_lists.json`, and `/managerships.json`.
- Skipped root HTML caching because the root layout is still personalized by signed-in `window.reader` state and remains safely private/pass-through.
- Kept Heroku production, production DNS, SES, and the retained `msc-gala` ActiveStorage media bucket unchanged.

## Post-Deploy Validation

- GitHub Actions deploy `26681591794` completed successfully with image `353760060567.dkr.ecr.us-west-2.amazonaws.com/gala:3f2a0394b42b954a9bd27c44f1269fd69885b6a3`.
- ECS `GalaWeb` stabilized on task definition revision `:10` after the GitHub Action completed.
- App CloudFront distribution status: `Deployed`, origin `galawebloadbala-chdmccbn-1073735116.us-west-2.elb.amazonaws.com`.
- Fresh anonymous `/cases.json` through CloudFront:
  - first request: miss, `1.97s` total, `x-runtime=1.44s`, `Cache-Control: max-age=300, public, s-maxage=300, stale-while-revalidate=60`
  - second request: hit, `0.19s` total
- Cookie-bearing `/cases.json` through CloudFront:
  - first request: miss, `1.95s` total, `Cache-Control: max-age=0, private, must-revalidate`
  - second request: miss, `2.05s` total, still private
- Other public catalog JSON paths (`/cases/features.json`, `/catalog/libraries.json`, `/tags.json`, `/catalog/languages.json`) also returned CloudFront hits on repeat requests with 300-second public cache headers.
- Query/private variants stayed uncached:
  - `/cases.json?unexpected=1`: repeated CloudFront misses with `max-age=0, private, must-revalidate`
  - `/tags.json?q=earth`: repeated CloudFront misses with private headers
  - `/search.json?q=earth`: repeated CloudFront misses with private headers
- Anonymous root HTML stayed private and no longer preloaded signed-in endpoints; preload list is now only `/cases.json`, `/cases/features.json`, `/tags.json`, and `/catalog/libraries.json`.
- Direct ALB `/up` and app CloudFront `/up` returned `200`.

## Verification

- `pnpm test -- app/javascript/catalog/__tests__/readerData.test.js` passed. Because of the package script shape, Jest ran the full `app/javascript` suite: 20 suites passed, 1 skipped, 103 tests passed.
- `bundle exec ruby -c app/controllers/concerns/public_catalog_cache.rb` passed.
- `bundle exec ruby -c spec/requests/catalog_routes_spec.rb` passed.
- `pnpm exec tsc --noEmit --pretty false` passed.
- `git diff --check` passed.
- `AWS_PROFILE=gala AWS_REGION=us-west-2 SST_STAGE=production ... npx sst diff --stage production` showed the intended `GalaAppDistribution` TTL updates plus normal ECS task definition churn for the new image.

## Blocked Verification

- `bundle exec rspec spec/requests/catalog_routes_spec.rb` could not run locally because Postgres was not listening on `localhost:5432`.

## Router Decision

SST Router remains viable for a future consolidation phase that routes managed static assets and the ALB through a single CloudFront entrypoint. It was not adopted here because the explicit distribution is already deployed and easier to reason about safely.

The retained `msc-gala` ActiveStorage/media bucket remains out of scope for `routeBucket` or bucket-policy changes. Serving that bucket through CloudFront needs a separate signed-media design for ActiveStorage downloads, variants, and private object behavior.
