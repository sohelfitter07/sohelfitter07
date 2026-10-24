# Admin Dashboard

Standalone Next.js admin dashboard for Canadian Fitness Repair. This app is
intentionally separate from the public website and is protected by a Firebase
session cookie verified on the server.

## What exists in Phase 0

- Next.js App Router scaffold with TypeScript.
- Firebase Client SDK login at `/login`.
- `POST /api/auth/session` verifies a Firebase ID token, checks the admin
  allowlist, and sets an HttpOnly session cookie.
- `DELETE /api/auth/session` clears the cookie and revokes refresh tokens.
- `middleware.ts` redirects requests without a session cookie to `/login`.
- `/dashboard` verifies the cookie with the Firebase Admin SDK and renders the
  protected shell.
- The old `appointment-tracker.html`, JS, and CSS in the repository root are
  untouched.

## Requirements

- Node.js 20.9 or newer (Node 24 LTS is recommended).
- A Firebase project with Email/Password authentication enabled.
- A Firebase service account key for the Admin SDK.

## Setup

```bash
cd admin-dashboard
npm install
cp .env.local.example .env.local
```

Fill in `.env.local`, then:

```bash
npm run dev
```

Open <http://localhost:3000>. Unauthenticated requests are redirected to
`/login`.

Production check:

```bash
npm run typecheck
npm run build
npm run start
```

## Environment variables

### Public Firebase client settings

| Variable | Purpose |
| --- | --- |
| `NEXT_PUBLIC_FIREBASE_API_KEY` | Firebase web API key |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | Firebase Auth domain |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | Firebase project ID |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | Firebase web app ID |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | Optional |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | Optional |
| `NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID` | Optional |

These values are public by design. Do not put secrets in `NEXT_PUBLIC_*`
variables.

### Server-only Firebase Admin settings

| Variable | Purpose |
| --- | --- |
| `FIREBASE_PROJECT_ID` | Service account project ID |
| `FIREBASE_CLIENT_EMAIL` | Service account email |
| `FIREBASE_PRIVATE_KEY` | Service account private key; keep `\n` escapes |
| `ADMIN_EMAIL` | The single Firebase account allowed to create a session |

`FIREBASE_PRIVATE_KEY` must never be exposed to the browser or committed to
git. On Render, paste it with literal `\n` sequences; the app converts them to
real newlines.

`ADMIN_EMAIL` is a bootstrap allowlist. The session route also accepts a
Firebase custom claim `admin: true`, which is preferable once you have set it
with the Admin SDK.

## Firebase setup

1. Enable **Email/Password** under Authentication → Sign-in method.
2. Create the admin user under Authentication → Users.
3. Verify the admin email address (the session route requires
   `email_verified`).
4. Add `localhost` and `admin.canadianfitnessrepair.com` under Authentication →
   Settings → Authorized domains.
5. Generate a service account key under Project settings → Service accounts and
   copy the values into `.env.local`.
6. Set `ADMIN_EMAIL` to the admin user's email.

## How authentication works

1. The user signs in with the Firebase Client SDK at `/login`.
2. The client sends the ID token to `POST /api/auth/session`.
3. The server verifies the token with Firebase Admin, requires
   `email_verified`, and checks `ADMIN_EMAIL` or the `admin` custom claim.
4. The server creates a Firebase session cookie and sets it as `HttpOnly`,
   `Secure` in production, `SameSite=Lax`.
5. `middleware.ts` redirects requests without the cookie to `/login`.
6. `/dashboard` calls `getSession()` and cryptographically verifies the cookie
   with `verifySessionCookie(..., true)`.
7. Logout clears the cookie and revokes refresh tokens.

**Security boundary:** middleware only checks that a cookie exists. The
authoritative check is `getSession()` / `verifySessionCookie()` on the server.
Every future protected page and API route must perform that check.

## Next.js 16 note

Next.js 16 renamed the `middleware` file convention to `proxy`. This project
uses `middleware.ts` because that was requested for Phase 0; it still works.
Before upgrading to a future major version, migrate it with:

```bash
npx @next/codemod@canary middleware-to-proxy .
```

## Deployment on Render

- Create a **Web Service** pointing at the `admin-dashboard` directory.
- Build command: `npm install && npm run build`
- Start command: `npm run start`
- Add all environment variables above.
- Add the custom domain `admin.canadianfitnessrepair.com` and enable HTTPS.
- Add that domain to Firebase Auth → Authorized domains.

If you later prefer a standalone server build, add `output: 'standalone'` and
run the generated server with `node .next/standalone/server.js` (you must also
copy `.next/static` and `public` as described in the Next.js self-hosting docs).

## Security follow-ups (later phases)

- Lock Firestore rules and enable App Check before adding data features.
- Replace the `ADMIN_EMAIL` bootstrap allowlist with a custom claim.
- Add CSRF tokens for any future state-changing API routes beyond the session
  endpoint.
- Add a strict Content-Security-Policy once inline styles/scripts are removed.
- Add rate limiting on `/api/auth/session` and audit logging.
- Delete the old root dashboard files only after the rewrite is complete.
