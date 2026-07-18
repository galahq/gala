# AWS Gala Production Deployment Operator Runbook

This runbook covers Gala's SST deployment path. It never deploys or mutates the
existing Heroku app.

## Architecture

```text
Browser -> SST Router -> ECS Puma -> RDS PostgreSQL
                              |-> ElastiCache/Valkey
                              |-> /assets and /packs from the image
                              |-> media in external msc-gala
                              `-> external SES through SSM-backed SMTP credentials
```

The ECS worker and maintenance tasks share the same image, database, cache,
SSM parameters, and media-only S3 permissions.

## Immutable external dependencies

- `msc-gala` is the existing application media bucket.
- `gala-static-assets-353760060567` is retained for Heroku/legacy use.
- SES identities and SMTP credentials remain externally managed.

SST must not create, import, update, empty, or delete either bucket, and it must
not manage an SES resource. Rails serves compiled application assets from the
container, so `ASSET_HOST` is intentionally unset.

## Preview environments

SST Console owns pull-request previews. Configure the app's repository path as
`/infra` and match `pr-*` stages to AWS account `353760060567`. The config
rejects branch and tag autodeploy events; durable stages are never deployed by
a Git push.

## Required durable-deployment inputs

- reviewed Git ref;
- `stage=dev|production`;
- GitHub OIDC role `gala_oidc_service_role`;
- Cloudflare token/account variables in the selected GitHub environment; and
- the reviewed ARM64 `GALA_PRODUCTION_BASE_IMAGE` digest pinned in the workflow.

Production requires the protected `production` GitHub environment and an
operator with admin or maintain permission.

## Preflight

From `infra/`, using the reviewed ref:

```sh
AWS_PROFILE=gala SST_STAGE=production npm ci
AWS_PROFILE=gala SST_STAGE=production npm test
AWS_PROFILE=gala SST_STAGE=production npm run check
AWS_PROFILE=gala SST_STAGE=production npx sst diff --stage production
```

Stop if the diff includes:

- any S3 or SES mutation;
- replacement of the VPC, cluster, database, cache, or router;
- empty/missing SSM runtime parameters; or
- a production base image that is not ARM64.

Do not use Heroku configuration as a production deployment mechanism. The only
approved Heroku access in this migration is the documented read-only recovery
of four Google OAuth values.

## Deploy

Dispatch `.github/workflows/deploy.yml` at the reviewed ref with
`stage=production`. The workflow assumes AWS credentials and directly runs the
locally pinned CLI from `infra`:

```sh
npx sst deploy --stage "$SST_STAGE"
```

There is no release-channel, promotion, rollback, asset-upload, or Heroku
script in this path.

## Verify

1. Wait for ECS web and worker services to stabilize with desired equal to
   running, zero pending, and no failed tasks.
2. Confirm `/` and `/up` return HTTP 200.
3. Confirm HTML emits relative fingerprinted `/assets/*` and `/packs/*` URLs;
   each representative URL must return 200 and must not contain `bootstrap`.
4. Check application/Sentry logs for boot, database, cache, mail, or browser
   errors.
5. Run a final SST diff; it must be empty.
6. Compare read-only before/after metadata for both external buckets and stop
   if any identity, versioning, public-access, CORS, or policy digest changed.

## Rollback

Dispatch the last reviewed healthy Git ref to the same stage. Keep database
migrations backward compatible through the rollback window. Do not use Heroku,
S3 release channels, mutable ECR tags, or manual bucket edits as rollback
mechanisms.
