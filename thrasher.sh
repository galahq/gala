#!/bin/bash

# CONFIGURATION ---------------------------------------
MAGIC_LINK="https://msc-gala-staging.herokuapp.com/magic_link?key=VVGObiPbf65kk2fhWCu27A"
BASE_URL="https://msc-gala-staging.herokuapp.com"
CASE_URI="https://msc-gala-staging.herokuapp.com/cases/1078"
FORUM_ID="1078"
THREAD_ID="REPLACE_WITH_THREAD_ID"       # <-- FILL THIS IN
NUM_COMMENTS=50                          # Total comments to send
PARALLEL_JOBS=10                         # How many comments to try in parallel
COMMENT_PREFIX="Thrasher stress test"    # For easy identification in logs
DELAY_RANGE="0.05 0.20"                  # Random delay per comment (seconds)
LOG_FILE="thrasher_log_$(date +%s).txt"  # Output log file
COOKIE_JAR="cookies_gala.txt"
# ------------------------------------------------------

trasher_login() {
  echo "Logging in trasher $1"
  email="thrasher$1@test.com"
  pw="abc123"
  curl -X POST -sSL "$BASE_URL/api/v1/auth/login" -H "Content-Type: application/json" -d "{\"email\":\"$email\",\"password\":\"$pw\"}"
  curl -sSL -c "$COOKIE_JAR" "$MAGIC_LINK" > /dev/null
  echo "Logged in"
}

# 1. Get session cookie via magic link
echo "Getting session via magic link / login..."
curl -sSL -c "$COOKIE_JAR" "$MAGIC_LINK" > /dev/null

# 2. Function for posting a comment (exported for GNU Parallel)
post_comment() {
  local n=$1
  local nonce=$(date +%s%N)
  local content="${COMMENT_PREFIX} #${n} ${nonce}"
  local result status

  # Make the post and capture HTTP status
  result=$(curl -sSL -w "%{http_code}" -o /tmp/thrasher_result_${n}.txt \
    -b "$COOKIE_JAR" -H "Content-Type: application/json" \
    -X POST "$BASE_URL/forums/$FORUM_ID/comment_threads/$THREAD_ID/comments" \
    -d "{\"comment\": {\"content\": \"${content}\"}}")
  status="$result"

  # Read response content for logging
  response_body=$(cat /tmp/thrasher_result_${n}.txt)
  rm /tmp/thrasher_result_${n}.txt

  # Log attempt: timestamp, status, comment, response
  if [ "$status" -eq 200 ] || [ "$status" -eq 201 ]; then
    echo "$(date +'%F %T') SUCCESS $status $n '$content'" >> "$LOG_FILE"
  else
    echo "$(date +'%F %T') FAIL $status $n '$content' | $response_body" >> "$LOG_FILE"
  fi
}
export -f post_comment
export COOKIE_JAR BASE_URL FORUM_ID THREAD_ID COMMENT_PREFIX LOG_FILE

# 3. Main spam loop using GNU Parallel
echo "Spamming $NUM_COMMENTS comments across $PARALLEL_JOBS parallel jobs to thread $THREAD_ID in forum $FORUM_ID..."
seq 1 "$NUM_COMMENTS" | parallel -j "$PARALLEL_JOBS" --halt soon,fail=1 'sleep $(awk -v min='${DELAY_RANGE% *}' -v max='${DELAY_RANGE#* }' "BEGIN{srand(); print min+rand()*(max-min)}"); post_comment {}'

echo "All attempts done. Log file: $LOG_FILE"

# 4. Basic reporting
SUCCESS=$(grep -c "SUCCESS" "$LOG_FILE")
FAIL=$(grep -c "FAIL" "$LOG_FILE")
echo "========================================"
echo "Total attempted: $NUM_COMMENTS"
echo "Successful:      $SUCCESS"
echo "Failed:          $FAIL"
echo "Detailed log:    $LOG_FILE"
echo "========================================"

# To see failed cases:
if [ "$FAIL" -gt 0 ]; then
  echo "First failures:"
  grep FAIL "$LOG_FILE" | head -5
  echo "(See $LOG_FILE for more details)"
fi
