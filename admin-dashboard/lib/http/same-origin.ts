/**
 * Lightweight CSRF guard for state-changing requests.
 *
 * Browsers send an Origin header on cross-origin POSTs. We accept requests
 * with no Origin (same-origin form posts, server-to-server calls) and require
 * the Origin host to match the Host header when it is present.
 */
export function isSameOrigin(request: Request): boolean {
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
