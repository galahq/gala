#!/usr/bin/env bash

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
cd "$REPO_ROOT"

usage() {
  cat <<'USAGE'
Usage: scripts/deploy-gala-aws-production.sh [options]

Options:
  --dry-run                     Print commands only.
  --image-tag TAG               Override image tag.
  --asset-bucket NAME           Target bucket for static assets.
  --source-bucket NAME          Source media bucket for optional import.
  --reuse-source-bucket          Use source media bucket as target.
  --skip-heroku-secret-check     Skip read-only Heroku fallback checks.
  --skip-asset-import           Skip source->target media import.
  --data-dump PATH              Override data dump path.
  --help                        Show this help text.
USAGE
}

DRY_RUN="false"
IMAGE_TAG="$(git rev-parse --short HEAD 2>/dev/null || date +%Y%m%d%H%M%S)"
IMAGE_NAME="gala"
REGION="us-west-2"
PROFILE="${AWS_PROFILE:-gala}"
TARGET_ASSET_BUCKET="${GALA_STATIC_ASSETS_BUCKET:-gala-static-assets}"
SOURCE_MEDIA_BUCKET="${SOURCE_MEDIA_BUCKET:-msc-gala}"
REUSE_MEDIA_BUCKET="false"
SKIP_HEROKU_CHECK="false"
IMPORT_ASSETS="true"
DATA_DUMP_PATH="${DATA_DUMP_PATH:-}"

while [[ $# -gt 0 ]]; do
  case "$1" in
    --dry-run)
      DRY_RUN="true"
      shift
      ;;
    --image-tag)
      IMAGE_TAG="$2"
      shift 2
      ;;
    --asset-bucket)
      TARGET_ASSET_BUCKET="$2"
      shift 2
      ;;
    --source-bucket)
      SOURCE_MEDIA_BUCKET="$2"
      shift 2
      ;;
    --reuse-source-bucket)
      REUSE_MEDIA_BUCKET="true"
      shift
      ;;
    --skip-heroku-secret-check)
      SKIP_HEROKU_CHECK="true"
      shift
      ;;
    --skip-asset-import)
      IMPORT_ASSETS="false"
      shift
      ;;
    --data-dump)
      DATA_DUMP_PATH="$2"
      shift 2
      ;;
    --help)
      usage
      exit 0
      ;;
    *)
      echo "Unknown argument: $1" >&2
      usage
      exit 1
      ;;
  esac
done

log() {
  echo "[$(date -u +'%Y-%m-%dT%H:%M:%SZ')] $*"
}

run_cmd() {
  if [[ "$DRY_RUN" == "true" ]]; then
    log "DRY-RUN: $*"
    return 0
  fi

  log "RUN: $*"
  "$@"
}

resolve_data_dump() {
  if [[ -n "$DATA_DUMP_PATH" && -f "$DATA_DUMP_PATH" ]]; then
    echo "$DATA_DUMP_PATH"
    return 0
  fi

  if [[ -n "$DATA_DUMP_PATH" ]]; then
    log "Configured data dump missing: $DATA_DUMP_PATH"
  fi

  find db -maxdepth 4 -type f \( -name '*.dump' -o -name '*.sql' \) | head -n 1
}

require_command() {
  local binary="$1"
  if ! command -v "$binary" >/dev/null 2>&1; then
    echo "Required command not found: $binary" >&2
    exit 1
  fi
}

require_command docker
require_command aws
require_command git

if [[ "${HEROKU_APP_NAME:-}" != "" && "$SKIP_HEROKU_CHECK" != "true" ]]; then
  if command -v heroku >/dev/null 2>&1; then
    log "Heroku secret fallback enabled for ${HEROKU_APP_NAME} (read-only)."
  else
    log "heroku CLI not found; Heroku read fallback will be skipped."
  fi
fi

DATA_DUMP_FILE="$(resolve_data_dump)"
if [[ -z "$DATA_DUMP_FILE" ]]; then
  log "No db dump found under db/**/*"
else
  log "Using data dump: $DATA_DUMP_FILE"
fi

if [[ "$DRY_RUN" == "true" ]]; then
  ACCOUNT_ID="${AWS_ACCOUNT_ID:-000000000000}"
else
  ACCOUNT_ID="${AWS_ACCOUNT_ID:-$(aws --profile "$PROFILE" sts get-caller-identity --query Account --output text --region "$REGION")}"
