import { cookies } from 'next/headers';
import { SESSION_COOKIE_NAME } from '@/lib/auth/constants';
import { getAdminAuth } from '@/lib/firebase/admin';

/**
 * Reads and cryptographically verifies the Firebase session cookie.
 *
 * This is the authoritative auth check for server-rendered pages and API
 * routes. Middleware only checks that the cookie exists; it does not trust it.
 */
export async function getSession() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (!sessionCookie) {
    return null;
  }

  try {
    return await getAdminAuth().verifySessionCookie(sessionCookie, true);
  } catch {
    return null;
  }
}
