#!/usr/bin/env bash

effective_stage_for() {
  local durable_stage="$1"
  local pr_number="${2:-}"

  if [[ "$durable_stage" == production ]]; then
    printf 'production\n'
  elif [[ "$durable_stage" == dev && "$pr_number" =~ ^[1-9][0-9]*$ ]]; then
    printf 'pr-%s\n' "$pr_number"
  elif [[ "$durable_stage" == dev ]]; then
    printf 'dev\n'
  else
    echo "Durable stage must be dev or production." >&2
    return 1
  fi
}

validate_effective_stage() {
  local durable_stage="$1"
  local effective_stage="$2"

  case "$durable_stage:$effective_stage" in
    production:production|dev:dev) return 0 ;;
    dev:pr-[1-9][0-9]*)
      [[ "$effective_stage" =~ ^pr-[1-9][0-9]*$ ]]
      return
      ;;
    *)
      echo "Effective stage $effective_stage is invalid for durable stage $durable_stage." >&2
      return 1
      ;;
  esac
}

public_url_for() {
  case "$1" in
    production) printf 'https://learngala.dev\n' ;;
    dev) printf 'https://dev.learngala.dev\n' ;;
    pr-[1-9][0-9]*) printf 'https://%s.dev.learngala.dev\n' "$1" ;;
    *) echo "No public URL for stage $1." >&2; return 1 ;;
  esac
}
