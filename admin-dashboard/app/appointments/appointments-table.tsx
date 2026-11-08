'use client';

import type { AppointmentDTO } from '@/lib/types';
import { formatCurrency, formatDateTime } from '@/lib/format';

const STATUS_STYLES: Record<string, string> = {
  Scheduled: 'bg-sky-500/10 text-sky-300 ring-sky-500/30',
  Confirmed: 'bg-sky-500/10 text-sky-300 ring-sky-500/30',
  'In Progress': 'bg-amber-500/10 text-amber-300 ring-amber-500/30',
  'Awaiting Parts': 'bg-orange-500/10 text-orange-300 ring-orange-500/30',
  'Parts Arrived': 'bg-violet-500/10 text-violet-300 ring-violet-500/30',
  'Scheduled for Parts Installation':
    'bg-indigo-500/10 text-indigo-300 ring-indigo-500/30',
  Repaired: 'bg-emerald-500/10 text-emerald-300 ring-emerald-500/30',
  Completed: 'bg-emerald-500/10 text-emerald-300 ring-emerald-500/30',
  Cancelled: 'bg-rose-500/10 text-rose-300 ring-rose-500/30',
  Unknown: 'bg-slate-500/10 text-slate-300 ring-slate-500/30',
};

function StatusBadge({ status }: { status?: string }) {
  const label = status?.trim() || 'Unknown';
  const style = STATUS_STYLES[label] ?? STATUS_STYLES.Unknown;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1 ring-inset ${style}`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden="true" />
      {label}
    </span>
  );
}

function SkeletonRows() {
  return (
    <>
      {Array.from({ length: 5 }).map((_, rowIndex) => (
        <tr key={rowIndex} className="animate-pulse">
          {Array.from({ length: 7 }).map((__, cellIndex) => (
            <td key={cellIndex} className="px-5 py-4">
              <span className="block h-3 rounded-full bg-slate-800" />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}

interface AppointmentsTableProps {
  appointments: AppointmentDTO[] | null;
  loading: boolean;
  error: string | null;
  deletingId: string | null;
  onRefresh: () => void;
  onEdit: (appointment: AppointmentDTO) => void;
  onDelete: (appointment: AppointmentDTO) => void;
}

export default function AppointmentsTable({
  appointments,
  loading,
  error,
  deletingId,
  onRefresh,
  onEdit,
  onDelete,
}: AppointmentsTableProps) {
  const count = appointments?.length ?? 0;

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/40 shadow-2xl shadow-black/20">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 px-5 py-4">
        <div>
          <h2 className="text-sm font-semibold text-slate-200">
            Recent appointments
          </h2>
          <p className="mt-1 text-xs text-slate-500">
            {loading && !appointments
              ? 'Loading records…'
              : `${count} record${count === 1 ? '' : 's'} · newest first`}
          </p>
        </div>

        <button
          type="button"
          onClick={onRefresh}
          disabled={loading}
          className="rounded-lg border border-slate-700 bg-slate-800/60 px-3 py-1.5 text-xs font-semibold text-slate-200 transition hover:border-amber-500/40 hover:text-amber-300 disabled:opacity-60"
        >
          {loading ? 'Refreshing…' : 'Refresh'}
        </button>
      </div>

      {error ? (
        <div
          role="alert"
          className="flex flex-wrap items-center justify-between gap-3 border-b border-rose-500/20 bg-rose-500/5 px-5 py-3 text-sm text-rose-200"
        >
          <span>{error}</span>
          <button
            type="button"
            onClick={onRefresh}
            className="rounded-lg border border-rose-400/30 px-3 py-1.5 text-xs font-semibold text-rose-200 transition hover:bg-rose-500/10"
          >
            Try again
          </button>
        </div>
      ) : null}

      <div className="overflow-x-auto">
        <table className="min-w-[760px] text-left text-sm">
          <thead>
            <tr className="border-b border-slate-800 text-[11px] uppercase tracking-[0.14em] text-slate-500">
              <th scope="col" className="px-5 py-3 font-semibold">
                Customer
              </th>
              <th scope="col" className="px-5 py-3 font-semibold">
                Phone
              </th>
              <th scope="col" className="px-5 py-3 font-semibold">
                Date / Time
              </th>
              <th scope="col" className="px-5 py-3 font-semibold">
                Equipment
              </th>
              <th scope="col" className="px-5 py-3 font-semibold">
                Status
              </th>
              <th scope="col" className="px-5 py-3 text-right font-semibold">
                Price
              </th>
              <th scope="col" className="px-5 py-3 text-right font-semibold">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/80">
            {loading && !appointments ? <SkeletonRows /> : null}

            {!loading && appointments && appointments.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-5 py-16 text-center">
                  <p className="text-sm font-semibold text-slate-300">
                    No appointments yet
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    Use “New Appointment” to add the first booking.
                  </p>
                </td>
              </tr>
            ) : null}

            {appointments?.map((appointment) => (
              <tr
                key={appointment.id}
                className="transition hover:bg-slate-800/30"
              >
                <td className="px-5 py-4">
                  <div className="font-semibold text-slate-100">
                    {appointment.customer || 'Unnamed customer'}
                  </div>
                  {appointment.email ? (
                    <div className="mt-0.5 text-xs text-slate-500">
                      {appointment.email}
                    </div>
                  ) : null}
                </td>

                <td className="whitespace-nowrap px-5 py-4 text-slate-300">
                  {appointment.phone ? (
                    <a
                      href={`tel:${appointment.phone}`}
                      className="transition hover:text-amber-300"
                    >
                      {appointment.phone}
                    </a>
                  ) : (
                    '—'
                  )}
                </td>

                <td className="whitespace-nowrap px-5 py-4 text-slate-300">
                  {formatDateTime(appointment.date)}
                </td>

                <td className="max-w-64 px-5 py-4 text-slate-300">
                  <span className="line-clamp-2">
                    {appointment.equipment || '—'}
                  </span>
                </td>

                <td className="whitespace-nowrap px-5 py-4">
                  <StatusBadge status={appointment.status} />
                </td>

                <td className="whitespace-nowrap px-5 py-4 text-right font-medium tabular-nums text-slate-100">
                  {formatCurrency(appointment.price ?? appointment.basePrice)}
                </td>

                <td className="whitespace-nowrap px-5 py-4 text-right">
                  <div className="inline-flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => onEdit(appointment)}
                      aria-label={`Edit appointment for ${
                        appointment.customer || 'this customer'
                      }`}
                      title="Edit"
                      className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800/60 px-2 py-1.5 text-xs font-semibold text-slate-200 transition hover:border-amber-500/40 hover:text-amber-300 md:px-3"
                    >
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        aria-hidden="true"
                        className="h-4 w-4"
                      >
                        <path
                          d="M4 20h4L18 10a2.5 2.5 0 0 0-4-4L4 16v4Z"
                          stroke="currentColor"
                          strokeWidth="1.7"
                          strokeLinejoin="round"
                        />
                        <path
                          d="m13.5 6.5 4 4"
                          stroke="currentColor"
                          strokeWidth="1.7"
                          strokeLinecap="round"
                        />
                      </svg>
                      <span className="hidden md:inline">Edit</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => onDelete(appointment)}
                      disabled={deletingId === appointment.id}
                      aria-label={`Delete appointment for ${
                        appointment.customer || 'this customer'
                      }`}
                      title="Delete"
                      className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800/60 px-2 py-1.5 text-xs font-semibold text-slate-200 transition hover:border-rose-500/40 hover:text-rose-300 disabled:opacity-50 md:px-3"
                    >
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        aria-hidden="true"
                        className="h-4 w-4"
                      >
                        <path
                          d="M4 7h16M9 7V5h6v2M6.5 7l1 12h9l1-12"
                          stroke="currentColor"
                          strokeWidth="1.7"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M10 11v4M14 11v4"
                          stroke="currentColor"
                          strokeWidth="1.7"
                          strokeLinecap="round"
                        />
                      </svg>
                      <span className="hidden md:inline">
                        {deletingId === appointment.id ? 'Deleting…' : 'Delete'}
                      </span>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
