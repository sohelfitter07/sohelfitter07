const TOKEN_URL = 'https://oauth2.googleapis.com/token';
const GMAIL_API_BASE = 'https://gmail.googleapis.com/gmail/v1/users/me';
const GMAIL_SEND_URL = `${GMAIL_API_BASE}/messages/send`;

let cachedAccessToken = null;
let cachedAccessTokenExpiry = 0;

function stripNewlines(value) {
  return String(value || '').replace(/[\r\n]+/g, ' ').trim();
}

function encodeHeaderValue(value) {
  const clean = stripNewlines(value);
  return /^[\x20-\x7E]*$/.test(clean)
    ? clean
    : `=?UTF-8?B?${Buffer.from(clean, 'utf8').toString('base64')}?=`;
}

function toBase64Lines(value) {
  return Buffer.from(value, 'utf8')
    .toString('base64')
    .replace(/(.{76})/g, '$1\r\n');
}

function buildRawMessage({ from, to, subject, text, html }) {
  const boundary = `cfr_${Date.now()}_${Math.random().toString(36).slice(2)}`;
  const lines = [
    `From: ${from}`,
    `To: ${stripNewlines(to)}`,
    `Subject: ${encodeHeaderValue(subject)}`,
    'MIME-Version: 1.0',
    `Content-Type: multipart/alternative; boundary="${boundary}"`,
    '',
    `--${boundary}`,
    'Content-Type: text/plain; charset="UTF-8"',
    'Content-Transfer-Encoding: base64',
    '',
    toBase64Lines(text || ''),
    `--${boundary}`,
    'Content-Type: text/html; charset="UTF-8"',
    'Content-Transfer-Encoding: base64',
    '',
    toBase64Lines(html || text || ''),
    `--${boundary}--`,
    '',
  ];

  // Gmail's API requires base64url without "=" padding.
  return Buffer.from(lines.join('\r\n'), 'utf8')
    .toString('base64url')
    .replace(/=+$/, '');
}

async function readResponseBody(response) {
  const rawText = await response.text().catch((error) => {
    console.error('[GMAIL] Failed to read response body:', error);
    return '';
  });

  let data = {};
  if (rawText) {
    try {
      data = JSON.parse(rawText);
    } catch {
      data = { raw: rawText };
    }
  }

  return { data, rawText };
}

function getConfig() {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const refreshToken = process.env.GOOGLE_REFRESH_TOKEN;

  if (!clientId || !clientSecret || !refreshToken) {
    throw new Error(
      'Gmail API is not configured. Set GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET and GOOGLE_REFRESH_TOKEN.'
    );
  }

  return { clientId, clientSecret, refreshToken };
}

async function getAccessToken() {
  if (cachedAccessToken && Date.now() < cachedAccessTokenExpiry) {
    console.log('[GMAIL] Using cached access token');
    return cachedAccessToken;
  }

  const { clientId, clientSecret, refreshToken } = getConfig();

  console.log('[GMAIL] Refreshing access token via GOOGLE_REFRESH_TOKEN');

  let response;
  try {
    response = await fetch(TOKEN_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        refresh_token: refreshToken,
        grant_type: 'refresh_token',
      }).toString(),
    });
  } catch (error) {
    console.error('[GMAIL] Token refresh network error:', error);
    throw error;
  }

  const { data, rawText } = await readResponseBody(response);

  if (!response.ok || !data.access_token) {
    console.error(
      `[GMAIL] Token refresh failed HTTP ${response.status}:`,
      rawText || '(empty body)'
    );
    const reason = data.error_description || data.error || `HTTP ${response.status}`;
    throw new Error(`Gmail token refresh failed: ${reason}`);
  }

  console.log(
    `[GMAIL] Token refresh HTTP ${response.status} succeeded (expires_in=${data.expires_in || 'unknown'})`
  );

  cachedAccessToken = data.access_token;
  const expiresIn = Number(data.expires_in) || 3600;
  cachedAccessTokenExpiry = Date.now() + Math.max(expiresIn - 60, 0) * 1000;

  console.log(`[GMAIL] Access token refreshed, expires in ${expiresIn}s`);

  return cachedAccessToken;
}

