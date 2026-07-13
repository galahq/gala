# Local Terraform Infrastructure Design

## Goal

Replace SST as Gala's infrastructure owner with plain Terraform while preserving
the currently deployed AWS resources. Terraform runs only from an operator's
machine. GitHub Actions uses AWS CLI commands for application releases and never
runs Terraform.

## Safety boundary

- AWS account `353760060567`, profile `gala`, and region `us-west-2` are fixed.
- Migration development is read-only. Do not run Terraform apply, Terraform
  import, SST deploy/remove/refresh, or any mutating AWS command.
- Existing physical resources are adopted with reviewed declarative import
  blocks. No initial Terraform plan may create, replace, update, or destroy a
  live resource.
- Durable data and edge resources use `prevent_destroy` after adoption.
- The production RDS baseline is the live 20 GB allocation, not the tracked SST
  config's stale 50 GB value.
- The SST-owned dev Valkey group
  `gala-dev-galacachecluster-zdbxebkm` is the initial managed cache. The second
  dev group is inventory-only until an operator explicitly classifies it.
- `msc-gala`, SES, application SSM values, and the shared CloudFront router are
  reference-only during the first migration.

## Toolchain

Pin stable Terraform `1.15.8` and constrain the AWS provider to `~> 6.54.0`.
Commit `.terraform.lock.hcl` after an operator with Terraform installed runs the
documented initialization command. Provider credentials come only from the
standard AWS profile and environment; no credentials or secret values appear in
tracked files, backend arguments, plan files intended for sharing, or Terraform
variables.

## State

Use separate `dev` and `production` root modules and separate S3 state keys.
The backend is partial so the state bucket name is supplied by a local backend
file. Enable S3 lockfiles, bucket versioning, encryption, and public-access
blocking; do not use Terraform Cloud or deprecated DynamoDB locking.

The state bucket is bootstrapped separately because Terraform cannot create its
own backend. The bootstrap configuration has local state and is never invoked by
CI. Backend creation is an explicit future operator action and is not part of
this implementation run.

## Configuration layout

```text
infra/
  bin/                 guarded local entry points
  bootstrap/           optional S3 state-bucket configuration
  modules/
    environment/       one durable environment composition
  stacks/
    dev/               dev variables, imports, backend, outputs
    production/        production variables, imports, backend, outputs
  migrations/          immutable import manifests and migration notes
```

The environment module is split into focused files for network, database,
cache, ECS, load balancing, IAM, schedules, static assets, and references. Root
modules contain only provider/backend setup, environment inputs, import blocks,
and outputs.

## Adoption strategy

Migration is intentionally incremental:

1. Capture a sanitized inventory from SST state and read-only AWS APIs.
2. Create Terraform resource declarations matching the live baseline.
3. Add explicit import blocks for resources whose identity is unambiguous.
4. Run `infra/bin/diff <stage>` locally. It initializes the selected root,
   validates account/region, refreshes only through Terraform plan, and writes a
   stage-specific saved plan outside Git.
5. Accept a migration only when the plan contains imports and zero resource
   changes. Any create, update, replacement, or delete is a stop condition.
6. Run `infra/bin/apply <stage> <saved-plan>` only after review. The wrapper
   accepts a saved plan, never an implicit plan.
7. Retire SST state ownership only in a later, separately reviewed migration
   after Terraform adoption succeeds. Physical AWS resources are never deleted
   as part of the handoff.

Import coverage can grow in batches. Resources not yet adopted remain explicit
data references, so incomplete coverage cannot be mistaken for permission to
replace them.

## Local commands

- `infra/bin/check`: format, validate, and test without AWS mutation.
- `infra/bin/diff dev|production`: create a saved Terraform plan and print its
  machine-readable change summary.
- `infra/bin/apply dev|production PLAN`: apply exactly one reviewed saved plan.
- `infra/bin/migrate dev|production`: prepare and validate the next declarative
  import migration; it does not apply by default.
- `infra/bin/rollback dev|production`: restore a prior versioned S3 state object
  only after confirmation and only when no state lock exists. It never rolls
  back RDS data or application schema.

All wrappers fail unless `AWS_PROFILE=gala`, `AWS_REGION=us-west-2`, and STS
returns account `353760060567`. They reject CI environments.

## Application release boundary

CI builds one ARM64 Docker image, pushes it to ECR, uploads fingerprinted static
assets under an immutable release prefix, runs the existing ECS migration task,
registers digest-pinned web and worker task definitions, updates services, waits
for stability, smoke-tests, and advances release pointers. Rollback selects a
retained task-definition pair and matching asset prefix. These operations use
AWS CLI and the existing release scripts only.

Terraform ignores the ECS service `task_definition` attribute after adoption so
application releases do not create infrastructure drift. Terraform continues to
own service capacity, networking, IAM, load balancing, and autoscaling.

## Secrets

Existing `/gala/<stage>/*` SecureString parameters are data sources. Terraform
stores their names and ARNs, never their values. ECS task definitions use those
ARNs. New application secrets are created and populated with AWS CLI in SSM or
Secrets Manager before a Terraform configuration references them. Database and
cache credentials remain in their existing AWS-managed secret/SSM chain during
adoption; rotating them is a separate migration.

## Verification

Static tests assert provider/version constraints, account/region guards,
separate state keys, lifecycle protection, reference-only shared resources,
no secret-value inputs, and CI's Terraform prohibition. `terraform fmt -check`,
`terraform init -backend=false`, and `terraform validate` run locally when the
pinned CLI is available. Cloud verification is read-only until an operator
reviews an import-only plan.

## Out of scope

- Deleting duplicate, orphaned, or obsolete AWS resources.
- Changing RDS storage, engine, credentials, or network placement.
- Replacing the shared router or moving DNS from Cloudflare.
- Database-schema rollback.
- Creating PR infrastructure with Terraform in CI.
- Removing SST state ownership during this implementation run.

