const TIME_ZONE = 'America/Toronto';

function parseDate(value?: string | null): Date | null {
  if (!value) {
    return null;
  }

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function formatDateTime(value?: string | null): string {
  const date = parseDate(value);
  if (!date) {
    return value || '—';
  }

  return new Intl.DateTimeFormat('en-CA', {
    timeZone: TIME_ZONE,
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date);
}

export function formatDate(value?: string | null): string {
  const date = parseDate(value);
  if (!date) {
    return value || '—';
  }

  return new Intl.DateTimeFormat('en-CA', {
    timeZone: TIME_ZONE,
    dateStyle: 'medium',
  }).format(date);
}

export function formatCurrency(value?: number | null): string {
  if (typeof value !== 'number' || Number.isNaN(value)) {
    return '—';
  }

  return new Intl.NumberFormat('en-CA', {
    style: 'currency',
    currency: 'CAD',
  }).format(value);
}
