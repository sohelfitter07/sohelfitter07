#!/usr/bin/env node
/**
 * Exports website quote-request threads and my replies to past-emails.txt.
 *
 * Usage:
 *   node backend/scripts/analyze-emails.js [--out=past-emails.txt] [--max=0]
 *
 * Requires GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET and GOOGLE_REFRESH_TOKEN in
 * the repo-root .env, authorized for gmail.readonly (see gmail-auth.js).
 */

const fs = require('fs');
const path = require('path');

const repoRoot = path.join(__dirname, '..', '..');
const envPath = path.join(repoRoot, '.env');
require('dotenv').config({ path: envPath });

const TOKEN_URL = 'https://oauth2.googleapis.com/token';
const GMAIL_BASE = 'https://gmail.googleapis.com/gmail/v1/users/me';
const SEARCH_QUERY = 'subject:"New Quote Request:"';

const args = process.argv.slice(2);
const outFlag = args.find((arg) => arg.startsWith('--out='));
const maxFlag = args.find((arg) => arg.startsWith('--max='));
const outputPath = path.resolve(
  repoRoot,
  outFlag ? outFlag.split('=')[1] : 'past-emails.txt'
);
const maxThreads = maxFlag ? Math.max(0, Number(maxFlag.split('=')[1]) || 0) : 0;

function fail(message) {
  console.error(`\n${message}\n`);
  process.exit(1);
}

function getConfig() {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const refreshToken = process.env.GOOGLE_REFRESH_TOKEN;

  if (!clientId || !clientSecret || !refreshToken) {
    fail(
      'Gmail is not configured. Set GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET and GOOGLE_REFRESH_TOKEN in .env, then run backend/scripts/gmail-auth.js.'
    );
  }

  return { clientId, clientSecret, refreshToken };
}

async function getAccessToken() {
  const { clientId, clientSecret, refreshToken } = getConfig();

  const response = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: refreshToken,
      grant_type: 'refresh_token',
    }).toString(),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok || !data.access_token) {
    fail(
      `Gmail token refresh failed: ${data.error_description || data.error || `HTTP ${response.status}`}`
    );
  }

  return data.access_token;
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function gmailGet(accessToken, endpoint, params = {}) {
  const url = new URL(`${GMAIL_BASE}${endpoint}`);
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== '') {
      url.searchParams.set(key, String(value));
    }
  }

  for (let attempt = 1; attempt <= 3; attempt += 1) {
    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (response.ok) {
      return response.json();
    }

    const body = await response.json().catch(() => ({}));
    const reason = body.error?.message || `HTTP ${response.status}`;

    if (response.status === 403) {
      fail(
        `Gmail rejected the request (${reason}).\n` +
          'The saved refresh token probably only has gmail.send. Re-run gmail-auth.js to grant gmail.readonly.'
      );
    }

    if (response.status === 429 || response.status >= 500) {
      if (attempt < 3) {
        await sleep(1000 * attempt);
        continue;
      }
    }

    fail(`Gmail API ${endpoint} failed: ${reason}`);
  }

  fail(`Gmail API ${endpoint} failed after retries.`);
}

function getHeader(message, name) {
  const target = name.toLowerCase();
  const headers = message?.payload?.headers || [];
  const header = headers.find((item) => String(item.name).toLowerCase() === target);
  return header ? header.value : '';
}

function decodeBase64(data) {
  return Buffer.from(String(data), 'base64url').toString('utf8');
}

function htmlToText(html) {
  return String(html)
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/(p|div|li|tr|h[1-6])>/gi, '\n')
    .replace(/<li[^>]*>/gi, '- ')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/[ \t]+\n/g, '\n');
}

function collectBodyParts(part, collected) {
  if (!part) {
    return;
  }

  const isAttachment = Boolean(part.filename);
  const data = part.body?.data;
  const mimeType = String(part.mimeType || '').toLowerCase();

  if (!isAttachment && data && mimeType === 'text/plain') {
    collected.plain.push(decodeBase64(data));
  } else if (!isAttachment && data && mimeType === 'text/html') {
    collected.html.push(decodeBase64(data));
  }

  for (const child of part.parts || []) {
    collectBodyParts(child, collected);
  }
}

function messageText(message) {
  const collected = { plain: [], html: [] };
  collectBodyParts(message?.payload, collected);

  const plain = collected.plain.join('\n').trim();
  if (plain) {
    return plain;
  }

  return htmlToText(collected.html.join('\n')).trim();
}

const QUOTE_MARKERS = [
  /^\s*On .+wrote:\s*$/im,
  /^\s*-{2,}\s*Original Message\s*-{2,}\s*$/im,
  /^\s*From:\s*.+\n\s*(Sent|Date):\s*.+\n\s*To:\s*.+$/im,
  /^\s*_{10,}\s*$/m,
];

