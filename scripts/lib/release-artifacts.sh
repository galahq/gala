#!/usr/bin/env bash

release_asset_prefix() { printf 'releases/%s\n' "$1"; }
release_manifest_key() { printf '%s/manifest.json\n' "$(release_asset_prefix "$1")"; }
release_channel_key() { printf 'channels/%s.json\n' "$1"; }

release_channel_json() {
  jq -cn --arg current "$1" --arg previous "${2:-}" \
    '{current: $current, previous: $previous}'
}

release_ecr_digest() {
  local repository="$1" version="$2"
  release_aws ecr describe-images \
    --repository-name "$repository" \
    --image-ids "imageTag=$version" \
    --query 'imageDetails[0].imageDigest' --output text 2>/dev/null
}

release_read_manifest() {
  local bucket="$1" version="$2"
  release_aws s3 cp "s3://${bucket}/$(release_manifest_key "$version")" - 2>/dev/null
}

release_publish_manifest() {
  local bucket="$1" manifest="$2" version="$3"
  local existing

  existing="$(release_read_manifest "$bucket" "$version" || true)"
  if [[ -n "$existing" ]]; then
    validate_release_manifest "$existing" \
      "$(jq -r '.version' <<<"$manifest")" \
      "$(jq -r '.commit' <<<"$manifest")" \
      "$(jq -r '.digest' <<<"$manifest")" || {
        echo "Release $version already exists with different immutable content." >&2
        return 1
      }
    printf '%s\n' "$existing"
    return
  fi

  printf '%s\n' "$manifest" | release_aws s3 cp - \
    "s3://${bucket}/$(release_manifest_key "$version")" \
    --cache-control no-store --content-type application/json >/dev/null
  release_read_manifest "$bucket" "$version"
}

release_move_ecr_alias() {
  local repository="$1" source_version="$2" alias="$3" manifest
  manifest="$(release_aws ecr batch-get-image --repository-name "$repository" \
    --image-ids "imageTag=$source_version" \
    --query 'images[0].imageManifest' --output text)"
  release_aws ecr put-image --repository-name "$repository" \
    --image-tag "$alias" --image-manifest "$manifest" >/dev/null
}
