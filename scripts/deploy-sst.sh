#!/usr/bin/env bash

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
cd "$REPO_ROOT"

source "$SCRIPT_DIR/lib/canonical-release.sh"
source "$SCRIPT_DIR/lib/release-artifacts.sh"
source "$SCRIPT_DIR/lib/ecs-release.sh"
source "$SCRIPT_DIR/lib/rapid-release.sh"
source "$SCRIPT_DIR/lib/stage-target.sh"

usage() {
  cat <<'USAGE'
Usage: scripts/deploy-sst.sh --stage dev|production [--user-data ACTION]

Release actions:
  (blank)                    Build and deploy canonical v<GITHUB_RUN_NUMBER>.
  promote:vN                Promote the verified dev version to production.
  rollback                   Restore the channel's immediate predecessor.
  rollback:vN               Restore an explicit retained version.

Stable infrastructure actions:
  infra:diff                 Write a state-versioned, fingerprinted plan.
  infra:apply:PLAN_ID        Recheck and apply that exact plan.

Compatibility:
  --branch is accepted but never checks out or mutates the working tree.
USAGE
}

STAGE="${SST_STAGE:-dev}"
USER_DATA="${USER_DATA:-}"
AWS_REGION="${AWS_REGION:-us-west-2}"
AWS_PROFILE="${AWS_PROFILE:-}"

while [[ $# -gt 0 ]]; do
  case "$1" in
    --stage) STAGE="$2"; shift 2 ;;
    --user-data) USER_DATA="$2"; shift 2 ;;
    --branch) shift 2 ;;
    --region) AWS_REGION="$2"; shift 2 ;;
    --profile) AWS_PROFILE="$2"; shift 2 ;;
    --help) usage; exit 0 ;;
    *) echo "Unknown argument: $1" >&2; usage; exit 1 ;;
  esac
done

if [[ "$STAGE" != dev && "$STAGE" != production ]]; then
  echo "Stage must be dev or production; previews are derived from dev." >&2
  exit 1
fi
if [[ -n "${SST_STAGE:-}" && "$SST_STAGE" != "$STAGE" ]]; then
  echo "--stage does not match SST_STAGE." >&2
  exit 1
fi
validate_effective_stage "$STAGE" "${GALA_EFFECTIVE_STAGE:-$STAGE}"
if [[ "$AWS_REGION" != us-west-2 ]]; then
  echo "Gala infrastructure is restricted to us-west-2." >&2
  exit 1
fi

for command in aws jq rg curl; do
  command -v "$command" >/dev/null || { echo "Missing command: $command" >&2; exit 1; }
done
case "$USER_DATA" in
  "")
    command -v docker >/dev/null || { echo "Missing command: docker" >&2; exit 1; }
    ;;
  promote:v[1-9][0-9]*|rollback|rollback:v[1-9][0-9]*|infra:diff|infra:apply:plan-v[1-9][0-9]*-*) ;;
  *) echo "Unsupported deploy action: $USER_DATA" >&2; exit 1 ;;
esac

if [[ "$USER_DATA" == promote:* && ! "$USER_DATA" =~ ^promote:v[1-9][0-9]*$ ]] ||
   [[ "$USER_DATA" == rollback:* && ! "$USER_DATA" =~ ^rollback:v[1-9][0-9]*$ ]] ||
   [[ "$USER_DATA" == infra:apply:* && ! "$USER_DATA" =~ ^infra:apply:plan-v[1-9][0-9]*-(dev|production)$ ]]; then
  echo "Malformed deploy action: $USER_DATA" >&2
  exit 1
fi

rapid_release_main "$STAGE" "$USER_DATA"
