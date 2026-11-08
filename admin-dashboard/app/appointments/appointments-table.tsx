'use client';

import type { AppointmentDTO } from '@/lib/types';
import { formatCurrency, formatDateTime } from '@/lib/format';
import { useApiList } from '@/lib/use-api-list';

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
          {Array.from({ length: 6 }).map((__, cellIndex) => (
            <td key={cellIndex} className="px-5 py-4">
              <span className="block h-3 rounded-full bg-slate-800" />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}

export default function AppointmentsTable() {
  const { data, loading, error, reload } =
    useApiList<AppointmentDTO>('/api/appointments?limit=100');

  const count = data?.length ?? 0;

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/40 shadow-2xl shadow-black/20">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 px-5 py-4">
        <div>
          <h2 className="text-sm font-semibold text-slate-200">
            Recent appointments
          </h2>
          <p className="mt-1 text-xs text-slate-500">
            {loading
              ? 'Loading records…'
              : `${count} record${count === 1 ? '' : 's'} · newest first`}
          </p>
        </div>

        <button
          type="button"
          onClick={() => void reload()}
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
            onClick={() => void reload()}
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
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/80">
            {loading && !data ? <SkeletonRows /> : null}

            {!loading && data && data.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-5 py-16 text-center">
                  <p className="text-sm font-semibold text-slate-300">
                    No appointments yet
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    Bookings will appear here as soon as they are created.
                  </p>
                </td>
              </tr>
            ) : null}

            {data?.map((appointment) => (
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
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
