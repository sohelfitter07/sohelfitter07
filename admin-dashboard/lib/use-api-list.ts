'use client';

import { useCallback, useEffect, useState } from 'react';

export interface ApiListPayload<T> {
  data: T[];
  count: number;
}

function extractError(payload: unknown, status: number): string {
  if (
    typeof payload === 'object' &&
    payload !== null &&
    'error' in payload &&
    typeof (payload as { error?: unknown }).error === 'string'
  ) {
    return (payload as { error: string }).error;
  }

  return `Request failed with status ${status}.`;
}

/**
 * Loads a list endpoint that returns { data, count }.
 *
 * The API routes verify the admin session cookie, so the browser only needs
 * to send the request with the default same-origin credentials.
 */
export function useApiList<T>(url: string) {
  const [data, setData] = useState<T[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(url, {
        cache: 'no-store',
        headers: { Accept: 'application/json' },
      });

      const payload: unknown = await response.json();

      if (!response.ok) {
        throw new Error(extractError(payload, response.status));
      }

      if (
        typeof payload !== 'object' ||
        payload === null ||
        !Array.isArray((payload as { data?: unknown }).data)
      ) {
        throw new Error('Unexpected response from the server.');
      }

      setData((payload as ApiListPayload<T>).data);
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : 'Unable to load data.',
      );
    } finally {
      setLoading(false);
    }
  }, [url]);

  useEffect(() => {
    void load();
  }, [load]);

  return { data, loading, error, reload: load };
}
