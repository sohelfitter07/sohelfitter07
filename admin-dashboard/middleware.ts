import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { SESSION_COOKIE_NAME } from '@/lib/auth/constants';

/**
 * Fast gate: redirect requests without a session cookie to /login.
 *
 * IMPORTANT: this only checks that a cookie exists. It does not verify the
 * Firebase signature. Every protected page and API route must call
 * getSession() / verifySessionCookie() before trusting the request.
 *
 * Next.js 16 renamed the `middleware` convention to `proxy`; this file keeps
 * the requested `middleware.ts` name and still works. It can be migrated to
 * proxy.ts in a later phase.
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname === '/login' || pathname.startsWith('/api/auth/session')) {
    return NextResponse.next();
  }

  const sessionCookie = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  if (!sessionCookie) {
    if (pathname.startsWith('/api/')) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
    }

    const loginUrl = new URL('/login', request.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Run on everything except Next.js build assets and common public files.
     * /login and /api/auth/session are excluded inside the function.
     */
    '/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)',
  ],
};
