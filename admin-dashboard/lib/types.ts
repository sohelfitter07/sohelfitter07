import type { Timestamp } from 'firebase-admin/firestore';

/**
 * Firestore date fields normally hold a native Timestamp. Some legacy
 * customer records also store ISO date strings.
 */
export type DateValue = Timestamp | string | null;

export type AppointmentStatus =
  | 'Scheduled'
  | 'Confirmed'
  | 'In Progress'
  | 'Awaiting Parts'
  | 'Parts Arrived'
  | 'Scheduled for Parts Installation'
  | 'Repaired'
  | 'Completed'
  | 'Cancelled';

/** A document in the `customers` collection. */
export interface Customer {
  id: string;
  name: string;
  phone: string;
  email: string;
  address?: string;
  houseAddress?: string;
  notes?: string;
  equipment?: string;
  lastAppointment?: DateValue;
  createdAt?: DateValue;
}

/** A document in the `appointments` collection. */
export interface Appointment {
  id: string;
  customer: string;
  phone?: string;
  email?: string;
  carrier?: string;
  equipment?: string;
  houseAddress?: string;
  distanceFromShopKm?: number;
  date: DateValue;
  basePrice?: number;
  /** Total charged, including tax. */
  price?: number;
  taxRate?: number;
  issue?: string;
  status: AppointmentStatus | string;
  repair_notes?: string;
  createdAt?: DateValue;
  /** Firebase UID of the admin who created the record. */
  createdBy?: string;
  confirmationSent?: boolean;
  confirmationSentAt?: DateValue;
  lastStatusSent?: string;
  lastAttemptStatus?: string;
  reminderEnabled?: boolean;
  needsResend?: boolean;
  editedEmailBody?: string;
  editedSmsBody?: string;
}

/** A document in the `logs` collection. */
export interface Log {
  id: string;
  type?: string;
  appointmentId?: string;
  recipient?: string;
  subject?: string;
  emailSent?: boolean;
  smsSent?: boolean;
  status?: string;
  smsError?: string;
  error?: string;
  message?: string;
  timestamp?: DateValue;
}

/**
 * API representations. Timestamps are serialized to ISO strings before
 * leaving the server so the JSON is stable and easy to consume.
 */
export type AppointmentDTO = Omit<
  Appointment,
  'date' | 'createdAt' | 'confirmationSentAt'
> & {
  date: string | null;
  createdAt: string | null;
  confirmationSentAt: string | null;
};

export type CustomerDTO = Omit<Customer, 'lastAppointment' | 'createdAt'> & {
  lastAppointment: string | null;
  createdAt: string | null;
};

export type LogDTO = Omit<Log, 'timestamp'> & {
  timestamp: string | null;
};

export interface ApiListResponse<T> {
  data: T[];
  count: number;
}
