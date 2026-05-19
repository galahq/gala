#!/usr/bin/env bash

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
cd "$REPO_ROOT"

usage() {
  cat <<'USAGE'
Usage: scripts/deploy-sst.sh --branch BRANCH --stage STAGE [--action deploy|remove]

Options:
  --branch BRANCH      Branch to deploy (default: current default branch).
  --stage STAGE        SST stage to deploy (dev|production).
  --action ACTION      deploy or remove (default: deploy).
  --image-tag TAG      Optional image tag (default: GITHUB_SHA or git short sha).
  --region REGION      AWS region (default: us-west-2).
  --profile PROFILE    AWS profile name (default: gala).
  --help               Show this help text.
USAGE
}

BRANCH="${GITHUB_REF_NAME:-main}"
STAGE="dev"
ACTION="deploy"
IMAGE_TAG="${GITHUB_SHA:-$(git rev-parse --short HEAD)}"
IMAGE_NAME="${SST_IMAGE_NAME:-gala}"
REGION="${AWS_REGION:-us-west-2}"
PROFILE="${AWS_PROFILE:-gala}"

while [[ $# -gt 0 ]]; do
  case "$1" in
    --branch)
      BRANCH="$2"
      shift 2
      ;;
    --stage)
      STAGE="$2"
      shift 2
      ;;
    --action)
      ACTION="$2"
      shift 2
      ;;
    --image-tag)
      IMAGE_TAG="$2"
      shift 2
      ;;
    --region)
      REGION="$2"
      shift 2
      ;;
    --profile)
      PROFILE="$2"
      shift 2
      ;;
    --help)
      usage
      exit 0
      ;;
    *)
      echo "Unknown argument: $1"
      usage
      exit 1
      ;;
  esac
done

if [[ "$STAGE" != "dev" && "$STAGE" != "production" ]]; then
  echo "Invalid stage: $STAGE (expected dev or production)"
  exit 1
fi

if [[ "$ACTION" != "deploy" && "$ACTION" != "remove" ]]; then
  echo "Invalid action: $ACTION (expected deploy or remove)"
  exit 1
fi

log() {
  echo "[$(date -u +'%Y-%m-%dT%H:%M:%SZ')] $*"
}

run_cmd() {
  log "RUN: $*"
  eval "$*"
}

log "Deploy target:"
log "  branch: $BRANCH"
log "  stage: $STAGE"
log "  action: $ACTION"

run_cmd "cd '$REPO_ROOT'"
run_cmd "git checkout '$BRANCH'"

if [[ "$ACTION" == "remove" ]]; then
  run_cmd "cd '$REPO_ROOT/infra'"
  run_cmd "npm ci"
  run_cmd "npx sst install"
  run_cmd "npx sst remove --stage '$STAGE'"
  exit 0
fi

ACCOUNT_ID="$(aws --region "$REGION" --profile "$PROFILE" sts get-caller-identity --query Account --output text)"
ECR_URI="${ACCOUNT_ID}.dkr.ecr.${REGION}.amazonaws.com/${IMAGE_NAME}"
LOCAL_IMAGE="${IMAGE_NAME}:${IMAGE_TAG}"
REMOTE_IMAGE="${ECR_URI}:${IMAGE_TAG}"

run_cmd "aws --region '$REGION' --profile '$PROFILE' ecr get-login-password | docker login --username AWS --password-stdin '${ECR_URI}'"
run_cmd "aws --region '$REGION' --profile '$PROFILE' ecr describe-repositories --repository-names '$IMAGE_NAME' >/dev/null || aws --region '$REGION' --profile '$PROFILE' ecr create-repository --repository-name '$IMAGE_NAME'"
run_cmd "docker build --platform linux/amd64 -t '$LOCAL_IMAGE' --build-arg rails_env=production --build-arg secret_key_base=build-placeholder ."
run_cmd "docker tag '$LOCAL_IMAGE' '$REMOTE_IMAGE'"
run_cmd "docker push '$REMOTE_IMAGE'"
run_cmd "docker tag '$LOCAL_IMAGE' '${ECR_URI}:latest'"
run_cmd "docker push '${ECR_URI}:latest'"

run_cmd "cd '$REPO_ROOT/infra'"
run_cmd "npm ci"
run_cmd "npx sst install"
run_cmd "GALA_WEB_IMAGE_URI='$REMOTE_IMAGE' npx sst deploy --stage '$STAGE'"

log "Deploy completed for stage '$STAGE' with image '$REMOTE_IMAGE'"
