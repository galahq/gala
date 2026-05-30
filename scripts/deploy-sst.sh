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
  --alb-base-url URL    Generated AWS ALB URL used as BASE_URL for production deploys.
  --seed-dump-s3-uri URI
                      Private S3 URI used to hydrate db/sqldump/seed.dump before image build.
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
ALB_BASE_URL="${ALB_BASE_URL:-}"
RETAINED_SECRET_KEYS="${RETAINED_SECRET_KEYS:-}"
SEED_DUMP_S3_URI="${SEED_DUMP_S3_URI:-}"
STATIC_ASSETS_BUCKET="${GALA_STATIC_ASSETS_BUCKET:-gala-static-assets-353760060567}"

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
    --alb-base-url)
      ALB_BASE_URL="$2"
      shift 2
      ;;
    --seed-dump-s3-uri)
      SEED_DUMP_S3_URI="$2"
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

aws_uses_profile() {
  [[ -z "${GITHUB_ACTIONS:-}" && -z "${AWS_ACCESS_KEY_ID:-}" ]]
}

aws_cmd() {
  if aws_uses_profile; then
    AWS_PROFILE="$PROFILE" AWS_REGION="$REGION" SST_STAGE="$STAGE" aws --region "$REGION" --profile "$PROFILE" "$@"
  else
    AWS_REGION="$REGION" SST_STAGE="$STAGE" aws --region "$REGION" "$@"
  fi
}

log_aws_cmd() {
  if aws_uses_profile; then
    log "RUN: AWS_PROFILE=$PROFILE AWS_REGION=$REGION SST_STAGE=$STAGE aws --region $REGION --profile $PROFILE $*"
  else
    log "RUN: AWS_PROFILE=$PROFILE AWS_REGION=$REGION SST_STAGE=$STAGE aws --region $REGION $*"
  fi
}

run_aws_cmd() {
  log_aws_cmd "$*"
  aws_cmd "$@"
}

run_cmd() {
  log "RUN: $*"
  "$@"
}

run_sst_cmd() {
  log "RUN: AWS_PROFILE=$PROFILE AWS_REGION=$REGION SST_STAGE=$STAGE ALB_BASE_URL=${ALB_BASE_URL:-<unset>} $*"
  if aws_uses_profile; then
    AWS_PROFILE="$PROFILE" AWS_REGION="$REGION" SST_STAGE="$STAGE" ALB_BASE_URL="$ALB_BASE_URL" "$@"
  else
    AWS_REGION="$REGION" SST_STAGE="$STAGE" ALB_BASE_URL="$ALB_BASE_URL" "$@"
  fi
}

validate_secret_sync_plan() {
  local forbidden='(^|[[:space:]])(DATABASE_URL|REDIS_HOST|REDIS_URL|HEROKU_POSTGRESQL_[A-Z0-9_]+_URL|CACHE_URL)([[:space:]]|$)'

  if [[ "$RETAINED_SECRET_KEYS" =~ $forbidden ]]; then
    echo "Refusing deploy: RETAINED_SECRET_KEYS includes a database/cache connection key." >&2
    exit 1
  fi

  for key in DATABASE_URL REDIS_HOST REDIS_URL CACHE_URL; do
    if [[ -n "${!key:-}" ]]; then
      echo "Refusing deploy: $key is present in the deploy environment. SST must generate database/cache URLs." >&2
      exit 1
    fi
  done
}

if [[ "$STAGE" == "production" && "$ACTION" == "deploy" && -z "$ALB_BASE_URL" ]]; then
  echo "Warning: ALB_BASE_URL is empty. First deploy may create the ALB; rerun with the generated ALB URL before accepting route validation." >&2
fi

