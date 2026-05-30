# Phase 22 Context: AWS Edge Cache Validation and Catalog Load Optimization

## Trigger

Follow-up investigation after Phase 21 found that the AWS app is still serving `/cases.json` through the ALB/Rails path because the Phase 21 app CloudFront distribution is not live in AWS yet. Read-only checks on 2026-05-30 showed:

- AWS ALB `/cases.json`: about 5.59 seconds total, about 4.99 seconds Rails runtime, about 942 KB.
- Heroku `/cases.json`: about 1.42 seconds total, about 0.70 seconds Rails runtime, about 963 KB.
- Heroku response headers are `private, must-revalidate`, so Heroku is not faster because of public JSON CDN caching.
- AWS CloudFront distributions currently include the static asset distribution `d2q7dp7n8iglpb.cloudfront.net`, but not the Phase 21 app-edge distribution.

## Current Bottleneck

The primary remaining bottleneck is catalog JSON serialization and delivery for anonymous root catalog loads:

1. Root `/` loads the catalog React app.
2. The app fetches `/cases.json`, `/cases/features.json`, `/catalog/libraries.json`, `/tags.json`, plus private reader endpoints.
3. `/cases.json` is the slow path and spends most of its time serializing the public catalog preview payload.
4. Anonymous users also trigger private endpoint requests such as `/profile.json`, `/enrollments.json`, `/saved_reading_lists.json`, and `/managerships.json`, which return 401s and add avoidable network/app work.

## Router And Bucket Routing Finding

SST `Router` can front a URL origin and S3 bucket origins. It is viable for a future unified distribution that routes:

- app traffic to the SST web ALB,
- compiled static assets to the managed static asset bucket,
- and selected public paths to cacheable behaviors.

It is not a safe Phase 22 mechanism for `msc-gala` ActiveStorage media. ActiveStorage uses the retained `msc-gala` S3 bucket through Rails S3 service behavior, including signed blob URLs, variants, and download redirects. Routing that bucket directly through CloudFront would require a separate signed-media design and bucket access policy changes, which violates the current no-media-bucket-mutation boundary.

## Hard Constraints

- Do not mutate Heroku production at `https://www.learngala.com`.
- Do not mutate production DNS.
- Do not alter SES.
- Do not alter, re-policy, empty, lifecycle, or destructively sync the retained `msc-gala` ActiveStorage media bucket.
- Keep deployability through the existing SST GitHub Action path.
- Prefix AWS validation commands with `AWS_PROFILE=gala AWS_REGION=us-west-2`.

## Implementation Boundary

- Prefer validating and tuning the explicit Phase 21 `GalaAppDistribution` over replacing it with SST Router in this phase.
- Keep default app CloudFront behavior pass-through/no-cache.
- Add or tune cache behavior only for anonymous public root/catalog GET paths.
- Use server-side guards so signed-in, cookie-bearing, query-specific, or session-specific responses remain private.
- Reduce anonymous root network noise by skipping private reader fetches when `window.reader` is absent.

## Validation Boundary

Phase 22 should prove:

- the app CloudFront distribution exists after deploy,
- repeated anonymous catalog JSON requests hit CloudFront,
- private or cookie-bearing requests do not receive shared public responses,
- root catalog load avoids unnecessary 401 private requests for anonymous visitors,
- and no Heroku, SES, DNS, or `msc-gala` media bucket changes are required.
