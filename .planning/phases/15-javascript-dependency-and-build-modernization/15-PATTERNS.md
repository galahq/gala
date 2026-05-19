---
phase: 15
version: draft
generated_from:
  - .planning/phases/15-javascript-dependency-and-build-modernization/15-CONTEXT.md
  - .planning/phases/15-javascript-dependency-and-build-modernization/15-DISCUSSION-LOG.md
  - .planning/phases/15-javascript-dependency-and-build-modernization/15-RESEARCH.md
---

# Phase 15 Pattern Map

## Overview

Phase 15 is expected to modify dependency manifests and lockfile entries only; production behavior files should remain stable unless explicit compatibility gates pass.

## Pattern Map

| Pattern ID | Files | Role | Source | Why it matters in Phase 15 |
|---|---|---|---|---|
| P15-01 | `package.json` | Dependency source of truth | Research + context | Every patch candidate starts here; this file must remain narrowly changed. |
| P15-02 | `pnpm-lock.yaml` | Resolved dependency graph | lockfile baseline | Every batch leaves an explicit diff showing only intended upgrades. |
| P15-03 | `Gemfile`, `Gemfile.lock` | Ruby-side bundler alignment | Existing Rails stack | Enforces JS-02 alignment for `shakapacker` 10.0.0. |
| P15-04 | `config/shakapacker.yml`, `config/webpack/environment.js` | Production bundling contract | AGENTS + phase context | Protects JS-03 by preserving manifest behavior, loader chain, aliases, and split-chunk strategy. |
| P15-05 | `app/views/layouts/application.html.erb`, `app/assets/stylesheets/application.css`, `app/javascript/packs/styles.js`, `app/javascript/shared/blueprintLegacyNamespace.js` | Blueprint compatibility surface | Blueprint constraints + phase 12 decision | Enforces JS-04: no CSS ownership migration or class-bridge drift without explicit compatibility evidence. |

## Pattern Guidance for Executors

- Keep dependency changes in small batches and run gates after each batch.
- Never infer new behavior from lockfile-only changes; read manifest and relevant config files before each edit.
- Preserve the 4.x Blueprint compatibility layer unless a task has explicit pass/fail route evidence.
- Do not touch `app/javascript/shared/blueprintLegacyNamespace.js` unless a task owns blueprint risk and route checks.

