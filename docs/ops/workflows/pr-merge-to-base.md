# pr-merge-to-base(7)

## NAME
pr-merge-to-base - protected process for merging reviewed Gala changes

## SYNOPSIS
Merge to the protected base branch through GitHub branch protection and
CODEOWNERS. This is not a mutating `workflow_dispatch` job.

## INPUTS
- Pull request with reviewed diff and passing `ci` evidence.
- CODEOWNER approval for touched paths.
- Preview URL/comment when a `deploy` dev preview was created.
- Operator review of workflow side effects when `.github/workflows/`, `infra/`,
  `scripts/deploy-sst.sh`, `scripts/ops/`, or `docs/ops/workflows/` changed.

## DRY RUN
Use `ci` evidence, `infra` with `command=diff`, and any required dev preview
before merge when workflow or infrastructure side effects changed.

## SIDE EFFECTS
Merging updates the base branch and can make manual workflows available from the
default branch. It must not deploy production by itself.

## VERIFY
Confirm green status checks, CODEOWNER approval, reviewed side effects, resolved
threads, no unreviewed production mutation path, and preview PR comment when a
preview exists.

## ROLLBACK
Code rollback is a normal revert or follow-up PR. Production recovery applies
only after a separate `deploy` promotion or explicit operator-script action.

## EXAMPLES
Before merge, inspect `ci` and run `infra` with `command=diff` for infrastructure
risk. After merge, run `deploy` with `stage=production` only when the production
operator gate is intentionally being exercised.
