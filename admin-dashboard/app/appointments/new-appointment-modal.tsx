'use client';

import {
  useEffect,
  useState,
  type FormEvent,
  type ReactNode,
} from 'react';
import { APPOINTMENT_STATUSES, type AppointmentStatus } from '@/lib/types';
import { formatCurrency } from '@/lib/format';

interface NewAppointmentModalProps {
  onClose: () => void;
  onCreated: () => void;
}

interface FormState {
  customer: string;
  phone: string;
  email: string;
  date: string;
  time: string;
  equipment: string;
  issue: string;
  status: AppointmentStatus;
  basePrice: string;
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const HST_RATE = 0.13;

function todayInToronto(): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Toronto',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date());
}

function extractFieldErrors(payload: unknown): Record<string, string> {
  if (
    typeof payload === 'object' &&
    payload !== null &&
    'fields' in payload &&
    typeof (payload as { fields?: unknown }).fields === 'object' &&
    (payload as { fields?: unknown }).fields !== null
  ) {
    const result: Record<string, string> = {};

    for (const [key, value] of Object.entries(
      (payload as { fields: Record<string, unknown> }).fields,
    )) {
      if (typeof value === 'string') {
        result[key] = value;
      }
    }

    return result;
  }

  return {};
}

function extractErrorMessage(payload: unknown): string | null {
  if (
    typeof payload === 'object' &&
    payload !== null &&
    'error' in payload &&
    typeof (payload as { error?: unknown }).error === 'string'
  ) {
    return (payload as { error: string }).error;
  }

  return null;
}

function Field({
  id,
  label,
  error,
  className,
  children,
}: {
  id: string;
  label: string;
  error?: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={className}>
      <label
        htmlFor={id}
        className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.1em] text-slate-400"
      >
        {label}
      </label>
      {children}
      {error ? (
        <p id={`${id}-error`} className="mt-1.5 text-xs text-rose-300">
          {error}
        </p>
      ) : null}
    </div>
  );
}

const inputClass =
  'w-full rounded-xl border border-slate-700 bg-slate-950/60 px-3.5 py-2.5 text-sm text-slate-100 placeholder:text-slate-600 outline-none transition focus:border-amber-500/60 focus:ring-2 focus:ring-amber-500/20';

