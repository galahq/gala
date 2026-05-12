# Roadmap: Gala

## Milestones

- Shipped: **v1.0 Upgrade Stabilization** — route-driven Ruby, Node.js, Shakapacker/Webpacker, and BlueprintJS upgrade stabilization. See `.planning/milestones/v1.0-ROADMAP.md`.
- Active: **v1.1 Dependency Modernization and Test Coverage** — pnpm migration, compatible dependency modernization, Flow removal, Vitest/Vite evaluation, frontend test repair, and Playwright visual regression coverage.

## Active Work

### Phase 10: Dependency Target Baseline

- [x] Phase 10: Complete (2026-05-12)

**Goal:** Establish exact dependency targets, compatibility holds, and verification policy before changing lockfiles.

**Requirements:** DEPS-01, DEPS-02, DEPS-03, DEPS-04

**Success Criteria:**
1. Current official registry/doc checks are captured for Ruby, Rails, pnpm, TypeScript, Vitest/Vite, Playwright, Shakapacker/Webpack, and key runtime gems.
2. React 16.8 and BlueprintJS 4.x holds are explicitly documented as v1.1 constraints.
3. Dependency holdbacks below latest are recorded with compatibility reasons.
4. The phase produces a target matrix that later phases can execute against.

### Phase 11: pnpm Package Manager Migration

**Goal:** Replace Yarn 1 with pnpm while preserving install, build, and test parity.

**Requirements:** PNPM-01, PNPM-02, PNPM-03, PNPM-04, PNPM-05

**Success Criteria:**
1. `package.json` declares a pinned pnpm package manager compatible with Node 24.
2. `pnpm-lock.yaml` is generated and committed only after install/build/test parity is proven.
3. Yarn-specific scripts, docs, and lockfile assumptions are removed or replaced.
4. Existing JavaScript build and test commands run through pnpm.

**Plans:** 2 plans

Plans:
**Wave 1**
- [x] 11-01-PLAN.md — Pin pnpm metadata, generate `pnpm-lock.yaml`, and prove install/build/test parity before removing `yarn.lock`.

**Wave 2** *(blocked on Wave 1 completion)*
- [ ] 11-02-PLAN.md — Replace Docker, Semaphore, README/docs, bin, and asset-comment Yarn assumptions with pnpm equivalents.

### Phase 12: Vitest and Vite Feasibility

**Goal:** Decide how far v1.1 should move toward Vitest and Vite before committing to implementation.

**Requirements:** VITE-01, VITE-04, VITE-05, VITE-06

**Success Criteria:**
1. A focused Vitest spike proves whether representative existing tests can run without excessive compatibility shims.
2. A focused Vite build spike tests Rails entrypoints, CSS imports, static assets, and Blueprint compatibility layers.
3. The roadmap decision is documented: Vitest path, Jest fallback, Vite build replacement, or Shakapacker/Webpack retention.
4. Vite production build replacement proceeds only if route, build, and asset compatibility evidence is strong.

### Phase 13: Flow Removal and TypeScript/JSDoc Foundation

**Goal:** Remove Flow from the active frontend toolchain and establish the modern typing path.

**Requirements:** TYPE-01, TYPE-02, TYPE-03, TYPE-04, TYPE-05, TYPE-06

**Success Criteria:**
1. Flow-specific dependencies and config are removed after source parsing no longer needs Flow.
2. `@flow`, `@noflow`, Flow annotations, and `$FlowFixMe` usage are removed or converted.
3. TypeScript is configured as the forward type-system target.
4. JSDoc is used where plain JavaScript is the lower-risk migration path.
5. Broad replacement ignores are avoided or documented with a specific migration reason.

### Phase 14: Ruby Dependency Modernization

**Goal:** Modernize compatible Ruby gems in small, verified groups.

**Requirements:** RUBY-01, RUBY-02, RUBY-03, RUBY-04, QA-03

**Success Criteria:**
1. Gem constraints are audited against current stable compatible releases.
2. Runtime gem updates are applied in small groups with boot and targeted test gates.
3. Development/test gem updates run targeted RSpec or unit gates.
4. Major runtime jumps, such as Puma or Sidekiq, receive separate verification notes.

