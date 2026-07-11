# Simple SST Platform and Release Architecture Design

**Date:** 2026-07-10
**Branch:** `oauth/staged-google-key-rotation`
**AWS account:** `353760060567` (`AWS_PROFILE=gala`)
**AWS region:** `us-west-2`

## Objective

Refactor Gala's SST configuration into a smaller, safer design that preserves the infrastructure already deployed in the `dev` and `production` SST states while making routine application releases fast and independently reversible.

The architecture has two speeds:

1. **Stable platform changes** use an explicit, reviewed SST diff/apply path for VPC, database, cache, cluster, load balancer, routing, static CDN, secrets, and schedules.
2. **Rapid releases** update only an immutable application image, its matching immutable static assets, ECS task-definition revisions, and ECS service pointers.

Routine releases must not evaluate or mutate the stable platform. A production promotion reuses a dev-tested release; it does not rebuild the image, copy data, change DNS, or promote dev infrastructure.

## Decision summary

- Keep the existing `gala/dev` and `gala/production` SST state identities and logical resource names.
- Do not introduce separate `shared`, `production-blue`, or `production-green` SST states.
- Treat the current dev and production environments as durable and protected.
- Introduce real `pr-NNN` SST stages for isolated preview runtimes that reference the dev foundation.
- Introduce `local-NAME` as a reference-only development stage for `sst dev` and the Docker Compose bridge.
- Split the current monolithic configuration into a small dispatcher, stage settings, and three resource modules: platform, runtime, and assets.
- Make ECS-only release deployment the default after a stage runtime exists.
- Use one auto-incremented canonical release key, `v<GITHUB_RUN_NUMBER>`, for every deployable build.
- Pin ECS task definitions to an ECR digest, never a mutable channel tag.
- Use the canonical version to derive both the immutable image tag and static-asset prefix.
- Advance `dev`, `pr-NNN`, and `production` aliases only after ECS health verification succeeds.
- Roll back by restoring saved web and worker task-definition revisions, which restore both the image digest and asset prefix.
- Remove the dev and production application edge-cache distributions and their path rules in a dedicated migration.
- Retain the shared hostname router and the static-assets CloudFront distributions.
- Never manage or destroy the Heroku-shared `msc-gala` upload bucket or SES resources from routine SST stages.

This design intentionally prefers ECS rolling deployments and task-definition rollback over a multi-state blue/green controller. It provides a safe old/new task overlap without the additional state ownership, worker, cron, and database coordination required by permanent blue/green stacks.

## Observed deployed baseline

Read-only inspection of `AWS_PROFILE=gala` in `us-west-2` found:

- Dev ECS cluster: `gala-dev-GalaClusterCluster-zeeusfkv`.
- Production ECS cluster: `gala-production-GalaClusterCluster-huxhnoss`.
- Both clusters have `GalaWeb` and `GalaWorker` services.
- Dev RDS is `db.t4g.micro`, 20 GB, single-AZ.
- Production RDS is `db.t4g.small`, 20 GB, single-AZ.
- The source currently declares 50 GB for production, so evaluating the source can propose an unrequested storage increase.
- The `gala` ECR repository is mutable and currently uses compound release keys plus `latest`.
- The active dev services use release `27522834795.20260615035015.2b808a57`.
- `manifests/dev/latest.json` and ECR `latest` point to the later release `29124738391.20260710212726.2b808a57`, which is not active in the dev services.
- The manifest pointer is written before deployment and health verification, so `latest` is not currently an authoritative rollback record.
- The shared SST router distribution is `E3FF4TTU9Q4XTY` and owns `learngala.dev`, `dev.learngala.dev`, and `*.dev.learngala.dev`.
- Separate application edge-cache distributions still exist for dev and production.
- Separate static-assets distributions still exist for dev and production.
- The static-assets bucket does not currently report S3 versioning as enabled.

These identifiers are migration evidence, not values to hardcode. Every operation must rediscover and validate live identities immediately before use.

## Stage model

### `dev`

`dev` remains the durable owner of the current dev platform and runtime:

- VPC and pinned bastion
- RDS and Redis/Valkey
- ECS cluster
- dev web and worker services
- dev tasks and schedules, where applicable
- dev load balancer
- `dev.learngala.dev` route
- dev static-assets distribution