function stripQuotedReply(text) {
  let result = String(text);

  result = result.replace(/Email sent via EmailJS\.com/gi, '');

  for (const marker of QUOTE_MARKERS) {
    const match = marker.exec(result);
    if (match && match.index > 0) {
      result = result.slice(0, match.index);
    }
  }

  result = result
    .split('\n')
    .filter((line) => !/^\s*>/.test(line))
    .join('\n');

  return result.replace(/\n{3,}/g, '\n\n').trim();
}

function addressOf(headerValue) {
  const value = String(headerValue || '');
  const match = value.match(/<([^>]+)>/);
  return (match ? match[1] : value).trim().toLowerCase();
}

function isMyMessage(message, myAddress) {
  if ((message.labelIds || []).includes('SENT')) {
    return true;
  }

  return myAddress !== '' && addressOf(getHeader(message, 'From')) === myAddress;
}

function parseSubject(subject) {
  const match = String(subject).match(
    /^New Quote Request:\s*(.+?)\s+-\s+(.+?)\s*$/i
  );

  return {
    customer: match ? match[1].trim() : '',
    service: match ? match[2].trim() : '',
  };
}

function formatTimestamp(internalDate) {
  const date = new Date(Number(internalDate));
  if (Number.isNaN(date.getTime())) {
    return '';
  }

  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Toronto',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).format(date);
}

async function listThreadIds(accessToken) {
  const ids = [];
  const seen = new Set();
  let pageToken = '';

  do {
    const page = await gmailGet(accessToken, '/threads', {
      q: SEARCH_QUERY,
      maxResults: 100,
      pageToken,
    });

    for (const thread of page.threads || []) {
      if (thread.id && !seen.has(thread.id)) {
        seen.add(thread.id);
        ids.push(thread.id);
      }
    }

    pageToken = page.nextPageToken || '';
    process.stderr.write(`\rFound ${ids.length} matching threads…`);
  } while (pageToken);

  process.stderr.write('\n');
  return maxThreads > 0 ? ids.slice(0, maxThreads) : ids;
}

function renderThread(thread, myAddress) {
  const messages = [...(thread.messages || [])].sort(
    (a, b) => Number(a.internalDate) - Number(b.internalDate)
  );

  if (messages.length < 2) {
    return null;
  }

  const original = messages[0];
  const subject = getHeader(original, 'Subject') || '(no subject)';
  const { customer, service } = parseSubject(subject);
  const replies = messages
    .slice(1)
    .filter((message) => isMyMessage(message, myAddress))
    .map((message) => ({
      timestamp: formatTimestamp(message.internalDate),
      text: stripQuotedReply(messageText(message)),
    }))
    .filter((reply) => reply.text.length > 0);

  if (replies.length === 0) {
    return null;
  }

  const sections = [
    '='.repeat(78),
    `Thread:    ${subject}`,
    `Customer:  ${customer || '(unknown)'}`,
    `Service:   ${service || '(unknown)'}`,
    `Thread ID: ${thread.id}`,
    `Replies:   ${replies.length} of ${messages.length} messages`,
    '',
    '----- ORIGINAL REQUEST (EmailJS) -----',
    stripQuotedReply(messageText(original)) || '(no plain-text body)',
  ];

  replies.forEach((reply, index) => {
    sections.push(
      '',
      `----- MY REPLY ${index + 1}${reply.timestamp ? ` (${reply.timestamp})` : ''} -----`,
      reply.text
    );
  });

  sections.push('');
  return { text: sections.join('\n'), hasReply: true };
}

async function main() {
  const accessToken = await getAccessToken();

  const profile = await gmailGet(accessToken, '/profile');
  const myAddress = String(profile.emailAddress || '').toLowerCase();
  console.log(`Signed in as ${myAddress || '(unknown address)'}`);
  console.log(`Searching Gmail for ${SEARCH_QUERY}`);

  const threadIds = await listThreadIds(accessToken);
  console.log(`Examining ${threadIds.length} thread(s)…`);

  const blocks = [];
  let threadsWithReplies = 0;

  for (let index = 0; index < threadIds.length; index += 1) {
    const thread = await gmailGet(accessToken, `/threads/${threadIds[index]}`, {
      format: 'full',
    });
    const rendered = renderThread(thread, myAddress);

    if (rendered) {
      blocks.push(rendered.text);
      threadsWithReplies += 1;
    }

    process.stderr.write(`\rProcessed ${index + 1}/${threadIds.length} threads…`);
  }

  process.stderr.write('\n');

  if (blocks.length === 0) {
    fail(
      'No quote-request threads with a reply from you were found. Nothing was written to past-emails.txt.'
    );
  }

  const header = [
    '# Canadian Fitness Repair — past quote replies',
    `# Generated ${new Date().toISOString()} from Gmail`,
    `# Query: ${SEARCH_QUERY}`,
    `# Threads with replies: ${threadsWithReplies} of ${threadIds.length}`,
    '',
    '',
  ].join('\n');

  fs.writeFileSync(outputPath, header + blocks.join('\n'), 'utf8');

  console.log(`\nWrote ${blocks.length} thread(s) with replies to ${outputPath}`);
}

main().catch((error) => {
  fail(error instanceof Error ? error.message : String(error));
});