fi
ECR_URI="${ACCOUNT_ID}.dkr.ecr.${REGION}.amazonaws.com/${IMAGE_NAME}"
LOCAL_IMAGE="${IMAGE_NAME}:deploy-${IMAGE_TAG}"
REMOTE_IMAGE="${ECR_URI}:${IMAGE_TAG}"
LATEST_IMAGE="${ECR_URI}:latest"

run_cmd aws --version
run_cmd aws --region "$REGION" --profile "$PROFILE" sts get-caller-identity >/dev/null
run_cmd bash -lc "aws --region '$REGION' --profile '$PROFILE' ecr get-login-password | docker login --username AWS --password-stdin '${ACCOUNT_ID}.dkr.ecr.${REGION}.amazonaws.com'"
run_cmd aws --region "$REGION" --profile "$PROFILE" ecr describe-repositories --repository-names "$IMAGE_NAME" >/dev/null || \
  run_cmd aws --region "$REGION" --profile "$PROFILE" ecr create-repository --repository-name "$IMAGE_NAME"

run_cmd docker build --platform linux/amd64 \
  -t "$LOCAL_IMAGE" \
  --build-arg rails_env=production \
  --build-arg secret_key_base=build-placeholder .

run_cmd docker tag "$LOCAL_IMAGE" "$REMOTE_IMAGE"
run_cmd docker push "$REMOTE_IMAGE"
run_cmd docker tag "$LOCAL_IMAGE" "$LATEST_IMAGE"
run_cmd docker push "$LATEST_IMAGE"

if [[ "$REUSE_MEDIA_BUCKET" == "true" ]]; then
  TARGET_ASSET_BUCKET="$SOURCE_MEDIA_BUCKET"
fi

run_cmd docker run --rm \
  -v "$REPO_ROOT/public:/gala/public" \
  -v "$REPO_ROOT/tmp:/gala/tmp" \
  -e RAILS_ENV=production \
  -e SECRET_KEY_BASE=build-placeholder \
  "$LOCAL_IMAGE" \
  bash -lc 'bundle exec rails assets:precompile'

if [[ "$IMPORT_ASSETS" == "true" ]]; then
  if aws --region "$REGION" --profile "$PROFILE" s3 ls "s3://$SOURCE_MEDIA_BUCKET/" >/dev/null 2>&1; then
    run_cmd aws --region "$REGION" --profile "$PROFILE" s3 sync "s3://$SOURCE_MEDIA_BUCKET/" "s3://$TARGET_ASSET_BUCKET/"
  else
    log "Source bucket $SOURCE_MEDIA_BUCKET not reachable; skipping media import."
  fi
fi

for asset_dir in public/assets public/packs public/webpack public/fonts public/images public/javascripts public/stylesheets; do
  if [[ -d "$asset_dir" ]]; then
    run_cmd aws --region "$REGION" --profile "$PROFILE" s3 sync "$asset_dir" "s3://$TARGET_ASSET_BUCKET/${asset_dir#public/}" \
      --cache-control "public,max-age=31536000,immutable" \
      --acl bucket-owner-full-control
  fi
done

if [[ "${HEROKU_APP_NAME:-}" != "" && "$SKIP_HEROKU_CHECK" != "true" ]] && command -v heroku >/dev/null 2>&1; then
  log "Attempting read-only Heroku fallback secret checks."
  run_cmd bash -lc "heroku config:get SES_SMTP_USERNAME -a \"$HEROKU_APP_NAME\" 2>/dev/null || true"
  run_cmd bash -lc "heroku config:get SES_SMTP_PASSWORD -a \"$HEROKU_APP_NAME\" 2>/dev/null || true"
  run_cmd bash -lc "heroku config:get RAILS_MASTER_KEY -a \"$HEROKU_APP_NAME\" 2>/dev/null || true"
  run_cmd bash -lc "heroku config:get SECRET_KEY_BASE -a \"$HEROKU_APP_NAME\" 2>/dev/null || true"
else
  log "Skipping Heroku secret fallback checks."
fi

cat <<EOF
Deploy context summary:
  image: $REMOTE_IMAGE
  asset_bucket: $TARGET_ASSET_BUCKET
  region: $REGION
  profile: $PROFILE
  data_dump: ${DATA_DUMP_FILE:-<none>}
EOF
