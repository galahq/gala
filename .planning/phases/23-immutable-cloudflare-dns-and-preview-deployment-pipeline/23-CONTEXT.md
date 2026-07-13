# Phase 23 Context: Immutable Cloudflare DNS and Preview Deployment Pipeline

## Starting Point

Phase 22 completed AWS app CloudFront validation at `https://d3sn0yc7ms2w6o.cloudfront.net` while leaving Heroku production and `.com` DNS untouched.

The new requirement is to move the AWS deploy path toward `learngala.dev` and branch preview subdomains without changing `https://www.learngala.com`.

## Decisions

- SST remains the infrastructure source of truth.
- Cloudflare DNS is part of the cloud infrastructure for `learngala.dev`.
- The deploy workflow keeps only five manual inputs: `branch`, `stage`, `dry_run`, `invalidate_cache`, and optional `user_data`.
- Release IDs are derived by CI as `github_run_id.YYYYMMDDHHMMSS.shortsha`.
- Static assets are uploaded to immutable S3 prefixes under `releases/<stage>/<release_id>/`.
- Production deploys create GitHub releases, and Rails exposes release metadata in the global layout.
- Preview deploys comment the branch preview URL on the open PR when one exists.
- `https://www.learngala.com` remains out of scope.

## Risk Notes

- CloudFront alternate domain names cannot be shared freely across active distributions. SST Router now owns `learngala.dev`, `dev.learngala.dev`, and `*.dev.learngala.dev` on a shared CloudFront distribution; alias detachment is opt-in only for deliberate recovery from legacy aliased distributions.
- Cloudflare provider credentials must be supplied as GitHub Actions secrets and must not be logged.
- Full live verification requires AWS, Cloudflare, and GitHub Actions execution; local verification can cover shell/YAML/Ruby/TypeScript syntax only.
