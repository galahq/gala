# React 19 on Stable SST Integration Design

## Goal

Create one working commit on top of `c4151711` that preserves the complete
current SST and staged OAuth baseline while importing the application/runtime
work from GitHub PR #791. Prove the combined application builds locally, then
deploy and verify only the durable `dev` stage.

## Source Authority

- `c4151711` is authoritative for the starting tree and all infrastructure,
  deployment, release, operator, staged OAuth, and unrelated branch content.
- PR #791 head `37d39784` is authoritative only for the React 19 / Blueprint 6
  application upgrade and the runtime, build, and test changes required by it.
- `CODEOWNERS` is the sole user-authorized deletion from the otherwise
  authoritative current tree so CODEOWNER approval cannot gate this dev
  release.
- Both lines share `2b808a57` as their merge base. The integration branch will
  start at `c4151711` and finish with exactly one new commit above it.
- The source branch `oauth/staged-google-key-rotation` will not be rewritten.

## Integration Strategy

Create `integration/react19-stable-sst` at `c4151711`, then perform a squash
merge of PR #791 so Git can use the shared ancestor for three-way resolution.
After the squash merge, restore infrastructure and control-plane paths from
`c4151711` before resolving shared application-build files.

The protected baseline includes:

- `infra/**`
- deployment and release GitHub workflows
- SST deployment, release, rollback, promotion, and stage-target scripts
- infrastructure/operator contract tests and documentation
- staged Google OAuth work
- all current-branch content unrelated to the application upgrade

The imported application surface includes:

- application code, Rails views, assets, and runtime configuration required by
  React 19 and Blueprint 6
- application dependency upgrades and lockfile changes
- Rails/runtime compatibility changes required by the upgraded application
- frontend test tooling, application tests, and visual invariant checks
- production container/build changes required to compile and run the upgraded
  application

Application analytics and reader identification use the existing Sentry
browser integration. The PR's PostHog client and Rails initializer are not
imported, and Ahoy event collection remains in place. The protected SST
PostHog secret declarations remain byte-for-byte unchanged as control-plane
state, but the application does not consume them.

Shared files such as `package.json`, `pnpm-lock.yaml`, and
`Dockerfile.production` require deliberate reconciliation. The application
upgrade wins for root application dependencies and build behavior; the current
baseline wins for SST workspace packages and deployment behavior. Dependency
metadata will be regenerated when needed rather than accepting a mismatched
lockfile.

## Safety Checks

Before build verification, compare every protected path to `c4151711`. Any
unexplained difference in infrastructure or deployment behavior blocks the
integration. Review the complete staged diff to ensure PR planning artifacts,
legacy infrastructure changes, and unrelated cleanup did not cross the
boundary.

Delete the root `CODEOWNERS` file deliberately and verify it remains absent in
the final commit. This changes repository review gating only; it does not alter
the application, AWS infrastructure, or production environment.

Merge conflicts will be resolved by ownership, not by taking one side for the
entire file. Application semantics come from PR #791; infrastructure and
deployment semantics come from `c4151711`.

## Local Verification

Verification proceeds from cheap/static checks to expensive/runtime checks:

1. Install dependencies with the repository-pinned Node, pnpm, and Ruby
   versions and verify lockfile consistency.
2. Run JavaScript/Vitest tests and application linting.
3. Run the Rails asset precompile as a production webpack build.
4. Run the complete Rails suite used by the current repository CI contract.
5. Run the current SST unit, type, module-boundary, stage-boundary, and operator
   contract checks without deploying.
6. Build the production Docker image locally.

No failing build, test, contract, or unexplained lint result is accepted as a
deployment candidate. Benign warnings must be identified explicitly.

## Commit Shape

Planning and implementation may use temporary local commits for recoverability,
but the integration branch will be normalized before handoff to exactly one
new commit whose parent is `c4151711`. The final commit includes the approved
design, implementation plan, imported application changes, conflict
resolutions, and any tests added or adjusted during integration.

## Dev Deployment

Every AWS/SST command must set both environment boundaries explicitly:

```sh
AWS_PROFILE=gala SST_STAGE=dev npx sst diff --stage dev
AWS_PROFILE=gala SST_STAGE=dev npx sst deploy --stage dev
```

Run the diff from `infra/` after local verification and commit creation. Review
it before deployment. Stop if it proposes unexpected infrastructure
replacement or deletion, ownership of the externally shared `msc-gala` bucket
or SES resources, a non-`dev` stage, or other control-plane drift.

If the diff is safe, deploy the exact verified commit to the durable `dev`
stage. Production is out of scope and must not be touched.

## Post-Deployment Verification

Verify `https://dev.learngala.dev/up`, the main application response, compiled
JavaScript and stylesheet assets, and the React/Blueprint smoke or invariant
checks available in the combined tree. Confirm the tested commit matches the
deployed source.

A deployment or smoke failure is investigated before any rollback action. No
automatic production or dev rollback is authorized by this design.

## Acceptance Criteria

- `oauth/staged-google-key-rotation` remains unchanged.
- The integration branch has one commit above `c4151711`.
- The final commit deletes the root `CODEOWNERS` file as the only intentional
  current-baseline removal.
- Protected infrastructure and deployment paths match `c4151711` exactly.
- React 19 / Blueprint 6 application behavior from PR #791 is present.
- Application analytics uses Sentry and Ahoy, with no PostHog runtime client.
- Dependency installation, production asset compilation, tests, infra
  contracts, and the local production image build pass.
- SST diff and deploy run only with `AWS_PROFILE=gala SST_STAGE=dev`.
- The reviewed dev diff contains no unexpected destructive or shared-resource
  operations.
- The dev deployment and post-deployment health/application checks pass.
