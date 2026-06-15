#!/usr/bin/env bash

set -euo pipefail

DOC_DIR="${1:-docs/ops/workflows}"
MAX_NONBLANK_LINES="${MAX_OPERATOR_DOC_LINES:-95}"
MAX_WORDS="${MAX_OPERATOR_DOC_WORDS:-650}"
REQUIRED_HEADINGS=(
  "NAME"
  "SYNOPSIS"
  "INPUTS"
  "DRY RUN"
  "SIDE EFFECTS"
  "VERIFY"
  "ROLLBACK"
  "EXAMPLES"
)

failures=0

for file in "${DOC_DIR}"/*.md; do
  [[ -f "$file" ]] || continue

  for heading in "${REQUIRED_HEADINGS[@]}"; do
    if ! grep -qx "## ${heading}" "$file"; then
      echo "${file}: missing heading ## ${heading}" >&2
      failures=$((failures + 1))
    fi
  done

  nonblank_lines="$(grep -cv '^[[:space:]]*$' "$file")"
  word_count="$(wc -w < "$file" | tr -d ' ')"

  if [[ "$nonblank_lines" -gt "$MAX_NONBLANK_LINES" ]]; then
    echo "${file}: ${nonblank_lines} nonblank lines exceeds ${MAX_NONBLANK_LINES}" >&2
    failures=$((failures + 1))
  fi

  if [[ "$word_count" -gt "$MAX_WORDS" ]]; then
    echo "${file}: ${word_count} words exceeds ${MAX_WORDS}" >&2
    failures=$((failures + 1))
  fi
done

if [[ "$failures" -gt 0 ]]; then
  exit 1
fi

echo "Operator docs validated: ${DOC_DIR}"
