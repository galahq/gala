# Retrospective

## Milestone: v1.0 — Upgrade Stabilization

**Shipped:** 2026-05-12
**Phases:** 10 | **Plans:** 18

### What Was Built

- Stabilized global BlueprintJS asset loading and legacy namespace compatibility.
- Verified public utility, catalog, case, nested case, reader/library/reading-list, deployment/integration, admin, Sidekiq, and final regression route groups.
- Added targeted request/Jest coverage for high-risk upgraded surfaces.
- Cleaned shared compatibility assumptions and recorded non-blocking browser noise.

### What Worked

- Route groups from `config/routes.rb` kept the upgrade work grounded in real app surfaces.
- Focused RSpec and Jest gates gave useful confidence without requiring the currently brittle full frontend suite.
- Browser QA with explicit console/network classification prevented unrelated local development noise from blocking route stabilization.

### What Was Inefficient

- Planning artifact formats evolved during the milestone, leaving mixed `QA-GATE.md`, `QA.md`, `VERIFICATION.md`, and `VALIDATION.md` evidence.
- Some phase closeout records had to be reconciled after the fact, including the Phase 8 follow-up backlog phase and quick-task filename compatibility aliases.
- Full Jest remains too brittle for milestone-level gating because of existing transform configuration issues.

### Patterns Established

- Use `config/routes.rb` as the route coverage source of truth.
- Prefer narrow shared compatibility fixes over route-specific style shims.
- Use mock Google sign-in for protected local browser QA.
- Treat browser-container host/origin and external Mapbox/style warnings as classifiable evidence, not automatic blockers.

### Key Lessons

- Keep requirement status and traceability tables updated during phase closeout; stale pending rows create unnecessary milestone friction.
- Standardize validation artifacts earlier if Nyquist compliance is enabled.
- Preserve targeted final regression commands in the phase QA artifact so milestone audit can rely on concrete evidence.

### Cost Observations

- Model mix: not recorded.
- Sessions: multiple GSD phase and quick-task sessions.
- Notable: route-driven scopes controlled upgrade risk, but planning cleanup added closeout overhead.

## Cross-Milestone Trends

| Trend | Evidence | Follow-up |
| --- | --- | --- |
| Route-driven QA is effective for this app | v1.0 completed all route groups with targeted browser/spec evidence | Keep route grouping for route-affecting milestones |
| Full frontend test suite is not a reliable close gate yet | Full `yarn test --runInBand` blocked on existing transform issues | Consider frontend test modernization in a future milestone |
| Artifact consistency matters at closeout | Audit found Nyquist artifact inconsistency despite complete QA evidence | Decide validation artifact standards before v1.1 execution |