async function sendEmail({ to, subject = '', text = '', html }) {
  if (!to) {
    throw new Error('Missing email recipient');
  }

  const senderAddress = process.env.GMAIL_SENDER || process.env.EMAIL_USER;
  if (!senderAddress) {
    throw new Error('Set GMAIL_SENDER (or EMAIL_USER) to the Gmail address that sends mail.');
  }

  const senderName = process.env.GMAIL_SENDER_NAME || 'Canadian Fitness Repair';
  const raw = buildRawMessage({
    from: `"${stripNewlines(senderName)}" <${stripNewlines(senderAddress)}>`,
    to,
    subject,
    text,
    html: html || text,
  });

  console.log(
    `[GMAIL] Prepared message (raw length ${raw.length}) from "${senderName} <${senderAddress}>" to "${to}" subject "${subject}"`
  );

  const accessToken = await getAccessToken();

  console.log(`[GMAIL] POST ${GMAIL_SEND_URL}`);

  let response;
  try {
    response = await fetch(GMAIL_SEND_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ raw }),
    });
  } catch (error) {
    console.error('[GMAIL] Gmail API network error:', error);
    throw error;
  }

  const { data, rawText } = await readResponseBody(response);

  console.log(
    `[GMAIL] Gmail API response HTTP ${response.status} ${response.statusText}:`,
    rawText || '(empty body)'
  );

  if (!response.ok) {
    console.error('[GMAIL] Gmail API error response:', JSON.stringify(data, null, 2));
    const reason = data.error?.message || `HTTP ${response.status}`;
    throw new Error(`Gmail send failed: ${reason}`);
  }

  console.log(
    `[GMAIL] Email sent. id=${data.id || 'unknown'} threadId=${data.threadId || 'unknown'}`
  );

  return data;
}

async function gmailGet(endpoint, params = {}) {
  const accessToken = await getAccessToken();
  const url = new URL(`${GMAIL_API_BASE}${endpoint}`);

  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== '') {
      url.searchParams.set(key, String(value));
    }
  }

  let response;
  try {
    response = await fetch(url, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
  } catch (error) {
    console.error(`[GMAIL] GET ${endpoint} network error:`, error);
    throw error;
  }

  const { data, rawText } = await readResponseBody(response);

  if (!response.ok) {
    console.error(
      `[GMAIL] GET ${endpoint} failed HTTP ${response.status}:`,
      rawText || '(empty body)'
    );
    const reason = data.error?.message || `HTTP ${response.status}`;
    const error = new Error(`Gmail API ${endpoint} failed: ${reason}`);
    error.status = response.status;
    throw error;
  }

  return data;
}

async function listHistoryMessageIds(historyId) {
  const ids = [];
  const seen = new Set();
  let pageToken = '';

  do {
    const page = await gmailGet('/history', {
      startHistoryId: historyId,
      historyTypes: 'messageAdded',
      labelId: 'INBOX',
      maxResults: 100,
      pageToken,
    });

    for (const record of page.history || []) {
      for (const added of record.messagesAdded || []) {
        const id = added.message?.id;
        if (id && !seen.has(id)) {
          seen.add(id);
          ids.push(id);
        }
      }
    }

    pageToken = page.nextPageToken || '';
  } while (pageToken && ids.length < 50);

  return ids;
}

async function fetchNewestMessage(messageIds) {
  if (!messageIds.length) {
    return null;
  }

  // A single notification normally covers one message; cap the fan-out in
  // case a burst of mail arrived in the same history window.
  const messages = await Promise.all(
    messageIds.slice(-10).map((id) => gmailGet(`/messages/${id}`, { format: 'full' }))
  );

  messages.sort(
    (a, b) => Number(b.internalDate || 0) - Number(a.internalDate || 0)
  );

  return messages[0] || null;
}

/**
 * Returns the newest INBOX message associated with a Pub/Sub historyId.
 *
 * Gmail's startHistoryId is exclusive, and the notification carries the new
 * mailbox historyId, so the lookup starts one step below it to include the
 * change that triggered the notification. If Gmail has already trimmed that
 * history range, fall back to the newest inbox message; the webhook
 * de-duplicates by message id.
 */
async function fetchLatestMessageForHistory(historyId) {
  if (historyId) {
    let startId = String(historyId);

    try {
      const previous = (BigInt(historyId) - 1n).toString();
      if (!previous.startsWith('-')) {
        startId = previous;
      }
    } catch {
      // Non-numeric history ids are passed through unchanged.
    }

    try {
      const ids = await listHistoryMessageIds(startId);
      const message = await fetchNewestMessage(ids);
      if (message) {
        return message;
      }
    } catch (error) {
      if (error.status !== 404) {
        throw error;
      }

      console.warn(
        `[GMAIL] History ${startId} is no longer available; falling back to the newest inbox message`
      );
    }
  }

  const latest = await gmailGet('/messages', {
    maxResults: 5,
    labelIds: 'INBOX',
  });

  return fetchNewestMessage((latest.messages || []).map((item) => item.id));
}

module.exports = { sendEmail, getAccessToken, fetchLatestMessageForHistory };
