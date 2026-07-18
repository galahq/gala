# Simplified SST Configuration Design

## Goal

Simplify `infra/sst.config.ts` using current SST patterns, remove the broken
`releases/bootstrap` asset URL, reduce GitHub CI to the complete Rails and
JavaScript test suites, and move pull-request previews to SST Console
Autodeploy. Deploy the resulting application to the `dev` stage without
mutating S3 or SES. Heroku and production remain untouched.

## Constraints

- Use `AWS_PROFILE=gala` and `SST_STAGE=dev` for every AWS or SST command.
- Deploy only to the `dev` SST stage.
- Do not run state-changing Heroku commands or deploy to Heroku.
- The sole Heroku exception is read-only `heroku config:get` access to the
  existing `msc-gala` app for value-free hash comparison of the four Google
  OAuth keys absent from production SSM. No Heroku configuration may be
  written.
- Treat both `msc-gala` and `gala-static-assets-353760060567` as external,
  pre-existing buckets. SST must not create, import, update, empty, or delete
  either bucket.
- Keep SES external. SST must not create, update, or delete SES resources.
- GitHub Actions must not create, remove, or comment on pull-request preview
  environments. SST Console owns that lifecycle.
- `.github/workflows/deploy.yml` must invoke the locally pinned SST CLI
  directly; it must not dispatch through `scripts/deploy-sst.sh`.
- `.github/workflows/ci.yml` runs only the complete Rails RSpec suite and the
  JavaScript Vitest suite. It must not generate custom summaries or reports.
- Preserve the SSM-backed SES SMTP credentials needed by both ECS and Heroku.
- Preserve the existing durable VPC, cluster, PostgreSQL, Redis, router, ECS
  service, task, and SSM parameter identities unless a reviewed diff proves a
  change is safe.
- Keep the integration branch as one commit on top of `c4151711`.

## Selected Approach

Use a conservative, in-place simplification of `infra/sst.config.ts`.

This approach removes unused static-asset infrastructure and repeated runtime
configuration while retaining the existing SST component names and stage
topology. It is safer than splitting the configuration into several modules or
rebuilding the stack from new components because either alternative would
increase the diff and the chance of resource replacement.

The implementation follows the current SST configuration, Service, Router,
and global-context guidance:

- <https://sst.dev/docs/reference/config>
- <https://sst.dev/docs/component/aws/service/>
- <https://sst.dev/docs/component/aws/router/>
- <https://sst.dev/docs/configure-a-router>
- <https://sst.dev/docs/reference/global>
- <https://sst.dev/docs/console/>

The Console behavior was also checked against pinned revisions of SST's
open-source repositories. The config contract defines pull-request `pushed`
and `removed` events and permits `target` to return `undefined`; the Console
runner sets `SST_STAGE` and selects `sst deploy` or `sst remove`; and the
Console parser skips a deployment when a custom target returns `undefined`:

- <https://github.com/anomalyco/sst/blob/a0bd20f762883e72a35caccb4896c42ce5b3f707/platform/src/config.ts>
- <https://github.com/anomalyco/console/blob/ed7a8bc5558209fdc804d9347a67ac4fa96d86a3/packages/build/buildspec/index.mjs>
- <https://github.com/anomalyco/console/blob/ed7a8bc5558209fdc804d9347a67ac4fa96d86a3/packages/backend/src/function/run/config-parser.ts>

## Architecture

The configuration has four responsibilities:

1. Validate the stage and derive its hostname, capacity, and durability.
2. Create or reference the stage's VPC, cluster, PostgreSQL, Redis, router, and
   SSM parameters.
3. Define one shared container configuration for Rails workloads.
4. Define the web, worker, migration, seed, index-refresh, and weekly-report
   workloads.

The request and integration flow is:

```text
Browser -> SST Router -> ECS web service -> Rails
                                      |-> /assets and /packs from the image
                                      |-> uploads/media in existing msc-gala
                                      `-> email through existing SES credentials
