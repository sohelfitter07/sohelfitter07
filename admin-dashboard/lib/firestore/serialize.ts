import type { DocumentData, Timestamp } from 'firebase-admin/firestore';
import type { AppointmentDTO, CustomerDTO, LogDTO } from '@/lib/types';

/**
 * Converts a Firestore Timestamp (or legacy ISO string) into an ISO string.
 * Invalid or unsupported values become null rather than crashing the route.
 */
export function serializeDateValue(value: unknown): string | null {
  if (value == null) {
    return null;
  }

  if (typeof value === 'string') {
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? value : parsed.toISOString();
  }

  if (
    typeof value === 'object' &&
    typeof (value as Timestamp).toDate === 'function'
  ) {
    try {
      return (value as Timestamp).toDate().toISOString();
    } catch {
      return null;
    }
  }

  return null;
}

export function serializeAppointment(
  id: string,
  data: DocumentData,
): AppointmentDTO {
  const record = data as Record<string, unknown>;

  return {
    ...record,
    id,
    date: serializeDateValue(record.date),
    createdAt: serializeDateValue(record.createdAt),
    confirmationSentAt: serializeDateValue(record.confirmationSentAt),
  } as unknown as AppointmentDTO;
}

export function serializeCustomer(id: string, data: DocumentData): CustomerDTO {
  const record = data as Record<string, unknown>;

  return {
    ...record,
    id,
    lastAppointment: serializeDateValue(record.lastAppointment),
    createdAt: serializeDateValue(record.createdAt),
  } as unknown as CustomerDTO;
}

export function serializeLog(id: string, data: DocumentData): LogDTO {
  const record = data as Record<string, unknown>;

  return {
    ...record,
    id,
    timestamp: serializeDateValue(record.timestamp),
  } as unknown as LogDTO;
}
