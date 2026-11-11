#!/usr/bin/env node
/**
 * One-time Gmail OAuth setup.
 *
 * Usage (from anywhere):
 *   node backend/scripts/gmail-auth.js "C:\path\to\client_secret.json" [--port=8080]
 *
 * Requires GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET in .env, or a credentials
 * file downloaded from Google Cloud Console ("installed" or "web" client).
 * Saves GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET and GOOGLE_REFRESH_TOKEN to the
 * repo-root .env.
 */

const crypto = require('crypto');
const fs = require('fs');
const http = require('http');
const path = require('path');

const envPath = path.join(__dirname, '..', '..', '.env');
require('dotenv').config({ path: envPath });

const AUTH_URL = 'https://accounts.google.com/o/oauth2/v2/auth';
const TOKEN_URL = 'https://oauth2.googleapis.com/token';
const SCOPES = [
  'https://www.googleapis.com/auth/gmail.send',
  'https://www.googleapis.com/auth/gmail.readonly',
];

const args = process.argv.slice(2);
const credentialsPath = args.find((arg) => !arg.startsWith('--'));
const portFlag = args.find((arg) => arg.startsWith('--port='));
const port = portFlag ? Number(portFlag.split('=')[1]) : 8080;

function fail(message) {
  console.error(`\n${message}\n`);
  process.exit(1);
}

function loadClient() {
  if (credentialsPath) {
    let json;
    try {
      json = JSON.parse(fs.readFileSync(path.resolve(credentialsPath), 'utf8'));
    } catch (error) {
      fail(`Could not read credentials file: ${error.message}`);
    }

    const client = json.installed || json.web;
    if (!client?.client_id || !client?.client_secret) {
      fail('No "installed" or "web" OAuth client found in the credentials file.');
    }
    return { clientId: client.client_id, clientSecret: client.client_secret };
  }

  if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    return {
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    };
  }

  fail('Usage: node backend/scripts/gmail-auth.js <client_secret.json> [--port=8080]');
}

function upsertEnvLine(env, key, value) {
  const line = `${key}=${value}`;
  const pattern = new RegExp(`^${key}=.*$`, 'm');

  if (pattern.test(env)) {
    return env.replace(pattern, line);
  }

  if (env && !env.endsWith('\n')) {
    env += '\n';
  }

  return `${env}${line}\n`;
}

function saveCredentials({ clientId, clientSecret, refreshToken }) {
  let env = fs.existsSync(envPath) ? fs.readFileSync(envPath, 'utf8') : '';

  env = upsertEnvLine(env, 'GOOGLE_CLIENT_ID', clientId);
  env = upsertEnvLine(env, 'GOOGLE_CLIENT_SECRET', clientSecret);
  env = upsertEnvLine(env, 'GOOGLE_REFRESH_TOKEN', refreshToken);

  fs.writeFileSync(envPath, env, { mode: 0o600 });
}

const { clientId, clientSecret } = loadClient();
const redirectUri = `http://localhost:${port}`;
const state = crypto.randomBytes(16).toString('hex');

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, redirectUri);
  if (url.pathname !== '/') {
    res.writeHead(404, { 'Content-Type': 'text/plain' }).end('Not found');
    return;
  }

  const oauthError = url.searchParams.get('error');
  if (oauthError) {
    res.writeHead(400, { 'Content-Type': 'text/plain' }).end(`Authorization failed: ${oauthError}`);
    console.error(`\nAuthorization failed: ${oauthError}`);
    server.close();
    return;
  }

  if (url.searchParams.get('state') !== state) {
    res.writeHead(400, { 'Content-Type': 'text/plain' }).end('Invalid state parameter.');
    console.error('\nInvalid state parameter; ignoring callback.');
    return;
  }

  const code = url.searchParams.get('code');
  if (!code) {
    res.writeHead(400, { 'Content-Type': 'text/plain' }).end('Missing authorization code.');
    return;
  }

  try {
    const response = await fetch(TOKEN_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      }).toString(),
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok || !data.refresh_token) {
      const reason =
        data.error_description ||
        data.error ||
        'No refresh token returned. Revoke the app at https://myaccount.google.com/permissions and run again.';
      throw new Error(reason);
    }

    saveCredentials({
      clientId,
      clientSecret,
      refreshToken: data.refresh_token,
    });

    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('Gmail authorized. Refresh token saved to .env — you can close this tab.');

    console.log('\nAuthorized. GOOGLE_REFRESH_TOKEN saved to .env.');
    console.log(
      `Sender the backend will use: ${process.env.GMAIL_SENDER || process.env.EMAIL_USER || '(set GMAIL_SENDER or EMAIL_USER)'}`
    );
    setTimeout(() => server.close(), 250);
  } catch (error) {
    res.writeHead(500, { 'Content-Type': 'text/plain' }).end(`Token exchange failed: ${error.message}`);
    console.error(`\nToken exchange failed: ${error.message}`);
    server.close();
  }
});

server.on('error', (error) => {
  fail(`Could not start local callback server on port ${port}: ${error.message}`);
});

server.listen(port, '127.0.0.1', () => {
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: SCOPES.join(' '),
    access_type: 'offline',
    prompt: 'consent',
    state,
  });

  console.log(`\nListening for the OAuth callback on ${redirectUri}`);
  console.log(
    'Open this URL, sign in as the sending Gmail account, and approve both "Send email" and "Read email":\n'
  );
  console.log(`${AUTH_URL}?${params.toString()}\n`);
  console.log('If Google reports redirect_uri_mismatch, add this exact URI under');
  console.log('Google Cloud Console > APIs & Services > Credentials > your OAuth client > Authorized redirect URIs.\n');
});

setTimeout(() => {
  console.error('\nTimed out waiting for authorization (5 minutes).');
  server.close();
  process.exit(1);
}, 5 * 60 * 1000).unref();
