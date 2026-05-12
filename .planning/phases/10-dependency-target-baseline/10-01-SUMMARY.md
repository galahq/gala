---
phase: 10-dependency-target-baseline
plan: 01
subsystem: planning
tags: [dependencies, ruby, javascript, blueprintjs, react, pnpm, vitest, playwright]
requires: []
provides:
  - Dependency target baseline matrix for v1.1 implementation phases
  - Official-source recheck policy for dependency edits
  - Compatibility holds for React 16.x and BlueprintJS 4.x
affects: [phase-11-pnpm, phase-12-vitest-vite, phase-13-flow-typescript, phase-14-ruby-dependencies, phase-15-js-dependencies, phase-16-frontend-tests, phase-17-visual-regression]
tech-stack:
  added: []
  patterns:
    - Documentation-only dependency policy matrix
    - Separate latest registry evidence from v1.1 target decisions
key-files:
  created:
    - .planning/phases/10-dependency-target-baseline/10-DEPENDENCY-MATRIX.md
  modified: []
key-decisions:
  - "React stays on the existing React 16 baseline for v1.1; React 16.14.0 is only a Phase 15 candidate."
  - "BlueprintJS stays on 4.x for v1.1; BlueprintJS 6 remains outside v1.1 because it requires React 18."
  - "Ruby 4.0.4 is a Phase 14 candidate, not a Phase 10 runtime change."
patterns-established:
  - "Every below-latest dependency target must include a holdback reason, owner phase, source, and recheck command."
requirements-completed: [DEPS-01, DEPS-02, DEPS-03, DEPS-04]
duration: 35min
completed: 2026-05-12
---

# Phase 10: Dependency Target Baseline Summary

**Dependency target matrix with official-source recheck commands and v1.1 compatibility holds**

## Performance

- **Duration:** 35 min
- **Started:** 2026-05-12T02:30:00Z
- **Completed:** 2026-05-12T03:05:00Z
- **Tasks:** 3
- **Files modified:** 1

## Accomplishments

- Created `.planning/phases/10-dependency-target-baseline/10-DEPENDENCY-MATRIX.md`.
- Documented current, latest checked, v1.1 target, decision, holdback reason, owner phase, source, and recheck commands for Ruby, Rails, pnpm, TypeScript, Vitest/Vite, Playwright, Shakapacker/Webpack, React, BlueprintJS, and key Ruby gems.
- Explicitly preserved v1.1 holds for React 16.x and BlueprintJS 4.x while recording later-phase candidates.

## Task Commits

1. **Task 1-3: Dependency matrix, target rows, and verification checklist** - `e9f71da6` (docs)

**Plan metadata:** `99b5523f` (docs)

## Files Created/Modified

- `.planning/phases/10-dependency-target-baseline/10-DEPENDENCY-MATRIX.md` - Dependency target baseline, compatibility holds, source evidence, and verification checklist.

## Decisions Made

- React v1.1 target is the existing React 16 baseline (`package.json` `^16.8.6`, lock 16.12.0); React 16.14.0 is a Phase 15 candidate only.
- `@blueprintjs/select@4.9.24` is a Phase 15 candidate requiring visual QA; BlueprintJS 6 remains outside v1.1 because current 6.x packages require React 18.
- Ruby 4.0.4 is a Phase 14 candidate requiring Rails boot, targeted RSpec, Dockerfile/runtime image review, and deployment parity checks.

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

- Plan verification initially found unresolved open questions in `10-RESEARCH.md`. Resolved them before execution and updated `10-01-PLAN.md` to encode the decisions exactly.
- Codex execute-phase worktree isolation is unsupported while `workflow.use_worktrees=true`; this single documentation-only plan was executed inline on the main worktree.
- The no-change audit showed pre-existing `package.json` and `yarn.lock` diffs. They were left untouched.

## Verification

Passed:

```bash
test -f .planning/phases/10-dependency-target-baseline/10-DEPENDENCY-MATRIX.md
rg -n "DEPS-01|No Change Boundary|Registry/Documentation Recheck Policy|Latest checked|Source|Recheck|npm view|rubygems.org|ruby-lang.org" .planning/phases/10-dependency-target-baseline/10-DEPENDENCY-MATRIX.md
rg -n "DEPS-02|DEPS-03|DEPS-04|React.*16|React.*19|BlueprintJS.*4|BlueprintJS.*6|React 18|Shakapacker|Webpack|pnpm|TypeScript|Vitest|Vite|Playwright|Puma|Sidekiq|Holdback reason|Owner phase" .planning/phases/10-dependency-target-baseline/10-DEPENDENCY-MATRIX.md
rg -n "Verification Checklist|DEPS-01|DEPS-02|DEPS-03|DEPS-04|git diff -- Gemfile Gemfile.lock package.json yarn.lock pnpm-lock.yaml config/webpack config/shakapacker.yml jest.config.js|pre-existing|10-DEPENDENCY-MATRIX.md" .planning/phases/10-dependency-target-baseline/10-DEPENDENCY-MATRIX.md
```

No-change audit:

```bash
git diff -- Gemfile Gemfile.lock package.json yarn.lock pnpm-lock.yaml config/webpack config/shakapacker.yml jest.config.js
```

Result: only pre-existing `package.json` and `yarn.lock` diffs were present.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

Phase 11 can use the matrix's pnpm row and recheck policy before changing `packageManager` or introducing `pnpm-lock.yaml`.

## Self-Check: PASSED

- Matrix file exists.
- DEPS-01 through DEPS-04 are covered.
- React 16.x and BlueprintJS 4.x holds are explicit.
- Below-latest targets include compatibility reasons and owner phases.
- No package manifest, lockfile, package-manager, build, or test-runner config file was modified by this plan.

---
*Phase: 10-dependency-target-baseline*
*Completed: 2026-05-12*
