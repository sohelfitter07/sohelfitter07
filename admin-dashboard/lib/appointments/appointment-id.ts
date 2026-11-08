const MAX_ID_LENGTH = 1500;

/**
 * Accepts only a single Firestore document id. Rejecting slashes prevents a
 * caller from addressing a different collection path through the same route.
 */
export function parseAppointmentId(value: unknown): string | null {
  if (typeof value !== 'string') {
    return null;
  }

  const id = value.trim();

  if (!id || id.length > MAX_ID_LENGTH || id.includes('/')) {
    return null;
  }

  return id;
}