if [[ -n "$SEED_DUMP_S3_URI" && ! "$SEED_DUMP_S3_URI" =~ ^s3:// ]]; then
  echo "Invalid seed dump URI: expected s3:// URI." >&2
  exit 1
fi

validate_secret_sync_plan

if [[ "$STAGE" == "production" && "$ACTION" == "remove" ]]; then
  echo "Refusing to remove production." >&2
  exit 1
fi

if [[ "$STAGE" != "${SST_STAGE:-$STAGE}" ]]; then
  echo "Stage argument '$STAGE' does not match SST_STAGE='${SST_STAGE}'." >&2
  exit 1
fi

log "Deploy target:"
log "  branch: $BRANCH"
log "  stage: $STAGE"
log "  action: $ACTION"
log "  alb_base_url: ${ALB_BASE_URL:-<unset>}"
log "  seed_dump_s3_uri: ${SEED_DUMP_S3_URI:-<unset>}"
log "  static_assets_bucket: $STATIC_ASSETS_BUCKET"

run_cmd git checkout "$BRANCH"

if [[ "$ACTION" == "remove" ]]; then
  cd "$REPO_ROOT/infra"
  run_cmd npm ci
  run_sst_cmd npx sst install
  run_sst_cmd npx sst remove --stage "$STAGE"
  exit 0
fi

ACCOUNT_ID="$(aws_cmd sts get-caller-identity --query Account --output text)"
ECR_URI="${ACCOUNT_ID}.dkr.ecr.${REGION}.amazonaws.com/${IMAGE_NAME}"
LOCAL_IMAGE="${IMAGE_NAME}:${IMAGE_TAG}"
REMOTE_IMAGE="${ECR_URI}:${IMAGE_TAG}"

if [[ ! -f db/sqldump/seed.dump && -n "$SEED_DUMP_S3_URI" ]]; then
  run_cmd mkdir -p db/sqldump
  run_aws_cmd s3 cp "$SEED_DUMP_S3_URI" db/sqldump/seed.dump
fi

if [[ ! -f db/sqldump/seed.dump ]]; then
  echo "Missing db/sqldump/seed.dump. Provide SEED_DUMP_S3_URI or --seed-dump-s3-uri for CI deploys." >&2
  exit 1
fi

log_aws_cmd "ecr get-login-password | docker login --username AWS --password-stdin ${ECR_URI}"
aws_cmd ecr get-login-password | docker login --username AWS --password-stdin "${ECR_URI}"
run_aws_cmd ecr describe-repositories --repository-names "$IMAGE_NAME" >/dev/null || \
  run_aws_cmd ecr create-repository --repository-name "$IMAGE_NAME"
run_cmd docker build --platform linux/amd64 -t "$LOCAL_IMAGE" --build-arg rails_env=production --build-arg secret_key_base=build-placeholder .

sync_static_assets() {
  local container_id
  local assets_dir

  assets_dir="$(mktemp -d)"
  container_id="$(docker create "$LOCAL_IMAGE")"

  cleanup_static_assets() {
    docker rm "$container_id" >/dev/null 2>&1 || true
    rm -rf "$assets_dir"
  }
  trap cleanup_static_assets RETURN

  run_cmd mkdir -p "$assets_dir/public"
  run_cmd docker cp "${container_id}:/gala/public/assets" "$assets_dir/public/assets"
  run_cmd docker cp "${container_id}:/gala/public/packs" "$assets_dir/public/packs"
  run_aws_cmd s3 sync "$assets_dir/public/assets/" "s3://${STATIC_ASSETS_BUCKET}/assets/" --delete \
    --cache-control "public,max-age=31536000,immutable"
  run_aws_cmd s3 sync "$assets_dir/public/packs/" "s3://${STATIC_ASSETS_BUCKET}/packs/" --delete \
    --cache-control "public,max-age=31536000,immutable"
}

sync_static_assets
run_cmd docker tag "$LOCAL_IMAGE" "$REMOTE_IMAGE"
run_cmd docker push "$REMOTE_IMAGE"
run_cmd docker tag "$LOCAL_IMAGE" "${ECR_URI}:latest"
run_cmd docker push "${ECR_URI}:latest"

cd "$REPO_ROOT/infra"
run_cmd npm ci
run_sst_cmd npx sst install
log "RUN: AWS_PROFILE=$PROFILE AWS_REGION=$REGION SST_STAGE=$STAGE ALB_BASE_URL=${ALB_BASE_URL} GALA_WEB_IMAGE_URI=$REMOTE_IMAGE npx sst deploy --stage $STAGE"
if aws_uses_profile; then
  AWS_PROFILE="$PROFILE" AWS_REGION="$REGION" SST_STAGE="$STAGE" ALB_BASE_URL="$ALB_BASE_URL" GALA_WEB_IMAGE_URI="$REMOTE_IMAGE" npx sst deploy --stage "$STAGE"
else
  AWS_REGION="$REGION" SST_STAGE="$STAGE" ALB_BASE_URL="$ALB_BASE_URL" GALA_WEB_IMAGE_URI="$REMOTE_IMAGE" npx sst deploy --stage "$STAGE"
fi

log "Deploy completed for stage '$STAGE' with image '$REMOTE_IMAGE'"