It is protected and uses retain-all removal behavior. Routine dev releases bypass SST after the initial runtime migration.

### `production`

`production` remains the durable owner of the current production platform and runtime:

- VPC and pinned bastion
- RDS and Redis/Valkey
- ECS cluster
- production web and worker services
- migration, maintenance, and scheduled tasks
- production load balancer
- shared hostname router and root-domain route
- static-assets bucket and production static-assets distribution

It is protected and uses retain-all removal behavior. Routine production promotion bypasses SST.

### `pr-NNN`

Each preview is a real, ephemeral SST stage. It owns only:

- its web and worker runtime
- its task-definition revisions and logs
- its exact `pr-NNN.dev.learngala.dev` route
- preview-specific release outputs

It references the dev VPC, cluster, database/cache connection parameters, static-assets contract, and shared router using deterministic identifiers and `get` operations. It cannot construct platform resources.

Removing `pr-790` may address only the `pr-790` state and hostname. A policy test and diff verifier must reject any reference to another PR number.

### `local-NAME`

`local-NAME` owns no durable AWS resources. It uses `get` operations to reference dev networking and data services and declares `sst.x.DevCommand` integrations that run only during `sst dev`.

The local Docker Compose bridge receives a generated, short-lived environment file for the SST tunnel. The application database role may read and write dev application data but may not administer the database, drop the database, or change infrastructure. Schema elevation is an explicit, separately documented operation. Production connections are rejected.

## Resource ownership

Every mutable resource has one state owner.

| Resource | Owner | Other stages |
|---|---|---|
| Dev VPC, RDS, cache, cluster | `dev` | `pr-NNN` and `local-NAME` use `get` |
| Production VPC, RDS, cache, cluster | `production` | No derived stage owns them |
| Shared hostname router | `production` | `dev` and `pr-NNN` use `get` |
| Static-assets bucket | `production` | `dev` and previews reference it |
| Dev static CDN | `dev` | Referenced by dev-derived releases |
| Production static CDN | `production` | Referenced by production releases |
| `msc-gala` uploads bucket | External/Heroku-shared | All SST stages use read-only resource lookup |
| SES identities and compatibility resources | External/Heroku-shared | SST consumes credentials/identifiers only |
| Preview service and route | Its exact `pr-NNN` stage | No other stage may mutate it |

“Imported” is not used as shorthand for duplicate ownership. Shared Heroku resources are external references. The static-assets bucket has one SST owner. If the dev checkpoint currently contains an imported copy, migration removes only that state ownership after a versioned backup and exact identity validation; it never issues a provider delete for the physical bucket.

## Proposed source layout

```text
infra/
├── sst.config.ts
├── config.ts
├── stages/
│   ├── dev.ts
│   ├── production.ts
│   ├── preview.ts
│   └── local.ts
├── platform.ts
├── runtime.ts
└── assets.ts
```

The intent of the files is:

- `sst.config.ts`: classify the stage, set provider/protection/removal policy, and dispatch. It contains no resource details.
- `config.ts`: shared types, environment parsing, deterministic names, and cross-stage reference contracts. It is the only module that reads deploy environment variables.
- `stages/*.ts`: compose modules and define stage-specific capacity. They do not contain low-level transforms.
- `platform.ts`: VPC, bastion, RDS, Redis/Valkey, cluster, and external shared-resource references.
- `runtime.ts`: web, worker, operational tasks, schedules, services, and router routes.
- `assets.ts`: static-assets bucket ownership/reference and static CDN contract.

No separate `components/`, `core/`, or shell-library hierarchy is introduced initially. The refactor must reduce total production infrastructure code, not merely distribute the same complexity among more files.

The dispatcher recognizes only `dev`, `production`, `pr-NNN`, and `local-NAME`. Unknown stages fail before resource evaluation.

## Stage capacity configuration

Database, cache, and service capacity is expressed as plain stage data. The initial values match the deployed baseline, including production's actual 20 GB allocation:

