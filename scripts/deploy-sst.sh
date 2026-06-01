#!/usr/bin/env bash

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
cd "$REPO_ROOT"

usage() {
  cat <<'USAGE'
Usage: scripts/deploy-sst.sh --branch BRANCH --stage STAGE [options]

Options:
  --branch BRANCH          Branch to deploy.
  --stage STAGE            SST stage to deploy (dev|production).
  --dry-run                Validate and run sst diff only.
  --invalidate-cache       Create CloudFront invalidations after deploy.
  --user-data VALUE        Comma-separated hard-coded ops hooks.
  --release-id ID          Immutable release ID (default: run.date.sha).
  --asset-prefix PREFIX    S3 asset prefix (default: releases/STAGE/RELEASE_ID).
  --image-tag TAG          Optional image tag (default: release ID).
  --production-base-image IMAGE
                          Required base image for Dockerfile.production.
  --dockerfile PATH        Production Dockerfile path (default: Dockerfile.production).
  --region REGION          AWS region (default: us-west-2).
  --profile PROFILE        AWS profile name (default: gala).
  --alb-base-url URL       Backward-compatible BASE_URL override.
  --seed-dump-s3-uri URI   Private S3 URI used to hydrate db/sqldump/seed.dump.
  --action ACTION          Backward-compatible deploy/remove switch. CI deploys only.
  --help                   Show this help text.

Environment:
  GALA_ECS_ONLY_DEPLOY=true updates existing ECS services with a new image and
  skips SST infrastructure mutation. Intended for production promotion when SST
  diff reports unrelated infrastructure replacement/deletion.

Supported user_data hooks:
  certificates, cloudflare_dns_cutover, database_migrate, seed_database,
  db_snapshot, db_backup, restart_ecs, refresh_indices, rake:<task-name>
USAGE
}

BRANCH="${GITHUB_REF_NAME:-main}"
STAGE="dev"
ACTION="deploy"
DRY_RUN="${DRY_RUN:-false}"
INVALIDATE_CACHE="${INVALIDATE_CACHE:-false}"
USER_DATA="${USER_DATA:-}"
RELEASE_ID="${GALA_RELEASE_ID:-}"
ASSET_PREFIX="${GALA_ASSET_PREFIX:-}"
IMAGE_TAG="${SST_IMAGE_TAG:-}"
IMAGE_NAME="${SST_IMAGE_NAME:-gala}"
PRODUCTION_BASE_IMAGE="${GALA_PRODUCTION_BASE_IMAGE:-}"
PRODUCTION_DOCKERFILE="${GALA_PRODUCTION_DOCKERFILE:-Dockerfile.production}"
MAX_IMAGE_SIZE_BYTES="${GALA_MAX_IMAGE_SIZE_BYTES:-1500000000}"
REGION="${AWS_REGION:-us-west-2}"
PROFILE="${AWS_PROFILE:-gala}"
ALB_BASE_URL="${ALB_BASE_URL:-}"
RETAINED_SECRET_KEYS="${RETAINED_SECRET_KEYS:-}"
SEED_DUMP_S3_URI="${SEED_DUMP_S3_URI:-}"
STATIC_ASSETS_BUCKET="${GALA_STATIC_ASSETS_BUCKET:-gala-static-assets-353760060567}"
RETAIN_RELEASES="${GALA_RELEASE_RETAIN_COUNT:-10}"

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
    --dry-run)
      DRY_RUN="true"
      shift
      ;;
    --invalidate-cache)
      INVALIDATE_CACHE="true"
      shift
      ;;
    --user-data)
      USER_DATA="$2"
      shift 2
      ;;
    --release-id)
      RELEASE_ID="$2"
      shift 2
      ;;
    --asset-prefix)
      ASSET_PREFIX="$2"
      shift 2
      ;;
    --image-tag)
      IMAGE_TAG="$2"
      shift 2
      ;;
    --production-base-image)
      PRODUCTION_BASE_IMAGE="$2"
      shift 2
      ;;
    --dockerfile)
      PRODUCTION_DOCKERFILE="$2"
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
      echo "Unknown argument: $1" >&2
      usage
      exit 1
      ;;
  esac
done

log() {
  echo "[$(date -u +'%Y-%m-%dT%H:%M:%SZ')] $*"
}