export default function NewAppointmentModal({
  onClose,
  onCreated,
}: NewAppointmentModalProps) {
  const [form, setForm] = useState<FormState>(() => ({
    customer: '',
    phone: '',
    email: '',
    date: todayInToronto(),
    time: '09:00',
    equipment: '',
    issue: '',
    status: 'Scheduled',
    basePrice: '',
  }));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape' && !submitting) {
        onClose();
      }
    }

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose, submitting]);

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((previous) => ({ ...previous, [key]: value }));
    setErrors((previous) => {
      if (!previous[key]) {
        return previous;
      }

      const next = { ...previous };
      delete next[key];
      return next;
    });
  }

  function validate(): Record<string, string> {
    const nextErrors: Record<string, string> = {};
    const phone = form.phone.trim();
    const email = form.email.trim();
    const basePrice = Number(form.basePrice);

    if (!form.customer.trim()) {
      nextErrors.customer = 'Customer name is required.';
    }

    if (!phone && !email) {
      nextErrors.contact = 'Add a phone number or an email address.';
    }

    if (phone) {
      const digits = phone.replace(/\D/g, '');
      if (!/^[0-9+()\-.\s]+$/.test(phone) || digits.length < 10 || digits.length > 15) {
        nextErrors.phone = 'Enter a valid phone number.';
      }
    }

    if (email && !EMAIL_PATTERN.test(email)) {
      nextErrors.email = 'Enter a valid email address.';
    }

    if (!form.date) {
      nextErrors.date = 'Choose an appointment date.';
    }

    if (!form.time) {
      nextErrors.time = 'Choose an appointment time.';
    }

    if (!form.equipment.trim()) {
      nextErrors.equipment = 'Equipment is required.';
    }

    if (form.basePrice.trim() === '' || !Number.isFinite(basePrice) || basePrice < 0) {
      nextErrors.basePrice = 'Enter a valid price of 0 or more.';
    }

    return nextErrors;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (submitting) {
      return;
    }

    const clientErrors = validate();

    if (Object.keys(clientErrors).length > 0) {
      setErrors(clientErrors);
      setFormError('Please correct the highlighted fields.');
      return;
    }

    setSubmitting(true);
    setErrors({});
    setFormError(null);

    try {
      const response = await fetch('/api/appointments/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          customer: form.customer.trim(),
          phone: form.phone.trim(),
          email: form.email.trim(),
          date: form.date,
          time: form.time,
          equipment: form.equipment.trim(),
          issue: form.issue.trim(),
          status: form.status,
          basePrice: Number(form.basePrice),
        }),
      });

      const payload: unknown = await response.json().catch(() => null);

      if (!response.ok) {
        setErrors(extractFieldErrors(payload));
        setFormError(
          extractErrorMessage(payload) ??
            `Unable to create the appointment (status ${response.status}).`,
        );
        return;
      }

      onCreated();
      onClose();
    } catch {
      setFormError('Network error. Check your connection and try again.');
    } finally {
      setSubmitting(false);
    }
  }

  const basePrice = Number(form.basePrice);
  const estimatedTotal =
    Number.isFinite(basePrice) && basePrice > 0
      ? basePrice * (1 + HST_RATE)
      : 0;

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 p-4 backdrop-blur-sm"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !submitting) {
          onClose();
        }
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="new-appointment-title"
        className="mx-auto my-4 w-full max-w-2xl rounded-2xl border border-slate-800 bg-slate-900 shadow-2xl shadow-black/50 sm:my-10"
      >
        <div className="flex items-start justify-between gap-4 border-b border-slate-800 px-5 py-4 sm:px-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-400">
              New booking
            </p>
            <h2
              id="new-appointment-title"
              className="mt-1 text-xl font-bold tracking-tight text-slate-50"
            >
              Create an appointment
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            aria-label="Close dialog"
            className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-800 hover:text-slate-100 disabled:opacity-50"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              aria-hidden="true"
              className="h-5 w-5"
            >
              <path
                d="M6 6l12 12M18 6 6 18"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} noValidate className="p-5 sm:p-6">
          {formError ? (
            <div
              role="alert"
              className="mb-5 rounded-xl border border-rose-500/20 bg-rose-500/5 px-4 py-3 text-sm text-rose-200"
            >
              {formError}
            </div>
          ) : null}

          <div className="grid gap-4 sm:grid-cols-2">
            <Field
              id="customer"
              label="Customer name"
              error={errors.customer}
              className="sm:col-span-2"
            >
              <input
                id="customer"
                name="customer"
                type="text"
                required
                autoFocus
                autoComplete="name"
                placeholder="Jordan Smith"
                value={form.customer}
                onChange={(event) => update('customer', event.target.value)}
                aria-invalid={Boolean(errors.customer)}
                aria-describedby={
                  errors.customer ? 'customer-error' : undefined
                }
                className={inputClass}
              />
            </Field>

            <Field id="phone" label="Phone" error={errors.phone}>
              <input
                id="phone"
                name="phone"
                type="tel"
                autoComplete="tel"
                placeholder="(905) 555-0123"
                value={form.phone}
                onChange={(event) => update('phone', event.target.value)}
                aria-invalid={Boolean(errors.phone)}
                aria-describedby={errors.phone ? 'phone-error' : undefined}
                className={inputClass}
              />
            </Field>

            <Field id="email" label="Email" error={errors.email}>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                placeholder="customer@example.com"
                value={form.email}
                onChange={(event) => update('email', event.target.value)}
                aria-invalid={Boolean(errors.email)}
                aria-describedby={errors.email ? 'email-error' : undefined}
                className={inputClass}
              />
            </Field>

            <Field id="date" label="Date" error={errors.date}>
              <input
                id="date"
                name="date"
                type="date"
                required
                value={form.date}
                onChange={(event) => update('date', event.target.value)}
                aria-invalid={Boolean(errors.date)}
                aria-describedby={errors.date ? 'date-error' : undefined}
                className={inputClass}
              />
            </Field>

            <Field id="time" label="Time" error={errors.time}>
              <input
                id="time"
                name="time"
                type="time"
                required
                value={form.time}
                onChange={(event) => update('time', event.target.value)}
                aria-invalid={Boolean(errors.time)}
                aria-describedby={errors.time ? 'time-error' : undefined}
                className={inputClass}
              />
            </Field>

            <Field
              id="equipment"
              label="Equipment"
              error={errors.equipment}
              className="sm:col-span-2"
            >
              <input
                id="equipment"
                name="equipment"
                type="text"
                required
                placeholder="Horizon T101 treadmill"
                value={form.equipment}
                onChange={(event) => update('equipment', event.target.value)}
                aria-invalid={Boolean(errors.equipment)}
                aria-describedby={
                  errors.equipment ? 'equipment-error' : undefined
                }
                className={inputClass}
              />
            </Field>

            <Field id="status" label="Status" error={errors.status}>
              <select
                id="status"
                name="status"
                value={form.status}
                onChange={(event) =>
                  update('status', event.target.value as AppointmentStatus)
                }
                aria-invalid={Boolean(errors.status)}
                aria-describedby={errors.status ? 'status-error' : undefined}
                className={inputClass}
              >
                {APPOINTMENT_STATUSES.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </Field>

            <Field id="basePrice" label="Price (CAD, before HST)" error={errors.basePrice}>
              <input
                id="basePrice"
                name="basePrice"
                type="number"
                inputMode="decimal"
                min="0"
                step="0.01"
                required
                placeholder="120.00"
                value={form.basePrice}
                onChange={(event) => update('basePrice', event.target.value)}
                aria-invalid={Boolean(errors.basePrice)}
                aria-describedby={
                  errors.basePrice ? 'basePrice-error' : undefined
                }
                className={inputClass}
              />
              <p className="mt-1.5 text-xs text-slate-500">
                Customer total with 13% HST:{' '}
                {basePrice > 0 ? formatCurrency(estimatedTotal) : '—'}
              </p>
            </Field>

            <Field
              id="issue"
              label="Issue / notes"
              error={errors.issue}
              className="sm:col-span-2"
            >
              <textarea
                id="issue"
                name="issue"
                rows={3}
                placeholder="Belt slipping at higher speeds; customer reports a burning smell."
                value={form.issue}
                onChange={(event) => update('issue', event.target.value)}
                aria-invalid={Boolean(errors.issue)}
                aria-describedby={errors.issue ? 'issue-error' : undefined}
                className={`${inputClass} resize-y`}
              />
            </Field>
          </div>

          {errors.contact ? (
            <p role="alert" className="mt-4 text-sm text-rose-300">
              {errors.contact}
            </p>
          ) : null}

          <div className="mt-6 flex flex-col-reverse gap-3 border-t border-slate-800 pt-5 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="rounded-xl border border-slate-700 px-4 py-2.5 text-sm font-semibold text-slate-300 transition hover:bg-slate-800 hover:text-slate-100 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="rounded-xl bg-amber-500 px-4 py-2.5 text-sm font-bold text-slate-950 shadow-lg shadow-amber-500/20 transition hover:bg-amber-400 disabled:opacity-60"
            >
              {submitting ? 'Creating…' : 'Create Appointment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
