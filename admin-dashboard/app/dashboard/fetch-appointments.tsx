'use client';

import { useState } from 'react';

/**
 * Phase 1 connection test.
 *
 * Calls the server-guarded appointments API and shows the raw JSON response so
 * the secure Firebase Admin connection can be verified from the dashboard.
 */
export default function FetchAppointments() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<string | null>(null);

  async function handleFetch() {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/appointments', {
        cache: 'no-store',
        headers: { Accept: 'application/json' },
      });

      const payload: unknown = await response.json();

      if (!response.ok) {
        const message =
          typeof payload === 'object' &&
          payload !== null &&
          'error' in payload &&
          typeof (payload as { error?: unknown }).error === 'string'
            ? (payload as { error: string }).error
            : `Request failed with status ${response.status}.`;
        throw new Error(message);
      }

      setResult(JSON.stringify(payload, null, 2));
    } catch (fetchError) {
      setResult(null);
      setError(
        fetchError instanceof Error
          ? fetchError.message
          : 'Unable to fetch appointments.',
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="card" aria-labelledby="connection-test-title">
      <h2 id="connection-test-title">Phase 1 connection test</h2>
      <p className="muted">
        Calls <code>/api/appointments</code>. The route verifies the admin
        session cookie, then reads Firestore with the Firebase Admin SDK.
      </p>

      <div className="button-row">
        <button type="button" onClick={handleFetch} disabled={loading}>
          {loading ? 'Fetching…' : 'Fetch Appointments'}
        </button>
      </div>

      {error ? (
        <p className="form-error" role="alert">
          {error}
        </p>
      ) : null}

      {result ? (
        <pre className="json-panel" aria-live="polite">
          {result}
        </pre>
      ) : null}
    </section>
  );
}
