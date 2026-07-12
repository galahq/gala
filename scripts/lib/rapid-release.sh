#!/usr/bin/env bash

rapid_release_aws() {
  if [[ -n "${AWS_PROFILE:-}" ]]; then
    aws --region "$AWS_REGION" --profile "$AWS_PROFILE" "$@"
  else
    aws --region "$AWS_REGION" "$@"
  fi
}

release_aws() { rapid_release_aws "$@"; }

rapid_stage_host() {
  if [[ "$1" != dev && "$1" != production && ! "$1" =~ ^pr-[1-9][0-9]*$ ]]; then
    echo "Invalid rapid-release stage: $1" >&2
    return 1
  fi
  case "$1" in
    production) printf '%s\n' "${GALA_DOMAIN_NAME:-learngala.dev}" ;;
    dev) printf 'dev.%s\n' "${GALA_DOMAIN_NAME:-learngala.dev}" ;;
    pr-[1-9][0-9]*) printf '%s.dev.%s\n' "$1" "${GALA_DOMAIN_NAME:-learngala.dev}" ;;
    *) echo "Invalid rapid-release stage: $1" >&2; return 1 ;;
  esac
}

rapid_cluster() {
  rapid_release_aws ecs list-clusters --query 'clusterArns[]' --output text |
    tr '\t' '\n' | rg "/gala-${1}-GalaClusterCluster-" | head -n 1
}

rapid_service() {
  local cluster="$1" role="$2"
  rapid_release_aws ecs list-services --cluster "$cluster" --query 'serviceArns[]' --output text |
    tr '\t' '\n' | rg "/${role}$|/${role}-" | head -n 1
}

rapid_read_channel() {
  release_aws s3 cp "s3://${GALA_STATIC_ASSETS_BUCKET}/$(release_channel_key "$1")" - 2>/dev/null ||
    printf '{"current":"","previous":""}\n'
}

rapid_write_channel() {
  local stage="$1" current="$2" previous="$3"
  release_channel_json "$current" "$previous" | release_aws s3 cp - \
    "s3://${GALA_STATIC_ASSETS_BUCKET}/$(release_channel_key "$stage")" \
    --cache-control no-store --content-type application/json >/dev/null
}

rapid_find_tagged_task() {
  local current="$1" stage="$2" role="$3" version="$4" family arn matched
  family="$(rapid_release_aws ecs describe-task-definition --task-definition "$current" \
    --query 'taskDefinition.family' --output text)"
  while read -r arn; do
    [[ -n "$arn" ]] || continue
    matched="$(rapid_release_aws ecs list-tags-for-resource --resource-arn "$arn" --output json |
      jq -r --arg stage "$stage" --arg role "$role" --arg version "$version" '
        (.tags | from_entries) as $t |
        ($t["gala:stage"] == $stage and $t["gala:role"] == $role and $t["gala:release"] == $version)
      ')"
    if [[ "$matched" == true ]]; then printf '%s\n' "$arn"; return; fi
  done < <(rapid_release_aws ecs list-task-definitions --family-prefix "$family" \
    --status ACTIVE --sort DESC --query 'taskDefinitionArns[]' --output text | tr '\t' '\n')
  echo "No retained $role task definition for $stage $version." >&2
  return 1
}

rapid_smoke() {
  local stage="$1" version="$2" host asset_count
  host="$(rapid_stage_host "$stage")"
  curl --fail --silent --show-error --retry 6 --retry-all-errors \
    --retry-delay 5 "https://${host}/up" >/dev/null
  release_aws s3api head-object --bucket "$GALA_STATIC_ASSETS_BUCKET" \
    --key "$(release_manifest_key "$version")" >/dev/null
  asset_count="$(release_aws s3api list-objects-v2 --bucket "$GALA_STATIC_ASSETS_BUCKET" \
    --prefix "$(release_asset_prefix "$version")/assets/" --max-items 1 \
    --query 'KeyCount' --output text)"
  [[ "$asset_count" =~ ^[1-9][0-9]*$ ]] || { echo "No static assets found for $version." >&2; return 1; }
}