```ts
export const capacity = {
  dev: {
    databaseClass: "t4g.micro",
    databaseStorage: "20 GB",
    web: { cpu: "0.5 vCPU", memory: "1 GB", min: 1, max: 1 },
    worker: { cpu: "0.5 vCPU", memory: "1 GB", min: 1, max: 1 },
  },
  production: {
    databaseClass: "t4g.small",
    databaseStorage: "20 GB",
    web: { cpu: "0.5 vCPU", memory: "1 GB", min: 2, max: 2 },
    worker: { cpu: "0.5 vCPU", memory: "1 GB", min: 1, max: 1 },
  },
} as const;
```

Changing an RDS instance class is a one-line configuration change followed by an explicit infrastructure diff and apply. Both upsize and downsize are supported, subject to AWS availability, restart behavior, and capacity checks. Allocated RDS storage can increase in place but cannot decrease; reducing storage requires a separately designed replacement/migration and is never treated as a routine resize.

## Stable platform deployment

Stable infrastructure is changed only through explicit deploy modes:

- `infra:diff`
- `infra:apply:<plan-id>`

The diff artifact records commit SHA, effective SST stage, scope, timestamp, normalized operation fingerprint, and the state version observed during planning. Apply reruns the non-refreshing diff and requires those values to match the approved artifact. Unknown operations fail closed.

Routine release mode must not call `sst deploy`, `sst refresh`, or `sst remove`. Initial creation of a new `pr-NNN` runtime is the exception: it runs a preview-scoped SST deployment whose policy permits only that preview's runtime and route resources. Subsequent preview releases use the rapid path.

Shared S3/SES mutation, data-resource replacement, cross-stage deletion, unrelated routes, and bastion replacement are unconditional stop conditions unless the reviewed infrastructure scope explicitly names the intended resource class. The `msc-gala` bucket and SES remain stop conditions in every scope.

## Canonical release version

Every deployable build has one canonical key:

```text
v<GITHUB_RUN_NUMBER>
```

For example, GitHub Actions run number `412` creates release `v412`. `GITHUB_RUN_NUMBER` is the auto-incrementing number for the single `deploy.yml` workflow and does not change when that run is retried. Diff, promotion, and operational runs may consume numbers without creating builds; gaps are valid and no secondary counter is maintained.

Only GitHub Actions creates canonical releases. Local builds are not pushed or promotable. A workflow retry reuses `v412`: if its ECR tag or S3 manifest already exists, the script requires it to match the same commit and reuses the existing artifacts. A collision with a different commit fails closed.

The version is used everywhere:

- ECR immutable tag: `v412`
- S3 asset prefix: `releases/v412/`
- release manifest key: `releases/v412/manifest.json`
- ECS environment value: `GALA_RELEASE=v412`
- ECS task-definition tag: `gala:release=v412`
- deploy input: `promote:v412` or `rollback:v411`

There is no separate release ID, build-date key, image tag field, or asset-prefix field.

The complete immutable release record is:

```json
{
  "version": "v412",
  "commit": "2b808a57345f7cf1c975013c98c6e92da978bd64",
  "digest": "sha256:..."
}
```

The asset path is derived from `version`; the ECR image is resolved by both the immutable `v412` tag and the recorded digest. The record refuses overwrite with different content.

The image and assets are never promoted independently. ECS task definitions use `repository@sha256:digest`, not `repository:dev` or `repository:production`, and are tagged with the canonical version. A small channel file contains only the active and previous versions, for example `{ "current": "v412", "previous": "v411" }`. Task-definition revisions remain the exact rollback snapshots and are found by their stage, role, and canonical-version tags. No separate deployment-record format is required.

## ECR tagging

Tags have distinct roles:

- `vN`: permanent canonical identity. The deploy script refuses to move it to a different digest.
- `dev`: the digest verified and currently active in the dev services.
- `pr-NNN`: the digest verified and currently active in that preview.
- `production`: the digest verified and currently active in production.
- `production-previous`: the immediate production rollback candidate.

Channel tags are moved server-side using the existing ECR image manifest; promotion does not pull, rebuild, or push the image. Tags are operator conveniences. The canonical `vN` tag, three-field release record, and tagged ECS task definitions are authoritative.

The generic `latest` tag is removed from deployment decisions. It may be discontinued entirely after downstream consumers are checked.

## Static-assets design

Compiled assets are extracted from the same image that will run and uploaded before ECS starts under:

