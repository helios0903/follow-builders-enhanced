#!/bin/bash
# Follow Builders — Cron Runner
# Fetches content, runs AI remix via claude -p, sends HTML email.

set -euo pipefail

SKILL_DIR="$HOME/.claude/skills/follow-builders"
USER_DIR="$HOME/.follow-builders"
LOG="$USER_DIR/cron.log"
TMP_DATA="/tmp/fb-data.json"
TMP_HTML="/tmp/fb-digest.html"

log() { echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" >> "$LOG"; }

log "Starting digest run"

# Clear the long-lived token so claude -p uses OAuth credentials
unset CLAUDE_CODE_OAUTH_TOKEN

# 1. Fetch data
log "Fetching feed..."
if ! node "$SKILL_DIR/scripts/prepare-digest.js" > "$TMP_DATA" 2>>"$LOG"; then
  log "ERROR: prepare-digest.js failed"
  exit 1
fi

BUILDERS=$(node -e "const d=require('$TMP_DATA'); console.log(d.stats?.xBuilders||0)" 2>/dev/null || echo 0)
PODS=$(node -e "const d=require('$TMP_DATA'); console.log(d.stats?.podcastEpisodes||0)" 2>/dev/null || echo 0)
log "Feed fetched: $BUILDERS builders, $PODS podcasts"

if [ "$BUILDERS" -eq 0 ] && [ "$PODS" -eq 0 ]; then
  log "No content today, skipping"
  exit 0
fi

# 2. AI remix via claude -p
log "Running AI remix..."
PROMPT="$(cat "$USER_DIR/remix-prompt.md")

Here is today's data JSON:
$(cat "$TMP_DATA")"

if ! echo "$PROMPT" | claude -p > "$TMP_HTML" 2>>"$LOG"; then
  log "ERROR: claude -p remix failed"
  exit 1
fi

HTML_SIZE=$(wc -c < "$TMP_HTML")
log "Remix complete: ${HTML_SIZE} bytes"

# 3. Send HTML email
log "Sending email..."
if node "$USER_DIR/deliver-html.js" --file "$TMP_HTML" >> "$LOG" 2>&1; then
  log "Email sent successfully"
else
  log "ERROR: email delivery failed"
  exit 1
fi

log "Done"