rapid_rollout_version() {
  local stage="$1" version="$2" manifest="$3" cluster web worker old_web old_worker
  local new_web new_worker image channel previous
  cluster="$(rapid_cluster "$stage")"
  [[ -n "$cluster" ]] || { echo "No provisioned ECS cluster for $stage." >&2; return 1; }
  web="$(rapid_service "$cluster" GalaWeb)"
  worker="$(rapid_service "$cluster" GalaWorker)"
  [[ -n "$web" && -n "$worker" ]] || { echo "Missing web/worker services for $stage." >&2; return 1; }
  old_web="$(release_service_task "$cluster" "$web")"
  old_worker="$(release_service_task "$cluster" "$worker")"
  image="${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/${GALA_IMAGE_REPOSITORY}@$(jq -r '.digest' <<<"$manifest")"

  new_web="$(release_register_task "$old_web" "$image" "$version" "$stage" web)"
  new_worker="$(release_register_task "$old_worker" "$image" "$version" "$stage" worker)"
  release_update_service "$cluster" "$web" "$new_web"
  if ! release_update_service "$cluster" "$worker" "$new_worker"; then
    release_update_service "$cluster" "$web" "$old_web" || true
    return 1
  fi
  if ! release_aws ecs wait services-stable --cluster "$cluster" --services "$web" "$worker"; then
    release_update_service "$cluster" "$web" "$old_web" || true
    release_update_service "$cluster" "$worker" "$old_worker" || true
    release_aws ecs wait services-stable --cluster "$cluster" --services "$web" "$worker" || true
    return 1
  fi
  if ! rapid_smoke "$stage" "$version"; then
    release_update_service "$cluster" "$web" "$old_web" || true
    release_update_service "$cluster" "$worker" "$old_worker" || true
    release_aws ecs wait services-stable --cluster "$cluster" --services "$web" "$worker" || true
    return 1
  fi
  channel="$(rapid_read_channel "$stage")"
  previous="$(jq -r '.current // ""' <<<"$channel")"
  rapid_write_channel "$stage" "$version" "$previous"
  if [[ "$stage" == production && "$previous" =~ ^v[1-9][0-9]*$ ]]; then
    release_move_ecr_alias "$GALA_IMAGE_REPOSITORY" "$previous" production-previous
  fi
  release_move_ecr_alias "$GALA_IMAGE_REPOSITORY" "$version" "$stage"
}

rapid_rollback() {
  local stage="$1" requested="$2" channel target cluster web worker web_task worker_task manifest
  channel="$(rapid_read_channel "$stage")"
  target="$requested"
  [[ -n "$target" ]] || target="$(jq -r '.previous // ""' <<<"$channel")"
  [[ "$target" =~ ^v[1-9][0-9]*$ ]] || { echo "No valid rollback version for $stage." >&2; return 1; }
  manifest="$(release_read_manifest "$GALA_STATIC_ASSETS_BUCKET" "$target")"
  cluster="$(rapid_cluster "$stage")"
  web="$(rapid_service "$cluster" GalaWeb)"; worker="$(rapid_service "$cluster" GalaWorker)"
  web_task="$(rapid_find_tagged_task "$(release_service_task "$cluster" "$web")" "$stage" web "$target")"
  worker_task="$(rapid_find_tagged_task "$(release_service_task "$cluster" "$worker")" "$stage" worker "$target")"
  release_update_service "$cluster" "$web" "$web_task"
  release_update_service "$cluster" "$worker" "$worker_task"
  release_aws ecs wait services-stable --cluster "$cluster" --services "$web" "$worker"
  rapid_smoke "$stage" "$target"
  rapid_write_channel "$stage" "$target" "$(jq -r '.current // ""' <<<"$channel")"
  release_move_ecr_alias "$GALA_IMAGE_REPOSITORY" "$target" "$stage"
}

rapid_release_main() {
  local requested_stage="$1" action="${2:-}" stage version commit manifest dev_channel
  AWS_REGION="${AWS_REGION:-us-west-2}"
  GALA_STATIC_ASSETS_BUCKET="${GALA_STATIC_ASSETS_BUCKET:-gala-static-assets-353760060567}"
  GALA_IMAGE_REPOSITORY="${GALA_IMAGE_REPOSITORY:-gala}"
  AWS_ACCOUNT_ID="$(rapid_release_aws sts get-caller-identity --query Account --output text)"
  [[ "$AWS_ACCOUNT_ID" == 353760060567 ]] || { echo "Unexpected AWS account." >&2; return 1; }
  stage="${GALA_EFFECTIVE_STAGE:-$requested_stage}"
  rapid_stage_host "$stage" >/dev/null
  if [[ "$action" == promote:* && ! "$action" =~ ^promote:v[1-9][0-9]*$ ]] ||
     [[ "$action" == rollback:* && ! "$action" =~ ^rollback:v[1-9][0-9]*$ ]]; then
    echo "Malformed deploy action: $action" >&2
    return 1
  fi

  case "$action" in
    promote:v[1-9][0-9]*)
      [[ "$requested_stage" == production ]] || { echo "Promotion targets production only." >&2; return 1; }
      version="${action#promote:}"
      dev_channel="$(rapid_read_channel dev)"
      [[ "$(jq -r '.current' <<<"$dev_channel")" == "$version" ]] || {
        echo "$version is not the verified dev channel." >&2; return 1;
      }
      manifest="$(release_read_manifest "$GALA_STATIC_ASSETS_BUCKET" "$version")"
      rapid_rollout_version production "$version" "$manifest"
      ;;
    rollback)
      rapid_rollback "$stage" ""
      ;;
    rollback:v[1-9][0-9]*)
      rapid_rollback "$stage" "${action#rollback:}"
      ;;
    *) echo "Unsupported rapid-release action: $action" >&2; return 1 ;;
  esac
}
