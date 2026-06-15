# Asset Pipeline

Gala uses Rails-rendered HTML with two asset paths:

- Sprockets for legacy files under `app/assets`.
- Shakapacker/Webpack for JavaScript and CSS packs under `app/javascript`.

Local development runs Rails, Sidekiq, and the Shakapacker dev server through
`Procfile.dev`. Rails serves HTML and the dev server serves packs.

Production assets are built during the Docker image build. Runtime fallback
compilation is disabled, so deploys must ship a precompiled image and a matching
static asset prefix. Fingerprinted static assets can be cached as immutable;
HTML and authenticated routes must stay private or short-lived.

ActiveStorage media is separate from static frontend assets. Rails generates
signed media URLs through the configured storage service, and AWS-hosted stages
use task-role credentials from the runtime environment.

Useful references:

- `Dockerfile.production`
- `config/environments/production.rb`
- `config/shakapacker.yml`
- `infra/sst.config.ts`
