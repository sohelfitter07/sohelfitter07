import type { DecodedIdToken } from 'firebase-admin/auth';
import { getSession } from '@/lib/auth/session';

/**
 * Applies the same admin check used when the session cookie was created:
 * either the `admin: true` custom claim or the ADMIN_EMAIL allowlist.
 */
export function isAuthorizedAdmin(session: DecodedIdToken): boolean {
  const hasAdminClaim =
    (session as DecodedIdToken & { admin?: boolean }).admin === true;

  const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const matchesAdminEmail =
    Boolean(adminEmail) && session.email?.toLowerCase() === adminEmail;

  return hasAdminClaim || matchesAdminEmail;
}

/**
 * Server-side guard for API routes.
 *
 * Returns the verified session only when the cookie is valid AND the account
 * is still authorized. Callers must return 401 when this resolves to null.
 */
export async function requireAdminSession(): Promise<DecodedIdToken | null> {
  const session = await getSession();

  if (!session || !isAuthorizedAdmin(session)) {
    return null;
  }

  return session;
}
