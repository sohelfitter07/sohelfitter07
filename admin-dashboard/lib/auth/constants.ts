/**
 * Shared session constants.
 *
 * The cookie is checked for presence by middleware/proxy and verified
 * cryptographically on the server (dashboard page and API routes).
 */
export const SESSION_COOKIE_NAME = 'admin_session';

/** 8 hours. Firebase session cookies may be valid for up to 14 days. */
export const SESSION_TTL_SECONDS = 60 * 60 * 8;
export const SESSION_TTL_MS = SESSION_TTL_SECONDS * 1000;
