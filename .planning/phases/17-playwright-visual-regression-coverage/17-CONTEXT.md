# Phase 17: Playwright Visual Regression Coverage - Context

**Gathered:** 2026-05-16
**Status:** Ready for planning

## Phase Boundary

This phase adds deterministic Playwright visual regression coverage for high-value routes, using snapshots as an evidence layer tied to `config/routes.rb`.

## Implementation Decisions

### Coverage and route scope

- **D-01:** Start with a mixed initial route set: public routes + reader-safe routes + admin/editor candidate routes.
- **D-02:** Include public routes: `/`, `/catalog/*`, `/cases/:slug/*`, and `/search`.
- **D-03:** Include reader-safe routes: `/profile`, `/my_cases`, and `/reading_lists`.
- **D-04:** Include admin/editor candidate routes: `/admin` and `/admin/cases`.
- **D-05:** Exclude broader route clusters from the first baseline batch (`/deployments`, `/podcasts`, `/libraries/:slug`, `/sidekiq`) unless they become priority in a follow-up.

### Auth and test isolation

- **D-06:** Use per-route auth setup for protected routes.
- **D-07:** Authenticate for each protected route test to target deterministic, isolated coverage and avoid cross-test session leakage.
- **D-08:** Keep AWS integration passive for this phase: do **not** write or overwrite any AWS S3 bucket contents from visual test execution or baseline refresh tasks.

### Visual stability policy

- **D-09:** Strict stabilization mode is mandatory on first pass (global deterministic defaults for animations, transitions, timing behavior, and viewport).
- **D-10:** Capture two viewports for each selected route: `1366x768` and `375x812`.
- **D-11:** Use global strict defaults first, with route-specific overrides/masks only when global settings are insufficient.

### Baseline and command contract

- **D-12:** Use strict command separation:
  - `pnpm test:visual` for compare-only visual regressions (CI-safe, fail-on-diff).
  - `pnpm test:visual:update` only for explicit baseline refresh.
- **D-13:** Treat baseline updates as intentional actions and review snapshots before commit.

### Noise and failure policy

- **D-14:** Enforce block-on-unknown policy for console/network noise while maintaining an explicit allowlist for known non-blocking noise only when classified.
- **D-15:** Do not advance pass criteria when unclassified warnings/errors appear unless they are documented as pre-approved baseline noise.

## Canonical References

### Planning and requirements

- `.planning/ROADMAP.md` — Phase 17 goal and success criteria for VIS-01 through VIS-06.
- `.planning/REQUIREMENTS.md` — Playwright requirements (`VIS-01` to `VIS-06`) and verification expectations (`QA-01`, `QA-02`).
- `.planning/STATE.md` — milestone constraints, route-first QA policy, and execution rules.

### Route and app constraints

- `config/routes.rb` — authoritative route surface to derive deterministic route candidates.
- `AGENTS.md` — routing and browser QA constraints for the repository.

### Existing test context

- `.planning/codebase/TESTING.md` — legacy test framework, conventions, and existing test organization.
- `package.json` — Playwright presence and Node/pnpm command context before adding dedicated visual scripts.

### Historical context

- `.planning/phases/16-frontend-test-runner-modernization/16-CONTEXT.md` — runner policy continuity.
- `.planning/phases/16-frontend-test-runner-modernization/16-01-SUMMARY.md` — current frontend command reality and test stability expectations.

## Existing Code Insights

### Reusable Assets
- `config/routes.rb` already partitions public, authenticated, and admin surface by route namespace.
- Existing feature route groupings in app views/packs and controllers (from previous phases) can be reused for deterministic URL generation.

### Established Patterns
- Existing test strategy is explicit in `package.json` + legacy Jest setup; Playwright additions should follow similar script naming conventions and `pnpm` usage.
- Route QA in earlier phases was bounded by deterministic route coverage and local browser checks on `localhost:3000`.

### Integration Points
- Snapshot coverage should validate rendered pages that flow through the Rails layout and pack/bootstrap chain in normal browser mode.
- Coverage must remain in-repo and avoid cloud artifact writes in this phase.

### Specific Ideas

- Keep AWS safe: configure Playwright artifacts (`test-results`, `playwright-report`, `tests/screenshots`) as repository/runtime local paths only.
- Add explicit per-route setup for auth and snapshot normalization only where necessary.
- Prioritize stable selectors and visible assertions over DOM internals to reduce brittle baseline churn.

## Deferred Ideas

- Expand to `/deployments`, `/podcasts`, `/libraries/:slug`, and `/sidekiq` as a follow-up once the initial baseline is stable.

---

*Phase: 17-Playwright Visual Regression Coverage*
*Context gathered: 2026-05-16*
