#!/usr/bin/env node
/**
 * Registers Gmail push notifications with Cloud Pub/Sub.
 *
 * Usage:
 *   node backend/scripts/watch-gmail.js
 *
 * Uses GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET / GOOGLE_REFRESH_TOKEN from the
 * repo-root .env. Gmail watches expire after 7 days, so re-run this before the
 * printed expiration date to keep the webhook receiving mail.
 */

const path = require('path');

require('dotenv').config({ path: path.join(__dirname, '..', '..', '.env') });

const { getAccessToken } = require('../services/gmailService');

const TOPIC_NAME = 'projects/cfr-tracker/topics/gmail-push-topic';
const WATCH_URL = 'https://gmail.googleapis.com/gmail/v1/users/me/watch';

async function main() {
  const accessToken = await getAccessToken();

  const response = await fetch(WATCH_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      topicName: TOPIC_NAME,
      // Watch both directions so replies typed in the phone's Gmail app
      // (stored under SENT) also reach the webhook.
      labelIds: ['INBOX', 'SENT'],
    }),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const reason = data.error?.message || `HTTP ${response.status}`;
    throw new Error(`users.watch failed: ${reason}`);
  }

  const expiration = Number(data.expiration);
  const expiresAt = Number.isFinite(expiration)
    ? new Date(expiration).toISOString()
    : 'unknown';

  console.log(`topicName:   ${TOPIC_NAME}`);
  console.log(`historyId:   ${data.historyId || 'unknown'}`);
  console.log(`expiration:  ${data.expiration || 'unknown'} (${expiresAt})`);
}

main().catch((error) => {
  console.error(`\n${error.message}\n`);
  process.exit(1);
});
