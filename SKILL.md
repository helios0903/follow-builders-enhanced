---
name: follow-builders-enhanced
description: Enhanced delivery layer for the follow-builders AI digest. Produces a polished bilingual (English + Chinese) HTML email newsletter via claude -p headless remixing and Resend. Use this when setting up or running the daily AI builders digest cron job, when the user wants to improve their digest email quality, or when troubleshooting digest delivery.
---

# Follow Builders Enhanced — Delivery Layer

An upgrade to the [follow-builders](https://github.com/zarazhangrui/follow-builders) skill that adds:

- **HTML email** with proper formatting, sections, and hyperlinks (vs plain text)
- **Bilingual output** — English and Chinese interleaved paragraph-by-paragraph
- **AI-remixed content** even in scheduled cron runs (via `claude -p` headless mode)
- **Multiple tweet links** — every substantive tweet gets its own hyperlink

## Architecture

```
GitHub feeds
     ↓
prepare-digest.js   (from follow-builders)
     ↓
claude -p           (AI remix + bilingual translation)
     ↓
deliver-html.js     (HTML email via Resend)
     ↓
📧 Your inbox
```

## Files

| File | Purpose |
|------|---------|
| `scripts/run-digest.sh` | Main cron script — orchestrates the full pipeline |
| `scripts/deliver-html.js` | Sends HTML email via Resend API |
| `prompts/remix-prompt.md` | Instructions for Claude to remix and translate content |

## Setup

### Prerequisites
- [follow-builders](https://github.com/zarazhangrui/follow-builders) installed at `~/.claude/skills/follow-builders`
- `~/.follow-builders/config.json` configured with email delivery
- `~/.follow-builders/.env` containing `RESEND_API_KEY`
- Claude Code logged in via `claude auth login` (OAuth, not API key)

### Install

```bash
# Copy scripts to your follow-builders user directory
cp scripts/deliver-html.js ~/.follow-builders/deliver-html.js
cp scripts/run-digest.sh ~/.follow-builders/run-digest.sh
cp prompts/remix-prompt.md ~/.follow-builders/remix-prompt.md
chmod +x ~/.follow-builders/run-digest.sh

# Set up daily cron (7am Seoul time)
(crontab -l 2>/dev/null; echo "0 7 * * * TZ=Asia/Seoul $HOME/.follow-builders/run-digest.sh") | crontab -
```

### Test

```bash
~/.follow-builders/run-digest.sh
# Check ~/.follow-builders/cron.log for output
```

## Configuration

All config lives in `~/.follow-builders/config.json`:

```json
{
  "platform": "other",
  "language": "bilingual",
  "timezone": "Asia/Seoul",
  "frequency": "daily",
  "deliveryTime": "07:00",
  "delivery": {
    "method": "email",
    "email": "your@email.com"
  }
}
```

## Customizing the digest style

Edit `~/.follow-builders/remix-prompt.md` to change:
- Summary length per builder
- Section order
- Tone and formatting
- Which content types to emphasize

Changes take effect on the next run — no restart needed.

## On-demand digest

For a full AI-remixed bilingual digest anytime, type `/ai` in Claude Code.
This runs the same remix pipeline interactively and can also send it to your email.
