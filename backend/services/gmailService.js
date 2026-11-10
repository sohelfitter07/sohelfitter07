const TOKEN_URL = 'https://oauth2.googleapis.com/token';
const GMAIL_SEND_URL = 'https://gmail.googleapis.com/gmail/v1/users/me/messages/send';

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

module.exports = { sendEmail };
