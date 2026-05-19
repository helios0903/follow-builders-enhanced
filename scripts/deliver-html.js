#!/usr/bin/env node
// Sends digest as HTML email via Gmail SMTP (nodemailer).
// Usage: node deliver-html.js --file /path/to/digest.html

import { readFile } from 'fs/promises';
import { existsSync } from 'fs';
import { join } from 'path';
import { homedir } from 'os';
import { createTransport } from 'nodemailer';

const USER_DIR = join(homedir(), '.follow-builders');
const CONFIG_PATH = join(USER_DIR, 'config.json');

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
  // Read config
  let config = {};
  if (existsSync(CONFIG_PATH)) {
    config = JSON.parse(await readFile(CONFIG_PATH, 'utf-8'));
  }

  const delivery = config.delivery || {};
  const toEmail = Array.isArray(delivery.email) ? delivery.email : [delivery.email];

  // Gmail SMTP credentials from env
  const gmailUser = process.env.GMAIL_USER;
  const gmailPass = process.env.GMAIL_APP_PASSWORD;

  if (!gmailUser || !gmailPass) {
    console.error('GMAIL_USER or GMAIL_APP_PASSWORD not set');
    process.exit(1);
  }
  if (!toEmail.length || !toEmail[0]) {
    console.error('delivery.email not set in config.json');
    process.exit(1);
  }

  const html = await getInput();
  if (!html || html.trim().length < 100) {
    console.error('Empty or too-short input');
    process.exit(1);
  }

  // Wrap in email shell if not already full HTML
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
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
    timeZone: 'Asia/Seoul'
  })}`;

  const transporter = createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: { user: gmailUser, pass: gmailPass }
  });

  await transporter.sendMail({
    from: `"AI Builders Digest" <${gmailUser}>`,
    to: toEmail.join(', '),
    subject,
    html: fullHtml
  });

  console.log(JSON.stringify({ status: 'ok', to: toEmail.join(', '), subject }));
}

main().catch(err => { console.error(err.message); process.exit(1); });
