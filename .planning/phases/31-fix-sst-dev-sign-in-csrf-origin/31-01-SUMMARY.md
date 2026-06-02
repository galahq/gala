# Summary 31-01 - Fix SST sign-in origin handling

## Completed

- Classified the dev preview sign-in failure as F-01 and confirmed it with CloudWatch plus ECS task-definition runtime environment inspection.
- Preserved production as observation-only for this change because its deployed SST runtime already has `BASE_URL=https://learngala.dev` and `FORCE_SSL=true`.
- Updated SST runtime environment derivation so HTTPS base URLs set `FORCE_SSL=true` in dev previews as well as production.
- Added a Devise sign-in request regression that enables CSRF origin checks and posts to `/readers/sign_in` from the dev preview HTTPS origin.
- Extended ECS-only deploy payload guard tests to keep dev HTTPS/HTTP `FORCE_SSL` behavior explicit.

## Validation

Validation is recorded in `31-VALIDATION.md`.

## Decisions Preserved

- Heroku production was not touched.
- ARM64 production adoption remains deferred.
- Thruster remains deferred/no-adopt.
- SST in `infra/sst.config.ts` remains the infrastructure source of truth.
