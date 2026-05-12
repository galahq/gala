---
phase: 11-pnpm-package-manager-migration
plan: 02
status: complete
completed: 2026-05-12
---

# 11-02 Summary - pnpm Root Workflow Cleanup

## Changes

- Updated `Dockerfile` to activate `pnpm@11.1.0` through Corepack and install root JavaScript dependencies with `pnpm install --frozen-lockfile`.
- Updated Docker dependency inputs from `yarn.lock` to `pnpm-lock.yaml` and `pnpm-workspace.yaml`.
- Updated Semaphore setup, cache keys, install commands, and Jest command from root Yarn to pnpm.
- Updated README setup, test, dependency, and Docker Compose examples to use Corepack/pnpm.
- Updated asset pipeline and AWS/SST docs to describe the root pnpm workflow while preserving the `infra/` npm boundary.
- Removed the legacy `bin/yarn` wrapper and updated setup/update comments to show `pnpm install --frozen-lockfile`.
- Changed the asset initializer comment from package-manager-specific wording to `node_modules`.

## Verification

- `pnpm install --frozen-lockfile` passed locally.
- `pnpm test -- --runInBand` passed locally: 19 suites passed, 1 skipped; 101 tests passed, 3 skipped.
- `docker compose exec web sh -lc 'pnpm install --frozen-lockfile && SECRET_KEY_BASE=build-placeholder DATABASE_URL=postgresql://placeholder/placeholder bundle exec rails assets:precompile'` passed in the Ruby 4.0.3 dev container.
- `docker build --target build --build-arg rails_env=development -t gala-pnpm-migration-check .` passed and reached the Docker pnpm install layer.
- Static audit passed: no root Yarn references remain in the edited Docker, Semaphore, README, docs, bin, or asset initializer files.
- `infra/package.json`, `infra/package-lock.json`, and `.github/workflows/deploy.yml` were unchanged.

## Notes

- The Dockerfile cannot copy `/usr/local/bin/corepack` as a regular file from the Node image because the script expects adjacent `dist/lib` files. The final Dockerfile copies Node's global modules and creates the same symlink shape used by the Node image before running `corepack enable`.
- The Docker build was run without a production asset precompile because the plan only required proving the pnpm install layer locally; asset precompile was verified in the running Ruby 4.0.3 dev container.
