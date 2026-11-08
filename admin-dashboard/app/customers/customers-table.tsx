'use client';

import type { CustomerDTO } from '@/lib/types';
import { formatDate } from '@/lib/format';
import { useApiList } from '@/lib/use-api-list';

function SkeletonRows() {
  return (
    <>
      {Array.from({ length: 5 }).map((_, rowIndex) => (
        <tr key={rowIndex} className="animate-pulse">
          {Array.from({ length: 5 }).map((__, cellIndex) => (
            <td key={cellIndex} className="px-5 py-4">
              <span className="block h-3 rounded-full bg-slate-800" />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}

export default function CustomersTable() {
  const { data, loading, error, reload } =
    useApiList<CustomerDTO>('/api/customers?limit=100');

  const count = data?.length ?? 0;

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/40 shadow-2xl shadow-black/20">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 px-5 py-4">
        <div>
          <h2 className="text-sm font-semibold text-slate-200">
            Customer directory
          </h2>
          <p className="mt-1 text-xs text-slate-500">
            {loading
              ? 'Loading records…'
              : `${count} record${count === 1 ? '' : 's'} · sorted by name`}
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
                Email
              </th>
              <th scope="col" className="px-5 py-3 font-semibold">
                Equipment
              </th>
              <th scope="col" className="px-5 py-3 font-semibold">
                Last Service
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/80">
            {loading && !data ? <SkeletonRows /> : null}

            {!loading && data && data.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-5 py-16 text-center">
                  <p className="text-sm font-semibold text-slate-300">
                    No customers yet
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    Customer records will appear here once they are added.
                  </p>
                </td>
              </tr>
            ) : null}

            {data?.map((customer) => (
              <tr key={customer.id} className="transition hover:bg-slate-800/30">
                <td className="px-5 py-4">
                  <div className="font-semibold text-slate-100">
                    {customer.name || 'Unnamed customer'}
                  </div>
                  {customer.address ? (
                    <div className="mt-0.5 max-w-72 truncate text-xs text-slate-500">
                      {customer.address}
                    </div>
                  ) : null}
                </td>

                <td className="whitespace-nowrap px-5 py-4 text-slate-300">
                  {customer.phone ? (
                    <a
                      href={`tel:${customer.phone}`}
                      className="transition hover:text-amber-300"
                    >
                      {customer.phone}
                    </a>
                  ) : (
                    '—'
                  )}
                </td>

                <td className="px-5 py-4 text-slate-300">
                  {customer.email ? (
                    <a
                      href={`mailto:${customer.email}`}
                      className="transition hover:text-amber-300"
                    >
                      {customer.email}
                    </a>
                  ) : (
                    '—'
                  )}
                </td>

                <td className="max-w-64 px-5 py-4 text-slate-300">
                  <span className="line-clamp-2">
                    {customer.equipment || '—'}
                  </span>
                </td>

                <td className="whitespace-nowrap px-5 py-4 text-slate-300">
                  {formatDate(customer.lastAppointment)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
