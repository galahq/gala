# Phase 21 Validation

## Commands

- `ruby -c config/puma.rb` — passed.
- `ruby -c config/environments/production.rb` — passed.
- `ruby -c app/controllers/concerns/public_catalog_cache.rb` — passed.
- `ruby -c app/controllers/catalog/languages_controller.rb` — passed.
- `ruby -c app/controllers/cases_controller.rb` — passed.
- `AWS_PROFILE=gala AWS_REGION=us-west-2 npx sst diff --stage production` — passed.
- `docker compose run --rm -e RAILS_ENV=test -e DATABASE_URL=postgres://gala:alpine@db:5432/gala_test web bash -lc 'bundle exec rails db:drop db:create db:schema:load && bundle exec rspec spec/requests/catalog_routes_spec.rb'` — passed, 10 examples, 0 failures.

## SST Preview Notes

The read-only SST diff previewed:

- Create `GalaStaticAssetResponseHeaders`.
- Update `GalaStaticAssetsDistribution` to attach the response headers policy and retain on delete in production.
- Create `GalaAppDistribution`.
- Update `GalaWeb` task definition to 1024 CPU and 2048 MB memory.
- Update `GalaWorker` task definition CPU to 512.

The preview did not require changes to Heroku, production DNS, SES, or the retained `msc-gala` media bucket.

## Local Host Notes

- `bundle exec rspec spec/requests/catalog_routes_spec.rb` on the host initially could not run because the local Ruby environment was missing required bundle gems. `bundle install` resolved the missing gems, but host RSpec still could not connect to Postgres on `localhost:5432`.
- The request spec was therefore run successfully through Docker compose against the project DB service.
- `npx tsc --noEmit` in `infra/` is not a useful gate in the current SST install because it fails in generated SST/platform and dependency type declarations before reaching project config validation.

## Post-Deploy Smoke Checks

After the SST deploy GitHub Action finishes:

1. Capture the `appCdnUrl` output.
2. Request anonymous catalog JSON twice through the app CloudFront URL and confirm the second response can hit CloudFront:
   - `/cases.json`
   - `/cases/features.json`
   - `/catalog/languages.json`
   - `/catalog/libraries.json`
   - `/tags.json`
3. Confirm `Cache-Control` contains `public, max-age=60, s-maxage=60` for anonymous JSON.
4. Confirm a signed-in or cookie-bearing `/cases.json` response does not expose public cache headers.
5. Confirm a representative `/packs/*` and `/assets/*` response includes `Cache-Control: public,max-age=31536000,immutable`.
