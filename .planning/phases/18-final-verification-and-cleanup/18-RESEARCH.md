---
phase: 18
research_owner: cleanup-pass
status: draft
updated: 2026-05-16
---

# Phase 18 Research: Cleanup Opportunity Scan

## Scope

This research phase validates where obvious excess code exists and identifies the highest-confidence removals.

## Baseline observations (already present)

- `app/javascript/deprecated/EdgenoteContents.jsx` and `app/javascript/deprecated/OldEdgenote.jsx` are present in the source tree.
- Frontend imports still reference these files:
  - `app/javascript/elements/CaseElement.jsx`
  - `app/javascript/edgenotes/index.jsx`
- `flow-typed/` remains as a legacy typing surface from the Flow era.
- Several non-code artifacts still reference `yarn` and legacy setup assumptions in docs/infrastructure context outside active runtime migration plans.

## Candidate cleanup classes

### Class A: Frontend legacy path cleanup
- Goal: remove/replace legacy `app/javascript/deprecated/*` if the migration path allows.
- Evidence needed:
  - No non-test imports from `deprecated/` outside known compatibility transition points.
  - No route/rendering behavior dependencies on legacy paths.

### Class B: Legacy type-tooling cleanup
- Goal: remove stale flow-typed surfaces once type strategy is stable and no files consume them.
- Evidence needed:
  - `flow-typed` stubs are not required by active imports/build config.
  - `package.json` and babel/test config do not rely on explicit flow stub assumptions.

### Class C: Documentation/config surface pruning
- Goal: replace or quarantine old Yarn references in non-runtime docs/smoke scripts where they are now deprecated.
- Evidence needed:
  - No remaining runtime scripts or CI jobs depend on removed commands.
  - Documentation references are intentionally historical or updated to pnpm.

### Class D: Dead helper/model/test-path discovery
- Goal: identify low-risk unused modules under app/
- Evidence needed:
  - Grep-backed evidence for missing references to candidate files.
  - Clarify if files are only used in tests, migration branches, or dead code paths.

## Discovery commands (executor run)

```bash
# 1) Confirm active imports of deprecated frontend modules
git ls-files app/javascript/deprecated/
rg -n "from ['\"]deprecated/|require\(['\"]deprecated/|from \`deprecated/" app/javascript

# 2) Enumerate potential dead files by reference check
for f in $(git ls-files app/javascript/deprecated/* app/javascript/**/*.{js,jsx} app/models/**/*.rb app/controllers/**/*.rb app/jobs/**/*.rb app/services/**/*.rb spec/**/*.rb spec/**/*.js spec/**/*.jsx 2>/dev/null | tr '\n' ' '); do :; done

# 3) Quick scan for legacy references in docs and scripts
rg -n "yarn test|yarn install|npm install yarn|bin/yarn|engines\.yarn|@flow|@noflow|FlowFixMe|flow-typed" README.md package.json .planning app .github infra .semaphore

# 4) Confirm candidate risk if deprecated code removed
rg -n "EdgenoteContents|OldEdgenote|flow-typed|reading_list_social_image_creation|sv\.anything|Sparql" app app/javascript spec .planning
```

## Exit criteria for this research step

- A prioritized list of safe removals is produced with clear evidence of non-use or intentional replacement.
- Any uncertain candidates are tagged with:
  - exact files
  - owning domain (frontend/backend)
  - required validation commands
  - rollback plan.

## Risks to capture before cleanup

- Draft.js compatibility paths can appear in historical case content; removing render paths without migration safety checks can surface hidden rendering failures.
- Flow stubs may still be required by edge legacy import expectations even after active code migration.
- Over-clearing YAML/copy in app config can create silent startup/runtime regressions.
