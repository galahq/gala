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
  --create-asset-bucket         Create the static asset bucket if missing.
  --source-bucket NAME          Source media bucket for optional import.
  --target-media-bucket NAME    Target media bucket for ActiveStorage uploads (reuse source by default).
  --create-media-bucket          Create target media bucket if missing.
  --reuse-source-bucket          Use source media bucket as target.
  --skip-heroku-secret-check     Skip read-only Heroku secret/config checks.
  --skip-secret-sync             Skip syncing secrets from Heroku into Secrets Manager.
  --skip-asset-import           Skip source media import into target media bucket.
  --data-dump PATH              Override data dump path.
  --seed-database               Seed RDS from resolved db dump (default: enabled, requires DATABASE_URL).
  --skip-db-seed                 Disable DB seed step.
  --database-url URL             Override DATABASE_URL used for seeding.
  --heroku-app-name NAME         Override Heroku fallback app name (default msc-gala).
  --help                        Show this help text.
USAGE
}

DRY_RUN="false"
IMAGE_TAG="$(git rev-parse --short HEAD 2>/dev/null || date +%Y%m%d%H%M%S)"
IMAGE_NAME="gala"
REGION="${AWS_REGION:-us-west-2}"
PROFILE="${AWS_PROFILE:-${AWS_PROFILW:-gala}}"
TARGET_ASSET_BUCKET="${GALA_STATIC_ASSETS_BUCKET:-gala-static-assets}"
SOURCE_MEDIA_BUCKET="${SOURCE_MEDIA_BUCKET:-msc-gala}"
TARGET_MEDIA_BUCKET="${TARGET_MEDIA_BUCKET:-$SOURCE_MEDIA_BUCKET}"
CREATE_ASSET_BUCKET="false"
CREATE_MEDIA_BUCKET="false"
REUSE_MEDIA_BUCKET="false"
SKIP_HEROKU_CHECK="false"
SKIP_SECRET_SYNC="false"
IMPORT_ASSETS="true"
SEED_DATABASE="true"
DATA_DUMP_PATH="${DATA_DUMP_PATH:-db/sqldump/seed.dump}"
DATABASE_URL="${DATABASE_URL:-}"
SECRET_PREFIX="${AWS_SECRET_PREFIX:-gala/production}"
HEROKU_APP_NAME="${HEROKU_APP_NAME:-msc-gala}"
REQUIRED_HEROKU_SECRETS=(
  "RAILS_MASTER_KEY"
  "SECRET_KEY_BASE"
  "SES_SMTP_USERNAME"
  "SES_SMTP_PASSWORD"
  "MAPBOX_ACCESS_TOKEN"
  "LTI_KEY"
  "LTI_SECRET"
)
HEROKU_SECRET_PLACEHOLDER="${HEROKU_SECRET_PLACEHOLDER:-PLEASE_REPLACE_FROM_HEROKU_AT_RUNTIME}"

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
    --create-asset-bucket)
      CREATE_ASSET_BUCKET="true"
      shift
      ;;
    --source-bucket)
      SOURCE_MEDIA_BUCKET="$2"
      shift 2
      ;;
    --target-media-bucket)
      TARGET_MEDIA_BUCKET="$2"
      shift 2
      ;;
    --create-media-bucket)
      CREATE_MEDIA_BUCKET="true"
      shift
      ;;
    --reuse-source-bucket)
      REUSE_MEDIA_BUCKET="true"
      TARGET_MEDIA_BUCKET="$SOURCE_MEDIA_BUCKET"
      shift
      ;;
    --skip-heroku-secret-check)
      SKIP_HEROKU_CHECK="true"
      shift
      ;;
    --skip-secret-sync)
      SKIP_SECRET_SYNC="true"
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
    --skip-db-seed)
      SEED_DATABASE="false"
      shift
      ;;
    --seed-database)
      SEED_DATABASE="true"
      shift
      ;;
    --database-url)
      DATABASE_URL="$2"
      shift 2
      ;;
    --heroku-app-name)
      HEROKU_APP_NAME="$2"
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