require_command() {
  if ! command -v "$1" >/dev/null 2>&1; then
    echo "Missing required command: $1" >&2
    exit 1
  fi
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
    log "RUN: AWS_REGION=$REGION SST_STAGE=$STAGE aws --region $REGION $*"
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
  local env_vars=(
    "AWS_REGION=$REGION"
    "AWS_DEFAULT_REGION=$REGION"
    "SST_STAGE=$STAGE"
    "ALB_BASE_URL=$ALB_BASE_URL"
    "GALA_RELEASE_ID=$RELEASE_ID"
    "GALA_ASSET_PREFIX=$ASSET_PREFIX"
    "GALA_STATIC_ASSETS_BUCKET=$STATIC_ASSETS_BUCKET"
    "GALA_PRODUCTION_BASE_IMAGE=$PRODUCTION_BASE_IMAGE"
    "GALA_PRODUCTION_DOCKERFILE=$PRODUCTION_DOCKERFILE"
    "GALA_RELEASE_URL=${GALA_RELEASE_URL:-}"
    "GALA_BASE_URL=${GALA_BASE_URL:-}"
    "GALA_PREVIEW_HOST=${GALA_PREVIEW_HOST:-}"
    "GALA_DOMAIN_NAME=${GALA_DOMAIN_NAME:-learngala.dev}"
    "GALA_ROUTER_DISTRIBUTION_ID=${GALA_ROUTER_DISTRIBUTION_ID:-}"
    "GALA_ENABLE_CUSTOM_DOMAIN=${GALA_ENABLE_CUSTOM_DOMAIN:-true}"
    "GALA_CLOUDFLARE_PROXY=${GALA_CLOUDFLARE_PROXY:-false}"
    "GALA_IMMUTABLE_CLOUDFRONT=${GALA_IMMUTABLE_CLOUDFRONT:-false}"
    "GITHUB_SHA=${GITHUB_SHA:-}"
    "GITHUB_RUN_ID=${GITHUB_RUN_ID:-}"
    "RELEASE=${RELEASE:-$RELEASE_ID}"
  )

  if aws_uses_profile; then
    env_vars+=("AWS_PROFILE=$PROFILE")
  fi

  log "RUN: AWS_REGION=$REGION SST_STAGE=$STAGE GALA_RELEASE_ID=$RELEASE_ID GALA_ASSET_PREFIX=$ASSET_PREFIX $*"
  env "${env_vars[@]}" "$@"
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

validate_user_data() {
  local raw="${USER_DATA//[[:space:]]/}"

  if [[ -z "$raw" ]]; then
    return
  fi

  if [[ "$raw" =~ (DATABASE_URL|REDIS_URL|AWS_SECRET|SECRET_KEY|PASSWORD=|TOKEN=|PRIVATE_KEY) ]]; then
    echo "Refusing deploy: user_data must not contain secret-looking values." >&2
    exit 1
  fi

  IFS=',' read -r -a hooks <<< "$raw"
  for hook in "${hooks[@]}"; do
    case "$hook" in
      certificates|cloudflare_dns_cutover|database_migrate|seed_database|db_snapshot|db_backup|restart_ecs|refresh_indices)
        ;;
      rake:*)
        if [[ ! "${hook#rake:}" =~ ^[A-Za-z0-9_:.-]+$ ]]; then
          echo "Refusing deploy: invalid rake task in user_data." >&2
          exit 1
        fi
        ;;
      *)
        echo "Refusing deploy: unsupported user_data hook '$hook'." >&2
        exit 1
        ;;
    esac
  done
}

validate_production_image_inputs() {
  if [[ "$ACTION" == "remove" ]]; then
    return
  fi

  if [[ -z "$PRODUCTION_BASE_IMAGE" ]]; then
    echo "Refusing deploy: GALA_PRODUCTION_BASE_IMAGE or --production-base-image is required for Dockerfile.production." >&2
    exit 1
  fi

  if [[ ! -f "$PRODUCTION_DOCKERFILE" ]]; then
    echo "Refusing deploy: production Dockerfile not found: $PRODUCTION_DOCKERFILE" >&2
    exit 1
  fi

  if [[ ! "$MAX_IMAGE_SIZE_BYTES" =~ ^[0-9]+$ || "$MAX_IMAGE_SIZE_BYTES" -lt 1 ]]; then
    echo "Refusing deploy: GALA_MAX_IMAGE_SIZE_BYTES must be a positive integer." >&2
    exit 1
  fi
}

short_sha() {
  git rev-parse --short=8 HEAD
}

build_date() {
  date -u +'%Y%m%d%H%M%S'
}

