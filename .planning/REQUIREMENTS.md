# Requirements: Gala v1.1 Dependency Modernization, Test Coverage, and AWS Deployment

**Defined:** 2026-05-12
**Core Value:** Every important route must keep working and looking recognizably like the pre-upgrade Gala experience while the Ruby, Node.js, and BlueprintJS stack is modernized, and AWS deployment proceeds without disrupting current Heroku production.

## v1.1 Requirements

### Dependency Policy

- [x] **DEPS-01**: Dependency target selection uses current official registry/doc data at implementation time.
- [x] **DEPS-02**: React remains on the current 16.8 line during v1.1.
- [x] **DEPS-03**: BlueprintJS remains on the current 4.x line during v1.1.
- [x] **DEPS-04**: Any dependency intentionally held below latest is documented with the compatibility reason.

### pnpm Migration

- [x] **PNPM-01**: Node package management uses pnpm instead of Yarn 1.
- [x] **PNPM-02**: `package.json` declares a pinned pnpm package manager version compatible with Node 24.
- [x] **PNPM-03**: `pnpm-lock.yaml` is generated and committed after install/test parity is proven.
- [x] **PNPM-04**: Yarn-specific scripts, docs, and lockfile assumptions are removed or replaced.
- [x] **PNPM-05**: Existing JavaScript build and test commands run through pnpm.

### Flow Removal and Modern Typing

- [x] **TYPE-01**: Flow-specific Node dependencies and tooling are removed from active project configuration.
- [x] **TYPE-02**: Source files no longer require Flow parsing to build or test.
- [x] **TYPE-03**: Flow annotations, `$FlowFixMe`, `@flow`, and `@noflow` comments are removed or converted.
- [x] **TYPE-04**: TypeScript is introduced as the forward type-system target.
- [x] **TYPE-05**: JSDoc is allowed for JavaScript files where TypeScript/TSX conversion would add unnecessary churn.
- [x] **TYPE-06**: New broad ignore comments are avoided unless a specific migration reason is documented.

### Ruby Dependency Modernization

- [x] **RUBY-01**: Ruby gem constraints are audited against current stable compatible releases.
- [x] **RUBY-02**: Runtime gem updates are applied in small groups with boot and targeted test gates.
- [x] **RUBY-03**: Development/test gem updates are applied with targeted RSpec or unit test gates.
- [x] **RUBY-04**: Major runtime gem jumps, such as Puma or Sidekiq, receive separate verification notes.

### JavaScript Dependency Modernization

- [ ] **JS-01**: JavaScript dependencies are audited against current stable compatible releases.
- [ ] **JS-02**: Shakapacker Ruby and npm package versions remain aligned.
- [ ] **JS-03**: Webpack/Shakapacker production build behavior is preserved unless Vite replacement is explicitly proven safe.
- [ ] **JS-04**: JavaScript dependency updates preserve the v1.0 Blueprint compatibility layers.

### Vitest and Vite Evaluation

- [x] **VITE-01**: A focused spike determines whether Vitest can replace Jest for the existing frontend test suite.
- [ ] **VITE-02**: If Vitest is feasible, frontend test scripts use Vitest under pnpm.
- [ ] **VITE-03**: If Vitest is not feasible within v1.1, the fallback Jest modernization path is documented and implemented.
- [x] **VITE-04**: A focused spike determines whether Vite can support Gala's Rails frontend entrypoints, CSS imports, static assets, and Blueprint compatibility layers.
- [x] **VITE-05**: Vite production bundler replacement only proceeds if the spike proves route, build, and asset compatibility.
- [x] **VITE-06**: If Vite build replacement is not accepted for v1.1, Shakapacker/Webpack remains the production bundler.

### Frontend Test Coverage

- [ ] **TEST-01**: A single pnpm-backed frontend test command runs reliably.
- [ ] **TEST-02**: Existing representative frontend tests pass under the selected runner.
- [ ] **TEST-03**: Test environment setup for React 16 components is documented in project configuration.
- [ ] **TEST-04**: Transform handling for modern package module formats is covered by the selected runner config.

### Playwright Visual Regression

- [ ] **VIS-01**: Playwright Test is configured as the canonical visual regression runner.
- [ ] **VIS-02**: Visual tests use route groups derived from `config/routes.rb`.
- [ ] **VIS-03**: Initial visual coverage includes a small deterministic set of high-value public routes.
- [ ] **VIS-04**: Screenshot baselines are committed and updated only through an explicit update command.
- [ ] **VIS-05**: Visual tests stabilize volatile rendering with fixed viewports, disabled animations, masks, or style overrides where needed.
- [ ] **VIS-06**: Visual test commands are pnpm-backed and documented.

### Verification and QA Gates

- [ ] **QA-01**: Route-facing changes are checked on `localhost:3000`.
- [ ] **QA-02**: Browser console and network errors are classified before route-facing phases are accepted.
- [x] **QA-03**: Targeted Ruby tests run for touched Ruby dependency or behavior changes.
- [ ] **QA-04**: Targeted frontend tests run for touched JavaScript, typing, test-runner, or visual harness changes.
- [ ] **QA-05**: Final verification includes Ruby boot/test checks, JavaScript install/build/test checks, and selected route visual checks.

### AWS SST Deployment Safety

