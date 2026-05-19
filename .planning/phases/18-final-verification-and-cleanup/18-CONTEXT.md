---
phase: 18
goal: Final verification and cleanup pass focused on removing clearly extraneous code surface
title: Phase 18 codebase cleanup context
---

# Phase 18 Context — Final Verification and Cleanup

## Why this phase now

This phase is a deliberate code-health pass for v1.1 that targets **extra code that is no longer necessary to maintain behavior**.

Recent cleanup signals already identified include:
- Deprecated edgenote rendering paths still present in the frontend tree and active references.
- Legacy typing artifacts that remain from the Flow-era toolchain.
- Old dependency-management assumptions (`yarn`) that still appear in docs and support scripts.
- Potential dead UI/validation code that can be removed only after confirming no active imports/route references.

The goal is to produce a prioritized, low-risk list of removals and then execute removals in small, reversible waves.

## Scope boundaries

- Keep route behavior and Blueprint-compatible visual baseline unchanged unless a cleanup removal causes route-facing behavior changes.
- Do not mix in unrelated major refactors (React/Blueprint/Ruby/framework upgrades stay in future milestones).
- Use execution gates from this phase for each cleanup wave:
  - targeted backend tests for touched Rails areas
  - targeted frontend unit tests for touched JS modules
  - browser QA only if the change crosses into route-facing rendering surfaces

## Source references

- `.planning/ROADMAP.md`
- `.planning/REQUIREMENTS.md`
- `.planning/STATE.md`
- `.planning/PROJECT.md`
- `.planning/codebase/CONCERNS.md`
- `.planning/codebase/STRUCTURE.md`
- `.planning/codebase/TESTING.md`
- `AGENTS.md`
- `app/javascript/deprecated/OldEdgenote.jsx`
- `app/javascript/deprecated/EdgenoteContents.jsx`

## Boundaries and non-goals

- Non-goal: any major rendering rewrite or user-facing redesign.
- Non-goal: changing React/Blueprint major versions.
- Non-goal: broad dependency upgrades outside already approved v1.1 paths.
- In-scope: removing files and imports only when a usage evidence check proves they are dead or intentionally frozen.