```text
s3://gala-static-assets-353760060567/releases/v412/assets/
s3://gala-static-assets-353760060567/releases/v412/packs/
s3://gala-static-assets-353760060567/releases/v412/manifest.json
```

Asset objects are immutable and receive long-lived immutable cache headers. No release overwrites another release's objects. Failed releases may leave unreferenced artifacts, which are safe to prune after the retention window.

The static-assets CloudFront distributions remain. Their only purpose is serving immutable release assets. Routine releases do not create invalidations because every asset URL changes with its release prefix.

Production promotion reuses the exact asset prefix tested in dev. It does not copy assets into a production-specific prefix. Rollback restores the previous task definitions, including the previous `ASSET_HOST` and `GALA_ASSET_PREFIX`.

The channel file is written after health verification. This reverses the current unsafe order in which `manifests/dev/latest.json` can advance even though the ECS services did not.

## Application CloudFront removal

The following are removed in a dedicated infrastructure slice:

- dev application edge-cache distribution
- production application edge-cache distribution
- public catalog and case path cache behaviors
- application response-header policies used only by those distributions
- application-distribution invalidation and dormant-distribution pruning code

The following remain:

- the shared SST hostname router and its CloudFront function/KVS route mechanism
- `learngala.dev`, `dev.learngala.dev`, and preview hostname ownership
- dev and production static-assets CloudFront distributions
- immutable static-asset cache behavior

Before removal, the migration must prove from live router route metadata and request tests that every active hostname resolves directly to the intended ALB origin rather than either app-cache distribution. The acceptance diff contains only the two app distributions and their exclusive policies. Any router, alias, certificate, static CDN, ALB, S3, or DNS operation is a stop condition.

## Routine release flow

For dev and an existing preview:

1. Resolve the effective stage and acquire its deployment concurrency lock.
2. Derive the canonical version from `GITHUB_RUN_NUMBER` and reject conflicting existing artifacts.
3. Build one production image, or reuse the same version's existing image on retry.
4. Push the immutable `vN` tag and resolve its ECR digest.
5. Extract and upload immutable assets under `releases/vN/`.
6. Write the three-field immutable release manifest.
7. Clone the current web and worker task definitions, changing only the image digest and release environment fields.
8. Register the paired task revisions with stage, role, and `gala:release=vN` tags.
9. Update web and worker services with the ECS deployment circuit breaker enabled.
10. Wait for stable services and run `/up`, static-asset, and hostname smoke checks.
11. Advance the two-value channel file and channel ECR tag.
12. Retain old task definitions, `vN` tags, and assets according to one documented retention policy.

If any step before health verification fails, no channel pointer moves. The old services remain authoritative.

## Production promotion and rollback

Promotion accepts an explicit canonical version, for example:

```text
user_data=promote:v412
```

The release must have a healthy dev channel record for the same digest and asset prefix. Promotion:

1. Loads and validates the immutable dev-tested release manifest.
2. Reads the production channel's current version and preserves its tagged web/worker task-definition pair as the rollback target.
3. Creates production task revisions using the same digest and asset prefix, with production-only environment and secret references.
4. Runs expand-safe database migrations when explicitly requested.
5. Rolls production ECS services and waits for stability.
6. Verifies the root hostname, assets, worker health, and expected canonical version.
7. Moves the former production digest to `production-previous`.
8. Moves `production` and the production channel file to the verified canonical version.

The root URL and DNS do not move. The shared router continues to target the production ALB. Promotion changes the application release behind that stable endpoint.

`user_data=rollback` restores the task definitions tagged with the channel's previous version. `rollback:vN` selects an older retained canonical version explicitly. Rollback verifies health before moving channel tags and the channel file.

Database migrations must follow expand/contract compatibility. A release may add compatible schema before promotion; destructive contract cleanup waits until the rollback window closes. Image rollback never claims to reverse a schema migration.

## Preview isolation and transition

The current dev state contains preview routing behavior, which allowed a new PR to replace another PR's route. Migration proceeds one preview at a time:

1. Inventory active preview hostnames and their current dev runtime target.
2. Create the matching real `pr-NNN` stage without changing the existing route.
3. Deploy the same currently active release to the isolated preview service.
4. Verify the isolated service through its direct load-balancer health endpoint.
5. Transfer only that exact hostname route to the `pr-NNN` stage.
6. Verify the public preview URL.
7. Remove only the legacy route entry from dev.

