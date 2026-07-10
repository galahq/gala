# SST Google OAuth State Reconciliation Design

**Date:** 2026-07-10
**Branch:** `oauth/staged-google-key-rotation`
**Scope:** Dev-stage reconciliation and infrastructure preview only

## Objective

Make the staged Google OAuth key rotation preview deterministic without deploying or mutating shared application resources. The completed preview must show only the expected Google secret resources, secret-only ECS task-definition revisions and service pointer updates, and intended preview-route turnover.

This slice also removes two known stale Pulumi pending-operation records from the dev checkpoint and prevents routine OAuth changes from replacing the SST bastion.

## Safety boundaries

- Do not deploy.
- Do not run `sst refresh`.
- Do not edit production state.
- Do not mutate shared S3 or SES resources.
- Treat any S3, SES, ALB, CloudFront, log-group, autoscaling, VPC, database, cache, or bastion mutation in the preview as a stop condition.
- Preserve the user's unrelated working-tree changes.
- Never print secret values while inspecting configuration or state.

The `msc-gala` bucket and SES resources are shared with Heroku. They are outside this reconciliation and must remain imported or external, never created, replaced, or destroyed by this work.

## Root cause

The Google SecureString parameters are new resources. Passing each new parameter's `.arn` output into SST's shared Fargate `ssm` map leaves the container definition unknown during the first preview. SST 4.7.1 builds parts of the Fargate child-resource graph inside output applications. With the container input unresolved, Pulumi cannot materialize the existing graph consistently and reports false deletions and replacements across task definitions, log groups, load-balancer resources, autoscaling resources, and router children.

A controlled preview using deterministic same-region SSM parameter names removed those false graph mutations. AWS ECS accepts a parameter name when the parameter and task are in the same region; a full ARN is only required for a cross-region parameter.

Separately, SST's generated VPC component resolves the latest Amazon Linux 2023 ARM64 AMI on every evaluation. A newer result causes an unrelated bastion replacement.

The dev checkpoint also contains two stale `creating` pending operations:

1. `urn:pulumi:dev::gala::sst:aws:Redis$aws:elasticache/replicationGroup:ReplicationGroup::GalaCacheCluster`
2. `urn:pulumi:dev::gala::sst:aws:Service$docker-build:index:Image::GalaWorkerImageGalaWorker`

The Redis resource already exists as a managed checkpoint resource. The worker-image pending operation has no corresponding managed resource. The reconciliation removes only the pending-operation records; it does not remove or alter resources.

## Resource-graph design

`secretValueToParameter` will expose both the `aws.ssm.Parameter` resource and its deterministic same-region name:

```text
/${app}/${stage}/${key}
```

The Rails ECS `ssm` map will receive the deterministic name rather than the newly created `.arn` output. This keeps all six Fargate container graphs known during the first preview.

The four Google parameter resources will remain explicit dependencies of every Rails ECS task definition. A task-definition transform will append those resources to `opts.dependsOn`, preserving any dependencies SST or the application already supplied.

The six consumers are:

- `GalaWeb`
- `GalaWorker`
- `GalaMigrate`
- `GalaSeedDatabase`
- `GalaRefreshIndices`
- `GalaWeeklyReport`

Tests will prove that the deterministic names are used, the new Google `.arn` outputs are not container inputs, the dependency list contains all four Google parameters, and all six consumers inherit the transform.

## Bastion design

The VPC `bastionInstance` transform will override SST's rolling AMI output with the approved stage-specific image:

- Dev and dev-derived previews: `ami-08c28b6151a0ba92f`
- Production: `ami-0a2a049c945b84826`

These are the images used by the currently running dev and production bastions. Pinning them produces no bastion replacement. The existing VPC and bastion settings remain otherwise unchanged.

Tests will prove both stage selections and the presence of the VPC bastion transform. Any bastion operation in the final preview remains a stop condition.

## State-reconciliation design

### Preconditions and backup

1. Read the current S3 version metadata for `app/gala/dev.json` in the SST state bucket.
2. Download that exact version into a permission-restricted local backup.
3. Record its version ID, ETag, content length, last-modified timestamp, and SHA-256.
4. Export the dev SST state without decrypting or displaying secret values.
5. Assert that `pending_operations` contains exactly the two known entries above, both with operation type `creating`.
6. Hash or structurally compare every field outside `pending_operations`.
7. Re-read the live S3 version immediately before mutation and abort if it differs from the backed-up version.

### Mutation

Run `sst state edit --stage dev` with a one-purpose guarded editor. The editor will:

- Parse the temporary checkpoint as JSON.
- Require the exact expected pending-operation set.
- Remove only those two array entries.
- Require the resulting pending-operation list to be empty.
- Assert that every other JSON field is structurally identical.
- Write only the validated checkpoint back to SST's temporary edit file.

The process will not use `state remove`, `state repair`, or `refresh`, because those operations have broader reconciliation semantics than this slice authorizes.

### Readback

1. Confirm S3 created exactly one new current object version.
2. Export the dev state again.
3. Prove that the only structural state change is `pending_operations` moving from the exact two entries to an empty array.
4. Preserve the original version ID and backup metadata as rollback evidence.
5. Abort before preview on any failed invariant.

No production checkpoint will be edited.

## Preview verification

After the code changes and successful state readback, run a fresh dev preview using workflow-equivalent metadata and without `refresh`. Do not deploy the preview.

The acceptance allowlist is:

- 12 Google resource creations:
  - Four SST secrets.
  - Four Secret-to-SSM link resources.
  - Four SecureString SSM parameters.
- Six ECS task-definition replacements whose changed inputs are secret-only.
- The corresponding ECS service task-definition pointer updates.
- Intended preview-route turnover.

The verifier must fail closed for:

- Any unrecognized resource or operation.
- A missing or additional Google resource.
- Any task-definition change outside secret container inputs.
- Any S3, SES, ALB, CloudFront, log-group, autoscaling, VPC, database, cache, or bastion mutation.
- Any state mutation beyond removing the two specified pending-operation records.

## Testing strategy

Tests are written before implementation changes and initially demonstrate the missing guarantees. The test suite will cover:

1. Deterministic same-region SSM names for the Google parameters.
2. Explicit task-definition dependencies on all four Google parameters.
3. Inheritance of the dependency transform by all six Rails services and tasks.
4. Stage-specific bastion AMI pins.
5. State editor rejection of missing, additional, or mismatched pending operations.
6. State editor preservation of all non-pending-operation fields.
7. Preview allowlist acceptance for the exact expected diff.
8. Preview rejection for every forbidden resource class, including bastion and shared S3/SES changes.

Existing repository contract tests and relevant infrastructure checks will run alongside the new focused tests.

## Failure handling and rollback

- Any failed precondition stops before state mutation.
- Any concurrent S3 version change stops before state mutation.
- Any failed post-edit invariant stops before preview.
- Any unexpected preview operation stops the workflow; no deploy follows.
- If state readback differs beyond the authorized pending-operation removal, restore only from the recorded versioned backup after explicit operator review. The original S3 object version remains available independently of the local backup.

## Out of scope

- Deploying Google OAuth resources or ECS revisions.
- Rotating or deleting Google Cloud credentials.
- Changing Heroku configuration.
- Importing, replacing, or deleting `msc-gala`, the SST static-assets bucket, or SES resources.
- Updating the bastion operating system image.
- Reconciling any state record other than the two exact dev pending operations.
- Editing production state.
