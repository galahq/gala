# pr-merge-to-base(7)

## NAME
pr-merge-to-base - protected process for merging reviewed Gala changes

## SYNOPSIS
Merge to the protected base branch through GitHub branch protection and
CODEOWNERS. This is not a mutating `workflow_dispatch` job.

## INPUTS
- Pull request with reviewed diff and passing checks.
- CODEOWNER approval for touched paths.
- Preview URL/comment when a preview deployment was created.
- Operator review of workflow side effects when `.github/workflows/`, `infra/`,
  `scripts/deploy-sst.sh`, `scripts/ops/`, or `docs/ops/workflows/` changed.

## DRY RUN
Use PR checks, preview workflow dry-run, and production promotion dry-run before
merge when workflow or infrastructure side effects changed.

## SIDE EFFECTS
Merging updates the base branch and can make manual workflows available from the
default branch. It must not deploy production by itself.

## VERIFY
Confirm green status checks, CODEOWNER approval, reviewed side effects, resolved
threads, no unreviewed production mutation path, and preview PR comment when a
preview exists.

## ROLLBACK
Code rollback is a normal revert or follow-up PR. Production rollback applies
only after a separate promotion and uses `Rollback AWS`.

## EXAMPLES
Before merge, verify `Preview AWS` comment and checks. After merge, run
`Promote Production AWS` with `dry_run=true` before any production mutation.