The dev service returns to the stable `dev.learngala.dev` identity and no longer changes `BASE_URL` or PR metadata when a preview is deployed.

Preview cleanup runs `sst remove --stage pr-NNN` only after validating that the workflow PR number, stage name, state identity, hostname, and diff all contain the same number.

## GitHub workflow and deploy script

`.github/workflows/deploy.yml` remains the only cloud mutation workflow and retains only the `stage` and `user_data` inputs. It should be a thin dispatcher that:

1. authorizes the actor
2. assumes the GitHub OIDC role
3. checks out the requested ref
4. installs the required runtime tooling
5. calls `scripts/deploy-sst.sh` once
6. uploads the release or infrastructure-plan artifact
7. comments the verified preview URL when appropriate

For an open PR with input `stage=dev`, the script derives the effective stage `pr-NNN`. Without an open PR, `stage=dev` targets durable dev. `stage=production` requires the protected production environment.

The deploy script recognizes a small grammar:

- empty: routine dev/preview release
- `diff`: non-mutating release preview
- `promote:vN`: promote one dev-tested canonical version to production
- `rollback`: restore the immediate production predecessor
- `rollback:vN`: restore a retained canonical version
- `infra:diff`: stable-platform preview
- `infra:apply:PLAN_ID`: apply the exact reviewed infrastructure plan
- explicitly retained operational commands such as migration, snapshot, seed, restart, and SST unlock

The existing 1,275-line script is reduced by deleting app-cache management, unsafe pre-deploy pointer updates, duplicated validation, and legacy branches. It remains one understandable entry point rather than becoming a large shell-library framework. Complex one-off maintenance operations may remain in `scripts/ops/`.

An empty production invocation is rejected. Production changes require an explicit `promote:vN`, `rollback`, approved infrastructure apply, or allowlisted operational command.

## CI contracts

Pull-request CI remains non-mutating and does not receive AWS credentials. It runs:

- infrastructure TypeScript compilation
- stage classifier tests
- capacity configuration tests
- resource ownership tests
- preview composition tests proving it cannot construct platform resources
- preview isolation tests rejecting cross-PR hostnames and deletes
- canonical version, retry-idempotency, manifest, and tag-transition tests
- safe and dangerous normalized-diff fixtures
- workflow input and deploy-script grammar tests
- documentation consistency tests

Existing tests that assert exact text within the monolithic `sst.config.ts` are replaced with tests of exported policies and builders.

Cloud verification occurs only in the manually dispatched deploy workflow: non-refreshing diff, artifact review, deploy, service stability, route verification, and smoke checks.

## Migration sequence

### 1. Freeze and inventory

- Record current SST state versions for dev and production.
- Export versioned, access-restricted state backups without printing secrets.
- Record current ECS services, task definitions, ALB targets, router routes, database/cache identifiers, static distributions, bucket ownership, and scheduled tasks.
- Reconcile known pending state operations separately before structural refactoring.
- Do not run refresh as part of the migration.

### 2. Establish the deployed baseline

- Change source configuration values that disagree with intentional live values, including production RDS storage, so the source represents the accepted baseline.
- Preserve the approved bastion AMI pins.
- Require no-op dev and production diffs before moving code.

### 3. Mechanical module extraction

- Move existing resource declarations into the new files without renaming logical resources or changing inputs.
- Keep dev and production in their existing states.
- Require exact no-op diffs after each module move.
- Stop on any replacement, deletion, import, or provider refresh.

### 4. Reconcile shared references

- Keep production as the sole SST owner of the static-assets bucket.
- Convert dev and derived stages to resource lookups.
- If dev state contains an imported copy, remove only its state ownership using a versioned backup and guarded exact-URN reconciliation that cannot issue a physical delete.
- Convert `msc-gala` and SES to explicit external reference contracts.
- Require a diff with no S3 or SES provider mutation.

### 5. Introduce rapid release mode

