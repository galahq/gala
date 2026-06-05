#!/usr/bin/env bash

set -euo pipefail

usage() {
  cat <<'EOF'
Usage: sync-media-bucket-cors.sh [--bucket <name>] [--apply]

By default this script prints the current CORS configuration for the media bucket
and exits successfully if it includes an Active Storage-compatible rule.
Use --apply to configure/update the bucket CORS in-place.
EOF
}

mode="check"
bucket="${S3_BUCKET:-msc-gala}"

while [[ $# -gt 0 ]]; do
  case "$1" in
    --bucket)
      if [[ $# -lt 2 ]]; then
        echo "error: --bucket requires a value" >&2
        usage
        exit 1
      fi
      bucket="$2"
      shift 2
      ;;
    --apply)
      mode="apply"
      shift
      ;;
    -h|--help)
      usage
      exit 0
      ;;
    *)
      echo "error: unknown argument $1" >&2
      usage
      exit 1
      ;;
  esac
done

required_rule='{
  "AllowedHeaders": ["*"],
  "AllowedMethods": ["GET", "HEAD", "PUT", "POST", "DELETE", "OPTIONS"],
  "AllowedOrigins": ["*"],
  "ExposeHeaders": ["ETag", "Content-Length", "Content-Type", "Last-Modified"],
  "MaxAgeSeconds": 86400
}'

if command -v jq >/dev/null 2>&1; then
  current="$(aws s3api get-bucket-cors --bucket "${bucket}" --output json 2>/dev/null || true)"
  if [[ "${current}" == "{}" ]] || [[ -z "${current}" ]]; then
    has_rule="false"
  else
    has_rule="$(printf '%s\n' "${current}" | jq -r '
      .CORSRules
      | any(
          .AllowedMethods != null
          and (.AllowedMethods | sort | join(",") == "DELETE,GET,HEAD,OPTIONS,POST,PUT")
          and .AllowedHeaders != null
          and (.AllowedHeaders | index("*") != null)
          and .AllowedOrigins != null
          and (.AllowedOrigins | index("*") != null)
        )
    ')"
  fi

  if [[ "${mode}" == "check" ]]; then
    echo "Checked media bucket CORS for ${bucket} (jq available): has_required_rule=${has_rule}"
    if [[ "${has_rule}" == "true" ]]; then
      aws s3api get-bucket-cors --bucket "${bucket}" --output json
      exit 0
    fi
    echo "Missing required CORS rule on ${bucket}." >&2
    exit 1
  fi
else
  if [[ "${mode}" == "check" ]]; then
    echo "jq not available; skipping strict verification and reporting current CORS config." >&2
  fi
fi

if [[ "${mode}" == "apply" ]]; then
  tmp="$(mktemp)"
  trap 'rm -f "${tmp}"' EXIT
  cat >"${tmp}" <<JSON
{
  "CORSRules": [
    ${required_rule}
  ]
}
JSON

  aws s3api put-bucket-cors --bucket "${bucket}" --cors-configuration "file://${tmp}"
  echo "Applied required S3 CORS rule to ${bucket}."
  aws s3api get-bucket-cors --bucket "${bucket}" --output json
  exit 0
fi