```

Preview stages continue to share dev's network, router, database, cache, and
SSM parameters. Durable stages keep their current resource identities and
protection settings.

## SST Console Autodeploy

`console.autodeploy.target` explicitly accepts only pull-request events and
returns the stage `pr-<number>` for both `pushed` and `removed` actions. Branch
and tag events return `undefined`, so SST Console cannot deploy the durable
`dev` or `production` stages from a Git push.

This matches SST 4.7.1's native preview lifecycle: opening or updating a pull
request deploys `pr-<number>`, and closing or merging it removes that stage.
No custom Console workflow is needed; SST's default workflow installs the
detected package manager dependencies and runs `sst deploy` or `sst remove`
with `SST_STAGE` already set by Console.

The SST Console app setting must connect the Gala GitHub repository with:

- config path `/infra`, where `sst.config.ts` and the pinned SST CLI live;
- an environment matching `pr-*` in AWS account `353760060567`; and
- the Cloudflare environment variables required by preview routing.

Console owns the preview build log, update permalink, resource view, stage
outputs, and preview URL. GitHub Actions does not create a deployment, post a
pull-request comment, or construct a preview hostname.

Durable deployments remain explicit `workflow_dispatch` operations in
`.github/workflows/deploy.yml`.

## GitHub Workflows

`deploy.yml` has only a manual durable deployment job. It retains the explicit
`dev` or `production` stage choice, environment gate, operator authorization,
GitHub OIDC credentials, pinned Node setup, and `npm ci` in `infra`. Its deploy
step runs the local CLI directly from `infra`:

```sh
npx sst deploy --stage "$SST_STAGE"
```

The pull-request trigger, preview job, free-form `user_data` input, preview
comment, and `scripts/deploy-sst.sh` indirection are removed. The obsolete
dispatcher is deleted once repository search confirms it has no remaining
runtime caller; historical design documents are retained as historical
records.

`ci.yml` contains one ordinary CI job on an x86-64 Ubuntu runner so local
Chrome can execute the existing Selenium feature specs. It provides PostgreSQL
and Redis, installs the existing Ruby and Node dependencies, prepares the test
database, and runs exactly these test commands:

```sh
bundle exec rspec
pnpm test
```

The RSpec command includes all 26 feature specs. CI no longer performs SST or
infrastructure checks, deployed-site smoke tests, Playwright checks, custom
commit statuses, suite collection, triage generation, report rendering,
artifact uploads, or writes to `GITHUB_STEP_SUMMARY`. `workflow_dispatch`, if
retained for manual reruns, has no smoke URL or other deployment input.

## Static Assets

The production Docker build already precompiles Rails and Shakapacker assets
into `public/assets` and `public/packs`. `RAILS_SERVE_STATIC_FILES=true` makes
those files available from the web container.

The simplified runtime omits `ASSET_HOST`. Rails therefore emits relative,
fingerprinted URLs such as `/assets/application-<digest>.css` and
`/packs/js/catalog-<digest>.js`. Browser-visible asset URLs must never include
`bootstrap` or `releases/bootstrap`.

The SST configuration no longer creates, imports, or reads a static-assets
bucket or CloudFront distribution. It also removes
`GALA_STATIC_ASSETS_BUCKET` and `GALA_RELEASE` from ECS environment variables
and removes static-bucket permissions from ECS task roles.

The existing dev SST state has already recorded `retainOnDelete: true` on the
`GalaStaticAssets` component and each child, including the S3 bucket, bucket
policy, public-access block, CORS configuration, and CloudFront distribution.
This is the persisted effect of the already-deployed durable-stage
`removal: "retain-all"` policy. Removing those declarations therefore retires
them from SST state without calling AWS delete APIs. The existing bucket and
distribution remain in AWS unchanged for Heroku or legacy operational needs.

## S3 and SES Boundaries

`msc-gala` remains an external application dependency. ECS receives only the
permissions required by the current Rails upload and media-read paths:

- `s3:ListBucket` on `arn:aws:s3:::msc-gala`
- `s3:GetObject` and `s3:PutObject` on `arn:aws:s3:::msc-gala/*`

The configuration must not instantiate an SST or Pulumi S3 bucket component.
It may use the bucket name and ARN as immutable configuration values.

SES remains external. Rails continues to receive `SES_SMTP_USERNAME` and
`SES_SMTP_PASSWORD` from the existing SSM parameter ARNs. No SES identity,
configuration set, SMTP credential, policy, or other SES resource is declared
in SST.

## Runtime Configuration

The existing durable-stage secret-to-SSM bridge is retained because SST
Service's `ssm` property expects Parameter Store or Secrets Manager ARNs. SST
secret values must be written using `new sst.Secret(name).value`, never the
resource object.

Preview stages continue referencing the durable dev parameters under
`/gala/dev/*`. Shared web, worker, and task settings are defined once and
specialized only for command, compute, scaling, load balancer, or schedule.

The configuration retains immediate errors for unsupported stages and for a
missing `GALA_PRODUCTION_BASE_IMAGE`.

## Secret Inventory and Temporary Export

Before changing runtime configuration, create a private temporary directory
outside the repository with `mktemp -d` under `/private/tmp`. The directory
must have mode `0700`; exported files must have mode `0600`. Nothing from the
directory is copied into the worktree, added to Git, printed to the terminal,
or included in tool output.

Create two dotenv-compatible snapshots:

- `dev.env` contains the decrypted values currently stored under
  `/gala/dev/*` in SSM Parameter Store.
- `production.env` contains the decrypted values currently stored under
  `/gala/production/*` plus the four Google OAuth values from SST's production
  secret store. Read-only `heroku config:get` calls hash-check values when
  Heroku has them; the legacy pair matches and the migration pair is empty on
  Heroku, so only SST contains the complete production set.

The four read-only Heroku keys are:

- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `GOOGLE_MIGRATION_CLIENT_ID`
- `GOOGLE_MIGRATION_CLIENT_SECRET`

The export is a faithful recovery snapshot, so it includes existing PostHog
values when present even though the simplified SST runtime does not consume or
recreate PostHog configuration. The application continues using Sentry.

Create a third private `inventory.json` containing only stage, key name,
source, string length, and SHA-256 digest. It must not contain secret values.
Use this inventory to confirm every required runtime key is non-empty, is not a
known placeholder, and matches its exported source without revealing values.

The export is read-only with respect to AWS and Heroku. It may capture
`sst secret list` only inside a non-printing process that writes the private
snapshot; it must not emit values or call SSM `PutParameter`, Secrets Manager
writes, `sst secret set`, or `heroku config:set`. The final handoff reports only
the temporary directory path, permissions, inventory counts, cross-check
counts, and missing-key status.

## Deployment Safety

Before any dev deployment, the current SST state is checked to prove every
`GalaStaticAssets` resource still has `retainOnDelete: true`, and
`sst diff --stage dev --json` is filtered mechanically. State-only retirement
of those retained resources is expected; any S3 or SES create, update,
replace, or physical-delete operation prohibits deployment. The diff must also
be reviewed for unexpected replacement of durable infrastructure.

Deployment uses the verified ARM64 production base image and explicitly sets:

```text
AWS_PROFILE=gala
SST_STAGE=dev
```

Production is not deployed. Heroku is used only for the four approved
read-only `config:get` calls during the private secret export.

## Verification

The implementation uses a red-green test cycle.

Static contract checks must prove:

- `ASSET_HOST`, `releases/bootstrap`, SST-managed static buckets, and the
  static CloudFront distribution are absent from runtime configuration.
- Neither external S3 bucket is created or imported by SST.
- SES resources are not declared by SST.
- SES SMTP SSM parameter mappings remain present.
- SST secret values, rather than resource metadata, are written to SSM.
- Rails is configured to serve static files from the container.
- Console Autodeploy accepts only pull-request events and maps them to
  `pr-<number>`.
- `deploy.yml` has no pull-request trigger and invokes `npx sst deploy`
  directly from `infra`.
- `ci.yml` runs the full RSpec and Vitest commands and contains no preview,
  infrastructure, custom-status, report, artifact, or job-summary behavior.

Secret verification must prove:

- dev SSM contains every key the dev ECS services require;
- production SSM plus the four SST production Google values contains every key
  a future production ECS deployment requires;
- the SES SMTP username and password are present in both stage snapshots;
- secret values are non-empty and not the known Heroku placeholder;
- the two dotenv files are parseable and agree with the value-free inventory;
  and
- the temporary directory and files have modes `0700` and `0600` respectively.

Local verification includes:

- the SST contract tests;
- `npm --prefix infra run check`;
- GitHub workflow YAML parsing and static workflow contract checks;
- Ruby syntax/configuration checks through mise;
- frontend unit tests;
- the complete Rails test suite, including Selenium feature specs, when local
  PostgreSQL and Chrome are available; and
- an ARM64 production Docker build.

After deployment:

- ECS web and worker services must reach `COMPLETED` with desired and running
  counts equal, no pending tasks, and no failed tasks;
- `/` and `/up` must return HTTP 200;
- representative fingerprinted `/assets/*` and `/packs/*` URLs emitted by the
  live HTML must return HTTP 200;
- first-party CSS and JavaScript requests must have no failed responses; and
- Playwright invariants must run with
  `GALA_BASE_URL=https://dev.learngala.dev`, not `PLAYWRIGHT_BASE_URL`.

A final post-deployment SST JSON diff must again contain zero S3 and SES
mutations. Read-only before/after metadata checks must show that the two bucket
identities and the static bucket's policy, public-access block, CORS
configuration, and versioning state did not change. The worktree must be clean
and the branch must remain exactly one commit on top of `c4151711`.

## Out of Scope

- Publishing or deleting objects in either S3 bucket.
- Replacing the existing asset bucket with a new CDN pipeline.
- Changing Heroku configuration or deploying to Heroku.
- Reading Heroku configuration other than the four approved Google OAuth keys.
- Deploying or promoting the production SST stage.
- Replacing SMTP-based SES delivery with the SES API.
- Broad application refactoring unrelated to SST runtime configuration.
