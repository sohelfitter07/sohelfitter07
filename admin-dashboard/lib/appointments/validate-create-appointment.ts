import { APPOINTMENT_STATUSES, type AppointmentStatus } from '@/lib/types';
import { torontoWallTimeToUtc } from './timezone';

export interface CreateAppointmentValues {
  customer: string;
  phone: string;
  email: string;
  equipment: string;
  issue: string;
  status: AppointmentStatus;
  /** Pre-tax price in CAD. */
  basePrice: number;
  scheduledAt: Date;
}

export type CreateAppointmentValidation =
  | { ok: true; value: CreateAppointmentValues }
  | { ok: false; errors: Record<string, string> };

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE_CHARS_PATTERN = /^[0-9+()\-.\s]+$/;
const DATE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;
const TIME_PATTERN = /^([01]\d|2[0-3]):[0-5]\d$/;

function readString(record: Record<string, unknown>, key: string): string {
  const value = record[key];
  return typeof value === 'string' ? value.trim() : '';
}

function isValidCalendarDate(value: string): boolean {
  const match = DATE_PATTERN.exec(value);
  if (!match) {
    return false;
  }

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const parsed = new Date(Date.UTC(year, month - 1, day));

  return (
    parsed.getUTCFullYear() === year &&
    parsed.getUTCMonth() === month - 1 &&
    parsed.getUTCDate() === day
  );
}

/**
 * Validates and normalizes the POST body for creating an appointment.
 * The client sends a pre-tax price; tax is calculated by the route.
 */
export function validateCreateAppointment(
  body: unknown,
): CreateAppointmentValidation {
  if (typeof body !== 'object' || body === null || Array.isArray(body)) {
    return { ok: false, errors: { form: 'Invalid request body.' } };
  }

  const record = body as Record<string, unknown>;
  const errors: Record<string, string> = {};

  const customer = readString(record, 'customer');
  const phone = readString(record, 'phone');
  const email = readString(record, 'email');
  const date = readString(record, 'date');
  const time = readString(record, 'time');
  const equipment = readString(record, 'equipment');
  const issue = readString(record, 'issue');
  const rawStatus = readString(record, 'status') || 'Scheduled';

  if (!customer) {
    errors.customer = 'Customer name is required.';
  } else if (customer.length > 120) {
    errors.customer = 'Customer name must be 120 characters or fewer.';
  }

  if (phone) {
    const digits = phone.replace(/\D/g, '');
    if (
      !PHONE_CHARS_PATTERN.test(phone) ||
      digits.length < 10 ||
      digits.length > 15
    ) {
      errors.phone = 'Enter a valid phone number.';
    }
  }

  if (email && !EMAIL_PATTERN.test(email)) {
    errors.email = 'Enter a valid email address.';
  }

  if (!phone && !email) {
    errors.contact = 'Add a phone number or an email address.';
  }

  if (!isValidCalendarDate(date)) {
    errors.date = 'Choose a valid appointment date.';
  }

  if (!TIME_PATTERN.test(time)) {
    errors.time = 'Choose a valid appointment time.';
  }

  if (!equipment) {
    errors.equipment = 'Equipment is required.';
  } else if (equipment.length > 200) {
    errors.equipment = 'Equipment must be 200 characters or fewer.';
  }

  if (issue.length > 2000) {
    errors.issue = 'Notes must be 2000 characters or fewer.';
  }

  if (!APPOINTMENT_STATUSES.includes(rawStatus as AppointmentStatus)) {
    errors.status = 'Choose a valid status.';
  }

  const rawPrice = record.basePrice;
  let basePrice =
    typeof rawPrice === 'number'
      ? rawPrice
      : typeof rawPrice === 'string' && rawPrice.trim() !== ''
        ? Number(rawPrice)
        : Number.NaN;

  if (!Number.isFinite(basePrice) || basePrice < 0) {
    errors.basePrice = 'Enter a valid price of 0 or more.';
  } else if (basePrice > 100000) {
    errors.basePrice = 'Price must be $100,000 or less.';
  } else {
    basePrice = Math.round(basePrice * 100) / 100;
  }

  if (Object.keys(errors).length > 0) {
    return { ok: false, errors };
  }

  return {
    ok: true,
    value: {
      customer,
      phone,
      email,
      equipment,
      issue,
      status: rawStatus as AppointmentStatus,
      basePrice,
      scheduledAt: torontoWallTimeToUtc(date, time),
    },
  };
}