### Phase 15: JavaScript Dependency and Build Modernization

**Goal:** Modernize compatible JavaScript dependencies while preserving React, BlueprintJS, Shakapacker, and route behavior constraints.

**Requirements:** JS-01, JS-02, JS-03, JS-04

**Success Criteria:**
1. JavaScript dependencies are audited against current stable compatible releases.
2. Shakapacker Ruby and npm package versions remain aligned.
3. Webpack/Shakapacker production behavior is preserved unless Phase 12 explicitly approved Vite replacement.
4. v1.0 Blueprint compatibility layers remain intact and verified after dependency changes.

### Phase 16: Frontend Test Runner Modernization

**Goal:** Restore a reliable pnpm-backed frontend test command, preferably with Vitest.

**Requirements:** VITE-02, VITE-03, TEST-01, TEST-02, TEST-03, TEST-04, QA-04

**Success Criteria:**
1. The selected frontend test runner has a single pnpm-backed command.
2. If Phase 12 proved Vitest feasible, the frontend test scripts use Vitest.
3. If Vitest was not feasible, the Jest fallback path is documented and implemented.
4. Representative existing frontend tests pass under the selected runner.
5. React 16 test environment and modern package transforms are covered by runner config.

### Phase 17: Playwright Visual Regression Coverage

**Goal:** Add durable Playwright visual regression coverage for high-value deterministic routes.

**Requirements:** VIS-01, VIS-02, VIS-03, VIS-04, VIS-05, VIS-06, QA-01, QA-02

**Success Criteria:**
1. Playwright Test is configured as the visual regression runner with pnpm-backed commands.
2. Initial visual specs cover high-value routes derived from `config/routes.rb`.
3. Screenshot baselines are committed and updated only through an explicit update command.
4. Volatile rendering is stabilized with viewports, masks, disabled animations, or style overrides.
5. Browser console and network errors are classified before route-facing visual coverage is accepted.

### Phase 18: Final Verification and Cleanup

**Goal:** Prove v1.1 is coherent end to end and remove leftover Yarn/Flow/test-runner assumptions.

**Requirements:** QA-05

**Success Criteria:**
1. Final Ruby boot/test checks pass or have documented, scoped exceptions.
2. Final JavaScript install/build/test checks pass through pnpm.
3. Selected visual regression checks pass against committed baselines.
4. Documentation and scripts no longer point developers to Yarn or Flow workflows.

## Completed Milestones

<details>
<summary>v1.0 Upgrade Stabilization — shipped 2026-05-12</summary>

- Phase 1: Baseline Asset Gate — 3/3 plans complete
- Phase 2: Public and Utility Routes — 1/1 plan complete
- Phase 3: Catalog Routes — 1/1 plan complete
- Phase 4: Core Case Shell — 1/1 plan complete
- Phase 5: Nested Case Interactions — 4/4 plans complete
- Phase 6: Reader, Library, and Reading Lists — 3/3 plans complete
- Phase 7: Deployments and Integrations — 1/1 plan complete
- Phase 8: Admin and Operations — 2/2 plans complete
- Phase 9: Deslopification and Final Regression — 1/1 plan complete
- Phase 999.8: Follow-up — Phase 8 incomplete plans — 1/1 plan complete

Archive:
- `.planning/milestones/v1.0-ROADMAP.md`
- `.planning/milestones/v1.0-REQUIREMENTS.md`
- `.planning/milestones/v1.0-MILESTONE-AUDIT.md`
- `.planning/milestones/v1.0-phases/`

</details>

## Backlog

- **v1.2+**: React major upgrade.
- **v1.2+**: BlueprintJS major upgrade.
- **v1.2+**: Full Vite production build replacement if v1.1 only proves feasibility.
- **v1.2+**: Expand Playwright visual coverage to all v1.0 route groups.

## Coverage

- v1.1 requirements: 46
- Requirements mapped to phases: 46
- Unmapped requirements: 0
