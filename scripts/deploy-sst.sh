#!/usr/bin/env bash

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
cd "$REPO_ROOT"

source "$SCRIPT_DIR/lib/release-artifacts.sh"
source "$SCRIPT_DIR/lib/ecs-release.sh"
source "$SCRIPT_DIR/lib/rapid-release.sh"
source "$SCRIPT_DIR/lib/stage-target.sh"

usage() {
  cat <<'USAGE'
Usage: scripts/deploy-sst.sh --stage dev|production [--user-data ACTION]

Release actions:
  (blank)                    Deploy the selected dev or preview SST stage.
  promote:vN                 Promote the verified dev version to production.
  rollback                   Restore the channel's immediate predecessor.
  rollback:vN               Restore an explicit retained version.

Stable infrastructure actions:
  infra:diff                 Print the durable-stage SST diff.
  infra:apply                Deploy the reviewed durable SST stage.

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

case "$USER_DATA" in
  ""|infra:diff|infra:apply|promote:v[1-9][0-9]*|rollback|rollback:v[1-9][0-9]*) ;;
  *) echo "Unsupported deploy action: $USER_DATA" >&2; exit 1 ;;
esac

if [[ "$USER_DATA" == promote:* && ! "$USER_DATA" =~ ^promote:v[1-9][0-9]*$ ]] ||
   [[ "$USER_DATA" == rollback:* && ! "$USER_DATA" =~ ^rollback:v[1-9][0-9]*$ ]]; then
  echo "Malformed deploy action: $USER_DATA" >&2
  exit 1
fi

case "$USER_DATA" in
  infra:diff)
    [[ "${GALA_EFFECTIVE_STAGE:-$STAGE}" == "$STAGE" ]] || { echo "Infrastructure actions require a durable stage." >&2; exit 1; }
    (cd infra && npx sst diff --stage "$STAGE")
    ;;
  infra:apply)
    [[ "${GALA_EFFECTIVE_STAGE:-$STAGE}" == "$STAGE" ]] || { echo "Infrastructure actions require a durable stage." >&2; exit 1; }
    (cd infra && npx sst deploy --stage "$STAGE")
    ;;
  "")
    (cd infra && npx sst deploy --stage "${GALA_EFFECTIVE_STAGE:-$STAGE}")
    ;;
  *) rapid_release_main "$STAGE" "$USER_DATA" ;;
esac
