import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { SESSION_COOKIE_NAME, SESSION_TTL_SECONDS } from '@/lib/auth/constants';
import { getAdminAuth } from '@/lib/firebase/admin';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function isSameOrigin(request: NextRequest): boolean {
  const origin = request.headers.get('origin');
  if (!origin) {
    return true;
  }

  try {
    return new URL(origin).host === request.headers.get('host');
  } catch {
    return false;
  }
}

/**
 * Exchanges a Firebase ID token for an HttpOnly session cookie.
 *
 * The client must have just signed in with the Firebase Client SDK. We verify
 * the ID token, require an allowed admin account, and only then create the
 * session cookie.
 */
export async function POST(request: NextRequest) {
  if (!isSameOrigin(request)) {
    return NextResponse.json({ error: 'Invalid origin.' }, { status: 403 });
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 });
  }

  const idToken =
    typeof payload === 'object' &&
    payload !== null &&
    'idToken' in payload &&
    typeof (payload as { idToken?: unknown }).idToken === 'string'
      ? (payload as { idToken: string }).idToken
      : '';

  if (!idToken) {
    return NextResponse.json({ error: 'Missing ID token.' }, { status: 400 });
  }

  try {
    const adminAuth = getAdminAuth();
    const decoded = await adminAuth.verifyIdToken(idToken, true);

    if (!decoded.email_verified) {
      return NextResponse.json(
        { error: 'Email address is not verified.' },
        { status: 403 },
      );
    }

    const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
    const hasAdminClaim = (decoded as { admin?: boolean }).admin === true;
    const matchesAdminEmail =
      Boolean(adminEmail) &&
      decoded.email?.toLowerCase() === adminEmail;

    if (!hasAdminClaim && !matchesAdminEmail) {
      return NextResponse.json(
        { error: 'This account is not authorized to access the dashboard.' },
        { status: 403 },
      );
    }

    const sessionCookie = await adminAuth.createSessionCookie(idToken, {
      expiresIn: SESSION_TTL_SECONDS * 1000,
    });

    const response = NextResponse.json({ ok: true });
    response.cookies.set(SESSION_COOKIE_NAME, sessionCookie, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: SESSION_TTL_SECONDS,
    });

    return response;
  } catch (error) {
    console.error(
      'Failed to create admin session:',
      error instanceof Error ? error.message : 'unknown error',
    );
    return NextResponse.json(
      { error: 'Unable to create a session. Please sign in again.' },
      { status: 401 },
    );
  }
}

/**
 * Clears the session cookie and revokes refresh tokens for the current admin.
 */
export async function DELETE(request: NextRequest) {
  if (!isSameOrigin(request)) {
    return NextResponse.json({ error: 'Invalid origin.' }, { status: 403 });
  }

  const sessionCookie = request.cookies.get(SESSION_COOKIE_NAME)?.value;

  if (sessionCookie) {
    try {
      const adminAuth = getAdminAuth();
      const decoded = await adminAuth.verifySessionCookie(sessionCookie, true);
      await adminAuth.revokeRefreshTokens(decoded.sub);
    } catch {
      // The cookie is already invalid or expired; clearing it is enough.
    }
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set(SESSION_COOKIE_NAME, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  });

  return response;
}
