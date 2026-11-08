'use client';

import { useCallback, useEffect, useState } from 'react';
import type { AppointmentDTO } from '@/lib/types';
import { useApiList } from '@/lib/use-api-list';
import AppointmentsTable from './appointments-table';
import NewAppointmentModal from './new-appointment-modal';

export default function AppointmentsWorkspace() {
  const { data, loading, error, reload } = useApiList<AppointmentDTO>(
    '/api/appointments?limit=100',
  );
  const [modalOpen, setModalOpen] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  const closeModal = useCallback(() => setModalOpen(false), []);

  const handleCreated = useCallback(() => {
    setNotice('Appointment created successfully.');
    void reload();
  }, [reload]);

  useEffect(() => {
    if (!notice) {
      return;
    }

    const timer = window.setTimeout(() => setNotice(null), 6000);
    return () => window.clearTimeout(timer);
  }, [notice]);

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <header className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-400">
            Scheduler
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-50 sm:text-4xl">
            Appointments
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-400">
            Create and review bookings. New appointments are saved through the
            session-protected API and appear in the table immediately.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setModalOpen(true)}
          className="inline-flex items-center gap-2 rounded-xl bg-amber-500 px-4 py-2.5 text-sm font-bold text-slate-950 shadow-lg shadow-amber-500/20 transition hover:bg-amber-400"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden="true"
            className="h-4 w-4"
          >
            <path
              d="M12 5v14M5 12h14"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
          New Appointment
        </button>
      </header>

      {notice ? (
        <div
          role="status"
          className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-emerald-500/25 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200"
        >
          <span>{notice}</span>
          <button
            type="button"
            onClick={() => setNotice(null)}
            aria-label="Dismiss notification"
            className="rounded-md px-2 py-0.5 text-emerald-200/70 transition hover:bg-emerald-500/10 hover:text-emerald-100"
          >
            Dismiss
          </button>
        </div>
      ) : null}

      <AppointmentsTable
        appointments={data}
        loading={loading}
        error={error}
        onRefresh={() => void reload()}
      />

      {modalOpen ? (
        <NewAppointmentModal onClose={closeModal} onCreated={handleCreated} />
      ) : null}
    </main>
  );
}
