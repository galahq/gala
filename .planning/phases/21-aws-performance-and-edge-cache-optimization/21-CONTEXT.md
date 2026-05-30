# Phase 21 Context: AWS Performance and Edge Cache Optimization

## Trigger

AWS read-only checks on 2026-05-30 showed the perceived AWS slowness is dominated by public catalog JSON serialization rather than static asset transfer:

- AWS `/cases.json`: about 3.05s total, about 2.48s Rails runtime, about 942 KB response.
- CloudWatch for the same request: about 2471 ms total, about 2210 ms view/serialization, about 259 ms DB.
- AWS `/`: usually about 0.18s-0.38s Rails runtime, one slow sample about 0.76s.
- Heroku `/cases.json`: about 1.10s total and about 0.64s Rails runtime.
- Major static pack files already return from CloudFront quickly, but static S3 objects lacked explicit browser-facing `Cache-Control`.
- ECS `GalaWeb` memory was tight, averaging about 89% and peaking near 96% on 1 GB tasks while CPU was low.

## Hard Constraints

- Do not mutate Heroku production at `https://www.learngala.com`.
- Do not alter production DNS in this phase.
- Do not alter SES.
- Do not alter or destructively modify the retained `msc-gala` ActiveStorage/media bucket.
- AWS inspection or preview commands must use `AWS_PROFILE=gala AWS_REGION=us-west-2`.

## Implementation Boundary

- `infra/sst.config.ts`: safe app CloudFront distribution, static asset response headers, web/worker CPU tuning, production web memory tuning.
- `scripts/deploy-sst.sh`: immutable cache metadata for uploaded fingerprinted `/assets/*` and `/packs/*`.
- Public catalog controllers: anonymous JSON cache headers and short Rails cache serialization reuse.
- `config/puma.rb`: production worker/thread concurrency and ActiveRecord worker boot reconnect.

## Rollout Shape

1. Deploy app code and SST changes to AWS through the existing GitHub Actions SST deploy path.
2. Validate the generated app CloudFront URL separately from Heroku and production DNS.
3. Confirm public anonymous catalog JSON cache behavior with repeated GETs and CloudFront cache headers.
4. Confirm signed-in or cookie-bearing requests are not publicly cached.
5. Leave `https://www.learngala.com` on Heroku until a separate DNS cutover phase is approved.
