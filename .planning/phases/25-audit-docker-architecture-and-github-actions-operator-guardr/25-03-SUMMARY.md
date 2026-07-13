# Phase 25-03 Summary: Operator Manpages and Static Validation

## Objective

Write terse CODEOWNER-facing operator pages and add validation so workflow docs
stay complete, concise, and owner-covered.

## Changes

- Added `docs/ops/workflows/deploy-dev.md`.
- Added `docs/ops/workflows/promote-production.md`.
- Added `docs/ops/workflows/rollback.md`.
- Added `docs/ops/workflows/maintenance.md`.
- Added `docs/ops/workflows/pr-merge-to-base.md`.
- Added `scripts/ops/validate-operator-docs.sh`.
- Updated `CODEOWNERS` for `docs/ops/workflows/` and `scripts/ops/`.

## Validation

Commands run locally:

```bash
bash -n scripts/ops/validate-operator-docs.sh
bash scripts/ops/validate-operator-docs.sh
rg -n "^## (NAME|SYNOPSIS|INPUTS|DRY RUN|SIDE EFFECTS|VERIFY|ROLLBACK|EXAMPLES)$" docs/ops/workflows
rg -n "docs/ops/workflows|scripts/ops|.github/workflows|scripts/deploy-sst.sh" CODEOWNERS
wc -l -w docs/ops/workflows/*.md
```

Results:

- Operator docs validation exits 0.
- All workflow docs contain the mandatory manpage headings.
- Each page is under the validator's one-page limits: 95 nonblank lines and 650 words.
- CODEOWNERS covers workflows, deploy script, ops helpers, and operator docs.

## Notes

- No AWS, GitHub, Cloudflare, or Heroku mutation was performed.