normalize_release_inputs() {
  local sha
  sha="$(short_sha)"

  if [[ -z "$RELEASE_ID" ]]; then
    RELEASE_ID="${GITHUB_RUN_ID:-local}.$(build_date).${sha}"
  fi

  if [[ ! "$RELEASE_ID" =~ ^[A-Za-z0-9][A-Za-z0-9._-]{0,95}$ ]]; then
    echo "Invalid release ID: $RELEASE_ID" >&2
    exit 1
  fi

  if [[ -z "$IMAGE_TAG" ]]; then
    IMAGE_TAG="$RELEASE_ID"
  fi

  if [[ -z "$ASSET_PREFIX" ]]; then
    ASSET_PREFIX="releases/${STAGE}/${RELEASE_ID}"
  fi

  if [[ "$ASSET_PREFIX" == /* || "$ASSET_PREFIX" == *".."* || "$ASSET_PREFIX" == *"//"* ]]; then
    echo "Invalid asset prefix: $ASSET_PREFIX" >&2
    exit 1
  fi
}

outputs_file() {
  echo "$REPO_ROOT/infra/.sst/outputs.json"
}

read_output() {
  local key="$1"
  jq -r --arg key "$key" '.[$key] // empty' "$(outputs_file)"
}

read_output_array_csv() {
  local key="$1"
  jq -r --arg key "$key" '.[$key] // [] | join(",")' "$(outputs_file)"
}

run_ecs_task_from_outputs() {
  local prefix="$1"
  local command_json="${2:-}"
  local cluster task_definition subnets security_groups assign_public_ip container_name
  local args

  cluster="$(read_output "${prefix}ClusterArn")"
  task_definition="$(read_output "${prefix}TaskDefinitionArn")"
  subnets="$(read_output_array_csv "${prefix}Subnets")"
  security_groups="$(read_output_array_csv "${prefix}SecurityGroups")"
  assign_public_ip="$(read_output "${prefix}AssignPublicIp")"

  if [[ -z "$cluster" || -z "$task_definition" || -z "$subnets" || -z "$security_groups" ]]; then
    echo "Missing SST task outputs for prefix '$prefix'." >&2
    exit 1
  fi

  if [[ "$assign_public_ip" == "true" ]]; then
    assign_public_ip="ENABLED"
  else
    assign_public_ip="DISABLED"
  fi

  args=(
    ecs run-task
    --cluster "$cluster"
    --task-definition "$task_definition"
    --launch-type FARGATE
    --network-configuration "awsvpcConfiguration={subnets=[$subnets],securityGroups=[$security_groups],assignPublicIp=$assign_public_ip}"
  )

  if [[ -n "$command_json" ]]; then
    container_name="$(aws_cmd ecs describe-task-definition \
      --task-definition "$task_definition" \
      --query 'taskDefinition.containerDefinitions[0].name' \
      --output text)"
    args+=(--overrides "{\"containerOverrides\":[{\"name\":\"$container_name\",\"command\":$command_json}]}")
  fi

  run_aws_cmd "${args[@]}" >/dev/null
}

run_database_snapshot() {
  local snapshot_id
  local db_id

  db_id="${1:-$(read_output databaseInstanceId)}"
  if [[ -z "$db_id" || "$db_id" == "null" ]]; then
    echo "Missing database instance id output for stage '$STAGE'." >&2
    exit 1
  fi

  snapshot_id="${db_id}-${RELEASE_ID//[^A-Za-z0-9-]/-}"
  run_aws_cmd rds create-db-snapshot \
    --db-instance-identifier "$db_id" \
    --db-snapshot-identifier "${snapshot_id:0:255}" >/dev/null
}

needs_seed_dump() {
  local raw

  raw=",${USER_DATA//[[:space:]]/},"
  [[ "$raw" == *,seed_database,* ]]
}

run_user_data_hooks() {
  local raw hook task command_json cluster service

  raw="${USER_DATA//[[:space:]]/}"
  if [[ -z "$raw" ]]; then
    return
  fi

  IFS=',' read -r -a hooks <<< "$raw"
  for hook in "${hooks[@]}"; do
    case "$hook" in
      certificates)
        log "user_data certificates: SST Cloudflare DNS adapter manages ACM validation records."
        ;;
      cloudflare_dns_cutover)
        log "user_data cloudflare_dns_cutover: SST Cloudflare DNS adapter owns active alias records."
        ;;
      database_migrate)
        run_ecs_task_from_outputs "migration"
        ;;
      seed_database)
        run_ecs_task_from_outputs "seed"
        ;;
      db_snapshot)
        run_database_snapshot
        ;;
      db_backup)
        run_database_snapshot
        ;;
      restart_ecs)
        cluster="$(read_output migrationClusterArn)"
        for service in "$(read_output webServiceName)" "$(read_output workerServiceName)"; do
          if [[ -n "$service" ]]; then
            run_aws_cmd ecs update-service \
              --cluster "$cluster" \
              --service "$service" \
              --force-new-deployment >/dev/null
          fi
        done
        ;;
      refresh_indices)
        command_json="$(jq -cn '["bundle","exec","rake","indices:refresh"]')"
        run_ecs_task_from_outputs "migration" "$command_json"
        ;;
      rake:*)
        task="${hook#rake:}"
        command_json="$(jq -cn --arg task "$task" '["bundle","exec","rake",$task]')"
        run_ecs_task_from_outputs "migration" "$command_json"
        ;;
    esac
  done
}

write_release_manifest() {
  local path="$1"
  local sha

  sha="$(git rev-parse HEAD)"
  {
    printf '{\n'
    printf '  "release_id": "%s",\n' "$RELEASE_ID"
    printf '  "stage": "%s",\n' "$STAGE"
    printf '  "branch": "%s",\n' "$BRANCH"
    printf '  "commit_sha": "%s",\n' "$sha"
    printf '  "image_tag": "%s",\n' "$IMAGE_TAG"
    printf '  "asset_prefix": "%s",\n' "$ASSET_PREFIX"
    printf '  "build_date": "%s",\n' "$(build_date)"
    printf '  "github_run_id": "%s"\n' "${GITHUB_RUN_ID:-}"
    printf '}\n'
  } > "$path"
}

sync_static_assets() {
  local container_id assets_dir manifest_file

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
  run_aws_cmd s3 sync "$assets_dir/public/assets/" "s3://${STATIC_ASSETS_BUCKET}/${ASSET_PREFIX}/assets/" \
    --cache-control "public,max-age=31536000,immutable"
  run_aws_cmd s3 sync "$assets_dir/public/packs/" "s3://${STATIC_ASSETS_BUCKET}/${ASSET_PREFIX}/packs/" \
    --cache-control "public,max-age=31536000,immutable"

  manifest_file="$assets_dir/manifest.json"
  write_release_manifest "$manifest_file"
  run_aws_cmd s3 cp "$manifest_file" "s3://${STATIC_ASSETS_BUCKET}/${ASSET_PREFIX}/manifest.json" \
    --cache-control "no-store"
  run_aws_cmd s3 cp "$manifest_file" "s3://${STATIC_ASSETS_BUCKET}/manifests/${STAGE}/latest.json" \
    --cache-control "no-store"
}

prune_old_asset_releases() {
  local release_prefixes prefix index

  if [[ ! "$RETAIN_RELEASES" =~ ^[0-9]+$ || "$RETAIN_RELEASES" -lt 1 ]]; then
    return
  fi

  mapfile -t release_prefixes < <(
    aws_cmd s3api list-objects-v2 \
      --bucket "$STATIC_ASSETS_BUCKET" \
      --prefix "releases/${STAGE}/" \
      --delimiter "/" \
      --query 'CommonPrefixes[].Prefix' \
      --output text | tr '\t' '\n' | sed '/^$/d' | sort -r
  )

  index=0
  for prefix in "${release_prefixes[@]}"; do
    index=$((index + 1))
    if [[ "$index" -gt "$RETAIN_RELEASES" ]]; then
      run_aws_cmd s3 rm "s3://${STATIC_ASSETS_BUCKET}/${prefix}" --recursive
    fi
  done
}

invalidate_caches() {
  local distribution_id

  if [[ "$INVALIDATE_CACHE" != "true" ]]; then
    return
  fi

  for distribution_id in "$(read_output appRouterDistributionId)" "$(read_output appCdnDistributionId)" "$(read_output staticAssetsDistributionId)"; do
    if [[ -n "$distribution_id" && "$distribution_id" != "null" ]]; then
      run_aws_cmd cloudfront create-invalidation \
        --distribution-id "$distribution_id" \
        --paths '/*' >/dev/null
    fi
  done
}

detach_active_cloudfront_aliases() {
  local root dev wildcard ids id tmpdir etag config_path

  if [[ "$STAGE" != "production" || "${GALA_ENABLE_CUSTOM_DOMAIN:-true}" == "false" || "${GALA_DETACH_CLOUDFRONT_ALIASES:-false}" != "true" ]]; then
    return
  fi

  root="${GALA_DOMAIN_NAME:-learngala.dev}"
  dev="dev.${root}"
  wildcard="*.${dev}"
  mapfile -t ids < <(
    aws_cmd cloudfront list-distributions --output json |
      jq -r --arg root "$root" --arg dev "$dev" --arg wildcard "$wildcard" '
        (.DistributionList.Items // [])
        | .[]
        | select(
            ((.Aliases.Items // []) | index($root)) or
            ((.Aliases.Items // []) | index($dev)) or
            ((.Aliases.Items // []) | index($wildcard))
          )
        | .Id
      '
  )

  for id in "${ids[@]}"; do
    tmpdir="$(mktemp -d)"
    config_path="${tmpdir}/distribution-config.json"
    aws_cmd cloudfront get-distribution-config --id "$id" > "${tmpdir}/current.json"
    etag="$(jq -r '.ETag' "${tmpdir}/current.json")"
    jq --arg root "$root" --arg dev "$dev" --arg wildcard "$wildcard" '
      .DistributionConfig
      | .Aliases = ((.Aliases.Items // []) | map(select(. != $root and . != $dev and . != $wildcard)) | if length > 0 then {Quantity: length, Items: .} else {Quantity: 0} end)
      | if .Aliases.Quantity == 0 then
          .ViewerCertificate = {
            CloudFrontDefaultCertificate: true,
            MinimumProtocolVersion: "TLSv1",
            CertificateSource: "cloudfront"
          }
        else
          .
        end
    ' "${tmpdir}/current.json" > "$config_path"
    run_aws_cmd cloudfront update-distribution \
      --id "$id" \
      --if-match "$etag" \
      --distribution-config "file://${config_path}" >/dev/null
    run_aws_cmd cloudfront wait distribution-deployed --id "$id"
    rm -rf "$tmpdir"
  done
}

discover_shared_router_distribution() {
  local router_id

  if [[ "$STAGE" != "dev" || "${GALA_ENABLE_CUSTOM_DOMAIN:-true}" == "false" || -n "${GALA_ROUTER_DISTRIBUTION_ID:-}" ]]; then
    return
  fi

  router_id="$(
    aws_cmd cloudfront list-distributions --output json |
      jq -r '
        (.DistributionList.Items // [])
        | map(select(.Comment == "GalaAppRouter app"))
        | sort_by(.LastModifiedTime)
        | reverse
        | .[0].Id // empty
      '
  )"

  if [[ -z "$router_id" ]]; then
    echo "Missing shared GalaAppRouter distribution. Deploy production first or set GALA_ROUTER_DISTRIBUTION_ID." >&2
    exit 1
  fi

  export GALA_ROUTER_DISTRIBUTION_ID="$router_id"
  log "Using shared Router distribution for dev: ${GALA_ROUTER_DISTRIBUTION_ID}"
}

discover_cluster_arn() {
  local cluster

  cluster="$(aws_cmd ecs list-clusters \
    --query "clusterArns[?contains(@, 'gala-${STAGE}-GalaCluster')]|[0]" \
    --output text)"
  if [[ "$cluster" == "None" ]]; then
    cluster=""
  fi
  echo "$cluster"
}

discover_ecs_service_name() {
  local cluster="$1"
  local marker="$2"
  local service_arn

  service_arn="$(aws_cmd ecs list-services \
    --cluster "$cluster" \
    --query "serviceArns[?contains(@, '${marker}')]|[0]" \
    --output text)"
  if [[ "$service_arn" == "None" ]]; then
    service_arn=""
  fi
  echo "${service_arn##*/}"
}

discover_static_assets_cdn_url() {
  local domain

  domain="$(aws_cmd cloudfront list-distributions \
    --query "DistributionList.Items[?Comment=='gala-${STAGE} static assets'].DomainName | [0]" \
    --output text)"
  if [[ -z "$domain" || "$domain" == "None" ]]; then
    echo "Missing static assets CloudFront distribution for stage '$STAGE'." >&2
    exit 1
  fi
  echo "https://${domain}/${ASSET_PREFIX}"
}

ecs_rollout_task_definition_payload() {
  local task_definition="$1"
  local asset_host="$2"
  local commit_sha

  commit_sha="$(git rev-parse HEAD)"
  aws_cmd ecs describe-task-definition --task-definition "$task_definition" |
    jq \
      --arg image "$REMOTE_IMAGE" \
      --arg release_id "$RELEASE_ID" \
      --arg asset_prefix "$ASSET_PREFIX" \
      --arg asset_host "$asset_host" \
      --arg release_url "${GALA_RELEASE_URL:-}" \
      --arg commit_sha "$commit_sha" '
      def upsert_env($name; $value):
        map(select(.name != $name)) + [{"name": $name, "value": $value}];

      .taskDefinition
      | .containerDefinitions = (
          .containerDefinitions
          | map(
              .image = $image
              | .environment = (
                  (.environment // [])
                  | upsert_env("GALA_RELEASE_ID"; $release_id)
                  | upsert_env("GALA_ASSET_PREFIX"; $asset_prefix)
                  | upsert_env("ASSET_HOST"; $asset_host)
                  | upsert_env("RELEASE"; $release_id)
                  | upsert_env("RELEASE_URL"; $release_url)
                  | upsert_env("COMMIT_SHA"; $commit_sha)
                )
            )
        )
      | {
          family,
          taskRoleArn,
          executionRoleArn,
          networkMode,
          containerDefinitions,
          volumes,
          placementConstraints,
          requiresCompatibilities,
          cpu,
          memory,
          pidMode,
          ipcMode,
          proxyConfiguration,
          inferenceAccelerators,
          ephemeralStorage,
          runtimePlatform
        }
      | with_entries(select(.value != null))
    '
}

ecs_rollout_service() {
  local cluster="$1"
  local service="$2"
  local asset_host="$3"
  local current_task_definition payload_path new_task_definition

  current_task_definition="$(aws_cmd ecs describe-services \
    --cluster "$cluster" \
    --services "$service" \
    --query 'services[0].taskDefinition' \
    --output text)"
  if [[ -z "$current_task_definition" || "$current_task_definition" == "None" ]]; then
    echo "Missing current task definition for ECS service '$service'." >&2
    exit 1
  fi

  payload_path="$(mktemp)"
  ecs_rollout_task_definition_payload "$current_task_definition" "$asset_host" > "$payload_path"
  new_task_definition="$(aws_cmd ecs register-task-definition \
    --cli-input-json "file://${payload_path}" \
    --query 'taskDefinition.taskDefinitionArn' \
    --output text)"
  rm -f "$payload_path"

  log "Registered ${service} task definition: ${new_task_definition}"
  run_aws_cmd ecs update-service \
    --cluster "$cluster" \
    --service "$service" \
    --task-definition "$new_task_definition" >/dev/null
}

ecs_only_targets() {
  local cluster web_service worker_service

  cluster="$(discover_cluster_arn)"
  if [[ -z "$cluster" ]]; then
    echo "Missing ECS cluster for stage '$STAGE'." >&2
    exit 1
  fi
  web_service="$(discover_ecs_service_name "$cluster" GalaWeb)"
  worker_service="$(discover_ecs_service_name "$cluster" GalaWorker)"
  if [[ -z "$web_service" || -z "$worker_service" ]]; then
    echo "Missing ECS web/worker services for stage '$STAGE'." >&2
    exit 1
  fi

  printf '%s\n%s\n%s\n' "$cluster" "$web_service" "$worker_service"
}

dry_run_ecs_only_rollout() {
  local targets cluster web_service worker_service asset_host

  mapfile -t targets < <(ecs_only_targets)
  cluster="${targets[0]}"
  web_service="${targets[1]}"
  worker_service="${targets[2]}"
  asset_host="$(discover_static_assets_cdn_url)"

  log "ECS-only dry run:"
  log "  cluster: ${cluster}"
  log "  web_service: ${web_service}"
  log "  worker_service: ${worker_service}"
  log "  image: ${REMOTE_IMAGE}"
  log "  asset_host: ${asset_host}"
  log "  release_id: ${RELEASE_ID}"
  aws_cmd ecs describe-services \
    --cluster "$cluster" \
    --services "$web_service" "$worker_service" \
    --query 'services[].{serviceName:serviceName,desired:desiredCount,running:runningCount,taskDefinition:taskDefinition,rollout:deployments[0].rolloutState}' \
    --output table
}

run_ecs_only_rollout() {
  local targets cluster web_service worker_service asset_host

  mapfile -t targets < <(ecs_only_targets)
  cluster="${targets[0]}"
  web_service="${targets[1]}"
  worker_service="${targets[2]}"
  asset_host="$(discover_static_assets_cdn_url)"

  log "Running ECS-only rollout:"
  log "  cluster: ${cluster}"
  log "  web_service: ${web_service}"
  log "  worker_service: ${worker_service}"
  log "  image: ${REMOTE_IMAGE}"
  log "  asset_host: ${asset_host}"

  ecs_rollout_service "$cluster" "$web_service" "$asset_host"
  ecs_rollout_service "$cluster" "$worker_service" "$asset_host"
  run_aws_cmd ecs wait services-stable \
    --cluster "$cluster" \
    --services "$web_service" "$worker_service"
}

delete_cloudfront_distribution() {
  local id="$1"
  local tmpdir etag config_path enabled

  tmpdir="$(mktemp -d)"
  config_path="${tmpdir}/distribution-config.json"
  aws_cmd cloudfront get-distribution-config --id "$id" > "${tmpdir}/current.json"
  enabled="$(jq -r '.DistributionConfig.Enabled' "${tmpdir}/current.json")"

  if [[ "$enabled" == "true" ]]; then
    etag="$(jq -r '.ETag' "${tmpdir}/current.json")"
    jq '.DistributionConfig | .Enabled = false' "${tmpdir}/current.json" > "$config_path"
    run_aws_cmd cloudfront update-distribution \
      --id "$id" \
      --if-match "$etag" \
      --distribution-config "file://${config_path}" >/dev/null
    run_aws_cmd cloudfront wait distribution-deployed --id "$id"
    aws_cmd cloudfront get-distribution-config --id "$id" > "${tmpdir}/current-disabled.json"
    mv "${tmpdir}/current-disabled.json" "${tmpdir}/current.json"
  fi

  etag="$(jq -r '.ETag' "${tmpdir}/current.json")"
  run_aws_cmd cloudfront delete-distribution --id "$id" --if-match "$etag" >/dev/null
  rm -rf "$tmpdir"
}

prune_dormant_cloudfront_distributions() {
  local comment ids id index retained

  if [[ "${GALA_IMMUTABLE_CLOUDFRONT:-true}" == "true" ]]; then
    retained="$RETAIN_RELEASES"
  else
    retained=1
  fi

  if [[ ! "$retained" =~ ^[0-9]+$ || "$retained" -lt 1 ]]; then
    return
  fi

  comment="gala-${STAGE} app edge cache"
  mapfile -t ids < <(
    aws_cmd cloudfront list-distributions --output json |
      jq -r --arg comment "$comment" '
        (.DistributionList.Items // [])
        | map(select(.Comment == $comment and ((.Aliases.Quantity // 0) == 0)))
        | sort_by(.LastModifiedTime)
        | reverse
        | .[].Id
      '
  )

  index=0
  for id in "${ids[@]}"; do
    index=$((index + 1))
    if [[ "$index" -gt "$retained" ]]; then
      delete_cloudfront_distribution "$id"
    fi
  done
}

if [[ "$STAGE" != "dev" && "$STAGE" != "production" ]]; then
  echo "Invalid stage: $STAGE (expected dev or production)" >&2
  exit 1
fi

if [[ "$ACTION" != "deploy" && "$ACTION" != "remove" ]]; then
  echo "Invalid action: $ACTION (expected deploy or remove)" >&2
  exit 1
fi

if [[ "$STAGE" == "production" && "$ACTION" == "remove" ]]; then
  echo "Refusing to remove production." >&2
  exit 1
fi

if [[ "$STAGE" != "${SST_STAGE:-$STAGE}" ]]; then
  echo "Stage argument '$STAGE' does not match SST_STAGE='${SST_STAGE}'." >&2
  exit 1
fi

if [[ -n "$SEED_DUMP_S3_URI" && ! "$SEED_DUMP_S3_URI" =~ ^s3:// ]]; then
  echo "Invalid seed dump URI: expected s3:// URI." >&2
  exit 1
fi

require_command aws
require_command docker
require_command git
require_command jq

validate_secret_sync_plan
validate_user_data
validate_production_image_inputs
if git show-ref --verify --quiet "refs/heads/${BRANCH}"; then
  run_cmd git checkout "$BRANCH"
else
  log "Local branch '$BRANCH' is not present; using checked-out ref $(git rev-parse --short=8 HEAD)."
fi
normalize_release_inputs

log "Deploy target:"
log "  branch: $BRANCH"
log "  stage: $STAGE"
log "  action: $ACTION"
log "  dry_run: $DRY_RUN"
log "  invalidate_cache: $INVALIDATE_CACHE"
log "  release_id: $RELEASE_ID"
log "  asset_prefix: $ASSET_PREFIX"
log "  static_assets_bucket: $STATIC_ASSETS_BUCKET"
log "  production_dockerfile: $PRODUCTION_DOCKERFILE"
log "  production_base_image: $PRODUCTION_BASE_IMAGE"

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

if [[ "$DRY_RUN" == "true" ]]; then
  if [[ "${GALA_ECS_ONLY_DEPLOY:-false}" == "true" ]]; then
    dry_run_ecs_only_rollout
    log "Dry run completed for ECS-only stage '$STAGE' and release '$RELEASE_ID'."
    exit 0
  fi

  discover_shared_router_distribution
  cd "$REPO_ROOT/infra"
  run_cmd npm ci
  run_sst_cmd npx sst install
  run_sst_cmd npx sst diff --stage "$STAGE"
  log "Dry run completed for stage '$STAGE' and release '$RELEASE_ID'."
  exit 0
fi

if needs_seed_dump && [[ ! -f db/sqldump/seed.dump && -n "$SEED_DUMP_S3_URI" ]]; then
  run_cmd mkdir -p db/sqldump
  run_aws_cmd s3 cp "$SEED_DUMP_S3_URI" db/sqldump/seed.dump
fi

if needs_seed_dump && [[ ! -f db/sqldump/seed.dump ]]; then
  echo "Missing db/sqldump/seed.dump. Provide SEED_DUMP_S3_URI or --seed-dump-s3-uri for CI deploys." >&2
  exit 1
fi

log_aws_cmd "ecr get-login-password | docker login --username AWS --password-stdin ${ECR_URI}"
aws_cmd ecr get-login-password | docker login --username AWS --password-stdin "${ECR_URI}"
run_aws_cmd ecr describe-repositories --repository-names "$IMAGE_NAME" >/dev/null || \
  run_aws_cmd ecr create-repository --repository-name "$IMAGE_NAME"
run_cmd docker build --platform linux/amd64 \
  -f "$PRODUCTION_DOCKERFILE" \
  -t "$LOCAL_IMAGE" \
  --build-arg GALA_PRODUCTION_BASE_IMAGE="$PRODUCTION_BASE_IMAGE" \
  --build-arg rails_env=production \
  .

sync_static_assets
prune_old_asset_releases
run_cmd docker tag "$LOCAL_IMAGE" "$REMOTE_IMAGE"
run_cmd docker push "$REMOTE_IMAGE"
run_cmd docker tag "$LOCAL_IMAGE" "${ECR_URI}:latest"
run_cmd docker push "${ECR_URI}:latest"
IMAGE_SIZE_BYTES="$(aws_cmd ecr describe-images --repository-name "$IMAGE_NAME" --image-ids imageTag="$IMAGE_TAG" --query 'imageDetails[0].imageSizeInBytes' --output text)"
log "  ecr_image_size_bytes: $IMAGE_SIZE_BYTES"
if [[ ! "$IMAGE_SIZE_BYTES" =~ ^[0-9]+$ ]]; then
  echo "Refusing deploy: AWS ECR did not return a numeric image size for ${REMOTE_IMAGE}." >&2
  exit 1
fi
if [[ "$IMAGE_SIZE_BYTES" -gt "$MAX_IMAGE_SIZE_BYTES" ]]; then
  echo "Refusing deploy: ECR image size ${IMAGE_SIZE_BYTES} exceeds ${MAX_IMAGE_SIZE_BYTES} bytes." >&2
  exit 1
fi

if [[ "${GALA_ECS_ONLY_DEPLOY:-false}" == "true" ]]; then
  run_ecs_only_rollout
  invalidate_caches
  prune_dormant_cloudfront_distributions
  run_user_data_hooks
  log "ECS-only deploy completed for stage '$STAGE' with release '$RELEASE_ID' and image '$REMOTE_IMAGE'"
  exit 0
fi

cd "$REPO_ROOT/infra"
run_cmd npm ci
run_sst_cmd npx sst install
discover_shared_router_distribution
detach_active_cloudfront_aliases
run_sst_cmd env GALA_APP_IMAGE_URI="$REMOTE_IMAGE" GALA_WEB_IMAGE_URI="$REMOTE_IMAGE" npx sst deploy --stage "$STAGE"

invalidate_caches
prune_dormant_cloudfront_distributions
run_user_data_hooks

log "Deploy completed for stage '$STAGE' with release '$RELEASE_ID' and image '$REMOTE_IMAGE'"
