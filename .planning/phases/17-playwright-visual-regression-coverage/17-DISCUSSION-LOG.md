# Phase 17: Playwright Visual Regression Coverage - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in `17-CONTEXT.md` — this log preserves the alternatives considered.

**Date:** 2026-05-16T00:00:00Z
**Phase:** 17-playwright-visual-regression-coverage
**Areas discussed:** Route Coverage Boundary, Auth Strategy, Visual Stability Baseline, Snapshot Baseline Workflow, and Noise/Failure Policy

---

## Route Coverage Boundary

| Option | Description | Selected |
|--------|-------------|----------|
| Full all-route sweep | Include every route in `config/routes.rb` for first pass. |  |
| Mixed safety-first scope | Cover public routes + reader-safe routes + admin/editor candidate routes, with deferred expansion of lower-signal clusters. | ✓ |
| Admin/editor only | Limit baseline to protected/admin/editor routes only. |  |

**User's choice:** Mixed safety-first scope.
**Notes:** Defer `/deployments`, `/podcasts`, `/libraries/:slug`, and `/sidekiq` to follow-up unless quality signals justify adding them.

---

## Auth Strategy

| Option | Description | Selected |
|--------|-------------|----------|
| Login-once shared session | Authenticate once per run and reuse session state across routes for speed. |  |
| Per-route auth setup | Use deterministic per-route authentication/setup to avoid state bleed across route groups. | ✓ |
| No auth for protected routes | Skip protected routes to avoid auth complexity. |  |

**User's choice:** Per-route auth setup with per-route isolation.
**Notes:** This reduces session leakage and keeps diffs attributable to route changes.

---

## Visual Stability Baseline

| Option | Description | Selected |
|--------|-------------|----------|
| Lenient defaults | Minimal stabilization and route-specific tuning only on failures. |  |
| Strict defaults | Global deterministic defaults first (animation/transition/timing), then route-specific overrides only as needed. | ✓ |
| No viewport controls | Capture at default viewport only. |  |

**User's choice:** Strict defaults + dual-viewpoint baseline (`1366x768`, `375x812`).
**Notes:** This aligns with existing viewport QA patterns and reduces false-positive diffs.

---

## Baseline and Runtime Integration

| Option | Description | Selected |
|--------|-------------|----------|
| Single update command with auto overwrite | `pnpm test:visual` updates and compares both. |  |
| Explicit compare + explicit update | CI-safe compare-only command, with explicit `pnpm test:visual:update` for baseline refresh. | ✓ |
| Disable local artifacts | Store artifacts only in remote S3. |  |

**User's choice:** Explicit compare/update separation; no AWS writes.
**Notes:** Keep artifacts local (`test-results`, `playwright-report`, `tests/screenshots`) and leave S3 untouched.

---

## Noise and Failure Policy

| Option | Description | Selected |
|--------|-------------|----------|
| Ignore all console/network noise | Treat all warnings/errors as non-blocking. |  |
| Known allowlist + hard fail unknowns | Keep explicit allowlist; fail on unclassified warnings/errors. | ✓ |
| Ignore all in CI | Skip noise checks until explicit UI diff triage. |  |

**User's choice:** Hard-fail unknown warnings/errors and require classification before pass criteria.
**Notes:** Keeps baseline noise from masking regressions while permitting explicit approved exceptions.

---

## AWS Safety Constraint

| Option | Description | Selected |
|--------|-------------|----------|
| Refresh S3 snapshots on update | Allow `visual` updates to overwrite current S3-hosted artifacts. |  |
| Keep AWS passive | No writes/overwrites to any pre-existing AWS S3 bucket during this phase. | ✓ |

**User's choice:** Keep AWS passive.
**Notes:** All visual workflow artifacts stay local to repository/runtime paths only.

## Deferred Coverage Candidates

- `/deployments`
- `/podcasts`
- `/libraries/:slug`
- `/sidekiq`