- [ ] **DPLY-01**: AWS deployment runs through SST IaC in `.github/workflows/deploy.yml`.
- [ ] **DPLY-02**: Current Heroku production at `https://www.learngala.com` is not mutated by AWS deployment work.
- [ ] **DPLY-03**: The AWS environment is validated through the generated AWS ALB URL until separate DNS cutover approval.
- [ ] **DPLY-04**: AWS runtime uses freshly provisioned SST database and cache connection strings, not Heroku production `DATABASE_URL`, `REDIS_HOST`, `REDIS_URL`, or equivalent values.
- [ ] **DPLY-05**: The AWS database is initialized from `db/sqldump/seed.dump`.
- [ ] **DPLY-06**: Heroku `msc-gala` secrets are read only through Heroku CLI and copied only for retained non-database/non-cache keys.
- [ ] **DPLY-07**: Existing ActiveStorage S3 objects and retained AWS resources are imported or referenced without destructive actions.
- [ ] **DPLY-08**: Rollback is documented and verified through SST/ECS deployment state without changing Heroku production.
- [ ] **DPLY-09**: Every AWS/SST execution command uses `AWS_PROFILE=gala AWS_REGION=us-west-2 SST_STAGE=production`; every read-only Heroku command uses `heroku --app msc-gala`.

## v1.2+ Candidates

### Larger Frontend Migrations

- **NEXT-01**: Upgrade React to a newer major version.
- **NEXT-02**: Upgrade BlueprintJS to a newer major version.
- **NEXT-03**: Replace Shakapacker/Webpack with Vite if v1.1 only proves feasibility.
- **NEXT-04**: Expand Playwright visual regression to all v1.0 route groups.

## Out of Scope

| Feature | Reason |
| --- | --- |
| React major upgrade | User direction is to keep current React during v1.1. |
| BlueprintJS major upgrade | User direction is to keep current BlueprintJS during v1.1. |
| Replacing BlueprintJS with another UI library | Product/UI library migration is separate from dependency/test modernization. |
| Full UI redesign | v1.1 preserves the v1.0 Blueprint-era visual compatibility target. |
| Full TypeScript rewrite of all frontend files | Flow removal should be staged and low-risk; JSDoc is acceptable where conversion churn is not justified. |
| Mandatory Vite production build replacement | Vite replacement is gated by feasibility evidence; Vitest can proceed independently. |
| Pixel-perfect visual coverage for every route | v1.1 should establish durable coverage before expanding breadth. |

## Traceability

| Requirement | Phase | Status |
| --- | --- | --- |
| DEPS-01 | Phase 10 | Complete |
| DEPS-02 | Phase 10 | Complete |
| DEPS-03 | Phase 10 | Complete |
| DEPS-04 | Phase 10 | Complete |
| PNPM-01 | Phase 11 | Complete |
| PNPM-02 | Phase 11 | Complete |
| PNPM-03 | Phase 11 | Complete |
| PNPM-04 | Phase 11 | Complete |
| PNPM-05 | Phase 11 | Complete |
| TYPE-01 | Phase 13 | Complete |
| TYPE-02 | Phase 13 | Complete |
| TYPE-03 | Phase 13 | Complete |
| TYPE-04 | Phase 13 | Complete |
| TYPE-05 | Phase 13 | Complete |
| TYPE-06 | Phase 13 | Complete |
| RUBY-01 | Phase 14 | Complete |
| RUBY-02 | Phase 14 | Complete |
| RUBY-03 | Phase 14 | Complete |
| RUBY-04 | Phase 14 | Complete |
| JS-01 | Phase 15 | Pending |
| JS-02 | Phase 15 | Pending |
| JS-03 | Phase 15 | Pending |
| JS-04 | Phase 15 | Pending |
| VITE-01 | Phase 12 | Complete |
| VITE-02 | Phase 16 | Pending |
| VITE-03 | Phase 16 | Pending |
| VITE-04 | Phase 12 | Complete |
| VITE-05 | Phase 12 | Complete |
| VITE-06 | Phase 12 | Complete |
| TEST-01 | Phase 16 | Pending |
| TEST-02 | Phase 16 | Pending |
| TEST-03 | Phase 16 | Pending |
| TEST-04 | Phase 16 | Pending |
| VIS-01 | Phase 17 | Pending |
| VIS-02 | Phase 17 | Pending |
| VIS-03 | Phase 17 | Pending |
| VIS-04 | Phase 17 | Pending |
| VIS-05 | Phase 17 | Pending |
| VIS-06 | Phase 17 | Pending |
| QA-01 | Phase 17 | Pending |
| QA-02 | Phase 17 | Pending |
| QA-03 | Phase 14 | Complete |
| QA-04 | Phase 16 | Pending |
| QA-05 | Phase 18 | Pending |
| DPLY-01 | Phase 20 | Pending |
| DPLY-02 | Phase 20 | Pending |
| DPLY-03 | Phase 20 | Pending |
| DPLY-04 | Phase 20 | Pending |
| DPLY-05 | Phase 20 | Pending |
| DPLY-06 | Phase 20 | Pending |
| DPLY-07 | Phase 20 | Pending |
| DPLY-08 | Phase 20 | Pending |
| DPLY-09 | Phase 20 | Pending |

**Coverage:**
- v1.1 requirements: 55 total
- Mapped to phases: 55
- Unmapped: 0

---
*Requirements defined: 2026-05-12*
*Last updated: 2026-05-22 after Phase 20 AWS deployment audit*
