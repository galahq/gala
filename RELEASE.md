# Release Process

Production and preview deployments run through `.github/workflows/deploy.yml`.

Required inputs are intentionally small:

- `branch`: selected branch to deploy.
- `stage`: `dev` for preview or `production` for release.
- `dry_run`: preview changes with `sst diff`.
- `invalidate_cache`: explicitly request CloudFront invalidation.
- `user_data`: optional comma-separated approved hooks such as `database_migrate`, `db_snapshot`, `restart_ecs`, `refresh_indices`, or `rake:<task>`.

Each deploy derives a release ID from `github_run_id.YYYYMMDDHHMMSS.shortsha` and stores assets under `s3://gala-static-assets-353760060567/releases/<stage>/<release_id>/`. The latest 10 release asset namespaces per stage are retained.

Production and dev app CloudFront distributions are stage-owned resources. Before promotion, the deploy script detaches `learngala.dev` and `*.learngala.dev` aliases from the currently active distribution, deploys/reuses the stage-owned SST CDN in production, lets Cloudflare DNS point to the active distribution, and prunes dormant stage distributions beyond the retained window.

Production releases create a GitHub release named `production.<release_id>`. The release heading includes the UTC release date plus commit-derived traits, and the body is the commit list.

Rollback is done by rerunning the same workflow against the branch or commit that produced the previous release. The SST source of truth owns the active AWS and Cloudflare DNS shape; old asset namespaces and dormant production app distributions remain available for the retained release window.
