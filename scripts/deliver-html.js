#!/usr/bin/env node
// Sends digest as HTML email via Resend.
// Usage: echo "<html>..." | node deliver-html.js
//        node deliver-html.js --file /path/to/digest.html

import { readFile } from 'fs/promises';
import { existsSync } from 'fs';
import { join } from 'path';
import { homedir } from 'os';
import { config as loadEnv } from 'dotenv';

const USER_DIR = join(homedir(), '.follow-builders');
const CONFIG_PATH = join(USER_DIR, 'config.json');
const ENV_PATH = join(USER_DIR, '.env');

async function getInput() {
  const args = process.argv.slice(2);
  const fileIdx = args.indexOf('--file');
  if (fileIdx !== -1 && args[fileIdx + 1]) {
    return await readFile(args[fileIdx + 1], 'utf-8');
  }
  const chunks = [];
  for await (const chunk of process.stdin) chunks.push(chunk);
  return Buffer.concat(chunks).toString('utf-8');
}

async function main() {
  loadEnv({ path: ENV_PATH });

  let config = {};
  if (existsSync(CONFIG_PATH)) {
    config = JSON.parse(await readFile(CONFIG_PATH, 'utf-8'));
  }

  const delivery = config.delivery || {};
  const apiKey = process.env.RESEND_API_KEY;
  const toEmail = Array.isArray(delivery.email) ? delivery.email : [delivery.email];

  if (!apiKey) { console.error('RESEND_API_KEY not set'); process.exit(1); }
  if (!toEmail.length) { console.error('delivery.email not set in config.json'); process.exit(1); }

  const html = await getInput();
  if (!html || html.trim().length < 100) {
    console.error('Empty or too-short input'); process.exit(1);
  }

  // Wrap in a clean email shell if not already full HTML
  const fullHtml = html.trim().startsWith('<!DOCTYPE') ? html : `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<style>
  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 680px; margin: 0 auto; padding: 20px; color: #1a1a1a; line-height: 1.6; }
  h2 { font-size: 22px; border-bottom: 2px solid #e5e7eb; padding-bottom: 8px; margin-top: 32px; }
  h3 { font-size: 17px; color: #374151; margin-top: 28px; }
  p { margin: 10px 0; font-size: 15px; }
  p + p { color: #4b5563; font-size: 14px; margin-top: 2px; margin-bottom: 16px; }
  a { color: #2563eb; text-decoration: none; }
  a:hover { text-decoration: underline; }
  hr { border: none; border-top: 1px solid #e5e7eb; margin: 24px 0; }
  em { color: #9ca3af; font-size: 13px; }
  strong { color: #111827; }
</style>
</head>
<body>
${html}
</body>
</html>`;

  const subject = `AI Builders Digest — ${new Date().toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  })}`;

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
    body: JSON.stringify({ from: 'AI Builders Digest <digest@resend.dev>', to: toEmail, subject, html: fullHtml })
  });

  if (!res.ok) {
    const err = await res.json();
    console.error('Resend error:', err.message || JSON.stringify(err));
    process.exit(1);
  }

  console.log(JSON.stringify({ status: 'ok', to: toEmail.join(', '), subject }));
}

main();