- Preserve the currently active task definitions as the first rollback baseline.
- Implement `v<GITHUB_RUN_NUMBER>`, the three-field immutable manifest, digest-pinned tagged task revisions, post-health channel updates, and server-side ECR aliases.
- Prove a dev release and rollback before enabling production promotion.
- Stop writing or relying on `latest` before health verification.

### 6. Isolate previews

- Create real `pr-NNN` stages derived from dev.
- Migrate active previews one at a time using the transition above.
- Verify that deploying PR 790 cannot address the PR 787 state, service, or route.

### 7. Remove application edge caches

- Verify live router origin metadata and all active hostnames.
- Remove only the two app-edge distributions and their exclusive cache policies.
- Keep the shared router and static-assets distributions unchanged.
- Remove invalidation and cache-pruning code after the infrastructure deletion succeeds.

Each phase is independently reviewable and reversible. No phase combines state reconciliation, shared-resource ownership changes, CloudFront deletion, and release-path activation in one apply.

## Failure handling

- All stage mutations use per-effective-stage concurrency locks.
- Production promotion, rollback, and production infrastructure changes share a stricter production lock.
- State version changes between plan and apply abort the operation.
- Unexpected operations abort before mutation.
- Failed ECS rollout leaves channel pointers unchanged and uses the deployment circuit breaker.
- Failed post-deploy smoke tests restore the saved task-definition pair.
- A failed pointer write after a healthy rollout is repaired from the release manifest and live task definitions; it does not trigger a rebuild.
- Static assets, `vN` image tags, and matching task-definition revisions are retained long enough to cover the rollback window.
- Shared upload data and SES are never rollback targets.

## Documentation deliverables

- `infra/README.md`: quick start, directory map, stages, and common commands.
- `docs/ops/infra-stacks.md`: ownership, stable/rapid boundary, and stage lifecycle.
- `docs/ops/infra-changes.md`: adding AWS services and changing RDS class, storage, scaling, cache, DNS, or routes.
- `docs/ops/releases.md`: immutable manifests, tagging, promotion, rollback, and asset retention.
- `docs/ops/production-promotion.md`: exact production gates and expand/contract migration rules.
- `docs/ops/local-aws-dev.md`: `sst dev`, tunnel behavior, Docker Compose integration, and database-role safety.
- `docs/ops/workflows/ci.md`: non-mutating CI contract.
- `docs/ops/workflows/deploy.md`: inputs, derived preview stages, deploy modes, examples, and failure recovery.

Documentation examples are contract-tested against the workflow and deploy-script grammar.

## Acceptance criteria

- `sst.config.ts` is a small dispatcher and contains no resource construction details.
- Total production infrastructure code is materially smaller than the current configuration and deploy script.
- Dev and production retain their existing SST states and resource logical names.
- Mechanical refactoring produces no-op diffs.
- Routine releases do not call SST or mutate stable resources.
- A healthy release advances its channel pointer; a failed release does not.
- Every build has one canonical `vN` key derived from `GITHUB_RUN_NUMBER`; retries reuse it and conflicting reuse fails.
- Every active task definition pins an image digest and matching immutable asset prefix.
- Production promotion reuses an exact dev-tested release without rebuilding.
- Production rollback restores the prior image and static assets together.
- PR 790 creation/update cannot remove or modify PR 787.
- `dev.learngala.dev` remains the durable dev route.
- App edge-cache rules and distributions are removed without changing the router, static CDN, DNS, ALB, S3, or SES.
- RDS class changes are one-line stage configuration changes behind explicit infrastructure review.
- `msc-gala` uploads and Heroku-compatible SES resources are never created, replaced, or destroyed.
- `sst dev --stage local-NAME` exposes dev data services to the documented Docker Compose workflow without production access or durable local-stage resources.
- GitHub CI verifies code and policy without AWS credentials.
- The manual deploy workflow remains thin and calls one script entry point.

## Out of scope

- Moving production data into dev or preview stages.
- Treating an image rollback as a database-schema rollback.
- Replacing the existing VPC, RDS, Redis/Valkey, ECS clusters, ALBs, router, or static-assets distributions during the refactor.
- Consolidating the two static-assets distributions in the initial migration.
- Introducing CodeDeploy or permanent blue/green production stacks.
- Changing the Heroku application, upload storage, or SES ownership.
- Enabling automatic stable-infrastructure deployment on every application release.