run_cmd_masked() {
  local label="$1"
  shift

  if [[ "$DRY_RUN" == "true" ]]; then
    log "DRY-RUN: ${label}"
    return 0
  fi

  log "RUN: ${label}"
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

ensure_bucket() {
  local bucket="$1"
  local allow_create="$2"

  if aws --region "$REGION" --profile "$PROFILE" s3api head-bucket --bucket "$bucket" >/dev/null 2>&1; then
    return 0
  fi

  if [[ "$allow_create" != "true" ]]; then
    log "Bucket not found: $bucket. Set --create-asset-bucket or --create-media-bucket as needed."
    return 1
  fi

  run_cmd aws --region "$REGION" --profile "$PROFILE" s3api create-bucket --bucket "$bucket" --create-bucket-configuration "LocationConstraint=$REGION"
}

sync_secret_to_manager() {
  local key="$1"
  local value="$2"
  local secret_id="${SECRET_PREFIX}/${key}"

  if aws --region "$REGION" --profile "$PROFILE" secretsmanager describe-secret --secret-id "$secret_id" >/dev/null 2>&1; then
    run_cmd_masked "Update $secret_id secret in Secrets Manager" \
      aws --region "$REGION" --profile "$PROFILE" secretsmanager put-secret-value --secret-id "$secret_id" --secret-string "$value"
  else
    run_cmd_masked "Create $secret_id secret in Secrets Manager" \
      aws --region "$REGION" --profile "$PROFILE" secretsmanager create-secret --name "$secret_id" --secret-string "$value"
  fi
}

seed_database() {
  local dump_file="$1"

  if [[ "$SEED_DATABASE" != "true" ]]; then
    log "DB seed skipped (disabled with --skip-db-seed)."
    return 0
  fi

  if [[ -z "$DATABASE_URL" ]]; then
    log "Skipping DB seed: DATABASE_URL not provided."
    return 0
  fi

  if [[ "$dump_file" == *.dump ]]; then
    if ! command -v pg_restore >/dev/null 2>&1; then
      log "pg_restore not found; skipping binary dump restore."
      return 0
    fi

    run_cmd_masked "Restoring binary dump to DATABASE_URL target" \
      env DATABASE_URL="${DATABASE_URL}" pg_restore --clean --if-exists --no-owner --no-privileges -d "$DATABASE_URL" "$dump_file"
    return 0
  fi

  if ! command -v psql >/dev/null 2>&1; then
    log "psql not found; skipping SQL dump restore."
    return 0
  fi

  run_cmd_masked "Restoring SQL dump to DATABASE_URL target" \
    env DATABASE_URL="${DATABASE_URL}" psql -v ON_ERROR_STOP=1 "$DATABASE_URL" < "$dump_file"
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
    log "Reading required Heroku config keys via config:get only."
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
  TARGET_MEDIA_BUCKET="$SOURCE_MEDIA_BUCKET"
fi

if [[ "$TARGET_MEDIA_BUCKET" != "$SOURCE_MEDIA_BUCKET" ]]; then
  if ensure_bucket "$TARGET_MEDIA_BUCKET" "$CREATE_MEDIA_BUCKET"; then
    if aws --region "$REGION" --profile "$PROFILE" s3 ls "s3://$SOURCE_MEDIA_BUCKET/" >/dev/null 2>&1; then
      run_cmd aws --region "$REGION" --profile "$PROFILE" s3 sync "s3://$SOURCE_MEDIA_BUCKET/" "s3://$TARGET_MEDIA_BUCKET/"
      log "Synced ActiveStorage objects from $SOURCE_MEDIA_BUCKET to $TARGET_MEDIA_BUCKET."
    else
      log "Source media bucket $SOURCE_MEDIA_BUCKET not reachable; skipping ActiveStorage import."
    fi
  else
    log "Could not ensure target media bucket $TARGET_MEDIA_BUCKET."
  fi
fi

run_cmd docker run --rm \
  -v "$REPO_ROOT/public:/gala/public" \
  -v "$REPO_ROOT/tmp:/gala/tmp" \
  -e RAILS_ENV=production \
  -e SECRET_KEY_BASE=build-placeholder \
  "$LOCAL_IMAGE" \
  bash -lc 'bundle exec rails assets:precompile'

if [[ "$IMPORT_ASSETS" == "true" ]]; then
  if ensure_bucket "$TARGET_ASSET_BUCKET" "$CREATE_ASSET_BUCKET"; then
    for asset_dir in public/assets public/packs public/webpack public/fonts public/images public/javascripts public/stylesheets; do
      if [[ -d "$asset_dir" ]]; then
        run_cmd aws --region "$REGION" --profile "$PROFILE" s3 sync "$asset_dir" "s3://$TARGET_ASSET_BUCKET/${asset_dir#public/}" \
          --cache-control "public,max-age=31536000,immutable" \
          --acl bucket-owner-full-control
      fi
    done
  else
    log "Skipping static upload sync because static asset bucket is unavailable and auto-create is disabled."
  fi
else
  log "Skipping static asset sync by flag."
fi

if [[ "${HEROKU_APP_NAME:-}" != "" && "$SKIP_HEROKU_CHECK" != "true" ]] && [[ "$SKIP_SECRET_SYNC" != "true" ]] && command -v heroku >/dev/null 2>&1; then
  for secret_key in "${REQUIRED_HEROKU_SECRETS[@]}"; do
    if value="$(heroku config:get "$secret_key" -a "$HEROKU_APP_NAME" 2>/dev/null || true)" && [[ -n "${value//[[:space:]]/}" ]]; then
      sync_secret_to_manager "$secret_key" "$value"
    else
      log "No value returned for $secret_key from Heroku config; storing placeholder."
      sync_secret_to_manager "$secret_key" "$HEROKU_SECRET_PLACEHOLDER"
    fi
  done
else
  log "Skipping Heroku secret sync."
fi

if [[ -f "$DATA_DUMP_FILE" && "$SEED_DATABASE" == "true" ]]; then
  seed_database "$DATA_DUMP_FILE"
fi

cat <<EOF
Deploy context summary:
  image: $REMOTE_IMAGE
  asset_bucket: $TARGET_ASSET_BUCKET
  media_bucket: $TARGET_MEDIA_BUCKET
  region: $REGION
  profile: $PROFILE
  data_dump: ${DATA_DUMP_FILE:-<none>}
  seed_database: $SEED_DATABASE
EOF
